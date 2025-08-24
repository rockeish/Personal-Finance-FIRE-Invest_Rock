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
        SELECT date, net_worth
        FROM net_worth_snapshots
        WHERE user_id = $1
        ORDER BY date ASC;
      `;
      const result = await client.query(query, [userId]);

      const data = result.rows.map(row => ({
        date: new Date(row.date).toLocaleDateString(),
        value: parseFloat(row.net_worth)
      }));

      return NextResponse.json(data);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching net worth history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
