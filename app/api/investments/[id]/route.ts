import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

async function verifyOwnership(client, userId, investmentId) {
    const ownershipCheck = await client.query('SELECT user_id FROM investments WHERE id = $1', [investmentId]);
    if (ownershipCheck.rows.length === 0 || ownershipCheck.rows[0].user_id.toString() !== userId) {
      return false;
    }
    return true;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const investmentId = params.id;
        const { symbol, shares, purchase_price, purchase_date } = await req.json();

        const client = await pool.connect();
        try {
            if (!await verifyOwnership(client, userId, investmentId)) {
                return NextResponse.json({ error: 'Investment not found or access denied' }, { status: 404 });
            }

            const query = `
                UPDATE investments
                SET symbol = $1, shares = $2, purchase_price = $3, purchase_date = $4
                WHERE id = $5
                RETURNING *;
            `;
            const values = [symbol, shares, purchase_price, purchase_date, investmentId];
            const result = await client.query(query, values);
            return NextResponse.json(result.rows[0]);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error updating investment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const investmentId = params.id;

        const client = await pool.connect();
        try {
            if (!await verifyOwnership(client, userId, investmentId)) {
                return NextResponse.json({ error: 'Investment not found or access denied' }, { status: 404 });
            }

            await client.query('DELETE FROM investments WHERE id = $1', [investmentId]);
            return NextResponse.json({ message: 'Investment deleted successfully' });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error deleting investment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
