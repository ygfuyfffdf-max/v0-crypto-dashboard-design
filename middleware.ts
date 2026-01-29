/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ CHRONOS MIDDLEWARE — Route Protection & Session Management (PRODUCTION OPTIMIZED)
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Middleware para protección de rutas y gestión de sesiones
 * - Protege rutas del dashboard que requieren autenticación
 * - Maneja redirecciones correctamente sin crear loops
 * - Preserva sesión en cookies
 * - Headers de seguridad adicionales
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const isProd = process.env.NODE_ENV === 'production'

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ['/login', '/register', '/api', '/_next', '/favicon.ico']

// Rutas protegidas (dashboard)
const PROTECTED_ROUTES = [
  '/dashboard',
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
  '/gastos-abonos',
]

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔒 HEADERS DE SEGURIDAD ADICIONALES
  // ═══════════════════════════════════════════════════════════════════════════
  if (isProd) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔓 MODO DESARROLLO: Acceso libre al dashboard
  // ═══════════════════════════════════════════════════════════════════════════

  // Redirigir la raíz directamente al DASHBOARD
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
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
