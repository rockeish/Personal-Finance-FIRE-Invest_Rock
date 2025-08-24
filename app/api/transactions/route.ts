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
        SELECT t.*, c.name as category_name
        FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE a.user_id = $1
          AND to_char(t.date, 'YYYY-MM') = $2
        ORDER BY t.date DESC;
      `;
      const result = await client.query(query, [userId, month]);
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
