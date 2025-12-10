'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import * as bookingsQuery from '@/lib/queries/bookings'
import { z } from 'zod'

// Types
type ActionState = {
  success?: boolean
  error?: string
  data?: any
}

// Zod Schema for validation
const CreateBookingSchema = z.object({
  propertyId: z.string(),
  guestName: z.string().min(1, "Guest name is required"),
  checkIn: z.string().transform(str => new Date(str)),
  checkOut: z.string().transform(str => new Date(str)),
  roomId: z.string(),
  bedCount: z.coerce.number().min(1),
  totalAmount: z.coerce.number().min(0),
  notes: z.string().optional()
})

/**
 * Create a new booking (Server Action)
 */
export async function createBookingAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    // 1. Validate Form Data
    const rawData = {
      propertyId: formData.get('propertyId'),
      guestName: formData.get('guestName'),
      checkIn: formData.get('checkIn'),
      checkOut: formData.get('checkOut'),
      roomId: formData.get('roomId'),
      bedCount: formData.get('bedCount'),
      totalAmount: formData.get('totalAmount'), // In cents usually, assumption here
      notes: formData.get('notes'),
    }

    const validated = CreateBookingSchema.parse(rawData)

    // 2. Call DB Query
    const booking = await bookingsQuery.createBooking({
      propertyId: validated.propertyId,
      guestName: validated.guestName,
      checkIn: validated.checkIn,
      checkOut: validated.checkOut,
      totalAmount: validated.totalAmount,
      beds: [{
        roomId: validated.roomId,
        bedCount: validated.bedCount
      }],
      status: 'confirmed'
    })

    // 3. Revalidate and Return
    revalidatePath('/bookings')
    revalidatePath('/rooms') // Occupation changes
    return { success: true, data: booking }

  } catch (error) {
    console.error('Failed to create booking:', error)
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }
    return { error: 'Failed to create booking. Please try again.' }
  }
}

/**
 * Cancel a booking (Server Action)
 */
export async function cancelBookingAction(bookingId: string) {
  try {
    await bookingsQuery.cancelBooking(bookingId)
    revalidatePath('/bookings')
    revalidatePath('/rooms')
    return { success: true }
  } catch (error) {
    console.error('Failed to cancel booking:', error)
    return { error: 'Failed to cancel booking' }
  }
}

/**
 * Check-in a guest (Server Action)
 */
export async function checkInBookingAction(bookingId: string) {
  try {
    await bookingsQuery.updateBooking(bookingId, { status: 'checked_in' })
    revalidatePath('/bookings')
    return { success: true }
  } catch (error) {
    return { error: 'Failed to check in' }
  }
}