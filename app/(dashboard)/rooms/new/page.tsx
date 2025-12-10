// // import { createRoomAndRedirectAction } from '@/app/actions/rooms'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import styles from './page.module.css'

// Demo property ID - in real app this would come from auth
const DEMO_PROPERTY_ID = 'demo-property-123'

export default function NewRoomPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create New Room</h1>
        <p className={styles.subtitle}>Add a new room to your hostel</p>
      </div>

      <div className={styles.demoNotice}>
        <p>Demo Mode: Database not connected. Form will show validation but won't save data.</p>
      </div>
      
      <div className={styles.demoNotice}>
        <p>Demo Mode: Database not connected. Form will show validation but won't save data.</p>
      </div>

      <form className={styles.form}>
        <input type="hidden" name="propertyId" value={DEMO_PROPERTY_ID} />
        
        <Input
          name="name"
          label="Room Name"
          placeholder="e.g., Dorm A, Private Room 1"
          required
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
        />

        <Input
          name="beds"
          label="Number of Beds"
          type="number"
          min="1"
          max="20"
          placeholder="e.g., 4"
          required
        />

        <Input
          name="pricePerNight"
          label="Price per Night (cents)"
          type="number"
          min="0"
          placeholder="e.g., 2500 for €25.00"
          helperText="Enter price in cents (e.g., 2500 = €25.00)"
        />

        <Input
          name="description"
          label="Description (Optional)"
          placeholder="Brief description of the room"
        />

        <Input
          name="amenities"
          label="Amenities (Optional)"
          placeholder="e.g., WiFi, AC, Private Bathroom"
          helperText="Comma-separated list of amenities"
        />

        <div className={styles.actions}>
          <Button type="submit">Create Room</Button>
          <Button type="button" variant="secondary" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}