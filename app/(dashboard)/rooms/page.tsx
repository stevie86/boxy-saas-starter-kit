'use client'

import { RoomCard } from '@/components/rooms/RoomCard'
import { Button } from '@/components/ui/Button'
// import { getRooms } from '@/lib/queries/rooms'
import { mockRooms } from '@/lib/mock-data'
import styles from './page.module.css'
import Link from 'next/link'

export default function RoomsPage() {
  // Use mock data for build
  const rooms = mockRooms
  const error = 'Database not connected - using demo data'

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Rooms</h1>
          <p className={styles.subtitle}>Manage your hostel rooms and availability</p>
        </div>
        <Link href="/rooms/new">
          <Button>+ Add Room</Button>
        </Link>
      </div>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}
      
      {rooms.length === 0 ? (
        <div className={styles.empty}>
          <p>No rooms yet. Create your first room to get started!</p>
          <Link href="/rooms/new">
            <Button>Create First Room</Button>
          </Link>
        </div>
      ) : (
        <div className={styles.roomsGrid}>
          {rooms.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  )
}
