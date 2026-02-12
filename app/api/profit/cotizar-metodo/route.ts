/**
 * API Route: PROFIT - Cotizador con Métodos de Pago
 * POST: Generar cotización de compra o venta con método específico
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  profitComprasVentasService,
  METODOS_PAGO_CONFIG,
  type MetodoPago,
} from '@/app/_lib/services/profit-compras-ventas.service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      tipo, // 'compra' (a proveedor) o 'venta' (a cliente)
      proveedorId, // Solo para compras
      divisa,
      cantidadDivisa,
      metodoPago,
    } = body

    if (!tipo || !divisa || !cantidadDivisa || !metodoPago) {
      return NextResponse.json(
        { success: false, error: 'Tipo, divisa, cantidad y método de pago son requeridos' },
        { status: 400 }
      )
    }

    if (tipo === 'compra') {
      // Cotización de compra a proveedor
      if (!proveedorId) {
        return NextResponse.json(
          { success: false, error: 'Proveedor es requerido para cotización de compra' },
          { status: 400 }
        )
      }

      const resultado = profitComprasVentasService.cotizarCompraProveedor({
        proveedorId,
        divisa,
        cantidadDivisa: parseFloat(cantidadDivisa),
        metodoPago: metodoPago as MetodoPago,
      })

      return NextResponse.json({
        success: resultado.exito,
        data: resultado.cotizacion,
        mensaje: resultado.mensaje,
      })
    } else if (tipo === 'venta') {
      // Cotización de venta a cliente
      const resultado = profitComprasVentasService.cotizarVentaCliente({
        divisa,
        cantidadDivisa: parseFloat(cantidadDivisa),
        metodoPago: metodoPago as MetodoPago,
      })

      return NextResponse.json({
        success: resultado.exito,
        data: resultado.cotizacion,
        mensaje: resultado.mensaje,
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Tipo debe ser "compra" o "venta"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[API Cotizar Metodo POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error generando cotización' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Devolver tipos de cambio por método y configuración de métodos
  try {
    const tiposCambio = profitComprasVentasService.getTodosTiposCambio()

    return NextResponse.json({
      success: true,
      data: {
        tiposCambio,
        metodosPago: METODOS_PAGO_CONFIG,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[API Cotizar Metodo GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo tipos de cambio' },
      { status: 500 }
    )
  }
}
