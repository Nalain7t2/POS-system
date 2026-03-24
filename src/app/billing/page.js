// src/app/billing/page.js
'use client'
import { useState, useEffect } from 'react'
import styles from './billing.module.css'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BillingPage() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const res = await fetch('/api/products')
    const data = await res.json()
    if (data.success) setProducts(data.products)
  }

  function addToCart(product) {
    if (product.quantity <= 0) return
    const existing = cart.find(item => item.product_id === product.id)
    if (existing) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
      return
    }
    setCart([...cart, {
      product_id: product.id,
      name: product.name,
      purchase_price: product.purchase_price,
      quantity: 1,
      selling_price: '',
      stock: product.quantity,
    }])
  }

  function updateCartItem(product_id, field, value) {
    setCart(cart.map(item =>
      item.product_id === product_id
        ? { ...item, [field]: value }
        : item
    ))
  }

  function removeFromCart(product_id) {
    setCart(cart.filter(item => item.product_id !== product_id))
  }

  const total = cart.reduce((sum, item) => {
    const price = parseFloat(item.selling_price) || 0
    return sum + price * item.quantity
  }, 0)

  const profit = cart.reduce((sum, item) => {
    const selling = parseFloat(item.selling_price) || 0
    return sum + (selling - item.purchase_price) * item.quantity
  }, 0)

  async function handleCheckout() {
    setMessage({ text: '', type: '' })

    for (const item of cart) {
      if (!item.selling_price || parseFloat(item.selling_price) <= 0) {
        setMessage({ text: `Enter selling price for "${item.name}"`, type: 'error' })
        return
      }
      if (item.quantity > item.stock) {
        setMessage({ text: `Only ${item.stock} units available for "${item.name}"`, type: 'error' })
        return
      }
    }

    setLoading(true)

    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(item => ({
          ...item,
          selling_price: parseFloat(item.selling_price),
          quantity: parseInt(item.quantity),
        }))
      })
    })

    const data = await res.json()
    setLoading(false)

    if (data.success) {
      setMessage({ text: `Sale complete! Receipt #${data.sale_id}`, type: 'success' })
      setCart([])
      fetchProducts()
      router.push(`/receipt?id=${data.sale_id}`)
    } else {
      setMessage({ text: 'Error: ' + data.error, type: 'error' })
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className={styles.root}>
      <div className={styles.sideAccent} />

      <div className={styles.layout}>

        {/* ── LEFT: Products Panel ── */}
        <div className={styles.productsPanel}>

          {/* Header */}
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderTop}>
              <Link href="/" className={styles.backBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                Home
              </Link>
            </div>
            <p className={styles.panelEyebrow}>Point of Sale</p>
            <h1 className={styles.panelTitle}>Billing</h1>
          </div>

          {/* Toast */}
          {message.text && (
            <div className={`${styles.toast} ${message.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
              <span className={styles.toastIcon}>{message.type === 'error' ? '✕' : '✓'}</span>
              {message.text}
            </div>
          )}

          {/* Search */}
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* Count */}
          <div className={styles.productsMeta}>
            <span>{filteredProducts.length} products</span>
            {search && <span className={styles.searchTag}>"{search}"</span>}
          </div>

          {/* Product Grid */}
          <div className={styles.productGrid}>
            {filteredProducts.length === 0 ? (
              <div className={styles.noResults}>No products found</div>
            ) : (
              filteredProducts.map(product => {
                const inCart = cart.find(i => i.product_id === product.id)
                const isOut = product.quantity <= 0
                return (
                  <div
                    key={product.id}
                    className={`${styles.productCard} ${isOut ? styles.productCardOut : ''} ${inCart ? styles.productCardActive : ''}`}
                    onClick={() => addToCart(product)}
                  >
                    {inCart && (
                      <span className={styles.cartQtyBadge}>{inCart.quantity}</span>
                    )}
                    <div className={styles.productName}>{product.name}</div>
                    <div className={styles.productPrice}>Rs. {parseFloat(product.purchase_price).toLocaleString()}</div>
                    <div className={`${styles.productStock} ${isOut ? styles.productStockOut : product.quantity < 10 ? styles.productStockLow : ''}`}>
                      {isOut ? 'Out of stock' : `${product.quantity} in stock`}
                    </div>
                    {!isOut && (
                      <div className={styles.addHint}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Cart Panel ── */}
        <div className={styles.cartPanel}>

          <div className={styles.cartHeader}>
            <div>
              <p className={styles.panelEyebrow}>Current Order</p>
              <h2 className={styles.panelTitle}>Cart</h2>
            </div>
            {cart.length > 0 && (
              <span className={styles.cartCountBadge}>{cartCount} items</span>
            )}
          </div>

          {cart.length === 0 ? (
            <div className={styles.cartEmpty}>
              <div className={styles.cartEmptyIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <p className={styles.cartEmptyTitle}>Cart is empty</p>
              <p className={styles.cartEmptySubtitle}>Click a product on the left to add it.</p>
            </div>
          ) : (
            <div className={styles.cartBody}>

              {/* Cart Items */}
              <div className={styles.cartItems}>
                {cart.map(item => {
                  const lineTotal = (parseFloat(item.selling_price) || 0) * item.quantity
                  const lineProfit = ((parseFloat(item.selling_price) || 0) - item.purchase_price) * item.quantity
                  return (
                    <div key={item.product_id} className={styles.cartItem}>
                      <div className={styles.cartItemHeader}>
                        <span className={styles.cartItemName}>{item.name}</span>
                        <button
                          className={styles.removeBtn}
                          onClick={() => removeFromCart(item.product_id)}
                          aria-label="Remove"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>

                      <div className={styles.cartItemFields}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>Qty</label>
                          <input
                            className={styles.fieldInput}
                            type="number"
                            min="1"
                            max={item.stock}
                            value={item.quantity}
                            onChange={e => updateCartItem(item.product_id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className={`${styles.fieldGroup} ${styles.fieldGroupFlex}`}>
                          <label className={styles.fieldLabel}>Selling Price (Rs.)</label>
                          <input
                            className={`${styles.fieldInput} ${!item.selling_price ? styles.fieldInputEmpty : ''}`}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter price…"
                            value={item.selling_price}
                            onChange={e => updateCartItem(item.product_id, 'selling_price', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className={styles.cartItemFooter}>
                        <span className={styles.purchaseCost}>Cost: Rs. {item.purchase_price}</span>
                        <div className={styles.cartItemTotals}>
                          {lineTotal > 0 && (
                            <>
                              <span className={styles.lineTotal}>Rs. {lineTotal.toLocaleString()}</span>
                              <span className={`${styles.lineProfit} ${lineProfit < 0 ? styles.lineProfitNeg : ''}`}>
                                {lineProfit >= 0 ? '+' : ''}Rs. {lineProfit.toLocaleString()} profit
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Summary */}
              <div className={styles.cartSummary}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Subtotal</span>
                  <span className={styles.summaryValue}>Rs. {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Net Profit</span>
                  <span className={`${styles.summaryValue} ${profit < 0 ? styles.summaryValueRed : styles.summaryValueGreen}`}>
                    {profit >= 0 ? '+' : ''}Rs. {profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={styles.summaryDivider} />
                <div className={`${styles.summaryRow} ${styles.summaryRowTotal}`}>
                  <span>Total</span>
                  <span>Rs. {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Checkout */}
              <button
                className={styles.checkoutBtn}
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
              >
                {loading ? (
                  <>
                    <span className={styles.checkoutSpinner} />
                    Processing…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Complete Sale
                  </>
                )}
              </button>

              <button
                className={styles.clearBtn}
                onClick={() => setCart([])}
                disabled={loading}
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}