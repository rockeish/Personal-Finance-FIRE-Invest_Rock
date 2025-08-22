import { NextResponse } from 'next/server';
import cookie from 'cookie';

export async function POST() {
  const serializedCookie = cookie.serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: -1, // Expire the cookie immediately
    path: '/',
  });

  const response = NextResponse.json({ message: 'Logged out successfully' });
  response.headers.set('Set-Cookie', serializedCookie);
  return response;
}
