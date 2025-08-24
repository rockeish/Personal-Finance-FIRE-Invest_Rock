import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol, shares, purchase_price, purchase_date } = await req.json();
    if (!symbol || !shares) {
      return NextResponse.json({ error: 'Symbol and shares are required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO investments (user_id, symbol, shares, purchase_price, purchase_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const values = [userId, symbol, shares, purchase_price, purchase_date];
      const result = await client.query(query, values);
      return NextResponse.json(result.rows[0], { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
