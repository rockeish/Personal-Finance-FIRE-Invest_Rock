import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      // We need to delete transactions that belong to the user.
      // We can do this by finding all accounts for the user and then deleting transactions for those accounts.
      const deleteQuery = `
        DELETE FROM transactions
        WHERE account_id IN (SELECT id FROM accounts WHERE user_id = $1)
      `;
      await client.query(deleteQuery, [userId]);

      return NextResponse.json({ message: 'All transactions cleared successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error clearing transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
