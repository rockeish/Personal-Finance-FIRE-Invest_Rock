import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      const query = `
        SELECT DISTINCT to_char(t.date, 'YYYY-MM') as month
        FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        WHERE a.user_id = $1
        ORDER BY month DESC;
      `;
      const result = await client.query(query, [userId]);
      const months = result.rows.map(row => row.month);
      return NextResponse.json(months);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching transaction months:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
