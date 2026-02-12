'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 👥 USER MANAGEMENT PANEL — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel completo de administración de usuarios con:
 * - Creación de usuarios con restricciones granulares
 * - Asignación de roles y permisos específicos
 * - Restricciones por banco, horario, monto, etc.
 * - Historial de actividad por usuario
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  EyeOff,
  Filter,
  History,
  Key,
  Laptop,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  User,
  UserCog,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Usuario {
  id: string
  email: string
  nombre: string
  role: 'admin' | 'operator' | 'viewer'
  createdAt: number
  // Extensión
  rolId?: string
  rolNombre?: string
  rolColor?: string
  bancosPermitidos: string[]
  limiteMontoOperacion?: number
  limiteDiario?: number
  requiereAprobacion?: boolean
  horaInicioAcceso?: string
  horaFinAcceso?: string
  diasPermitidos?: number[]
  bloqueado?: boolean
  ultimoAcceso?: number
  ultimaIp?: string
}

interface Rol {
  id: string
  nombre: string
  descripcion?: string
  color: string
  icono: string
  esAdmin: boolean
  activo: boolean
}

interface Permiso {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  modulo: string
  accion: string
  recurso?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  nombre: z.string().min(2, 'Nombre requerido'),
  rolId: z.string().optional(),
  bancosPermitidos: z.array(z.string()),
  limiteMontoOperacion: z.number().positive().optional(),
  limiteDiario: z.number().positive().optional(),
  requiereAprobacion: z.boolean(),
  montoRequiereAprobacion: z.number().positive().optional(),
  horaInicioAcceso: z.string().optional(),
  horaFinAcceso: z.string().optional(),
  diasPermitidos: z.array(z.number()),
})

type CreateUserInput = z.infer<typeof CreateUserSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const BANCOS = [
  { id: 'boveda_monte', nombre: 'Bóveda Monte', color: '#FFD700' },
  { id: 'boveda_usa', nombre: 'Bóveda USA', color: '#228B22' },
  { id: 'profit', nombre: 'Profit', color: '#8B5CF6' },
  { id: 'leftie', nombre: 'Leftie', color: '#FF1493' },
  { id: 'azteca', nombre: 'Azteca', color: '#FF4500' },
  { id: 'flete_sur', nombre: 'Flete Sur', color: '#00CED1' },
  { id: 'utilidades', nombre: 'Utilidades', color: '#32CD32' },
]

const DIAS_SEMANA = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// USER CARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UserCardProps {
  usuario: Usuario
  onEdit: () => void
  onViewActivity: () => void
  onToggleBlock: () => void
  onDelete: () => void
}

const UserCard = memo(function UserCard({
  usuario,
  onEdit,
  onViewActivity,
  onToggleBlock,
  onDelete,
}: UserCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const roleConfig = {
    admin: { label: 'Administrador', color: 'bg-amber-500/20 text-amber-400', icon: ShieldCheck },
    operator: { label: 'Operador', color: 'bg-violet-500/20 text-violet-400', icon: Shield },
    viewer: { label: 'Visor', color: 'bg-blue-500/20 text-blue-400', icon: Eye },
  }

  const config = roleConfig[usuario.role]
  const RoleIcon = config.icon

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 transition-all',
        usuario.bloqueado
          ? 'border-rose-500/30 bg-rose-500/5 opacity-60'
          : 'border-white/10 bg-white/5 hover:border-violet-500/30'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      {/* Blocked badge */}
      {usuario.bloqueado && (
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-1">
          <Lock className="h-3 w-3" />
          Bloqueado
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/20 flex items-center justify-center">
            <User className="h-6 w-6 text-violet-400" />
          </div>
          <div className={cn(
            'absolute -bottom-1 -right-1 p-1 rounded-full',
            config.color
          )}>
            <RoleIcon className="h-3 w-3" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{usuario.nombre}</h3>
          <p className="text-sm text-white/50 truncate flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {usuario.email}
          </p>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                className="absolute top-full right-0 mt-2 w-48 rounded-xl border border-white/10 bg-slate-900 shadow-xl z-10"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <button
                  onClick={() => { onEdit(); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => { onViewActivity(); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <History className="h-4 w-4" />
                  Ver Actividad
                </button>
                <button
                  onClick={() => { onToggleBlock(); setShowMenu(false) }}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors',
                    usuario.bloqueado
                      ? 'text-emerald-400 hover:bg-emerald-500/10'
                      : 'text-amber-400 hover:bg-amber-500/10'
                  )}
                >
                  <Lock className="h-4 w-4" />
                  {usuario.bloqueado ? 'Desbloquear' : 'Bloquear'}
                </button>
                <button
                  onClick={() => { onDelete(); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Role & Restrictions */}
      <div className="mt-4 space-y-3">
        {/* Role badge */}
        <div className="flex items-center gap-2">
          <span className={cn('px-2 py-1 rounded-lg text-xs font-medium', config.color)}>
            {usuario.rolNombre || config.label}
          </span>
          {usuario.requiereAprobacion && (
            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-400">
              Requiere Aprobación
            </span>
          )}
        </div>

        {/* Banks access */}
        {usuario.bancosPermitidos.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Building2 className="h-4 w-4 text-white/30" />
            {usuario.bancosPermitidos.map((bancoId) => {
              const banco = BANCOS.find((b) => b.id === bancoId)
              return (
                <span
                  key={bancoId}
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: `${banco?.color}20`, color: banco?.color }}
                >
                  {banco?.nombre || bancoId}
                </span>
              )
            })}
          </div>
        )}

        {/* Time restrictions */}
        {(usuario.horaInicioAcceso || usuario.horaFinAcceso) && (
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Clock className="h-4 w-4" />
            <span>
              Horario: {usuario.horaInicioAcceso || '00:00'} - {usuario.horaFinAcceso || '23:59'}
            </span>
          </div>
        )}

        {/* Limits */}
        {usuario.limiteMontoOperacion && (
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Zap className="h-4 w-4" />
            <span>Límite operación: {formatCurrency(usuario.limiteMontoOperacion)}</span>
          </div>
        )}

        {/* Last access */}
        {usuario.ultimoAcceso && (
          <div className="flex items-center gap-2 text-xs text-white/40 pt-2 border-t border-white/5">
            <History className="h-3 w-3" />
            <span>
              Último acceso: {new Date(usuario.ultimoAcceso * 1000).toLocaleString('es-MX')}
            </span>
            {usuario.ultimaIp && (
              <>
                <span>•</span>
                <MapPin className="h-3 w-3" />
                <span>{usuario.ultimaIp}</span>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CREATE USER MODAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  roles: Rol[]
  onSuccess: () => void
}

function CreateUserModal({ isOpen, onClose, roles, onSuccess }: CreateUserModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      email: '',
      password: '',
      nombre: '',
      bancosPermitidos: [],
      requiereAprobacion: false,
      diasPermitidos: [1, 2, 3, 4, 5], // Lun-Vie por defecto
    },
  })

  const watchedBancos = form.watch('bancosPermitidos')
  const watchedDias = form.watch('diasPermitidos')

  const createMutation = useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al crear usuario')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Usuario creado exitosamente')
      form.reset()
      setStep(1)
      onSuccess()
      onClose()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    createMutation.mutate(data)
  })

  const toggleBanco = (bancoId: string) => {
    const current = form.getValues('bancosPermitidos')
    if (current.includes(bancoId)) {
      form.setValue('bancosPermitidos', current.filter((id) => id !== bancoId))
    } else {
      form.setValue('bancosPermitidos', [...current, bancoId])
    }
  }

  const toggleDia = (dia: number) => {
    const current = form.getValues('diasPermitidos') || []
    if (current.includes(dia)) {
      form.setValue('diasPermitidos', current.filter((d) => d !== dia))
    } else {
      form.setValue('diasPermitidos', [...current, dia])
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-violet-500/20 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-500/20 p-2.5">
                  <UserPlus className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Crear Usuario</h2>
                  <p className="text-sm text-white/50">
                    Paso {step} de 3: {step === 1 ? 'Información básica' : step === 2 ? 'Restricciones' : 'Permisos'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress */}
            <div className="flex gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors',
                    s <= step ? 'bg-violet-500' : 'bg-white/10'
                  )}
                />
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Nombre completo
                    </label>
                    <input
                      {...form.register('nombre')}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none"
                      placeholder="Juan Pérez"
                    />
                    {form.formState.errors.nombre && (
                      <p className="mt-1 text-sm text-rose-400">
                        {form.formState.errors.nombre.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Email
                    </label>
                    <input
                      {...form.register('email')}
                      type="email"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none"
                      placeholder="usuario@empresa.com"
                    />
                    {form.formState.errors.email && (
                      <p className="mt-1 text-sm text-rose-400">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        {...form.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none pr-12"
                        placeholder="Mínimo 8 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/50 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="mt-1 text-sm text-rose-400">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Rol
                    </label>
                    <select
                      {...form.register('rolId')}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:outline-none"
                    >
                      <option value="">Sin rol específico (Visor)</option>
                      {roles.map((rol) => (
                        <option key={rol.id} value={rol.id}>
                          {rol.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Restrictions */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Bancos permitidos */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Bancos permitidos
                      <span className="text-xs text-white/40">(vacío = todos)</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {BANCOS.map((banco) => {
                        const isSelected = watchedBancos.includes(banco.id)
                        return (
                          <button
                            key={banco.id}
                            type="button"
                            onClick={() => toggleBanco(banco.id)}
                            className={cn(
                              'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                              isSelected
                                ? 'border-transparent'
                                : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
                            )}
                            style={isSelected ? {
                              backgroundColor: `${banco.color}20`,
                              color: banco.color,
                              borderColor: `${banco.color}50`,
                            } : undefined}
                          >
                            {banco.nombre}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Horario de acceso */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Horario de acceso
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-white/50">Hora inicio</span>
                        <input
                          type="time"
                          {...form.register('horaInicioAcceso')}
                          className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-white/50">Hora fin</span>
                        <input
                          type="time"
                          {...form.register('horaFinAcceso')}
                          className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Días permitidos */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Días permitidos
                    </label>
                    <div className="flex gap-2">
                      {DIAS_SEMANA.map((dia) => {
                        const isSelected = watchedDias?.includes(dia.value)
                        return (
                          <button
                            key={dia.value}
                            type="button"
                            onClick={() => toggleDia(dia.value)}
                            className={cn(
                              'w-12 h-12 rounded-lg text-sm font-medium transition-colors',
                              isSelected
                                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                            )}
                          >
                            {dia.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Limits & Approvals */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Límite por operación */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Límite por operación (MXN)
                    </label>
                    <input
                      type="number"
                      {...form.register('limiteMontoOperacion', { valueAsNumber: true })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none"
                      placeholder="Sin límite"
                    />
                  </div>

                  {/* Límite diario */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Límite diario (MXN)
                    </label>
                    <input
                      type="number"
                      {...form.register('limiteDiario', { valueAsNumber: true })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none"
                      placeholder="Sin límite"
                    />
                  </div>

                  {/* Requiere aprobación */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...form.register('requiereAprobacion')}
                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-white">
                          Requiere aprobación para operaciones
                        </span>
                        <p className="text-xs text-white/50">
                          Las operaciones quedarán pendientes hasta aprobarlas
                        </p>
                      </div>
                    </label>

                    {form.watch('requiereAprobacion') && (
                      <div className="mt-4">
                        <label className="block text-sm text-white/70 mb-2">
                          Monto a partir del cual requiere aprobación
                        </label>
                        <input
                          type="number"
                          {...form.register('montoRequiereAprobacion', { valueAsNumber: true })}
                          className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none"
                          placeholder="0 = siempre"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t border-white/10">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Anterior
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600 disabled:opacity-50"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Crear Usuario
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function UserManagementPanel() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedRol, setSelectedRol] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Fetch usuarios
  const { data: usuarios, isLoading } = useQuery<Usuario[]>({
    queryKey: ['usuarios', searchQuery, selectedRol],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (selectedRol) params.set('rol', selectedRol)
      const res = await fetch(`/api/usuarios?${params}`)
      if (!res.ok) throw new Error('Error al cargar usuarios')
      return res.json()
    },
  })

  // Fetch roles
  const { data: roles } = useQuery<Rol[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await fetch('/api/roles')
      if (!res.ok) return []
      return res.json()
    },
  })

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['usuarios'] })
  }, [queryClient])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-violet-400" />
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-white/50">
            Administra usuarios y sus permisos de acceso
          </p>
        </div>
        <motion.button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <UserPlus className="h-4 w-4" />
          Nuevo Usuario
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-violet-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedRol || ''}
          onChange={(e) => setSelectedRol(e.target.value || null)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:outline-none"
        >
          <option value="">Todos los roles</option>
          {roles?.map((rol) => (
            <option key={rol.id} value={rol.id}>{rol.nombre}</option>
          ))}
        </select>
      </div>

      {/* Users Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        </div>
      ) : usuarios && usuarios.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {usuarios.map((usuario) => (
            <UserCard
              key={usuario.id}
              usuario={usuario}
              onEdit={() => {}}
              onViewActivity={() => {}}
              onToggleBlock={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <Users className="h-12 w-12 text-white/20 mb-4" />
          <p className="text-white/50">No hay usuarios</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 text-violet-400 hover:text-violet-300"
          >
            Crear primer usuario
          </button>
        </div>
      )}

      {/* Create Modal */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        roles={roles || []}
        onSuccess={handleRefresh}
      />
    </div>
  )
}

export default UserManagementPanel
