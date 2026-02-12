/**
 * API Route: PROFIT Casa de Cambio - Caja
 * GET: Estado actual de la caja
 * POST: Apertura/Cierre de caja
 * PUT: Actualizar saldos
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Estado de caja simulado
let estadoCaja = {
  id: 'caja_001',
  nombre: 'Caja Principal',
  estado: 'cerrada' as 'abierta' | 'cerrada' | 'arqueo',
  cajeroId: null as string | null,
  cajeroNombre: null as string | null,
  fechaApertura: null as string | null,
  saldos: {
    MXN: { monto: 50000, denominaciones: [] },
    USD: { monto: 3000, denominaciones: [] },
    EUR: { monto: 1500, denominaciones: [] },
    CAD: { monto: 800, denominaciones: [] },
    GBP: { monto: 500, denominaciones: [] },
    USDT: { monto: 2000, denominaciones: [] },
  },
  metricas: {
    operacionesTurno: 0,
    comprasTurno: 0,
    ventasTurno: 0,
    gananciasTurno: 0,
  },
  alertas: [] as Array<{ tipo: string; divisa: string; mensaje: string }>,
}

export async function GET() {
  try {
    // Verificar alertas de inventario
    const alertasNuevas: Array<{ tipo: string; divisa: string; mensaje: string }> = []
    if (estadoCaja.saldos.USD.monto < 1000) {
      alertasNuevas.push({ tipo: 'bajo', divisa: 'USD', mensaje: 'Inventario bajo de USD' })
    }
    if (estadoCaja.saldos.EUR.monto < 500) {
      alertasNuevas.push({ tipo: 'bajo', divisa: 'EUR', mensaje: 'Inventario bajo de EUR' })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...estadoCaja,
        alertas: alertasNuevas,
      },
    })
  } catch (error) {
    console.error('[API Caja GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo estado de caja' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { accion, cajeroId, cajeroNombre, montoApertura, saldosContados } = body

    if (accion === 'abrir') {
      if (estadoCaja.estado === 'abierta') {
        return NextResponse.json(
          { success: false, error: 'La caja ya está abierta' },
          { status: 400 }
        )
      }

      estadoCaja = {
        ...estadoCaja,
        estado: 'abierta',
        cajeroId,
        cajeroNombre,
        fechaApertura: new Date().toISOString(),
        metricas: {
          operacionesTurno: 0,
          comprasTurno: 0,
          ventasTurno: 0,
          gananciasTurno: 0,
        },
      }

      if (montoApertura) {
        estadoCaja.saldos.MXN.monto = montoApertura
      }

      return NextResponse.json({
        success: true,
        message: 'Caja abierta exitosamente',
        data: estadoCaja,
      })
    }

    if (accion === 'cerrar') {
      if (estadoCaja.estado !== 'abierta') {
        return NextResponse.json(
          { success: false, error: 'La caja no está abierta' },
          { status: 400 }
        )
      }

      // Generar folio de corte
      const folioCierre = `CORTE-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`

      const corteCaja = {
        folio: folioCierre,
        cajeroId: estadoCaja.cajeroId,
        cajeroNombre: estadoCaja.cajeroNombre,
        fechaApertura: estadoCaja.fechaApertura,
        fechaCierre: new Date().toISOString(),
        saldosEsperados: { ...estadoCaja.saldos },
        saldosContados: saldosContados ?? estadoCaja.saldos,
        metricas: estadoCaja.metricas,
      }

      estadoCaja = {
        ...estadoCaja,
        estado: 'cerrada',
        cajeroId: null,
        cajeroNombre: null,
        fechaApertura: null,
        metricas: {
          operacionesTurno: 0,
          comprasTurno: 0,
          ventasTurno: 0,
          gananciasTurno: 0,
        },
      }

      return NextResponse.json({
        success: true,
        message: 'Caja cerrada exitosamente',
        data: {
          estadoCaja,
          corteCaja,
        },
      })
    }

    return NextResponse.json(
      { success: false, error: 'Acción no válida' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[API Caja POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error procesando operación de caja' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { divisa, monto, tipoMovimiento } = body

    if (!divisa || monto === undefined) {
      return NextResponse.json(
        { success: false, error: 'Divisa y monto son requeridos' },
        { status: 400 }
      )
    }

    const divisaKey = divisa as keyof typeof estadoCaja.saldos
    if (!estadoCaja.saldos[divisaKey]) {
      return NextResponse.json(
        { success: false, error: 'Divisa no válida' },
        { status: 400 }
      )
    }

    if (tipoMovimiento === 'entrada') {
      estadoCaja.saldos[divisaKey].monto += monto
    } else if (tipoMovimiento === 'salida') {
      if (estadoCaja.saldos[divisaKey].monto < monto) {
        return NextResponse.json(
          { success: false, error: 'Saldo insuficiente' },
          { status: 400 }
        )
      }
      estadoCaja.saldos[divisaKey].monto -= monto
    } else {
      estadoCaja.saldos[divisaKey].monto = monto
    }

    return NextResponse.json({
      success: true,
      message: 'Saldo actualizado',
      data: estadoCaja.saldos[divisaKey],
    })
  } catch (error) {
    console.error('[API Caja PUT] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error actualizando saldo' },
      { status: 500 }
    )
  }
}
