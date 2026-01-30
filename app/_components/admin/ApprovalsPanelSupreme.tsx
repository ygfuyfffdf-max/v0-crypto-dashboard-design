/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔄 CHRONOS INFINITY 2026 — PANEL DE APROBACIONES SUPREMO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel visual para gestión de workflows y aprobaciones con:
 * - Lista de aprobaciones pendientes
 * - Timeline de historial
 * - Acciones rápidas (aprobar/rechazar)
 * - Filtros por estado/módulo
 * - Notificaciones en tiempo real
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  ChevronRight,
  ChevronDown,
  FileText,
  DollarSign,
  MessageSquare,
  Send,
  Filter,
  RefreshCw,
  History,
  ArrowRight,
  Loader2,
  Check,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  workflowService,
  type InstanciaWorkflow,
  type AprobacionPendiente,
  type AccionWorkflow,
  type EstadoWorkflow
} from '@/app/_lib/services'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const estadoColores: Record<EstadoWorkflow, { bg: string; text: string; border: string }> = {
  borrador: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  pendiente: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  en_revision: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  aprobado: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  rechazado: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  cancelado: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  escalado: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  completado: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' }
}

const estadoLabels: Record<EstadoWorkflow, string> = {
  borrador: 'Borrador',
  pendiente: 'Pendiente',
  en_revision: 'En Revisión',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  cancelado: 'Cancelado',
  escalado: 'Escalado',
  completado: 'Completado'
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTES INTERNOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AprobacionItemProps {
  instancia: InstanciaWorkflow
  aprobacion: AprobacionPendiente
  onAprobar: (instanciaId: string, aprobacionId: string) => void
  onRechazar: (instanciaId: string, aprobacionId: string, motivo: string) => void
  onVerDetalle: (instancia: InstanciaWorkflow) => void
}

function AprobacionItem({
  instancia,
  aprobacion,
  onAprobar,
  onRechazar,
  onVerDetalle
}: AprobacionItemProps) {
  const [expandido, setExpandido] = useState(false)
  const [mostrarRechazo, setMostrarRechazo] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [procesando, setProcesando] = useState(false)

  const tiempoRestante = aprobacion.tiempoLimite
    ? Math.max(0, aprobacion.tiempoLimite - Date.now())
    : null

  const horasRestantes = tiempoRestante
    ? Math.floor(tiempoRestante / (1000 * 60 * 60))
    : null

  const handleAprobar = async () => {
    setProcesando(true)
    await onAprobar(instancia.id, aprobacion.id)
    setProcesando(false)
  }

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) return
    setProcesando(true)
    await onRechazar(instancia.id, aprobacion.id, motivoRechazo)
    setProcesando(false)
    setMostrarRechazo(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'border rounded-xl overflow-hidden transition-all',
        'border-slate-700/50 bg-slate-900/30',
        expandido && 'bg-slate-800/50'
      )}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-start gap-4">
          {/* Icono */}
          <div className="p-2 rounded-lg bg-violet-500/10 shrink-0">
            <FileText className="w-5 h-5 text-violet-400" />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-white truncate">
                {instancia.entidadNombre}
              </h4>
              <Badge className={cn('text-xs', estadoColores[instancia.estado])}>
                {estadoLabels[instancia.estado]}
              </Badge>
            </div>
            
            <p className="text-sm text-slate-400 truncate">
              {instancia.definicionNombre} • Nivel: {aprobacion.nivelNombre}
            </p>
            
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {instancia.solicitanteNombre}
              </span>
              {instancia.monto && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <DollarSign className="w-3 h-3" />
                  ${instancia.monto.toLocaleString()}
                </span>
              )}
              {horasRestantes !== null && (
                <span className={cn(
                  'flex items-center gap-1',
                  horasRestantes < 12 ? 'text-red-400' : 'text-slate-500'
                )}>
                  <Clock className="w-3 h-3" />
                  {horasRestantes}h restantes
                </span>
              )}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              onClick={handleAprobar}
              disabled={procesando}
            >
              {procesando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Aprobar
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={() => setMostrarRechazo(true)}
              disabled={procesando}
            >
              <X className="w-4 h-4 mr-1" />
              Rechazar
            </Button>
          </div>

          {/* Expandir */}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {expandido ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Contenido expandido */}
      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-700/50"
          >
            <div className="p-4 space-y-4">
              {/* Datos de la entidad */}
              {instancia.datosEntidad && Object.keys(instancia.datosEntidad).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(instancia.datosEntidad).slice(0, 8).map(([key, value]) => (
                    <div key={key} className="bg-slate-800/50 rounded-lg p-2">
                      <p className="text-xs text-slate-500 capitalize">{key.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-white truncate">{String(value)}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Historial reciente */}
              <div>
                <h5 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Historial Reciente
                </h5>
                <div className="space-y-2">
                  {instancia.historial.slice(0, 5).map((accion) => (
                    <div
                      key={accion.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        accion.tipo === 'aprobado' && 'bg-emerald-400',
                        accion.tipo === 'rechazado' && 'bg-red-400',
                        accion.tipo === 'creado' && 'bg-blue-400',
                        !['aprobado', 'rechazado', 'creado'].includes(accion.tipo) && 'bg-slate-400'
                      )} />
                      <span className="text-slate-300">{accion.usuarioNombre}</span>
                      <span className="text-slate-500">{accion.tipo}</span>
                      {accion.nivelNombre && (
                        <span className="text-slate-500">• {accion.nivelNombre}</span>
                      )}
                      <span className="text-slate-600 text-xs ml-auto">
                        {new Date(accion.timestamp).toLocaleString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700"
                  onClick={() => onVerDetalle(instancia)}
                >
                  Ver Detalle Completo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog de rechazo */}
      <Dialog open={mostrarRechazo} onOpenChange={setMostrarRechazo}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Rechazar Solicitud</DialogTitle>
            <DialogDescription>
              Por favor indica el motivo del rechazo. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Motivo del rechazo..."
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              className="bg-slate-800 border-slate-700 min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMostrarRechazo(false)}
              className="border-slate-700"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRechazar}
              disabled={!motivoRechazo.trim() || procesando}
            >
              {procesando ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ApprovalsPanelSupremeProps {
  usuarioId: string
  usuarioNombre: string
  className?: string
}

export default function ApprovalsPanelSupreme({
  usuarioId,
  usuarioNombre,
  className
}: ApprovalsPanelSupremeProps) {
  const [pendientes, setPendientes] = useState<InstanciaWorkflow[]>([])
  const [filtroModulo, setFiltroModulo] = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<string>('pendiente')
  const [cargando, setCargando] = useState(true)
  const [detalleWorkflow, setDetalleWorkflow] = useState<InstanciaWorkflow | null>(null)

  const cargarPendientes = useCallback(() => {
    setCargando(true)
    const datos = workflowService.obtenerPendientesPorUsuario(usuarioId)
    setPendientes(datos)
    setCargando(false)
  }, [usuarioId])

  useEffect(() => {
    cargarPendientes()
  }, [cargarPendientes])

  const handleAprobar = async (instanciaId: string, aprobacionId: string) => {
    const resultado = await workflowService.aprobar({
      instanciaId,
      aprobacionId,
      aprobadorId: usuarioId,
      aprobadorNombre: usuarioNombre
    })

    if (resultado.exito) {
      cargarPendientes()
    }
  }

  const handleRechazar = async (instanciaId: string, aprobacionId: string, motivo: string) => {
    const resultado = await workflowService.rechazar({
      instanciaId,
      aprobacionId,
      aprobadorId: usuarioId,
      aprobadorNombre: usuarioNombre,
      comentarios: motivo
    })

    if (resultado.exito) {
      cargarPendientes()
    }
  }

  // Filtrar pendientes
  const pendientesFiltrados = pendientes.filter(p => {
    if (filtroModulo !== 'todos' && p.modulo !== filtroModulo) return false
    if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false
    return true
  })

  // Obtener módulos únicos para filtro
  const modulosUnicos = [...new Set(pendientes.map(p => p.modulo))]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Aprobaciones Pendientes
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {pendientes.length} solicitudes requieren tu atención
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={filtroModulo} onValueChange={setFiltroModulo}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="todos">Todos</SelectItem>
              {modulosUnicos.map(m => (
                <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="border-slate-700"
            onClick={cargarPendientes}
          >
            <RefreshCw className={cn('w-4 h-4', cargando && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Lista de aprobaciones */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="p-4">
          {cargando ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
          ) : pendientesFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-400/50 mb-4" />
              <p className="text-slate-400">No hay aprobaciones pendientes</p>
              <p className="text-sm text-slate-500 mt-1">
                ¡Todo al día! Las nuevas solicitudes aparecerán aquí.
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="space-y-3 pr-4">
                {pendientesFiltrados.map((instancia) => {
                  const miAprobacion = instancia.aprobacionesPendientes.find(
                    a => a.aprobadorId === usuarioId && a.estado === 'pendiente'
                  )
                  if (!miAprobacion) return null

                  return (
                    <AprobacionItem
                      key={instancia.id}
                      instancia={instancia}
                      aprobacion={miAprobacion}
                      onAprobar={handleAprobar}
                      onRechazar={handleRechazar}
                      onVerDetalle={setDetalleWorkflow}
                    />
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalle */}
      <Dialog open={!!detalleWorkflow} onOpenChange={() => setDetalleWorkflow(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-400" />
              {detalleWorkflow?.entidadNombre}
            </DialogTitle>
            <DialogDescription>
              {detalleWorkflow?.definicionNombre} • {detalleWorkflow?.modulo}
            </DialogDescription>
          </DialogHeader>

          {detalleWorkflow && (
            <div className="space-y-4">
              {/* Info básica */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Solicitante</p>
                  <p className="text-white">{detalleWorkflow.solicitanteNombre}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Estado</p>
                  <Badge className={estadoColores[detalleWorkflow.estado]}>
                    {estadoLabels[detalleWorkflow.estado]}
                  </Badge>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Nivel Actual</p>
                  <p className="text-white">Nivel {detalleWorkflow.nivelActual}</p>
                </div>
                {detalleWorkflow.monto && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">Monto</p>
                    <p className="text-emerald-400 font-medium">
                      ${detalleWorkflow.monto.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Historial completo */}
              <div>
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Historial Completo
                </h4>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {detalleWorkflow.historial.map((accion) => (
                    <div
                      key={accion.id}
                      className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/30"
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                        accion.tipo === 'aprobado' && 'bg-emerald-500/20',
                        accion.tipo === 'rechazado' && 'bg-red-500/20',
                        accion.tipo === 'creado' && 'bg-blue-500/20',
                        !['aprobado', 'rechazado', 'creado'].includes(accion.tipo) && 'bg-slate-500/20'
                      )}>
                        {accion.tipo === 'aprobado' && <Check className="w-4 h-4 text-emerald-400" />}
                        {accion.tipo === 'rechazado' && <X className="w-4 h-4 text-red-400" />}
                        {accion.tipo === 'creado' && <FileText className="w-4 h-4 text-blue-400" />}
                        {!['aprobado', 'rechazado', 'creado'].includes(accion.tipo) && (
                          <Clock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white">{accion.usuarioNombre}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(accion.timestamp).toLocaleString('es-MX')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 capitalize">
                          {accion.tipo} {accion.nivelNombre && `• ${accion.nivelNombre}`}
                        </p>
                        {accion.comentarios && (
                          <p className="text-sm text-slate-500 mt-1 italic">
                            "{accion.comentarios}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetalleWorkflow(null)}
              className="border-slate-700"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
