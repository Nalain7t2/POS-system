'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './receipt.module.css'

export default function ReceiptContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const saleId = searchParams.get('id')

  const [sale, setSale] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false) // 🔥 Modal state

  useEffect(() => {
    if (saleId) fetchReceipt()
  }, [saleId])

  async function fetchReceipt() {
    const res = await fetch(`/api/sales/${saleId}`)
    const data = await res.json()
    if (data.success) {
      setSale(data.sale)
      setItems(data.items)
    } else {
      setError(data.error)
    }
    setLoading(false)
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/sales/${saleId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setShowDeleteModal(false)
        router.push('/dashboard')
      } else {
        alert('❌ Error: ' + data.error)
        setDeleting(false)
        setShowDeleteModal(false)
      }
    } catch (error) {
      alert('❌ Failed to delete receipt')
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.sideAccent} />
        <div className={styles.loadingInner}>
          <div className={styles.spinner} />
          <p>Loading receipt…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.sideAccent} />
        <p className={styles.errorText}>Error: {error}</p>
      </div>
    )
  }

  if (!sale) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.sideAccent} />
        <p className={styles.errorText}>Receipt not found.</p>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.sideAccent} />

      {/* Action Bar */}
      <div className={styles.actionBar}>
        <div className={styles.actionLeft}>
          <Link href="/dashboard" className={styles.backBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Dashboard
          </Link>
          <span className={styles.breadcrumb}>/ Receipt #{sale.id}</span>
        </div>
        <div className={styles.actionRight}>
          <button 
            className={styles.deleteBtn} 
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
          >
            {deleting ? (
              <>⌛ Deleting...</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                Delete Receipt
              </>
            )}
          </button>
          <button className={styles.printBtn} onClick={handlePrint}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print Receipt
          </button>
        </div>
      </div>

      {/* Receipt Card */}
      <div className={styles.receiptWrap}>
        <div className={styles.receiptCard}>
          {/* Shop Header */}
          <div className={styles.receiptHeader}>
            <div className={styles.shopLogoMark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <h1 className={styles.shopName}>Abdul Satar</h1>
            <p className={styles.shopTagline}>Disposable Shop</p>
            <div className={styles.headerDivider} />
            <div className={styles.receiptMeta}>
              <div className={styles.receiptMetaRow}>
                <span className={styles.metaKey}>Receipt No.</span>
                <span className={styles.metaVal}>#{String(sale.id).padStart(4, '0')}</span>
              </div>
              <div className={styles.receiptMetaRow}>
                <span className={styles.metaKey}>Date & Time</span>
                <span className={styles.metaVal}>{formatDate(sale.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className={styles.itemsSection}>
            <div className={styles.itemsHeader}>
              <span className={styles.colItem}>Item</span>
              <span className={styles.colQty}>Qty</span>
              <span className={styles.colPrice}>Unit Price</span>
              <span className={styles.colTotal}>Amount</span>
            </div>

            <div className={styles.itemsBody}>
              {items.map((item, index) => (
                <div key={index} className={styles.itemRow}>
                  <div className={styles.colItem}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemSub}>Cost: Rs. {parseFloat(item.purchase_price).toLocaleString()}</span>
                  </div>
                  <span className={styles.colQty}>{item.quantity}</span>
                  <span className={styles.colPrice}>Rs. {parseFloat(item.selling_price).toLocaleString()}</span>
                  <span className={styles.colTotal}>Rs. {(item.selling_price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className={styles.totalsSection}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total Items</span>
              <span className={styles.totalVal}>{items.length} products · {totalQty} units</span>
            </div>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Net Profit</span>
              <span className={styles.totalValGreen}>Rs. {parseFloat(sale.total_profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className={styles.totalDivider} />
            <div className={`${styles.totalRow} ${styles.totalRowGrand}`}>
              <span>Grand Total</span>
              <span>Rs. {parseFloat(sale.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.receiptFooter}>
            <div className={styles.footerDots}>
              <span /><span /><span /><span /><span />
            </div>
            <p className={styles.footerThanks}>Thank you for your purchase!</p>
            <p className={styles.footerSub}>Please visit us again</p>
            <p className={styles.footerReceiptId}>#{String(sale.id).padStart(4, '0')}</p>
          </div>
        </div>
      </div>

      {/* 🔥 Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalIcon}>⚠️</div>
            <h3 className={styles.modalTitle}>Delete Receipt?</h3>
            <p className={styles.modalBody}>
              This action will:<br/>
              • Remove this sale from records<br/>
              • Restore product stock<br/>
              • Cannot be undone!
            </p>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalDelete} 
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button 
                className={styles.modalCancel} 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}