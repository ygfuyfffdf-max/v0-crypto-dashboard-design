// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎯 CHRONOS INFINITY 2026 — SERVICIOS SUPREMOS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Exportaciones centralizadas de todos los servicios:
 * - AuditSupremeService: Auditoría y logging
 * - NotificacionesSupremeService: Notificaciones push
 * - ExportSupremeService: Exportación multi-formato
 * - GranularPermissionsService: Permisos granulares
 * - WorkflowSupremeService: Workflows y aprobaciones
 * - ReportesSupremeService: Reportes programados
 * - FiltrosSupremeService: Filtros guardados
 * - TemasSupremeService: Temas personalizables
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE AUDITORÍA
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export {
  auditService,
  default as AuditSupremeService,
  obtenerInfoDispositivo,
  type AccionAudit,
  type ModuloAudit,
  type SeveridadAudit,
  type ContextoDispositivo,
  type CambioAudit,
  type EntradaAudit,
  type FiltrosAudit,
  type EstadisticasAudit,
  type AlertaAudit
} from './audit-supreme.service'

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE NOTIFICACIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export {
  notificacionesService,
  default as NotificacionesSupremeService,
  type TipoNotificacion,
  type PrioridadNotificacion,
  type CategoriaNotificacion,
  type AccionNotificacion,
  type Notificacion,
  type PreferenciasNotificacion,
  type EstadisticasNotificaciones
} from './notifications-supreme.service'

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export {
  exportService,
  default as ExportSupremeService,
  type FormatoExport,
  type ConfiguracionExport,
  type ColumnDefinition,
  type ExportResult,
  type HistorialExport,
  type TemplateExport
} from './export-supreme.service'

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE PERMISOS GRANULARES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export {
  verificarPermisoGranular,
  crearRolConPermisos,
  obtenerPermisosEfectivos,
  auditorModificacion,
  type ModuloSistema,
  type AccionModulo,
  type BancoId,
  type CategoriaTransaccion,
  type PermisoGranular,
  type RolGranular,
  type UsuarioGranular,
  type SolicitudPermiso,
  type ResultadoVerificacion
} from './granular-permissions'

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE WORKFLOWS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export {
  workflowService,
  default as WorkflowSupremeService,
  type EstadoWorkflow,
  type TipoWorkflow,
  type CondicionWorkflow,
  type NivelAprobacion,
  type AprobadorNivel,
  type DefinicionWorkflow,
  type InstanciaWorkflow,
  type AprobacionPendiente,
  type AccionWorkflow
} from './workflow-supreme.service'

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE REPORTES PROGRAMADOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export {
  reportesService,
  default as ReportesSupremeService,
  type FrecuenciaReporte,
  type FormatoReporte,
  type EstadoEjecucion,
  type TipoReporte,
  type TemplateReporte,
  type ColumnaReporte,
  type FiltroReporte,
  type ReporteProgramado,
  type DestinatarioReporte,
  type EjecucionReporte
} from './reportes-supreme.service'

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE FILTROS GUARDADOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export {
  filtrosService,
  default as FiltrosSupremeService,
  type TipoFiltro,
  type OperadorFiltro,
  type CondicionFiltro,
  type FiltroGuardado,
  type ConfiguracionCampoFiltro
} from './filtros-supreme.service'

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE TEMAS PERSONALIZABLES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export {
  temasService,
  default as TemasSupremeService,
  type ModoTema,
  type DensidadUI,
  type EsquemaColor,
  type EstiloCards,
  type AnimacionNivel,
  type PaletaColores,
  type ConfiguracionTema
} from './temas-supreme.service'
