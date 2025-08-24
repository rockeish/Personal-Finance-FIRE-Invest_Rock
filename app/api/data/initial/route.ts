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
      const accountsPromise = client.query('SELECT * FROM accounts WHERE user_id = $1', [userId]);
      const transactionsPromise = client.query(
        `SELECT t.* FROM transactions t
         JOIN accounts a ON t.account_id = a.id
         WHERE a.user_id = $1`,
        [userId]
      );
      const categoriesPromise = client.query('SELECT * FROM categories WHERE user_id = $1', [userId]);
      const investmentsPromise = client.query('SELECT * FROM investments WHERE user_id = $1', [userId]);

      const [accountsResult, transactionsResult, categoriesResult, investmentsResult] = await Promise.all([
        accountsPromise,
        transactionsPromise,
        categoriesPromise,
        investmentsPromise,
      ]);

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const monthlySpendingQuery = `
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        WHERE a.user_id = $1
          AND to_char(t.date, 'YYYY-MM') = $2
          AND t.amount < 0;
      `;
      const monthlySpendingResult = await client.query(monthlySpendingQuery, [userId, currentMonth]);
      const totalSpent = Math.abs(parseFloat(monthlySpendingResult.rows[0].total));

      const initialData = {
        accounts: accountsResult.rows,
        transactions: transactionsResult.rows,
        categories: categoriesResult.rows,
        investments: investmentsResult.rows,
        kpis: {
          totalSpent,
        }
      };

      return NextResponse.json(initialData);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
