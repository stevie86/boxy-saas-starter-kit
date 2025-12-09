import { RoomCard } from '@/components/rooms/RoomCard'
import { Button } from '@/components/ui/Button'
import { mockRooms } from '@/lib/mock-data'
import styles from './page.module.css'

export default function RoomsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Rooms</h1>
          <p className={styles.subtitle}>Manage your hostel rooms and availability</p>
        </div>
        <Button>+ Add Room</Button>
      </div>

      <div className={styles.roomsGrid}>
        {mockRooms.map(room => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  )
}
