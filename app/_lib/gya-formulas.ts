// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — FÓRMULAS GYA CONSOLIDADAS (FUENTE ÚNICA DE VERDAD)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
//
// Este archivo es la ÚNICA FUENTE DE VERDAD para todas las fórmulas financieras del sistema CHRONOS.
// TODOS los demás archivos deben importar desde aquí. NO DUPLICAR ESTAS FÓRMULAS.
//
// FÓRMULA GYA (GRABADA EN PIEDRA — NUNCA SE MODIFICA):
// ┌─────────────────────────────────────────────────────────────────────────────────────┐
// │ 💰 Bóveda Monte = precioCompra × cantidad                        (COSTO)           │
// │ 🚚 Flete Sur    = precioFlete × cantidad                         (TRANSPORTE)      │
// │ 📈 Utilidades   = (precioVenta - precioCompra - precioFlete) × cantidad (GANANCIA) │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// REGLA DE ORO: El cliente paga precioVenta × cantidad. El flete es costo INTERNO.
//
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

import type { BancoId } from '@/app/types'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES INMUTABLES
// ═══════════════════════════════════════════════════════════════════════════════

/** Flete por defecto por unidad si no se especifica */
export const FLETE_DEFAULT = 500

/** Bancos que reciben distribución GYA de ventas */
export const BANCOS_DISTRIBUCION_GYA: readonly BancoId[] = [
  'boveda_monte', // Recibe: COSTO (precioCompra × cantidad)
  'flete_sur', // Recibe: FLETE (precioFlete × cantidad)
  'utilidades', // Recibe: GANANCIA ((precioVenta - precioCompra - precioFlete) × cantidad)
] as const

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS DE DISTRIBUCIÓN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Distribución GYA - Resultado del cálculo de distribución a bancos
 *
 * NOMBRES CANÓNICOS:
 * - montoBovedaMonte (no "bovedaMonte" sin prefijo)
 * - montoFletes (no "fletes" solo)
 * - montoUtilidades (no "utilidades" solo)
 */
export interface DistribucionGYA {
  /** Monto que va a Bóveda Monte = precioCompra × cantidad (COSTO) */
  montoBovedaMonte: number

  /** Monto que va a Flete Sur = precioFlete × cantidad (TRANSPORTE) */
  montoFletes: number

  /** Monto que va a Utilidades = (precioVenta - precioCompra - precioFlete) × cantidad (GANANCIA) */
  montoUtilidades: number

  /** Precio total de la venta = precioVenta × cantidad (lo que paga el cliente) */
  precioTotalVenta: number

  /** Margen neto como porcentaje (utilidades / precioTotalVenta × 100) */
  margenNeto: number

  /** Margen bruto como porcentaje (utilidades / (costo + flete) × 100) */
  margenBruto: number
}

/**
 * Distribución GYA Legacy - Para compatibilidad con código existente
 * @deprecated Usar DistribucionGYA en su lugar
 */
export interface DistribucionGYALegacy {
  bovedaMonte: number
  fletes: number
  utilidades: number
  total: number
}

/**
 * Datos necesarios para calcular una venta
 */
export interface DatosVentaCalculo {
  cantidad: number
  precioVenta: number // Precio de VENTA al cliente (por unidad)
  precioCompra: number // Precio de COMPRA/costo del distribuidor (por unidad)
  precioFlete?: number // Flete por unidad (default: FLETE_DEFAULT)
  montoPagado?: number // Monto que pagó el cliente (para distribución proporcional)
}

/**
 * Estados de pago de una venta
 */
export type EstadoPago = 'completo' | 'parcial' | 'pendiente'

/**
 * Resultado completo de una venta con distribución y estado
 */
export interface ResultadoVentaCompleto {
  // Totales de venta
  totalVenta: number
  ingresoVenta: number

  // Estado de pago
  estadoPago: EstadoPago
  montoPagado: number
  montoRestante: number
  proporcionPagada: number

  // Distribución base (100%)
  distribucionBase: DistribucionGYA

  // Distribución real según pago
  distribucionReal: DistribucionGYA

  // Márgenes
  gananciaUnitaria: number
  margenPorcentaje: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// FÓRMULAS DE CÁLCULO GYA — FUNCIONES PURAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║ CALCULAR DISTRIBUCIÓN GYA — FUNCIÓN CANÓNICA                                  ║
 * ║                                                                                ║
 * ║ ESTA ES LA ÚNICA IMPLEMENTACIÓN VÁLIDA DE LAS FÓRMULAS GYA                   ║
 * ║ Todos los demás cálculos GYA deben usar esta función o sus derivadas         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * Fórmulas (INMUTABLES):
 * - Bóveda Monte = precioCompra × cantidad (COSTO del distribuidor)
 * - Flete Sur = precioFlete × cantidad (TRANSPORTE)
 * - Utilidades = (precioVenta - precioCompra - precioFlete) × cantidad (GANANCIA NETA)
 *
 * @param precioVenta - Precio de venta al cliente por unidad
 * @param precioCompra - Precio de compra (costo) por unidad
 * @param precioFlete - Precio de flete por unidad (default: FLETE_DEFAULT)
 * @param cantidad - Cantidad de unidades vendidas
 * @returns Distribución GYA con los montos para cada banco
 */
export function calcularDistribucionGYA(
  precioVenta: number,
  precioCompra: number,
  precioFlete: number = FLETE_DEFAULT,
  cantidad: number,
): DistribucionGYA {
  // Validación básica
  if (cantidad <= 0) {
    return {
      montoBovedaMonte: 0,
      montoFletes: 0,
      montoUtilidades: 0,
      precioTotalVenta: 0,
      margenNeto: 0,
      margenBruto: 0,
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // FÓRMULAS INMUTABLES — GRABADAS EN PIEDRA
  // ═══════════════════════════════════════════════════════════════════
  const montoBovedaMonte = precioCompra * cantidad // COSTO total
  const montoFletes = precioFlete * cantidad // FLETE total
  const montoUtilidades = (precioVenta - precioCompra - precioFlete) * cantidad // GANANCIA NETA
  const precioTotalVenta = precioVenta * cantidad // Total que paga el cliente

  // Calcular márgenes
  const margenNeto = precioTotalVenta > 0 ? (montoUtilidades / precioTotalVenta) * 100 : 0

  const costoTotal = montoBovedaMonte + montoFletes
  const margenBruto = costoTotal > 0 ? (montoUtilidades / costoTotal) * 100 : 0

  return {
    montoBovedaMonte,
    montoFletes,
    montoUtilidades,
    precioTotalVenta,
    margenNeto: Number(margenNeto.toFixed(2)),
    margenBruto: Number(margenBruto.toFixed(2)),
  }
}

/**
 * Sobrecarga para compatibilidad con objeto de datos
 */
export function calcularDistribucionGYAFromDatos(datos: DatosVentaCalculo): DistribucionGYA {
  const { cantidad, precioVenta, precioCompra, precioFlete = FLETE_DEFAULT } = datos
  return calcularDistribucionGYA(precioVenta, precioCompra, precioFlete, cantidad)
}

/**
 * Conversión a formato legacy (para código existente)
 * @deprecated Usar DistribucionGYA directamente
 */
export function toDistribucionLegacy(dist: DistribucionGYA): DistribucionGYALegacy {
  return {
    bovedaMonte: dist.montoBovedaMonte,
    fletes: dist.montoFletes,
    utilidades: dist.montoUtilidades,
    total: dist.montoBovedaMonte + dist.montoFletes + dist.montoUtilidades,
  }
}

/**
 * Conversión desde formato legacy
 */
export function fromDistribucionLegacy(
  dist: DistribucionGYALegacy,
): Omit<DistribucionGYA, 'margenNeto' | 'margenBruto'> {
  return {
    montoBovedaMonte: dist.bovedaMonte,
    montoFletes: dist.fletes,
    montoUtilidades: dist.utilidades,
    precioTotalVenta: dist.total,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISTRIBUCIÓN PROPORCIONAL (PAGOS PARCIALES)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calcula la distribución proporcional para un pago parcial
 *
 * Cuando el cliente paga parcialmente, se distribuye proporcionalmente:
 * - Si pagó 50%, cada banco recibe 50% de su monto asignado
 *
 * @param distribucion - Distribución original de la venta
 * @param proporcion - Proporción del pago (0-1)
 * @returns Nueva distribución ajustada
 */
export function calcularDistribucionProporcional(
  distribucion: DistribucionGYA,
  proporcion: number,
): DistribucionGYA {
  const prop = Math.max(0, Math.min(1, proporcion))

  return {
    montoBovedaMonte: Math.round(distribucion.montoBovedaMonte * prop * 100) / 100,
    montoFletes: Math.round(distribucion.montoFletes * prop * 100) / 100,
    montoUtilidades: Math.round(distribucion.montoUtilidades * prop * 100) / 100,
    precioTotalVenta: Math.round(distribucion.precioTotalVenta * prop * 100) / 100,
    margenNeto: distribucion.margenNeto,
    margenBruto: distribucion.margenBruto,
  }
}

/**
 * Calcula distribución de un abono sobre una venta existente
 *
 * @param montoAbono - Monto del abono
 * @param venta - Datos de la venta original (necesita precios unitarios y cantidad)
 * @returns Distribución del abono a cada banco
 */
export function calcularDistribucionAbono(
  montoAbono: number,
  venta: {
    precioVenta: number
    precioCompra: number
    precioFlete: number
    cantidad: number
    precioTotalVenta: number
  },
): DistribucionGYA {
  // Proporción que representa el abono del total
  const proporcion = montoAbono / venta.precioTotalVenta

  // Distribución base de la venta completa
  const distribucionBase = calcularDistribucionGYA(
    venta.precioVenta,
    venta.precioCompra,
    venta.precioFlete,
    venta.cantidad,
  )

  // Distribución proporcional del abono
  return calcularDistribucionProporcional(distribucionBase, proporcion)
}

// ═══════════════════════════════════════════════════════════════════════════════
// CÁLCULO COMPLETO DE VENTA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calcula el resultado completo de una venta incluyendo estado de pago
 *
 * Estados de pago:
 * - COMPLETO: 100% pagado → distribuye 100% a los 3 bancos
 * - PARCIAL: X% pagado → distribuye X% proporcionalmente
 * - PENDIENTE: $0 pagado → registra en histórico pero capital actual = 0
 *
 * @param datos - Datos de la venta
 * @returns Resultado completo con distribución y estado
 */
export function calcularVentaCompleta(datos: DatosVentaCalculo): ResultadoVentaCompleto {
  const {
    cantidad,
    precioVenta,
    precioCompra,
    precioFlete = FLETE_DEFAULT,
    montoPagado = 0,
  } = datos

  // Total que paga el cliente (precioVenta × cantidad)
  const totalVenta = precioVenta * cantidad
  const ingresoVenta = totalVenta

  // Distribución base (100%)
  const distribucionBase = calcularDistribucionGYA(precioVenta, precioCompra, precioFlete, cantidad)

  // Estado de pago
  let estadoPago: EstadoPago = 'pendiente'
  const montoRestante = totalVenta - montoPagado

  if (montoPagado >= totalVenta) {
    estadoPago = 'completo'
  } else if (montoPagado > 0) {
    estadoPago = 'parcial'
  }

  // Proporción pagada
  const proporcionPagada = totalVenta > 0 ? montoPagado / totalVenta : 0

  // Distribución real según pago
  const distribucionReal = calcularDistribucionProporcional(distribucionBase, proporcionPagada)

  // Ganancia por unidad
  const gananciaUnitaria = precioVenta - precioCompra - precioFlete
  const margenPorcentaje = precioVenta > 0 ? (gananciaUnitaria / precioVenta) * 100 : 0

  return {
    totalVenta,
    ingresoVenta,
    estadoPago,
    montoPagado,
    montoRestante,
    proporcionPagada,
    distribucionBase,
    distribucionReal,
    gananciaUnitaria,
    margenPorcentaje: Number(margenPorcentaje.toFixed(2)),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDACIONES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Valida si una venta tiene margen positivo
 * @returns Resultado de validación con detalles
 */
export function validarMargenVenta(
  precioVenta: number,
  precioCompra: number,
  precioFlete: number,
): { valido: boolean; margen: number; mensaje?: string; advertencia?: string } {
  const gananciaUnidad = precioVenta - precioCompra - precioFlete
  const margen = precioVenta > 0 ? (gananciaUnidad / precioVenta) * 100 : 0

  // Margen negativo - BLOQUEAR
  if (gananciaUnidad < 0) {
    return {
      valido: false,
      margen,
      mensaje: `❌ Margen negativo: El precio de venta ($${precioVenta}) es menor que costo ($${precioCompra}) + flete ($${precioFlete})`,
    }
  }

  // Margen cero - ADVERTIR
  if (gananciaUnidad === 0) {
    return {
      valido: true,
      margen: 0,
      advertencia: '⚠️ Margen cero: No hay ganancia en esta venta',
    }
  }

  // Margen muy bajo - ADVERTIR
  if (margen < 10) {
    return {
      valido: true,
      margen,
      advertencia: `⚠️ Margen bajo (${margen.toFixed(1)}%): Considera ajustar precios`,
    }
  }

  // Margen saludable
  return { valido: true, margen }
}

/**
 * Valida datos de una venta antes de procesarla
 */
export function validarDatosVenta(datos: DatosVentaCalculo): {
  valido: boolean
  errores: string[]
  advertencias: string[]
} {
  const errores: string[] = []
  const advertencias: string[] = []

  // Validar cantidad
  if (datos.cantidad <= 0) {
    errores.push('La cantidad debe ser mayor a 0')
  }

  // Validar precio de venta
  if (datos.precioVenta <= 0) {
    errores.push('El precio de venta debe ser mayor a 0')
  }

  // Validar precio de compra
  if (datos.precioCompra < 0) {
    errores.push('El precio de compra no puede ser negativo')
  }
  if (datos.precioCompra === 0) {
    advertencias.push('Precio de compra es $0 - ¿Es correcto?')
  }

  // Validar flete
  const precioFlete = datos.precioFlete ?? FLETE_DEFAULT
  if (precioFlete < 0) {
    errores.push('El precio de flete no puede ser negativo')
  }

  // Validar margen
  if (errores.length === 0) {
    const validacionMargen = validarMargenVenta(datos.precioVenta, datos.precioCompra, precioFlete)
    if (!validacionMargen.valido && validacionMargen.mensaje) {
      errores.push(validacionMargen.mensaje)
    }
    if (validacionMargen.advertencia) {
      advertencias.push(validacionMargen.advertencia)
    }
  }

  // Validar monto pagado
  if (datos.montoPagado !== undefined) {
    if (datos.montoPagado < 0) {
      errores.push('El monto pagado no puede ser negativo')
    }
    const totalVenta = datos.precioVenta * datos.cantidad
    if (datos.montoPagado > totalVenta) {
      errores.push(
        `El monto pagado ($${datos.montoPagado}) excede el total de venta ($${totalVenta})`,
      )
    }
  }

  return {
    valido: errores.length === 0,
    errores,
    advertencias,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CÁLCULOS DE REVERSIÓN (DEVOLUCIONES)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calcula la reversión GYA para una devolución
 *
 * @param distribucionOriginal - Distribución original de la venta
 * @param proporcionDevolucion - Proporción a devolver (0-1)
 * @returns Montos a restar de cada banco
 */
export function calcularReversionGYA(
  distribucionOriginal: DistribucionGYA,
  proporcionDevolucion: number,
): DistribucionGYA {
  return calcularDistribucionProporcional(distribucionOriginal, proporcionDevolucion)
}

/**
 * Calcula monto de reembolso al cliente en una devolución
 *
 * @param montoPagadoOriginal - Lo que pagó el cliente originalmente
 * @param precioTotalVenta - Precio total de la venta
 * @param proporcionDevolucion - Proporción a devolver (0-1)
 * @returns Monto a reembolsar al cliente
 */
export function calcularReembolso(
  montoPagadoOriginal: number,
  _precioTotalVenta: number,
  proporcionDevolucion: number,
): number {
  // Monto a devolver proporcional a lo pagado y a la proporción devuelta
  return Math.round(montoPagadoOriginal * proporcionDevolucion * 100) / 100
}

// ═══════════════════════════════════════════════════════════════════════════════
// ÓRDENES DE COMPRA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calcula el resultado de una orden de compra
 */
export function calcularOrdenCompra(datos: {
  cantidad: number
  costoDistribuidor: number
  costoTransporte?: number
  pagoInicial?: number
}): {
  costoPorUnidad: number
  costoTotal: number
  pagoInicial: number
  deuda: number
  estado: 'pendiente' | 'parcial' | 'completo'
  stockInicial: number
} {
  const { cantidad, costoDistribuidor, costoTransporte = 0, pagoInicial = 0 } = datos

  const costoPorUnidad = costoDistribuidor + costoTransporte
  const costoTotal = costoPorUnidad * cantidad
  const deuda = costoTotal - pagoInicial

  let estado: 'pendiente' | 'parcial' | 'completo' = 'pendiente'
  if (pagoInicial >= costoTotal) {
    estado = 'completo'
  } else if (pagoInicial > 0) {
    estado = 'parcial'
  }

  return {
    costoPorUnidad,
    costoTotal,
    pagoInicial,
    deuda,
    estado,
    stockInicial: cantidad,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Formatea un número como moneda MXN
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formatea un porcentaje
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTACIONES CONSOLIDADAS
// ═══════════════════════════════════════════════════════════════════════════════

// Re-exportar todo para uso conveniente
export type { BancoId }
