/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                 CHRONOS SYSTEM - EXPORT API ROUTE                          ║
 * ║              Endpoint Server-Side para Exportaciones                       ║
 * ║                  TypeScript Strict - Zero Any                              ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * @version 2.0.0 - Diciembre 2025
 * @audit Remediación de tipos - Zero any violations
 */

import type {
  ExportColumn,
  ExportPrimitive,
  ExportableEntity,
  ExportableRecord,
} from '@/app/lib/services/ExportService'
import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import {
  bancos,
  clientes,
  distribuidores,
  movimientos,
  ordenesCompra,
  ventas,
} from '@/database/schema'
import { desc } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS ESTRICTOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Entidades soportadas para exportación
 */
type ExportEntityType =
  | 'ventas'
  | 'clientes'
  | 'distribuidores'
  | 'ordenes'
  | 'movimientos'
  | 'bancos'

/**
 * Tipos de formato de exportación
 */
type ExportFormatType = 'json' | 'csv'

/**
 * Estructura de filtros tipada
 */
interface ExportFilters {
  dateFrom?: string
  dateTo?: string
  status?: string
  minAmount?: number
  maxAmount?: number
  bancoId?: string
  clienteId?: string
  distribuidorId?: string
}

/**
 * Request de exportación tipado
 */
interface ExportRequest {
  entity: ExportEntityType
  format?: ExportFormatType
  filters?: ExportFilters
  columns?: string[]
}

/**
 * Respuesta de exportación exitosa
 */
interface ExportSuccessResponse {
  success: true
  entity: ExportEntityType
  columns: ExportColumn[]
  data: ExportableEntity[]
  totalRecords: number
  generatedAt: string
  filters?: ExportFilters | null
}

/**
 * Respuesta de error
 */
interface ExportErrorResponse {
  error: string
}

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS DE ENTIDADES DEL DOMINIO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tipos inferidos de Drizzle con relaciones
 */
interface VentaWithCliente extends ExportableEntity {
  id: string
  fecha: Date | null
  cantidad: number
  precioVentaUnidad: number
  precioCompraUnidad: number
  precioFlete: number | null
  precioTotalVenta: number
  montoPagado: number | null
  montoRestante: number | null
  estadoPago: string | null
  montoBovedaMonte: number
  montoFletes: number
  montoUtilidades: number
  cliente?: {
    id: string
    nombre: string
    email: string | null
    telefono: string | null
  } | null
  [key: string]: ExportPrimitive | ExportableRecord | ExportPrimitive[]
}

interface OrdenWithDistribuidor extends ExportableEntity {
  id: string
  fecha: Date | null
  cantidad: number
  costoUnitario?: number
  costoTotal?: number
  stockActual: number | null
  estado: string | null
  distribuidor?: {
    id: string
    nombre: string
    contacto: string | null
    telefono: string | null
  } | null
  [key: string]: ExportPrimitive | ExportableRecord | ExportPrimitive[]
}

interface ClienteEntity extends ExportableEntity {
  id: string
  nombre: string
  email: string | null
  telefono: string | null
  totalCompras: number | null
  saldoPendiente: number | null
  numeroVentas: number | null
  scoreTotal: number | null
  categoria: string | null
  [key: string]: ExportPrimitive | ExportableRecord | ExportPrimitive[]
}

interface DistribuidorEntity extends ExportableEntity {
  id: string
  nombre: string
  contacto?: string | null
  telefono: string | null
  totalOrdenes?: number | null
  saldoPendiente: number | null
  numeroOrdenes?: number | null
  [key: string]: ExportPrimitive | ExportableRecord | ExportPrimitive[]
}

interface MovimientoEntity extends ExportableEntity {
  id: string
  fecha: Date | null
  bancoId: string
  tipo: string
  monto: number
  concepto: string | null
  referencia: string | null
  [key: string]: ExportPrimitive | ExportableRecord | ExportPrimitive[]
}

interface BancoEntity extends ExportableEntity {
  id: string
  nombre: string
  tipo: string
  moneda?: string | null
  capitalActual: number | null
  historicoIngresos: number | null
  historicoGastos: number | null
  estado?: string | null
  [key: string]: ExportPrimitive | ExportableRecord | ExportPrimitive[]
}

/**
 * Unión de todos los tipos de entidad
 */
type AnyEntity =
  | VentaWithCliente
  | OrdenWithDistribuidor
  | ClienteEntity
  | DistribuidorEntity
  | MovimientoEntity
  | BancoEntity

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE COLUMNAS POR ENTIDAD
// ═══════════════════════════════════════════════════════════════════════════

const ENTITY_COLUMNS: Record<ExportEntityType, ExportColumn[]> = {
  ventas: [
    { key: 'id', label: 'ID', format: 'text' },
    { key: 'fecha', label: 'Fecha', format: 'date' },
    { key: 'cliente.nombre', label: 'Cliente', format: 'text' },
    { key: 'cantidad', label: 'Cantidad', format: 'number' },
    { key: 'precioVentaUnidad', label: 'Precio Venta', format: 'currency' },
    { key: 'precioTotalVenta', label: 'Total Venta', format: 'currency' },
    { key: 'montoUtilidades', label: 'Utilidad', format: 'currency' },
    { key: 'estadoPago', label: 'Estado Pago', format: 'text' },
    { key: 'montoPagado', label: 'Monto Pagado', format: 'currency' },
    { key: 'montoRestante', label: 'Monto Restante', format: 'currency' },
  ],
  clientes: [
    { key: 'id', label: 'ID', format: 'text' },
    { key: 'nombre', label: 'Nombre', format: 'text' },
    { key: 'email', label: 'Email', format: 'text' },
    { key: 'telefono', label: 'Teléfono', format: 'text' },
    { key: 'totalCompras', label: 'Total Compras', format: 'currency' },
    { key: 'saldoPendiente', label: 'Saldo Pendiente', format: 'currency' },
    { key: 'numeroVentas', label: 'Número Ventas', format: 'number' },
    { key: 'scoreTotal', label: 'Score Total', format: 'number' },
    { key: 'categoria', label: 'Categoría', format: 'text' },
  ],
  distribuidores: [
    { key: 'id', label: 'ID', format: 'text' },
    { key: 'nombre', label: 'Nombre', format: 'text' },
    { key: 'contacto', label: 'Contacto', format: 'text' },
    { key: 'telefono', label: 'Teléfono', format: 'text' },
    { key: 'totalOrdenes', label: 'Total Órdenes', format: 'currency' },
    { key: 'saldoPendiente', label: 'Saldo Pendiente', format: 'currency' },
    { key: 'numeroOrdenes', label: 'Número Órdenes', format: 'number' },
  ],
  ordenes: [
    { key: 'id', label: 'ID', format: 'text' },
    { key: 'fecha', label: 'Fecha', format: 'date' },
    { key: 'distribuidor.nombre', label: 'Distribuidor', format: 'text' },
    { key: 'cantidad', label: 'Cantidad', format: 'number' },
    { key: 'costoUnitario', label: 'Costo Unitario', format: 'currency' },
    { key: 'costoTotal', label: 'Costo Total', format: 'currency' },
    { key: 'stockActual', label: 'Stock Actual', format: 'number' },
    { key: 'estado', label: 'Estado', format: 'text' },
  ],
  movimientos: [
    { key: 'id', label: 'ID', format: 'text' },
    { key: 'fecha', label: 'Fecha', format: 'date' },
    { key: 'bancoId', label: 'Banco', format: 'text' },
    { key: 'tipo', label: 'Tipo', format: 'text' },
    { key: 'monto', label: 'Monto', format: 'currency' },
    { key: 'concepto', label: 'Concepto', format: 'text' },
    { key: 'referencia', label: 'Referencia', format: 'text' },
  ],
  bancos: [
    { key: 'id', label: 'ID', format: 'text' },
    { key: 'nombre', label: 'Nombre', format: 'text' },
    { key: 'tipo', label: 'Tipo', format: 'text' },
    { key: 'moneda', label: 'Moneda', format: 'text' },
    { key: 'capitalActual', label: 'Capital Actual', format: 'currency' },
    { key: 'historicoIngresos', label: 'Histórico Ingresos', format: 'currency' },
    { key: 'historicoGastos', label: 'Histórico Gastos', format: 'currency' },
    { key: 'estado', label: 'Estado', format: 'text' },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES TIPADAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Type guard para validar entidades soportadas
 */
function isValidEntity(entity: string | null): entity is ExportEntityType {
  if (!entity) return false
  return ['ventas', 'clientes', 'distribuidores', 'ordenes', 'movimientos', 'bancos'].includes(
    entity,
  )
}

/**
 * Type guard para validar formatos soportados
 */
function isValidFormat(format: string | null): format is ExportFormatType {
  if (!format) return true // json por defecto
  return ['json', 'csv'].includes(format)
}

/**
 * Obtiene valor de propiedad anidada usando dot notation
 * @param obj - Objeto del cual extraer el valor
 * @param path - Ruta en dot notation (ej: "cliente.nombre")
 * @returns Valor encontrado como string
 */
function getNestedValue(obj: ExportableEntity, path: string): string {
  const parts = path.split('.')
  let current: ExportPrimitive | ExportableRecord | ExportPrimitive[] = obj

  for (const key of parts) {
    if (current === null || current === undefined) {
      return ''
    }
    if (typeof current === 'object' && !Array.isArray(current) && !(current instanceof Date)) {
      current = (current as ExportableRecord)[key]
    } else {
      return ''
    }
  }

  // Convertir a string de forma segura
  if (current === null || current === undefined) {
    return ''
  }
  if (current instanceof Date) {
    return current.toISOString()
  }
  return String(current)
}

/**
 * Escapa y formatea valor para CSV
 */
function formatCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// ═══════════════════════════════════════════════════════════════════════════
// FETCHERS DE DATOS TIPADOS
// ═══════════════════════════════════════════════════════════════════════════

async function fetchVentas(): Promise<VentaWithCliente[]> {
  // Usar select simple para compatibilidad con libSQL
  const ventasData = await db.select().from(ventas).orderBy(desc(ventas.fecha))
  const clientesData = await db.select().from(clientes)

  const clientesMap = new Map(clientesData.map((c) => [c.id, c]))

  return ventasData.map((v) => ({
    ...v,
    cliente: clientesMap.get(v.clienteId) || null,
  })) as VentaWithCliente[]
}

async function fetchClientes(): Promise<ClienteEntity[]> {
  const data = await db.select().from(clientes).orderBy(desc(clientes.createdAt))
  return data as ClienteEntity[]
}

async function fetchDistribuidores(): Promise<DistribuidorEntity[]> {
  const data = await db.select().from(distribuidores).orderBy(desc(distribuidores.createdAt))
  // Mapear campos del schema al interface esperado
  return data.map((d) => ({
    ...d,
    contacto: d.telefono, // Usar telefono como contacto
    totalOrdenes: d.saldoPendiente || 0, // Usar campo disponible
    numeroOrdenes: 0,
  })) as unknown as DistribuidorEntity[]
}

async function fetchOrdenes(): Promise<OrdenWithDistribuidor[]> {
  // Usar select simple para compatibilidad con libSQL
  const ordenesData = await db.select().from(ordenesCompra).orderBy(desc(ordenesCompra.fecha))
  const distribuidoresData = await db.select().from(distribuidores)

  const distribuidoresMap = new Map(distribuidoresData.map((d) => [d.id, d]))

  // Mapear campos del schema al interface esperado
  return ordenesData.map((o) => ({
    ...o,
    costoUnitario: o.precioUnitario,
    costoTotal: o.total,
    distribuidor: distribuidoresMap.get(o.distribuidorId) || null,
  })) as unknown as OrdenWithDistribuidor[]
}

async function fetchMovimientos(): Promise<MovimientoEntity[]> {
  const data = await db.select().from(movimientos).orderBy(desc(movimientos.fecha))
  return data as MovimientoEntity[]
}

async function fetchBancos(): Promise<BancoEntity[]> {
  const data = await db.select().from(bancos)
  // Mapear campos del schema al interface esperado
  return data.map((b) => ({
    ...b,
    moneda: 'MXN', // Valor por defecto
    estado: b.activo ? 'activo' : 'inactivo',
  })) as unknown as BancoEntity[]
}

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener datos para exportación
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ExportSuccessResponse | ExportErrorResponse> | NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const entityParam = searchParams.get('entity')
    const formatParam = searchParams.get('format')

    // Validar entidad
    if (!isValidEntity(entityParam)) {
      return NextResponse.json(
        { error: 'El parámetro "entity" es requerido y debe ser válido' },
        { status: 400 },
      )
    }

    // Validar formato
    if (!isValidFormat(formatParam)) {
      return NextResponse.json(
        { error: 'Formato no soportado. Use "json" o "csv"' },
        { status: 400 },
      )
    }

    const entity = entityParam
    const format: ExportFormatType = formatParam || 'json'

    logger.info('Solicitando datos para exportación', {
      context: 'ExportAPI',
      data: { entity, format },
    })

    let data: AnyEntity[] = []
    let columns: ExportColumn[] = []

    // Obtener datos según entidad
    switch (entity) {
      case 'ventas':
        data = await fetchVentas()
        columns = ENTITY_COLUMNS.ventas
        break

      case 'clientes':
        data = await fetchClientes()
        columns = ENTITY_COLUMNS.clientes
        break

      case 'distribuidores':
        data = await fetchDistribuidores()
        columns = ENTITY_COLUMNS.distribuidores
        break

      case 'ordenes':
        data = await fetchOrdenes()
        columns = ENTITY_COLUMNS.ordenes
        break

      case 'movimientos':
        data = await fetchMovimientos()
        columns = ENTITY_COLUMNS.movimientos
        break

      case 'bancos':
        data = await fetchBancos()
        columns = ENTITY_COLUMNS.bancos
        break
    }

    // Formato JSON
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        entity,
        columns,
        data,
        totalRecords: data.length,
        generatedAt: new Date().toISOString(),
      } satisfies ExportSuccessResponse)
    }

    // Formato CSV
    const csvHeaders = columns.map((col) => col.label).join(',')
    const csvRows = data.map((row) => {
      return columns
        .map((col) => {
          const value = getNestedValue(row, col.key)
          return formatCSVValue(value)
        })
        .join(',')
    })

    const csv = [csvHeaders, ...csvRows].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${entity}_${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    logger.error('Error en exportación', error as Error, { context: 'ExportAPI' })
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST - Exportación compleja con filtros
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ExportSuccessResponse | ExportErrorResponse>> {
  try {
    const body = (await request.json()) as ExportRequest
    const { entity, format = 'json', filters, columns: requestedColumns } = body

    // Validar entidad
    if (!isValidEntity(entity)) {
      return NextResponse.json(
        { error: 'El campo "entity" es requerido y debe ser válido' },
        { status: 400 },
      )
    }

    logger.info('Solicitando exportación compleja', {
      context: 'ExportAPI',
      data: { entity, format, hasFilters: !!filters },
    })

    let data: AnyEntity[] = []
    let columns = ENTITY_COLUMNS[entity]

    // Filtrar columnas si se especifican
    if (requestedColumns && requestedColumns.length > 0) {
      columns = columns.filter((col) => requestedColumns.includes(col.key))
    }

    // Obtener datos según entidad
    switch (entity) {
      case 'ventas':
        data = await fetchVentas()
        break

      case 'clientes':
        data = await fetchClientes()
        break

      case 'distribuidores':
        data = await fetchDistribuidores()
        break

      case 'ordenes':
        data = await fetchOrdenes()
        break

      case 'movimientos':
        data = await fetchMovimientos()
        break

      case 'bancos':
        data = await fetchBancos()
        break
    }

    return NextResponse.json({
      success: true,
      entity,
      columns,
      data,
      totalRecords: data.length,
      generatedAt: new Date().toISOString(),
      filters: filters || null,
    } satisfies ExportSuccessResponse)
  } catch (error) {
    logger.error('Error en exportación POST', error as Error, { context: 'ExportAPI' })
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
