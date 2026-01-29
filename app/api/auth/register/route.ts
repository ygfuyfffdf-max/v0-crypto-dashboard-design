import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { usuarios } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Función simple de hash para desarrollo (usar bcrypt en producción)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + process.env.AUTH_SECRET || 'chronos-secret')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Schema de validación
const registerSchema = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  rol: z.enum(['admin', 'operator', 'viewer']),
})

/**
 * POST /api/auth/register - Registrar nuevo usuario
 * TODO: [SECURITY] Implementar autenticación requerida (Prioridad Alta) - Solo admins deberían poder registrar
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { nombre, email, password, rol } = parsed.data

    // Verificar si el email ya existe
    const existingUser = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, email),
    })

    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
    }

    // Crear hash de contraseña seguro
    const passwordHash = await hashPassword(password)

    // Crear usuario
    const userId = nanoid()
    const now = new Date()

    await db.insert(usuarios).values({
      id: userId,
      nombre,
      email,
      password: passwordHash,
      role: rol,
      createdAt: now,
      updatedAt: now,
    })

    logger.info('Usuario registrado exitosamente', {
      context: 'auth/register',
      data: { userId, email, rol },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        nombre,
        email,
        rol,
      },
    })
  } catch (error) {
    logger.error('Error al registrar usuario', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
