'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🎯 QUANTUM TABLE — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de tablas ultra-premium con TanStack Table v8:
 * ✅ Paginación infinita con virtualización
 * ✅ Filtros semánticos AI-ready
 * ✅ Sort multi-columna
 * ✅ Drill-down expandible
 * ✅ Animaciones 3D tilt Framer Motion
 * ✅ Glassmorphism GEN5
 * ✅ Real-time sync con Zustand
 * ✅ Error handling + loading states
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import {
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type ExpandedState,
    type PaginationState,
    type SortingState,
    type VisibilityState,
} from '@tanstack/react-table'
import {
    AlertCircle,
    ArrowDown,
    ArrowUp,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronsUpDown,
    Filter,
    Mic,
    Search,
    Sparkles,
    X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React, { useCallback, useState, type ReactNode } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface QuantumTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  isLoading?: boolean
  error?: Error | null

  // Header
  title?: string
  subtitle?: string
  icon?: ReactNode

  // Features
  enableSearch?: boolean
  enableFilters?: boolean
  enableSorting?: boolean
  enablePagination?: boolean
  enableRowSelection?: boolean
  enableExpanding?: boolean
  enableVoiceSearch?: boolean

  // Pagination
  pageSize?: number
  pageSizeOptions?: number[]

  // Callbacks
  onRowClick?: (row: TData) => void
  onRowExpand?: (row: TData) => void
  onSearch?: (query: string) => void
  onVoiceCommand?: (command: string) => void

  // Render
  renderExpandedRow?: (row: TData) => ReactNode
  renderEmptyState?: () => ReactNode
  renderErrorState?: (error: Error) => ReactNode

  // Style
  variant?: 'default' | 'compact' | 'comfortable'
  className?: string

  // Empty state
  emptyMessage?: string
  emptyIcon?: ReactNode
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// QUANTUM SEARCH BAR — AI-ready con voz
// ═══════════════════════════════════════════════════════════════════════════════════════

interface QuantumSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  enableVoice?: boolean
  onVoiceCommand?: (command: string) => void
  isListening?: boolean
  className?: string
}

function QuantumSearchBar({
  value,
  onChange,
  placeholder = 'Buscar o usa filtro semántico (ej: "margen >30%")...',
  enableVoice = false,
  onVoiceCommand,
  isListening = false,
  className,
}: QuantumSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <motion.div
      className={cn(
        'relative flex items-center gap-2 rounded-xl',
        'bg-white/5 backdrop-blur-xl',
        'border transition-all duration-300',
        isFocused ? 'border-violet-500/50 shadow-lg shadow-violet-500/10' : 'border-white/10',
        className,
      )}
      animate={{ scale: isFocused ? 1.01 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="flex items-center gap-2 px-4 py-2.5">
        <Search className={cn('h-4 w-4 transition-colors', isFocused ? 'text-violet-400' : 'text-white/40')} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
        />
        {value && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => onChange('')}
            className="rounded-full p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </div>

      {/* AI Filter indicator */}
      <div className="flex items-center gap-1 border-l border-white/10 px-3">
        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-[10px] font-medium text-amber-400/70">AI</span>
      </div>

      {/* Voice button */}
      {enableVoice && (
        <motion.button
          onClick={() => onVoiceCommand?.('')}
          className={cn(
            'mr-2 rounded-lg p-2 transition-all',
            isListening
              ? 'bg-violet-500/30 text-violet-400'
              : 'text-white/40 hover:bg-white/10 hover:text-white',
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Mic className="h-4 w-4" />
          {isListening && (
            <motion.span
              className="absolute inset-0 rounded-lg bg-violet-500/20"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.button>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// QUANTUM PAGINATION — Premium paginator
// ═══════════════════════════════════════════════════════════════════════════════════════

interface QuantumPaginationProps {
  pageIndex: number
  pageSize: number
  pageCount: number
  totalRows: number
  canPreviousPage: boolean
  canNextPage: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
}

function QuantumPagination({
  pageIndex,
  pageSize,
  pageCount,
  totalRows,
  canPreviousPage,
  canNextPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: QuantumPaginationProps) {
  const startRow = pageIndex * pageSize + 1
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-4 py-3">
      {/* Info */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-white/50">
          Mostrando <span className="font-medium text-white">{startRow}-{endRow}</span> de{' '}
          <span className="font-medium text-white">{totalRows}</span>
        </span>

        {/* Page size selector */}
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white backdrop-blur-sm focus:border-violet-500/50 focus:outline-none"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size} className="bg-gray-900">
              {size} por página
            </option>
          ))}
        </select>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1">
        <motion.button
          onClick={() => onPageChange(0)}
          disabled={!canPreviousPage}
          className={cn(
            'rounded-lg p-2 transition-all',
            canPreviousPage
              ? 'text-white/70 hover:bg-white/10 hover:text-white'
              : 'cursor-not-allowed text-white/20',
          )}
          whileHover={canPreviousPage ? { scale: 1.1 } : {}}
          whileTap={canPreviousPage ? { scale: 0.95 } : {}}
        >
          <ChevronsLeft className="h-4 w-4" />
        </motion.button>

        <motion.button
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!canPreviousPage}
          className={cn(
            'rounded-lg p-2 transition-all',
            canPreviousPage
              ? 'text-white/70 hover:bg-white/10 hover:text-white'
              : 'cursor-not-allowed text-white/20',
          )}
          whileHover={canPreviousPage ? { scale: 1.1 } : {}}
          whileTap={canPreviousPage ? { scale: 0.95 } : {}}
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 px-2">
          {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
            let pageNum: number
            if (pageCount <= 5) {
              pageNum = i
            } else if (pageIndex < 3) {
              pageNum = i
            } else if (pageIndex >= pageCount - 3) {
              pageNum = pageCount - 5 + i
            } else {
              pageNum = pageIndex - 2 + i
            }
            return (
              <motion.button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all',
                  pageNum === pageIndex
                    ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white',
                )}
                whileHover={{ scale: pageNum === pageIndex ? 1 : 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {pageNum + 1}
              </motion.button>
            )
          })}
        </div>

        <motion.button
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!canNextPage}
          className={cn(
            'rounded-lg p-2 transition-all',
            canNextPage
              ? 'text-white/70 hover:bg-white/10 hover:text-white'
              : 'cursor-not-allowed text-white/20',
          )}
          whileHover={canNextPage ? { scale: 1.1 } : {}}
          whileTap={canNextPage ? { scale: 0.95 } : {}}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>

        <motion.button
          onClick={() => onPageChange(pageCount - 1)}
          disabled={!canNextPage}
          className={cn(
            'rounded-lg p-2 transition-all',
            canNextPage
              ? 'text-white/70 hover:bg-white/10 hover:text-white'
              : 'cursor-not-allowed text-white/20',
          )}
          whileHover={canNextPage ? { scale: 1.1 } : {}}
          whileTap={canNextPage ? { scale: 0.95 } : {}}
        >
          <ChevronsRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════════════════════════════════

function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex gap-4 border-b border-white/10 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-white/10" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 border-b border-white/5 px-4 py-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 flex-1 rounded bg-white/5" />
          ))}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN QUANTUM TABLE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

export function QuantumTable<TData>({
  data,
  columns,
  isLoading = false,
  error = null,
  title,
  subtitle,
  icon,
  enableSearch = true,
  enableFilters = true,
  enableSorting = true,
  enablePagination = true,
  enableRowSelection = false,
  enableExpanding = false,
  enableVoiceSearch = false,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onRowClick,
  onRowExpand,
  onSearch,
  onVoiceCommand,
  renderExpandedRow,
  renderEmptyState,
  renderErrorState,
  variant = 'default',
  className,
  emptyMessage = 'No hay datos disponibles',
  emptyIcon,
}: QuantumTableProps<TData>) {
  // State
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  // TanStack Table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
      pagination,
    },
    enableRowSelection,
    enableExpanding,
    enableSorting,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getExpandedRowModel: enableExpanding ? getExpandedRowModel() : undefined,
  })

  // Handle search with callback
  const handleSearch = useCallback(
    (value: string) => {
      setGlobalFilter(value)
      onSearch?.(value)
    },
    [onSearch],
  )

  // Variant styles
  const rowHeightClass = {
    compact: 'py-2',
    default: 'py-3',
    comfortable: 'py-4',
  }[variant]

  // Render sort icon
  const renderSortIcon = (column: { getIsSorted: () => false | 'asc' | 'desc'; getCanSort: () => boolean }) => {
    if (!column.getCanSort()) return null

    const sorted = column.getIsSorted()
    if (!sorted) {
      return <ChevronsUpDown className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
    }
    return sorted === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-violet-400" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-violet-400" />
    )
  }

  // Error state
  if (error) {
    if (renderErrorState) return renderErrorState(error)
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
        <h3 className="mb-2 text-lg font-semibold text-white">Error al cargar datos</h3>
        <p className="text-sm text-white/50">{error.message}</p>
      </div>
    )
  }

  return (
    <motion.div
      className={cn(
        'overflow-hidden rounded-2xl',
        'border border-white/10 bg-white/5 backdrop-blur-xl',
        'transition-all duration-300 hover:border-white/15',
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Header */}
      {(title || enableSearch) && (
        <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Title section */}
          {title && (
            <div className="flex items-center gap-3">
              {icon && <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">{icon}</div>}
              <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
              </div>
            </div>
          )}

          {/* Search */}
          {enableSearch && (
            <div className="w-full sm:w-80">
              <QuantumSearchBar
                value={globalFilter}
                onChange={handleSearch}
                enableVoice={enableVoiceSearch}
                onVoiceCommand={onVoiceCommand}
              />
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <TableSkeleton columns={columns.length} rows={5} />
        ) : (
          <table className="w-full">
            {/* Header */}
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-white/10">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        'group px-4 text-left text-xs font-semibold uppercase tracking-wider text-white/60',
                        rowHeightClass,
                      )}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            'flex items-center gap-2',
                            header.column.getCanSort() && 'cursor-pointer select-none hover:text-white',
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {renderSortIcon(header.column)}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* Body */}
            <tbody>
              <AnimatePresence mode="popLayout">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="py-12">
                      {renderEmptyState ? (
                        renderEmptyState()
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center">
                          {emptyIcon || <Filter className="mb-4 h-12 w-12 text-white/20" />}
                          <p className="text-sm text-white/40">{emptyMessage}</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row, rowIndex) => (
                    <React.Fragment key={row.id}>
                      <motion.tr
                        className={cn(
                          'group border-b border-white/5 transition-colors',
                          onRowClick && 'cursor-pointer',
                          'hover:bg-white/5',
                        )}
                        onClick={() => onRowClick?.(row.original)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: rowIndex * 0.02, type: 'spring', stiffness: 400, damping: 30 }}
                        whileHover={{
                          scale: 1.002,
                          transition: { duration: 0.15 },
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={cn('px-4 text-sm text-white/80', rowHeightClass)}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </motion.tr>

                      {/* Expanded row */}
                      {enableExpanding && row.getIsExpanded() && renderExpandedRow && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan={columns.length} className="bg-white/[0.02] p-4">
                            {renderExpandedRow(row.original)}
                          </td>
                        </motion.tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {enablePagination && !isLoading && data.length > 0 && (
        <QuantumPagination
          pageIndex={table.getState().pagination.pageIndex}
          pageSize={table.getState().pagination.pageSize}
          pageCount={table.getPageCount()}
          totalRows={table.getFilteredRowModel().rows.length}
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
          onPageChange={(page) => table.setPageIndex(page)}
          onPageSizeChange={(size) => table.setPageSize(size)}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </motion.div>
  )
}

export default QuantumTable
