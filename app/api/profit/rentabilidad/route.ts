/**
 * API Route: PROFIT - Cálculo de Rentabilidad y Ventas
 * POST: Calcular venta con rentabilidad
 * GET: Obtener configuración de comisiones y tipos de cambio
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  profitRentabilidadService,
  CONFIG_COMISIONES_METODO,
  CONFIG_DESCUENTOS_VOLUMEN,
  type MetodoPagoVenta,
} from '@/app/_lib/services/profit-rentabilidad.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const tiposCambio = profitRentabilidadService.getTiposCambioConRentabilidad()
    
    return NextResponse.json({
      success: true,
      data: {
        tiposCambio,
        metodosPago: CONFIG_COMISIONES_METODO,
        descuentosVolumen: CONFIG_DESCUENTOS_VOLUMEN,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[API Rentabilidad GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo configuración' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      divisa,
      cantidadDivisa,
      metodoPago,
      esRecargaTarjeta,
      tarjetaNegraId,
    } = body

    if (!divisa || !cantidadDivisa || !metodoPago) {
      return NextResponse.json(
        { success: false, error: 'Divisa, cantidad y método de pago son requeridos' },
        { status: 400 }
      )
    }

    const calculo = profitRentabilidadService.calcularVentaCliente({
      divisa,
      cantidadDivisa: parseFloat(cantidadDivisa),
      metodoPago: metodoPago as MetodoPagoVenta,
      esRecargaTarjeta: esRecargaTarjeta ?? false,
      tarjetaNegraId,
    })

    return NextResponse.json({
      success: true,
      data: calculo,
    })
  } catch (error) {
    console.error('[API Rentabilidad POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error calculando venta' },
      { status: 500 }
    )
  }
}
