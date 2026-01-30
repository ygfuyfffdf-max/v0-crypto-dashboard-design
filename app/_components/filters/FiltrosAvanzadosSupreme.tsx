/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎯 FILTROS AVANZADOS SUPREME — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de filtros ultra-avanzados con:
 * - Filtro por fecha con presets y rango personalizado
 * - Filtros por categoría, estado, tipo
 * - Filtros por monto (rango)
 * - Búsqueda global inteligente
 * - Guardar filtros favoritos
 * - Chips de filtros activos
 * - Reset individual y global
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useMemo, useState } from 'react'
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Filter,
  Heart,
  Layers,
  MoreHorizontal,
  RotateCcw,
  Save,
  Search,
  Settings,
  Sliders,
  Star,
  Tag,
  TrendingDown,
  TrendingUp,
  User,
  X,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type PeriodoPreset = 'hoy' | 'ayer' | 'semana' | 'mes' | 'trimestre' | 'año' | 'todo' | 'personalizado'

export interface RangoFecha {
  desde: Date | null
  hasta: Date | null
}

export interface RangoMonto {
  min: number | null
  max: number | null
}

export interface OpcionFiltro {
  id: string
  label: string
  color?: string
  icono?: React.ReactNode
  cantidad?: number
}

export interface ConfiguracionFiltro {
  id: string
  tipo: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'numberrange' | 'search'
  label: string
  placeholder?: string
  opciones?: OpcionFiltro[]
  icono?: React.ReactNode
}

export interface FiltrosActivos {
  busqueda: string
  periodo: PeriodoPreset
  rangoFecha: RangoFecha
  categorias: string[]
  estados: string[]
  tipos: string[]
  bancos: string[]
  usuarios: string[]
  rangoMonto: RangoMonto
  [key: string]: unknown
}

export interface FiltroGuardado {
  id: string
  nombre: string
  filtros: Partial<FiltrosActivos>
  createdAt: number
  esFavorito: boolean
}

interface FiltrosAvanzadosProps {
  configuracion: ConfiguracionFiltro[]
  filtrosActivos: FiltrosActivos
  filtrosGuardados?: FiltroGuardado[]

  // Callbacks
  onFiltrosChange: (filtros: FiltrosActivos) => void
  onGuardarFiltro?: (nombre: string, filtros: Partial<FiltrosActivos>) => void
  onCargarFiltro?: (filtro: FiltroGuardado) => void
  onEliminarFiltro?: (id: string) => void
  onLimpiar: () => void

  // Estados
  loading?: boolean
  compacto?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const PERIODOS_PRESET: { id: PeriodoPreset; label: string; icono: React.ReactNode }[] = [
  { id: 'hoy', label: 'Hoy', icono: <Clock className="h-4 w-4" /> },
  { id: 'ayer', label: 'Ayer', icono: <Calendar className="h-4 w-4" /> },
  { id: 'semana', label: 'Esta Semana', icono: <CalendarDays className="h-4 w-4" /> },
  { id: 'mes', label: 'Este Mes', icono: <CalendarRange className="h-4 w-4" /> },
  { id: 'trimestre', label: 'Trimestre', icono: <Layers className="h-4 w-4" /> },
  { id: 'año', label: 'Este Año', icono: <Star className="h-4 w-4" /> },
  { id: 'todo', label: 'Todo', icono: <MoreHorizontal className="h-4 w-4" /> },
]

const FILTROS_INICIALES: FiltrosActivos = {
  busqueda: '',
  periodo: 'mes',
  rangoFecha: { desde: null, hasta: null },
  categorias: [],
  estados: [],
  tipos: [],
  bancos: [],
  usuarios: [],
  rangoMonto: { min: null, max: null },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Chip de filtro activo
const FiltroChip = memo(function FiltroChip({
  label,
  valor,
  color = '#8B5CF6',
  onRemove,
}: {
  label: string
  valor: string
  color?: string
  onRemove: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border"
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}30`,
        color,
      }}
    >
      <span className="text-white/60">{label}:</span>
      <span>{valor}</span>
      <button
        className="ml-1 p-0.5 rounded hover:bg-white/10 transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
      >
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  )
})

// Selector de período
const PeriodoSelector = memo(function PeriodoSelector({
  valor,
  onChange,
}: {
  valor: PeriodoPreset
  onChange: (periodo: PeriodoPreset) => void
}) {
  const [abierto, setAbierto] = useState(false)
  const seleccionado = PERIODOS_PRESET.find((p) => p.id === valor)

  return (
    <div className="relative">
      <button
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all',
          'border-white/10 bg-white/5 hover:bg-white/8',
          abierto && 'border-violet-500/50 bg-violet-500/10'
        )}
        onClick={() => setAbierto(!abierto)}
      >
        {seleccionado?.icono}
        <span className="text-sm text-white">{seleccionado?.label}</span>
        <ChevronDown className={cn('h-4 w-4 text-white/50 transition-transform', abierto && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-48 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-xl overflow-hidden"
          >
            {PERIODOS_PRESET.map((periodo) => (
              <button
                key={periodo.id}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-left text-sm transition-colors',
                  valor === periodo.id
                    ? 'bg-violet-500/10 text-violet-400'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                )}
                onClick={() => {
                  onChange(periodo.id)
                  setAbierto(false)
                }}
              >
                {periodo.icono}
                {periodo.label}
                {valor === periodo.id && <Check className="h-4 w-4 ml-auto" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// Multi-select dropdown
const MultiSelectDropdown = memo(function MultiSelectDropdown({
  label,
  opciones,
  seleccionados,
  onChange,
  icono,
}: {
  label: string
  opciones: OpcionFiltro[]
  seleccionados: string[]
  onChange: (seleccionados: string[]) => void
  icono?: React.ReactNode
}) {
  const [abierto, setAbierto] = useState(false)

  const toggleOpcion = useCallback(
    (id: string) => {
      if (seleccionados.includes(id)) {
        onChange(seleccionados.filter((s) => s !== id))
      } else {
        onChange([...seleccionados, id])
      }
    },
    [seleccionados, onChange]
  )

  return (
    <div className="relative">
      <button
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all min-w-[120px]',
          'border-white/10 bg-white/5 hover:bg-white/8',
          seleccionados.length > 0 && 'border-violet-500/30 bg-violet-500/10',
          abierto && 'border-violet-500/50'
        )}
        onClick={() => setAbierto(!abierto)}
      >
        {icono || <Filter className="h-4 w-4 text-white/50" />}
        <span className="text-sm text-white">{label}</span>
        {seleccionados.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-violet-500 text-white text-xs">
            {seleccionados.length}
          </span>
        )}
        <ChevronDown className={cn('h-4 w-4 text-white/50 transition-transform ml-auto', abierto && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-56 max-h-[300px] overflow-y-auto rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-xl"
          >
            <div className="p-2 border-b border-white/10">
              <button
                className="text-xs text-violet-400 hover:underline"
                onClick={() => onChange([])}
              >
                Limpiar selección
              </button>
            </div>
            {opciones.map((opcion) => {
              const isSelected = seleccionados.includes(opcion.id)
              return (
                <button
                  key={opcion.id}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2 text-left text-sm transition-colors',
                    isSelected
                      ? 'bg-violet-500/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                  onClick={() => toggleOpcion(opcion.id)}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center',
                      isSelected ? 'bg-violet-500 border-violet-500' : 'border-white/30'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  {opcion.icono}
                  <span className="flex-1">{opcion.label}</span>
                  {opcion.cantidad !== undefined && (
                    <span className="text-xs text-white/40">({opcion.cantidad})</span>
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// Rango de monto
const RangoMontoInput = memo(function RangoMontoInput({
  valor,
  onChange,
}: {
  valor: RangoMonto
  onChange: (rango: RangoMonto) => void
}) {
  const [abierto, setAbierto] = useState(false)
  const [tempMin, setTempMin] = useState(valor.min?.toString() || '')
  const [tempMax, setTempMax] = useState(valor.max?.toString() || '')

  const aplicar = useCallback(() => {
    onChange({
      min: tempMin ? parseFloat(tempMin) : null,
      max: tempMax ? parseFloat(tempMax) : null,
    })
    setAbierto(false)
  }, [tempMin, tempMax, onChange])

  const tieneValor = valor.min !== null || valor.max !== null

  return (
    <div className="relative">
      <button
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all',
          'border-white/10 bg-white/5 hover:bg-white/8',
          tieneValor && 'border-emerald-500/30 bg-emerald-500/10',
          abierto && 'border-violet-500/50'
        )}
        onClick={() => setAbierto(!abierto)}
      >
        <DollarSign className="h-4 w-4 text-white/50" />
        <span className="text-sm text-white">
          {tieneValor
            ? `${valor.min ? formatCurrency(valor.min) : 'Min'} - ${valor.max ? formatCurrency(valor.max) : 'Max'}`
            : 'Monto'}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-white/50 transition-transform', abierto && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-64 p-4 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-xl"
          >
            <p className="text-sm text-white/60 mb-3">Rango de monto</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Mínimo</label>
                <input
                  type="number"
                  value={tempMin}
                  onChange={(e) => setTempMin(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Máximo</label>
                <input
                  type="number"
                  value={tempMax}
                  onChange={(e) => setTempMax(e.target.value)}
                  placeholder="∞"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <button
                className="text-xs text-white/50 hover:text-white"
                onClick={() => {
                  setTempMin('')
                  setTempMax('')
                  onChange({ min: null, max: null })
                }}
              >
                Limpiar
              </button>
              <button
                className="px-3 py-1.5 rounded-lg bg-violet-500 text-white text-sm hover:bg-violet-600"
                onClick={aplicar}
              >
                Aplicar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// Rango de fecha
const RangoFechaInput = memo(function RangoFechaInput({
  valor,
  onChange,
}: {
  valor: RangoFecha
  onChange: (rango: RangoFecha) => void
}) {
  const tieneValor = valor.desde !== null || valor.hasta !== null

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={valor.desde ? valor.desde.toISOString().split('T')[0] : ''}
        onChange={(e) =>
          onChange({ ...valor, desde: e.target.value ? new Date(e.target.value) : null })
        }
        className={cn(
          'px-3 py-2 rounded-xl border text-sm transition-all',
          'border-white/10 bg-white/5 text-white',
          tieneValor && 'border-blue-500/30 bg-blue-500/10'
        )}
      />
      <span className="text-white/40">-</span>
      <input
        type="date"
        value={valor.hasta ? valor.hasta.toISOString().split('T')[0] : ''}
        onChange={(e) =>
          onChange({ ...valor, hasta: e.target.value ? new Date(e.target.value) : null })
        }
        className={cn(
          'px-3 py-2 rounded-xl border text-sm transition-all',
          'border-white/10 bg-white/5 text-white',
          tieneValor && 'border-blue-500/30 bg-blue-500/10'
        )}
      />
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const FiltrosAvanzados = memo(function FiltrosAvanzados({
  configuracion,
  filtrosActivos,
  filtrosGuardados = [],
  onFiltrosChange,
  onGuardarFiltro,
  onCargarFiltro,
  onEliminarFiltro,
  onLimpiar,
  loading = false,
  compacto = false,
  className,
}: FiltrosAvanzadosProps) {
  const [expandido, setExpandido] = useState(!compacto)
  const [mostrarGuardados, setMostrarGuardados] = useState(false)
  const [nombreNuevoFiltro, setNombreNuevoFiltro] = useState('')

  // Calcular filtros activos para mostrar chips
  const chipsActivos = useMemo(() => {
    const chips: { key: string; label: string; valor: string; color: string }[] = []

    if (filtrosActivos.busqueda) {
      chips.push({ key: 'busqueda', label: 'Búsqueda', valor: filtrosActivos.busqueda, color: '#8B5CF6' })
    }

    if (filtrosActivos.periodo !== 'todo') {
      const periodo = PERIODOS_PRESET.find((p) => p.id === filtrosActivos.periodo)
      if (periodo) {
        chips.push({ key: 'periodo', label: 'Período', valor: periodo.label, color: '#3B82F6' })
      }
    }

    filtrosActivos.categorias.forEach((cat) => {
      chips.push({ key: `cat_${cat}`, label: 'Categoría', valor: cat, color: '#10B981' })
    })

    filtrosActivos.estados.forEach((est) => {
      chips.push({ key: `est_${est}`, label: 'Estado', valor: est, color: '#F59E0B' })
    })

    filtrosActivos.tipos.forEach((tipo) => {
      chips.push({ key: `tipo_${tipo}`, label: 'Tipo', valor: tipo, color: '#EC4899' })
    })

    filtrosActivos.bancos.forEach((banco) => {
      chips.push({ key: `banco_${banco}`, label: 'Banco', valor: banco, color: '#06B6D4' })
    })

    if (filtrosActivos.rangoMonto.min !== null || filtrosActivos.rangoMonto.max !== null) {
      const min = filtrosActivos.rangoMonto.min
      const max = filtrosActivos.rangoMonto.max
      chips.push({
        key: 'monto',
        label: 'Monto',
        valor: `${min ? formatCurrency(min) : '0'} - ${max ? formatCurrency(max) : '∞'}`,
        color: '#22C55E',
      })
    }

    return chips
  }, [filtrosActivos])

  const handleRemoveChip = useCallback(
    (key: string) => {
      const nuevos = { ...filtrosActivos }

      if (key === 'busqueda') nuevos.busqueda = ''
      if (key === 'periodo') nuevos.periodo = 'todo'
      if (key === 'monto') nuevos.rangoMonto = { min: null, max: null }
      if (key.startsWith('cat_')) nuevos.categorias = nuevos.categorias.filter((c) => c !== key.replace('cat_', ''))
      if (key.startsWith('est_')) nuevos.estados = nuevos.estados.filter((e) => e !== key.replace('est_', ''))
      if (key.startsWith('tipo_')) nuevos.tipos = nuevos.tipos.filter((t) => t !== key.replace('tipo_', ''))
      if (key.startsWith('banco_')) nuevos.bancos = nuevos.bancos.filter((b) => b !== key.replace('banco_', ''))

      onFiltrosChange(nuevos)
    },
    [filtrosActivos, onFiltrosChange]
  )

  const handleGuardarFiltro = useCallback(() => {
    if (nombreNuevoFiltro.trim() && onGuardarFiltro) {
      onGuardarFiltro(nombreNuevoFiltro.trim(), filtrosActivos)
      setNombreNuevoFiltro('')
    }
  }, [nombreNuevoFiltro, filtrosActivos, onGuardarFiltro])

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={filtrosActivos.busqueda}
            onChange={(e) => onFiltrosChange({ ...filtrosActivos, busqueda: e.target.value })}
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50"
          />
        </div>

        {/* Period selector */}
        <PeriodoSelector
          valor={filtrosActivos.periodo}
          onChange={(periodo) => onFiltrosChange({ ...filtrosActivos, periodo })}
        />

        {/* Toggle expand */}
        <button
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all',
            expandido
              ? 'border-violet-500/30 bg-violet-500/10 text-violet-400'
              : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/8'
          )}
          onClick={() => setExpandido(!expandido)}
        >
          <Sliders className="h-4 w-4" />
          <span className="text-sm hidden sm:inline">Filtros</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', expandido && 'rotate-180')} />
        </button>

        {/* Saved filters */}
        {filtrosGuardados.length > 0 && (
          <div className="relative">
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/8"
              onClick={() => setMostrarGuardados(!mostrarGuardados)}
            >
              <Star className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Guardados</span>
            </button>

            <AnimatePresence>
              {mostrarGuardados && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 right-0 mt-2 w-56 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-xl overflow-hidden"
                >
                  {filtrosGuardados.map((filtro) => (
                    <div
                      key={filtro.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors"
                    >
                      <button
                        className="flex-1 text-left text-sm text-white/70 hover:text-white"
                        onClick={() => {
                          onCargarFiltro?.(filtro)
                          setMostrarGuardados(false)
                        }}
                      >
                        {filtro.nombre}
                      </button>
                      {filtro.esFavorito && <Heart className="h-3 w-3 text-rose-400 fill-rose-400" />}
                      <button
                        className="p-1 text-white/40 hover:text-rose-400"
                        onClick={() => onEliminarFiltro?.(filtro.id)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Clear all */}
        {chipsActivos.length > 0 && (
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
            onClick={onLimpiar}
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
              {/* Dynamic filters based on configuration */}
              {configuracion.map((config) => {
                switch (config.tipo) {
                  case 'multiselect':
                    return (
                      <MultiSelectDropdown
                        key={config.id}
                        label={config.label}
                        opciones={config.opciones || []}
                        seleccionados={(filtrosActivos[config.id] as string[]) || []}
                        onChange={(seleccionados) =>
                          onFiltrosChange({ ...filtrosActivos, [config.id]: seleccionados })
                        }
                        icono={config.icono}
                      />
                    )
                  case 'numberrange':
                    return (
                      <RangoMontoInput
                        key={config.id}
                        valor={filtrosActivos.rangoMonto}
                        onChange={(rango) => onFiltrosChange({ ...filtrosActivos, rangoMonto: rango })}
                      />
                    )
                  case 'daterange':
                    return (
                      <RangoFechaInput
                        key={config.id}
                        valor={filtrosActivos.rangoFecha}
                        onChange={(rango) => onFiltrosChange({ ...filtrosActivos, rangoFecha: rango })}
                      />
                    )
                  default:
                    return null
                }
              })}

              {/* Save filter */}
              {onGuardarFiltro && (
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="text"
                    value={nombreNuevoFiltro}
                    onChange={(e) => setNombreNuevoFiltro(e.target.value)}
                    placeholder="Nombre del filtro..."
                    className="w-36 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/40"
                  />
                  <button
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-violet-500/20 text-violet-400 text-sm hover:bg-violet-500/30 disabled:opacity-50"
                    onClick={handleGuardarFiltro}
                    disabled={!nombreNuevoFiltro.trim()}
                  >
                    <Save className="h-4 w-4" />
                    Guardar
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter chips */}
      <AnimatePresence>
        {chipsActivos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-xs text-white/40">Filtros activos:</span>
            {chipsActivos.map((chip) => (
              <FiltroChip
                key={chip.key}
                label={chip.label}
                valor={chip.valor}
                color={chip.color}
                onRemove={() => handleRemoveChip(chip.key)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

export default FiltrosAvanzados
