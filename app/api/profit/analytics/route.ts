/**
 * API Route: PROFIT Casa de Cambio - Analytics
 * GET: Obtiene métricas y análisis del negocio
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Datos simulados para analytics
const generarAnalytics = () => {
  const hoy = new Date()
  const datos = {
    resumenHoy: {
      totalOperaciones: Math.floor(Math.random() * 50) + 20,
      operacionesCompra: Math.floor(Math.random() * 30) + 10,
      operacionesVenta: Math.floor(Math.random() * 30) + 10,
      volumenTotal: Math.floor(Math.random() * 500000) + 100000,
      gananciaTotal: Math.floor(Math.random() * 15000) + 5000,
      clientesAtendidos: Math.floor(Math.random() * 40) + 15,
      ticketPromedio: Math.floor(Math.random() * 10000) + 2000,
    },
    volumenesPorDivisa: {
      USD: {
        comprado: Math.floor(Math.random() * 50000) + 20000,
        vendido: Math.floor(Math.random() * 50000) + 20000,
        ganancia: Math.floor(Math.random() * 3000) + 1000,
      },
      EUR: {
        comprado: Math.floor(Math.random() * 20000) + 5000,
        vendido: Math.floor(Math.random() * 20000) + 5000,
        ganancia: Math.floor(Math.random() * 1500) + 500,
      },
      CAD: {
        comprado: Math.floor(Math.random() * 10000) + 2000,
        vendido: Math.floor(Math.random() * 10000) + 2000,
        ganancia: Math.floor(Math.random() * 800) + 200,
      },
      GBP: {
        comprado: Math.floor(Math.random() * 8000) + 1000,
        vendido: Math.floor(Math.random() * 8000) + 1000,
        ganancia: Math.floor(Math.random() * 600) + 150,
      },
      USDT: {
        comprado: Math.floor(Math.random() * 15000) + 3000,
        vendido: Math.floor(Math.random() * 15000) + 3000,
        ganancia: Math.floor(Math.random() * 1000) + 300,
      },
    },
    tendencias: {
      USD: { tendencia: Math.random() > 0.5 ? 'alza' : 'baja', variacion: (Math.random() * 2 - 1).toFixed(2) },
      EUR: { tendencia: Math.random() > 0.5 ? 'alza' : 'baja', variacion: (Math.random() * 2 - 1).toFixed(2) },
      CAD: { tendencia: Math.random() > 0.5 ? 'alza' : 'baja', variacion: (Math.random() * 2 - 1).toFixed(2) },
      GBP: { tendencia: Math.random() > 0.5 ? 'alza' : 'baja', variacion: (Math.random() * 2 - 1).toFixed(2) },
    },
    historialSemana: Array.from({ length: 7 }, (_, i) => {
      const fecha = new Date(hoy)
      fecha.setDate(fecha.getDate() - (6 - i))
      return {
        fecha: fecha.toISOString().split('T')[0],
        operaciones: Math.floor(Math.random() * 60) + 20,
        volumen: Math.floor(Math.random() * 400000) + 100000,
        ganancia: Math.floor(Math.random() * 12000) + 3000,
      }
    }),
    topClientes: Array.from({ length: 5 }, (_, i) => ({
      id: `cliente_${i + 1}`,
      nombre: ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Roberto Sánchez'][i],
      operaciones: Math.floor(Math.random() * 15) + 3,
      volumen: Math.floor(Math.random() * 100000) + 20000,
    })),
    alertas: [
      { tipo: 'info', mensaje: 'Alto volumen de USD hoy', timestamp: new Date().toISOString() },
      { tipo: 'warning', mensaje: 'Inventario bajo de EUR', timestamp: new Date().toISOString() },
    ],
  }
  return datos
}

export async function GET() {
  try {
    const analytics = generarAnalytics()

    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[API Analytics] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo analytics' },
      { status: 500 }
    )
  }
}
