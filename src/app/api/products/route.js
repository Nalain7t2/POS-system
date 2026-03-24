export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextResponse } from 'next/server'
import db from '../../../../database/db'

export async function GET() {
  try {
    const products = await db.query('SELECT * FROM products ORDER BY created_at DESC')
    return NextResponse.json({ success: true, products })
  } catch (error) {
    console.error('GET ERROR:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('POST body:', body)
    const { name, purchase_price, quantity } = body

    if (!name || !purchase_price || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    const result = await db.run(
      'INSERT INTO products (name, purchase_price, quantity) VALUES (?, ?, ?)',
      [name, parseFloat(purchase_price), parseInt(quantity)]
    )
    
    return NextResponse.json({ success: true, id: result.lastInsertRowid })
  } catch (error) {
    console.error('POST ERROR:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}