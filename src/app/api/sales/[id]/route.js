export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextResponse } from 'next/server'
import db from '../../../../../database/db'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const sale = await db.get('SELECT * FROM sales WHERE id = ?', [id])

    if (!sale) {
      return NextResponse.json(
        { success: false, error: 'Sale not found' },
        { status: 404 }
      )
    }

    const items = await db.query(`
      SELECT 
        si.quantity,
        si.selling_price,
        si.profit,
        p.name,
        p.purchase_price,
        si.product_id
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `, [id])

    return NextResponse.json({ success: true, sale, items })
  } catch (error) {
    console.error('GET SALE ERROR:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE a sale and restore stock
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    // First, get all items in this sale to restore stock
    const items = await db.query(`
      SELECT product_id, quantity FROM sale_items WHERE sale_id = ?
    `, [id])

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sale not found or already deleted' },
        { status: 404 }
      )
    }

    // Restore stock for each product
    for (const item of items) {
      await db.run(
        'UPDATE products SET quantity = quantity + ? WHERE id = ?',
        [item.quantity, item.product_id]
      )
    }

    // Delete sale items
    await db.run('DELETE FROM sale_items WHERE sale_id = ?', [id])

    // Delete the sale
    await db.run('DELETE FROM sales WHERE id = ?', [id])

    // Save database
    await db.saveDatabase()

    return NextResponse.json({ success: true, message: 'Sale deleted successfully' })
  } catch (error) {
    console.error('DELETE SALE ERROR:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}