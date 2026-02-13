"use client"

import { PanelErrorBoundary } from "@/app/_components/chronos-2026/panels/PanelErrorBoundary"
import { SupremeDashboardBackground } from "@/app/_components/chronos-2026/panels/SupremePanelBackgrounds"
import dynamic from "next/dynamic"

const AuroraConfiguracionPanelUnified = dynamic(
  () => import("@/app/_components/chronos-2026/panels/AuroraConfiguracionPanelUnified"),
  { ssr: false }
)

export default function ConfiguracionPage() {
  return (
    <PanelErrorBoundary panelName="Configuracion">
      <SupremeDashboardBackground
        showParticles={false}
        showGradient
        showVignette
        showGrid
        intensity={0.65}
      >
        <AuroraConfiguracionPanelUnified />
      </SupremeDashboardBackground>
    </PanelErrorBoundary>
  )
}
