'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createRoom, updateRoom, deleteRoom } from '@/lib/queries/rooms'

export interface ActionResult {
  success: boolean
  error?: string
  data?: any
}

/**
 * Server action to create a new room
 */
export async function createRoomAction(formData: FormData): Promise<ActionResult> {
  try {
    // Extract and validate form data
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const beds = parseInt(formData.get('beds') as string)
    const propertyId = formData.get('propertyId') as string
    const description = formData.get('description') as string || undefined
    const amenities = formData.get('amenities') as string || undefined
    const pricePerNight = formData.get('pricePerNight') ? 
      parseInt(formData.get('pricePerNight') as string) : undefined

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return {
        success: false,
        error: 'Room name is required and cannot be empty'
      }
    }

    if (!type) {
      return {
        success: false,
        error: 'Room type is required'
      }
    }

    if (!beds || beds <= 0) {
      return {
        success: false,
        error: 'Room must have at least 1 bed'
      }
    }

    if (!propertyId) {
      return {
        success: false,
        error: 'Property ID is required'
      }
    }

    // Validate name doesn't contain only whitespace
    if (name.trim() !== name || /^\s*$/.test(name)) {
      return {
        success: false,
        error: 'Room name cannot be empty or contain only whitespace'
      }
    }

    // Create the room
    const room = await createRoom({
      name: name.trim(),
      type,
      beds,
      propertyId,
      description,
      amenities,
      pricePerNight
    })

    // Revalidate the rooms page to show the new room
    revalidatePath('/rooms')
    
    return {
      success: true,
      data: room
    }

  } catch (error) {
    console.error('Error creating room:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create room'
    }
  }
}

/**
 * Server action to update an existing room
 */
export async function updateRoomAction(
  roomId: string, 
  formData: FormData
): Promise<ActionResult> {
  try {
    // Extract form data
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const beds = formData.get('beds') ? parseInt(formData.get('beds') as string) : undefined
    const description = formData.get('description') as string || undefined
    const amenities = formData.get('amenities') as string || undefined
    const pricePerNight = formData.get('pricePerNight') ? 
      parseInt(formData.get('pricePerNight') as string) : undefined

    // Validate name if provided
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return {
          success: false,
          error: 'Room name is required and cannot be empty'
        }
      }

      if (name.trim() !== name || /^\s*$/.test(name)) {
        return {
          success: false,
          error: 'Room name cannot be empty or contain only whitespace'
        }
      }
    }

    // Validate beds if provided
    if (beds !== undefined && beds <= 0) {
      return {
        success: false,
        error: 'Room must have at least 1 bed'
      }
    }

    // Update the room
    const room = await updateRoom(roomId, {
      ...(name && { name: name.trim() }),
      ...(type && { type }),
      ...(beds && { beds }),
      ...(description !== undefined && { description }),
      ...(amenities !== undefined && { amenities }),
      ...(pricePerNight !== undefined && { pricePerNight })
    })

    // Revalidate the rooms page
    revalidatePath('/rooms')
    revalidatePath(`/rooms/${roomId}`)
    
    return {
      success: true,
      data: room
    }

  } catch (error) {
    console.error('Error updating room:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update room'
    }
  }
}

/**
 * Server action to delete a room
 */
export async function deleteRoomAction(roomId: string): Promise<ActionResult> {
  try {
    await deleteRoom(roomId)

    // Revalidate the rooms page
    revalidatePath('/rooms')
    
    return {
      success: true
    }

  } catch (error) {
    console.error('Error deleting room:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete room'
    }
  }
}

/**
 * Server action to create room and redirect
 */
export async function createRoomAndRedirectAction(formData: FormData) {
  const result = await createRoomAction(formData)
  
  if (result.success) {
    redirect('/rooms')
  } else {
    // In a real app, you'd want to handle this error better
    // For now, we'll redirect back with an error parameter
    redirect(`/rooms/new?error=${encodeURIComponent(result.error || 'Unknown error')}`)
  }
}