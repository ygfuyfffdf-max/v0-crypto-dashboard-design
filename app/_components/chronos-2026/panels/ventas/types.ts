// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES - ENHANCED WITH GYA DISTRIBUTION & COMPLETE TRACEABILITY
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface Venta {
  id: string
  fecha: string
  hora: string
  cliente: string
  clienteId: string
  producto: string
  cantidad: number
  precioUnitario: number // Precio VENTA al cliente por unidad
  precioCompraUnidad?: number // Precio COMPRA (costo) por unidad
  precioFlete?: number // Flete por unidad
  precioTotal: number // Total de la venta
  montoPagado?: number // Cuánto ha pagado el cliente
  montoRestante?: number // Deuda restante
  porcentajePagado?: number // % pagado (0-100)
  estado: "pagada" | "pendiente" | "parcial" | "cancelada"
  metodoPago?: "efectivo" | "transferencia" | "credito"
  distribuidor?: string
  notas?: string
  createdAt?: string

  // ═══════════════════════════════════════════════════════════════
  // TRAZABILIDAD COMPLETA
  // ═══════════════════════════════════════════════════════════════
  productoId?: string | null
  productoNombre?: string | null
  productoSku?: string | null
  ocId?: string | null // Orden de Compra ID
  ocDistribuidorId?: string | null
  origenLotes?: Array<{
    ocId: string
    cantidad: number
    costoUnidad: number
    distribuidorId?: string
  }> | null
  numeroLotes?: number
  numeroAbonos?: number

  // Distribución GYA proporcional al pago
  distribucionGYA?: {
    bovedaMonte: number
    fleteSur: number
    utilidades: number
  }

  // Allow additional properties for compatibility
  [key: string]: unknown
}

export interface FiltrosState {
  estado: string
  busqueda: string
  fechaInicio: string
  fechaFin: string
  montoMin?: number
  montoMax?: number
  cliente?: string
}

export interface VentasContextType {
  ventas: Venta[]
  filteredVentas: Venta[]
  filtros: FiltrosState
  isLoading: boolean
  setFiltros: (filtros: Partial<FiltrosState>) => void
  refreshData: () => void
  handleCreateVenta: (venta: Partial<Venta>) => Promise<void>
  handleUpdateVenta: (venta: Venta) => Promise<void>
  handleDeleteVenta: (id: string) => Promise<void>
}
