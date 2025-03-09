import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

// Helper function to generate JWT
const generateToken = async (userId) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
  return token;
};

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    // Generate JWT token
    const token = await generateToken(user.id);

    // Set token in cookies
    const cookieStore = await cookies(); // Await the cookies() function
    cookieStore.set('token', token, { httpOnly: true, secure: true });

    return NextResponse.json({ message: 'Login successful', user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}