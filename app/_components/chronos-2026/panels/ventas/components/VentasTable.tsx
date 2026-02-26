"use client"

import { AuroraBadge, AuroraButton } from "@/app/_components/ui/AuroraGlassSystem"
import { Edit3, Eye, Trash2 } from "lucide-react"
import { useVentas } from "../VentasContext"

export function VentasTable() {
  const { filteredVentas, handleDeleteVenta } = useVentas()

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-black/20 backdrop-blur-md">
      <table className="w-full text-left text-sm text-white/70">
        <thead className="border-b border-white/10 bg-white/5 uppercase text-xs tracking-wider font-medium text-white/50">
          <tr>
            <th className="px-6 py-4">Fecha</th>
            <th className="px-6 py-4">Cliente</th>
            <th className="px-6 py-4">Producto</th>
            <th className="px-6 py-4 text-right">Monto</th>
            <th className="px-6 py-4 text-center">Estado</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {filteredVentas.map((venta) => (
            <tr key={venta.id} className="hover:bg-white/5 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-white">{venta.fecha}</div>
                <div className="text-xs text-white/40">{venta.hora}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-white">{venta.cliente}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{venta.producto}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-emerald-400">
                ${venta.precioTotal.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <AuroraBadge
                  variant="solid"
                  color={
                    venta.estado === "pagada"
                      ? "emerald"
                      : venta.estado === "pendiente"
                      ? "gold"
                      : venta.estado === "cancelada"
                      ? "magenta"
                      : "violet"
                  }
                >
                  {venta.estado}
                </AuroraBadge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AuroraButton variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="w-4 h-4 text-blue-400" />
                  </AuroraButton>
                  <AuroraButton variant="ghost" size="icon" className="h-8 w-8">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                  </AuroraButton>
                  <AuroraButton
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteVenta(venta.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </AuroraButton>
                </div>
              </td>
            </tr>
          ))}
          {filteredVentas.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-white/30">
                No se encontraron ventas con los filtros actuales
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
