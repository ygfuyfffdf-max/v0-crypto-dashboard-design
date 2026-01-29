/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS SYSTEM - Math Integrity                         ║
 * ║                    Validaciones de Integridad Matemática                   ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

import { logger } from '@/app/lib/utils/logger'
import type { BancoId } from '@/app/types'

/**
 * Resultado de validación
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
  details?: Record<string, unknown>
}

/**
 * Datos de venta para validación
 */
export interface VentaValidation {
  id: string
  precioVentaUnidad: number
  precioCompraUnidad: number
  precioFlete: number
  cantidad: number
  montoPagado: number
  estadoPago: 'completo' | 'parcial' | 'pendiente'
}

/**
 * Datos de cliente para validación
 */
export interface ClienteValidation {
  id: string
  nombre: string
  totalCompras: number
  totalPagado: number
  saldoPendiente: number
  limiteCredito: number
}

/**
 * Datos de banco para validación
 */
export interface BancoValidation {
  id: BancoId
  capitalActual: number
  historicoIngresos: number
  historicoGastos: number
  historicoTransferencias: number
}

/**
 * Datos de producto para validación de stock
 */
export interface ProductoValidation {
  id: string
  nombre: string
  stockDisponible: number
  stockReservado: number
  stockMinimo: number
}

/**
 * Validación de distribución G-Y-A (Ganancia-Yellow-Azteca)
 */
export function validateGYADistribution(venta: VentaValidation): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const costoTotal = venta.precioCompraUnidad * venta.cantidad
    const fleteTotal = venta.precioFlete * venta.cantidad
    const precioTotal = venta.precioVentaUnidad * venta.cantidad
    const gananciaNeta = precioTotal - costoTotal - fleteTotal

    if (venta.precioVentaUnidad <= 0) {
      errors.push('El precio de venta debe ser mayor a 0')
    }

    if (gananciaNeta < 0) {
      errors.push(`La venta genera pérdida: ${gananciaNeta.toFixed(2)}`)
    }

    logger.debug('Validación G-Y-A completada', {
      context: 'MathIntegrity',
      data: { ventaId: venta.id, valid: errors.length === 0 },
    })

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      details: { costoTotal, fleteTotal, precioTotal, gananciaNeta },
    }
  } catch (error) {
    logger.error('Error en validación G-Y-A', error as Error, {
      context: 'MathIntegrity',
    })
    return {
      valid: false,
      errors: ['Error interno al validar distribución G-Y-A'],
    }
  }
}

/**
 * Validación de balance de cliente
 */
export function validateClientBalance(cliente: ClienteValidation): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const saldoEsperado = cliente.totalCompras - cliente.totalPagado
    const diferencia = Math.abs(cliente.saldoPendiente - saldoEsperado)

    if (diferencia > 0.01) {
      errors.push(`Saldo pendiente inconsistente. Esperado: ${saldoEsperado.toFixed(2)}`)
    }

    if (cliente.saldoPendiente > cliente.limiteCredito) {
      errors.push('Cliente excede límite de crédito')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      details: { saldoEsperado, diferencia },
    }
  } catch (error) {
    logger.error('Error en validación balance cliente', error as Error, {
      context: 'MathIntegrity',
    })
    return {
      valid: false,
      errors: ['Error interno al validar balance de cliente'],
    }
  }
}

/**
 * Validación de capital bancario
 */
export function validateBankCapital(banco: BancoValidation): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const capitalEsperado =
      banco.historicoIngresos - banco.historicoGastos + banco.historicoTransferencias
    const diferencia = Math.abs(banco.capitalActual - capitalEsperado)

    if (diferencia > 0.01) {
      errors.push(`Capital inconsistente en ${banco.id}`)
    }

    if (banco.capitalActual < 0) {
      warnings.push(`Banco ${banco.id} tiene capital negativo`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      details: { capitalEsperado, diferencia },
    }
  } catch (error) {
    logger.error('Error en validación capital bancario', error as Error, {
      context: 'MathIntegrity',
    })
    return {
      valid: false,
      errors: ['Error interno al validar capital bancario'],
    }
  }
}

/**
 * Validación de stock
 */
export function validateStock(
  producto: ProductoValidation,
  cantidadRequerida: number,
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    if (cantidadRequerida <= 0) {
      errors.push('La cantidad requerida debe ser mayor a 0')
    }

    const stockDisponibleReal = producto.stockDisponible - producto.stockReservado
    if (cantidadRequerida > stockDisponibleReal) {
      errors.push(`Stock insuficiente. Disponible: ${stockDisponibleReal}`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      details: { stockDisponibleReal },
    }
  } catch (error) {
    logger.error('Error en validación stock', error as Error, {
      context: 'MathIntegrity',
    })
    return {
      valid: false,
      errors: ['Error interno al validar stock'],
    }
  }
}

/**
 * Validación de pago proporcional
 */
export function validateProportionalPayment(
  venta: VentaValidation,
  montoAbono: number,
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const precioTotal = venta.precioVentaUnidad * venta.cantidad

    if (montoAbono <= 0) {
      errors.push('El monto del abono debe ser mayor a 0')
    }

    if (montoAbono > precioTotal) {
      errors.push('El abono no puede ser mayor al precio total')
    }

    const proporcion = montoAbono / precioTotal

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      details: { proporcion },
    }
  } catch (error) {
    logger.error('Error en validación pago proporcional', error as Error, {
      context: 'MathIntegrity',
    })
    return {
      valid: false,
      errors: ['Error interno al validar pago proporcional'],
    }
  }
}
