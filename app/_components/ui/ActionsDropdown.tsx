'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 — PREMIUM ACTIONS DROPDOWN
 * Dropdown menu para acciones en tablas con diseño glassmorphism ultra-premium
 * Features: Rotating glow, shine sweep, magnetic hover, ripple effects
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { MoreHorizontal } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

export interface DropdownAction {
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'default' | 'danger' | 'success' | 'warning'
  disabled?: boolean
}

interface ActionsDropdownProps {
  actions: DropdownAction[]
  className?: string
  buttonClassName?: string
  align?: 'left' | 'right'
}

// Ripple effect type
interface Ripple {
  id: number
  x: number
  y: number
}

export function ActionsDropdown({
  actions,
  className,
  buttonClassName,
  align = 'right',
}: ActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [ripples, setRipples] = useState<Ripple[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Cerrar cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Cerrar con ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Ripple effect handler
  const handleRipple = useCallback((e: React.MouseEvent) => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const newRipple: Ripple = { id: Date.now(), x, y }
    setRipples((prev) => [...prev, newRipple])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, 600)
  }, [])

  const variantColors = {
    default: {
      text: 'text-white/80 hover:text-white',
      bg: 'hover:bg-violet-500/15',
      glow: 'rgba(139, 0, 255, 0.3)',
      iconColor: '#B24BFF',
    },
    danger: {
      text: 'text-red-300 hover:text-red-200',
      bg: 'hover:bg-red-500/15',
      glow: 'rgba(255, 51, 102, 0.3)',
      iconColor: '#FF3366',
    },
    success: {
      text: 'text-emerald-300 hover:text-emerald-200',
      bg: 'hover:bg-emerald-500/15',
      glow: 'rgba(0, 255, 135, 0.3)',
      iconColor: '#00FF87',
    },
    warning: {
      text: 'text-amber-300 hover:text-amber-200',
      bg: 'hover:bg-amber-500/15',
      glow: 'rgba(255, 215, 0, 0.3)',
      iconColor: '#FFD700',
    },
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger Button with Premium Effects */}
      <motion.button
        ref={buttonRef}
        onClick={(e) => {
          handleRipple(e)
          setIsOpen(!isOpen)
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative overflow-hidden rounded-xl p-2.5 transition-spring hover:scale-110',
          'border border-white/10 bg-white/5',
          'hover:border-violet-500/30 hover:bg-violet-500/10',
          isOpen && 'border-violet-500/50 bg-violet-500/20',
          buttonClassName,
        )}
        style={{
          boxShadow:
            isHovered || isOpen
              ? '0 0 20px rgba(139, 0, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Rotating glow ring when open */}
        {isOpen && (
          <motion.div
            className="pointer-events-none absolute inset-[-2px] rounded-xl"
            style={{
              background:
                'conic-gradient(from 0deg, transparent, rgba(139, 0, 255, 0.5), transparent 30%)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Inner background */}
        <div className="pointer-events-none absolute inset-[1px] rounded-[10px] bg-zinc-900/90" />

        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full bg-violet-500/40"
            initial={{ width: 0, height: 0, x: ripple.x, y: ripple.y, opacity: 0.6 }}
            animate={{ width: 60, height: 60, x: ripple.x - 30, y: ripple.y - 30, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}

        <MoreHorizontal
          className={cn(
            'relative z-10 h-4 w-4 transition-colors duration-300',
            isOpen ? 'text-violet-400' : 'text-white/60 hover:text-white',
          )}
        />
      </motion.button>

      {/* Dropdown Menu with Premium Glassmorphism */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={cn(
              'absolute z-50 mt-3 min-w-[200px] overflow-hidden rounded-2xl',
              'border border-white/10 bg-zinc-900/95 backdrop-blur-2xl',
              'shadow-2xl shadow-violet-500/10',
              align === 'right' ? 'right-0' : 'left-0',
            )}
            style={{
              background:
                'linear-gradient(135deg, rgba(20, 15, 30, 0.95) 0%, rgba(10, 8, 20, 0.98) 100%)',
            }}
            role="menu"
            aria-orientation="vertical"
          >
            {/* Top glow accent */}
            <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            {/* Actions list */}
            <div className="p-2">
              {actions.map((action, index) => {
                const colors = variantColors[action.variant || 'default']

                return (
                  <motion.button
                    key={index}
                    onClick={() => {
                      if (!action.disabled) {
                        action.onClick()
                        setIsOpen(false)
                      }
                    }}
                    disabled={action.disabled}
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-spring hover:scale-105',
                      colors.text,
                      colors.bg,
                      action.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                    )}
                    style={{
                      boxShadow: 'none',
                    }}
                    whileHover={!action.disabled ? { x: 4 } : {}}
                    whileTap={!action.disabled ? { scale: 0.98 } : {}}
                    role="menuitem"
                    aria-disabled={action.disabled}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {/* Icon with glow effect */}
                    {action.icon && (
                      <span
                        className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ color: colors.iconColor }}
                      >
                        {/* Glow behind icon on hover */}
                        <span
                          className="absolute inset-0 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60"
                          style={{ backgroundColor: colors.glow }}
                        />
                        <span className="relative">{action.icon}</span>
                      </span>
                    )}

                    {/* Label */}
                    <span className="relative">
                      {action.label}
                      {/* Underline effect on hover */}
                      <motion.span
                        className="absolute -bottom-0.5 left-0 h-px"
                        style={{ backgroundColor: colors.iconColor }}
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.2 }}
                      />
                    </span>

                    {/* Hover shine sweep */}
                    <motion.span
                      className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100"
                      initial={false}
                      animate={{ translateX: '-100%' }}
                      whileHover={{ translateX: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.button>
                )
              })}
            </div>

            {/* Bottom glow accent */}
            <div className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

