/**
 * API Route: PROFIT Casa de Cambio - Alertas
 * GET: Obtener alertas activas
 * POST: Crear nueva alerta
 * PUT: Marcar alerta como leída/resuelta
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Alerta {
  id: string
  tipo: 'operacion_grande' | 'inventario_bajo' | 'cnbv' | 'fraude' | 'sistema' | 'tipo_cambio'
  severidad: 'info' | 'warning' | 'error' | 'critical'
  titulo: string
  mensaje: string
  datos?: Record<string, unknown>
  leida: boolean
  resuelta: boolean
  createdAt: string
}

const alertasDB: Alerta[] = [
  {
    id: 'alert_001',
    tipo: 'operacion_grande',
    severidad: 'warning',
    titulo: 'Operación grande detectada',
    mensaje: 'Operación de $15,000 USD requiere verificación adicional',
    datos: { operacionId: 'op_123', monto: 15000, cliente: 'Juan Pérez' },
    leida: false,
    resuelta: false,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'alert_002',
    tipo: 'inventario_bajo',
    severidad: 'warning',
    titulo: 'Inventario bajo de EUR',
    mensaje: 'El saldo de EUR está por debajo del mínimo recomendado',
    datos: { divisa: 'EUR', saldoActual: 450, minimoRecomendado: 1000 },
    leida: true,
    resuelta: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
  },
  {
    id: 'alert_003',
    tipo: 'tipo_cambio',
    severidad: 'info',
    titulo: 'Variación significativa USD',
    mensaje: 'El tipo de cambio USD/MXN subió 0.5% en la última hora',
    datos: { divisa: 'USD', variacion: 0.5, valorAnterior: 20.10, valorActual: 20.20 },
    leida: false,
    resuelta: false,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
]

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const tipo = searchParams.get('tipo')
    const severidad = searchParams.get('severidad')
    const soloNoLeidas = searchParams.get('noLeidas') === 'true'
    const soloNoResueltas = searchParams.get('noResueltas') === 'true'

    let alertas = [...alertasDB]

    if (tipo) {
      alertas = alertas.filter(a => a.tipo === tipo)
    }

    if (severidad) {
      alertas = alertas.filter(a => a.severidad === severidad)
    }

    if (soloNoLeidas) {
      alertas = alertas.filter(a => !a.leida)
    }

    if (soloNoResueltas) {
      alertas = alertas.filter(a => !a.resuelta)
    }

    // Ordenar por fecha descendente y severidad
    const severidadOrden = { critical: 4, error: 3, warning: 2, info: 1 }
    alertas.sort((a, b) => {
      if (severidadOrden[b.severidad] !== severidadOrden[a.severidad]) {
        return severidadOrden[b.severidad] - severidadOrden[a.severidad]
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // Contadores
    const contadores = {
      total: alertasDB.length,
      noLeidas: alertasDB.filter(a => !a.leida).length,
      noResueltas: alertasDB.filter(a => !a.resuelta).length,
      criticas: alertasDB.filter(a => a.severidad === 'critical' && !a.resuelta).length,
    }

    return NextResponse.json({
      success: true,
      data: {
        alertas,
        contadores,
      },
    })
  } catch (error) {
    console.error('[API Alertas GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo alertas' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tipo, severidad, titulo, mensaje, datos } = body

    if (!tipo || !severidad || !titulo || !mensaje) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const nuevaAlerta: Alerta = {
      id: `alert_${Date.now()}`,
      tipo,
      severidad,
      titulo,
      mensaje,
      datos,
      leida: false,
      resuelta: false,
      createdAt: new Date().toISOString(),
    }

    alertasDB.unshift(nuevaAlerta)

    return NextResponse.json({
      success: true,
      message: 'Alerta creada',
      data: nuevaAlerta,
    })
  } catch (error) {
    console.error('[API Alertas POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error creando alerta' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, leida, resuelta } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de alerta requerido' },
        { status: 400 }
      )
    }

    const alertaIndex = alertasDB.findIndex(a => a.id === id)
    if (alertaIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Alerta no encontrada' },
        { status: 404 }
      )
    }

    if (leida !== undefined) {
      alertasDB[alertaIndex].leida = leida
    }

    if (resuelta !== undefined) {
      alertasDB[alertaIndex].resuelta = resuelta
    }

    return NextResponse.json({
      success: true,
      message: 'Alerta actualizada',
      data: alertasDB[alertaIndex],
    })
  } catch (error) {
    console.error('[API Alertas PUT] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error actualizando alerta' },
      { status: 500 }
    )
  }
}
