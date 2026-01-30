/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📝 CHRONOS INFINITY 2026 — SCHEMA DE AUDITORÍA Y PERMISOS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Tablas para:
 * - audit_log: Registro de todas las operaciones del sistema
 * - roles: Definición de roles personalizados
 * - role_permisos: Permisos granulares por rol
 * - usuario_roles: Asignación de roles a usuarios
 * - notificaciones: Sistema de notificaciones push
 * - aprobaciones_pendientes: Cola de aprobaciones
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { sql } from 'drizzle-orm'
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// AUDIT LOG - Registro de todas las operaciones
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const auditLog = sqliteTable(
  'audit_log',
  {
    id: text('id').primaryKey(),
    
    // Quién realizó la acción
    usuarioId: text('usuario_id').notNull(),
    usuarioNombre: text('usuario_nombre').notNull(),
    usuarioEmail: text('usuario_email'),
    rolId: text('rol_id'),
    
    // Qué se hizo
    accion: text('accion', {
      enum: ['crear', 'editar', 'eliminar', 'ver', 'exportar', 'login', 'logout', 'aprobar', 'rechazar', 'transferir', 'ingreso', 'gasto']
    }).notNull(),
    
    modulo: text('modulo', {
      enum: ['bancos', 'ventas', 'clientes', 'distribuidores', 'almacen', 'ordenes', 'reportes', 'configuracion', 'usuarios', 'roles', 'sistema']
    }).notNull(),
    
    // Entidad afectada
    entidadTipo: text('entidad_tipo'), // 'movimiento', 'venta', 'cliente', etc.
    entidadId: text('entidad_id'),
    entidadNombre: text('entidad_nombre'),
    
    // Detalles del cambio
    descripcion: text('descripcion').notNull(),
    datosAnteriores: text('datos_anteriores'), // JSON stringified
    datosNuevos: text('datos_nuevos'), // JSON stringified
    camposModificados: text('campos_modificados'), // JSON array de campos
    
    // Contexto bancario (si aplica)
    bancoId: text('banco_id'),
    bancoNombre: text('banco_nombre'),
    monto: real('monto'),
    
    // Contexto técnico
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    dispositivo: text('dispositivo'),
    navegador: text('navegador'),
    sistemaOperativo: text('sistema_operativo'),
    ubicacion: text('ubicacion'),
    
    // Resultado de la operación
    exitoso: integer('exitoso', { mode: 'boolean' }).default(true),
    mensajeError: text('mensaje_error'),
    
    // Metadata
    duracionMs: integer('duracion_ms'),
    metadata: text('metadata'), // JSON adicional
    
    // Timestamps
    timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    fechaFormateada: text('fecha_formateada'),
  },
  (table) => ({
    usuarioIdx: index('audit_usuario_idx').on(table.usuarioId),
    accionIdx: index('audit_accion_idx').on(table.accion),
    moduloIdx: index('audit_modulo_idx').on(table.modulo),
    timestampIdx: index('audit_timestamp_idx').on(table.timestamp),
    bancoIdx: index('audit_banco_idx').on(table.bancoId),
    entidadIdx: index('audit_entidad_idx').on(table.entidadTipo, table.entidadId),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ROLES - Definición de roles personalizados
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const roles = sqliteTable(
  'roles',
  {
    id: text('id').primaryKey(),
    codigo: text('codigo').notNull().unique(),
    nombre: text('nombre').notNull(),
    descripcion: text('descripcion'),
    color: text('color').default('#8B5CF6'),
    icono: text('icono').default('shield'),
    
    // Tipo de rol
    esAdmin: integer('es_admin', { mode: 'boolean' }).default(false),
    esSistema: integer('es_sistema', { mode: 'boolean' }).default(false), // Roles no editables
    prioridad: integer('prioridad').default(50),
    
    // Estado
    activo: integer('activo', { mode: 'boolean' }).default(true),
    
    // Auditoría
    creadoPor: text('creado_por'),
    modificadoPor: text('modificado_por'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    codigoIdx: index('rol_codigo_idx').on(table.codigo),
    activoIdx: index('rol_activo_idx').on(table.activo),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ROLE PERMISOS - Permisos granulares por rol
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const rolePermisos = sqliteTable(
  'role_permisos',
  {
    id: text('id').primaryKey(),
    rolId: text('rol_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
    
    // Permiso
    modulo: text('modulo', {
      enum: ['bancos', 'ventas', 'clientes', 'distribuidores', 'almacen', 'ordenes', 'reportes', 'configuracion', 'usuarios', 'auditoria']
    }).notNull(),
    
    accion: text('accion', {
      enum: ['ver', 'crear', 'editar', 'eliminar', 'exportar', 'aprobar', 'ingreso', 'gasto', 'transferir', 'ajuste', 'corte']
    }).notNull(),
    
    activo: integer('activo', { mode: 'boolean' }).default(true),
    
    // Restricciones (JSON)
    bancosPermitidos: text('bancos_permitidos'), // JSON array de IDs
    categoriasPermitidas: text('categorias_permitidas'), // JSON array
    clientesPermitidos: text('clientes_permitidos'), // JSON array de IDs
    distribuidoresPermitidos: text('distribuidores_permitidos'), // JSON array de IDs
    
    // Límites
    montoMinimo: real('monto_minimo'),
    montoMaximo: real('monto_maximo'),
    limiteDiario: real('limite_diario'),
    limiteTransaccion: real('limite_transaccion'),
    
    // Restricciones de tiempo
    horaInicio: text('hora_inicio'), // "08:00"
    horaFin: text('hora_fin'), // "20:00"
    diasPermitidos: text('dias_permitidos'), // JSON array [1,2,3,4,5]
    
    // Aprobaciones
    requiereAprobacion: integer('requiere_aprobacion', { mode: 'boolean' }).default(false),
    aprobadorRolId: text('aprobador_rol_id'),
    montoRequiereAprobacion: real('monto_requiere_aprobacion'),
    
    // Requisitos
    motivoRequerido: integer('motivo_requerido', { mode: 'boolean' }).default(false),
    referenciaRequerida: integer('referencia_requerida', { mode: 'boolean' }).default(false),
    
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    rolIdx: index('permiso_rol_idx').on(table.rolId),
    moduloAccionIdx: index('permiso_modulo_accion_idx').on(table.modulo, table.accion),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// USUARIO ROLES - Asignación de roles a usuarios
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const usuarioRoles = sqliteTable(
  'usuario_roles',
  {
    id: text('id').primaryKey(),
    usuarioId: text('usuario_id').notNull(),
    rolId: text('rol_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
    
    // Restricciones adicionales del usuario (override de rol)
    bancosPermitidos: text('bancos_permitidos'), // JSON override
    limiteGlobalDiario: real('limite_global_diario'),
    limiteGlobalTransaccion: real('limite_global_transaccion'),
    horaInicioAcceso: text('hora_inicio_acceso'),
    horaFinAcceso: text('hora_fin_acceso'),
    diasPermitidos: text('dias_permitidos'),
    
    // Control
    requiereAprobacionGlobal: integer('requiere_aprobacion_global', { mode: 'boolean' }).default(false),
    
    // Estado
    activo: integer('activo', { mode: 'boolean' }).default(true),
    
    asignadoPor: text('asignado_por'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    usuarioIdx: index('usuario_rol_usuario_idx').on(table.usuarioId),
    rolIdx: index('usuario_rol_rol_idx').on(table.rolId),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NOTIFICACIONES - Sistema de alertas y notificaciones
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const notificaciones = sqliteTable(
  'notificaciones',
  {
    id: text('id').primaryKey(),
    
    // Destinatario
    usuarioId: text('usuario_id').notNull(),
    rolId: text('rol_id'), // Para notificar a un rol completo
    
    // Contenido
    tipo: text('tipo', {
      enum: ['info', 'warning', 'error', 'success', 'aprobacion', 'alerta', 'sistema']
    }).notNull(),
    
    titulo: text('titulo').notNull(),
    mensaje: text('mensaje').notNull(),
    icono: text('icono'),
    color: text('color'),
    
    // Enlace/Acción
    actionUrl: text('action_url'),
    actionLabel: text('action_label'),
    
    // Contexto
    modulo: text('modulo'),
    entidadTipo: text('entidad_tipo'),
    entidadId: text('entidad_id'),
    
    // Prioridad
    prioridad: text('prioridad', { enum: ['baja', 'normal', 'alta', 'urgente'] }).default('normal'),
    
    // Estado
    leida: integer('leida', { mode: 'boolean' }).default(false),
    leidaAt: integer('leida_at', { mode: 'timestamp' }),
    descartada: integer('descartada', { mode: 'boolean' }).default(false),
    
    // Expiración
    expiraAt: integer('expira_at', { mode: 'timestamp' }),
    
    // Metadata
    metadata: text('metadata'), // JSON adicional
    
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    usuarioIdx: index('notif_usuario_idx').on(table.usuarioId),
    tipoIdx: index('notif_tipo_idx').on(table.tipo),
    leidaIdx: index('notif_leida_idx').on(table.leida),
    prioridadIdx: index('notif_prioridad_idx').on(table.prioridad),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// APROBACIONES PENDIENTES - Cola de operaciones que requieren aprobación
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const aprobacionesPendientes = sqliteTable(
  'aprobaciones_pendientes',
  {
    id: text('id').primaryKey(),
    
    // Solicitante
    solicitanteId: text('solicitante_id').notNull(),
    solicitanteNombre: text('solicitante_nombre').notNull(),
    
    // Aprobador requerido
    aprobadorRolId: text('aprobador_rol_id'),
    aprobadorUsuarioId: text('aprobador_usuario_id'),
    
    // Operación
    modulo: text('modulo').notNull(),
    accion: text('accion').notNull(),
    
    // Entidad
    entidadTipo: text('entidad_tipo').notNull(),
    entidadId: text('entidad_id'),
    
    // Datos de la operación
    datosOperacion: text('datos_operacion').notNull(), // JSON
    
    // Contexto bancario
    bancoId: text('banco_id'),
    bancoNombre: text('banco_nombre'),
    monto: real('monto'),
    
    // Justificación
    motivo: text('motivo'),
    observaciones: text('observaciones'),
    
    // Estado
    estado: text('estado', {
      enum: ['pendiente', 'aprobada', 'rechazada', 'expirada', 'cancelada']
    }).default('pendiente'),
    
    // Resolución
    resueltoPor: text('resuelto_por'),
    resueltoNombre: text('resuelto_nombre'),
    fechaResolucion: integer('fecha_resolucion', { mode: 'timestamp' }),
    motivoRechazo: text('motivo_rechazo'),
    
    // Expiración
    expiraAt: integer('expira_at', { mode: 'timestamp' }),
    
    // Metadata
    metadata: text('metadata'),
    
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    solicitanteIdx: index('aprob_solicitante_idx').on(table.solicitanteId),
    estadoIdx: index('aprob_estado_idx').on(table.estado),
    moduloIdx: index('aprob_modulo_idx').on(table.modulo),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SESIONES - Control de sesiones activas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const sesiones = sqliteTable(
  'sesiones',
  {
    id: text('id').primaryKey(),
    usuarioId: text('usuario_id').notNull(),
    
    // Token
    token: text('token').notNull().unique(),
    
    // Dispositivo
    dispositivo: text('dispositivo'),
    navegador: text('navegador'),
    sistemaOperativo: text('sistema_operativo'),
    ipAddress: text('ip_address'),
    ubicacion: text('ubicacion'),
    
    // Estado
    activa: integer('activa', { mode: 'boolean' }).default(true),
    
    // Timestamps
    ultimaActividad: integer('ultima_actividad', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    expiraAt: integer('expira_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    usuarioIdx: index('sesion_usuario_idx').on(table.usuarioId),
    tokenIdx: index('sesion_token_idx').on(table.token),
    activaIdx: index('sesion_activa_idx').on(table.activa),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACION SISTEMA - Ajustes globales
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const configuracionSistema = sqliteTable(
  'configuracion_sistema',
  {
    id: text('id').primaryKey(),
    clave: text('clave').notNull().unique(),
    valor: text('valor').notNull(),
    tipo: text('tipo', { enum: ['string', 'number', 'boolean', 'json'] }).default('string'),
    descripcion: text('descripcion'),
    modulo: text('modulo'),
    esPublico: integer('es_publico', { mode: 'boolean' }).default(false),
    modificadoPor: text('modificado_por'),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    claveIdx: index('config_clave_idx').on(table.clave),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type AuditLog = typeof auditLog.$inferSelect
export type NewAuditLog = typeof auditLog.$inferInsert
export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert
export type RolePermiso = typeof rolePermisos.$inferSelect
export type NewRolePermiso = typeof rolePermisos.$inferInsert
export type UsuarioRol = typeof usuarioRoles.$inferSelect
export type NewUsuarioRol = typeof usuarioRoles.$inferInsert
export type Notificacion = typeof notificaciones.$inferSelect
export type NewNotificacion = typeof notificaciones.$inferInsert
export type AprobacionPendiente = typeof aprobacionesPendientes.$inferSelect
export type NewAprobacionPendiente = typeof aprobacionesPendientes.$inferInsert
export type Sesion = typeof sesiones.$inferSelect
export type NewSesion = typeof sesiones.$inferInsert
