/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💱 EXCHANGE RATE API — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from 'next/server'

// In-memory cache for rate with persistence simulation
let cachedRate: {
  rate: number
  previousRate: number
  updatedAt: Date
} | null = null

// Default rate
const DEFAULT_RATE = 17.5

async function fetchExternalRate(): Promise<number> {
  try {
    // Try to fetch from ExchangeRate API
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD',
      { next: { revalidate: 3600 } }
    )
    if (response.ok) {
      const data = await response.json()
      return data.rates?.MXN || DEFAULT_RATE
    }
  } catch (error) {
    console.error('Error fetching external rate:', error)
  }

  // Fallback to cached or default rate
  return cachedRate?.rate || DEFAULT_RATE
}

export async function GET() {
  try {
    const now = new Date()

    // Check if cache is still valid (5 minutes)
    if (cachedRate && now.getTime() - cachedRate.updatedAt.getTime() < 300000) {
      const change = cachedRate.rate - cachedRate.previousRate
      const changePercent = cachedRate.previousRate > 0
        ? (change / cachedRate.previousRate) * 100
        : 0

      return NextResponse.json({
        rate: cachedRate.rate,
        previousRate: cachedRate.previousRate,
        change,
        changePercent,
        updatedAt: cachedRate.updatedAt,
        source: 'cache',
      })
    }

    // Fetch new rate
    const newRate = await fetchExternalRate()
    const previousRate = cachedRate?.rate || newRate

    // Update cache
    cachedRate = {
      rate: newRate,
      previousRate,
      updatedAt: now,
    }

    const change = newRate - previousRate
    const changePercent = previousRate > 0 ? (change / previousRate) * 100 : 0

    return NextResponse.json({
      rate: newRate,
      previousRate,
      change,
      changePercent,
      updatedAt: now,
      source: 'live',
    })
  } catch (error) {
    console.error('Exchange rate error:', error)

    // Return fallback
    return NextResponse.json({
      rate: DEFAULT_RATE,
      previousRate: DEFAULT_RATE,
      change: 0,
      changePercent: 0,
      updatedAt: new Date(),
      source: 'fallback',
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { rate } = await request.json()

    if (typeof rate !== 'number' || rate <= 0) {
      return NextResponse.json(
        { error: 'Invalid rate' },
        { status: 400 }
      )
    }

    const now = new Date()
    const previousRate = cachedRate?.rate || rate

    // Update cache
    cachedRate = {
      rate,
      previousRate,
      updatedAt: now,
    }

    return NextResponse.json({
      success: true,
      rate,
      previousRate,
      updatedAt: now,
    })
  } catch (error) {
    console.error('Exchange rate update error:', error)
    return NextResponse.json(
      { error: 'Error updating rate' },
      { status: 500 }
    )
  }
}
