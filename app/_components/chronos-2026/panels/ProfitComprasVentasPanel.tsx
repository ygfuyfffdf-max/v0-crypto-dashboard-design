/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💱 PROFIT CASA DE CAMBIO — PANEL COMPRAS Y VENTAS COMPLETO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel completo para gestión de:
 * - Compras a proveedores (con diferentes métodos de pago)
 * - Ventas a clientes (con diferentes métodos de pago)
 * - Tipos de cambio diferenciados por método
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import {
  profitComprasVentasService,
  METODOS_PAGO_CONFIG,
  type MetodoPago,
  type Proveedor,
  type DatosPago,
} from '@/app/_lib/services/profit-compras-ventas.service'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  Bitcoin,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  Hash,
  Loader2,
  Phone,
  RefreshCw,
  Send,
  Star,
  User,
  Wallet,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type TipoOperacion = 'compra' | 'venta'

interface ProfitComprasVentasPanelProps {
  cajeroId?: string
  cajeroNombre?: string
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DIVISAS_DISPONIBLES = [
  { id: 'USD', nombre: 'Dólar Estadounidense', bandera: '🇺🇸', simbolo: '$' },
  { id: 'EUR', nombre: 'Euro', bandera: '🇪🇺', simbolo: '€' },
  { id: 'CAD', nombre: 'Dólar Canadiense', bandera: '🇨🇦', simbolo: '$' },
  { id: 'GBP', nombre: 'Libra Esterlina', bandera: '🇬🇧', simbolo: '£' },
  { id: 'USDT', nombre: 'Tether USDT', bandera: '💎', simbolo: '₮' },
]

const METODOS_ICONS: Record<MetodoPago, React.ReactNode> = {
  transferencia: <Building2 className="h-5 w-5" />,
  efectivo: <Banknote className="h-5 w-5" />,
  tarjeta: <CreditCard className="h-5 w-5" />,
  cripto: <Bitcoin className="h-5 w-5" />,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SELECTOR DE MÉTODO DE PAGO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const MetodoPagoSelector = memo(function MetodoPagoSelector({
  metodosDisponibles,
  metodoSeleccionado,
  onSelect,
  tiposCambioPorMetodo,
  divisa,
}: {
  metodosDisponibles: MetodoPago[]
  metodoSeleccionado: MetodoPago | null
  onSelect: (metodo: MetodoPago) => void
  tiposCambioPorMetodo?: Record<MetodoPago, number>
  divisa?: string
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {metodosDisponibles.map((metodo) => {
        const config = METODOS_PAGO_CONFIG[metodo]
        const isSelected = metodoSeleccionado === metodo
        const tipoCambio = tiposCambioPorMetodo?.[metodo]

        return (
          <motion.button
            key={metodo}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(metodo)}
            className={cn(
              'relative p-4 rounded-xl border-2 transition-all text-left',
              isSelected
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={cn(
                  'p-2 rounded-lg',
                  isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60'
                )}
              >
                {METODOS_ICONS[metodo]}
              </div>
              <div>
                <p className={cn('font-medium', isSelected ? 'text-emerald-400' : 'text-white')}>
                  {config.nombreCorto}
                </p>
                {config.comisionPorcentaje > 0 && (
                  <p className="text-xs text-white/40">
                    +{config.comisionPorcentaje}% comisión
                  </p>
                )}
              </div>
            </div>

            {tipoCambio && divisa && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <p className="text-xs text-white/50">Tipo de cambio</p>
                <p className={cn('text-lg font-bold', isSelected ? 'text-emerald-400' : 'text-white')}>
                  ${tipoCambio.toFixed(2)} MXN
                </p>
              </div>
            )}

            {isSelected && (
              <div className="absolute top-2 right-2">
                <Check className="h-5 w-5 text-emerald-400" />
              </div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORMULARIO DATOS DE PAGO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const FormularioDatosPago = memo(function FormularioDatosPago({
  metodoPago,
  datosPago,
  onChange,
  esCompra,
}: {
  metodoPago: MetodoPago
  datosPago: DatosPago
  onChange: (datos: DatosPago) => void
  esCompra: boolean
}) {
  const actualizarCampo = (campo: keyof DatosPago, valor: unknown) => {
    onChange({ ...datosPago, [campo]: valor })
  }

  if (metodoPago === 'transferencia') {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white/70 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Datos de Transferencia
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">
              {esCompra ? 'Banco Destino' : 'Banco Origen'}
            </label>
            <input
              type="text"
              value={esCompra ? datosPago.bancoDestino ?? '' : datosPago.bancoOrigen ?? ''}
              onChange={(e) => actualizarCampo(esCompra ? 'bancoDestino' : 'bancoOrigen', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none"
              placeholder="BBVA, Banorte, etc."
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">CLABE</label>
            <input
              type="text"
              value={esCompra ? datosPago.clabeDestino ?? '' : datosPago.clabeOrigen ?? ''}
              onChange={(e) => actualizarCampo(esCompra ? 'clabeDestino' : 'clabeOrigen', e.target.value)}
              maxLength={18}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none font-mono"
              placeholder="18 dígitos"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-white/50 mb-1 block">Referencia/Concepto</label>
            <input
              type="text"
              value={datosPago.referencia ?? ''}
              onChange={(e) => actualizarCampo('referencia', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none"
              placeholder="Referencia de la transferencia"
            />
          </div>
        </div>
      </div>
    )
  }

  if (metodoPago === 'tarjeta') {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white/70 flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Datos de Tarjeta
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Tipo de Tarjeta</label>
            <select
              value={datosPago.tipoTarjeta ?? ''}
              onChange={(e) => actualizarCampo('tipoTarjeta', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="" className="bg-gray-900">Seleccionar</option>
              <option value="debito" className="bg-gray-900">Débito</option>
              <option value="credito" className="bg-gray-900">Crédito</option>
              <option value="negra" className="bg-gray-900">Negra/Premium</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Últimos 4 Dígitos</label>
            <input
              type="text"
              value={datosPago.ultimosDigitos ?? ''}
              onChange={(e) => actualizarCampo('ultimosDigitos', e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none font-mono text-center"
              placeholder="****"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block"># Autorización</label>
            <input
              type="text"
              value={datosPago.autorizacion ?? ''}
              onChange={(e) => actualizarCampo('autorizacion', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none font-mono"
              placeholder="123456"
            />
          </div>
        </div>
      </div>
    )
  }

  if (metodoPago === 'cripto') {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white/70 flex items-center gap-2">
          <Bitcoin className="h-4 w-4" />
          Datos de Criptomoneda
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Red</label>
            <select
              value={datosPago.red ?? ''}
              onChange={(e) => actualizarCampo('red', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="" className="bg-gray-900">Seleccionar red</option>
              <option value="TRC20" className="bg-gray-900">TRC20 (Tron)</option>
              <option value="ERC20" className="bg-gray-900">ERC20 (Ethereum)</option>
              <option value="BEP20" className="bg-gray-900">BEP20 (BSC)</option>
              <option value="Lightning" className="bg-gray-900">Lightning (BTC)</option>
              <option value="Mainnet" className="bg-gray-900">Mainnet (BTC)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Wallet Address</label>
            <input
              type="text"
              value={datosPago.wallet ?? ''}
              onChange={(e) => actualizarCampo('wallet', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none font-mono text-xs"
              placeholder="0x... o T..."
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-white/50 mb-1 block">Hash de Transacción</label>
            <input
              type="text"
              value={datosPago.hashTransaccion ?? ''}
              onChange={(e) => actualizarCampo('hashTransaccion', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none font-mono text-xs"
              placeholder="Hash de la transacción (opcional al crear)"
            />
          </div>
        </div>
      </div>
    )
  }

  // Efectivo - mostrar selector de denominaciones
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-white/70 flex items-center gap-2">
        <Banknote className="h-4 w-4" />
        Pago en Efectivo
      </h4>
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <p className="text-sm text-emerald-400">
          ✓ El efectivo se contará al momento de la operación
        </p>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// RESUMEN COTIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ResumenCotizacion = memo(function ResumenCotizacion({
  tipo,
  divisa,
  cantidad,
  metodoPago,
  tipoCambio,
  montoBase,
  comision,
  total,
  ganancia,
  validezMinutos,
}: {
  tipo: TipoOperacion
  divisa: string
  cantidad: number
  metodoPago: MetodoPago
  tipoCambio: number
  montoBase: number
  comision: number
  total: number
  ganancia?: number
  validezMinutos: number
}) {
  const divisaInfo = DIVISAS_DISPONIBLES.find((d) => d.id === divisa)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-green-900/20 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white">Resumen de Cotización</h4>
        <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs">
          Válido {validezMinutos} min
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-white/60">
            {tipo === 'compra' ? 'Comprando' : 'Vendiendo'}
          </span>
          <span className="text-xl font-bold text-white">
            {divisaInfo?.bandera} {cantidad.toLocaleString()} {divisa}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/60">Método de pago</span>
          <span className="text-white flex items-center gap-2">
            {METODOS_ICONS[metodoPago]}
            {METODOS_PAGO_CONFIG[metodoPago].nombreCorto}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/60">Tipo de cambio</span>
          <span className="text-white font-mono">${tipoCambio.toFixed(4)} MXN</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/60">Subtotal</span>
          <span className="text-white">${montoBase.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
        </div>

        {comision > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-white/60">Comisión método</span>
            <span className="text-amber-400">+${comision.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-white/20">
          <span className="text-white font-medium">
            {tipo === 'compra' ? 'Total a pagar' : 'Total a cobrar'}
          </span>
          <span className="text-2xl font-bold text-emerald-400">
            ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </span>
        </div>

        {ganancia !== undefined && tipo === 'venta' && (
          <div className="flex justify-between items-center pt-2">
            <span className="text-white/60">Ganancia estimada</span>
            <span className="text-green-400 font-medium">
              +${ganancia.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PANEL PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ProfitComprasVentasPanel = memo(function ProfitComprasVentasPanel({
  cajeroId = 'cajero_001',
  cajeroNombre = 'Cajero',
  className,
}: ProfitComprasVentasPanelProps) {
  // Estado principal
  const [tipoOperacion, setTipoOperacion] = useState<TipoOperacion>('venta')
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<string | null>(null)

  // Estado del formulario
  const [divisa, setDivisa] = useState<string>('USD')
  const [cantidad, setCantidad] = useState<string>('')
  const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null)
  const [datosPago, setDatosPago] = useState<DatosPago>({})

  // Estado del cliente (para ventas)
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteTelefono, setClienteTelefono] = useState('')
  const [clienteIdentificacion, setClienteIdentificacion] = useState('')

  // Estado de cotización
  interface CotizacionState {
    tipoCambio: number
    montoBase: number
    comision: number
    total: number
    ganancia?: number
    validez: number
  }
  const [cotizacion, setCotizacion] = useState<CotizacionState | null>(null)
  const [cargando, setCargando] = useState(false)
  const [procesando, setProcesando] = useState(false)

  // Cargar proveedores
  useEffect(() => {
    const provs = profitComprasVentasService.getProveedores({ soloActivos: true })
    setProveedores(provs)
  }, [])

  // Obtener tipos de cambio para el método seleccionado
  const tiposCambioPorMetodo = useMemo(() => {
    if (tipoOperacion === 'compra' && proveedorSeleccionado) {
      const proveedor = proveedores.find((p) => p.id === proveedorSeleccionado)
      return proveedor?.tiposCambio[divisa]
    }
    // Para ventas, usar tipos de cambio de venta
    const tcVenta = profitComprasVentasService.getTiposCambioVenta(divisa)
    return tcVenta ?? undefined
  }, [tipoOperacion, proveedorSeleccionado, proveedores, divisa])

  // Métodos de pago disponibles
  const metodosDisponibles = useMemo((): MetodoPago[] => {
    if (tipoOperacion === 'compra' && proveedorSeleccionado) {
      const proveedor = proveedores.find((p) => p.id === proveedorSeleccionado)
      return proveedor?.metodosAceptados ?? []
    }
    // Para ventas, todos los métodos
    return ['transferencia', 'efectivo', 'tarjeta', 'cripto']
  }, [tipoOperacion, proveedorSeleccionado, proveedores])

  // Cotizar
  const realizarCotizacion = useCallback(async () => {
    if (!divisa || !cantidad || !metodoPago) return

    setCargando(true)

    try {
      if (tipoOperacion === 'compra') {
        if (!proveedorSeleccionado) {
          toast.error('Selecciona un proveedor')
          return
        }
        const resultado = profitComprasVentasService.cotizarCompraProveedor({
          proveedorId: proveedorSeleccionado,
          divisa,
          cantidadDivisa: parseFloat(cantidad),
          metodoPago,
        })

        if (resultado.exito && resultado.cotizacion) {
          setCotizacion({
            tipoCambio: resultado.cotizacion.tipoCambio,
            montoBase: resultado.cotizacion.montoBaseMxn,
            comision: resultado.cotizacion.comisionMetodo,
            total: resultado.cotizacion.totalMxn,
            validez: resultado.cotizacion.validezMinutos,
          })
        } else {
          toast.error(resultado.mensaje)
        }
      } else {
        const resultado = profitComprasVentasService.cotizarVentaCliente({
          divisa,
          cantidadDivisa: parseFloat(cantidad),
          metodoPago,
        })

        if (resultado.exito && resultado.cotizacion) {
          setCotizacion({
            tipoCambio: resultado.cotizacion.tipoCambioVenta,
            montoBase: resultado.cotizacion.montoRecibeMxn,
            comision: resultado.cotizacion.comisionMetodo,
            total: resultado.cotizacion.totalCobroCliente,
            ganancia: resultado.cotizacion.gananciaEstimada,
            validez: resultado.cotizacion.validezMinutos,
          })
        } else {
          toast.error(resultado.mensaje)
        }
      }
    } catch {
      toast.error('Error al cotizar')
    } finally {
      setCargando(false)
    }
  }, [tipoOperacion, proveedorSeleccionado, divisa, cantidad, metodoPago])

  // Ejecutar operación
  const ejecutarOperacion = async () => {
    if (!cotizacion || !metodoPago) return

    if (tipoOperacion === 'venta' && !clienteNombre.trim()) {
      toast.error('Ingresa el nombre del cliente')
      return
    }

    setProcesando(true)

    try {
      if (tipoOperacion === 'compra') {
        const resultado = profitComprasVentasService.crearOrdenCompra({
          proveedorId: proveedorSeleccionado!,
          divisa,
          cantidadDivisa: parseFloat(cantidad),
          metodoPago,
          datosPago,
          creadoPor: cajeroId,
        })

        if (resultado.exito) {
          toast.success(`Orden ${resultado.orden?.folio} creada`)
          resetearFormulario()
        } else {
          toast.error(resultado.mensaje)
        }
      } else {
        const resultado = profitComprasVentasService.crearVenta({
          clienteNombre,
          clienteTelefono: clienteTelefono || undefined,
          clienteIdentificacion: clienteIdentificacion || undefined,
          divisa,
          cantidadDivisa: parseFloat(cantidad),
          metodoPago,
          datosPago,
          cajeroId,
          cajeroNombre,
        })

        if (resultado.exito) {
          toast.success(`Venta ${resultado.venta?.folio} registrada`)
          resetearFormulario()
        } else {
          toast.error(resultado.mensaje)
        }
      }
    } catch {
      toast.error('Error al procesar operación')
    } finally {
      setProcesando(false)
    }
  }

  const resetearFormulario = () => {
    setCantidad('')
    setMetodoPago(null)
    setDatosPago({})
    setCotizacion(null)
    setClienteNombre('')
    setClienteTelefono('')
    setClienteIdentificacion('')
    setProveedorSeleccionado(null)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header con selector de tipo */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CircleDollarSign className="h-7 w-7 text-emerald-400" />
            Compras y Ventas
          </h2>
          <p className="text-sm text-white/50 mt-1">
            Gestión de operaciones con proveedores y clientes
          </p>
        </div>

        {/* Toggle compra/venta */}
        <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
          <button
            onClick={() => { setTipoOperacion('compra'); resetearFormulario() }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
              tipoOperacion === 'compra'
                ? 'bg-blue-500 text-white'
                : 'text-white/60 hover:text-white'
            )}
          >
            <ArrowDownToLine className="h-4 w-4" />
            Compra a Proveedor
          </button>
          <button
            onClick={() => { setTipoOperacion('venta'); resetearFormulario() }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
              tipoOperacion === 'venta'
                ? 'bg-emerald-500 text-white'
                : 'text-white/60 hover:text-white'
            )}
          >
            <ArrowUpFromLine className="h-4 w-4" />
            Venta a Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="space-y-6">
          {/* Para compras: Selector de proveedor */}
          {tipoOperacion === 'compra' && (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-400" />
                Seleccionar Proveedor
              </h3>
              <div className="space-y-3">
                {proveedores.filter(p => p.divisasDisponibles.includes(divisa)).map((proveedor) => (
                  <button
                    key={proveedor.id}
                    onClick={() => setProveedorSeleccionado(proveedor.id)}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 text-left transition-all',
                      proveedorSeleccionado === proveedor.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white flex items-center gap-2">
                          {proveedor.nombre}
                          {proveedor.esPreferido && (
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          )}
                        </p>
                        <p className="text-sm text-white/50">
                          {proveedor.metodosAceptados.map(m => METODOS_PAGO_CONFIG[m].icono).join(' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/50">Disponible</p>
                        <p className="text-white font-medium">
                          {(proveedor.disponibilidad[divisa] ?? 0).toLocaleString()} {divisa}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Para ventas: Datos del cliente */}
          {tipoOperacion === 'venta' && (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-400" />
                Datos del Cliente
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs text-white/50 mb-1 block">Nombre completo *</label>
                  <input
                    type="text"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none"
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                      type="tel"
                      value={clienteTelefono}
                      onChange={(e) => setClienteTelefono(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none"
                      placeholder="10 dígitos"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Identificación</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                      type="text"
                      value={clienteIdentificacion}
                      onChange={(e) => setClienteIdentificacion(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none"
                      placeholder="INE, Pasaporte..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Selector de divisa y cantidad */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-violet-400" />
              {tipoOperacion === 'compra' ? 'Divisa a Comprar' : 'Divisa a Vender'}
            </h3>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {DIVISAS_DISPONIBLES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setDivisa(d.id); setMetodoPago(null); setCotizacion(null) }}
                  className={cn(
                    'flex flex-col items-center p-3 rounded-xl border-2 transition-all',
                    divisa === d.id
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  )}
                >
                  <span className="text-2xl mb-1">{d.bandera}</span>
                  <span className={cn('text-sm font-medium', divisa === d.id ? 'text-violet-400' : 'text-white')}>
                    {d.id}
                  </span>
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Cantidad</label>
              <div className="relative">
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => { setCantidad(e.target.value); setCotizacion(null) }}
                  className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-xl font-bold placeholder-white/30 focus:border-violet-500 focus:outline-none"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 font-medium">
                  {divisa}
                </span>
              </div>
            </div>
          </div>

          {/* Selector de método de pago */}
          {(tipoOperacion === 'venta' || proveedorSeleccionado) && (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-400" />
                Método de Pago
              </h3>
              <MetodoPagoSelector
                metodosDisponibles={metodosDisponibles}
                metodoSeleccionado={metodoPago}
                onSelect={(m) => { setMetodoPago(m); setCotizacion(null) }}
                tiposCambioPorMetodo={tiposCambioPorMetodo}
                divisa={divisa}
              />
            </div>
          )}

          {/* Datos de pago según método */}
          {metodoPago && (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
              <FormularioDatosPago
                metodoPago={metodoPago}
                datosPago={datosPago}
                onChange={setDatosPago}
                esCompra={tipoOperacion === 'compra'}
              />
            </div>
          )}
        </div>

        {/* Panel derecho: Cotización y acciones */}
        <div className="space-y-6">
          {/* Botón cotizar */}
          <button
            onClick={realizarCotizacion}
            disabled={!divisa || !cantidad || !metodoPago || cargando || (tipoOperacion === 'compra' && !proveedorSeleccionado)}
            className={cn(
              'w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all',
              !divisa || !cantidad || !metodoPago || (tipoOperacion === 'compra' && !proveedorSeleccionado)
                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white'
            )}
          >
            {cargando ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Cotizando...
              </>
            ) : (
              <>
                <Calculator className="h-5 w-5" />
                Obtener Cotización
              </>
            )}
          </button>

          {/* Mostrar cotización */}
          <AnimatePresence>
            {cotizacion && (
              <ResumenCotizacion
                tipo={tipoOperacion}
                divisa={divisa}
                cantidad={parseFloat(cantidad)}
                metodoPago={metodoPago!}
                tipoCambio={cotizacion.tipoCambio}
                montoBase={cotizacion.montoBase}
                comision={cotizacion.comision}
                total={cotizacion.total}
                ganancia={cotizacion.ganancia}
                validezMinutos={cotizacion.validez}
              />
            )}
          </AnimatePresence>

          {/* Botón ejecutar */}
          {cotizacion && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <button
                onClick={ejecutarOperacion}
                disabled={procesando}
                className={cn(
                  'w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all',
                  tipoOperacion === 'compra'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white'
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white'
                )}
              >
                {procesando ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    {tipoOperacion === 'compra' ? 'Crear Orden de Compra' : 'Registrar Venta'}
                  </>
                )}
              </button>

              <button
                onClick={resetearFormulario}
                className="w-full py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Nueva Operación
              </button>
            </motion.div>
          )}

          {/* Info de tipos de cambio */}
          {!cotizacion && tiposCambioPorMetodo && (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
              <h4 className="text-sm font-medium text-white/70 mb-3">
                Tipos de cambio {divisa}/MXN por método
              </h4>
              <div className="space-y-2">
                {(['transferencia', 'efectivo', 'tarjeta', 'cripto'] as MetodoPago[]).map((m) => {
                  const tc = tiposCambioPorMetodo[m]
                  if (!tc) return null
                  return (
                    <div key={m} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
                      <span className="flex items-center gap-2 text-white/70">
                        {METODOS_ICONS[m]}
                        {METODOS_PAGO_CONFIG[m].nombreCorto}
                      </span>
                      <span className="text-white font-mono">${tc.toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default ProfitComprasVentasPanel
