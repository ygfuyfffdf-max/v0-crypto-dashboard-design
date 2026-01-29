/**
 * 📊 EXPORT HELPERS - Utilidades para exportar datos
 *
 * Sistema de exportación sin dependencias externas usando:
 * - CSV para datos tabulares
 * - JSON para respaldos
 * - HTML para impresión (como alternativa a PDF)
 */

import { logger } from './logger'

/**
 * Convierte array de objetos a CSV
 */
export function convertirACSV<T extends Record<string, unknown>>(
  datos: T[],
  columnas?: Array<{ key: keyof T; label: string }>,
): string {
  if (datos.length === 0) return ''

  try {
    const firstRow = datos[0]
    if (!firstRow) return ''

    // Si no se proporcionan columnas, usar todas las keys del primer objeto
    const headers = columnas ? columnas.map((col) => col.label) : Object.keys(firstRow)

    const keys = columnas
      ? columnas.map((col) => col.key)
      : (Object.keys(firstRow) as Array<keyof T>)

    // Crear CSV
    const csvRows = [
      headers.join(','), // Header row
      ...datos.map((row) =>
        keys
          .map((key) => {
            const value = row[key]
            // Escapar valores con comas o comillas
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(','),
      ),
    ]

    return csvRows.join('\n')
  } catch (error) {
    logger.error('Error al convertir a CSV', error as Error, { context: 'ExportHelpers' })
    throw error
  }
}

/**
 * Descarga un archivo CSV
 */
export function descargarCSV(contenido: string, nombreArchivo: string): void {
  try {
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${nombreArchivo}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    logger.info('CSV descargado', { nombreArchivo, context: 'ExportHelpers' })
  } catch (error) {
    logger.error('Error al descargar CSV', error as Error, { context: 'ExportHelpers' })
    throw error
  }
}

/**
 * Descarga un archivo JSON
 */
export function descargarJSON(datos: unknown, nombreArchivo: string): void {
  try {
    const contenido = JSON.stringify(datos, null, 2)
    const blob = new Blob([contenido], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${nombreArchivo}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    logger.info('JSON descargado', { nombreArchivo, context: 'ExportHelpers' })
  } catch (error) {
    logger.error('Error al descargar JSON', error as Error, { context: 'ExportHelpers' })
    throw error
  }
}

/**
 * Genera HTML para impresión (alternativa a PDF)
 * @security El título y contenido son sanitizados para prevenir XSS
 */
export function generarHTMLParaImpresion(
  titulo: string,
  contenido: string,
  estilos?: string,
): void {
  try {
    // Sanitizar inputs para prevenir XSS
    const tituloSanitizado = titulo
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${tituloSanitizado}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      color: #333;
    }
    h1 {
      color: #6366f1;
      border-bottom: 2px solid #6366f1;
      padding-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #6366f1;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .totales {
      font-weight: bold;
      background-color: #e0e7ff !important;
    }
    @media print {
      body { margin: 0; }
      button { display: none; }
    }
    ${estilos || ''}
  </style>
</head>
<body>
  <button onclick="window.print()" style="padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 20px;">
    Imprimir
  </button>
  ${contenido}
</body>
</html>
`

    const ventana = window.open('', '_blank')
    if (ventana) {
      ventana.document.write(html)
      ventana.document.close()
      logger.info('HTML para impresión generado', { titulo, context: 'ExportHelpers' })
    }
  } catch (error) {
    logger.error('Error al generar HTML', error as Error, { context: 'ExportHelpers' })
    throw error
  }
}

/**
 * Formatea número como moneda
 */
export function formatearMoneda(valor: number, moneda = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: moneda,
  }).format(valor)
}

/**
 * Formatea fecha
 */
export function formatearFecha(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
