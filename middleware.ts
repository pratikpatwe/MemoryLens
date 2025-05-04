import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define which routes should be protected (all routes except those listed in isPublicRoute)
const isPublicRoute = createRouteMatcher([
  '/',                // Homepage is public
  '/sign-in(.*)',     // Sign-in pages are public
  '/sign-up(.*)',     // Sign-up pages are public
]);

export default clerkMiddleware(async (auth, req) => {
  // If the route is not public, protect it
  if (!isPublicRoute(req)) {
    // Create an absolute URL for the sign-in page
    const signInUrl = new URL('/sign-in', req.url);

    await auth.protect({
      unauthenticatedUrl: signInUrl.toString(), // Use absolute URL
    });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};