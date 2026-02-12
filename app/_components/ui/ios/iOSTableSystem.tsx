'use client'

import { memo, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/app/_lib/utils'
import { ChevronLeft, ChevronRight, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  className?: string
  width?: string | number
  mobileLabel?: string // Label para la vista de tarjeta móvil
  hideOnMobile?: boolean
}

export interface TableAction<T> {
  label: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  onClick: (item: T) => void
  variant?: 'default' | 'danger' | 'success' | 'ghost'
}

interface iOSTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyField: keyof T
  title?: string
  subtitle?: string
  actions?: TableAction<T>[]
  onRowClick?: (item: T) => void
  loading?: boolean
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  search?: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }
  filters?: {
    activeCount: number
    onFilterClick: () => void
  }
  dateRange?: {
    start: string
    end: string
    onStartChange: (val: string) => void
    onEndChange: (val: string) => void
  }
  onExport?: () => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VIRTUALIZED TABLE (For large datasets)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VirtualizedTableProps<T> extends iOSTableProps<T> {
  height?: number | string
  rowHeight?: number
}

export const iOSVirtualizedTable = memo(function iOSVirtualizedTable<T extends Record<string, any>>({
  title,
  subtitle,
  data,
  columns,
  keyField,
  actions,
  search,
  filters,
  dateRange,
  onExport,
  onRowClick,
  className,
  height = '600px',
  rowHeight = 60
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  })

  return (
    <div className={cn('overflow-hidden flex flex-col rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm', className)}>
      {/* Header Section (Same as standard table) */}
      {(title || search || filters || actions || dateRange || onExport) && (
        <div className="p-4 border-b border-white/10 space-y-4">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            {title && (
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
                {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
              </div>
            )}
            
            <div className="flex flex-col md:flex-row items-center gap-2 w-full xl:w-auto">
              {dateRange && (
                <div className="flex items-center gap-2 bg-black/20 rounded-xl p-1 border border-white/10">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => dateRange.onStartChange(e.target.value)}
                    className="bg-transparent text-xs text-white/80 outline-none px-2 py-1.5 calendar-picker-indicator:invert"
                  />
                  <span className="text-white/30">-</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => dateRange.onEndChange(e.target.value)}
                    className="bg-transparent text-xs text-white/80 outline-none px-2 py-1.5 calendar-picker-indicator:invert"
                  />
                </div>
              )}

              {search && (
                <div className="relative flex-1 md:w-64 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    value={search.value}
                    onChange={(e) => search.onChange(e.target.value)}
                    placeholder={search.placeholder || 'Buscar...'}
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors"
                  />
                </div>
              )}
              
              <div className="flex items-center gap-2 self-end md:self-auto">
                {filters && (
                  <button
                    onClick={filters.onFilterClick}
                    className={cn(
                      "p-2 rounded-xl transition-colors border border-white/10",
                      filters.activeCount ? "text-violet-400 bg-violet-500/10 border-violet-500/30" : "text-white/70 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                )}

                {onExport && (
                  <button
                    onClick={onExport}
                    className="p-2 rounded-xl transition-colors border border-white/10 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30"
                    title="Exportar CSV"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Virtualized List */}
      <div 
        ref={parentRef} 
        className="w-full overflow-auto"
        style={{ height }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {/* Header Row (Sticky) */}
          <div className="sticky top-0 z-10 grid bg-[#1C1C1E]/95 backdrop-blur-xl border-b border-white/10"
               style={{
                 gridTemplateColumns: columns.map(c => c.width ? (typeof c.width === 'number' ? `${c.width}px` : c.width) : '1fr').join(' '),
                 width: '100%',
               }}>
            {columns.map((col, i) => (
              <div 
                key={String(col.key) || i}
                className={cn(
                  "px-6 py-3 text-xs font-medium text-white/50 uppercase tracking-wider truncate",
                  col.className
                )}
              >
                {col.header}
              </div>
            ))}
          </div>

          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = data[virtualRow.index]
            return (
              <div
                key={String(item[keyField])}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "absolute top-0 left-0 w-full grid items-center border-b border-white/5 transition-colors hover:bg-white/[0.03]",
                  onRowClick && "cursor-pointer active:bg-white/[0.05]"
                )}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  gridTemplateColumns: columns.map(c => c.width ? (typeof c.width === 'number' ? `${c.width}px` : c.width) : '1fr').join(' '),
                }}
              >
                {columns.map((col, i) => (
                  <div 
                    key={String(col.key) || i} 
                    className={cn("px-6 text-sm text-white/80 truncate", col.className)}
                  >
                    {col.render ? col.render(item) : String(item[col.key as keyof T])}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// STANDARD TABLE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const iOSTable = <T extends Record<string, any>>({
  data,
  columns,
  keyField,
  title,
  actions,
  onRowClick,
  loading,
  pagination,
  search,
  className,
}: iOSTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  // Handle Sort
  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  // Sort Data (Client side simple sort)
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header & Controls */}
      {(title || search) && (
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/[0.03] p-4 rounded-2xl backdrop-blur-md border border-white/[0.05]">
          {title && (
            <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          )}
          
          {search && (
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input
                type="text"
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder={search.placeholder || 'Buscar...'}
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={cn(
                      "px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider",
                      col.sortable && "cursor-pointer hover:text-white/70 transition-colors",
                      col.className
                    )}
                    style={{ width: col.width }}
                    onClick={() => col.sortable && handleSort(col.key as string)}
                  >
                    <div className="flex items-center gap-2">
                      {col.header}
                      {col.sortable && (
                        <div className="text-white/30">
                          {sortConfig?.key === col.key ? (
                            sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                          ) : (
                            <ArrowUpDown size={12} />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {actions && <th className="px-6 py-4 text-right text-xs font-medium text-white/50 uppercase">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {loading ? (
                // Loading Skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                    {actions && <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded animate-pulse w-8 ml-auto" /></td>}
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-white/30">
                    No se encontraron datos
                  </td>
                </tr>
              ) : (
                sortedData.map((item, rowIdx) => (
                  <motion.tr
                    key={item[keyField] as string}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rowIdx * 0.05 }}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      "group hover:bg-white/[0.03] transition-colors",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={cn("px-6 py-4 text-sm text-white/80", col.className)}>
                        {col.render ? col.render(item) : item[col.key as string]}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {actions.map((action, actionIdx) => (
                            <button
                              key={actionIdx}
                              onClick={(e) => {
                                e.stopPropagation()
                                action.onClick(item)
                              }}
                              className={cn(
                                "p-2 rounded-lg transition-colors",
                                action.variant === 'danger' ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" :
                                action.variant === 'success' ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" :
                                "bg-white/5 text-white/70 hover:bg-white/10"
                              )}
                              title={action.label}
                            >
                              {action.icon ? <action.icon size={16} /> : action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/[0.03] rounded-2xl p-4 animate-pulse h-32" />
          ))
        ) : sortedData.length === 0 ? (
          <div className="text-center py-12 text-white/30">No se encontraron datos</div>
        ) : (
          sortedData.map((item, idx) => (
            <motion.div
              key={item[keyField] as string}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4 active:scale-[0.98] transition-transform",
                onRowClick && "cursor-pointer"
              )}
            >
              <div className="space-y-3">
                {/* Primeras 2 columnas como Header de la card */}
                <div className="flex justify-between items-start border-b border-white/[0.05] pb-3 mb-3">
                  <div className="space-y-1">
                    <span className="text-xs text-white/40 uppercase tracking-wider">{columns[0].header}</span>
                    <div className="font-semibold text-white">
                      {columns[0].render ? columns[0].render(item) : item[columns[0].key as string]}
                    </div>
                  </div>
                  {columns[1] && (
                    <div className="text-right space-y-1">
                       <span className="text-xs text-white/40 uppercase tracking-wider">{columns[1].header}</span>
                       <div className="text-white/90">
                         {columns[1].render ? columns[1].render(item) : item[columns[1].key as string]}
                       </div>
                    </div>
                  )}
                </div>

                {/* Resto de columnas */}
                <div className="grid grid-cols-2 gap-3">
                  {columns.slice(2).filter(c => !c.hideOnMobile).map((col, i) => (
                    <div key={i} className="space-y-1">
                      <span className="text-xs text-white/40">{col.mobileLabel || col.header}</span>
                      <div className="text-sm text-white/80">
                        {col.render ? col.render(item) : item[col.key as string]}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {actions && (
                  <div className="flex gap-2 pt-3 border-t border-white/[0.05] justify-end">
                    {actions.map((action, actionIdx) => (
                      <button
                        key={actionIdx}
                        onClick={(e) => {
                          e.stopPropagation()
                          action.onClick(item)
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5",
                          action.variant === 'danger' ? "bg-red-500/10 text-red-400" :
                          action.variant === 'success' ? "bg-green-500/10 text-green-400" :
                          "bg-white/5 text-white/70"
                        )}
                      >
                        {action.icon && <action.icon size={12} />}
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-4">
          <button
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="p-2 rounded-xl bg-white/5 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-white/50 font-medium">
            Página {pagination.currentPage} de {pagination.totalPages}
          </span>
          <button
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="p-2 rounded-xl bg-white/5 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}
