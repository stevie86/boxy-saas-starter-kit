import { BookingForm } from '@/components/bookings/BookingForm'
import { getFirstProperty } from '@/lib/queries/properties'
import { getRooms } from '@/lib/queries/rooms'
import styles from './page.module.css'

export default async function NewBookingPage() {
  const property = await getFirstProperty()
  const rooms = await getRooms(property.id)

  const roomOptions = rooms.map(room => ({
    id: room.id,
    name: room.name,
    availableBeds: room.availableBeds
  }))

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create New Booking</h1>
        <p className={styles.subtitle}>Reserve a room for a guest</p>
      </div>

      <BookingForm
        propertyId={property.id}
        rooms={roomOptions}
      />
    </div>
  )
}