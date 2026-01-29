'use client'

import { cn } from '@/app/_lib/utils'
import { HTMLMotionProps, motion } from 'motion/react'
import React from 'react'

interface UltraPremiumCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glassmorphic' | 'neon' | 'holographic'
  hover?: 'lift' | 'glow' | 'scale' | 'none'
  scanLine?: boolean
  auroraBackground?: boolean
  energyBorder?: boolean
  parallax?: boolean
  chromatic?: boolean
  children: React.ReactNode
}

const variantStyles: Record<string, string> = {
  default: 'bg-white/5 border-white/10',
  glassmorphic: 'bg-gradient-to-br from-white/10 via-white/5 to-white/10 border-white/10',
  neon: 'bg-black/20 border-violet-500/30',
  holographic: 'bg-gradient-to-br from-cyan-500/5 via-violet-500/5 to-fuchsia-500/5 border-white/10',
}

const hoverStyles: Record<string, string> = {
  lift: 'hover:-translate-y-2 hover:scale-[1.01]',
  glow: 'hover:shadow-glow-lg hover:border-white/20',
  scale: 'hover:scale-[1.02]',
  none: '',
}

export const UltraPremiumCard = React.forwardRef<HTMLDivElement, UltraPremiumCardProps>(
  (
    {
      variant = 'glassmorphic',
      hover = 'lift',
      scanLine = true,
      auroraBackground = true,
      energyBorder = true,
      parallax = false,
      chromatic = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'group relative overflow-hidden',
          'rounded-3xl border backdrop-blur-xl',
          'transition-all duration-500',
          variantStyles[variant],
          hoverStyles[hover],
          parallax && 'animate-parallax-float',
          chromatic && 'hover:animate-chromatic',
          className,
        )}
        {...props}
      >
        {auroraBackground && (
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
            <div
              className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-indigo-500/10"
              style={{
                backgroundSize: '200% 200%',
                animation: 'aurora-dance 8s ease-in-out infinite',
              }}
            />
          </div>
        )}
        {scanLine && (
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-30">
            <div className="h-[2px] w-full animate-scan-line bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
          </div>
        )}
        <div className="relative z-10">{children}</div>
        {energyBorder && (
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              animation: 'energy-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              boxShadow:
                '0 0 20px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(139, 92, 246, 0.2)',
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </motion.div>
    )
  },
)

UltraPremiumCard.displayName = 'UltraPremiumCard'

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight text-white',
      'transition-all duration-300',
      className,
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-gray-400', className)} {...props} />
))
CardDescription.displayName = 'CardDescription'

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('relative z-10 p-6 pt-0', className)} {...props} />
  ),
)
CardContent.displayName = 'CardContent'

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative z-10 flex items-center p-6 pt-0', className)}
      {...props}
    />
  ),
)
CardFooter.displayName = 'CardFooter'
