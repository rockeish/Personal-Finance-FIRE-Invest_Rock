import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // YYYY-MM

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'Invalid month format. Use YYYY-MM' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const query = `
        SELECT c.name as category, COALESCE(SUM(t.amount), 0) as amount
        FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE a.user_id = $1
          AND to_char(t.date, 'YYYY-MM') = $2
          AND t.amount < 0
        GROUP BY c.name
        ORDER BY amount ASC;
      `;
      const result = await client.query(query, [userId, month]);

      // The query returns negative amounts, so we need to make them positive
      const data = result.rows.map(row => ({
        category: row.category || 'Uncategorized',
        amount: Math.abs(parseFloat(row.amount))
      }));

      return NextResponse.json(data);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching monthly spending data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
