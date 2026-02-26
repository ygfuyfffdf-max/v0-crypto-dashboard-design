// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * ✅ CHRONOS INFINITY 2030 — SISTEMA DE VALIDACIÓN AVANZADO
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de validación ultra-avanzado con:
 * - Schemas Zod pre-definidos para todas las entidades
 * - Validación async con debounce
 * - Mensajes de error personalizados en español
 * - Transformaciones automáticas
 * - Validación de negocio integrada
 * - Composición de schemas
 * 
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════════════════
// MENSAJES DE ERROR PERSONALIZADOS
// ═══════════════════════════════════════════════════════════════════════════════════════

const ERROR_MESSAGES = {
  required: 'Este campo es requerido',
  invalid_type: 'Tipo de dato inválido',
  too_small: 'El valor es demasiado pequeño',
  too_big: 'El valor es demasiado grande',
  invalid_string: {
    email: 'Email inválido',
    url: 'URL inválida',
    uuid: 'UUID inválido',
    regex: 'Formato inválido',
  },
  invalid_number: 'Número inválido',
  invalid_date: 'Fecha inválida',
  custom: 'Valor inválido',
}

// Custom error map para Zod
const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === 'undefined') {
        return { message: ERROR_MESSAGES.required }
      }
      return { message: ERROR_MESSAGES.invalid_type }
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        if (issue.minimum === 1) {
          return { message: ERROR_MESSAGES.required }
        }
        return { message: `Mínimo ${issue.minimum} caracteres` }
      }
      if (issue.type === 'number') {
        return { message: `Mínimo ${issue.minimum}` }
      }
      return { message: ERROR_MESSAGES.too_small }
    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        return { message: `Máximo ${issue.maximum} caracteres` }
      }
      if (issue.type === 'number') {
        return { message: `Máximo ${issue.maximum}` }
      }
      return { message: ERROR_MESSAGES.too_big }
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'email') {
        return { message: ERROR_MESSAGES.invalid_string.email }
      }
      if (issue.validation === 'url') {
        return { message: ERROR_MESSAGES.invalid_string.url }
      }
      return { message: ERROR_MESSAGES.invalid_string.regex }
    default:
      return { message: ctx.defaultError }
  }
}

// Activar custom error map globalmente
z.setErrorMap(customErrorMap)

// ═══════════════════════════════════════════════════════════════════════════════════════
// VALIDATORS BASE
// ═══════════════════════════════════════════════════════════════════════════════════════

export const validators = {
  // Strings
  string: {
    required: () => z.string().min(1, ERROR_MESSAGES.required),
    optional: () => z.string().optional(),
    nullable: () => z.string().nullable(),
    email: () => z.string().email(ERROR_MESSAGES.invalid_string.email),
    phone: () => z.string().regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,}$/,
      'Teléfono inválido (ej: +52 555 123 4567)'
    ),
    url: () => z.string().url(ERROR_MESSAGES.invalid_string.url),
    uuid: () => z.string().uuid(ERROR_MESSAGES.invalid_string.uuid),
    minLength: (min: number) => z.string().min(min, `Mínimo ${min} caracteres`),
    maxLength: (max: number) => z.string().max(max, `Máximo ${max} caracteres`),
    length: (min: number, max: number) => 
      z.string().min(min).max(max),
    alphanumeric: () => z.string().regex(/^[a-zA-Z0-9]+$/, 'Solo letras y números'),
  },

  // Numbers
  number: {
    required: () => z.number({ invalid_type_error: ERROR_MESSAGES.invalid_number }),
    positive: () => z.number().positive('Debe ser un número positivo'),
    nonnegative: () => z.number().nonnegative('No puede ser negativo'),
    integer: () => z.number().int('Debe ser un número entero'),
    min: (min: number) => z.number().min(min, `Mínimo ${min}`),
    max: (max: number) => z.number().max(max, `Máximo ${max}`),
    range: (min: number, max: number) => 
      z.number().min(min).max(max),
    percentage: () => z.number().min(0).max(100, 'Porcentaje debe ser 0-100'),
  },

  // Money
  money: {
    mxn: () => z.number()
      .nonnegative('El monto no puede ser negativo')
      .multipleOf(0.01, 'Máximo 2 decimales'),
    usd: () => z.number()
      .nonnegative('El monto no puede ser negativo')
      .multipleOf(0.01, 'Máximo 2 decimales'),
    positive: () => z.number()
      .positive('El monto debe ser mayor a 0')
      .multipleOf(0.01, 'Máximo 2 decimales'),
  },

  // Dates
  date: {
    required: () => z.date({ invalid_type_error: ERROR_MESSAGES.invalid_date }),
    future: () => z.date().refine(
      (date) => date > new Date(),
      'La fecha debe ser futura'
    ),
    past: () => z.date().refine(
      (date) => date < new Date(),
      'La fecha debe ser pasada'
    ),
    notFuture: () => z.date().refine(
      (date) => date <= new Date(),
      'La fecha no puede ser futura'
    ),
    range: (start: Date, end: Date) => z.date()
      .min(start, `Fecha mínima: ${start.toLocaleDateString()}`)
      .max(end, `Fecha máxima: ${end.toLocaleDateString()}`),
  },

  // Boolean
  boolean: {
    required: () => z.boolean(),
    true: () => z.literal(true, { errorMap: () => ({ message: 'Debe aceptar' }) }),
  },

  // Arrays
  array: {
    required: <T extends z.ZodTypeAny>(schema: T) => 
      z.array(schema).min(1, 'Seleccione al menos uno'),
    minLength: <T extends z.ZodTypeAny>(schema: T, min: number) => 
      z.array(schema).min(min, `Mínimo ${min} elementos`),
    maxLength: <T extends z.ZodTypeAny>(schema: T, max: number) => 
      z.array(schema).max(max, `Máximo ${max} elementos`),
  },

  // Enums
  enum: <T extends [string, ...string[]]>(values: T) => 
    z.enum(values, { errorMap: () => ({ message: 'Seleccione una opción válida' }) }),
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// BANCO ID ENUM
// ═══════════════════════════════════════════════════════════════════════════════════════

export const BancoIdSchema = z.enum([
  'boveda_monte',
  'boveda_usa', 
  'utilidades',
  'flete_sur',
  'azteca',
  'leftie',
  'profit',
])

export type BancoIdType = z.infer<typeof BancoIdSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS DE ENTIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════

// Cliente Schema
export const ClienteSchema = z.object({
  id: z.string().optional(),
  nombre: validators.string.required().pipe(z.string().min(2, 'Mínimo 2 caracteres')),
  telefono: validators.string.phone().optional().or(z.literal('')),
  email: validators.string.email().optional().or(z.literal('')),
  direccion: z.string().optional(),
  rfc: z.string()
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, 'RFC inválido')
    .optional()
    .or(z.literal('')),
  notas: z.string().max(500, 'Máximo 500 caracteres').optional(),
  activo: z.boolean().default(true),
})

export type ClienteInput = z.infer<typeof ClienteSchema>

// Distribuidor Schema
export const DistribuidorSchema = z.object({
  id: z.string().optional(),
  nombre: validators.string.required().pipe(z.string().min(2, 'Mínimo 2 caracteres')),
  contacto: z.string().optional(),
  telefono: validators.string.phone().optional().or(z.literal('')),
  email: validators.string.email().optional().or(z.literal('')),
  direccion: z.string().optional(),
  tiempoEntrega: validators.number.nonnegative().optional(),
  calificacion: validators.number.range(1, 5).optional(),
  notas: z.string().max(500).optional(),
  activo: z.boolean().default(true),
})

export type DistribuidorInput = z.infer<typeof DistribuidorSchema>

// Venta Schema
export const VentaSchema = z.object({
  clienteId: z.string().optional(),
  clienteNombre: validators.string.required(),
  cantidad: validators.number.integer()
    .pipe(z.number().min(1, 'Mínimo 1 unidad')),
  precioVentaUnidad: validators.money.positive(),
  precioCompraUnidad: validators.money.nonnegative(),
  precioFlete: validators.money.nonnegative().default(0),
  abonoInicial: validators.money.nonnegative().default(0),
  observaciones: z.string().max(1000).optional(),
}).refine(
  (data) => data.precioVentaUnidad > data.precioCompraUnidad,
  {
    message: 'El precio de venta debe ser mayor al precio de compra',
    path: ['precioVentaUnidad'],
  }
).refine(
  (data) => {
    const total = data.cantidad * data.precioVentaUnidad
    return data.abonoInicial <= total
  },
  {
    message: 'El abono no puede ser mayor al total de la venta',
    path: ['abonoInicial'],
  }
)

export type VentaInput = z.infer<typeof VentaSchema>

// Orden de Compra Schema
export const OrdenCompraSchema = z.object({
  distribuidorId: z.string().optional(),
  distribuidorNombre: validators.string.required(),
  cantidad: validators.number.integer()
    .pipe(z.number().min(1, 'Mínimo 1 unidad')),
  precioUnitario: validators.money.positive(),
  costoTransporte: validators.money.nonnegative().default(0),
  pagoInicial: validators.money.nonnegative().default(0),
  bancoOrigen: BancoIdSchema.optional(),
  numeroOrden: z.string().optional(),
  observaciones: z.string().max(1000).optional(),
}).refine(
  (data) => {
    const total = (data.cantidad * data.precioUnitario) + data.costoTransporte
    return data.pagoInicial <= total
  },
  {
    message: 'El pago inicial no puede ser mayor al total',
    path: ['pagoInicial'],
  }
)

export type OrdenCompraInput = z.infer<typeof OrdenCompraSchema>

// Transferencia Schema
export const TransferenciaSchema = z.object({
  bancoOrigenId: BancoIdSchema,
  bancoDestinoId: BancoIdSchema,
  monto: validators.money.positive(),
  concepto: validators.string.required().pipe(z.string().min(3, 'Mínimo 3 caracteres')),
  referencia: z.string().optional(),
}).refine(
  (data) => data.bancoOrigenId !== data.bancoDestinoId,
  {
    message: 'El banco origen y destino deben ser diferentes',
    path: ['bancoDestinoId'],
  }
)

export type TransferenciaInput = z.infer<typeof TransferenciaSchema>

// Gasto Schema
export const GastoSchema = z.object({
  bancoId: BancoIdSchema,
  monto: validators.money.positive(),
  concepto: validators.string.required().pipe(z.string().min(3)),
  categoria: z.enum([
    'operativo',
    'nomina',
    'servicios',
    'impuestos',
    'mantenimiento',
    'marketing',
    'otro',
  ]).optional(),
  fecha: z.date().optional(),
  comprobante: z.string().optional(),
  observaciones: z.string().max(500).optional(),
})

export type GastoInput = z.infer<typeof GastoSchema>

// Abono a Venta Schema
export const AbonoVentaSchema = z.object({
  ventaId: validators.string.required(),
  monto: validators.money.positive(),
  metodoPago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque']).optional(),
  referencia: z.string().optional(),
  observaciones: z.string().max(500).optional(),
})

export type AbonoVentaInput = z.infer<typeof AbonoVentaSchema>

// Abono a Orden de Compra Schema
export const AbonoOrdenSchema = z.object({
  ordenId: validators.string.required(),
  monto: validators.money.positive(),
  bancoOrigenId: BancoIdSchema,
  referencia: z.string().optional(),
  observaciones: z.string().max(500).optional(),
})

export type AbonoOrdenInput = z.infer<typeof AbonoOrdenSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS DE BÚSQUEDA Y FILTRADO
// ═══════════════════════════════════════════════════════════════════════════════════════

export const SearchFiltersSchema = z.object({
  query: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  estado: z.enum(['activa', 'pagada', 'cancelada', 'pendiente', 'parcial', 'completo']).optional(),
  bancoId: BancoIdSchema.optional(),
  clienteId: z.string().optional(),
  distribuidorId: z.string().optional(),
  montoMin: validators.money.nonnegative().optional(),
  montoMax: validators.money.nonnegative().optional(),
  page: validators.number.nonnegative().default(0),
  pageSize: validators.number.range(10, 100).default(25),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate
    }
    return true
  },
  {
    message: 'La fecha inicial debe ser anterior a la fecha final',
    path: ['endDate'],
  }
).refine(
  (data) => {
    if (data.montoMin && data.montoMax) {
      return data.montoMin <= data.montoMax
    }
    return true
  },
  {
    message: 'El monto mínimo debe ser menor al máximo',
    path: ['montoMax'],
  }
)

export type SearchFilters = z.infer<typeof SearchFiltersSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS DE CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════

export const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'cyber']).default('dark'),
  language: z.enum(['es', 'en']).default('es'),
  currency: z.enum(['MXN', 'USD']).default('MXN'),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sound: z.boolean().default(true),
  }),
  dashboard: z.object({
    defaultPanel: z.string().default('dashboard'),
    showAnimations: z.boolean().default(true),
    compactMode: z.boolean().default(false),
  }),
})

export type UserPreferences = z.infer<typeof UserPreferencesSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Valida datos contra un schema y retorna resultado tipado
 */
export async function validateAsync<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): Promise<{ success: true; data: z.infer<T> } | { success: false; errors: z.ZodError }> {
  try {
    const result = await schema.parseAsync(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

/**
 * Valida datos sincrónicamente
 */
export function validateSync<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

/**
 * Extrae errores de validación en formato simple
 */
export function extractErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  
  for (const issue of error.errors) {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = issue.message
    }
  }
  
  return errors
}

/**
 * Valida un campo individual
 */
export function validateField<T extends z.ZodTypeAny>(
  schema: T,
  fieldName: string,
  value: unknown
): string | null {
  const fieldSchema = (schema as z.ZodObject<Record<string, z.ZodTypeAny>>).shape[fieldName]
  if (!fieldSchema) return null

  try {
    fieldSchema.parse(value)
    return null
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Campo inválido'
    }
    return 'Error de validación'
  }
}

/**
 * Crea un schema parcial para updates
 */
export function createPartialSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.partial()
}

/**
 * Combina schemas con merge
 */
export function mergeSchemas<A extends z.ZodRawShape, B extends z.ZodRawShape>(
  schemaA: z.ZodObject<A>,
  schemaB: z.ZodObject<B>
) {
  return schemaA.merge(schemaB)
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TRANSFORMADORES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Transforma string a número (para inputs de formulario)
 */
export const stringToNumber = z.string()
  .transform((val) => {
    const num = parseFloat(val.replace(/,/g, ''))
    return isNaN(num) ? 0 : num
  })

/**
 * Transforma string a fecha
 */
export const stringToDate = z.string()
  .transform((val) => new Date(val))
  .pipe(z.date())

/**
 * Normaliza strings (trim + lowercase)
 */
export const normalizedString = z.string()
  .transform((val) => val.trim().toLowerCase())

/**
 * Capitaliza primera letra
 */
export const capitalizedString = z.string()
  .transform((val) => val.trim())
  .transform((val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase())

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export { z } from 'zod'
export type { ZodError, ZodSchema } from 'zod'
