// database/schema.ts
// ═══════════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 - Schema de Base de Datos
// Implementación completa con trazabilidad de lotes y distribución GYA
// ═══════════════════════════════════════════════════════════════════════════════
import { relations, sql } from 'drizzle-orm'
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// ═══════════════════════════════════════════════════════════════
// USUARIOS
// ═══════════════════════════════════════════════════════════════

export const usuarios = sqliteTable(
  'usuarios',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    nombre: text('nombre').notNull(),
    role: text('role', { enum: ['admin', 'operator', 'viewer'] }).default('viewer'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    emailIdx: index('email_idx').on(table.email),
  }),
)

// ═══════════════════════════════════════════════════════════════
// CLIENTES (MÉTRICAS COMPLETAS)
// ═══════════════════════════════════════════════════════════════
// Campos: id, nombre, descripción, deudaTotal, historialVentas
// deudaTotal = suma (precioTotalVenta - abonos) de todas sus ventas
// Incluye scoring de crédito, categorización y métricas de comportamiento
// ═══════════════════════════════════════════════════════════════

export const clientes = sqliteTable(
  'clientes',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    email: text('email'),
    telefono: text('telefono'),
    direccion: text('direccion'),
    rfc: text('rfc'),

    // ═══════════════════════════════════════════════════════════════
    // HISTORIAL DE COMPRAS
    // ═══════════════════════════════════════════════════════════════
    totalCompras: real('total_compras').default(0), // Suma histórica de ventas
    numeroVentas: integer('numero_ventas').default(0), // Cantidad de transacciones
    promedioCompra: real('promedio_compra').default(0), // totalCompras / numeroVentas
    ultimaCompra: integer('ultima_compra', { mode: 'timestamp' }),
    diasSinComprar: integer('dias_sin_comprar').default(0),

    // ═══════════════════════════════════════════════════════════════
    // PAGOS Y ABONOS
    // ═══════════════════════════════════════════════════════════════
    totalPagado: real('total_pagado').default(0), // Suma de todos los pagos
    totalAbonos: real('total_abonos').default(0), // Cantidad de abonos
    numeroAbonos: integer('numero_abonos').default(0), // Número de pagos realizados
    promedioAbono: real('promedio_abono').default(0), // totalPagado / numeroAbonos

    // ═══════════════════════════════════════════════════════════════
    // DEUDAS
    // ═══════════════════════════════════════════════════════════════
    saldoPendiente: real('saldo_pendiente').default(0), // Deuda actual
    deudaMaximaHistorica: real('deuda_maxima_historica').default(0),
    ventasPendientes: integer('ventas_pendientes').default(0), // Ventas sin pagar

    // ═══════════════════════════════════════════════════════════════
    // CRÉDITO
    // ═══════════════════════════════════════════════════════════════
    limiteCredito: real('limite_credito').default(0),
    creditoDisponible: real('credito_disponible').default(0), // limite - deuda
    porcentajeUtilizacion: real('porcentaje_utilizacion').default(0), // (deuda/limite) × 100

    // ═══════════════════════════════════════════════════════════════
    // COMPORTAMIENTO DE PAGO
    // ═══════════════════════════════════════════════════════════════
    porcentajePagoPuntual: real('porcentaje_pago_puntual').default(0), // % pagos < 30 días
    diasPromedioCredito: real('dias_promedio_credito').default(0),
    frecuenciaCompra: real('frecuencia_compra').default(0), // Compras/mes

    // ═══════════════════════════════════════════════════════════════
    // RENTABILIDAD
    // ═══════════════════════════════════════════════════════════════
    gananciaGenerada: real('ganancia_generada').default(0), // Utilidades de sus compras
    ticketPromedio: real('ticket_promedio').default(0),
    valorVidaCliente: real('valor_vida_cliente').default(0), // LTV

    // ═══════════════════════════════════════════════════════════════
    // SCORING Y CATEGORIZACIÓN
    // ═══════════════════════════════════════════════════════════════
    scoreCredito: integer('score_credito').default(50), // 0-100
    scoreFrecuencia: integer('score_frecuencia').default(50),
    scoreRentabilidad: integer('score_rentabilidad').default(50),
    scoreTotal: integer('score_total').default(50),

    categoria: text('categoria', {
      enum: ['VIP', 'frecuente', 'ocasional', 'nuevo', 'inactivo', 'moroso'],
    }).default('nuevo'),

    // ═══════════════════════════════════════════════════════════════
    // ESTADO Y AUDITORÍA
    // ═══════════════════════════════════════════════════════════════
    estado: text('estado', { enum: ['activo', 'inactivo', 'suspendido'] }).default('activo'),
    alertas: text('alertas'), // JSON: Array de alertas
    notas: text('notas'),

    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    nombreIdx: index('cliente_nombre_idx').on(table.nombre),
    estadoIdx: index('cliente_estado_idx').on(table.estado),
    categoriaIdx: index('cliente_categoria_idx').on(table.categoria),
    scoreIdx: index('cliente_score_idx').on(table.scoreTotal),
  }),
)

// ═══════════════════════════════════════════════════════════════
// DISTRIBUIDORES (MÉTRICAS COMPLETAS)
// ═══════════════════════════════════════════════════════════════
// Campos: id, nombre, descripción, adeudoTotal, historialOC
// adeudoTotal = suma deudas pendientes de todas sus OC
// Incluye métricas de stock, rentabilidad y categorización
// ═══════════════════════════════════════════════════════════════

export const distribuidores = sqliteTable(
  'distribuidores',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    empresa: text('empresa'),
    telefono: text('telefono'),
    email: text('email'),
    direccion: text('direccion'),
    tipoProductos: text('tipo_productos'),

    // ═══════════════════════════════════════════════════════════════
    // HISTORIAL DE ÓRDENES
    // ═══════════════════════════════════════════════════════════════
    totalOrdenesCompra: real('total_ordenes_compra').default(0), // Suma histórica OC
    numeroOrdenes: integer('numero_ordenes').default(0), // Cantidad de OC
    promedioOrden: real('promedio_orden').default(0), // totalOC / numeroOrdenes
    ultimaOrden: integer('ultima_orden', { mode: 'timestamp' }),
    diasSinOrdenar: integer('dias_sin_ordenar').default(0),

    // ═══════════════════════════════════════════════════════════════
    // PAGOS
    // ═══════════════════════════════════════════════════════════════
    totalPagado: real('total_pagado').default(0),
    numeroPagos: integer('numero_pagos').default(0),
    promedioPago: real('promedio_pago').default(0),
    porcentajePagadoPromedio: real('porcentaje_pagado_promedio').default(0), // % promedio pagado por OC

    // ═══════════════════════════════════════════════════════════════
    // DEUDAS
    // ═══════════════════════════════════════════════════════════════
    saldoPendiente: real('saldo_pendiente').default(0), // Deuda actual
    deudaMaximaHistorica: real('deuda_maxima_historica').default(0),
    ordenesConDeuda: integer('ordenes_con_deuda').default(0),
    diasPromedioCredito: real('dias_promedio_credito').default(0), // Días promedio para pagar

    // ═══════════════════════════════════════════════════════════════
    // STOCK
    // ═══════════════════════════════════════════════════════════════
    stockTotal: integer('stock_total').default(0), // Stock actual de sus OC
    stockVendido: integer('stock_vendido').default(0), // Total vendido
    porcentajeStockVendido: real('porcentaje_stock_vendido').default(0),

    // ═══════════════════════════════════════════════════════════════
    // ROTACIÓN Y VELOCIDAD
    // ═══════════════════════════════════════════════════════════════
    rotacionPromedio: real('rotacion_promedio').default(0), // Promedio rotacionDias por OC
    velocidadVentaPromedio: real('velocidad_venta_promedio').default(0), // Piezas/día promedio
    eficienciaRotacion: text('eficiencia_rotacion', {
      enum: ['excelente', 'buena', 'normal', 'lenta', 'muy_lenta'],
    }).default('normal'),

    // ═══════════════════════════════════════════════════════════════
    // RENTABILIDAD
    // ═══════════════════════════════════════════════════════════════
    ventasGeneradas: real('ventas_generadas').default(0), // Total vendido de sus productos
    gananciaGenerada: real('ganancia_generada').default(0), // Utilidades de sus productos
    margenPromedio: real('margen_promedio').default(0),
    roiPromedio: real('roi_promedio').default(0), // ROI promedio por OC
    gananciaNetaPromedio: real('ganancia_neta_promedio').default(0), // Ganancia neta promedio por OC

    // ═══════════════════════════════════════════════════════════════
    // SCORING Y CATEGORIZACIÓN
    // ═══════════════════════════════════════════════════════════════
    scoreCalidad: integer('score_calidad').default(50), // 0-100
    scorePrecio: integer('score_precio').default(50),
    scoreRelacion: integer('score_relacion').default(50),
    scoreRotacion: integer('score_rotacion').default(50), // 0-100 (mejor rotación = mayor score)
    scoreTotal: integer('score_total').default(50),

    categoria: text('categoria', {
      enum: ['estrategico', 'preferido', 'normal', 'ocasional', 'nuevo'],
    }).default('nuevo'),

    // ═══════════════════════════════════════════════════════════════
    // ESTADO Y AUDITORÍA
    // ═══════════════════════════════════════════════════════════════
    estado: text('estado', { enum: ['activo', 'inactivo'] }).default('activo'),
    confiabilidad: real('confiabilidad').default(0), // 0-100
    tiempoPromedioEntrega: real('tiempo_promedio_entrega'), // Días
    alertas: text('alertas'), // JSON: Array de alertas
    notas: text('notas'),

    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    nombreIdx: index('distribuidor_nombre_idx').on(table.nombre),
    categoriaIdx: index('distribuidor_categoria_idx').on(table.categoria),
    scoreIdx: index('distribuidor_score_idx').on(table.scoreTotal),
    rotacionIdx: index('distribuidor_rotacion_idx').on(table.eficienciaRotacion),
  }),
)

// ═══════════════════════════════════════════════════════════════
// BANCOS (7 bancos sagrados) - MÉTRICAS COMPLETAS
// ═══════════════════════════════════════════════════════════════
// historicoMonto = suma completa de distribución sagrada (inmutable)
// capitalDisponible = proporción × historicoMonto
// Incluye métricas de flujo, tendencias y análisis
// ═══════════════════════════════════════════════════════════════

export const bancos = sqliteTable(
  'bancos',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    tipo: text('tipo', {
      enum: ['operativo', 'inversion', 'ahorro', 'ganancia', 'flete'],
    }).notNull(),

    // ═══════════════════════════════════════════════════════════════
    // CAPITAL - dinámico
    // ═══════════════════════════════════════════════════════════════
    capitalActual: real('capital_actual').default(0).notNull(),
    capitalMinimo: real('capital_minimo').default(0), // Alerta si baja de aquí
    capitalMaximo: real('capital_maximo').default(0), // Objetivo de ahorro

    // ═══════════════════════════════════════════════════════════════
    // HISTÓRICO INMUTABLE - Siempre suma, nunca resta
    // ═══════════════════════════════════════════════════════════════
    historicoIngresos: real('historico_ingresos').default(0).notNull(),
    historicoGastos: real('historico_gastos').default(0).notNull(),
    historicoTransferenciasEntrada: real('historico_transferencias_entrada').default(0),
    historicoTransferenciasSalida: real('historico_transferencias_salida').default(0),

    // ═══════════════════════════════════════════════════════════════
    // FLUJO DIARIO
    // ═══════════════════════════════════════════════════════════════
    ingresosHoy: real('ingresos_hoy').default(0),
    gastosHoy: real('gastos_hoy').default(0),
    flujoNetoHoy: real('flujo_neto_hoy').default(0), // ingresosHoy - gastosHoy
    movimientosHoy: integer('movimientos_hoy').default(0),

    // ═══════════════════════════════════════════════════════════════
    // FLUJO SEMANAL
    // ═══════════════════════════════════════════════════════════════
    ingresosSemana: real('ingresos_semana').default(0),
    gastosSemana: real('gastos_semana').default(0),
    flujoNetoSemana: real('flujo_neto_semana').default(0),
    movimientosSemana: integer('movimientos_semana').default(0),

    // ═══════════════════════════════════════════════════════════════
    // FLUJO MENSUAL
    // ═══════════════════════════════════════════════════════════════
    ingresosMes: real('ingresos_mes').default(0),
    gastosMes: real('gastos_mes').default(0),
    flujoNetoMes: real('flujo_neto_mes').default(0),
    movimientosMes: integer('movimientos_mes').default(0),
    promedioIngresosDiario: real('promedio_ingresos_diario').default(0),
    promedioGastosDiario: real('promedio_gastos_diario').default(0),

    // ═══════════════════════════════════════════════════════════════
    // ORIGEN DE INGRESOS (%)
    // ═══════════════════════════════════════════════════════════════
    porcentajeVentas: real('porcentaje_ventas').default(0), // % ingresos de ventas
    porcentajeTransferencias: real('porcentaje_transferencias').default(0), // % de transferencias
    porcentajeManual: real('porcentaje_manual').default(0), // % ingresos manuales
    porcentajeDistribucionGYA: real('porcentaje_distribucion_gya').default(0), // % de GYA

    // ═══════════════════════════════════════════════════════════════
    // TENDENCIAS
    // ═══════════════════════════════════════════════════════════════
    tendenciaCapital: text('tendencia_capital', {
      enum: ['subiendo', 'estable', 'bajando'],
    }).default('estable'),
    tendenciaFlujo: text('tendencia_flujo', {
      enum: ['positivo', 'neutro', 'negativo'],
    }).default('neutro'),
    variacionMesAnterior: real('variacion_mes_anterior').default(0), // % cambio vs mes pasado
    variacionSemanaAnterior: real('variacion_semana_anterior').default(0),

    // ═══════════════════════════════════════════════════════════════
    // PROYECCIONES
    // ═══════════════════════════════════════════════════════════════
    proyeccionFinMes: real('proyeccion_fin_mes').default(0),
    diasHastaAgotamiento: integer('dias_hasta_agotamiento'), // null si positivo
    proyeccionTresMeses: real('proyeccion_tres_meses').default(0),

    // ═══════════════════════════════════════════════════════════════
    // SCORING Y SALUD
    // ═══════════════════════════════════════════════════════════════
    scoreLiquidez: integer('score_liquidez').default(50), // 0-100
    scoreFlujo: integer('score_flujo').default(50), // 0-100
    scoreEstabilidad: integer('score_estabilidad').default(50), // 0-100
    scoreTotal: integer('score_total').default(50),

    estadoSalud: text('estado_salud', {
      enum: ['excelente', 'bueno', 'regular', 'critico'],
    }).default('bueno'),

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURACIÓN Y VISUAL
    // ═══════════════════════════════════════════════════════════════
    color: text('color').notNull(),
    icono: text('icono'),
    orden: integer('orden').default(0),
    activo: integer('activo', { mode: 'boolean' }).default(true),
    alertas: text('alertas'), // JSON: Array de alertas
    notas: text('notas'),

    // ═══════════════════════════════════════════════════════════════
    // AUDITORÍA
    // ═══════════════════════════════════════════════════════════════
    ultimoMovimiento: integer('ultimo_movimiento', { mode: 'timestamp' }),
    ultimaActualizacionFlujo: integer('ultima_actualizacion_flujo', { mode: 'timestamp' }),
    ultimaActualizacionMetricas: text('ultima_actualizacion_metricas'), // ISO timestamp
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    tipoIdx: index('banco_tipo_idx').on(table.tipo),
    estadoIdx: index('banco_estado_idx').on(table.estadoSalud),
    scoreIdx: index('banco_score_idx').on(table.scoreTotal),
  }),
)

// ═══════════════════════════════════════════════════════════════
// VENTAS - ENTIDAD PRINCIPAL (MÉTRICAS COMPLETAS)
// ═══════════════════════════════════════════════════════════════
// precioTotalVenta = precioVentaUnidad × cantidad
// estadoPago: completo/parcial/pendiente
// origenLotes: trazabilidad de OCs de donde vino el producto
// Incluye métricas de rentabilidad, crédito y distribución GYA
// ═══════════════════════════════════════════════════════════════

export const ventas = sqliteTable(
  'ventas',
  {
    id: text('id').primaryKey(),
    clienteId: text('cliente_id')
      .notNull()
      .references(() => clientes.id),
    productoId: text('producto_id').references(() => almacen.id), // Producto vendido
    ocId: text('oc_id').references(() => ordenesCompra.id), // Orden de compra origen
    fecha: integer('fecha', { mode: 'timestamp' }).notNull(),

    // Estado general de la venta
    estado: text('estado', {
      enum: ['activa', 'pagada', 'cancelada', 'devuelta'],
    }).default('activa'),

    // ═══════════════════════════════════════════════════════════════
    // CANTIDADES Y PRECIOS UNITARIOS
    // ═══════════════════════════════════════════════════════════════
    cantidad: integer('cantidad').notNull(),
    precioVentaUnidad: real('precio_venta_unidad').notNull(), // Precio al cliente por unidad
    precioCompraUnidad: real('precio_compra_unidad').notNull(), // Costo del distribuidor
    precioFlete: real('precio_flete').default(0), // Flete por unidad
    precioFleteUnidad: real('precio_flete_unidad').default(0), // Alias para precioFlete

    // ═══════════════════════════════════════════════════════════════
    // TOTALES CALCULADOS
    // ═══════════════════════════════════════════════════════════════
    precioTotalVenta: real('precio_total_venta').notNull(), // precioVentaUnidad × cantidad
    costoTotal: real('costo_total').default(0), // precioCompraUnidad × cantidad
    fleteTotal: real('flete_total').default(0), // precioFlete × cantidad

    // ═══════════════════════════════════════════════════════════════
    // ESTADO DE PAGO
    // ═══════════════════════════════════════════════════════════════
    montoPagado: real('monto_pagado').default(0), // Suma de todos los abonos
    montoRestante: real('monto_restante').notNull(), // precioTotalVenta - montoPagado
    porcentajePagado: real('porcentaje_pagado').default(0), // (montoPagado/total) × 100
    estadoPago: text('estado_pago', {
      enum: ['pendiente', 'parcial', 'completo'],
    }).default('pendiente'),

    // Historial de pagos
    numeroAbonos: integer('numero_abonos').default(0), // Cantidad de abonos realizados
    fechaPrimerAbono: integer('fecha_primer_abono', { mode: 'timestamp' }),
    fechaUltimoAbono: integer('fecha_ultimo_abono', { mode: 'timestamp' }),
    fechaPagoCompleto: integer('fecha_pago_completo', { mode: 'timestamp' }),

    // ═══════════════════════════════════════════════════════════════
    // DISTRIBUCIÓN GYA - Histórico inmutable (siempre 100%)
    // ═══════════════════════════════════════════════════════════════
    montoBovedaMonte: real('monto_boveda_monte').default(0), // precioCompra × cantidad
    montoFletes: real('monto_fletes').default(0), // flete × cantidad
    montoUtilidades: real('monto_utilidades').default(0), // (venta - compra - flete) × cantidad

    // Capital efectivamente distribuido (proporcional al pago)
    capitalBovedaMonte: real('capital_boveda_monte').default(0),
    capitalFletes: real('capital_fletes').default(0),
    capitalUtilidades: real('capital_utilidades').default(0),

    // ═══════════════════════════════════════════════════════════════
    // RENTABILIDAD
    // ═══════════════════════════════════════════════════════════════
    gananciaTotal: real('ganancia_total').default(0), // totalVenta - costoTotal - fleteTotal
    gananciaNetaVenta: real('ganancia_neta_venta').default(0), // Alias para gananciaTotal
    margenBruto: real('margen_bruto').default(0), // (ganancia/totalVenta) × 100
    margenNeto: real('margen_neto').default(0), // Alias para margenBruto
    margenSobreCosto: real('margen_sobre_costo').default(0), // (ganancia/costoTotal) × 100
    gananciaPorUnidad: real('ganancia_por_unidad').default(0),

    // ═══════════════════════════════════════════════════════════════
    // CRÉDITO Y COBRANZA
    // ═══════════════════════════════════════════════════════════════
    diasDeCredito: integer('dias_de_credito').default(0), // Días desde venta
    diasParaPago: integer('dias_para_pago'), // Días hasta pago completo
    esMoroso: integer('es_moroso', { mode: 'boolean' }).default(false), // > 30 días
    fechaVencimiento: integer('fecha_vencimiento', { mode: 'timestamp' }), // Si tiene plazo

    // ═══════════════════════════════════════════════════════════════
    // TRAZABILIDAD DE LOTES
    // ═══════════════════════════════════════════════════════════════
    // Formato: [{"ocId": "xxx", "cantidad": 5, "costoUnidad": 6300}, ...]
    origenLotes: text('origen_lotes'),
    numeroLotes: integer('numero_lotes').default(0), // Cantidad de OCs involucradas

    // ═══════════════════════════════════════════════════════════════
    // AUDITORÍA
    // ═══════════════════════════════════════════════════════════════
    metodoPago: text('metodo_pago', {
      enum: ['efectivo', 'transferencia', 'crypto', 'cheque', 'credito'],
    }),
    bancoDestino: text('banco_destino').references(() => bancos.id),
    observaciones: text('observaciones'),
    alertas: text('alertas'), // JSON: Array de alertas

    createdBy: text('created_by').references(() => usuarios.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    clienteIdx: index('venta_cliente_idx').on(table.clienteId),
    fechaIdx: index('venta_fecha_idx').on(table.fecha),
    estadoIdx: index('venta_estado_idx').on(table.estadoPago),
    morosoIdx: index('venta_moroso_idx').on(table.esMoroso),
  }),
)

// ═══════════════════════════════════════════════════════════════
// ORDENES DE COMPRA - LOTES DE PRODUCTO (MÉTRICAS COMPLETAS)
// ═══════════════════════════════════════════════════════════════
// costoTotal = (costoUnidad + fleteUnidad) × cantidad
// adeudoPendiente = costoTotal - pagado
// stockActual = cantidad - ventas asignadas
// Incluye métricas de rendimiento, ventas y rentabilidad por lote
// ═══════════════════════════════════════════════════════════════

export const ordenesCompra = sqliteTable(
  'ordenes_compra',
  {
    id: text('id').primaryKey(),
    distribuidorId: text('distribuidor_id')
      .notNull()
      .references(() => distribuidores.id),
    productoId: text('producto_id').references(() => almacen.id), // Referencia al producto en almacén
    fecha: integer('fecha', { mode: 'timestamp' }).notNull(),

    numeroOrden: text('numero_orden').unique(),
    producto: text('producto'), // Descripción del producto

    // ═══════════════════════════════════════════════════════════════
    // STOCK (en piezas)
    // ═══════════════════════════════════════════════════════════════
    cantidad: integer('cantidad').notNull(), // Stock inicial
    stockActual: integer('stock_actual').notNull().default(0), // Stock disponible
    stockVendido: integer('stock_vendido').default(0), // Piezas vendidas de esta OC
    stockReservado: integer('stock_reservado').default(0), // Reservado pero no entregado

    // ═══════════════════════════════════════════════════════════════
    // COSTOS (pagos al distribuidor)
    // ═══════════════════════════════════════════════════════════════
    precioUnitario: real('precio_unitario').notNull(), // Costo por unidad
    fleteUnitario: real('flete_unitario').default(0), // Flete por unidad
    costoUnitarioTotal: real('costo_unitario_total'), // precioUnitario + fleteUnitario

    subtotal: real('subtotal').notNull(), // precioUnitario × cantidad
    fleteTotal: real('flete_total').default(0), // fleteUnitario × cantidad
    iva: real('iva').default(0),
    total: real('total').notNull(), // Costo total completo

    // ═══════════════════════════════════════════════════════════════
    // PAGOS AL DISTRIBUIDOR
    // ═══════════════════════════════════════════════════════════════
    montoPagado: real('monto_pagado').default(0), // Total pagado
    montoRestante: real('monto_restante').notNull(), // Deuda pendiente
    porcentajePagado: real('porcentaje_pagado').default(0), // (montoPagado/total) × 100
    numeroPagos: integer('numero_pagos').default(0), // Cantidad de pagos realizados
    fechaUltimoPago: integer('fecha_ultimo_pago', { mode: 'timestamp' }),

    estado: text('estado', {
      enum: ['pendiente', 'parcial', 'completo', 'cancelado'],
    }).default('pendiente'),

    // ═══════════════════════════════════════════════════════════════
    // VENTAS GENERADAS (métricas de rendimiento)
    // ═══════════════════════════════════════════════════════════════
    totalVentasGeneradas: real('total_ventas_generadas').default(0), // Ingresos por ventas
    piezasVendidas: integer('piezas_vendidas').default(0), // Unidades vendidas
    precioVentaPromedio: real('precio_venta_promedio').default(0), // Precio promedio venta/unidad
    numeroVentas: integer('numero_ventas').default(0), // Cantidad de transacciones

    // ═══════════════════════════════════════════════════════════════
    // COBROS DE CLIENTES (de ventas de esta OC)
    // ═══════════════════════════════════════════════════════════════
    montoCobrado: real('monto_cobrado').default(0), // Cobrado de ventas
    montoSinCobrar: real('monto_sin_cobrar').default(0), // Pendiente de clientes
    porcentajeCobrado: real('porcentaje_cobrado').default(0), // (cobrado/totalVentas) × 100

    // ═══════════════════════════════════════════════════════════════
    // RENTABILIDAD
    // ═══════════════════════════════════════════════════════════════
    gananciaTotal: real('ganancia_total').default(0), // totalVentas - total (costo)
    gananciaRealizada: real('ganancia_realizada').default(0), // Ganancia de stock vendido
    gananciaPotencial: real('ganancia_potencial').default(0), // Ganancia de stock restante
    margenBruto: real('margen_bruto').default(0), // (ganancia/ventas) × 100
    margenSobreCosto: real('margen_sobre_costo').default(0), // (ganancia/costo) × 100
    roi: real('roi').default(0), // (ganancia/montoPagado) × 100

    // ═══════════════════════════════════════════════════════════════
    // FLUJO DE EFECTIVO
    // ═══════════════════════════════════════════════════════════════
    efectivoNeto: real('efectivo_neto').default(0), // montoCobrado - montoPagado

    // ═══════════════════════════════════════════════════════════════
    // MÉTRICAS DE TIEMPO Y VELOCIDAD (ROTACIÓN)
    // ═══════════════════════════════════════════════════════════════
    velocidadVenta: real('velocidad_venta').default(0), // Piezas/día
    diasEstimadosAgotamiento: integer('dias_estimados_agotamiento'),
    rotacionDias: real('rotacion_dias'), // Días promedio para vender pieza
    diasDesdeCompra: integer('dias_desde_compra').default(0),
    porcentajeVendido: real('porcentaje_vendido').default(0), // (vendido/cantidad) × 100
    tiempoPromedioVentaPieza: real('tiempo_promedio_venta_pieza'), // días por pieza
    eficienciaRotacion: text('eficiencia_rotacion', {
      enum: ['excelente', 'buena', 'normal', 'lenta', 'muy_lenta'],
    }).default('normal'),

    // ═══════════════════════════════════════════════════════════════
    // ESTADOS CALCULADOS
    // ═══════════════════════════════════════════════════════════════
    estadoStock: text('estado_stock', {
      enum: ['disponible', 'bajo', 'agotado'],
    }).default('disponible'),
    estadoRentabilidad: text('estado_rentabilidad', {
      enum: ['excelente', 'buena', 'regular', 'mala', 'sin_datos'],
    }).default('sin_datos'),

    // ═══════════════════════════════════════════════════════════════
    // AUDITORÍA
    // ═══════════════════════════════════════════════════════════════
    bancoOrigenId: text('banco_origen_id').references(() => bancos.id),
    observaciones: text('observaciones'),
    alertas: text('alertas'), // JSON: Array de alertas

    createdBy: text('created_by').references(() => usuarios.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    distribuidorIdx: index('oc_distribuidor_idx').on(table.distribuidorId),
    fechaIdx: index('oc_fecha_idx').on(table.fecha),
    estadoIdx: index('oc_estado_idx').on(table.estado),
    estadoStockIdx: index('oc_estado_stock_idx').on(table.estadoStock),
    rentabilidadIdx: index('oc_rentabilidad_idx').on(table.estadoRentabilidad),
  }),
)

// ═══════════════════════════════════════════════════════════════
// MOVIMIENTOS FINANCIEROS - Registro inmutable
// Rastrea TODOS los movimientos de dinero en el sistema
// ═══════════════════════════════════════════════════════════════

export const movimientos = sqliteTable(
  'movimientos',
  {
    id: text('id').primaryKey(),
    bancoId: text('banco_id')
      .notNull()
      .references(() => bancos.id),

    tipo: text('tipo', {
      enum: [
        'ingreso',
        'gasto',
        'transferencia_entrada',
        'transferencia_salida',
        'abono',
        'pago',
        'distribucion_gya',
      ],
    }).notNull(),

    monto: real('monto').notNull(),
    fecha: integer('fecha', { mode: 'timestamp' }).notNull(),

    concepto: text('concepto').notNull(),
    referencia: text('referencia'),
    categoria: text('categoria').default('Operaciones'),

    // Referencias opcionales para trazabilidad
    bancoOrigenId: text('banco_origen_id').references(() => bancos.id),
    bancoDestinoId: text('banco_destino_id').references(() => bancos.id),
    clienteId: text('cliente_id').references(() => clientes.id),
    distribuidorId: text('distribuidor_id').references(() => distribuidores.id),
    ventaId: text('venta_id').references(() => ventas.id),
    ordenCompraId: text('orden_compra_id').references(() => ordenesCompra.id),

    observaciones: text('observaciones'),
    createdBy: text('created_by').references(() => usuarios.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    bancoIdx: index('mov_banco_idx').on(table.bancoId),
    tipoIdx: index('mov_tipo_idx').on(table.tipo),
    fechaIdx: index('mov_fecha_idx').on(table.fecha),
    referenciaIdx: index('mov_referencia_idx').on(table.referencia),
  }),
)

// ═══════════════════════════════════════════════════════════════
// ABONOS - Historial de pagos de ventas
// Tabla separada para mejor trazabilidad de pagos parciales
// ═══════════════════════════════════════════════════════════════

export const abonos = sqliteTable(
  'abonos',
  {
    id: text('id').primaryKey(),
    ventaId: text('venta_id')
      .notNull()
      .references(() => ventas.id),
    clienteId: text('cliente_id')
      .notNull()
      .references(() => clientes.id),

    monto: real('monto').notNull(),
    fecha: integer('fecha', { mode: 'timestamp' }).notNull(),

    // Distribución proporcional del abono
    proporcion: real('proporcion').notNull(), // monto / precioTotalVenta
    montoBovedaMonte: real('monto_boveda_monte').default(0),
    montoFletes: real('monto_fletes').default(0),
    montoUtilidades: real('monto_utilidades').default(0),

    // Estado después del abono
    montoPagadoAcumulado: real('monto_pagado_acumulado').notNull(),
    montoRestantePostAbono: real('monto_restante_post_abono').notNull(),
    estadoPagoResultante: text('estado_pago_resultante', {
      enum: ['pendiente', 'parcial', 'completo'],
    }).notNull(),

    concepto: text('concepto'),
    createdBy: text('created_by').references(() => usuarios.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    ventaIdx: index('abono_venta_idx').on(table.ventaId),
    clienteIdx: index('abono_cliente_idx').on(table.clienteId),
    fechaIdx: index('abono_fecha_idx').on(table.fecha),
  }),
)

// ═══════════════════════════════════════════════════════════════
// ALMACEN / PRODUCTOS (MÉTRICAS COMPLETAS DE RENTABILIDAD)
// ═══════════════════════════════════════════════════════════════
// stockActual = entradas acumuladas - salidas acumuladas
// Incluye métricas de ventas, rentabilidad, rotación y análisis
// ═══════════════════════════════════════════════════════════════

export const almacen = sqliteTable(
  'almacen',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    descripcion: text('descripcion'),
    sku: text('sku'), // Código único de producto
    categoria: text('categoria'), // Categoría del producto

    // ═══════════════════════════════════════════════════════════════
    // STOCK
    // ═══════════════════════════════════════════════════════════════
    cantidad: integer('cantidad').notNull().default(0), // stockActual
    stockActual: integer('stock_actual').default(0), // Alias para cantidad
    totalEntradas: integer('total_entradas').default(0), // Acumulado de entradas
    totalSalidas: integer('total_salidas').default(0), // Acumulado de salidas
    stockReservado: integer('stock_reservado').default(0), // Reservado no entregado
    minimo: integer('minimo').default(0), // Alias legacy para stockMinimo
    stockMinimo: integer('stock_minimo').default(0), // Alerta stock bajo
    stockMaximo: integer('stock_maximo').default(0), // Capacidad máxima

    // ═══════════════════════════════════════════════════════════════
    // PRECIOS
    // ═══════════════════════════════════════════════════════════════
    precioCompra: real('precio_compra').notNull(), // Costo promedio de compra
    precioVenta: real('precio_venta').notNull(), // Precio de venta sugerido
    precioCompraPromedio: real('precio_compra_promedio').default(0), // Promedio ponderado
    precioVentaPromedio: real('precio_venta_promedio').default(0), // Promedio real vendido
    fletePromedio: real('flete_promedio').default(0), // Flete promedio por unidad

    // ═══════════════════════════════════════════════════════════════
    // VENTAS GENERADAS
    // ═══════════════════════════════════════════════════════════════
    ventasTotales: real('ventas_totales').default(0), // Ingreso total por ventas
    ventasMes: real('ventas_mes').default(0), // Ventas del mes actual
    ventasSemana: real('ventas_semana').default(0), // Ventas de la semana
    numeroVentas: integer('numero_ventas').default(0), // Cantidad de transacciones
    numeroVentasMes: integer('numero_ventas_mes').default(0), // Transacciones del mes
    unidadesVendidas: integer('unidades_vendidas').default(0), // Total piezas vendidas
    unidadesVendidasMes: integer('unidades_vendidas_mes').default(0), // Piezas del mes
    ticketPromedio: real('ticket_promedio').default(0), // ventasTotales / numeroVentas

    // ═══════════════════════════════════════════════════════════════
    // RENTABILIDAD
    // ═══════════════════════════════════════════════════════════════
    costoTotalVendido: real('costo_total_vendido').default(0), // Costo de lo vendido
    gananciaTotal: real('ganancia_total').default(0), // ventasTotales - costoVendido
    gananciaMes: real('ganancia_mes').default(0), // Ganancia del mes
    gananciaSemana: real('ganancia_semana').default(0), // Ganancia de la semana
    margenBruto: real('margen_bruto').default(0), // (ganancia/ventas) × 100
    margenNeto: real('margen_neto').default(0), // Margen neto después de costos
    margenSobreCosto: real('margen_sobre_costo').default(0), // (ganancia/costo) × 100
    gananciaPorUnidad: real('ganancia_por_unidad').default(0), // Promedio ganancia/unidad
    contribucionTotal: real('contribucion_total').default(0), // % contribución a utilidades

    // ═══════════════════════════════════════════════════════════════
    // ROTACIÓN Y VELOCIDAD
    // ═══════════════════════════════════════════════════════════════
    rotacionInventario: real('rotacion_inventario').default(0), // costoVendido / stockPromedio
    diasInventario: integer('dias_inventario').default(0), // 365 / rotación
    velocidadVenta: real('velocidad_venta').default(0), // Unidades/día promedio
    diasParaAgotarse: integer('dias_para_agotarse'), // stock / velocidadVenta
    ultimaVenta: integer('ultima_venta', { mode: 'timestamp' }),
    diasSinVenta: integer('dias_sin_venta').default(0),

    // ═══════════════════════════════════════════════════════════════
    // VALOR DE INVENTARIO
    // ═══════════════════════════════════════════════════════════════
    valorStockCosto: real('valor_stock_costo').default(0), // stock × precioCompra
    valorStockVenta: real('valor_stock_venta').default(0), // stock × precioVenta
    gananciaPotencial: real('ganancia_potencial').default(0), // valorVenta - valorCosto

    // ═══════════════════════════════════════════════════════════════
    // PROVEEDORES
    // ═══════════════════════════════════════════════════════════════
    distribuidorPrincipalId: text('distribuidor_principal_id').references(() => distribuidores.id),
    numeroProveedores: integer('numero_proveedores').default(0),
    ordenesCompraActivas: integer('ordenes_compra_activas').default(0),

    // ═══════════════════════════════════════════════════════════════
    // SCORING Y CATEGORIZACIÓN
    // ═══════════════════════════════════════════════════════════════
    scoreRentabilidad: integer('score_rentabilidad').default(50), // 0-100
    scoreRotacion: integer('score_rotacion').default(50), // 0-100
    scoreDemanda: integer('score_demanda').default(50), // 0-100
    scoreTotal: integer('score_total').default(50),

    clasificacionABC: text('clasificacion_abc', {
      enum: ['A', 'B', 'C'],
    }).default('C'), // Clasificación por valor
    estadoStock: text('estado_stock', {
      enum: ['optimo', 'bajo', 'critico', 'agotado', 'exceso'],
    }).default('optimo'),

    // ═══════════════════════════════════════════════════════════════
    // ALERTAS Y AUDITORÍA
    // ═══════════════════════════════════════════════════════════════
    alertas: text('alertas'), // JSON: Array de alertas
    ubicacion: text('ubicacion'),
    activo: integer('activo', { mode: 'boolean' }).default(true),
    notas: text('notas'),
    ultimaActualizacionMetricas: text('ultima_actualizacion_metricas'), // ISO timestamp

    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    nombreIdx: index('almacen_nombre_idx').on(table.nombre),
    skuIdx: index('almacen_sku_idx').on(table.sku),
    categoriaIdx: index('almacen_categoria_idx').on(table.categoria),
    estadoIdx: index('almacen_estado_idx').on(table.estadoStock),
    abcIdx: index('almacen_abc_idx').on(table.clasificacionABC),
    scoreIdx: index('almacen_score_idx').on(table.scoreTotal),
  }),
)

// ═══════════════════════════════════════════════════════════════
// HISTÓRICO DE ENTRADAS DE ALMACÉN - Trazabilidad
// ═══════════════════════════════════════════════════════════════

export const entradaAlmacen = sqliteTable(
  'entrada_almacen',
  {
    id: text('id').primaryKey(),
    ordenCompraId: text('orden_compra_id').references(() => ordenesCompra.id),
    productoId: text('producto_id').references(() => almacen.id),

    cantidad: integer('cantidad').notNull(),
    costoTotal: real('costo_total').notNull(),

    fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
    observaciones: text('observaciones'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    ocIdx: index('entrada_oc_idx').on(table.ordenCompraId),
    fechaIdx: index('entrada_fecha_idx').on(table.fecha),
  }),
)

// ═══════════════════════════════════════════════════════════════
// HISTÓRICO DE SALIDAS DE ALMACÉN - Trazabilidad
// ═══════════════════════════════════════════════════════════════

export const salidaAlmacen = sqliteTable(
  'salida_almacen',
  {
    id: text('id').primaryKey(),
    ventaId: text('venta_id').references(() => ventas.id),
    productoId: text('producto_id').references(() => almacen.id),

    cantidad: integer('cantidad').notNull(),
    // Origen de lotes (FIFO) - JSON: [{"ocId": "xxx", "cantidad": 5}]
    origenLotes: text('origen_lotes'),

    fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
    observaciones: text('observaciones'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    ventaIdx: index('salida_venta_idx').on(table.ventaId),
    fechaIdx: index('salida_fecha_idx').on(table.fecha),
  }),
)

// ═══════════════════════════════════════════════════════════════
// PAGOS A DISTRIBUIDORES - Historial de pagos de OC
// ═══════════════════════════════════════════════════════════════

export const pagosDistribuidor = sqliteTable(
  'pagos_distribuidor',
  {
    id: text('id').primaryKey(),
    ordenCompraId: text('orden_compra_id')
      .notNull()
      .references(() => ordenesCompra.id),
    distribuidorId: text('distribuidor_id')
      .notNull()
      .references(() => distribuidores.id),
    bancoOrigenId: text('banco_origen_id')
      .notNull()
      .references(() => bancos.id),

    monto: real('monto').notNull(),
    fecha: integer('fecha', { mode: 'timestamp' }).notNull(),

    // Estado después del pago
    montoPagadoAcumulado: real('monto_pagado_acumulado').notNull(),
    montoRestantePostPago: real('monto_restante_post_pago').notNull(),
    estadoPagoResultante: text('estado_pago_resultante', {
      enum: ['pendiente', 'parcial', 'completo'],
    }).notNull(),

    concepto: text('concepto'),
    referencia: text('referencia'),
    createdBy: text('created_by').references(() => usuarios.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    ocIdx: index('pago_dist_oc_idx').on(table.ordenCompraId),
    distribuidorIdx: index('pago_dist_distribuidor_idx').on(table.distribuidorId),
    fechaIdx: index('pago_dist_fecha_idx').on(table.fecha),
  }),
)

// ═══════════════════════════════════════════════════════════════
// KPIs GLOBALES - Snapshot diario del sistema
// Para dashboards y reportes de rendimiento
// ═══════════════════════════════════════════════════════════════

export const kpisGlobales = sqliteTable(
  'kpis_globales',
  {
    id: text('id').primaryKey(),
    fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
    periodo: text('periodo', {
      enum: ['diario', 'semanal', 'mensual'],
    }).default('diario'),

    // ═══════════════════════════════════════════════════════════════
    // CAPITAL Y LIQUIDEZ
    // ═══════════════════════════════════════════════════════════════
    capitalTotal: real('capital_total').default(0),
    liquidezDisponible: real('liquidez_disponible').default(0),
    deudaClientes: real('deuda_clientes').default(0),
    deudaDistribuidores: real('deuda_distribuidores').default(0),
    patrimonioNeto: real('patrimonio_neto').default(0),

    // ═══════════════════════════════════════════════════════════════
    // VENTAS
    // ═══════════════════════════════════════════════════════════════
    ventasDia: real('ventas_dia').default(0),
    ventasSemana: real('ventas_semana').default(0),
    ventasMes: real('ventas_mes').default(0),
    ventasAnio: real('ventas_anio').default(0),
    promedioVentaDiaria: real('promedio_venta_diaria').default(0),
    numeroVentasDia: integer('numero_ventas_dia').default(0),

    // ═══════════════════════════════════════════════════════════════
    // GANANCIAS
    // ═══════════════════════════════════════════════════════════════
    gananciaDia: real('ganancia_dia').default(0),
    gananciaSemana: real('ganancia_semana').default(0),
    gananciaMes: real('ganancia_mes').default(0),
    gananciaAnio: real('ganancia_anio').default(0),
    margenPromedioGlobal: real('margen_promedio_global').default(0),

    // ═══════════════════════════════════════════════════════════════
    // STOCK
    // ═══════════════════════════════════════════════════════════════
    stockTotalPiezas: integer('stock_total_piezas').default(0),
    stockValorCosto: real('stock_valor_costo').default(0),
    stockValorVenta: real('stock_valor_venta').default(0),
    gananciaPotencialStock: real('ganancia_potencial_stock').default(0),
    ordenesConStock: integer('ordenes_con_stock').default(0),

    // ═══════════════════════════════════════════════════════════════
    // EFICIENCIA
    // ═══════════════════════════════════════════════════════════════
    rotacionInventario: real('rotacion_inventario').default(0),
    diasInventario: integer('dias_inventario').default(0),
    porcentajeCobranza: real('porcentaje_cobranza').default(0),
    puntualidadPagos: real('puntualidad_pagos').default(0),

    // ═══════════════════════════════════════════════════════════════
    // CLIENTES
    // ═══════════════════════════════════════════════════════════════
    clientesActivos: integer('clientes_activos').default(0),
    clientesNuevos: integer('clientes_nuevos').default(0),
    clientesMorosos: integer('clientes_morosos').default(0),
    clientesVIP: integer('clientes_vip').default(0),

    // ═══════════════════════════════════════════════════════════════
    // TENDENCIAS
    // ═══════════════════════════════════════════════════════════════
    tendenciaVentas: text('tendencia_ventas', {
      enum: ['subiendo', 'estable', 'bajando'],
    }).default('estable'),
    tendenciaGanancias: text('tendencia_ganancias', {
      enum: ['subiendo', 'estable', 'bajando'],
    }).default('estable'),
    tendenciaLiquidez: text('tendencia_liquidez', {
      enum: ['subiendo', 'estable', 'bajando'],
    }).default('estable'),

    // ═══════════════════════════════════════════════════════════════
    // SALUD FINANCIERA
    // ═══════════════════════════════════════════════════════════════
    indiceSaludFinanciera: integer('indice_salud_financiera').default(50),
    riesgoLiquidez: text('riesgo_liquidez', {
      enum: ['bajo', 'medio', 'alto'],
    }).default('medio'),
    riesgoCredito: text('riesgo_credito', {
      enum: ['bajo', 'medio', 'alto'],
    }).default('medio'),

    // ═══════════════════════════════════════════════════════════════
    // ALERTAS
    // ═══════════════════════════════════════════════════════════════
    alertasCriticas: integer('alertas_criticas').default(0),
    alertasAdvertencia: integer('alertas_advertencia').default(0),
    alertasInfo: integer('alertas_info').default(0),
    alertasJSON: text('alertas_json'), // JSON: Array de alertas

    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    fechaIdx: index('kpis_fecha_idx').on(table.fecha),
    periodoIdx: index('kpis_periodo_idx').on(table.periodo),
  }),
)

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const ventasRelations = relations(ventas, ({ one, many }) => ({
  cliente: one(clientes, {
    fields: [ventas.clienteId],
    references: [clientes.id],
  }),
  movimientos: many(movimientos),
  abonos: many(abonos),
  salidas: many(salidaAlmacen),
}))

export const clientesRelations = relations(clientes, ({ many }) => ({
  ventas: many(ventas),
  movimientos: many(movimientos),
  abonos: many(abonos),
}))

export const bancosRelations = relations(bancos, ({ many }) => ({
  movimientos: many(movimientos),
  ordenesCompra: many(ordenesCompra),
}))

export const distribuidoresRelations = relations(distribuidores, ({ many }) => ({
  ordenesCompra: many(ordenesCompra),
  movimientos: many(movimientos),
  pagos: many(pagosDistribuidor),
}))

export const ordenesCompraRelations = relations(ordenesCompra, ({ one, many }) => ({
  distribuidor: one(distribuidores, {
    fields: [ordenesCompra.distribuidorId],
    references: [distribuidores.id],
  }),
  bancoOrigen: one(bancos, {
    fields: [ordenesCompra.bancoOrigenId],
    references: [bancos.id],
  }),
  entradas: many(entradaAlmacen),
}))

export const movimientosRelations = relations(movimientos, ({ one }) => ({
  banco: one(bancos, {
    fields: [movimientos.bancoId],
    references: [bancos.id],
  }),
  cliente: one(clientes, {
    fields: [movimientos.clienteId],
    references: [clientes.id],
  }),
  venta: one(ventas, {
    fields: [movimientos.ventaId],
    references: [ventas.id],
  }),
  ordenCompra: one(ordenesCompra, {
    fields: [movimientos.ordenCompraId],
    references: [ordenesCompra.id],
  }),
}))

export const abonosRelations = relations(abonos, ({ one }) => ({
  venta: one(ventas, {
    fields: [abonos.ventaId],
    references: [ventas.id],
  }),
  cliente: one(clientes, {
    fields: [abonos.clienteId],
    references: [clientes.id],
  }),
}))

export const entradaAlmacenRelations = relations(entradaAlmacen, ({ one }) => ({
  ordenCompra: one(ordenesCompra, {
    fields: [entradaAlmacen.ordenCompraId],
    references: [ordenesCompra.id],
  }),
  producto: one(almacen, {
    fields: [entradaAlmacen.productoId],
    references: [almacen.id],
  }),
}))

export const salidaAlmacenRelations = relations(salidaAlmacen, ({ one }) => ({
  venta: one(ventas, {
    fields: [salidaAlmacen.ventaId],
    references: [ventas.id],
  }),
  producto: one(almacen, {
    fields: [salidaAlmacen.productoId],
    references: [almacen.id],
  }),
}))

export const pagosDistribuidorRelations = relations(pagosDistribuidor, ({ one }) => ({
  ordenCompra: one(ordenesCompra, {
    fields: [pagosDistribuidor.ordenCompraId],
    references: [ordenesCompra.id],
  }),
  distribuidor: one(distribuidores, {
    fields: [pagosDistribuidor.distribuidorId],
    references: [distribuidores.id],
  }),
  bancoOrigen: one(bancos, {
    fields: [pagosDistribuidor.bancoOrigenId],
    references: [bancos.id],
  }),
}))

// Export types
export type Usuario = typeof usuarios.$inferSelect
export type InsertUsuario = typeof usuarios.$inferInsert
export type Cliente = typeof clientes.$inferSelect
export type InsertCliente = typeof clientes.$inferInsert
export type Distribuidor = typeof distribuidores.$inferSelect
export type InsertDistribuidor = typeof distribuidores.$inferInsert
export type Banco = typeof bancos.$inferSelect
export type InsertBanco = typeof bancos.$inferInsert
export type Venta = typeof ventas.$inferSelect
export type InsertVenta = typeof ventas.$inferInsert
export type OrdenCompra = typeof ordenesCompra.$inferSelect
export type InsertOrdenCompra = typeof ordenesCompra.$inferInsert
export type Movimiento = typeof movimientos.$inferSelect
export type InsertMovimiento = typeof movimientos.$inferInsert
export type Almacen = typeof almacen.$inferSelect
export type InsertAlmacen = typeof almacen.$inferInsert
export type Abono = typeof abonos.$inferSelect
export type InsertAbono = typeof abonos.$inferInsert
export type EntradaAlmacen = typeof entradaAlmacen.$inferSelect
export type InsertEntradaAlmacen = typeof entradaAlmacen.$inferInsert
export type SalidaAlmacen = typeof salidaAlmacen.$inferSelect
export type InsertSalidaAlmacen = typeof salidaAlmacen.$inferInsert
export type PagoDistribuidor = typeof pagosDistribuidor.$inferSelect
export type InsertPagoDistribuidor = typeof pagosDistribuidor.$inferInsert
export type KPIsGlobales = typeof kpisGlobales.$inferSelect
export type InsertKPIsGlobales = typeof kpisGlobales.$inferInsert
// ═══════════════════════════════════════════════════════════════
// AI CHAT HISTORY (ZERO AI Panel)
// ═══════════════════════════════════════════════════════════════
// Historial de conversaciones con el asistente IA ZERO
// Permite persistencia de contexto entre sesiones
// ═══════════════════════════════════════════════════════════════

export const aiChatMessages = sqliteTable(
  'ai_chat_messages',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id').notNull(), // Agrupa mensajes por sesión
    userId: text('user_id'), // Usuario que inició la conversación
    role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
    content: text('content').notNull(),
    intent: text('intent'), // Intención detectada (ventas, clientes, stock, etc.)
    entities: text('entities'), // JSON: Entidades extraídas del mensaje
    confidence: real('confidence'), // Confianza de la clasificación NLU
    responseTime: integer('response_time'), // ms que tardó en responder
    tokensUsed: integer('tokens_used'), // Tokens usados (si aplica)
    model: text('model'), // Modelo usado (gpt-4, claude, local)
    metadata: text('metadata'), // JSON: Datos adicionales
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    sessionIdx: index('ai_chat_session_idx').on(table.sessionId),
    userIdx: index('ai_chat_user_idx').on(table.userId),
    createdAtIdx: index('ai_chat_created_idx').on(table.createdAt),
  }),
)

export const aiChatSessions = sqliteTable(
  'ai_chat_sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id'),
    title: text('title'), // Título generado automáticamente
    summary: text('summary'), // Resumen de la conversación
    messageCount: integer('message_count').default(0),
    lastMessageAt: integer('last_message_at', { mode: 'timestamp' }),
    context: text('context'), // JSON: Contexto acumulado de la sesión
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdx: index('ai_session_user_idx').on(table.userId),
    activeIdx: index('ai_session_active_idx').on(table.isActive),
  }),
)

// Relations
export const aiChatMessagesRelations = relations(aiChatMessages, ({ one }) => ({
  session: one(aiChatSessions, {
    fields: [aiChatMessages.sessionId],
    references: [aiChatSessions.id],
  }),
}))

export const aiChatSessionsRelations = relations(aiChatSessions, ({ many }) => ({
  messages: many(aiChatMessages),
}))

// Types
export type AIChatMessage = typeof aiChatMessages.$inferSelect
export type InsertAIChatMessage = typeof aiChatMessages.$inferInsert
export type AIChatSession = typeof aiChatSessions.$inferSelect
export type InsertAIChatSession = typeof aiChatSessions.$inferInsert

// ═══════════════════════════════════════════════════════════════
// ALERTAS - Sistema de Monitoreo Proactivo
// ═══════════════════════════════════════════════════════════════
// Alertas automáticas basadas en reglas configurables
// Incluye stock bajo, deudas altas, márgenes bajos, etc.
// ═══════════════════════════════════════════════════════════════

export const alertas = sqliteTable(
  'alertas',
  {
    id: text('id').primaryKey(),

    tipo: text('tipo', {
      enum: [
        'stock_bajo',
        'stock_critico',
        'stock_agotado',
        'deuda_alta_cliente',
        'cliente_moroso',
        'deuda_alta_distribuidor',
        'margen_bajo',
        'margen_negativo',
        'banco_bajo_capital',
        'banco_sin_liquidez',
        'venta_sin_cobrar',
        'orden_sin_pagar',
        'rotacion_lenta',
        'cliente_inactivo',
        'meta_no_alcanzada',
        'anomalia_detectada',
        'sistema',
        'personalizada',
      ],
    }).notNull(),

    severidad: text('severidad', {
      enum: ['info', 'advertencia', 'critica', 'urgente'],
    })
      .notNull()
      .default('info'),

    estado: text('estado', {
      enum: ['activa', 'vista', 'resuelta', 'ignorada', 'escalada'],
    })
      .notNull()
      .default('activa'),

    titulo: text('titulo').notNull(),
    descripcion: text('descripcion').notNull(),

    // Entidad relacionada (polimórfico)
    entidadTipo: text('entidad_tipo', {
      enum: ['cliente', 'distribuidor', 'venta', 'orden_compra', 'banco', 'almacen', 'sistema'],
    }),
    entidadId: text('entidad_id'),
    entidadNombre: text('entidad_nombre'),

    // Valores para contexto
    valorActual: real('valor_actual'),
    valorUmbral: real('valor_umbral'),
    unidad: text('unidad'), // %, $, unidades, días, etc.

    // Acciones sugeridas
    accionSugerida: text('accion_sugerida'),
    urlAccion: text('url_accion'), // Link para resolver

    // Metadata
    metadata: text('metadata'), // JSON: datos adicionales

    // Fechas
    fechaCreacion: integer('fecha_creacion', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    fechaVista: integer('fecha_vista', { mode: 'timestamp' }),
    fechaResuelta: integer('fecha_resuelta', { mode: 'timestamp' }),
    fechaExpiracion: integer('fecha_expiracion', { mode: 'timestamp' }),

    // Quién la resolvió
    resueltaPor: text('resuelta_por').references(() => usuarios.id),
    notasResolucion: text('notas_resolucion'),

    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    tipoIdx: index('alerta_tipo_idx').on(table.tipo),
    severidadIdx: index('alerta_severidad_idx').on(table.severidad),
    estadoIdx: index('alerta_estado_idx').on(table.estado),
    entidadIdx: index('alerta_entidad_idx').on(table.entidadTipo, table.entidadId),
    fechaIdx: index('alerta_fecha_idx').on(table.fechaCreacion),
  }),
)

// Configuración de reglas de alertas
export const alertasConfig = sqliteTable('alertas_config', {
  id: text('id').primaryKey(),

  tipo: text('tipo', {
    enum: [
      'stock_bajo',
      'stock_critico',
      'deuda_alta_cliente',
      'cliente_moroso',
      'deuda_alta_distribuidor',
      'margen_bajo',
      'banco_bajo_capital',
      'venta_sin_cobrar',
      'orden_sin_pagar',
      'rotacion_lenta',
      'cliente_inactivo',
    ],
  })
    .notNull()
    .unique(),

  activo: integer('activo', { mode: 'boolean' }).default(true),
  umbral: real('umbral').notNull(), // Valor que dispara la alerta
  severidad: text('severidad', {
    enum: ['info', 'advertencia', 'critica', 'urgente'],
  })
    .notNull()
    .default('advertencia'),

  // Frecuencia de verificación
  frecuenciaHoras: integer('frecuencia_horas').default(24),
  ultimaVerificacion: integer('ultima_verificacion', { mode: 'timestamp' }),

  // Notificaciones
  notificarEmail: integer('notificar_email', { mode: 'boolean' }).default(false),
  notificarPush: integer('notificar_push', { mode: 'boolean' }).default(true),
  emailsDestino: text('emails_destino'), // JSON: array de emails

  descripcionPersonalizada: text('descripcion_personalizada'),

  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

// ═══════════════════════════════════════════════════════════════
// DEVOLUCIONES - Reversión de Ventas con GYA
// ═══════════════════════════════════════════════════════════════
// Flujo completo de devolución que revierte la distribución GYA
// Devuelve stock al almacén/OC y ajusta saldos
// ═══════════════════════════════════════════════════════════════

export const devoluciones = sqliteTable(
  'devoluciones',
  {
    id: text('id').primaryKey(),

    ventaId: text('venta_id')
      .notNull()
      .references(() => ventas.id),
    clienteId: text('cliente_id')
      .notNull()
      .references(() => clientes.id),

    tipo: text('tipo', {
      enum: ['total', 'parcial'],
    }).notNull(),

    motivo: text('motivo', {
      enum: [
        'defectuoso',
        'error_cantidad',
        'error_precio',
        'cliente_cambio_opinion',
        'producto_incorrecto',
        'duplicado',
        'otro',
      ],
    }).notNull(),

    estado: text('estado', {
      enum: ['pendiente', 'aprobada', 'procesada', 'rechazada', 'cancelada'],
    })
      .notNull()
      .default('pendiente'),

    // Cantidades
    cantidadOriginal: integer('cantidad_original').notNull(), // De la venta original
    cantidadDevuelta: integer('cantidad_devuelta').notNull(),

    // Montos de la venta original
    precioVentaUnidad: real('precio_venta_unidad').notNull(),
    precioCompraUnidad: real('precio_compra_unidad').notNull(),
    precioFleteUnidad: real('precio_flete_unidad').notNull(),

    // Montos a revertir (calculados)
    montoTotalDevolucion: real('monto_total_devolucion').notNull(), // precioVenta × cantidadDevuelta

    // Reversión GYA - montos a restar de cada banco
    reversionBovedaMonte: real('reversion_boveda_monte').notNull(), // precioCompra × cantidadDevuelta
    reversionFletes: real('reversion_fletes').notNull(), // precioFlete × cantidadDevuelta
    reversionUtilidades: real('reversion_utilidades').notNull(), // ganancia × cantidadDevuelta

    // Si hubo pagos, cuánto devolver al cliente
    montoReembolso: real('monto_reembolso').default(0),
    estadoReembolso: text('estado_reembolso', {
      enum: ['no_aplica', 'pendiente', 'procesado'],
    }).default('no_aplica'),
    bancoReembolso: text('banco_reembolso').references(() => bancos.id),

    // Stock
    devolverStock: integer('devolver_stock', { mode: 'boolean' }).default(true),
    ocDestinoId: text('oc_destino_id').references(() => ordenesCompra.id), // A qué OC devolver
    stockDevuelto: integer('stock_devuelto', { mode: 'boolean' }).default(false),

    // Aprobación
    aprobadoPor: text('aprobado_por').references(() => usuarios.id),
    fechaAprobacion: integer('fecha_aprobacion', { mode: 'timestamp' }),

    // Procesamiento
    procesadoPor: text('procesado_por').references(() => usuarios.id),
    fechaProcesamiento: integer('fecha_procesamiento', { mode: 'timestamp' }),

    observaciones: text('observaciones'),
    motivoRechazo: text('motivo_rechazo'),

    createdBy: text('created_by').references(() => usuarios.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    ventaIdx: index('devolucion_venta_idx').on(table.ventaId),
    clienteIdx: index('devolucion_cliente_idx').on(table.clienteId),
    estadoIdx: index('devolucion_estado_idx').on(table.estado),
    fechaIdx: index('devolucion_fecha_idx').on(table.createdAt),
  }),
)

// ═══════════════════════════════════════════════════════════════
// AUDIT LOG - Registro de Auditoría Completo
// ═══════════════════════════════════════════════════════════════
// Log inmutable de TODAS las operaciones del sistema
// Cumple con requisitos de compliance y trazabilidad
// ═══════════════════════════════════════════════════════════════

export const auditLog = sqliteTable(
  'audit_log',
  {
    id: text('id').primaryKey(),

    // Quién
    userId: text('user_id').references(() => usuarios.id),
    userEmail: text('user_email'),
    userRole: text('user_role'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    sessionId: text('session_id'),

    // Qué
    accion: text('accion', {
      enum: [
        'crear',
        'leer',
        'actualizar',
        'eliminar',
        'aprobar',
        'rechazar',
        'cancelar',
        'procesar',
        'transferir',
        'distribuir',
        'revertir',
        'login',
        'logout',
        'cambio_password',
        'cambio_config',
        'exportar',
        'importar',
      ],
    }).notNull(),

    // Sobre qué
    entidadTipo: text('entidad_tipo', {
      enum: [
        'usuario',
        'cliente',
        'distribuidor',
        'venta',
        'abono',
        'orden_compra',
        'pago_distribuidor',
        'banco',
        'movimiento',
        'transferencia',
        'almacen',
        'producto',
        'devolucion',
        'alerta',
        'configuracion',
        'reporte',
        'sesion',
      ],
    }).notNull(),
    entidadId: text('entidad_id'),
    entidadNombre: text('entidad_nombre'),

    // Detalles del cambio
    valorAnterior: text('valor_anterior'), // JSON: snapshot antes
    valorNuevo: text('valor_nuevo'), // JSON: snapshot después
    camposModificados: text('campos_modificados'), // JSON: lista de campos cambiados

    // Contexto
    modulo: text('modulo'), // ventas, clientes, bancos, etc.
    origen: text('origen', {
      enum: ['web', 'api', 'cron', 'sistema', 'importacion'],
    }).default('web'),
    descripcion: text('descripcion'),

    // Impacto financiero (si aplica)
    montoInvolucrado: real('monto_involucrado'),
    bancosAfectados: text('bancos_afectados'), // JSON: array de bancoIds

    // Resultado
    exito: integer('exito', { mode: 'boolean' }).notNull().default(true),
    errorMensaje: text('error_mensaje'),
    errorStack: text('error_stack'),

    // Timestamp inmutable
    timestamp: integer('timestamp', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdx: index('audit_user_idx').on(table.userId),
    accionIdx: index('audit_accion_idx').on(table.accion),
    entidadIdx: index('audit_entidad_idx').on(table.entidadTipo, table.entidadId),
    timestampIdx: index('audit_timestamp_idx').on(table.timestamp),
    sessionIdx: index('audit_session_idx').on(table.sessionId),
  }),
)

// ═══════════════════════════════════════════════════════════════
// CONCILIACIÓN BANCARIA
// ═══════════════════════════════════════════════════════════════
// Registro de conciliaciones entre sistema y extractos bancarios
// ═══════════════════════════════════════════════════════════════

export const conciliaciones = sqliteTable(
  'conciliaciones',
  {
    id: text('id').primaryKey(),

    bancoId: text('banco_id')
      .notNull()
      .references(() => bancos.id),

    periodo: text('periodo').notNull(), // "2025-01", "2025-Q1", etc.
    fechaInicio: integer('fecha_inicio', { mode: 'timestamp' }).notNull(),
    fechaFin: integer('fecha_fin', { mode: 'timestamp' }).notNull(),

    estado: text('estado', {
      enum: ['pendiente', 'en_proceso', 'conciliada', 'con_diferencias'],
    })
      .notNull()
      .default('pendiente'),

    // Saldos
    saldoSistema: real('saldo_sistema').notNull(),
    saldoExtracto: real('saldo_extracto').notNull(),
    diferencia: real('diferencia').notNull(),
    diferenciaPorcentaje: real('diferencia_porcentaje').notNull(),

    // Detalles
    movimientosSistema: integer('movimientos_sistema').default(0),
    movimientosExtracto: integer('movimientos_extracto').default(0),
    movimientosConciliados: integer('movimientos_conciliados').default(0),
    movimientosPendientes: integer('movimientos_pendientes').default(0),

    // Partidas no conciliadas
    partidasPendientesJSON: text('partidas_pendientes_json'), // JSON: array de diferencias

    observaciones: text('observaciones'),

    conciliadoPor: text('conciliado_por').references(() => usuarios.id),
    fechaConciliacion: integer('fecha_conciliacion', { mode: 'timestamp' }),

    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    bancoIdx: index('conciliacion_banco_idx').on(table.bancoId),
    periodoIdx: index('conciliacion_periodo_idx').on(table.periodo),
    estadoIdx: index('conciliacion_estado_idx').on(table.estado),
  }),
)

// ═══════════════════════════════════════════════════════════════
// RELACIONES DE NUEVAS TABLAS
// ═══════════════════════════════════════════════════════════════

export const alertasRelations = relations(alertas, ({ one }) => ({
  resueltaPorUsuario: one(usuarios, {
    fields: [alertas.resueltaPor],
    references: [usuarios.id],
  }),
}))

export const devolucionesRelations = relations(devoluciones, ({ one }) => ({
  venta: one(ventas, {
    fields: [devoluciones.ventaId],
    references: [ventas.id],
  }),
  cliente: one(clientes, {
    fields: [devoluciones.clienteId],
    references: [clientes.id],
  }),
  ocDestino: one(ordenesCompra, {
    fields: [devoluciones.ocDestinoId],
    references: [ordenesCompra.id],
  }),
  bancoReembolsoRef: one(bancos, {
    fields: [devoluciones.bancoReembolso],
    references: [bancos.id],
  }),
  aprobadoPorUsuario: one(usuarios, {
    fields: [devoluciones.aprobadoPor],
    references: [usuarios.id],
  }),
  procesadoPorUsuario: one(usuarios, {
    fields: [devoluciones.procesadoPor],
    references: [usuarios.id],
  }),
  createdByUsuario: one(usuarios, {
    fields: [devoluciones.createdBy],
    references: [usuarios.id],
  }),
}))

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [auditLog.userId],
    references: [usuarios.id],
  }),
}))

export const conciliacionesRelations = relations(conciliaciones, ({ one }) => ({
  banco: one(bancos, {
    fields: [conciliaciones.bancoId],
    references: [bancos.id],
  }),
  conciliadoPorUsuario: one(usuarios, {
    fields: [conciliaciones.conciliadoPor],
    references: [usuarios.id],
  }),
}))

// ═══════════════════════════════════════════════════════════════
// TYPES DE NUEVAS TABLAS
// ═══════════════════════════════════════════════════════════════

export type Alerta = typeof alertas.$inferSelect
export type InsertAlerta = typeof alertas.$inferInsert
export type AlertaConfig = typeof alertasConfig.$inferSelect
export type InsertAlertaConfig = typeof alertasConfig.$inferInsert
export type Devolucion = typeof devoluciones.$inferSelect
export type InsertDevolucion = typeof devoluciones.$inferInsert
export type AuditLogEntry = typeof auditLog.$inferSelect
export type InsertAuditLogEntry = typeof auditLog.$inferInsert
export type Conciliacion = typeof conciliaciones.$inferSelect
export type InsertConciliacion = typeof conciliaciones.$inferInsert
