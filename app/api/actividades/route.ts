// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 API DE ACTIVIDADES — Endpoint para actividad reciente del dashboard
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { db } from '@/database'
import { clientes, movimientos, ordenesCompra, ventas } from '@/database/schema'
import { desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

interface ActivityItem {
  id: string
  tipo: 'venta' | 'compra' | 'movimiento' | 'cliente' | 'alerta'
  titulo: string
  descripcion: string
  timestamp: string
  monto?: number
  estado: 'success' | 'warning' | 'error' | 'info'
}

function formatTimeAgo(date: Date | null): string {
  if (!date) return 'Fecha desconocida'
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
}

export async function GET() {
  try {
    const activities: ActivityItem[] = []

    // Obtener últimas ventas
    const ultimasVentas = await db
      .select({
        id: ventas.id,
        precioTotalVenta: ventas.precioTotalVenta,
        fecha: ventas.fecha,
        estadoPago: ventas.estadoPago,
        cliente: clientes.nombre,
      })
      .from(ventas)
      .leftJoin(clientes, eq(ventas.clienteId, clientes.id))
      .orderBy(desc(ventas.fecha))
      .limit(5)

    for (const venta of ultimasVentas) {
      activities.push({
        id: `venta-${venta.id}`,
        tipo: 'venta',
        titulo: venta.estadoPago === 'completo' ? 'Venta completada' : 'Pago parcial recibido',
        descripcion: `Cliente: ${venta.cliente || 'N/A'}`,
        timestamp: formatTimeAgo(venta.fecha),
        monto: venta.precioTotalVenta,
        estado: venta.estadoPago === 'completo' ? 'success' : 'warning',
      })
    }

    // Obtener últimos movimientos
    const ultimosMovimientos = await db
      .select()
      .from(movimientos)
      .orderBy(desc(movimientos.fecha))
      .limit(5)

    for (const mov of ultimosMovimientos) {
      const tipoLabel =
        {
          ingreso: 'Ingreso registrado',
          gasto: 'Gasto registrado',
          transferencia_entrada: 'Transferencia recibida',
          transferencia_salida: 'Transferencia enviada',
          abono: 'Abono recibido',
          pago: 'Pago realizado',
          distribucion_gya: 'Distribución GYA',
        }[mov.tipo] || mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)

      const estadoMov =
        mov.tipo === 'ingreso' || mov.tipo === 'abono' || mov.tipo === 'transferencia_entrada'
          ? 'success'
          : mov.tipo === 'gasto' || mov.tipo === 'pago' || mov.tipo === 'transferencia_salida'
            ? 'warning'
            : 'info'

      activities.push({
        id: `mov-${mov.id}`,
        tipo: 'movimiento',
        titulo: tipoLabel,
        descripcion: mov.concepto || `${mov.bancoOrigenId || ''} → ${mov.bancoDestinoId || ''}`,
        timestamp: formatTimeAgo(mov.fecha),
        monto: mov.monto,
        estado: estadoMov,
      })
    }

    // Obtener últimas órdenes de compra
    const ultimasOrdenes = await db
      .select()
      .from(ordenesCompra)
      .orderBy(desc(ordenesCompra.fecha))
      .limit(5)

    for (const orden of ultimasOrdenes) {
      activities.push({
        id: `orden-${orden.id}`,
        tipo: 'compra',
        titulo: orden.estado === 'pendiente' ? 'Orden pendiente' : 'Orden procesada',
        descripcion: orden.producto || `Orden #${orden.numeroOrden || orden.id.slice(0, 8)}`,
        timestamp: formatTimeAgo(orden.fecha),
        monto: orden.total,
        estado: orden.estado === 'pendiente' ? 'warning' : 'success',
      })
    }

    // Obtener últimos clientes registrados
    const ultimosClientes = await db
      .select()
      .from(clientes)
      .orderBy(desc(clientes.createdAt))
      .limit(3)

    for (const cliente of ultimosClientes) {
      activities.push({
        id: `cliente-${cliente.id}`,
        tipo: 'cliente',
        titulo: 'Nuevo cliente registrado',
        descripcion: `${cliente.nombre} - ${cliente.categoria || 'nuevo'}`,
        timestamp: formatTimeAgo(cliente.createdAt),
        estado: 'info',
      })
    }

    // Ordenar por timestamp más reciente (aproximado)
    activities.sort((a, b) => {
      const getOrder = (ts: string) => {
        if (ts === 'Ahora') return 0
        if (ts === 'Fecha desconocida') return 9999
        if (ts.includes('min')) return parseInt(ts.match(/\d+/)?.[0] || '0')
        if (ts.includes('hora')) return parseInt(ts.match(/\d+/)?.[0] || '0') * 60
        if (ts.includes('día')) return parseInt(ts.match(/\d+/)?.[0] || '0') * 1440
        return 9999
      }
      return getOrder(a.timestamp) - getOrder(b.timestamp)
    })

    return NextResponse.json({
      activities: activities.slice(0, 10),
      total: activities.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { activities: [], error: 'Error al obtener actividades' },
      { status: 500 },
    )
  }
}
