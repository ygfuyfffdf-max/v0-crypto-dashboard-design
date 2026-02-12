/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ⚙️ PROFIT CASA DE CAMBIO — CONFIGURACIÓN EDITABLE COMPLETA
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel para configurar y probar toda la lógica de negocio:
 * - Tipos de cambio (competencia, costo, venta)
 * - Comisiones por método de pago
 * - Descuentos por volumen
 * - Tarjetas negras
 * - Simulador de escenarios
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { motion } from 'motion/react'
import { memo, useCallback, useEffect, useState } from 'react'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Gift,
  Percent,
  Save,
  Settings,
  Sparkles,
  TrendingUp,
  Undo,
  Wallet,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS DE CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface ConfigTipoCambio {
  divisa: string
  bandera: string
  competencia: number      // Precio en otras casas
  nuestroCosto: number     // Lo que nos cuesta
  ventaBase: number        // Nuestro precio base
}

export interface ConfigMetodoPago {
  id: string
  nombre: string
  icono: string
  comisionPorcentaje: number
  comisionFija: number
  generaHistorial: boolean
  requiereId: boolean
  montoRequiereId: number
  activo: boolean
  // Específico tarjeta negra
  esTarjetaNegra?: boolean
  comisionPrimeraEmision?: number
  comisionRecarga?: number
}

export interface ConfigDescuentoVolumen {
  id: string
  montoMinimo: number
  montoMaximo: number
  descuentoCentavos: number
  activo: boolean
}

export interface ConfigGeneral {
  nombreNegocio: string
  montoMaximoDiarioCliente: number
  montoReporteSAT: number
  montoRequiereIdDefault: number
  margenMinimoRentabilidad: number
}

interface ConfiguracionCompleta {
  general: ConfigGeneral
  tiposCambio: ConfigTipoCambio[]
  metodosPago: ConfigMetodoPago[]
  descuentosVolumen: ConfigDescuentoVolumen[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEFAULT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const CONFIG_DEFAULT: ConfiguracionCompleta = {
  general: {
    nombreNegocio: 'PROFIT Casa de Cambio',
    montoMaximoDiarioCliente: 50000,
    montoReporteSAT: 10000,
    montoRequiereIdDefault: 3000,
    margenMinimoRentabilidad: 1.5,
  },
  tiposCambio: [
    { divisa: 'USD', bandera: '🇺🇸', competencia: 17.50, nuestroCosto: 17.20, ventaBase: 17.50 },
    { divisa: 'EUR', bandera: '🇪🇺', competencia: 19.00, nuestroCosto: 18.60, ventaBase: 19.00 },
    { divisa: 'CAD', bandera: '🇨🇦', competencia: 12.80, nuestroCosto: 12.50, ventaBase: 12.80 },
    { divisa: 'GBP', bandera: '🇬🇧', competencia: 22.00, nuestroCosto: 21.50, ventaBase: 22.00 },
    { divisa: 'USDT', bandera: '💎', competencia: 17.45, nuestroCosto: 17.15, ventaBase: 17.45 },
  ],
  metodosPago: [
    {
      id: 'efectivo',
      nombre: 'Efectivo',
      icono: '💵',
      comisionPorcentaje: 0,
      comisionFija: 0,
      generaHistorial: true,
      requiereId: true,
      montoRequiereId: 3000,
      activo: true,
    },
    {
      id: 'transferencia',
      nombre: 'Transferencia Bancaria',
      icono: '🏦',
      comisionPorcentaje: 3,
      comisionFija: 0,
      generaHistorial: true,
      requiereId: true,
      montoRequiereId: 3000,
      activo: true,
    },
    {
      id: 'cripto',
      nombre: 'Criptomoneda',
      icono: '₿',
      comisionPorcentaje: 1.5,
      comisionFija: 0,
      generaHistorial: false,
      requiereId: false,
      montoRequiereId: 10000,
      activo: true,
    },
    {
      id: 'tarjeta_negra',
      nombre: 'Tarjeta Negra',
      icono: '💳',
      comisionPorcentaje: 8,
      comisionFija: 0,
      generaHistorial: false,
      requiereId: false,
      montoRequiereId: 0,
      activo: true,
      esTarjetaNegra: true,
      comisionPrimeraEmision: 8,
      comisionRecarga: 3,
    },
  ],
  descuentosVolumen: [
    { id: 'tier_0', montoMinimo: 0, montoMaximo: 9999, descuentoCentavos: 0, activo: true },
    { id: 'tier_1', montoMinimo: 10000, montoMaximo: 24999, descuentoCentavos: 5, activo: true },
    { id: 'tier_2', montoMinimo: 25000, montoMaximo: 49999, descuentoCentavos: 10, activo: true },
    { id: 'tier_3', montoMinimo: 50000, montoMaximo: 99999, descuentoCentavos: 15, activo: true },
    { id: 'tier_4', montoMinimo: 100000, montoMaximo: 999999999, descuentoCentavos: 20, activo: true },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK PARA PERSISTIR CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function useConfiguracion() {
  const [config, setConfig] = useState<ConfiguracionCompleta>(CONFIG_DEFAULT)
  const [hasChanges, setHasChanges] = useState(false)

  // Cargar de localStorage al inicio
  useEffect(() => {
    const saved = localStorage.getItem('profit_config')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setConfig({ ...CONFIG_DEFAULT, ...parsed })
      } catch {
        console.error('Error parsing saved config')
      }
    }
  }, [])

  // Guardar
  const guardar = useCallback(() => {
    localStorage.setItem('profit_config', JSON.stringify(config))
    setHasChanges(false)
    toast.success('Configuración guardada')
  }, [config])

  // Resetear
  const resetear = useCallback(() => {
    setConfig(CONFIG_DEFAULT)
    localStorage.removeItem('profit_config')
    setHasChanges(false)
    toast.info('Configuración reseteada a valores default')
  }, [])

  // Actualizar
  const actualizar = useCallback(<K extends keyof ConfiguracionCompleta>(
    seccion: K,
    valor: ConfiguracionCompleta[K]
  ) => {
    setConfig(prev => ({ ...prev, [seccion]: valor }))
    setHasChanges(true)
  }, [])

  return { config, hasChanges, guardar, resetear, actualizar }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: EDITOR DE TIPO DE CAMBIO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const EditorTipoCambio = memo(function EditorTipoCambio({
  tc,
  onChange,
}: {
  tc: ConfigTipoCambio
  onChange: (tc: ConfigTipoCambio) => void
}) {
  const spread = tc.ventaBase - tc.nuestroCosto
  const spreadPct = (spread / tc.nuestroCosto) * 100

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{tc.bandera}</span>
          <span className="text-lg font-bold text-white">{tc.divisa}</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/50">Spread/Ganancia</p>
          <p className={cn(
            'text-lg font-bold',
            spreadPct >= 2 ? 'text-emerald-400' : spreadPct >= 1 ? 'text-amber-400' : 'text-red-400'
          )}>
            ${spread.toFixed(2)} ({spreadPct.toFixed(1)}%)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-white/50 mb-1 block">Competencia</label>
          <input
            type="number"
            value={tc.competencia}
            onChange={(e) => onChange({ ...tc, competencia: parseFloat(e.target.value) || 0 })}
            step="0.01"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-center focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Nuestro Costo</label>
          <input
            type="number"
            value={tc.nuestroCosto}
            onChange={(e) => onChange({ ...tc, nuestroCosto: parseFloat(e.target.value) || 0 })}
            step="0.01"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-center focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Precio Venta</label>
          <input
            type="number"
            value={tc.ventaBase}
            onChange={(e) => onChange({ ...tc, ventaBase: parseFloat(e.target.value) || 0 })}
            step="0.01"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-violet-500/50 text-violet-400 font-mono text-center font-bold focus:border-violet-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Sugerencias */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onChange({ ...tc, ventaBase: tc.competencia })}
          className="flex-1 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs hover:bg-blue-500/20 transition-colors"
        >
          = Competencia
        </button>
        <button
          onClick={() => onChange({ ...tc, ventaBase: tc.competencia - 0.05 })}
          className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-colors"
        >
          -5¢ vs Comp.
        </button>
        <button
          onClick={() => onChange({ ...tc, ventaBase: tc.nuestroCosto * 1.02 })}
          className="flex-1 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs hover:bg-amber-500/20 transition-colors"
        >
          +2% Costo
        </button>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: EDITOR DE MÉTODO DE PAGO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const EditorMetodoPago = memo(function EditorMetodoPago({
  metodo,
  onChange,
}: {
  metodo: ConfigMetodoPago
  onChange: (m: ConfigMetodoPago) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={cn(
      'rounded-xl border transition-all',
      metodo.activo ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-60'
    )}>
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{metodo.icono}</span>
          <div>
            <p className="font-medium text-white">{metodo.nombre}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className={cn(
                'px-2 py-0.5 rounded-full',
                metodo.comisionPorcentaje === 0
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-amber-500/20 text-amber-400'
              )}>
                {metodo.comisionPorcentaje === 0 ? 'Sin comisión' : `+${metodo.comisionPorcentaje}%`}
              </span>
              {!metodo.generaHistorial && (
                <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">
                  Sin historial
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onChange({ ...metodo, activo: !metodo.activo }) }}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
              metodo.activo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            )}
          >
            {metodo.activo ? 'Activo' : 'Inactivo'}
          </button>
          {expanded ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Comisión %</label>
              <input
                type="number"
                value={metodo.comisionPorcentaje}
                onChange={(e) => onChange({ ...metodo, comisionPorcentaje: parseFloat(e.target.value) || 0 })}
                step="0.5"
                min="0"
                max="100"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Comisión Fija $</label>
              <input
                type="number"
                value={metodo.comisionFija}
                onChange={(e) => onChange({ ...metodo, comisionFija: parseFloat(e.target.value) || 0 })}
                step="10"
                min="0"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {metodo.esTarjetaNegra && (
            <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div>
                <label className="text-xs text-amber-400 mb-1 block">Primera Emisión %</label>
                <input
                  type="number"
                  value={metodo.comisionPrimeraEmision ?? 8}
                  onChange={(e) => onChange({ ...metodo, comisionPrimeraEmision: parseFloat(e.target.value) || 0 })}
                  step="0.5"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-amber-500/30 text-amber-400 font-mono font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-green-400 mb-1 block">Recargas %</label>
                <input
                  type="number"
                  value={metodo.comisionRecarga ?? 3}
                  onChange={(e) => onChange({ ...metodo, comisionRecarga: parseFloat(e.target.value) || 0 })}
                  step="0.5"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-green-500/30 text-green-400 font-mono font-bold focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={metodo.generaHistorial}
                onChange={(e) => onChange({ ...metodo, generaHistorial: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm text-white/70">Genera historial fiscal</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={metodo.requiereId}
                onChange={(e) => onChange({ ...metodo, requiereId: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-white/70">Requiere ID</span>
            </label>
          </div>

          {metodo.requiereId && (
            <div>
              <label className="text-xs text-white/50 mb-1 block">Monto mínimo para requerir ID (USD)</label>
              <input
                type="number"
                value={metodo.montoRequiereId}
                onChange={(e) => onChange({ ...metodo, montoRequiereId: parseFloat(e.target.value) || 0 })}
                step="500"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: EDITOR DE DESCUENTOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const EditorDescuentos = memo(function EditorDescuentos({
  descuentos,
  onChange,
}: {
  descuentos: ConfigDescuentoVolumen[]
  onChange: (d: ConfigDescuentoVolumen[]) => void
}) {
  const actualizarDescuento = useCallback(
    (index: number, field: keyof ConfigDescuentoVolumen, value: number | boolean) => {
      const nuevos = descuentos.map((d, i) => {
        if (i !== index) return d
        return { ...d, [field]: value } as ConfigDescuentoVolumen
      })
      onChange(nuevos)
    },
    [descuentos, onChange]
  )

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-2 px-2 text-xs text-white/50">
        <div className="col-span-3">Desde USD</div>
        <div className="col-span-3">Hasta USD</div>
        <div className="col-span-3">Descuento ¢</div>
        <div className="col-span-2">En MXN</div>
        <div className="col-span-1">Act.</div>
      </div>

      {descuentos.map((d, i) => (
        <div
          key={d.id}
          className={cn(
            'grid grid-cols-12 gap-2 p-2 rounded-lg items-center',
            d.activo ? 'bg-white/5' : 'bg-white/[0.02] opacity-50'
          )}
        >
          <div className="col-span-3">
            <input
              type="number"
              value={d.montoMinimo}
              onChange={(e) => actualizarDescuento(i, 'montoMinimo', parseFloat(e.target.value) || 0)}
              step="1000"
              className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div className="col-span-3">
            <input
              type="number"
              value={d.montoMaximo >= 999999999 ? 999999 : d.montoMaximo}
              onChange={(e) => actualizarDescuento(i, 'montoMaximo', parseFloat(e.target.value) || 0)}
              step="1000"
              className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-violet-500 focus:outline-none"
              placeholder="∞"
            />
          </div>
          <div className="col-span-3">
            <input
              type="number"
              value={d.descuentoCentavos}
              onChange={(e) => actualizarDescuento(i, 'descuentoCentavos', parseFloat(e.target.value) || 0)}
              step="1"
              min="0"
              className={cn(
                'w-full px-2 py-1.5 rounded border font-mono text-sm text-center focus:outline-none',
                d.descuentoCentavos > 0
                  ? 'bg-green-500/10 border-green-500/30 text-green-400 focus:border-green-500'
                  : 'bg-white/5 border-white/10 text-white/50'
              )}
            />
          </div>
          <div className="col-span-2 text-center">
            <span className={cn(
              'font-mono text-sm',
              d.descuentoCentavos > 0 ? 'text-green-400' : 'text-white/30'
            )}>
              -$0.{String(d.descuentoCentavos).padStart(2, '0')}
            </span>
          </div>
          <div className="col-span-1 flex justify-center">
            <button
              onClick={() => actualizarDescuento(i, 'activo', !d.activo)}
              className={cn(
                'w-6 h-6 rounded flex items-center justify-center transition-colors',
                d.activo ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/30'
              )}
            >
              {d.activo && <Check className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SIMULADOR DE OPERACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const SimuladorOperacion = memo(function SimuladorOperacion({
  config,
}: {
  config: ConfiguracionCompleta
}) {
  const [divisa, setDivisa] = useState('USD')
  const [monto, setMonto] = useState(1000)
  const [metodo, setMetodo] = useState('efectivo')
  const [esRecarga, setEsRecarga] = useState(false)

  // Calcular operación
  const tc = config.tiposCambio.find(t => t.divisa === divisa)
  const metodoPago = config.metodosPago.find(m => m.id === metodo)
  const descuento = config.descuentosVolumen.find(d => d.activo && monto >= d.montoMinimo && monto <= d.montoMaximo)

  if (!tc || !metodoPago) return null

  // Ajustar tipo de cambio por descuento volumen
  let tcAjustado = tc.ventaBase
  if (descuento && descuento.descuentoCentavos > 0) {
    tcAjustado -= descuento.descuentoCentavos / 100
  }

  // Comisión del método
  let comisionPct = metodoPago.comisionPorcentaje
  if (metodoPago.esTarjetaNegra) {
    comisionPct = esRecarga ? (metodoPago.comisionRecarga ?? 3) : (metodoPago.comisionPrimeraEmision ?? 8)
  }

  const montoBase = monto * tcAjustado
  const comisionMonto = (montoBase * comisionPct / 100) + metodoPago.comisionFija
  const totalCliente = montoBase + comisionMonto

  // Ganancia
  const costoTotal = monto * tc.nuestroCosto
  const gananciaSpread = (tcAjustado - tc.nuestroCosto) * monto
  const gananciaComision = comisionMonto
  const gananciaTotal = gananciaSpread + gananciaComision
  const rentabilidad = (gananciaTotal / costoTotal) * 100

  return (
    <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-900/20 to-purple-900/20 p-5">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-violet-400" />
        Simulador de Operación
      </h3>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-xs text-white/50 mb-1 block">Divisa</label>
          <select
            value={divisa}
            onChange={(e) => setDivisa(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:outline-none"
          >
            {config.tiposCambio.map(t => (
              <option key={t.divisa} value={t.divisa} className="bg-gray-900">
                {t.bandera} {t.divisa}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Monto</label>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
            step="100"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:border-violet-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Método</label>
          <select
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:outline-none"
          >
            {config.metodosPago.filter(m => m.activo).map(m => (
              <option key={m.id} value={m.id} className="bg-gray-900">
                {m.icono} {m.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {metodoPago.esTarjetaNegra && (
        <div className="mb-4 flex gap-3">
          <button
            onClick={() => setEsRecarga(false)}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
              !esRecarga ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-white/50'
            )}
          >
            Primera emisión ({metodoPago.comisionPrimeraEmision}%)
          </button>
          <button
            onClick={() => setEsRecarga(true)}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
              esRecarga ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-white/50'
            )}
          >
            Recarga ({metodoPago.comisionRecarga}%)
          </button>
        </div>
      )}

      {/* Resultados */}
      <div className="space-y-2 p-4 rounded-lg bg-black/20 border border-white/10">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">TC Base:</span>
          <span className="text-white font-mono">${tc.ventaBase.toFixed(2)}</span>
        </div>
        {descuento && descuento.descuentoCentavos > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-400">Desc. volumen:</span>
            <span className="text-green-400 font-mono">-$0.{String(descuento.descuentoCentavos).padStart(2, '0')}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-white/60">TC Ajustado:</span>
          <span className="text-white font-mono font-bold">${tcAjustado.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Monto base:</span>
          <span className="text-white font-mono">${montoBase.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-amber-400">Comisión ({comisionPct}%):</span>
          <span className="text-amber-400 font-mono">+${comisionMonto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-lg pt-2 border-t border-white/10">
          <span className="text-white font-medium">Total cliente:</span>
          <span className="text-violet-400 font-mono font-bold">${totalCliente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Rentabilidad */}
      <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-white/50">Costo</p>
            <p className="text-white font-mono">${costoTotal.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">Gan. Spread</p>
            <p className="text-emerald-400 font-mono">${gananciaSpread.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">Gan. Comisión</p>
            <p className="text-amber-400 font-mono">${gananciaComision.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">Rentabilidad</p>
            <p className={cn(
              'text-xl font-bold',
              rentabilidad >= 5 ? 'text-emerald-400' : rentabilidad >= 2 ? 'text-amber-400' : 'text-red-400'
            )}>
              {rentabilidad.toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-emerald-500/20 text-center">
          <span className="text-white/60">Ganancia Total: </span>
          <span className="text-2xl font-bold text-emerald-400">
            ${gananciaTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </span>
        </div>
      </div>

      {/* Alertas */}
      <div className="mt-4 space-y-2 text-sm">
        {!metodoPago.generaHistorial && (
          <div className="flex items-center gap-2 text-violet-400">
            <AlertTriangle className="h-4 w-4" />
            Esta operación NO genera historial fiscal
          </div>
        )}
        {metodoPago.requiereId && monto >= metodoPago.montoRequiereId && (
          <div className="flex items-center gap-2 text-blue-400">
            <AlertTriangle className="h-4 w-4" />
            Requiere identificación oficial
          </div>
        )}
        {monto >= config.general.montoReporteSAT && metodoPago.generaHistorial && (
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            Requiere reporte SAT (&gt;${config.general.montoReporteSAT.toLocaleString()})
          </div>
        )}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ProfitConfiguracionPanel = memo(function ProfitConfiguracionPanel({
  className,
}: { className?: string }) {
  const { config, hasChanges, guardar, resetear, actualizar } = useConfiguracion()
  const [seccionActiva, setSeccionActiva] = useState<'tipos' | 'metodos' | 'descuentos' | 'general'>('tipos')

  const secciones = [
    { id: 'tipos', label: 'Tipos de Cambio', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'metodos', label: 'Métodos de Pago', icon: <Wallet className="h-4 w-4" /> },
    { id: 'descuentos', label: 'Descuentos Volumen', icon: <Gift className="h-4 w-4" /> },
    { id: 'general', label: 'General', icon: <Settings className="h-4 w-4" /> },
  ] as const

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="h-7 w-7 text-violet-400" />
            Configuración del Negocio
          </h2>
          <p className="text-sm text-white/50 mt-1">
            Ajusta y prueba la lógica de negocio en tiempo real
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm">
              Sin guardar
            </span>
          )}
          <button
            onClick={resetear}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Undo className="h-4 w-4" />
            Reset
          </button>
          <button
            onClick={guardar}
            disabled={!hasChanges}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors',
              hasChanges
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            )}
          >
            <Save className="h-4 w-4" />
            Guardar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo: Configuración */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
            {secciones.map(s => (
              <button
                key={s.id}
                onClick={() => setSeccionActiva(s.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all',
                  seccionActiva === s.id
                    ? 'bg-violet-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>

          {/* Contenido de sección */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
            {seccionActiva === 'tipos' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  Tipos de Cambio por Divisa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.tiposCambio.map((tc, i) => (
                    <EditorTipoCambio
                      key={tc.divisa}
                      tc={tc}
                      onChange={(nuevoTc) => {
                        const nuevos = [...config.tiposCambio]
                        nuevos[i] = nuevoTc
                        actualizar('tiposCambio', nuevos)
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {seccionActiva === 'metodos' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Percent className="h-5 w-5 text-amber-400" />
                  Comisiones por Método de Pago
                </h3>
                <div className="space-y-3">
                  {config.metodosPago.map((m, i) => (
                    <EditorMetodoPago
                      key={m.id}
                      metodo={m}
                      onChange={(nuevoMetodo) => {
                        const nuevos = [...config.metodosPago]
                        nuevos[i] = nuevoMetodo
                        actualizar('metodosPago', nuevos)
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {seccionActiva === 'descuentos' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Gift className="h-5 w-5 text-green-400" />
                  Descuentos por Volumen
                </h3>
                <EditorDescuentos
                  descuentos={config.descuentosVolumen}
                  onChange={(nuevos) => actualizar('descuentosVolumen', nuevos)}
                />
              </div>
            )}

            {seccionActiva === 'general' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-violet-400" />
                  Configuración General
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Nombre del negocio</label>
                    <input
                      type="text"
                      value={config.general.nombreNegocio}
                      onChange={(e) => actualizar('general', { ...config.general, nombreNegocio: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Máximo diario/cliente (USD)</label>
                    <input
                      type="number"
                      value={config.general.montoMaximoDiarioCliente}
                      onChange={(e) => actualizar('general', { ...config.general, montoMaximoDiarioCliente: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Monto reporte SAT (USD)</label>
                    <input
                      type="number"
                      value={config.general.montoReporteSAT}
                      onChange={(e) => actualizar('general', { ...config.general, montoReporteSAT: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Rentabilidad mínima deseada %</label>
                    <input
                      type="number"
                      value={config.general.margenMinimoRentabilidad}
                      onChange={(e) => actualizar('general', { ...config.general, margenMinimoRentabilidad: parseFloat(e.target.value) || 0 })}
                      step="0.5"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho: Simulador */}
        <div>
          <SimuladorOperacion config={config} />
        </div>
      </div>
    </div>
  )
})

export default ProfitConfiguracionPanel
export { CONFIG_DEFAULT, useConfiguracion }
export type { ConfiguracionCompleta }
