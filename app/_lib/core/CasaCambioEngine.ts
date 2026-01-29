/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 💱 CHRONOS INFINITY 2030 — PROFIT CASA DE CAMBIO ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Motor especializado para operaciones de Casa de Cambio (Profit)
 *
 * OPERACIONES:
 * 1. COMPRA USD: Cliente nos da MXN, nosotros damos USD
 *    - Entra MXN a Profit
 *    - Sale USD de Boveda USA o Leftie
 *
 * 2. VENTA USD: Cliente nos da USD, nosotros damos MXN
 *    - Entra USD a Boveda USA o Leftie
 *    - Sale MXN de Profit
 *    - Ganancia = (TC Venta - TC Compra Promedio) × montoUSD
 *
 * ESTRATEGIA DE RENTABILIDAD:
 * - Spread: Diferencia entre TC compra y TC venta (típico 1-3%)
 * - Volumen: A mayor volumen, menor spread necesario
 * - Timing: Aprovechar volatilidad del mercado
 * - Cobertura: Mantener balance USD/MXN óptimo
 *
 * MÉTRICAS CLAVE:
 * - Spread promedio
 * - Volumen operado
 * - Ganancia por operación
 * - Rotación de inventario USD
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import type { BancoId, Moneda } from './FlowDistributorEngine'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

export type TipoOperacionFX = 'compra_usd' | 'venta_usd'

export interface OperacionCambio {
  id: string
  fecha: Date
  tipo: TipoOperacionFX
  // Montos
  montoUSD: number
  montoMXN: number
  tipoCambio: number
  // Ganancia (solo para ventas)
  tipoCambioCompraOriginal?: number
  ganancia?: number
  margenPorcentaje?: number
  // Referencias
  bancoUSD: 'boveda_usa' | 'leftie'
  clienteNombre?: string
  concepto?: string
  // Estado
  estado: 'completada' | 'pendiente' | 'cancelada'
}

export interface TipoCambioActual {
  compra: number // Precio al que COMPRAMOS USD (cliente nos vende)
  venta: number // Precio al que VENDEMOS USD (cliente nos compra)
  spread: number // venta - compra
  spreadPorcentaje: number
  fechaActualizacion: Date
}

export interface InventarioUSD {
  totalUSD: number // USD disponible para vender
  costoPromedioCompra: number // TC promedio al que compramos
  valorMXN: number // totalUSD × costoPromedioCompra
}

export interface EstadisticasCasaCambio {
  // Volumen
  totalOperaciones: number
  volumenComprasUSD: number
  volumenVentasUSD: number
  volumenNetoUSD: number
  // Financiero
  gananciaTotalMXN: number
  spreadPromedio: number
  margenPromedioPocentaje: number
  // Por período
  gananciaHoy: number
  gananciaSemana: number
  gananciaMes: number
  // Tendencias
  tendenciaTC: 'alza' | 'baja' | 'estable'
  volatilidad: number
}

export interface ProyeccionRentabilidad {
  escenarioOptimista: number
  escenarioNormal: number
  escenarioPesimista: number
  volumenRecomendado: number
  spreadRecomendado: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════

// Spread típico del mercado (1.5-2.5%)
export const SPREAD_MINIMO = 0.005 // 0.5%
export const SPREAD_RECOMENDADO = 0.015 // 1.5%
export const SPREAD_MAXIMO = 0.03 // 3%

// TC referencia (BANXICO style)
export const TC_REFERENCIA_DEFAULT = 17.5

// ═══════════════════════════════════════════════════════════════════════════════════════
// MOTOR CASA DE CAMBIO
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Calcula tipos de cambio compra/venta basado en referencia y spread
 */
export function calcularTiposCambio(
  tcReferencia: number,
  spreadPorcentaje: number = SPREAD_RECOMENDADO,
): TipoCambioActual {
  const spreadMitad = spreadPorcentaje / 2

  const compra = tcReferencia * (1 - spreadMitad) // Compramos más barato
  const venta = tcReferencia * (1 + spreadMitad) // Vendemos más caro
  const spread = venta - compra

  return {
    compra: Math.round(compra * 100) / 100,
    venta: Math.round(venta * 100) / 100,
    spread: Math.round(spread * 100) / 100,
    spreadPorcentaje: spreadPorcentaje * 100,
    fechaActualizacion: new Date(),
  }
}

/**
 * Procesa operación de COMPRA USD
 * - Cliente nos da MXN
 * - Nosotros damos USD
 * - Aumenta nuestro capital MXN en Profit
 * - Disminuye nuestro capital USD en boveda_usa/leftie
 */
export function procesarCompraUSD(
  montoUSD: number,
  tipoCambioCompra: number,
  bancoUSD: 'boveda_usa' | 'leftie' = 'boveda_usa',
  clienteNombre?: string,
): {
  operacion: Omit<OperacionCambio, 'id'>
  movimientoProfit: { tipo: 'ingreso'; monto: number; moneda: 'MXN' }
  movimientoBancoUSD: { tipo: 'gasto'; monto: number; moneda: 'USD' }
} {
  const montoMXN = montoUSD * tipoCambioCompra

  const operacion: Omit<OperacionCambio, 'id'> = {
    fecha: new Date(),
    tipo: 'compra_usd',
    montoUSD,
    montoMXN,
    tipoCambio: tipoCambioCompra,
    bancoUSD,
    clienteNombre,
    concepto: `Compra de ${montoUSD} USD a TC ${tipoCambioCompra}`,
    estado: 'completada',
  }

  // Profit recibe MXN
  const movimientoProfit = {
    tipo: 'ingreso' as const,
    monto: montoMXN,
    moneda: 'MXN' as const,
  }

  // Boveda/Leftie entrega USD
  const movimientoBancoUSD = {
    tipo: 'gasto' as const,
    monto: montoUSD,
    moneda: 'USD' as const,
  }

  logger.info('Compra USD procesada', {
    context: 'CasaCambioEngine',
    data: { montoUSD, montoMXN, tipoCambioCompra, bancoUSD },
  })

  return { operacion, movimientoProfit, movimientoBancoUSD }
}

/**
 * Procesa operación de VENTA USD
 * - Cliente nos da USD
 * - Nosotros damos MXN
 * - Aumenta nuestro capital USD en boveda_usa/leftie
 * - Disminuye nuestro capital MXN en Profit
 * - Se calcula GANANCIA si hay TC de compra original
 */
export function procesarVentaUSD(
  montoUSD: number,
  tipoCambioVenta: number,
  tipoCambioCompraOriginal: number,
  bancoUSD: 'boveda_usa' | 'leftie' = 'boveda_usa',
  clienteNombre?: string,
): {
  operacion: Omit<OperacionCambio, 'id'>
  movimientoProfit: { tipo: 'gasto'; monto: number; moneda: 'MXN' }
  movimientoBancoUSD: { tipo: 'ingreso'; monto: number; moneda: 'USD' }
  ganancia: number
  margenPorcentaje: number
} {
  const montoMXN = montoUSD * tipoCambioVenta
  const ganancia = (tipoCambioVenta - tipoCambioCompraOriginal) * montoUSD
  const margenPorcentaje =
    ((tipoCambioVenta - tipoCambioCompraOriginal) / tipoCambioCompraOriginal) * 100

  const operacion: Omit<OperacionCambio, 'id'> = {
    fecha: new Date(),
    tipo: 'venta_usd',
    montoUSD,
    montoMXN,
    tipoCambio: tipoCambioVenta,
    tipoCambioCompraOriginal,
    ganancia,
    margenPorcentaje,
    bancoUSD,
    clienteNombre,
    concepto: `Venta de ${montoUSD} USD a TC ${tipoCambioVenta}`,
    estado: 'completada',
  }

  // Profit entrega MXN
  const movimientoProfit = {
    tipo: 'gasto' as const,
    monto: montoMXN,
    moneda: 'MXN' as const,
  }

  // Boveda/Leftie recibe USD
  const movimientoBancoUSD = {
    tipo: 'ingreso' as const,
    monto: montoUSD,
    moneda: 'USD' as const,
  }

  logger.info('Venta USD procesada', {
    context: 'CasaCambioEngine',
    data: { montoUSD, montoMXN, tipoCambioVenta, ganancia, margenPorcentaje },
  })

  return { operacion, movimientoProfit, movimientoBancoUSD, ganancia, margenPorcentaje }
}

/**
 * Calcula inventario USD y costo promedio
 */
export function calcularInventarioUSD(
  operacionesCompra: { montoUSD: number; tipoCambio: number }[],
  operacionesVenta: { montoUSD: number }[],
): InventarioUSD {
  // Total comprado
  let totalCompradoUSD = 0
  let totalPagadoMXN = 0

  for (const op of operacionesCompra) {
    totalCompradoUSD += op.montoUSD
    totalPagadoMXN += op.montoUSD * op.tipoCambio
  }

  // Total vendido
  const totalVendidoUSD = operacionesVenta.reduce((sum, op) => sum + op.montoUSD, 0)

  // Inventario actual
  const totalUSD = totalCompradoUSD - totalVendidoUSD
  const costoPromedioCompra = totalCompradoUSD > 0 ? totalPagadoMXN / totalCompradoUSD : 0

  return {
    totalUSD: Math.max(0, totalUSD),
    costoPromedioCompra: Math.round(costoPromedioCompra * 100) / 100,
    valorMXN: Math.max(0, totalUSD) * costoPromedioCompra,
  }
}

/**
 * Calcula estadísticas completas de la casa de cambio
 */
export function calcularEstadisticasCasaCambio(
  operaciones: OperacionCambio[],
  periodoInicio?: Date,
): EstadisticasCasaCambio {
  const ahora = new Date()
  const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  const inicioSemana = new Date(inicioHoy.getTime() - 7 * 24 * 60 * 60 * 1000)
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

  const operacionesFiltradas = periodoInicio
    ? operaciones.filter((op) => op.fecha >= periodoInicio)
    : operaciones

  // Totales
  let volumenComprasUSD = 0
  let volumenVentasUSD = 0
  let gananciaTotalMXN = 0
  let sumaSpread = 0
  let operacionesConSpread = 0

  // Por período
  let gananciaHoy = 0
  let gananciaSemana = 0
  let gananciaMes = 0

  for (const op of operacionesFiltradas) {
    if (op.tipo === 'compra_usd') {
      volumenComprasUSD += op.montoUSD
    } else {
      volumenVentasUSD += op.montoUSD
      if (op.ganancia) {
        gananciaTotalMXN += op.ganancia

        if (op.fecha >= inicioHoy) gananciaHoy += op.ganancia
        if (op.fecha >= inicioSemana) gananciaSemana += op.ganancia
        if (op.fecha >= inicioMes) gananciaMes += op.ganancia
      }
      if (op.tipoCambioCompraOriginal) {
        sumaSpread += op.tipoCambio - op.tipoCambioCompraOriginal
        operacionesConSpread++
      }
    }
  }

  const spreadPromedio = operacionesConSpread > 0 ? sumaSpread / operacionesConSpread : 0

  const volumenTotal = volumenComprasUSD + volumenVentasUSD
  const margenPromedioPocentaje =
    volumenVentasUSD > 0 && gananciaTotalMXN > 0
      ? (gananciaTotalMXN / (volumenVentasUSD * spreadPromedio || 1)) * 100
      : 0

  // Tendencia (simplificada)
  const operacionesRecientes = operaciones.slice(-10)
  let tendencia: 'alza' | 'baja' | 'estable' = 'estable'
  if (operacionesRecientes.length >= 2) {
    const tcInicio = operacionesRecientes[0]?.tipoCambio
    const tcFin = operacionesRecientes[operacionesRecientes.length - 1]?.tipoCambio
    if (tcInicio && tcFin) {
      if (tcFin > tcInicio * 1.01) tendencia = 'alza'
      else if (tcFin < tcInicio * 0.99) tendencia = 'baja'
    }
  }

  // Volatilidad (desviación estándar de TCs)
  const tcs = operacionesRecientes.map((op) => op.tipoCambio)
  const tcPromedio = tcs.reduce((a, b) => a + b, 0) / tcs.length || 0
  const varianza = tcs.reduce((sum, tc) => sum + Math.pow(tc - tcPromedio, 2), 0) / tcs.length
  const volatilidad = Math.sqrt(varianza)

  return {
    totalOperaciones: operacionesFiltradas.length,
    volumenComprasUSD,
    volumenVentasUSD,
    volumenNetoUSD: volumenComprasUSD - volumenVentasUSD,
    gananciaTotalMXN,
    spreadPromedio: Math.round(spreadPromedio * 100) / 100,
    margenPromedioPocentaje: Math.round(margenPromedioPocentaje * 100) / 100,
    gananciaHoy,
    gananciaSemana,
    gananciaMes,
    tendenciaTC: tendencia,
    volatilidad: Math.round(volatilidad * 100) / 100,
  }
}

/**
 * Proyecta rentabilidad basado en volumen y spread
 */
export function proyectarRentabilidad(
  volumenDiarioEsperado: number,
  spread: number,
  diasProyeccion: number = 30,
): ProyeccionRentabilidad {
  // Escenarios
  const factorOptimista = 1.3
  const factorNormal = 1.0
  const factorPesimista = 0.7

  const gananciaDiaria = volumenDiarioEsperado * spread

  return {
    escenarioOptimista: gananciaDiaria * diasProyeccion * factorOptimista,
    escenarioNormal: gananciaDiaria * diasProyeccion * factorNormal,
    escenarioPesimista: gananciaDiaria * diasProyeccion * factorPesimista,
    volumenRecomendado: 10000, // USD diarios recomendados
    spreadRecomendado: SPREAD_RECOMENDADO,
  }
}

/**
 * Sugiere precio de venta óptimo basado en mercado y rentabilidad objetivo
 */
export function sugerirPrecioVenta(
  inventario: InventarioUSD,
  tcMercado: number,
  rentabilidadObjetivo: number = 0.02, // 2% default
): {
  precioSugerido: number
  gananciaEstimada: number
  margenReal: number
} {
  const precioMinimo = inventario.costoPromedioCompra * (1 + SPREAD_MINIMO)
  const precioObjetivo = inventario.costoPromedioCompra * (1 + rentabilidadObjetivo)

  // No vender por debajo del mercado si el costo lo permite
  const precioSugerido = Math.max(precioObjetivo, Math.min(tcMercado, precioMinimo))

  const gananciaEstimada = (precioSugerido - inventario.costoPromedioCompra) * inventario.totalUSD
  const margenReal =
    ((precioSugerido - inventario.costoPromedioCompra) / inventario.costoPromedioCompra) * 100

  return {
    precioSugerido: Math.round(precioSugerido * 100) / 100,
    gananciaEstimada: Math.round(gananciaEstimada * 100) / 100,
    margenReal: Math.round(margenReal * 100) / 100,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const CasaCambioEngine = {
  // Tipos de cambio
  calcularTiposCambio,

  // Operaciones
  procesarCompraUSD,
  procesarVentaUSD,

  // Inventario
  calcularInventarioUSD,

  // Estadísticas
  calcularEstadisticasCasaCambio,

  // Proyecciones
  proyectarRentabilidad,
  sugerirPrecioVenta,

  // Constantes
  SPREAD_MINIMO,
  SPREAD_RECOMENDADO,
  SPREAD_MAXIMO,
  TC_REFERENCIA_DEFAULT,
}

export default CasaCambioEngine
