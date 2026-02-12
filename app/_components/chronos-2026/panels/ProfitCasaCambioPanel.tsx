/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💱 PROFIT CASA DE CAMBIO — PANEL COMPLETO SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de casa de cambio con:
 * - Pizarra de tipos de cambio en tiempo real
 * - Cotizador inteligente bidireccional
 * - Sistema de operaciones compra/venta
 * - Control de caja con denominaciones
 * - Dashboard de métricas
 * - Historial de operaciones
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import {
  profitCasaCambioService,
  DIVISAS_CONFIG,
  DENOMINACIONES,
  type DivisaId,
  type TipoCambioConfig,
  type Cotizacion,
  type OperacionCambio,
  type DenominacionConteo,
} from '@/app/_lib/services/profit-casa-cambio.service'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  ArrowDownUp,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpDown,
  Banknote,
  Calculator,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  FileText,
  History,
  Info,
  Landmark,
  Loader2,
  Lock,
  LockOpen,
  Minus,
  MoreHorizontal,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
  X,
  Zap,
  BarChart3,
  ShoppingCart,
  PiggyBank,
} from 'lucide-react'
import { toast } from 'sonner'
import ProfitDashboardAnalytics from './ProfitDashboardAnalytics'
import ProfitComprasVentasPanel from './ProfitComprasVentasPanel'
import ProfitCalculadoraRentabilidad from './ProfitCalculadoraRentabilidad'
import ProfitConfiguracionPanel from './ProfitConfiguracionPanel'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type PanelTab = 'cotizar' | 'operaciones' | 'caja' | 'clientes' | 'reportes' | 'dashboard' | 'compras' | 'rentabilidad' | 'config'

interface ProfitCasaCambioPanelProps {
  cajeroId?: string
  cajeroNombre?: string
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PIZARRA DE TIPOS DE CAMBIO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const PizarraTiposCambio = memo(function PizarraTiposCambio({
  tiposCambio,
  onActualizar,
}: {
  tiposCambio: TipoCambioConfig[]
  onActualizar?: (id: string, compra: number, venta: number) => void
}) {
  const [editando, setEditando] = useState<string | null>(null)
  const [tempCompra, setTempCompra] = useState('')
  const [tempVenta, setTempVenta] = useState('')

  const iniciarEdicion = (tc: TipoCambioConfig) => {
    setEditando(tc.id)
    setTempCompra(tc.precioCompra.toString())
    setTempVenta(tc.precioVenta.toString())
  }

  const guardarEdicion = () => {
    if (editando && onActualizar) {
      onActualizar(editando, parseFloat(tempCompra), parseFloat(tempVenta))
    }
    setEditando(null)
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
              <CircleDollarSign className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Tipos de Cambio</h3>
              <p className="text-xs text-white/50">Actualización en tiempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>En vivo</span>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-white/5 text-xs font-medium text-white/50 uppercase tracking-wider">
        <div>Divisa</div>
        <div className="text-center">Compramos</div>
        <div className="text-center">Vendemos</div>
        <div className="text-center">Spread</div>
        <div className="text-center">Acciones</div>
      </div>

      {/* Rates */}
      <div className="divide-y divide-white/5">
        {tiposCambio.map((tc, index) => {
          const divisaBase = DIVISAS_CONFIG[tc.divisaBase]
          const isEditing = editando === tc.id

          return (
            <motion.div
              key={tc.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'grid grid-cols-5 gap-4 px-6 py-4 items-center transition-colors',
                isEditing ? 'bg-violet-500/10' : 'hover:bg-white/5'
              )}
            >
              {/* Divisa */}
              <div className="flex items-center gap-3">
                <span className="text-2xl">{divisaBase.bandera}</span>
                <div>
                  <p className="font-semibold text-white">{tc.par}</p>
                  <p className="text-xs text-white/50">{divisaBase.nombre}</p>
                </div>
              </div>

              {/* Compramos */}
              <div className="text-center">
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={tempCompra}
                    onChange={(e) => setTempCompra(e.target.value)}
                    className="w-24 px-2 py-1 text-center rounded bg-white/10 border border-white/20 text-white text-lg font-mono"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xl font-bold text-emerald-400 font-mono">
                      {tc.precioCompra.toFixed(2)}
                    </span>
                    <TrendingUp className="h-4 w-4 text-emerald-400/60" />
                  </div>
                )}
              </div>

              {/* Vendemos */}
              <div className="text-center">
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={tempVenta}
                    onChange={(e) => setTempVenta(e.target.value)}
                    className="w-24 px-2 py-1 text-center rounded bg-white/10 border border-white/20 text-white text-lg font-mono"
                  />
                ) : (
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xl font-bold text-blue-400 font-mono">
                      {tc.precioVenta.toFixed(2)}
                    </span>
                    <TrendingDown className="h-4 w-4 text-blue-400/60" />
                  </div>
                )}
              </div>

              {/* Spread */}
              <div className="text-center">
                <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium">
                  {((tc.precioVenta - tc.precioCompra) / tc.precioReferencia * 100).toFixed(2)}%
                </span>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      onClick={guardarEdicion}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                      onClick={() => setEditando(null)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    onClick={() => iniciarEdicion(tc)}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-white/5 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
        <span>Última actualización: {new Date().toLocaleTimeString('es-MX')}</span>
        <span>Fuente: Mercado interbancario</span>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COTIZADOR INTELIGENTE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const CotizadorInteligente = memo(function CotizadorInteligente({
  onCotizacionLista,
}: {
  onCotizacionLista: (cotizacion: Cotizacion) => void
}) {
  const [tipoOperacion, setTipoOperacion] = useState<'compra' | 'venta'>('compra')
  const [divisaEntrega, setDivisaEntrega] = useState<DivisaId>('MXN')
  const [divisaRecibe, setDivisaRecibe] = useState<DivisaId>('USD')
  const [montoEntrega, setMontoEntrega] = useState('')
  const [montoRecibe, setMontoRecibe] = useState('')
  const [campoActivo, setCampoActivo] = useState<'entrega' | 'recibe'>('entrega')
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
  const [cargando, setCargando] = useState(false)

  // Cotizar automáticamente al cambiar valores
  useEffect(() => {
    const handler = setTimeout(() => {
      const monto = campoActivo === 'entrega' ? parseFloat(montoEntrega) : parseFloat(montoRecibe)
      if (monto && monto > 0) {
        realizarCotizacion()
      } else {
        setCotizacion(null)
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [montoEntrega, montoRecibe, divisaEntrega, divisaRecibe, tipoOperacion])

  const realizarCotizacion = useCallback(() => {
    const monto = campoActivo === 'entrega' ? parseFloat(montoEntrega) : parseFloat(montoRecibe)
    if (!monto || monto <= 0) return

    setCargando(true)

    try {
      const resultado = profitCasaCambioService.cotizar({
        tipoOperacion,
        divisaEntrega,
        divisaRecibe,
        monto,
        esMontoRecibe: campoActivo === 'recibe',
      })

      setCotizacion(resultado)

      // Actualizar el otro campo
      if (resultado.valida) {
        if (campoActivo === 'entrega') {
          setMontoRecibe(resultado.montoRecibe.toString())
        } else {
          setMontoEntrega(resultado.montoEntrega.toString())
        }
      }
    } catch (error) {
      console.error('Error al cotizar:', error)
    } finally {
      setCargando(false)
    }
  }, [campoActivo, montoEntrega, montoRecibe, divisaEntrega, divisaRecibe, tipoOperacion])

  const intercambiarDivisas = () => {
    const tempDivisa = divisaEntrega
    setDivisaEntrega(divisaRecibe)
    setDivisaRecibe(tempDivisa)
    setTipoOperacion(tipoOperacion === 'compra' ? 'venta' : 'compra')
    setMontoEntrega('')
    setMontoRecibe('')
    setCotizacion(null)
  }

  const limpiar = () => {
    setMontoEntrega('')
    setMontoRecibe('')
    setCotizacion(null)
  }

  const confirmarCotizacion = () => {
    if (cotizacion?.valida) {
      onCotizacionLista(cotizacion)
    }
  }

  const divisasDisponibles = Object.values(DIVISAS_CONFIG).filter(d => d.activa)

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-900/20 to-purple-900/20 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-transparent to-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-500/30">
            <Calculator className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Cotizador</h3>
            <p className="text-xs text-white/50">Cotización instantánea</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tipo de operación */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            className={cn(
              'flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
              tipoOperacion === 'compra'
                ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            )}
            onClick={() => setTipoOperacion('compra')}
          >
            <TrendingDown className="h-5 w-5" />
            Cliente COMPRA
          </button>
          <button
            className={cn(
              'flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
              tipoOperacion === 'venta'
                ? 'bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            )}
            onClick={() => setTipoOperacion('venta')}
          >
            <TrendingUp className="h-5 w-5" />
            Cliente VENDE
          </button>
        </div>

        {/* Campos de conversión */}
        <div className="relative space-y-4">
          {/* Campo Entrega */}
          <div
            className={cn(
              'p-4 rounded-xl border-2 transition-all',
              campoActivo === 'entrega'
                ? 'border-violet-500/50 bg-violet-500/5'
                : 'border-white/10 bg-white/5'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Cliente entrega</span>
              <select
                value={divisaEntrega}
                onChange={(e) => setDivisaEntrega(e.target.value as DivisaId)}
                className="bg-transparent border-none text-white font-medium focus:outline-none cursor-pointer"
              >
                {divisasDisponibles.map(d => (
                  <option key={d.id} value={d.id} className="bg-slate-800">
                    {d.bandera} {d.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{DIVISAS_CONFIG[divisaEntrega].bandera}</span>
              <input
                type="number"
                value={montoEntrega}
                onChange={(e) => {
                  setMontoEntrega(e.target.value)
                  setCampoActivo('entrega')
                }}
                onFocus={() => setCampoActivo('entrega')}
                placeholder="0.00"
                className="flex-1 bg-transparent text-3xl font-bold text-white placeholder:text-white/20 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Botón intercambiar */}
          <div className="absolute left-1/2 top-[calc(50%-12px)] -translate-x-1/2 z-10">
            <motion.button
              className="p-3 rounded-full bg-violet-500/20 border-2 border-violet-500/30 text-violet-400 hover:bg-violet-500/30 transition-colors"
              onClick={intercambiarDivisas}
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowUpDown className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Campo Recibe */}
          <div
            className={cn(
              'p-4 rounded-xl border-2 transition-all',
              campoActivo === 'recibe'
                ? 'border-violet-500/50 bg-violet-500/5'
                : 'border-white/10 bg-white/5'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Cliente recibe</span>
              <select
                value={divisaRecibe}
                onChange={(e) => setDivisaRecibe(e.target.value as DivisaId)}
                className="bg-transparent border-none text-white font-medium focus:outline-none cursor-pointer"
              >
                {divisasDisponibles.map(d => (
                  <option key={d.id} value={d.id} className="bg-slate-800">
                    {d.bandera} {d.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{DIVISAS_CONFIG[divisaRecibe].bandera}</span>
              <input
                type="number"
                value={montoRecibe}
                onChange={(e) => {
                  setMontoRecibe(e.target.value)
                  setCampoActivo('recibe')
                }}
                onFocus={() => setCampoActivo('recibe')}
                placeholder="0.00"
                className="flex-1 bg-transparent text-3xl font-bold text-white placeholder:text-white/20 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Detalles de cotización */}
        <AnimatePresence>
          {cotizacion && cotizacion.valida && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Tipo de cambio aplicado</span>
                <span className="text-white font-mono font-bold">
                  {cotizacion.tipoCambio.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Tipo de cambio referencia</span>
                <span className="text-white/70 font-mono">
                  {cotizacion.tipoCambioReferencia.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Spread</span>
                <span className="text-amber-400 font-mono">
                  {cotizacion.spread.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                <span className="text-white/60">Ganancia estimada</span>
                <span className="text-emerald-400 font-bold">
                  ${cotizacion.gananciaEstimada.toFixed(2)} MXN
                </span>
              </div>
              {cotizacion.requiereID && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 text-amber-400 text-sm">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Esta operación requiere identificación oficial</span>
                </div>
              )}
              <div className="text-xs text-white/40 text-right">
                Válido por {Math.round((cotizacion.expiracion.getTime() - Date.now()) / 1000)}s
              </div>
            </motion.div>
          )}

          {cotizacion && !cotizacion.valida && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {cotizacion.mensaje}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2"
            onClick={limpiar}
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </button>
          <button
            className={cn(
              'flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
              cotizacion?.valida
                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            )}
            onClick={confirmarCotizacion}
            disabled={!cotizacion?.valida}
          >
            {cargando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4" />
                Continuar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORMULARIO DE OPERACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const FormularioOperacion = memo(function FormularioOperacion({
  cotizacion,
  cajeroId,
  cajeroNombre,
  onCompletar,
  onCancelar,
}: {
  cotizacion: Cotizacion
  cajeroId: string
  cajeroNombre: string
  onCompletar: (operacion: OperacionCambio) => void
  onCancelar: () => void
}) {
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteTelefono, setClienteTelefono] = useState('')
  const [tipoID, setTipoID] = useState('')
  const [numeroID, setNumeroID] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [mostrarDenominaciones, setMostrarDenominaciones] = useState(false)

  const ejecutarOperacion = async () => {
    if (!clienteNombre.trim()) {
      toast.error('Ingrese el nombre del cliente')
      return
    }

    if (cotizacion.requiereID && (!tipoID || !numeroID)) {
      toast.error('Se requiere identificación oficial')
      return
    }

    setProcesando(true)

    try {
      const resultado = profitCasaCambioService.ejecutarOperacion({
        cotizacionId: cotizacion.id,
        clienteNombre,
        clienteTelefono,
        tipoID: tipoID || undefined,
        numeroID: numeroID || undefined,
        cajeroId,
        cajeroNombre,
      })

      if (resultado.exito && resultado.operacion) {
        toast.success(`Operación ${resultado.operacion.folio} completada`)
        onCompletar(resultado.operacion)
      } else {
        toast.error(resultado.mensaje)
      }
    } catch (error) {
      toast.error('Error al procesar la operación')
    } finally {
      setProcesando(false)
    }
  }

  const denominacionesSugeridas = useMemo(() => {
    return profitCasaCambioService.calcularDenominaciones(
      cotizacion.montoRecibe,
      cotizacion.divisaRecibe
    )
  }, [cotizacion])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-green-900/20 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 via-transparent to-green-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20">
              <FileText className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Confirmar Operación</h3>
              <p className="text-xs text-white/50">Complete los datos del cliente</p>
            </div>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
            onClick={onCancelar}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Resumen de operación */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/60">Operación</span>
            <span className={cn(
              'px-2 py-1 rounded-lg text-sm font-medium',
              cotizacion.tipoOperacion === 'compra'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-blue-500/20 text-blue-400'
            )}>
              Cliente {cotizacion.tipoOperacion === 'compra' ? 'COMPRA' : 'VENDE'}
            </span>
          </div>
          <div className="flex items-center justify-center gap-4 py-3">
            <div className="text-center">
              <p className="text-xs text-white/50 mb-1">Entrega</p>
              <p className="text-xl font-bold text-white">
                {DIVISAS_CONFIG[cotizacion.divisaEntrega].simbolo}
                {cotizacion.montoEntrega.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-white/60">{cotizacion.divisaEntrega}</p>
            </div>
            <ArrowRight className="h-6 w-6 text-emerald-400" />
            <div className="text-center">
              <p className="text-xs text-white/50 mb-1">Recibe</p>
              <p className="text-xl font-bold text-emerald-400">
                {DIVISAS_CONFIG[cotizacion.divisaRecibe].simbolo}
                {cotizacion.montoRecibe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-white/60">{cotizacion.divisaRecibe}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
            <span className="text-white/60">Tipo de cambio</span>
            <span className="text-white font-mono">{cotizacion.tipoCambio.toFixed(4)}</span>
          </div>
        </div>

        {/* Datos del cliente */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white/70">Datos del Cliente</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-white/50 mb-1">Nombre completo *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="tel"
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  placeholder="Teléfono"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {cotizacion.requiereID && (
              <>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Tipo de ID *</label>
                  <select
                    value={tipoID}
                    onChange={(e) => setTipoID(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="" className="bg-slate-800">Seleccionar</option>
                    <option value="INE" className="bg-slate-800">INE</option>
                    <option value="PASAPORTE" className="bg-slate-800">Pasaporte</option>
                    <option value="LICENCIA" className="bg-slate-800">Licencia</option>
                    <option value="FM2" className="bg-slate-800">FM2</option>
                    <option value="FM3" className="bg-slate-800">FM3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Número de ID *</label>
                  <input
                    type="text"
                    value={numeroID}
                    onChange={(e) => setNumeroID(e.target.value)}
                    placeholder="Número de identificación"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Denominaciones sugeridas */}
        <div>
          <button
            className="flex items-center justify-between w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
            onClick={() => setMostrarDenominaciones(!mostrarDenominaciones)}
          >
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              <span className="text-sm">Desglose a entregar</span>
            </div>
            <ChevronDown className={cn('h-4 w-4 transition-transform', mostrarDenominaciones && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {mostrarDenominaciones && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-2">
                  {denominacionesSugeridas.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💵</span>
                        <span className="text-white/70">${d.valor} x {d.cantidad}</span>
                      </div>
                      <span className="text-white font-mono">${d.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
            onClick={ejecutarOperacion}
            disabled={procesando}
          >
            {procesando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4" />
                Completar Operación
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HISTORIAL DE OPERACIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const HistorialOperaciones = memo(function HistorialOperaciones({
  operaciones,
}: {
  operaciones: OperacionCambio[]
}) {
  const [busqueda, setBusqueda] = useState('')

  const operacionesFiltradas = useMemo(() => {
    if (!busqueda) return operaciones
    const termino = busqueda.toLowerCase()
    return operaciones.filter(
      o => o.folio.toLowerCase().includes(termino) ||
           o.clienteNombre.toLowerCase().includes(termino)
    )
  }, [operaciones, busqueda])

  if (operaciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/50">
        <History className="h-12 w-12 mb-4 opacity-50" />
        <p>No hay operaciones registradas hoy</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por folio o cliente..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50"
        />
      </div>

      {/* Lista */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        {operacionesFiltradas.map((op, index) => (
          <motion.div
            key={op.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-violet-400">{op.folio}</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    op.tipoOperacion === 'compra'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-blue-500/20 text-blue-400'
                  )}>
                    {op.tipoOperacion === 'compra' ? 'COMPRA' : 'VENTA'}
                  </span>
                </div>
                <p className="text-white mt-1">{op.clienteNombre}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/50">{op.fecha}</p>
                <p className="text-xs text-white/50">{op.hora}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-white/60">
                  {DIVISAS_CONFIG[op.divisaEntrega].bandera} {op.montoEntrega.toLocaleString()} {op.divisaEntrega}
                </span>
                <ArrowRight className="h-4 w-4 text-white/30" />
                <span className="text-white font-medium">
                  {DIVISAS_CONFIG[op.divisaRecibe].bandera} {op.montoRecibe.toLocaleString()} {op.divisaRecibe}
                </span>
              </div>
              <span className="text-xs text-emerald-400 font-medium">
                +${op.gananciaOperacion.toFixed(2)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ESTADO DE CAJA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const EstadoCajaPanel = memo(function EstadoCajaPanel({
  cajeroId,
  cajeroNombre,
}: {
  cajeroId: string
  cajeroNombre: string
}) {
  const [estadoCaja, setEstadoCaja] = useState(profitCasaCambioService.getEstadoCaja())
  const [procesando, setProcesando] = useState(false)

  const toggleCaja = async () => {
    setProcesando(true)
    try {
      if (estadoCaja?.estado === 'abierta') {
        const resultado = profitCasaCambioService.cerrarCaja()
        if (resultado.exito) {
          toast.success('Caja cerrada correctamente')
        }
      } else {
        const exito = profitCasaCambioService.abrirCaja(cajeroId, cajeroNombre)
        if (exito) {
          toast.success('Caja abierta correctamente')
        }
      }
      setEstadoCaja(profitCasaCambioService.getEstadoCaja())
    } finally {
      setProcesando(false)
    }
  }

  if (!estadoCaja) return null

  const divisasConSaldo = Object.entries(estadoCaja.saldos)
    .filter(([_, datos]) => datos.monto > 0)

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-xl',
              estadoCaja.estado === 'abierta' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
            )}>
              {estadoCaja.estado === 'abierta' ? (
                <LockOpen className="h-6 w-6 text-emerald-400" />
              ) : (
                <Lock className="h-6 w-6 text-rose-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{estadoCaja.nombre}</h3>
              <p className="text-xs text-white/50">
                {estadoCaja.estado === 'abierta'
                  ? `Operando: ${estadoCaja.cajeroNombre}`
                  : 'Caja cerrada'}
              </p>
            </div>
          </div>
          <button
            className={cn(
              'px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2',
              estadoCaja.estado === 'abierta'
                ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
            )}
            onClick={toggleCaja}
            disabled={procesando}
          >
            {procesando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : estadoCaja.estado === 'abierta' ? (
              <>
                <Lock className="h-4 w-4" />
                Cerrar Caja
              </>
            ) : (
              <>
                <LockOpen className="h-4 w-4" />
                Abrir Caja
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Saldos por divisa */}
        <div>
          <h4 className="text-sm font-medium text-white/70 mb-3">Saldos por Divisa</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {divisasConSaldo.map(([divisa, datos]) => {
              const config = DIVISAS_CONFIG[divisa as DivisaId]
              return (
                <div
                  key={divisa}
                  className="p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{config.bandera}</span>
                    <span className="text-sm text-white/60">{divisa}</span>
                  </div>
                  <p className="text-lg font-bold text-white font-mono">
                    {config.simbolo}{datos.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Métricas del turno */}
        {estadoCaja.estado === 'abierta' && (
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-3">Métricas del Turno</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white/5 text-center">
                <p className="text-2xl font-bold text-white">{estadoCaja.operacionesTurno}</p>
                <p className="text-xs text-white/50">Operaciones</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  ${estadoCaja.comprasTurno.toLocaleString()}
                </p>
                <p className="text-xs text-white/50">Compras</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-center">
                <p className="text-2xl font-bold text-blue-400">
                  ${estadoCaja.ventasTurno.toLocaleString()}
                </p>
                <p className="text-xs text-white/50">Ventas</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-center">
                <p className="text-2xl font-bold text-amber-400">
                  ${estadoCaja.gananciasTurno.toFixed(2)}
                </p>
                <p className="text-xs text-white/50">Ganancia</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const ProfitCasaCambioPanel = memo(function ProfitCasaCambioPanel({
  cajeroId = 'user_demo',
  cajeroNombre = 'Cajero Demo',
  className,
}: ProfitCasaCambioPanelProps) {
  const [tabActiva, setTabActiva] = useState<PanelTab>('cotizar')
  const [tiposCambio, setTiposCambio] = useState<TipoCambioConfig[]>([])
  const [cotizacionActiva, setCotizacionActiva] = useState<Cotizacion | null>(null)
  const [operaciones, setOperaciones] = useState<OperacionCambio[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    setTiposCambio(profitCasaCambioService.getTiposCambio())
    setOperaciones(profitCasaCambioService.getOperaciones())
  }, [])

  const actualizarTipoCambio = useCallback((id: string, compra: number, venta: number) => {
    profitCasaCambioService.actualizarTipoCambio(id, compra, venta)
    setTiposCambio(profitCasaCambioService.getTiposCambio())
    toast.success('Tipo de cambio actualizado')
  }, [])

  const handleCotizacionLista = useCallback((cotizacion: Cotizacion) => {
    setCotizacionActiva(cotizacion)
  }, [])

  const handleOperacionCompletada = useCallback((operacion: OperacionCambio) => {
    setCotizacionActiva(null)
    setOperaciones(profitCasaCambioService.getOperaciones())
  }, [])

  const tabs: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
    { id: 'cotizar', label: 'Cotizar', icon: <Calculator className="h-4 w-4" /> },
    { id: 'compras', label: 'Compras/Ventas', icon: <ShoppingCart className="h-4 w-4" /> },
    { id: 'rentabilidad', label: 'Rentabilidad', icon: <PiggyBank className="h-4 w-4" /> },
    { id: 'operaciones', label: 'Historial', icon: <History className="h-4 w-4" /> },
    { id: 'caja', label: 'Caja', icon: <Wallet className="h-4 w-4" /> },
    { id: 'clientes', label: 'Clientes', icon: <User className="h-4 w-4" /> },
    { id: 'reportes', label: 'Reportes', icon: <FileText className="h-4 w-4" /> },
    { id: 'dashboard', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'config', label: 'Config', icon: <Settings className="h-4 w-4" /> },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
            <Landmark className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Casa de Cambio
              <span className="text-emerald-400">PROFIT</span>
            </h1>
            <p className="text-sm text-white/50">Sistema integral de operaciones cambiarias</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tabActiva === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
              onClick={() => setTabActiva(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pizarra de tipos de cambio - siempre visible */}
      <PizarraTiposCambio
        tiposCambio={tiposCambio}
        onActualizar={actualizarTipoCambio}
      />

      {/* Contenido según tab */}
      <AnimatePresence mode="wait">
        {tabActiva === 'cotizar' && (
          <motion.div
            key="cotizar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Cotizador o Formulario de operación */}
            {cotizacionActiva ? (
              <FormularioOperacion
                cotizacion={cotizacionActiva}
                cajeroId={cajeroId}
                cajeroNombre={cajeroNombre}
                onCompletar={handleOperacionCompletada}
                onCancelar={() => setCotizacionActiva(null)}
              />
            ) : (
              <CotizadorInteligente onCotizacionLista={handleCotizacionLista} />
            )}

            {/* Últimas operaciones */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5 text-violet-400" />
                <h3 className="text-lg font-semibold text-white">Operaciones de Hoy</h3>
              </div>
              <HistorialOperaciones operaciones={operaciones.slice(0, 10)} />
            </div>
          </motion.div>
        )}

        {tabActiva === 'operaciones' && (
          <motion.div
            key="operaciones"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Historial Completo</h3>
            <HistorialOperaciones operaciones={operaciones} />
          </motion.div>
        )}

        {tabActiva === 'caja' && (
          <motion.div
            key="caja"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <EstadoCajaPanel cajeroId={cajeroId} cajeroNombre={cajeroNombre} />
          </motion.div>
        )}

        {tabActiva === 'reportes' && (
          <motion.div
            key="reportes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
          >
            <div className="flex flex-col items-center justify-center py-12 text-white/50">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Reportes en construcción</p>
              <p className="text-sm">Próximamente: Reportes CNBV, análisis de operaciones, y más</p>
            </div>
          </motion.div>
        )}

        {tabActiva === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProfitDashboardAnalytics />
          </motion.div>
        )}

        {tabActiva === 'compras' && (
          <motion.div
            key="compras"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProfitComprasVentasPanel cajeroId={cajeroId} cajeroNombre={cajeroNombre} />
          </motion.div>
        )}

        {tabActiva === 'rentabilidad' && (
          <motion.div
            key="rentabilidad"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProfitCalculadoraRentabilidad />
          </motion.div>
        )}

        {tabActiva === 'clientes' && (
          <motion.div
            key="clientes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProfitClientesPanel />
          </motion.div>
        )}

        {tabActiva === 'config' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProfitConfiguracionPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

export default ProfitCasaCambioPanel
