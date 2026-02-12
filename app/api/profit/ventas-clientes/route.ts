/**
 * API Route: PROFIT - Ventas a Clientes
 * GET: Listar ventas
 * POST: Crear venta
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
    const clienteId = searchParams.get('clienteId') ?? undefined
    const estado = searchParams.get('estado') as 'cotizacion' | 'pendiente_pago' | 'pagada' | 'entregada' | 'cancelada' | undefined
    const metodoPago = searchParams.get('metodoPago') as MetodoPago | undefined

    const ventas = profitComprasVentasService.getVentas({
      clienteId,
      estado,
      metodoPago,
    })

    // Calcular métricas
    const metricas = {
      total: ventas.length,
      pendientes: ventas.filter(v => ['pendiente_pago', 'pagada'].includes(v.estado)).length,
      montoTotalMxn: ventas.reduce((sum, v) => sum + v.totalCobroCliente, 0),
      gananciaTotal: ventas.reduce((sum, v) => sum + v.gananciaOperacion, 0),
      porMetodo: {
        transferencia: ventas.filter(v => v.metodoPago === 'transferencia').length,
        efectivo: ventas.filter(v => v.metodoPago === 'efectivo').length,
        tarjeta: ventas.filter(v => v.metodoPago === 'tarjeta').length,
        cripto: ventas.filter(v => v.metodoPago === 'cripto').length,
      },
    }

    return NextResponse.json({
      success: true,
      data: {
        ventas,
        metricas,
      },
    })
  } catch (error) {
    console.error('[API Ventas GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo ventas' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      clienteId,
      clienteNombre,
      clienteTelefono,
      clienteIdentificacion,
      divisa,
      cantidadDivisa,
      metodoPago,
      datosPago,
      notas,
      cajeroId,
      cajeroNombre,
    } = body

    // Validaciones
    if (!clienteNombre || !divisa || !cantidadDivisa || !metodoPago) {
      return NextResponse.json(
        { success: false, error: 'Cliente, divisa, cantidad y método de pago son requeridos' },
        { status: 400 }
      )
    }

    const resultado = profitComprasVentasService.crearVenta({
      clienteId,
      clienteNombre,
      clienteTelefono,
      clienteIdentificacion,
      divisa,
      cantidadDivisa: parseFloat(cantidadDivisa),
      metodoPago: metodoPago as MetodoPago,
      datosPago: datosPago ?? {},
      notas,
      cajeroId: cajeroId ?? 'cajero_001',
      cajeroNombre: cajeroNombre ?? 'Cajero',
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
      data: resultado.venta,
    })
  } catch (error) {
    console.error('[API Ventas POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error creando venta' },
      { status: 500 }
    )
  }
}
