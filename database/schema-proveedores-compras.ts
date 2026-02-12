/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💱 CHRONOS INFINITY 2026 — SCHEMA PROVEEDORES Y COMPRAS CASA DE CAMBIO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Schema para gestión de proveedores de divisas y compras:
 * - Proveedores con diferentes métodos de pago
 * - Tipos de cambio por método (transferencia, efectivo, tarjeta, cripto)
 * - Órdenes de compra de divisas
 * - Historial de abastecimiento
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { relations, sql } from 'drizzle-orm'
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { divisas } from './schema-casa-cambio'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PROVEEDORES DE DIVISAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const proveedoresDivisas = sqliteTable(
  'cc_proveedores',
  {
    id: text('id').primaryKey(),

    // Datos básicos
    nombre: text('nombre').notNull(),
    razonSocial: text('razon_social'),
    rfc: text('rfc'),

    // Contacto
    contactoPrincipal: text('contacto_principal'),
    telefono: text('telefono'),
    telefonoAlterno: text('telefono_alterno'),
    email: text('email'),
    whatsapp: text('whatsapp'),

    // Ubicación
    direccion: text('direccion'),
    ciudad: text('ciudad'),
    estado: text('estado_ubicacion'),

    // Divisas que maneja
    divisasDisponibles: text('divisas_disponibles'), // JSON array ['USD', 'EUR', 'USDT']

    // Métodos de pago aceptados
    aceptaTransferencia: integer('acepta_transferencia', { mode: 'boolean' }).default(true),
    aceptaEfectivo: integer('acepta_efectivo', { mode: 'boolean' }).default(true),
    aceptaTarjeta: integer('acepta_tarjeta', { mode: 'boolean' }).default(false),
    aceptaCripto: integer('acepta_cripto', { mode: 'boolean' }).default(false),

    // Datos bancarios para transferencia
    banco: text('banco'),
    clabe: text('clabe'),
    cuentaBancaria: text('cuenta_bancaria'),
    beneficiario: text('beneficiario'),

    // Datos cripto
    walletUsdt: text('wallet_usdt'),
    walletBtc: text('wallet_btc'),
    redPreferida: text('red_preferida'), // 'TRC20', 'ERC20', 'BEP20'

    // Límites y condiciones
    montoMinimoCompra: real('monto_minimo_compra').default(1000),
    montoMaximoCompra: real('monto_maximo_compra').default(100000),
    tiempoEntregaHoras: integer('tiempo_entrega_horas').default(24),

    // Spreads por método de pago (% sobre tipo de cambio)
    spreadTransferencia: real('spread_transferencia').default(0.5),
    spreadEfectivo: real('spread_efectivo').default(0),
    spreadTarjeta: real('spread_tarjeta').default(1.5),
    spreadCripto: real('spread_cripto').default(0.3),

    // Calificación y confianza
    calificacion: real('calificacion').default(5), // 1-5 estrellas
    totalCompras: integer('total_compras').default(0),
    montoTotalComprado: real('monto_total_comprado').default(0),
    esPreferido: integer('es_preferido', { mode: 'boolean' }).default(false),

    // Estado
    estadoProveedor: text('estado_proveedor', {
      enum: ['activo', 'inactivo', 'suspendido', 'verificando'],
    }).default('activo'),

    // Notas
    notas: text('notas'),

    // Auditoría
    creadoPor: text('creado_por'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    nombreIdx: index('cc_prov_nombre_idx').on(table.nombre),
    estadoIdx: index('cc_prov_estado_idx').on(table.estadoProveedor),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS DE CAMBIO POR PROVEEDOR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const tiposCambioProveedor = sqliteTable(
  'cc_tipos_cambio_proveedor',
  {
    id: text('id').primaryKey(),
    proveedorId: text('proveedor_id').notNull().references(() => proveedoresDivisas.id),
    divisa: text('divisa').notNull().references(() => divisas.id),

    // Tipos de cambio por método de pago
    tcTransferencia: real('tc_transferencia'), // Tipo cambio para transferencia
    tcEfectivo: real('tc_efectivo'),           // Tipo cambio para efectivo
    tcTarjeta: real('tc_tarjeta'),             // Tipo cambio para tarjeta negra
    tcCripto: real('tc_cripto'),               // Tipo cambio para cripto

    // Disponibilidad actual
    disponibleTransferencia: real('disponible_transferencia').default(0),
    disponibleEfectivo: real('disponible_efectivo').default(0),
    disponibleCripto: real('disponible_cripto').default(0),

    // Vigencia
    vigenciaHasta: integer('vigencia_hasta', { mode: 'timestamp' }),

    // Estado
    activo: integer('activo', { mode: 'boolean' }).default(true),

    ultimaActualizacion: integer('ultima_actualizacion', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    provDivisaIdx: index('cc_tcp_prov_divisa_idx').on(table.proveedorId, table.divisa),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ÓRDENES DE COMPRA A PROVEEDORES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const ordenesCompraProveedor = sqliteTable(
  'cc_ordenes_compra',
  {
    id: text('id').primaryKey(),
    folio: text('folio').notNull().unique(), // OC-260130-0001

    // Proveedor
    proveedorId: text('proveedor_id').notNull().references(() => proveedoresDivisas.id),
    proveedorNombre: text('proveedor_nombre').notNull(), // Snapshot

    // Divisa y montos
    divisa: text('divisa').notNull().references(() => divisas.id),
    cantidadDivisa: real('cantidad_divisa').notNull(), // Cantidad de divisa a comprar
    tipoCambioAplicado: real('tipo_cambio_aplicado').notNull(),
    montoTotalMxn: real('monto_total_mxn').notNull(), // Total a pagar en MXN

    // Método de pago
    metodoPago: text('metodo_pago', {
      enum: ['transferencia', 'efectivo', 'tarjeta', 'cripto'],
    }).notNull(),

    // Datos de pago según método
    // Para transferencia
    bancoDestino: text('banco_destino'),
    clabeDestino: text('clabe_destino'),
    referenciaTransferencia: text('referencia_transferencia'),

    // Para tarjeta
    ultimosDigitosTarjeta: text('ultimos_digitos_tarjeta'),
    autorizacionTarjeta: text('autorizacion_tarjeta'),

    // Para cripto
    walletDestino: text('wallet_destino'),
    redCripto: text('red_cripto'),
    hashTransaccion: text('hash_transaccion'),

    // Comisiones y costos adicionales
    comisionMetodo: real('comision_metodo').default(0), // Comisión por método de pago
    comisionProveedor: real('comision_proveedor').default(0),
    costoEnvio: real('costo_envio').default(0),
    totalConComisiones: real('total_con_comisiones').notNull(),

    // Estado
    estadoOrden: text('estado_orden', {
      enum: ['cotizacion', 'pendiente_pago', 'pagada', 'en_proceso', 'recibida', 'cancelada', 'rechazada'],
    }).default('cotizacion'),

    // Tracking
    fechaCotizacion: integer('fecha_cotizacion', { mode: 'timestamp' }),
    fechaPago: integer('fecha_pago', { mode: 'timestamp' }),
    fechaRecepcion: integer('fecha_recepcion', { mode: 'timestamp' }),
    fechaCancelacion: integer('fecha_cancelacion', { mode: 'timestamp' }),

    // Recepción
    cantidadRecibida: real('cantidad_recibida'),
    diferenciaRecepcion: real('diferencia_recepcion'),
    recibidoPor: text('recibido_por'),

    // Comprobantes
    comprobanteEnvio: text('comprobante_envio'), // URL o base64
    comprobanteRecepcion: text('comprobante_recepcion'),

    // Notas
    notas: text('notas'),
    motivoCancelacion: text('motivo_cancelacion'),

    // Usuario que creó
    creadoPor: text('creado_por'),
    aprobadoPor: text('aprobado_por'),

    // Auditoría
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    folioIdx: index('cc_oc_folio_idx').on(table.folio),
    proveedorIdx: index('cc_oc_proveedor_idx').on(table.proveedorId),
    estadoIdx: index('cc_oc_estado_idx').on(table.estadoOrden),
    fechaIdx: index('cc_oc_fecha_idx').on(table.createdAt),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HISTORIAL DE PRECIOS POR PROVEEDOR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const historialPreciosProveedor = sqliteTable(
  'cc_historial_precios_proveedor',
  {
    id: text('id').primaryKey(),
    proveedorId: text('proveedor_id').notNull().references(() => proveedoresDivisas.id),
    divisa: text('divisa').notNull(),
    metodoPago: text('metodo_pago').notNull(),
    tipoCambio: real('tipo_cambio').notNull(),
    timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    provTimestampIdx: index('cc_hpp_prov_ts_idx').on(table.proveedorId, table.timestamp),
  })
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const proveedoresDivisasRelations = relations(proveedoresDivisas, ({ many }) => ({
  tiposCambio: many(tiposCambioProveedor),
  ordenesCompra: many(ordenesCompraProveedor),
  historialPrecios: many(historialPreciosProveedor),
}))

export const ordenesCompraProveedorRelations = relations(ordenesCompraProveedor, ({ one }) => ({
  proveedor: one(proveedoresDivisas, {
    fields: [ordenesCompraProveedor.proveedorId],
    references: [proveedoresDivisas.id],
  }),
}))
