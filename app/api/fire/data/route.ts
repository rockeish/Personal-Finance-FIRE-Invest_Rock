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
      // Get portfolio value
      const portfolioQuery = `
        SELECT COALESCE(SUM(balance), 0) as value
        FROM accounts
        WHERE user_id = $1 AND type = 'investments';
      `;
      const portfolioResult = await client.query(portfolioQuery, [userId]);
      const portfolioValue = parseFloat(portfolioResult.rows[0].value);

      // Get monthly investment from settings
      const settingsQuery = 'SELECT monthly_investment FROM user_settings WHERE user_id = $1';
      const settingsResult = await client.query(settingsQuery, [userId]);
      const monthlyInvestment = settingsResult.rows.length > 0 ? parseFloat(settingsResult.rows[0].monthly_investment) : 0;

      return NextResponse.json({
        currentPortfolio: portfolioValue,
        monthlyInvestment: monthlyInvestment,
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching FIRE data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
