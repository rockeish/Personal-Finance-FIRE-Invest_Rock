import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const description = searchParams.get('description');

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const keywords = description.split(' ').filter(w => w.length > 3).map(k => k.toLowerCase());

    if (keywords.length === 0) {
      return NextResponse.json(null); // No suggestion
    }

    const client = await pool.connect();
    try {
      const query = `
        SELECT
          s.category_id,
          c.name as category_name,
          SUM(s.confidence_score) as total_score
        FROM categorization_suggestions s
        JOIN categories c ON s.category_id = c.id
        WHERE s.user_id = $1 AND s.description_keyword = ANY($2::varchar[])
        GROUP BY s.category_id, c.name
        ORDER BY total_score DESC
        LIMIT 1;
      `;
      const result = await client.query(query, [userId, keywords]);

      if (result.rows.length === 0) {
        return NextResponse.json(null); // No suggestion
      }

      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching category suggestion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
