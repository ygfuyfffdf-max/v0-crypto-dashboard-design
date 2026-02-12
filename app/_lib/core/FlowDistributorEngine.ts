/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🏛️ CHRONOS INFINITY 2030 — FLOWDISTRIBUTOR ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Motor central de lógica financiera del sistema FlowDistributor.
 * Gestiona el flujo completo: OC → Almacén → Venta → Distribución → Bancos
 *
 * ARQUITECTURA:
 * ┌─────────────────────────────────────────────────────────────────────────────────────┐
 * │                           FLOWDISTRIBUTOR ENGINE                                    │
 * ├─────────────────────────────────────────────────────────────────────────────────────┤
 * │  ORDEN DE COMPRA (LOTE)                                                            │
 * │  ├─> Crear/Actualizar Distribuidor (perfil + adeudo)                               │
 * │  ├─> Entrada Almacén (stock += cantidad)                                           │
 * │  ├─> Registro histórico entradas                                                   │
 * │  └─> Trazabilidad: cantidadOriginal, cantidadVendida, cantidadRestante             │
 * ├─────────────────────────────────────────────────────────────────────────────────────┤
 * │  VENTA (FIFO)                                                                      │
 * │  ├─> Asignación Lotes FIFO (consume OCs más antiguas)                              │
 * │  ├─> Crear/Actualizar Cliente (perfil + deuda según estado pago)                   │
 * │  ├─> Salida Almacén (stock -= cantidad)                                            │
 * │  ├─> Distribución a 3 bancos (LÓGICA SAGRADA):                                     │
 * │  │   ├─> Bóveda Monte: Costo Real Lotes (COSTO)                                    │
 * │  │   ├─> Flete Sur: precioFlete × cantidad (TRANSPORTE)                            │
 * │  │   └─> Utilidades: (precioVenta - CostoReal - Flete) × cantidad                  │
 * │  └─> Estado pago afecta capital vs histórico                                       │
 * ├─────────────────────────────────────────────────────────────────────────────────────┤
 * │  7 BANCOS                                                                           │
 * │  ├─> boveda_monte: Recibe COSTO de ventas                                          │
 * │  ├─> boveda_usa: Capital USD                                                        │
 * │  ├─> flete_sur: Recibe FLETE de ventas                                             │
 * │  ├─> utilidades: Recibe GANANCIA de ventas                                         │
 * │  ├─> profit: CASA DE CAMBIO - Compra/Venta USD/MXN                                 │
 * │  ├─> leftie: Banco operativo USD                                                   │
 * │  └─> azteca: Banco operativo MXN                                                   │
 * └─────────────────────────────────────────────────────────────────────────────────────┘
 *
 * @version 3.1.0 - Sistema completo integrado con FIFO y Trazabilidad
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS BASE
// ═══════════════════════════════════════════════════════════════════════════════════════

export type BancoId =
  | 'boveda_monte' // Recibe COSTO de ventas
  | 'boveda_usa' // Capital USD
  | 'flete_sur' // Recibe FLETE de ventas
  | 'utilidades' // Recibe GANANCIA de ventas
  | 'profit' // CASA DE CAMBIO
  | 'leftie' // Banco operativo USD
  | 'azteca' // Banco operativo MXN

export type Moneda = 'MXN' | 'USD'
export type EstadoPago = 'completo' | 'parcial' | 'pendiente'
export type TipoMovimiento = 'ingreso' | 'gasto' | 'transferencia_entrada' | 'transferencia_salida'
export type TipoOperacionFX = 'compra_usd' | 'venta_usd'

// ═══════════════════════════════════════════════════════════════════════════════════════
// INTERFACES DE ENTIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface Banco {
  id: BancoId
  nombre: string
  moneda: Moneda
  capitalActual: number // = historicoIngresos - historicoGastos
  historicoIngresos: number // Acumulativo, NUNCA decrece
  historicoGastos: number // Acumulativo, NUNCA decrece
  historicoTransferencias: number // Acumulativo de transferencias enviadas
}

export interface Distribuidor {
  id: string
  nombre: string
  telefono?: string
  email?: string
  // Financiero
  totalOrdenesCompra: number // Suma histórica de todas las OC
  totalPagado: number // Lo que hemos pagado
  adeudoPendiente: number // totalOrdenesCompra - totalPagado
  gananciaNetaPromedio?: number
  volumenProveedor?: number
  // Referencias
  ordenesCompra: string[] // IDs de OC
}

export interface OrdenCompra {
  id: string
  fecha: Date
  distribuidorId: string
  distribuidorNombre: string // Snapshot
  // Producto
  cantidad: number // Cantidad Original
  cantidadVendida: number // Trazabilidad
  cantidadRestante: number // Stock actual del lote
  precioUnitarioUSD: number // Precio de compra por unidad en USD
  // Totales
  costoTotalUSD: number // cantidad × precioUnitarioUSD
  costoTransporteUSD: number // Flete de importación si aplica
  costoTotalConTransporte: number // costoTotalUSD + costoTransporteUSD
  // Pagos
  montoPagado: number
  montoRestante: number
  estadoPago: EstadoPago
  bancoOrigen?: BancoId // De qué banco se pagó
  // Métricas de Rentabilidad
  gananciaBruta?: number
  gananciaNeta?: number
  margenBruto?: number
  valorStockRestante?: number
  // Almacén
  entradaAlmacenId?: string // Referencia a entrada generada
}

export interface Cliente {
  id: string
  nombre: string
  telefono?: string
  email?: string
  // Financiero
  totalVentas: number // Suma histórica de todas las ventas
  totalPagado: number // Lo que ha pagado
  deudaPendiente: number // totalVentas - totalPagado
  riesgo?: string
  fidelidad?: string
  gananciaGenerada?: number
  // Referencias
  ventas: string[] // IDs de ventas
}

export interface LoteVenta {
  ocId: string
  cantidad: number
  costoUnitario: number
  ganancia: number
}

export interface Venta {
  id: string
  fecha: Date
  clienteId: string
  clienteNombre: string // Snapshot
  // Producto
  cantidad: number
  precioVentaUSD: number // Precio de venta por unidad
  precioCompraUSD: number // Costo promedio (referencial) o calculado
  precioFleteUSD: number // Flete por unidad (default 500)
  // Totales
  precioTotalVenta: number // cantidad × precioVentaUSD
  // Distribución GYA
  montoBovedaMonte: number // Costo Real (Suma de lotes)
  montoFletes: number // precioFleteUSD × cantidad
  montoUtilidades: number // (precioTotalVenta - montoBovedaMonte - montoFletes)
  // Pagos
  montoPagado: number
  montoRestante: number
  estadoPago: EstadoPago
  // Trazabilidad
  origenLotes: LoteVenta[]
  gananciaNetaVenta?: number
  margenNeto?: number
  // Almacén
  salidaAlmacenId?: string // Referencia a salida generada
}

export interface MovimientoAlmacen {
  id: string
  fecha: Date
  tipo: 'entrada' | 'salida'
  cantidad: number
  precioUnitarioUSD: number
  valorTotalUSD: number
  // Referencia
  referenciaId: string // ID de OC o Venta
  referenciaTipo: 'orden_compra' | 'venta'
  // Stock
  stockAnterior: number
  stockNuevo: number
  // Trazabilidad
  origenLotes?: LoteVenta[]
}

export interface Almacen {
  stockActual: number // Piezas actuales
  valorStockUSD: number // Valor total del stock
  // Históricos (acumulativos)
  totalEntradas: number // Total piezas que han entrado
  valorTotalEntradas: number // Valor total de entradas
  totalSalidas: number // Total piezas que han salido
  valorTotalSalidas: number // Valor total de salidas
  // Movimientos
  movimientos: MovimientoAlmacen[]
}

export interface MovimientoBanco {
  id: string
  bancoId: BancoId
  fecha: Date
  tipo: TipoMovimiento
  monto: number
  moneda: Moneda
  concepto: string
  descripcion?: string
  // Para transferencias
  bancoOrigenId?: BancoId
  bancoDestinoId?: BancoId
  // Referencias
  referenciaId?: string
  referenciaTipo?: 'venta' | 'orden_compra' | 'abono' | 'gasto' | 'transferencia'
}

export interface OperacionCasaCambio {
  id: string
  fecha: Date
  tipo: TipoOperacionFX
  montoUSD: number
  tipoCambio: number
  montoMXN: number // montoUSD × tipoCambio
  ganancia?: number // Para ventas: diferencia con TC compra
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════

export const FLETE_DEFAULT_USD = 500

export const BANCOS_RECIBEN_VENTAS: readonly BancoId[] = [
  'boveda_monte', // Recibe COSTO
  'flete_sur', // Recibe FLETE
  'utilidades', // Recibe GANANCIA
] as const

export const BANCOS_OPERATIVOS: readonly BancoId[] = [
  'azteca',
  'leftie',
  'profit',
  'boveda_usa',
] as const

export const BANCO_CONFIG: Record<
  BancoId,
  { nombre: string; moneda: Moneda; color: string; icon: string; descripcion: string }
> = {
  boveda_monte: {
    nombre: 'Bóveda Monte',
    moneda: 'USD',
    color: '#8B00FF',
    icon: '🏔️',
    descripcion: 'Costo de mercancía',
  },
  boveda_usa: {
    nombre: 'Bóveda USA',
    moneda: 'USD',
    color: '#3B82F6',
    icon: '🇺🇸',
    descripcion: 'Capital en dólares',
  },
  flete_sur: {
    nombre: 'Flete Sur',
    moneda: 'USD',
    color: '#FF1493',
    icon: '🚚',
    descripcion: 'Costos de transporte',
  },
  utilidades: {
    nombre: 'Utilidades',
    moneda: 'USD',
    color: '#FFD700',
    icon: '📈',
    descripcion: 'Ganancias netas',
  },
  profit: {
    nombre: 'Profit (Casa Cambio)',
    moneda: 'MXN',
    color: '#10B981',
    icon: '💱',
    descripcion: 'Casa de cambio USD/MXN',
  },
  leftie: {
    nombre: 'Leftie',
    moneda: 'USD',
    color: '#F59E0B',
    icon: '🏦',
    descripcion: 'Capital operativo USD',
  },
  azteca: {
    nombre: 'Azteca',
    moneda: 'MXN',
    color: '#EF4444',
    icon: '🦅',
    descripcion: 'Capital operativo MXN',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MOTOR DE LÓGICA FINANCIERA
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Calcula la distribución GYA de una venta
 *
 * FÓRMULAS SAGRADAS:
 * - Bóveda Monte = costoTotalReal (Suma de costos de lotes FIFO)
 * - Flete Sur = precioFlete × cantidad (TRANSPORTE)
 * - Utilidades = precioTotalVenta - Bóveda Monte - Flete Sur (GANANCIA NETA)
 */
export function calcularDistribucionVenta(datos: {
  cantidad: number
  precioTotalVenta: number
  costoTotalReal: number // Calculado vía FIFO
  precioFleteTotal: number
}): {
  montoBovedaMonte: number
  montoFletes: number
  montoUtilidades: number
  total: number
} {
  const { cantidad, precioTotalVenta, costoTotalReal, precioFleteTotal } = datos

  const montoBovedaMonte = costoTotalReal
  const montoFletes = precioFleteTotal
  const montoUtilidades = precioTotalVenta - montoBovedaMonte - montoFletes

  return {
    montoBovedaMonte,
    montoFletes,
    montoUtilidades,
    total: montoBovedaMonte + montoFletes + montoUtilidades,
  }
}

/**
 * Calcula distribución proporcional según estado de pago
 */
export function calcularDistribucionSegunPago(
  distribucionBase: { montoBovedaMonte: number; montoFletes: number; montoUtilidades: number },
  montoPagado: number,
  totalVenta: number,
): {
  capitalBovedaMonte: number
  capitalFletes: number
  capitalUtilidades: number
  proporcionPagada: number
  estadoPago: EstadoPago
} {
  let estadoPago: EstadoPago = 'pendiente'
  let proporcionPagada = 0

  if (totalVenta <= 0) {
     return {
        capitalBovedaMonte: 0,
        capitalFletes: 0,
        capitalUtilidades: 0,
        proporcionPagada: 1,
        estadoPago: 'completo'
     }
  }

  if (montoPagado >= totalVenta - 0.01) {
    estadoPago = 'completo'
    proporcionPagada = 1
  } else if (montoPagado > 0) {
    estadoPago = 'parcial'
    proporcionPagada = Math.min(1, Math.max(0, montoPagado / totalVenta))
  }

  return {
    capitalBovedaMonte: Number((distribucionBase.montoBovedaMonte * proporcionPagada).toFixed(2)),
    capitalFletes: Number((distribucionBase.montoFletes * proporcionPagada).toFixed(2)),
    capitalUtilidades: Number((distribucionBase.montoUtilidades * proporcionPagada).toFixed(2)),
    proporcionPagada,
    estadoPago,
  }
}

export function calcularCapitalBanco(historicoIngresos: number, historicoGastos: number): number {
  return historicoIngresos - historicoGastos
}

export function procesarTransferencia(
  bancoOrigen: Banco,
  bancoDestino: Banco,
  monto: number,
  concepto: string,
): {
  bancoOrigenActualizado: Banco
  bancoDestinoActualizado: Banco
  movimientoOrigen: Partial<MovimientoBanco>
  movimientoDestino: Partial<MovimientoBanco>
} {
  if (bancoOrigen.capitalActual < monto) {
    throw new Error(
      `Fondos insuficientes en ${bancoOrigen.nombre}. Disponible: ${bancoOrigen.capitalActual}, Requerido: ${monto}`,
    )
  }

  const ahora = new Date()

  const bancoOrigenActualizado: Banco = {
    ...bancoOrigen,
    historicoGastos: bancoOrigen.historicoGastos + monto,
    historicoTransferencias: bancoOrigen.historicoTransferencias + monto,
    capitalActual: calcularCapitalBanco(
      bancoOrigen.historicoIngresos,
      bancoOrigen.historicoGastos + monto,
    ),
  }

  const bancoDestinoActualizado: Banco = {
    ...bancoDestino,
    historicoIngresos: bancoDestino.historicoIngresos + monto,
    capitalActual: calcularCapitalBanco(
      bancoDestino.historicoIngresos + monto,
      bancoDestino.historicoGastos,
    ),
  }

  const movimientoOrigen: Partial<MovimientoBanco> = {
    bancoId: bancoOrigen.id,
    fecha: ahora,
    tipo: 'transferencia_salida',
    monto,
    moneda: bancoOrigen.moneda,
    concepto: `Transferencia a ${bancoDestino.nombre}: ${concepto}`,
    bancoOrigenId: bancoOrigen.id,
    bancoDestinoId: bancoDestino.id,
    referenciaTipo: 'transferencia',
  }

  const movimientoDestino: Partial<MovimientoBanco> = {
    bancoId: bancoDestino.id,
    fecha: ahora,
    tipo: 'transferencia_entrada',
    monto,
    moneda: bancoDestino.moneda,
    concepto: `Transferencia de ${bancoOrigen.nombre}: ${concepto}`,
    bancoOrigenId: bancoOrigen.id,
    bancoDestinoId: bancoDestino.id,
    referenciaTipo: 'transferencia',
  }

  return {
    bancoOrigenActualizado,
    bancoDestinoActualizado,
    movimientoOrigen,
    movimientoDestino,
  }
}

export function procesarGasto(
  banco: Banco,
  monto: number,
  concepto: string,
  descripcion?: string,
): {
  bancoActualizado: Banco
  movimiento: Partial<MovimientoBanco>
} {
  if (banco.capitalActual < monto) {
    throw new Error(`Fondos insuficientes en ${banco.nombre}`)
  }

  const bancoActualizado: Banco = {
    ...banco,
    historicoGastos: banco.historicoGastos + monto,
    capitalActual: calcularCapitalBanco(banco.historicoIngresos, banco.historicoGastos + monto),
  }

  const movimiento: Partial<MovimientoBanco> = {
    bancoId: banco.id,
    fecha: new Date(),
    tipo: 'gasto',
    monto,
    moneda: banco.moneda,
    concepto,
    descripcion,
    referenciaTipo: 'gasto',
  }

  return { bancoActualizado, movimiento }
}

export function procesarIngreso(
  banco: Banco,
  monto: number,
  concepto: string,
  descripcion?: string,
): {
  bancoActualizado: Banco
  movimiento: Partial<MovimientoBanco>
} {
  const bancoActualizado: Banco = {
    ...banco,
    historicoIngresos: banco.historicoIngresos + monto,
    capitalActual: calcularCapitalBanco(banco.historicoIngresos + monto, banco.historicoGastos),
  }

  const movimiento: Partial<MovimientoBanco> = {
    bancoId: banco.id,
    fecha: new Date(),
    tipo: 'ingreso',
    monto,
    moneda: banco.moneda,
    concepto,
    descripcion,
  }

  return { bancoActualizado, movimiento }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PROFIT - CASA DE CAMBIO
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface TipoCambioConfig {
  compraUSD: number
  ventaUSD: number
}

export function calcularOperacionCasaCambio(
  tipo: TipoOperacionFX,
  montoUSD: number,
  tipoCambio: number,
  tipoCambioCompraOriginal?: number,
): {
  montoMXN: number
  ganancia: number
} {
  const montoMXN = montoUSD * tipoCambio

  let ganancia = 0
  if (tipo === 'venta_usd' && tipoCambioCompraOriginal) {
    ganancia = (tipoCambio - tipoCambioCompraOriginal) * montoUSD
  }

  return { montoMXN, ganancia }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ALMACÉN - ENTRADAS Y SALIDAS (FIFO + TRAZABILIDAD)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Procesa entrada de almacén (desde Orden de Compra)
 */
export function procesarEntradaAlmacen(
  almacen: Almacen,
  cantidad: number,
  precioUnitarioUSD: number,
  ordenCompraId: string,
): {
  almacenActualizado: Almacen
  movimiento: MovimientoAlmacen
} {
  const valorTotal = cantidad * precioUnitarioUSD
  const stockAnterior = almacen.stockActual
  const stockNuevo = stockAnterior + cantidad

  const movimiento: MovimientoAlmacen = {
    id: `entrada_${Date.now()}`,
    fecha: new Date(),
    tipo: 'entrada',
    cantidad,
    precioUnitarioUSD,
    valorTotalUSD: valorTotal,
    referenciaId: ordenCompraId,
    referenciaTipo: 'orden_compra',
    stockAnterior,
    stockNuevo,
  }

  const almacenActualizado: Almacen = {
    ...almacen,
    stockActual: stockNuevo,
    valorStockUSD: almacen.valorStockUSD + valorTotal,
    totalEntradas: almacen.totalEntradas + cantidad,
    valorTotalEntradas: almacen.valorTotalEntradas + valorTotal,
    movimientos: [...almacen.movimientos, movimiento],
  }

  return { almacenActualizado, movimiento }
}

/**
 * Asigna lotes FIFO para una venta
 * Retorna qué OCs se consumen y cuánta cantidad de cada una
 */
export function asignarLotesFIFO(
  ordenesCompra: Record<string, OrdenCompra>,
  cantidadSolicitada: number
): {
  lotesUsados: LoteVenta[]
  ordenesActualizadas: Record<string, OrdenCompra>
  costoTotalReal: number
} {
  const lotesUsados: LoteVenta[] = []
  const ordenesActualizadas = { ...ordenesCompra }
  let cantidadRestantePorCubrir = cantidadSolicitada
  let costoTotalReal = 0

  // 1. Filtrar OCs con stock disponible y ordenar por fecha (FIFO)
  const lotesDisponibles = Object.values(ordenesCompra)
    .filter((oc) => oc.cantidadRestante > 0)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  // 2. Iterar lotes
  for (const lote of lotesDisponibles) {
    if (cantidadRestantePorCubrir <= 0) break

    const cantidadTomar = Math.min(lote.cantidadRestante, cantidadRestantePorCubrir)
    const costoLote = cantidadTomar * lote.precioUnitarioUSD

    // Registrar lote usado
    lotesUsados.push({
      ocId: lote.id,
      cantidad: cantidadTomar,
      costoUnitario: lote.precioUnitarioUSD,
      ganancia: 0, // Se calcula después con precio venta
    })

    // Actualizar métricas del lote
    const loteActualizado = { ...lote }
    loteActualizado.cantidadRestante -= cantidadTomar
    loteActualizado.cantidadVendida += cantidadTomar
    loteActualizado.valorStockRestante = loteActualizado.cantidadRestante * loteActualizado.precioUnitarioUSD
    
    ordenesActualizadas[lote.id] = loteActualizado

    costoTotalReal += costoLote
    cantidadRestantePorCubrir -= cantidadTomar
  }

  if (cantidadRestantePorCubrir > 0) {
    throw new Error(`Stock insuficiente en lotes. Faltan ${cantidadRestantePorCubrir} unidades.`)
  }

  return { lotesUsados, ordenesActualizadas, costoTotalReal }
}

/**
 * Procesa salida de almacén (desde Venta) con Lógica FIFO
 */
export function procesarSalidaAlmacen(
  almacen: Almacen,
  ordenesCompra: Record<string, OrdenCompra>, // Input para FIFO
  cantidad: number,
  precioVentaUSD: number,
  ventaId: string,
): {
  almacenActualizado: Almacen
  ordenesCompraActualizadas: Record<string, OrdenCompra>
  movimiento: MovimientoAlmacen
  lotesUsados: LoteVenta[]
  costoTotalReal: number
} {
  // 1. Asignar Lotes FIFO
  const { lotesUsados, ordenesActualizadas, costoTotalReal } = asignarLotesFIFO(ordenesCompra, cantidad)

  // 2. Actualizar Almacén
  const valorTotalVenta = cantidad * precioVentaUSD
  const stockAnterior = almacen.stockActual
  const stockNuevo = stockAnterior - cantidad

  const movimiento: MovimientoAlmacen = {
    id: `salida_${Date.now()}`,
    fecha: new Date(),
    tipo: 'salida',
    cantidad,
    precioUnitarioUSD: precioVentaUSD,
    valorTotalUSD: valorTotalVenta,
    referenciaId: ventaId,
    referenciaTipo: 'venta',
    stockAnterior,
    stockNuevo,
    origenLotes: lotesUsados,
  }

  const almacenActualizado: Almacen = {
    ...almacen,
    stockActual: stockNuevo,
    // Restamos el costo real de los lotes, no un promedio
    valorStockUSD: Math.max(0, almacen.valorStockUSD - costoTotalReal), 
    totalSalidas: almacen.totalSalidas + cantidad,
    valorTotalSalidas: almacen.valorTotalSalidas + valorTotalVenta,
    movimientos: [...almacen.movimientos, movimiento],
  }

  return { 
    almacenActualizado, 
    ordenesCompraActualizadas: ordenesActualizadas,
    movimiento, 
    lotesUsados,
    costoTotalReal 
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ESTADÍSTICAS Y PREDICCIONES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface EstadisticasVentas {
  totalVentas: number
  totalUnidadesVendidas: number
  precioPromedioVenta: number
  margenPromedioNeto: number
  ventasPorPeriodo: { periodo: string; ventas: number; unidades: number }[]
  prediccionProximoMes: number
}

export interface EstadisticasRentabilidad {
  margenBrutoPromedio: number
  margenNetoPromedio: number
  rotacionInventario: number
  diasInventario: number
  puntoEquilibrio: number
  roi: number
}

export function calcularEstadisticasRentabilidad(datos: {
  ventas: Venta[]
  costosFijos: number
  capitalInvertido: number
  stockPromedio: number
}): EstadisticasRentabilidad {
  const { ventas, costosFijos, capitalInvertido, stockPromedio } = datos

  if (ventas.length === 0) {
    return {
      margenBrutoPromedio: 0,
      margenNetoPromedio: 0,
      rotacionInventario: 0,
      diasInventario: 0,
      puntoEquilibrio: 0,
      roi: 0,
    }
  }

  let totalVenta = 0
  let totalCosto = 0
  let totalUtilidad = 0
  let totalUnidades = 0

  for (const venta of ventas) {
    totalVenta += venta.precioTotalVenta
    totalCosto += venta.montoBovedaMonte
    totalUtilidad += venta.montoUtilidades
    totalUnidades += venta.cantidad
  }

  const margenBrutoPromedio = totalVenta > 0 ? ((totalVenta - totalCosto) / totalVenta) * 100 : 0
  const margenNetoPromedio = totalVenta > 0 ? (totalUtilidad / totalVenta) * 100 : 0
  const rotacionInventario = stockPromedio > 0 ? totalUnidades / stockPromedio : 0
  const diasInventario = rotacionInventario > 0 ? 365 / rotacionInventario : 0
  const margenContribucionUnit = ventas.length > 0 ? totalUtilidad / totalUnidades : 0
  const puntoEquilibrio = margenContribucionUnit > 0 ? costosFijos / margenContribucionUnit : 0
  const roi = capitalInvertido > 0 ? (totalUtilidad / capitalInvertido) * 100 : 0

  return {
    margenBrutoPromedio,
    margenNetoPromedio,
    rotacionInventario,
    diasInventario,
    puntoEquilibrio,
    roi,
  }
}

export function predecirVentas(ventasHistoricas: { mes: number; monto: number }[]): number {
  if (ventasHistoricas.length < 2) {
    return ventasHistoricas.length > 0 ? ventasHistoricas[0]?.monto || 0 : 0
  }

  const n = ventasHistoricas.length
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0

  for (let i = 0; i < n; i++) {
    const venta = ventasHistoricas[i]
    if (!venta) continue
    const x = venta.mes
    const y = venta.monto
    sumX += x
    sumY += y
    sumXY += x * y
    sumX2 += x * x
  }

  const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercepto = (sumY - pendiente * sumX) / n
  const ultimaVenta = ventasHistoricas[n - 1]
  const siguienteMes = (ultimaVenta?.mes || 0) + 1
  return Math.max(0, pendiente * siguienteMes + intercepto)
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VALIDACIONES
// ═══════════════════════════════════════════════════════════════════════════════════════

export function validarOrdenCompra(datos: {
  cantidad: number
  precioUnitario: number
  distribuidorNombre: string
}): { valido: boolean; errores: string[] } {
  const errores: string[] = []

  if (datos.cantidad <= 0) errores.push('La cantidad debe ser mayor a 0')
  if (datos.precioUnitario <= 0) errores.push('El precio unitario debe ser mayor a 0')
  if (!datos.distribuidorNombre.trim()) errores.push('El nombre del distribuidor es requerido')

  return { valido: errores.length === 0, errores }
}

export function validarVenta(datos: {
  cantidad: number
  precioVenta: number
  clienteNombre: string
  stockDisponible: number
}): { valido: boolean; errores: string[] } {
  const errores: string[] = []

  if (datos.cantidad <= 0) errores.push('La cantidad debe ser mayor a 0')
  if (datos.precioVenta <= 0) errores.push('El precio de venta debe ser mayor a 0')
  if (!datos.clienteNombre.trim()) errores.push('El nombre del cliente es requerido')
  if (datos.cantidad > datos.stockDisponible) {
    errores.push(`Stock insuficiente. Disponible: ${datos.stockDisponible}`)
  }

  return { valido: errores.length === 0, errores }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const FlowDistributorEngine = {
  calcularDistribucionVenta,
  calcularDistribucionSegunPago,
  calcularCapitalBanco,
  calcularOperacionCasaCambio,
  calcularEstadisticasRentabilidad,
  predecirVentas,
  procesarTransferencia,
  procesarGasto,
  procesarIngreso,
  procesarEntradaAlmacen,
  procesarSalidaAlmacen,
  asignarLotesFIFO,
  validarOrdenCompra,
  validarVenta,
  FLETE_DEFAULT_USD,
  BANCOS_RECIBEN_VENTAS,
  BANCOS_OPERATIVOS,
  BANCO_CONFIG,
}

export default FlowDistributorEngine