import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import styles from './RoomCard.module.css'

interface RoomCardProps {
  room: {
    id: string
    name: string
    beds: number
    occupiedBeds: number
    type: string
  }
}

export function RoomCard({ room }: RoomCardProps) {
  const availableBeds = room.beds - room.occupiedBeds
  const occupationRate = (room.occupiedBeds / room.beds) * 100
  
  let statusVariant: 'success' | 'warning' | 'danger' = 'success'
  let statusText = 'Available'
  
  if (occupationRate === 100) {
    statusVariant = 'danger'
    statusText = 'Full'
  } else if (occupationRate > 0) {
    statusVariant = 'warning'
    statusText = 'Partial'
  }

  return (
    <Card>
      <div className={styles.header}>
        <h3 className={styles.name}>{room.name}</h3>
        <Badge variant={statusVariant}>{statusText}</Badge>
      </div>
      
      <div className={styles.type}>{room.type}</div>
      
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Total Beds</span>
          <span className={styles.value}>{room.beds}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Occupied</span>
          <span className={styles.value}>{room.occupiedBeds}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Available</span>
          <span className={styles.value}>{availableBeds}</span>
        </div>
      </div>
      
      <div className={styles.occupationBar}>
        <div 
          className={styles.occupationFill}
          style={{ 
            width: `${occupationRate}%`,
            backgroundColor: statusVariant === 'danger' ? '#dc2626' : 
                           statusVariant === 'warning' ? '#f59e0b' : '#10b981'
          }}
        />
      </div>
    </Card>
  )
}
