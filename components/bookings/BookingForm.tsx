'use client'

import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { createBookingAction } from '@/app/actions/bookings'
import { redirect } from 'next/navigation'
import styles from './BookingForm.module.css'

interface RoomOption {
  id: string
  name: string
  availableBeds: number
}

interface BookingFormProps {
  propertyId: string
  rooms: RoomOption[]
}

export function BookingForm({ propertyId, rooms }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedRoomId, setSelectedRoomId] = useState<string>('')
  const [maxBeds, setMaxBeds] = useState<number>(1)

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId)
    const room = rooms.find(r => r.id === roomId)
    setMaxBeds(room?.availableBeds || 1)
  }

  async function clientAction(formData: FormData) {
    setIsSubmitting(true)
    setErrors({})

    // Append extra data that might be missing if fields are disabled or managed
    // But since we use native form, formData should have everything if inputs have names

    const result = await createBookingAction({}, formData)

    if (result.error) {
      setErrors({ general: result.error })
      setIsSubmitting(false)
    } else {
      // Success - Redirect happens in server action OR we can do it here if using client router
      // If server action uses redirect(), this code might not be reached or component unmounts.
      // But let's add a safe redirect here just in case server action only revalidates.
      window.location.href = '/bookings'
    }
  }

  return (
    <form action={clientAction} className={styles.form}>
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
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Booking Details</h3>

        <Select
          name="roomId"
          label="Room"
          placeholder="Select a room"
          options={rooms.map(room => ({
            value: room.id,
            label: `${room.name} (${room.availableBeds} beds available)`
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
            defaultValue={new Date().toISOString().split('T')[0]}
          />

          <Input
            name="checkOut"
            label="Check-out Date"
            type="date"
            required
            error={errors.checkOut}
            defaultValue={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
          />
        </div>

        <Input
          name="bedCount"
          label="Number of Beds"
          type="number"
          min="1"
          max={maxBeds}
          defaultValue="1"
          required
          error={errors.bedCount}
          helperText={selectedRoomId ? `Maximum ${maxBeds} beds available` : undefined}
        />

        <input type="hidden" name="totalAmount" value="10000" /> {/* Hardcode price for MVP */}

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