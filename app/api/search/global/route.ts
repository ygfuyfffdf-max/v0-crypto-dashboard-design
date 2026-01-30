/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔍 CHRONOS INFINITY 2026 — GLOBAL SEARCH API
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Endpoint de búsqueda global:
 * - Multi-type search
 * - Rate limiting
 * - Analytics tracking
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from 'next/server'
import { adaptiveAuth, adaptiveSearch, posthogAnalytics, sentryMonitoring } from '@/app/lib/services'
import { getRateLimiter } from '@/app/lib/services/adaptive-redis'

// Use nodejs runtime since services use Node.js modules
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user (works with or without Clerk)
    const session = await adaptiveAuth.getSession()
    const userId = session?.userId ?? 'anonymous'

    // Rate limiting
    const rateLimiter = await getRateLimiter('search')
    const rateResult = await rateLimiter.limit(userId)

    if (!rateResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateResult.limit.toString(),
            'X-RateLimit-Remaining': rateResult.remaining.toString(),
            'X-RateLimit-Reset': rateResult.reset.toString(),
          },
        },
      )
    }

    // Get search query
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const hitsPerPage = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    // Perform search using adaptive search service
    const results = await adaptiveSearch.search(query, {
      limit: hitsPerPage,
    })

    // Track analytics (non-blocking)
    try {
      posthogAnalytics.trackChronosEvent(userId, 'ai_query_made', {
        query,
        results_count: results.totalHits,
        search_type: 'global',
        mode: results.mode,
      })
    } catch {
      // Ignore analytics errors
    }

    return NextResponse.json({
      query,
      totalHits: results.totalHits,
      mode: results.mode,
      results: results.hits,
    })
  } catch (error) {
    console.error('Search error:', error)
    try {
      sentryMonitoring.captureChronosError(error, 'api_error', {
        extra: { endpoint: 'search' },
      })
    } catch {
      // Ignore monitoring errors
    }
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
