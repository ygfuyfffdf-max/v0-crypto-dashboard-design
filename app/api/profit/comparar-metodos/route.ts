/**
 * API Route: PROFIT - Comparar métodos de pago
 * POST: Compara rentabilidad entre todos los métodos
 */

import { NextRequest, NextResponse } from 'next/server'
import { profitRentabilidadService } from '@/app/_lib/services/profit-rentabilidad.service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { divisa, cantidadDivisa } = body

    if (!divisa || !cantidadDivisa) {
      return NextResponse.json(
        { success: false, error: 'Divisa y cantidad son requeridos' },
        { status: 400 }
      )
    }

    const comparacion = profitRentabilidadService.compararMetodosPago(
      divisa,
      parseFloat(cantidadDivisa)
    )

    return NextResponse.json({
      success: true,
      data: {
        comparacion,
        mejorOpcion: comparacion[0], // El primero es el de mayor ganancia
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[API Comparar Métodos POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error comparando métodos' },
      { status: 500 }
    )
  }
}
