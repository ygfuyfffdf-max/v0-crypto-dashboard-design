// 🔐 CHRONOS INFINITY - MIDDLEWARE CONFIGURATION
// Middleware para proteger rutas y manejar autenticación

import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  // Rutas públicas que no requieren autenticación
  publicRoutes: [
    '/',
    '/login',
    '/register',
    '/api/auth/webhook',
    '/api/health'
  ],

  // Rutas que deben ser ignoradas por el middleware
  ignoredRoutes: [
    '/api/auth/callback',
    '/_next/static',
    '/favicon.ico',
    '/robots.txt',
    '/manifest.json'
  ],

  // Rutas que requieren autenticación
  afterAuth(auth, req, evt) {
    // Si el usuario no está autenticado y está intentando acceder a una ruta protegida
    if (!auth.userId && !auth.isPublicRoute) {
      return Response.redirect(new URL('/login', req.url));
    }

    // Si el usuario está autenticado y está en la página de login/registro, redirigir al dashboard
    if (auth.userId && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
      return Response.redirect(new URL('/welcome', req.url));
    }

    // Permitir el acceso a rutas protegidas si el usuario está autenticado
    return;
  },

  // Configuración adicional
  debug: process.env.NODE_ENV === 'development',

  // Función personalizada para manejo de errores
  onError(error, req) {
    console.error('Middleware error:', error);
    return Response.redirect(new URL('/error', req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
