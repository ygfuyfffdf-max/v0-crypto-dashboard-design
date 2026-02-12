"use client"

import { useState } from "react"
import { AuroraButton } from "@/app/_components/ui/AuroraGlassSystem"
import { X } from "lucide-react"
import { useVentas } from "../../VentasContext"
import { AnimatePresence, motion } from "motion/react"

interface CreateVentaModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateVentaModal({ isOpen, onClose }: CreateVentaModalProps) {
  const { handleCreateVenta } = useVentas()
  const [formData, setFormData] = useState({
    cliente: "",
    producto: "",
    cantidad: 1,
    precioUnitario: 0,
    estado: "pendiente" as const,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleCreateVenta({
      ...formData,
      precioTotal: formData.cantidad * formData.precioUnitario,
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toLocaleTimeString(),
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Nueva Venta</h2>
              <button onClick={onClose} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Cliente</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Producto</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  value={formData.producto}
                  onChange={(e) => setFormData({ ...formData, producto: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Precio Unitario</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                    value={formData.precioUnitario}
                    onChange={(e) => setFormData({ ...formData, precioUnitario: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <AuroraButton type="button" variant="ghost" onClick={onClose}>
                  Cancelar
                </AuroraButton>
                <AuroraButton type="submit" variant="primary">
                  Registrar Venta
                </AuroraButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
