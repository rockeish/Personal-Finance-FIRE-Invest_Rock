import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transactions, accountId } = await req.json();

    if (!Array.isArray(transactions) || !accountId) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // TODO: We should also verify that the accountId belongs to the user.

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO transactions (account_id, description, amount, date)
        VALUES ($1, $2, $3, $4)
      `;

      for (const tx of transactions) {
        // Normalize the transaction data from the CSV
        const description = tx.Description || tx.description || tx.memo || tx.Name || '';
        const amount = parseFloat(tx.Amount || tx.amount || 0);
        const date = new Date(tx.Date || tx.date || tx.posted);

        if (!description || isNaN(amount) || isNaN(date.getTime())) {
          console.warn('Skipping invalid transaction row:', tx);
          continue;
        }

        await client.query(insertQuery, [accountId, description, amount, date.toISOString().split('T')[0]]);
      }

      await client.query('COMMIT');

      return NextResponse.json({ message: 'Transactions imported successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Transaction import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
