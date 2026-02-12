"use client"

import { AuroraStatWidget } from "@/app/_components/ui/AuroraGlassSystem"
import { useVentas } from "../VentasContext"
import { DollarSign, ShoppingCart, Target, CreditCard } from "lucide-react"
import { useMemo } from "react"

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
        title="Ventas Totales"
        value={`$${stats.totalVentas.toLocaleString()}`}
        trend="+12.5%"
        trendUp={true}
        icon={DollarSign}
        color="emerald"
      />
      <AuroraStatWidget
        title="Transacciones"
        value={stats.countVentas.toString()}
        trend="+5"
        trendUp={true}
        icon={ShoppingCart}
        color="blue"
      />
      <AuroraStatWidget
        title="Ticket Promedio"
        value={`$${stats.ticketPromedio.toLocaleString()}`}
        trend="-2.1%"
        trendUp={false}
        icon={Target}
        color="purple"
      />
      <AuroraStatWidget
        title="Ventas Pagadas"
        value={stats.pagadas.toString()}
        trend="95%"
        trendUp={true}
        icon={CreditCard}
        color="amber"
      />
    </div>
  )
}
