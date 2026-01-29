/**
 * 🕐 TIMESTAMP SCHEMA - CHRONOS SYSTEM
 *
 * Schema Zod para validación de timestamps.
 * Usa Date nativo de JavaScript (compatible con SQLite/Drizzle).
 *
 * @module lib/schemas/timestamp
 */

import { z } from 'zod'

/**
 * Schema para validar timestamps
 * Acepta: Date de JS, número (unix timestamp), o string ISO
 */
export const TimestampSchema = z.union([
  // Date de JavaScript
  z.date(),
  // Unix timestamp (milisegundos)
  z.number().transform((val) => new Date(val)),
  // String ISO 8601
  z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Debe ser una fecha válida en formato ISO',
    })
    .transform((val) => new Date(val)),
])

/**
 * @deprecated Usar TimestampSchema - alias para compatibilidad
 */
export const FirestoreTimestampSchema = TimestampSchema

/**
 * Schema para timestamps opcionales (común en createdAt/updatedAt)
 */
export const OptionalTimestampSchema = TimestampSchema.optional()

/**
 * Schema para fechas que pueden venir como string o Date
 */
export const FlexibleDateSchema = z.union([
  z.date(),
  z.string().transform((val) => new Date(val)),
  z.number().transform((val) => new Date(val)),
])

/**
 * Schema para historial de pagos con timestamp tipado
 */
export const HistorialPagoSchema = z.object({
  fecha: TimestampSchema,
  monto: z.number().positive('El monto debe ser positivo'),
  bancoOrigen: z.string().optional(),
  ordenCompraId: z.string().optional(),
  ventaId: z.string().optional(),
})

export type HistorialPago = z.infer<typeof HistorialPagoSchema>

/**
 * Helper para convertir cualquier timestamp a Date
 */
export function toDate(timestamp: Date | string | number): Date {
  if (timestamp instanceof Date) {
    return timestamp
  }
  if (typeof timestamp === 'number') {
    return new Date(timestamp)
  }
  return new Date(timestamp)
}

/**
 * Helper para formatear timestamp a string ISO
 */
export function toISOString(timestamp: Date | string | number): string {
  return toDate(timestamp).toISOString()
}

/**
 * Helper para obtener timestamp actual como ISO string (para SQLite)
 */
export function nowISO(): string {
  return new Date().toISOString()
}

/**
 * Helper para obtener timestamp actual como Date
 */
export function nowDate(): Date {
  return new Date()
}
