/**
 * ⚡ QUICK ACTIONS WIDGET - ACCIONES RÁPIDAS
 * ═══════════════════════════════════════════════════════════════════════════
 * Menú flotante radial con acciones rápidas y atajos de teclado
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Users,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string
  color?: string
  onClick?: () => void
}

export interface QuickActionsWidgetProps {
  actions?: QuickAction[]
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  onActionClick?: (actionId: string) => void
  className?: string
}

export interface InlineQuickActionsProps {
  actions: QuickAction[]
  onActionClick?: (actionId: string) => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_ACTIONS: QuickAction[] = [
  {
    id: 'nueva-venta',
    label: 'Nueva Venta',
    icon: <ShoppingCart className="h-5 w-5" />,
    shortcut: '⌘+V',
    color: '#f43f5e',
  },
  {
    id: 'nuevo-cliente',
    label: 'Nuevo Cliente',
    icon: <Users className="h-5 w-5" />,
    shortcut: '⌘+C',
    color: '#8b5cf6',
  },
  {
    id: 'nuevo-ingreso',
    label: 'Nuevo Ingreso',
    icon: <ArrowUpRight className="h-5 w-5" />,
    shortcut: '⌘+I',
    color: '#10b981',
  },
  {
    id: 'nuevo-gasto',
    label: 'Nuevo Gasto',
    icon: <ArrowDownRight className="h-5 w-5" />,
    shortcut: '⌘+G',
    color: '#ef4444',
  },
  {
    id: 'nueva-transferencia',
    label: 'Transferencia',
    icon: <ArrowLeftRight className="h-5 w-5" />,
    shortcut: '⌘+T',
    color: '#3b82f6',
  },
  {
    id: 'nueva-orden',
    label: 'Nueva Orden',
    icon: <Package className="h-5 w-5" />,
    shortcut: '⌘+O',
    color: '#f97316',
  },
  {
    id: 'buscar',
    label: 'Buscar',
    icon: <Search className="h-5 w-5" />,
    shortcut: '⌘+K',
    color: '#6366f1',
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// QUICK ACTIONS WIDGET (RADIAL FAB)
// ═══════════════════════════════════════════════════════════════════════════

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  actions = DEFAULT_ACTIONS,
  position = 'bottom-right',
  onActionClick,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'q') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }

      // Action shortcuts when menu is open
      if (isOpen && (e.metaKey || e.ctrlKey)) {
        const action = actions.find((a) => a.shortcut?.toLowerCase().includes(e.key.toLowerCase()))
        if (action) {
          e.preventDefault()
          onActionClick?.(action.id)
          action.onClick?.()
          setIsOpen(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, actions, onActionClick])

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  }

  const radius = 90 // Distance from center

  return (
    <div className={cn('fixed z-50', positionClasses[position], className)}>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Action buttons in arc */}
      <AnimatePresence>
        {isOpen &&
          actions.map((action, index) => {
            // Calculate position in arc
            const startAngle = position.includes('right') ? 180 : 0
            const endAngle = position.includes('bottom') ? startAngle - 90 : startAngle + 90
            const angleStep = (endAngle - startAngle) / (actions.length - 1 || 1)
            const angle = (startAngle + angleStep * index) * (Math.PI / 180)

            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius

            return (
              <motion.button
                key={action.id}
                className="absolute flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 shadow-lg backdrop-blur-xl"
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  x,
                  y,
                  scale: 1,
                  transition: { delay: index * 0.05 },
                }}
                exit={{
                  opacity: 0,
                  x: 0,
                  y: 0,
                  scale: 0,
                  transition: { delay: (actions.length - index) * 0.03 },
                }}
                whileHover={{ scale: 1.1 }}
                onClick={() => {
                  onActionClick?.(action.id)
                  action.onClick?.()
                  setIsOpen(false)
                }}
                style={{
                  originX: 0.5,
                  originY: 0.5,
                  backgroundColor: action.color ? `${action.color}20` : undefined,
                }}
              >
                <div style={{ color: action.color || '#fff' }}>{action.icon}</div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{action.label}</p>
                  {action.shortcut && <p className="text-xs text-white/40">{action.shortcut}</p>}
                </div>
              </motion.button>
            )
          })}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        className={cn(
          'relative h-14 w-14 rounded-2xl shadow-lg',
          'bg-gradient-to-br from-indigo-500 to-purple-600',
          'flex items-center justify-center text-white',
          'transition-shadow hover:shadow-xl hover:shadow-indigo-500/30',
        )}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}

        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-white/20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* Shortcut hint */}
      {!isOpen && (
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/60 px-2 py-1 text-xs whitespace-nowrap text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          ⌘+Q
        </motion.div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// INLINE QUICK ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const InlineQuickActions: React.FC<InlineQuickActionsProps> = ({
  actions,
  onActionClick,
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {actions.map((action, index) => (
        <motion.button
          key={action.id}
          className={cn(
            'flex items-center gap-2 rounded-xl px-3 py-2',
            'border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
            'text-sm text-white transition-all',
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            onActionClick?.(action.id)
            action.onClick?.()
          }}
        >
          <div style={{ color: action.color || '#fff' }}>{action.icon}</div>
          <span>{action.label}</span>
          {action.shortcut && <span className="ml-1 text-xs text-white/30">{action.shortcut}</span>}
        </motion.button>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT QUICK ACTIONS BAR
// ═══════════════════════════════════════════════════════════════════════════

export const QuickActionsBar: React.FC<{
  actions?: QuickAction[]
  onActionClick?: (actionId: string) => void
  className?: string
}> = ({ actions = DEFAULT_ACTIONS, onActionClick, className }) => {
  return (
    <motion.div
      className={cn(
        'flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1.5',
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {actions.slice(0, 5).map((action) => (
        <motion.button
          key={action.id}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            onActionClick?.(action.id)
            action.onClick?.()
          }}
          title={`${action.label} ${action.shortcut || ''}`}
        >
          <div style={{ color: action.color || '#fff' }}>{action.icon}</div>
        </motion.button>
      ))}
    </motion.div>
  )
}

export default QuickActionsWidget
