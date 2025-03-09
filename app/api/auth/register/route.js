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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    // Generate JWT token
    const token = await generateToken(newUser.id);

    // Await the cookies() function
    const cookieStore = await cookies();

    // Set token in cookies
    cookieStore.set('token', token, { httpOnly: true, secure: true });

    return NextResponse.json({ message: 'User registered successfully', user: newUser }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}