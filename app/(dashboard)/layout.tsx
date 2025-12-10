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
          <Link href="/" className={styles.logoLink}>
            <h1 className={styles.logo}>HostelPulse</h1>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>
              <span className={styles.navIcon}>📊</span>
              Dashboard
            </Link>
            <Link href="/rooms" className={styles.navLink}>
              <span className={styles.navIcon}>🛏️</span>
              Rooms
            </Link>
            <Link href="/bookings" className={styles.navLink}>
              <span className={styles.navIcon}>📅</span>
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
