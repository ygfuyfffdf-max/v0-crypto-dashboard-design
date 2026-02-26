"use client"

import { PanelErrorBoundary } from "@/app/_components/chronos-2026/panels/PanelErrorBoundary"
import { SupremeBancosBackground } from "@/app/_components/chronos-2026/panels/SupremePanelBackgrounds"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

const AuroraBancosPanelUnified = dynamic(
  () => import("@/app/_components/chronos-2026/panels/AuroraBancosPanelUnified"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
      </div>
    ),
  }
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
