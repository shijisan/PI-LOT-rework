import { NextResponse } from 'next/server';
import getUser from '@/utils/getUser';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Call the getUser utility function
    const result = await getUser();

    // Handle errors returned by getUser
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    // Extract the userId from the result
    const userId = result.user.id;

    // Fetch the user's information from the database
    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
    });

    // If the user is not found, return a 404 error
    if (!userInfo) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return the user information
    return NextResponse.json({ user: userInfo }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}