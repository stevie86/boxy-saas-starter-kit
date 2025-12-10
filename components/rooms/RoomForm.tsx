'use client'

import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
// import { createRoomAndRedirectAction } from '@/app/actions/rooms'
import styles from './RoomForm.module.css'

interface RoomFormProps {
  propertyId: string
}

export function RoomForm({ propertyId }: RoomFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setErrors({})

    try {
      // Demo mode - just show success message
      console.log('Demo: Would create room with data:', Object.fromEntries(formData))
      setErrors({ general: 'Demo Mode: Room creation disabled. Database not connected.' })
      const result = { success: false, error: 'Demo mode - form disabled' }
      
      if (!result.success && result.error) {
        // Handle validation errors
        if (typeof result.error === 'object') {
          setErrors(result.error)
        } else {
          setErrors({ general: result.error })
        }
        setIsSubmitting(false)
      }
      // If successful, the action will redirect automatically
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className={styles.form}>
      <input type="hidden" name="propertyId" value={propertyId} />
      
      {errors.general && (
        <div className={styles.errorMessage}>
          {errors.general}
        </div>
      )}
      
      <Input
        name="name"
        label="Room Name"
        placeholder="e.g., Dorm A, Private Room 1"
        required
        error={errors.name}
      />

      <Select
        name="type"
        label="Room Type"
        placeholder="Select room type"
        options={[
          { value: 'dormitory', label: 'Dormitory' },
          { value: 'private', label: 'Private Room' },
          { value: 'suite', label: 'Suite' }
        ]}
        required
        error={errors.type}
      />

      <Input
        name="beds"
        label="Number of Beds"
        type="number"
        min="1"
        max="20"
        placeholder="e.g., 4"
        required
        error={errors.beds}
      />

      <Input
        name="pricePerNight"
        label="Price per Night (cents)"
        type="number"
        min="0"
        placeholder="e.g., 2500 for €25.00"
        helperText="Enter price in cents (e.g., 2500 = €25.00)"
        error={errors.pricePerNight}
      />

      <Input
        name="description"
        label="Description (Optional)"
        placeholder="Brief description of the room"
        error={errors.description}
      />

      <Input
        name="amenities"
        label="Amenities (Optional)"
        placeholder="e.g., WiFi, AC, Private Bathroom"
        helperText="Comma-separated list of amenities"
        error={errors.amenities}
      />

      <div className={styles.actions}>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Room'}
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}