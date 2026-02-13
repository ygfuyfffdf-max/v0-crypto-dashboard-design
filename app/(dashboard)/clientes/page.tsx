"use client"

import { PanelErrorBoundary } from "@/app/_components/chronos-2026/panels/PanelErrorBoundary"
import { SupremeClientesBackground } from "@/app/_components/chronos-2026/panels/SupremePanelBackgrounds"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

const AuroraClientesPanelUnified = dynamic(
  () => import("@/app/_components/chronos-2026/panels/AuroraClientesPanelUnified"),
  { ssr: false }
)

export default function ClientesPage() {
  const router = useRouter()
  return (
    <PanelErrorBoundary panelName="Clientes">
      <SupremeClientesBackground showParticles={false} showGradient showVignette showGrid>
        <AuroraClientesPanelUnified onNavigate={(path) => router.push(path)} />
      </SupremeClientesBackground>
    </PanelErrorBoundary>
  )
}
