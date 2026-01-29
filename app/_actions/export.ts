'use server'

/**
 * 📊 EXPORT ACTIONS - Sistema de Exportación Multi-Formato
 *
 * Funciones para exportar datos en múltiples formatos:
 * - PDF
 * - Excel (XLSX)
 * - CSV
 * - DOCX
 * - Power BI (JSON compatible)
 */

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { clientes, distribuidores, movimientos, ordenesCompra, ventas } from '@/database/schema'
import { and, desc, gte, lte } from 'drizzle-orm'

// ============================================
// TIPOS
// ============================================

export interface ExportOptions {
  formato: 'pdf' | 'excel' | 'csv' | 'docx' | 'powerbi'
  entidad:
    | 'ventas'
    | 'clientes'
    | 'distribuidores'
    | 'ordenes'
    | 'bancos'
    | 'movimientos'
    | 'reporte_general'
  fechaDesde?: string
  fechaHasta?: string
  filtros?: Record<string, unknown>
}

export interface ExportResult {
  success: boolean
  data?: unknown
  filename?: string
  mimeType?: string
  error?: string
}

// ============================================
// FUNCIONES DE OBTENCIÓN DE DATOS
// ============================================

async function obtenerDatosVentas(fechaDesde?: string, fechaHasta?: string) {
  const whereConditions = []

  if (fechaDesde) {
    whereConditions.push(gte(ventas.createdAt, new Date(fechaDesde)))
  }
  if (fechaHasta) {
    whereConditions.push(lte(ventas.createdAt, new Date(fechaHasta)))
  }

  const data = await db.query.ventas.findMany({
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    with: {
      cliente: true,
    },
    orderBy: desc(ventas.createdAt),
  })

  return data.map((v) => ({
    id: v.id,
    fecha: v.createdAt?.toISOString().split('T')[0],
    cliente: v.cliente?.nombre || 'N/A',
    cantidad: v.cantidad,
    precioVenta: v.precioVentaUnidad,
    precioCompra: v.precioCompraUnidad,
    flete: v.precioFlete ?? 0,
    total: v.precioTotalVenta,
    pagado: v.montoPagado ?? 0,
    pendiente: v.montoRestante,
    estado: v.estadoPago,
  }))
}

async function obtenerDatosClientes() {
  const data = await db.query.clientes.findMany({
    orderBy: desc(clientes.createdAt),
  })

  return data.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    telefono: c.telefono || 'N/A',
    email: c.email || 'N/A',
    direccion: c.direccion || 'N/A',
    limiteCredito: c.limiteCredito,
    saldoPendiente: c.saldoPendiente,
    estado: c.estado,
    fechaRegistro: c.createdAt?.toISOString().split('T')[0],
  }))
}

async function obtenerDatosDistribuidores() {
  const data = await db.query.distribuidores.findMany({
    orderBy: desc(distribuidores.createdAt),
  })

  return data.map((d) => ({
    id: d.id,
    nombre: d.nombre,
    empresa: d.empresa || 'N/A',
    telefono: d.telefono || 'N/A',
    email: d.email || 'N/A',
    direccion: d.direccion || 'N/A',
    saldoPendiente: d.saldoPendiente ?? 0,
    estado: d.estado,
  }))
}

async function obtenerDatosOrdenes(fechaDesde?: string, fechaHasta?: string) {
  const whereConditions = []

  if (fechaDesde) {
    whereConditions.push(gte(ordenesCompra.createdAt, new Date(fechaDesde)))
  }
  if (fechaHasta) {
    whereConditions.push(lte(ordenesCompra.createdAt, new Date(fechaHasta)))
  }

  const data = await db.query.ordenesCompra.findMany({
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    with: {
      distribuidor: true,
    },
    orderBy: desc(ordenesCompra.createdAt),
  })

  return data.map((o) => ({
    id: o.id,
    fecha: o.createdAt?.toISOString().split('T')[0],
    distribuidor: o.distribuidor?.nombre || 'N/A',
    cantidad: o.cantidad,
    precioUnidad: o.precioUnitario,
    total: o.total,
    pagado: o.montoPagado ?? 0,
    pendiente: o.montoRestante,
    estado: o.estado,
  }))
}

async function obtenerDatosBancos() {
  const data = await db.query.bancos.findMany()

  return data.map((b) => ({
    id: b.id,
    nombre: b.nombre,
    capitalActual: b.capitalActual,
    historicoIngresos: b.historicoIngresos,
    historicoGastos: b.historicoGastos,
    ultimaActualizacion: b.updatedAt?.toISOString().split('T')[0],
  }))
}

async function obtenerDatosMovimientos(fechaDesde?: string, fechaHasta?: string) {
  const whereConditions = []

  if (fechaDesde) {
    whereConditions.push(gte(movimientos.createdAt, new Date(fechaDesde)))
  }
  if (fechaHasta) {
    whereConditions.push(lte(movimientos.createdAt, new Date(fechaHasta)))
  }

  const data = await db.query.movimientos.findMany({
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    orderBy: desc(movimientos.createdAt),
    limit: 1000,
  })

  return data.map((m) => ({
    id: m.id,
    fecha: m.createdAt?.toISOString().split('T')[0],
    tipo: m.tipo,
    concepto: m.concepto,
    monto: m.monto,
    bancoOrigen: m.bancoOrigenId || 'N/A',
    bancoDestino: m.bancoDestinoId || 'N/A',
  }))
}

async function obtenerReporteGeneral(fechaDesde?: string, fechaHasta?: string) {
  // Obtener todos los datos para reporte general
  const [ventasData, clientesData, distribuidoresData, ordenesData, bancosData] = await Promise.all(
    [
      obtenerDatosVentas(fechaDesde, fechaHasta),
      obtenerDatosClientes(),
      obtenerDatosDistribuidores(),
      obtenerDatosOrdenes(fechaDesde, fechaHasta),
      obtenerDatosBancos(),
    ],
  )

  // Calcular métricas
  const totalVentas = ventasData.reduce((sum, v) => sum + v.total, 0)
  const totalPagado = ventasData.reduce((sum, v) => sum + (v.pagado ?? 0), 0)
  const totalPendiente = ventasData.reduce((sum, v) => sum + v.pendiente, 0)
  const capitalTotal = bancosData.reduce((sum, b) => sum + b.capitalActual, 0)

  const utilidades = ventasData.reduce((sum, v) => {
    const flete = v.flete ?? 0
    return sum + (v.precioVenta - v.precioCompra - flete) * v.cantidad
  }, 0)

  return {
    resumen: {
      periodo: { desde: fechaDesde, hasta: fechaHasta },
      totalVentas,
      totalPagado,
      totalPendiente,
      utilidadBruta: utilidades,
      capitalTotal,
      numeroVentas: ventasData.length,
      numeroClientes: clientesData.length,
      numeroDistribuidores: distribuidoresData.length,
      numeroOrdenes: ordenesData.length,
    },
    ventas: ventasData,
    clientes: clientesData,
    distribuidores: distribuidoresData,
    ordenes: ordenesData,
    bancos: bancosData,
  }
}

// ============================================
// FUNCIONES DE FORMATO
// ============================================

function convertirACSV(datos: Record<string, unknown>[]): string {
  if (datos.length === 0) return ''

  const firstRow = datos[0]
  if (!firstRow) return ''

  const headers = Object.keys(firstRow)
  const lines = [headers.join(',')]

  for (const row of datos) {
    const values = headers.map((h) => {
      const value = row[h]
      if (value === null || value === undefined) return ''
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return String(value)
    })
    lines.push(values.join(','))
  }

  return lines.join('\n')
}

function generarJSONPowerBI(datos: unknown) {
  // Formato compatible con Power BI
  const dataArray = datos && Array.isArray(datos) ? datos : []
  return JSON.stringify(
    {
      datasetName: 'CHRONOS_Export',
      tables: [
        {
          name: 'Data',
          columns:
            dataArray.length > 0
              ? Object.keys(dataArray[0] as Record<string, unknown>).map((key) => ({
                  name: key,
                  dataType:
                    typeof (dataArray[0] as Record<string, unknown>)[key] === 'number'
                      ? 'Int64'
                      : 'string',
                }))
              : [],
          rows: dataArray,
        },
      ],
      exportedAt: new Date().toISOString(),
      source: 'CHRONOS Infinity 2026',
    },
    null,
    2,
  )
}

// ============================================
// FUNCIONES PRINCIPALES DE EXPORTACIÓN
// ============================================

/**
 * Exportar datos en el formato especificado
 */
export async function exportarDatos(options: ExportOptions): Promise<ExportResult> {
  try {
    logger.info('Iniciando exportación', {
      context: 'exportActions',
      data: options,
    })

    // Obtener datos según entidad
    let datos: unknown

    switch (options.entidad) {
      case 'ventas':
        datos = await obtenerDatosVentas(options.fechaDesde, options.fechaHasta)
        break
      case 'clientes':
        datos = await obtenerDatosClientes()
        break
      case 'distribuidores':
        datos = await obtenerDatosDistribuidores()
        break
      case 'ordenes':
        datos = await obtenerDatosOrdenes(options.fechaDesde, options.fechaHasta)
        break
      case 'bancos':
        datos = await obtenerDatosBancos()
        break
      case 'movimientos':
        datos = await obtenerDatosMovimientos(options.fechaDesde, options.fechaHasta)
        break
      case 'reporte_general':
        datos = await obtenerReporteGeneral(options.fechaDesde, options.fechaHasta)
        break
      default:
        return { success: false, error: 'Entidad no válida' }
    }

    // Formatear según tipo de exportación
    let contenido: string
    let mimeType: string
    let extension: string

    switch (options.formato) {
      case 'csv':
        contenido = Array.isArray(datos) ? convertirACSV(datos as Record<string, unknown>[]) : ''
        mimeType = 'text/csv'
        extension = 'csv'
        break

      case 'excel':
        // Para Excel, devolvemos JSON que el cliente convertirá usando xlsx
        contenido = JSON.stringify(datos)
        mimeType = 'application/json'
        extension = 'xlsx'
        break

      case 'pdf':
        // Para PDF, devolvemos datos estructurados que el cliente renderizará
        contenido = JSON.stringify({
          titulo: `Reporte de ${options.entidad}`,
          fecha: new Date().toISOString(),
          datos,
        })
        mimeType = 'application/json'
        extension = 'pdf'
        break

      case 'docx':
        // Para DOCX, devolvemos datos estructurados
        contenido = JSON.stringify({
          titulo: `Documento de ${options.entidad}`,
          fecha: new Date().toISOString(),
          datos,
        })
        mimeType = 'application/json'
        extension = 'docx'
        break

      case 'powerbi':
        contenido = generarJSONPowerBI(datos)
        mimeType = 'application/json'
        extension = 'json'
        break

      default:
        return { success: false, error: 'Formato no soportado' }
    }

    const filename = `CHRONOS_${options.entidad}_${new Date().toISOString().split('T')[0]}.${extension}`

    logger.info('Exportación completada', {
      context: 'exportActions',
      data: { filename, registros: Array.isArray(datos) ? datos.length : 1 },
    })

    return {
      success: true,
      data: contenido,
      filename,
      mimeType,
    }
  } catch (error) {
    logger.error('Error en exportación', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

/**
 * Exportar ventas con distribución GYA
 */
export async function exportarVentasConGYA(
  fechaDesde?: string,
  fechaHasta?: string,
): Promise<ExportResult> {
  try {
    const ventasData = await obtenerDatosVentas(fechaDesde, fechaHasta)

    // Añadir cálculos GYA
    const ventasConGYA = ventasData.map((v) => {
      const flete = v.flete ?? 0
      return {
        ...v,
        // Distribución GYA
        montoBovedaMonte: v.precioCompra * v.cantidad,
        montoFletes: flete * v.cantidad,
        montoUtilidades: (v.precioVenta - v.precioCompra - flete) * v.cantidad,
        margenPorcentaje:
          (((v.precioVenta - v.precioCompra - flete) / v.precioVenta) * 100).toFixed(2) + '%',
      }
    })

    // Resumen totales
    const totales = {
      totalVentas: ventasConGYA.reduce((s, v) => s + v.total, 0),
      totalBovedaMonte: ventasConGYA.reduce((s, v) => s + v.montoBovedaMonte, 0),
      totalFletes: ventasConGYA.reduce((s, v) => s + v.montoFletes, 0),
      totalUtilidades: ventasConGYA.reduce((s, v) => s + v.montoUtilidades, 0),
    }

    return {
      success: true,
      data: JSON.stringify({ ventas: ventasConGYA, totales }),
      filename: `CHRONOS_VentasGYA_${new Date().toISOString().split('T')[0]}.json`,
      mimeType: 'application/json',
    }
  } catch (error) {
    logger.error('Error exportando ventas GYA', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

/**
 * Obtener métricas para dashboard
 */
export async function obtenerMetricasDashboard() {
  try {
    const [ventasData, bancosData, clientesData] = await Promise.all([
      obtenerDatosVentas(),
      obtenerDatosBancos(),
      obtenerDatosClientes(),
    ])

    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

    const ventasMes = ventasData.filter((v) => new Date(v.fecha || '') >= inicioMes)

    return {
      success: true,
      data: {
        // KPIs principales
        capitalTotal: bancosData.reduce((s, b) => s + b.capitalActual, 0),
        ventasMes: ventasMes.reduce((s, v) => s + v.total, 0),
        utilidadesMes: ventasMes.reduce((s, v) => {
          const flete = v.flete ?? 0
          return s + (v.precioVenta - v.precioCompra - flete) * v.cantidad
        }, 0),
        clientesActivos: clientesData.filter((c) => c.estado === 'activo').length,
        cuentasPorCobrar: clientesData.reduce((s, c) => s + (c.saldoPendiente ?? 0), 0),

        // Por banco
        bancos: bancosData,

        // Tendencias (últimas 10 ventas)
        ultimasVentas: ventasData.slice(0, 10),
      },
    }
  } catch (error) {
    logger.error('Error obteniendo métricas', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}
