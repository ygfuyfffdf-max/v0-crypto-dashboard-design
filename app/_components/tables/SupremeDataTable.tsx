'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 SUPREME DATA TABLE — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Tabla de datos ultra-premium con:
 * - Filas expandibles con detalles completos
 * - Trazabilidad completa de cada registro
 * - Historial de cambios/auditoría
 * - Filtros avanzados múltiples
 * - Búsqueda en tiempo real
 * - Ordenamiento por múltiples columnas
 * - Paginación inteligente
 * - Selección múltiple con acciones batch
 * - Exportación multi-formato
 * - Diseño responsive premium
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { AnimatePresence, motion } from 'motion/react'
import React, { memo, useCallback, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileJson,
  FileSpreadsheet,
  FileText,
  Filter,
  Hash,
  History,
  Info,
  Laptop,
  Loader2,
  MapPin,
  MoreHorizontal,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  User,
  X,
  XCircle,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface ColumnDef<T> {
  id: string
  header: string
  accessorKey?: keyof T
  accessorFn?: (row: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
  minWidth?: string
  maxWidth?: string
  sticky?: boolean
  hidden?: boolean
  cell?: (row: T, rowIndex: number) => React.ReactNode
  filterOptions?: { value: string; label: string }[]
  filterType?: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'boolean'
}

export interface AuditTrail {
  id: string
  timestamp: number
  usuario: string
  usuarioNombre: string
  accion: 'crear' | 'editar' | 'eliminar' | 'ver' | 'exportar'
  campo?: string
  valorAnterior?: string
  valorNuevo?: string
  dispositivo?: string
  ip?: string
  navegador?: string
  ubicacion?: string
}

export interface RowMetadata {
  id: string
  creadoPor: string
  creadoPorNombre: string
  creadoAt: number
  creadoDispositivo?: string
  creadoIp?: string
  modificadoPor?: string
  modificadoPorNombre?: string
  modificadoAt?: number
  historialCambios?: AuditTrail[]
}

export interface SupremeDataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  getRowId: (row: T) => string
  getRowMetadata?: (row: T) => RowMetadata
  
  // Features
  enableSearch?: boolean
  enableFilters?: boolean
  enableSorting?: boolean
  enablePagination?: boolean
  enableSelection?: boolean
  enableRowExpand?: boolean
  enableExport?: boolean
  enableColumnToggle?: boolean
  enableRefresh?: boolean
  
  // Pagination
  pageSize?: number
  pageSizeOptions?: number[]
  
  // Events
  onRowClick?: (row: T) => void
  onRowSelect?: (selected: T[]) => void
  onRefresh?: () => void
  onExport?: (format: 'csv' | 'json' | 'excel', data: T[]) => void
  
  // Custom rendering
  renderExpandedRow?: (row: T) => React.ReactNode
  renderEmptyState?: () => React.ReactNode
  renderActions?: (row: T) => React.ReactNode
  
  // Loading state
  isLoading?: boolean
  
  // Styling
  className?: string
  stickyHeader?: boolean
  striped?: boolean
  bordered?: boolean
  compact?: boolean
  
  // Labels
  title?: string
  subtitle?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function getDeviceIcon(device?: string) {
  if (!device) return <Laptop className="h-4 w-4" />
  const lower = device.toLowerCase()
  if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('android')) {
    return <Smartphone className="h-4 w-4" />
  }
  if (lower.includes('tablet') || lower.includes('ipad')) {
    return <Tablet className="h-4 w-4" />
  }
  return <Laptop className="h-4 w-4" />
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface InfoFieldProps {
  label: string
  value: string | number | null | undefined
  icon?: React.ReactNode
  copyable?: boolean
  badge?: boolean
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'blue' | 'violet'
}

const InfoField = memo(function InfoField({
  label,
  value,
  icon,
  copyable,
  badge,
  badgeColor = 'violet',
}: InfoFieldProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (value) {
      copyToClipboard(String(value))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const badgeColors = {
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    rose: 'bg-rose-500/20 text-rose-400',
    blue: 'bg-blue-500/20 text-blue-400',
    violet: 'bg-violet-500/20 text-violet-400',
  }

  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1.5 text-xs text-white/40">
        {icon}
        {label}
      </p>
      <div className="flex items-center gap-2">
        {badge ? (
          <span className={cn('rounded-lg px-2 py-1 text-xs font-medium capitalize', badgeColors[badgeColor])}>
            {value || 'N/A'}
          </span>
        ) : (
          <p className="text-sm text-white font-medium truncate">{value || 'N/A'}</p>
        )}
        {copyable && value && (
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          </button>
        )}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPANDED ROW DETAIL PANEL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ExpandedDetailPanelProps {
  metadata: RowMetadata
  onClose: () => void
}

const ExpandedDetailPanel = memo(function ExpandedDetailPanel({
  metadata,
  onClose,
}: ExpandedDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'historial'>('info')

  return (
    <motion.tr
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <td colSpan={100} className="p-0 border-t border-violet-500/20">
        <motion.div
          className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Detalles y Trazabilidad</h3>
                <p className="text-xs text-white/50">Información completa del registro</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/10 pb-3">
            <button
              onClick={() => setActiveTab('info')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === 'info'
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-white/50 hover:text-white/70'
              )}
            >
              <User className="h-4 w-4" />
              Información de Creación
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === 'historial'
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-white/50 hover:text-white/70'
              )}
            >
              <History className="h-4 w-4" />
              Historial de Cambios
              {metadata.historialCambios && metadata.historialCambios.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-violet-500/30 text-xs">
                  {metadata.historialCambios.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Creación */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-emerald-400" />
                    Registro Creado
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoField
                      label="ID del Registro"
                      value={metadata.id}
                      icon={<Hash className="h-3 w-3" />}
                      copyable
                    />
                    <InfoField
                      label="Creado Por"
                      value={metadata.creadoPorNombre}
                      icon={<User className="h-3 w-3" />}
                    />
                    <InfoField
                      label="Fecha y Hora"
                      value={formatTimestamp(metadata.creadoAt)}
                      icon={<Calendar className="h-3 w-3" />}
                    />
                    <InfoField
                      label="Dispositivo"
                      value={metadata.creadoDispositivo || 'Desconocido'}
                      icon={getDeviceIcon(metadata.creadoDispositivo)}
                    />
                    <InfoField
                      label="Dirección IP"
                      value={metadata.creadoIp || 'N/A'}
                      icon={<MapPin className="h-3 w-3" />}
                    />
                  </div>
                </div>

                {/* Última Modificación */}
                {metadata.modificadoPor && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <h4 className="text-sm font-medium text-amber-400 mb-4 flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Última Modificación
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <InfoField
                        label="Modificado Por"
                        value={metadata.modificadoPorNombre}
                        icon={<User className="h-3 w-3" />}
                      />
                      <InfoField
                        label="Fecha y Hora"
                        value={metadata.modificadoAt ? formatTimestamp(metadata.modificadoAt) : 'N/A'}
                        icon={<Calendar className="h-3 w-3" />}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'historial' && (
              <motion.div
                key="historial"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {metadata.historialCambios && metadata.historialCambios.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {metadata.historialCambios.map((cambio, index) => (
                      <motion.div
                        key={cambio.id}
                        className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className={cn(
                          'flex-shrink-0 p-2 rounded-lg',
                          cambio.accion === 'crear' && 'bg-emerald-500/20 text-emerald-400',
                          cambio.accion === 'editar' && 'bg-amber-500/20 text-amber-400',
                          cambio.accion === 'eliminar' && 'bg-rose-500/20 text-rose-400',
                          cambio.accion === 'ver' && 'bg-blue-500/20 text-blue-400',
                          cambio.accion === 'exportar' && 'bg-violet-500/20 text-violet-400',
                        )}>
                          {cambio.accion === 'crear' && <Plus className="h-4 w-4" />}
                          {cambio.accion === 'editar' && <Edit className="h-4 w-4" />}
                          {cambio.accion === 'eliminar' && <Trash2 className="h-4 w-4" />}
                          {cambio.accion === 'ver' && <Eye className="h-4 w-4" />}
                          {cambio.accion === 'exportar' && <Download className="h-4 w-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-white">
                              {cambio.usuarioNombre}
                            </p>
                            <p className="text-xs text-white/40">
                              {formatTimestamp(cambio.timestamp)}
                            </p>
                          </div>

                          <p className="text-sm text-white/70 mb-2 capitalize">
                            Acción: <span className="font-medium">{cambio.accion}</span>
                            {cambio.campo && (
                              <span className="text-white/50"> en campo "{cambio.campo}"</span>
                            )}
                          </p>

                          {/* Cambio de valor */}
                          {cambio.valorAnterior !== undefined && cambio.valorNuevo !== undefined && (
                            <div className="flex items-center gap-3 text-xs">
                              <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 line-through">
                                {cambio.valorAnterior || '(vacío)'}
                              </span>
                              <span className="text-white/30">→</span>
                              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">
                                {cambio.valorNuevo || '(vacío)'}
                              </span>
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                            {cambio.dispositivo && (
                              <span className="flex items-center gap-1">
                                {getDeviceIcon(cambio.dispositivo)}
                                {cambio.dispositivo}
                              </span>
                            )}
                            {cambio.ip && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {cambio.ip}
                              </span>
                            )}
                            {cambio.navegador && (
                              <span className="flex items-center gap-1">
                                <Settings className="h-3 w-3" />
                                {cambio.navegador}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">No hay cambios registrados</p>
                    <p className="text-xs text-white/30 mt-1">
                      El historial aparecerá cuando se realicen modificaciones
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </td>
    </motion.tr>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FILTER PANEL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FilterPanelProps<T> {
  columns: ColumnDef<T>[]
  filters: Record<string, string>
  onFilterChange: (columnId: string, value: string) => void
  onClearFilters: () => void
  onClose: () => void
}

function FilterPanel<T>({
  columns,
  filters,
  onFilterChange,
  onClearFilters,
  onClose,
}: FilterPanelProps<T>) {
  const filterableColumns = columns.filter((col) => col.filterable)

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-b border-white/10 bg-white/[0.02] p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-white flex items-center gap-2">
          <Filter className="h-4 w-4 text-violet-400" />
          Filtros Avanzados
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearFilters}
            className="text-xs text-white/50 hover:text-white transition-colors"
          >
            Limpiar todos
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filterableColumns.map((col) => (
          <div key={col.id} className="space-y-1">
            <label className="text-xs text-white/50">{col.header}</label>
            {col.filterType === 'select' && col.filterOptions ? (
              <select
                value={filters[col.id] || ''}
                onChange={(e) => onFilterChange(col.id, e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 outline-none"
              >
                <option value="">Todos</option>
                {col.filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : col.filterType === 'date' ? (
              <input
                type="date"
                value={filters[col.id] || ''}
                onChange={(e) => onFilterChange(col.id, e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 outline-none"
              />
            ) : (
              <input
                type="text"
                value={filters[col.id] || ''}
                onChange={(e) => onFilterChange(col.id, e.target.value)}
                placeholder={`Filtrar ${col.header.toLowerCase()}...`}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 outline-none"
              />
            )}
          </div>
        ))}
      </div>

      {/* Active filters */}
      {Object.keys(filters).filter((k) => filters[k]).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(filters)
            .filter(([, value]) => value)
            .map(([key, value]) => {
              const col = columns.find((c) => c.id === key)
              return (
                <span
                  key={key}
                  className="flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-400"
                >
                  {col?.header}: {value}
                  <button
                    onClick={() => onFilterChange(key, '')}
                    className="hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )
            })}
        </div>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function SupremeDataTable<T>({
  data,
  columns,
  getRowId,
  getRowMetadata,
  enableSearch = true,
  enableFilters = true,
  enableSorting = true,
  enablePagination = true,
  enableSelection = false,
  enableRowExpand = true,
  enableExport = true,
  enableColumnToggle = true,
  enableRefresh = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
  onRowClick,
  onRowSelect,
  onRefresh,
  onExport,
  renderExpandedRow,
  renderEmptyState,
  renderActions,
  isLoading = false,
  className,
  stickyHeader = true,
  striped = true,
  bordered = true,
  compact = false,
  title,
  subtitle,
}: SupremeDataTableProps<T>) {
  // State
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.filter((c) => !c.hidden).map((c) => c.id))
  )
  const [showColumnToggle, setShowColumnToggle] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data]

    // Search
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter((row) =>
        columns.some((col) => {
          const value = col.accessorFn ? col.accessorFn(row) : col.accessorKey ? row[col.accessorKey] : null
          return value && String(value).toLowerCase().includes(searchLower)
        })
      )
    }

    // Filters
    Object.entries(filters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        const col = columns.find((c) => c.id === columnId)
        if (col) {
          result = result.filter((row) => {
            const value = col.accessorFn ? col.accessorFn(row) : col.accessorKey ? row[col.accessorKey] : null
            return value && String(value).toLowerCase().includes(filterValue.toLowerCase())
          })
        }
      }
    })

    // Sort
    if (sortConfig) {
      const col = columns.find((c) => c.id === sortConfig.key)
      if (col) {
        result.sort((a, b) => {
          const aVal = col.accessorFn ? col.accessorFn(a) : col.accessorKey ? a[col.accessorKey] : null
          const bVal = col.accessorFn ? col.accessorFn(b) : col.accessorKey ? b[col.accessorKey] : null

          if (aVal === null || aVal === undefined) return 1
          if (bVal === null || bVal === undefined) return -1

          const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
          return sortConfig.direction === 'asc' ? comparison : -comparison
        })
      }
    }

    return result
  }, [data, search, filters, sortConfig, columns])

  // Pagination
  const paginatedData = useMemo(() => {
    if (!enablePagination) return processedData
    const start = (currentPage - 1) * pageSize
    return processedData.slice(start, start + pageSize)
  }, [processedData, currentPage, pageSize, enablePagination])

  const totalPages = Math.ceil(processedData.length / pageSize)

  // Handlers
  const handleSort = useCallback((columnId: string) => {
    setSortConfig((current) => {
      if (current?.key === columnId) {
        return current.direction === 'asc' ? { key: columnId, direction: 'desc' } : null
      }
      return { key: columnId, direction: 'asc' }
    })
  }, [])

  const handleFilterChange = useCallback((columnId: string, value: string) => {
    setFilters((prev) => ({ ...prev, [columnId]: value }))
    setCurrentPage(1)
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({})
    setSearch('')
    setCurrentPage(1)
  }, [])

  const handleSelectRow = useCallback((rowId: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedData.map((row) => getRowId(row))))
    }
  }, [selectedRows.size, paginatedData, getRowId])

  const handleExpandRow = useCallback((rowId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
      return next
    })
  }, [])

  const handleExport = useCallback(
    (format: 'csv' | 'json' | 'excel') => {
      const exportData = selectedRows.size > 0
        ? processedData.filter((row) => selectedRows.has(getRowId(row)))
        : processedData

      if (onExport) {
        onExport(format, exportData)
      } else {
        // Default export logic
        const fileName = `export-${Date.now()}`
        if (format === 'json') {
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${fileName}.json`
          a.click()
        }
        // CSV export could be added here
      }
      setShowExportMenu(false)
    },
    [processedData, selectedRows, getRowId, onExport]
  )

  const visibleColumnsList = columns.filter((col) => visibleColumns.has(col.id))

  return (
    <div className={cn('rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden', className)}>
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
            {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            {enableSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Buscar..."
                  className="w-[200px] rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 outline-none"
                />
              </div>
            )}

            {/* Filter toggle */}
            {enableFilters && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors',
                  showFilters || Object.keys(filters).some((k) => filters[k])
                    ? 'border-violet-500/50 bg-violet-500/10 text-violet-400'
                    : 'border-white/10 text-white/70 hover:bg-white/5'
                )}
              >
                <Filter className="h-4 w-4" />
                Filtros
                {Object.keys(filters).filter((k) => filters[k]).length > 0 && (
                  <span className="rounded-full bg-violet-500/30 px-1.5 py-0.5 text-xs">
                    {Object.keys(filters).filter((k) => filters[k]).length}
                  </span>
                )}
              </button>
            )}

            {/* Column toggle */}
            {enableColumnToggle && (
              <div className="relative">
                <button
                  onClick={() => setShowColumnToggle(!showColumnToggle)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Columnas
                </button>

                <AnimatePresence>
                  {showColumnToggle && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-48 rounded-xl border border-white/10 bg-slate-900 shadow-xl z-20 p-2"
                    >
                      {columns.map((col) => (
                        <label
                          key={col.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns.has(col.id)}
                            onChange={() => {
                              setVisibleColumns((prev) => {
                                const next = new Set(prev)
                                if (next.has(col.id)) {
                                  if (next.size > 1) next.delete(col.id)
                                } else {
                                  next.add(col.id)
                                }
                                return next
                              })
                            }}
                            className="rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/30"
                          />
                          <span className="text-sm text-white/70">{col.header}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Export */}
            {enableExport && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Exportar
                </button>

                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-40 rounded-xl border border-white/10 bg-slate-900 shadow-xl z-20"
                    >
                      <button
                        onClick={() => handleExport('csv')}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 transition-colors"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        CSV
                      </button>
                      <button
                        onClick={() => handleExport('json')}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 transition-colors"
                      >
                        <FileJson className="h-4 w-4" />
                        JSON
                      </button>
                      <button
                        onClick={() => handleExport('excel')}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        Excel
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Refresh */}
            {enableRefresh && onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            columns={columns}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onClose={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={cn(stickyHeader && 'sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm')}>
            <tr className="border-b border-white/10">
              {/* Selection column */}
              {enableSelection && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/30"
                  />
                </th>
              )}

              {/* Expand column */}
              {enableRowExpand && getRowMetadata && (
                <th className="w-12 px-4 py-3" />
              )}

              {/* Data columns */}
              {visibleColumnsList.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.sortable && 'cursor-pointer hover:text-white/80 select-none'
                  )}
                  style={{ width: col.width, minWidth: col.minWidth, maxWidth: col.maxWidth }}
                  onClick={() => col.sortable && enableSorting && handleSort(col.id)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && enableSorting && (
                      <span className="ml-1">
                        {sortConfig?.key === col.id ? (
                          sortConfig.direction === 'asc' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-30" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}

              {/* Actions column */}
              {renderActions && <th className="w-12 px-4 py-3" />}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={100} className="py-20 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto mb-4" />
                  <p className="text-white/50">Cargando datos...</p>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={100} className="py-20 text-center">
                  {renderEmptyState ? (
                    renderEmptyState()
                  ) : (
                    <>
                      <AlertCircle className="h-12 w-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/50">No se encontraron registros</p>
                      {(search || Object.keys(filters).some((k) => filters[k])) && (
                        <button
                          onClick={handleClearFilters}
                          className="mt-4 text-sm text-violet-400 hover:text-violet-300"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const rowId = getRowId(row)
                const isExpanded = expandedRows.has(rowId)
                const isSelected = selectedRows.has(rowId)
                const metadata = getRowMetadata?.(row)

                return (
                  <React.Fragment key={rowId}>
                    <tr
                      className={cn(
                        'transition-colors',
                        striped && rowIndex % 2 === 1 && 'bg-white/[0.01]',
                        isSelected && 'bg-violet-500/10',
                        onRowClick && 'cursor-pointer hover:bg-white/5',
                        isExpanded && 'bg-violet-500/5'
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {/* Selection */}
                      {enableSelection && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(rowId)}
                            className="rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/30"
                          />
                        </td>
                      )}

                      {/* Expand toggle */}
                      {enableRowExpand && getRowMetadata && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleExpandRow(rowId)}
                            className={cn(
                              'p-1 rounded transition-all',
                              isExpanded ? 'bg-violet-500/20 text-violet-400' : 'text-white/40 hover:text-white hover:bg-white/10'
                            )}
                          >
                            <ChevronDown
                              className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
                            />
                          </button>
                        </td>
                      )}

                      {/* Data cells */}
                      {visibleColumnsList.map((col) => (
                        <td
                          key={col.id}
                          className={cn(
                            compact ? 'px-4 py-2' : 'px-4 py-3',
                            'text-sm text-white',
                            col.align === 'center' && 'text-center',
                            col.align === 'right' && 'text-right'
                          )}
                        >
                          {col.cell
                            ? col.cell(row, rowIndex)
                            : col.accessorFn
                              ? col.accessorFn(row)
                              : col.accessorKey
                                ? String(row[col.accessorKey] ?? '')
                                : null}
                        </td>
                      ))}

                      {/* Actions */}
                      {renderActions && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          {renderActions(row)}
                        </td>
                      )}
                    </tr>

                    {/* Expanded row */}
                    <AnimatePresence>
                      {isExpanded && metadata && (
                        renderExpandedRow ? (
                          <tr>
                            <td colSpan={100} className="p-0">
                              {renderExpandedRow(row)}
                            </td>
                          </tr>
                        ) : (
                          <ExpandedDetailPanel
                            metadata={metadata}
                            onClose={() => handleExpandRow(rowId)}
                          />
                        )
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {enablePagination && processedData.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-white/10 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 text-sm text-white/50">
            <span>
              Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, processedData.length)} de {processedData.length}
            </span>

            <div className="flex items-center gap-2">
              <span>Filas:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white focus:border-violet-500/50"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {selectedRows.size > 0 && (
              <span className="text-violet-400">
                {selectedRows.size} seleccionados
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4 -ml-2" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      'w-8 h-8 rounded-lg text-sm transition-colors',
                      currentPage === pageNum
                        ? 'bg-violet-500 text-white'
                        : 'text-white/50 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="h-4 w-4 -ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupremeDataTable
