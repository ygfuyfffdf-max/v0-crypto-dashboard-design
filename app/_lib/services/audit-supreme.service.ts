/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📝 CHRONOS INFINITY 2026 — SERVICIO DE AUDITORÍA SUPREMO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de auditoría completo con:
 * - Registro automático de todas las operaciones
 * - Trazabilidad completa por usuario, dispositivo, IP
 * - Historial de cambios campo por campo
 * - Exportación de logs
 * - Dashboard de actividad en tiempo real
 * - Alertas de actividad sospechosa
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

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

export interface ContextoDispositivo {
  ip: string
  userAgent: string
  dispositivo: string
  navegador: string
  sistemaOperativo: string
  ubicacion?: string
  resolucion?: string
  idioma?: string
}

export interface CambioAudit {
  campo: string
  valorAnterior: unknown
  valorNuevo: unknown
  tipo: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date'
}

export interface EntradaAudit {
  id: string

  // Usuario que realizó la acción
  usuario: {
    id: string
    nombre: string
    email: string
    rolId?: string
    rolNombre?: string
  }

  // Acción realizada
  accion: AccionAudit
  modulo: ModuloAudit
  descripcion: string
  severidad: SeveridadAudit

  // Entidad afectada
  entidad?: {
    tipo: string // 'movimiento', 'venta', 'cliente', etc.
    id: string
    nombre: string
  }

  // Cambios realizados
  cambios: CambioAudit[]
  datosAnteriores?: Record<string, unknown>
  datosNuevos?: Record<string, unknown>

  // Contexto bancario (si aplica)
  contextoFinanciero?: {
    bancoId: string
    bancoNombre: string
    monto: number
    balanceAnterior?: number
    balanceNuevo?: number
  }

  // Contexto técnico
  dispositivo: ContextoDispositivo

  // Resultado
  exitoso: boolean
  mensajeError?: string
  duracionMs?: number

  // Metadata adicional
  metadata?: Record<string, unknown>
  tags?: string[]

  // Timestamps
  timestamp: number
  fechaFormateada: string
}

export interface FiltrosAudit {
  usuarioId?: string
  modulo?: ModuloAudit
  accion?: AccionAudit
  severidad?: SeveridadAudit
  bancoId?: string
  entidadTipo?: string
  entidadId?: string
  exitoso?: boolean
  desde?: number
  hasta?: number
  busqueda?: string
  tags?: string[]
  limite?: number
  offset?: number
  ordenarPor?: 'timestamp' | 'modulo' | 'usuario' | 'severidad'
  ordenDir?: 'asc' | 'desc'
}

export interface EstadisticasAudit {
  total: number
  porModulo: Record<ModuloAudit, number>
  porAccion: Record<AccionAudit, number>
  porUsuario: { usuarioId: string; nombre: string; total: number }[]
  porSeveridad: Record<SeveridadAudit, number>
  porHora: { hora: string; total: number }[]
  porDia: { dia: string; total: number }[]
  actividadReciente: EntradaAudit[]
  alertas: AlertaAudit[]
}

export interface AlertaAudit {
  id: string
  tipo: 'exceso_operaciones' | 'horario_inusual' | 'ip_nueva' | 'error_frecuente' | 'monto_alto' | 'actividad_sospechosa'
  severidad: SeveridadAudit
  titulo: string
  descripcion: string
  usuarioId: string
  usuarioNombre: string
  timestamp: number
  atendida: boolean
  atendidaPor?: string
  atendidaAt?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE AUDITORÍA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class AuditSupremeService {
  private static instance: AuditSupremeService
  private logs: EntradaAudit[] = []
  private alertas: AlertaAudit[] = []
  private listeners: ((entrada: EntradaAudit) => void)[] = []

  // Configuración de alertas automáticas
  private config = {
    maxOperacionesPorHora: 100,
    horarioNormalInicio: '07:00',
    horarioNormalFin: '23:00',
    montoAltoUmbral: 50000,
    erroresFrecuentesUmbral: 5,
    actividadSospechosaUmbral: 10
  }

  private constructor() {}

  public static getInstance(): AuditSupremeService {
    if (!AuditSupremeService.instance) {
      AuditSupremeService.instance = new AuditSupremeService()
    }
    return AuditSupremeService.instance
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // REGISTRO DE AUDITORÍA
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Registra una entrada de auditoría
   */
  public async registrar(params: {
    usuario: EntradaAudit['usuario']
    accion: AccionAudit
    modulo: ModuloAudit
    descripcion: string
    severidad?: SeveridadAudit
    entidad?: EntradaAudit['entidad']
    datosAnteriores?: Record<string, unknown>
    datosNuevos?: Record<string, unknown>
    contextoFinanciero?: EntradaAudit['contextoFinanciero']
    dispositivo: ContextoDispositivo
    exitoso?: boolean
    mensajeError?: string
    duracionMs?: number
    metadata?: Record<string, unknown>
    tags?: string[]
  }): Promise<EntradaAudit> {
    const timestamp = Date.now()

    // Calcular cambios automáticamente
    const cambios = this.calcularCambios(params.datosAnteriores, params.datosNuevos)

    const entrada: EntradaAudit = {
      id: `audit_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      usuario: params.usuario,
      accion: params.accion,
      modulo: params.modulo,
      descripcion: params.descripcion,
      severidad: params.severidad || this.determinarSeveridad(params.accion, params.exitoso ?? true),
      entidad: params.entidad,
      cambios,
      datosAnteriores: params.datosAnteriores,
      datosNuevos: params.datosNuevos,
      contextoFinanciero: params.contextoFinanciero,
      dispositivo: params.dispositivo,
      exitoso: params.exitoso ?? true,
      mensajeError: params.mensajeError,
      duracionMs: params.duracionMs,
      metadata: params.metadata,
      tags: params.tags,
      timestamp,
      fechaFormateada: new Date(timestamp).toLocaleString('es-MX', {
        dateStyle: 'full',
        timeStyle: 'medium'
      })
    }

    // Guardar en memoria (en producción sería BD)
    this.logs.unshift(entrada)

    // Verificar alertas automáticas
    await this.verificarAlertas(entrada)

    // Notificar a listeners
    this.notificarListeners(entrada)

    // Log para desarrollo
    logger.info('📝 Audit registrado', {
      id: entrada.id,
      usuario: entrada.usuario.nombre,
      accion: entrada.accion,
      modulo: entrada.modulo
    })

    return entrada
  }

  /**
   * Calcula los cambios entre datos anteriores y nuevos
   */
  private calcularCambios(
    datosAnteriores?: Record<string, unknown>,
    datosNuevos?: Record<string, unknown>
  ): CambioAudit[] {
    if (!datosAnteriores || !datosNuevos) return []

    const cambios: CambioAudit[] = []
    const todasLasClaves = new Set([
      ...Object.keys(datosAnteriores),
      ...Object.keys(datosNuevos)
    ])

    for (const campo of todasLasClaves) {
      const valorAnterior = datosAnteriores[campo]
      const valorNuevo = datosNuevos[campo]

      if (JSON.stringify(valorAnterior) !== JSON.stringify(valorNuevo)) {
        cambios.push({
          campo,
          valorAnterior,
          valorNuevo,
          tipo: this.determinarTipo(valorNuevo ?? valorAnterior)
        })
      }
    }

    return cambios
  }

  private determinarTipo(valor: unknown): CambioAudit['tipo'] {
    if (valor === null || valor === undefined) return 'string'
    if (Array.isArray(valor)) return 'array'
    if (valor instanceof Date) return 'date'
    if (typeof valor === 'object') return 'object'
    if (typeof valor === 'number') return 'number'
    if (typeof valor === 'boolean') return 'boolean'
    return 'string'
  }

  private determinarSeveridad(accion: AccionAudit, exitoso: boolean): SeveridadAudit {
    if (!exitoso) return 'error'

    const accionesAltas: AccionAudit[] = ['eliminar', 'bloquear', 'cambio_rol', 'cambio_permiso', 'corte']
    const accionesMedias: AccionAudit[] = ['transferir', 'ajuste', 'aprobar', 'rechazar']

    if (accionesAltas.includes(accion)) return 'warning'
    if (accionesMedias.includes(accion)) return 'info'
    return 'info'
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // CONSULTAS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene logs filtrados
   */
  public async obtenerLogs(filtros: FiltrosAudit = {}): Promise<{
    logs: EntradaAudit[]
    total: number
    pagina: number
    totalPaginas: number
  }> {
    let resultado = [...this.logs]

    // Aplicar filtros
    if (filtros.usuarioId) {
      resultado = resultado.filter(l => l.usuario.id === filtros.usuarioId)
    }
    if (filtros.modulo) {
      resultado = resultado.filter(l => l.modulo === filtros.modulo)
    }
    if (filtros.accion) {
      resultado = resultado.filter(l => l.accion === filtros.accion)
    }
    if (filtros.severidad) {
      resultado = resultado.filter(l => l.severidad === filtros.severidad)
    }
    if (filtros.bancoId) {
      resultado = resultado.filter(l => l.contextoFinanciero?.bancoId === filtros.bancoId)
    }
    if (filtros.entidadTipo) {
      resultado = resultado.filter(l => l.entidad?.tipo === filtros.entidadTipo)
    }
    if (filtros.entidadId) {
      resultado = resultado.filter(l => l.entidad?.id === filtros.entidadId)
    }
    if (filtros.exitoso !== undefined) {
      resultado = resultado.filter(l => l.exitoso === filtros.exitoso)
    }
    if (filtros.desde) {
      resultado = resultado.filter(l => l.timestamp >= filtros.desde!)
    }
    if (filtros.hasta) {
      resultado = resultado.filter(l => l.timestamp <= filtros.hasta!)
    }
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase()
      resultado = resultado.filter(l =>
        l.descripcion.toLowerCase().includes(busqueda) ||
        l.usuario.nombre.toLowerCase().includes(busqueda) ||
        l.entidad?.nombre.toLowerCase().includes(busqueda)
      )
    }
    if (filtros.tags?.length) {
      resultado = resultado.filter(l =>
        filtros.tags!.some(tag => l.tags?.includes(tag))
      )
    }

    // Ordenar
    const ordenarPor = filtros.ordenarPor || 'timestamp'
    const ordenDir = filtros.ordenDir || 'desc'
    resultado.sort((a, b) => {
      let valorA = a[ordenarPor as keyof EntradaAudit]
      let valorB = b[ordenarPor as keyof EntradaAudit]

      if (ordenarPor === 'usuario') {
        valorA = a.usuario.nombre
        valorB = b.usuario.nombre
      }

      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return ordenDir === 'asc'
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA)
      }

      return ordenDir === 'asc'
        ? (valorA as number) - (valorB as number)
        : (valorB as number) - (valorA as number)
    })

    // Paginación
    const limite = filtros.limite || 50
    const offset = filtros.offset || 0
    const total = resultado.length
    const totalPaginas = Math.ceil(total / limite)
    const pagina = Math.floor(offset / limite) + 1

    return {
      logs: resultado.slice(offset, offset + limite),
      total,
      pagina,
      totalPaginas
    }
  }

  /**
   * Obtiene historial de una entidad específica
   */
  public async obtenerHistorialEntidad(tipo: string, id: string): Promise<EntradaAudit[]> {
    return this.logs.filter(l => l.entidad?.tipo === tipo && l.entidad?.id === id)
  }

  /**
   * Obtiene actividad de un usuario
   */
  public async obtenerActividadUsuario(usuarioId: string, dias = 7): Promise<EntradaAudit[]> {
    const desde = Date.now() - (dias * 24 * 60 * 60 * 1000)
    return this.logs.filter(l => l.usuario.id === usuarioId && l.timestamp >= desde)
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // ESTADÍSTICAS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene estadísticas de auditoría
   */
  public async obtenerEstadisticas(dias = 7): Promise<EstadisticasAudit> {
    const desde = Date.now() - (dias * 24 * 60 * 60 * 1000)
    const logsRecientes = this.logs.filter(l => l.timestamp >= desde)

    // Por módulo
    const porModulo = {} as Record<ModuloAudit, number>
    logsRecientes.forEach(l => {
      porModulo[l.modulo] = (porModulo[l.modulo] || 0) + 1
    })

    // Por acción
    const porAccion = {} as Record<AccionAudit, number>
    logsRecientes.forEach(l => {
      porAccion[l.accion] = (porAccion[l.accion] || 0) + 1
    })

    // Por usuario
    const porUsuarioMap = new Map<string, { usuarioId: string; nombre: string; total: number }>()
    logsRecientes.forEach(l => {
      const existing = porUsuarioMap.get(l.usuario.id)
      if (existing) {
        existing.total++
      } else {
        porUsuarioMap.set(l.usuario.id, {
          usuarioId: l.usuario.id,
          nombre: l.usuario.nombre,
          total: 1
        })
      }
    })
    const porUsuario = Array.from(porUsuarioMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    // Por severidad
    const porSeveridad = {} as Record<SeveridadAudit, number>
    logsRecientes.forEach(l => {
      porSeveridad[l.severidad] = (porSeveridad[l.severidad] || 0) + 1
    })

    // Por hora (últimas 24h)
    const hace24h = Date.now() - (24 * 60 * 60 * 1000)
    const porHoraMap = new Map<string, number>()
    logsRecientes.filter(l => l.timestamp >= hace24h).forEach(l => {
      const hora = new Date(l.timestamp).getHours().toString().padStart(2, '0') + ':00'
      porHoraMap.set(hora, (porHoraMap.get(hora) || 0) + 1)
    })
    const porHora = Array.from(porHoraMap.entries())
      .map(([hora, total]) => ({ hora, total }))
      .sort((a, b) => a.hora.localeCompare(b.hora))

    // Por día
    const porDiaMap = new Map<string, number>()
    logsRecientes.forEach(l => {
      const dia = new Date(l.timestamp).toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' })
      porDiaMap.set(dia, (porDiaMap.get(dia) || 0) + 1)
    })
    const porDia = Array.from(porDiaMap.entries())
      .map(([dia, total]) => ({ dia, total }))
      .slice(0, 7)

    return {
      total: logsRecientes.length,
      porModulo,
      porAccion,
      porUsuario,
      porSeveridad,
      porHora,
      porDia,
      actividadReciente: logsRecientes.slice(0, 20),
      alertas: this.alertas.filter(a => !a.atendida)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // ALERTAS AUTOMÁTICAS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private async verificarAlertas(entrada: EntradaAudit): Promise<void> {
    // Verificar exceso de operaciones
    const hace1h = Date.now() - (60 * 60 * 1000)
    const operacionesUsuario = this.logs.filter(
      l => l.usuario.id === entrada.usuario.id && l.timestamp >= hace1h
    ).length

    if (operacionesUsuario > this.config.maxOperacionesPorHora) {
      await this.crearAlerta({
        tipo: 'exceso_operaciones',
        severidad: 'warning',
        titulo: 'Exceso de operaciones detectado',
        descripcion: `El usuario ${entrada.usuario.nombre} ha realizado ${operacionesUsuario} operaciones en la última hora`,
        usuarioId: entrada.usuario.id,
        usuarioNombre: entrada.usuario.nombre
      })
    }

    // Verificar horario inusual
    const hora = new Date().getHours()
    const horaInicio = parseInt(this.config.horarioNormalInicio.split(':')[0])
    const horaFin = parseInt(this.config.horarioNormalFin.split(':')[0])

    if (hora < horaInicio || hora > horaFin) {
      await this.crearAlerta({
        tipo: 'horario_inusual',
        severidad: 'info',
        titulo: 'Actividad fuera de horario',
        descripcion: `${entrada.usuario.nombre} accedió al sistema a las ${new Date().toLocaleTimeString()}`,
        usuarioId: entrada.usuario.id,
        usuarioNombre: entrada.usuario.nombre
      })
    }

    // Verificar monto alto
    if (entrada.contextoFinanciero?.monto &&
        entrada.contextoFinanciero.monto > this.config.montoAltoUmbral) {
      await this.crearAlerta({
        tipo: 'monto_alto',
        severidad: 'warning',
        titulo: 'Operación de monto alto',
        descripcion: `${entrada.usuario.nombre} realizó una operación de $${entrada.contextoFinanciero.monto.toLocaleString()}`,
        usuarioId: entrada.usuario.id,
        usuarioNombre: entrada.usuario.nombre
      })
    }

    // Verificar errores frecuentes
    if (!entrada.exitoso) {
      const erroresRecientes = this.logs.filter(
        l => l.usuario.id === entrada.usuario.id &&
             !l.exitoso &&
             l.timestamp >= hace1h
      ).length

      if (erroresRecientes >= this.config.erroresFrecuentesUmbral) {
        await this.crearAlerta({
          tipo: 'error_frecuente',
          severidad: 'error',
          titulo: 'Errores frecuentes detectados',
          descripcion: `El usuario ${entrada.usuario.nombre} ha tenido ${erroresRecientes} errores en la última hora`,
          usuarioId: entrada.usuario.id,
          usuarioNombre: entrada.usuario.nombre
        })
      }
    }
  }

  private async crearAlerta(params: Omit<AlertaAudit, 'id' | 'timestamp' | 'atendida'>): Promise<void> {
    // Verificar si ya existe una alerta similar reciente
    const hace30min = Date.now() - (30 * 60 * 1000)
    const alertaExistente = this.alertas.find(
      a => a.tipo === params.tipo &&
           a.usuarioId === params.usuarioId &&
           a.timestamp >= hace30min
    )

    if (alertaExistente) return

    const alerta: AlertaAudit = {
      ...params,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      atendida: false
    }

    this.alertas.unshift(alerta)

    logger.warn('🚨 Alerta creada', alerta)
  }

  /**
   * Marcar alerta como atendida
   */
  public async atenderAlerta(alertaId: string, atendidaPor: string): Promise<void> {
    const alerta = this.alertas.find(a => a.id === alertaId)
    if (alerta) {
      alerta.atendida = true
      alerta.atendidaPor = atendidaPor
      alerta.atendidaAt = Date.now()
    }
  }

  public obtenerAlertas(): AlertaAudit[] {
    return this.alertas
  }

  public obtenerAlertasPendientes(): AlertaAudit[] {
    return this.alertas.filter(a => !a.atendida)
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // SUSCRIPCIONES EN TIEMPO REAL
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Suscribirse a nuevas entradas de auditoría
   */
  public suscribir(callback: (entrada: EntradaAudit) => void): () => void {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  private notificarListeners(entrada: EntradaAudit): void {
    this.listeners.forEach(callback => {
      try {
        callback(entrada)
      } catch (error) {
        logger.error('Error en listener de auditoría', error)
      }
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // EXPORTACIÓN
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Exporta logs a diferentes formatos
   */
  public async exportar(
    filtros: FiltrosAudit,
    formato: 'csv' | 'json' | 'excel'
  ): Promise<{ datos: string; nombreArchivo: string; mimeType: string }> {
    const { logs } = await this.obtenerLogs(filtros)
    const fechaExport = new Date().toISOString().split('T')[0]

    switch (formato) {
      case 'json':
        return {
          datos: JSON.stringify(logs, null, 2),
          nombreArchivo: `audit_log_${fechaExport}.json`,
          mimeType: 'application/json'
        }

      case 'csv': {
        const headers = [
          'ID', 'Fecha', 'Usuario', 'Email', 'Rol', 'Acción', 'Módulo',
          'Severidad', 'Descripción', 'Entidad', 'Banco', 'Monto',
          'IP', 'Dispositivo', 'Exitoso'
        ]
        const rows = logs.map(l => [
          l.id,
          l.fechaFormateada,
          l.usuario.nombre,
          l.usuario.email,
          l.usuario.rolNombre || '',
          l.accion,
          l.modulo,
          l.severidad,
          `"${l.descripcion.replace(/"/g, '""')}"`,
          l.entidad?.nombre || '',
          l.contextoFinanciero?.bancoNombre || '',
          l.contextoFinanciero?.monto?.toString() || '',
          l.dispositivo.ip,
          l.dispositivo.dispositivo,
          l.exitoso ? 'Sí' : 'No'
        ])

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        return {
          datos: csv,
          nombreArchivo: `audit_log_${fechaExport}.csv`,
          mimeType: 'text/csv'
        }
      }

      case 'excel':
        // En producción usaríamos xlsx o similar
        return this.exportar(filtros, 'csv')

      default:
        throw new Error(`Formato no soportado: ${formato}`)
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtiene información del dispositivo desde el navegador
 */
export function obtenerInfoDispositivo(): ContextoDispositivo {
  if (typeof window === 'undefined') {
    return {
      ip: 'server-side',
      userAgent: 'server-side',
      dispositivo: 'servidor',
      navegador: 'N/A',
      sistemaOperativo: 'N/A'
    }
  }

  const ua = window.navigator.userAgent
  let navegador = 'Desconocido'
  let sistemaOperativo = 'Desconocido'
  let dispositivo = 'Escritorio'

  // Detectar navegador
  if (ua.includes('Chrome')) navegador = 'Chrome'
  else if (ua.includes('Firefox')) navegador = 'Firefox'
  else if (ua.includes('Safari')) navegador = 'Safari'
  else if (ua.includes('Edge')) navegador = 'Edge'

  // Detectar SO
  if (ua.includes('Windows')) sistemaOperativo = 'Windows'
  else if (ua.includes('Mac')) sistemaOperativo = 'macOS'
  else if (ua.includes('Linux')) sistemaOperativo = 'Linux'
  else if (ua.includes('Android')) sistemaOperativo = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) sistemaOperativo = 'iOS'

  // Detectar dispositivo
  if (/Mobile|Android|iPhone|iPad|iPod/.test(ua)) {
    dispositivo = /iPad/.test(ua) ? 'Tablet' : 'Móvil'
  }

  return {
    ip: 'cliente', // Se obtendría del servidor
    userAgent: ua,
    dispositivo,
    navegador,
    sistemaOperativo,
    resolucion: `${window.screen.width}x${window.screen.height}`,
    idioma: window.navigator.language
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const auditService = AuditSupremeService.getInstance()
export default auditService
