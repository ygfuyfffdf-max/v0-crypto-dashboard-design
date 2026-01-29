/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📋 CHRONOS INFINITY 2026 — SCHEMAS PARA FLUJOS COMPLETOS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Schemas Zod para validar datos de entrada de flujos atómicos.
 * Separados del archivo de server actions para evitar conflictos con Next.js.
 */

import { z } from 'zod'

// Helper para transformar cadenas vacías a undefined
const emptyToUndefined = (val: string | undefined) =>
  val === '' || val === undefined ? undefined : val

/**
 * Schema para crear OC completa con posibilidad de crear distribuidor nuevo
 */
export const OrdenCompraCompletaSchema = z
  .object({
    // Distribuidor existente o nuevo
    distribuidorId: z.string().optional().transform(emptyToUndefined),
    distribuidorNombre: z.string().optional().transform(emptyToUndefined),
    distribuidorTelefono: z.string().optional().transform(emptyToUndefined),
    distribuidorEmail: z.string().email().optional().or(z.literal('')).transform(emptyToUndefined),

    // Producto (existente o nuevo en almacén)
    productoId: z.string().optional().transform(emptyToUndefined),
    productoNombre: z.string().optional().transform(emptyToUndefined),
    productoDescripcion: z.string().optional().transform(emptyToUndefined),
    productoSku: z.string().optional().transform(emptyToUndefined),

    // Datos de la orden
    cantidad: z.number().int().positive('Cantidad debe ser mayor a 0'),
    precioUnitario: z.number().positive('Precio unitario debe ser positivo'),
    fleteUnitario: z.number().min(0).default(0),
    iva: z.number().min(0).default(0),

    // Pago inicial (opcional)
    montoPagoInicial: z.number().min(0).default(0),
    bancoOrigenId: z.string().optional().transform(emptyToUndefined),

    // Metadata
    numeroOrden: z.string().optional().transform(emptyToUndefined),
    observaciones: z.string().optional().transform(emptyToUndefined),
  })
  .refine((data) => data.distribuidorId || data.distribuidorNombre, {
    message:
      'Debe seleccionar un distribuidor existente o proporcionar nombre para crear uno nuevo',
    path: ['distribuidorId'],
  })
  .refine((data) => data.productoId || data.productoNombre, {
    message: 'Debe seleccionar un producto existente o proporcionar nombre para crear uno nuevo',
    path: ['productoId'],
  })
  .refine((data) => data.montoPagoInicial === 0 || data.bancoOrigenId, {
    message: 'Si hay pago inicial, debe seleccionar banco origen',
    path: ['bancoOrigenId'],
  })

export type OrdenCompraCompletaInput = z.infer<typeof OrdenCompraCompletaSchema>

/**
 * Schema para crear venta completa con posibilidad de crear cliente nuevo
 */
export const VentaCompletaSchema = z
  .object({
    // Cliente existente o nuevo
    clienteId: z.string().optional(),
    clienteNombre: z.string().optional(),
    clienteTelefono: z.string().optional(),
    clienteEmail: z.string().email().optional().or(z.literal('')),
    clienteDireccion: z.string().optional(),

    // Producto (debe existir en almacén)
    productoId: z.string().min(1, 'Producto requerido'),

    // Datos de venta
    cantidad: z.number().int().positive('Cantidad debe ser mayor a 0'),
    precioVentaUnidad: z.number().positive('Precio de venta debe ser positivo'),
    precioCompraUnidad: z.number().positive('Precio de compra debe ser positivo'),
    precioFlete: z.number().min(0).default(500), // Default flete $500

    // Estado de pago
    estadoPago: z.enum(['completo', 'parcial', 'pendiente']).default('pendiente'),
    abonoInicial: z.number().min(0).default(0),

    // Trazabilidad (opcional)
    ocId: z.string().optional(),

    // Metadata
    observaciones: z.string().optional(),
  })
  .refine((data) => data.clienteId || data.clienteNombre, {
    message: 'Debe seleccionar un cliente existente o proporcionar nombre para crear uno nuevo',
  })
  .refine((data) => data.precioVentaUnidad > data.precioCompraUnidad + data.precioFlete, {
    message: 'El precio de venta debe ser mayor que costo + flete (margen positivo)',
  })
  .refine(
    (data) => {
      if (data.estadoPago === 'parcial') {
        return data.abonoInicial > 0
      }
      return true
    },
    { message: 'Si el estado es parcial, debe haber un abono inicial' },
  )

export type VentaCompletaInput = z.infer<typeof VentaCompletaSchema>
