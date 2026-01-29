import { pagarDistribuidor } from '@/app/_actions/chronos-core'
import { pagarDistribuidor as pagarDistribuidorDirecto } from '@/app/_actions/distribuidores'
import { logger } from '@/app/lib/utils/logger'
import { NextResponse, type NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// POST - Registrar pago a distribuidor
// Soporta dos flujos:
// 1. Pago por ordenId (pago de una OC específica)
// 2. Pago por distribuidorId (pago directo al saldo del distribuidor)
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    logger.info('📥 Request recibido en /api/distribuidores/pagar', {
      context: 'API/distribuidores/pagar',
      data: body,
    })

    const { ordenId, distribuidorId, monto, bancoOrigenId, referencia, concepto } = body

    // Validaciones básicas
    if (!bancoOrigenId || !monto || monto <= 0) {
      return NextResponse.json(
        { success: false, error: 'Campos requeridos: bancoOrigenId, monto > 0' },
        { status: 400 },
      )
    }

    // Verificar que tenemos al menos una referencia (ordenId o distribuidorId)
    if (!ordenId && !distribuidorId) {
      return NextResponse.json(
        { success: false, error: 'Debe proporcionar ordenId o distribuidorId' },
        { status: 400 },
      )
    }

    let result: { success: boolean; data?: unknown; error?: string }

    // Flujo 1: Pago por ordenId (para una OC específica)
    if (ordenId) {
      result = await pagarDistribuidor({
        ordenId,
        monto,
        bancoOrigenId,
        referencia: referencia || concepto,
      })
    } 
    // Flujo 2: Pago directo al distribuidor (reduce saldo pendiente general)
    else {
      result = await pagarDistribuidorDirecto(
        distribuidorId,
        monto,
        bancoOrigenId,
        referencia || concepto,
      )
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Error al registrar pago' },
        { status: 400 },
      )
    }

    logger.info('✅ Pago a distribuidor registrado exitosamente', {
      context: 'API/distribuidores/pagar',
      data: result.data,
    })

    return NextResponse.json({
      success: true,
      data: result.data,
      mensaje: 'Pago registrado correctamente',
    })
  } catch (error) {
    logger.error('❌ Error en /api/distribuidores/pagar:', error as Error, {
      context: 'API/distribuidores/pagar',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno al registrar pago',
        detalle: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 },
    )
  }
}
