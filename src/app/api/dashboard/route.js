export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextResponse } from 'next/server'
import db from '../../../../database/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const today = new Date().toISOString().split('T')[0]
    const startDate = searchParams.get('start') || today
    const endDate = searchParams.get('end') || today

    const [
      summary,
      salesList,
      dailyBreakdown,
      topProducts,
      lowStock,
      inventory
    ] = await Promise.all([
      // Selected range summary
      db.get(`
        SELECT 
          COUNT(*) as total_orders,
          COALESCE(SUM(total_amount), 0) as total_sales,
          COALESCE(SUM(total_profit), 0) as total_profit
        FROM sales
        WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?
      `, [startDate, endDate]),

      // Selected range sales list
      db.query(`
        SELECT 
          s.id,
          s.total_amount,
          s.total_profit,
          s.created_at,
          COUNT(si.id) as items_count
        FROM sales s
        LEFT JOIN sale_items si ON s.id = si.sale_id
        WHERE DATE(s.created_at) >= ? AND DATE(s.created_at) <= ?
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `, [startDate, endDate]),

      // Selected range every day breakdown (for chart)
      db.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as orders,
          COALESCE(SUM(total_amount), 0) as sales,
          COALESCE(SUM(total_profit), 0) as profit
        FROM sales
        WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [startDate, endDate]),

      // Best selling products in range
      db.query(`
        SELECT 
          p.name,
          SUM(si.quantity) as total_qty,
          SUM(si.selling_price * si.quantity) as total_revenue
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE DATE(s.created_at) >= ? AND DATE(s.created_at) <= ?
        GROUP BY si.product_id
        ORDER BY total_qty DESC
        LIMIT 5
      `, [startDate, endDate]),

      // Low stock
      db.query(`
        SELECT id, name, quantity
        FROM products
        WHERE quantity < 10
        ORDER BY quantity ASC
      `),

      // Inventory count
      db.get(`
        SELECT COUNT(*) as total_products FROM products
      `)
    ]);

    return NextResponse.json({
      success: true,
      summary,
      salesList,
      dailyBreakdown,
      topProducts,
      lowStock,
      inventory,
      startDate,
      endDate,
    });
  } catch (error) {
    console.error('DASHBOARD ERROR:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}