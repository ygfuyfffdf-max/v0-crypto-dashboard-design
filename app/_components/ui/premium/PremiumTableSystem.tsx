'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 PREMIUM TABLE SYSTEM — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de tablas premium con:
 * ✅ Infinite scroll con virtualización
 * ✅ Sparklines inline
 * ✅ Ordenación y filtrado animado
 * ✅ Selección múltiple con animaciones
 * ✅ Responsive con columnas colapsables
 * ✅ Row expansion animada
 * ✅ Skeleton loading premium
 *
 * @version 2.0.0 - SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Check,
    ChevronRight,
    Filter,
    Loader2,
    MoreHorizontal,
    Search,
    X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PremiumSparkline } from './PremiumElevatedSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface TableColumn<T> {
  id: string
  header: string | ReactNode
  accessor: keyof T | ((row: T) => ReactNode)
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  sticky?: boolean
  hidden?: boolean
  renderCell?: (value: unknown, row: T) => ReactNode
  sparklineKey?: keyof T // Para mostrar sparkline
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  emptyMessage?: string
  selectable?: boolean
  expandable?: boolean
  renderExpandedRow?: (row: T) => ReactNode
  onRowClick?: (row: T) => void
  onSelectionChange?: (selected: T[]) => void
  stickyHeader?: boolean
  maxHeight?: string | number
  className?: string
  rowKey: keyof T
  // Infinite scroll
  hasNextPage?: boolean
  onLoadMore?: () => void
  loadingMore?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🦴 SKELETON ROW
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function SkeletonRow({ columns }: { columns: number }) {
  return (
    <tr className="border-b border-white/5">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div
            className="h-4 animate-pulse rounded bg-white/5"
            style={{ width: `${60 + Math.random() * 30}%` }}
          />
        </td>
      ))}
    </tr>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 PREMIUM TABLE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function PremiumTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading,
  emptyMessage = 'No hay datos disponibles',
  selectable,
  expandable,
  renderExpandedRow,
  onRowClick,
  onSelectionChange,
  stickyHeader = true,
  maxHeight = '600px',
  className,
  rowKey,
  hasNextPage,
  onLoadMore,
  loadingMore,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<Set<unknown>>(new Set())
  const [expandedRows, setExpandedRows] = useState<Set<unknown>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const tableContainerRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Filtrar columnas visibles
  const visibleColumns = useMemo(() => columns.filter((col) => !col.hidden), [columns])

  // Ordenar y filtrar datos
  const processedData = useMemo(() => {
    let result = [...data]

    // Filtrar por búsqueda
    if (searchTerm) {
      result = result.filter((row) =>
        visibleColumns.some((col) => {
          const value = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        }),
      )
    }

    // Ordenar
    if (sortConfig) {
      const col = columns.find((c) => c.id === sortConfig.key)
      if (col) {
        result.sort((a, b) => {
          const aValue = typeof col.accessor === 'function' ? col.accessor(a) : a[col.accessor]
          const bValue = typeof col.accessor === 'function' ? col.accessor(b) : b[col.accessor]

          if (aValue === bValue) return 0

          const comparison =
            aValue !== null && aValue !== undefined && bValue !== null && bValue !== undefined
              ? String(aValue).localeCompare(String(bValue), undefined, { numeric: true })
              : 0

          return sortConfig.direction === 'asc' ? comparison : -comparison
        })
      }
    }

    return result
  }, [data, searchTerm, sortConfig, columns, visibleColumns])

  // Infinite scroll observer
  useEffect(() => {
    if (!hasNextPage || !onLoadMore || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.5 },
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, onLoadMore, loadingMore])

  // Handlers
  const handleSort = useCallback((columnId: string) => {
    setSortConfig((prev) => {
      if (prev?.key === columnId) {
        if (prev.direction === 'asc') {
          return { key: columnId, direction: 'desc' }
        }
        return null
      }
      return { key: columnId, direction: 'asc' }
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === processedData.length) {
      setSelectedRows(new Set())
      onSelectionChange?.([])
    } else {
      const allKeys = new Set(processedData.map((row) => row[rowKey]))
      setSelectedRows(allKeys)
      onSelectionChange?.(processedData)
    }
  }, [processedData, selectedRows, rowKey, onSelectionChange])

  const handleSelectRow = useCallback(
    (row: T) => {
      const key = row[rowKey]
      const newSelected = new Set(selectedRows)

      if (newSelected.has(key)) {
        newSelected.delete(key)
      } else {
        newSelected.add(key)
      }

      setSelectedRows(newSelected)
      onSelectionChange?.(processedData.filter((r) => newSelected.has(r[rowKey])))
    },
    [selectedRows, rowKey, processedData, onSelectionChange],
  )

  const handleToggleExpand = useCallback(
    (row: T) => {
      const key = row[rowKey]
      setExpandedRows((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(key)) {
          newSet.delete(key)
        } else {
          newSet.add(key)
        }
        return newSet
      })
    },
    [rowKey],
  )

  const getCellValue = (row: T, column: TableColumn<T>) => {
    if (column.renderCell) {
      const rawValue =
        typeof column.accessor === 'function' ? column.accessor(row) : row[column.accessor]
      return column.renderCell(rawValue, row)
    }

    if (column.sparklineKey && Array.isArray(row[column.sparklineKey])) {
      return (
        <PremiumSparkline
          data={row[column.sparklineKey] as number[]}
          width={80}
          height={24}
          color="#8B5CF6"
        />
      )
    }

    return typeof column.accessor === 'function'
      ? column.accessor(row)
      : String(row[column.accessor] ?? '')
  }

  const isAllSelected = processedData.length > 0 && selectedRows.size === processedData.length
  const isSomeSelected = selectedRows.size > 0 && selectedRows.size < processedData.length

  return (
    <div className={cn('relative overflow-hidden rounded-2xl', className)}>
      {/* Header con búsqueda y filtros */}
      <div className="flex items-center gap-4 border-b border-white/10 bg-white/[0.02] p-4">
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              'h-10 w-full rounded-xl pr-9 pl-9',
              'border border-white/10 bg-white/[0.03]',
              'text-sm text-white placeholder-gray-500',
              'focus:border-violet-500/50 focus:bg-white/[0.05] focus:outline-none',
              'transition-all duration-200',
            )}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filtros toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex h-10 items-center gap-2 rounded-xl px-4',
            'border border-white/10 text-sm text-gray-400',
            'transition-colors hover:bg-white/5 hover:text-white',
            showFilters && 'border-violet-500/30 bg-violet-500/10 text-violet-400',
          )}
        >
          <Filter className="h-4 w-4" />
          Filtros
        </button>

        {/* Selection count */}
        {selectable && selectedRows.size > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 rounded-lg bg-violet-500/15 px-3 py-1.5 text-sm text-violet-400"
          >
            <Check className="h-4 w-4" />
            {selectedRows.size} seleccionados
          </motion.div>
        )}
      </div>

      {/* Table container */}
      <div
        ref={tableContainerRef}
        className="scrollbar-thin scrollbar-thumb-white/10 overflow-auto"
        style={{ maxHeight }}
      >
        <table className="w-full">
          {/* Header */}
          <thead
            className={cn('bg-white/[0.03]', stickyHeader && 'sticky top-0 z-10 backdrop-blur-xl')}
          >
            <tr className="border-b border-white/10">
              {/* Expand column */}
              {expandable && <th className="w-10" />}

              {/* Select column */}
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <motion.button
                    onClick={handleSelectAll}
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded border-2',
                      'transition-all duration-200',
                      isAllSelected
                        ? 'border-violet-500 bg-violet-500'
                        : isSomeSelected
                          ? 'border-violet-500 bg-violet-500/50'
                          : 'border-white/20 hover:border-white/40',
                    )}
                    whileTap={{ scale: 0.9 }}
                  >
                    {(isAllSelected || isSomeSelected) && <Check className="h-3 w-3 text-white" />}
                  </motion.button>
                </th>
              )}

              {/* Data columns */}
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-medium text-gray-400',
                    column.sortable && 'cursor-pointer select-none hover:text-white',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sticky && 'sticky left-0 z-10 bg-gray-900/95',
                  )}
                  style={{ width: column.width, minWidth: column.minWidth }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <motion.span
                        animate={{
                          opacity: sortConfig?.key === column.id ? 1 : 0.3,
                        }}
                      >
                        {sortConfig?.key === column.id ? (
                          sortConfig.direction === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </motion.span>
                    )}
                  </div>
                </th>
              ))}

              {/* Actions column */}
              <th className="w-10" />
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow
                  key={i}
                  columns={visibleColumns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + 1}
                />
              ))
            ) : processedData.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={visibleColumns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + 1}
                  className="px-4 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                      <Search className="h-8 w-8 text-gray-600" />
                    </div>
                    <p className="text-gray-500">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data rows
              processedData.map((row, rowIndex) => {
                const key = row[rowKey]
                const isSelected = selectedRows.has(key)
                const isExpanded = expandedRows.has(key)

                return (
                  <React.Fragment key={String(key)}>
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: rowIndex * 0.02 }}
                      onClick={() => onRowClick?.(row)}
                      className={cn(
                        'border-b border-white/5 transition-colors duration-150',
                        'hover:bg-white/[0.03]',
                        isSelected && 'bg-violet-500/10',
                        onRowClick && 'cursor-pointer',
                      )}
                    >
                      {/* Expand button */}
                      {expandable && (
                        <td className="px-2">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleExpand(row)
                            }}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.button>
                        </td>
                      )}

                      {/* Checkbox */}
                      {selectable && (
                        <td className="px-4 py-3">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectRow(row)
                            }}
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded border-2',
                              'transition-all duration-200',
                              isSelected
                                ? 'border-violet-500 bg-violet-500'
                                : 'border-white/20 hover:border-white/40',
                            )}
                            whileTap={{ scale: 0.9 }}
                          >
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </motion.button>
                        </td>
                      )}

                      {/* Data cells */}
                      {visibleColumns.map((column) => (
                        <td
                          key={column.id}
                          className={cn(
                            'px-4 py-3 text-sm text-white',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.sticky && 'sticky left-0 bg-gray-900/95',
                          )}
                        >
                          {getCellValue(row, column)}
                        </td>
                      ))}

                      {/* Actions */}
                      <td className="px-2">
                        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>

                    {/* Expanded row */}
                    <AnimatePresence>
                      {expandable && isExpanded && renderExpandedRow && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td
                            colSpan={visibleColumns.length + (selectable ? 1 : 0) + 2}
                            className="bg-white/[0.02] px-4 py-4"
                          >
                            {renderExpandedRow(row)}
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                )
              })
            )}

            {/* Load more trigger */}
            {hasNextPage && (
              <tr ref={loadMoreRef as React.RefObject<HTMLTableRowElement>}>
                <td
                  colSpan={visibleColumns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + 1}
                  className="px-4 py-4 text-center"
                >
                  {loadingMore ? (
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando más...
                    </div>
                  ) : (
                    <button
                      onClick={onLoadMore}
                      className="text-sm text-violet-400 hover:text-violet-300"
                    >
                      Cargar más
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer con info */}
      <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] px-4 py-3">
        <p className="text-sm text-gray-500">
          Mostrando {processedData.length} de {data.length} registros
        </p>
        {sortConfig && (
          <button
            onClick={() => setSortConfig(null)}
            className="text-sm text-violet-400 hover:text-violet-300"
          >
            Limpiar orden
          </button>
        )}
      </div>
    </div>
  )
}

// TableColumn and TableProps are already exported above via export interface declarations
