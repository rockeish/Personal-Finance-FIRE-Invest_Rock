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
      // Get data for the last 6 months
      const query = `
        SELECT
          to_char(t.date, 'YYYY-MM') as month,
          COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as expenses
        FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        WHERE a.user_id = $1
          AND t.date >= date_trunc('month', current_date - interval '5 months')
        GROUP BY month
        ORDER BY month ASC;
      `;
      const result = await client.query(query, [userId]);

      const data = result.rows.map(row => ({
        month: row.month,
        income: parseFloat(row.income),
        expenses: Math.abs(parseFloat(row.expenses))
      }));

      return NextResponse.json(data);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching cash flow data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
