"use client"

import { PanelErrorBoundary } from "@/app/_components/chronos-2026/panels/PanelErrorBoundary"
import { SupremeGastosBackground } from "@/app/_components/chronos-2026/panels/SupremePanelBackgrounds"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

const AuroraGastosYAbonosPanelUnified = dynamic(
  () => import("@/app/_components/chronos-2026/panels/AuroraGastosYAbonosPanelUnified"),
  { ssr: false }
)

export default function GastosAbonosPage() {
  const router = useRouter()
  return (
    <PanelErrorBoundary panelName="Gastos y Abonos">
      <SupremeGastosBackground showParticles={false} showGradient showVignette showGrid>
        <AuroraGastosYAbonosPanelUnified onNavigate={(path) => router.push(path)} />
      </SupremeGastosBackground>
    </PanelErrorBoundary>
  )
}
