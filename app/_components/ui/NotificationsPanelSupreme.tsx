/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔔 CHRONOS INFINITY 2026 — PANEL DE NOTIFICACIONES SUPREMO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel de notificaciones premium con:
 * - Notificaciones en tiempo real
 * - Categorización visual
 * - Acciones rápidas
 * - Modo no molestar
 * - Historial y archivadas
 * - Animaciones premium
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  BellOff,
  Check,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  MessageSquare,
  Settings,
  ShieldCheck,
  DollarSign,
  ClipboardList,
  Archive,
  Pin,
  PinOff,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Clock,
  Filter,
  Search,
  X,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  notificacionesService,
  type Notificacion,
  type PreferenciasNotificacion,
  type CategoriaNotificacion
} from '@/app/_lib/services/notifications-supreme.service'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ICONOS Y COLORES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const iconosTipo: Record<string, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  alert: Bell,
  aprobacion: ShieldCheck,
  tarea: ClipboardList,
  mensaje: MessageSquare,
  sistema: Settings,
  financiero: DollarSign
}

const coloresTipo: Record<string, { bg: string; text: string; border: string }> = {
  info: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  success: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  error: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  alert: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  aprobacion: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  tarea: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  mensaje: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  sistema: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  financiero: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE DE NOTIFICACIÓN INDIVIDUAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NotificacionItemProps {
  notificacion: Notificacion
  onMarcarLeida: (id: string) => void
  onArchivar: (id: string) => void
  onFijar: (id: string) => void
  onEliminar: (id: string) => void
  onAccion: (notifId: string, accionId: string, datos?: Record<string, unknown>) => void
  expandible?: boolean
}

function NotificacionItem({
  notificacion,
  onMarcarLeida,
  onArchivar,
  onFijar,
  onEliminar,
  onAccion,
  expandible = true
}: NotificacionItemProps) {
  const [expandido, setExpandido] = useState(false)
  const Icono = iconosTipo[notificacion.tipo] || Bell
  const colores = coloresTipo[notificacion.tipo] || coloresTipo.info

  const tiempoRelativo = useCallback((timestamp: number) => {
    const segundos = Math.floor((Date.now() - timestamp) / 1000)

    if (segundos < 60) return 'Ahora'
    if (segundos < 3600) return `${Math.floor(segundos / 60)}min`
    if (segundos < 86400) return `${Math.floor(segundos / 3600)}h`
    if (segundos < 604800) return `${Math.floor(segundos / 86400)}d`
    return new Date(timestamp).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short'
    })
  }, [])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative rounded-xl border overflow-hidden transition-all duration-200",
        notificacion.leida
          ? "bg-slate-900/30 border-slate-800/50"
          : `${colores.bg} ${colores.border}`,
        notificacion.fijada && "ring-1 ring-amber-500/50",
        expandible && "cursor-pointer"
      )}
      onClick={() => {
        if (expandible && !notificacion.leida) {
          onMarcarLeida(notificacion.id)
        }
        if (expandible && notificacion.descripcionLarga) {
          setExpandido(!expandido)
        }
      }}
    >
      {/* Indicador de no leída */}
      {!notificacion.leida && (
        <div className="absolute top-3 left-0 w-1 h-8 bg-gradient-to-b from-violet-500 to-purple-500 rounded-r" />
      )}

      {/* Pin indicator */}
      {notificacion.fijada && (
        <div className="absolute top-2 right-2">
          <Pin className="w-3 h-3 text-amber-400 fill-amber-400" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icono */}
          <div className={cn(
            "p-2 rounded-lg shrink-0",
            colores.bg
          )}>
            <Icono className={cn("w-5 h-5", colores.text)} />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium text-sm truncate",
                  notificacion.leida ? "text-slate-400" : "text-white"
                )}>
                  {notificacion.titulo}
                </p>
                <p className={cn(
                  "text-sm mt-0.5 line-clamp-2",
                  notificacion.leida ? "text-slate-500" : "text-slate-400"
                )}>
                  {notificacion.mensaje}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-slate-500">
                  {tiempoRelativo(notificacion.creadaAt)}
                </span>

                {/* Menú de acciones */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                    {!notificacion.leida && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMarcarLeida(notificacion.id) }}>
                        <Check className="w-4 h-4 mr-2" />
                        Marcar leída
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFijar(notificacion.id) }}>
                      {notificacion.fijada ? (
                        <>
                          <PinOff className="w-4 h-4 mr-2" />
                          Desfijar
                        </>
                      ) : (
                        <>
                          <Pin className="w-4 h-4 mr-2" />
                          Fijar
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchivar(notificacion.id) }}>
                      <Archive className="w-4 h-4 mr-2" />
                      Archivar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      className="text-red-400"
                      onClick={(e) => { e.stopPropagation(); onEliminar(notificacion.id) }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={cn("text-xs", colores.border, colores.text)}>
                {notificacion.categoria}
              </Badge>
              {notificacion.usuarioOrigenNombre && (
                <span className="text-xs text-slate-500">
                  de {notificacion.usuarioOrigenNombre}
                </span>
              )}
            </div>

            {/* Expandir/Colapsar */}
            {notificacion.descripcionLarga && expandible && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-0 text-xs text-slate-500 mt-1"
                onClick={(e) => { e.stopPropagation(); setExpandido(!expandido) }}
              >
                {expandido ? (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Menos detalles
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-3 h-3 mr-1" />
                    Ver detalles
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Contenido expandido */}
        <AnimatePresence>
          {expandido && notificacion.descripcionLarga && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-3 border-t border-slate-700/50">
                <p className="text-sm text-slate-400 whitespace-pre-wrap">
                  {notificacion.descripcionLarga}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Acciones */}
        {notificacion.acciones && notificacion.acciones.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50">
            {notificacion.acciones.map((accion) => (
              <Button
                key={accion.id}
                size="sm"
                variant={accion.variante === 'primary' ? 'default' :
                         accion.variante === 'destructive' ? 'destructive' : 'outline'}
                className={cn(
                  "h-7 text-xs",
                  accion.variante === 'primary' && "bg-violet-600 hover:bg-violet-700",
                  accion.variante === 'default' && "border-slate-600"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onAccion(notificacion.id, accion.accion, accion.datos)
                }}
              >
                {accion.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NotificationsPanelSupremeProps {
  usuarioId: string
  className?: string
  defaultOpen?: boolean
}

export default function NotificationsPanelSupreme({
  usuarioId = 'usuario_actual',
  className,
  defaultOpen = false
}: NotificationsPanelSupremeProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [conteoNoLeidas, setConteoNoLeidas] = useState(0)
  const [preferencias, setPreferencias] = useState<PreferenciasNotificacion | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaNotificacion | 'todas'>('todas')
  const [tab, setTab] = useState<'todas' | 'noLeidas' | 'archivadas'>('todas')
  const [cargando, setCargando] = useState(true)

  // Cargar datos
  const cargarNotificaciones = useCallback(() => {
    setCargando(true)

    const filtros: Parameters<typeof notificacionesService.obtenerNotificaciones>[1] = {}

    if (tab === 'noLeidas') filtros.leida = false
    if (tab === 'archivadas') filtros.archivada = true
    else if (tab !== 'archivadas') filtros.archivada = false

    if (filtroCategoria !== 'todas') {
      filtros.categoria = filtroCategoria
    }

    const notifs = notificacionesService.obtenerNotificaciones(usuarioId, filtros)

    // Filtrar por búsqueda
    const notifsFiltradas = busqueda
      ? notifs.filter(n =>
          n.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
          n.mensaje.toLowerCase().includes(busqueda.toLowerCase())
        )
      : notifs

    setNotificaciones(notifsFiltradas)
    setConteoNoLeidas(notificacionesService.obtenerConteoNoLeidas(usuarioId))
    setPreferencias(notificacionesService.obtenerPreferencias(usuarioId))
    setCargando(false)
  }, [usuarioId, tab, filtroCategoria, busqueda])

  useEffect(() => {
    cargarNotificaciones()

    // Suscribirse a nuevas notificaciones
    const unsubscribe = notificacionesService.suscribir(usuarioId, () => {
      cargarNotificaciones()
    })

    return () => unsubscribe()
  }, [cargarNotificaciones, usuarioId])

  // Handlers
  const handleMarcarLeida = (id: string) => {
    notificacionesService.marcarComoLeida(usuarioId, id)
    cargarNotificaciones()
  }

  const handleMarcarTodasLeidas = () => {
    notificacionesService.marcarTodasComoLeidas(usuarioId)
    cargarNotificaciones()
  }

  const handleArchivar = (id: string) => {
    notificacionesService.archivar(usuarioId, id)
    cargarNotificaciones()
  }

  const handleFijar = (id: string) => {
    notificacionesService.toggleFijada(usuarioId, id)
    cargarNotificaciones()
  }

  const handleEliminar = (id: string) => {
    notificacionesService.eliminar(usuarioId, id)
    cargarNotificaciones()
  }

  const handleAccion = (notifId: string, accion: string, datos?: Record<string, unknown>) => {
    console.log('Acción ejecutada:', { notifId, accion, datos })

    // Marcar como leída al ejecutar acción
    handleMarcarLeida(notifId)

    // Aquí iría la lógica real de cada acción
    switch (accion) {
      case 'aprobar_operacion':
        // Lógica de aprobación
        break
      case 'rechazar_operacion':
        // Lógica de rechazo
        break
      case 'ver_detalle':
        if (datos?.url) {
          window.location.href = datos.url as string
        }
        break
    }
  }

  const handleToggleSonido = () => {
    if (preferencias) {
      notificacionesService.actualizarPreferencias(usuarioId, {
        notificacionesSonido: !preferencias.notificacionesSonido
      })
      cargarNotificaciones()
    }
  }

  const handleToggleNoMolestar = () => {
    if (preferencias) {
      notificacionesService.actualizarPreferencias(usuarioId, {
        modoNoMolestar: !preferencias.modoNoMolestar
      })
      cargarNotificaciones()
    }
  }

  return (
    <TooltipProvider>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "relative h-9 w-9 rounded-lg",
              "bg-slate-800/50 hover:bg-slate-700/50",
              "border border-slate-700/50",
              className
            )}
          >
            {preferencias?.modoNoMolestar ? (
              <BellOff className="w-4 h-4 text-slate-400" />
            ) : (
              <Bell className="w-4 h-4 text-slate-300" />
            )}

            {/* Badge de conteo */}
            {conteoNoLeidas > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "absolute -top-1 -right-1 min-w-[18px] h-[18px]",
                  "flex items-center justify-center",
                  "rounded-full text-[10px] font-medium",
                  "bg-red-500 text-white",
                  conteoNoLeidas > 9 && "px-1"
                )}
              >
                {conteoNoLeidas > 99 ? '99+' : conteoNoLeidas}
              </motion.span>
            )}

            {/* Animación de nueva notificación */}
            {conteoNoLeidas > 0 && (
              <motion.span
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-lg border-2 border-violet-500"
              />
            )}
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className={cn(
            "w-full sm:w-[420px] p-0",
            "bg-slate-950 border-slate-800"
          )}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Notificaciones</h2>
                  <p className="text-xs text-slate-400">
                    {conteoNoLeidas > 0
                      ? `${conteoNoLeidas} sin leer`
                      : 'Todas leídas'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Toggle sonido */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleToggleSonido}
                    >
                      {preferencias?.notificacionesSonido ? (
                        <Volume2 className="w-4 h-4 text-slate-400" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-slate-500" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {preferencias?.notificacionesSonido ? 'Silenciar' : 'Activar sonido'}
                  </TooltipContent>
                </Tooltip>

                {/* Toggle no molestar */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        preferencias?.modoNoMolestar && "text-amber-400"
                      )}
                      onClick={handleToggleNoMolestar}
                    >
                      {preferencias?.modoNoMolestar ? (
                        <BellOff className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4 text-slate-400" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {preferencias?.modoNoMolestar ? 'Desactivar No Molestar' : 'Activar No Molestar'}
                  </TooltipContent>
                </Tooltip>

                {/* Marcar todas leídas */}
                {conteoNoLeidas > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-slate-400"
                    onClick={handleMarcarTodasLeidas}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Leer todas
                  </Button>
                )}
              </div>
            </div>

            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Buscar notificaciones..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-700 text-white"
              />
              {busqueda && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setBusqueda('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Tabs */}
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-4">
              <TabsList className="w-full bg-slate-900/50 p-1">
                <TabsTrigger value="todas" className="flex-1 text-xs">
                  Todas
                </TabsTrigger>
                <TabsTrigger value="noLeidas" className="flex-1 text-xs">
                  No leídas
                  {conteoNoLeidas > 0 && (
                    <Badge className="ml-1 h-4 px-1 text-[10px] bg-red-500">
                      {conteoNoLeidas}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="archivadas" className="flex-1 text-xs">
                  Archivadas
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Lista de notificaciones */}
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-4 space-y-3">
              <AnimatePresence mode="popLayout">
                {notificaciones.length > 0 ? (
                  notificaciones.map((notif) => (
                    <NotificacionItem
                      key={notif.id}
                      notificacion={notif}
                      onMarcarLeida={handleMarcarLeida}
                      onArchivar={handleArchivar}
                      onFijar={handleFijar}
                      onEliminar={handleEliminar}
                      onAccion={handleAccion}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Bell className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">No hay notificaciones</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {tab === 'noLeidas'
                        ? 'Todas las notificaciones han sido leídas'
                        : tab === 'archivadas'
                        ? 'No hay notificaciones archivadas'
                        : 'Las nuevas notificaciones aparecerán aquí'
                      }
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}

export { NotificacionItem }
