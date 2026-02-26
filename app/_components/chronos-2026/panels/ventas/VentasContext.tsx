"use client"

import { useToastAdvanced } from "@/app/_components/ui/ios"
import { useVentasData } from "@/app/hooks/useDataHooks"
import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { FiltrosState, Venta, VentasContextType } from "./types"

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
  const { data: dataFromHook, loading, refetch: refresh } = useVentasData()
  const [localVentas, setLocalVentas] = useState<Venta[]>(initialData)
  const [filtros, setFiltrosState] = useState<FiltrosState>({
    estado: "all",
    busqueda: "",
    fechaInicio: "",
    fechaFin: "",
  })
  const { success: toastSuccess, error: toastError } = useToastAdvanced()

  // Sync with hook data when available
  useEffect(() => {
    if (dataFromHook && dataFromHook.length > 0) {
      setLocalVentas(dataFromHook as unknown as Venta[])
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
    toastSuccess("Venta creada", "La venta se ha registrado correctamente")
    refresh()
  }

  const handleUpdateVenta = async (venta: Venta) => {
    // Here we would call the Server Action
    // await updateVentaAction(venta)
    toastSuccess("Venta actualizada", "Los cambios se han guardado")
    refresh()
  }

  const handleDeleteVenta = async (id: string) => {
    // Here we would call the Server Action
    // await deleteVentaAction(id)
    toastError("Venta eliminada", "La venta ha sido eliminada permanentemente")
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
