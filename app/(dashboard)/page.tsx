'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import styles from './page.module.css'

export default function DashboardPage() {
  // Demo data for now - will be replaced with real data once database is connected
  const totalBeds = 22
  const occupiedBeds = 13
  const availableBeds = 9
  const occupationRate = 59
  const todayBookings = 3
  const upcomingCheckIns = 2

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Welcome back! Here's your hostel overview</p>
      </div>

      <div className={styles.statsGrid}>
        <Card>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Occupation Rate</div>
            <div className={styles.statValue}>{occupationRate}%</div>
            <div className={styles.statDetail}>
              {occupiedBeds} of {totalBeds} beds occupied
            </div>
          </div>
        </Card>

        <Card>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Available Beds</div>
            <div className={styles.statValue}>{availableBeds}</div>
            <div className={styles.statDetail}>
              Ready for new guests
            </div>
          </div>
        </Card>

        <Card>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Active Bookings</div>
            <div className={styles.statValue}>{todayBookings}</div>
            <div className={styles.statDetail}>
              Currently in house
            </div>
          </div>
        </Card>

        <Card>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Upcoming Check-ins</div>
            <div className={styles.statValue}>{upcomingCheckIns}</div>
            <div className={styles.statDetail}>
              Next 7 days
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <Card className={styles.actionCard}>
            <div className={styles.actionIcon}>🛏️</div>
            <div className={styles.actionTitle}>View Rooms</div>
            <div className={styles.actionDescription}>Manage room availability</div>
          </Card>
          
          <Card className={styles.actionCard}>
            <div className={styles.actionIcon}>📅</div>
            <div className={styles.actionTitle}>New Booking</div>
            <div className={styles.actionDescription}>Create a reservation</div>
          </Card>
          
          <Card className={styles.actionCard}>
            <div className={styles.actionIcon}>👥</div>
            <div className={styles.actionTitle}>View Bookings</div>
            <div className={styles.actionDescription}>See all reservations</div>
          </Card>
          
          <Card className={styles.actionCard}>
            <div className={styles.actionIcon}>✅</div>
            <div className={styles.actionTitle}>Check-in</div>
            <div className={styles.actionDescription}>Process guest arrival</div>
          </Card>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h2 className={styles.sectionTitle}>Recent Bookings</h2>
        <div className={styles.activityList}>
          <Card>
            <div className={styles.activityItem}>
              <div className={styles.activityInfo}>
                <div className={styles.activityName}>Demo Mode</div>
                <div className={styles.activityDetails}>
                  Connect your database to see real bookings
                </div>
              </div>
              <Badge variant="info">demo</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}