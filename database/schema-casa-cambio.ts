/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💱 CHRONOS INFINITY 2026 — SCHEMA CASA DE CAMBIO "PROFIT"
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Schema completo para sistema de casa de cambio:
 * - Tipos de cambio en tiempo real
 * - Operaciones de compra/venta de divisas
 * - Sistema de caja con denominaciones
 * - Clientes con KYC
 * - Reportes regulatorios (CNBV)
 * - Análisis de ganancias por spread
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { relations, sql } from 'drizzle-orm'
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// ═══════════════════════════════════════════════════════════════════════════════
// DIVISAS SOPORTADAS
// ═══════════════════════════════════════════════════════════════════════════════

export const divisas = sqliteTable('cc_divisas', {
  id: text('id').primaryKey(), // 'USD', 'EUR', 'MXN', 'USDT', etc.
  nombre: text('nombre').notNull(),
  simbolo: text('simbolo').notNull(), // '$', '€', '₿'
  bandera: text('bandera'), // Emoji de bandera
  decimales: integer('decimales').default(2),
  esCripto: integer('es_cripto', { mode: 'boolean' }).default(false),
  activa: integer('activa', { mode: 'boolean' }).default(true),
  orden: integer('orden').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS DE CAMBIO
// ═══════════════════════════════════════════════════════════════════════════════

export const tiposCambio = sqliteTable(
  'cc_tipos_cambio',
  {
    id: text('id').primaryKey(),
    divisaOrigen: text('divisa_origen').notNull().references(() => divisas.id),
    divisaDestino: text('divisa_destino').notNull().references(() => divisas.id),

    // Precios
    precioCompra: real('precio_compra').notNull(), // Lo que pagamos al cliente
    precioVenta: real('precio_venta').notNull(), // Lo que cobramos al cliente
    precioMercado: real('precio_mercado'), // Referencia del mercado

    // Spread y comisiones
    spreadCompra: real('spread_compra').default(0), // % ganancia en compra
    spreadVenta: real('spread_venta').default(0), // % ganancia en venta
    comisionFija: real('comision_fija').default(0),

    // Límites
    montoMinimoOperacion: real('monto_minimo_operacion').default(1),
    montoMaximoOperacion: real('monto_maximo_operacion').default(100000),
    montoMaximoDiarioCliente: real('monto_maximo_diario_cliente').default(50000),

    // Estado
    activo: integer('activo', { mode: 'boolean' }).default(true),
    requiereIdentificacion: integer('requiere_identificacion', { mode: 'boolean' }).default(false),
    montoRequiereId: real('monto_requiere_id').default(3000), // Monto desde el cual se requiere ID

    // Auditoría
    ultimaActualizacion: integer('ultima_actualizacion', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    actualizadoPor: text('actualizado_por'),
    fuentePrecio: text('fuente_precio'), // 'manual', 'api_banxico', 'api_forex', etc.

    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    parIdx: index('tc_par_idx').on(table.divisaOrigen, table.divisaDestino),
    activoIdx: index('tc_activo_idx').on(table.activo),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════
// HISTORIAL DE TIPOS DE CAMBIO
// ═══════════════════════════════════════════════════════════════════════════════

export const historialTiposCambio = sqliteTable(
  'cc_historial_tipos_cambio',
  {
    id: text('id').primaryKey(),
    tipoCambioId: text('tipo_cambio_id').notNull().references(() => tiposCambio.id),
    precioCompra: real('precio_compra').notNull(),
    precioVenta: real('precio_venta').notNull(),
    precioMercado: real('precio_mercado'),
    timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    tcIdIdx: index('htc_tc_id_idx').on(table.tipoCambioId),
    timestampIdx: index('htc_timestamp_idx').on(table.timestamp),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENTES CASA DE CAMBIO (KYC)
// ═══════════════════════════════════════════════════════════════════════════════

export const clientesCasaCambio = sqliteTable(
  'cc_clientes',
  {
    id: text('id').primaryKey(),

    // Datos personales
    nombre: text('nombre').notNull(),
    apellidoPaterno: text('apellido_paterno').notNull(),
    apellidoMaterno: text('apellido_materno'),
    nombreCompleto: text('nombre_completo').notNull(), // Generado

    // Identificación
    tipoIdentificacion: text('tipo_identificacion', {
      enum: ['ine', 'pasaporte', 'licencia', 'cedula_profesional', 'fm2', 'fm3'],
    }),
    numeroIdentificacion: text('numero_identificacion'),
    vigenciaIdentificacion: text('vigencia_identificacion'), // Fecha de vencimiento
    imagenIdentificacionFrente: text('imagen_identificacion_frente'), // URL
    imagenIdentificacionReverso: text('imagen_identificacion_reverso'), // URL

    // Datos fiscales (opcional)
    rfc: text('rfc'),
    curp: text('curp'),

    // Contacto
    telefono: text('telefono'),
    email: text('email'),

    // Dirección
    direccion: text('direccion'),
    codigoPostal: text('codigo_postal'),
    ciudad: text('ciudad'),
    estado: text('estado'),
    pais: text('pais').default('México'),

    // Nacionalidad
    nacionalidad: text('nacionalidad').default('Mexicana'),
    paisNacimiento: text('pais_nacimiento'),

    // Ocupación/Actividad económica
    ocupacion: text('ocupacion'),
    actividadEconomica: text('actividad_economica'),
    origenRecursos: text('origen_recursos'),

    // Métricas de operación
    totalOperaciones: integer('total_operaciones').default(0),
    montoTotalOperado: real('monto_total_operado').default(0),
    ultimaOperacion: integer('ultima_operacion', { mode: 'timestamp' }),
    operacionesHoy: integer('operaciones_hoy').default(0),
    montoOperadoHoy: real('monto_operado_hoy').default(0),

    // Límites personalizados
    limiteOperacionPersonalizado: real('limite_operacion_personalizado'),
    limiteDiarioPersonalizado: real('limite_diario_personalizado'),

    // KYC Status
    nivelKyc: text('nivel_kyc', {
      enum: ['basico', 'intermedio', 'completo'],
    }).default('basico'),
    kycVerificado: integer('kyc_verificado', { mode: 'boolean' }).default(false),
    fechaVerificacionKyc: integer('fecha_verificacion_kyc', { mode: 'timestamp' }),
    verificadoPor: text('verificado_por'),

    // PEP (Persona Expuesta Políticamente)
    esPep: integer('es_pep', { mode: 'boolean' }).default(false),
    detallePep: text('detalle_pep'),

    // Estado
    estado: text('estado', {
      enum: ['activo', 'inactivo', 'bloqueado', 'pendiente_verificacion'],
    }).default('activo'),
    motivoBloqueo: text('motivo_bloqueo'),

    // Notas
    notas: text('notas'),
    alertas: text('alertas'), // JSON array de alertas

    // Auditoría
    creadoPor: text('creado_por'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    nombreIdx: index('cc_cliente_nombre_idx').on(table.nombreCompleto),
    estadoIdx: index('cc_cliente_estado_idx').on(table.estado),
    rfcIdx: index('cc_cliente_rfc_idx').on(table.rfc),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════
// OPERACIONES DE CAMBIO
// ═══════════════════════════════════════════════════════════════════════════════

export const operacionesCambio = sqliteTable(
  'cc_operaciones',
  {
    id: text('id').primaryKey(),
    folio: text('folio').notNull().unique(), // Folio único para ticket

    // Tipo de operación
    tipoOperacion: text('tipo_operacion', {
      enum: ['compra', 'venta'], // Desde perspectiva de la casa de cambio
    }).notNull(),

    // Cliente
    clienteId: text('cliente_id').references(() => clientesCasaCambio.id),
    clienteNombre: text('cliente_nombre'), // Snapshot para operaciones sin registro
    clienteTelefono: text('cliente_telefono'),
    esClienteRegistrado: integer('es_cliente_registrado', { mode: 'boolean' }).default(false),

    // Divisas
    divisaOrigen: text('divisa_origen').notNull().references(() => divisas.id),
    divisaDestino: text('divisa_destino').notNull().references(() => divisas.id),
    tipoCambioId: text('tipo_cambio_id').references(() => tiposCambio.id),

    // Montos
    montoOrigen: real('monto_origen').notNull(), // Lo que entrega el cliente
    montoDestino: real('monto_destino').notNull(), // Lo que recibe el cliente
    tipoCambioAplicado: real('tipo_cambio_aplicado').notNull(), // TC al momento

    // Comisiones
    comision: real('comision').default(0),
    spreadAplicado: real('spread_aplicado').default(0),

    // Ganancia de la operación
    gananciaBruta: real('ganancia_bruta').default(0),
    gananciaNeta: real('ganancia_neta').default(0),

    // Denominaciones recibidas/entregadas
    denominacionesRecibidas: text('denominaciones_recibidas'), // JSON
    denominacionesEntregadas: text('denominaciones_entregadas'), // JSON

    // Identificación (si aplica)
    requirioIdentificacion: integer('requirio_identificacion', { mode: 'boolean' }).default(false),
    tipoIdentificacionUsada: text('tipo_identificacion_usada'),
    numeroIdentificacionUsada: text('numero_identificacion_usada'),

    // Estado
    estado: text('estado', {
      enum: ['pendiente', 'completada', 'cancelada', 'reversada'],
    }).default('completada'),
    motivoCancelacion: text('motivo_cancelacion'),

    // Caja
    cajaId: text('caja_id').references(() => cajas.id),
    cajeroId: text('cajero_id'),
    cajeroNombre: text('cajero_nombre'),

    // Timestamps
    fecha: text('fecha').notNull(), // YYYY-MM-DD
    hora: text('hora').notNull(), // HH:MM:SS

    // Comprobante
    comprobanteGenerado: integer('comprobante_generado', { mode: 'boolean' }).default(false),
    urlComprobante: text('url_comprobante'),

    // Notas
    notas: text('notas'),

    // Auditoría
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    folioIdx: index('cc_op_folio_idx').on(table.folio),
    fechaIdx: index('cc_op_fecha_idx').on(table.fecha),
    clienteIdx: index('cc_op_cliente_idx').on(table.clienteId),
    estadoIdx: index('cc_op_estado_idx').on(table.estado),
    cajaIdx: index('cc_op_caja_idx').on(table.cajaId),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════
// CAJAS
// ═══════════════════════════════════════════════════════════════════════════════

export const cajas = sqliteTable(
  'cc_cajas',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(), // 'Caja 1', 'Caja Principal'

    // Estado
    estado: text('estado', {
      enum: ['abierta', 'cerrada', 'arqueo'],
    }).default('cerrada'),

    // Cajero actual
    cajeroActualId: text('cajero_actual_id'),
    cajeroActualNombre: text('cajero_actual_nombre'),

    // Apertura
    fechaApertura: integer('fecha_apertura', { mode: 'timestamp' }),
    montoApertura: real('monto_apertura').default(0),
    fondoFijo: real('fondo_fijo').default(5000), // Fondo fijo de caja

    // Saldos actuales por divisa (JSON)
    saldosPorDivisa: text('saldos_por_divisa'), // { "MXN": 50000, "USD": 2000, ... }

    // Totales del turno
    totalIngresos: real('total_ingresos').default(0),
    totalEgresos: real('total_egresos').default(0),
    totalOperaciones: integer('total_operaciones').default(0),
    gananciasTurno: real('ganancias_turno').default(0),

    // Límites
    alertaMontoMinimo: real('alerta_monto_minimo').default(1000),
    alertaMontoMaximo: real('alerta_monto_maximo').default(100000),

    // Auditoría
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    estadoIdx: index('cc_caja_estado_idx').on(table.estado),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════
// CORTES DE CAJA
// ═══════════════════════════════════════════════════════════════════════════════

export const cortesCaja = sqliteTable(
  'cc_cortes_caja',
  {
    id: text('id').primaryKey(),
    folio: text('folio').notNull().unique(),
    cajaId: text('caja_id').notNull().references(() => cajas.id),

    // Tipo de corte
    tipoCorte: text('tipo_corte', {
      enum: ['parcial', 'final', 'arqueo'],
    }).notNull(),

    // Cajero
    cajeroId: text('cajero_id').notNull(),
    cajeroNombre: text('cajero_nombre').notNull(),
    supervisorId: text('supervisor_id'),
    supervisorNombre: text('supervisor_nombre'),

    // Período
    fechaInicio: integer('fecha_inicio', { mode: 'timestamp' }).notNull(),
    fechaFin: integer('fecha_fin', { mode: 'timestamp' }).notNull(),

    // Montos esperados vs contados (por divisa)
    montosEsperados: text('montos_esperados').notNull(), // JSON { "MXN": 50000, "USD": 2000 }
    montosContados: text('montos_contados').notNull(), // JSON
    diferencias: text('diferencias'), // JSON { "MXN": -100, "USD": 0 }

    // Denominaciones contadas (detalle)
    denominacionesContadas: text('denominaciones_contadas'), // JSON detallado

    // Resumen financiero
    totalOperaciones: integer('total_operaciones').default(0),
    totalCompras: real('total_compras').default(0),
    totalVentas: real('total_ventas').default(0),
    gananciasOperaciones: real('ganancias_operaciones').default(0),
    comisionesTotales: real('comisiones_totales').default(0),

    // Diferencia total en MXN
    diferenciaTotalMxn: real('diferencia_total_mxn').default(0),

    // Estado
    estado: text('estado', {
      enum: ['pendiente', 'aprobado', 'con_diferencia', 'rechazado'],
    }).default('pendiente'),
    observaciones: text('observaciones'),
    justificacionDiferencia: text('justificacion_diferencia'),

    // Timestamps
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    folioIdx: index('cc_corte_folio_idx').on(table.folio),
    cajaIdx: index('cc_corte_caja_idx').on(table.cajaId),
    fechaIdx: index('cc_corte_fecha_idx').on(table.fechaFin),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════
// MOVIMIENTOS DE CAJA
// ═══════════════════════════════════════════════════════════════════════════════

export const movimientosCaja = sqliteTable(
  'cc_movimientos_caja',
  {
    id: text('id').primaryKey(),
    cajaId: text('caja_id').notNull().references(() => cajas.id),

    // Tipo
    tipo: text('tipo', {
      enum: ['entrada', 'salida', 'ajuste', 'transferencia'],
    }).notNull(),

    // Divisa y monto
    divisa: text('divisa').notNull().references(() => divisas.id),
    monto: real('monto').notNull(),

    // Referencia
    operacionId: text('operacion_id').references(() => operacionesCambio.id),
    concepto: text('concepto').notNull(),

    // Saldos
    saldoAnterior: real('saldo_anterior').default(0),
    saldoNuevo: real('saldo_nuevo').default(0),

    // Auditoría
    realizadoPor: text('realizado_por'),
    autorizadoPor: text('autorizado_por'),
    timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    cajaIdx: index('cc_mov_caja_idx').on(table.cajaId),
    tipoIdx: index('cc_mov_tipo_idx').on(table.tipo),
    timestampIdx: index('cc_mov_timestamp_idx').on(table.timestamp),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════
// DENOMINACIONES (Para control de efectivo)
// ═══════════════════════════════════════════════════════════════════════════════

export const denominaciones = sqliteTable('cc_denominaciones', {
  id: text('id').primaryKey(),
  divisa: text('divisa').notNull().references(() => divisas.id),
  valor: real('valor').notNull(), // 1000, 500, 200, 100, 50, 20
  tipo: text('tipo', { enum: ['billete', 'moneda'] }).notNull(),
  imagen: text('imagen'), // URL de imagen del billete/moneda
  activa: integer('activa', { mode: 'boolean' }).default(true),
  orden: integer('orden').default(0),
})

// ═══════════════════════════════════════════════════════════════════════════════
// ALERTAS Y NOTIFICACIONES
// ═══════════════════════════════════════════════════════════════════════════════

export const alertasCasaCambio = sqliteTable(
  'cc_alertas',
  {
    id: text('id').primaryKey(),

    tipo: text('tipo', {
      enum: [
        'operacion_grande',
        'cliente_frecuente',
        'tipo_cambio_volatil',
        'saldo_bajo',
        'saldo_alto',
        'operacion_sospechosa',
        'cliente_bloqueado',
        'kyc_pendiente',
      ],
    }).notNull(),

    severidad: text('severidad', {
      enum: ['info', 'warning', 'critical'],
    }).default('info'),

    titulo: text('titulo').notNull(),
    descripcion: text('descripcion').notNull(),

    // Referencias
    clienteId: text('cliente_id').references(() => clientesCasaCambio.id),
    operacionId: text('operacion_id').references(() => operacionesCambio.id),
    cajaId: text('caja_id').references(() => cajas.id),

    // Estado
    atendida: integer('atendida', { mode: 'boolean' }).default(false),
    atendidaPor: text('atendida_por'),
    fechaAtencion: integer('fecha_atencion', { mode: 'timestamp' }),
    accionTomada: text('accion_tomada'),

    // Metadata
    metadata: text('metadata'), // JSON adicional

    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    tipoIdx: index('cc_alerta_tipo_idx').on(table.tipo),
    atendidaIdx: index('cc_alerta_atendida_idx').on(table.atendida),
    fechaIdx: index('cc_alerta_fecha_idx').on(table.createdAt),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN CASA DE CAMBIO
// ═══════════════════════════════════════════════════════════════════════════════

export const configuracionCasaCambio = sqliteTable('cc_configuracion', {
  id: text('id').primaryKey(),
  clave: text('clave').notNull().unique(),
  valor: text('valor').notNull(),
  tipo: text('tipo', {
    enum: ['string', 'number', 'boolean', 'json'],
  }).default('string'),
  descripcion: text('descripcion'),
  categoria: text('categoria'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

// ═══════════════════════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════════════════════

export const divisasRelations = relations(divisas, ({ many }) => ({
  tiposCambioOrigen: many(tiposCambio, { relationName: 'divisaOrigen' }),
  tiposCambioDestino: many(tiposCambio, { relationName: 'divisaDestino' }),
}))

export const tiposCambioRelations = relations(tiposCambio, ({ one, many }) => ({
  divisaOrigenRef: one(divisas, {
    fields: [tiposCambio.divisaOrigen],
    references: [divisas.id],
    relationName: 'divisaOrigen',
  }),
  divisaDestinoRef: one(divisas, {
    fields: [tiposCambio.divisaDestino],
    references: [divisas.id],
    relationName: 'divisaDestino',
  }),
  historial: many(historialTiposCambio),
  operaciones: many(operacionesCambio),
}))

export const clientesCasaCambioRelations = relations(clientesCasaCambio, ({ many }) => ({
  operaciones: many(operacionesCambio),
  alertas: many(alertasCasaCambio),
}))

export const operacionesCambioRelations = relations(operacionesCambio, ({ one }) => ({
  cliente: one(clientesCasaCambio, {
    fields: [operacionesCambio.clienteId],
    references: [clientesCasaCambio.id],
  }),
  tipoCambio: one(tiposCambio, {
    fields: [operacionesCambio.tipoCambioId],
    references: [tiposCambio.id],
  }),
  caja: one(cajas, {
    fields: [operacionesCambio.cajaId],
    references: [cajas.id],
  }),
}))

export const cajasRelations = relations(cajas, ({ many }) => ({
  operaciones: many(operacionesCambio),
  cortes: many(cortesCaja),
  movimientos: many(movimientosCaja),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════════════════════

export type Divisa = typeof divisas.$inferSelect
export type NuevaDivisa = typeof divisas.$inferInsert
export type TipoCambio = typeof tiposCambio.$inferSelect
export type NuevoTipoCambio = typeof tiposCambio.$inferInsert
export type ClienteCasaCambio = typeof clientesCasaCambio.$inferSelect
export type NuevoClienteCasaCambio = typeof clientesCasaCambio.$inferInsert
export type OperacionCambio = typeof operacionesCambio.$inferSelect
export type NuevaOperacionCambio = typeof operacionesCambio.$inferInsert
export type Caja = typeof cajas.$inferSelect
export type CorteCaja = typeof cortesCaja.$inferSelect
export type MovimientoCaja = typeof movimientosCaja.$inferSelect
export type Denominacion = typeof denominaciones.$inferSelect
export type AlertaCasaCambio = typeof alertasCasaCambio.$inferSelect
