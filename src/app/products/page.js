'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './products.module.css'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState({ name: '', purchase_price: '', quantity: '' })
  const [message, setMessage] = useState({ text: '', type: '' })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const res = await fetch('/api/products')
    const data = await res.json()
    if (data.success) setProducts(data.products)
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage({ text: '', type: '' })

    const method = editingProduct ? 'PUT' : 'POST'
    const url = editingProduct
      ? `/api/products/${editingProduct.id}`
      : '/api/products'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        purchase_price: parseFloat(form.purchase_price),
        quantity: parseInt(form.quantity),
      }),
    })

    const data = await res.json()

    if (data.success) {
      setMessage({
        text: editingProduct ? 'Product updated successfully.' : 'Product added successfully.',
        type: 'success'
      })
      setForm({ name: '', purchase_price: '', quantity: '' })
      setShowForm(false)
      setEditingProduct(null)
      fetchProducts()
      setTimeout(() => setMessage({ text: '', type: '' }), 4000)
    } else {
      setMessage({ text: 'Error: ' + data.error, type: 'error' })
    }
  }

  function handleEdit(product) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      purchase_price: product.purchase_price,
      quantity: product.quantity,
    })
    setShowForm(true)
    setMessage({ text: '', type: '' })
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      setMessage({ text: 'Product deleted successfully.', type: 'success' })
      setDeleteConfirm(null)
      fetchProducts()
      setTimeout(() => setMessage({ text: '', type: '' }), 4000)
    }
  }

  function handleCancel() {
    setShowForm(false)
    setEditingProduct(null)
    setForm({ name: '', purchase_price: '', quantity: '' })
    setMessage({ text: '', type: '' })
  }

  function openAddForm() {
    setEditingProduct(null)
    setForm({ name: '', purchase_price: '', quantity: '' })
    setShowForm(true)
  }

  // Filter products based on search
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0)
  const totalValue = products.reduce((sum, p) => sum + p.purchase_price * p.quantity, 0)
  const lowStockCount = products.filter(p => p.quantity < 10).length

  return (
    <div className={styles.root}>

      {/* Sidebar accent */}
      <div className={styles.sideAccent} />

      <div className={styles.container}>
      
        {/* Top Bar */}
        <header className={styles.topBar}>
          <div className={styles.brand}>
            <span className={styles.brandDot} />
            <div>
              <p className={styles.brandLabel}>Point of Sale</p>
              <h1 className={styles.brandTitle}>Inventory</h1>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button 
                className={styles.clearSearch}
                onClick={() => setSearch('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className={styles.actionButtons}>
            {/* Back to Home Button */}
            <Link href="/" className={styles.backBtn}>
              <span className={styles.backIcon}>←</span>
              Home
            </Link>

            <button className={styles.addBtn} onClick={openAddForm}>
              <span className={styles.addBtnIcon}>＋</span>
              Add Product
            </button>
          </div>
        </header>

        {/* Stats Strip */}
        <div className={styles.statsStrip}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{products.length}</span>
            <span className={styles.statLabel}>Total Products</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statCard}>
            <span className={styles.statValue}>{totalStock.toLocaleString()}</span>
            <span className={styles.statLabel}>Units in Stock</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statCard}>
            <span className={styles.statValue}>Rs. {totalValue.toLocaleString()}</span>
            <span className={styles.statLabel}>Inventory Value</span>
          </div>
          <div className={styles.statDivider} />
          <div className={`${styles.statCard} ${lowStockCount > 0 ? styles.statCardWarn : ''}`}>
            <span className={styles.statValue}>{lowStockCount}</span>
            <span className={styles.statLabel}>Low Stock Alerts</span>
          </div>
        </div>

        {/* Toast Message */}
        {message.text && (
          <div className={`${styles.toast} ${message.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
            <span className={styles.toastIcon}>{message.type === 'error' ? '✕' : '✓'}</span>
            {message.text}
          </div>
        )}

        {/* Inline Form Panel */}
        {showForm && (
          <div className={styles.formPanel}>
            <div className={styles.formPanelHeader}>
              <div>
                <p className={styles.formPanelMeta}>{editingProduct ? 'Editing product' : 'New entry'}</p>
                <h2 className={styles.formPanelTitle}>{editingProduct ? 'Update Product' : 'Add Product'}</h2>
              </div>
              <button className={styles.closeBtn} onClick={handleCancel} aria-label="Close">✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Product Name</label>
                  <input
                    className={styles.fieldInput}
                    type="text"
                    placeholder="e.g. Plastic Glasses"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Purchase Price (Rs.)</label>
                  <input
                    className={styles.fieldInput}
                    type="number"
                    placeholder="e.g. 50"
                    value={form.purchase_price}
                    onChange={e => setForm({ ...form, purchase_price: e.target.value })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Quantity (Stock)</label>
                  <input
                    className={styles.fieldInput}
                    type="number"
                    placeholder="e.g. 100"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn}>
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
                  Discard
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table Section */}
        <div className={styles.tableSection}>
          <div className={styles.tableMeta}>
            <h2 className={styles.tableTitle}>Product Catalog</h2>
            <span className={styles.tableCount}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
              {search && ` (filtered)`}
            </span>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading inventory…</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <p className={styles.emptyTitle}>
                {search ? 'No matching products' : 'No products yet'}
              </p>
              <p className={styles.emptySubtitle}>
                {search 
                  ? `No products found matching "${search}"` 
                  : 'Click "Add Product" to get started.'}
              </p>
              {search && (
                <button 
                  className={styles.clearSearchBtn}
                  onClick={() => setSearch('')}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>#</th>
                    <th className={styles.th}>Product Name</th>
                    <th className={styles.th}>Purchase Price</th>
                    <th className={styles.th}>Stock</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Total Value</th>
                    <th className={`${styles.th} ${styles.thRight}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, idx) => (
                    <tr key={product.id} className={styles.tr}>
                      <td className={`${styles.td} ${styles.tdIdx}`}>{idx + 1}</td>
                      <td className={`${styles.td} ${styles.tdName}`}>{product.name}</td>
                      <td className={styles.td}>Rs. {parseFloat(product.purchase_price).toLocaleString()}</td>
                      <td className={styles.td}>
                        <span className={`${styles.badge} ${product.quantity === 0 ? styles.badgeOut : product.quantity < 10 ? styles.badgeLow : styles.badgeOk}`}>
                          {product.quantity < 10 && product.quantity > 0 && <span className={styles.badgeDot} />}
                          {product.quantity} units
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.statusPill} ${product.quantity === 0 ? styles.statusOut : product.quantity < 10 ? styles.statusLow : styles.statusIn}`}>
                          {product.quantity === 0 ? 'Out of Stock' : product.quantity < 10 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className={styles.td}>
                        Rs. {(product.purchase_price * product.quantity).toLocaleString()}
                      </td>
                      <td className={`${styles.td} ${styles.tdActions}`}>
                        <button className={styles.editBtn} onClick={() => handleEdit(product)}>Edit</button>
                        <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(product.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalIcon}>⚠</div>
            <h3 className={styles.modalTitle}>Delete Product?</h3>
            <p className={styles.modalBody}>This action cannot be undone. The product will be permanently removed from inventory.</p>
            <div className={styles.modalActions}>
              <button className={styles.modalDelete} onClick={() => handleDelete(deleteConfirm)}>Yes, Delete</button>
              <button className={styles.modalCancel} onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}