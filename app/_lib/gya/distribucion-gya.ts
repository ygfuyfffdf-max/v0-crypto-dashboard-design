/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🏛️ CHRONOS INFINITY 2030 — LÓGICA GYA CENTRALIZADA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * FÓRMULAS GYA SAGRADAS (NUNCA MODIFICAR):
 * - Bóveda Monte = precioCompra × cantidad (COSTO)
 * - Flete Sur = precioFlete × cantidad (TRANSPORTE)
 * - Utilidades = (precioVenta - precioCompra - precioFlete) × cantidad (GANANCIA)
 *
 * Capital Actual = Histórico Ingresos - Histórico Gastos
 *
 * @version 2.0.0 - Verificado contra Excel y documentos de lógica
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export interface DatosVentaGYA {
  cantidad: number
  precioVenta: number // Precio de VENTA al cliente (por unidad)
  precioCompra: number // Precio de COMPRA/costo del distribuidor (por unidad)
  precioFlete: number // Flete por unidad (default: 500)
  montoPagado?: number // Monto que pagó el cliente
}

export interface DistribucionGYA {
  bovedaMonte: number // COSTO → va a Bóveda Monte
  fletes: number // TRANSPORTE → va a Flete Sur
  utilidades: number // GANANCIA NETA → va a Utilidades
  total: number // Suma de los 3 (debe = precioVenta × cantidad)
}

export interface ResultadoVentaCompleto {
  // Totales
  totalVenta: number

  // Distribución GYA (100%)
  distribucionBase: DistribucionGYA

  // Estado de pago
  estadoPago: 'completo' | 'parcial' | 'pendiente'
  montoPagado: number
  montoRestante: number
  proporcionPagada: number

  // Distribución que va al capitalActual (proporcional al pago)
  distribucionCapital: DistribucionGYA

  // Márgenes
  margenBruto: number // (precioVenta - precioCompra) / precioVenta * 100
  margenNeto: number // utilidad / totalVenta * 100
  gananciaUnitaria: number
}

export type BancosGYA = 'boveda_monte' | 'flete_sur' | 'utilidades'

export const BANCOS_DISTRIBUCION: readonly BancosGYA[] = [
  'boveda_monte',
  'flete_sur',
  'utilidades',
] as const

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

/** Flete por defecto por unidad si no se especifica */
export const FLETE_DEFAULT = 500

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL: calcularDistribucionGYA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula la distribución GYA (Gastos Y Administración) de una venta.
 *
 * FÓRMULAS SAGRADAS (grabadas en piedra):
 * - Bóveda Monte = precioCompra × cantidad
 * - Fletes = precioFlete × cantidad
 * - Utilidades = (precioVenta - precioCompra - precioFlete) × cantidad
 *
 * @example
 * // Venta de 10 unidades a $10,000 c/u, costo $6,300, flete $500
 * calcularDistribucionGYA({ cantidad: 10, precioVenta: 10000, precioCompra: 6300, precioFlete: 500 })
 * // → { bovedaMonte: 63000, fletes: 5000, utilidades: 32000, total: 100000 }
 */
export function calcularDistribucionGYA(
  datos: Omit<DatosVentaGYA, 'montoPagado'>,
): DistribucionGYA {
  const { cantidad, precioVenta, precioCompra, precioFlete = FLETE_DEFAULT } = datos

  // Validaciones
  if (cantidad <= 0) {
    return { bovedaMonte: 0, fletes: 0, utilidades: 0, total: 0 }
  }

  if (precioVenta < 0 || precioCompra < 0 || precioFlete < 0) {
    throw new Error('Los precios no pueden ser negativos')
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CÁLCULOS SAGRADOS GYA
  // ═══════════════════════════════════════════════════════════════════════

  // 1. Bóveda Monte = Precio Compra × Cantidad (COSTO)
  const bovedaMonte = precioCompra * cantidad

  // 2. Fletes = Precio Flete × Cantidad (TRANSPORTE)
  const fletes = precioFlete * cantidad

  // 3. Utilidades = (Precio Venta - Precio Compra - Flete) × Cantidad (GANANCIA NETA)
  const utilidades = (precioVenta - precioCompra - precioFlete) * cantidad

  // 4. Total debe ser = precioVenta × cantidad
  const total = bovedaMonte + fletes + utilidades
  const totalEsperado = precioVenta * cantidad

  // Verificación de integridad
  if (Math.abs(total - totalEsperado) > 0.01) {
    logger.warn('Inconsistencia en distribución GYA', {
      context: 'GYA:calcularDistribucionGYA',
      data: { total, totalEsperado, diferencia: Math.abs(total - totalEsperado) },
    })
  }

  return {
    bovedaMonte,
    fletes,
    utilidades,
    total,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN: calcularDistribucionParcial
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula la distribución proporcional para un pago parcial.
 *
 * Cuando el cliente paga solo una parte, el capital actual recibe
 * la proporción correspondiente, pero el histórico de ingresos
 * registra el 100% (para tracking).
 *
 * @example
 * // Venta de $100,000 con pago de $50,000 (50%)
 * calcularDistribucionParcial(distribucionBase, 50000, 100000)
 * // Cada banco recibe el 50% de su monto original en capitalActual
 */
export function calcularDistribucionParcial(
  distribucionBase: DistribucionGYA,
  montoPagado: number,
  totalVenta: number,
): DistribucionGYA {
  if (totalVenta <= 0) {
    return { bovedaMonte: 0, fletes: 0, utilidades: 0, total: 0 }
  }

  const proporcion = Math.min(montoPagado / totalVenta, 1)

  return {
    bovedaMonte: distribucionBase.bovedaMonte * proporcion,
    fletes: distribucionBase.fletes * proporcion,
    utilidades: distribucionBase.utilidades * proporcion,
    total: montoPagado,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN: calcularVentaCompleta
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula el resultado completo de una venta incluyendo estado de pago
 * y distribución proporcional según el monto pagado.
 *
 * Estados de pago:
 * - COMPLETO: 100% pagado → distribuye 100% a los 3 bancos
 * - PARCIAL: X% pagado → distribuye X% proporcionalmente al capital
 * - PENDIENTE: $0 pagado → registra en histórico pero capital = 0
 */
export function calcularVentaCompleta(datos: DatosVentaGYA): ResultadoVentaCompleto {
  const {
    cantidad,
    precioVenta,
    precioCompra,
    precioFlete = FLETE_DEFAULT,
    montoPagado = 0,
  } = datos

  // Total de la venta
  const totalVenta = precioVenta * cantidad

  // Distribución base (100%)
  const distribucionBase = calcularDistribucionGYA({
    cantidad,
    precioVenta,
    precioCompra,
    precioFlete,
  })

  // Estado de pago
  const montoRestante = totalVenta - montoPagado
  let estadoPago: 'completo' | 'parcial' | 'pendiente' = 'pendiente'
  let proporcionPagada = 0

  if (montoPagado >= totalVenta) {
    estadoPago = 'completo'
    proporcionPagada = 1
  } else if (montoPagado > 0) {
    estadoPago = 'parcial'
    proporcionPagada = montoPagado / totalVenta
  }

  // Distribución que va al capitalActual (proporcional)
  let distribucionCapital: DistribucionGYA

  if (estadoPago === 'completo') {
    distribucionCapital = { ...distribucionBase }
  } else if (estadoPago === 'parcial') {
    distribucionCapital = calcularDistribucionParcial(distribucionBase, montoPagado, totalVenta)
  } else {
    // Pendiente: no afecta capital actual
    distribucionCapital = { bovedaMonte: 0, fletes: 0, utilidades: 0, total: 0 }
  }

  // Márgenes
  const gananciaUnitaria = precioVenta - precioCompra - precioFlete
  const margenBruto = precioVenta > 0 ? ((precioVenta - precioCompra) / precioVenta) * 100 : 0
  const margenNeto = totalVenta > 0 ? (distribucionBase.utilidades / totalVenta) * 100 : 0

  return {
    totalVenta,
    distribucionBase,
    estadoPago,
    montoPagado,
    montoRestante,
    proporcionPagada,
    distribucionCapital,
    margenBruto,
    margenNeto,
    gananciaUnitaria,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN: calcularCapitalBanco
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula el capital actual de un banco.
 * FÓRMULA: capitalActual = historicoIngresos - historicoGastos
 */
export function calcularCapitalBanco(historicoIngresos: number, historicoGastos: number): number {
  return historicoIngresos - historicoGastos
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN: validarStockParaVenta
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida que hay stock suficiente para realizar una venta.
 * OBLIGATORIO antes de crear cualquier venta.
 */
export function validarStockParaVenta(
  stockActual: number,
  cantidadSolicitada: number,
): { valido: boolean; mensaje?: string } {
  if (cantidadSolicitada <= 0) {
    return { valido: false, mensaje: 'La cantidad debe ser mayor a 0' }
  }

  if (stockActual < cantidadSolicitada) {
    return {
      valido: false,
      mensaje: `Stock insuficiente. Disponible: ${stockActual}, Solicitado: ${cantidadSolicitada}`,
    }
  }

  return { valido: true }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN: calcularAbonoVenta
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula cómo distribuir un abono parcial a una venta existente.
 * Distribuye proporcionalmente a los 3 bancos según el monto original.
 */
export function calcularAbonoVenta(
  ventaOriginal: {
    totalVenta: number
    bovedaMonte: number
    fletes: number
    utilidades: number
    montoPagado: number
  },
  montoAbono: number,
): {
  nuevoMontoPagado: number
  nuevoMontoRestante: number
  nuevoEstadoPago: 'completo' | 'parcial' | 'pendiente'
  distribucionAbono: DistribucionGYA
} {
  const { totalVenta, bovedaMonte, fletes, utilidades, montoPagado } = ventaOriginal

  // Validar que el abono no exceda lo restante
  const montoRestante = totalVenta - montoPagado
  const abonoReal = Math.min(montoAbono, montoRestante)

  // Calcular proporción del abono respecto al total
  const proporcionAbono = totalVenta > 0 ? abonoReal / totalVenta : 0

  // Distribuir proporcionalmente
  const distribucionAbono: DistribucionGYA = {
    bovedaMonte: bovedaMonte * proporcionAbono,
    fletes: fletes * proporcionAbono,
    utilidades: utilidades * proporcionAbono,
    total: abonoReal,
  }

  const nuevoMontoPagado = montoPagado + abonoReal
  const nuevoMontoRestante = totalVenta - nuevoMontoPagado

  let nuevoEstadoPago: 'completo' | 'parcial' | 'pendiente' = 'pendiente'
  if (nuevoMontoPagado >= totalVenta) {
    nuevoEstadoPago = 'completo'
  } else if (nuevoMontoPagado > 0) {
    nuevoEstadoPago = 'parcial'
  }

  return {
    nuevoMontoPagado,
    nuevoMontoRestante,
    nuevoEstadoPago,
    distribucionAbono,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS DE MÉTRICAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula métricas financieras avanzadas
 */
export function calcularMetricasFinancieras(datos: {
  capitalTotal: number
  deudaClientes: number
  deudaDistribuidores: number
  ventasTotales: number
  gastosTotales: number
  utilidadesNetas: number
}) {
  const {
    capitalTotal,
    deudaClientes,
    deudaDistribuidores,
    ventasTotales,
    gastosTotales,
    utilidadesNetas,
  } = datos

  return {
    // Liquidez
    liquidezNeta: capitalTotal - deudaDistribuidores,
    ratioLiquidez: deudaDistribuidores > 0 ? capitalTotal / deudaDistribuidores : Infinity,

    // Rentabilidad
    margenOperativo: ventasTotales > 0 ? (utilidadesNetas / ventasTotales) * 100 : 0,
    roce: capitalTotal > 0 ? (utilidadesNetas / capitalTotal) * 100 : 0,

    // Cuentas
    cuentasPorCobrar: deudaClientes,
    cuentasPorPagar: deudaDistribuidores,
    balanceNeto: deudaClientes - deudaDistribuidores,

    // Eficiencia
    ratioGastos: ventasTotales > 0 ? (gastosTotales / ventasTotales) * 100 : 0,
    capitalTrabajo: capitalTotal + deudaClientes - deudaDistribuidores,
  }
}
