import { BookingCard } from '@/components/bookings/BookingCard'
import { Button } from '@/components/ui/Button'
import { getBookings } from '@/lib/queries/bookings'
import { getFirstProperty } from '@/lib/queries/properties'
import styles from './page.module.css'
import Link from 'next/link'

export default async function BookingsPage() {
  const property = await getFirstProperty()
  const bookings = await getBookings(property.id)

  const sortedBookings = [...bookings].sort((a, b) =>
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

      {sortedBookings.length === 0 && (
        <div className={styles.emptyState}>
          <p>No bookings found. Create your first booking to get started!</p>
        </div>
      )}

      <div className={styles.bookingsGrid}>
        {sortedBookings.map(booking => (
          <BookingCard key={booking.id} booking={{
            id: booking.id,
            guestName: booking.guest?.firstName ? `${booking.guest.firstName} ${booking.guest.lastName}` : 'Guest',
            roomName: booking.beds[0]?.room?.name || 'Multiple Rooms',
            checkIn: booking.checkIn.toISOString(),
            checkOut: booking.checkOut.toISOString(),
            status: booking.status
          }} />
        ))}
      </div>
    </div>
  )
}
