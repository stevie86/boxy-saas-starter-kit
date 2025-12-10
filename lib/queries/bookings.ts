import { prisma } from '../db'
import { Booking, BookingBed, Room, Guest } from '@prisma/client'
import { isValidDateRange, dateRangesOverlap, getCurrentDate, compareDates } from '../utils/dates'

export interface CreateBookingInput {
  guestId?: string
  guestName?: string
  guestEmail?: string
  roomId: string
  checkIn: Date
  checkOut: Date
  status?: string
  notes?: string
  propertyId: string
  bedsRequested?: number
}

export interface BookingWithDetails extends Booking {
  guest: Guest | null
  beds: (BookingBed & { room: Room })[]
  property: {
    id: string
    name: string
  }
}

export interface BookingFilters {
  status?: string
  roomId?: string
  guestId?: string
  checkInFrom?: Date
  checkInTo?: Date
  checkOutFrom?: Date
  checkOutTo?: Date
}

/**
 * Date overlap detection - adapted from reference project
 */
function isDateOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 < end2 && start2 < end1
}

/**
 * Get all bookings for a property with related data
 */
export async function getBookings(
  propertyId: string,
  filters?: BookingFilters
): Promise<BookingWithDetails[]> {
  // Build where clause
  const where: any = {
    propertyId,
    ...(filters?.status && { status: filters.status }),
    ...(filters?.guestId && { guestId: filters.guestId }),
    ...(filters?.checkInFrom && { checkIn: { gte: filters.checkInFrom } }),
    ...(filters?.checkInTo && { checkIn: { lte: filters.checkInTo } }),
    ...(filters?.checkOutFrom && { checkOut: { gte: filters.checkOutFrom } }),
    ...(filters?.checkOutTo && { checkOut: { lte: filters.checkOutTo } }),
  }

  // Add room filter through beds relationship
  if (filters?.roomId) {
    where.beds = {
      some: {
        roomId: filters.roomId
      }
    }
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      guest: true,
      beds: {
        include: {
          room: true
        }
      },
      property: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      checkIn: 'asc'
    }
  })

  return bookings as BookingWithDetails[]
}

/**
 * Get a single booking by ID with related data
 */
export async function getBookingById(id: string): Promise<BookingWithDetails | null> {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      guest: true,
      beds: {
        include: {
          room: true
        }
      },
      property: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  return booking as BookingWithDetails | null
}

/**
 * Check for booking conflicts - adapted from reference project logic
 */
export async function checkBookingConflicts(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string
): Promise<boolean> {
  // Get existing bookings for this room that aren't cancelled
  const existingBookings = await prisma.booking.findMany({
    where: {
      beds: {
        some: {
          roomId: roomId
        }
      },
      status: {
        notIn: ['cancelled', 'no_show']
      },
      ...(excludeBookingId && { id: { not: excludeBookingId } })
    },
    select: {
      id: true,
      checkIn: true,
      checkOut: true
    }
  })

  // Check for date overlaps
  return existingBookings.some(booking =>
    isDateOverlap(booking.checkIn, booking.checkOut, checkIn, checkOut)
  )
}

/**
 * Create a new booking with conflict checking
 */
export async function createBooking(data: CreateBookingInput): Promise<BookingWithDetails> {
  // Validate input
  if (!isValidDateRange(data.checkIn, data.checkOut)) {
    throw new Error('Check-out date must be after check-in date')
  }

  if (!data.guestId && (!data.guestName || !data.guestEmail)) {
    throw new Error('Either guest ID or guest name and email are required')
  }

  // Check room availability
  const room = await prisma.room.findUnique({
    where: { id: data.roomId }
  })

  if (!room) {
    throw new Error('Room not found')
  }

  const bedsRequested = data.bedsRequested || 1

  // Check if room has enough capacity
  if (bedsRequested > room.beds) {
    throw new Error(`Room only has ${room.beds} beds, but ${bedsRequested} requested`)
  }

  // Check for conflicts
  const hasConflicts = await checkBookingConflicts(
    data.roomId,
    data.checkIn,
    data.checkOut
  )

  if (hasConflicts) {
    throw new Error('Booking conflicts with existing reservation')
  }

  // Check current occupation + new booking doesn't exceed capacity
  const currentOccupation = await prisma.bookingBed.count({
    where: {
      roomId: data.roomId,
      booking: {
        checkIn: { lte: data.checkIn },
        checkOut: { gt: data.checkIn },
        status: {
          in: ['confirmed', 'checked_in', 'pending']
        }
      }
    }
  })

  if (currentOccupation + bedsRequested > room.beds) {
    throw new Error('Not enough available beds for the requested dates')
  }

  // Create or find guest
  let guestId = data.guestId
  if (!guestId && data.guestName && data.guestEmail) {
    // Try to find existing guest first
    const existingGuest = await prisma.guest.findFirst({
      where: {
        email: data.guestEmail,
        propertyId: data.propertyId
      }
    })

    if (existingGuest) {
      guestId = existingGuest.id
    } else {
      // Create new guest
      const newGuest = await prisma.guest.create({
        data: {
          firstName: data.guestName.split(' ')[0] || data.guestName,
          lastName: data.guestName.split(' ').slice(1).join(' ') || '',
          email: data.guestEmail,
          propertyId: data.propertyId
        }
      })
      guestId = newGuest.id
    }
  }

  // Create booking and bed assignments in a transaction
  const booking = await prisma.$transaction(async (tx) => {
    // Create the booking
    const newBooking = await tx.booking.create({
      data: {
        guestId: guestId!,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        status: data.status || 'confirmed',
        notes: data.notes,
        propertyId: data.propertyId,
        totalAmount: 0, // Will be calculated based on room price and duration
        amountPaid: 0
      }
    })

    // Create bed assignments
    const bedAssignments = []
    for (let i = 0; i < bedsRequested; i++) {
      bedAssignments.push({
        bookingId: newBooking.id,
        roomId: data.roomId,
        bedLabel: `Bed ${i + 1}`,
        pricePerNight: room.pricePerNight
      })
    }

    await tx.bookingBed.createMany({
      data: bedAssignments
    })

    // Return booking with related data
    return await tx.booking.findUnique({
      where: { id: newBooking.id },
      include: {
        guest: true,
        beds: {
          include: {
            room: true
          }
        },
        property: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  })

  return booking as BookingWithDetails
}

/**
 * Update an existing booking
 */
export async function updateBooking(
  id: string,
  data: Partial<CreateBookingInput>
): Promise<BookingWithDetails> {
  // Get current booking
  const currentBooking = await prisma.booking.findUnique({
    where: { id },
    include: {
      beds: true
    }
  })

  if (!currentBooking) {
    throw new Error('Booking not found')
  }

  // Validate date range if dates are being updated
  if (data.checkIn || data.checkOut) {
    const checkIn = data.checkIn || currentBooking.checkIn
    const checkOut = data.checkOut || currentBooking.checkOut

    if (!isValidDateRange(checkIn, checkOut)) {
      throw new Error('Check-out date must be after check-in date')
    }

    // Check for conflicts if dates or room are changing
    if (data.checkIn || data.checkOut || data.roomId) {
      const roomId = data.roomId || currentBooking.beds[0]?.roomId
      if (roomId) {
        const hasConflicts = await checkBookingConflicts(
          roomId,
          checkIn,
          checkOut,
          id // Exclude current booking from conflict check
        )

        if (hasConflicts) {
          throw new Error('Updated booking conflicts with existing reservation')
        }
      }
    }
  }

  // Update booking
  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: {
      ...(data.guestId && { guestId: data.guestId }),
      ...(data.checkIn && { checkIn: data.checkIn }),
      ...(data.checkOut && { checkOut: data.checkOut }),
      ...(data.status && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes }),
      updatedAt: new Date()
    },
    include: {
      guest: true,
      beds: {
        include: {
          room: true
        }
      },
      property: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  return updatedBooking as BookingWithDetails
}

/**
 * Cancel a booking
 */
export async function cancelBooking(id: string): Promise<BookingWithDetails> {
  const booking = await prisma.booking.update({
    where: { id },
    data: {
      status: 'cancelled',
      updatedAt: new Date()
    },
    include: {
      guest: true,
      beds: {
        include: {
          room: true
        }
      },
      property: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  return booking as BookingWithDetails
}

/**
 * Get active bookings for a room on a specific date
 */
export async function getActiveBookingsForRoom(
  roomId: string,
  date: Date = getCurrentDate()
): Promise<BookingWithDetails[]> {
  const bookings = await prisma.booking.findMany({
    where: {
      beds: {
        some: {
          roomId: roomId
        }
      },
      checkIn: { lte: date },
      checkOut: { gt: date },
      status: {
        in: ['confirmed', 'checked_in']
      }
    },
    include: {
      guest: true,
      beds: {
        include: {
          room: true
        }
      },
      property: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      checkIn: 'asc'
    }
  })

  return bookings as BookingWithDetails[]
}

/**
 * Get booking statistics for a property
 */
export async function getBookingStats(propertyId: string) {
  const today = getCurrentDate()
  
  const [
    totalBookings,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
    arrivalsToday,
    departuresToday
  ] = await Promise.all([
    prisma.booking.count({ where: { propertyId } }),
    prisma.booking.count({ where: { propertyId, status: 'confirmed' } }),
    prisma.booking.count({ where: { propertyId, status: 'pending' } }),
    prisma.booking.count({ where: { propertyId, status: 'cancelled' } }),
    prisma.booking.count({ 
      where: { 
        propertyId, 
        checkIn: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      } 
    }),
    prisma.booking.count({ 
      where: { 
        propertyId, 
        checkOut: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      } 
    })
  ])

  return {
    total: totalBookings,
    confirmed: confirmedBookings,
    pending: pendingBookings,
    cancelled: cancelledBookings,
    arrivalsToday,
    departuresToday
  }
}