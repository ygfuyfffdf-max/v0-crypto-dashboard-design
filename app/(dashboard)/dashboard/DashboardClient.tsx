/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * DASHBOARD CLIENT WRAPPER — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Renders the unified dashboard panel with navigation integration.
 * Background is transparent — AppShell provides the glass dark environment.
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

"use client"

import { AuroraDashboardUnified } from "@/app/_components/chronos-2026/panels/AuroraDashboardUnified"
import { PanelErrorBoundary } from "@/app/_components/chronos-2026/panels/PanelErrorBoundary"
import { SupremeDashboardBackground } from "@/app/_components/chronos-2026/panels/SupremePanelBackgrounds"
import { useRouter } from "next/navigation"

export default function DashboardClient() {
  const router = useRouter()

  return (
    <PanelErrorBoundary panelName="Dashboard">
      <SupremeDashboardBackground showParticles={false} showGradient showVignette showGrid>
        <AuroraDashboardUnified onNavigate={(path) => router.push(path)} />
      </SupremeDashboardBackground>
    </PanelErrorBoundary>
  )
}
