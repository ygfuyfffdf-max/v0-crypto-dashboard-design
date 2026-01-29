/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔔 API DE NOTIFICACIONES — Endpoint para notificaciones del sistema
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { db } from '@/database'
import { ordenesCompra, ventas } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

interface Notification {
  id: string
  tipo: 'info' | 'warning' | 'error' | 'success'
  titulo: string
  mensaje: string
  timestamp: string
  leida: boolean
}

export async function GET() {
  try {
    const notifications: Notification[] = []

    // Verificar ventas pendientes de pago
    const ventasPendientes = await db
      .select()
      .from(ventas)
      .where(eq(ventas.estadoPago, 'pendiente'))
      .limit(5)

    for (const venta of ventasPendientes) {
      notifications.push({
        id: `venta-pendiente-${venta.id}`,
        tipo: 'warning',
        titulo: 'Pago pendiente',
        mensaje: `Venta #${venta.id.slice(0, 8)} tiene pago pendiente`,
        timestamp: new Date().toISOString(),
        leida: false,
      })
    }

    // Verificar órdenes pendientes
    const ordenesPendientes = await db
      .select()
      .from(ordenesCompra)
      .where(eq(ordenesCompra.estado, 'pendiente'))
      .limit(5)

    for (const orden of ordenesPendientes) {
      notifications.push({
        id: `orden-pendiente-${orden.id}`,
        tipo: 'info',
        titulo: 'Orden pendiente',
        mensaje: `Orden #${orden.numeroOrden || orden.id.slice(0, 8)} está pendiente`,
        timestamp: new Date().toISOString(),
        leida: false,
      })
    }

    // Ordenar por timestamp
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      notifications: notifications.slice(0, 10),
      unreadCount: notifications.filter((n) => !n.leida).length,
      total: notifications.length,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      {
        notifications: [],
        unreadCount: 0,
        total: 0,
        error: 'Error al obtener notificaciones',
      },
      { status: 500 },
    )
  }
}
