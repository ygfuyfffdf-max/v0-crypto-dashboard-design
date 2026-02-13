"use client"

import { PanelErrorBoundary } from "@/app/_components/chronos-2026/panels/PanelErrorBoundary"
import { SupremeVentasBackground } from "@/app/_components/chronos-2026/panels/SupremePanelBackgrounds"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

const AuroraVentasPanelUnified = dynamic(
  () => import("@/app/_components/chronos-2026/panels/ventas"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
      </div>
    ),
  }
)

export default function VentasPage() {
  const router = useRouter()
  return (
    <PanelErrorBoundary panelName="Ventas">
      <SupremeVentasBackground showParticles={false} showGradient showVignette showGrid>
        <AuroraVentasPanelUnified onNavigate={(path) => router.push(path)} />
      </SupremeVentasBackground>
    </PanelErrorBoundary>
  )
}
