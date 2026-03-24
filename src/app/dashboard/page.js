'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './dashboard.module.css'

const PRESETS = [
  { label: 'Today',        getValue: () => { const d = today(); return { start: d, end: d } } },
  { label: 'Yesterday',    getValue: () => { const d = daysAgo(1); return { start: d, end: d } } },
  { label: 'This Week',    getValue: () => ({ start: startOfWeek(), end: today() }) },
  { label: 'Last Week',    getValue: () => ({ start: startOfLastWeek(), end: endOfLastWeek() }) },
  { label: 'This Month',   getValue: () => ({ start: startOfMonth(), end: today() }) },
  { label: 'Last Month',   getValue: () => ({ start: startOfLastMonth(), end: endOfLastMonth() }) },
  { label: 'Last 3 Months',getValue: () => ({ start: daysAgo(90), end: today() }) },
]

function today() { return new Date().toISOString().split('T')[0] }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0] }
function startOfWeek() { const d = new Date(); const day = d.getDay(); d.setDate(d.getDate() - day + (day === 0 ? -6 : 1)); return d.toISOString().split('T')[0] }
function startOfLastWeek() { const d = new Date(); const day = d.getDay(); d.setDate(d.getDate() - day + (day === 0 ? -6 : 1) - 7); return d.toISOString().split('T')[0] }
function endOfLastWeek() { const d = new Date(); const day = d.getDay(); d.setDate(d.getDate() - day + (day === 0 ? 0 : 0) - 1); return d.toISOString().split('T')[0] }
function startOfMonth() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01` }
function startOfLastMonth() { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.toISOString().split('T')[0] }
function endOfLastMonth() { const d = new Date(); d.setDate(0); return d.toISOString().split('T')[0] }

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePreset, setActivePreset] = useState('Today')
  const [startDate, setStartDate] = useState(today())
  const [endDate, setEndDate] = useState(today())
  const [customStart, setCustomStart] = useState(today())
  const [customEnd, setCustomEnd] = useState(today())

  useEffect(() => { fetchDashboard(startDate, endDate) }, [startDate, endDate])

  async function fetchDashboard(start, end) {
    setLoading(true)
    const res = await fetch(`/api/dashboard?start=${start}&end=${end}`)
    const result = await res.json()
    if (result.success) setData(result)
    setLoading(false)
  }

  function applyPreset(preset) {
    const { start, end } = preset.getValue()
    setActivePreset(preset.label)
    setCustomStart(start)
    setCustomEnd(end)
    setStartDate(start)
    setEndDate(end)
  }

  function applyCustom() {
    setActivePreset('')
    setStartDate(customStart)
    setEndDate(customEnd)
  }

  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })
  }

  function formatDateShort(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric' })
  }

  function formatRangeLabel() {
    if (startDate === endDate) {
      return new Date(startDate).toLocaleDateString('en-PK', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
    }
    return `${formatDate(startDate)} — ${formatDate(endDate)}`
  }

  const maxSales = data ? Math.max(...data.dailyBreakdown.map(d => d.sales || 0), 1) : 1
  const profitMargin = data && data.summary.total_sales > 0
    ? ((data.summary.total_profit / data.summary.total_sales) * 100).toFixed(1)
    : '0.0'

  return (
    <div className={styles.root}>
      <div className={styles.sideAccent} />

      <div className={styles.container}>

        {/* Top Bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <Link href="/" className={styles.backBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Home
            </Link>
            <span className={styles.breadcrumb}>/ Dashboard</span>
          </div>
          <div className={styles.topBarRight}>
            <span className={styles.rangeChip}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {data ? formatRangeLabel() : '—'}
            </span>
            <Link href="/billing" className={styles.newSaleBtn}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Sale
            </Link>
          </div>
        </header>

        {/* Page Heading */}
        <div className={styles.pageHeader}>
          <p className={styles.pageEyebrow}>Point of Sale</p>
          <h1 className={styles.pageTitle}>Dashboard</h1>
        </div>

        {/* Filter Bar */}
        <div className={styles.filterCard}>
          <div className={styles.filterTop}>
            <span className={styles.filterLabel}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Date Range
            </span>
            <div className={styles.presetBtns}>
              {PRESETS.map(preset => (
                <button
                  key={preset.label}
                  className={`${styles.presetBtn} ${activePreset === preset.label ? styles.presetBtnActive : ''}`}
                  onClick={() => applyPreset(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterBottom}>
            <div className={styles.filterDivider} />
            <div className={styles.customRange}>
              <span className={styles.customLabel}>Custom</span>
              <input
                type="date"
                className={styles.dateInput}
                value={customStart}
                max={customEnd}
                onChange={e => setCustomStart(e.target.value)}
              />
              <span className={styles.dateSep}>→</span>
              <input
                type="date"
                className={styles.dateInput}
                value={customEnd}
                min={customStart}
                max={today()}
                onChange={e => setCustomEnd(e.target.value)}
              />
              <button className={styles.applyBtn} onClick={applyCustom}>Apply</button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading data…</p>
          </div>
        ) : !data ? (
          <div className={styles.loadingState}>
            <p>No data available.</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.statCardAccent}`}>
                <div className={styles.statCardTop}>
                  <span className={styles.statIcon} data-type="sales">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </span>
                  <span className={styles.statTrend}>{activePreset || 'Custom'}</span>
                </div>
                <div className={styles.statValue}>Rs. {Number(data.summary.total_sales).toLocaleString()}</div>
                <div className={styles.statLabel}>Total Sales</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statCardTop}>
                  <span className={styles.statIcon} data-type="profit">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                    </svg>
                  </span>
                  <span className={styles.statTrendGreen}>{profitMargin}% margin</span>
                </div>
                <div className={styles.statValue}>Rs. {Number(data.summary.total_profit).toLocaleString()}</div>
                <div className={styles.statLabel}>Net Profit</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statCardTop}>
                  <span className={styles.statIcon} data-type="orders">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </span>
                  <span className={styles.statTrend}>Receipts</span>
                </div>
                <div className={styles.statValue}>{data.summary.total_orders}</div>
                <div className={styles.statLabel}>Total Orders</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statCardTop}>
                  <span className={styles.statIcon} data-type="inventory">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  </span>
                  <span className={styles.statTrend}>In catalog</span>
                </div>
                <div className={styles.statValue}>{data.inventory.total_products}</div>
                <div className={styles.statLabel}>Total Products</div>
              </div>
            </div>

            {/* Daily Chart */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Daily Sales</h2>
                <span className={styles.panelMeta}>{data.dailyBreakdown.length} days</span>
              </div>
              {data.dailyBreakdown.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyTitle}>No sales in this period</p>
                </div>
              ) : (
                <div className={styles.chartArea}>
                  <div className={styles.chartBars} style={{ gridTemplateColumns: `repeat(${data.dailyBreakdown.length}, 1fr)` }}>
                    {data.dailyBreakdown.map((day, index) => {
                      const heightPct = (day.sales / maxSales) * 100
                      const isToday = day.date === today()
                      return (
                        <div key={index} className={styles.chartCol}>
                          <div className={styles.barValueLabel}>
                            {day.sales > 0 ? Number(day.sales).toLocaleString() : '—'}
                          </div>
                          <div className={styles.barTrack}>
                            <div
                              className={`${styles.barFill} ${isToday ? styles.barFillToday : ''}`}
                              style={{ height: `${Math.max(heightPct, day.sales > 0 ? 4 : 0)}%` }}
                            />
                          </div>
                          <div className={`${styles.barDateLabel} ${isToday ? styles.barDateToday : ''}`}>
                            {formatDateShort(day.date)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Two Column */}
            <div className={styles.twoCol}>

              {/* Sales List */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>Sales</h2>
                  <span className={styles.panelMeta}>{data.salesList.length} receipts</span>
                </div>
                {data.salesList.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyTitle}>No sales in this period</p>
                    <p className={styles.emptySubtitle}>Try a different date range.</p>
                  </div>
                ) : (
                  <div className={styles.saleList}>
                    {data.salesList.map(sale => (
                      <div
                        key={sale.id}
                        className={styles.saleRow}
                        onClick={() => router.push(`/receipt?id=${sale.id}`)}
                      >
                        <div className={styles.saleLeft}>
                          <div className={styles.saleId}>Receipt #{sale.id}</div>
                          <div className={styles.saleMeta}>
                            {formatDate(sale.created_at)} · {formatTime(sale.created_at)} · {sale.items_count} items
                          </div>
                        </div>
                        <div className={styles.saleRight}>
                          <div className={styles.saleAmount}>Rs. {Number(sale.total_amount).toLocaleString()}</div>
                          <div className={styles.saleProfit}>+Rs. {Number(sale.total_profit).toLocaleString()}</div>
                        </div>
                        <div className={styles.saleChevron}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Products */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>Top Products</h2>
                  <span className={styles.panelMeta}>{data.topProducts.length} items</span>
                </div>
                {data.topProducts.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyTitle}>No sales in this period</p>
                    <p className={styles.emptySubtitle}>Try a different date range.</p>
                  </div>
                ) : (
                  <div className={styles.topProductList}>
                    {data.topProducts.map((product, idx) => (
                      <div key={idx} className={styles.topProductRow}>
                        <span className={styles.topProductRank}>{idx + 1}</span>
                        <div className={styles.topProductInfo}>
                          <span className={styles.topProductName}>{product.name}</span>
                          <span className={styles.topProductQty}>{product.total_qty} units sold</span>
                        </div>
                        <span className={styles.topProductRevenue}>
                          Rs. {Number(product.total_revenue).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Low Stock */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Low Stock Alert</h2>
                <span className={`${styles.panelMeta} ${data.lowStock.length > 0 ? styles.panelMetaWarn : ''}`}>
                  {data.lowStock.length} alerts
                </span>
              </div>
              {data.lowStock.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyCheckIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <p className={styles.emptyTitle}>All stock levels healthy</p>
                  <p className={styles.emptySubtitle}>No products are running low.</p>
                </div>
              ) : (
                <div className={styles.stockGrid}>
                  {data.lowStock.map(product => (
                    <div key={product.id} className={styles.stockRow}>
                      <div className={styles.stockInfo}>
                        <span className={styles.stockDot} />
                        <span className={styles.stockName}>{product.name}</span>
                      </div>
                      <span className={`${styles.stockBadge} ${product.quantity === 0 ? styles.stockBadgeOut : styles.stockBadgeLow}`}>
                        {product.quantity === 0 ? 'Out of Stock' : `${product.quantity} left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {data.lowStock.length > 0 && (
                <div className={styles.panelFooter}>
                  <Link href="/products" className={styles.panelFooterLink}>Manage Inventory →</Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}