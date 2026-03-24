// src/app/api/sales/route.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextResponse } from 'next/server'
import db from '../../../../database/db'

export async function POST(request) {
  try {
    const body = await request.json()
    const { items } = body
    // items = [{ product_id, name, quantity, selling_price, purchase_price }]

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Calculate totals
    let total_amount = 0
    let total_profit = 0

    for (const item of items) {
      total_amount += item.selling_price * item.quantity
      total_profit += (item.selling_price - item.purchase_price) * item.quantity
    }

    //  Manual transaction using save points (sql.js doesn't have built-in transactions)
    // We'll execute sequentially and rely on rollback on error
    
    let sale_id = null
    
    try {
      // Step 1: Insert sale record
      const saleResult = await db.run(
        'INSERT INTO sales (total_amount, total_profit) VALUES (?, ?)',
        [total_amount, total_profit]
      )
      sale_id = saleResult.lastInsertRowid

      // Step 2: Insert all sale items and update stock
      for (const item of items) {
        const profit = (item.selling_price - item.purchase_price) * item.quantity

        // Insert sale item
        await db.run(
          'INSERT INTO sale_items (sale_id, product_id, quantity, selling_price, profit) VALUES (?, ?, ?, ?, ?)',
          [sale_id, item.product_id, item.quantity, item.selling_price, profit]
        )

        // Update stock
        await db.run(
          'UPDATE products SET quantity = quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        )
      }

      // 🔥 Save database after successful transaction
      await db.saveDatabase()

      return NextResponse.json({ success: true, sale_id })
      
    } catch (error) {
      // If any error occurs, we need to manually rollback
      console.error('Transaction error:', error)
      
      // Try to delete the sale if it was created
      if (sale_id) {
        try {
          await db.run('DELETE FROM sale_items WHERE sale_id = ?', [sale_id])
          await db.run('DELETE FROM sales WHERE id = ?', [sale_id])
          
          // Restore stock for all items
          for (const item of items) {
            await db.run(
              'UPDATE products SET quantity = quantity + ? WHERE id = ?',
              [item.quantity, item.product_id]
            )
          }
          
          await db.saveDatabase()
        } catch (rollbackError) {
          console.error('Rollback error:', rollbackError)
        }
      }
      
      throw error
    }
    
  } catch (error) {
    console.error('SALE ERROR:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}