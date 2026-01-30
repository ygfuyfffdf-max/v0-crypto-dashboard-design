/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📊 CHRONOS INFINITY 2026 — POSTHOG PROVIDER
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Provider de Product Analytics con PostHog:
 * - Tracking automático de pageviews
 * - Session recordings
 * - Feature flags
 * - A/B testing
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN DE POSTHOG
// ═══════════════════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // Lo manejamos manualmente para SPA
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    autocapture: {
      dom_event_allowlist: ['click', 'submit', 'change'],
      element_allowlist: ['button', 'a', 'input', 'select', 'textarea'],
    },
    // Defaults modernos
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        // En desarrollo, puedes ver eventos en consola
        console.log('📊 PostHog loaded')
      }
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PAGEVIEW TRACKER
// ═══════════════════════════════════════════════════════════════════════════════════════

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthogClient = usePostHog()

  useEffect(() => {
    if (pathname && posthogClient) {
      let url = window.origin + pathname
      if (searchParams?.toString()) {
        url = url + '?' + searchParams.toString()
      }
      posthogClient.capture('$pageview', {
        $current_url: url,
        $pathname: pathname,
      })
    }
  }, [pathname, searchParams, posthogClient])

  return null
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PROVIDER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Solo activar si hay API key configurada
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOKS Y UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════

export function useAnalytics() {
  const posthogClient = usePostHog()

  return {
    // Tracking de eventos custom
    track: (event: string, properties?: Record<string, any>) => {
      posthogClient?.capture(event, properties)
    },

    // Identificar usuario
    identify: (userId: string, properties?: Record<string, any>) => {
      posthogClient?.identify(userId, properties)
    },

    // Resetear usuario (logout)
    reset: () => {
      posthogClient?.reset()
    },

    // Feature flags
    isFeatureEnabled: (flag: string) => {
      return posthogClient?.isFeatureEnabled(flag) ?? false
    },

    // A/B test variants
    getFeatureFlag: (flag: string) => {
      return posthogClient?.getFeatureFlag(flag)
    },

    // Propiedades del grupo (para empresas/organizaciones)
    setGroup: (groupType: string, groupKey: string, properties?: Record<string, any>) => {
      posthogClient?.group(groupType, groupKey, properties)
    },
  }
}

// Export PostHog instance for server-side
export { posthog }
