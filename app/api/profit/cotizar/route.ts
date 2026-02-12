/**
 * API Route: PROFIT Casa de Cambio - Cotizador
 * POST: Generar cotización de cambio de divisa
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Tipos de cambio en tiempo real (simulados)
const tiposCambio = {
  USD: { compra: 19.85, venta: 20.45, referencia: 20.15, spread: 3.0 },
  EUR: { compra: 21.65, venta: 22.35, referencia: 22.00, spread: 3.2 },
  CAD: { compra: 14.50, venta: 15.10, referencia: 14.80, spread: 4.1 },
  GBP: { compra: 25.20, venta: 26.00, referencia: 25.60, spread: 3.1 },
  USDT: { compra: 19.75, venta: 20.35, referencia: 20.05, spread: 3.0 },
}

// Configuración regulatoria
const CONFIG = {
  montoRequiereID: 3000, // USD equivalente
  montoMaximoSinReporte: 10000, // USD equivalente
  limiteOperacionDiariaCliente: 50000, // USD equivalente
  validezCotizacionSegundos: 60,
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      tipoOperacion, // 'compra' o 'venta' (perspectiva del cliente)
      divisaOrigen,
      divisaDestino,
      monto,
      esMontoDestino = false,
      clienteId,
    } = body

    // Validaciones básicas
    if (!tipoOperacion || !divisaOrigen || !divisaDestino || !monto) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    if (monto <= 0) {
      return NextResponse.json(
        { success: false, error: 'Monto debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Determinar divisa extranjera y tipo de cambio
    let divisaExtranjera: string
    let tipoCambioAplicado: number
    let montoOrigen: number
    let montoDestino: number

    if (divisaOrigen === 'MXN') {
      // Cliente entrega MXN, recibe divisa extranjera (VENTA de divisa al cliente)
      divisaExtranjera = divisaDestino
      const tc = tiposCambio[divisaExtranjera as keyof typeof tiposCambio]
      if (!tc) {
        return NextResponse.json(
          { success: false, error: 'Divisa no soportada' },
          { status: 400 }
        )
      }
      tipoCambioAplicado = tc.venta // Venta al cliente

      if (esMontoDestino) {
        montoDestino = monto
        montoOrigen = monto * tipoCambioAplicado
      } else {
        montoOrigen = monto
        montoDestino = monto / tipoCambioAplicado
      }
    } else if (divisaDestino === 'MXN') {
      // Cliente entrega divisa extranjera, recibe MXN (COMPRA de divisa del cliente)
      divisaExtranjera = divisaOrigen
      const tc = tiposCambio[divisaExtranjera as keyof typeof tiposCambio]
      if (!tc) {
        return NextResponse.json(
          { success: false, error: 'Divisa no soportada' },
          { status: 400 }
        )
      }
      tipoCambioAplicado = tc.compra // Compra del cliente

      if (esMontoDestino) {
        montoDestino = monto
        montoOrigen = monto / tipoCambioAplicado
      } else {
        montoOrigen = monto
        montoDestino = monto * tipoCambioAplicado
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Una de las divisas debe ser MXN' },
        { status: 400 }
      )
    }

    // Obtener datos de la divisa
    const tc = tiposCambio[divisaExtranjera as keyof typeof tiposCambio]

    // Calcular equivalente en USD para validaciones
    let montoUsdEquivalente: number
    if (divisaExtranjera === 'USD' || divisaExtranjera === 'USDT') {
      montoUsdEquivalente = divisaOrigen === 'MXN' ? montoDestino : montoOrigen
    } else {
      const tcExtranjera = tiposCambio[divisaExtranjera as keyof typeof tiposCambio]
      const tcUsd = tiposCambio.USD
      const factorConversion = tcExtranjera.referencia / tcUsd.referencia
      montoUsdEquivalente = (divisaOrigen === 'MXN' ? montoDestino : montoOrigen) * factorConversion
    }

    // Calcular ganancia estimada
    const spreadPorcentaje = tc.spread / 100
    const gananciaEstimada = (divisaOrigen === 'MXN' ? montoDestino : montoOrigen) * spreadPorcentaje * tc.referencia

    // Generar ID de cotización
    const cotizacionId = `COT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Validaciones KYC
    const requiereID = montoUsdEquivalente >= CONFIG.montoRequiereID
    const requiereReporteSAT = montoUsdEquivalente >= CONFIG.montoMaximoSinReporte

    const cotizacion = {
      id: cotizacionId,
      valida: true,
      tipoOperacion,
      divisaOrigen,
      divisaDestino,
      montoOrigen: Math.round(montoOrigen * 100) / 100,
      montoDestino: Math.round(montoDestino * 100) / 100,
      tipoCambioAplicado,
      tipoCambioReferencia: tc.referencia,
      spread: tc.spread,
      gananciaEstimada: Math.round(gananciaEstimada * 100) / 100,
      montoUsdEquivalente: Math.round(montoUsdEquivalente * 100) / 100,
      requiereID,
      requiereReporteSAT,
      validezSegundos: CONFIG.validezCotizacionSegundos,
      expiracion: new Date(Date.now() + CONFIG.validezCotizacionSegundos * 1000).toISOString(),
      mensaje: requiereID
        ? `⚠️ Operación requiere identificación oficial (> $${CONFIG.montoRequiereID} USD equiv.)`
        : undefined,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: cotizacion,
    })
  } catch (error) {
    console.error('[API Cotizar] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error generando cotización' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Devolver tipos de cambio actuales
  return NextResponse.json({
    success: true,
    data: {
      tiposCambio,
      config: {
        montoRequiereID: CONFIG.montoRequiereID,
        limiteOperacionDiaria: CONFIG.limiteOperacionDiariaCliente,
      },
      ultimaActualizacion: new Date().toISOString(),
    },
  })
}
