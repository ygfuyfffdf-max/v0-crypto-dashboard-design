"use client"

import { PanelErrorBoundary } from "@/app/_components/chronos-2026/panels/PanelErrorBoundary"
import { SupremeDistribuidoresBackground } from "@/app/_components/chronos-2026/panels/SupremePanelBackgrounds"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

const AuroraDistribuidoresPanelUnified = dynamic(
  () => import("@/app/_components/chronos-2026/panels/AuroraDistribuidoresPanelUnified"),
  { ssr: false }
)

export default function DistribuidoresPage() {
  const router = useRouter()
  return (
    <PanelErrorBoundary panelName="Distribuidores">
      <SupremeDistribuidoresBackground showParticles={false} showGradient showVignette showGrid>
        <AuroraDistribuidoresPanelUnified onNavigate={(path) => router.push(path)} />
      </SupremeDistribuidoresBackground>
    </PanelErrorBoundary>
  )
}
