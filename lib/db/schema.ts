import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core"

// ═══════════════════════════════════════════════════
// BANCOS
// ═══════════════════════════════════════════════════
export const bancos = sqliteTable("bancos", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  tipo: text("tipo", { enum: ["operativo", "inversion", "externo"] }).notNull(),
  descripcion: text("descripcion").notNull().default(""),
  capitalActual: real("capital_actual").notNull().default(0),
  historicoIngresos: real("historico_ingresos").notNull().default(0),
  historicoGastos: real("historico_gastos").notNull().default(0),
  historicoTransferencias: real("historico_transferencias").notNull().default(0),
  estado: text("estado", { enum: ["activo", "negativo"] }).notNull().default("activo"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
})

// ═══════════════════════════════════════════════════
// DISTRIBUIDORES
// ═══════════════════════════════════════════════════
export const distribuidores = sqliteTable("distribuidores", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  deudaTotal: real("deuda_total").notNull().default(0),
  totalOrdenesCompra: real("total_ordenes_compra").notNull().default(0),
  totalPagado: real("total_pagado").notNull().default(0),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
})

// ═══════════════════════════════════════════════════
// CLIENTES
// ═══════════════════════════════════════════════════
export const clientes = sqliteTable("clientes", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  deudaTotal: real("deuda_total").notNull().default(0),
  totalVentas: real("total_ventas").notNull().default(0),
  totalPagado: real("total_pagado").notNull().default(0),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
})

// ═══════════════════════════════════════════════════
// ORDENES DE COMPRA
// ═══════════════════════════════════════════════════
export const ordenesCompra = sqliteTable("ordenes_compra", {
  id: text("id").primaryKey(),
  fecha: text("fecha").notNull(),
  origen: text("origen").notNull(),
  distribuidor: text("distribuidor").notNull(),
  producto: text("producto").notNull(),
  cantidad: integer("cantidad").notNull(),
  costoDistribuidor: real("costo_distribuidor").notNull(),
  costoTransporte: real("costo_transporte").notNull().default(0),
  costoPorUnidad: real("costo_por_unidad").notNull(),
  costoTotal: real("costo_total").notNull(),
  pagoDistribuidor: real("pago_distribuidor").notNull().default(0),
  deuda: real("deuda").notNull().default(0),
  estado: text("estado", { enum: ["pendiente", "parcial", "pagado"] }).notNull().default("pendiente"),
  bancoOrigen: text("banco_origen"),
  distribuidorId: text("distribuidor_id").references(() => distribuidores.id),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
})

// ═══════════════════════════════════════════════════
// VENTAS
// ═══════════════════════════════════════════════════
export const ventas = sqliteTable("ventas", {
  id: text("id").primaryKey(),
  fecha: text("fecha").notNull(),
  cliente: text("cliente").notNull(),
  producto: text("producto").notNull(),
  cantidad: integer("cantidad").notNull(),
  precioVentaUnidad: real("precio_venta_unidad").notNull(),
  precioCompraUnidad: real("precio_compra_unidad").notNull(),
  precioFlete: real("precio_flete").notNull().default(500),
  precioTotalUnidad: real("precio_total_unidad").notNull(),
  precioTotalVenta: real("precio_total_venta").notNull(),
  // Distribución en bancos (stored as JSON)
  distribucionBancosJson: text("distribucion_bancos_json").notNull().default("{}"),
  montoPagado: real("monto_pagado").notNull().default(0),
  montoRestante: real("monto_restante").notNull().default(0),
  estadoPago: text("estado_pago", { enum: ["completo", "parcial", "pendiente"] }).notNull().default("pendiente"),
  clienteId: text("cliente_id").references(() => clientes.id),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
})

// ═══════════════════════════════════════════════════
// PRODUCTOS
// ═══════════════════════════════════════════════════
export const productos = sqliteTable("productos", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  origen: text("origen").notNull().default(""),
  stockActual: integer("stock_actual").notNull().default(0),
  totalEntradas: integer("total_entradas").notNull().default(0),
  totalSalidas: integer("total_salidas").notNull().default(0),
  valorUnitario: real("valor_unitario").notNull().default(0),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
})

// ═══════════════════════════════════════════════════
// MOVIMIENTOS DE ALMACÉN (entradas y salidas)
// ═══════════════════════════════════════════════════
export const movimientosAlmacen = sqliteTable("movimientos_almacen", {
  id: text("id").primaryKey(),
  productoId: text("producto_id").notNull().references(() => productos.id),
  tipo: text("tipo", { enum: ["entrada", "salida"] }).notNull(),
  fecha: text("fecha").notNull(),
  cantidad: integer("cantidad").notNull(),
  origen: text("origen"),
  destino: text("destino"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
})

// ═══════════════════════════════════════════════════
// INGRESOS BANCO
// ═══════════════════════════════════════════════════
export const ingresosBanco = sqliteTable("ingresos_banco", {
  id: text("id").primaryKey(),
  tipo: text("tipo").notNull().default("ingreso"),
  fecha: text("fecha").notNull(),
  monto: real("monto").notNull(),
  origen: text("origen").notNull().default(""),
  concepto: text("concepto").notNull().default(""),
  bancoId: text("banco_id").notNull().references(() => bancos.id),
  referencia: text("referencia"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
})

// ═══════════════════════════════════════════════════
// GASTOS BANCO
// ═══════════════════════════════════════════════════
export const gastosBanco = sqliteTable("gastos_banco", {
  id: text("id").primaryKey(),
  tipo: text("tipo").notNull().default("gasto"),
  fecha: text("fecha").notNull(),
  monto: real("monto").notNull(),
  destino: text("destino").notNull().default(""),
  concepto: text("concepto").notNull().default(""),
  bancoId: text("banco_id").notNull().references(() => bancos.id),
  referencia: text("referencia"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
})

// ═══════════════════════════════════════════════════
// TRANSFERENCIAS
// ═══════════════════════════════════════════════════
export const transferencias = sqliteTable("transferencias", {
  id: text("id").primaryKey(),
  fecha: text("fecha").notNull(),
  tipo: text("tipo", { enum: ["entrada", "salida"] }).notNull(),
  monto: real("monto").notNull(),
  bancoOrigen: text("banco_origen").notNull().references(() => bancos.id),
  bancoDestino: text("banco_destino").notNull().references(() => bancos.id),
  concepto: text("concepto").notNull().default(""),
  referencia: text("referencia"),
  estado: text("estado").notNull().default("completado"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
})

// ═══════════════════════════════════════════════════
// HISTORIAL DE PAGOS
// ═══════════════════════════════════════════════════
export const historialPagos = sqliteTable("historial_pagos", {
  id: text("id").primaryKey().$defaultFn(() => `pago-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
  fecha: text("fecha").notNull(),
  monto: real("monto").notNull(),
  bancoOrigen: text("banco_origen"),
  ordenCompraId: text("orden_compra_id"),
  ventaId: text("venta_id"),
  distribuidorId: text("distribuidor_id").references(() => distribuidores.id),
  clienteId: text("cliente_id").references(() => clientes.id),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
})

// ═══════════════════════════════════════════════════
// CORTES BANCARIOS
// ═══════════════════════════════════════════════════
export const cortesBancarios = sqliteTable("cortes_bancarios", {
  id: text("id").primaryKey(),
  bancoId: text("banco_id").notNull().references(() => bancos.id),
  periodo: text("periodo", { enum: ["diario", "semanal", "mensual", "trimestral", "anual"] }).notNull(),
  fechaInicio: text("fecha_inicio").notNull(),
  fechaFin: text("fecha_fin").notNull(),
  capitalInicial: real("capital_inicial").notNull(),
  totalIngresosPeriodo: real("total_ingresos_periodo").notNull().default(0),
  totalGastosPeriodo: real("total_gastos_periodo").notNull().default(0),
  capitalFinal: real("capital_final").notNull(),
  diferencia: real("diferencia").notNull().default(0),
  variacionPorcentaje: real("variacion_porcentaje").notNull().default(0),
  estado: text("estado", { enum: ["positivo", "negativo", "neutro"] }).notNull().default("neutro"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
})

// ═══════════════════════════════════════════════════
// OPERACIONES (log de operaciones por banco)
// ═══════════════════════════════════════════════════
export const operaciones = sqliteTable("operaciones", {
  id: text("id").primaryKey(),
  bancoId: text("banco_id").notNull().references(() => bancos.id),
  tipo: text("tipo", { enum: ["ingreso", "gasto", "transferencia_entrada", "transferencia_salida"] }).notNull(),
  fecha: text("fecha").notNull(),
  monto: real("monto").notNull(),
  concepto: text("concepto").notNull().default(""),
  referencia: text("referencia"),
  bancoRelacionado: text("banco_relacionado"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
})
