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
      // 1. Fetch categories and rules
      const categoriesResult = await client.query('SELECT id, name, rules FROM categories WHERE user_id = $1', [userId]);
      const categories = categoriesResult.rows;

      // 2. Fetch uncategorized transactions
      const transactionsResult = await client.query(
        `SELECT t.id, t.description FROM transactions t
         JOIN accounts a ON t.account_id = a.id
         WHERE a.user_id = $1 AND t.category_id IS NULL`,
        [userId]
      );
      const transactions = transactionsResult.rows;

      let categorizedCount = 0;
      await client.query('BEGIN');

      // 3. Apply rules
      for (const tx of transactions) {
        for (const cat of categories) {
          if (cat.rules && cat.rules.length > 0) {
            for (const rule of cat.rules) {
              const regex = new RegExp(rule, 'i');
              if (regex.test(tx.description)) {
                await client.query('UPDATE transactions SET category_id = $1 WHERE id = $2', [cat.id, tx.id]);
                categorizedCount++;
                // Move to the next transaction once a category is found
                break;
              }
            }
          }
          // If transaction is categorized, break from categories loop
          const txStatus = await client.query('SELECT category_id FROM transactions WHERE id = $1', [tx.id]);
          if (txStatus.rows[0].category_id) {
            break;
          }
        }
      }

      await client.query('COMMIT');

      return NextResponse.json({ message: `Successfully categorized ${categorizedCount} transactions.` });
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
      client.release();
    }
  } catch (error) {
    console.error('Error applying categorization rules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
