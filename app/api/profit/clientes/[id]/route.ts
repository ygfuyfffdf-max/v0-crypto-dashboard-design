/**
 * API Route: PROFIT Casa de Cambio - Cliente Individual
 * GET: Obtener cliente por ID
 * PUT: Actualizar cliente
 * DELETE: Eliminar (desactivar) cliente
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Referencia a la base de datos (en producción usar DB real)
const clientesDB = new Map()

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Simular cliente
    const cliente = {
      id,
      nombre: 'Juan',
      apellidoPaterno: 'Pérez',
      apellidoMaterno: 'García',
      nombreCompleto: 'Juan Pérez García',
      tipoIdentificacion: 'INE',
      numeroIdentificacion: 'PEGJ850101HDFRRC09',
      telefono: '5551234567',
      email: 'juan.perez@email.com',
      rfc: 'PEGJ850101XXX',
      curp: 'PEGJ850101HDFRRC09',
      nacionalidad: 'Mexicana',
      ocupacion: 'Empresario',
      nivelKyc: 'completo',
      estado: 'activo',
      totalOperaciones: 45,
      montoTotalOperado: 250000,
      operacionesRecientes: [
        {
          id: 'op_001',
          folio: 'PRF260130-0001',
          fecha: '2026-01-30',
          hora: '10:30:00',
          tipoOperacion: 'compra',
          divisaOrigen: 'MXN',
          divisaDestino: 'USD',
          montoOrigen: 20450,
          montoDestino: 1000,
          tipoCambio: 20.45,
        },
        {
          id: 'op_002',
          folio: 'PRF260129-0015',
          fecha: '2026-01-29',
          hora: '15:45:00',
          tipoOperacion: 'venta',
          divisaOrigen: 'EUR',
          divisaDestino: 'MXN',
          montoOrigen: 500,
          montoDestino: 11175,
          tipoCambio: 22.35,
        },
      ],
      createdAt: '2025-06-15T10:00:00Z',
      updatedAt: '2026-01-25T15:30:00Z',
    }

    return NextResponse.json({
      success: true,
      data: cliente,
    })
  } catch (error) {
    console.error('[API Cliente GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo cliente' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Validaciones
    if (body.estado && !['activo', 'inactivo', 'bloqueado'].includes(body.estado)) {
      return NextResponse.json(
        { success: false, error: 'Estado no válido' },
        { status: 400 }
      )
    }

    // Simular actualización
    const clienteActualizado = {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: clienteActualizado,
    })
  } catch (error) {
    console.error('[API Cliente PUT] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error actualizando cliente' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // En producción: soft delete (cambiar estado a inactivo)
    return NextResponse.json({
      success: true,
      message: 'Cliente desactivado exitosamente',
      data: { id, estado: 'inactivo' },
    })
  } catch (error) {
    console.error('[API Cliente DELETE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error eliminando cliente' },
      { status: 500 }
    )
  }
}
