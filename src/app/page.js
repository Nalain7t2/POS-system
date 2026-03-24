import Link from 'next/link'
import { Suspense } from 'react'
import styles from './home.module.css'

function HomeLoading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <div className={styles.container}>

        {/* Decorative background grid */}
        <div className={styles.bgGrid} />
        <div className={styles.bgGlow} />

        {/* Left accent bar */}
        <div className={styles.sideAccent} />

        <div className={styles.content}>

          {/* Header */}
          <header className={styles.header}>
            <div className={styles.logoMark}>
              <span className={styles.logoInner}>POS</span>
            </div>
            <div className={styles.headerText}>
              <p className={styles.headerEyebrow}>Point of Sale System</p>
              <h1 className={styles.title}>
                Welcome back<span className={styles.titleDot}>.</span>
              </h1>
              <p className={styles.subtitle}>
                What would you like to manage today?
              </p>
            </div>
            <div className={styles.dateChip}>
              {new Date().toLocaleDateString('en-PK', {
                weekday: 'short',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </header>

          {/* Nav Cards */}
          <nav className={styles.nav}>
            <Link href="/products" className={`${styles.navCard} ${styles.navInventory}`} prefetch={true}>
              <div className={styles.cardTop}>
                <span className={styles.cardIconWrap} data-color="amber">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </span>
                <span className={styles.cardArrow}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </div>
              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>Inventory</h2>
                <p className={styles.cardDesc}>Manage products, stock levels & pricing</p>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.cardTag}>Products · Stock · Pricing</span>
              </div>
            </Link>

            <Link href="/billing" className={`${styles.navCard} ${styles.navBilling}`} prefetch={true}>
              <div className={styles.cardTop}>
                <span className={styles.cardIconWrap} data-color="slate">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </span>
                <span className={styles.cardArrow}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </div>
              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>Billing</h2>
                <p className={styles.cardDesc}>Create invoices, receipts & manage sales</p>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.cardTag}>Invoices · Receipts · Sales</span>
              </div>
            </Link>

            <Link href="/dashboard" className={`${styles.navCard} ${styles.navDashboard}`} prefetch={true}>
              <div className={styles.cardTop}>
                <span className={styles.cardIconWrap} data-color="green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </span>
                <span className={styles.cardArrow}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </div>
              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>Dashboard</h2>
                <p className={styles.cardDesc}>Analytics, reports & business overview</p>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.cardTag}>Analytics · Reports · Insights</span>
              </div>
            </Link>
          </nav>

          {/* Quick Actions */}
          <div className={styles.quickSection}>
            <p className={styles.quickLabel}>Quick Actions</p>
            <div className={styles.quickActions}>
              <Link href="/billing" className={styles.quickBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                Quick Sale
              </Link>
              <Link href="/dashboard" className={styles.quickBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Today's Report
              </Link>
              <Link href="/products" className={styles.quickBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Search Stock
              </Link>
            </div>
          </div>

        </div>
      </div>
    </Suspense>
  )
}