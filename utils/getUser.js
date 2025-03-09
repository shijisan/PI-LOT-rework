import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

// Helper function to verify and decode the JWT
const verifyToken = async (token) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload; // Returns the decoded payload (e.g., { userId: 1 })
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

// Utility function to get the current user's information
export default async function getUser() {
  try {
    // Retrieve the "token" cookie (await is required in App Router)
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    // Check if the "token" cookie exists
    if (!tokenCookie) {
      return { error: 'Token cookie is missing', status: 400 };
    }

    // Extract the token value from the cookie
    const token = tokenCookie.value;

    // Verify and decode the JWT
    const decodedPayload = await verifyToken(token);
    if (!decodedPayload) {
      return { error: 'Invalid or expired token', status: 401 };
    }

    // Extract the userId from the decoded payload
    const userId = decodedPayload.userId;

    // Fetch the user's information from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Check if the user exists
    if (!user) {
      return { error: 'User not found', status: 404 };
    }

    // Return the user information
    return { user, status: 200 };
  } catch (error) {
    console.error(error);
    return { error: 'Something went wrong', status: 500 };
  }
}