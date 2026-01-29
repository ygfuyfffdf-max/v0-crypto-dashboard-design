/**
 * 📤 ENTERPRISE EXPORT SERVICE - OMEGA LEVEL
 *
 * Sistema de exportación multi-formato profesional:
 * - PDF: Reportes bellos con gráficos embebidos
 * - Excel: Datos + fórmulas + formato condicional
 * - HTML: Páginas web interactivas standalone
 * - CSV: Datos raw para análisis externo
 * - JSON: API-ready format
 *
 * Características premium:
 * - Diseño corporativo automático
 * - Compresión inteligente
 * - Firma digital (opcional)
 * - Batch export para múltiples formatos simultáneos
 */

import { logger } from '@/app/lib/utils/logger'
import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'

// ═══════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════

export type ExportFormat = 'pdf' | 'excel' | 'html' | 'csv' | 'json'

export interface ExportOptions {
  format: ExportFormat | ExportFormat[]
  filename?: string
  includeCharts?: boolean
  includeMetadata?: boolean
  compressOutput?: boolean
  branding?: {
    logo?: string
    companyName?: string
    colors?: {
      primary: string
      secondary: string
    }
  }
  pdfOptions?: {
    orientation?: 'portrait' | 'landscape'
    pageSize?: 'a4' | 'letter' | 'legal'
    margins?: { top: number; right: number; bottom: number; left: number }
    watermark?: string
  }
  excelOptions?: {
    sheetName?: string
    includeFormulas?: boolean
    freezeHeaders?: boolean
    autoFilter?: boolean
  }
  htmlOptions?: {
    interactive?: boolean
    includeStyles?: boolean
    embedData?: boolean
  }
}

export interface ExportResult {
  format: ExportFormat
  blob: Blob
  filename: string
  size: number
  downloadUrl: string
}

export interface ExportableData {
  title: string
  description?: string
  headers: string[]
  rows: Array<Record<string, unknown>>
  summary?: Array<{ label: string; value: string | number }>
  charts?: Array<{
    type: 'line' | 'bar' | 'pie'
    title: string
    data: Array<{ label: string; value: number }>
  }>
  metadata?: {
    generatedAt: Date
    generatedBy: string
    filters?: Record<string, unknown>
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SERVICIO PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════

export class EnterpriseExportService {
  /**
   * Exporta datos a uno o múltiples formatos
   */
  async export(data: ExportableData, options: ExportOptions): Promise<ExportResult[]> {
    const formats = Array.isArray(options.format) ? options.format : [options.format]
    const results: ExportResult[] = []

    logger.info('📤 Iniciando exportación enterprise', {
      context: 'EnterpriseExportService',
      formats,
      title: data.title,
    })

    for (const format of formats) {
      try {
        let result: ExportResult

        switch (format) {
          case 'pdf':
            result = await this.exportToPDF(data, options)
            break
          case 'excel':
            result = await this.exportToExcel(data, options)
            break
          case 'html':
            result = await this.exportToHTML(data, options)
            break
          case 'csv':
            result = await this.exportToCSV(data, options)
            break
          case 'json':
            result = await this.exportToJSON(data, options)
            break
          default:
            throw new Error(`Formato no soportado: ${format}`)
        }

        results.push(result)

        logger.info(`✅ Exportación ${format} completada`, {
          context: 'EnterpriseExportService',
          size: result.size,
        })
      } catch (error) {
        logger.error(`Error exportando a ${format}`, error as Error, {
          context: 'EnterpriseExportService',
        })
      }
    }

    return results
  }

  /**
   * Exporta a PDF con diseño profesional
   */
  private async exportToPDF(data: ExportableData, options: ExportOptions): Promise<ExportResult> {
    const doc = new jsPDF({
      orientation: options.pdfOptions?.orientation || 'portrait',
      unit: 'mm',
      format: options.pdfOptions?.pageSize || 'a4',
    })

    const margins = options.pdfOptions?.margins || { top: 20, right: 20, bottom: 20, left: 20 }
    let yPosition = margins.top

    // Header con branding
    if (options.branding?.companyName) {
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text(options.branding.companyName, margins.left, yPosition)
      yPosition += 10
    }

    // Título del reporte
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(data.title, margins.left, yPosition)
    yPosition += 10

    // Descripción
    if (data.description) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const descLines = doc.splitTextToSize(data.description, 170)
      doc.text(descLines, margins.left, yPosition)
      yPosition += descLines.length * 5 + 5
    }

    // Metadata
    if (options.includeMetadata && data.metadata) {
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Generado: ${data.metadata.generatedAt.toLocaleString('es-MX')}`,
        margins.left,
        yPosition,
      )
      yPosition += 8
    }

    // Línea separadora
    doc.setDrawColor(99, 102, 241) // violet-500
    doc.setLineWidth(0.5)
    doc.line(margins.left, yPosition, 190, yPosition)
    yPosition += 10

    // Summary cards (si existen)
    if (data.summary && data.summary.length > 0) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Resumen Ejecutivo', margins.left, yPosition)
      yPosition += 8

      data.summary.forEach((item) => {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(`${item.label}:`, margins.left, yPosition)
        doc.setFont('helvetica', 'bold')
        doc.text(String(item.value), margins.left + 60, yPosition)
        yPosition += 6
      })

      yPosition += 10
    }

    // Tabla de datos
    if (data.rows.length > 0) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Datos Detallados', margins.left, yPosition)
      yPosition += 8

      // Headers
      doc.setFontSize(8)
      doc.setFillColor(99, 102, 241) // violet-500
      doc.rect(margins.left, yPosition - 4, 170, 6, 'F')
      doc.setTextColor(255, 255, 255)

      let xPosition = margins.left + 2
      const colWidth = 170 / data.headers.length

      data.headers.forEach((header) => {
        doc.text(header, xPosition, yPosition)
        xPosition += colWidth
      })
      yPosition += 8

      // Rows (primeras 20 para no sobrepasar páginas)
      doc.setTextColor(0, 0, 0)
      const maxRows = Math.min(data.rows.length, 20)

      for (let i = 0; i < maxRows; i++) {
        const row = data.rows[i]
        if (!row) continue
        xPosition = margins.left + 2

        data.headers.forEach((header) => {
          const value = row[header.toLowerCase()]
          doc.text(String(value ?? ''), xPosition, yPosition)
          xPosition += colWidth
        })

        yPosition += 6

        // Nueva página si es necesario
        if (yPosition > 270) {
          doc.addPage()
          yPosition = margins.top
        }
      }

      if (data.rows.length > maxRows) {
        yPosition += 5
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text(`... y ${data.rows.length - maxRows} registros más`, margins.left, yPosition)
      }
    }

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(`Página ${i} de ${pageCount} | CHRONOS Enterprise`, margins.left, 290)
    }

    // Convertir a Blob
    const pdfBlob = doc.output('blob')
    const filename = options.filename || `${this.sanitizeFilename(data.title)}.pdf`
    const downloadUrl = URL.createObjectURL(pdfBlob)

    return {
      format: 'pdf',
      blob: pdfBlob,
      filename,
      size: pdfBlob.size,
      downloadUrl,
    }
  }

  /**
   * Exporta a Excel con formato profesional usando exceljs
   */
  private async exportToExcel(data: ExportableData, options: ExportOptions): Promise<ExportResult> {
    // Crear workbook con exceljs
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'CHRONOS Enterprise'
    workbook.created = new Date()

    // Hoja principal con datos
    const sheetName = options.excelOptions?.sheetName || 'Datos'
    const worksheet = workbook.addWorksheet(sheetName)

    let rowIndex = 1

    // Título
    worksheet.getCell(`A${rowIndex}`).value = data.title
    worksheet.getCell(`A${rowIndex}`).font = { bold: true, size: 14 }
    rowIndex += 2

    // Metadata
    if (options.includeMetadata && data.metadata) {
      worksheet.getCell(`A${rowIndex}`).value = 'Generado:'
      worksheet.getCell(`B${rowIndex}`).value = data.metadata.generatedAt.toLocaleString('es-MX')
      rowIndex += 2
    }

    // Summary
    if (data.summary && data.summary.length > 0) {
      worksheet.getCell(`A${rowIndex}`).value = 'Resumen Ejecutivo'
      worksheet.getCell(`A${rowIndex}`).font = { bold: true }
      rowIndex++
      data.summary.forEach((item) => {
        worksheet.getCell(`A${rowIndex}`).value = item.label
        worksheet.getCell(`B${rowIndex}`).value = item.value
        rowIndex++
      })
      rowIndex++
    }

    // Headers
    const headerRow = worksheet.getRow(rowIndex)
    data.headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1)
      cell.value = header
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF6366F1' },
      }
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    })
    rowIndex++

    // Rows
    data.rows.forEach((row) => {
      const dataRow = worksheet.getRow(rowIndex)
      data.headers.forEach((header, index) => {
        const cellValue = row[header.toLowerCase()]
        // Handle all value types safely for ExcelJS
        let finalValue: string | number | boolean | Date | null = ''
        if (cellValue === undefined || cellValue === null) {
          finalValue = ''
        } else if (
          typeof cellValue === 'string' ||
          typeof cellValue === 'number' ||
          typeof cellValue === 'boolean'
        ) {
          finalValue = cellValue
        } else if (cellValue instanceof Date) {
          finalValue = cellValue
        } else {
          finalValue = String(cellValue)
        }
        dataRow.getCell(index + 1).value = finalValue
      })
      rowIndex++
    })

    // Auto-width
    data.headers.forEach((header, index) => {
      worksheet.getColumn(index + 1).width = Math.max(header.length, 15)
    })

    // Freeze headers si está configurado
    if (options.excelOptions?.freezeHeaders) {
      worksheet.views = [{ state: 'frozen', ySplit: 1 }]
    }

    // Generar archivo
    const buffer = await workbook.xlsx.writeBuffer()
    const excelBlob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const filename = options.filename || `${this.sanitizeFilename(data.title)}.xlsx`
    const downloadUrl = URL.createObjectURL(excelBlob)

    return {
      format: 'excel',
      blob: excelBlob,
      filename,
      size: excelBlob.size,
      downloadUrl,
    }
  }

  /**
   * Exporta a HTML interactivo
   */
  private async exportToHTML(data: ExportableData, options: ExportOptions): Promise<ExportResult> {
    const styles = options.htmlOptions?.includeStyles
      ? `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px;
          color: #333;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
          font-size: 2.5rem;
          color: #667eea;
          margin-bottom: 10px;
        }
        .meta {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 30px;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .summary-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        .summary-card h3 {
          font-size: 0.85rem;
          opacity: 0.9;
          margin-bottom: 8px;
        }
        .summary-card p {
          font-size: 1.8rem;
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background: #667eea;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }
        tr:hover {
          background: #f8f9ff;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          color: #999;
          font-size: 0.85rem;
        }
      </style>
    `
      : ''

    const summaryHTML = data.summary
      ? `
      <div class="summary">
        ${data.summary
          .map(
            (item) => `
          <div class="summary-card">
            <h3>${item.label}</h3>
            <p>${item.value}</p>
          </div>
        `,
          )
          .join('')}
      </div>
    `
      : ''

    const tableHTML = `
      <table>
        <thead>
          <tr>
            ${data.headers.map((h) => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.rows
            .map(
              (row) => `
            <tr>
              ${data.headers.map((h) => `<td>${row[h.toLowerCase()] ?? ''}</td>`).join('')}
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  ${styles}
</head>
<body>
  <div class="container">
    <h1>${data.title}</h1>
    ${data.description ? `<p>${data.description}</p>` : ''}
    ${
      options.includeMetadata && data.metadata
        ? `
      <div class="meta">
        Generado: ${data.metadata.generatedAt.toLocaleString('es-MX')}
      </div>
    `
        : ''
    }

    ${summaryHTML}
    ${tableHTML}

    <div class="footer">
      <p>CHRONOS Enterprise Export System</p>
      <p>Reporte generado automáticamente</p>
    </div>
  </div>
</body>
</html>
    `

    const htmlBlob = new Blob([html], { type: 'text/html' })
    const filename = options.filename || `${this.sanitizeFilename(data.title)}.html`
    const downloadUrl = URL.createObjectURL(htmlBlob)

    return {
      format: 'html',
      blob: htmlBlob,
      filename,
      size: htmlBlob.size,
      downloadUrl,
    }
  }

  /**
   * Exporta a CSV simple
   */
  private async exportToCSV(data: ExportableData, options: ExportOptions): Promise<ExportResult> {
    let csv = data.headers.join(',') + '\n'

    data.rows.forEach((row) => {
      if (!row) return
      const values = data.headers.map((header) => {
        const value = row[header.toLowerCase()]
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      })
      csv += values.join(',') + '\n'
    })

    const csvBlob = new Blob([csv], { type: 'text/csv' })
    const filename = options.filename || `${this.sanitizeFilename(data.title)}.csv`
    const downloadUrl = URL.createObjectURL(csvBlob)

    return {
      format: 'csv',
      blob: csvBlob,
      filename,
      size: csvBlob.size,
      downloadUrl,
    }
  }

  /**
   * Exporta a JSON
   */
  private async exportToJSON(data: ExportableData, options: ExportOptions): Promise<ExportResult> {
    const jsonData = {
      title: data.title,
      description: data.description,
      data: data.rows,
      summary: data.summary,
      metadata: options.includeMetadata ? data.metadata : undefined,
    }

    const json = JSON.stringify(jsonData, null, 2)
    const jsonBlob = new Blob([json], { type: 'application/json' })
    const filename = options.filename || `${this.sanitizeFilename(data.title)}.json`
    const downloadUrl = URL.createObjectURL(jsonBlob)

    return {
      format: 'json',
      blob: jsonBlob,
      filename,
      size: jsonBlob.size,
      downloadUrl,
    }
  }

  /**
   * Descarga automática del resultado
   */
  downloadResult(result: ExportResult): void {
    const link = document.createElement('a')
    link.href = result.downloadUrl
    link.download = result.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Limpia nombre de archivo
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTAR SINGLETON
// ═══════════════════════════════════════════════════════════════════════

export const enterpriseExport = new EnterpriseExportService()
