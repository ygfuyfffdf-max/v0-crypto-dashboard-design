// ═══════════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — SISTEMA DE PERMISOS GRANULARES
// Schema de permisos avanzado para control total de acceso
// ═══════════════════════════════════════════════════════════════════════════════

import { relations, sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// ═══════════════════════════════════════════════════════════════
// PERMISOS DEL SISTEMA
// ═══════════════════════════════════════════════════════════════
// Define todas las acciones posibles en el sistema

export const permisos = sqliteTable('permisos', {
  id: text('id').primaryKey(),
  codigo: text('codigo').notNull().unique(), // Ej: 'banco.profit.ingreso.crear'
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  modulo: text('modulo', {
    enum: [
      'dashboard',
      'bancos',
      'ventas',
      'clientes',
      'distribuidores',
      'ordenes',
      'inventario',
      'gastos',
      'abonos',
      'transferencias',
      'reportes',
      'cortes',
      'configuracion',
      'usuarios',
    ],
  }).notNull(),
  accion: text('accion', {
    enum: ['ver', 'crear', 'editar', 'eliminar', 'exportar', 'aprobar'],
  }).notNull(),
  recurso: text('recurso'), // Específico: 'profit', 'boveda_monte', etc.
  activo: integer('activo', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

// ═══════════════════════════════════════════════════════════════
// ROLES PERSONALIZADOS
// ═══════════════════════════════════════════════════════════════

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull().unique(),
  descripcion: text('descripcion'),
  color: text('color').default('#8B5CF6'), // Color para UI
  icono: text('icono').default('Shield'), // Icono Lucide
  esAdmin: integer('es_admin', { mode: 'boolean' }).default(false),
  activo: integer('activo', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

// ═══════════════════════════════════════════════════════════════
// RELACIÓN ROLES-PERMISOS
// ═══════════════════════════════════════════════════════════════

export const rolesPermisos = sqliteTable(
  'roles_permisos',
  {
    id: text('id').primaryKey(),
    rolId: text('rol_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permisoId: text('permiso_id')
      .notNull()
      .references(() => permisos.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    rolPermisoIdx: index('rol_permiso_idx').on(table.rolId, table.permisoId),
  })
)

// ═══════════════════════════════════════════════════════════════
// USUARIOS EXTENDIDOS
// ═══════════════════════════════════════════════════════════════

export const usuariosExtendido = sqliteTable(
  'usuarios_extendido',
  {
    id: text('id').primaryKey(),
    usuarioId: text('usuario_id').notNull().unique(),
    rolId: text('rol_id').references(() => roles.id),

    // Restricciones específicas por banco
    bancosPermitidos: text('bancos_permitidos'), // JSON array: ['profit', 'boveda_monte']

    // Restricciones de horario
    horaInicioAcceso: text('hora_inicio_acceso'), // '08:00'
    horaFinAcceso: text('hora_fin_acceso'), // '18:00'
    diasPermitidos: text('dias_permitidos'), // JSON: [1,2,3,4,5] (Lun-Vie)

    // Restricciones de IP/Dispositivo
    ipsPermitidas: text('ips_permitidas'), // JSON array
    dispositivosRegistrados: text('dispositivos_registrados'), // JSON array
    requerirVerificacionDispositivo: integer('requerir_verificacion_dispositivo', { mode: 'boolean' }).default(false),

    // Límites operacionales
    limiteMontoOperacion: integer('limite_monto_operacion'), // Máximo por operación
    limiteDiario: integer('limite_diario'), // Máximo diario
    requiereAprobacion: integer('requiere_aprobacion', { mode: 'boolean' }).default(false),
    montoRequiereAprobacion: integer('monto_requiere_aprobacion'), // Monto desde el cual requiere aprobación

    // Notificaciones
    notificarAcciones: integer('notificar_acciones', { mode: 'boolean' }).default(true),
    emailNotificaciones: text('email_notificaciones'),

    // Estado
    bloqueado: integer('bloqueado', { mode: 'boolean' }).default(false),
    motivoBloqueo: text('motivo_bloqueo'),
    fechaBloqueo: integer('fecha_bloqueo', { mode: 'timestamp' }),

    // Metadata
    ultimoAcceso: integer('ultimo_acceso', { mode: 'timestamp' }),
    ultimaIp: text('ultima_ip'),
    ultimoDispositivo: text('ultimo_dispositivo'),
    intentosFallidos: integer('intentos_fallidos').default(0),

    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    usuarioIdx: index('usuario_extendido_idx').on(table.usuarioId),
    rolIdx: index('usuario_rol_idx').on(table.rolId),
  })
)

// ═══════════════════════════════════════════════════════════════
// PERMISOS ESPECÍFICOS POR USUARIO (Override del rol)
// ═══════════════════════════════════════════════════════════════

export const usuariosPermisos = sqliteTable(
  'usuarios_permisos',
  {
    id: text('id').primaryKey(),
    usuarioId: text('usuario_id').notNull(),
    permisoId: text('permiso_id')
      .notNull()
      .references(() => permisos.id, { onDelete: 'cascade' }),
    concedido: integer('concedido', { mode: 'boolean' }).default(true), // true = otorgado, false = denegado específicamente
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    creadoPor: text('creado_por'),
    motivo: text('motivo'),
  },
  (table) => ({
    usuarioPermisoIdx: index('usuario_permiso_idx').on(table.usuarioId, table.permisoId),
  })
)

// ═══════════════════════════════════════════════════════════════
// HISTORIAL DE AUDITORÍA
// ═══════════════════════════════════════════════════════════════

export const auditoria = sqliteTable(
  'auditoria',
  {
    id: text('id').primaryKey(),
    usuarioId: text('usuario_id').notNull(),
    usuarioNombre: text('usuario_nombre'),

    // Acción
    accion: text('accion', {
      enum: ['crear', 'editar', 'eliminar', 'ver', 'exportar', 'login', 'logout', 'error'],
    }).notNull(),
    modulo: text('modulo').notNull(),
    recurso: text('recurso'), // Tabla/entidad afectada
    recursoId: text('recurso_id'), // ID del registro afectado

    // Detalles
    descripcion: text('descripcion'),
    datosAntes: text('datos_antes'), // JSON: estado anterior
    datosDespues: text('datos_despues'), // JSON: estado después
    cambios: text('cambios'), // JSON: campos cambiados

    // Contexto
    ip: text('ip'),
    userAgent: text('user_agent'),
    dispositivo: text('dispositivo'),
    navegador: text('navegador'),
    sistemaOperativo: text('sistema_operativo'),
    ubicacion: text('ubicacion'), // JSON: { lat, lng, ciudad, pais }

    // Metadata
    duracionMs: integer('duracion_ms'),
    exitoso: integer('exitoso', { mode: 'boolean' }).default(true),
    errorMensaje: text('error_mensaje'),

    fecha: integer('fecha', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    usuarioIdx: index('auditoria_usuario_idx').on(table.usuarioId),
    fechaIdx: index('auditoria_fecha_idx').on(table.fecha),
    moduloIdx: index('auditoria_modulo_idx').on(table.modulo),
    accionIdx: index('auditoria_accion_idx').on(table.accion),
  })
)

// ═══════════════════════════════════════════════════════════════
// SESIONES ACTIVAS
// ═══════════════════════════════════════════════════════════════

export const sesiones = sqliteTable(
  'sesiones',
  {
    id: text('id').primaryKey(),
    usuarioId: text('usuario_id').notNull(),
    token: text('token').notNull().unique(),

    // Información del dispositivo
    ip: text('ip'),
    userAgent: text('user_agent'),
    dispositivo: text('dispositivo'),
    navegador: text('navegador'),
    sistemaOperativo: text('sistema_operativo'),
    ubicacion: text('ubicacion'),

    // Estado
    activa: integer('activa', { mode: 'boolean' }).default(true),
    ultimaActividad: integer('ultima_actividad', { mode: 'timestamp' }).default(sql`(unixepoch())`),

    // Tiempos
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    cerradaAt: integer('cerrada_at', { mode: 'timestamp' }),
    motivoCierre: text('motivo_cierre'),
  },
  (table) => ({
    usuarioIdx: index('sesion_usuario_idx').on(table.usuarioId),
    tokenIdx: index('sesion_token_idx').on(table.token),
    activaIdx: index('sesion_activa_idx').on(table.activa),
  })
)

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const rolesRelations = relations(roles, ({ many }) => ({
  permisos: many(rolesPermisos),
  usuarios: many(usuariosExtendido),
}))

export const permisosRelations = relations(permisos, ({ many }) => ({
  roles: many(rolesPermisos),
  usuarios: many(usuariosPermisos),
}))

export const rolesPermisosRelations = relations(rolesPermisos, ({ one }) => ({
  rol: one(roles, {
    fields: [rolesPermisos.rolId],
    references: [roles.id],
  }),
  permiso: one(permisos, {
    fields: [rolesPermisos.permisoId],
    references: [permisos.id],
  }),
}))

export const usuariosExtendidoRelations = relations(usuariosExtendido, ({ one, many }) => ({
  rol: one(roles, {
    fields: [usuariosExtendido.rolId],
    references: [roles.id],
  }),
  permisosEspecificos: many(usuariosPermisos),
}))

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type Permiso = typeof permisos.$inferSelect
export type NuevoPermiso = typeof permisos.$inferInsert
export type Rol = typeof roles.$inferSelect
export type NuevoRol = typeof roles.$inferInsert
export type UsuarioExtendido = typeof usuariosExtendido.$inferSelect
export type Auditoria = typeof auditoria.$inferSelect
export type Sesion = typeof sesiones.$inferSelect
