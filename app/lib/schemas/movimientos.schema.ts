/**
 * 💸 SCHEMAS DE MOVIMIENTOS - CHRONOS SYSTEM
 *
 * Schemas Zod para validación de movimientos financieros
 * incluyendo ingresos, gastos, transferencias y abonos.
 *
 * @version 1.0.0
 */

import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

/** Categorías de gastos disponibles */
export const CATEGORIAS_GASTOS = [
  'Transporte',
  'Servicios',
  'Nómina',
  'Mantenimiento',
  'Marketing',
  'Impuestos',
  'Operaciones',
  'Otros',
] as const

export type CategoriaGasto = (typeof CATEGORIAS_GASTOS)[number]

/** Tipos de movimientos */
export const TIPOS_MOVIMIENTO = [
  'ingreso',
  'gasto',
  'transferencia_entrada',
  'transferencia_salida',
  'abono',
  'pago',
] as const

export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number]

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMAS PRIMITIVOS
// ═══════════════════════════════════════════════════════════════════════════

export const CategoriaGastoSchema = z.enum(CATEGORIAS_GASTOS, {
  errorMap: () => ({
    message:
      'Categoría inválida. Usar: Transporte, Servicios, Nómina, Mantenimiento, Marketing, Impuestos, Operaciones, Otros',
  }),
})

export const TipoMovimientoSchema = z.enum(TIPOS_MOVIMIENTO, {
  errorMap: () => ({
    message: 'Tipo de movimiento inválido',
  }),
})

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA DE MOVIMIENTO BASE
// ═══════════════════════════════════════════════════════════════════════════

export const MovimientoBaseSchema = z.object({
  id: z.string().uuid(),
  bancoId: z.string().min(1, 'Banco requerido'),
  tipo: TipoMovimientoSchema,
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha: z.date(),
  concepto: z.string().min(1, 'Concepto requerido').max(500, 'Concepto muy largo'),
  referencia: z.string().optional().nullable(),
  categoria: z.string().default('Operaciones').optional(),
  bancoOrigenId: z.string().optional().nullable(),
  bancoDestinoId: z.string().optional().nullable(),
  clienteId: z.string().optional().nullable(),
  distribuidorId: z.string().optional().nullable(),
  ventaId: z.string().optional().nullable(),
  ordenCompraId: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  createdAt: z.date().optional(),
})

export type Movimiento = z.infer<typeof MovimientoBaseSchema>

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA PARA CREAR GASTO
// ═══════════════════════════════════════════════════════════════════════════

export const CrearGastoSchema = z.object({
  bancoOrigen: z.string().min(1, 'Banco origen requerido'),
  monto: z.number().positive('El monto debe ser mayor a 0').multipleOf(0.01, 'Máximo 2 decimales'),
  concepto: z
    .string()
    .min(3, 'Concepto debe tener al menos 3 caracteres')
    .max(500, 'Concepto muy largo'),
  categoria: CategoriaGastoSchema.default('Operaciones'),
  referencia: z.string().max(100, 'Referencia muy larga').optional(),
  observaciones: z.string().max(1000, 'Observaciones muy largas').optional(),
})

export type CrearGastoInput = z.infer<typeof CrearGastoSchema>

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA PARA ACTUALIZAR GASTO
// ═══════════════════════════════════════════════════════════════════════════

export const ActualizarGastoSchema = z.object({
  monto: z
    .number()
    .positive('El monto debe ser mayor a 0')
    .multipleOf(0.01, 'Máximo 2 decimales')
    .optional(),
  concepto: z
    .string()
    .min(3, 'Concepto debe tener al menos 3 caracteres')
    .max(500, 'Concepto muy largo')
    .optional(),
  categoria: CategoriaGastoSchema.optional(),
  referencia: z.string().max(100, 'Referencia muy larga').optional().nullable(),
  observaciones: z.string().max(1000, 'Observaciones muy largas').optional().nullable(),
})

export type ActualizarGastoInput = z.infer<typeof ActualizarGastoSchema>

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIONES DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida los datos para crear un gasto
 */
export function validarGasto(data: unknown) {
  return CrearGastoSchema.safeParse(data)
}

/**
 * Valida los datos para actualizar un gasto
 */
export function validarActualizacionGasto(data: unknown) {
  return ActualizarGastoSchema.safeParse(data)
}

/**
 * Valida una categoría de gasto
 */
export function validarCategoria(categoria: unknown): categoria is CategoriaGasto {
  return CategoriaGastoSchema.safeParse(categoria).success
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Formatea un movimiento para mostrar con categoría
 */
export function formatearMovimientoConCategoria(movimiento: Movimiento): string {
  const categoria = movimiento.categoria || 'General'
  return `[${categoria}] ${movimiento.concepto}`
}

/**
 * Obtiene el color de una categoría
 */
export function obtenerColorCategoria(categoria: string): string {
  const colores: Record<string, string> = {
    Transporte: 'bg-blue-500',
    Servicios: 'bg-green-500',
    Nómina: 'bg-purple-500',
    Mantenimiento: 'bg-orange-500',
    Marketing: 'bg-pink-500',
    Impuestos: 'bg-red-500',
    Operaciones: 'bg-gray-500',
    Otros: 'bg-slate-500',
  }
  return colores[categoria] || 'bg-gray-400'
}
