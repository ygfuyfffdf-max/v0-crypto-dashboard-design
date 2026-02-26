/**
 * CHRONOS INFINITY 2026 — Clerk Auth Middleware
 *
 * Route protection powered by Clerk.
 * Public pages and API routes are allowlisted; everything else requires sign-in.
 *
 * ┌─────────────────────────────────────────────────────┐
 * │  PUBLIC PAGES:  /, /login, /register, /error, etc.  │
 * │  PUBLIC API:    /api/auth/*, /api/health, webhooks   │
 * │  PROTECTED:     everything else → sign-in redirect   │
 * └─────────────────────────────────────────────────────┘
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// ─── Public Route Matchers ──────────────────────────────────────────────────

/** Pages accessible without authentication */
const isPublicPage = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/forgot-password(.*)',
  '/error(.*)',
  '/maintenance(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

/** API routes that don't require authentication */
const isPublicApi = createRouteMatcher([
  '/api/auth(.*)',
  '/api/health(.*)',
  '/api/webhooks(.*)',
])

// ─── Middleware ──────────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, request) => {
  const isPublic = isPublicPage(request) || isPublicApi(request)

  if (!isPublic) {
    await auth.protect()
  }
})

// ─── Matcher Config ─────────────────────────────────────────────────────────

export const config = {
  matcher: [
    // Skip Next.js internals and all static files (incl. manifest.json for PWA)
    '/((?!manifest\\.json|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json|map)).*)',
    // Always run for API and tRPC routes
    '/(api|trpc)(.*)',
  ],
}
