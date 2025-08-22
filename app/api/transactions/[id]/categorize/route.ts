import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactionId = params.id;
    const { categoryId } = await req.json();

    if (!categoryId) {
      return NextResponse.json({ error: 'categoryId is required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Verify that the transaction belongs to the user
      const transactionCheck = await client.query(
        `SELECT a.user_id FROM transactions t
         JOIN accounts a ON t.account_id = a.id
         WHERE t.id = $1`,
        [transactionId]
      );

      if (transactionCheck.rows.length === 0 || transactionCheck.rows[0].user_id.toString() !== userId) {
        return NextResponse.json({ error: 'Transaction not found or access denied' }, { status: 404 });
      }

      // Verify that the category belongs to the user
      if (categoryId) {
        const categoryCheck = await client.query('SELECT user_id FROM categories WHERE id = $1', [categoryId]);
        if (categoryCheck.rows.length === 0 || categoryCheck.rows[0].user_id.toString() !== userId) {
            return NextResponse.json({ error: 'Category not found or access denied' }, { status: 404 });
        }
      }

      const query = `
        UPDATE transactions
        SET category_id = $1
        WHERE id = $2
        RETURNING *;
      `;
      await client.query(query, [categoryId, transactionId]);

      const resultQuery = `
        SELECT t.*, c.name as category_name
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = $1;
      `;
      const result = await client.query(resultQuery, [transactionId]);
      const updatedTransaction = result.rows[0];

      // Learn from this categorization for future suggestions
      if (updatedTransaction.description && categoryId) {
        const keywords = updatedTransaction.description.split(' ').filter(w => w.length > 3);
        const suggestionQuery = `
          INSERT INTO categorization_suggestions (user_id, description_keyword, category_id, confidence_score)
          VALUES ($1, $2, $3, 1)
          ON CONFLICT (user_id, description_keyword, category_id)
          DO UPDATE SET confidence_score = categorization_suggestions.confidence_score + 1;
        `;
        for (const keyword of keywords) {
          await client.query(suggestionQuery, [userId, keyword.toLowerCase(), categoryId]);
        }
      }

      return NextResponse.json(updatedTransaction);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error categorizing transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
