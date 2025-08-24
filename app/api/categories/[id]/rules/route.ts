import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categoryId = params.id;
    const { rule } = await req.json();

    if (!rule) {
      return NextResponse.json({ error: 'Rule is required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Verify that the category belongs to the user
      const categoryCheck = await client.query('SELECT user_id FROM categories WHERE id = $1', [categoryId]);
      if (categoryCheck.rows.length === 0 || categoryCheck.rows[0].user_id.toString() !== userId) {
        return NextResponse.json({ error: 'Category not found or access denied' }, { status: 404 });
      }

      const query = `
        UPDATE categories
        SET rules = array_append(rules, $1)
        WHERE id = $2
        RETURNING *;
      `;
      const result = await client.query(query, [rule, categoryId]);
      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error adding category rule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
