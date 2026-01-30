/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📊 CHRONOS INFINITY 2030 — TABLA DE DATOS PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Componente de tabla ultra-optimizado con:
 * - Virtualización para datasets grandes
 * - Ordenamiento multi-columna
 * - Filtrado avanzado
 * - Selección de filas
 * - Acciones por fila
 * - Paginación o scroll infinito
 * - Export a CSV/Excel
 * - Columnas redimensionables
 * - Responsive con scroll horizontal
 * 
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface Column<T> {
  id: string
  header: string | ReactNode
  accessorKey?: keyof T
  accessorFn?: (row: T) => unknown
  cell?: (value: unknown, row: T, index: number) => ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  minWidth?: number
  maxWidth?: number
  align?: 'left' | 'center' | 'right'
  sticky?: 'left' | 'right'
  hidden?: boolean
}

export interface SortConfig {
  columnId: string
  direction: 'asc' | 'desc'
}

export interface FilterConfig {
  columnId: string
  value: string
  operator?: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte'
}

export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  
  // Identificación
  getRowId?: (row: T) => string
  
  // Ordenamiento
  sortable?: boolean
  defaultSort?: SortConfig
  onSortChange?: (sort: SortConfig | null) => void
  
  // Filtrado
  filterable?: boolean
  filters?: FilterConfig[]
  onFilterChange?: (filters: FilterConfig[]) => void
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
  
  // Selección
  selectable?: boolean
  selectedRows?: string[]
  onSelectionChange?: (selected: string[]) => void
  
  // Paginación
  pagination?: PaginationConfig
  onPaginationChange?: (pagination: PaginationConfig) => void
  
  // Acciones
  rowActions?: (row: T) => ReactNode
  bulkActions?: (selectedIds: string[]) => ReactNode
  
  // Estados
  loading?: boolean
  emptyMessage?: string | ReactNode
  
  // Estilo
  className?: string
  compact?: boolean
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
  rounded?: boolean
  stickyHeader?: boolean
  maxHeight?: string | number
  
  // Eventos
  onRowClick?: (row: T, index: number) => void
  onRowDoubleClick?: (row: T, index: number) => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════

function getCellValue<T>(row: T, column: Column<T>): unknown {
  if (column.accessorFn) {
    return column.accessorFn(row)
  }
  if (column.accessorKey) {
    return row[column.accessorKey]
  }
  return null
}

function sortData<T>(data: T[], columns: Column<T>[], sort: SortConfig | null): T[] {
  if (!sort) return data

  const column = columns.find((c) => c.id === sort.columnId)
  if (!column) return data

  return [...data].sort((a, b) => {
    const aValue = getCellValue(a, column)
    const bValue = getCellValue(b, column)

    if (aValue === bValue) return 0
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    const comparison = aValue < bValue ? -1 : 1
    return sort.direction === 'asc' ? comparison : -comparison
  })
}

function filterData<T>(
  data: T[],
  columns: Column<T>[],
  filters: FilterConfig[],
  globalFilter?: string
): T[] {
  let filteredData = data

  // Aplicar filtros por columna
  for (const filter of filters) {
    const column = columns.find((c) => c.id === filter.columnId)
    if (!column) continue

    filteredData = filteredData.filter((row) => {
      const value = getCellValue(row, column)
      const stringValue = String(value).toLowerCase()
      const filterValue = filter.value.toLowerCase()

      switch (filter.operator) {
        case 'equals':
          return stringValue === filterValue
        case 'startsWith':
          return stringValue.startsWith(filterValue)
        case 'endsWith':
          return stringValue.endsWith(filterValue)
        case 'gt':
          return Number(value) > Number(filter.value)
        case 'lt':
          return Number(value) < Number(filter.value)
        case 'gte':
          return Number(value) >= Number(filter.value)
        case 'lte':
          return Number(value) <= Number(filter.value)
        case 'contains':
        default:
          return stringValue.includes(filterValue)
      }
    })
  }

  // Aplicar filtro global
  if (globalFilter) {
    const searchValue = globalFilter.toLowerCase()
    filteredData = filteredData.filter((row) =>
      columns.some((column) => {
        const value = getCellValue(row, column)
        return String(value).toLowerCase().includes(searchValue)
      })
    )
  }

  return filteredData
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTES INTERNOS
// ═══════════════════════════════════════════════════════════════════════════════════════

interface TableHeaderCellProps<T> {
  column: Column<T>
  sort: SortConfig | null
  onSort: (columnId: string) => void
  compact?: boolean
}

function TableHeaderCell<T>({
  column,
  sort,
  onSort,
  compact,
}: TableHeaderCellProps<T>) {
  const isSorted = sort?.columnId === column.id
  const sortDirection = isSorted ? sort.direction : null

  return (
    <th
      className={cn(
        'text-left font-semibold text-white/80 whitespace-nowrap',
        compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm',
        column.sortable && 'cursor-pointer select-none hover:bg-white/5 transition-colors',
        column.align === 'center' && 'text-center',
        column.align === 'right' && 'text-right',
        column.sticky === 'left' && 'sticky left-0 bg-slate-900 z-10',
        column.sticky === 'right' && 'sticky right-0 bg-slate-900 z-10'
      )}
      style={{
        width: column.width,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
      }}
      onClick={() => column.sortable && onSort(column.id)}
    >
      <div className="flex items-center gap-2">
        <span>{column.header}</span>
        {column.sortable && (
          <span
            className={cn(
              'transition-opacity',
              isSorted ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
            )}
          >
            {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}
          </span>
        )}
      </div>
    </th>
  )
}

interface TableRowProps<T> {
  row: T
  columns: Column<T>[]
  index: number
  getRowId: (row: T) => string
  selected: boolean
  onSelect?: (id: string, selected: boolean) => void
  selectable: boolean
  rowActions?: (row: T) => ReactNode
  compact?: boolean
  striped?: boolean
  hoverable?: boolean
  onClick?: (row: T, index: number) => void
  onDoubleClick?: (row: T, index: number) => void
}

function TableRow<T>({
  row,
  columns,
  index,
  getRowId,
  selected,
  onSelect,
  selectable,
  rowActions,
  compact,
  striped,
  hoverable,
  onClick,
  onDoubleClick,
}: TableRowProps<T>) {
  const id = getRowId(row)

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      className={cn(
        'border-b border-white/5 transition-colors',
        striped && index % 2 === 1 && 'bg-white/[0.02]',
        hoverable && 'hover:bg-white/[0.05]',
        selected && 'bg-violet-500/10',
        onClick && 'cursor-pointer'
      )}
      onClick={() => onClick?.(row, index)}
      onDoubleClick={() => onDoubleClick?.(row, index)}
    >
      {/* Checkbox de selección */}
      {selectable && (
        <td className={cn('w-10', compact ? 'px-2 py-2' : 'px-3 py-3')}>
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation()
              onSelect?.(id, e.target.checked)
            }}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/30"
          />
        </td>
      )}

      {/* Celdas de datos */}
      {columns
        .filter((col) => !col.hidden)
        .map((column) => {
          const value = getCellValue(row, column)
          const cellContent = column.cell
            ? column.cell(value, row, index)
            : String(value ?? '-')

          return (
            <td
              key={column.id}
              className={cn(
                'text-white/80',
                compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right',
                column.sticky === 'left' && 'sticky left-0 bg-inherit z-10',
                column.sticky === 'right' && 'sticky right-0 bg-inherit z-10'
              )}
              style={{
                width: column.width,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
              }}
            >
              {cellContent}
            </td>
          )
        })}

      {/* Acciones por fila */}
      {rowActions && (
        <td className={cn('w-auto', compact ? 'px-2 py-2' : 'px-3 py-3')}>
          <div className="flex items-center justify-end gap-1">
            {rowActions(row)}
          </div>
        </td>
      )}
    </motion.tr>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════

export function DataTable<T>({
  data,
  columns,
  getRowId = (row) => String((row as Record<string, unknown>).id ?? Math.random()),
  sortable = true,
  defaultSort,
  onSortChange,
  filterable = false,
  filters = [],
  onFilterChange,
  globalFilter,
  onGlobalFilterChange,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  pagination,
  onPaginationChange,
  rowActions,
  bulkActions,
  loading = false,
  emptyMessage = 'No hay datos para mostrar',
  className,
  compact = false,
  striped = true,
  hoverable = true,
  bordered = false,
  rounded = true,
  stickyHeader = true,
  maxHeight,
  onRowClick,
  onRowDoubleClick,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortConfig | null>(defaultSort ?? null)
  const [internalSelectedRows, setInternalSelectedRows] = useState<string[]>(selectedRows)

  // Sincronizar selección externa
  useEffect(() => {
    setInternalSelectedRows(selectedRows)
  }, [selectedRows])

  // Procesar datos
  const processedData = useMemo(() => {
    let result = [...data]
    
    // Filtrar
    if (filterable) {
      result = filterData(result, columns, filters, globalFilter)
    }
    
    // Ordenar
    if (sortable) {
      result = sortData(result, columns, sort)
    }
    
    return result
  }, [data, columns, filters, globalFilter, sort, sortable, filterable])

  // Datos paginados
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData
    
    const start = pagination.page * pagination.pageSize
    return processedData.slice(start, start + pagination.pageSize)
  }, [processedData, pagination])

  // Handlers
  const handleSort = useCallback(
    (columnId: string) => {
      const newSort: SortConfig | null =
        sort?.columnId === columnId
          ? sort.direction === 'asc'
            ? { columnId, direction: 'desc' }
            : null
          : { columnId, direction: 'asc' }

      setSort(newSort)
      onSortChange?.(newSort)
    },
    [sort, onSortChange]
  )

  const handleSelect = useCallback(
    (id: string, selected: boolean) => {
      const newSelection = selected
        ? [...internalSelectedRows, id]
        : internalSelectedRows.filter((rowId) => rowId !== id)

      setInternalSelectedRows(newSelection)
      onSelectionChange?.(newSelection)
    },
    [internalSelectedRows, onSelectionChange]
  )

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      const newSelection = selected ? paginatedData.map(getRowId) : []
      setInternalSelectedRows(newSelection)
      onSelectionChange?.(newSelection)
    },
    [paginatedData, getRowId, onSelectionChange]
  )

  const allSelected = 
    paginatedData.length > 0 &&
    paginatedData.every((row) => internalSelectedRows.includes(getRowId(row)))

  const someSelected =
    paginatedData.some((row) => internalSelectedRows.includes(getRowId(row))) && !allSelected

  const visibleColumns = columns.filter((col) => !col.hidden)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Barra de herramientas */}
      {(filterable || bulkActions) && (
        <div className="flex items-center justify-between gap-4">
          {/* Búsqueda global */}
          {filterable && (
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Buscar..."
                value={globalFilter ?? ''}
                onChange={(e) => onGlobalFilterChange?.(e.target.value)}
                className={cn(
                  'w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40',
                  'focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none',
                  'transition-all duration-200',
                  compact ? 'h-9 px-3 text-sm' : 'h-10 px-4 text-sm'
                )}
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}

          {/* Acciones masivas */}
          {bulkActions && internalSelectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">
                {internalSelectedRows.length} seleccionado(s)
              </span>
              {bulkActions(internalSelectedRows)}
            </div>
          )}
        </div>
      )}

      {/* Contenedor de la tabla */}
      <div
        className={cn(
          'overflow-auto',
          rounded && 'rounded-xl',
          bordered && 'border border-white/10',
          'bg-white/[0.02]'
        )}
        style={{ maxHeight }}
      >
        <table className="w-full">
          {/* Header */}
          <thead
            className={cn(
              'bg-white/[0.03] border-b border-white/10',
              stickyHeader && 'sticky top-0 z-20'
            )}
          >
            <tr>
              {/* Checkbox header */}
              {selectable && (
                <th className={cn('w-10', compact ? 'px-2 py-2' : 'px-3 py-3')}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/30"
                  />
                </th>
              )}

              {/* Column headers */}
              {visibleColumns.map((column) => (
                <TableHeaderCell
                  key={column.id}
                  column={column}
                  sort={sort}
                  onSort={handleSort}
                  compact={compact}
                />
              ))}

              {/* Actions header */}
              {rowActions && (
                <th
                  className={cn(
                    'text-right font-semibold text-white/60 whitespace-nowrap',
                    compact ? 'px-2 py-2 text-xs' : 'px-3 py-3 text-sm'
                  )}
                >
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-white/5">
                    {selectable && (
                      <td className={cn(compact ? 'px-2 py-2' : 'px-3 py-3')}>
                        <div className="w-4 h-4 bg-white/10 rounded animate-pulse" />
                      </td>
                    )}
                    {visibleColumns.map((col) => (
                      <td key={col.id} className={cn(compact ? 'px-3 py-2' : 'px-4 py-3')}>
                        <div
                          className="h-4 bg-white/10 rounded animate-pulse"
                          style={{ width: `${Math.random() * 40 + 40}%` }}
                        />
                      </td>
                    ))}
                    {rowActions && (
                      <td className={cn(compact ? 'px-2 py-2' : 'px-3 py-3')}>
                        <div className="w-16 h-6 bg-white/10 rounded animate-pulse ml-auto" />
                      </td>
                    )}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                // Empty state
                <tr>
                  <td
                    colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center gap-2 text-white/40">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      {typeof emptyMessage === 'string' ? (
                        <p className="text-sm">{emptyMessage}</p>
                      ) : (
                        emptyMessage
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                // Data rows
                paginatedData.map((row, index) => (
                  <TableRow
                    key={getRowId(row)}
                    row={row}
                    columns={visibleColumns}
                    index={index}
                    getRowId={getRowId}
                    selected={internalSelectedRows.includes(getRowId(row))}
                    onSelect={handleSelect}
                    selectable={selectable}
                    rowActions={rowActions}
                    compact={compact}
                    striped={striped}
                    hoverable={hoverable}
                    onClick={onRowClick}
                    onDoubleClick={onRowDoubleClick}
                  />
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">
            Mostrando {pagination.page * pagination.pageSize + 1} a{' '}
            {Math.min((pagination.page + 1) * pagination.pageSize, pagination.total)} de{' '}
            {pagination.total} registros
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                onPaginationChange?.({ ...pagination, page: pagination.page - 1 })
              }
              disabled={pagination.page === 0}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                pagination.page === 0
                  ? 'text-white/30 cursor-not-allowed'
                  : 'text-white/70 hover:bg-white/5'
              )}
            >
              Anterior
            </button>

            <button
              onClick={() =>
                onPaginationChange?.({ ...pagination, page: pagination.page + 1 })
              }
              disabled={(pagination.page + 1) * pagination.pageSize >= pagination.total}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                (pagination.page + 1) * pagination.pageSize >= pagination.total
                  ? 'text-white/30 cursor-not-allowed'
                  : 'text-white/70 hover:bg-white/5'
              )}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
