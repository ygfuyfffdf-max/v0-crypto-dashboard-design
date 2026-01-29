import { getBancoById, getMovimientosBanco } from "@/app/_actions/bancos"
import { ErrorBoundaryPremium } from "@/app/_components/ErrorBoundaryPremium"
import { LoadingSpinner } from "@/app/_components/ui/LoadingSpinner"
import { BANCOS_CONFIG } from "@/app/_lib/constants/bancos"
import type { BancoId } from "@/app/types"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { BancoDetalleClient } from "./_components/BancoDetalleClient"
import { PanelProfitEspecializado } from "./_components/PanelProfitEspecializado"

interface PageProps {
  params: Promise<{ bancoId: string }>
}

const VALID_BANCO_IDS = [
  "boveda_monte",
  "boveda_usa",
  "profit",
  "leftie",
  "azteca",
  "flete_sur",
  "utilidades",
] as const

export async function generateMetadata({ params }: PageProps) {
  const { bancoId } = await params
  const config = BANCOS_CONFIG[bancoId as keyof typeof BANCOS_CONFIG]

  return {
    title: config ? `${config.nombre} | CHRONOS` : "Banco | CHRONOS",
    description: config?.descripcion || "Panel detallado del banco",
  }
}

export const dynamic = "force-dynamic"

async function BancoData({ bancoId }: { bancoId: BancoId }) {
  const [bancoResult, movimientosResult] = await Promise.all([
    getBancoById(bancoId),
    getMovimientosBanco(bancoId),
  ])

  if (!bancoResult.success || !bancoResult.data) {
    notFound()
  }

  // Panel especializado para Profit
  if (bancoId === "profit") {
    return (
      <PanelProfitEspecializado
        banco={bancoResult.data}
        movimientos={movimientosResult.success ? (movimientosResult.data ?? []) : []}
      />
    )
  }

  return (
    <BancoDetalleClient
      banco={bancoResult.data}
      movimientos={movimientosResult.success ? (movimientosResult.data ?? []) : []}
    />
  )
}

export default async function BancoDetallePage({ params }: PageProps) {
  const { bancoId } = await params

  // Validar ID
  if (!VALID_BANCO_IDS.includes(bancoId as (typeof VALID_BANCO_IDS)[number])) {
    notFound()
  }

  const config = BANCOS_CONFIG[bancoId as keyof typeof BANCOS_CONFIG]

  return (
    <ErrorBoundaryPremium>
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
              style={{ backgroundColor: `${config?.color}20` }}
            >
              🏦
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                {config?.nombre || "Banco"}
              </h1>
              <p className="text-muted-foreground">
                {config?.descripcion || "Panel de control del banco"}
              </p>
            </div>
          </div>
        </header>

        <Suspense fallback={<LoadingSpinner />}>
          <BancoData bancoId={bancoId as BancoId} />
        </Suspense>
      </div>
    </ErrorBoundaryPremium>
  )
}
