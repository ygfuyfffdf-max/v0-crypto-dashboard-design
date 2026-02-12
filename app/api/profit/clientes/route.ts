/**
 * API Route: PROFIT Casa de Cambio - Clientes
 * GET: Listar clientes con filtros
 * POST: Crear nuevo cliente
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Base de datos simulada de clientes
const clientesDB: Map<string, ClienteDB> = new Map([
  ['cli_001', {
    id: 'cli_001',
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
    createdAt: '2025-06-15T10:00:00Z',
    updatedAt: '2026-01-25T15:30:00Z',
  }],
  ['cli_002', {
    id: 'cli_002',
    nombre: 'María',
    apellidoPaterno: 'García',
    apellidoMaterno: 'López',
    nombreCompleto: 'María García López',
    tipoIdentificacion: 'INE',
    numeroIdentificacion: 'GALM900515MDFRRS08',
    telefono: '5559876543',
    email: 'maria.garcia@email.com',
    rfc: 'GALM900515XXX',
    nacionalidad: 'Mexicana',
    ocupacion: 'Contador',
    nivelKyc: 'intermedio',
    estado: 'activo',
    totalOperaciones: 23,
    montoTotalOperado: 120000,
    createdAt: '2025-08-20T14:00:00Z',
    updatedAt: '2026-01-20T11:45:00Z',
  }],
  ['cli_003', {
    id: 'cli_003',
    nombre: 'Carlos',
    apellidoPaterno: 'López',
    apellidoMaterno: 'Martínez',
    nombreCompleto: 'Carlos López Martínez',
    tipoIdentificacion: 'PASAPORTE',
    numeroIdentificacion: 'G12345678',
    telefono: '5552468135',
    nacionalidad: 'Mexicana',
    ocupacion: 'Ingeniero',
    nivelKyc: 'basico',
    estado: 'activo',
    totalOperaciones: 8,
    montoTotalOperado: 35000,
    createdAt: '2025-12-01T09:00:00Z',
    updatedAt: '2026-01-15T16:20:00Z',
  }],
])

interface ClienteDB {
  id: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno?: string
  nombreCompleto: string
  tipoIdentificacion?: string
  numeroIdentificacion?: string
  telefono?: string
  email?: string
  rfc?: string
  curp?: string
  nacionalidad: string
  ocupacion?: string
  nivelKyc: 'basico' | 'intermedio' | 'completo'
  estado: 'activo' | 'inactivo' | 'bloqueado'
  totalOperaciones: number
  montoTotalOperado: number
  createdAt: string
  updatedAt: string
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const busqueda = searchParams.get('busqueda')?.toLowerCase()
    const estado = searchParams.get('estado')
    const nivelKyc = searchParams.get('nivelKyc')
    const limite = parseInt(searchParams.get('limite') ?? '50')
    const pagina = parseInt(searchParams.get('pagina') ?? '1')

    let clientes = Array.from(clientesDB.values())

    // Filtros
    if (busqueda) {
      clientes = clientes.filter(c =>
        c.nombreCompleto.toLowerCase().includes(busqueda) ||
        c.telefono?.includes(busqueda) ||
        c.email?.toLowerCase().includes(busqueda) ||
        c.rfc?.toLowerCase().includes(busqueda)
      )
    }

    if (estado) {
      clientes = clientes.filter(c => c.estado === estado)
    }

    if (nivelKyc) {
      clientes = clientes.filter(c => c.nivelKyc === nivelKyc)
    }

    // Paginación
    const total = clientes.length
    const inicio = (pagina - 1) * limite
    const clientesPaginados = clientes.slice(inicio, inicio + limite)

    return NextResponse.json({
      success: true,
      data: {
        clientes: clientesPaginados,
        paginacion: {
          total,
          pagina,
          limite,
          totalPaginas: Math.ceil(total / limite),
        },
      },
    })
  } catch (error) {
    console.error('[API Clientes GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo clientes' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      tipoIdentificacion,
      numeroIdentificacion,
      telefono,
      email,
      rfc,
      curp,
      nacionalidad,
      ocupacion,
    } = body

    // Validaciones básicas
    if (!nombre || !apellidoPaterno) {
      return NextResponse.json(
        { success: false, error: 'Nombre y apellido paterno son requeridos' },
        { status: 400 }
      )
    }

    // Generar ID único
    const id = `cli_${Date.now()}`
    const nombreCompleto = [nombre, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ')

    const nuevoCliente: ClienteDB = {
      id,
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      nombreCompleto,
      tipoIdentificacion,
      numeroIdentificacion,
      telefono,
      email,
      rfc,
      curp,
      nacionalidad: nacionalidad ?? 'Mexicana',
      ocupacion,
      nivelKyc: tipoIdentificacion ? 'basico' : 'basico',
      estado: 'activo',
      totalOperaciones: 0,
      montoTotalOperado: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Determinar nivel KYC
    if (rfc && curp && tipoIdentificacion) {
      nuevoCliente.nivelKyc = 'completo'
    } else if (tipoIdentificacion || rfc) {
      nuevoCliente.nivelKyc = 'intermedio'
    }

    clientesDB.set(id, nuevoCliente)

    return NextResponse.json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: nuevoCliente,
    })
  } catch (error) {
    console.error('[API Clientes POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error creando cliente' },
      { status: 500 }
    )
  }
}
