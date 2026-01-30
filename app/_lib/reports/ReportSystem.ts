/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📊 CHRONOS INFINITY 2030 — SISTEMA DE REPORTES AVANZADO
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de generación de reportes ultra-premium con:
 * - Generación de reportes financieros
 * - Exportación a múltiples formatos (CSV, Excel, PDF)
 * - Agregaciones y cálculos automáticos
 * - Templates de reportes predefinidos
 * - Filtros y rangos de fecha
 * - Scheduling de reportes
 * 
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

export type ReportType = 
  | 'ventas'
  | 'compras'
  | 'movimientos'
  | 'bancos'
  | 'clientes'
  | 'distribuidores'
  | 'rentabilidad'
  | 'inventario'
  | 'general'

export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json'

export type DateRange = 
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'thisYear'
  | 'lastYear'
  | 'custom'

export interface ReportFilters {
  dateRange: DateRange
  startDate?: Date
  endDate?: Date
  bancoId?: string
  clienteId?: string
  distribuidorId?: string
  estado?: string
  categoria?: string
  montoMin?: number
  montoMax?: number
}

export interface ReportColumn {
  key: string
  label: string
  type: 'string' | 'number' | 'money' | 'date' | 'percentage' | 'boolean'
  align?: 'left' | 'center' | 'right'
  width?: number
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
  format?: (value: unknown) => string
}

export interface ReportConfig {
  id: string
  name: string
  description?: string
  type: ReportType
  columns: ReportColumn[]
  defaultFilters?: Partial<ReportFilters>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  groupBy?: string
}

export interface ReportResult<T = Record<string, unknown>> {
  config: ReportConfig
  filters: ReportFilters
  data: T[]
  totals: Record<string, number>
  metadata: {
    generatedAt: Date
    totalRows: number
    filteredRows: number
    executionTime: number
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES DE FECHA
// ═══════════════════════════════════════════════════════════════════════════════════════

export function getDateRangeValues(range: DateRange): { start: Date; end: Date } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (range) {
    case 'today':
      return { start: today, end: now }
    
    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const endOfYesterday = new Date(today)
      endOfYesterday.setMilliseconds(-1)
      return { start: yesterday, end: endOfYesterday }
    }
    
    case 'last7days': {
      const start = new Date(today)
      start.setDate(start.getDate() - 7)
      return { start, end: now }
    }
    
    case 'last30days': {
      const start = new Date(today)
      start.setDate(start.getDate() - 30)
      return { start, end: now }
    }
    
    case 'thisMonth':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
      }
    
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      return { start, end }
    }
    
    case 'thisQuarter': {
      const quarterStart = Math.floor(now.getMonth() / 3) * 3
      return {
        start: new Date(now.getFullYear(), quarterStart, 1),
        end: now,
      }
    }
    
    case 'lastQuarter': {
      const currentQuarter = Math.floor(now.getMonth() / 3)
      const lastQuarterStart = (currentQuarter - 1) * 3
      const year = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear()
      const adjustedQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1
      return {
        start: new Date(year, adjustedQuarter * 3, 1),
        end: new Date(now.getFullYear(), currentQuarter * 3, 0, 23, 59, 59, 999),
      }
    }
    
    case 'thisYear':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: now,
      }
    
    case 'lastYear':
      return {
        start: new Date(now.getFullYear() - 1, 0, 1),
        end: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999),
      }
    
    case 'custom':
    default:
      return { start: today, end: now }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FORMATEADORES
// ═══════════════════════════════════════════════════════════════════════════════════════

const formatters = {
  money: (value: number, currency = 'MXN') => 
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(value),

  number: (value: number, decimals = 0) =>
    new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value),

  percentage: (value: number) => `${value.toFixed(2)}%`,

  date: (value: Date | string) => {
    const date = typeof value === 'string' ? new Date(value) : value
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  },

  datetime: (value: Date | string) => {
    const date = typeof value === 'string' ? new Date(value) : value
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  },

  boolean: (value: boolean) => value ? 'Sí' : 'No',
}

export function formatCellValue(value: unknown, type: ReportColumn['type']): string {
  if (value === null || value === undefined) return '-'

  switch (type) {
    case 'money':
      return formatters.money(Number(value))
    case 'number':
      return formatters.number(Number(value))
    case 'percentage':
      return formatters.percentage(Number(value))
    case 'date':
      return formatters.date(value as Date | string)
    case 'boolean':
      return formatters.boolean(Boolean(value))
    case 'string':
    default:
      return String(value)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// AGREGACIONES
// ═══════════════════════════════════════════════════════════════════════════════════════

export function calculateAggregation(
  data: Record<string, unknown>[],
  column: ReportColumn
): number {
  if (!column.aggregation) return 0

  const values = data
    .map((row) => row[column.key])
    .filter((v) => v !== null && v !== undefined)
    .map((v) => Number(v))
    .filter((v) => !isNaN(v))

  if (values.length === 0) return 0

  switch (column.aggregation) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0)
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length
    case 'count':
      return values.length
    case 'min':
      return Math.min(...values)
    case 'max':
      return Math.max(...values)
    default:
      return 0
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTACIÓN CSV
// ═══════════════════════════════════════════════════════════════════════════════════════

export function exportToCSV<T extends Record<string, unknown>>(
  result: ReportResult<T>,
  filename?: string
): void {
  const { config, data, totals } = result
  const rows: string[] = []

  // Header
  const headers = config.columns.map((col) => `"${col.label}"`)
  rows.push(headers.join(','))

  // Data rows
  for (const row of data) {
    const values = config.columns.map((col) => {
      const value = row[col.key]
      const formatted = formatCellValue(value, col.type)
      return `"${formatted.replace(/"/g, '""')}"`
    })
    rows.push(values.join(','))
  }

  // Totals row
  if (Object.keys(totals).length > 0) {
    rows.push('') // Empty row
    const totalsRow = config.columns.map((col) => {
      if (totals[col.key] !== undefined) {
        return `"${formatCellValue(totals[col.key], col.type)}"`
      }
      return col.key === config.columns[0]?.key ? '"TOTALES"' : '""'
    })
    rows.push(totalsRow.join(','))
  }

  // Create and download file
  const csv = '\uFEFF' + rows.join('\n') // BOM for Excel UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `${config.name}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  
  URL.revokeObjectURL(url)
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTACIÓN JSON
// ═══════════════════════════════════════════════════════════════════════════════════════

export function exportToJSON<T extends Record<string, unknown>>(
  result: ReportResult<T>,
  filename?: string
): void {
  const json = JSON.stringify(result, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `${result.config.name}_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  URL.revokeObjectURL(url)
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TEMPLATES DE REPORTES PREDEFINIDOS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const REPORT_TEMPLATES: Record<ReportType, ReportConfig> = {
  ventas: {
    id: 'ventas',
    name: 'Reporte de Ventas',
    description: 'Listado detallado de todas las ventas',
    type: 'ventas',
    columns: [
      { key: 'fecha', label: 'Fecha', type: 'date', width: 100 },
      { key: 'clienteNombre', label: 'Cliente', type: 'string', width: 150 },
      { key: 'cantidad', label: 'Cantidad', type: 'number', align: 'right', aggregation: 'sum' },
      { key: 'precioVentaUnidad', label: 'Precio Unit.', type: 'money', align: 'right' },
      { key: 'precioTotalVenta', label: 'Total', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'montoPagado', label: 'Pagado', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'montoRestante', label: 'Pendiente', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'estado', label: 'Estado', type: 'string', width: 100 },
    ],
    sortBy: 'fecha',
    sortOrder: 'desc',
  },

  compras: {
    id: 'compras',
    name: 'Reporte de Compras',
    description: 'Listado de órdenes de compra',
    type: 'compras',
    columns: [
      { key: 'fecha', label: 'Fecha', type: 'date', width: 100 },
      { key: 'distribuidorNombre', label: 'Distribuidor', type: 'string', width: 150 },
      { key: 'numeroOrden', label: '# Orden', type: 'string', width: 100 },
      { key: 'cantidad', label: 'Cantidad', type: 'number', align: 'right', aggregation: 'sum' },
      { key: 'precioUnitario', label: 'Precio Unit.', type: 'money', align: 'right' },
      { key: 'total', label: 'Total', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'montoPagado', label: 'Pagado', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'montoRestante', label: 'Pendiente', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'estado', label: 'Estado', type: 'string', width: 100 },
    ],
    sortBy: 'fecha',
    sortOrder: 'desc',
  },

  movimientos: {
    id: 'movimientos',
    name: 'Reporte de Movimientos',
    description: 'Movimientos financieros detallados',
    type: 'movimientos',
    columns: [
      { key: 'fecha', label: 'Fecha', type: 'date', width: 100 },
      { key: 'bancoNombre', label: 'Banco', type: 'string', width: 120 },
      { key: 'tipo', label: 'Tipo', type: 'string', width: 100 },
      { key: 'concepto', label: 'Concepto', type: 'string', width: 200 },
      { key: 'ingreso', label: 'Ingreso', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'gasto', label: 'Gasto', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'saldo', label: 'Saldo', type: 'money', align: 'right' },
    ],
    sortBy: 'fecha',
    sortOrder: 'desc',
  },

  bancos: {
    id: 'bancos',
    name: 'Reporte de Bancos',
    description: 'Estado de cuentas bancarias',
    type: 'bancos',
    columns: [
      { key: 'nombre', label: 'Banco', type: 'string', width: 150 },
      { key: 'moneda', label: 'Moneda', type: 'string', width: 80 },
      { key: 'capitalActual', label: 'Capital Actual', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'historicoIngresos', label: 'Total Ingresos', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'historicoGastos', label: 'Total Gastos', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'ultimaActualizacion', label: 'Última Actualiz.', type: 'date', width: 120 },
    ],
    sortBy: 'capitalActual',
    sortOrder: 'desc',
  },

  clientes: {
    id: 'clientes',
    name: 'Reporte de Clientes',
    description: 'Análisis de clientes',
    type: 'clientes',
    columns: [
      { key: 'nombre', label: 'Cliente', type: 'string', width: 180 },
      { key: 'telefono', label: 'Teléfono', type: 'string', width: 120 },
      { key: 'totalVentas', label: 'Total Ventas', type: 'number', align: 'right', aggregation: 'sum' },
      { key: 'montoTotal', label: 'Monto Total', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'montoPagado', label: 'Pagado', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'saldoPendiente', label: 'Pendiente', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'ultimaCompra', label: 'Última Compra', type: 'date', width: 110 },
    ],
    sortBy: 'montoTotal',
    sortOrder: 'desc',
  },

  distribuidores: {
    id: 'distribuidores',
    name: 'Reporte de Distribuidores',
    description: 'Análisis de distribuidores',
    type: 'distribuidores',
    columns: [
      { key: 'nombre', label: 'Distribuidor', type: 'string', width: 180 },
      { key: 'contacto', label: 'Contacto', type: 'string', width: 150 },
      { key: 'totalOrdenes', label: 'Total Órdenes', type: 'number', align: 'right', aggregation: 'sum' },
      { key: 'montoTotal', label: 'Monto Total', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'montoPagado', label: 'Pagado', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'adeudo', label: 'Adeudo', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'calificacion', label: 'Rating', type: 'number', width: 80 },
    ],
    sortBy: 'montoTotal',
    sortOrder: 'desc',
  },

  rentabilidad: {
    id: 'rentabilidad',
    name: 'Reporte de Rentabilidad',
    description: 'Análisis de márgenes y rentabilidad',
    type: 'rentabilidad',
    columns: [
      { key: 'periodo', label: 'Período', type: 'string', width: 100 },
      { key: 'ventasBrutas', label: 'Ventas Brutas', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'costoVentas', label: 'Costo Ventas', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'fletes', label: 'Fletes', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'utilidadBruta', label: 'Utilidad Bruta', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'margenBruto', label: 'Margen Bruto', type: 'percentage', align: 'right' },
      { key: 'gastos', label: 'Gastos', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'utilidadNeta', label: 'Utilidad Neta', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'margenNeto', label: 'Margen Neto', type: 'percentage', align: 'right' },
    ],
    sortBy: 'periodo',
    sortOrder: 'desc',
  },

  inventario: {
    id: 'inventario',
    name: 'Reporte de Inventario',
    description: 'Estado del almacén',
    type: 'inventario',
    columns: [
      { key: 'producto', label: 'Producto', type: 'string', width: 200 },
      { key: 'stockActual', label: 'Stock', type: 'number', align: 'right', aggregation: 'sum' },
      { key: 'costoPromedio', label: 'Costo Promedio', type: 'money', align: 'right' },
      { key: 'valorInventario', label: 'Valor Inventario', type: 'money', align: 'right', aggregation: 'sum' },
      { key: 'entradas', label: 'Entradas', type: 'number', align: 'right', aggregation: 'sum' },
      { key: 'salidas', label: 'Salidas', type: 'number', align: 'right', aggregation: 'sum' },
      { key: 'rotacion', label: 'Rotación', type: 'number', align: 'right' },
    ],
    sortBy: 'valorInventario',
    sortOrder: 'desc',
  },

  general: {
    id: 'general',
    name: 'Reporte General',
    description: 'Resumen ejecutivo del negocio',
    type: 'general',
    columns: [
      { key: 'metrica', label: 'Métrica', type: 'string', width: 200 },
      { key: 'periodo_actual', label: 'Período Actual', type: 'money', align: 'right' },
      { key: 'periodo_anterior', label: 'Período Anterior', type: 'money', align: 'right' },
      { key: 'variacion', label: 'Variación', type: 'percentage', align: 'right' },
      { key: 'tendencia', label: 'Tendencia', type: 'string', width: 100 },
    ],
    sortBy: 'metrica',
    sortOrder: 'asc',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CLASE REPORT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════════════

export class ReportBuilder<T extends Record<string, unknown>> {
  private config: ReportConfig
  private data: T[] = []
  private filters: ReportFilters = { dateRange: 'thisMonth' }
  private transformers: Array<(data: T[]) => T[]> = []

  constructor(configOrType: ReportConfig | ReportType) {
    if (typeof configOrType === 'string') {
      this.config = { ...REPORT_TEMPLATES[configOrType] }
    } else {
      this.config = configOrType
    }
  }

  setData(data: T[]): this {
    this.data = data
    return this
  }

  setFilters(filters: Partial<ReportFilters>): this {
    this.filters = { ...this.filters, ...filters }
    return this
  }

  addTransformer(transformer: (data: T[]) => T[]): this {
    this.transformers.push(transformer)
    return this
  }

  sortBy(column: string, order: 'asc' | 'desc' = 'asc'): this {
    this.config.sortBy = column
    this.config.sortOrder = order
    return this
  }

  groupBy(column: string): this {
    this.config.groupBy = column
    return this
  }

  build(): ReportResult<T> {
    const startTime = performance.now()

    // Apply transformers
    let processedData = [...this.data]
    for (const transformer of this.transformers) {
      processedData = transformer(processedData)
    }

    // Apply date filter
    if (this.filters.startDate || this.filters.endDate) {
      processedData = processedData.filter((row) => {
        const rowDate = row.fecha || row.createdAt
        if (!rowDate) return true

        const date = new Date(rowDate as string | Date)
        if (this.filters.startDate && date < this.filters.startDate) return false
        if (this.filters.endDate && date > this.filters.endDate) return false
        return true
      })
    }

    // Apply sorting
    if (this.config.sortBy) {
      const sortKey = this.config.sortBy
      const sortOrder = this.config.sortOrder === 'desc' ? -1 : 1

      processedData.sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]

        if (aVal === bVal) return 0
        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1

        return (aVal < bVal ? -1 : 1) * sortOrder
      })
    }

    // Calculate totals
    const totals: Record<string, number> = {}
    for (const column of this.config.columns) {
      if (column.aggregation) {
        totals[column.key] = calculateAggregation(processedData as Record<string, unknown>[], column)
      }
    }

    const executionTime = performance.now() - startTime

    return {
      config: this.config,
      filters: this.filters,
      data: processedData,
      totals,
      metadata: {
        generatedAt: new Date(),
        totalRows: this.data.length,
        filteredRows: processedData.length,
        executionTime,
      },
    }
  }

  export(format: ExportFormat, filename?: string): void {
    const result = this.build()

    switch (format) {
      case 'csv':
        exportToCSV(result, filename)
        break
      case 'json':
        exportToJSON(result, filename)
        break
      case 'xlsx':
        // TODO: Implement Excel export
        console.warn('Excel export not implemented yet')
        break
      case 'pdf':
        // TODO: Implement PDF export
        console.warn('PDF export not implemented yet')
        break
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════════════

export function createReport<T extends Record<string, unknown>>(
  type: ReportType
): ReportBuilder<T> {
  return new ReportBuilder<T>(type)
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export { formatters }
