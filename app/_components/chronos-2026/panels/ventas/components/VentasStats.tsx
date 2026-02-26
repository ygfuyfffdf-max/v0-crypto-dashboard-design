"use client"

import { AuroraStatWidget } from "@/app/_components/ui/AuroraGlassSystem"
import { CreditCard, DollarSign, ShoppingCart, Target } from "lucide-react"
import { useMemo } from "react"
import { useVentas } from "../VentasContext"

export function VentasStats() {
  const { filteredVentas } = useVentas()

  const stats = useMemo(() => {
    const totalVentas = filteredVentas.reduce((acc, v) => acc + v.precioTotal, 0)
    const countVentas = filteredVentas.length
    const ticketPromedio = countVentas > 0 ? totalVentas / countVentas : 0
    const pagadas = filteredVentas.filter((v) => v.estado === "pagada").length

    return {
      totalVentas,
      countVentas,
      ticketPromedio,
      pagadas,
    }
  }, [filteredVentas])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AuroraStatWidget
        label="Ventas Totales"
        value={`$${stats.totalVentas.toLocaleString()}`}
        trend="up"
        change={12.5}
        icon={<DollarSign className="w-5 h-5" />}
        color="emerald"
      />
      <AuroraStatWidget
        label="Transacciones"
        value={stats.countVentas.toString()}
        trend="up"
        change={5}
        icon={<ShoppingCart className="w-5 h-5" />}
        color="cyan"
      />
      <AuroraStatWidget
        label="Ticket Promedio"
        value={`$${stats.ticketPromedio.toLocaleString()}`}
        trend="down"
        change={-2.1}
        icon={<Target className="w-5 h-5" />}
        color="violet"
      />
      <AuroraStatWidget
        label="Ventas Pagadas"
        value={stats.pagadas.toString()}
        trend="up"
        change={95}
        icon={<CreditCard className="w-5 h-5" />}
        color="gold"
      />
    </div>
  )
}
