/**
 * API Route: PROFIT - Tarjetas Negras
 * GET: Listar tarjetas negras
 * POST: Emitir nueva tarjeta o recargar
 */

import { NextRequest, NextResponse } from 'next/server'
import { profitRentabilidadService } from '@/app/_lib/services/profit-rentabilidad.service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const clienteId = searchParams.get('clienteId')

    let tarjetas
    if (clienteId) {
      tarjetas = profitRentabilidadService.getTarjetasCliente(clienteId)
    } else {
      tarjetas = profitRentabilidadService.getAllTarjetasNegras()
    }

    // Calcular métricas
    const metricas = {
      totalTarjetas: tarjetas.length,
      saldoTotal: tarjetas.reduce((sum, t) => sum + t.saldoActual, 0),
      comisionesGeneradas: tarjetas.reduce((sum, t) => sum + t.comisionPagadaTotal, 0),
    }

    return NextResponse.json({
      success: true,
      data: {
        tarjetas,
        metricas,
      },
    })
  } catch (error) {
    console.error('[API Tarjetas Negras GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo tarjetas' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      accion, // 'emitir' o 'recargar'
      clienteId,
      clienteNombre,
      monto,
      divisa,
      tarjetaId, // Solo para recargas
    } = body

    if (accion === 'emitir') {
      if (!clienteId || !clienteNombre || !monto || !divisa) {
        return NextResponse.json(
          { success: false, error: 'Cliente, monto y divisa son requeridos' },
          { status: 400 }
        )
      }

      const resultado = profitRentabilidadService.emitirTarjetaNegra({
        clienteId,
        clienteNombre,
        montoInicial: parseFloat(monto),
        divisa,
      })

      return NextResponse.json({
        success: true,
        message: `Tarjeta ${resultado.tarjeta.numeroTarjeta} emitida con saldo $${resultado.tarjeta.saldoActual.toLocaleString()}`,
        data: resultado,
      })
    }

    if (accion === 'recargar') {
      if (!tarjetaId || !monto || !divisa) {
        return NextResponse.json(
          { success: false, error: 'Tarjeta, monto y divisa son requeridos' },
          { status: 400 }
        )
      }

      const resultado = profitRentabilidadService.recargarTarjetaNegra({
        tarjetaId,
        montoRecarga: parseFloat(monto),
        divisa,
      })

      if (!resultado) {
        return NextResponse.json(
          { success: false, error: 'Tarjeta no encontrada' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Tarjeta recargada. Nuevo saldo: $${resultado.tarjeta.saldoActual.toLocaleString()}`,
        data: resultado,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Acción no válida. Use "emitir" o "recargar"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[API Tarjetas Negras POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error procesando tarjeta' },
      { status: 500 }
    )
  }
}
