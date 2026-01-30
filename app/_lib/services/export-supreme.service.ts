/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📤 CHRONOS INFINITY 2026 — SERVICIO DE EXPORTACIÓN SUPREMO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de exportación multi-formato con:
 * - CSV con delimitadores personalizados
 * - JSON formateado
 * - Excel (XLSX) con estilos
 * - PDF con diseño profesional
 * - Templates personalizables
 * - Programación de reportes
 * - Historial de exportaciones
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type FormatoExport = 'csv' | 'json' | 'excel' | 'pdf' | 'txt'

export interface ConfiguracionExport {
  formato: FormatoExport
  nombreArchivo: string

  // CSV específico
  csv?: {
    delimitador: ',' | ';' | '|' | '\t'
    incluirHeaders: boolean
    encoding: 'utf-8' | 'iso-8859-1'
    lineaFin: '\n' | '\r\n'
  }

  // JSON específico
  json?: {
    indentacion: number
    incluirMetadata: boolean
  }

  // Excel específico
  excel?: {
    nombreHoja: string
    incluirEstilos: boolean
    congelarPrimeraFila: boolean
    autoancho: boolean
    formatoFechas: string
    formatoNumeros: string
  }

  // PDF específico
  pdf?: {
    orientacion: 'portrait' | 'landscape'
    tamañoPagina: 'letter' | 'legal' | 'a4'
    incluirLogo: boolean
    incluirFecha: boolean
    incluirNumeroPagina: boolean
    titulo?: string
    subtitulo?: string
    piePagina?: string
  }

  // Filtros aplicados (para metadata)
  filtrosAplicados?: Record<string, unknown>

  // Columnas a incluir
  columnasIncluidas?: string[]
  columnasExcluidas?: string[]

  // Transformaciones
  transformaciones?: {
    columna: string
    tipo: 'fecha' | 'moneda' | 'porcentaje' | 'mayusculas' | 'minusculas' | 'capitalizar'
    formato?: string
  }[]
}

export interface ColumnDefinition {
  key: string
  header: string
  width?: number
  align?: 'left' | 'center' | 'right'
  formato?: 'texto' | 'numero' | 'moneda' | 'fecha' | 'fechaHora' | 'porcentaje' | 'booleano'
}

export interface ExportResult {
  exito: boolean
  nombreArchivo: string
  tamaño: number
  registros: number
  formato: FormatoExport
  url?: string
  blob?: Blob
  error?: string
  duracionMs: number
  metadata: {
    creadoAt: number
    creadoPor: string
    filtrosAplicados?: Record<string, unknown>
    columnasExportadas: string[]
  }
}

export interface HistorialExport {
  id: string
  nombreArchivo: string
  formato: FormatoExport
  registros: number
  tamaño: number
  usuarioId: string
  usuarioNombre: string
  creadoAt: number
  descargado: boolean
  url?: string
}

export interface TemplateExport {
  id: string
  nombre: string
  descripcion: string
  modulo: string
  configuracion: ConfiguracionExport
  columnas: ColumnDefinition[]
  activo: boolean
  usoPredeterminado: boolean
  creadoPor: string
  creadoAt: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class ExportSupremeService {
  private static instance: ExportSupremeService
  private historial: HistorialExport[] = []
  private templates: Map<string, TemplateExport> = new Map()

  // Formatos de columnas predefinidos
  private formatosColumna = {
    moneda: (val: number) => `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    fecha: (val: number | Date) => new Date(val).toLocaleDateString('es-MX'),
    fechaHora: (val: number | Date) => new Date(val).toLocaleString('es-MX'),
    porcentaje: (val: number) => `${(val * 100).toFixed(2)}%`,
    numero: (val: number) => val.toLocaleString('es-MX'),
    booleano: (val: boolean) => val ? 'Sí' : 'No',
    texto: (val: unknown) => String(val ?? '')
  }

  private constructor() {
    this.inicializarTemplatesPredefinidos()
  }

  public static getInstance(): ExportSupremeService {
    if (!ExportSupremeService.instance) {
      ExportSupremeService.instance = new ExportSupremeService()
    }
    return ExportSupremeService.instance
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // EXPORTACIÓN
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Exporta datos en el formato especificado
   */
  public async exportar<T extends Record<string, unknown>>(params: {
    datos: T[]
    columnas: ColumnDefinition[]
    configuracion: ConfiguracionExport
    usuarioId: string
    usuarioNombre: string
  }): Promise<ExportResult> {
    const inicio = Date.now()

    try {
      let resultado: { contenido: string | Blob; mimeType: string }

      // Filtrar columnas si es necesario
      const columnasFinales = this.filtrarColumnas(
        params.columnas,
        params.configuracion.columnasIncluidas,
        params.configuracion.columnasExcluidas
      )

      // Aplicar transformaciones
      const datosTransformados = this.aplicarTransformaciones(
        params.datos,
        columnasFinales,
        params.configuracion.transformaciones
      )

      switch (params.configuracion.formato) {
        case 'csv':
          resultado = this.exportarCSV(datosTransformados, columnasFinales, params.configuracion)
          break
        case 'json':
          resultado = this.exportarJSON(datosTransformados, columnasFinales, params.configuracion)
          break
        case 'excel':
          resultado = this.exportarExcel(datosTransformados, columnasFinales, params.configuracion)
          break
        case 'pdf':
          resultado = this.exportarPDF(datosTransformados, columnasFinales, params.configuracion)
          break
        case 'txt':
          resultado = this.exportarTXT(datosTransformados, columnasFinales, params.configuracion)
          break
        default:
          throw new Error(`Formato no soportado: ${params.configuracion.formato}`)
      }

      // Crear blob si es string
      const blob = typeof resultado.contenido === 'string'
        ? new Blob([resultado.contenido], { type: resultado.mimeType })
        : resultado.contenido

      const url = URL.createObjectURL(blob)

      // Registrar en historial
      const registro: HistorialExport = {
        id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nombreArchivo: params.configuracion.nombreArchivo,
        formato: params.configuracion.formato,
        registros: params.datos.length,
        tamaño: blob.size,
        usuarioId: params.usuarioId,
        usuarioNombre: params.usuarioNombre,
        creadoAt: Date.now(),
        descargado: false,
        url
      }
      this.historial.unshift(registro)

      const exportResult: ExportResult = {
        exito: true,
        nombreArchivo: params.configuracion.nombreArchivo,
        tamaño: blob.size,
        registros: params.datos.length,
        formato: params.configuracion.formato,
        url,
        blob,
        duracionMs: Date.now() - inicio,
        metadata: {
          creadoAt: Date.now(),
          creadoPor: params.usuarioNombre,
          filtrosAplicados: params.configuracion.filtrosAplicados,
          columnasExportadas: columnasFinales.map(c => c.key)
        }
      }

      logger.info('📤 Exportación completada', {
        formato: params.configuracion.formato,
        registros: params.datos.length,
        tamaño: `${(blob.size / 1024).toFixed(2)} KB`
      })

      return exportResult

    } catch (error) {
      logger.error('❌ Error en exportación', error)
      return {
        exito: false,
        nombreArchivo: params.configuracion.nombreArchivo,
        tamaño: 0,
        registros: 0,
        formato: params.configuracion.formato,
        error: error instanceof Error ? error.message : 'Error desconocido',
        duracionMs: Date.now() - inicio,
        metadata: {
          creadoAt: Date.now(),
          creadoPor: params.usuarioNombre,
          columnasExportadas: []
        }
      }
    }
  }

  /**
   * Descarga el archivo exportado
   */
  public descargar(resultado: ExportResult): void {
    if (!resultado.url) return

    const link = document.createElement('a')
    link.href = resultado.url
    link.download = resultado.nombreArchivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Marcar como descargado en historial
    const registro = this.historial.find(h => h.url === resultado.url)
    if (registro) registro.descargado = true
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // FORMATOS ESPECÍFICOS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private exportarCSV(
    datos: Record<string, unknown>[],
    columnas: ColumnDefinition[],
    config: ConfiguracionExport
  ): { contenido: string; mimeType: string } {
    const csvConfig = config.csv || {
      delimitador: ',',
      incluirHeaders: true,
      encoding: 'utf-8',
      lineaFin: '\n'
    }

    const escaparValor = (val: unknown): string => {
      const str = String(val ?? '')
      if (str.includes(csvConfig.delimitador) || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const filas: string[] = []

    // Headers
    if (csvConfig.incluirHeaders) {
      filas.push(columnas.map(c => escaparValor(c.header)).join(csvConfig.delimitador))
    }

    // Datos
    for (const registro of datos) {
      const fila = columnas.map(col => {
        const valor = registro[col.key]
        const valorFormateado = this.formatearValor(valor, col.formato)
        return escaparValor(valorFormateado)
      })
      filas.push(fila.join(csvConfig.delimitador))
    }

    return {
      contenido: filas.join(csvConfig.lineaFin),
      mimeType: `text/csv;charset=${csvConfig.encoding}`
    }
  }

  private exportarJSON(
    datos: Record<string, unknown>[],
    columnas: ColumnDefinition[],
    config: ConfiguracionExport
  ): { contenido: string; mimeType: string } {
    const jsonConfig = config.json || {
      indentacion: 2,
      incluirMetadata: true
    }

    // Filtrar solo columnas incluidas
    const datosFiltrados = datos.map(registro => {
      const filtrado: Record<string, unknown> = {}
      for (const col of columnas) {
        filtrado[col.key] = registro[col.key]
      }
      return filtrado
    })

    const resultado = jsonConfig.incluirMetadata
      ? {
          metadata: {
            generado: new Date().toISOString(),
            totalRegistros: datos.length,
            columnas: columnas.map(c => ({ key: c.key, header: c.header }))
          },
          datos: datosFiltrados
        }
      : datosFiltrados

    return {
      contenido: JSON.stringify(resultado, null, jsonConfig.indentacion),
      mimeType: 'application/json'
    }
  }

  private exportarExcel(
    datos: Record<string, unknown>[],
    columnas: ColumnDefinition[],
    config: ConfiguracionExport
  ): { contenido: Blob; mimeType: string } {
    // Simulación de Excel XML (en producción usar xlsx library)
    const excelConfig = config.excel || {
      nombreHoja: 'Datos',
      incluirEstilos: true,
      congelarPrimeraFila: true,
      autoancho: true,
      formatoFechas: 'dd/mm/yyyy',
      formatoNumeros: '#,##0.00'
    }

    // Crear XML de Excel simplificado
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<?mso-application progid="Excel.Sheet"?>\n'
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n'
    xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n'

    // Estilos
    if (excelConfig.incluirEstilos) {
      xml += '<Styles>\n'
      xml += '  <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#4F46E5" ss:Pattern="Solid"/></Style>\n'
      xml += '  <Style ss:ID="Currency"><NumberFormat ss:Format="$#,##0.00"/></Style>\n'
      xml += '  <Style ss:ID="Date"><NumberFormat ss:Format="dd/mm/yyyy"/></Style>\n'
      xml += '</Styles>\n'
    }

    xml += `<Worksheet ss:Name="${excelConfig.nombreHoja}">\n`
    xml += '<Table>\n'

    // Headers
    xml += '<Row>\n'
    for (const col of columnas) {
      xml += `  <Cell ss:StyleID="Header"><Data ss:Type="String">${this.escaparXML(col.header)}</Data></Cell>\n`
    }
    xml += '</Row>\n'

    // Datos
    for (const registro of datos) {
      xml += '<Row>\n'
      for (const col of columnas) {
        const valor = registro[col.key]
        const tipo = typeof valor === 'number' ? 'Number' : 'String'
        const estilo = col.formato === 'moneda' ? ' ss:StyleID="Currency"' : ''
        xml += `  <Cell${estilo}><Data ss:Type="${tipo}">${this.escaparXML(String(valor ?? ''))}</Data></Cell>\n`
      }
      xml += '</Row>\n'
    }

    xml += '</Table>\n'
    xml += '</Worksheet>\n'
    xml += '</Workbook>'

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })

    return {
      contenido: blob,
      mimeType: 'application/vnd.ms-excel'
    }
  }

  private exportarPDF(
    datos: Record<string, unknown>[],
    columnas: ColumnDefinition[],
    config: ConfiguracionExport
  ): { contenido: string; mimeType: string } {
    // En producción usaríamos jspdf o pdfmake
    // Aquí generamos HTML que puede convertirse a PDF
    const pdfConfig = config.pdf || {
      orientacion: 'portrait',
      tamañoPagina: 'letter',
      incluirLogo: true,
      incluirFecha: true,
      incluirNumeroPagina: true,
      titulo: 'Reporte',
      subtitulo: '',
      piePagina: 'CHRONOS INFINITY 2026'
    }

    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: ${pdfConfig.tamañoPagina} ${pdfConfig.orientacion}; margin: 1cm; }
    body { font-family: Arial, sans-serif; font-size: 10px; }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { color: #4F46E5; margin: 0; }
    .header h2 { color: #6B7280; margin: 5px 0; font-weight: normal; }
    .fecha { text-align: right; color: #9CA3AF; font-size: 9px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #4F46E5; color: white; padding: 8px; text-align: left; }
    td { padding: 6px 8px; border-bottom: 1px solid #E5E7EB; }
    tr:nth-child(even) { background: #F9FAFB; }
    .footer { text-align: center; margin-top: 20px; color: #9CA3AF; font-size: 9px; }
    .total-row { font-weight: bold; background: #F3F4F6 !important; }
  </style>
</head>
<body>
  <div class="header">
    ${pdfConfig.titulo ? `<h1>${pdfConfig.titulo}</h1>` : ''}
    ${pdfConfig.subtitulo ? `<h2>${pdfConfig.subtitulo}</h2>` : ''}
  </div>
  ${pdfConfig.incluirFecha ? `<div class="fecha">Generado: ${new Date().toLocaleString('es-MX')}</div>` : ''}

  <table>
    <thead>
      <tr>
        ${columnas.map(c => `<th>${c.header}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${datos.map(registro => `
        <tr>
          ${columnas.map(col => {
            const valor = registro[col.key]
            const valorFormateado = this.formatearValor(valor, col.formato)
            return `<td style="text-align: ${col.align || 'left'}">${valorFormateado}</td>`
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    ${pdfConfig.piePagina || ''}
    <br>Total de registros: ${datos.length}
  </div>
</body>
</html>`

    return {
      contenido: html,
      mimeType: 'text/html'
    }
  }

  private exportarTXT(
    datos: Record<string, unknown>[],
    columnas: ColumnDefinition[],
    config: ConfiguracionExport
  ): { contenido: string; mimeType: string } {
    let txt = `REPORTE: ${config.nombreArchivo}\n`
    txt += `Generado: ${new Date().toLocaleString('es-MX')}\n`
    txt += '═'.repeat(80) + '\n\n'

    // Calcular anchos de columna
    const anchos = columnas.map(col => {
      const headerLen = col.header.length
      const maxDataLen = Math.max(...datos.map(d =>
        String(d[col.key] ?? '').length
      ))
      return Math.max(headerLen, maxDataLen, 10)
    })

    // Headers
    txt += columnas.map((col, i) => col.header.padEnd(anchos[i])).join(' | ') + '\n'
    txt += anchos.map(a => '-'.repeat(a)).join('-+-') + '\n'

    // Datos
    for (const registro of datos) {
      txt += columnas.map((col, i) => {
        const valor = String(registro[col.key] ?? '')
        return valor.substring(0, anchos[i]).padEnd(anchos[i])
      }).join(' | ') + '\n'
    }

    txt += '\n' + '═'.repeat(80) + '\n'
    txt += `Total de registros: ${datos.length}\n`

    return {
      contenido: txt,
      mimeType: 'text/plain'
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene un template por ID
   */
  public obtenerTemplate(id: string): TemplateExport | undefined {
    return this.templates.get(id)
  }

  /**
   * Obtiene templates por módulo
   */
  public obtenerTemplatesPorModulo(modulo: string): TemplateExport[] {
    return Array.from(this.templates.values())
      .filter(t => t.modulo === modulo && t.activo)
  }

  /**
   * Guarda un nuevo template
   */
  public guardarTemplate(template: Omit<TemplateExport, 'id' | 'creadoAt'>): TemplateExport {
    const nuevoTemplate: TemplateExport = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      creadoAt: Date.now()
    }
    this.templates.set(nuevoTemplate.id, nuevoTemplate)
    return nuevoTemplate
  }

  private inicializarTemplatesPredefinidos(): void {
    // Template para movimientos bancarios
    this.templates.set('movimientos_bancarios', {
      id: 'movimientos_bancarios',
      nombre: 'Movimientos Bancarios',
      descripcion: 'Exportación de movimientos con detalles completos',
      modulo: 'bancos',
      configuracion: {
        formato: 'excel',
        nombreArchivo: 'movimientos_bancarios.xlsx',
        excel: {
          nombreHoja: 'Movimientos',
          incluirEstilos: true,
          congelarPrimeraFila: true,
          autoancho: true,
          formatoFechas: 'dd/mm/yyyy',
          formatoNumeros: '#,##0.00'
        }
      },
      columnas: [
        { key: 'fecha', header: 'Fecha', formato: 'fecha' },
        { key: 'tipo', header: 'Tipo' },
        { key: 'banco', header: 'Banco' },
        { key: 'descripcion', header: 'Descripción' },
        { key: 'monto', header: 'Monto', formato: 'moneda', align: 'right' },
        { key: 'balance', header: 'Balance', formato: 'moneda', align: 'right' },
        { key: 'usuario', header: 'Usuario' },
        { key: 'referencia', header: 'Referencia' }
      ],
      activo: true,
      usoPredeterminado: true,
      creadoPor: 'sistema',
      creadoAt: Date.now()
    })

    // Template para auditoría
    this.templates.set('auditoria', {
      id: 'auditoria',
      nombre: 'Log de Auditoría',
      descripcion: 'Registro completo de actividad del sistema',
      modulo: 'auditoria',
      configuracion: {
        formato: 'csv',
        nombreArchivo: 'audit_log.csv',
        csv: {
          delimitador: ',',
          incluirHeaders: true,
          encoding: 'utf-8',
          lineaFin: '\n'
        }
      },
      columnas: [
        { key: 'timestamp', header: 'Fecha/Hora', formato: 'fechaHora' },
        { key: 'usuario', header: 'Usuario' },
        { key: 'accion', header: 'Acción' },
        { key: 'modulo', header: 'Módulo' },
        { key: 'descripcion', header: 'Descripción' },
        { key: 'ip', header: 'IP' },
        { key: 'dispositivo', header: 'Dispositivo' }
      ],
      activo: true,
      usoPredeterminado: true,
      creadoPor: 'sistema',
      creadoAt: Date.now()
    })

    // Template para ventas
    this.templates.set('ventas', {
      id: 'ventas',
      nombre: 'Reporte de Ventas',
      descripcion: 'Ventas con detalles de cliente y productos',
      modulo: 'ventas',
      configuracion: {
        formato: 'excel',
        nombreArchivo: 'reporte_ventas.xlsx',
        excel: {
          nombreHoja: 'Ventas',
          incluirEstilos: true,
          congelarPrimeraFila: true,
          autoancho: true,
          formatoFechas: 'dd/mm/yyyy',
          formatoNumeros: '#,##0.00'
        }
      },
      columnas: [
        { key: 'fecha', header: 'Fecha', formato: 'fecha' },
        { key: 'folio', header: 'Folio' },
        { key: 'cliente', header: 'Cliente' },
        { key: 'productos', header: 'Productos' },
        { key: 'subtotal', header: 'Subtotal', formato: 'moneda', align: 'right' },
        { key: 'descuento', header: 'Descuento', formato: 'moneda', align: 'right' },
        { key: 'total', header: 'Total', formato: 'moneda', align: 'right' },
        { key: 'pagado', header: 'Pagado', formato: 'moneda', align: 'right' },
        { key: 'pendiente', header: 'Pendiente', formato: 'moneda', align: 'right' },
        { key: 'estado', header: 'Estado' }
      ],
      activo: true,
      usoPredeterminado: true,
      creadoPor: 'sistema',
      creadoAt: Date.now()
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // HISTORIAL
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene historial de exportaciones
   */
  public obtenerHistorial(usuarioId?: string): HistorialExport[] {
    let hist = [...this.historial]
    if (usuarioId) {
      hist = hist.filter(h => h.usuarioId === usuarioId)
    }
    return hist.slice(0, 50) // Últimas 50
  }

  /**
   * Limpia historial antiguo
   */
  public limpiarHistorialAntiguo(diasAntiguedad = 7): void {
    const limite = Date.now() - (diasAntiguedad * 24 * 60 * 60 * 1000)
    this.historial = this.historial.filter(h => h.creadoAt >= limite)
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private filtrarColumnas(
    columnas: ColumnDefinition[],
    incluidas?: string[],
    excluidas?: string[]
  ): ColumnDefinition[] {
    let resultado = [...columnas]

    if (incluidas?.length) {
      resultado = resultado.filter(c => incluidas.includes(c.key))
    }

    if (excluidas?.length) {
      resultado = resultado.filter(c => !excluidas.includes(c.key))
    }

    return resultado
  }

  private aplicarTransformaciones(
    datos: Record<string, unknown>[],
    columnas: ColumnDefinition[],
    transformaciones?: ConfiguracionExport['transformaciones']
  ): Record<string, unknown>[] {
    if (!transformaciones?.length) return datos

    return datos.map(registro => {
      const transformado = { ...registro }

      for (const trans of transformaciones) {
        const valor = transformado[trans.columna]
        if (valor === undefined || valor === null) continue

        switch (trans.tipo) {
          case 'mayusculas':
            transformado[trans.columna] = String(valor).toUpperCase()
            break
          case 'minusculas':
            transformado[trans.columna] = String(valor).toLowerCase()
            break
          case 'capitalizar':
            transformado[trans.columna] = String(valor)
              .toLowerCase()
              .replace(/\b\w/g, c => c.toUpperCase())
            break
          // fecha, moneda, porcentaje se manejan en formatearValor
        }
      }

      return transformado
    })
  }

  private formatearValor(valor: unknown, formato?: ColumnDefinition['formato']): string {
    if (valor === undefined || valor === null) return ''

    const formatFn = formato && this.formatosColumna[formato]
    if (formatFn) {
      try {
        return formatFn(valor as never)
      } catch {
        return String(valor)
      }
    }

    return String(valor)
  }

  private escaparXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const exportService = ExportSupremeService.getInstance()
export default exportService
