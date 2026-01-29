'use client'

import { useCallback, useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  CURRENCY_CONFIG,
  type Currency,
  type DisplayMode,
  formatUSD,
  formatMXN,
  formatDualCurrency,
  formatByCurrency,
  formatCompactCurrency,
  usdToMxn,
  mxnToUsd,
  isValidExchangeRate,
} from '@/app/lib/config/currency.config'

// ============================================
// CURRENCY STORE
// ============================================

interface CurrencyState {
  displayCurrency: Currency
  exchangeRate: number
  showDualCurrency: boolean
  setDisplayCurrency: (currency: Currency) => void
  setExchangeRate: (rate: number) => void
  setShowDualCurrency: (show: boolean) => void
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      displayCurrency: 'USD',
      exchangeRate: CURRENCY_CONFIG.defaultExchangeRate,
      showDualCurrency: false,

      setDisplayCurrency: (currency) => set({ displayCurrency: currency }),
      setExchangeRate: (rate) => {
        if (isValidExchangeRate(rate)) {
          set({ exchangeRate: rate })
        }
      },
      setShowDualCurrency: (show) => set({ showDualCurrency: show }),
    }),
    {
      name: 'chronos-currency',
    }
  )
)

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useCurrency() {
  const { displayCurrency, exchangeRate, showDualCurrency, setDisplayCurrency, setExchangeRate, setShowDualCurrency } = useCurrencyStore()

  const format = useCallback((amountUSD: number): string => {
    if (showDualCurrency) {
      return formatDualCurrency(amountUSD, exchangeRate)
    }
    return formatByCurrency(amountUSD, displayCurrency, exchangeRate)
  }, [displayCurrency, exchangeRate, showDualCurrency])

  const formatCompact = useCallback((amountUSD: number): string => {
    return formatCompactCurrency(amountUSD, displayCurrency, exchangeRate)
  }, [displayCurrency, exchangeRate])

  const formatDual = useCallback((amountUSD: number): string => {
    return formatDualCurrency(amountUSD, exchangeRate)
  }, [exchangeRate])

  const toMXN = useCallback((amountUSD: number): number => {
    return usdToMxn(amountUSD, exchangeRate)
  }, [exchangeRate])

  const toUSD = useCallback((amountMXN: number): number => {
    return mxnToUsd(amountMXN, exchangeRate)
  }, [exchangeRate])

  return useMemo(() => ({
    // Estado
    displayCurrency,
    exchangeRate,
    showDualCurrency,

    // Setters
    setDisplayCurrency,
    setExchangeRate,
    setShowDualCurrency,

    // Formatters
    format,
    formatCompact,
    formatDual,
    formatUSD,
    formatMXN,

    // Conversores
    toMXN,
    toUSD,
  }), [
    displayCurrency,
    exchangeRate,
    showDualCurrency,
    setDisplayCurrency,
    setExchangeRate,
    setShowDualCurrency,
    format,
    formatCompact,
    formatDual,
    toMXN,
    toUSD,
  ])
}
