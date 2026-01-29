/**
 * 📋 DATA TABLE 2026 - TABLA DE DATOS PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════
 * Tabla con diseño glassmorphism y animaciones
 * - Rows con hover effects
 * - Sorting y filtering
 * - Pagination premium
 * - Actions inline
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  MoreHorizontal,
  Search,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export interface Column<T> {
  key: keyof T | string
  header: string
  width?: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T, index: number) => React.ReactNode
}

export interface DataTableProps<T = Record<string, unknown>> {
  data: T[]
  columns: Column<T>[]
  pageSize?: number
  searchable?: boolean
  searchPlaceholder?: string
  onRowClick?: (row: T, index: number) => void
  rowActions?: (row: T) => React.ReactNode
  emptyMessage?: string
  className?: string
  variant?: 'default' | 'compact' | 'striped'
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export function DataTable<T = Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  onRowClick,
  rowActions,
  emptyMessage = 'No hay datos disponibles',
  className = '',
  variant = 'default',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  // Validar que data sea un array
  const safeData = Array.isArray(data) ? data : []

  // Filter data
  const filteredData = useMemo(() => {
    if (!search) return safeData

    return safeData.filter((row) => {
      return columns.some((col) => {
        const value = row[col.key as keyof T]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(search.toLowerCase())
      })
    })
  }, [safeData, search, columns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey as keyof T]
      const bVal = b[sortKey as keyof T]

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = aVal < bVal ? -1 : 1
      return sortDir === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortKey, sortDir])

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = page * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, page, pageSize])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  // Handle sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // Get nested value from object using dot notation
  const getValue = (row: T, key: string): unknown => {
    const keys = key.split('.')
    let value: unknown = row
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[k]
      } else {
        return undefined
      }
    }
    return value
  }

  const variantClasses = {
    default: '',
    compact: '',
    striped: 'even:bg-white/[0.02]',
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Search bar */}
      {searchable && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-2.5 pr-4 pl-10 text-white transition-all duration-200 placeholder:text-white/40 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Table container */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr className="border-b border-white/[0.08]">
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={`px-4 py-3.5 text-xs font-semibold tracking-wider text-white/60 uppercase ${col.align === 'center' ? 'text-center' : ''} ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.sortable ? 'cursor-pointer transition-colors select-none hover:text-white/80' : ''} `}
                    style={{ width: col.width }}
                    onClick={() => col.sortable && handleSort(String(col.key))}
                  >
                    <div
                      className={`flex items-center gap-2 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''}`}
                    >
                      {col.header}
                      {col.sortable && (
                        <span className="inline-flex flex-col">
                          {sortKey === col.key ? (
                            sortDir === 'asc' ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {rowActions && <th className="w-12 px-4 py-3.5"></th>}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className={`border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.04] ${onRowClick ? 'cursor-pointer' : ''} ${variantClasses[variant]} `}
                      onClick={() => onRowClick?.(row, index)}
                    >
                      {columns.map((col) => {
                        const value = getValue(row, String(col.key))
                        return (
                          <td
                            key={String(col.key)}
                            className={`px-4 py-3.5 text-sm text-white/80 ${col.align === 'center' ? 'text-center' : ''} ${col.align === 'right' ? 'text-right' : ''} `}
                          >
                            {col.render ? col.render(value, row, index) : String(value ?? '-')}
                          </td>
                        )
                      })}
                      {rowActions && <td className="px-4 py-3.5">{rowActions(row)}</td>}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length + (rowActions ? 1 : 0)}
                      className="px-4 py-12 text-center text-white/40"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-3">
            <span className="text-sm text-white/40">
              Mostrando {page * pageSize + 1}-{Math.min((page + 1) * pageSize, sortedData.length)}{' '}
              de {sortedData.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="rounded-lg border border-white/10 bg-white/[0.05] p-2 text-white/60 transition-all duration-200 hover:bg-white/[0.1] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i
                  } else if (page < 3) {
                    pageNum = i
                  } else if (page > totalPages - 4) {
                    pageNum = totalPages - 5 + i
                  } else {
                    pageNum = page - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                        page === pageNum
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white'
                      } `}
                    >
                      {pageNum + 1}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-lg border border-white/10 bg-white/[0.05] p-2 text-white/60 transition-all duration-200 hover:bg-white/[0.1] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CELL RENDERERS
// ═══════════════════════════════════════════════════════════════════════════

export function CurrencyCell({ value, currency = '$' }: { value: number; currency?: string }) {
  const isNegative = value < 0
  return (
    <span className={isNegative ? 'text-red-400' : 'text-emerald-400'}>
      {isNegative ? '-' : ''}
      {currency}
      {Math.abs(value).toLocaleString()}
    </span>
  )
}

export function StatusCell({
  status,
  statusMap,
}: {
  status: string
  statusMap?: Record<string, { label: string; color: string }>
}) {
  const defaultMap: Record<string, { label: string; color: string }> = {
    active: { label: 'Activo', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    pending: { label: 'Pendiente', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    completed: { label: 'Completado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    cancelled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  }

  const map = statusMap || defaultMap
  const config = map[status] || {
    label: status,
    color: 'bg-white/10 text-white/60 border-white/20',
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  )
}

export function DateCell({
  date,
  format = 'short',
}: {
  date: string | Date
  format?: 'short' | 'long'
}) {
  const d = typeof date === 'string' ? new Date(date) : date
  const formatted =
    format === 'short'
      ? d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
      : d.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })

  return <span className="text-white/70">{formatted}</span>
}

export function AvatarCell({
  name,
  image,
  subtitle,
}: {
  name: string
  image?: string
  subtitle?: string
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-xs font-medium text-white">
        {image ? (
          <img src={image} alt={name} className="h-full w-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div>
        <div className="text-sm font-medium text-white">{name}</div>
        {subtitle && <div className="text-xs text-white/40">{subtitle}</div>}
      </div>
    </div>
  )
}

export interface ActionItem {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  danger?: boolean
}

export interface ActionsCellProps {
  actions?: ActionItem[]
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function ActionsCell({ actions, onView, onEdit, onDelete }: ActionsCellProps) {
  const [open, setOpen] = useState(false)

  // Build actions array from either prop format
  const actionItems: ActionItem[] = actions || [
    ...(onView ? [{ label: 'Ver', onClick: onView }] : []),
    ...(onEdit ? [{ label: 'Editar', onClick: onEdit }] : []),
    ...(onDelete ? [{ label: 'Eliminar', onClick: onDelete, danger: true }] : []),
  ]

  if (actionItems.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              className="absolute top-full right-0 z-50 mt-1 min-w-[120px] rounded-xl border border-white/10 bg-black/90 p-1 shadow-2xl backdrop-blur-xl"
            >
              {actionItems.map((action, index) => {
                const Icon = action.icon
                return (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      action.onClick()
                      setOpen(false)
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      action.danger
                        ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {action.label}
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
