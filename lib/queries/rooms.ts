import { prisma } from '../db'
import { Room, Booking } from '@prisma/client'
import { calculateRoomOccupation, OccupationCalculation } from '../utils/occupation'
import { getCurrentDate } from '../utils/dates'

export interface CreateRoomInput {
  name: string
  type: string
  beds: number
  propertyId: string
  description?: string
  amenities?: string
  pricePerNight?: number
}

export interface RoomWithOccupation extends Room {
  occupiedBeds: number
  availableBeds: number
  occupationRate: number
}

export interface RoomFilters {
  type?: string
  status?: string
  minBeds?: number
  maxBeds?: number
}

/**
 * Get all rooms for a property with occupation data
 */
export async function getRooms(
  propertyId: string, 
  filters?: RoomFilters
): Promise<RoomWithOccupation[]> {
  // Build where clause
  const where: any = {
    propertyId,
    ...(filters?.type && { type: filters.type }),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.minBeds && { beds: { gte: filters.minBeds } }),
    ...(filters?.maxBeds && { beds: { lte: filters.maxBeds } }),
  }

  // Get rooms with their booking beds
  const rooms = await prisma.room.findMany({
    where,
    include: {
      bookingBeds: {
        include: {
          booking: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  // Calculate occupation for each room
  const currentDate = getCurrentDate()
  
  return rooms.map(room => {
    // Get active bookings for this room
    const activeBookings = room.bookingBeds
      .filter(bed => {
        const booking = bed.booking
        return (
          (booking.status === 'confirmed' || booking.status === 'checked_in') &&
          booking.checkIn <= currentDate &&
          booking.checkOut > currentDate
        )
      })
      .map(bed => bed.booking)

    const occupiedBeds = activeBookings.length
    const availableBeds = room.beds - occupiedBeds
    const occupationRate = room.beds > 0 ? (occupiedBeds / room.beds) * 100 : 0

    return {
      ...room,
      occupiedBeds: Math.min(occupiedBeds, room.beds), // Ensure invariant
      availableBeds: Math.max(availableBeds, 0),
      occupationRate
    } as RoomWithOccupation
  })
}

/**
 * Get a single room by ID with occupation data
 */
export async function getRoomById(id: string): Promise<RoomWithOccupation | null> {
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      bookingBeds: {
        include: {
          booking: true
        }
      }
    }
  })

  if (!room) return null

  // Calculate occupation
  const currentDate = getCurrentDate()
  const activeBookings = room.bookingBeds
    .filter(bed => {
      const booking = bed.booking
      return (
        (booking.status === 'confirmed' || booking.status === 'checked_in') &&
        booking.checkIn <= currentDate &&
        booking.checkOut > currentDate
      )
    })
    .map(bed => bed.booking)

  const occupiedBeds = activeBookings.length
  const availableBeds = room.beds - occupiedBeds
  const occupationRate = room.beds > 0 ? (occupiedBeds / room.beds) * 100 : 0

  return {
    ...room,
    occupiedBeds: Math.min(occupiedBeds, room.beds),
    availableBeds: Math.max(availableBeds, 0),
    occupationRate
  } as RoomWithOccupation
}

/**
 * Create a new room
 */
export async function createRoom(data: CreateRoomInput) {
  // Validate input
  if (!data.name || data.name.trim().length === 0) {
    throw new Error('Room name is required and cannot be empty')
  }

  if (data.beds <= 0) {
    throw new Error('Room must have at least 1 bed')
  }

  // Check for duplicate room names in the same property
  const existingRoom = await prisma.room.findFirst({
    where: {
      propertyId: data.propertyId,
      name: data.name.trim()
    }
  })

  if (existingRoom) {
    throw new Error('A room with this name already exists in this property')
  }

  return await prisma.room.create({
    data: {
      name: data.name.trim(),
      type: data.type,
      beds: data.beds,
      propertyId: data.propertyId,
      description: data.description,
      amenities: data.amenities,
      pricePerNight: data.pricePerNight || 0,
      status: 'available'
    }
  })
}

/**
 * Update an existing room
 */
export async function updateRoom(id: string, data: Partial<CreateRoomInput>) {
  // Validate if name is being updated
  if (data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Room name is required and cannot be empty')
    }
  }

  // Validate if beds is being updated
  if (data.beds !== undefined && data.beds <= 0) {
    throw new Error('Room must have at least 1 bed')
  }

  return await prisma.room.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.type && { type: data.type }),
      ...(data.beds && { beds: data.beds }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.amenities !== undefined && { amenities: data.amenities }),
      ...(data.pricePerNight !== undefined && { pricePerNight: data.pricePerNight }),
      updatedAt: new Date()
    }
  })
}

/**
 * Delete a room (only if no active bookings)
 */
export async function deleteRoom(id: string): Promise<void> {
  // Check for active bookings
  const activeBookings = await prisma.bookingBed.findMany({
    where: {
      roomId: id,
      booking: {
        status: {
          in: ['confirmed', 'checked_in', 'pending']
        }
      }
    }
  })

  if (activeBookings.length > 0) {
    throw new Error('Cannot delete room with active bookings')
  }

  await prisma.room.delete({
    where: { id }
  })
}

/**
 * Get room occupation for a specific date
 */
export async function getRoomOccupation(
  roomId: string, 
  date: Date = getCurrentDate()
): Promise<OccupationCalculation> {
  const room = await prisma.room.findUnique({
    where: { id: roomId }
  })

  if (!room) {
    throw new Error('Room not found')
  }

  // Get bookings that overlap with the date
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
      beds: {
        include: {
          room: true
        }
      }
    }
  })

  return calculateRoomOccupation(room, bookings, date)
}

/**
 * Check if room has available capacity
 */
export async function checkRoomAvailability(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  requiredBeds: number = 1
): Promise<boolean> {
  const room = await prisma.room.findUnique({
    where: { id: roomId }
  })

  if (!room) return false

  // Get overlapping bookings
  const overlappingBookings = await prisma.bookingBed.count({
    where: {
      roomId: roomId,
      booking: {
        status: {
          in: ['confirmed', 'checked_in', 'pending']
        },
        OR: [
          {
            checkIn: { lt: checkOut },
            checkOut: { gt: checkIn }
          }
        ]
      }
    }
  })

  const availableBeds = room.beds - overlappingBookings
  return availableBeds >= requiredBeds
}