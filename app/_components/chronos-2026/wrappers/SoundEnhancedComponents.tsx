'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎵✨ SOUND ENHANCED COMPONENTS — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Componentes envueltos con sound effects integrados
 */

import { cn } from '@/app/_lib/utils'
import { useSoundEffects, type SoundEffect } from '@/app/lib/audio/sound-system'
import { motion } from 'motion/react'
import { useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// SOUND BUTTON
// ═══════════════════════════════════════════════════════════════════════════════════════

interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  clickSound?: SoundEffect
  hoverSound?: SoundEffect
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  children: React.ReactNode
}

export function SoundButton({
  clickSound = 'click',
  hoverSound = 'hover',
  variant = 'primary',
  className,
  onClick,
  onMouseEnter,
  children,
  ...props
}: SoundButtonProps) {
  const { play, config } = useSoundEffects()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (config.enabled) play(clickSound)
      onClick?.(e)
    },
    [onClick, play, clickSound, config.enabled],
  )

  const handleHover = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (config.enabled && hoverSound) play(hoverSound)
      onMouseEnter?.(e)
    },
    [onMouseEnter, play, hoverSound, config.enabled],
  )

  const variantStyles = {
    primary: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500',
    secondary: 'border border-white/10 bg-white/5 text-white hover:bg-white/10',
    ghost: 'text-white/70 hover:bg-white/5 hover:text-white',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500',
  }

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden rounded-xl px-4 py-2.5 font-medium transition-all duration-300',
        variantStyles[variant],
        className,
      )}
      onClick={handleClick}
      onMouseEnter={handleHover}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SOUND CARD
// ═══════════════════════════════════════════════════════════════════════════════════════

interface SoundCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverSound?: SoundEffect
  clickSound?: SoundEffect
  children: React.ReactNode
}

export function SoundCard({
  hoverSound = 'hover',
  clickSound,
  className,
  onClick,
  onMouseEnter,
  children,
  ...props
}: SoundCardProps) {
  const { play, config } = useSoundEffects()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (config.enabled && clickSound) play(clickSound)
      onClick?.(e)
    },
    [onClick, play, clickSound, config.enabled],
  )

  const handleHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (config.enabled && hoverSound) play(hoverSound)
      onMouseEnter?.(e)
    },
    [onMouseEnter, play, hoverSound, config.enabled],
  )

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:shadow-xl',
        className,
      )}
      onClick={handleClick}
      onMouseEnter={handleHover}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={clickSound ? { scale: 0.98 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SOUND TAB
// ═══════════════════════════════════════════════════════════════════════════════════════

interface SoundTabProps {
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}

export function SoundTab({ isActive, onClick, children, className }: SoundTabProps) {
  const { play, config } = useSoundEffects()

  const handleClick = useCallback(() => {
    if (config.enabled) play('tab-switch')
    onClick()
  }, [onClick, play, config.enabled])

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        'relative rounded-lg px-4 py-2 font-medium transition-colors',
        isActive ? 'text-white' : 'text-white/50 hover:text-white/80',
        className,
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600"
          layoutId="activeTab"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SOUND MODAL WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════════════

interface SoundModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function SoundModalWrapper({ isOpen, onClose, children }: SoundModalWrapperProps) {
  const { play, config } = useSoundEffects()

  useEffect(() => {
    if (isOpen && config.enabled) {
      play('modal-open')
    }
  }, [isOpen, play, config.enabled])

  const handleClose = useCallback(() => {
    if (config.enabled) play('modal-close')
    onClose()
  }, [onClose, play, config.enabled])

  // Override onClose en children si es un componente que acepta onClose
  const childrenWithSound = React.cloneElement(children as React.ReactElement, {
    onClose: handleClose,
  })

  return <>{childrenWithSound}</>
}
