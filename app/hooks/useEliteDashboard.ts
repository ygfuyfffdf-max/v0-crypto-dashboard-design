/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — ELITE DASHBOARD HOOKS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import {
  getDashboardAlertas,
  getDashboardBancos,
  getDashboardClientes,
  getDashboardDistribuidores,
  getDashboardKPIs,
  getDashboardOrdenes,
  type DashboardAlerta,
  type DashboardBanco,
  type DashboardCliente,
  type DashboardDistribuidor,
  type DashboardKPIs,
  type DashboardOC,
} from '@/app/_actions/analytics-actions'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface DashboardState {
  kpis: DashboardKPIs | null
  ordenes: DashboardOC[]
  clientes: DashboardCliente[]
  distribuidores: DashboardDistribuidor[]
  bancos: DashboardBanco[]
  alertas: DashboardAlerta[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

interface UseDashboardOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  onError?: (error: Error) => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useEliteDashboard
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useEliteDashboard(options: UseDashboardOptions = {}) {
  const { autoRefresh = false, refreshInterval = 60000, onError } = options

  const [state, setState] = useState<DashboardState>({
    kpis: null,
    ordenes: [],
    clientes: [],
    distribuidores: [],
    bancos: [],
    alertas: [],
    loading: true,
    error: null,
    lastUpdated: null,
  })

  const [isPending, startTransition] = useTransition()

  const fetchAllData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const [
        kpisResult,
        ordenesResult,
        clientesResult,
        distribuidoresResult,
        bancosResult,
        alertasResult,
      ] = await Promise.all([
        getDashboardKPIs(),
        getDashboardOrdenes(),
        getDashboardClientes(),
        getDashboardDistribuidores(),
        getDashboardBancos(),
        getDashboardAlertas(),
      ])

      setState({
        kpis: kpisResult.success ? kpisResult.data : null,
        ordenes: ordenesResult.success ? ordenesResult.data : [],
        clientes: clientesResult.success ? clientesResult.data : [],
        distribuidores: distribuidoresResult.success ? distribuidoresResult.data : [],
        bancos: bancosResult.success ? bancosResult.data : [],
        alertas: alertasResult.success ? alertasResult.data : [],
        loading: false,
        error: null,
        lastUpdated: new Date(),
      })
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido')
      setState((prev) => ({ ...prev, loading: false, error: err.message }))
      onError?.(err)
    }
  }, [onError])

  const refresh = useCallback(() => {
    startTransition(() => {
      fetchAllData()
    })
  }, [fetchAllData])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(refresh, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refresh])

  const computed = useMemo(
    () => ({
      totalOrdenes: state.ordenes.length,
      totalClientes: state.clientes.length,
      alertasCriticas: state.alertas.filter((a) => a.tipo === 'critica').length,
      topOrdenesPorGanancia: [...state.ordenes]
        .sort((a, b) => b.gananciaRealizada - a.gananciaRealizada)
        .slice(0, 5),
      topClientesPorScore: [...state.clientes]
        .sort((a, b) => b.scoreTotal - a.scoreTotal)
        .slice(0, 5),
      clientesMorosos: state.clientes.filter((c) => c.categoria === 'moroso').length,
      ordenesAgotadas: state.ordenes.filter((o) => o.estadoStock === 'agotado').length,
    }),
    [state],
  )

  return { ...state, computed, refresh, isRefreshing: isPending }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useKPIs
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useKPIs() {
  const [kpis, setKPIs] = useState<DashboardKPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const result = await getDashboardKPIs()
        if (result.success) setKPIs(result.data)
        else setError(result.error || 'Error al cargar KPIs')
      } catch {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { kpis, loading, error }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useOrdenes
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useOrdenes(filtros?: { estado?: string; distribuidor?: string }) {
  const [ordenes, setOrdenes] = useState<DashboardOC[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const result = await getDashboardOrdenes()
        if (result.success) {
          let data = result.data
          if (filtros?.estado) data = data.filter((o) => o.estadoStock === filtros.estado)
          if (filtros?.distribuidor) {
            data = data.filter((o) => o.distribuidorNombre === filtros.distribuidor)
          }
          setOrdenes(data)
        } else setError(result.error || 'Error al cargar órdenes')
      } catch {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [filtros?.estado, filtros?.distribuidor])

  return { ordenes, loading, error }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useClientes
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useClientes(filtros?: { categoria?: string }) {
  const [clientes, setClientes] = useState<DashboardCliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const result = await getDashboardClientes()
        if (result.success) {
          let data = result.data
          if (filtros?.categoria) data = data.filter((c) => c.categoria === filtros.categoria)
          setClientes(data)
        } else setError(result.error || 'Error al cargar clientes')
      } catch {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [filtros?.categoria])

  return { clientes, loading, error }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useAlertas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useAlertas() {
  const [alertas, setAlertas] = useState<DashboardAlerta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const alertasCriticas = useMemo(() => alertas.filter((a) => a.tipo === 'critica'), [alertas])
  const alertasAdvertencia = useMemo(
    () => alertas.filter((a) => a.tipo === 'advertencia'),
    [alertas],
  )

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const result = await getDashboardAlertas()
        if (result.success) setAlertas(result.data)
        else setError(result.error || 'Error al cargar alertas')
      } catch {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return {
    alertas,
    alertasCriticas,
    alertasAdvertencia,
    loading,
    error,
    totalCriticas: alertasCriticas.length,
    totalAdvertencias: alertasAdvertencia.length,
  }
}

// Re-export types
export type {
  DashboardAlerta,
  DashboardBanco,
  DashboardCliente,
  DashboardDistribuidor,
  DashboardKPIs,
  DashboardOC,
  DashboardState,
  UseDashboardOptions,
}
