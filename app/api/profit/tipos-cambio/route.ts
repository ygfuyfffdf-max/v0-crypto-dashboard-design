/**
 * API Route: PROFIT Casa de Cambio - Tipos de Cambio
 * GET: Obtener tipos de cambio actuales
 * PUT: Actualizar tipos de cambio
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface TipoCambio {
  divisa: string
  compra: number
  venta: number
  referencia: number
  spread: number
  variacion24h: number
  ultimaActualizacion: string
  fuente: string
}

// Tipos de cambio en memoria (en producción usar DB)
const tiposCambioDB: Record<string, TipoCambio> = {
  USD: {
    divisa: 'USD',
    compra: 19.85,
    venta: 20.45,
    referencia: 20.15,
    spread: 3.0,
    variacion24h: 0.12,
    ultimaActualizacion: new Date().toISOString(),
    fuente: 'Banxico FIX',
  },
  EUR: {
    divisa: 'EUR',
    compra: 21.65,
    venta: 22.35,
    referencia: 22.00,
    spread: 3.2,
    variacion24h: -0.08,
    ultimaActualizacion: new Date().toISOString(),
    fuente: 'Forex API',
  },
  CAD: {
    divisa: 'CAD',
    compra: 14.50,
    venta: 15.10,
    referencia: 14.80,
    spread: 4.1,
    variacion24h: 0.05,
    ultimaActualizacion: new Date().toISOString(),
    fuente: 'Forex API',
  },
  GBP: {
    divisa: 'GBP',
    compra: 25.20,
    venta: 26.00,
    referencia: 25.60,
    spread: 3.1,
    variacion24h: -0.15,
    ultimaActualizacion: new Date().toISOString(),
    fuente: 'Forex API',
  },
  USDT: {
    divisa: 'USDT',
    compra: 19.75,
    venta: 20.35,
    referencia: 20.05,
    spread: 3.0,
    variacion24h: 0.02,
    ultimaActualizacion: new Date().toISOString(),
    fuente: 'Crypto Exchange',
  },
}

export async function GET() {
  try {
    // Simular pequeñas variaciones en tiempo real
    const tiposConVariacion = Object.entries(tiposCambioDB).map(([_divisa, tc]) => ({
      ...tc,
      compra: tc.compra * (1 + (Math.random() - 0.5) * 0.001),
      venta: tc.venta * (1 + (Math.random() - 0.5) * 0.001),
      ultimaActualizacion: new Date().toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: {
        tiposCambio: tiposConVariacion,
        divisaBase: 'MXN',
        timestamp: new Date().toISOString(),
        proximaActualizacion: new Date(Date.now() + 60000).toISOString(), // 1 minuto
      },
    })
  } catch (error) {
    console.error('[API Tipos Cambio GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo tipos de cambio' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { divisa, compra, venta } = body

    if (!divisa || compra === undefined || venta === undefined) {
      return NextResponse.json(
        { success: false, error: 'Divisa, compra y venta son requeridos' },
        { status: 400 }
      )
    }

    if (!tiposCambioDB[divisa]) {
      return NextResponse.json(
        { success: false, error: 'Divisa no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar tipo de cambio
    const referencia = (compra + venta) / 2
    const spread = ((venta - compra) / referencia) * 100

    tiposCambioDB[divisa] = {
      ...tiposCambioDB[divisa],
      compra,
      venta,
      referencia,
      spread,
      ultimaActualizacion: new Date().toISOString(),
      fuente: 'Manual',
    }

    return NextResponse.json({
      success: true,
      message: `Tipo de cambio de ${divisa} actualizado`,
      data: tiposCambioDB[divisa],
    })
  } catch (error) {
    console.error('[API Tipos Cambio PUT] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error actualizando tipo de cambio' },
      { status: 500 }
    )
  }
}
