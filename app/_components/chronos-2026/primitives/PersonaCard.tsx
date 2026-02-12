/**
 * 🎭 PERSONA CARD 2026 - TARJETA DE PERFIL/PERSONA
 * ═══════════════════════════════════════════════════════════════════════════
 * Inspirado en "Design Persona" de Year Wrapped
 * - Icono central con efecto de profundidad
 * - Badge de categoría
 * - Descripción elegante
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import React from 'react'
import { motion } from 'motion/react'
import { MoreHorizontal } from 'lucide-react'

export interface PersonaCardProps {
  badge?: string
  title: string
  subtitle?: string
  description?: string
  icon: React.ReactNode
  iconBackground?: 'dark' | 'gradient-purple' | 'gradient-rose' | 'gradient-gold'
  showMenu?: boolean
  onMenuClick?: () => void
  className?: string
}

const iconBgStyles = {
  dark: 'bg-black border border-white/10',
  'gradient-purple': 'bg-gradient-to-br from-purple-600 to-fuchsia-600',
  'gradient-rose': 'bg-gradient-to-br from-rose-500 to-pink-500',
  'gradient-gold': 'bg-gradient-to-br from-amber-500 to-orange-500',
}

export function PersonaCard({
  badge,
  title,
  subtitle,
  description,
  icon,
  iconBackground = 'dark',
  showMenu = true,
  onMenuClick,
  className = '',
}: PersonaCardProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Header con badge y menu */}
      <div className="mb-6 flex w-full items-center justify-between">
        {badge && (
          <motion.div
            className="rounded-full border border-purple-500/30 bg-purple-500/20 px-4 py-1.5 text-xs font-medium text-purple-400"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {badge}
          </motion.div>
        )}
        {!badge && <div />}

        {showMenu && (
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Icono central */}
      <motion.div
        className={`flex h-20 w-20 items-center justify-center rounded-2xl ${iconBgStyles[iconBackground]} mb-6 shadow-2xl`}
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
        whileHover={{
          scale: 1.02,
          rotate: 5,
          transition: { duration: 0.3 },
        }}
      >
        <div className="h-10 w-10 text-white">{icon}</div>
      </motion.div>

      {/* Subtítulo */}
      {subtitle && (
        <motion.p
          className="mb-1 text-xs tracking-widest text-white/40 uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {subtitle}
        </motion.p>
      )}

      {/* Título principal */}
      <motion.h3
        className="text-2xl leading-tight font-bold text-white md:text-3xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {title}
      </motion.h3>

      {/* Descripción */}
      {description && (
        <motion.p
          className="mt-4 max-w-[250px] text-sm leading-relaxed text-white/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// USER PROFILE CARD - Tarjeta de perfil de usuario
// ═══════════════════════════════════════════════════════════════════════════

export interface UserProfileCardProps {
  name: string
  role?: string
  avatarUrl?: string
  avatarFallback?: string
  stats?: Array<{
    label: string
    value: string | number
  }>
  className?: string
}

export function UserProfileCard({
  name,
  role,
  avatarUrl,
  avatarFallback,
  stats,
  className = '',
}: UserProfileCardProps) {
  const initials =
    avatarFallback ||
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Avatar */}
      <motion.div
        className="relative mb-4"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-white/20 ring-4 ring-purple-500/20">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-fuchsia-600 text-2xl font-bold text-white">
              {initials}
            </div>
          )}
        </div>
        {/* Online indicator */}
        <div className="absolute right-1 bottom-1 h-4 w-4 rounded-full border-2 border-black bg-emerald-500" />
      </motion.div>

      {/* Name */}
      <h3 className="text-lg font-semibold text-white">{name}</h3>

      {/* Role */}
      {role && <p className="mt-0.5 text-sm text-white/50">{role}</p>}

      {/* Stats */}
      {stats && stats.length > 0 && (
        <div className="mt-4 flex items-center gap-6 border-t border-white/10 pt-4">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-lg font-semibold text-white">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className="text-xs text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// BANK PERSONA CARD - Tarjeta de perfil de banco CHRONOS
// ═══════════════════════════════════════════════════════════════════════════

export interface BankPersonaCardProps {
  bankId: string
  bankName: string
  bankIcon: React.ReactNode
  capital: number
  ingresos: number
  gastos: number
  color: string
  className?: string
}

export function BankPersonaCard({
  bankName,
  bankIcon,
  capital,
  ingresos,
  gastos,
  color,
  className = '',
}: BankPersonaCardProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>{bankIcon}</div>
        </div>
        <div>
          <h4 className="font-semibold text-white">{bankName}</h4>
          <p className="text-xs text-white/50">Bóveda activa</p>
        </div>
      </div>

      {/* Capital */}
      <div className="mb-4">
        <p className="mb-1 text-xs tracking-wider text-white/40 uppercase">Capital Actual</p>
        <p className="text-3xl font-bold text-white">${capital.toLocaleString()}</p>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 border-t border-white/10 pt-4">
        <div>
          <p className="text-xs text-white/40">Ingresos</p>
          <p className="text-sm font-medium text-emerald-400">+${ingresos.toLocaleString()}</p>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div>
          <p className="text-xs text-white/40">Gastos</p>
          <p className="text-sm font-medium text-red-400">-${gastos.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

