/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🚀 DASHBOARD PRINCIPAL — CHRONOS INFINITY 2026 ULTRA-OPTIMIZED
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Dashboard principal con todas las optimizaciones integradas:
 * - Datos en tiempo real via useDashboardData hook
 * - Animaciones GSAP premium
 * - Componentes 3D optimizados
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { Metadata } from 'next'
import { Suspense } from 'react'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: 'Dashboard | CHRONOS Premium 2026',
  description:
    'Sistema de Gestión Financiera ultra-premium con diseño Aurora y análisis en tiempo real',
}

// Force dynamic rendering for real-time data
export const dynamicParams = true
export const revalidate = 0

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-transparent">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
            <p className="text-lg font-medium text-violet-400">Inicializando...</p>
          </div>
        </div>
      }
    >
      <DashboardClient />
    </Suspense>
  )
}
