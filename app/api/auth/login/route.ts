import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      const serializedCookie = cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });

      const response = NextResponse.json({ message: 'Logged in successfully' });
      response.headers.set('Set-Cookie', serializedCookie);
      return response;

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
