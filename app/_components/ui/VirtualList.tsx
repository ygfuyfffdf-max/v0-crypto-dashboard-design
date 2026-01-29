'use client'

import { memo, useCallback, useRef, useState, useMemo, type ReactNode, type UIEvent } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/app/_lib/utils'

// ============================================
// VIRTUAL LIST - Para listas largas
// ============================================

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  height: number
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  overscan?: number
}

export const VirtualList = memo(function VirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  className,
  overscan = 3,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const { startIndex, endIndex, visibleItems, totalHeight } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(height / itemHeight)
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2)

    const visible = items.slice(start, end + 1).map((item, index) => ({
      item,
      index: start + index,
    }))

    return {
      startIndex: start,
      endIndex: end,
      visibleItems: visible,
      totalHeight: items.length * itemHeight,
    }
  }, [items, scrollTop, height, itemHeight, overscan])

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height, overflow: 'auto' }}
      className={cn('relative', className)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}) as <T>(props: VirtualListProps<T>) => JSX.Element

// ============================================
// OPTIMIZED TABLE
// ============================================

interface Column<T> {
  key: string
  header: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render: (item: T, index: number) => ReactNode
}

interface OptimizedTableProps<T> {
  data: T[]
  columns: Column<T>[]
  rowHeight?: number
  maxHeight?: number
  onRowClick?: (item: T, index: number) => void
  className?: string
  loading?: boolean
  emptyMessage?: string
}

export const OptimizedTable = memo(function OptimizedTable<T>({
  data,
  columns,
  rowHeight = 56,
  maxHeight = 400,
  onRowClick,
  className,
  loading = false,
  emptyMessage = 'No hay datos',
}: OptimizedTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)

  // Virtualización
  const visibleRows = useMemo(() => {
    const overscan = 2
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const visibleCount = Math.ceil(maxHeight / rowHeight)
    const end = Math.min(data.length - 1, start + visibleCount + overscan * 2)

    return data.slice(start, end + 1).map((item, i) => ({
      item,
      index: start + i,
    }))
  }, [data, scrollTop, rowHeight, maxHeight])

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  if (loading) {
    return (
      <div className={cn('rounded-xl bg-white/[0.02] border border-white/5', className)}>
        <div className="animate-pulse p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn('rounded-xl bg-white/[0.02] border border-white/5 p-8 text-center', className)}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex bg-white/[0.03] border-b border-white/5 sticky top-0 z-10">
        {columns.map((col) => (
          <div
            key={col.key}
            style={{ width: col.width || 'auto', flex: col.width ? 'none' : 1 }}
            className={cn(
              'px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider',
              col.align === 'center' && 'text-center',
              col.align === 'right' && 'text-right'
            )}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* Body - Virtualizado */}
      <div
        onScroll={handleScroll}
        style={{ maxHeight: maxHeight - 48, overflow: 'auto' }}
      >
        <div style={{ height: data.length * rowHeight, position: 'relative' }}>
          {visibleRows.map(({ item, index }) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: 'absolute',
                top: index * rowHeight,
                left: 0,
                right: 0,
                height: rowHeight,
              }}
              onClick={() => onRowClick?.(item, index)}
              className={cn(
                'flex items-center border-b border-white/5',
                'hover:bg-white/[0.03] transition-colors cursor-pointer'
              )}
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  style={{ width: col.width || 'auto', flex: col.width ? 'none' : 1 }}
                  className={cn(
                    'px-4 py-2',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                >
                  {col.render(item, index)}
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}) as <T>(props: OptimizedTableProps<T>) => JSX.Element

// ============================================
// SKELETON LOADER
// ============================================

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'card' | 'circle' | 'rect'
  width?: string | number
  height?: string | number
}

export const Skeleton = memo(function Skeleton({
  className,
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const baseClass = 'animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]'

  const variantClasses = {
    text: 'h-4 rounded',
    card: 'rounded-xl',
    circle: 'rounded-full',
    rect: 'rounded-lg',
  }

  return (
    <div
      className={cn(baseClass, variantClasses[variant], className)}
      style={{ width, height }}
    />
  )
})

// ============================================
// LOADING GRID
// ============================================

interface LoadingGridProps {
  count?: number
  columns?: number
  itemHeight?: number
  className?: string
}

export const LoadingGrid = memo(function LoadingGrid({
  count = 6,
  columns = 3,
  itemHeight = 180,
  className,
}: LoadingGridProps) {
  return (
    <div
      className={cn('grid gap-4', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} variant="card" height={itemHeight} />
      ))}
    </div>
  )
})
