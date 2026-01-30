/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📤 CHRONOS INFINITY 2026 — UTILIDAD DE EXPORTACIÓN
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Utilidades para exportar datos en múltiples formatos:
 * - CSV
 * - JSON
 * - Excel (XLSX)
 * - PDF (via print)
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

export type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf'

export interface ExportColumn {
  key: string
  header: string
  formatter?: (value: unknown) => string
}

export interface ExportOptions {
  filename?: string
  columns?: ExportColumn[]
  title?: string
  includeTimestamp?: boolean
  dateFormat?: 'iso' | 'locale'
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const defaultFormatters = {
  currency: (value: unknown): string => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
      }).format(value)
    }
    return String(value ?? '')
  },
  
  date: (value: unknown): string => {
    if (value instanceof Date) {
      return value.toLocaleDateString('es-MX')
    }
    if (typeof value === 'number') {
      return new Date(value).toLocaleDateString('es-MX')
    }
    return String(value ?? '')
  },
  
  datetime: (value: unknown): string => {
    if (value instanceof Date) {
      return value.toLocaleString('es-MX')
    }
    if (typeof value === 'number') {
      return new Date(value).toLocaleString('es-MX')
    }
    return String(value ?? '')
  },
  
  boolean: (value: unknown): string => {
    return value ? 'Sí' : 'No'
  },
  
  percent: (value: unknown): string => {
    if (typeof value === 'number') {
      return `${value.toFixed(2)}%`
    }
    return String(value ?? '')
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CSV EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function escapeCSVValue(value: unknown): string {
  const str = String(value ?? '')
  // Si contiene comas, comillas o saltos de línea, envolver en comillas
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions = {}
): { content: string; filename: string } {
  const { columns, filename = 'export', includeTimestamp = true, title } = options
  
  if (data.length === 0) {
    return { content: '', filename: `${filename}.csv` }
  }
  
  // Determinar columnas
  const cols = columns || Object.keys(data[0]).map(key => ({
    key,
    header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
  }))
  
  const rows: string[] = []
  
  // Título opcional
  if (title) {
    rows.push(title)
    rows.push('')
  }
  
  // Headers
  rows.push(cols.map(col => escapeCSVValue(col.header)).join(','))
  
  // Data rows
  data.forEach(item => {
    const row = cols.map(col => {
      const value = item[col.key]
      const formatted = col.formatter ? col.formatter(value) : value
      return escapeCSVValue(formatted)
    })
    rows.push(row.join(','))
  })
  
  // Timestamp
  if (includeTimestamp) {
    rows.push('')
    rows.push(`Exportado: ${new Date().toLocaleString('es-MX')}`)
  }
  
  const timestamp = includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : ''
  
  return {
    content: rows.join('\n'),
    filename: `${filename}${timestamp}.csv`,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// JSON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function exportToJSON<T>(
  data: T[],
  options: ExportOptions = {}
): { content: string; filename: string } {
  const { filename = 'export', includeTimestamp = true, title } = options
  
  const exportData = {
    ...(title && { title }),
    data,
    exportedAt: includeTimestamp ? new Date().toISOString() : undefined,
    count: data.length,
  }
  
  const timestamp = includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : ''
  
  return {
    content: JSON.stringify(exportData, null, 2),
    filename: `${filename}${timestamp}.json`,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXCEL EXPORT (Simple HTML table that Excel can open)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions = {}
): { content: string; filename: string } {
  const { columns, filename = 'export', includeTimestamp = true, title } = options
  
  if (data.length === 0) {
    return { content: '', filename: `${filename}.xls` }
  }
  
  // Determinar columnas
  const cols = columns || Object.keys(data[0]).map(key => ({
    key,
    header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
  }))
  
  // Construir tabla HTML
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Datos</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; font-family: Arial, sans-serif; }
        th { background-color: #8B5CF6; color: white; padding: 10px; border: 1px solid #ddd; }
        td { padding: 8px; border: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .title { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
        .footer { font-size: 12px; color: #666; margin-top: 20px; }
      </style>
    </head>
    <body>
  `
  
  if (title) {
    html += `<div class="title">${title}</div>`
  }
  
  html += '<table>'
  
  // Headers
  html += '<thead><tr>'
  cols.forEach(col => {
    html += `<th>${col.header}</th>`
  })
  html += '</tr></thead>'
  
  // Data
  html += '<tbody>'
  data.forEach(item => {
    html += '<tr>'
    cols.forEach(col => {
      const value = item[col.key]
      const formatted = col.formatter ? col.formatter(value) : (value ?? '')
      html += `<td>${formatted}</td>`
    })
    html += '</tr>'
  })
  html += '</tbody>'
  
  html += '</table>'
  
  if (includeTimestamp) {
    html += `<div class="footer">Exportado: ${new Date().toLocaleString('es-MX')}</div>`
  }
  
  html += '</body></html>'
  
  const timestamp = includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : ''
  
  return {
    content: html,
    filename: `${filename}${timestamp}.xls`,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DOWNLOAD HELPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UNIFIED EXPORT FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const MIME_TYPES: Record<ExportFormat, string> = {
  csv: 'text/csv;charset=utf-8',
  json: 'application/json;charset=utf-8',
  excel: 'application/vnd.ms-excel',
  pdf: 'application/pdf',
}

export function exportData<T extends Record<string, unknown>>(
  data: T[],
  format: ExportFormat,
  options: ExportOptions = {}
): void {
  let result: { content: string; filename: string }
  
  switch (format) {
    case 'csv':
      result = exportToCSV(data, options)
      break
    case 'json':
      result = exportToJSON(data, options)
      break
    case 'excel':
      result = exportToExcel(data, options)
      break
    case 'pdf':
      // Para PDF, abrir ventana de impresión con el contenido formateado
      const pdfContent = exportToExcel(data, options).content
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(pdfContent)
        printWindow.document.close()
        printWindow.print()
      }
      return
    default:
      throw new Error(`Formato no soportado: ${format}`)
  }
  
  downloadFile(result.content, result.filename, MIME_TYPES[format])
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESET COLUMNS FOR COMMON EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const EXPORT_PRESETS = {
  movimientos: [
    { key: 'id', header: 'ID' },
    { key: 'fecha', header: 'Fecha', formatter: defaultFormatters.datetime },
    { key: 'tipo', header: 'Tipo' },
    { key: 'monto', header: 'Monto', formatter: defaultFormatters.currency },
    { key: 'concepto', header: 'Concepto' },
    { key: 'categoria', header: 'Categoría' },
    { key: 'bancoNombre', header: 'Banco' },
    { key: 'estado', header: 'Estado' },
    { key: 'referencia', header: 'Referencia' },
    { key: 'creadoPorNombre', header: 'Creado Por' },
  ],
  
  clientes: [
    { key: 'id', header: 'ID' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'saldoPendiente', header: 'Saldo Pendiente', formatter: defaultFormatters.currency },
    { key: 'totalCompras', header: 'Total Compras', formatter: defaultFormatters.currency },
    { key: 'scoreCredito', header: 'Score Crédito' },
    { key: 'categoria', header: 'Categoría' },
    { key: 'estado', header: 'Estado' },
  ],
  
  ventas: [
    { key: 'id', header: 'ID' },
    { key: 'fecha', header: 'Fecha', formatter: defaultFormatters.datetime },
    { key: 'clienteNombre', header: 'Cliente' },
    { key: 'total', header: 'Total', formatter: defaultFormatters.currency },
    { key: 'saldoPendiente', header: 'Pendiente', formatter: defaultFormatters.currency },
    { key: 'estado', header: 'Estado' },
    { key: 'metodoPago', header: 'Método de Pago' },
  ],
  
  auditoria: [
    { key: 'id', header: 'ID' },
    { key: 'timestamp', header: 'Fecha/Hora', formatter: defaultFormatters.datetime },
    { key: 'usuarioNombre', header: 'Usuario' },
    { key: 'accion', header: 'Acción' },
    { key: 'modulo', header: 'Módulo' },
    { key: 'descripcion', header: 'Descripción' },
    { key: 'monto', header: 'Monto', formatter: defaultFormatters.currency },
    { key: 'ipAddress', header: 'IP' },
    { key: 'dispositivo', header: 'Dispositivo' },
    { key: 'exitoso', header: 'Exitoso', formatter: defaultFormatters.boolean },
  ],
  
  usuarios: [
    { key: 'id', header: 'ID' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Rol' },
    { key: 'createdAt', header: 'Fecha Creación', formatter: defaultFormatters.datetime },
    { key: 'ultimoAcceso', header: 'Último Acceso', formatter: defaultFormatters.datetime },
  ],
}

export default {
  exportToCSV,
  exportToJSON,
  exportToExcel,
  exportData,
  downloadFile,
  formatters: defaultFormatters,
  presets: EXPORT_PRESETS,
}
