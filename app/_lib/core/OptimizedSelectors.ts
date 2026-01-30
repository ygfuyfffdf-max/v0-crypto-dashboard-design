/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🎯 CHRONOS INFINITY 2030 — SELECTORS OPTIMIZADOS PARA STORES
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Selectores memoizados para prevenir re-renders innecesarios.
 * Implementa el patrón de "picking state slices" recomendado por Zustand.
 * 
 * Uso:
 * ```tsx
 * // En lugar de:
 * const { bancos, totalCapital } = useAppStore()
 * 
 * // Usar:
 * const bancos = useAppStore(selectBancos)
 * const totalCapital = useAppStore(selectTotalCapital)
 * ```
 * 
 * Esto previene re-renders cuando otras partes del store cambian.
 * 
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import type { BancoId } from '@/app/types'
import { shallow } from 'zustand/shallow'
import { createWithEqualityFn } from 'zustand/traditional'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS DE ESTADO BASE (importar de los stores reales)
// ═══════════════════════════════════════════════════════════════════════════════════════

interface BancoUIState {
  id: BancoId
  nombre: string
  saldo: number
  color: string
}

interface AppState {
  currentPanel: string
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'cyber'
  soundEnabled: boolean
  soundVolume: number
  currentUserId: string | null
  voiceAgentActive: boolean
  voiceAgentStatus: 'idle' | 'listening' | 'thinking' | 'speaking'
  audioFrequencies: number[]
  modelRotation: number
  activeScene: string | null
  totalCapital: number
  bancos: BancoUIState[]
  dataRefreshTrigger: number
}

interface DataState {
  ventas: unknown[]
  clientes: unknown[]
  distribuidores: unknown[]
  ordenesCompra: unknown[]
  movimientos: unknown[]
  bancos: unknown[]
  loading: boolean
  initialized: boolean
}

interface FinanceState {
  bancos: Record<BancoId, unknown>
  ventasPendientes: unknown[]
  ordenesActivas: unknown[]
  totalIngresos: number
  totalGastos: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SELECTORES PARA APP STORE
// ═══════════════════════════════════════════════════════════════════════════════════════

// UI State Selectors
export const selectCurrentPanel = (state: AppState) => state.currentPanel
export const selectSidebarCollapsed = (state: AppState) => state.sidebarCollapsed
export const selectTheme = (state: AppState) => state.theme
export const selectSoundEnabled = (state: AppState) => state.soundEnabled
export const selectSoundVolume = (state: AppState) => state.soundVolume

// User State Selectors
export const selectCurrentUserId = (state: AppState) => state.currentUserId

// Voice Agent Selectors
export const selectVoiceAgentActive = (state: AppState) => state.voiceAgentActive
export const selectVoiceAgentStatus = (state: AppState) => state.voiceAgentStatus
export const selectAudioFrequencies = (state: AppState) => state.audioFrequencies

// 3D State Selectors
export const selectModelRotation = (state: AppState) => state.modelRotation
export const selectActiveScene = (state: AppState) => state.activeScene

// Financial Selectors
export const selectTotalCapital = (state: AppState) => state.totalCapital
export const selectBancos = (state: AppState) => state.bancos
export const selectDataRefreshTrigger = (state: AppState) => state.dataRefreshTrigger

// Selector compuesto con shallow equality
export const selectUIState = (state: AppState) => ({
  currentPanel: state.currentPanel,
  sidebarCollapsed: state.sidebarCollapsed,
  theme: state.theme,
})

export const selectVoiceState = (state: AppState) => ({
  active: state.voiceAgentActive,
  status: state.voiceAgentStatus,
  frequencies: state.audioFrequencies,
})

export const selectFinancialUIState = (state: AppState) => ({
  totalCapital: state.totalCapital,
  bancos: state.bancos,
})

// Selector para un banco específico
export const createBancoSelector = (bancoId: BancoId) => 
  (state: AppState) => state.bancos.find(b => b.id === bancoId)

// ═══════════════════════════════════════════════════════════════════════════════════════
// SELECTORES PARA DATA STORE
// ═══════════════════════════════════════════════════════════════════════════════════════

export const selectVentas = (state: DataState) => state.ventas
export const selectClientes = (state: DataState) => state.clientes
export const selectDistribuidores = (state: DataState) => state.distribuidores
export const selectOrdenesCompra = (state: DataState) => state.ordenesCompra
export const selectMovimientos = (state: DataState) => state.movimientos
export const selectDataBancos = (state: DataState) => state.bancos
export const selectDataLoading = (state: DataState) => state.loading
export const selectDataInitialized = (state: DataState) => state.initialized

// Contadores optimizados
export const selectVentasCount = (state: DataState) => state.ventas.length
export const selectClientesCount = (state: DataState) => state.clientes.length
export const selectDistribuidoresCount = (state: DataState) => state.distribuidores.length
export const selectOrdenesCount = (state: DataState) => state.ordenesCompra.length

// ═══════════════════════════════════════════════════════════════════════════════════════
// SELECTORES PARA FINANCE STORE
// ═══════════════════════════════════════════════════════════════════════════════════════

export const selectFinanceBancos = (state: FinanceState) => state.bancos
export const selectVentasPendientes = (state: FinanceState) => state.ventasPendientes
export const selectOrdenesActivas = (state: FinanceState) => state.ordenesActivas
export const selectTotalIngresos = (state: FinanceState) => state.totalIngresos
export const selectTotalGastos = (state: FinanceState) => state.totalGastos

// Balance neto
export const selectBalanceNeto = (state: FinanceState) => 
  state.totalIngresos - state.totalGastos

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES PARA SELECTORES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Crea un selector memoizado con comparación personalizada
 */
export function createMemoizedSelector<T, R>(
  selector: (state: T) => R,
  equalityFn: (a: R, b: R) => boolean = shallow as unknown as (a: R, b: R) => boolean
) {
  let lastResult: R | undefined
  let lastState: T | undefined

  return (state: T): R => {
    if (state === lastState) {
      return lastResult!
    }

    const newResult = selector(state)
    
    if (lastResult !== undefined && equalityFn(lastResult, newResult)) {
      return lastResult
    }

    lastState = state
    lastResult = newResult
    return newResult
  }
}

/**
 * Combina múltiples selectores en uno solo con shallow comparison
 */
export function combineSelectors<T, R extends Record<string, unknown>>(
  selectors: { [K in keyof R]: (state: T) => R[K] }
) {
  return (state: T): R => {
    const result = {} as R
    for (const key in selectors) {
      result[key] = selectors[key](state)
    }
    return result
  }
}

/**
 * Crea un hook personalizado que usa shallow comparison automáticamente
 */
export function createShallowSelector<StoreState, Selected>(
  useStore: <U>(
    selector: (state: StoreState) => U,
    equalityFn?: (a: U, b: U) => boolean
  ) => U,
  selector: (state: StoreState) => Selected
) {
  return () => useStore(selector, shallow as unknown as (a: Selected, b: Selected) => boolean)
}

/**
 * Selector con transformación y caché
 */
export function createTransformedSelector<T, R, O>(
  selector: (state: T) => R,
  transform: (data: R) => O
) {
  let cachedInput: R | undefined
  let cachedOutput: O | undefined

  return (state: T): O => {
    const input = selector(state)
    
    if (input === cachedInput && cachedOutput !== undefined) {
      return cachedOutput
    }

    cachedInput = input
    cachedOutput = transform(input)
    return cachedOutput
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SELECTORES COMPUTADOS AVANZADOS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Selector para KPIs del dashboard
 */
export const createKPIsSelector = createMemoizedSelector(
  (state: DataState & { bancos: Array<{ capitalActual: number }> }) => {
    const totalCapital = state.bancos.reduce((sum, b) => sum + (b.capitalActual || 0), 0)
    const ventasCompletas = state.ventas.filter((v: { estado?: string }) => v.estado === 'pagada').length
    const ventasPendientes = state.ventas.filter((v: { estado?: string }) => v.estado === 'activa').length
    
    return {
      totalCapital,
      totalVentas: state.ventas.length,
      ventasCompletas,
      ventasPendientes,
      totalClientes: state.clientes.length,
      totalDistribuidores: state.distribuidores.length,
      ordenesActivas: state.ordenesCompra.filter((o: { estado?: string }) => 
        o.estado !== 'completo' && o.estado !== 'cancelado'
      ).length,
    }
  }
)

/**
 * Selector para métricas de rendimiento
 */
export interface PerformanceMetrics {
  margenPromedio: number
  tasaConversion: number
  ticketPromedio: number
  frecuenciaCompra: number
}

export const createPerformanceSelector = <T extends {
  ventas: Array<{
    precioTotalVenta?: number
    precioCompraTotal?: number
    estado?: string
    montoPagado?: number
  }>
  clientes: unknown[]
}>(state: T): PerformanceMetrics => {
  const ventasCompletadas = state.ventas.filter(v => v.estado === 'pagada')
  
  const margenTotal = ventasCompletadas.reduce((sum, v) => {
    const margen = (v.precioTotalVenta || 0) - (v.precioCompraTotal || 0)
    return sum + margen
  }, 0)

  const totalVentas = ventasCompletadas.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)

  return {
    margenPromedio: ventasCompletadas.length > 0 
      ? margenTotal / ventasCompletadas.length 
      : 0,
    tasaConversion: state.clientes.length > 0 
      ? (ventasCompletadas.length / state.clientes.length) * 100 
      : 0,
    ticketPromedio: ventasCompletadas.length > 0 
      ? totalVentas / ventasCompletadas.length 
      : 0,
    frecuenciaCompra: state.clientes.length > 0 
      ? state.ventas.length / state.clientes.length 
      : 0,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORT DE UTILIDADES DE COMPARACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════

export { shallow }

/**
 * Comparación profunda para objetos anidados
 */
export function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (a === null || b === null) return false
  if (typeof a !== 'object') return false

  const keysA = Object.keys(a as object)
  const keysB = Object.keys(b as object)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false
    }
  }

  return true
}

/**
 * Comparación de arrays por referencia de elementos
 */
export function arrayShallow<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}
