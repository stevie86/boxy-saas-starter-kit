import { Booking, BookingBed, Room } from '@prisma/client'
import { isDateInRange, getCurrentDate } from './dates'

/**
 * Occupation calculation utilities for hostel management system
 */

export interface OccupationCalculation {
  roomId: string
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  occupationRate: number // 0-100
  activeBookings: Booking[]
}

export type BookingWithBeds = Booking & {
  beds: (BookingBed & { room: Room })[]
}

/**
 * Calculate room occupation based on active bookings
 */
export function calculateRoomOccupation(
  room: Room,
  bookings: BookingWithBeds[],
  date: Date = getCurrentDate()
): OccupationCalculation {
  // Filter active bookings for this room on the given date
  const activeBookings = bookings.filter(booking => {
    // Check if booking is active (confirmed or checked_in)
    const isActiveStatus = booking.status === 'confirmed' || booking.status === 'checked_in'
    
    // Check if the date falls within the booking period
    const isInDateRange = isDateInRange(date, booking.checkIn, booking.checkOut)
    
    // Check if booking has beds in this room
    const hasBedsInRoom = booking.beds.some(bed => bed.roomId === room.id)
    
    return isActiveStatus && isInDateRange && hasBedsInRoom
  })

  // Calculate occupied beds for this room
  const occupiedBeds = activeBookings.reduce((total, booking) => {
    const bedsInThisRoom = booking.beds.filter(bed => bed.roomId === room.id)
    return total + bedsInThisRoom.length
  }, 0)

  // Ensure occupied beds doesn't exceed total beds (invariant)
  const safeOccupiedBeds = Math.min(occupiedBeds, room.beds)
  const availableBeds = room.beds - safeOccupiedBeds
  const occupationRate = room.beds > 0 ? (safeOccupiedBeds / room.beds) * 100 : 0

  return {
    roomId: room.id,
    totalBeds: room.beds,
    occupiedBeds: safeOccupiedBeds,
    availableBeds,
    occupationRate,
    activeBookings
  }
}

/**
 * Calculate occupation for multiple rooms
 */
export function calculateMultipleRoomOccupation(
  rooms: Room[],
  bookings: BookingWithBeds[],
  date: Date = getCurrentDate()
): OccupationCalculation[] {
  return rooms.map(room => calculateRoomOccupation(room, bookings, date))
}

/**
 * Check if a room has available capacity for additional beds
 */
export function hasAvailableCapacity(
  room: Room,
  bookings: BookingWithBeds[],
  requiredBeds: number = 1,
  date: Date = getCurrentDate()
): boolean {
  const occupation = calculateRoomOccupation(room, bookings, date)
  return occupation.availableBeds >= requiredBeds
}

/**
 * Get room occupation status for display
 */
export function getRoomOccupationStatus(occupationRate: number): {
  status: 'available' | 'partial' | 'full'
  variant: 'success' | 'warning' | 'danger'
} {
  if (occupationRate === 0) {
    return { status: 'available', variant: 'success' }
  } else if (occupationRate < 100) {
    return { status: 'partial', variant: 'warning' }
  } else {
    return { status: 'full', variant: 'danger' }
  }
}