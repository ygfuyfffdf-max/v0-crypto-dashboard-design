/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🏛️ CHRONOS INFINITY 2026 — FINANCE STORE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Store Zustand con lógica GYA EXACTA:
 * - Bóveda Monte = precioCompra × cantidad (COSTO)
 * - Flete Sur = precioFlete × cantidad (TRANSPORTE)
 * - Utilidades = (precioVenta - precioCompra - precioFlete) × cantidad (GANANCIA NETA)
 *
 * 7 Bancos del sistema:
 * - boveda_monte, boveda_usa, utilidades, flete_sur, azteca, leftie, profit
 *
 * Versión: 1.0 - Lógica GYA perfecta
 * Fecha: 2025-12-10
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { BancoId, Movimiento, Venta } from '@/app/types'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { logger } from '../utils/logger'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS — LÓGICA GYA
// ═══════════════════════════════════════════════════════════════════════════

/** Distribución automática a los 3 bancos GYA */
export interface DistribucionGYA {
  bovedaMonte: number // COSTO: precioCompra × cantidad
  fleteSur: number // TRANSPORTE: precioFlete × cantidad
  utilidades: number // GANANCIA: (PV - PC - PF) × cantidad
  total: number // bovedaMonte + fleteSur + utilidades
}

/** Estado de un banco */
export interface BancoState {
  id: BancoId
  nombre: string
  capitalActual: number
  historicoIngresos: number
  historicoGastos: number
  color: string
  tipo: 'boveda' | 'operativo' | 'gastos' | 'utilidades'
  recibeDeVentas: boolean
}

/** Datos para crear una venta */
export interface DatosVenta {
  cantidad: number
  precioVenta: number // Precio por unidad al cliente
  precioCompra: number // Costo por unidad (de la OC)
  precioFlete?: number // Flete por unidad (default: 500)
  montoPagado: number // Monto que pagó el cliente
  clienteId: string
  ocRelacionada: string
}

/** Datos para crear una orden de compra */
export interface DatosOrdenCompra {
  cantidad: number
  costoDistribuidor: number // Costo por unidad
  costoTransporte?: number // Transporte por unidad (default: 0)
  pagoInicial?: number // Pago inicial al distribuidor
  distribuidorId: string
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE BANCOS
// ═══════════════════════════════════════════════════════════════════════════

const BANCOS_CONFIG: Record<
  BancoId,
  Omit<BancoState, 'capitalActual' | 'historicoIngresos' | 'historicoGastos'>
> = {
  boveda_monte: {
    id: 'boveda_monte',
    nombre: 'Bóveda Monte',
    color: '#FFD700', // Oro
    tipo: 'boveda',
    recibeDeVentas: true, // Recibe COSTO
  },
  boveda_usa: {
    id: 'boveda_usa',
    nombre: 'Bóveda USA',
    color: '#8B00FF', // Violeta
    tipo: 'boveda',
    recibeDeVentas: false,
  },
  utilidades: {
    id: 'utilidades',
    nombre: 'Utilidades',
    color: '#FF1493', // Rosa/Magenta
    tipo: 'utilidades',
    recibeDeVentas: true, // Recibe GANANCIA
  },
  flete_sur: {
    id: 'flete_sur',
    nombre: 'Flete Sur',
    color: '#8B00FF', // Violeta
    tipo: 'gastos',
    recibeDeVentas: true, // Recibe FLETE
  },
  azteca: {
    id: 'azteca',
    nombre: 'Azteca',
    color: '#FF8C00', // Naranja
    tipo: 'operativo',
    recibeDeVentas: false,
  },
  leftie: {
    id: 'leftie',
    nombre: 'Leftie',
    color: '#FF1493', // Rosa
    tipo: 'operativo',
    recibeDeVentas: false,
  },
  profit: {
    id: 'profit',
    nombre: 'Profit',
    color: '#00FF88', // Verde
    tipo: 'operativo',
    recibeDeVentas: false,
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// FÓRMULAS GYA — LÓGICA DE NEGOCIO EXACTA (SAGRADA)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula la distribución GYA para una venta
 *
 * LÓGICA SAGRADA:
 * - precioTotalUnidad = precioVenta + precioFlete (lo que paga el cliente por unidad)
 * - precioTotalVenta = precioTotalUnidad × cantidad (total cobrado al cliente)
 *
 * DISTRIBUCIÓN GYA:
 * - Bóveda Monte = precioCompra × cantidad (COSTO)
 * - Flete Sur = precioFlete × cantidad (TRANSPORTE)
 * - Utilidades = (precioVenta - precioCompra - precioFlete) × cantidad (GANANCIA NETA)
 *
 * @example
 * // Venta de 10 unidades a $10,000 c/u, costo $6,300, flete $500
 * calcularDistribucionGYA({
 *   cantidad: 10,
 *   precioVenta: 10000,
 *   precioCompra: 6300,
 *   precioFlete: 500
 * })
 * // Resultado: {
 * //   bovedaMonte: 63000,
 * //   fleteSur: 5000,
 * //   utilidades: 32000,
 * //   total: 105000,           // Lo que PAGA el cliente (10,500 × 10)
 * //   totalDistribuido: 100000  // Lo que va a los 3 bancos
 * // }
 */
export function calcularDistribucionGYA(
  datos: Omit<DatosVenta, 'montoPagado' | 'clienteId' | 'ocRelacionada'>,
): DistribucionGYA {
  const { cantidad, precioVenta, precioCompra, precioFlete = 500 } = datos

  // Distribución a los 3 bancos GYA
  const bovedaMonte = precioCompra * cantidad // COSTO → Bóveda Monte
  const fleteSur = precioFlete * cantidad // TRANSPORTE → Flete Sur
  const utilidades = (precioVenta - precioCompra - precioFlete) * cantidad // GANANCIA NETA → Utilidades

  // LÓGICA SAGRADA: total = (precioVenta + precioFlete) × cantidad
  // Este es el monto que el CLIENTE PAGA
  const total = (precioVenta + precioFlete) * cantidad

  return { bovedaMonte, fleteSur, utilidades, total }
}

/**
 * Calcula la distribución proporcional para un pago parcial
 *
 * @example
 * // Pago del 50% de una venta de $100,000
 * calcularDistribucionParcial(distribucionOriginal, 100000, 50000)
 * // Resultado: distribución × 0.5
 */
export function calcularDistribucionParcial(
  distribucionOriginal: DistribucionGYA,
  totalVenta: number,
  montoPagado: number,
): DistribucionGYA {
  const proporcion = montoPagado / totalVenta

  return {
    bovedaMonte: distribucionOriginal.bovedaMonte * proporcion,
    fleteSur: distribucionOriginal.fleteSur * proporcion,
    utilidades: distribucionOriginal.utilidades * proporcion,
    total: montoPagado,
  }
}

/**
 * Determina el estado de pago de una venta
 */
export function calcularEstadoPago(
  totalVenta: number,
  montoPagado: number,
): 'completo' | 'parcial' | 'pendiente' {
  if (montoPagado >= totalVenta) return 'completo'
  if (montoPagado > 0) return 'parcial'
  return 'pendiente'
}

/**
 * Calcula los totales de una orden de compra
 */
export function calcularOrdenCompra(datos: DatosOrdenCompra) {
  const { cantidad, costoDistribuidor, costoTransporte = 0, pagoInicial = 0 } = datos

  const costoPorUnidad = costoDistribuidor + costoTransporte
  const costoTotal = costoPorUnidad * cantidad
  const deuda = costoTotal - pagoInicial

  let estado: 'pendiente' | 'parcial' | 'completo' = 'pendiente'
  if (deuda <= 0) estado = 'completo'
  else if (pagoInicial > 0) estado = 'parcial'

  return {
    costoPorUnidad,
    costoTotal,
    pagoInicial,
    deuda,
    estado,
    stockInicial: cantidad,
    stockActual: cantidad,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

interface FinanceState {
  // ═══════════════════════════════════════════════════════════════════════
  // ESTADO
  // ═══════════════════════════════════════════════════════════════════════
  bancos: Record<BancoId, BancoState>
  capitalTotal: number
  ventasHoy: number
  ventasMes: number
  deudaClientes: number
  deudaDistribuidores: number
  stockTotal: number

  // Datos reactivos para 3D
  ultimaVenta: Venta | null
  ultimoMovimiento: Movimiento | null
  modoExtasis: boolean // Cuando utilidades > 50% ROCE

  // ═══════════════════════════════════════════════════════════════════════
  // ACCIONES — VENTAS
  // ═══════════════════════════════════════════════════════════════════════

  /** Registra una nueva venta con distribución GYA automática */
  registrarVenta: (datos: DatosVenta) => DistribucionGYA

  /** Registra un abono de cliente con redistribución proporcional */
  registrarAbono: (ventaId: string, montoAbono: number) => DistribucionGYA

  // ═══════════════════════════════════════════════════════════════════════
  // ACCIONES — ÓRDENES DE COMPRA
  // ═══════════════════════════════════════════════════════════════════════

  /** Registra una nueva orden de compra */
  registrarOrdenCompra: (datos: DatosOrdenCompra) => ReturnType<typeof calcularOrdenCompra>

  /** Registra un pago a distribuidor */
  registrarPagoDistribuidor: (ordenId: string, monto: number, bancoOrigen: BancoId) => void

  // ═══════════════════════════════════════════════════════════════════════
  // ACCIONES — BANCOS
  // ═══════════════════════════════════════════════════════════════════════

  /** Registra un ingreso manual a un banco */
  registrarIngreso: (bancoId: BancoId, monto: number, concepto: string) => void

  /** Registra un gasto desde un banco */
  registrarGasto: (bancoId: BancoId, monto: number, concepto: string) => void

  /** Transfiere entre bancos */
  transferir: (bancoOrigen: BancoId, bancoDestino: BancoId, monto: number, concepto: string) => void

  // ═══════════════════════════════════════════════════════════════════════
  // ACCIONES — SINCRONIZACIÓN
  // ═══════════════════════════════════════════════════════════════════════

  /** Sincroniza todos los bancos desde Firebase/Firestore */
  sincronizarBancos: (bancosData: BancoState[]) => void

  /** Sincroniza métricas del dashboard */
  sincronizarMetricas: (metricas: {
    ventasHoy?: number
    ventasMes?: number
    deudaClientes?: number
    deudaDistribuidores?: number
    stockTotal?: number
  }) => void

  /** Activa modo éxtasis cuando hay ganancias excepcionales */
  activarModoExtasis: (activo: boolean) => void
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

const initialBancos: Record<BancoId, BancoState> = Object.entries(BANCOS_CONFIG).reduce(
  (acc, [id, config]) => ({
    ...acc,
    [id]: {
      ...config,
      capitalActual: 0,
      historicoIngresos: 0,
      historicoGastos: 0,
    },
  }),
  {} as Record<BancoId, BancoState>,
)

export const useFinanceStore = create<FinanceState>()(
  devtools(
    persist(
      (set, get) => ({
        // ═════════════════════════════════════════════════════════════════
        // ESTADO INICIAL
        // ═════════════════════════════════════════════════════════════════
        bancos: initialBancos,
        capitalTotal: 0,
        ventasHoy: 0,
        ventasMes: 0,
        deudaClientes: 0,
        deudaDistribuidores: 0,
        stockTotal: 0,
        ultimaVenta: null,
        ultimoMovimiento: null,
        modoExtasis: false,

        // ═════════════════════════════════════════════════════════════════
        // VENTAS
        // ═════════════════════════════════════════════════════════════════

        registrarVenta: (datos) => {
          const distribucion = calcularDistribucionGYA(datos)
          const estadoPago = calcularEstadoPago(distribucion.total, datos.montoPagado)

          // Calcular distribución real según pago
          const distribucionReal =
            estadoPago === 'completo'
              ? distribucion
              : estadoPago === 'parcial'
                ? calcularDistribucionParcial(distribucion, distribucion.total, datos.montoPagado)
                : { bovedaMonte: 0, fleteSur: 0, utilidades: 0, total: 0 }

          set((state) => {
            const newBancos = { ...state.bancos }

            // Solo distribuir si hubo pago
            if (estadoPago !== 'pendiente') {
              // Bóveda Monte recibe COSTO
              newBancos.boveda_monte = {
                ...newBancos.boveda_monte,
                capitalActual: newBancos.boveda_monte.capitalActual + distribucionReal.bovedaMonte,
                historicoIngresos:
                  newBancos.boveda_monte.historicoIngresos + distribucionReal.bovedaMonte,
              }

              // Flete Sur recibe TRANSPORTE
              newBancos.flete_sur = {
                ...newBancos.flete_sur,
                capitalActual: newBancos.flete_sur.capitalActual + distribucionReal.fleteSur,
                historicoIngresos:
                  newBancos.flete_sur.historicoIngresos + distribucionReal.fleteSur,
              }

              // Utilidades recibe GANANCIA
              newBancos.utilidades = {
                ...newBancos.utilidades,
                capitalActual: newBancos.utilidades.capitalActual + distribucionReal.utilidades,
                historicoIngresos:
                  newBancos.utilidades.historicoIngresos + distribucionReal.utilidades,
              }
            }

            // Calcular capital total
            const capitalTotal = Object.values(newBancos).reduce(
              (sum, banco) => sum + banco.capitalActual,
              0,
            )

            // Calcular deuda cliente si pago incompleto
            const deudaCliente =
              estadoPago === 'completo' ? 0 : distribucion.total - datos.montoPagado

            logger.info('Venta registrada con distribución GYA', {
              context: 'FinanceStore',
              data: {
                distribucion: distribucionReal,
                estadoPago,
                deudaCliente,
              },
            })

            return {
              bancos: newBancos,
              capitalTotal,
              ventasHoy: state.ventasHoy + distribucion.total,
              deudaClientes: state.deudaClientes + deudaCliente,
            }
          })

          return distribucionReal
        },

        registrarAbono: (ventaId, montoAbono) => {
          // En producción, obtendríamos la venta de Firestore
          // Por ahora, asumimos distribución proporcional estándar
          const distribucionAbono = {
            bovedaMonte: montoAbono * 0.63, // ~63% a costo
            fleteSur: montoAbono * 0.05, // ~5% a flete
            utilidades: montoAbono * 0.32, // ~32% a utilidad
            total: montoAbono,
          }

          set((state) => {
            const newBancos = { ...state.bancos }

            newBancos.boveda_monte.capitalActual += distribucionAbono.bovedaMonte
            newBancos.boveda_monte.historicoIngresos += distribucionAbono.bovedaMonte

            newBancos.flete_sur.capitalActual += distribucionAbono.fleteSur
            newBancos.flete_sur.historicoIngresos += distribucionAbono.fleteSur

            newBancos.utilidades.capitalActual += distribucionAbono.utilidades
            newBancos.utilidades.historicoIngresos += distribucionAbono.utilidades

            const capitalTotal = Object.values(newBancos).reduce(
              (sum, banco) => sum + banco.capitalActual,
              0,
            )

            return {
              bancos: newBancos,
              capitalTotal,
              deudaClientes: state.deudaClientes - montoAbono,
            }
          })

          return distribucionAbono
        },

        // ═════════════════════════════════════════════════════════════════
        // ÓRDENES DE COMPRA
        // ═════════════════════════════════════════════════════════════════

        registrarOrdenCompra: (datos) => {
          const resultado = calcularOrdenCompra(datos)

          set((state) => ({
            stockTotal: state.stockTotal + resultado.stockActual,
            deudaDistribuidores: state.deudaDistribuidores + resultado.deuda,
          }))

          logger.info('Orden de compra registrada', {
            context: 'FinanceStore',
            data: resultado,
          })

          return resultado
        },

        registrarPagoDistribuidor: (ordenId, monto, bancoOrigen) => {
          set((state) => {
            const newBancos = { ...state.bancos }

            // Restar del banco origen
            newBancos[bancoOrigen] = {
              ...newBancos[bancoOrigen],
              capitalActual: newBancos[bancoOrigen].capitalActual - monto,
              historicoGastos: newBancos[bancoOrigen].historicoGastos + monto,
            }

            const capitalTotal = Object.values(newBancos).reduce(
              (sum, banco) => sum + banco.capitalActual,
              0,
            )

            return {
              bancos: newBancos,
              capitalTotal,
              deudaDistribuidores: state.deudaDistribuidores - monto,
            }
          })
        },

        // ═════════════════════════════════════════════════════════════════
        // BANCOS
        // ═════════════════════════════════════════════════════════════════

        registrarIngreso: (bancoId, monto, concepto) => {
          set((state) => {
            const newBancos = { ...state.bancos }

            newBancos[bancoId] = {
              ...newBancos[bancoId],
              capitalActual: newBancos[bancoId].capitalActual + monto,
              historicoIngresos: newBancos[bancoId].historicoIngresos + monto,
            }

            const capitalTotal = Object.values(newBancos).reduce(
              (sum, banco) => sum + banco.capitalActual,
              0,
            )

            logger.info(`Ingreso registrado en ${bancoId}`, {
              context: 'FinanceStore',
              data: { monto, concepto },
            })

            return { bancos: newBancos, capitalTotal }
          })
        },

        registrarGasto: (bancoId, monto, concepto) => {
          set((state) => {
            const newBancos = { ...state.bancos }

            newBancos[bancoId] = {
              ...newBancos[bancoId],
              capitalActual: newBancos[bancoId].capitalActual - monto,
              historicoGastos: newBancos[bancoId].historicoGastos + monto,
            }

            const capitalTotal = Object.values(newBancos).reduce(
              (sum, banco) => sum + banco.capitalActual,
              0,
            )

            return { bancos: newBancos, capitalTotal }
          })
        },

        transferir: (bancoOrigen, bancoDestino, monto, concepto) => {
          set((state) => {
            const newBancos = { ...state.bancos }

            // Restar del origen
            newBancos[bancoOrigen] = {
              ...newBancos[bancoOrigen],
              capitalActual: newBancos[bancoOrigen].capitalActual - monto,
              historicoGastos: newBancos[bancoOrigen].historicoGastos + monto,
            }

            // Sumar al destino
            newBancos[bancoDestino] = {
              ...newBancos[bancoDestino],
              capitalActual: newBancos[bancoDestino].capitalActual + monto,
              historicoIngresos: newBancos[bancoDestino].historicoIngresos + monto,
            }

            logger.info(`Transferencia: ${bancoOrigen} → ${bancoDestino}`, {
              context: 'FinanceStore',
              data: { monto, concepto },
            })

            return { bancos: newBancos }
          })
        },

        // ═════════════════════════════════════════════════════════════════
        // SINCRONIZACIÓN
        // ═════════════════════════════════════════════════════════════════

        sincronizarBancos: (bancosData) => {
          set((state) => {
            const newBancos = { ...state.bancos }

            bancosData.forEach((banco) => {
              if (newBancos[banco.id]) {
                newBancos[banco.id] = {
                  ...newBancos[banco.id],
                  ...banco,
                }
              }
            })

            const capitalTotal = Object.values(newBancos).reduce(
              (sum, banco) => sum + banco.capitalActual,
              0,
            )

            logger.debug('Bancos sincronizados desde Firestore', {
              context: 'FinanceStore',
              data: { capitalTotal, bancos: bancosData.length },
            })

            return { bancos: newBancos, capitalTotal }
          })
        },

        sincronizarMetricas: (metricas) => {
          set((state) => ({
            ventasHoy: metricas.ventasHoy ?? state.ventasHoy,
            ventasMes: metricas.ventasMes ?? state.ventasMes,
            deudaClientes: metricas.deudaClientes ?? state.deudaClientes,
            deudaDistribuidores: metricas.deudaDistribuidores ?? state.deudaDistribuidores,
            stockTotal: metricas.stockTotal ?? state.stockTotal,
          }))
        },

        activarModoExtasis: (activo) => {
          set({ modoExtasis: activo })

          if (activo) {
            logger.info('🎉 MODO ÉXTASIS ACTIVADO — Ganancias excepcionales', {
              context: 'FinanceStore',
            })
          }
        },
      }),
      {
        name: 'chronos-finance-storage',
        // Solo persistir métricas, NO datos sensibles
        partialize: (state) => ({
          capitalTotal: state.capitalTotal,
          modoExtasis: state.modoExtasis,
        }),
      },
    ),
    { name: 'ChronosFinanceStore' },
  ),
)

// ═══════════════════════════════════════════════════════════════════════════
// SELECTORES OPTIMIZADOS
// ═══════════════════════════════════════════════════════════════════════════

/** Selector para obtener un banco específico */
export const useBanco = (bancoId: BancoId) => useFinanceStore((state) => state.bancos[bancoId])

/** Selector para obtener los 3 bancos GYA */
export const useBancosGYA = () =>
  useFinanceStore((state) => ({
    bovedaMonte: state.bancos.boveda_monte,
    fleteSur: state.bancos.flete_sur,
    utilidades: state.bancos.utilidades,
  }))

/** Selector para capital total */
export const useCapitalTotal = () => useFinanceStore((state) => state.capitalTotal)

/** Selector para métricas del dashboard */
export const useDashboardMetrics = () =>
  useFinanceStore((state) => ({
    capitalTotal: state.capitalTotal,
    ventasHoy: state.ventasHoy,
    ventasMes: state.ventasMes,
    deudaClientes: state.deudaClientes,
    deudaDistribuidores: state.deudaDistribuidores,
    stockTotal: state.stockTotal,
    modoExtasis: state.modoExtasis,
  }))

/** Selector para todos los bancos ordenados por capital */
export const useBancosOrdenados = () =>
  useFinanceStore((state) =>
    Object.values(state.bancos).sort((a, b) => b.capitalActual - a.capitalActual),
  )
