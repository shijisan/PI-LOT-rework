import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

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

export async function middleware(request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const token = tokenCookie.value;
    const decodedPayload = await verifyToken(token);

    if (!decodedPayload) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Attach the userId to the request headers (optional)
    const response = NextResponse.next();
    response.headers.set('x-user-id', decodedPayload.userId);
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/dashboard', '/organization/:path*'],
};