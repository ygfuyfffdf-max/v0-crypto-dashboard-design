// @ts-nocheck
/**
 * API Route: PROFIT Casa de Cambio - Operaciones
 * GET: Listar operaciones con filtros
 * POST: Crear nueva operación de cambio
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Base de datos simulada de operaciones
const operacionesDB: OperacionDB[] = []
let contadorDiario = 0
let fechaContador = new Date().toISOString().split('T')[0]

interface OperacionDB {
  id: string
  folio: string
  fecha: string
  hora: string
  tipoOperacion: 'compra' | 'venta'

  // Cliente
  clienteId?: string
  clienteNombre: string
  clienteTelefono?: string
  tipoIdentificacion?: string
  numeroIdentificacion?: string

  // Operación
  divisaOrigen: string
  divisaDestino: string
  montoOrigen: number
  montoDestino: number
  tipoCambioAplicado: number

  // Financiero
  spread: number
  comision: number
  gananciaOperacion: number

  // Caja
  cajaId: string
  cajeroId: string
  cajeroNombre: string

  // Estado
  estado: 'completada' | 'cancelada' | 'reversada'

  createdAt: string
}

// Generar folio único
function generarFolio(): string {
  const hoy = new Date().toISOString().split('T')[0]

  // Resetear contador si es nuevo día
  if (hoy !== fechaContador) {
    fechaContador = hoy
    contadorDiario = 0
  }

  contadorDiario++
  const fechaCorta = hoy.replace(/-/g, '').substring(2) // 260130
  return `PRF${fechaCorta}-${String(contadorDiario).padStart(4, '0')}`
}

// Generar operaciones de ejemplo
function inicializarOperaciones() {
  if (operacionesDB.length > 0) return

  const ejemplos = [
    { tipo: 'compra', divO: 'MXN', divD: 'USD', montoO: 20450, montoD: 1000, tc: 20.45, cliente: 'Juan Pérez' },
    { tipo: 'venta', divO: 'EUR', divD: 'MXN', montoO: 500, montoD: 11175, tc: 22.35, cliente: 'María García' },
    { tipo: 'compra', divO: 'MXN', divD: 'EUR', montoO: 22350, montoD: 1000, tc: 22.35, cliente: 'Carlos López' },
    { tipo: 'venta', divO: 'USD', divD: 'MXN', montoO: 2000, montoD: 39700, tc: 19.85, cliente: 'Ana Martínez' },
    { tipo: 'compra', divO: 'MXN', divD: 'CAD', montoO: 15100, montoD: 1000, tc: 15.10, cliente: 'Roberto Sánchez' },
  ]

  ejemplos.forEach((ej, index) => {
    const hora = `${String(9 + index).padStart(2, '0')}:${String(30 + index * 5).padStart(2, '0')}:00`
    operacionesDB.push({
      id: `op_${Date.now()}_${index}`,
      folio: generarFolio(),
      fecha: new Date().toISOString().split('T')[0],
      hora,
      tipoOperacion: ej.tipo as 'compra' | 'venta',
      clienteNombre: ej.cliente,
      divisaOrigen: ej.divO,
      divisaDestino: ej.divD,
      montoOrigen: ej.montoO,
      montoDestino: ej.montoD,
      tipoCambioAplicado: ej.tc,
      spread: 3.0,
      comision: 0,
      gananciaOperacion: Math.round(ej.montoD * 0.03),
      cajaId: 'caja_001',
      cajeroId: 'cajero_001',
      cajeroNombre: 'Cajero Demo',
      estado: 'completada',
      createdAt: new Date().toISOString(),
    })
  })
}

inicializarOperaciones()

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const fecha = searchParams.get('fecha')
    const tipoOperacion = searchParams.get('tipoOperacion')
    const clienteId = searchParams.get('clienteId')
    const estado = searchParams.get('estado')
    const limite = parseInt(searchParams.get('limite') ?? '50')
    const pagina = parseInt(searchParams.get('pagina') ?? '1')

    let operaciones = [...operacionesDB]

    // Filtros
    if (fecha) {
      operaciones = operaciones.filter(op => op.fecha === fecha)
    }

    if (tipoOperacion) {
      operaciones = operaciones.filter(op => op.tipoOperacion === tipoOperacion)
    }

    if (clienteId) {
      operaciones = operaciones.filter(op => op.clienteId === clienteId)
    }

    if (estado) {
      operaciones = operaciones.filter(op => op.estado === estado)
    }

    // Ordenar por fecha/hora descendente
    operaciones.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora}`).getTime()
      const fechaB = new Date(`${b.fecha}T${b.hora}`).getTime()
      return fechaB - fechaA
    })

    // Calcular métricas
    const metricas = {
      total: operaciones.length,
      compras: operaciones.filter(op => op.tipoOperacion === 'compra').length,
      ventas: operaciones.filter(op => op.tipoOperacion === 'venta').length,
      volumenTotal: operaciones.reduce((sum, op) => sum + op.montoOrigen, 0),
      gananciaTotal: operaciones.reduce((sum, op) => sum + op.gananciaOperacion, 0),
    }

    // Paginación
    const inicio = (pagina - 1) * limite
    const operacionesPaginadas = operaciones.slice(inicio, inicio + limite)

    return NextResponse.json({
      success: true,
      data: {
        operaciones: operacionesPaginadas,
        metricas,
        paginacion: {
          total: operaciones.length,
          pagina,
          limite,
          totalPaginas: Math.ceil(operaciones.length / limite),
        },
      },
    })
  } catch (error) {
    console.error('[API Operaciones GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo operaciones' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      cotizacionId,
      tipoOperacion,
      divisaOrigen,
      divisaDestino,
      montoOrigen,
      montoDestino,
      tipoCambioAplicado,
      spread,
      clienteNombre,
      clienteId,
      clienteTelefono,
      tipoIdentificacion,
      numeroIdentificacion,
      cajeroId,
      cajeroNombre,
      cajaId,
      denominacionesRecibidas,
      denominacionesEntregadas,
      notas,
    } = body

    // Validaciones
    if (!tipoOperacion || !divisaOrigen || !divisaDestino || !montoOrigen || !montoDestino) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos de la operación' },
        { status: 400 }
      )
    }

    // 🛡️ FINANCIAL VALIDATION (PROFIT ENGINE)
    const validation = FinancialValidator.validateOperation({
      montoOrigen,
      divisaOrigen,
      tipoOperacion,
      clienteId,
      cajaId: cajaId ?? 'caja_001'
    })

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    if (!clienteNombre) {
      return NextResponse.json(
        { success: false, error: 'Nombre del cliente es requerido' },
        { status: 400 }
      )
    }

    // Generar operación
    const ahora = new Date()
    const nuevaOperacion: OperacionDB = {
      id: `op_${Date.now()}`,
      folio: generarFolio(),
      fecha: ahora.toISOString().split('T')[0],
      hora: ahora.toTimeString().split(' ')[0],
      tipoOperacion,
      clienteId,
      clienteNombre,
      clienteTelefono,
      tipoIdentificacion,
      numeroIdentificacion,
      divisaOrigen,
      divisaDestino,
      montoOrigen,
      montoDestino,
      tipoCambioAplicado,
      spread: spread ?? 3.0,
      comision: 0,
      gananciaOperacion: Math.round(montoDestino * (spread ?? 3.0) / 100),
      cajaId: cajaId ?? 'caja_001',
      cajeroId: cajeroId ?? 'cajero_001',
      cajeroNombre: cajeroNombre ?? 'Cajero',
      estado: 'completada',
      createdAt: ahora.toISOString(),
    }

    operacionesDB.unshift(nuevaOperacion)

    return NextResponse.json({
      success: true,
      message: 'Operación registrada exitosamente',
      data: {
        operacion: nuevaOperacion,
        ticket: {
          folio: nuevaOperacion.folio,
          mensaje: `Operación ${nuevaOperacion.folio} completada`,
          imprimible: true,
        },
      },
    })
  } catch (error) {
    console.error('[API Operaciones POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error registrando operación' },
      { status: 500 }
    )
  }
}
