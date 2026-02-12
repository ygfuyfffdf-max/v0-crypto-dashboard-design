/**
 * API Route: PROFIT - Órdenes de Compra a Proveedores
 * GET: Listar órdenes de compra
 * POST: Crear orden de compra
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  profitComprasVentasService,
  type MetodoPago,
} from '@/app/_lib/services/profit-compras-ventas.service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const proveedorId = searchParams.get('proveedorId') ?? undefined
    const estado = searchParams.get('estado') as 'cotizacion' | 'pendiente_pago' | 'pagada' | 'en_proceso' | 'recibida' | 'cancelada' | undefined

    const ordenes = profitComprasVentasService.getOrdenesCompra({
      proveedorId,
      estado,
    })

    // Calcular métricas
    const metricas = {
      total: ordenes.length,
      pendientes: ordenes.filter(o => ['pendiente_pago', 'pagada', 'en_proceso'].includes(o.estado)).length,
      montoTotalMxn: ordenes.reduce((sum, o) => sum + o.totalMxn, 0),
    }

    return NextResponse.json({
      success: true,
      data: {
        ordenes,
        metricas,
      },
    })
  } catch (error) {
    console.error('[API Ordenes Compra GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo órdenes' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      proveedorId,
      divisa,
      cantidadDivisa,
      metodoPago,
      datosPago,
      notas,
      creadoPor,
    } = body

    // Validaciones
    if (!proveedorId || !divisa || !cantidadDivisa || !metodoPago) {
      return NextResponse.json(
        { success: false, error: 'Proveedor, divisa, cantidad y método de pago son requeridos' },
        { status: 400 }
      )
    }

    const resultado = profitComprasVentasService.crearOrdenCompra({
      proveedorId,
      divisa,
      cantidadDivisa: parseFloat(cantidadDivisa),
      metodoPago: metodoPago as MetodoPago,
      datosPago: datosPago ?? {},
      notas,
      creadoPor: creadoPor ?? 'sistema',
    })

    if (!resultado.exito) {
      return NextResponse.json(
        { success: false, error: resultado.mensaje },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: resultado.mensaje,
      data: resultado.orden,
    })
  } catch (error) {
    console.error('[API Ordenes Compra POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error creando orden de compra' },
      { status: 500 }
    )
  }
}
