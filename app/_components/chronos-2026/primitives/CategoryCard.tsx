/**
 * 🏆 CATEGORY CARD 2026 - TARJETA DE CATEGORÍA DESTACADA
 * ═══════════════════════════════════════════════════════════════════════════
 * Inspirado en "Top Category: Dashboards" de Year Wrapped
 * - Fondo con gradiente vibrante
 * - Título grande y llamativo
 * - Elementos decorativos
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import React from 'react'
import { motion } from 'motion/react'

export interface CategoryCardProps {
  category: string
  title: string
  subtitle?: string
  palette?: string[]
  gradient?: 'orange' | 'purple' | 'rose' | 'lime' | 'magenta' | 'custom'
  customGradient?: string
  icon?: React.ReactNode
  className?: string
}

const gradientStyles = {
  orange: 'bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-400',
  purple: 'bg-gradient-to-br from-purple-600 via-violet-500 to-fuchsia-500',
  rose: 'bg-gradient-to-br from-rose-500 via-pink-400 to-emerald-400',
  lime: 'bg-gradient-to-br from-lime-500 via-green-400 to-emerald-500',
  magenta: 'bg-gradient-to-br from-pink-600 via-rose-500 to-red-500',
  custom: '',
}

export function CategoryCard({
  category,
  title,
  subtitle,
  palette,
  gradient = 'orange',
  customGradient,
  icon,
  className = '',
}: CategoryCardProps) {
  const bgClass =
    gradient === 'custom' && customGradient ? customGradient : gradientStyles[gradient]

  return (
    <motion.div
      className={`relative overflow-hidden rounded-3xl p-6 ${bgClass} ${className} `}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 h-40 w-40 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-1/2 translate-y-1/2 rounded-full bg-black/10 blur-2xl" />

      {/* Content */}
      <div className="relative z-10">
        {/* Category label */}
        <motion.p
          className="mb-2 text-xs font-semibold tracking-wider text-black/60 uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {category}
        </motion.p>

        {/* Title */}
        <motion.h3
          className="mb-4 text-3xl font-bold text-black md:text-4xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {title}
        </motion.h3>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            className="mb-4 text-sm text-black/60"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Color palette */}
        {palette && palette.length > 0 && (
          <motion.div
            className="mt-6 flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-black/50">Favorite Palette</p>
            <div className="ml-2 flex gap-1.5">
              {palette.map((color, index) => (
                <motion.div
                  key={index}
                  className="h-8 w-8 rounded-full border-2 border-black/10 shadow-lg"
                  style={{ backgroundColor: color }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.2, y: -4 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Icon */}
        {icon && <div className="absolute top-4 right-4 h-16 w-16 text-black/20">{icon}</div>}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO CARD - Tarjeta hero grande (como "Your Year Wrapped 2025")
// ═══════════════════════════════════════════════════════════════════════════

export interface HeroCardProps {
  eyebrow?: string
  year?: string
  headline?: string
  subheadline?: string
  gradient?: 'purple' | 'magenta' | 'aurora' | 'custom'
  customGradient?: string
  backgroundImage?: string
  className?: string
  children?: React.ReactNode
}

const heroGradients = {
  purple: 'bg-gradient-to-br from-purple-900 via-violet-700 to-fuchsia-600',
  magenta: 'bg-gradient-to-br from-rose-900 via-pink-700 to-fuchsia-500',
  aurora: 'bg-gradient-to-br from-indigo-900 via-purple-700 via-50% to-pink-600',
  custom: '',
}

export function HeroCard({
  eyebrow = 'Your Year Wrapped',
  year = '2025',
  headline,
  subheadline,
  gradient = 'purple',
  customGradient,
  backgroundImage,
  className = '',
  children,
}: HeroCardProps) {
  const bgClass = gradient === 'custom' && customGradient ? customGradient : heroGradients[gradient]

  return (
    <motion.div
      className={`relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-[2rem] p-8 md:min-h-[400px] md:p-10 ${bgClass} ${className} `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Background image overlay */}
      {backgroundImage && (
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Organic shapes */}
      <div className="absolute top-0 right-0 h-[80%] w-[60%]">
        <motion.div
          className="absolute h-full w-full"
          style={{
            background:
              'radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.15) 0%, transparent 60%)',
          }}
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute top-0 right-0 h-3/4 w-3/4"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(200,100,255,0.2) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Eyebrow */}
        <motion.p
          className="mb-2 text-lg font-medium text-purple-200/80 md:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {eyebrow}
        </motion.p>

        {/* Year (big number) */}
        <motion.h2
          className="text-[5rem] leading-none font-bold tracking-tight text-white md:text-[8rem] lg:text-[10rem]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            textShadow: '0 4px 60px rgba(0,0,0,0.3)',
          }}
        >
          {year}
        </motion.h2>

        {/* Headline box */}
        {(headline || subheadline) && (
          <motion.div
            className="mt-4 max-w-md rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {headline && <p className="font-medium text-white/90">{headline}</p>}
            {subheadline && <p className="mt-1 text-sm text-white/60">{subheadline}</p>}
          </motion.div>
        )}

        {children}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE BADGE - Badge de característica
// ═══════════════════════════════════════════════════════════════════════════

export interface FeatureBadgeProps {
  text: string
  variant?: 'default' | 'purple' | 'rose' | 'gold' | 'lime' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  pulse?: boolean
  className?: string
}

const badgeVariants = {
  default: 'bg-white/10 text-white border-white/20',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  gold: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  lime: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-sm',
}

export function FeatureBadge({
  text,
  variant = 'default',
  size = 'md',
  icon,
  pulse = false,
  className = '',
}: FeatureBadgeProps) {
  return (
    <motion.span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium backdrop-blur-sm ${badgeVariants[variant]} ${badgeSizes[size]} ${className} `}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      )}
      {icon && <span className="h-4 w-4">{icon}</span>}
      {text}
    </motion.span>
  )
}
