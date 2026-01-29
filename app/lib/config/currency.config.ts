/**
 * Currency Configuration - Sistema de Tipo de Cambio USD/MXN
 * REGLA: Todos los valores se almacenan en USD, conversión a MXN solo para visualización
 */

// ============================================
// CONFIGURACIÓN DE MONEDA
// ============================================

export const CURRENCY_CONFIG = {
  // Moneda base (todos los valores se guardan en esta moneda)
  baseCurrency: 'USD' as const,

  // Tipo de cambio predeterminado USD -> MXN
  defaultExchangeRate: 17.50,

  // Rango válido para tipo de cambio
  minExchangeRate: 10,
  maxExchangeRate: 30,

  // Decimales por moneda
  decimals: {
    USD: 2,
    MXN: 2,
  },

  // Símbolos
  symbols: {
    USD: '$',
    MXN: '$',
  },

  // Locales para formateo
  locales: {
    USD: 'en-US',
    MXN: 'es-MX',
  },
} as const

export type Currency = 'USD' | 'MXN'
export type DisplayMode = 'USD' | 'MXN' | 'dual'

// ============================================
// FUNCIONES DE CONVERSIÓN
// ============================================

/**
 * Convertir USD a MXN
 */
export function usdToMxn(usd: number, exchangeRate: number = CURRENCY_CONFIG.defaultExchangeRate): number {
  return usd * exchangeRate
}

/**
 * Convertir MXN a USD
 */
export function mxnToUsd(mxn: number, exchangeRate: number = CURRENCY_CONFIG.defaultExchangeRate): number {
  return mxn / exchangeRate
}

/**
 * Formatear valor en USD
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formatear valor en MXN
 */
export function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formatear con conversión dual (USD + MXN)
 */
export function formatDualCurrency(
  amountUSD: number,
  exchangeRate: number = CURRENCY_CONFIG.defaultExchangeRate
): string {
  const amountMXN = usdToMxn(amountUSD, exchangeRate)
  return `${formatUSD(amountUSD)} (${formatMXN(amountMXN)})`
}

/**
 * Formatear según preferencia del usuario
 */
export function formatByCurrency(
  amountUSD: number,
  displayCurrency: Currency,
  exchangeRate: number = CURRENCY_CONFIG.defaultExchangeRate
): string {
  if (displayCurrency === 'MXN') {
    return formatMXN(usdToMxn(amountUSD, exchangeRate))
  }
  return formatUSD(amountUSD)
}

/**
 * Formatear compacto (1K, 1M)
 */
export function formatCompactCurrency(
  amountUSD: number,
  displayCurrency: Currency = 'USD',
  exchangeRate: number = CURRENCY_CONFIG.defaultExchangeRate
): string {
  const amount = displayCurrency === 'MXN' ? usdToMxn(amountUSD, exchangeRate) : amountUSD
  const symbol = displayCurrency === 'MXN' ? 'MXN' : 'USD'

  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M ${symbol}`
  }
  if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K ${symbol}`
  }
  return displayCurrency === 'MXN' ? formatMXN(amount) : formatUSD(amount)
}

// ============================================
// VALIDACIÓN
// ============================================

export function isValidExchangeRate(rate: number): boolean {
  return rate >= CURRENCY_CONFIG.minExchangeRate && rate <= CURRENCY_CONFIG.maxExchangeRate
}
