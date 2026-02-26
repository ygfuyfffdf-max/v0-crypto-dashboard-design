'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ⚡ VIRTUALIZED LIST COMPONENT — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Componente de lista virtualizada para alto rendimiento:
 * - Renderiza solo elementos visibles
 * - Soporte para scroll infinito
 * - Overscan configurable
 * - Animaciones optimizadas
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { motion } from 'motion/react'
import {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T, index: number) => string
  className?: string
  overscan?: number
  onEndReached?: () => void
  onEndReachedThreshold?: number
  emptyComponent?: ReactNode
  loadingComponent?: ReactNode
  isLoading?: boolean
  estimatedItemSize?: number
  gap?: number
}

interface VirtualItem<T> {
  index: number
  item: T
  style: React.CSSProperties
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VIRTUALIZED LIST COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function VirtualizedListInner<T>(
  {
    items,
    itemHeight,
    renderItem,
    keyExtractor,
    className,
    overscan = 5,
    onEndReached,
    onEndReachedThreshold = 0.8,
    emptyComponent,
    loadingComponent,
    isLoading,
    gap = 0,
  }: VirtualizedListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const hasCalledEndRef = useRef(false)

  // Calculate total height including gaps
  const totalHeight = useMemo(() => {
    return items.length * (itemHeight + gap) - gap
  }, [items.length, itemHeight, gap])

  // Calculate visible range
  const { startIndex, endIndex, virtualItems } = useMemo(() => {
    if (containerHeight === 0 || items.length === 0) {
      return { startIndex: 0, endIndex: 0, virtualItems: [] as VirtualItem<T>[] }
    }

    const itemWithGap = itemHeight + gap
    const visibleCount = Math.ceil(containerHeight / itemWithGap)
    const start = Math.max(0, Math.floor(scrollTop / itemWithGap) - overscan)
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2)

    const virtual: VirtualItem<T>[] = []
    for (let i = start; i <= end; i++) {
      virtual.push({
        index: i,
        item: items[i]!,
        style: {
          position: 'absolute',
          top: i * itemWithGap,
          left: 0,
          right: 0,
          height: itemHeight,
        },
      })
    }

    return { startIndex: start, endIndex: end, virtualItems: virtual }
  }, [items, itemHeight, gap, scrollTop, containerHeight, overscan])

  // Handle scroll
  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement
    setScrollTop(target.scrollTop)

    // Check if reached end
    if (onEndReached && !hasCalledEndRef.current) {
      const scrollPercentage =
        (target.scrollTop + target.clientHeight) / target.scrollHeight

      if (scrollPercentage >= onEndReachedThreshold) {
        hasCalledEndRef.current = true
        onEndReached()
      }
    }
  }, [onEndReached, onEndReachedThreshold])

  // Reset end reached flag when items change
  useEffect(() => {
    hasCalledEndRef.current = false
  }, [items.length])

  // Setup resize observer
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateHeight = () => {
      setContainerHeight(container.clientHeight)
    }

    updateHeight()

    container.addEventListener('scroll', handleScroll, { passive: true })

    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      resizeObserver.disconnect()
    }
  }, [handleScroll])

  // Forward ref
  useEffect(() => {
    if (typeof ref === 'function') {
      ref(containerRef.current)
    } else if (ref) {
      ref.current = containerRef.current
    }
  }, [ref])

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <div
        ref={containerRef}
        className={cn('relative overflow-auto', className)}
      >
        {emptyComponent || (
          <div className="flex items-center justify-center p-8 text-white/50">
            No hay elementos
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-auto scrollbar-thin scrollbar-thumb-white/10',
        className
      )}
    >
      {/* Spacer to maintain scroll height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map((virtualItem) => (
          <motion.div
            key={keyExtractor(virtualItem.item, virtualItem.index)}
            style={virtualItem.style}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {renderItem(virtualItem.item, virtualItem.index)}
          </motion.div>
        ))}
      </div>

      {/* Loading indicator at bottom */}
      {isLoading && loadingComponent && (
        <div className="sticky bottom-0 left-0 right-0">
          {loadingComponent}
        </div>
      )}
    </div>
  )
}

// Properly typed forwardRef
export const VirtualizedList = memo(
  VirtualizedListInner as <T>(
    props: VirtualizedListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
  ) => ReactNode
) as <T>(
  props: VirtualizedListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => ReactNode

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VIRTUALIZED GRID COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VirtualizedGridProps<T> {
  items: T[]
  columns: number
  itemWidth: number
  itemHeight: number
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T, index: number) => string
  className?: string
  overscan?: number
  gap?: number
  onEndReached?: () => void
  emptyComponent?: ReactNode
}

function VirtualizedGridInner<T>(
  {
    items,
    columns,
    itemWidth,
    itemHeight,
    renderItem,
    keyExtractor,
    className,
    overscan = 2,
    gap = 16,
    onEndReached,
    emptyComponent,
  }: VirtualizedGridProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  // Calculate rows
  const rowCount = Math.ceil(items.length / columns)
  const rowHeight = itemHeight + gap
  const totalHeight = rowCount * rowHeight - gap

  // Calculate visible range
  const { virtualItems } = useMemo(() => {
    if (containerHeight === 0 || items.length === 0) {
      return { virtualItems: [] }
    }

    const visibleRowCount = Math.ceil(containerHeight / rowHeight)
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const endRow = Math.min(rowCount - 1, startRow + visibleRowCount + overscan * 2)

    const virtual: Array<{ index: number; item: T; style: React.CSSProperties }> = []

    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col
        if (index >= items.length) break

        virtual.push({
          index,
          item: items[index]!,
          style: {
            position: 'absolute',
            top: row * rowHeight,
            left: col * (itemWidth + gap),
            width: itemWidth,
            height: itemHeight,
          },
        })
      }
    }

    return { virtualItems: virtual }
  }, [items, columns, itemWidth, itemHeight, gap, rowHeight, rowCount, scrollTop, containerHeight, overscan])

  // Handle scroll
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollTop(container.scrollTop)

      // Check if reached end (90% scrolled)
      if (onEndReached) {
        const scrollPercentage =
          (container.scrollTop + container.clientHeight) / container.scrollHeight
        if (scrollPercentage >= 0.9) {
          onEndReached()
        }
      }
    }

    const updateHeight = () => {
      setContainerHeight(container.clientHeight)
    }

    updateHeight()
    container.addEventListener('scroll', handleScroll, { passive: true })

    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      resizeObserver.disconnect()
    }
  }, [onEndReached])

  // Forward ref
  useEffect(() => {
    if (typeof ref === 'function') {
      ref(containerRef.current)
    } else if (ref) {
      ref.current = containerRef.current
    }
  }, [ref])

  if (items.length === 0) {
    return (
      <div ref={containerRef} className={cn('relative overflow-auto', className)}>
        {emptyComponent || (
          <div className="flex items-center justify-center p-8 text-white/50">
            No hay elementos
          </div>
        )}
      </div>
    )
  }

  const gridWidth = columns * itemWidth + (columns - 1) * gap

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-auto scrollbar-thin scrollbar-thumb-white/10',
        className
      )}
    >
      <div
        style={{
          height: totalHeight,
          width: gridWidth,
          position: 'relative',
          margin: '0 auto',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <motion.div
            key={keyExtractor(virtualItem.item, virtualItem.index)}
            style={virtualItem.style}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            {renderItem(virtualItem.item, virtualItem.index)}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export const VirtualizedGrid = memo(
  VirtualizedGridInner as <T>(
    props: VirtualizedGridProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
  ) => ReactNode
) as <T>(
  props: VirtualizedGridProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => ReactNode

export default VirtualizedList
