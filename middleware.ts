/**
 * CHRONOS INFINITY 2026 - MIDDLEWARE
 * Route protection and authentication via Clerk v6+
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/forgot-password(.*)',
  '/api/auth/webhook',
  '/api/health',
  '/api/auth/callback(.*)',
  '/error(.*)',
  '/maintenance(.*)',
  // Static assets that must always be public
  '/manifest(.*)',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return;
  }

  // Protect all other routes - redirect to login if not authenticated
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip manifest.json, Next.js internals and all static files (evita 401 PWA)
    '/((?!manifest\\.json|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
