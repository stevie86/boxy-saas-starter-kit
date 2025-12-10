import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import styles from './page.module.css'

export default function NewBookingPage() {
  // Demo room options - will be replaced with real data once database is connected
  const roomOptions = [
    { value: 'demo-room-1', label: 'Dorm A (2/8 beds available)' },
    { value: 'demo-room-2', label: 'Private Room 1 (1/2 beds available)' },
    { value: 'demo-room-3', label: 'Suite (4/4 beds available)' }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create New Booking</h1>
        <p className={styles.subtitle}>Reserve a room for a guest</p>
      </div>

      <div className={styles.demoNotice}>
        <p>Demo Mode: Database not connected. Form will show validation but won't save data.</p>
      </div>
      
      <form className={styles.form}>
          <input type="hidden" name="propertyId" value="demo-property-123" />
          
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Guest Information</h3>
            
            <Input
              name="guestName"
              label="Guest Name"
              placeholder="e.g., John Smith"
              required
            />

            <Input
              name="guestEmail"
              label="Guest Email"
              type="email"
              placeholder="e.g., john@example.com"
              required
            />
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Booking Details</h3>
            
            <Select
              name="roomId"
              label="Room"
              placeholder="Select a room"
              options={roomOptions}
              required
            />

            <div className={styles.dateRow}>
              <Input
                name="checkIn"
                label="Check-in Date"
                type="date"
                required
              />

              <Input
                name="checkOut"
                label="Check-out Date"
                type="date"
                required
              />
            </div>

            <Input
              name="bedsRequested"
              label="Number of Beds"
              type="number"
              min="1"
              defaultValue="1"
              required
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
            />

            <Input
              name="notes"
              label="Notes (Optional)"
              placeholder="Any special requests or notes"
            />
          </div>

          <div className={styles.actions}>
            <Button type="submit">Create Booking</Button>
            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </form>
    </div>
  )
}