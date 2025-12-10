'use client'

import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
// import { createBookingAndRedirectAction } from '@/app/actions/bookings'
import styles from './BookingForm.module.css'

interface BookingFormProps {
  propertyId: string
}

interface RoomOption {
  value: string
  label: string
  availableBeds: number
}

export function BookingForm({ propertyId }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [maxBeds, setMaxBeds] = useState<number>(1)

  // Demo room options - in real app this would come from API
  useEffect(() => {
    const demoRooms: RoomOption[] = [
      { value: 'demo-room-1', label: 'Dorm A', availableBeds: 6 },
      { value: 'demo-room-2', label: 'Private Room 1', availableBeds: 1 },
      { value: 'demo-room-3', label: 'Suite', availableBeds: 4 }
    ]
    setRoomOptions(demoRooms)
  }, [])

  const handleRoomChange = (roomId: string) => {
    setSelectedRoom(roomId)
    const room = roomOptions.find(r => r.value === roomId)
    setMaxBeds(room?.availableBeds || 1)
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setErrors({})

    try {
      // Demo mode - just show success message
      console.log('Demo: Would create booking with data:', Object.fromEntries(formData))
      setErrors({ general: 'Demo Mode: Booking creation disabled. Database not connected.' })
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
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Guest Information</h3>
        
        <Input
          name="guestName"
          label="Guest Name"
          placeholder="e.g., John Smith"
          required
          error={errors.guestName}
        />

        <Input
          name="guestEmail"
          label="Guest Email"
          type="email"
          placeholder="e.g., john@example.com"
          required
          error={errors.guestEmail}
        />
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Booking Details</h3>
        
        <Select
          name="roomId"
          label="Room"
          placeholder="Select a room"
          options={roomOptions.map(room => ({
            value: room.value,
            label: `${room.label} (${room.availableBeds} beds available)`
          }))}
          required
          error={errors.roomId}
          onChange={(e) => handleRoomChange(e.target.value)}
        />

        <div className={styles.dateRow}>
          <Input
            name="checkIn"
            label="Check-in Date"
            type="date"
            required
            error={errors.checkIn}
          />

          <Input
            name="checkOut"
            label="Check-out Date"
            type="date"
            required
            error={errors.checkOut}
          />
        </div>

        <Input
          name="bedsRequested"
          label="Number of Beds"
          type="number"
          min="1"
          max={maxBeds}
          defaultValue="1"
          required
          error={errors.bedsRequested}
          helperText={selectedRoom ? `Maximum ${maxBeds} beds available` : undefined}
        />

        <Select
          name="status"
          label="Booking Status"
          defaultValue="confirmed"
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' }
          ]}
          required
          error={errors.status}
        />

        <Input
          name="notes"
          label="Notes (Optional)"
          placeholder="Any special requests or notes"
          error={errors.notes}
        />
      </div>

      <div className={styles.actions}>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Booking'}
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