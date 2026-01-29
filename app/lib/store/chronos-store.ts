import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface Banco {
  id: string
  nombre: string
  saldo: number
  color: string
  icono: string
  ultimaActualizacion: Date
}

export interface Venta {
  id: string
  clienteId: string
  clienteNombre: string
  monto: number
  costo: number
  ganancia: number
  fecha: Date
  estado: 'pendiente' | 'pagada' | 'cancelada'
  distribucionGYA: {
    bovedaMonte: number // 70% del costo
    fletes: number // 20% del costo
    utilidades: number // 10% de la ganancia
  }
}

export interface Cliente {
  id: string
  nombre: string
  telefono: string
  correo?: string
  deudaTotal: number
  ventasTotales: number
  ultimaCompra?: Date
  fechaCreacion: Date
}

export interface Producto {
  id: string
  nombre: string
  sku: string
  stockActual: number
  precioCompra: number
  precioVenta: number
  categoria: string
  ultimaEntrada?: Date
}

export interface Distribuidor {
  id: string
  nombre: string
  telefono: string
  correo?: string
  deudaTotal: number
  comprasTotales: number
  ultimaOrden?: Date
  fechaCreacion: Date
}

export interface OrdenCompra {
  id: string
  distribuidorId: string
  distribuidorNombre: string
  monto: number
  estado: 'pendiente' | 'completada' | 'cancelada'
  fecha: Date
  productos: Array<{
    productoId: string
    nombre: string
    cantidad: number
    precioUnitario: number
  }>
}

export interface Transferencia {
  id: string
  origenId: string
  origenNombre: string
  destinoId: string
  destinoNombre: string
  monto: number
  concepto: string
  fecha: Date
}

export interface Gasto {
  id: string
  bancoId: string
  bancoNombre: string
  monto: number
  concepto: string
  categoria: string
  fecha: Date
}

export interface Ingreso {
  id: string
  bancoId: string
  bancoNombre: string
  monto: number
  concepto: string
  categoria: string
  fecha: Date
}

interface ChronosStore {
  // Data
  bancos: Banco[]
  ventas: Venta[]
  clientes: Cliente[]
  productos: Producto[]
  distribuidores: Distribuidor[]
  ordenes: OrdenCompra[]
  transferencias: Transferencia[]
  gastos: Gasto[]
  ingresos: Ingreso[]

  // Bancos Actions
  updateBancoSaldo: (bancoId: string, nuevoSaldo: number) => void

  // Ventas Actions
  crearVenta: (venta: Omit<Venta, 'id' | 'fecha' | 'distribucionGYA'>) => void

  // Clientes Actions
  crearCliente: (cliente: Omit<Cliente, 'id' | 'fechaCreacion'>) => void
  actualizarCliente: (id: string, datos: Partial<Cliente>) => void

  // Productos Actions
  crearProducto: (producto: Omit<Producto, 'id'>) => void
  actualizarStock: (productoId: string, cantidad: number) => void

  // Distribuidores Actions
  crearDistribuidor: (distribuidor: Omit<Distribuidor, 'id' | 'fechaCreacion'>) => void

  // Órdenes Actions
  crearOrden: (orden: Omit<OrdenCompra, 'id' | 'fecha'>) => void

  // Transferencias Actions
  crearTransferencia: (transferencia: Omit<Transferencia, 'id' | 'fecha'>) => void

  // Gastos Actions
  crearGasto: (gasto: Omit<Gasto, 'id' | 'fecha'>) => void

  // Ingresos Actions
  crearIngreso: (ingreso: Omit<Ingreso, 'id' | 'fecha'>) => void

  // Utilities
  getKPIs: () => {
    capitalTotal: number
    ventasMes: number
    gananciasMes: number
    deudaClientesTotal: number
    liquidezDias: number
    roce: number
  }
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const useChronosStore = create<ChronosStore>()(
  persist(
    immer((set, get) => ({
      // Initial Data - Mock data para empezar
      bancos: [
        {
          id: 'boveda-monte',
          nombre: 'Bóveda Monte',
          saldo: 45000000,
          color: '#FFD700',
          icono: 'Vault',
          ultimaActualizacion: new Date(),
        },
        {
          id: 'fletes',
          nombre: 'Fletes',
          saldo: 12000000,
          color: '#8B00FF',
          icono: 'Truck',
          ultimaActualizacion: new Date(),
        },
        {
          id: 'utilidades',
          nombre: 'Utilidades',
          saldo: 8500000,
          color: '#FF1493',
          icono: 'TrendingUp',
          ultimaActualizacion: new Date(),
        },
        {
          id: 'efectivo',
          nombre: 'Efectivo',
          saldo: 5000000,
          color: '#10B981',
          icono: 'Banknote',
          ultimaActualizacion: new Date(),
        },
        {
          id: 'banco-agricola',
          nombre: 'Banco Agrícola',
          saldo: 15000000,
          color: '#F59E0B',
          icono: 'Landmark',
          ultimaActualizacion: new Date(),
        },
        {
          id: 'banco-cuscatlan',
          nombre: 'Banco Cuscatlán',
          saldo: 10000000,
          color: '#6366F1',
          icono: 'Building2',
          ultimaActualizacion: new Date(),
        },
        {
          id: 'banco-davivienda',
          nombre: 'Banco Davivienda',
          saldo: 7500000,
          color: '#EC4899',
          icono: 'CreditCard',
          ultimaActualizacion: new Date(),
        },
      ],
      ventas: [],
      clientes: [],
      productos: [],
      distribuidores: [],
      ordenes: [],
      transferencias: [],
      gastos: [],
      ingresos: [],

      // Bancos Actions
      updateBancoSaldo: (bancoId, nuevoSaldo) =>
        set((state) => {
          const banco = state.bancos.find((b) => b.id === bancoId)
          if (banco) {
            banco.saldo = nuevoSaldo
            banco.ultimaActualizacion = new Date()
          }
        }),

      // Ventas Actions
      crearVenta: (ventaData) =>
        set((state) => {
          // Calcular distribución GYA automáticamente
          const distribucionGYA = {
            bovedaMonte: ventaData.costo * 0.7, // 70% del costo
            fletes: ventaData.costo * 0.2, // 20% del costo
            utilidades: ventaData.ganancia * 0.1, // 10% de la ganancia
          }

          const nuevaVenta: Venta = {
            ...ventaData,
            id: generateId(),
            fecha: new Date(),
            distribucionGYA,
          }

          state.ventas.push(nuevaVenta)

          // Actualizar saldos de bancos GYA
          const bovedaBanco = state.bancos.find((b) => b.id === 'boveda-monte')
          const fletesBanco = state.bancos.find((b) => b.id === 'fletes')
          const utilidadesBanco = state.bancos.find((b) => b.id === 'utilidades')

          if (bovedaBanco) bovedaBanco.saldo -= distribucionGYA.bovedaMonte
          if (fletesBanco) fletesBanco.saldo += distribucionGYA.fletes
          if (utilidadesBanco) utilidadesBanco.saldo += distribucionGYA.utilidades

          // Actualizar cliente
          const cliente = state.clientes.find((c) => c.id === ventaData.clienteId)
          if (cliente) {
            cliente.ventasTotales += ventaData.monto
            cliente.ultimaCompra = new Date()
            if (ventaData.estado === 'pendiente') {
              cliente.deudaTotal += ventaData.monto
            }
          }
        }),

      // Clientes Actions
      crearCliente: (clienteData) =>
        set((state) => {
          const nuevoCliente: Cliente = {
            ...clienteData,
            id: generateId(),
            fechaCreacion: new Date(),
          }
          state.clientes.push(nuevoCliente)
        }),

      actualizarCliente: (id, datos) =>
        set((state) => {
          const cliente = state.clientes.find((c) => c.id === id)
          if (cliente) {
            Object.assign(cliente, datos)
          }
        }),

      // Productos Actions
      crearProducto: (productoData) =>
        set((state) => {
          const nuevoProducto: Producto = {
            ...productoData,
            id: generateId(),
          }
          state.productos.push(nuevoProducto)
        }),

      actualizarStock: (productoId, cantidad) =>
        set((state) => {
          const producto = state.productos.find((p) => p.id === productoId)
          if (producto) {
            producto.stockActual += cantidad
            producto.ultimaEntrada = new Date()
          }
        }),

      // Distribuidores Actions
      crearDistribuidor: (distribuidorData) =>
        set((state) => {
          const nuevoDistribuidor: Distribuidor = {
            ...distribuidorData,
            id: generateId(),
            fechaCreacion: new Date(),
          }
          state.distribuidores.push(nuevoDistribuidor)
        }),

      // Órdenes Actions
      crearOrden: (ordenData) =>
        set((state) => {
          const nuevaOrden: OrdenCompra = {
            ...ordenData,
            id: generateId(),
            fecha: new Date(),
          }
          state.ordenes.push(nuevaOrden)

          // Actualizar deuda del distribuidor
          const distribuidor = state.distribuidores.find((d) => d.id === ordenData.distribuidorId)
          if (distribuidor) {
            distribuidor.deudaTotal += ordenData.monto
            distribuidor.comprasTotales += ordenData.monto
            distribuidor.ultimaOrden = new Date()
          }

          // Descontar de Bóveda Monte
          const bovedaBanco = state.bancos.find((b) => b.id === 'boveda-monte')
          if (bovedaBanco) {
            bovedaBanco.saldo -= ordenData.monto
            bovedaBanco.ultimaActualizacion = new Date()
          }
        }),

      // Transferencias Actions
      crearTransferencia: (transferenciaData) =>
        set((state) => {
          const nuevaTransferencia: Transferencia = {
            ...transferenciaData,
            id: generateId(),
            fecha: new Date(),
          }
          state.transferencias.push(nuevaTransferencia)

          // Actualizar saldos
          const origenBanco = state.bancos.find((b) => b.id === transferenciaData.origenId)
          const destinoBanco = state.bancos.find((b) => b.id === transferenciaData.destinoId)

          if (origenBanco) {
            origenBanco.saldo -= transferenciaData.monto
            origenBanco.ultimaActualizacion = new Date()
          }
          if (destinoBanco) {
            destinoBanco.saldo += transferenciaData.monto
            destinoBanco.ultimaActualizacion = new Date()
          }
        }),

      // Gastos Actions
      crearGasto: (gastoData) =>
        set((state) => {
          const nuevoGasto: Gasto = {
            ...gastoData,
            id: generateId(),
            fecha: new Date(),
          }
          state.gastos.push(nuevoGasto)

          // Descontar del banco
          const banco = state.bancos.find((b) => b.id === gastoData.bancoId)
          if (banco) {
            banco.saldo -= gastoData.monto
            banco.ultimaActualizacion = new Date()
          }
        }),

      // Ingresos Actions
      crearIngreso: (ingresoData) =>
        set((state) => {
          const nuevoIngreso: Ingreso = {
            ...ingresoData,
            id: generateId(),
            fecha: new Date(),
          }
          state.ingresos.push(nuevoIngreso)

          // Sumar al banco
          const banco = state.bancos.find((b) => b.id === ingresoData.bancoId)
          if (banco) {
            banco.saldo += ingresoData.monto
            banco.ultimaActualizacion = new Date()
          }
        }),

      // KPIs Calculator
      getKPIs: () => {
        const state = get()

        const capitalTotal = state.bancos.reduce((acc, b) => acc + b.saldo, 0)

        const hoy = new Date()
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

        const ventasMes = state.ventas
          .filter((v) => new Date(v.fecha) >= inicioMes)
          .reduce((acc, v) => acc + v.monto, 0)

        const gananciasMes = state.ventas
          .filter((v) => new Date(v.fecha) >= inicioMes)
          .reduce((acc, v) => acc + v.ganancia, 0)

        const deudaClientesTotal = state.clientes.reduce((acc, c) => acc + c.deudaTotal, 0)

        // Liquidez = días que puedes operar con el capital actual
        const gastoDiarioPromedio = (ventasMes / 30) * 0.7 // Asumiendo 70% de costo
        const liquidezDias = gastoDiarioPromedio > 0 ? capitalTotal / gastoDiarioPromedio : 999

        // ROCE = Return on Capital Employed
        const roce = capitalTotal > 0 ? (gananciasMes / capitalTotal) * 100 : 0

        return {
          capitalTotal,
          ventasMes,
          gananciasMes,
          deudaClientesTotal,
          liquidezDias,
          roce,
        }
      },
    })),
    {
      name: 'chronos-infinity-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
