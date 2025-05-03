import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 1. Definisikan rute publik
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/about(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. Handle API routes terpisah
  if (req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 3. Proteksi rute non-public
  if (!isPublicRoute(req)) {
    // Perbaikan utama: Gunakan auth().protect() dengan benar
    try {
      await auth().protect();
    } catch (error) {
      // Redirect ke sign-in jika unauthorized
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};