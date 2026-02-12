'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔄 CHRONOS INFINITY 2030 — FLOWDISTRIBUTOR STORE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Store centralizado Zustand para el sistema FlowDistributor.
 * Gestiona el estado completo: Bancos, OC, Almacén, Ventas, Clientes, Distribuidores
 *
 * FLUJO PRINCIPAL:
 * 1. Orden de Compra → Crea/Actualiza Distribuidor → Entrada Almacén
 * 2. Venta → Crea/Actualiza Cliente → Salida Almacén → Distribución 3 Bancos
 * 3. Abonos → Actualizan capital de bancos proporcionalmente
 * 4. Transferencias/Gastos → Afectan capital individual de bancos
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import {
  type OperacionCambio,
  TC_REFERENCIA_DEFAULT,
  type TipoCambioActual,
  calcularInventarioUSD,
  calcularTiposCambio,
  procesarCompraUSD,
  procesarVentaUSD,
} from './CasaCambioEngine'
import {
  type Almacen,
  BANCO_CONFIG,
  type Banco,
  type BancoId,
  type Cliente,
  type Distribuidor,
  type EstadoPago,
  FLETE_DEFAULT_USD,
  type MovimientoBanco,
  type OrdenCompra,
  type Venta,
  calcularCapitalBanco,
  calcularDistribucionSegunPago,
  calcularDistribucionVenta,
  procesarEntradaAlmacen,
  procesarGasto,
  procesarIngreso,
  procesarSalidaAlmacen,
  procesarTransferencia,
} from './FlowDistributorEngine'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS DEL STORE
// ═══════════════════════════════════════════════════════════════════════════════════════

interface FlowDistributorState {
  // Entidades
  bancos: Record<BancoId, Banco>
  distribuidores: Record<string, Distribuidor>
  clientes: Record<string, Cliente>
  ordenesCompra: Record<string, OrdenCompra>
  ventas: Record<string, Venta>
  almacen: Almacen

  // Movimientos
  movimientosBancos: MovimientoBanco[]

  // Casa de Cambio
  operacionesCambio: OperacionCambio[]
  tiposCambioActual: TipoCambioActual

  // UI State
  panelActivo: string
  isLoading: boolean
  lastError: string | null
}

interface FlowDistributorActions {
  // Órdenes de Compra
  crearOrdenCompra: (datos: {
    distribuidorNombre: string
    cantidad: number
    precioUnitarioUSD: number
    costoTransporteUSD?: number
    pagoInicial?: number
    bancoOrigen?: BancoId
  }) => Promise<OrdenCompra>

  abonarOrdenCompra: (ordenId: string, monto: number, bancoOrigen: BancoId) => void

  // Ventas
  crearVenta: (datos: {
    clienteNombre: string
    cantidad: number
    precioVentaUSD: number
    precioCompraUSD: number
    precioFleteUSD?: number
    montoPagado: number
    estadoPago: EstadoPago
  }) => Promise<Venta>

  abonarVenta: (ventaId: string, monto: number) => void

  // Bancos
  registrarIngreso: (
    bancoId: BancoId,
    monto: number,
    concepto: string,
    descripcion?: string
  ) => void
  registrarGasto: (bancoId: BancoId, monto: number, concepto: string, descripcion?: string) => void
  realizarTransferencia: (
    origen: BancoId,
    destino: BancoId,
    monto: number,
    concepto: string
  ) => void

  // Casa de Cambio (Profit)
  comprarUSD: (montoUSD: number, tipoCambio: number, bancoUSD?: 'boveda_usa' | 'leftie') => void
  venderUSD: (montoUSD: number, tipoCambio: number, bancoUSD?: 'boveda_usa' | 'leftie') => void
  actualizarTiposCambio: (tcReferencia: number, spread?: number) => void

  // UI
  setPanelActivo: (panel: string) => void
  setError: (error: string | null) => void
  reset: () => void
}

type FlowDistributorStore = FlowDistributorState & FlowDistributorActions

// ═══════════════════════════════════════════════════════════════════════════════════════
// ESTADO INICIAL
// ═══════════════════════════════════════════════════════════════════════════════════════

const crearBancoInicial = (id: BancoId): Banco => ({
  id,
  nombre: BANCO_CONFIG[id].nombre,
  moneda: BANCO_CONFIG[id].moneda,
  capitalActual: 0,
  historicoIngresos: 0,
  historicoGastos: 0,
  historicoTransferencias: 0,
})

const estadoInicial: FlowDistributorState = {
  bancos: {
    boveda_monte: crearBancoInicial('boveda_monte'),
    boveda_usa: crearBancoInicial('boveda_usa'),
    flete_sur: crearBancoInicial('flete_sur'),
    utilidades: crearBancoInicial('utilidades'),
    profit: crearBancoInicial('profit'),
    leftie: crearBancoInicial('leftie'),
    azteca: crearBancoInicial('azteca'),
  },
  distribuidores: {},
  clientes: {},
  ordenesCompra: {},
  ventas: {},
  almacen: {
    stockActual: 0,
    valorStockUSD: 0,
    totalEntradas: 0,
    valorTotalEntradas: 0,
    totalSalidas: 0,
    valorTotalSalidas: 0,
    movimientos: [],
  },
  movimientosBancos: [],
  operacionesCambio: [],
  tiposCambioActual: calcularTiposCambio(TC_REFERENCIA_DEFAULT),
  panelActivo: 'dashboard',
  isLoading: false,
  lastError: null,
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════════════════

export const useFlowDistributorStore = create<FlowDistributorStore>()(
  persist(
    immer((set, get) => ({
      ...estadoInicial,

      // ═══════════════════════════════════════════════════════════════════════════════
      // ÓRDENES DE COMPRA
      // ═══════════════════════════════════════════════════════════════════════════════

      crearOrdenCompra: async (datos) => {
        const id = `OC${nanoid(8)}`
        const ahora = new Date()

        const costoTotal = datos.cantidad * datos.precioUnitarioUSD
        const costoTransporte = datos.costoTransporteUSD || 0
        const costoTotalConTransporte = costoTotal + costoTransporte
        const pagoInicial = datos.pagoInicial || 0

        // Determinar estado de pago
        let estadoPago: EstadoPago = 'pendiente'
        if (pagoInicial >= costoTotalConTransporte) estadoPago = 'completo'
        else if (pagoInicial > 0) estadoPago = 'parcial'

        // Buscar o crear distribuidor
        let distribuidorId = ''
        const distribuidorExistente = Object.values(get().distribuidores).find(
          (d) => d.nombre.toLowerCase() === datos.distribuidorNombre.toLowerCase(),
        )

        if (distribuidorExistente) {
          distribuidorId = distribuidorExistente.id
        } else {
          distribuidorId = `DIST${nanoid(6)}`
        }

        const ordenCompra: OrdenCompra = {
          id,
          fecha: ahora,
          distribuidorId,
          distribuidorNombre: datos.distribuidorNombre,
          cantidad: datos.cantidad,
          precioUnitarioUSD: datos.precioUnitarioUSD,
          costoTotalUSD: costoTotal,
          costoTransporteUSD: costoTransporte,
          costoTotalConTransporte,
          montoPagado: pagoInicial,
          montoRestante: costoTotalConTransporte - pagoInicial,
          estadoPago,
          bancoOrigen: datos.bancoOrigen,
        }

        set((state) => {
          // Agregar OC
          state.ordenesCompra[id] = ordenCompra

          // Crear/Actualizar distribuidor
          if (!distribuidorExistente) {
            state.distribuidores[distribuidorId] = {
              id: distribuidorId,
              nombre: datos.distribuidorNombre,
              totalOrdenesCompra: costoTotalConTransporte,
              totalPagado: pagoInicial,
              adeudoPendiente: costoTotalConTransporte - pagoInicial,
              ordenesCompra: [id],
            }
          } else {
            const dist = state.distribuidores[distribuidorId]
            if (dist) {
              dist.totalOrdenesCompra += costoTotalConTransporte
              dist.totalPagado += pagoInicial
              dist.adeudoPendiente = dist.totalOrdenesCompra - dist.totalPagado
              dist.ordenesCompra.push(id)
            }
          }

          // Entrada al almacén
          const resultado = procesarEntradaAlmacen(
            state.almacen,
            datos.cantidad,
            datos.precioUnitarioUSD,
            id,
          )
          state.almacen = resultado.almacenActualizado

          // Si hay pago inicial, registrar gasto en banco origen
          if (pagoInicial > 0 && datos.bancoOrigen) {
            const banco = state.bancos[datos.bancoOrigen]
            const { bancoActualizado, movimiento } = procesarGasto(
              banco,
              pagoInicial,
              `Pago OC ${id} - ${datos.distribuidorNombre}`,
            )
            state.bancos[datos.bancoOrigen] = bancoActualizado
            state.movimientosBancos.push({
              ...movimiento,
              id: nanoid(),
              referenciaId: id,
              referenciaTipo: 'orden_compra',
            } as MovimientoBanco)
          }
        })

        logger.info('Orden de compra creada', {
          context: 'FlowDistributorStore',
          data: { id, costoTotal },
        })

        const orden = get().ordenesCompra[id]
        if (!orden) {
          throw new Error(`Orden de compra ${id} no encontrada después de crear`)
        }
        return orden
      },

      abonarOrdenCompra: (ordenId, monto, bancoOrigen) => {
        set((state) => {
          const oc = state.ordenesCompra[ordenId]
          if (!oc) {
            state.lastError = `Orden de compra ${ordenId} no encontrada`
            return
          }

          const abonoReal = Math.min(monto, oc.montoRestante)

          // Actualizar OC
          oc.montoPagado += abonoReal
          oc.montoRestante -= abonoReal
          oc.estadoPago = oc.montoRestante <= 0 ? 'completo' : 'parcial'

          // Actualizar distribuidor
          const dist = state.distribuidores[oc.distribuidorId]
          if (dist) {
            dist.totalPagado += abonoReal
            dist.adeudoPendiente -= abonoReal
          }

          // Registrar gasto en banco
          const banco = state.bancos[bancoOrigen]
          const { bancoActualizado, movimiento } = procesarGasto(
            banco,
            abonoReal,
            `Abono OC ${ordenId} - ${oc.distribuidorNombre}`,
          )
          state.bancos[bancoOrigen] = bancoActualizado
          state.movimientosBancos.push({
            ...movimiento,
            id: nanoid(),
            referenciaId: ordenId,
            referenciaTipo: 'orden_compra',
          } as MovimientoBanco)
        })
      },

      // ═══════════════════════════════════════════════════════════════════════════════
      // VENTAS
      // ═══════════════════════════════════════════════════════════════════════════════

      crearVenta: async (datos) => {
        const id = `VTA${nanoid(8)}`
        const ahora = new Date()

        const precioFlete = datos.precioFleteUSD ?? FLETE_DEFAULT_USD
        const precioTotalVenta = datos.cantidad * datos.precioVentaUSD

        // Validar Stock antes de calcular
        if (get().almacen.stockActual < datos.cantidad) {
           get().setError(`Stock insuficiente. Disponible: ${get().almacen.stockActual}`)
           throw new Error('Stock insuficiente')
        }

        // Calcular Costo Real vía FIFO
        const { lotesUsados, costoTotalReal } = asignarLotesFIFO(get().ordenesCompra, datos.cantidad)

        // Calcular distribución GYA
        const distribucion = calcularDistribucionVenta({
          cantidad: datos.cantidad,
          precioTotalVenta,
          costoTotalReal,
          precioFleteTotal: precioFlete * datos.cantidad,
        })

        // Calcular distribución según pago
        const distribucionPago = calcularDistribucionSegunPago(
          distribucion,
          datos.montoPagado,
          precioTotalVenta,
        )

        // Buscar o crear cliente
        let clienteId = ''
        const clienteExistente = Object.values(get().clientes).find(
          (c) => c.nombre.toLowerCase() === datos.clienteNombre.toLowerCase(),
        )

        if (clienteExistente) {
          clienteId = clienteExistente.id
        } else {
          clienteId = `CLI${nanoid(6)}`
        }

        const nuevaVenta: Venta = {
          id,
          fecha: ahora,
          clienteId,
          clienteNombre: datos.clienteNombre,
          cantidad: datos.cantidad,
          precioVentaUSD: datos.precioVentaUSD,
          precioCompraUSD: costoTotalReal / datos.cantidad, // Costo promedio real de esta venta
          precioFleteUSD: precioFlete,
          precioTotalVenta,
          montoBovedaMonte: distribucion.montoBovedaMonte,
          montoFletes: distribucion.montoFletes,
          montoUtilidades: distribucion.montoUtilidades,
          montoPagado: datos.montoPagado,
          montoRestante: precioTotalVenta - datos.montoPagado,
          estadoPago: distribucionPago.estadoPago,
          origenLotes: lotesUsados,
        }

        set((state) => {
          // Agregar venta
          state.ventas[id] = nuevaVenta

          // Crear/Actualizar cliente
          if (!clienteExistente) {
            state.clientes[clienteId] = {
              id: clienteId,
              nombre: datos.clienteNombre,
              totalVentas: precioTotalVenta,
              totalPagado: datos.montoPagado,
              deudaPendiente: precioTotalVenta - datos.montoPagado,
              ventas: [id],
            }
          } else {
            const cliente = state.clientes[clienteId]
            if (cliente) {
              cliente.totalVentas += precioTotalVenta
              cliente.totalPagado += datos.montoPagado
              cliente.deudaPendiente = cliente.totalVentas - cliente.totalPagado
              cliente.ventas.push(id)
            }
          }

          // Salida de almacén (FIFO)
          const resultadoAlmacen = procesarSalidaAlmacen(
            state.almacen,
            state.ordenesCompra,
            datos.cantidad,
            datos.precioVentaUSD,
            id,
          )
          state.almacen = resultadoAlmacen.almacenActualizado
          state.ordenesCompra = resultadoAlmacen.ordenesCompraActualizadas

          // ═════════════════════════════════════════════════════════════════════════
          // DISTRIBUCIÓN A 3 BANCOS
          // Histórico = 100% siempre | Capital = % según pago
          // ═════════════════════════════════════════════════════════════════════════

          const proporcion = distribucionPago.proporcionPagada

          // Bóveda Monte (COSTO)
          state.bancos.boveda_monte.historicoIngresos += distribucion.montoBovedaMonte
          state.bancos.boveda_monte.capitalActual = calcularCapitalBanco(
            state.bancos.boveda_monte.historicoIngresos,
            state.bancos.boveda_monte.historicoGastos,
          )
          if (proporcion < 1) {
            // Ajustar capital por proporción pagada
            const capitalPendiente = distribucion.montoBovedaMonte * (1 - proporcion)
            state.bancos.boveda_monte.capitalActual -= capitalPendiente
          }

          // Flete Sur (TRANSPORTE)
          state.bancos.flete_sur.historicoIngresos += distribucion.montoFletes
          state.bancos.flete_sur.capitalActual = calcularCapitalBanco(
            state.bancos.flete_sur.historicoIngresos,
            state.bancos.flete_sur.historicoGastos,
          )
          if (proporcion < 1) {
            const capitalPendiente = distribucion.montoFletes * (1 - proporcion)
            state.bancos.flete_sur.capitalActual -= capitalPendiente
          }

          // Utilidades (GANANCIA)
          state.bancos.utilidades.historicoIngresos += distribucion.montoUtilidades
          state.bancos.utilidades.capitalActual = calcularCapitalBanco(
            state.bancos.utilidades.historicoIngresos,
            state.bancos.utilidades.historicoGastos,
          )
          if (proporcion < 1) {
            const capitalPendiente = distribucion.montoUtilidades * (1 - proporcion)
            state.bancos.utilidades.capitalActual -= capitalPendiente
          }

          // Registrar movimientos
          const movimientoBase = {
            fecha: ahora,
            tipo: 'ingreso' as const,
            referenciaId: id,
            referenciaTipo: 'venta' as const,
          }

          state.movimientosBancos.push(
            {
              ...movimientoBase,
              id: nanoid(),
              bancoId: 'boveda_monte',
              monto: distribucionPago.capitalBovedaMonte,
              moneda: 'USD',
              concepto: `Venta ${id} - ${datos.clienteNombre} (${datos.cantidad} uds)`,
            },
            {
              ...movimientoBase,
              id: nanoid(),
              bancoId: 'flete_sur',
              monto: distribucionPago.capitalFletes,
              moneda: 'USD',
              concepto: `Flete Venta ${id} - ${datos.clienteNombre}`,
            },
            {
              ...movimientoBase,
              id: nanoid(),
              bancoId: 'utilidades',
              monto: distribucionPago.capitalUtilidades,
              moneda: 'USD',
              concepto: `Utilidad Venta ${id} - ${datos.clienteNombre}`,
            },
          )
        })

        logger.info('Venta creada', {
          context: 'FlowDistributorStore',
          data: { id, total: precioTotalVenta, estadoPago: distribucionPago.estadoPago },
        })

        const venta = get().ventas[id]
        if (!venta) {
          throw new Error(`Venta ${id} no encontrada después de crear`)
        }
        return venta
      },

      abonarVenta: (ventaId, monto) => {
        set((state) => {
          const venta = state.ventas[ventaId]
          if (!venta) {
            state.lastError = `Venta ${ventaId} no encontrada`
            return
          }

          const abonoReal = Math.min(monto, venta.montoRestante)
          const proporcionAbono = abonoReal / venta.precioTotalVenta

          // Actualizar venta
          venta.montoPagado += abonoReal
          venta.montoRestante -= abonoReal
          venta.estadoPago = venta.montoRestante <= 0 ? 'completo' : 'parcial'

          // Actualizar cliente
          const cliente = state.clientes[venta.clienteId]
          if (cliente) {
            cliente.totalPagado += abonoReal
            cliente.deudaPendiente -= abonoReal
          }

          // Distribuir abono a los 3 bancos proporcionalmente
          const abonoBovedaMonte = venta.montoBovedaMonte * proporcionAbono
          const abonoFletes = venta.montoFletes * proporcionAbono
          const abonoUtilidades = venta.montoUtilidades * proporcionAbono

          // El abono aumenta el capital (que estaba "pendiente")
          state.bancos.boveda_monte.capitalActual += abonoBovedaMonte
          state.bancos.flete_sur.capitalActual += abonoFletes
          state.bancos.utilidades.capitalActual += abonoUtilidades

          // Registrar movimientos de abono
          const ahora = new Date()
          state.movimientosBancos.push(
            {
              id: nanoid(),
              bancoId: 'boveda_monte',
              fecha: ahora,
              tipo: 'ingreso',
              monto: abonoBovedaMonte,
              moneda: 'USD',
              concepto: `Abono Venta ${ventaId}`,
              referenciaId: ventaId,
              referenciaTipo: 'venta',
            },
            {
              id: nanoid(),
              bancoId: 'flete_sur',
              fecha: ahora,
              tipo: 'ingreso',
              monto: abonoFletes,
              moneda: 'USD',
              concepto: `Abono Flete ${ventaId}`,
              referenciaId: ventaId,
              referenciaTipo: 'venta',
            },
            {
              id: nanoid(),
              bancoId: 'utilidades',
              fecha: ahora,
              tipo: 'ingreso',
              monto: abonoUtilidades,
              moneda: 'USD',
              concepto: `Abono Utilidad ${ventaId}`,
              referenciaId: ventaId,
              referenciaTipo: 'venta',
            },
          )
        })
      },

      // ═══════════════════════════════════════════════════════════════════════════════
      // BANCOS
      // ═══════════════════════════════════════════════════════════════════════════════

      registrarIngreso: (bancoId, monto, concepto, descripcion) => {
        set((state) => {
          const banco = state.bancos[bancoId]
          const { bancoActualizado, movimiento } = procesarIngreso(
            banco,
            monto,
            concepto,
            descripcion,
          )
          state.bancos[bancoId] = bancoActualizado
          state.movimientosBancos.push({
            ...movimiento,
            id: nanoid(),
          } as MovimientoBanco)
        })
      },

      registrarGasto: (bancoId, monto, concepto, descripcion) => {
        set((state) => {
          const banco = state.bancos[bancoId]
          if (banco.capitalActual < monto) {
            state.lastError = `Fondos insuficientes en ${banco.nombre}`
            return
          }
          const { bancoActualizado, movimiento } = procesarGasto(
            banco,
            monto,
            concepto,
            descripcion,
          )
          state.bancos[bancoId] = bancoActualizado
          state.movimientosBancos.push({
            ...movimiento,
            id: nanoid(),
            referenciaTipo: 'gasto',
          } as MovimientoBanco)
        })
      },

      realizarTransferencia: (origen, destino, monto, concepto) => {
        set((state) => {
          const bancoOrigen = state.bancos[origen]
          const bancoDestino = state.bancos[destino]

          if (bancoOrigen.capitalActual < monto) {
            state.lastError = `Fondos insuficientes en ${bancoOrigen.nombre}`
            return
          }

          const resultado = procesarTransferencia(bancoOrigen, bancoDestino, monto, concepto)

          state.bancos[origen] = resultado.bancoOrigenActualizado
          state.bancos[destino] = resultado.bancoDestinoActualizado

          state.movimientosBancos.push(
            { ...resultado.movimientoOrigen, id: nanoid() } as MovimientoBanco,
            { ...resultado.movimientoDestino, id: nanoid() } as MovimientoBanco,
          )
        })
      },

      // ═══════════════════════════════════════════════════════════════════════════════
      // CASA DE CAMBIO (PROFIT)
      // ═══════════════════════════════════════════════════════════════════════════════

      comprarUSD: (montoUSD, tipoCambio, bancoUSD = 'boveda_usa') => {
        set((state) => {
          const resultado = procesarCompraUSD(montoUSD, tipoCambio, bancoUSD)

          // Verificar fondos en banco USD
          if (state.bancos[bancoUSD].capitalActual < montoUSD) {
            state.lastError = `Fondos USD insuficientes en ${BANCO_CONFIG[bancoUSD].nombre}`
            return
          }

          // Profit recibe MXN (ingreso)
          state.bancos.profit.historicoIngresos += resultado.movimientoProfit.monto
          state.bancos.profit.capitalActual = calcularCapitalBanco(
            state.bancos.profit.historicoIngresos,
            state.bancos.profit.historicoGastos,
          )

          // Banco USD entrega USD (gasto)
          state.bancos[bancoUSD].historicoGastos += resultado.movimientoBancoUSD.monto
          state.bancos[bancoUSD].capitalActual = calcularCapitalBanco(
            state.bancos[bancoUSD].historicoIngresos,
            state.bancos[bancoUSD].historicoGastos,
          )

          // Registrar operación
          state.operacionesCambio.push({
            ...resultado.operacion,
            id: nanoid(),
          })

          // Movimientos
          state.movimientosBancos.push(
            {
              id: nanoid(),
              bancoId: 'profit',
              fecha: new Date(),
              tipo: 'ingreso',
              monto: resultado.movimientoProfit.monto,
              moneda: 'MXN',
              concepto: `Compra ${montoUSD} USD a TC ${tipoCambio}`,
            },
            {
              id: nanoid(),
              bancoId: bancoUSD,
              fecha: new Date(),
              tipo: 'gasto',
              monto: resultado.movimientoBancoUSD.monto,
              moneda: 'USD',
              concepto: `Venta ${montoUSD} USD a TC ${tipoCambio}`,
            },
          )
        })
      },

      venderUSD: (montoUSD, tipoCambio, bancoUSD = 'boveda_usa') => {
        set((state) => {
          // TC promedio de compra
          const inventario = calcularInventarioUSD(
            state.operacionesCambio
              .filter((op) => op.tipo === 'compra_usd')
              .map((op) => ({ montoUSD: op.montoUSD, tipoCambio: op.tipoCambio })),
            state.operacionesCambio
              .filter((op) => op.tipo === 'venta_usd')
              .map((op) => ({ montoUSD: op.montoUSD })),
          )

          const tcCompraOriginal = inventario.costoPromedioCompra || state.tiposCambioActual.compra
          const resultado = procesarVentaUSD(montoUSD, tipoCambio, tcCompraOriginal, bancoUSD)

          const montoMXN = resultado.movimientoProfit.monto

          // Verificar fondos MXN en Profit
          if (state.bancos.profit.capitalActual < montoMXN) {
            state.lastError = 'Fondos MXN insuficientes en Profit'
            return
          }

          // Profit entrega MXN (gasto)
          state.bancos.profit.historicoGastos += montoMXN
          state.bancos.profit.capitalActual = calcularCapitalBanco(
            state.bancos.profit.historicoIngresos,
            state.bancos.profit.historicoGastos,
          )

          // Banco USD recibe USD (ingreso)
          state.bancos[bancoUSD].historicoIngresos += montoUSD
          state.bancos[bancoUSD].capitalActual = calcularCapitalBanco(
            state.bancos[bancoUSD].historicoIngresos,
            state.bancos[bancoUSD].historicoGastos,
          )

          // Registrar ganancia en utilidades
          if (resultado.ganancia > 0) {
            state.bancos.utilidades.historicoIngresos += resultado.ganancia
            state.bancos.utilidades.capitalActual += resultado.ganancia
          }

          // Registrar operación
          state.operacionesCambio.push({
            ...resultado.operacion,
            id: nanoid(),
          })

          // Movimientos
          state.movimientosBancos.push(
            {
              id: nanoid(),
              bancoId: 'profit',
              fecha: new Date(),
              tipo: 'gasto',
              monto: montoMXN,
              moneda: 'MXN',
              concepto: `Venta ${montoUSD} USD a TC ${tipoCambio}`,
            },
            {
              id: nanoid(),
              bancoId: bancoUSD,
              fecha: new Date(),
              tipo: 'ingreso',
              monto: montoUSD,
              moneda: 'USD',
              concepto: `Compra ${montoUSD} USD a TC ${tipoCambio}`,
            },
          )
        })
      },

      actualizarTiposCambio: (tcReferencia, spread) => {
        set((state) => {
          state.tiposCambioActual = calcularTiposCambio(tcReferencia, spread)
        })
      },

      // ═══════════════════════════════════════════════════════════════════════════════
      // UI
      // ═══════════════════════════════════════════════════════════════════════════════

      setPanelActivo: (panel) => set({ panelActivo: panel }),
      setError: (error) => set({ lastError: error }),
      reset: () => set(estadoInicial),
    })),
    {
      name: 'chronos-flowdistributor-v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        bancos: state.bancos,
        distribuidores: state.distribuidores,
        clientes: state.clientes,
        ordenesCompra: state.ordenesCompra,
        ventas: state.ventas,
        almacen: state.almacen,
        movimientosBancos: state.movimientosBancos,
        operacionesCambio: state.operacionesCambio,
        tiposCambioActual: state.tiposCambioActual,
      }),
    },
  ),
)

// ═══════════════════════════════════════════════════════════════════════════════════════
// SELECTORES
// ═══════════════════════════════════════════════════════════════════════════════════════

export const selectBanco = (bancoId: BancoId) => (state: FlowDistributorStore) =>
  state.bancos[bancoId]
export const selectTotalCapital = (state: FlowDistributorStore) =>
  Object.values(state.bancos).reduce((sum, b) => sum + b.capitalActual, 0)
export const selectDeudaClientes = (state: FlowDistributorStore) =>
  Object.values(state.clientes).reduce((sum, c) => sum + c.deudaPendiente, 0)
export const selectAdeudoDistribuidores = (state: FlowDistributorStore) =>
  Object.values(state.distribuidores).reduce((sum, d) => sum + d.adeudoPendiente, 0)
export const selectVentasPendientes = (state: FlowDistributorStore) =>
  Object.values(state.ventas).filter((v) => v.estadoPago !== 'completo')
export const selectMovimientosBanco = (bancoId: BancoId) => (state: FlowDistributorStore) =>
  state.movimientosBancos.filter((m) => m.bancoId === bancoId)

export default useFlowDistributorStore
