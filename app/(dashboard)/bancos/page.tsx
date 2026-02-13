"use client"

import { PanelErrorBoundary } from "@/app/_components/chronos-2026/panels/PanelErrorBoundary"
import { SupremeBancosBackground } from "@/app/_components/chronos-2026/panels/SupremePanelBackgrounds"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

const AuroraBancosPanelUnified = dynamic(
  () => import("@/app/_components/chronos-2026/panels/AuroraBancosPanelUnified"),
  { ssr: false }
)

export default function BancosPage() {
  const router = useRouter()
  return (
    <PanelErrorBoundary panelName="Bancos">
      <SupremeBancosBackground showParticles={false} showGradient showVignette showGrid>
        <AuroraBancosPanelUnified onNavigate={(path) => router.push(path)} />
      </SupremeBancosBackground>
    </PanelErrorBoundary>
  )
}
