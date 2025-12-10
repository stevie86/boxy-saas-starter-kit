import { RoomCard } from '@/components/rooms/RoomCard'
import { Button } from '@/components/ui/Button'
import { getRooms } from '@/lib/queries/rooms'
import { mockRooms } from '@/lib/mock-data'
import styles from './page.module.css'
import Link from 'next/link'

export default async function RoomsPage() {
  // Try to get real data, fall back to mock data if database isn't available
  let rooms = mockRooms
  let error = null
  
  // Skip database calls during build
  if (typeof window !== 'undefined' || process.env.VERCEL_ENV) {
    try {
      const realRooms = await getRooms('demo-property-123')
      if (realRooms && realRooms.length > 0) {
        rooms = realRooms.map(room => ({
          id: room.id,
          name: room.name,
          beds: room.beds,
          occupiedBeds: room.occupiedBeds,
          type: room.type
        }))
      }
    } catch (e) {
      error = 'Database not connected - using demo data'
      console.log('Using mock data:', e)
    }
  }

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
