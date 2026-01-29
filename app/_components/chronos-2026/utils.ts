/**
 * 🔧 CHRONOS 2026 UTILITIES
 * ═══════════════════════════════════════════════════════════════════════════
 * Utilidades compartidas para componentes CHRONOS 2026
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ═══════════════════════════════════════════════════════════════════════════
// CLASS UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMATTING UTILITIES — SSR-SAFE (No hydration mismatch)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SSR-Safe number formatting - SIEMPRE usa comas como separador de miles
 * Evita hydration mismatch entre servidor y cliente
 */
export function formatNumber(value: number, decimals: number = 0): string {
  const fixed = value.toFixed(decimals)
  const parts = fixed.split('.')
  const integer = parts[0] ?? '0'
  const decimal = parts[1]
  const withCommas = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decimal ? `${withCommas}.${decimal}` : withCommas
}

/**
 * Format currency value - SSR-Safe
 */
export function formatCurrency(
  value: number,
  options?: {
    decimals?: number
    compact?: boolean
    currency?: string
  },
): string {
  const { decimals = 0, compact = true, currency = '$' } = options || {}

  if (compact) {
    if (value >= 1000000) {
      return `${currency}${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${currency}${(value / 1000).toFixed(decimals)}K`
    }
  }

  return `${currency}${formatNumber(value, decimals)}`
}

/**
 * Format currency full (no compact) - SSR-Safe
 */
export function formatCurrencyFull(value: number, decimals: number = 0): string {
  return `$${formatNumber(value, decimals)}`
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(
    'es-MX',
    options || {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  )
}

/**
 * Format relative time (e.g., "hace 2 horas")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'ahora'
  if (diffMins < 60) return `hace ${diffMins}m`
  if (diffHours < 24) return `hace ${diffHours}h`
  if (diffDays < 7) return `hace ${diffDays}d`

  return formatDate(d)
}

// ═══════════════════════════════════════════════════════════════════════════
// MATH UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin)
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCTION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COLOR UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a color with opacity
 */
export function withOpacity(color: string, opacity: number): string {
  // If already hex with alpha, strip it
  const baseColor = color.slice(0, 7)
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')
  return `${baseColor}${alpha}`
}

/**
 * Get contrasting text color (black or white)
 */
export function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

// ═══════════════════════════════════════════════════════════════════════════
// ARRAY UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate array of numbers in range
 */
export function range(start: number, end: number, step = 1): number[] {
  const result: number[] = []
  for (let i = start; i <= end; i += step) {
    result.push(i)
  }
  return result
}

/**
 * Shuffle array
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // Swap elements - array access is safe within loop bounds
    const temp = result[i] as T
    result[i] = result[j] as T
    result[j] = temp
  }
  return result
}

/**
 * Group array by key
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = keyFn(item)
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    },
    {} as Record<K, T[]>,
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// RANDOM UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate random number in range
 */
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Generate random integer in range
 */
export function randomIntInRange(min: number, max: number): number {
  return Math.floor(randomInRange(min, max + 1))
}

/**
 * Pick random item from array
 */
export function randomPick<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length)
  return array[index] as T
}
