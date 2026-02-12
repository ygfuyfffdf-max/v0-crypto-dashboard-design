"use client"

import React, { useState } from "react"
import { VentasProvider } from "./VentasContext"
import { VentasHeader } from "./components/VentasHeader"
import { VentasStats } from "./components/VentasStats"
import { VentasTable } from "./components/VentasTable"
import { CreateVentaModal } from "./components/modals/CreateVentaModal"
import { AuroraBackground } from "@/app/_components/ui/AuroraGlassSystem"
import { Venta } from "./types"

interface AuroraVentasPanelUnifiedProps {
  ventas?: Venta[]
}

/**
 * Componente Refactorizado Modularmente
 * Reemplaza al antiguo monolito "AuroraVentasPanelUnified"
 */
export default function AuroraVentasPanelUnified({ ventas }: AuroraVentasPanelUnifiedProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  return (
    <VentasProvider initialData={ventas}>
      <div className="relative min-h-screen w-full overflow-hidden bg-black text-white p-6 md:p-8">
        <AuroraBackground className="opacity-30" />

        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          <VentasHeader onNewVenta={() => setIsCreateModalOpen(true)} />
          <VentasStats />
          <VentasTable />
        </div>

        <CreateVentaModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </VentasProvider>
  )
}
