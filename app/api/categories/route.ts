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
      const query = 'SELECT * FROM categories WHERE user_id = $1 ORDER BY name';
      const result = await client.query(query, [userId]);
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
      const userId = req.headers.get('x-user-id');
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { name, planned_amount } = await req.json();
      if (!name) {
        return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
      }

      const client = await pool.connect();
      try {
        const query = 'INSERT INTO categories (user_id, name, planned_amount) VALUES ($1, $2, $3) RETURNING *';
        const result = await client.query(query, [userId, name, planned_amount || 0]);
        return NextResponse.json(result.rows[0], { status: 201 });
      } catch (error) {
        if (error.code === '23505') { // unique_violation
            return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
        }
        throw error;
      }
      finally {
        client.release();
      }
    } catch (error) {
      console.error('Error creating category:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
