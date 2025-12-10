'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { 
  createBooking, 
  updateBooking, 
  cancelBooking,
  checkBookingConflicts 
} from '@/lib/queries/bookings'
import { isValidDateRange } from '@/lib/utils/dates'

export interface ActionResult {
  success: boolean
  error?: string
  data?: any
}

/**
 * Server action to create a new booking
 */
export async function createBookingAction(formData: FormData): Promise<ActionResult> {
  try {
    // Extract and validate form data
    const guestName = formData.get('guestName') as string
    const guestEmail = formData.get('guestEmail') as string
    const guestId = formData.get('guestId') as string || undefined
    const roomId = formData.get('roomId') as string
    const checkInStr = formData.get('checkIn') as string
    const checkOutStr = formData.get('checkOut') as string
    const bedsRequested = parseInt(formData.get('bedsRequested') as string) || 1
    const status = formData.get('status') as string || 'confirmed'
    const notes = formData.get('notes') as string || undefined
    const propertyId = formData.get('propertyId') as string

    // Validate required fields
    if (!roomId) {
      return {
        success: false,
        error: 'Room selection is required'
      }
    }

    if (!checkInStr || !checkOutStr) {
      return {
        success: false,
        error: 'Check-in and check-out dates are required'
      }
    }

    if (!propertyId) {
      return {
        success: false,
        error: 'Property ID is required'
      }
    }

    // Validate guest information
    if (!guestId && (!guestName || !guestEmail)) {
      return {
        success: false,
        error: 'Guest name and email are required'
      }
    }

    // Parse and validate dates
    const checkIn = new Date(checkInStr)
    const checkOut = new Date(checkOutStr)

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return {
        success: false,
        error: 'Invalid date format'
      }
    }

    if (!isValidDateRange(checkIn, checkOut)) {
      return {
        success: false,
        error: 'Check-out date must be after check-in date'
      }
    }

    // Validate beds requested
    if (bedsRequested <= 0) {
      return {
        success: false,
        error: 'At least 1 bed must be requested'
      }
    }

    // Validate email format if provided
    if (guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      return {
        success: false,
        error: 'Invalid email format'
      }
    }

    // Create the booking
    const booking = await createBooking({
      guestId,
      guestName: guestName?.trim(),
      guestEmail: guestEmail?.trim(),
      roomId,
      checkIn,
      checkOut,
      bedsRequested,
      status,
      notes: notes?.trim(),
      propertyId
    })

    // Revalidate relevant pages
    revalidatePath('/bookings')
    revalidatePath('/rooms')
    revalidatePath('/')
    
    return {
      success: true,
      data: booking
    }

  } catch (error) {
    console.error('Error creating booking:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create booking'
    }
  }
}

/**
 * Server action to update an existing booking
 */
export async function updateBookingAction(
  bookingId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Extract form data
    const guestId = formData.get('guestId') as string || undefined
    const roomId = formData.get('roomId') as string || undefined
    const checkInStr = formData.get('checkIn') as string
    const checkOutStr = formData.get('checkOut') as string
    const status = formData.get('status') as string || undefined
    const notes = formData.get('notes') as string || undefined

    // Parse dates if provided
    let checkIn: Date | undefined
    let checkOut: Date | undefined

    if (checkInStr) {
      checkIn = new Date(checkInStr)
      if (isNaN(checkIn.getTime())) {
        return {
          success: false,
          error: 'Invalid check-in date format'
        }
      }
    }

    if (checkOutStr) {
      checkOut = new Date(checkOutStr)
      if (isNaN(checkOut.getTime())) {
        return {
          success: false,
          error: 'Invalid check-out date format'
        }
      }
    }

    // Validate date range if both dates are provided
    if (checkIn && checkOut && !isValidDateRange(checkIn, checkOut)) {
      return {
        success: false,
        error: 'Check-out date must be after check-in date'
      }
    }

    // Update the booking
    const booking = await updateBooking(bookingId, {
      guestId,
      roomId,
      checkIn,
      checkOut,
      status,
      notes: notes?.trim()
    })

    // Revalidate relevant pages
    revalidatePath('/bookings')
    revalidatePath(`/bookings/${bookingId}`)
    revalidatePath('/rooms')
    revalidatePath('/')
    
    return {
      success: true,
      data: booking
    }

  } catch (error) {
    console.error('Error updating booking:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update booking'
    }
  }
}

/**
 * Server action to cancel a booking
 */
export async function cancelBookingAction(bookingId: string): Promise<ActionResult> {
  try {
    const booking = await cancelBooking(bookingId)

    // Revalidate relevant pages
    revalidatePath('/bookings')
    revalidatePath(`/bookings/${bookingId}`)
    revalidatePath('/rooms')
    revalidatePath('/')
    
    return {
      success: true,
      data: booking
    }

  } catch (error) {
    console.error('Error cancelling booking:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel booking'
    }
  }
}

/**
 * Server action to check booking availability
 */
export async function checkAvailabilityAction(formData: FormData): Promise<ActionResult> {
  try {
    const roomId = formData.get('roomId') as string
    const checkInStr = formData.get('checkIn') as string
    const checkOutStr = formData.get('checkOut') as string

    if (!roomId || !checkInStr || !checkOutStr) {
      return {
        success: false,
        error: 'Room ID, check-in, and check-out dates are required'
      }
    }

    const checkIn = new Date(checkInStr)
    const checkOut = new Date(checkOutStr)

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return {
        success: false,
        error: 'Invalid date format'
      }
    }

    if (!isValidDateRange(checkIn, checkOut)) {
      return {
        success: false,
        error: 'Check-out date must be after check-in date'
      }
    }

    const hasConflicts = await checkBookingConflicts(roomId, checkIn, checkOut)
    
    return {
      success: true,
      data: {
        available: !hasConflicts,
        roomId,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString()
      }
    }

  } catch (error) {
    console.error('Error checking availability:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check availability'
    }
  }
}

/**
 * Server action to create booking and redirect
 */
export async function createBookingAndRedirectAction(formData: FormData) {
  const result = await createBookingAction(formData)
  
  if (result.success) {
    redirect('/bookings')
  } else {
    // In a real app, you'd want to handle this error better
    redirect(`/bookings/new?error=${encodeURIComponent(result.error || 'Unknown error')}`)
  }
}

/**
 * Server action for quick check-in
 */
export async function checkInBookingAction(bookingId: string): Promise<ActionResult> {
  try {
    const booking = await updateBooking(bookingId, {
      status: 'checked_in'
    })

    revalidatePath('/bookings')
    revalidatePath(`/bookings/${bookingId}`)
    revalidatePath('/')
    
    return {
      success: true,
      data: booking
    }

  } catch (error) {
    console.error('Error checking in booking:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check in booking'
    }
  }
}

/**
 * Server action for quick check-out
 */
export async function checkOutBookingAction(bookingId: string): Promise<ActionResult> {
  try {
    const booking = await updateBooking(bookingId, {
      status: 'checked_out'
    })

    revalidatePath('/bookings')
    revalidatePath(`/bookings/${bookingId}`)
    revalidatePath('/')
    
    return {
      success: true,
      data: booking
    }

  } catch (error) {
    console.error('Error checking out booking:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check out booking'
    }
  }
}