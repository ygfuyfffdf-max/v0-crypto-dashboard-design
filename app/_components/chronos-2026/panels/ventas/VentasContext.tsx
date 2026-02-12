"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { FiltrosState, Venta, VentasContextType } from "./types"
import { useVentasData } from "@/app/hooks/useDataHooks"
import { useToastAdvanced } from "@/app/_components/ui/ios"

const VentasContext = createContext<VentasContextType | undefined>(undefined)

export function useVentas() {
  const context = useContext(VentasContext)
  if (!context) {
    throw new Error("useVentas must be used within a VentasProvider")
  }
  return context
}

interface VentasProviderProps {
  initialData?: Venta[]
  children: React.ReactNode
}

export function VentasProvider({ initialData = [], children }: VentasProviderProps) {
  const { ventas: dataFromHook, loading, refresh } = useVentasData()
  const [localVentas, setLocalVentas] = useState<Venta[]>(initialData)
  const [filtros, setFiltrosState] = useState<FiltrosState>({
    estado: "all",
    busqueda: "",
    fechaInicio: "",
    fechaFin: "",
  })
  const { toast } = useToastAdvanced()

  // Sync with hook data when available
  useEffect(() => {
    if (dataFromHook && dataFromHook.length > 0) {
      setLocalVentas(dataFromHook)
    }
  }, [dataFromHook])

  const setFiltros = (newFiltros: Partial<FiltrosState>) => {
    setFiltrosState((prev) => ({ ...prev, ...newFiltros }))
  }

  const filteredVentas = useMemo(() => {
    return localVentas.filter((venta) => {
      // Filter by Search
      if (
        filtros.busqueda &&
        !venta.cliente.toLowerCase().includes(filtros.busqueda.toLowerCase()) &&
        !venta.producto.toLowerCase().includes(filtros.busqueda.toLowerCase())
      ) {
        return false
      }

      // Filter by Status
      if (filtros.estado !== "all" && venta.estado !== filtros.estado) {
        return false
      }

      // Filter by Date Range (Simplified)
      if (filtros.fechaInicio && venta.fecha < filtros.fechaInicio) return false
      if (filtros.fechaFin && venta.fecha > filtros.fechaFin) return false

      return true
    })
  }, [localVentas, filtros])

  const handleCreateVenta = async (venta: Partial<Venta>) => {
    // Here we would call the Server Action
    // await createVentaAction(venta)
    toast({ title: "Venta creada", message: "La venta se ha registrado correctamente", type: "success" })
    refresh()
  }

  const handleUpdateVenta = async (venta: Venta) => {
    // Here we would call the Server Action
    // await updateVentaAction(venta)
    toast({ title: "Venta actualizada", message: "Los cambios se han guardado", type: "success" })
    refresh()
  }

  const handleDeleteVenta = async (id: string) => {
    // Here we would call the Server Action
    // await deleteVentaAction(id)
    toast({ title: "Venta eliminada", message: "La venta ha sido eliminada permanentemente", type: "error" })
    refresh()
  }

  return (
    <VentasContext.Provider
      value={{
        ventas: localVentas,
        filteredVentas,
        filtros,
        isLoading: loading,
        setFiltros,
        refreshData: refresh,
        handleCreateVenta,
        handleUpdateVenta,
        handleDeleteVenta,
      }}
    >
      {children}
    </VentasContext.Provider>
  )
}
