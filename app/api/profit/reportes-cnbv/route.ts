/**
 * API Route: PROFIT Casa de Cambio - Reportes CNBV
 * GET: Listar reportes generados
 * POST: Generar nuevo reporte
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface ReporteCNBV {
  id: string
  tipo: 'ROR' | 'ROI' | 'ROIP' | 'R24H' | 'MENSUAL'
  folio: string
  periodo: string
  fechaGeneracion: string
  fechaEnvio?: string
  estado: 'borrador' | 'revisado' | 'enviado' | 'aceptado'
  operaciones: number
  montoTotal: number
}

const reportesDB: ReporteCNBV[] = [
  {
    id: 'rep_001',
    tipo: 'MENSUAL',
    folio: 'CNBV-2025-12-001',
    periodo: 'Diciembre 2025',
    fechaGeneracion: '2026-01-05T10:00:00Z',
    fechaEnvio: '2026-01-10T10:00:00Z',
    estado: 'aceptado',
    operaciones: 245,
    montoTotal: 4500000,
  },
  {
    id: 'rep_002',
    tipo: 'ROR',
    folio: 'CNBV-2026-01-ROR-001',
    periodo: 'Enero 2026',
    fechaGeneracion: '2026-01-28T15:00:00Z',
    estado: 'revisado',
    operaciones: 12,
    montoTotal: 850000,
  },
]

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const tipo = searchParams.get('tipo')
    const estado = searchParams.get('estado')

    let reportes = [...reportesDB]

    if (tipo) {
      reportes = reportes.filter(r => r.tipo === tipo)
    }

    if (estado) {
      reportes = reportes.filter(r => r.estado === estado)
    }

    // Estadísticas
    const estadisticas = {
      totalReportes: reportes.length,
      pendientes: reportes.filter(r => r.estado === 'borrador' || r.estado === 'revisado').length,
      enviados: reportes.filter(r => r.estado === 'enviado' || r.estado === 'aceptado').length,
      ultimoReporte: reportes[0]?.fechaGeneracion ?? null,
    }

    return NextResponse.json({
      success: true,
      data: {
        reportes,
        estadisticas,
      },
    })
  } catch (error) {
    console.error('[API Reportes CNBV GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo reportes' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tipo, periodoInicio, periodoFin } = body

    if (!tipo) {
      return NextResponse.json(
        { success: false, error: 'Tipo de reporte es requerido' },
        { status: 400 }
      )
    }

    // Simular generación de reporte
    const nuevoReporte: ReporteCNBV = {
      id: `rep_${Date.now()}`,
      tipo,
      folio: `CNBV-2026-01-${tipo}-${String(reportesDB.length + 1).padStart(3, '0')}`,
      periodo: periodoInicio && periodoFin ? `${periodoInicio} - ${periodoFin}` : 'Enero 2026',
      fechaGeneracion: new Date().toISOString(),
      estado: 'borrador',
      operaciones: Math.floor(Math.random() * 50) + 5,
      montoTotal: Math.floor(Math.random() * 500000) + 100000,
    }

    reportesDB.unshift(nuevoReporte)

    return NextResponse.json({
      success: true,
      message: 'Reporte generado exitosamente',
      data: nuevoReporte,
    })
  } catch (error) {
    console.error('[API Reportes CNBV POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error generando reporte' },
      { status: 500 }
    )
  }
}
