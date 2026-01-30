/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ⚡ CHRONOS 2026 — iOS DASHBOARD QUICK ACTIONS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Componente de acciones rápidas para el dashboard con:
 * - Acceso rápido a funciones principales
 * - Diseño iOS premium
 * - Animaciones sutiles
 * - Integración con system toast
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus,
  ShoppingCart,
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  Users,
  Truck,
  Package,
  FileText,
  Settings,
  TrendingUp,
  Wallet,
  LucideIcon,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { memo, useState, useCallback } from 'react'
import { useIOSToast } from '@/app/_hooks/useIOSToast'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuickAction {
  id: string
  label: string
  icon: LucideIcon
  color: string
  bgColor: string
  onClick?: () => void
  href?: string
  badge?: number | string
  description?: string
}

interface iOSDashboardQuickActionsProps {
  onNewVenta?: () => void
  onNewIngreso?: () => void
  onNewGasto?: () => void
  onNewTransferencia?: () => void
  onViewClientes?: () => void
  onViewDistribuidores?: () => void
  onViewInventario?: () => void
  onViewReportes?: () => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE DE ACCIÓN INDIVIDUAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuickActionCardProps {
  action: QuickAction
  variant?: 'grid' | 'list'
}

const QuickActionCard = memo(function QuickActionCard({
  action,
  variant = 'grid',
}: QuickActionCardProps) {
  const Icon = action.icon

  if (variant === 'list') {
    return (
      <motion.button
        onClick={action.onClick}
        className={cn(
          'w-full flex items-center gap-4 p-4 rounded-xl',
          'bg-white/[0.04] border border-white/[0.06]',
          'hover:bg-white/[0.08] active:scale-[0.99]',
          'transition-all duration-200'
        )}
        whileTap={{ scale: 0.99 }}
      >
        <div className={cn('p-3 rounded-xl', action.bgColor)}>
          <Icon className={cn('h-5 w-5', action.color)} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-[15px] font-medium text-white">{action.label}</p>
          {action.description && (
            <p className="text-[13px] text-white/50">{action.description}</p>
          )}
        </div>
        {action.badge !== undefined && (
          <span className="px-2.5 py-1 rounded-full bg-violet-500/20 text-[12px] font-semibold text-violet-400">
            {action.badge}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-white/30" />
      </motion.button>
    )
  }

  return (
    <motion.button
      onClick={action.onClick}
      className={cn(
        'relative flex flex-col items-center gap-2 p-4 rounded-2xl',
        'bg-white/[0.04] border border-white/[0.06]',
        'hover:bg-white/[0.08] active:scale-[0.97]',
        'transition-all duration-200',
        'min-w-[100px]'
      )}
      whileTap={{ scale: 0.97 }}
    >
      {/* Badge */}
      {action.badge !== undefined && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
        >
          {action.badge}
        </motion.span>
      )}

      <div className={cn('p-3 rounded-xl', action.bgColor)}>
        <Icon className={cn('h-6 w-6', action.color)} />
      </div>
      <span className="text-[13px] font-medium text-white/80 text-center">
        {action.label}
      </span>
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GRUPO DE ACCIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuickActionGroupProps {
  title?: string
  actions: QuickAction[]
  variant?: 'grid' | 'list' | 'horizontal'
  columns?: 2 | 3 | 4 | 5
  className?: string
}

export const QuickActionGroup = memo(function QuickActionGroup({
  title,
  actions,
  variant = 'grid',
  columns = 4,
  className,
}: QuickActionGroupProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
  }

  return (
    <div className={className}>
      {title && (
        <h3 className="text-[13px] font-semibold text-white/50 uppercase tracking-wide mb-3 px-1">
          {title}
        </h3>
      )}

      {variant === 'horizontal' ? (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {actions.map((action) => (
            <QuickActionCard key={action.id} action={action} variant="grid" />
          ))}
        </div>
      ) : variant === 'list' ? (
        <div className="space-y-2">
          {actions.map((action) => (
            <QuickActionCard key={action.id} action={action} variant="list" />
          ))}
        </div>
      ) : (
        <div className={cn('grid gap-3', gridCols[columns])}>
          {actions.map((action) => (
            <QuickActionCard key={action.id} action={action} variant="grid" />
          ))}
        </div>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const iOSDashboardQuickActions = memo(function iOSDashboardQuickActions({
  onNewVenta,
  onNewIngreso,
  onNewGasto,
  onNewTransferencia,
  onViewClientes,
  onViewDistribuidores,
  onViewInventario,
  onViewReportes,
  className,
}: iOSDashboardQuickActionsProps) {
  const toast = useIOSToast()

  const primaryActions: QuickAction[] = [
    {
      id: 'new-venta',
      label: 'Nueva Venta',
      icon: ShoppingCart,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      onClick: onNewVenta || (() => toast.info('Nueva venta')),
    },
    {
      id: 'new-ingreso',
      label: 'Ingreso',
      icon: ArrowDown,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      onClick: onNewIngreso || (() => toast.info('Nuevo ingreso')),
    },
    {
      id: 'new-gasto',
      label: 'Gasto',
      icon: ArrowUp,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/20',
      onClick: onNewGasto || (() => toast.info('Nuevo gasto')),
    },
    {
      id: 'transferencia',
      label: 'Transferir',
      icon: ArrowLeftRight,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/20',
      onClick: onNewTransferencia || (() => toast.info('Nueva transferencia')),
    },
  ]

  const secondaryActions: QuickAction[] = [
    {
      id: 'clientes',
      label: 'Clientes',
      description: 'Gestionar clientes',
      icon: Users,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      onClick: onViewClientes,
    },
    {
      id: 'distribuidores',
      label: 'Distribuidores',
      description: 'Gestionar proveedores',
      icon: Truck,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      onClick: onViewDistribuidores,
    },
    {
      id: 'inventario',
      label: 'Inventario',
      description: 'Control de stock',
      icon: Package,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      onClick: onViewInventario,
    },
    {
      id: 'reportes',
      label: 'Reportes',
      description: 'Ver análisis',
      icon: TrendingUp,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20',
      onClick: onViewReportes,
    },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Acciones principales */}
      <QuickActionGroup
        title="Acciones Rápidas"
        actions={primaryActions}
        variant="horizontal"
      />

      {/* Acciones secundarias */}
      <QuickActionGroup
        title="Módulos"
        actions={secondaryActions}
        variant="list"
      />
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FLOATING QUICK ACTION BAR (Mobile)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FloatingQuickBarProps {
  onNewVenta?: () => void
  onNewIngreso?: () => void
  onNewGasto?: () => void
  className?: string
}

export const FloatingQuickBar = memo(function FloatingQuickBar({
  onNewVenta,
  onNewIngreso,
  onNewGasto,
  className,
}: FloatingQuickBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const actions = [
    { id: 'venta', icon: ShoppingCart, color: 'bg-emerald-500', onClick: onNewVenta },
    { id: 'ingreso', icon: ArrowDown, color: 'bg-blue-500', onClick: onNewIngreso },
    { id: 'gasto', icon: ArrowUp, color: 'bg-rose-500', onClick: onNewGasto },
  ]

  return (
    <div className={cn('fixed bottom-24 right-4 z-40', className)}>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  action.onClick?.()
                  setIsExpanded(false)
                }}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center shadow-lg',
                  action.color
                )}
              >
                <action.icon className="h-5 w-5 text-white" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 rounded-full bg-violet-500 flex items-center justify-center shadow-[0_4px_20px_rgba(139,92,246,0.4)]"
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isExpanded ? 45 : 0 }}
      >
        <Plus className="h-6 w-6 text-white" />
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 -z-10"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
  QuickAction,
  iOSDashboardQuickActionsProps,
  QuickActionGroupProps,
  FloatingQuickBarProps,
}

export default iOSDashboardQuickActions
