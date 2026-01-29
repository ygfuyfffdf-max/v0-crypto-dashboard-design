'use client'

import type { Banco } from '@/database/schema'
import { useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════
// HOOK: useBancos - Obtener datos de bancos con optimizaciones
// ═══════════════════════════════════════════════════════════════

const isProd = process.env.NODE_ENV === 'production'
const POLLING_INTERVAL = isProd ? 60000 : 30000 // 60s prod, 30s dev

interface UseBancosResult {
  bancos: Banco[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  isStale: boolean
}

// Cache global para evitar fetches duplicados
let globalBancosCache: { data: Banco[]; timestamp: number } | null = null
const CACHE_TTL = 30000 // 30 segundos

export function useBancos(): UseBancosResult {
  const [bancos, setBancos] = useState<Banco[]>(globalBancosCache?.data ?? [])
  const [loading, setLoading] = useState(!globalBancosCache)
  const [error, setError] = useState<Error | null>(null)
  const [isStale, setIsStale] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchBancos = useCallback(async (isBackground = false) => {
    // Check cache validity
    if (globalBancosCache && Date.now() - globalBancosCache.timestamp < CACHE_TTL) {
      setBancos(globalBancosCache.data)
      setLoading(false)
      return
    }

    // Cancel previous request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    try {
      if (!isBackground) setLoading(true)
      else setIsStale(true)

      const response = await fetch('/api/bancos', {
        signal: abortControllerRef.current.signal,
        headers: { 'Cache-Control': 'no-cache' },
      })

      if (!response.ok) throw new Error('Error fetching bancos')

      const result = await response.json()
      const dataArray = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : []

      // Update global cache
      globalBancosCache = { data: dataArray, timestamp: Date.now() }

      setBancos(dataArray)
      setError(null)
      setIsStale(false)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err : new Error('Error desconocido'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBancos()

    // Polling con visibilidad - pausar cuando tab no es visible
    let interval: ReturnType<typeof setInterval>

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchBancos(true) // Background fetch
        interval = setInterval(() => fetchBancos(true), POLLING_INTERVAL)
      } else {
        clearInterval(interval)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    interval = setInterval(() => fetchBancos(true), POLLING_INTERVAL)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      abortControllerRef.current?.abort()
    }
  }, [fetchBancos])

  return { bancos, loading, error, refetch: fetchBancos, isStale }
}

// Alias para compatibilidad con código legacy
export function useBancosData() {
  const result = useBancos()
  return {
    ...result,
    data: result.bancos,
  }
}

export function useBancoData(bancoId?: string) {
  const { bancos, loading, error, refetch } = useBancos()
  const banco = bancoId ? bancos.find((b) => b.id === bancoId) : null

  return {
    banco,
    loading,
    error,
    refetch,
  }
}
