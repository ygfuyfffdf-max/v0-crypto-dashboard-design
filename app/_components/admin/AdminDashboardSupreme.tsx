/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 CHRONOS INFINITY 2026 — DASHBOARD DE ADMINISTRACIÓN SUPREMO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Dashboard completo de administración con:
 * - Vista general de actividad del sistema
 * - Métricas en tiempo real
 * - Auditoría visual
 * - Gestión de usuarios activos
 * - Alertas y notificaciones
 * - Gráficos de rendimiento
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Users,
  Shield,
  AlertTriangle,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  Settings,
  Bell,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  UserCheck,
  Lock,
  Unlock,
  Monitor,
  Smartphone,
  Globe,
  Zap,
  Database,
  Server,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/_components/ui/card'
import { Button } from '@/app/_components/ui/button'
import { Badge } from '@/app/_components/ui/badge'
import { Input } from '@/app/_components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_components/ui/tabs'
import { ScrollArea } from '@/app/_components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/_components/ui/avatar'
import { Progress } from '@/app/_components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/_components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/_components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/_components/ui/dropdown-menu'
import { cn } from '@/app/_lib/utils'
import { auditService, type EntradaAudit, type AlertaAudit, type EstadisticasAudit } from '@/app/_lib/services/audit-supreme.service'
import { notificacionesService } from '@/app/_lib/services/notifications-supreme.service'
import { exportService } from '@/app/_lib/services/export-supreme.service'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UsuarioActivo {
  id: string
  nombre: string
  email: string
  avatar?: string
  rol: string
  ultimaActividad: number
  ip: string
  dispositivo: string
  ubicacion?: string
  sesionInicio: number
  accionesHoy: number
}

interface MetricaDashboard {
  id: string
  titulo: string
  valor: number
  valorAnterior: number
  formato: 'numero' | 'moneda' | 'porcentaje'
  icono: React.ElementType
  color: string
  tendencia: 'up' | 'down' | 'neutral'
  periodo: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTES INTERNOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Card de Métrica Animada
 */
const MetricaCard = ({ metrica }: { metrica: MetricaDashboard }) => {
  const [contador, setContador] = useState(0)

  useEffect(() => {
    const duracion = 1500
    const pasos = 60
    const incremento = metrica.valor / pasos
    let actual = 0

    const timer = setInterval(() => {
      actual += incremento
      if (actual >= metrica.valor) {
        setContador(metrica.valor)
        clearInterval(timer)
      } else {
        setContador(Math.floor(actual))
      }
    }, duracion / pasos)

    return () => clearInterval(timer)
  }, [metrica.valor])

  const formatearValor = (val: number) => {
    switch (metrica.formato) {
      case 'moneda':
        return `$${val.toLocaleString('es-MX')}`
      case 'porcentaje':
        return `${val.toFixed(1)}%`
      default:
        return val.toLocaleString('es-MX')
    }
  }

  const cambio = metrica.valorAnterior > 0
    ? ((metrica.valor - metrica.valorAnterior) / metrica.valorAnterior * 100).toFixed(1)
    : '0'

  const IconoMetrica = metrica.icono
  
  // Mapeo de colores para Tailwind CSS
  const colorClasses = {
    slate: {
      bg: 'from-slate-500/20 to-slate-600/20',
      text: 'text-slate-400'
    },
    emerald: {
      bg: 'from-emerald-500/20 to-emerald-600/20',
      text: 'text-emerald-400'
    },
    blue: {
      bg: 'from-blue-500/20 to-blue-600/20',
      text: 'text-blue-400'
    },
    violet: {
      bg: 'from-violet-500/20 to-violet-600/20',
      text: 'text-violet-400'
    }
  }
  
  const colorClass = colorClasses[metrica.color as keyof typeof colorClasses] || colorClasses.slate
  
  // Componente de icono con clase dinámica
  const IconoConClase = () => {
    const className = cn("w-6 h-6", colorClass.text)
    const IconComponent = IconoMetrica as React.ComponentType<{ className?: string }>
    return <IconComponent className={className} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn(
        "relative overflow-hidden border-none shadow-lg",
        "bg-gradient-to-br from-slate-900/90 to-slate-800/90",
        "hover:shadow-xl transition-all duration-300"
      )}>
        {/* Efecto de brillo */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">{metrica.titulo}</p>
              <motion.p
                className="text-3xl font-bold text-white"
                key={contador}
              >
                {formatearValor(contador)}
              </motion.p>
              <div className="flex items-center gap-2">
                {metrica.tendencia === 'up' ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +{cambio}%
                  </Badge>
                ) : metrica.tendencia === 'down' ? (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                    {cambio}%
                  </Badge>
                ) : (
                  <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                    Sin cambio
                  </Badge>
                )}
                <span className="text-xs text-slate-500">{metrica.periodo}</span>
              </div>
            </div>
            <div className={cn(
              "p-3 rounded-xl bg-gradient-to-br",
              colorClass.bg
            )}>
              <IconoConClase />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/**
 * Componente de Usuario Activo
 */
const UsuarioActivoItem = ({ usuario }: { usuario: UsuarioActivo }) => {
  const tiempoActivo = Math.floor((Date.now() - usuario.sesionInicio) / 60000)
  const ultimaActividadMin = Math.floor((Date.now() - usuario.ultimaActividad) / 60000)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl",
        "bg-slate-800/50 hover:bg-slate-800/70",
        "border border-slate-700/50 transition-all duration-200"
      )}
    >
      <div className="relative">
        <Avatar className="h-12 w-12 border-2 border-emerald-500/50">
          <AvatarImage src={usuario.avatar} />
          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white">
            {usuario.nombre.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-800 animate-pulse" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-white truncate">{usuario.nombre}</p>
          <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-400">
            {usuario.rol}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Activo {tiempoActivo}min
          </span>
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" />
            {usuario.accionesHoy} acciones
          </span>
        </div>
      </div>

      <div className="text-right">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          {usuario.dispositivo === 'Móvil' ? (
            <Smartphone className="w-3 h-3" />
          ) : (
            <Monitor className="w-3 h-3" />
          )}
          <span>{usuario.dispositivo}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">{usuario.ip}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
          <DropdownMenuItem className="text-slate-300 hover:text-white">
            <Eye className="w-4 h-4 mr-2" />
            Ver actividad
          </DropdownMenuItem>
          <DropdownMenuItem className="text-slate-300 hover:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Ver permisos
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem className="text-red-400 hover:text-red-300">
            <Lock className="w-4 h-4 mr-2" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}

/**
 * Componente de Entrada de Auditoría
 */
const AuditLogItem = ({ entrada, expandido, onToggle }: {
  entrada: EntradaAudit
  expandido: boolean
  onToggle: () => void
}) => {
  const iconosAccion: Record<string, React.ElementType> = {
    crear: CheckCircle,
    editar: FileText,
    eliminar: XCircle,
    ver: Eye,
    login: UserCheck,
    logout: Lock,
    transferir: RefreshCw,
    ingreso: TrendingUp,
    gasto: TrendingDown,
    aprobar: CheckCircle,
    rechazar: XCircle
  }

  const coloresAccion: Record<string, string> = {
    crear: 'text-emerald-400',
    editar: 'text-blue-400',
    eliminar: 'text-red-400',
    ver: 'text-slate-400',
    login: 'text-violet-400',
    logout: 'text-orange-400',
    transferir: 'text-cyan-400',
    ingreso: 'text-emerald-400',
    gasto: 'text-red-400',
    aprobar: 'text-emerald-400',
    rechazar: 'text-red-400'
  }

  const Icono = iconosAccion[entrada.accion] || Activity

  return (
    <motion.div
      layout
      className={cn(
        "border rounded-xl overflow-hidden transition-all duration-200",
        "border-slate-700/50",
        expandido ? "bg-slate-800/70" : "bg-slate-800/30 hover:bg-slate-800/50"
      )}
    >
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className={cn(
          "p-2 rounded-lg",
          coloresAccion[entrada.accion]?.replace('text-', 'bg-').replace('400', '500/10')
        )}>
          {React.createElement(Icono, { className: cn("w-5 h-5", coloresAccion[entrada.accion] as string) })}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{entrada.usuario.nombre}</span>
            <Badge variant="outline" className="text-xs">
              {entrada.accion}
            </Badge>
            <Badge variant="outline" className="text-xs bg-slate-700/50">
              {entrada.modulo}
            </Badge>
          </div>
          <p className="text-sm text-slate-400 truncate mt-1">{entrada.descripcion}</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">
            {new Date(entrada.timestamp).toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p className="text-xs text-slate-500">
            {entrada.dispositivo.dispositivo}
          </p>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          {expandido ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </div>

      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-700/50"
          >
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-1">IP</p>
                <p className="text-white font-mono">{entrada.dispositivo.ip}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Navegador</p>
                <p className="text-white">{entrada.dispositivo.navegador}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Sistema</p>
                <p className="text-white">{entrada.dispositivo.sistemaOperativo}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Duración</p>
                <p className="text-white">{entrada.duracionMs || 0}ms</p>
              </div>

              {entrada.entidad && (
                <>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Entidad</p>
                    <p className="text-white">{entrada.entidad.nombre}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">ID Entidad</p>
                    <p className="text-white font-mono text-xs">{entrada.entidad.id}</p>
                  </div>
                </>
              )}

              {entrada.contextoFinanciero && (
                <>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Banco</p>
                    <p className="text-white">{entrada.contextoFinanciero.bancoNombre}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Monto</p>
                    <p className="text-emerald-400 font-medium">
                      ${entrada.contextoFinanciero.monto.toLocaleString()}
                    </p>
                  </div>
                </>
              )}

              {entrada.cambios.length > 0 && (
                <div className="col-span-full">
                  <p className="text-slate-500 text-xs mb-2">Cambios realizados</p>
                  <div className="flex flex-wrap gap-2">
                    {entrada.cambios.map((cambio, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        <span className="text-slate-400">{cambio.campo}:</span>
                        <span className="text-red-400 line-through ml-1">
                          {String(cambio.valorAnterior).substring(0, 20)}
                        </span>
                        <span className="text-emerald-400 ml-1">
                          → {String(cambio.valorNuevo).substring(0, 20)}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * Componente de Alerta
 */
const AlertaItem = ({ alerta, onAtender }: {
  alerta: AlertaAudit
  onAtender: (id: string) => void
}) => {
  const iconosTipo: Record<string, React.ElementType> = {
    exceso_operaciones: Activity,
    horario_inusual: Clock,
    ip_nueva: Globe,
    error_frecuente: AlertTriangle,
    monto_alto: TrendingUp,
    actividad_sospechosa: Shield
  }

  const coloresSeveridad: Record<string, string> = {
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    warning: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    critical: 'bg-red-600/30 border-red-500/50 text-red-300'
  }

  const Icono = iconosTipo[alerta.tipo] || AlertTriangle

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "p-4 rounded-xl border",
        coloresSeveridad[alerta.severidad]
      )}
    >
      <div className="flex items-start gap-3">
        {React.createElement(Icono, { className: "w-5 h-5 mt-0.5" })}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium">{alerta.titulo}</p>
            <span className="text-xs opacity-70">
              {new Date(alerta.timestamp).toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <p className="text-sm opacity-80 mt-1">{alerta.descripcion}</p>
          <div className="flex items-center justify-between mt-3">
            <Badge variant="outline" className="text-xs opacity-70">
              {alerta.usuarioNombre}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => onAtender(alerta.id)}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Atender
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default function AdminDashboardSupreme() {
  // Estados
  const [estadisticas, setEstadisticas] = useState<EstadisticasAudit | null>(null)
  const [auditoriaLogs, setAuditoriaLogs] = useState<EntradaAudit[]>([])
  const [alertas, setAlertas] = useState<AlertaAudit[]>([])
  const [usuariosActivos, setUsuariosActivos] = useState<UsuarioActivo[]>([])
  const [expandido, setExpandido] = useState<string | null>(null)
  const [filtroModulo, setFiltroModulo] = useState<string>('todos')
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('hoy')
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)

  // Métricas calculadas
  const metricas: MetricaDashboard[] = [
    {
      id: 'operaciones',
      titulo: 'Operaciones Hoy',
      valor: estadisticas?.total || 0,
      valorAnterior: Math.floor((estadisticas?.total || 0) * 0.85),
      formato: 'numero',
      icono: Activity,
      color: 'violet',
      tendencia: 'up',
      periodo: 'vs ayer'
    },
    {
      id: 'usuarios',
      titulo: 'Usuarios Activos',
      valor: usuariosActivos.length,
      valorAnterior: Math.floor(usuariosActivos.length * 1.1),
      formato: 'numero',
      icono: Users,
      color: 'emerald',
      tendencia: usuariosActivos.length > 3 ? 'up' : 'down',
      periodo: 'ahora'
    },
    {
      id: 'alertas',
      titulo: 'Alertas Pendientes',
      valor: alertas.filter(a => !a.atendida).length,
      valorAnterior: alertas.length,
      formato: 'numero',
      icono: AlertTriangle,
      color: 'amber',
      tendencia: alertas.length > 0 ? 'up' : 'neutral',
      periodo: 'última hora'
    },
    {
      id: 'seguridad',
      titulo: 'Score Seguridad',
      valor: 98.5,
      valorAnterior: 97.2,
      formato: 'porcentaje',
      icono: Shield,
      color: 'cyan',
      tendencia: 'up',
      periodo: 'semanal'
    }
  ]

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    setCargando(true)
    try {
      // Obtener estadísticas
      const stats = await auditService.obtenerEstadisticas(7)
      setEstadisticas(stats)

      // Obtener logs
      const { logs } = await auditService.obtenerLogs({ limite: 50 })
      setAuditoriaLogs(logs)

      // Obtener alertas
      const alertasList = auditService.obtenerAlertasPendientes()
      setAlertas(alertasList)

      // Simular usuarios activos
      setUsuariosActivos([
        {
          id: 'usr_1',
          nombre: 'Carlos Mendoza',
          email: 'carlos@chronos.mx',
          rol: 'Administrador',
          ultimaActividad: Date.now() - 30000,
          ip: '192.168.1.45',
          dispositivo: 'Escritorio',
          ubicacion: 'CDMX',
          sesionInicio: Date.now() - 3600000,
          accionesHoy: 47
        },
        {
          id: 'usr_2',
          nombre: 'María García',
          email: 'maria@chronos.mx',
          rol: 'Tesorero',
          ultimaActividad: Date.now() - 120000,
          ip: '192.168.1.78',
          dispositivo: 'Móvil',
          ubicacion: 'Monterrey',
          sesionInicio: Date.now() - 7200000,
          accionesHoy: 23
        },
        {
          id: 'usr_3',
          nombre: 'Roberto Sánchez',
          email: 'roberto@chronos.mx',
          rol: 'Cajero',
          ultimaActividad: Date.now() - 60000,
          ip: '192.168.1.92',
          dispositivo: 'Escritorio',
          ubicacion: 'Guadalajara',
          sesionInicio: Date.now() - 5400000,
          accionesHoy: 35
        }
      ])
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()

    // Suscribirse a nuevas entradas
    const unsubscribe = auditService.suscribir((entrada) => {
      setAuditoriaLogs(prev => [entrada, ...prev.slice(0, 49)])
    })

    // Auto-refresh cada 30s
    const interval = setInterval(cargarDatos, 30000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [cargarDatos])

  // Handlers
  const handleAtenderAlerta = async (alertaId: string) => {
    await auditService.atenderAlerta(alertaId, 'admin_actual')
    setAlertas(prev => prev.filter(a => a.id !== alertaId))
  }

  const handleExportar = async (formato: 'csv' | 'json' | 'excel') => {
    const resultado = await exportService.exportar({
      datos: auditoriaLogs.map(l => ({
        timestamp: l.timestamp,
        usuario: l.usuario.nombre,
        accion: l.accion,
        modulo: l.modulo,
        descripcion: l.descripcion,
        ip: l.dispositivo.ip,
        dispositivo: l.dispositivo.dispositivo
      })),
      columnas: [
        { key: 'timestamp', header: 'Fecha/Hora', formato: 'fechaHora' },
        { key: 'usuario', header: 'Usuario' },
        { key: 'accion', header: 'Acción' },
        { key: 'modulo', header: 'Módulo' },
        { key: 'descripcion', header: 'Descripción' },
        { key: 'ip', header: 'IP' },
        { key: 'dispositivo', header: 'Dispositivo' }
      ],
      configuracion: {
        formato,
        nombreArchivo: `audit_log_${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : formato}`
      },
      usuarioId: 'admin',
      usuarioNombre: 'Administrador'
    })

    if (resultado.exito) {
      exportService.descargar(resultado)
    }
  }

  // Logs filtrados
  const logsFiltrados = auditoriaLogs.filter(log => {
    if (filtroModulo !== 'todos' && log.modulo !== filtroModulo) return false
    if (busqueda) {
      const termino = busqueda.toLowerCase()
      return (
        log.descripcion.toLowerCase().includes(termino) ||
        log.usuario.nombre.toLowerCase().includes(termino) ||
        log.modulo.includes(termino)
      )
    }
    return true
  })

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-[1800px] mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                Panel de Administración
              </h1>
              <p className="text-slate-400 mt-2">
                Monitoreo y control del sistema en tiempo real
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300"
                onClick={() => cargarDatos()}
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", cargando && "animate-spin")} />
                Actualizar
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-900 border-slate-700">
                  <DropdownMenuLabel className="text-slate-400">Formato</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    className="text-slate-300"
                    onClick={() => handleExportar('csv')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-slate-300"
                    onClick={() => handleExportar('json')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-slate-300"
                    onClick={() => handleExportar('excel')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metricas.map((metrica, idx) => (
              <MetricaCard key={metrica.id} metrica={metrica} />
            ))}
          </div>

          {/* Contenido Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Auditoría - 2 columnas */}
            <Card className="lg:col-span-2 bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-violet-400" />
                      Log de Auditoría
                    </CardTitle>
                    <CardDescription>
                      Registro de todas las operaciones del sistema
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={filtroModulo} onValueChange={setFiltroModulo}>
                      <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="bancos">Bancos</SelectItem>
                        <SelectItem value="ventas">Ventas</SelectItem>
                        <SelectItem value="usuarios">Usuarios</SelectItem>
                        <SelectItem value="sistema">Sistema</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Buscar..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="pl-10 w-48 bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {logsFiltrados.length > 0 ? (
                      logsFiltrados.map((log) => (
                        <AuditLogItem
                          key={log.id}
                          entrada={log}
                          expandido={expandido === log.id}
                          onToggle={() => setExpandido(expandido === log.id ? null : log.id)}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay registros de auditoría</p>
                        <p className="text-sm mt-1">Las operaciones aparecerán aquí</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Panel derecho */}
            <div className="space-y-6">

              {/* Usuarios Activos */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    Usuarios Activos
                    <Badge className="ml-2 bg-emerald-500/20 text-emerald-400">
                      {usuariosActivos.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {usuariosActivos.map(usuario => (
                      <UsuarioActivoItem key={usuario.id} usuario={usuario} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alertas */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-400" />
                    Alertas Activas
                    {alertas.filter(a => !a.atendida).length > 0 && (
                      <Badge className="ml-2 bg-amber-500/20 text-amber-400 animate-pulse">
                        {alertas.filter(a => !a.atendida).length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3 pr-4">
                      <AnimatePresence>
                        {alertas.filter(a => !a.atendida).length > 0 ? (
                          alertas
                            .filter(a => !a.atendida)
                            .map(alerta => (
                              <AlertaItem
                                key={alerta.id}
                                alerta={alerta}
                                onAtender={handleAtenderAlerta}
                              />
                            ))
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-8 text-slate-500"
                          >
                            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-500/50" />
                            <p>Sin alertas pendientes</p>
                            <p className="text-sm mt-1">Todo funciona correctamente</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Gráficos de actividad (barra inferior) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Por módulo */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-violet-400" />
                  Actividad por Módulo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(estadisticas?.porModulo || {}).slice(0, 5).map(([modulo, total]) => (
                    <div key={modulo} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-400 capitalize">{modulo}</span>
                          <span className="text-sm text-white">{total}</span>
                        </div>
                        <Progress
                          value={(total / Math.max(...Object.values(estadisticas?.porModulo || { x: 1 }))) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Por hora */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  Actividad por Hora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-32">
                  {(estadisticas?.porHora || []).slice(-12).map((item, idx) => (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>
                        <div
                          className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t hover:opacity-80 transition-opacity cursor-pointer"
                          style={{
                            height: `${Math.max((item.total / Math.max(...(estadisticas?.porHora || []).map(h => h.total), 1)) * 100, 10)}%`
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.hora}: {item.total} operaciones</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Por usuario */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Top Usuarios Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(estadisticas?.porUsuario || []).slice(0, 5).map((item, idx) => (
                    <div key={item.usuarioId} className="flex items-center gap-3">
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                        idx === 0 ? "bg-amber-500/20 text-amber-400" :
                        idx === 1 ? "bg-slate-400/20 text-slate-300" :
                        idx === 2 ? "bg-orange-500/20 text-orange-400" :
                        "bg-slate-600/20 text-slate-400"
                      )}>
                        {idx + 1}
                      </span>
                      <span className="flex-1 text-sm text-slate-300 truncate">{item.nombre}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.total}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </TooltipProvider>
  )
}
