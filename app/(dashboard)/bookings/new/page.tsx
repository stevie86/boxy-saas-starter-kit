import { BookingForm } from '@/components/bookings/BookingForm'
import styles from './page.module.css'

export default function NewBookingPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create New Booking</h1>
        <p className={styles.subtitle}>Reserve a room for a guest</p>
      </div>

      <BookingForm 
        propertyId="demo-property-123"
      />
    </div>
  )
}