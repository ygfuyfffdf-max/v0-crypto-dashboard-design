/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ CHRONOS MIDDLEWARE — Adaptive Auth + Route Protection (PRODUCTION OPTIMIZED)
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Middleware adaptativo:
 * - Usa Clerk cuando está configurado
 * - Bypass mode para desarrollo sin Clerk
 * - Headers de seguridad
 * - Rate limiting ready
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const isProd = process.env.NODE_ENV === 'production'
const isClerkConfigured = 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') &&
  process.env.CLERK_SECRET_KEY?.startsWith('sk_')

// ═══════════════════════════════════════════════════════════════════════════════════════
// RUTAS PROTEGIDAS Y PÚBLICAS
// ═══════════════════════════════════════════════════════════════════════════════════════

const protectedPaths = [
  '/dashboard',
  '/admin',
  '/settings',
  '/bancos',
  '/ventas',
  '/clientes',
  '/distribuidores',
  '/almacen',
  '/movimientos',
  '/gastos',
  '/ordenes',
  '/reportes',
  '/ia',
  '/configuracion',
  '/ai-supreme',
]

const publicPaths = [
  '/',
  '/sign-in',
  '/sign-up',
  '/login',
  '/register',
  '/api/webhooks',
  '/api/public',
  '/api/health',
]

function isProtectedRoute(pathname: string): boolean {
  return protectedPaths.some(path => pathname.startsWith(path))
}

function isPublicRoute(pathname: string): boolean {
  return publicPaths.some(path => pathname.startsWith(path))
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SECURITY HEADERS
// ═══════════════════════════════════════════════════════════════════════════════════════

function addSecurityHeaders(response: NextResponse): void {
  if (isProd) {
    response.headers.set('X-DNS-Prefetch-Control', 'on')
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  }
  
  // Request ID para tracing
  response.headers.set('x-request-id', crypto.randomUUID())
  response.headers.set('x-auth-mode', isClerkConfigured ? 'clerk' : 'bypass')
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// BYPASS MIDDLEWARE (Development without Clerk)
// ═══════════════════════════════════════════════════════════════════════════════════════

function bypassMiddleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  
  addSecurityHeaders(response)

  // Redirect root to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CLERK MIDDLEWARE (Production with Clerk)
// ═══════════════════════════════════════════════════════════════════════════════════════

async function clerkMiddlewareHandler(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  try {
    const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server')
    
    const isProtected = createRouteMatcher(protectedPaths.map(p => `${p}(.*)`))
    const isPublic = createRouteMatcher(publicPaths.map(p => `${p}(.*)`))

    return clerkMiddleware(async (auth, req) => {
      const response = NextResponse.next()
      addSecurityHeaders(response)

      // Redirect root to dashboard
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      // Protect routes
      if (isProtected(req) && !isPublic(req)) {
        await auth.protect()
      }

      return response
    })(request, {} as never) as Promise<NextResponse>
  } catch {
    // Clerk not available, use bypass
    return bypassMiddleware(request)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════════════

export default async function middleware(request: NextRequest): Promise<NextResponse> {
  // Use Clerk if configured, otherwise bypass
  if (isClerkConfigured) {
    return clerkMiddlewareHandler(request)
  }
  
  return bypassMiddleware(request)
}

// Configurar qué rutas debe procesar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
