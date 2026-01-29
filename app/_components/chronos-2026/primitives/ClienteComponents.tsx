/**
 * 👤 CLIENTE COMPONENTS - AVATARES Y TARJETAS PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════
 * Componentes premium para visualización de clientes con niveles de lealtad
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import {
  Award,
  ChevronRight,
  Crown,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Star,
} from 'lucide-react'
import React, { useMemo } from 'react'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type LoyaltyLevel = 'bronce' | 'plata' | 'oro' | 'platino' | 'diamante'

export interface ClienteAvatarProps {
  nombre: string
  avatar?: string
  totalCompras?: number
  loyaltyLevel?: LoyaltyLevel
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showBadge?: boolean
  onClick?: () => void
  className?: string
}

export interface ClienteCardProps {
  id: string
  nombre: string
  email?: string
  telefono?: string
  direccion?: string
  totalCompras: number
  numCompras: number
  ultimaCompra?: string
  fechaRegistro?: string
  avatar?: string
  loyaltyLevel?: LoyaltyLevel
  segmento?: string
  adeudoActual?: number // NUEVO: Deuda pendiente del cliente
  onClick?: () => void
  onContact?: () => void
  onAbono?: () => void // NUEVO: Handler para abono
  className?: string
}

export interface LoyaltyBadgeProps {
  level: LoyaltyLevel
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export interface TopClientesListProps {
  clientes: Array<{
    id: string
    nombre: string
    totalCompras: number
    numCompras: number
    avatar?: string
  }>
  limit?: number
  onClienteClick?: (id: string) => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// LOYALTY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const LOYALTY_CONFIG: Record<
  LoyaltyLevel,
  {
    label: string
    icon: React.ReactNode
    gradient: string
    borderColor: string
    textColor: string
    minCompras: number
  }
> = {
  bronce: {
    label: 'Bronce',
    icon: <Award className="h-full w-full" />,
    gradient: 'from-amber-700 to-amber-900',
    borderColor: 'border-amber-600',
    textColor: 'text-amber-500',
    minCompras: 0,
  },
  plata: {
    label: 'Plata',
    icon: <Award className="h-full w-full" />,
    gradient: 'from-slate-400 to-slate-600',
    borderColor: 'border-slate-400',
    textColor: 'text-slate-400',
    minCompras: 25000,
  },
  oro: {
    label: 'Oro',
    icon: <Star className="h-full w-full" />,
    gradient: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-400',
    minCompras: 50000,
  },
  platino: {
    label: 'Platino',
    icon: <Crown className="h-full w-full" />,
    gradient: 'from-indigo-400 to-purple-500',
    borderColor: 'border-indigo-400',
    textColor: 'text-indigo-400',
    minCompras: 100000,
  },
  diamante: {
    label: 'Diamante',
    icon: <Crown className="h-full w-full" />,
    gradient: 'from-purple-300 via-white to-purple-300',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-300',
    minCompras: 200000,
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function calculateLoyaltyLevel(totalCompras: number): LoyaltyLevel {
  if (totalCompras >= 200000) return 'diamante'
  if (totalCompras >= 100000) return 'platino'
  if (totalCompras >= 50000) return 'oro'
  if (totalCompras >= 25000) return 'plata'
  return 'bronce'
}

function getInitials(nombre: string): string {
  return nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ═══════════════════════════════════════════════════════════════════════════
// LOYALTY BADGE
// ═══════════════════════════════════════════════════════════════════════════

export const LoyaltyBadge: React.FC<LoyaltyBadgeProps> = ({
  level,
  size = 'md',
  showLabel = true,
  className,
}) => {
  const config = LOYALTY_CONFIG[level]

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <motion.div
        className={cn(
          'flex items-center justify-center rounded-full p-0.5',
          `bg-gradient-to-br ${config.gradient}`,
          sizeClasses[size],
        )}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <div className={cn('h-3/4 w-3/4 text-white', config.textColor)}>{config.icon}</div>
      </motion.div>

      {showLabel && (
        <span className={cn('text-xs font-medium', config.textColor)}>{config.label}</span>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CLIENTE AVATAR
// ═══════════════════════════════════════════════════════════════════════════

export const ClienteAvatar: React.FC<ClienteAvatarProps> = ({
  nombre,
  avatar,
  totalCompras = 0,
  loyaltyLevel: providedLevel,
  size = 'md',
  showBadge = true,
  onClick,
  className,
}) => {
  const loyaltyLevel = providedLevel || calculateLoyaltyLevel(totalCompras)
  const config = LOYALTY_CONFIG[loyaltyLevel]
  const initials = getInitials(nombre)

  const sizeConfig = {
    sm: { avatar: 'w-8 h-8', text: 'text-xs', badge: 'w-4 h-4 -bottom-0.5 -right-0.5' },
    md: { avatar: 'w-10 h-10', text: 'text-sm', badge: 'w-5 h-5 -bottom-0.5 -right-0.5' },
    lg: { avatar: 'w-14 h-14', text: 'text-lg', badge: 'w-6 h-6 -bottom-1 -right-1' },
    xl: { avatar: 'w-20 h-20', text: 'text-xl', badge: 'w-8 h-8 -bottom-1 -right-1' },
  }

  const sizeClass = sizeConfig[size]

  return (
    <motion.div
      className={cn('relative inline-flex cursor-pointer', className)}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full border-2 font-bold',
          sizeClass.avatar,
          sizeClass.text,
          config.borderColor,
          `bg-gradient-to-br ${config.gradient}`,
        )}
      >
        {avatar ? (
          <img src={avatar} alt={nombre} className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="text-white">{initials}</span>
        )}
      </div>

      {/* Badge */}
      {showBadge && (
        <motion.div
          className={cn(
            'absolute rounded-full p-0.5',
            `bg-gradient-to-br ${config.gradient}`,
            'border border-slate-900',
            sizeClass.badge,
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          <div className="flex h-full w-full items-center justify-center text-white">
            {config.icon}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CLIENTE CARD
// ═══════════════════════════════════════════════════════════════════════════

export const ClienteCard: React.FC<ClienteCardProps> = ({
  // id, ultimaCompra, fechaRegistro, segmento - available for future use
  nombre,
  email,
  telefono,
  direccion,
  totalCompras,
  numCompras,
  avatar,
  loyaltyLevel: providedLevel,
  adeudoActual = 0, // NUEVO
  onClick,
  onContact,
  onAbono, // NUEVO
  className,
}) => {
  const loyaltyLevel = providedLevel || calculateLoyaltyLevel(totalCompras)
  const config = LOYALTY_CONFIG[loyaltyLevel]
  const tieneDeuda = adeudoActual > 0 // NUEVO

  return (
    <motion.div
      className={cn(
        'relative cursor-pointer overflow-hidden rounded-2xl p-5',
        'bg-gradient-to-br from-white/10 via-white/5 to-transparent',
        'border border-white/10 backdrop-blur-xl',
        'transition-all duration-300 hover:border-white/20',
        className,
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Glow */}
      <div
        className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-20 blur-3xl"
        style={{ background: `linear-gradient(135deg, ${config.gradient})` }}
      />

      {/* Header */}
      <div className="mb-4 flex items-start gap-4">
        <ClienteAvatar
          nombre={nombre}
          avatar={avatar}
          totalCompras={totalCompras}
          loyaltyLevel={loyaltyLevel}
          size="lg"
          showBadge={true}
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-white">{nombre}</h3>
          <LoyaltyBadge level={loyaltyLevel} size="sm" />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/5 p-3">
          <div className="mb-1 flex items-center gap-2 text-xs text-white/50">
            <DollarSign className="h-3 w-3" />
            Total Compras
          </div>
          <p className="text-lg font-bold text-white">
            ${totalCompras >= 1000 ? `${(totalCompras / 1000).toFixed(0)}K` : totalCompras}
          </p>
        </div>

        <div className="rounded-xl bg-white/5 p-3">
          <div className="mb-1 flex items-center gap-2 text-xs text-white/50">
            <ShoppingBag className="h-3 w-3" />
            Compras
          </div>
          <p className="text-lg font-bold text-white">{numCompras}</p>
        </div>
      </div>

      {/* Adeudo Actual - NUEVO */}
      {tieneDeuda && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
          <div className="flex items-center justify-between">
            <div className="mb-1 flex items-center gap-2 text-xs text-red-400">
              <DollarSign className="h-3 w-3" />
              Adeudo Actual
            </div>
            <p className="text-lg font-bold text-red-400">
              $
              {adeudoActual >= 1000
                ? `${(adeudoActual / 1000).toFixed(1)}K`
                : adeudoActual.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-2 text-sm">
        {email && (
          <div className="flex items-center gap-2 text-white/60">
            <Mail className="h-4 w-4" />
            <span className="truncate">{email}</span>
          </div>
        )}
        {telefono && (
          <div className="flex items-center gap-2 text-white/60">
            <Phone className="h-4 w-4" />
            <span>{telefono}</span>
          </div>
        )}
        {direccion && (
          <div className="flex items-center gap-2 text-white/60">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{direccion}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {/* Botón ABONO - NUEVO: Visible cuando hay deuda */}
        {onAbono && tieneDeuda && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAbono()
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-gradient-to-r from-green-500/20 to-emerald-500/20 py-2.5 text-sm font-medium text-green-400 transition-all hover:from-green-500/30 hover:to-emerald-500/30"
          >
            <DollarSign className="h-4 w-4" />
            Abonar
          </button>
        )}

        {/* Botón Contactar */}
        {onContact && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onContact()
            }}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/15',
              tieneDeuda ? 'flex-1' : 'w-full',
            )}
          >
            <Mail className="h-4 w-4" />
            Contactar
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CLIENTE CARD COMPACT
// ═══════════════════════════════════════════════════════════════════════════

export const ClienteCardCompact: React.FC<{
  nombre: string
  totalCompras: number
  numCompras: number
  avatar?: string
  onClick?: () => void
  className?: string
}> = ({ nombre, totalCompras, numCompras, avatar, onClick, className }) => {
  const loyaltyLevel = calculateLoyaltyLevel(totalCompras)

  return (
    <motion.div
      className={cn(
        'flex items-center gap-3 rounded-xl p-3',
        'border border-transparent bg-white/5 hover:border-white/10 hover:bg-white/10',
        'cursor-pointer transition-all',
        className,
      )}
      onClick={onClick}
      whileHover={{ x: 4 }}
    >
      <ClienteAvatar
        nombre={nombre}
        avatar={avatar}
        totalCompras={totalCompras}
        size="sm"
        showBadge={false}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{nombre}</p>
        <p className="text-xs text-white/50">{numCompras} compras</p>
      </div>

      <div className="text-right">
        <p className="text-sm font-bold text-white">${(totalCompras / 1000).toFixed(0)}K</p>
        <LoyaltyBadge level={loyaltyLevel} size="sm" showLabel={false} />
      </div>

      <ChevronRight className="h-4 w-4 text-white/30" />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TOP CLIENTES LIST
// ═══════════════════════════════════════════════════════════════════════════

export const TopClientesList: React.FC<TopClientesListProps> = ({
  clientes,
  limit = 5,
  onClienteClick,
  className,
}) => {
  const sortedClientes = useMemo(
    () => [...clientes].sort((a, b) => b.totalCompras - a.totalCompras).slice(0, limit),
    [clientes, limit],
  )

  return (
    <div className={cn('space-y-2', className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Crown className="h-4 w-4 text-yellow-400" />
          Top Clientes
        </h3>
        <span className="text-xs text-white/40">Por volumen</span>
      </div>

      {sortedClientes.map((cliente, index) => (
        <motion.div
          key={cliente.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <ClienteCardCompact
            nombre={cliente.nombre}
            totalCompras={cliente.totalCompras}
            numCompras={cliente.numCompras}
            avatar={cliente.avatar}
            onClick={() => onClienteClick?.(cliente.id)}
          />
        </motion.div>
      ))}
    </div>
  )
}

export default {
  ClienteAvatar,
  ClienteCard,
  ClienteCardCompact,
  LoyaltyBadge,
  TopClientesList,
  calculateLoyaltyLevel,
}
