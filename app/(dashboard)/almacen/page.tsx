"use client"

import { PanelErrorBoundary } from "@/app/_components/chronos-2026/panels/PanelErrorBoundary"
import { SupremeAlmacenBackground } from "@/app/_components/chronos-2026/panels/SupremePanelBackgrounds"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

const AuroraAlmacenPanelUnified = dynamic(
  () => import("@/app/_components/chronos-2026/panels/AuroraAlmacenPanelUnified"),
  { ssr: false }
)

export default function AlmacenPage() {
  const router = useRouter()
  return (
    <PanelErrorBoundary panelName="Almacen">
      <SupremeAlmacenBackground showParticles={false} showGradient showVignette showGrid>
        <AuroraAlmacenPanelUnified onNavigate={(path) => router.push(path)} />
      </SupremeAlmacenBackground>
    </PanelErrorBoundary>
  )
}
