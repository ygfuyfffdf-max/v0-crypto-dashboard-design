/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                 CHRONOS SYSTEM - EXPORT SERVICE                            ║
 * ║              Sistema de Exportación Multi-Formato                          ║
 * ║                  TypeScript Strict - Zero Any                              ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Servicio completo de exportación para todos los formatos:
 * - PDF (jsPDF)
 * - CSV (nativo)
 * - Excel (exceljs - seguro)
 * - DOCX (docx)
 * - Power BI (JSON)
 *
 * @version 2.0.0 - Diciembre 2025
 * @audit Remediación de tipos - Zero any violations
 */

import { logger } from '@/app/lib/utils/logger'
import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS ESTRICTOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tipos primitivos permitidos en valores de exportación
 */
export type ExportPrimitive = string | number | boolean | Date | null | undefined

/**
 * Objeto exportable con valores primitivos o anidados
 */
export type ExportableRecord = {
  [key: string]: ExportPrimitive | ExportableRecord | ExportPrimitive[]
}

/**
 * Tipo genérico para entidades exportables del dominio
 */
export interface ExportableEntity {
  id: string | number
  [key: string]: ExportPrimitive | ExportableRecord | ExportPrimitive[]
}

/**
 * Definición de columna para exportación
 */
export interface ExportColumn {
  key: string
  label: string
  format?: 'currency' | 'date' | 'number' | 'text'
}

/**
 * Opciones genéricas de exportación con tipo de datos
 */
export interface ExportOptions<T extends ExportableEntity = ExportableEntity> {
  filename: string
  title?: string
  columns: ExportColumn[]
  data: T[]
  metadata?: Record<string, string | number>
}

/**
 * Formatos de exportación soportados
 */
export type ExportFormat = 'pdf' | 'csv' | 'excel' | 'docx' | 'powerbi'

/**
 * Estructura de datos para Power BI
 */
interface PowerBIDataset {
  metadata: {
    generatedAt: string
    title: string
    totalRows: number
    columns: Array<{
      name: string
      label: string
      dataType: 'number' | 'date' | 'text'
    }>
    [key: string]: string | number | Array<{ name: string; label: string; dataType: string }>
  }
  data: Array<Record<string, ExportPrimitive>>
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES DE FORMATO CON TIPOS ESTRICTOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Formatea un valor según el tipo especificado
 * @param value - Valor primitivo a formatear
 * @param format - Tipo de formato a aplicar
 * @returns String formateado
 */
function formatValue(value: ExportPrimitive, format?: ExportColumn['format']): string {
  if (value === null || value === undefined) return ''

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
      }).format(Number(value))

    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString('es-MX')
      }
      if (typeof value === 'string' || typeof value === 'number') {
        return new Date(value).toLocaleDateString('es-MX')
      }
      return String(value)

    case 'number':
      return new Intl.NumberFormat('es-MX').format(Number(value))

    case 'text':
    default:
      return String(value)
  }
}

/**
 * Obtiene el valor de una propiedad anidada usando dot notation
 * @param obj - Objeto del cual extraer el valor
 * @param path - Ruta en dot notation (ej: "cliente.nombre")
 * @returns Valor encontrado o undefined
 */
function getNestedValue<T extends ExportableEntity>(obj: T, path: string): ExportPrimitive {
  const parts = path.split('.')
  let current: ExportPrimitive | ExportableRecord | ExportPrimitive[] = obj

  for (const key of parts) {
    if (current === null || current === undefined) {
      return undefined
    }
    if (typeof current === 'object' && !Array.isArray(current) && !(current instanceof Date)) {
      current = (current as ExportableRecord)[key]
    } else {
      return undefined
    }
  }

  // Verificar que el valor final sea primitivo
  if (
    current === null ||
    current === undefined ||
    typeof current === 'string' ||
    typeof current === 'number' ||
    typeof current === 'boolean' ||
    current instanceof Date
  ) {
    return current as ExportPrimitive
  }

  return undefined
}

/**
 * Type guard para verificar si un valor es primitivo
 */
function isPrimitive(value: unknown): value is ExportPrimitive {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value instanceof Date
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTACIÓN A PDF
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exporta datos a PDF usando jsPDF
 * @param options - Opciones de exportación tipadas
 */
export async function exportToPDF<T extends ExportableEntity>(
  options: ExportOptions<T>,
): Promise<void> {
  try {
    logger.info('Iniciando exportación a PDF', {
      context: 'ExportService',
      data: { filename: options.filename, rows: options.data.length },
    })

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    // Configuración
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const usableWidth = pageWidth - margin * 2

    // Título
    if (options.title) {
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(options.title, margin, 20)
    }

    // Metadata
    let currentY = options.title ? 30 : 20
    if (options.metadata) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      Object.entries(options.metadata).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, margin, currentY)
        currentY += 5
      })
      currentY += 5
    }

    // Calcular ancho de columnas
    const columnWidth = usableWidth / options.columns.length

    // Encabezados de tabla
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(100, 100, 200)
    doc.rect(margin, currentY, usableWidth, 8, 'F')
    doc.setTextColor(255, 255, 255)

    options.columns.forEach((col, i) => {
      const x = margin + i * columnWidth + 2
      doc.text(col.label, x, currentY + 6)
    })

    currentY += 10
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')

    // Datos
    doc.setFontSize(9)
    options.data.forEach((row, rowIndex) => {
      // Nueva página si es necesario
      if (currentY > pageHeight - 20) {
        doc.addPage()
        currentY = 20
      }

      // Alternar color de fila
      if (rowIndex % 2 === 0) {
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, currentY - 5, usableWidth, 7, 'F')
      }

      options.columns.forEach((col, i) => {
        const value = getNestedValue(row, col.key)
        const formattedValue = formatValue(value, col.format)
        const x = margin + i * columnWidth + 2

        // Truncar texto si es muy largo
        const maxWidth = columnWidth - 4
        const truncatedText = doc.splitTextToSize(formattedValue, maxWidth)[0] || ''

        doc.text(truncatedText, x, currentY)
      })

      currentY += 7
    })

    // Footer con fecha
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Generado: ${new Date().toLocaleString('es-MX')} - Página ${i} de ${totalPages}`,
        margin,
        pageHeight - 10,
      )
    }

    // Guardar
    doc.save(`${options.filename}.pdf`)

    logger.info('Exportación PDF completada exitosamente', {
      context: 'ExportService',
      data: { filename: options.filename },
    })
  } catch (error) {
    logger.error('Error en exportación PDF', error as Error, { context: 'ExportService' })
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTACIÓN A CSV
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exporta datos a CSV (nativo)
 * @param options - Opciones de exportación tipadas
 */
export async function exportToCSV<T extends ExportableEntity>(
  options: ExportOptions<T>,
): Promise<void> {
  try {
    logger.info('Iniciando exportación a CSV', {
      context: 'ExportService',
      data: { filename: options.filename, rows: options.data.length },
    })

    // Encabezados
    const headers = options.columns.map((col) => col.label).join(',')

    // Filas de datos
    const rows = options.data.map((row) => {
      return options.columns
        .map((col) => {
          const value = getNestedValue(row, col.key)
          const formattedValue = formatValue(value, col.format)

          // Escapar comillas y envolver en comillas si contiene coma o comillas
          if (
            formattedValue.includes(',') ||
            formattedValue.includes('"') ||
            formattedValue.includes('\n')
          ) {
            return `"${formattedValue.replace(/"/g, '""')}"`
          }
          return formattedValue
        })
        .join(',')
    })

    // Combinar
    const csv = [headers, ...rows].join('\n')

    // BOM para UTF-8 (soporte de Excel para caracteres especiales)
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })

    saveAs(blob, `${options.filename}.csv`)

    logger.info('Exportación CSV completada exitosamente', {
      context: 'ExportService',
      data: { filename: options.filename },
    })
  } catch (error) {
    logger.error('Error en exportación CSV', error as Error, { context: 'ExportService' })
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTACIÓN A EXCEL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tipo para valor de celda de Excel
 */
type ExcelCellValue = string | number | boolean | Date | null

/**
 * Exporta datos a Excel usando exceljs (seguro)
 * @param options - Opciones de exportación tipadas
 */
export async function exportToExcel<T extends ExportableEntity>(
  options: ExportOptions<T>,
): Promise<void> {
  try {
    logger.info('Iniciando exportación a Excel', {
      context: 'ExportService',
      data: { filename: options.filename, rows: options.data.length },
    })

    // Crear workbook con exceljs
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'CHRONOS System'
    workbook.created = new Date()

    // Crear worksheet principal
    const worksheet = workbook.addWorksheet('Datos')

    // Agregar encabezados
    const headers = options.columns.map((col) => col.label)
    const headerRow = worksheet.addRow(headers)

    // Estilo de encabezados
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF6366F1' }, // violet-500
      }
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.alignment = { horizontal: 'center' }
    })

    // Agregar datos
    options.data.forEach((row) => {
      const rowData: ExcelCellValue[] = options.columns.map((col) => {
        const value = getNestedValue(row, col.key)

        // Para Excel, mantener valores numéricos sin formato
        if (col.format === 'currency' || col.format === 'number') {
          return typeof value === 'number' ? value : Number(value) || 0
        }
        if (col.format === 'date') {
          if (value instanceof Date) return value
          if (typeof value === 'string' || typeof value === 'number') {
            return new Date(value)
          }
          return null
        }
        return isPrimitive(value) ? String(value ?? '') : ''
      })
      worksheet.addRow(rowData)
    })

    // Aplicar formato a columnas
    options.columns.forEach((col, index) => {
      const column = worksheet.getColumn(index + 1)
      column.width = Math.max(col.label.length, 15)

      if (col.format === 'currency') {
        column.numFmt = '"$"#,##0.00'
      } else if (col.format === 'number') {
        column.numFmt = '#,##0'
      } else if (col.format === 'date') {
        column.numFmt = 'dd/mm/yyyy'
      }
    })

    // Agregar metadata si existe
    if (options.metadata) {
      const metadataSheet = workbook.addWorksheet('Metadata')
      metadataSheet.addRow(['Campo', 'Valor'])
      Object.entries(options.metadata).forEach(([key, value]) => {
        metadataSheet.addRow([key, String(value)])
      })
    }

    // Guardar
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, `${options.filename}.xlsx`)

    logger.info('Exportación Excel completada exitosamente', {
      context: 'ExportService',
      data: { filename: options.filename },
    })
  } catch (error) {
    logger.error('Error en exportación Excel', error as Error, { context: 'ExportService' })
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTACIÓN A DOCX
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exporta datos a DOCX usando docx
 * @param options - Opciones de exportación tipadas
 */
export async function exportToDOCX<T extends ExportableEntity>(
  options: ExportOptions<T>,
): Promise<void> {
  try {
    logger.info('Iniciando exportación a DOCX', {
      context: 'ExportService',
      data: { filename: options.filename, rows: options.data.length },
    })

    // Crear documento
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Título
            ...(options.title
              ? [
                  new Paragraph({
                    text: options.title,
                    heading: 'Heading1',
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                  }),
                ]
              : []),

            // Metadata
            ...(options.metadata
              ? Object.entries(options.metadata).map(
                  ([key, value]) =>
                    new Paragraph({
                      children: [
                        new TextRun({ text: `${key}: `, bold: true }),
                        new TextRun({ text: String(value) }),
                      ],
                      spacing: { after: 100 },
                    }),
                )
              : []),

            // Espacio antes de tabla
            new Paragraph({ text: '', spacing: { after: 200 } }),

            // Tabla
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                // Encabezados
                new TableRow({
                  children: options.columns.map(
                    (col) =>
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: col.label, bold: true })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        shading: { fill: 'CCCCFF' },
                      }),
                  ),
                }),
                // Datos
                ...options.data.map(
                  (row, rowIndex) =>
                    new TableRow({
                      children: options.columns.map((col) => {
                        const value = getNestedValue(row, col.key)
                        const formattedValue = formatValue(value, col.format)
                        return new TableCell({
                          children: [new Paragraph(formattedValue)],
                          shading: { fill: rowIndex % 2 === 0 ? 'F0F0F0' : 'FFFFFF' },
                        })
                      }),
                    }),
                ),
              ],
            }),

            // Footer con fecha
            new Paragraph({ text: '', spacing: { before: 400 } }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Generado: ${new Date().toLocaleString('es-MX')}`,
                  size: 18,
                  color: '808080',
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        },
      ],
    })

    // Generar y guardar
    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${options.filename}.docx`)

    logger.info('Exportación DOCX completada exitosamente', {
      context: 'ExportService',
      data: { filename: options.filename },
    })
  } catch (error) {
    logger.error('Error en exportación DOCX', error as Error, { context: 'ExportService' })
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTACIÓN PARA POWER BI
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exporta datos en formato JSON optimizado para Power BI
 * @param options - Opciones de exportación tipadas
 */
export async function exportForPowerBI<T extends ExportableEntity>(
  options: ExportOptions<T>,
): Promise<void> {
  try {
    logger.info('Iniciando exportación para Power BI', {
      context: 'ExportService',
      data: { filename: options.filename, rows: options.data.length },
    })

    // Estructura optimizada para Power BI
    const powerBIData: PowerBIDataset = {
      metadata: {
        generatedAt: new Date().toISOString(),
        title: options.title || options.filename,
        totalRows: options.data.length,
        columns: options.columns.map((col) => ({
          name: col.key,
          label: col.label,
          dataType:
            col.format === 'currency' || col.format === 'number'
              ? 'number'
              : col.format === 'date'
                ? 'date'
                : 'text',
        })),
        ...(options.metadata || {}),
      },
      data: options.data.map((row) => {
        const transformedRow: Record<string, ExportPrimitive> = {}
        options.columns.forEach((col) => {
          const value = getNestedValue(row, col.key)

          // Transformar según tipo para Power BI
          if (col.format === 'currency' || col.format === 'number') {
            transformedRow[col.key] = typeof value === 'number' ? value : Number(value) || 0
          } else if (col.format === 'date') {
            if (value instanceof Date) {
              transformedRow[col.key] = value.toISOString()
            } else if (typeof value === 'string' || typeof value === 'number') {
              transformedRow[col.key] = new Date(value).toISOString()
            } else {
              transformedRow[col.key] = null
            }
          } else {
            transformedRow[col.key] = value
          }
        })
        return transformedRow
      }),
    }

    // Convertir a JSON con formato legible
    const jsonString = JSON.stringify(powerBIData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' })

    saveAs(blob, `${options.filename}_powerbi.json`)

    logger.info('Exportación Power BI completada exitosamente', {
      context: 'ExportService',
      data: { filename: options.filename },
    })
  } catch (error) {
    logger.error('Error en exportación Power BI', error as Error, { context: 'ExportService' })
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN UNIFICADA DE EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Función principal que delega a la exportación correspondiente
 * @param format - Formato de exportación deseado
 * @param options - Opciones de exportación tipadas
 */
export async function exportData<T extends ExportableEntity>(
  format: ExportFormat,
  options: ExportOptions<T>,
): Promise<void> {
  switch (format) {
    case 'pdf':
      return exportToPDF(options)
    case 'csv':
      return exportToCSV(options)
    case 'excel':
      return exportToExcel(options)
    case 'docx':
      return exportToDOCX(options)
    case 'powerbi':
      return exportForPowerBI(options)
    default: {
      const exhaustiveCheck: never = format
      throw new Error(`Formato de exportación no soportado: ${exhaustiveCheck}`)
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  exportToPDF,
  exportToCSV,
  exportToExcel,
  exportToDOCX,
  exportForPowerBI,
  exportData,
}
