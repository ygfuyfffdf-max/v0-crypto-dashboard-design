/**
 * API Route: PROFIT - Proveedores de Divisas
 * GET: Listar proveedores
 * POST: Crear proveedor
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
    const divisa = searchParams.get('divisa') ?? undefined
    const metodo = searchParams.get('metodo') as MetodoPago | undefined
    const soloActivos = searchParams.get('soloActivos') !== 'false'

    const proveedores = profitComprasVentasService.getProveedores({
      divisa,
      metodo,
      soloActivos,
    })

    return NextResponse.json({
      success: true,
      data: {
        proveedores,
        total: proveedores.length,
      },
    })
  } catch (error) {
    console.error('[API Proveedores GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo proveedores' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      nombre,
      razonSocial,
      rfc,
      contactoPrincipal,
      telefono,
      whatsapp,
      email,
      divisasDisponibles,
      metodosAceptados,
      banco,
      clabe,
      beneficiario,
      walletUsdt,
      redPreferida,
      tiposCambio,
      disponibilidad,
      montoMinimo,
      montoMaximo,
    } = body

    if (!nombre || !divisasDisponibles || !metodosAceptados) {
      return NextResponse.json(
        { success: false, error: 'Nombre, divisas y métodos son requeridos' },
        { status: 400 }
      )
    }

    const proveedor = profitComprasVentasService.crearProveedor({
      nombre,
      razonSocial,
      rfc,
      contactoPrincipal,
      telefono,
      whatsapp,
      email,
      divisasDisponibles,
      metodosAceptados,
      banco,
      clabe,
      cuentaBancaria: body.cuentaBancaria,
      beneficiario,
      walletUsdt,
      walletBtc: body.walletBtc,
      redPreferida,
      tiposCambio: tiposCambio ?? {},
      disponibilidad: disponibilidad ?? {},
      montoMinimo: montoMinimo ?? 1000,
      montoMaximo: montoMaximo ?? 100000,
      estado: 'activo',
      esPreferido: false,
    })

    return NextResponse.json({
      success: true,
      message: 'Proveedor creado exitosamente',
      data: proveedor,
    })
  } catch (error) {
    console.error('[API Proveedores POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error creando proveedor' },
      { status: 500 }
    )
  }
}
