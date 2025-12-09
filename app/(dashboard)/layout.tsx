import Link from 'next/link'
import styles from './layout.module.css'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <h1 className={styles.logo}>HostelPulse</h1>
          <div className={styles.navLinks}>
            <Link href="/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
            <Link href="/dashboard/rooms" className={styles.navLink}>
              Rooms
            </Link>
            <Link href="/dashboard/bookings" className={styles.navLink}>
              Bookings
            </Link>
          </div>
        </div>
      </nav>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
