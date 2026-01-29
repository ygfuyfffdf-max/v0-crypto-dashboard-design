import { crearOrdenCompraCompleta } from '@/app/_actions/flujos-completos'
import { OrdenCompraCompletaSchema } from '@/app/lib/schemas/flujos-completos.schema'
import { logger } from '@/app/lib/utils/logger'
import { NextResponse, type NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// POST - Crear OC completa (wrapper de Server Action para debugging)
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    logger.info('📥 Recibido en /api/crear-oc-completa', {
      context: 'API/crear-oc-completa',
      data: body,
    })

    // Validar con Zod primero
    const validation = OrdenCompraCompletaSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          detalles: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 },
      )
    }

    // Llamar directamente al Server Action
    const result = await crearOrdenCompraCompleta(validation.data)

    logger.info('📤 Resultado de crearOrdenCompraCompleta', {
      context: 'API/crear-oc-completa',
      data: result,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    logger.error('❌ Error en /api/ordenes/crear-completa', error as Error, {
      context: 'API/ordenes/crear-completa',
    })

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
