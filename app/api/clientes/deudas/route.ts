/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💰 API DE DEUDAS DE CLIENTES — Endpoint para obtener clientes con saldo pendiente
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { db } from '@/database'
import { clientes, ventas } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Obtener clientes con ventas pendientes o parciales - simplificado
    const clientesConDeuda = await db
      .select({
        clienteId: clientes.id,
        nombre: clientes.nombre,
        telefono: clientes.telefono,
        email: clientes.email,
      })
      .from(clientes)
      .limit(20)

    // Para cada cliente, calcular deuda (enfoque más simple y compatible)
    const clientesConDeudaCalculada = []

    for (const cliente of clientesConDeuda) {
      const ventasCliente = await db
        .select({
          precioTotal: ventas.precioTotalVenta,
          montoPagado: ventas.montoPagado,
          estadoPago: ventas.estadoPago,
        })
        .from(ventas)
        .where(eq(ventas.clienteId, cliente.clienteId))

      let totalDeuda = 0
      let ventasPendientes = 0

      for (const venta of ventasCliente) {
        if (venta.estadoPago === 'pendiente') {
          totalDeuda += Number(venta.precioTotal || 0)
          ventasPendientes++
        } else if (venta.estadoPago === 'parcial') {
          totalDeuda += Number(venta.precioTotal || 0) - Number(venta.montoPagado || 0)
          ventasPendientes++
        }
      }

      if (totalDeuda > 0) {
        clientesConDeudaCalculada.push({
          ...cliente,
          totalDeuda,
          ventasPendientes,
        })
      }
    }

    // Ordenar por deuda descendente
    clientesConDeudaCalculada.sort((a, b) => b.totalDeuda - a.totalDeuda)

    const totalDeuda = clientesConDeudaCalculada.reduce((acc, c) => acc + c.totalDeuda, 0)

    return NextResponse.json({
      clientes: clientesConDeudaCalculada,
      totalDeuda,
      totalClientes: clientesConDeudaCalculada.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching client debts:', error)
    return NextResponse.json(
      {
        clientes: [],
        totalDeuda: 0,
        totalClientes: 0,
        error: 'Error al obtener deudas de clientes',
      },
      { status: 500 },
    )
  }
}
