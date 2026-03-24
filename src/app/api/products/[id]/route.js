export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextResponse } from 'next/server'
import db from '../../../../../database/db'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, purchase_price, quantity } = body

    if (!name || !purchase_price || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    //  Async update
    await db.run(
      'UPDATE products SET name = ?, purchase_price = ?, quantity = ? WHERE id = ?',
      [name, parseFloat(purchase_price), parseInt(quantity), id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT ERROR:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    
    //  Async delete
    await db.run('DELETE FROM products WHERE id = ?', [id])
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE ERROR:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}