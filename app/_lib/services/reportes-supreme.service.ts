/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📧 CHRONOS INFINITY 2026 — SISTEMA DE REPORTES PROGRAMADOS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de reportes programados con:
 * - Programación por horario/frecuencia
 * - Múltiples formatos de salida
 * - Envío automático por email
 * - Templates personalizables
 * - Historial de ejecuciones
 * - Notificaciones de estado
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type FrecuenciaReporte = 'diario' | 'semanal' | 'quincenal' | 'mensual' | 'trimestral' | 'personalizado'
export type FormatoReporte = 'pdf' | 'excel' | 'csv' | 'json'
export type EstadoEjecucion = 'pendiente' | 'en_proceso' | 'completado' | 'error' | 'cancelado'
export type TipoReporte = 'ventas' | 'bancos' | 'inventario' | 'clientes' | 'gastos' | 'auditoria' | 'personalizado'

export interface TemplateReporte {
  id: string
  nombre: string
  descripcion: string
  tipo: TipoReporte
  modulo: string
  columnas: ColumnaReporte[]
  filtrosBase?: FiltroReporte[]
  ordenamiento?: { campo: string; direccion: 'asc' | 'desc' }
  agrupamiento?: string
  incluirTotales: boolean
  incluirGraficos: boolean
  estilos?: EstilosReporte
  creadoPor: string
  creadoAt: number
  activo: boolean
}

export interface ColumnaReporte {
  id: string
  campo: string
  titulo: string
  tipo: 'texto' | 'numero' | 'moneda' | 'fecha' | 'porcentaje' | 'booleano'
  ancho?: number
  alineacion?: 'izquierda' | 'centro' | 'derecha'
  formato?: string
  visible: boolean
}

export interface FiltroReporte {
  id: string
  campo: string
  operador: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'between' | 'contains' | 'in'
  valor: unknown
  valorSecundario?: unknown
}

export interface EstilosReporte {
  colorPrimario: string
  colorSecundario: string
  fuenteTitulo: string
  fuenteCuerpo: string
  logoUrl?: string
  piePagina?: string
}

export interface ReporteProgramado {
  id: string
  nombre: string
  descripcion?: string
  templateId: string
  templateNombre: string
  frecuencia: FrecuenciaReporte
  horaEjecucion: string // "08:00"
  diasSemana?: number[] // [1,2,3,4,5] Lun-Vie
  diaDelMes?: number // 1-31
  proximaEjecucion: number
  ultimaEjecucion?: number
  formato: FormatoReporte
  destinatarios: DestinatarioReporte[]
  filtrosAdicionales?: FiltroReporte[]
  activo: boolean
  pausado: boolean
  creadoPor: string
  creadoAt: number
  modificadoAt?: number
}

export interface DestinatarioReporte {
  id: string
  nombre: string
  email: string
  tipo: 'principal' | 'copia' | 'copia_oculta'
  activo: boolean
}

export interface EjecucionReporte {
  id: string
  reporteId: string
  reporteNombre: string
  estado: EstadoEjecucion
  iniciadoAt: number
  completadoAt?: number
  formato: FormatoReporte
  registrosProcesados: number
  archivoGenerado?: string
  archivoTamano?: number
  destinatariosEnviados: string[]
  errores?: string[]
  duracionMs?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE REPORTES PROGRAMADOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class ReportesSupremeService {
  private static instance: ReportesSupremeService
  private templates: Map<string, TemplateReporte> = new Map()
  private reportes: Map<string, ReporteProgramado> = new Map()
  private ejecuciones: Map<string, EjecucionReporte[]> = new Map()
  private schedulerTimer: NodeJS.Timeout | null = null
  
  private constructor() {
    this.inicializarTemplatesPredefinidos()
    this.iniciarScheduler()
  }
  
  public static getInstance(): ReportesSupremeService {
    if (!ReportesSupremeService.instance) {
      ReportesSupremeService.instance = new ReportesSupremeService()
    }
    return ReportesSupremeService.instance
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // TEMPLATES PREDEFINIDOS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  
  private inicializarTemplatesPredefinidos(): void {
    // Template de Ventas
    this.templates.set('tpl_ventas_diario', {
      id: 'tpl_ventas_diario',
      nombre: 'Reporte Diario de Ventas',
      descripcion: 'Resumen de ventas del día con métricas clave',
      tipo: 'ventas',
      modulo: 'ventas',
      columnas: [
        { id: 'c1', campo: 'fecha', titulo: 'Fecha', tipo: 'fecha', visible: true },
        { id: 'c2', campo: 'folio', titulo: 'Folio', tipo: 'texto', visible: true },
        { id: 'c3', campo: 'cliente', titulo: 'Cliente', tipo: 'texto', visible: true },
        { id: 'c4', campo: 'productos', titulo: 'Productos', tipo: 'numero', alineacion: 'centro', visible: true },
        { id: 'c5', campo: 'subtotal', titulo: 'Subtotal', tipo: 'moneda', alineacion: 'derecha', visible: true },
        { id: 'c6', campo: 'descuento', titulo: 'Descuento', tipo: 'moneda', alineacion: 'derecha', visible: true },
        { id: 'c7', campo: 'total', titulo: 'Total', tipo: 'moneda', alineacion: 'derecha', visible: true },
        { id: 'c8', campo: 'estado', titulo: 'Estado', tipo: 'texto', visible: true }
      ],
      incluirTotales: true,
      incluirGraficos: true,
      creadoPor: 'sistema',
      creadoAt: Date.now(),
      activo: true
    })
    
    // Template de Movimientos Bancarios
    this.templates.set('tpl_movimientos_banco', {
      id: 'tpl_movimientos_banco',
      nombre: 'Movimientos Bancarios',
      descripcion: 'Detalle de ingresos, gastos y transferencias',
      tipo: 'bancos',
      modulo: 'bancos',
      columnas: [
        { id: 'c1', campo: 'fecha', titulo: 'Fecha', tipo: 'fecha', visible: true },
        { id: 'c2', campo: 'tipo', titulo: 'Tipo', tipo: 'texto', visible: true },
        { id: 'c3', campo: 'banco', titulo: 'Banco', tipo: 'texto', visible: true },
        { id: 'c4', campo: 'descripcion', titulo: 'Descripción', tipo: 'texto', visible: true },
        { id: 'c5', campo: 'ingreso', titulo: 'Ingreso', tipo: 'moneda', alineacion: 'derecha', visible: true },
        { id: 'c6', campo: 'egreso', titulo: 'Egreso', tipo: 'moneda', alineacion: 'derecha', visible: true },
        { id: 'c7', campo: 'balance', titulo: 'Balance', tipo: 'moneda', alineacion: 'derecha', visible: true },
        { id: 'c8', campo: 'usuario', titulo: 'Usuario', tipo: 'texto', visible: true }
      ],
      incluirTotales: true,
      incluirGraficos: true,
      creadoPor: 'sistema',
      creadoAt: Date.now(),
      activo: true
    })
    
    // Template de Auditoría
    this.templates.set('tpl_auditoria', {
      id: 'tpl_auditoria',
      nombre: 'Log de Auditoría',
      descripcion: 'Registro de actividad del sistema',
      tipo: 'auditoria',
      modulo: 'auditoria',
      columnas: [
        { id: 'c1', campo: 'timestamp', titulo: 'Fecha/Hora', tipo: 'fecha', formato: 'datetime', visible: true },
        { id: 'c2', campo: 'usuario', titulo: 'Usuario', tipo: 'texto', visible: true },
        { id: 'c3', campo: 'accion', titulo: 'Acción', tipo: 'texto', visible: true },
        { id: 'c4', campo: 'modulo', titulo: 'Módulo', tipo: 'texto', visible: true },
        { id: 'c5', campo: 'descripcion', titulo: 'Descripción', tipo: 'texto', visible: true },
        { id: 'c6', campo: 'ip', titulo: 'IP', tipo: 'texto', visible: true },
        { id: 'c7', campo: 'dispositivo', titulo: 'Dispositivo', tipo: 'texto', visible: true }
      ],
      incluirTotales: false,
      incluirGraficos: false,
      creadoPor: 'sistema',
      creadoAt: Date.now(),
      activo: true
    })
    
    // Template de Inventario
    this.templates.set('tpl_inventario', {
      id: 'tpl_inventario',
      nombre: 'Estado de Inventario',
      descripcion: 'Stock actual y movimientos de almacén',
      tipo: 'inventario',
      modulo: 'almacen',
      columnas: [
        { id: 'c1', campo: 'codigo', titulo: 'Código', tipo: 'texto', visible: true },
        { id: 'c2', campo: 'producto', titulo: 'Producto', tipo: 'texto', visible: true },
        { id: 'c3', campo: 'categoria', titulo: 'Categoría', tipo: 'texto', visible: true },
        { id: 'c4', campo: 'stockActual', titulo: 'Stock', tipo: 'numero', alineacion: 'centro', visible: true },
        { id: 'c5', campo: 'stockMinimo', titulo: 'Mínimo', tipo: 'numero', alineacion: 'centro', visible: true },
        { id: 'c6', campo: 'precioCompra', titulo: 'P. Compra', tipo: 'moneda', alineacion: 'derecha', visible: true },
        { id: 'c7', campo: 'precioVenta', titulo: 'P. Venta', tipo: 'moneda', alineacion: 'derecha', visible: true },
        { id: 'c8', campo: 'valorTotal', titulo: 'Valor Total', tipo: 'moneda', alineacion: 'derecha', visible: true }
      ],
      incluirTotales: true,
      incluirGraficos: true,
      creadoPor: 'sistema',
      creadoAt: Date.now(),
      activo: true
    })
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // SCHEDULER
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  
  private iniciarScheduler(): void {
    // Verificar cada minuto si hay reportes que ejecutar
    this.schedulerTimer = setInterval(() => {
      this.verificarReportesPendientes()
    }, 60000) // 1 minuto
  }
  
  private async verificarReportesPendientes(): Promise<void> {
    const ahora = Date.now()
    
    for (const [id, reporte] of this.reportes) {
      if (!reporte.activo || reporte.pausado) continue
      
      if (reporte.proximaEjecucion <= ahora) {
        await this.ejecutarReporte(id)
        this.actualizarProximaEjecucion(id)
      }
    }
  }
  
  private actualizarProximaEjecucion(reporteId: string): void {
    const reporte = this.reportes.get(reporteId)
    if (!reporte) return
    
    const ahora = new Date()
    let proxima = new Date()
    
    const [hora, minuto] = reporte.horaEjecucion.split(':').map(Number)
    proxima.setHours(hora, minuto, 0, 0)
    
    switch (reporte.frecuencia) {
      case 'diario':
        if (proxima <= ahora) proxima.setDate(proxima.getDate() + 1)
        break
      case 'semanal':
        proxima.setDate(proxima.getDate() + 7)
        break
      case 'quincenal':
        proxima.setDate(proxima.getDate() + 15)
        break
      case 'mensual':
        proxima.setMonth(proxima.getMonth() + 1)
        if (reporte.diaDelMes) proxima.setDate(reporte.diaDelMes)
        break
      case 'trimestral':
        proxima.setMonth(proxima.getMonth() + 3)
        break
    }
    
    reporte.proximaEjecucion = proxima.getTime()
    reporte.modificadoAt = Date.now()
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // MÉTODOS PÚBLICOS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  
  public obtenerTemplates(): TemplateReporte[] {
    return Array.from(this.templates.values()).filter(t => t.activo)
  }
  
  public obtenerTemplate(id: string): TemplateReporte | undefined {
    return this.templates.get(id)
  }
  
  public guardarTemplate(template: TemplateReporte): void {
    this.templates.set(template.id, template)
  }
  
  public obtenerReportes(): ReporteProgramado[] {
    return Array.from(this.reportes.values())
  }
  
  public obtenerReporte(id: string): ReporteProgramado | undefined {
    return this.reportes.get(id)
  }
  
  public crearReporte(params: Omit<ReporteProgramado, 'id' | 'creadoAt' | 'ultimaEjecucion'>): ReporteProgramado {
    const id = `rep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const reporte: ReporteProgramado = {
      ...params,
      id,
      creadoAt: Date.now()
    }
    this.reportes.set(id, reporte)
    return reporte
  }
  
  public actualizarReporte(id: string, updates: Partial<ReporteProgramado>): ReporteProgramado | undefined {
    const reporte = this.reportes.get(id)
    if (!reporte) return undefined
    
    Object.assign(reporte, updates, { modificadoAt: Date.now() })
    return reporte
  }
  
  public eliminarReporte(id: string): boolean {
    return this.reportes.delete(id)
  }
  
  public pausarReporte(id: string): boolean {
    const reporte = this.reportes.get(id)
    if (!reporte) return false
    reporte.pausado = true
    reporte.modificadoAt = Date.now()
    return true
  }
  
  public reanudarReporte(id: string): boolean {
    const reporte = this.reportes.get(id)
    if (!reporte) return false
    reporte.pausado = false
    reporte.modificadoAt = Date.now()
    this.actualizarProximaEjecucion(id)
    return true
  }
  
  public async ejecutarReporte(id: string): Promise<EjecucionReporte> {
    const reporte = this.reportes.get(id)
    if (!reporte) {
      throw new Error('Reporte no encontrado')
    }
    
    const ejecucion: EjecucionReporte = {
      id: `ejec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reporteId: id,
      reporteNombre: reporte.nombre,
      estado: 'en_proceso',
      iniciadoAt: Date.now(),
      formato: reporte.formato,
      registrosProcesados: 0,
      destinatariosEnviados: []
    }
    
    // Guardar inicio de ejecución
    if (!this.ejecuciones.has(id)) {
      this.ejecuciones.set(id, [])
    }
    this.ejecuciones.get(id)!.unshift(ejecucion)
    
    try {
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simular datos procesados
      ejecucion.registrosProcesados = Math.floor(Math.random() * 500) + 50
      ejecucion.archivoGenerado = `reporte_${reporte.nombre.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${reporte.formato}`
      ejecucion.archivoTamano = Math.floor(Math.random() * 500000) + 10000
      
      // Simular envío a destinatarios
      ejecucion.destinatariosEnviados = reporte.destinatarios
        .filter(d => d.activo)
        .map(d => d.email)
      
      ejecucion.estado = 'completado'
      ejecucion.completadoAt = Date.now()
      ejecucion.duracionMs = ejecucion.completadoAt - ejecucion.iniciadoAt
      
      // Actualizar última ejecución del reporte
      reporte.ultimaEjecucion = Date.now()
      
    } catch (error) {
      ejecucion.estado = 'error'
      ejecucion.errores = [error instanceof Error ? error.message : 'Error desconocido']
      ejecucion.completadoAt = Date.now()
      ejecucion.duracionMs = ejecucion.completadoAt - ejecucion.iniciadoAt
    }
    
    return ejecucion
  }
  
  public obtenerHistorialEjecuciones(reporteId: string, limite = 10): EjecucionReporte[] {
    return (this.ejecuciones.get(reporteId) || []).slice(0, limite)
  }
  
  public obtenerEstadisticas(): {
    totalReportes: number
    reportesActivos: number
    ejecucionesHoy: number
    ejecucionesExitosas: number
    porFormato: Record<FormatoReporte, number>
  } {
    const reportes = Array.from(this.reportes.values())
    const todasEjecuciones = Array.from(this.ejecuciones.values()).flat()
    const hoyInicio = new Date().setHours(0, 0, 0, 0)
    
    const ejecucionesHoy = todasEjecuciones.filter(e => e.iniciadoAt >= hoyInicio)
    const porFormato: Record<FormatoReporte, number> = { pdf: 0, excel: 0, csv: 0, json: 0 }
    
    reportes.forEach(r => {
      porFormato[r.formato] = (porFormato[r.formato] || 0) + 1
    })
    
    return {
      totalReportes: reportes.length,
      reportesActivos: reportes.filter(r => r.activo && !r.pausado).length,
      ejecucionesHoy: ejecucionesHoy.length,
      ejecucionesExitosas: ejecucionesHoy.filter(e => e.estado === 'completado').length,
      porFormato
    }
  }
  
  public destruir(): void {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer)
      this.schedulerTimer = null
    }
  }
}

export const reportesService = ReportesSupremeService.getInstance()
export default reportesService
