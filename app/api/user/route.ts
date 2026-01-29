/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 👤 API DE USUARIO — Endpoint para información del usuario actual
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Por ahora retornamos un usuario mock
    // En producción, esto verificaría la sesión/auth
    return NextResponse.json({
      id: 'user-1',
      nombre: 'Usuario',
      email: 'usuario@chronos.mx',
      rol: 'admin',
      avatar: null,
      preferencias: {
        tema: 'dark',
        idioma: 'es-MX',
        notificaciones: true,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      {
        id: null,
        nombre: 'Invitado',
        email: null,
        rol: 'guest',
        avatar: null,
        preferencias: {
          tema: 'dark',
          idioma: 'es-MX',
          notificaciones: false,
        },
        error: 'Error al obtener usuario',
      },
      { status: 500 },
    )
  }
}
