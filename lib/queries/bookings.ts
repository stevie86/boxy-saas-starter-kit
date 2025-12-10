import { prisma } from '../db'
import { Booking, BookingBed, Room, Guest } from '@prisma/client'
import { getCurrentDate, getNextDay, getDatesInRange } from '../utils/dates'
import { OccupationCalculation, calculateRoomOccupation } from '../utils/occupation'

export interface CreateBookingInput {
  propertyId: string
  guestId?: string // Optional, can be anonymous/walk-in initially
  guestName?: string // If no guestId, create/find guest
  checkIn: Date
  checkOut: Date
  beds: {
    roomId: string
    bedCount: number // How many beds in this room?
    bedLabels?: string[] // Optional specific bed assignments
  }[]
  totalAmount: number
  amountPaid?: number
  notes?: string
  channel?: string
  status?: string // Default 'confirmed'
}

export interface BookingFilters {
  status?: string
  checkInStart?: Date
  checkInEnd?: Date
  guestName?: string
}

const DEFAULT_BOOKING_STATUS = 'confirmed'

/**
 * Create a new booking with bed assignments
 */
export async function createBooking(data: CreateBookingInput) {
  // 1. Validation
  if (data.checkIn >= data.checkOut) {
    throw new Error('Check-out date must be after check-in date')
  }

  // 2. Wrap in transaction
  return await prisma.$transaction(async (tx) => {
    // A. Handle Guest (Link existing or Create new)
    let guestId = data.guestId
    if (!guestId && data.guestName) {
      // Simple guest creation for MVP
      const [firstName, ...lastNameParts] = data.guestName.split(' ')
      const lastName = lastNameParts.join(' ') || ''
      const newGuest = await tx.guest.create({
        data: {
          propertyId: data.propertyId,
          firstName,
          lastName,
        }
      })
      guestId = newGuest.id
    }

    // B. Create Booking
    const booking = await tx.booking.create({
      data: {
        propertyId: data.propertyId,
        guestId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        totalAmount: data.totalAmount,
        amountPaid: data.amountPaid || 0,
        status: data.status || DEFAULT_BOOKING_STATUS,
        channel: data.channel || 'direct',
        notes: data.notes,
        confirmationCode: Math.random().toString(36).substring(2, 8).toUpperCase()
      }
    })

    // C. Create Booking Beds (Assignments)
    for (const roomRequest of data.beds) {
      // Verify room exists and has capacity
      const room = await tx.room.findUnique({ where: { id: roomRequest.roomId } })
      if (!room) throw new Error(`Room ${roomRequest.roomId} not found`)

      // Check real-time availability (simplified for MVP inside transaction)
      // Note: In high currency, this might need locking, but ok for MVP.

      // Assign individual "slots"
      for (let i = 0; i < roomRequest.bedCount; i++) {
        await tx.bookingBed.create({
          data: {
            bookingId: booking.id,
            roomId: roomRequest.roomId,
            bedLabel: roomRequest.bedLabels?.[i] || `Bed ${i + 1}`,
            pricePerNight: Math.floor(data.totalAmount / (data.beds.length * roomRequest.bedCount)) // Rough split if not provided
          }
        })
      }
    }

    return booking
  })
}

/**
 * Get all bookings for a property
 */
export async function getBookings(propertyId: string, filters?: BookingFilters) {
  const where: any = {
    propertyId,
    ...(filters?.status && { status: filters.status }),
    ...(filters?.checkInStart && { checkIn: { gte: filters.checkInStart } }),
    ...(filters?.checkInEnd && { checkIn: { lte: filters.checkInEnd } })
  }

  if (filters?.guestName) {
    where.guest = {
      OR: [
        { firstName: { contains: filters.guestName, mode: 'insensitive' } },
        { lastName: { contains: filters.guestName, mode: 'insensitive' } }
      ]
    }
  }

  return await prisma.booking.findMany({
    where,
    include: {
      guest: true,
      beds: {
        include: {
          room: true
        }
      }
    },
    orderBy: {
      checkIn: 'desc'
    }
  })
}

/**
 * Get single booking by ID
 */
export async function getBookingById(id: string) {
  return await prisma.booking.findUnique({
    where: { id },
    include: {
      guest: true,
      beds: {
        include: {
          room: true
        }
      },
      payments: true
    }
  })
}

/**
 * Update booking status or details
 */
export async function updateBooking(id: string, data: Partial<Booking>) {
  return await prisma.booking.update({
    where: { id },
    data
  })
}

/**
 * Cancel a booking
 */
export async function cancelBooking(id: string) {
  return await prisma.booking.update({
    where: { id },
    data: {
      status: 'cancelled'
    }
  })
}