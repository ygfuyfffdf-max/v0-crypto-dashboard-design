/**
 * 🎯 RESPONSIVE GRID 2026 - LAYOUT PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════
 * Sistema de grid responsive optimizado
 * - Auto-layout inteligente
 * - Animaciones de entrada staggered
 * - Responsive breakpoints optimizados
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { motion } from 'motion/react'
import React from 'react'

// Spring physics avanzados
const SPRING_GENTLE = { type: 'spring' as const, stiffness: 200, damping: 25, mass: 1.2 }

export interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  columns?: 1 | 2 | 3 | 4 | 6
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  staggerDelay?: number
}

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-5',
  xl: 'gap-6',
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
}

export function ResponsiveGrid({
  children,
  className = '',
  columns = 3,
  gap = 'lg',
  staggerDelay = 0.05,
}: ResponsiveGridProps) {
  return (
    <motion.div
      className={`grid auto-rows-min ${columnClasses[columns]} ${gapClasses[gap]} ${className} `}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            ...SPRING_GENTLE,
            staggerChildren: staggerDelay,
            delayChildren: 0.15,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// GRID ITEM WRAPPER (para animaciones consistentes)
// ═══════════════════════════════════════════════════════════════════════════

export interface ResponsiveGridItemProps {
  children: React.ReactNode
  className?: string
  span?: 1 | 2 | 3 | 4
  rowSpan?: 1 | 2 | 3
}

export function ResponsiveGridItem({
  children,
  className = '',
  span = 1,
  rowSpan = 1,
}: ResponsiveGridItemProps) {
  const spanClasses = {
    1: 'col-span-1',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-2 lg:col-span-3',
    4: 'col-span-1 md:col-span-2 lg:col-span-4',
  }

  const rowSpanClasses = {
    1: 'row-span-1',
    2: 'row-span-1 md:row-span-2',
    3: 'row-span-1 md:row-span-3',
  }

  return (
    <motion.div
      className={`${spanClasses[span]} ${rowSpanClasses[rowSpan]} ${className}`}
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.92 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            ...SPRING_GENTLE,
            duration: 0.7,
            ease: [0.19, 1, 0.22, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
