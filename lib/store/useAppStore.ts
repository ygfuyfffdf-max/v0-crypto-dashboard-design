import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import type {
  Banco,
  Distribuidor,
  Cliente,
  OrdenCompra,
  Venta,
  Producto,
  IngresosBanco,
  GastosBanco,
  Transferencia,
} from "@/types"
import { BANCOS } from "@/lib/constants"
import {
  distribuidoresData,
  clientesData,
  ordenesCompraData,
  ventasData,
  productosData,
} from "@/lib/data/initial-data"

interface AppState {
  // UI State
  currentPanel: string
  sidebarCollapsed: boolean
  theme: "light" | "dark" | "cyber"

  // Voice Agent State
  voiceAgentActive: boolean
  voiceAgentStatus: "idle" | "listening" | "thinking" | "speaking"
  audioFrequencies: number[]

  // 3D State
  modelRotation: number
  activeScene: string | null

  // Financial Data
  totalCapital: number
  bancos: Banco[]

  // Data
  distribuidores: Distribuidor[]
  clientes: Cliente[]
  ordenesCompra: OrdenCompra[]
  ventas: Venta[]
  productos: Producto[]
  gastos: GastosBanco[]
  ingresos: IngresosBanco[]
  transferencias: Transferencia[]

  // Actions
  setCurrentPanel: (panel: string) => void
  toggleSidebar: () => void
  setTheme: (theme: "light" | "dark" | "cyber") => void
  setVoiceAgentActive: (active: boolean) => void
  setVoiceAgentStatus: (status: "idle" | "listening" | "thinking" | "speaking") => void
  setAudioFrequencies: (frequencies: number[]) => void
  setModelRotation: (rotation: number) => void
  setActiveScene: (scene: string | null) => void
  updateBancoSaldo: (id: string, amount: number) => void
  crearOrdenCompra: (data: any) => void
  crearVenta: (data: any) => void
  abonarDistribuidor: (distribuidorId: string, monto: number, bancoDestino: string) => void
  abonarCliente: (clienteId: string, monto: number) => void
  crearTransferencia: (origen: string, destino: string, monto: number) => void
  registrarGasto: (banco: string, monto: number, concepto: string) => void
  addGasto: (data: any) => void
  addIngreso: (data: any) => void
  addProducto: (data: any) => void
  addEntradaAlmacen: (data: any) => void
  addSalidaAlmacen: (data: any) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        currentPanel: "dashboard",
        sidebarCollapsed: false,
        theme: "dark",
        voiceAgentActive: false,
        voiceAgentStatus: "idle",
        audioFrequencies: Array(32).fill(0),
        modelRotation: 0,
        activeScene: null,
        totalCapital: BANCOS.reduce((sum, b) => sum + b.capitalActual, 0),
        bancos: BANCOS,
        distribuidores: distribuidoresData,
        clientes: clientesData,
        ordenesCompra: ordenesCompraData,
        ventas: ventasData,
        productos: productosData,
        gastos: [],
        ingresos: [],
        transferencias: [],

        // Actions
        setCurrentPanel: (panel) => set({ currentPanel: panel }),
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setTheme: (theme) => set({ theme }),
        setVoiceAgentActive: (active) => set({ voiceAgentActive: active }),
        setVoiceAgentStatus: (status) => set({ voiceAgentStatus: status }),
        setAudioFrequencies: (frequencies) => set({ audioFrequencies: frequencies }),
        setModelRotation: (rotation) => set({ modelRotation: rotation }),
        setActiveScene: (scene) => set({ activeScene: scene }),
        updateBancoSaldo: (id, amount) =>
          set((state) => ({
            bancos: state.bancos.map((banco) => (banco.id === id ? { ...banco, capitalActual: amount } : banco)),
            totalCapital: state.bancos.reduce((acc, banco) => (banco.id === id ? acc + amount : acc + banco.capitalActual), 0),
          })),
        crearOrdenCompra: (data) => {
          const id = `oc-${Date.now()}`
          const state = get()

          // Buscar o crear distribuidor
          let distribuidor = state.distribuidores.find(
            (d) => d.nombre.toLowerCase() === data.distribuidor.toLowerCase(),
          )

          if (!distribuidor) {
            distribuidor = {
              id: `dist-${Date.now()}`,
              nombre: data.distribuidor,
              deudaTotal: data.deuda,
              totalOrdenesCompra: data.costoTotal,
              totalPagado: data.pagoDistribuidor ?? data.pagoInicial ?? 0,
              ordenesCompra: [id],
              historialPagos: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            set({ distribuidores: [...state.distribuidores, distribuidor] })
          } else {
            set({
              distribuidores: state.distribuidores.map((d) =>
                d.id === distribuidor!.id
                  ? {
                      ...d,
                      deudaTotal: d.deudaTotal + data.deuda,
                      totalOrdenesCompra: d.totalOrdenesCompra + data.costoTotal,
                      ordenesCompra: [...d.ordenesCompra, id],
                      updatedAt: new Date(),
                    }
                  : d,
              ),
            })
          }

          // Crear la orden
          set({ ordenesCompra: [...state.ordenesCompra, { ...data, id }] })

          // Registrar entrada al almacén
          const productoExistente = state.productos.find((p) => p.nombre.toLowerCase() === data.producto.toLowerCase())

          if (productoExistente) {
            set({
              productos: state.productos.map((p) =>
                p.id === productoExistente.id
                  ? {
                      ...p,
                      stockActual: p.stockActual + data.cantidad,
                      totalEntradas: (p.totalEntradas ?? 0) + data.cantidad,
                      updatedAt: new Date(),
                    }
                  : p,
              ),
            })
          } else {
            set({
              productos: [
                ...state.productos,
                {
                  id: `prod-${Date.now()}`,
                  nombre: data.producto,
                  origen: data.origen ?? "",
                  stockActual: data.cantidad,
                  valorUnitario: data.costoPorUnidad,
                  totalEntradas: data.cantidad,
                  totalSalidas: 0,
                  entradas: [],
                  salidas: [],
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
            })
          }

          // Si hubo pago al distribuidor, registrar en banco
          const pagoDistribuidor = data.pagoDistribuidor ?? data.pagoInicial ?? 0
          if (pagoDistribuidor > 0) {
            const bancoId = data.bancoOrigen ?? "boveda-monte"
            const bancoObj = state.bancos.find((b) => b.id === bancoId)
            if (bancoObj) {
              get().updateBancoSaldo(bancoId, bancoObj.capitalActual - pagoDistribuidor)
            }
          }
        },
        crearVenta: (data) => {
          const id = `venta-${Date.now()}`
          const state = get()

          // Buscar o crear cliente
          let cliente = state.clientes.find((c) => c.nombre.toLowerCase() === data.cliente.toLowerCase())

          if (!cliente) {
            cliente = {
              id: `cli-${Date.now()}`,
              nombre: data.cliente,
              deudaTotal: data.montoRestante,
              totalVentas: data.precioTotalVenta,
              totalPagado: data.montoPagado,
              ventas: [id],
              historialPagos: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            set({ clientes: [...state.clientes, cliente] })
          } else {
            set({
              clientes: state.clientes.map((c) =>
                c.id === cliente!.id
                  ? {
                      ...c,
                      deudaTotal: c.deudaTotal + data.montoRestante,
                      totalVentas: c.totalVentas + data.precioTotalVenta,
                      totalPagado: c.totalPagado + data.montoPagado,
                      ventas: [...c.ventas, id],
                      updatedAt: new Date(),
                    }
                  : c,
              ),
            })
          }

          // Calcular distribución bancaria
          const montoBovedaMonte = data.precioCompraUnidad * data.cantidad
          const montoFletes = data.precioFlete * data.cantidad
          const montoUtilidades = (data.precioVentaUnidad - data.precioCompraUnidad - data.precioFlete) * data.cantidad

          // Crear la venta con distribucionBancos
          set({
            ventas: [
              ...state.ventas,
              {
                ...data,
                id,
                distribucionBancos: {
                  bovedaMonte: montoBovedaMonte,
                  fletes: montoFletes,
                  utilidades: montoUtilidades,
                },
              },
            ],
          })

          // Descontar del almacén
          set({
            productos: state.productos.map((p) =>
              p.nombre.toLowerCase() === data.producto.toLowerCase()
                ? {
                    ...p,
                    stockActual: p.stockActual - data.cantidad,
                    totalSalidas: (p.totalSalidas ?? 0) + data.cantidad,
                    updatedAt: new Date(),
                  }
                : p,
            ),
          })

          // Si hay pago (completo o parcial), distribuir proporcionalmente
          if (data.montoPagado > 0) {
            const proporcionPagada = data.montoPagado / data.precioTotalVenta

            const bancoBovedaMonte = state.bancos.find((b) => b.id === "boveda-monte")
            if (bancoBovedaMonte) {
              get().updateBancoSaldo("boveda-monte", bancoBovedaMonte.capitalActual + montoBovedaMonte * proporcionPagada)
            }

            const bancoFletes = state.bancos.find((b) => b.id === "fletes")
            if (bancoFletes) {
              get().updateBancoSaldo("fletes", bancoFletes.capitalActual + montoFletes * proporcionPagada)
            }

            const bancoUtilidades = state.bancos.find((b) => b.id === "utilidades")
            if (bancoUtilidades) {
              get().updateBancoSaldo("utilidades", bancoUtilidades.capitalActual + montoUtilidades * proporcionPagada)
            }
          }
        },
        abonarDistribuidor: (distribuidorId, monto, bancoDestino) => {
          const state = get()

          set({
            distribuidores: state.distribuidores.map((d) =>
              d.id === distribuidorId
                ? {
                    ...d,
                    deudaTotal: Math.max(0, d.deudaTotal - monto),
                    historialPagos: [...d.historialPagos, { fecha: new Date().toISOString(), monto, bancoDestino }],
                  }
                : d,
            ),
          })

          // Restar del banco de origen
          const banco = state.bancos.find((b) => b.id === bancoDestino)
          if (banco) {
            get().updateBancoSaldo(bancoDestino, banco.capitalActual - monto)
          }
        },
        abonarCliente: (clienteId, monto) => {
          const state = get()
          const cliente = state.clientes.find((c) => c.id === clienteId)

          if (!cliente) return

          // Actualizar deuda del cliente
          set({
            clientes: state.clientes.map((c) =>
              c.id === clienteId
                ? {
                    ...c,
                    deudaTotal: Math.max(0, c.deudaTotal - monto),
                    historialPagos: [...c.historialPagos, { fecha: new Date().toISOString(), monto }],
                  }
                : c,
            ),
          })

          const ventasCliente = state.ventas.filter(
            (v) => v.cliente.toLowerCase() === cliente.nombre.toLowerCase() && v.montoRestante > 0,
          )

          if (ventasCliente.length > 0) {
            // Tomar la venta más antigua con saldo pendiente
            const venta = ventasCliente[0]

            // Calcular montos correctos según las fórmulas
            const montoBovedaMonte = venta.precioCompraUnidad * venta.cantidad
            const montoFletes = venta.precioFlete * venta.cantidad
            const montoUtilidades =
              (venta.precioVentaUnidad - venta.precioCompraUnidad - venta.precioFlete) * venta.cantidad

            // Calcular proporción del abono sobre el total de la venta
            const proporcionAbono = monto / venta.precioTotalVenta

            // Distribuir proporcionalmente
            const bancoBovedaMonte = state.bancos.find((b) => b.id === "boveda-monte")
            const bancoFletes = state.bancos.find((b) => b.id === "fletes")
            const bancoUtilidades = state.bancos.find((b) => b.id === "utilidades")

            if (bancoBovedaMonte)
              get().updateBancoSaldo("boveda-monte", bancoBovedaMonte.capitalActual + montoBovedaMonte * proporcionAbono)
            if (bancoFletes) get().updateBancoSaldo("fletes", bancoFletes.capitalActual + montoFletes * proporcionAbono)
            if (bancoUtilidades)
              get().updateBancoSaldo("utilidades", bancoUtilidades.capitalActual + montoUtilidades * proporcionAbono)

            // Actualizar el monto restante de la venta
            set({
              ventas: state.ventas.map((v) =>
                v.id === venta.id
                  ? {
                      ...v,
                      montoPagado: v.montoPagado + monto,
                      montoRestante: Math.max(0, v.montoRestante - monto),
                      estadoPago: v.montoRestante - monto <= 0 ? "completo" : "parcial",
                    }
                  : v,
              ),
            })
          }
        },
        crearTransferencia: (origen, destino, monto) => {
          const state = get()
          const bancoOrigen = state.bancos.find((b) => b.id === origen)
          const bancoDestino = state.bancos.find((b) => b.id === destino)

          if (bancoOrigen && bancoDestino) {
            get().updateBancoSaldo(origen, bancoOrigen.capitalActual - monto)
            get().updateBancoSaldo(destino, bancoDestino.capitalActual + monto)
            set({
              transferencias: [
                ...state.transferencias,
                {
                  id: `trans-${Date.now()}`,
                  fecha: new Date().toISOString(),
                  tipo: "salida" as const,
                  monto,
                  bancoOrigen: origen,
                  bancoDestino: destino,
                  concepto: `Transferencia de ${bancoOrigen.nombre} a ${bancoDestino.nombre}`,
                  estado: "completado",
                  createdAt: new Date(),
                },
              ],
            })
          }
        },
        registrarGasto: (banco, monto, _concepto) => {
          const state = get()
          const bancoObj = state.bancos.find((b) => b.id === banco)

          if (bancoObj) {
            get().updateBancoSaldo(banco, bancoObj.capitalActual - monto)
          }
        },
        addGasto: (data) => {
          const state = get()
          if (data.bancoId) {
            const bancoObj = state.bancos.find((b) => b.id === data.bancoId)
            if (bancoObj) {
              get().updateBancoSaldo(data.bancoId, bancoObj.capitalActual - (data.monto ?? 0))
            }
          }
          set({
            gastos: [
              ...state.gastos,
              {
                id: `gasto-${Date.now()}`,
                tipo: "gasto",
                fecha: data.fecha ?? new Date().toISOString(),
                monto: data.monto ?? 0,
                destino: data.concepto ?? "",
                concepto: data.concepto ?? "",
                bancoId: data.bancoId ?? "",
                referencia: data.referencia,
                createdAt: new Date(),
              },
            ],
          })
        },
        addIngreso: (data) => {
          const state = get()
          if (data.bancoId) {
            const bancoObj = state.bancos.find((b) => b.id === data.bancoId)
            if (bancoObj) {
              get().updateBancoSaldo(data.bancoId, bancoObj.capitalActual + (data.monto ?? 0))
            }
          }
          set({
            ingresos: [
              ...state.ingresos,
              {
                id: `ingreso-${Date.now()}`,
                tipo: "ingreso",
                fecha: data.fecha ?? new Date().toISOString(),
                monto: data.monto ?? 0,
                origen: data.origen ?? "",
                concepto: data.concepto ?? "",
                bancoId: data.bancoId ?? "",
                referencia: data.referencia,
                createdAt: new Date(),
              },
            ],
          })
        },
        addProducto: (data) => {
          const state = get()
          set({
            productos: [
              ...state.productos,
              {
                id: `prod-${Date.now()}`,
                nombre: data.nombre ?? "Nuevo Producto",
                origen: data.origen ?? "",
                stockActual: data.stockActual ?? 0,
                valorUnitario: data.valorUnitario ?? 0,
                totalEntradas: 0,
                totalSalidas: 0,
                entradas: [],
                salidas: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                ...data,
              },
            ],
          })
        },
        addEntradaAlmacen: (data) => {
          const state = get()
          const producto = state.productos.find((p) => p.nombre.toLowerCase() === (data.productoNombre ?? data.producto ?? "").toLowerCase())

          if (producto) {
            set({
              productos: state.productos.map((p) =>
                p.id === producto.id
                  ? {
                      ...p,
                      stockActual: p.stockActual + data.cantidad,
                      totalEntradas: (p.totalEntradas ?? 0) + data.cantidad,
                      updatedAt: new Date(),
                    }
                  : p,
              ),
            })
          } else {
            set({
              productos: [
                ...state.productos,
                {
                  id: `prod-${Date.now()}`,
                  nombre: data.productoNombre ?? data.producto ?? "Nuevo",
                  origen: data.origen ?? "",
                  stockActual: data.cantidad,
                  valorUnitario: data.costoUnitario ?? 0,
                  totalEntradas: data.cantidad,
                  totalSalidas: 0,
                  entradas: [],
                  salidas: [],
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
            })
          }
        },

        addSalidaAlmacen: (data) => {
          const state = get()
          set({
            productos: state.productos.map((p) =>
              p.id === data.productoId
                ? {
                    ...p,
                    stockActual: p.stockActual - data.cantidad,
                    totalSalidas: (p.totalSalidas ?? 0) + data.cantidad,
                    updatedAt: new Date(),
                  }
                : p,
            ),
          })
        },
      }),
      {
        name: "chronos-storage",
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          distribuidores: state.distribuidores,
          clientes: state.clientes,
          ordenesCompra: state.ordenesCompra,
          ventas: state.ventas,
          productos: state.productos,
          bancos: state.bancos,
          gastos: state.gastos,
          ingresos: state.ingresos,
          transferencias: state.transferencias,
        }),
      },
    ),
  ),
)
