/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 TABLA TRANSACCIONES ULTRA SUPREME — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Tabla de transacciones con trazabilidad completa:
 * - Estado de cada transacción
 * - Hora, fecha exacta
 * - Historial completo de modificaciones
 * - Usuario que creó, modificó
 * - Dispositivo, IP, navegador
 * - Ubicación geográfica
 * - Expandible con todos los detalles
 * - Filtros avanzados
 * - Exportación
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
  ArrowDown,
  ArrowDownLeft,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clipboard,
  Clock,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Fingerprint,
  Globe,
  History,
  Info,
  Laptop,
  Loader2,
  Lock,
  MapPin,
  Monitor,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Smartphone,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface DispositivoInfo {
  ip: string
  userAgent: string
  navegador: string
  navegadorVersion?: string
  sistemaOperativo: string
  sistemaVersion?: string
  tipoDispositivo: 'desktop' | 'mobile' | 'tablet'
  marca?: string
  modelo?: string
  ubicacion?: {
    ciudad?: string
    region?: string
    pais?: string
    lat?: number
    lng?: number
  }
  huella?: string // Device fingerprint
}

export interface UsuarioAudit {
  id: string
  nombre: string
  email: string
  avatar?: string
  rol?: string
  rolColor?: string
}

export interface CambioHistorial {
  id: string
  timestamp: number
  campo: string
  campoLabel: string
  valorAnterior: unknown
  valorNuevo: unknown
  tipoCambio: 'creacion' | 'edicion' | 'eliminacion' | 'estado' | 'aprobacion'
  usuario: UsuarioAudit
  dispositivo: DispositivoInfo
  motivo?: string
  aprobadoPor?: UsuarioAudit
}

export interface TrazabilidadCompleta {
  // Creación
  creadoPor: UsuarioAudit
  creadoAt: number
  dispositivoCreacion: DispositivoInfo

  // Última modificación
  modificadoPor?: UsuarioAudit
  modificadoAt?: number
  dispositivoModificacion?: DispositivoInfo

  // Aprobación (si aplica)
  aprobadoPor?: UsuarioAudit
  aprobadoAt?: number
  dispositivoAprobacion?: DispositivoInfo

  // Historial completo
  historial: CambioHistorial[]

  // Metadata
  versionActual: number
  totalModificaciones: number
}

export interface TransaccionCompleta {
  id: string
  tipo: 'ingreso' | 'gasto' | 'transferencia_entrada' | 'transferencia_salida' | 'corte' | 'ajuste'
  estado: 'completado' | 'pendiente' | 'cancelado' | 'aprobacion_requerida' | 'rechazado'

  // Datos financieros
  monto: number
  montoOriginal?: number // Si hubo ajuste
  moneda: 'MXN' | 'USD' | 'USDT'
  tipoCambio?: number

  // Entidad asociada
  bancoId: string
  bancoNombre: string
  bancoOrigenId?: string
  bancoOrigenNombre?: string
  bancoDestinoId?: string
  bancoDestinoNombre?: string

  // Detalles
  concepto: string
  descripcion?: string
  categoria: string
  subcategoria?: string
  referencia?: string
  numeroControl?: string

  // Relaciones
  clienteId?: string
  clienteNombre?: string
  distribuidorId?: string
  distribuidorNombre?: string
  ordenCompraId?: string
  ventaId?: string

  // Fechas
  fecha: string
  hora: string
  fechaValor?: string // Fecha valor bancario
  fechaVencimiento?: string

  // Método de pago
  metodoPago?: string
  cuentaOrigen?: string
  cuentaDestino?: string

  // Comprobantes
  comprobantes?: { nombre: string; url: string; tipo: string }[]

  // Notas
  notas?: string
  notasInternas?: string

  // Trazabilidad
  trazabilidad: TrazabilidadCompleta
}

export interface FiltrosTabla {
  busqueda: string
  tipo: string[]
  estado: string[]
  categoria: string[]
  banco: string[]
  fechaDesde?: string
  fechaHasta?: string
  montoMin?: number
  montoMax?: number
  usuario?: string
}

export interface ColumnaConfig {
  id: string
  label: string
  visible: boolean
  width?: number
  sortable?: boolean
  fixed?: 'left' | 'right'
}

interface TablaTransaccionesUltraProps {
  transacciones: TransaccionCompleta[]
  titulo?: string
  descripcion?: string

  // Configuración
  columnas?: ColumnaConfig[]
  mostrarTrazabilidad?: boolean
  seleccionable?: boolean
  expandible?: boolean
  paginado?: boolean
  tamanioPagina?: number

  // Callbacks
  onVerDetalle?: (transaccion: TransaccionCompleta) => void
  onEditar?: (transaccion: TransaccionCompleta) => void
  onEliminar?: (transaccion: TransaccionCompleta) => void
  onAprobar?: (transaccion: TransaccionCompleta) => void
  onExportar?: (transacciones: TransaccionCompleta[]) => void
  onRefresh?: () => void
  onFiltrosChange?: (filtros: FiltrosTabla) => void

  // Estados
  loading?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const TIPOS_CONFIG = {
  ingreso: { color: '#10B981', bg: 'bg-emerald-500/10', label: 'Ingreso', icon: ArrowDownLeft },
  gasto: { color: '#EF4444', bg: 'bg-rose-500/10', label: 'Gasto', icon: ArrowUpRight },
  transferencia_entrada: { color: '#3B82F6', bg: 'bg-blue-500/10', label: 'Transferencia In', icon: ArrowDownLeft },
  transferencia_salida: { color: '#F59E0B', bg: 'bg-amber-500/10', label: 'Transferencia Out', icon: ArrowUpRight },
  corte: { color: '#8B5CF6', bg: 'bg-violet-500/10', label: 'Corte', icon: FileText },
  ajuste: { color: '#64748B', bg: 'bg-slate-500/10', label: 'Ajuste', icon: Edit },
}

const ESTADOS_CONFIG = {
  completado: { color: '#10B981', bg: 'bg-emerald-500/10', label: 'Completado', icon: Check },
  pendiente: { color: '#F59E0B', bg: 'bg-amber-500/10', label: 'Pendiente', icon: Clock },
  cancelado: { color: '#EF4444', bg: 'bg-rose-500/10', label: 'Cancelado', icon: X },
  aprobacion_requerida: { color: '#8B5CF6', bg: 'bg-violet-500/10', label: 'Requiere Aprobación', icon: Shield },
  rechazado: { color: '#DC2626', bg: 'bg-red-500/10', label: 'Rechazado', icon: X },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Badge de Estado
const EstadoBadge = memo(function EstadoBadge({ estado }: { estado: TransaccionCompleta['estado'] }) {
  const config = ESTADOS_CONFIG[estado]
  const Icon = config.icon

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium', config.bg)}>
      <Icon className="h-3 w-3" style={{ color: config.color }} />
      <span style={{ color: config.color }}>{config.label}</span>
    </div>
  )
})

// Badge de Tipo
const TipoBadge = memo(function TipoBadge({ tipo }: { tipo: TransaccionCompleta['tipo'] }) {
  const config = TIPOS_CONFIG[tipo]
  const Icon = config.icon

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium', config.bg)}>
      <Icon className="h-3 w-3" style={{ color: config.color }} />
      <span style={{ color: config.color }}>{config.label}</span>
    </div>
  )
})

// Info de Dispositivo
const DispositivoInfoCard = memo(function DispositivoInfoCard({ dispositivo, titulo }: { dispositivo: DispositivoInfo; titulo: string }) {
  const tipoIcon = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Laptop,
  }
  const Icon = tipoIcon[dispositivo.tipoDispositivo]

  return (
    <div className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-blue-500/10">
          <Icon className="h-4 w-4 text-blue-400" />
        </div>
        <span className="text-sm font-medium text-white">{titulo}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-white/50 mb-0.5">IP</p>
          <p className="text-white font-mono">{dispositivo.ip}</p>
        </div>
        <div>
          <p className="text-white/50 mb-0.5">Navegador</p>
          <p className="text-white">{dispositivo.navegador} {dispositivo.navegadorVersion}</p>
        </div>
        <div>
          <p className="text-white/50 mb-0.5">Sistema</p>
          <p className="text-white">{dispositivo.sistemaOperativo} {dispositivo.sistemaVersion}</p>
        </div>
        <div>
          <p className="text-white/50 mb-0.5">Dispositivo</p>
          <p className="text-white capitalize">{dispositivo.tipoDispositivo}</p>
        </div>
        {dispositivo.ubicacion?.ciudad && (
          <div className="col-span-2">
            <p className="text-white/50 mb-0.5">Ubicación</p>
            <div className="flex items-center gap-1 text-white">
              <MapPin className="h-3 w-3 text-rose-400" />
              {dispositivo.ubicacion.ciudad}, {dispositivo.ubicacion.region}, {dispositivo.ubicacion.pais}
            </div>
          </div>
        )}
        {dispositivo.huella && (
          <div className="col-span-2">
            <p className="text-white/50 mb-0.5">Huella Digital</p>
            <p className="text-white/60 font-mono text-[10px] truncate">{dispositivo.huella}</p>
          </div>
        )}
      </div>
    </div>
  )
})

// Info de Usuario
const UsuarioInfoCard = memo(function UsuarioInfoCard({ usuario, accion, timestamp }: { usuario: UsuarioAudit; accion: string; timestamp: number }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
      <div className="relative">
        {usuario.avatar ? (
          <img src={usuario.avatar} alt={usuario.nombre} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
            <User className="h-5 w-5 text-violet-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{usuario.nombre}</span>
          {usuario.rol && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${usuario.rolColor}20`, color: usuario.rolColor }}
            >
              {usuario.rol}
            </span>
          )}
        </div>
        <p className="text-xs text-white/50">{usuario.email}</p>
        <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
          <span>{accion}</span>
          <span>•</span>
          <span>{new Date(timestamp).toLocaleString('es-MX')}</span>
        </div>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPANDED ROW COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FilaExpandidaProps {
  transaccion: TransaccionCompleta
  onEditar?: () => void
  onVerComprobantes?: () => void
}

const FilaExpandida = memo(function FilaExpandida({ transaccion, onEditar, onVerComprobantes }: FilaExpandidaProps) {
  const [tabActiva, setTabActiva] = useState<'detalles' | 'trazabilidad' | 'historial'>('detalles')
  const traz = transaccion.trazabilidad

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado al portapapeles`)
  }, [])

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="p-4 bg-slate-900/50 border-t border-white/10">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 w-fit mb-4">
          {(['detalles', 'trazabilidad', 'historial'] as const).map((tab) => (
            <button
              key={tab}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tabActiva === tab
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
              onClick={() => setTabActiva(tab)}
            >
              {tab === 'detalles' && <Info className="h-4 w-4 inline mr-2" />}
              {tab === 'trazabilidad' && <Fingerprint className="h-4 w-4 inline mr-2" />}
              {tab === 'historial' && <History className="h-4 w-4 inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'historial' && traz.historial.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-xs">
                  {traz.historial.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {tabActiva === 'detalles' && (
            <motion.div
              key="detalles"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {/* Info básica */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-400" />
                  Información General
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">ID</span>
                    <button
                      className="text-white font-mono text-xs flex items-center gap-1 hover:text-violet-400"
                      onClick={() => copyToClipboard(transaccion.id, 'ID')}
                    >
                      {transaccion.id.slice(0, 12)}...
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Referencia</span>
                    <span className="text-white">{transaccion.referencia || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Nº Control</span>
                    <span className="text-white">{transaccion.numeroControl || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Categoría</span>
                    <span className="text-white">{transaccion.categoria}</span>
                  </div>
                  {transaccion.subcategoria && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Subcategoría</span>
                      <span className="text-white">{transaccion.subcategoria}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fechas */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  Fechas y Horarios
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">Fecha</span>
                    <span className="text-white">{transaccion.fecha}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Hora</span>
                    <span className="text-white">{transaccion.hora}</span>
                  </div>
                  {transaccion.fechaValor && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Fecha Valor</span>
                      <span className="text-white">{transaccion.fechaValor}</span>
                    </div>
                  )}
                  {transaccion.fechaVencimiento && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Vencimiento</span>
                      <span className="text-white">{transaccion.fechaVencimiento}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Montos */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  Montos
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">Monto</span>
                    <span className="text-white font-semibold">{formatCurrency(transaccion.monto)}</span>
                  </div>
                  {transaccion.montoOriginal && transaccion.montoOriginal !== transaccion.monto && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Monto Original</span>
                      <span className="text-white/60 line-through">{formatCurrency(transaccion.montoOriginal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/50">Moneda</span>
                    <span className="text-white">{transaccion.moneda}</span>
                  </div>
                  {transaccion.tipoCambio && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Tipo Cambio</span>
                      <span className="text-white">${transaccion.tipoCambio.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Relaciones */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-violet-400" />
                  Relaciones
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">Banco</span>
                    <span className="text-white">{transaccion.bancoNombre}</span>
                  </div>
                  {transaccion.clienteNombre && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Cliente</span>
                      <span className="text-white">{transaccion.clienteNombre}</span>
                    </div>
                  )}
                  {transaccion.distribuidorNombre && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Distribuidor</span>
                      <span className="text-white">{transaccion.distribuidorNombre}</span>
                    </div>
                  )}
                  {transaccion.ordenCompraId && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Orden Compra</span>
                      <span className="text-white">{transaccion.ordenCompraId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notas - Full width */}
              {(transaccion.notas || transaccion.notasInternas) && (
                <div className="md:col-span-2 lg:col-span-4 p-4 rounded-xl border border-white/10 bg-white/5">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-rose-400" />
                    Notas
                  </h4>
                  {transaccion.notas && (
                    <p className="text-sm text-white/70 mb-2">{transaccion.notas}</p>
                  )}
                  {transaccion.notasInternas && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs text-amber-400 font-medium mb-1">Nota Interna:</p>
                      <p className="text-sm text-white/70">{transaccion.notasInternas}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {tabActiva === 'trazabilidad' && (
            <motion.div
              key="trazabilidad"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Creación */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Creación
                </h4>
                <UsuarioInfoCard
                  usuario={traz.creadoPor}
                  accion="Creó este registro"
                  timestamp={traz.creadoAt}
                />
                <DispositivoInfoCard
                  dispositivo={traz.dispositivoCreacion}
                  titulo="Dispositivo de Creación"
                />
              </div>

              {/* Última modificación */}
              {traz.modificadoPor && traz.dispositivoModificacion && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Última Modificación
                  </h4>
                  <UsuarioInfoCard
                    usuario={traz.modificadoPor}
                    accion="Modificó este registro"
                    timestamp={traz.modificadoAt!}
                  />
                  <DispositivoInfoCard
                    dispositivo={traz.dispositivoModificacion}
                    titulo="Dispositivo de Modificación"
                  />
                </div>
              )}

              {/* Aprobación */}
              {traz.aprobadoPor && traz.dispositivoAprobacion && (
                <div className="space-y-3 md:col-span-2">
                  <h4 className="text-sm font-semibold text-violet-400 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Aprobación
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UsuarioInfoCard
                      usuario={traz.aprobadoPor}
                      accion="Aprobó este registro"
                      timestamp={traz.aprobadoAt!}
                    />
                    <DispositivoInfoCard
                      dispositivo={traz.dispositivoAprobacion}
                      titulo="Dispositivo de Aprobación"
                    />
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="md:col-span-2 p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-white/50">Versión Actual</p>
                    <p className="text-white font-semibold">v{traz.versionActual}</p>
                  </div>
                  <div>
                    <p className="text-white/50">Total Modificaciones</p>
                    <p className="text-white font-semibold">{traz.totalModificaciones}</p>
                  </div>
                  <div>
                    <p className="text-white/50">Creado</p>
                    <p className="text-white">{new Date(traz.creadoAt).toLocaleDateString('es-MX')}</p>
                  </div>
                  <div>
                    <p className="text-white/50">Última Actividad</p>
                    <p className="text-white">{new Date(traz.modificadoAt || traz.creadoAt).toLocaleDateString('es-MX')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {tabActiva === 'historial' && (
            <motion.div
              key="historial"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {traz.historial.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay historial de cambios</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {traz.historial.map((cambio, index) => {
                    const tipoCambioConfig = {
                      creacion: { color: 'emerald', label: 'Creación' },
                      edicion: { color: 'blue', label: 'Edición' },
                      eliminacion: { color: 'rose', label: 'Eliminación' },
                      estado: { color: 'amber', label: 'Cambio de Estado' },
                      aprobacion: { color: 'violet', label: 'Aprobación' },
                    }
                    const config = tipoCambioConfig[cambio.tipoCambio]

                    return (
                      <motion.div
                        key={cambio.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative pl-6 pb-4 border-l-2 border-white/10 last:border-0 last:pb-0"
                      >
                        {/* Timeline dot */}
                        <div
                          className={cn(
                            'absolute -left-[5px] top-0 w-2 h-2 rounded-full',
                            `bg-${config.color}-500`
                          )}
                          style={{ backgroundColor: config.color === 'emerald' ? '#10B981' : config.color === 'blue' ? '#3B82F6' : config.color === 'rose' ? '#EF4444' : config.color === 'amber' ? '#F59E0B' : '#8B5CF6' }}
                        />

                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 ml-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: config.color === 'emerald' ? '#10B98120' : config.color === 'blue' ? '#3B82F620' : config.color === 'rose' ? '#EF444420' : config.color === 'amber' ? '#F59E0B20' : '#8B5CF620',
                                  color: config.color === 'emerald' ? '#10B981' : config.color === 'blue' ? '#3B82F6' : config.color === 'rose' ? '#EF4444' : config.color === 'amber' ? '#F59E0B' : '#8B5CF6',
                                }}
                              >
                                {config.label}
                              </span>
                              <p className="text-sm text-white mt-1">{cambio.campoLabel}</p>
                            </div>
                            <span className="text-xs text-white/50">
                              {new Date(cambio.timestamp).toLocaleString('es-MX')}
                            </span>
                          </div>

                          {/* Cambio de valores */}
                          {cambio.tipoCambio !== 'creacion' && (
                            <div className="flex items-center gap-3 mb-3 text-sm">
                              <div className="flex-1 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                <p className="text-xs text-rose-400 mb-0.5">Antes</p>
                                <p className="text-white/80 truncate">{String(cambio.valorAnterior)}</p>
                              </div>
                              <ArrowUpRight className="h-4 w-4 text-white/30 rotate-90" />
                              <div className="flex-1 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <p className="text-xs text-emerald-400 mb-0.5">Después</p>
                                <p className="text-white/80 truncate">{String(cambio.valorNuevo)}</p>
                              </div>
                            </div>
                          )}

                          {/* Usuario y dispositivo */}
                          <div className="flex items-center justify-between text-xs text-white/50">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span>{cambio.usuario.nombre}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Monitor className="h-3 w-3" />
                              <span>{cambio.dispositivo.navegador} / {cambio.dispositivo.ip}</span>
                            </div>
                          </div>

                          {cambio.motivo && (
                            <div className="mt-2 p-2 rounded-lg bg-amber-500/10 text-xs">
                              <p className="text-amber-400 font-medium">Motivo:</p>
                              <p className="text-white/70">{cambio.motivo}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN TABLE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const TablaTransaccionesUltra = memo(function TablaTransaccionesUltra({
  transacciones,
  titulo = 'Transacciones',
  descripcion,
  mostrarTrazabilidad = true,
  seleccionable = true,
  expandible = true,
  paginado = true,
  tamanioPagina = 10,
  onVerDetalle,
  onEditar,
  onEliminar,
  onAprobar,
  onExportar,
  onRefresh,
  onFiltrosChange,
  loading = false,
  className,
}: TablaTransaccionesUltraProps) {
  // State
  const [busqueda, setBusqueda] = useState('')
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set())
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set())
  const [paginaActual, setPaginaActual] = useState(1)
  const [ordenColumna, setOrdenColumna] = useState<{ columna: string; direccion: 'asc' | 'desc' } | null>(null)
  const [showFiltros, setShowFiltros] = useState(false)

  // Filtered and sorted data
  const datosFiltrados = useMemo(() => {
    let resultado = [...transacciones]

    // Búsqueda
    if (busqueda) {
      const termino = busqueda.toLowerCase()
      resultado = resultado.filter(
        (t) =>
          t.concepto.toLowerCase().includes(termino) ||
          t.id.toLowerCase().includes(termino) ||
          t.referencia?.toLowerCase().includes(termino) ||
          t.clienteNombre?.toLowerCase().includes(termino) ||
          t.distribuidorNombre?.toLowerCase().includes(termino)
      )
    }

    // Ordenamiento
    if (ordenColumna) {
      resultado.sort((a, b) => {
        const valorA = a[ordenColumna.columna as keyof TransaccionCompleta]
        const valorB = b[ordenColumna.columna as keyof TransaccionCompleta]

        if (valorA === undefined || valorB === undefined) return 0
        if (valorA < valorB) return ordenColumna.direccion === 'asc' ? -1 : 1
        if (valorA > valorB) return ordenColumna.direccion === 'asc' ? 1 : -1
        return 0
      })
    }

    return resultado
  }, [transacciones, busqueda, ordenColumna])

  // Pagination
  const totalPaginas = Math.ceil(datosFiltrados.length / tamanioPagina)
  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * tamanioPagina
    return datosFiltrados.slice(inicio, inicio + tamanioPagina)
  }, [datosFiltrados, paginaActual, tamanioPagina])

  // Handlers
  const toggleSeleccion = useCallback((id: string) => {
    setSeleccionadas((prev) => {
      const nuevo = new Set(prev)
      if (nuevo.has(id)) {
        nuevo.delete(id)
      } else {
        nuevo.add(id)
      }
      return nuevo
    })
  }, [])

  const toggleExpansion = useCallback((id: string) => {
    setExpandidas((prev) => {
      const nuevo = new Set(prev)
      if (nuevo.has(id)) {
        nuevo.delete(id)
      } else {
        nuevo.add(id)
      }
      return nuevo
    })
  }, [])

  const toggleSeleccionTodos = useCallback(() => {
    if (seleccionadas.size === datosPaginados.length) {
      setSeleccionadas(new Set())
    } else {
      setSeleccionadas(new Set(datosPaginados.map((t) => t.id)))
    }
  }, [seleccionadas, datosPaginados])

  const handleOrden = useCallback((columna: string) => {
    setOrdenColumna((prev) => {
      if (prev?.columna === columna) {
        if (prev.direccion === 'asc') return { columna, direccion: 'desc' }
        return null
      }
      return { columna, direccion: 'asc' }
    })
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{titulo}</h2>
          {descripcion && <p className="text-sm text-white/50">{descripcion}</p>}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar..."
              className="w-48 pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          {/* Filters button */}
          <button
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all',
              showFiltros
                ? 'border-violet-500/50 bg-violet-500/10 text-violet-400'
                : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/8'
            )}
            onClick={() => setShowFiltros(!showFiltros)}
          >
            <Filter className="h-4 w-4" />
          </button>

          {/* Export */}
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/8 transition-all"
            onClick={() => onExportar?.(Array.from(seleccionadas).length > 0
              ? transacciones.filter((t) => seleccionadas.has(t.id))
              : transacciones
            )}
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Refresh */}
          <button
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/8 transition-all"
            onClick={onRefresh}
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      {seleccionadas.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/30"
        >
          <span className="text-sm text-violet-400">{seleccionadas.size} seleccionados</span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              className="px-3 py-1.5 rounded-lg bg-white/10 text-white/70 text-sm hover:bg-white/20"
              onClick={() => setSeleccionadas(new Set())}
            >
              Deseleccionar
            </button>
            <button
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 text-sm hover:bg-rose-500/30"
              onClick={() => {
                Array.from(seleccionadas).forEach((id) => {
                  const t = transacciones.find((tr) => tr.id === id)
                  if (t) onEliminar?.(t)
                })
              }}
            >
              Eliminar
            </button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {seleccionable && (
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={seleccionadas.size === datosPaginados.length && datosPaginados.length > 0}
                      onChange={toggleSeleccionTodos}
                      className="w-4 h-4 rounded border-white/30 bg-white/10 text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
                    />
                  </th>
                )}
                {expandible && <th className="w-10 px-2" />}
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => handleOrden('fecha')}
                >
                  <div className="flex items-center gap-1">
                    Fecha/Hora
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Concepto
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => handleOrden('monto')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Monto
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-violet-400" />
                    <p className="text-sm text-white/50 mt-2">Cargando transacciones...</p>
                  </td>
                </tr>
              ) : datosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <FileText className="h-8 w-8 mx-auto text-white/30 mb-2" />
                    <p className="text-sm text-white/50">No hay transacciones</p>
                  </td>
                </tr>
              ) : (
                datosPaginados.map((transaccion) => {
                  const isExpanded = expandidas.has(transaccion.id)
                  const isSelected = seleccionadas.has(transaccion.id)
                  const tipoConfig = TIPOS_CONFIG[transaccion.tipo]

                  return (
                    <>
                      <tr
                        key={transaccion.id}
                        className={cn(
                          'transition-colors',
                          isSelected ? 'bg-violet-500/10' : 'hover:bg-white/5'
                        )}
                      >
                        {seleccionable && (
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSeleccion(transaccion.id)}
                              className="w-4 h-4 rounded border-white/30 bg-white/10 text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
                            />
                          </td>
                        )}
                        {expandible && (
                          <td className="px-2 py-3">
                            <button
                              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                              onClick={() => toggleExpansion(transaccion.id)}
                            >
                              <ChevronRight
                                className={cn(
                                  'h-4 w-4 text-white/50 transition-transform',
                                  isExpanded && 'rotate-90'
                                )}
                              />
                            </button>
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm text-white">{transaccion.fecha}</p>
                            <p className="text-xs text-white/50">{transaccion.hora}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <TipoBadge tipo={transaccion.tipo} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-[200px]">
                            <p className="text-sm text-white truncate">{transaccion.concepto}</p>
                            <p className="text-xs text-white/50 truncate">
                              {transaccion.bancoNombre}
                              {transaccion.clienteNombre && ` • ${transaccion.clienteNombre}`}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={cn(
                              'text-sm font-semibold',
                              transaccion.tipo === 'ingreso' || transaccion.tipo === 'transferencia_entrada'
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            )}
                          >
                            {transaccion.tipo === 'ingreso' || transaccion.tipo === 'transferencia_entrada' ? '+' : '-'}
                            {formatCurrency(transaccion.monto)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <EstadoBadge estado={transaccion.estado} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                              onClick={() => onVerDetalle?.(transaccion)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                              onClick={() => onEditar?.(transaccion)}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {transaccion.estado === 'aprobacion_requerida' && (
                              <button
                                className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                                onClick={() => onAprobar?.(transaccion)}
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {isExpanded && mostrarTrazabilidad && (
                          <tr key={`${transaccion.id}-expanded`}>
                            <td colSpan={8} className="p-0">
                              <FilaExpandida
                                transaccion={transaccion}
                                onEditar={() => onEditar?.(transaccion)}
                              />
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginado && totalPaginas > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <p className="text-sm text-white/50">
              Mostrando {(paginaActual - 1) * tamanioPagina + 1} -{' '}
              {Math.min(paginaActual * tamanioPagina, datosFiltrados.length)} de {datosFiltrados.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => setPaginaActual(1)}
                disabled={paginaActual === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => setPaginaActual((p) => p - 1)}
                disabled={paginaActual === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-sm text-white">
                {paginaActual} / {totalPaginas}
              </span>
              <button
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => setPaginaActual((p) => p + 1)}
                disabled={paginaActual === totalPaginas}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => setPaginaActual(totalPaginas)}
                disabled={paginaActual === totalPaginas}
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

export default TablaTransaccionesUltra
