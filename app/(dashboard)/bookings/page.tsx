import { BookingCard } from '@/components/bookings/BookingCard'
import { Button } from '@/components/ui/Button'
import { getBookings } from '@/lib/queries/bookings'
import { mockBookings } from '@/lib/mock-data'
import styles from './page.module.css'
import Link from 'next/link'

export default async function BookingsPage() {
  // Try to get real data, fall back to mock data if database isn't available
  let bookings = mockBookings
  let error = null
  
  // Skip database calls during build
  if (typeof window !== 'undefined' || process.env.VERCEL_ENV) {
    try {
      const realBookings = await getBookings('demo-property-123')
      if (realBookings && realBookings.length > 0) {
        bookings = realBookings.map(booking => ({
          id: booking.id,
          guestName: booking.guest?.firstName + ' ' + booking.guest?.lastName || 'Unknown Guest',
          roomName: booking.beds[0]?.room?.name || 'Unknown Room',
          checkIn: booking.checkIn.toISOString().split('T')[0],
          checkOut: booking.checkOut.toISOString().split('T')[0],
          status: booking.status
        }))
      }
    } catch (e) {
      error = 'Database not connected - using demo data'
      console.log('Using mock data:', e)
    }
  }
  
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

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      <div className={styles.bookingsGrid}>
        {sortedBookings.map(booking => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  )
}
