import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import styles from './BookingCard.module.css'

interface BookingCardProps {
  booking: {
    id: string
    guestName: string
    roomName: string
    checkIn: string
    checkOut: string
    status: string
  }
}

export function BookingCard({ booking }: BookingCardProps) {
  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'confirmed':
      case 'checked_in':
        return 'success'
      case 'pending':
        return 'warning'
      case 'cancelled':
      case 'no_show':
        return 'danger'
      default:
        return 'info'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card>
      <div className={styles.header}>
        <h3 className={styles.guestName}>{booking.guestName}</h3>
        <Badge variant={getStatusVariant(booking.status)}>
          {booking.status.replace('_', ' ')}
        </Badge>
      </div>
      
      <div className={styles.room}>{booking.roomName}</div>
      
      <div className={styles.dates}>
        <div className={styles.dateGroup}>
          <span className={styles.dateLabel}>Check-in</span>
          <span className={styles.dateValue}>{formatDate(booking.checkIn)}</span>
        </div>
        <div className={styles.arrow}>→</div>
        <div className={styles.dateGroup}>
          <span className={styles.dateLabel}>Check-out</span>
          <span className={styles.dateValue}>{formatDate(booking.checkOut)}</span>
        </div>
      </div>
    </Card>
  )
}
