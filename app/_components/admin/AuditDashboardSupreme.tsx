/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 PANEL DE AUDITORÍA SUPREMO — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel visual completo de auditoría con:
 * - Timeline de actividad en tiempo real
 * - Gráficos de actividad por usuario, módulo, horario
 * - Alertas de actividad sospechosa
 * - Filtros avanzados
 * - Exportación de logs
 * - Detalles expandibles con contexto completo
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUpDown,
  Ban,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Fingerprint,
  Globe,
  History,
  Info,
  Laptop,
  LineChart,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  Monitor,
  MoreHorizontal,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  UserCheck,
  UserX,
  X,
  Zap,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart as AreaChartRecharts,
  Area,
  BarChart as BarChartRecharts,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart as PieChartRecharts,
  Pie
} from 'recharts'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type AccionAudit =
  | 'crear' | 'editar' | 'eliminar' | 'ver' | 'exportar'
  | 'login' | 'logout' | 'aprobar' | 'rechazar'
  | 'transferir' | 'ingreso' | 'gasto' | 'ajuste' | 'corte'
  | 'bloquear' | 'desbloquear' | 'cambio_rol' | 'cambio_permiso'

export type ModuloAudit =
  | 'bancos' | 'ventas' | 'clientes' | 'distribuidores'
  | 'almacen' | 'ordenes' | 'reportes' | 'configuracion'
  | 'usuarios' | 'roles' | 'sistema' | 'auditoria'

export type SeveridadAudit = 'info' | 'warning' | 'error' | 'critical'

export interface DispositivoAudit {
  ip: string
  userAgent: string
  navegador: string
  sistemaOperativo: string
  tipoDispositivo: 'desktop' | 'mobile' | 'tablet'
  ubicacion?: string
}

export interface UsuarioAudit {
  id: string
  nombre: string
  email: string
  avatar?: string
  rol?: string
  rolColor?: string
}

export interface EntradaAudit {
  id: string
  usuario: UsuarioAudit
  accion: AccionAudit
  modulo: ModuloAudit
  descripcion: string
  severidad: SeveridadAudit
  entidad?: {
    tipo: string
    id: string
    nombre: string
  }
  datosAntes?: Record<string, unknown>
  datosDespues?: Record<string, unknown>
  cambios?: { campo: string; antes: unknown; despues: unknown }[]
  contextoFinanciero?: {
    bancoId: string
    bancoNombre: string
    monto: number
    balanceAnterior?: number
    balanceNuevo?: number
  }
  dispositivo: DispositivoAudit
  exitoso: boolean
  mensajeError?: string
  duracionMs?: number
  timestamp: number
}

export interface AlertaAudit {
  id: string
  tipo: 'exceso_operaciones' | 'horario_inusual' | 'ip_nueva' | 'error_frecuente' | 'monto_alto' | 'actividad_sospechosa'
  severidad: SeveridadAudit
  titulo: string
  descripcion: string
  usuario: UsuarioAudit
  timestamp: number
  atendida: boolean
  atendidaPor?: UsuarioAudit
  atendidaAt?: number
}

export interface EstadisticasAudit {
  totalHoy: number
  totalSemana: number
  porUsuario: { usuario: UsuarioAudit; total: number }[]
  porModulo: { modulo: ModuloAudit; total: number }[]
  porAccion: { accion: AccionAudit; total: number }[]
  porHora: { hora: string; total: number }[]
  alertasActivas: number
}

interface AuditDashboardProps {
  entradas: EntradaAudit[]
  alertas: AlertaAudit[]
  estadisticas: EstadisticasAudit

  // Callbacks
  onVerDetalle?: (entrada: EntradaAudit) => void
  onAtenderAlerta?: (alerta: AlertaAudit) => void
  onExportar?: () => void
  onRefresh?: () => void
  onFiltrosChange?: (filtros: {
    usuario?: string
    modulo?: ModuloAudit
    accion?: AccionAudit
    severidad?: SeveridadAudit
    desde?: number
    hasta?: number
  }) => void

  // Estados
  loading?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ACCIONES_CONFIG: Record<AccionAudit, { color: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
  crear: { color: '#10B981', icon: Plus, label: 'Crear' },
  editar: { color: '#3B82F6', icon: Edit, label: 'Editar' },
  eliminar: { color: '#EF4444', icon: Trash2, label: 'Eliminar' },
  ver: { color: '#8B5CF6', icon: Eye, label: 'Ver' },
  exportar: { color: '#06B6D4', icon: Download, label: 'Exportar' },
  login: { color: '#22C55E', icon: LogIn, label: 'Inicio Sesión' },
  logout: { color: '#64748B', icon: LogOut, label: 'Cierre Sesión' },
  aprobar: { color: '#10B981', icon: Check, label: 'Aprobar' },
  rechazar: { color: '#EF4444', icon: X, label: 'Rechazar' },
  transferir: { color: '#F59E0B', icon: Zap, label: 'Transferir' },
  ingreso: { color: '#10B981', icon: TrendingUp, label: 'Ingreso' },
  gasto: { color: '#EF4444', icon: TrendingDown, label: 'Gasto' },
  ajuste: { color: '#8B5CF6', icon: Settings, label: 'Ajuste' },
  corte: { color: '#EC4899', icon: FileText, label: 'Corte' },
  bloquear: { color: '#DC2626', icon: Lock, label: 'Bloquear' },
  desbloquear: { color: '#22C55E', icon: ShieldCheck, label: 'Desbloquear' },
  cambio_rol: { color: '#F59E0B', icon: Shield, label: 'Cambio Rol' },
  cambio_permiso: { color: '#8B5CF6', icon: ShieldAlert, label: 'Cambio Permiso' },
}

const MODULOS_CONFIG: Record<ModuloAudit, { color: string; label: string }> = {
  bancos: { color: '#8B5CF6', label: 'Bancos' },
  ventas: { color: '#10B981', label: 'Ventas' },
  clientes: { color: '#3B82F6', label: 'Clientes' },
  distribuidores: { color: '#F59E0B', label: 'Distribuidores' },
  almacen: { color: '#06B6D4', label: 'Almacén' },
  ordenes: { color: '#EC4899', label: 'Órdenes' },
  reportes: { color: '#22C55E', label: 'Reportes' },
  configuracion: { color: '#64748B', label: 'Configuración' },
  usuarios: { color: '#EF4444', label: 'Usuarios' },
  roles: { color: '#F59E0B', label: 'Roles' },
  sistema: { color: '#DC2626', label: 'Sistema' },
  auditoria: { color: '#8B5CF6', label: 'Auditoría' },
}

const SEVERIDAD_CONFIG: Record<SeveridadAudit, { color: string; bg: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  info: { color: '#3B82F6', bg: 'bg-blue-500/10', label: 'Info', icon: Info },
  warning: { color: '#F59E0B', bg: 'bg-amber-500/10', label: 'Advertencia', icon: AlertTriangle },
  error: { color: '#EF4444', bg: 'bg-rose-500/10', label: 'Error', icon: AlertCircle },
  critical: { color: '#DC2626', bg: 'bg-red-500/10', label: 'Crítico', icon: ShieldAlert },
}

const ALERTA_TIPOS_CONFIG = {
  exceso_operaciones: { color: '#F59E0B', icon: Activity, label: 'Exceso Operaciones' },
  horario_inusual: { color: '#8B5CF6', icon: Clock, label: 'Horario Inusual' },
  ip_nueva: { color: '#06B6D4', icon: Globe, label: 'IP Nueva' },
  error_frecuente: { color: '#EF4444', icon: AlertCircle, label: 'Errores Frecuentes' },
  monto_alto: { color: '#22C55E', icon: TrendingUp, label: 'Monto Alto' },
  actividad_sospechosa: { color: '#DC2626', icon: ShieldAlert, label: 'Actividad Sospechosa' },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Stat Card
const StatCard = memo(function StatCard({
  titulo,
  valor,
  cambio,
  icono: Icon,
  color,
}: {
  titulo: string
  valor: number | string
  cambio?: number
  icono: React.ComponentType<{ className?: string }>
  color: string
}) {
  // Mapeo de colores a clases de Tailwind
  const colorClasses = {
    '#3b82f6': 'bg-blue-500/20 text-blue-400', // azul
    '#10b981': 'bg-emerald-500/20 text-emerald-400', // verde
    '#f59e0b': 'bg-amber-500/20 text-amber-400', // ámbar
    '#ef4444': 'bg-red-500/20 text-red-400', // rojo
    '#8b5cf6': 'bg-violet-500/20 text-violet-400', // violeta
    '#ec4899': 'bg-pink-500/20 text-pink-400', // rosa
  }[color] || 'bg-slate-500/20 text-slate-400'

  const [bgClass, textClass] = colorClasses.split(' ')

  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg ${bgClass}`}>
          <Icon className={`h-5 w-5 ${textClass}`} />
        </div>
        {cambio !== undefined && (
          <span
            className={cn(
              'text-xs font-medium',
              cambio >= 0 ? 'text-emerald-400' : 'text-rose-400'
            )}
          >
            {cambio >= 0 ? '+' : ''}{cambio}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{valor}</p>
      <p className="text-xs text-white/50 mt-1">{titulo}</p>
    </div>
  )
})

// Alert Card
const AlertCard = memo(function AlertCard({
  alerta,
  onAtender,
}: {
  alerta: AlertaAudit
  onAtender: () => void
}) {
  const config = ALERTA_TIPOS_CONFIG[alerta.tipo]
  const severidadConfig = SEVERIDAD_CONFIG[alerta.severidad]
  const Icon = config.icon

  return (
    <motion.div
      className={cn(
        'p-4 rounded-xl border transition-all',
        alerta.atendida
          ? 'border-white/10 bg-white/5 opacity-60'
          : 'border-amber-500/30 bg-amber-500/10'
      )}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.color}20` }}>
          <Icon className="h-5 w-5" style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white">{alerta.titulo}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${severidadConfig.color}20`, color: severidadConfig.color }}
            >
              {severidadConfig.label}
            </span>
          </div>
          <p className="text-xs text-white/60 mb-2">{alerta.descripcion}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <User className="h-3 w-3" />
              <span>{alerta.usuario.nombre}</span>
              <span>•</span>
              <Clock className="h-3 w-3" />
              <span>{new Date(alerta.timestamp).toLocaleTimeString('es-MX')}</span>
            </div>
            {!alerta.atendida && (
              <button
                className="px-2 py-1 text-xs rounded-lg bg-white/10 text-white/70 hover:bg-white/20"
                onClick={onAtender}
              >
                Atender
              </button>
            )}
          </div>
          {alerta.atendida && alerta.atendidaPor && (
            <p className="text-xs text-white/40 mt-2">
              Atendida por {alerta.atendidaPor.nombre} el{' '}
              {new Date(alerta.atendidaAt!).toLocaleString('es-MX')}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
})

// Activity Entry
const ActivityEntry = memo(function ActivityEntry({
  entrada,
  onVerDetalle,
}: {
  entrada: EntradaAudit
  onVerDetalle: () => void
}) {
  const accionConfig = ACCIONES_CONFIG[entrada.accion]
  const moduloConfig = MODULOS_CONFIG[entrada.modulo]
  const severidadConfig = SEVERIDAD_CONFIG[entrada.severidad]
  const Icon = accionConfig.icon

  const tipoDispositivo = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Laptop,
  }
  const DispositivoIcon = tipoDispositivo[entrada.dispositivo.tipoDispositivo]

  return (
    <motion.div
      className={cn(
        'group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer',
        entrada.exitoso
          ? 'border-white/10 bg-white/5 hover:bg-white/8'
          : 'border-rose-500/30 bg-rose-500/10'
      )}
      onClick={onVerDetalle}
      whileHover={{ x: 4 }}
    >
      {/* Icon */}
      <div
        className={cn(
          'p-2 rounded-lg shrink-0',
          {
            '#3b82f6': 'bg-blue-500/20',
            '#10b981': 'bg-emerald-500/20',
            '#ef4444': 'bg-red-500/20',
            '#8b5cf6': 'bg-violet-500/20',
            '#06b6d4': 'bg-cyan-500/20',
            '#22c55e': 'bg-green-500/20',
            '#64748b': 'bg-slate-500/20',
            '#f59e0b': 'bg-amber-500/20',
            '#dc2626': 'bg-red-600/20',
            '#ec4899': 'bg-pink-500/20',
          }[accionConfig.color] || 'bg-slate-500/20'
        )}
      >
        <Icon className={cn(
          'h-5 w-5',
          {
            '#3b82f6': 'text-blue-400',
            '#10b981': 'text-emerald-400',
            '#ef4444': 'text-red-400',
            '#8b5cf6': 'text-violet-400',
            '#06b6d4': 'text-cyan-400',
            '#22c55e': 'text-green-400',
            '#64748b': 'text-slate-400',
            '#f59e0b': 'text-amber-400',
            '#dc2626': 'text-red-500',
            '#ec4899': 'text-pink-400',
          }[accionConfig.color] || 'text-slate-400'
        )} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white truncate">
            {entrada.descripcion}
          </span>
          {!entrada.exitoso && (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-white/50">
          <span>{entrada.usuario.nombre}</span>
          <span
            className="px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${moduloConfig.color}20`, color: moduloConfig.color }}
          >
            {moduloConfig.label}
          </span>
          <div className="flex items-center gap-1">
            <DispositivoIcon className="h-3 w-3" />
            <span>{entrada.dispositivo.ip}</span>
          </div>
        </div>
      </div>

      {/* Time */}
      <div className="text-right shrink-0">
        <p className="text-xs text-white/50">
          {new Date(entrada.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="text-xs text-white/30">
          {new Date(entrada.timestamp).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/60 shrink-0" />
    </motion.div>
  )
})

// Activity Chart
const ActivityChart = memo(function ActivityChart({ data }: { data: { hora: string; total: number }[] }) {
  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChartRecharts data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="hora" stroke="rgba(255,255,255,0.3)" fontSize={10} />
          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'white' }}
          />
          <Bar dataKey="total" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
        </BarChartRecharts>
      </ResponsiveContainer>
    </div>
  )
})

// Module Distribution
const ModuleDistribution = memo(function ModuleDistribution({
  data,
}: {
  data: { modulo: ModuloAudit; total: number }[]
}) {
  const pieData = data.map((d) => ({
    name: MODULOS_CONFIG[d.modulo].label,
    value: d.total,
    color: MODULOS_CONFIG[d.modulo].color,
  }))

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChartRecharts>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}
          />
        </PieChartRecharts>
      </ResponsiveContainer>
    </div>
  )
})

// Top Users
const TopUsers = memo(function TopUsers({ data }: { data: { usuario: UsuarioAudit; total: number }[] }) {
  const maxTotal = Math.max(...data.map((d) => d.total))

  return (
    <div className="space-y-3">
      {data.slice(0, 5).map((item, index) => (
        <div key={item.usuario.id} className="flex items-center gap-3">
          <div className="w-6 text-center">
            <span className="text-xs text-white/50">#{index + 1}</span>
          </div>
          {item.usuario.avatar ? (
            <img src={item.usuario.avatar} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
              <User className="h-4 w-4 text-violet-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{item.usuario.nombre}</p>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
              <motion.div
                className="h-full rounded-full bg-violet-500"
                initial={{ width: 0 }}
                animate={{ width: `${(item.total / maxTotal) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-white">{item.total}</span>
        </div>
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const AuditDashboardSupreme = memo(function AuditDashboardSupreme({
  entradas,
  alertas,
  estadisticas,
  onVerDetalle,
  onAtenderAlerta,
  onExportar,
  onRefresh,
  onFiltrosChange,
  loading = false,
  className,
}: AuditDashboardProps) {
  const [tabActiva, setTabActiva] = useState<'actividad' | 'alertas'>('actividad')
  const [busqueda, setBusqueda] = useState('')
  const [filtroModulo, setFiltroModulo] = useState<ModuloAudit | null>(null)
  const [filtroSeveridad, setFiltroSeveridad] = useState<SeveridadAudit | null>(null)

  // Filtered entries
  const entradasFiltradas = useMemo(() => {
    let resultado = [...entradas]

    if (busqueda) {
      const termino = busqueda.toLowerCase()
      resultado = resultado.filter(
        (e) =>
          e.descripcion.toLowerCase().includes(termino) ||
          e.usuario.nombre.toLowerCase().includes(termino) ||
          e.dispositivo.ip.includes(termino)
      )
    }

    if (filtroModulo) {
      resultado = resultado.filter((e) => e.modulo === filtroModulo)
    }

    if (filtroSeveridad) {
      resultado = resultado.filter((e) => e.severidad === filtroSeveridad)
    }

    return resultado
  }, [entradas, busqueda, filtroModulo, filtroSeveridad])

  const alertasActivas = useMemo(() => alertas.filter((a) => !a.atendida), [alertas])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-violet-400" />
            Centro de Auditoría
          </h2>
          <p className="text-sm text-white/50">Monitoreo de actividad en tiempo real</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tabActiva === 'actividad'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
              onClick={() => setTabActiva('actividad')}
            >
              <Activity className="h-4 w-4 inline mr-2" />
              Actividad
            </button>
            <button
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all relative',
                tabActiva === 'alertas'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
              onClick={() => setTabActiva('alertas')}
            >
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Alertas
              {alertasActivas.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center">
                  {alertasActivas.length}
                </span>
              )}
            </button>
          </div>

          <button
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
            onClick={onExportar}
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
            onClick={onRefresh}
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          titulo="Actividad Hoy"
          valor={estadisticas.totalHoy}
          cambio={12}
          icono={Activity}
          color="#8B5CF6"
        />
        <StatCard
          titulo="Esta Semana"
          valor={estadisticas.totalSemana}
          cambio={8}
          icono={Calendar}
          color="#3B82F6"
        />
        <StatCard
          titulo="Alertas Activas"
          valor={estadisticas.alertasActivas}
          icono={AlertTriangle}
          color="#F59E0B"
        />
        <StatCard
          titulo="Usuarios Activos"
          valor={estadisticas.porUsuario.length}
          icono={User}
          color="#10B981"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity by hour */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Actividad por Hora
          </h3>
          <ActivityChart data={estadisticas.porHora} />
        </div>

        {/* Module distribution */}
        <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-violet-400" />
            Por Módulo
          </h3>
          <ModuleDistribution data={estadisticas.porModulo} />
          <div className="flex flex-wrap gap-2 mt-4">
            {estadisticas.porModulo.slice(0, 4).map((item) => {
              const config = MODULOS_CONFIG[item.modulo]
              return (
                <span
                  key={item.modulo}
                  className="text-xs px-2 py-1 rounded"
                  style={{ backgroundColor: `${config.color}20`, color: config.color }}
                >
                  {config.label}: {item.total}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content based on tab */}
      <AnimatePresence mode="wait">
        {tabActiva === 'actividad' ? (
          <motion.div
            key="actividad"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Activity timeline */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar actividad..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <select
                  value={filtroModulo || ''}
                  onChange={(e) => setFiltroModulo(e.target.value as ModuloAudit || null)}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="">Todos los módulos</option>
                  {Object.entries(MODULOS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
                <select
                  value={filtroSeveridad || ''}
                  onChange={(e) => setFiltroSeveridad(e.target.value as SeveridadAudit || null)}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="">Toda severidad</option>
                  {Object.entries(SEVERIDAD_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              {/* Entries list */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {loading ? (
                  <div className="py-12 text-center">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-violet-400" />
                    <p className="text-sm text-white/50 mt-2">Cargando actividad...</p>
                  </div>
                ) : entradasFiltradas.length === 0 ? (
                  <div className="py-12 text-center">
                    <History className="h-8 w-8 mx-auto text-white/30 mb-2" />
                    <p className="text-sm text-white/50">No hay actividad registrada</p>
                  </div>
                ) : (
                  entradasFiltradas.map((entrada) => (
                    <ActivityEntry
                      key={entrada.id}
                      entrada={entrada}
                      onVerDetalle={() => onVerDetalle?.(entrada)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Top users */}
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 h-fit">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-400" />
                Usuarios Más Activos
              </h3>
              <TopUsers data={estadisticas.porUsuario} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="alertas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {alertasActivas.length} Alertas Activas
              </h3>
              <button
                className="text-sm text-white/50 hover:text-white"
                onClick={() => {}}
              >
                Ver historial
              </button>
            </div>

            {alertasActivas.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-white/10 bg-white/5">
                <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-400 mb-3" />
                <p className="text-lg font-medium text-white">Todo en orden</p>
                <p className="text-sm text-white/50">No hay alertas pendientes de atención</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alertasActivas.map((alerta) => (
                  <AlertCard
                    key={alerta.id}
                    alerta={alerta}
                    onAtender={() => onAtenderAlerta?.(alerta)}
                  />
                ))}
              </div>
            )}

            {/* Attended alerts */}
            {alertas.filter((a) => a.atendida).length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-white/60 mb-3">Alertas Atendidas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alertas
                    .filter((a) => a.atendida)
                    .slice(0, 4)
                    .map((alerta) => (
                      <AlertCard
                        key={alerta.id}
                        alerta={alerta}
                        onAtender={() => {}}
                      />
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// Missing icon import
const CheckCircle2 = Check

export default AuditDashboardSupreme
