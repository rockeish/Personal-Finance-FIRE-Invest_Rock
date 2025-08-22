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
      const query = 'SELECT * FROM user_settings WHERE user_id = $1';
      const result = await client.query(query, [userId]);

      if (result.rows.length === 0) {
        // If no settings found, create default settings for the user
        const insertQuery = 'INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *';
        const insertResult = await client.query(insertQuery, [userId]);
        return NextResponse.json(insertResult.rows[0]);
      }

      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
      const userId = req.headers.get('x-user-id');
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const settings = await req.json();

      const client = await pool.connect();
      try {
        const query = `
            INSERT INTO user_settings (user_id, currency, locale, monthly_income, monthly_investment, withdrawal_rate, enable_rollover)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (user_id) DO UPDATE SET
                currency = EXCLUDED.currency,
                locale = EXCLUDED.locale,
                monthly_income = EXCLUDED.monthly_income,
                monthly_investment = EXCLUDED.monthly_investment,
                withdrawal_rate = EXCLUDED.withdrawal_rate,
                enable_rollover = EXCLUDED.enable_rollover
            RETURNING *;
        `;
        const values = [
            userId,
            settings.currency,
            settings.locale,
            settings.monthly_income,
            settings.monthly_investment,
            settings.withdrawal_rate,
            settings.enable_rollover,
        ];
        const result = await client.query(query, values);
        return NextResponse.json(result.rows[0]);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
