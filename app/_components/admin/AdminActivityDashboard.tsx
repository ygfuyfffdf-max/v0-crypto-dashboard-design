'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 ADMIN ACTIVITY DASHBOARD — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Dashboard completo de actividad del sistema con:
 * - Vista general de operaciones en tiempo real
 * - Estadísticas por módulo, usuario, período
 * - Logs de auditoría con filtros avanzados
 * - Cola de aprobaciones pendientes
 * - Alertas y notificaciones del sistema
 * - Usuarios activos en línea
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertCircle, AlertTriangle, ArrowDown, ArrowLeft, ArrowRight,
  ArrowUp, BarChart3, Building2, Calendar, Check, ChevronDown, ChevronRight,
  Clock, Copy, DollarSign, Download, Edit, Eye, FileText, Filter,
  Hash, History, Info, Laptop, LineChart, Loader2, Lock, LogIn, LogOut,
  MapPin, MoreVertical, Pause, PieChart, Play, Plus, RefreshCw, Search,
  Settings, Shield, ShieldCheck, Smartphone, Sparkles, Trash2, TrendingDown,
  TrendingUp, User, UserCheck, UserMinus, UserPlus, Users, X, Zap
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ActivityEntry {
  id: string
  usuarioId: string
  usuarioNombre: string
  usuarioAvatar?: string
  accion: string
  modulo: string
  descripcion: string
  entidadTipo?: string
  entidadId?: string
  bancoId?: string
  bancoNombre?: string
  monto?: number
  exitoso: boolean
  ipAddress?: string
  dispositivo?: string
  timestamp: Date
}

interface UserOnline {
  id: string
  nombre: string
  avatar?: string
  rol: string
  ultimaActividad: Date
  moduloActual?: string
  dispositivo?: string
  ipAddress?: string
}

interface AprobacionPendiente {
  id: string
  solicitante: string
  accion: string
  modulo: string
  monto?: number
  bancoNombre?: string
  motivo?: string
  createdAt: Date
  expiraAt: Date
}

interface SystemAlert {
  id: string
  tipo: 'warning' | 'error' | 'info'
  titulo: string
  mensaje: string
  modulo?: string
  timestamp: Date
  resuelta: boolean
}

interface DashboardStats {
  operacionesHoy: number
  operacionesSemana: number
  cambioSemana: number
  usuariosActivos: number
  aprobacionesPendientes: number
  alertasActivas: number
  montoTotalHoy: number
  montoTotalSemana: number
}

interface AdminActivityDashboardProps {
  initialStats?: DashboardStats
  initialActivities?: ActivityEntry[]
  initialUsers?: UserOnline[]
  initialAprobaciones?: AprobacionPendiente[]
  initialAlertas?: SystemAlert[]
  onRefresh?: () => void
  onAprobar?: (id: string) => void
  onRechazar?: (id: string, motivo: string) => void
  onResolverAlerta?: (id: string) => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const MOCK_STATS: DashboardStats = {
  operacionesHoy: 127,
  operacionesSemana: 890,
  cambioSemana: 12.5,
  usuariosActivos: 8,
  aprobacionesPendientes: 3,
  alertasActivas: 2,
  montoTotalHoy: 1250000,
  montoTotalSemana: 8500000,
}

const MOCK_ACTIVITIES: ActivityEntry[] = [
  {
    id: '1',
    usuarioId: 'u1',
    usuarioNombre: 'Admin Principal',
    accion: 'ingreso',
    modulo: 'bancos',
    descripcion: 'Registró ingreso de $50,000 en Profit',
    bancoId: 'profit',
    bancoNombre: 'Profit',
    monto: 50000,
    exitoso: true,
    dispositivo: 'Desktop',
    ipAddress: '192.168.1.1',
    timestamp: new Date(),
  },
  {
    id: '2',
    usuarioId: 'u2',
    usuarioNombre: 'Operador 1',
    accion: 'transferir',
    modulo: 'bancos',
    descripcion: 'Transferencia $25,000 de Bóveda Monte a Leftie',
    bancoId: 'boveda_monte',
    bancoNombre: 'Bóveda Monte',
    monto: 25000,
    exitoso: true,
    dispositivo: 'Mobile',
    ipAddress: '192.168.1.2',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '3',
    usuarioId: 'u3',
    usuarioNombre: 'Cajero Profit',
    accion: 'gasto',
    modulo: 'bancos',
    descripcion: 'Intentó registrar gasto de $80,000 - RECHAZADO',
    bancoId: 'profit',
    bancoNombre: 'Profit',
    monto: 80000,
    exitoso: false,
    dispositivo: 'Desktop',
    timestamp: new Date(Date.now() - 600000),
  },
  {
    id: '4',
    usuarioId: 'u1',
    usuarioNombre: 'Admin Principal',
    accion: 'crear',
    modulo: 'clientes',
    descripcion: 'Creó nuevo cliente: Distribuidora ABC',
    exitoso: true,
    dispositivo: 'Desktop',
    timestamp: new Date(Date.now() - 1200000),
  },
  {
    id: '5',
    usuarioId: 'u2',
    usuarioNombre: 'Operador 1',
    accion: 'login',
    modulo: 'sistema',
    descripcion: 'Inició sesión desde iOS Safari',
    exitoso: true,
    dispositivo: 'iPhone',
    ipAddress: '192.168.1.15',
    timestamp: new Date(Date.now() - 1800000),
  },
]

const MOCK_USERS_ONLINE: UserOnline[] = [
  {
    id: 'u1',
    nombre: 'Admin Principal',
    rol: 'Administrador',
    ultimaActividad: new Date(),
    moduloActual: 'bancos',
    dispositivo: 'Desktop',
    ipAddress: '192.168.1.1',
  },
  {
    id: 'u2',
    nombre: 'Operador 1',
    rol: 'Operador General',
    ultimaActividad: new Date(Date.now() - 120000),
    moduloActual: 'ventas',
    dispositivo: 'Mobile',
    ipAddress: '192.168.1.2',
  },
  {
    id: 'u3',
    nombre: 'Cajero Profit',
    rol: 'Cajero',
    ultimaActividad: new Date(Date.now() - 300000),
    moduloActual: 'bancos',
    dispositivo: 'Desktop',
    ipAddress: '192.168.1.3',
  },
]

const MOCK_APROBACIONES: AprobacionPendiente[] = [
  {
    id: 'ap1',
    solicitante: 'Operador 1',
    accion: 'gasto',
    modulo: 'bancos',
    monto: 75000,
    bancoNombre: 'Leftie',
    motivo: 'Pago urgente a proveedor',
    createdAt: new Date(Date.now() - 3600000),
    expiraAt: new Date(Date.now() + 20 * 3600000),
  },
  {
    id: 'ap2',
    solicitante: 'Cajero Profit',
    accion: 'transferir',
    modulo: 'bancos',
    monto: 100000,
    bancoNombre: 'Profit',
    motivo: 'Consolidación mensual',
    createdAt: new Date(Date.now() - 7200000),
    expiraAt: new Date(Date.now() + 16 * 3600000),
  },
]

const MOCK_ALERTAS: SystemAlert[] = [
  {
    id: 'al1',
    tipo: 'warning',
    titulo: 'Límite Diario Cercano',
    mensaje: 'Operador 1 ha alcanzado el 90% de su límite diario',
    modulo: 'bancos',
    timestamp: new Date(Date.now() - 1800000),
    resuelta: false,
  },
  {
    id: 'al2',
    tipo: 'error',
    titulo: 'Intentos Fallidos de Login',
    mensaje: '5 intentos fallidos desde IP 192.168.1.100',
    modulo: 'sistema',
    timestamp: new Date(Date.now() - 3600000),
    resuelta: false,
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' }
  color: 'violet' | 'emerald' | 'rose' | 'amber' | 'blue' | 'orange'
  format?: 'number' | 'currency' | 'percent'
  subtitle?: string
  pulse?: boolean
  onClick?: () => void
}

const colorStyles = {
  violet: { bg: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/30', text: 'text-violet-400' },
  emerald: { bg: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  rose: { bg: 'from-rose-500/20 to-pink-500/10', border: 'border-rose-500/30', text: 'text-rose-400' },
  amber: { bg: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  blue: { bg: 'from-blue-500/20 to-sky-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  orange: { bg: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
}

const StatCard = memo(function StatCard({
  title, value, icon, trend, color, format = 'number', subtitle, pulse, onClick
}: StatCardProps) {
  const cfg = colorStyles[color]
  
  const formattedValue = useMemo(() => {
    if (typeof value === 'string') return value
    if (format === 'currency') return formatCurrency(value)
    if (format === 'percent') return `${value.toFixed(1)}%`
    return value.toLocaleString('es-MX')
  }, [value, format])

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 cursor-pointer transition-all',
        cfg.bg, cfg.border,
        pulse && 'animate-pulse'
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between">
        <div className={cn('rounded-xl p-2.5', cfg.text.replace('text-', 'bg-').replace('400', '500/20'))}>
          {icon}
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
            trend.direction === 'up' && 'bg-emerald-500/20 text-emerald-400',
            trend.direction === 'down' && 'bg-rose-500/20 text-rose-400',
            trend.direction === 'neutral' && 'bg-amber-500/20 text-amber-400'
          )}>
            {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend.value).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-white">{formattedValue}</p>
        <p className="mt-1 text-sm text-white/60">{title}</p>
        {subtitle && <p className={cn('mt-0.5 text-xs', cfg.text)}>{subtitle}</p>}
      </div>
    </motion.div>
  )
})

const ActivityItem = memo(function ActivityItem({ entry }: { entry: ActivityEntry }) {
  const accionConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
    ingreso: { icon: ArrowDown, color: 'text-emerald-400 bg-emerald-500/20' },
    gasto: { icon: ArrowUp, color: 'text-rose-400 bg-rose-500/20' },
    transferir: { icon: ArrowRight, color: 'text-blue-400 bg-blue-500/20' },
    crear: { icon: Plus, color: 'text-violet-400 bg-violet-500/20' },
    editar: { icon: Edit, color: 'text-amber-400 bg-amber-500/20' },
    eliminar: { icon: Trash2, color: 'text-rose-400 bg-rose-500/20' },
    login: { icon: LogIn, color: 'text-emerald-400 bg-emerald-500/20' },
    logout: { icon: LogOut, color: 'text-amber-400 bg-amber-500/20' },
    aprobar: { icon: Check, color: 'text-emerald-400 bg-emerald-500/20' },
    rechazar: { icon: X, color: 'text-rose-400 bg-rose-500/20' },
  }
  
  const config = accionConfig[entry.accion] || { icon: Activity, color: 'text-white/50 bg-white/10' }
  const Icon = config.icon
  
  const timeAgo = useMemo(() => {
    const diff = Date.now() - entry.timestamp.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Ahora'
    if (mins < 60) return `Hace ${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `Hace ${hours}h`
    return entry.timestamp.toLocaleDateString('es-MX')
  }, [entry.timestamp])
  
  return (
    <motion.div
      className={cn(
        'flex items-start gap-4 p-4 rounded-xl border transition-all',
        entry.exitoso 
          ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]' 
          : 'border-rose-500/30 bg-rose-500/5'
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className={cn('rounded-xl p-2.5', config.color)}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-white">{entry.usuarioNombre}</p>
          <span className="text-xs text-white/40">{timeAgo}</span>
        </div>
        <p className="text-sm text-white/70 line-clamp-2">{entry.descripcion}</p>
        
        <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
          {entry.monto && (
            <span className={cn('font-medium', entry.exitoso ? 'text-emerald-400' : 'text-rose-400')}>
              {formatCurrency(entry.monto)}
            </span>
          )}
          {entry.dispositivo && (
            <span className="flex items-center gap-1">
              {entry.dispositivo === 'Mobile' || entry.dispositivo === 'iPhone' 
                ? <Smartphone className="h-3 w-3" /> 
                : <Laptop className="h-3 w-3" />}
              {entry.dispositivo}
            </span>
          )}
          {entry.ipAddress && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {entry.ipAddress}
            </span>
          )}
          {!entry.exitoso && (
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">FALLIDO</span>
          )}
        </div>
      </div>
    </motion.div>
  )
})

const UserOnlineItem = memo(function UserOnlineItem({ user }: { user: UserOnline }) {
  const isActive = Date.now() - user.ultimaActividad.getTime() < 300000 // 5 minutos
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/20 flex items-center justify-center">
          <User className="h-5 w-5 text-violet-400" />
        </div>
        <div className={cn(
          'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900',
          isActive ? 'bg-emerald-400' : 'bg-amber-400'
        )} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{user.nombre}</p>
        <p className="text-xs text-white/40">{user.rol}</p>
      </div>
      
      <div className="text-right">
        <p className="text-xs text-white/50">{user.moduloActual}</p>
        <p className="text-xs text-white/30">{user.dispositivo}</p>
      </div>
    </div>
  )
})

const AprobacionItem = memo(function AprobacionItem({ 
  ap, onAprobar, onRechazar 
}: { 
  ap: AprobacionPendiente
  onAprobar?: () => void
  onRechazar?: () => void
}) {
  const horasRestantes = Math.max(0, Math.floor((ap.expiraAt.getTime() - Date.now()) / 3600000))
  
  return (
    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-white">{ap.solicitante}</p>
          <p className="text-xs text-white/50">
            {ap.accion} en {ap.modulo}
            {ap.bancoNombre && ` • ${ap.bancoNombre}`}
          </p>
        </div>
        <span className="text-xs text-amber-400">{horasRestantes}h restantes</span>
      </div>
      
      {ap.monto && (
        <p className="text-lg font-bold text-amber-400 mb-2">{formatCurrency(ap.monto)}</p>
      )}
      
      {ap.motivo && (
        <p className="text-xs text-white/60 mb-3">{ap.motivo}</p>
      )}
      
      <div className="flex items-center gap-2">
        <button
          onClick={onAprobar}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"
        >
          <Check className="h-4 w-4" />
          Aprobar
        </button>
        <button
          onClick={onRechazar}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-rose-500/50 text-rose-400 text-sm font-medium hover:bg-rose-500/10"
        >
          <X className="h-4 w-4" />
          Rechazar
        </button>
      </div>
    </div>
  )
})

const AlertItem = memo(function AlertItem({
  alert, onResolver
}: {
  alert: SystemAlert
  onResolver?: () => void
}) {
  const config = {
    warning: { icon: AlertTriangle, color: 'border-amber-500/30 bg-amber-500/5 text-amber-400' },
    error: { icon: AlertCircle, color: 'border-rose-500/30 bg-rose-500/5 text-rose-400' },
    info: { icon: Info, color: 'border-blue-500/30 bg-blue-500/5 text-blue-400' },
  }
  
  const cfg = config[alert.tipo]
  const Icon = cfg.icon
  
  return (
    <div className={cn('p-4 rounded-xl border', cfg.color)}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{alert.titulo}</p>
          <p className="text-xs opacity-70 mt-1">{alert.mensaje}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs opacity-50">
              {alert.timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {onResolver && (
              <button
                onClick={onResolver}
                className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              >
                Resolver
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AdminActivityDashboard({
  initialStats = MOCK_STATS,
  initialActivities = MOCK_ACTIVITIES,
  initialUsers = MOCK_USERS_ONLINE,
  initialAprobaciones = MOCK_APROBACIONES,
  initialAlertas = MOCK_ALERTAS,
  onRefresh,
  onAprobar,
  onRechazar,
  onResolverAlerta,
}: AdminActivityDashboardProps) {
  const [stats] = useState(initialStats)
  const [activities] = useState(initialActivities)
  const [usersOnline] = useState(initialUsers)
  const [aprobaciones] = useState(initialAprobaciones)
  const [alertas] = useState(initialAlertas)
  const [isLive, setIsLive] = useState(true)
  const [filterModulo, setFilterModulo] = useState<string>('')

  const filteredActivities = useMemo(() => {
    if (!filterModulo) return activities
    return activities.filter(a => a.modulo === filterModulo)
  }, [activities, filterModulo])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-violet-400" />
            Panel de Actividad
          </h1>
          <p className="text-sm text-white/50">
            Monitoreo en tiempo real del sistema
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              isLive 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-white/10 text-white/50 border border-white/10'
            )}
          >
            {isLive ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                EN VIVO
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                PAUSADO
              </>
            )}
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Operaciones Hoy"
          value={stats.operacionesHoy}
          icon={<Activity className="h-5 w-5" />}
          color="violet"
          trend={{ value: stats.cambioSemana, direction: stats.cambioSemana >= 0 ? 'up' : 'down' }}
          subtitle={`${stats.operacionesSemana} esta semana`}
        />
        <StatCard
          title="Monto Operado Hoy"
          value={stats.montoTotalHoy}
          icon={<DollarSign className="h-5 w-5" />}
          color="emerald"
          format="currency"
          subtitle={`${formatCurrency(stats.montoTotalSemana)} esta semana`}
        />
        <StatCard
          title="Usuarios Activos"
          value={stats.usuariosActivos}
          icon={<Users className="h-5 w-5" />}
          color="blue"
          subtitle="En línea ahora"
        />
        <StatCard
          title="Aprobaciones Pendientes"
          value={stats.aprobacionesPendientes}
          icon={<Clock className="h-5 w-5" />}
          color="amber"
          pulse={stats.aprobacionesPendientes > 0}
          subtitle={`${stats.alertasActivas} alertas activas`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed - 2 columns */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <History className="h-5 w-5 text-violet-400" />
                Actividad Reciente
              </h2>
              
              <select
                value={filterModulo}
                onChange={(e) => setFilterModulo(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white"
              >
                <option value="">Todos los módulos</option>
                <option value="bancos">Bancos</option>
                <option value="ventas">Ventas</option>
                <option value="clientes">Clientes</option>
                <option value="sistema">Sistema</option>
              </select>
            </div>
          </div>
          
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {filteredActivities.map((entry) => (
              <ActivityItem key={entry.id} entry={entry} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Users Online */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="border-b border-white/10 p-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-400" />
                Usuarios en Línea
                <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                  {usersOnline.length}
                </span>
              </h3>
            </div>
            <div className="p-3 space-y-2">
              {usersOnline.map((user) => (
                <UserOnlineItem key={user.id} user={user} />
              ))}
            </div>
          </div>

          {/* Pending Approvals */}
          {aprobaciones.length > 0 && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
              <div className="border-b border-amber-500/20 p-4">
                <h3 className="font-semibold text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Aprobaciones Pendientes
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-500/20 text-xs">
                    {aprobaciones.length}
                  </span>
                </h3>
              </div>
              <div className="p-3 space-y-3">
                {aprobaciones.map((ap) => (
                  <AprobacionItem
                    key={ap.id}
                    ap={ap}
                    onAprobar={() => onAprobar?.(ap.id)}
                    onRechazar={() => onRechazar?.(ap.id, '')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* System Alerts */}
          {alertas.filter(a => !a.resuelta).length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="border-b border-white/10 p-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                  Alertas del Sistema
                </h3>
              </div>
              <div className="p-3 space-y-3">
                {alertas.filter(a => !a.resuelta).map((alert) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onResolver={() => onResolverAlerta?.(alert.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminActivityDashboard
