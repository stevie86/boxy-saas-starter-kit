import { RoomForm } from '@/components/rooms/RoomForm'
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

      <RoomForm 
        propertyId={DEMO_PROPERTY_ID}
      />
    </div>
  )
}