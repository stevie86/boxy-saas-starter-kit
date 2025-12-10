import { BookingCard } from '@/components/bookings/BookingCard'
import { Button } from '@/components/ui/Button'
import { mockBookings } from '@/lib/mock-data'
import styles from './page.module.css'
import Link from 'next/link'

export default function BookingsPage() {
  // Using mock data for now - will be replaced with real DB calls after deployment
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
        <Link href="/bookings/new">
          <Button>+ New Booking</Button>
        </Link>
      </div>

      <div className={styles.bookingsGrid}>
        {sortedBookings.map(booking => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  )
}
