/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔔 CHRONOS INFINITY 2026 — SERVICIO DE NOTIFICACIONES SUPREMO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de notificaciones push con:
 * - Notificaciones en tiempo real (WebSocket simulation)
 * - Persistencia de notificaciones
 * - Categorización y prioridades
 * - Acciones rápidas desde notificación
 * - Sonidos y vibración
 * - Preferencias por usuario
 * - Cola de notificaciones pendientes
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type TipoNotificacion =
  | 'info' | 'success' | 'warning' | 'error' | 'alert'
  | 'aprobacion' | 'tarea' | 'mensaje' | 'sistema' | 'financiero'

export type PrioridadNotificacion = 'baja' | 'normal' | 'alta' | 'urgente'

export type CategoriaNotificacion =
  | 'operaciones' | 'aprobaciones' | 'alertas' | 'sistema'
  | 'mensajes' | 'tareas' | 'reportes' | 'seguridad'

export interface AccionNotificacion {
  id: string
  label: string
  variante: 'default' | 'primary' | 'destructive'
  icono?: string
  accion: string // Identificador de la acción a ejecutar
  datos?: Record<string, unknown>
}

export interface Notificacion {
  id: string
  tipo: TipoNotificacion
  prioridad: PrioridadNotificacion
  categoria: CategoriaNotificacion

  // Contenido
  titulo: string
  mensaje: string
  descripcionLarga?: string
  icono?: string
  imagen?: string

  // Contexto
  modulo?: string
  entidadTipo?: string
  entidadId?: string
  urlDestino?: string

  // Acciones
  acciones?: AccionNotificacion[]

  // Estado
  leida: boolean
  archivada: boolean
  fijada: boolean

  // Destinatario
  usuarioDestinoId: string
  usuarioOrigenId?: string
  usuarioOrigenNombre?: string

  // Metadata
  sonido?: string
  vibrar?: boolean
  persistente?: boolean
  expiraAt?: number

  // Timestamps
  creadaAt: number
  leidaAt?: number
  archivedAt?: number
}

export interface PreferenciasNotificacion {
  usuarioId: string

  // Canales
  notificacionesPush: boolean
  notificacionesEmail: boolean
  notificacionesSonido: boolean
  notificacionesVibracion: boolean

  // Horario silencioso
  modoNoMolestar: boolean
  horaInicioSilencio: string // "22:00"
  horaFinSilencio: string    // "07:00"

  // Por categoría
  preferenciasCategoria: Record<CategoriaNotificacion, {
    activo: boolean
    sonido: boolean
    prioridad: PrioridadNotificacion
  }>

  // Por tipo
  preferenciaTipo: Record<TipoNotificacion, boolean>
}

export interface EstadisticasNotificaciones {
  total: number
  noLeidas: number
  porCategoria: Record<CategoriaNotificacion, number>
  porPrioridad: Record<PrioridadNotificacion, number>
  ultimaSemana: { dia: string; total: number }[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE NOTIFICACIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class NotificacionesSupremeService {
  private static instance: NotificacionesSupremeService
  private notificaciones: Map<string, Notificacion[]> = new Map() // Por usuario
  private preferencias: Map<string, PreferenciasNotificacion> = new Map()
  private listeners: Map<string, ((notif: Notificacion) => void)[]> = new Map()

  // Sonidos disponibles
  private sonidos = {
    default: '/sounds/notification.mp3',
    success: '/sounds/success.mp3',
    warning: '/sounds/warning.mp3',
    error: '/sounds/error.mp3',
    urgente: '/sounds/urgent.mp3',
    aprobacion: '/sounds/approval.mp3',
    mensaje: '/sounds/message.mp3'
  }

  private constructor() {}

  public static getInstance(): NotificacionesSupremeService {
    if (!NotificacionesSupremeService.instance) {
      NotificacionesSupremeService.instance = new NotificacionesSupremeService()
    }
    return NotificacionesSupremeService.instance
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // ENVÍO DE NOTIFICACIONES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Envía una notificación a un usuario
   */
  public async enviar(params: {
    usuarioDestinoId: string
    tipo: TipoNotificacion
    prioridad?: PrioridadNotificacion
    categoria: CategoriaNotificacion
    titulo: string
    mensaje: string
    descripcionLarga?: string
    icono?: string
    imagen?: string
    modulo?: string
    entidadTipo?: string
    entidadId?: string
    urlDestino?: string
    acciones?: AccionNotificacion[]
    usuarioOrigenId?: string
    usuarioOrigenNombre?: string
    sonido?: string
    vibrar?: boolean
    persistente?: boolean
    expiraEnMinutos?: number
  }): Promise<Notificacion> {
    const prefs = this.obtenerPreferencias(params.usuarioDestinoId)

    // Verificar si está en modo no molestar
    if (this.enModoNoMolestar(prefs)) {
      logger.debug('🔕 Usuario en modo no molestar')
    }

    // Verificar preferencias de categoría
    const prefCat = prefs.preferenciasCategoria[params.categoria]
    if (prefCat && !prefCat.activo) {
      logger.debug('🔕 Categoría desactivada para el usuario')
    }

    const notificacion: Notificacion = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tipo: params.tipo,
      prioridad: params.prioridad || 'normal',
      categoria: params.categoria,
      titulo: params.titulo,
      mensaje: params.mensaje,
      descripcionLarga: params.descripcionLarga,
      icono: params.icono || this.obtenerIconoPorTipo(params.tipo),
      imagen: params.imagen,
      modulo: params.modulo,
      entidadTipo: params.entidadTipo,
      entidadId: params.entidadId,
      urlDestino: params.urlDestino,
      acciones: params.acciones,
      leida: false,
      archivada: false,
      fijada: false,
      usuarioDestinoId: params.usuarioDestinoId,
      usuarioOrigenId: params.usuarioOrigenId,
      usuarioOrigenNombre: params.usuarioOrigenNombre,
      sonido: params.sonido,
      vibrar: params.vibrar ?? params.prioridad === 'urgente',
      persistente: params.persistente,
      expiraAt: params.expiraEnMinutos
        ? Date.now() + (params.expiraEnMinutos * 60 * 1000)
        : undefined,
      creadaAt: Date.now()
    }

    // Guardar notificación
    const userNotifs = this.notificaciones.get(params.usuarioDestinoId) || []
    userNotifs.unshift(notificacion)
    this.notificaciones.set(params.usuarioDestinoId, userNotifs)

    // Reproducir sonido si está habilitado
    if (prefs.notificacionesSonido && !this.enModoNoMolestar(prefs)) {
      this.reproducirSonido(notificacion)
    }

    // Vibrar si está habilitado
    if (prefs.notificacionesVibracion && notificacion.vibrar && !this.enModoNoMolestar(prefs)) {
      this.vibrar(notificacion.prioridad)
    }

    // Notificar a listeners (para actualización en tiempo real)
    this.notificarListeners(params.usuarioDestinoId, notificacion)

    logger.info('🔔 Notificación enviada', {
      id: notificacion.id,
      destino: params.usuarioDestinoId,
      tipo: params.tipo,
      titulo: params.titulo
    })

    return notificacion
  }

  /**
   * Envía notificación de aprobación requerida
   */
  public async enviarSolicitudAprobacion(params: {
    usuarioDestinoId: string
    operacion: string
    monto: number
    bancoNombre: string
    solicitanteId: string
    solicitanteNombre: string
    entidadId: string
    urlDestino?: string
  }): Promise<Notificacion> {
    return this.enviar({
      usuarioDestinoId: params.usuarioDestinoId,
      tipo: 'aprobacion',
      prioridad: params.monto > 50000 ? 'urgente' : 'alta',
      categoria: 'aprobaciones',
      titulo: '🔐 Aprobación Requerida',
      mensaje: `${params.solicitanteNombre} solicita aprobación para ${params.operacion}`,
      descripcionLarga: `
        **Operación:** ${params.operacion}
        **Monto:** $${params.monto.toLocaleString()}
        **Banco:** ${params.bancoNombre}
        **Solicitante:** ${params.solicitanteNombre}
      `.trim(),
      icono: 'ShieldCheck',
      modulo: 'aprobaciones',
      entidadTipo: 'aprobacion',
      entidadId: params.entidadId,
      urlDestino: params.urlDestino,
      usuarioOrigenId: params.solicitanteId,
      usuarioOrigenNombre: params.solicitanteNombre,
      acciones: [
        {
          id: 'aprobar',
          label: 'Aprobar',
          variante: 'primary',
          icono: 'Check',
          accion: 'aprobar_operacion',
          datos: { entidadId: params.entidadId }
        },
        {
          id: 'rechazar',
          label: 'Rechazar',
          variante: 'destructive',
          icono: 'X',
          accion: 'rechazar_operacion',
          datos: { entidadId: params.entidadId }
        },
        {
          id: 'ver',
          label: 'Ver Detalles',
          variante: 'default',
          icono: 'Eye',
          accion: 'ver_detalle',
          datos: { url: params.urlDestino }
        }
      ],
      vibrar: true,
      persistente: true
    })
  }

  /**
   * Envía notificación de alerta financiera
   */
  public async enviarAlertaFinanciera(params: {
    usuarioDestinoId: string
    titulo: string
    mensaje: string
    bancoId: string
    bancoNombre: string
    monto?: number
    prioridad?: PrioridadNotificacion
    urlDestino?: string
  }): Promise<Notificacion> {
    return this.enviar({
      usuarioDestinoId: params.usuarioDestinoId,
      tipo: 'financiero',
      prioridad: params.prioridad || 'alta',
      categoria: 'alertas',
      titulo: params.titulo,
      mensaje: params.mensaje,
      icono: 'AlertTriangle',
      modulo: 'bancos',
      entidadTipo: 'banco',
      entidadId: params.bancoId,
      urlDestino: params.urlDestino,
      vibrar: params.prioridad === 'urgente'
    })
  }

  /**
   * Envía notificación de sistema
   */
  public async enviarNotificacionSistema(params: {
    usuariosDestino: string[]
    tipo: TipoNotificacion
    titulo: string
    mensaje: string
    prioridad?: PrioridadNotificacion
  }): Promise<Notificacion[]> {
    const notificaciones: Notificacion[] = []

    for (const usuarioId of params.usuariosDestino) {
      const notif = await this.enviar({
        usuarioDestinoId: usuarioId,
        tipo: params.tipo,
        prioridad: params.prioridad || 'normal',
        categoria: 'sistema',
        titulo: params.titulo,
        mensaje: params.mensaje,
        icono: 'Bell'
      })
      notificaciones.push(notif)
    }

    return notificaciones
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // CONSULTAS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene notificaciones de un usuario
   */
  public obtenerNotificaciones(
    usuarioId: string,
    filtros?: {
      categoria?: CategoriaNotificacion
      tipo?: TipoNotificacion
      leida?: boolean
      archivada?: boolean
      desde?: number
      limite?: number
    }
  ): Notificacion[] {
    let notifs = this.notificaciones.get(usuarioId) || []

    // Eliminar expiradas
    notifs = notifs.filter(n => !n.expiraAt || n.expiraAt > Date.now())

    // Aplicar filtros
    if (filtros?.categoria) {
      notifs = notifs.filter(n => n.categoria === filtros.categoria)
    }
    if (filtros?.tipo) {
      notifs = notifs.filter(n => n.tipo === filtros.tipo)
    }
    if (filtros?.leida !== undefined) {
      notifs = notifs.filter(n => n.leida === filtros.leida)
    }
    if (filtros?.archivada !== undefined) {
      notifs = notifs.filter(n => n.archivada === filtros.archivada)
    }
    if (filtros?.desde) {
      notifs = notifs.filter(n => n.creadaAt >= filtros.desde!)
    }

    // Ordenar: fijadas primero, luego por fecha
    notifs.sort((a, b) => {
      if (a.fijada !== b.fijada) return a.fijada ? -1 : 1
      return b.creadaAt - a.creadaAt
    })

    if (filtros?.limite) {
      notifs = notifs.slice(0, filtros.limite)
    }

    return notifs
  }

  /**
   * Obtiene el conteo de notificaciones no leídas
   */
  public obtenerConteoNoLeidas(usuarioId: string): number {
    const notifs = this.notificaciones.get(usuarioId) || []
    return notifs.filter(n => !n.leida && !n.archivada).length
  }

  /**
   * Obtiene estadísticas de notificaciones
   */
  public obtenerEstadisticas(usuarioId: string): EstadisticasNotificaciones {
    const notifs = this.notificaciones.get(usuarioId) || []
    const noLeidas = notifs.filter(n => !n.leida && !n.archivada)

    const porCategoria = {} as Record<CategoriaNotificacion, number>
    const porPrioridad = {} as Record<PrioridadNotificacion, number>

    notifs.forEach(n => {
      porCategoria[n.categoria] = (porCategoria[n.categoria] || 0) + 1
      porPrioridad[n.prioridad] = (porPrioridad[n.prioridad] || 0) + 1
    })

    // Por día de la última semana
    const hace7dias = Date.now() - (7 * 24 * 60 * 60 * 1000)
    const porDia: { dia: string; total: number }[] = []
    const porDiaMap = new Map<string, number>()

    notifs.filter(n => n.creadaAt >= hace7dias).forEach(n => {
      const dia = new Date(n.creadaAt).toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit' })
      porDiaMap.set(dia, (porDiaMap.get(dia) || 0) + 1)
    })

    porDiaMap.forEach((total, dia) => porDia.push({ dia, total }))

    return {
      total: notifs.length,
      noLeidas: noLeidas.length,
      porCategoria,
      porPrioridad,
      ultimaSemana: porDia
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // ACCIONES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Marca notificación como leída
   */
  public marcarComoLeida(usuarioId: string, notificacionId: string): void {
    const notifs = this.notificaciones.get(usuarioId)
    const notif = notifs?.find(n => n.id === notificacionId)
    if (notif) {
      notif.leida = true
      notif.leidaAt = Date.now()
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  public marcarTodasComoLeidas(usuarioId: string): void {
    const notifs = this.notificaciones.get(usuarioId)
    notifs?.forEach(n => {
      if (!n.leida) {
        n.leida = true
        n.leidaAt = Date.now()
      }
    })
  }

  /**
   * Archiva una notificación
   */
  public archivar(usuarioId: string, notificacionId: string): void {
    const notifs = this.notificaciones.get(usuarioId)
    const notif = notifs?.find(n => n.id === notificacionId)
    if (notif) {
      notif.archivada = true
      notif.archivedAt = Date.now()
    }
  }

  /**
   * Fija/desfija una notificación
   */
  public toggleFijada(usuarioId: string, notificacionId: string): boolean {
    const notifs = this.notificaciones.get(usuarioId)
    const notif = notifs?.find(n => n.id === notificacionId)
    if (notif) {
      notif.fijada = !notif.fijada
      return notif.fijada
    }
    return false
  }

  /**
   * Elimina una notificación
   */
  public eliminar(usuarioId: string, notificacionId: string): void {
    const notifs = this.notificaciones.get(usuarioId)
    if (notifs) {
      const index = notifs.findIndex(n => n.id === notificacionId)
      if (index !== -1) {
        notifs.splice(index, 1)
      }
    }
  }

  /**
   * Elimina todas las notificaciones archivadas
   */
  public eliminarArchivadas(usuarioId: string): void {
    const notifs = this.notificaciones.get(usuarioId)
    if (notifs) {
      this.notificaciones.set(
        usuarioId,
        notifs.filter(n => !n.archivada)
      )
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // PREFERENCIAS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene preferencias de un usuario (o defaults)
   */
  public obtenerPreferencias(usuarioId: string): PreferenciasNotificacion {
    const prefs = this.preferencias.get(usuarioId)
    if (prefs) return prefs

    // Defaults
    const defaultPrefs: PreferenciasNotificacion = {
      usuarioId,
      notificacionesPush: true,
      notificacionesEmail: true,
      notificacionesSonido: true,
      notificacionesVibracion: true,
      modoNoMolestar: false,
      horaInicioSilencio: '22:00',
      horaFinSilencio: '07:00',
      preferenciasCategoria: {
        operaciones: { activo: true, sonido: true, prioridad: 'normal' },
        aprobaciones: { activo: true, sonido: true, prioridad: 'alta' },
        alertas: { activo: true, sonido: true, prioridad: 'alta' },
        sistema: { activo: true, sonido: false, prioridad: 'normal' },
        mensajes: { activo: true, sonido: true, prioridad: 'normal' },
        tareas: { activo: true, sonido: false, prioridad: 'normal' },
        reportes: { activo: true, sonido: false, prioridad: 'baja' },
        seguridad: { activo: true, sonido: true, prioridad: 'urgente' }
      },
      preferenciaTipo: {
        info: true,
        success: true,
        warning: true,
        error: true,
        alert: true,
        aprobacion: true,
        tarea: true,
        mensaje: true,
        sistema: true,
        financiero: true
      }
    }

    this.preferencias.set(usuarioId, defaultPrefs)
    return defaultPrefs
  }

  /**
   * Actualiza preferencias de un usuario
   */
  public actualizarPreferencias(
    usuarioId: string,
    updates: Partial<PreferenciasNotificacion>
  ): void {
    const prefs = this.obtenerPreferencias(usuarioId)
    this.preferencias.set(usuarioId, { ...prefs, ...updates })
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // SUSCRIPCIONES EN TIEMPO REAL
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Suscribirse a notificaciones de un usuario
   */
  public suscribir(
    usuarioId: string,
    callback: (notif: Notificacion) => void
  ): () => void {
    const listeners = this.listeners.get(usuarioId) || []
    listeners.push(callback)
    this.listeners.set(usuarioId, listeners)

    return () => {
      const current = this.listeners.get(usuarioId) || []
      this.listeners.set(
        usuarioId,
        current.filter(l => l !== callback)
      )
    }
  }

  private notificarListeners(usuarioId: string, notif: Notificacion): void {
    const listeners = this.listeners.get(usuarioId) || []
    listeners.forEach(callback => {
      try {
        callback(notif)
      } catch (error) {
        logger.error('Error en listener de notificaciones', error)
      }
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // HELPERS PRIVADOS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private enModoNoMolestar(prefs: PreferenciasNotificacion): boolean {
    if (!prefs.modoNoMolestar) return false

    const ahora = new Date()
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes()

    const [hInicio, mInicio] = prefs.horaInicioSilencio.split(':').map(Number)
    const [hFin, mFin] = prefs.horaFinSilencio.split(':').map(Number)

    const inicioMin = hInicio * 60 + mInicio
    const finMin = hFin * 60 + mFin

    // Si el horario cruza la medianoche
    if (inicioMin > finMin) {
      return horaActual >= inicioMin || horaActual <= finMin
    }

    return horaActual >= inicioMin && horaActual <= finMin
  }

  private obtenerIconoPorTipo(tipo: TipoNotificacion): string {
    const iconos: Record<TipoNotificacion, string> = {
      info: 'Info',
      success: 'CheckCircle',
      warning: 'AlertTriangle',
      error: 'XCircle',
      alert: 'Bell',
      aprobacion: 'ShieldCheck',
      tarea: 'ClipboardList',
      mensaje: 'MessageSquare',
      sistema: 'Settings',
      financiero: 'DollarSign'
    }
    return iconos[tipo] || 'Bell'
  }

  private reproducirSonido(notif: Notificacion): void {
    if (typeof window === 'undefined') return

    const sonidoUrl = notif.sonido || this.sonidos[notif.tipo as keyof typeof this.sonidos] || this.sonidos.default

    try {
      const audio = new Audio(sonidoUrl)
      audio.volume = 0.3
      audio.play().catch(() => {
        // Ignorar error si el navegador bloquea autoplay
      })
    } catch {
      // Ignorar errores de audio
    }
  }

  private vibrar(prioridad: PrioridadNotificacion): void {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) return

    const patrones: Record<PrioridadNotificacion, number[]> = {
      baja: [50],
      normal: [100],
      alta: [100, 50, 100],
      urgente: [200, 100, 200, 100, 200]
    }

    try {
      navigator.vibrate(patrones[prioridad])
    } catch {
      // Ignorar errores de vibración
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const notificacionesService = NotificacionesSupremeService.getInstance()
export default notificacionesService
