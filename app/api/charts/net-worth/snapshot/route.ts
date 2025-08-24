import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      // Calculate current net worth
      const netWorthQuery = `
        SELECT
          COALESCE(SUM(CASE WHEN type = 'cash' THEN balance ELSE 0 END), 0) +
          COALESCE(SUM(CASE WHEN type = 'investments' THEN balance ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN type = 'debt' THEN balance ELSE 0 END), 0) as net_worth
        FROM accounts
        WHERE user_id = $1;
      `;
      const netWorthResult = await client.query(netWorthQuery, [userId]);
      const netWorth = netWorthResult.rows[0].net_worth;

      const today = new Date().toISOString().slice(0, 10);

      // Store snapshot
      const insertQuery = `
        INSERT INTO net_worth_snapshots (user_id, date, net_worth)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, date) DO UPDATE SET net_worth = EXCLUDED.net_worth
        RETURNING *;
      `;
      const result = await client.query(insertQuery, [userId, today, netWorth]);

      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating net worth snapshot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
