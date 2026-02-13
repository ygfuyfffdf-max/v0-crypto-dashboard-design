import { Suspense } from 'react'
import { LandingPageClient } from './LandingPageClient'

/**
 * 🌌 CHRONOS INFINITY 2026 — LANDING
 * Cinematográfica KOCMOC КОСМОС → Login → Dashboard
 */
export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      }
    >
      <LandingPageClient />
    </Suspense>
  )
}
