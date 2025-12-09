import { BookingCard } from '@/components/bookings/BookingCard'
import { Button } from '@/components/ui/Button'
import { mockBookings } from '@/lib/mock-data'
import styles from './page.module.css'

export default function BookingsPage() {
  // Sort bookings by check-in date
  const sortedBookings = [...mockBookings].sort((a, b) => 
    new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Bookings</h1>
          <p className={styles.subtitle}>View and manage all reservations</p>
        </div>
        <Button>+ New Booking</Button>
      </div>

      <div className={styles.bookingsGrid}>
        {sortedBookings.map(booking => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  )
}
