/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔧 STRING UTILITIES — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Funciones utilitarias para normalización y manipulación de strings.
 * Especialmente importante para nombres de clientes/distribuidores donde
 * la consistencia es crítica para búsquedas y comparaciones.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Normaliza un nombre para búsquedas y comparaciones consistentes.
 *
 * Transformaciones aplicadas:
 * - Trim de espacios al inicio/final
 * - Múltiples espacios → un solo espacio
 * - Lowercase para case-insensitive
 * - Elimina caracteres especiales extra (opcional)
 *
 * @param nombre - String a normalizar
 * @param options - Opciones de normalización
 * @returns String normalizado
 *
 * @example
 * normalizeNombre("  Juan  Pérez  ") // "juan pérez"
 * normalizeNombre("ACME Corp.") // "acme corp."
 */
export function normalizeNombre(
  nombre: string,
  options: {
    lowercase?: boolean
    removeAccents?: boolean
  } = {},
): string {
  const { lowercase = true, removeAccents = false } = options

  let normalized = nombre
    .trim() // Eliminar espacios inicio/final
    .replace(/\s+/g, ' ') // Múltiples espacios → uno solo

  if (lowercase) {
    normalized = normalized.toLowerCase()
  }

  if (removeAccents) {
    normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  return normalized
}

/**
 * Compara dos nombres de forma case-insensitive y tolerante a espacios.
 *
 * @param nombre1 - Primer nombre
 * @param nombre2 - Segundo nombre
 * @returns true si son equivalentes
 *
 * @example
 * compareNombres("Juan Pérez", "juan  perez") // true
 */
export function compareNombres(nombre1: string, nombre2: string): boolean {
  return normalizeNombre(nombre1) === normalizeNombre(nombre2)
}

/**
 * Capitaliza la primera letra de cada palabra.
 *
 * @param str - String a capitalizar
 * @returns String capitalizado
 *
 * @example
 * capitalize("juan pérez") // "Juan Pérez"
 */
export function capitalize(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Trunca un string a una longitud máxima con ellipsis.
 *
 * @param str - String a truncar
 * @param maxLength - Longitud máxima
 * @returns String truncado
 *
 * @example
 * truncate("Very long text here", 10) // "Very long..."
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Formatea un número de teléfono.
 *
 * @param phone - Número de teléfono
 * @returns Teléfono formateado
 *
 * @example
 * formatPhone("1234567890") // "(123) 456-7890"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

/**
 * Slugify un string (para URLs, IDs, etc.).
 *
 * @param str - String a slugificar
 * @returns Slug
 *
 * @example
 * slugify("Juan Pérez García") // "juan-perez-garcia"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
