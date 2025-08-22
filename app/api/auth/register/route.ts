import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import pool from '@/lib/db';

const saltRounds = 10;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
        [email, hashedPassword]
      );
      const newUser = result.rows[0];

      // Automatically log in the user by creating a JWT and setting a cookie
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
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

      const response = NextResponse.json({ message: 'User registered and logged in successfully' }, { status: 201 });
      response.headers.set('Set-Cookie', serializedCookie);
      return response;

    } catch (error) {
      // Unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
      }
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
