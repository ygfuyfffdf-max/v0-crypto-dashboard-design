'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 📜 AURORA VIRTUAL LIST — Lista virtualizada premium para grandes conjuntos de datos
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Componente de lista virtualizada que renderiza eficientemente:
 * ▸ 1000+ items sin problemas de rendimiento
 * ▸ Scroll suave a 60fps
 * ▸ Lazy rendering de items visibles
 * ▸ Animaciones de entrada elegantes
 * 
 * @version 1.0.0 — OMEGA SUPREME EDITION
 */

import React, { useRef, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/app/_lib/utils'
import { useFeedback } from '@/app/hooks/useSupremeSystems'
import { Loader2, ArrowUp, Search, Filter } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VirtualListItem {
  id: string
  [key: string]: unknown
}

interface AuroraVirtualListProps<T extends VirtualListItem> {
  items: T[]
  itemHeight: number
  renderItem: (item: T, index: number) => ReactNode
  overscan?: number
  className?: string
  containerClassName?: string
  emptyMessage?: string
  loading?: boolean
  onItemClick?: (item: T) => void
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  header?: ReactNode
  footer?: ReactNode
  scrollToTopThreshold?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔍 SEARCH BAR — Barra de búsqueda integrada
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

function SearchBar({ value, onChange, placeholder = 'Buscar...', className }: SearchBarProps) {
  const feedback = useFeedback()

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
        }}
        onFocus={() => feedback.click()}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
          ×
        </button>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📜 AURORA VIRTUAL LIST — Main component
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AuroraVirtualList<T extends VirtualListItem>({
  items,
  itemHeight,
  renderItem,
  overscan = 5,
  className,
  containerClassName,
  emptyMessage = 'No hay elementos para mostrar',
  loading = false,
  onItemClick,
  searchable = false,
  searchPlaceholder,
  onSearch,
  header,
  footer,
  scrollToTopThreshold = 500,
}: AuroraVirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const feedback = useFeedback()

  // Calculate visible range
  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2
    const end = Math.min(items.length - 1, start + visibleCount)

    const visible = []
    for (let i = start; i <= end; i++) {
      if (items[i]) {
        visible.push({
          index: i,
          item: items[i],
          style: {
            position: 'absolute' as const,
            top: i * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
          },
        })
      }
    }

    return { startIndex: start, endIndex: end, visibleItems: visible }
  }, [scrollTop, containerHeight, items, itemHeight, overscan])

  // Total height
  const totalHeight = items.length * itemHeight

  // Scroll handler
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    setScrollTop(target.scrollTop)
    setShowScrollTop(target.scrollTop > scrollToTopThreshold)
  }, [scrollToTopThreshold])

  // Resize observer
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setContainerHeight(entry.contentRect.height)
      }
    })

    resizeObserver.observe(container)
    setContainerHeight(container.clientHeight)

    return () => resizeObserver.disconnect()
  }, [])

  // Scroll to top
  const scrollToTop = useCallback(() => {
    const container = containerRef.current
    if (container) {
      feedback.swipe()
      container.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [feedback])

  // Scroll to item
  const scrollToItem = useCallback((index: number) => {
    const container = containerRef.current
    if (container) {
      const offset = index * itemHeight
      container.scrollTo({ top: offset, behavior: 'smooth' })
    }
  }, [itemHeight])

  // Search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }, [onSearch])

  // Handle item click
  const handleItemClick = useCallback((item: T) => {
    if (onItemClick) {
      feedback.click()
      onItemClick(item)
    }
  }, [onItemClick, feedback])

  return (
    <div className={cn('relative flex flex-col', className)}>
      {/* Search bar */}
      {searchable && (
        <div className="p-4 border-b border-white/10">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
          />
        </div>
      )}

      {/* Header */}
      {header && (
        <div className="p-4 border-b border-white/10">
          {header}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3 text-white">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Cargando...</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div className="space-y-2">
            <Filter className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-gray-400">{emptyMessage}</p>
          </div>
        </div>
      )}

      {/* Virtual list container */}
      {items.length > 0 && (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className={cn(
            'flex-1 overflow-auto relative',
            'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30',
            containerClassName
          )}
        >
          {/* Spacer for total height */}
          <div style={{ height: totalHeight, position: 'relative' }}>
            {/* Visible items */}
            <AnimatePresence mode="popLayout">
              {visibleItems.map(({ index, item, style }) => (
                <motion.div
                  key={item.id}
                  style={style}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    onItemClick && 'cursor-pointer hover:bg-white/5 transition-colors'
                  )}
                >
                  {renderItem(item, index)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="p-4 border-t border-white/10">
          {footer}
        </div>
      )}

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="absolute bottom-4 right-4 p-3 rounded-full bg-violet-500 text-white shadow-lg shadow-violet-500/25 hover:bg-violet-600 transition-colors z-20"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 AURORA VIRTUAL TABLE — Tabla virtualizada
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Column<T> {
  key: keyof T | string
  label: string
  width?: string | number
  render?: (value: unknown, item: T) => ReactNode
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

interface AuroraVirtualTableProps<T extends VirtualListItem> {
  items: T[]
  columns: Column<T>[]
  rowHeight?: number
  onRowClick?: (item: T) => void
  className?: string
  loading?: boolean
  emptyMessage?: string
}

export function AuroraVirtualTable<T extends VirtualListItem>({
  items,
  columns,
  rowHeight = 56,
  onRowClick,
  className,
  loading = false,
  emptyMessage = 'No hay datos',
}: AuroraVirtualTableProps<T>) {
  const renderItem = useCallback((item: T, _index: number) => (
    <div className="flex items-center h-full px-4 border-b border-white/5">
      {columns.map((col) => {
        const value = typeof col.key === 'string' && col.key.includes('.')
          ? col.key.split('.').reduce((obj: unknown, key) => (obj as Record<string, unknown>)?.[key], item)
          : item[col.key as keyof T]

        return (
          <div
            key={String(col.key)}
            className={cn(
              'flex-shrink-0',
              col.align === 'center' && 'text-center',
              col.align === 'right' && 'text-right'
            )}
            style={{ width: col.width || `${100 / columns.length}%` }}
          >
            {col.render ? col.render(value, item) : String(value ?? '-')}
          </div>
        )
      })}
    </div>
  ), [columns])

  return (
    <div className={cn('flex flex-col rounded-xl overflow-hidden bg-white/5 border border-white/10', className)}>
      {/* Header */}
      <div className="flex items-center h-12 px-4 bg-white/5 border-b border-white/10">
        {columns.map((col) => (
          <div
            key={String(col.key)}
            className={cn(
              'flex-shrink-0 text-sm font-medium text-gray-400',
              col.align === 'center' && 'text-center',
              col.align === 'right' && 'text-right'
            )}
            style={{ width: col.width || `${100 / columns.length}%` }}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Body */}
      <AuroraVirtualList
        items={items}
        itemHeight={rowHeight}
        renderItem={renderItem}
        onItemClick={onRowClick}
        loading={loading}
        emptyMessage={emptyMessage}
        className="flex-1 min-h-[300px]"
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { SearchBar }
export type { 
  VirtualListItem, 
  AuroraVirtualListProps, 
  Column, 
  AuroraVirtualTableProps 
}
