/**
 * 🔒 SERVICIO DE TRANSACCIONES - ZUSTAND WRAPPER
 * 
 * Wrapper que mantiene la misma interfaz pública del servicio de transacciones
 * original (Firebase), pero delega toda la lógica al store de Zustand + Turso.
 * 
 * Los modals importan las funciones y tipos de este archivo.
 * Internamente, cada función llama a useAppStore.getState().accion()
 */

import { useAppStore } from "@/lib/store/useAppStore"
import { logger } from "@/lib/utils/logger"

// ===================================================================
// TIPOS (exportados tal cual para compatibilidad con modals)
// ===================================================================

export type BancoId = 
  | 'boveda_monte' 
  | 'boveda_usa' 
  | 'utilidades' 
  | 'flete_sur' 
  | 'azteca' 
  | 'leftie' 
  | 'profit'

export interface DistribucionBancos {
  boveda_monte: number
  boveda_usa: number
  utilidades: number
  flete_sur: number
  azteca: number
  leftie: number
  profit: number
}

export interface VentaItem {
  productoId: string
  productoNombre: string
  cantidad: number
  precioUnitario: number
  precioCompra: number
  precioFlete: number
}

export interface VentaData {
  items: VentaItem[]
  total: number
  clienteId: string
  clienteNombre: string
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'transferencia_usa' | 'crypto'
  montoPagado: number
  montoRestante: number
  moneda?: 'MXN' | 'USD'
  tipoCambio?: number
}

export interface OrdenCompraData {
  distribuidorId: string
  distribuidorNombre: string
  producto: string
  cantidad: number
  costoDistribuidor: number
  costoTransporte: number
  costoTotal: number
  pagoInicial: number
  deuda: number
  bancoOrigen?: string
}

export interface AbonoData {
  entidadId: string
  entidadTipo: 'cliente' | 'distribuidor'
  monto: number
  bancoDestino?: string
  concepto?: string
}

export interface TransferenciaData {
  bancoOrigenId: string
  bancoDestinoId: string
  monto: number
  concepto: string
}

export interface ResultadoTransaccion {
  success: boolean
  error?: string
  documentId?: string
  data?: Record<string, unknown>
}

// ===================================================================
// FUNCIONES WRAPPER
// ===================================================================

export async function procesarVentaAtomica(venta: VentaData): Promise<ResultadoTransaccion> {
  try {
    logger.info("Procesando venta atómica via Zustand store", { context: "TransactionService" })
    const store = useAppStore.getState()
    
    store.crearVenta({
      clienteId: venta.clienteId,
      clienteNombre: venta.clienteNombre,
      items: venta.items,
      total: venta.total,
      metodoPago: venta.metodoPago,
      montoPagado: venta.montoPagado,
      montoRestante: venta.montoRestante,
      moneda: venta.moneda,
      tipoCambio: venta.tipoCambio,
    })

    const documentId = `venta-${Date.now()}`
    logger.info(`Venta procesada exitosamente: ${documentId}`, { context: "TransactionService" })

    return { success: true, documentId }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido"
    logger.error("Error procesando venta", error, { context: "TransactionService" })
    return { success: false, error: msg }
  }
}

export async function procesarOrdenCompraAtomica(orden: OrdenCompraData): Promise<ResultadoTransaccion> {
  try {
    logger.info("Procesando orden de compra via Zustand store", { context: "TransactionService" })
    const store = useAppStore.getState()

    store.crearOrdenCompra({
      distribuidorId: orden.distribuidorId,
      distribuidorNombre: orden.distribuidorNombre,
      producto: orden.producto,
      cantidad: orden.cantidad,
      costoDistribuidor: orden.costoDistribuidor,
      costoTransporte: orden.costoTransporte,
      costoTotal: orden.costoTotal,
      pagoInicial: orden.pagoInicial,
      deuda: orden.deuda,
      bancoOrigen: orden.bancoOrigen,
    })

    const documentId = `oc-${Date.now()}`
    logger.info(`Orden de compra procesada: ${documentId}`, { context: "TransactionService" })

    return { success: true, documentId }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido"
    logger.error("Error procesando orden de compra", error, { context: "TransactionService" })
    return { success: false, error: msg }
  }
}

export async function procesarAbonoAtomico(abono: AbonoData): Promise<ResultadoTransaccion> {
  try {
    logger.info("Procesando abono via Zustand store", { context: "TransactionService" })
    const store = useAppStore.getState()

    store.addAbono({
      tipo: abono.entidadTipo,
      entidadId: abono.entidadId,
      monto: abono.monto,
      bancoId: abono.bancoDestino,
    })

    const documentId = `abono-${Date.now()}`
    logger.info(`Abono procesado: ${documentId}`, { context: "TransactionService" })

    return { success: true, documentId }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido"
    logger.error("Error procesando abono", error, { context: "TransactionService" })
    return { success: false, error: msg }
  }
}

export async function procesarTransferenciaAtomica(transferencia: TransferenciaData): Promise<ResultadoTransaccion> {
  try {
    logger.info("Procesando transferencia via Zustand store", { context: "TransactionService" })
    const store = useAppStore.getState()

    store.crearTransferencia(
      transferencia.bancoOrigenId,
      transferencia.bancoDestinoId,
      transferencia.monto
    )

    const documentId = `trans-${Date.now()}`
    logger.info(`Transferencia procesada: ${documentId}`, { context: "TransactionService" })

    return { success: true, documentId }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido"
    logger.error("Error procesando transferencia", error, { context: "TransactionService" })
    return { success: false, error: msg }
  }
}
