import { ERROR_CODES, errorFromException, successWithCache } from '@/app/lib/api-response'
import { CACHE_KEYS, invalidateCache } from '@/app/lib/cache'
import { applyRateLimit } from '@/app/lib/rate-limit'
import { logger } from '@/app/lib/utils/logger'
import { db, ensureInit } from '@/database'
import { distribuidores } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

// Configuración de cache (revalidar cada 60 segundos)
export const dynamic = 'force-dynamic'
export const revalidate = 60

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const CrearDistribuidorAPISchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100).trim(),
  empresa: z.string().max(100).optional().or(z.literal('')),
  telefono: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  tipoProductos: z.string().max(200).optional().or(z.literal('')),
})

const ActualizarDistribuidorAPISchema = CrearDistribuidorAPISchema.partial().extend({
  id: z.string().min(1, 'ID de distribuidor requerido'),
})

// Campos permitidos para actualización (lista blanca)
const CAMPOS_ACTUALIZABLES = ['nombre', 'empresa', 'telefono', 'email', 'tipoProductos'] as const

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener todos los distribuidores
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await applyRateLimit(request, 'read')
  if (rateLimitResult) return rateLimitResult

  try {
    await ensureInit()
    const distribuidoresData = await db.select().from(distribuidores).orderBy(distribuidores.nombre)

    return successWithCache(
      distribuidoresData,
      { ttl: 60, staleWhileRevalidate: 120 },
      { total: distribuidoresData.length },
    )
  } catch (error) {
    return errorFromException(error, 'DistribuidoresAPI', ERROR_CODES.DATABASE_ERROR)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST - Crear nuevo distribuidor
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  // Rate limiting para escritura
  const rateLimitResult = await applyRateLimit(request, 'write')
  if (rateLimitResult) return rateLimitResult

  try {
    await ensureInit()
    const body = await request.json()

    // Validación Zod
    const validation = CrearDistribuidorAPISchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos de distribuidor inválidos',
          details: validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 },
      )
    }

    const { nombre, empresa, telefono, email, tipoProductos } = validation.data

    const distribuidorId = uuidv4()
    const now = Math.floor(Date.now() / 1000)

    await db.insert(distribuidores).values({
      id: distribuidorId,
      nombre,
      empresa: empresa || null,
      telefono: telefono || null,
      email: email || null,
      tipoProductos: tipoProductos || null,
      saldoPendiente: 0,
      estado: 'activo',
      createdAt: now,
      updatedAt: now,
    })

    // Invalidar cache
    await invalidateCache(CACHE_KEYS.DISTRIBUIDORES_ALL)

    return NextResponse.json({
      success: true,
      distribuidorId,
      nombre,
    })
  } catch (error) {
    logger.error('Error creando distribuidor:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUT - Actualizar distribuidor
// ═══════════════════════════════════════════════════════════════════════════

export async function PUT(request: NextRequest) {
  // Rate limiting para escritura
  const rateLimitResult = await applyRateLimit(request, 'write')
  if (rateLimitResult) return rateLimitResult

  try {
    await ensureInit()
    const body = await request.json()

    // Validación Zod
    const validation = ActualizarDistribuidorAPISchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos de actualización inválidos',
          details: validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 },
      )
    }

    const { id, ...rawUpdateData } = validation.data

    // Lista blanca: solo permitir campos actualizables
    const updateData = Object.fromEntries(
      Object.entries(rawUpdateData).filter(([key]) =>
        CAMPOS_ACTUALIZABLES.includes(key as (typeof CAMPOS_ACTUALIZABLES)[number]),
      ),
    )

    const [distribuidorExistente] = await db
      .select()
      .from(distribuidores)
      .where(eq(distribuidores.id, id))

    if (!distribuidorExistente) {
      return NextResponse.json({ error: 'Distribuidor no encontrado' }, { status: 404 })
    }

    await db
      .update(distribuidores)
      .set({
        ...updateData,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(distribuidores.id, id))

    // Invalidar cache
    await invalidateCache(CACHE_KEYS.DISTRIBUIDORES_ALL)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error actualizando distribuidor:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE - Eliminar distribuidor (soft delete)
// ═══════════════════════════════════════════════════════════════════════════

export async function DELETE(request: NextRequest) {
  // Rate limiting para escritura
  const rateLimitResult = await applyRateLimit(request, 'write')
  if (rateLimitResult) return rateLimitResult

  try {
    await ensureInit()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID de distribuidor requerido' }, { status: 400 })
    }

    await db
      .update(distribuidores)
      .set({
        estado: 'inactivo',
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(distribuidores.id, id))

    // Invalidar cache
    await invalidateCache(CACHE_KEYS.DISTRIBUIDORES_ALL)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error eliminando distribuidor:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
