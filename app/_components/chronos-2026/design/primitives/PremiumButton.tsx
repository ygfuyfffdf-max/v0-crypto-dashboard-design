/**
 * 🔘 PREMIUM BUTTON - Botón con efectos ripple y glow
 * Micro-interacciones nivel AAA con animaciones Framer Motion
 */

'use client'

import { cn } from '@/app/lib/utils'
import { motion, type HTMLMotionProps } from 'motion/react'
import { ReactNode } from 'react'

interface PremiumButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  withRipple?: boolean
  icon?: ReactNode
}

const variantClasses = {
  primary: `
    bg-gradient-to-r from-violet-600 to-indigo-600
    text-white font-semibold
    shadow-[0_4px_20px_rgba(139,92,246,0.4)]
    hover:shadow-[0_8px_30px_rgba(139,92,246,0.6)]
    before:absolute before:inset-0
    before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0
    before:translate-x-[-200%] hover:before:translate-x-[200%]
    before:transition-transform before:duration-700
  `,
  outline: `
    border border-violet-500/50
    text-violet-300 bg-transparent
    hover:bg-violet-500/10 hover:border-violet-400
    hover:text-violet-200 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]
  `,
  ghost: `
    text-gray-300 bg-transparent
    hover:bg-white/5 hover:text-white
  `,
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-xl',
}

export function PremiumButton({
  children,
  variant = 'primary',
  size = 'md',
  withRipple = true,
  icon,
  className,
  ...props
}: PremiumButtonProps) {
  return (
    <motion.button
      className={cn(
        'relative overflow-hidden',
        'active:scale-[0.98]',
        'transition-all duration-300',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'group',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon && <span className="group-hover:animate-wiggle">{icon}</span>}
        {children}
      </span>
    </motion.button>
  )
}
