"use client"

import { AuroraButton, AuroraSearch } from "@/app/_components/ui/AuroraGlassSystem"
import { useVentas } from "../VentasContext"
import { Download, Filter, Plus, RefreshCw } from "lucide-react"

interface VentasHeaderProps {
  onNewVenta: () => void
}

export function VentasHeader({ onNewVenta }: VentasHeaderProps) {
  const { filtros, setFiltros, refreshData, isLoading } = useVentas()

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
          Panel de Ventas
        </h1>
        <p className="text-white/50 text-sm">Gestiona transacciones y flujo de caja</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <AuroraSearch
          placeholder="Buscar cliente o producto..."
          value={filtros.busqueda}
          onChange={(val) => setFiltros({ busqueda: val })}
          className="w-64"
        />

        <AuroraButton variant="glass" size="icon" onClick={refreshData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </AuroraButton>

        <AuroraButton variant="glass" icon={<Filter className="w-4 h-4" />}>
          Filtros
        </AuroraButton>

        <AuroraButton variant="glass" icon={<Download className="w-4 h-4" />}>
          Exportar
        </AuroraButton>

        <AuroraButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={onNewVenta}>
          Nueva Venta
        </AuroraButton>
      </div>
    </div>
  )
}
