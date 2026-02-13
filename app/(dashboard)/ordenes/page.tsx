"use client"

import { PanelErrorBoundary } from "@/app/_components/chronos-2026/panels/PanelErrorBoundary"
import { SupremeComprasBackground } from "@/app/_components/chronos-2026/panels/SupremePanelBackgrounds"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

const AuroraComprasPanelUnified = dynamic(
  () => import("@/app/_components/chronos-2026/panels/AuroraComprasPanelUnified"),
  { ssr: false }
)

export default function OrdenesPage() {
  const router = useRouter()
  return (
    <PanelErrorBoundary panelName="Ordenes">
      <SupremeComprasBackground showParticles={false} showGradient showVignette showGrid>
        <AuroraComprasPanelUnified onNavigate={(path) => router.push(path)} />
      </SupremeComprasBackground>
    </PanelErrorBoundary>
  )
}
