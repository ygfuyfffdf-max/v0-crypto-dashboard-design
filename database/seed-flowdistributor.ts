// database/seed-flowdistributor.ts
// ══════════════════════════════════════════════════════════════════════════════
// SEED COMPLETO - FLOWDISTRIBUTOR LOGIC
// Implementa la lógica sagrada completa del sistema
// ══════════════════════════════════════════════════════════════════════════════

import Database from 'better-sqlite3'

const db = new Database('sqlite.db')

// Generar IDs únicos
const generateId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

console.log('🚀 Iniciando seed completo de FlowDistributor...\n')

// ══════════════════════════════════════════════════════════════════════════════
// 1. LIMPIAR TABLAS EXISTENTES
// ══════════════════════════════════════════════════════════════════════════════
console.log('🗑️  Limpiando tablas existentes...')

const tables = [
  'movimientos',
  'abonos',
  'ventas',
  'ordenes_compra',
  'almacen',
  'clientes',
  'distribuidores',
  'bancos',
]

tables.forEach((table) => {
  try {
    db.exec(`DELETE FROM ${table}`)
  } catch (e) {
    // Tabla no existe, crearla
  }
})

// ══════════════════════════════════════════════════════════════════════════════
// 2. CREAR SCHEMA SI NO EXISTE
// ══════════════════════════════════════════════════════════════════════════════
console.log('📦 Verificando/Creando schema...')

db.exec(`
CREATE TABLE IF NOT EXISTS bancos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  capital_actual REAL DEFAULT 0 NOT NULL,
  capital_minimo REAL DEFAULT 0,
  capital_maximo REAL DEFAULT 0,
  historico_ingresos REAL DEFAULT 0 NOT NULL,
  historico_gastos REAL DEFAULT 0 NOT NULL,
  historico_transferencias_entrada REAL DEFAULT 0,
  historico_transferencias_salida REAL DEFAULT 0,
  ingresos_hoy REAL DEFAULT 0,
  gastos_hoy REAL DEFAULT 0,
  flujo_neto_hoy REAL DEFAULT 0,
  movimientos_hoy INTEGER DEFAULT 0,
  ingresos_semana REAL DEFAULT 0,
  gastos_semana REAL DEFAULT 0,
  flujo_neto_semana REAL DEFAULT 0,
  movimientos_semana INTEGER DEFAULT 0,
  ingresos_mes REAL DEFAULT 0,
  gastos_mes REAL DEFAULT 0,
  flujo_neto_mes REAL DEFAULT 0,
  movimientos_mes INTEGER DEFAULT 0,
  promedio_ingresos_diario REAL DEFAULT 0,
  promedio_gastos_diario REAL DEFAULT 0,
  porcentaje_ventas REAL DEFAULT 0,
  porcentaje_transferencias REAL DEFAULT 0,
  porcentaje_manual REAL DEFAULT 0,
  porcentaje_distribucion_gya REAL DEFAULT 0,
  tendencia_capital TEXT DEFAULT 'estable',
  tendencia_flujo TEXT DEFAULT 'neutro',
  variacion_mes_anterior REAL DEFAULT 0,
  variacion_semana_anterior REAL DEFAULT 0,
  proyeccion_fin_mes REAL DEFAULT 0,
  dias_hasta_agotamiento INTEGER,
  proyeccion_tres_meses REAL DEFAULT 0,
  score_liquidez INTEGER DEFAULT 50,
  score_flujo INTEGER DEFAULT 50,
  score_estabilidad INTEGER DEFAULT 50,
  score_total INTEGER DEFAULT 50,
  estado_salud TEXT DEFAULT 'bueno',
  color TEXT NOT NULL,
  icono TEXT,
  orden INTEGER DEFAULT 0,
  activo INTEGER DEFAULT 1,
  alertas TEXT,
  notas TEXT,
  ultimo_movimiento INTEGER,
  ultima_actualizacion_flujo INTEGER,
  ultima_actualizacion_metricas TEXT,
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  rfc TEXT,
  total_compras REAL DEFAULT 0,
  numero_ventas INTEGER DEFAULT 0,
  promedio_compra REAL DEFAULT 0,
  ultima_compra INTEGER,
  dias_sin_comprar INTEGER DEFAULT 0,
  total_pagado REAL DEFAULT 0,
  total_abonos REAL DEFAULT 0,
  numero_abonos INTEGER DEFAULT 0,
  promedio_abono REAL DEFAULT 0,
  saldo_pendiente REAL DEFAULT 0,
  deuda_maxima_historica REAL DEFAULT 0,
  ventas_pendientes INTEGER DEFAULT 0,
  limite_credito REAL DEFAULT 0,
  credito_disponible REAL DEFAULT 0,
  porcentaje_utilizacion REAL DEFAULT 0,
  porcentaje_pago_puntual REAL DEFAULT 0,
  dias_promedio_credito REAL DEFAULT 0,
  frecuencia_compra REAL DEFAULT 0,
  ganancia_generada REAL DEFAULT 0,
  ticket_promedio REAL DEFAULT 0,
  valor_vida_cliente REAL DEFAULT 0,
  score_credito INTEGER DEFAULT 50,
  score_frecuencia INTEGER DEFAULT 50,
  score_rentabilidad INTEGER DEFAULT 50,
  score_total INTEGER DEFAULT 50,
  categoria TEXT DEFAULT 'nuevo',
  estado TEXT DEFAULT 'activo',
  alertas TEXT,
  notas TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS distribuidores (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  empresa TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  tipo_productos TEXT,
  total_ordenes_compra REAL DEFAULT 0,
  numero_ordenes INTEGER DEFAULT 0,
  promedio_orden REAL DEFAULT 0,
  ultima_orden INTEGER,
  dias_sin_ordenar INTEGER DEFAULT 0,
  total_pagado REAL DEFAULT 0,
  numero_pagos INTEGER DEFAULT 0,
  promedio_pago REAL DEFAULT 0,
  porcentaje_pagado_promedio REAL DEFAULT 0,
  saldo_pendiente REAL DEFAULT 0,
  deuda_maxima_historica REAL DEFAULT 0,
  ordenes_con_deuda INTEGER DEFAULT 0,
  dias_promedio_credito REAL DEFAULT 0,
  stock_total INTEGER DEFAULT 0,
  stock_vendido INTEGER DEFAULT 0,
  porcentaje_stock_vendido REAL DEFAULT 0,
  rotacion_promedio REAL DEFAULT 0,
  velocidad_venta_promedio REAL DEFAULT 0,
  eficiencia_rotacion TEXT DEFAULT 'normal',
  ventas_generadas REAL DEFAULT 0,
  ganancia_generada REAL DEFAULT 0,
  margen_promedio REAL DEFAULT 0,
  roi_promedio REAL DEFAULT 0,
  ganancia_neta_promedio REAL DEFAULT 0,
  score_calidad INTEGER DEFAULT 50,
  score_precio INTEGER DEFAULT 50,
  score_relacion INTEGER DEFAULT 50,
  score_rotacion INTEGER DEFAULT 50,
  score_total INTEGER DEFAULT 50,
  categoria TEXT DEFAULT 'nuevo',
  estado TEXT DEFAULT 'activo',
  confiabilidad REAL DEFAULT 0,
  tiempo_promedio_entrega REAL,
  alertas TEXT,
  notas TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS almacen (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  sku TEXT,
  stock_actual INTEGER DEFAULT 0 NOT NULL,
  stock_minimo INTEGER DEFAULT 0,
  stock_maximo INTEGER,
  precio_compra_promedio REAL DEFAULT 0,
  precio_venta_sugerido REAL DEFAULT 0,
  total_entradas INTEGER DEFAULT 0,
  total_salidas INTEGER DEFAULT 0,
  valor_inventario REAL DEFAULT 0,
  estado TEXT DEFAULT 'disponible',
  activo INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS ordenes_compra (
  id TEXT PRIMARY KEY,
  distribuidor_id TEXT NOT NULL,
  producto_id TEXT,
  fecha INTEGER NOT NULL,
  numero_orden TEXT UNIQUE,
  producto TEXT,
  cantidad INTEGER NOT NULL,
  stock_actual INTEGER DEFAULT 0 NOT NULL,
  stock_vendido INTEGER DEFAULT 0,
  stock_reservado INTEGER DEFAULT 0,
  precio_unitario REAL NOT NULL,
  flete_unitario REAL DEFAULT 0,
  costo_unitario_total REAL,
  subtotal REAL NOT NULL,
  flete_total REAL DEFAULT 0,
  iva REAL DEFAULT 0,
  total REAL NOT NULL,
  monto_pagado REAL DEFAULT 0,
  monto_restante REAL NOT NULL,
  porcentaje_pagado REAL DEFAULT 0,
  numero_pagos INTEGER DEFAULT 0,
  fecha_ultimo_pago INTEGER,
  estado TEXT DEFAULT 'pendiente',
  total_ventas_generadas REAL DEFAULT 0,
  piezas_vendidas INTEGER DEFAULT 0,
  precio_venta_promedio REAL DEFAULT 0,
  numero_ventas INTEGER DEFAULT 0,
  monto_cobrado REAL DEFAULT 0,
  monto_sin_cobrar REAL DEFAULT 0,
  porcentaje_cobrado REAL DEFAULT 0,
  ganancia_total REAL DEFAULT 0,
  ganancia_realizada REAL DEFAULT 0,
  ganancia_potencial REAL DEFAULT 0,
  margen_bruto REAL DEFAULT 0,
  margen_sobre_costo REAL DEFAULT 0,
  roi REAL DEFAULT 0,
  efectivo_neto REAL DEFAULT 0,
  velocidad_venta REAL DEFAULT 0,
  dias_estimados_agotamiento INTEGER,
  rotacion_dias REAL,
  dias_desde_compra INTEGER DEFAULT 0,
  porcentaje_vendido REAL DEFAULT 0,
  tiempo_promedio_venta_pieza REAL,
  eficiencia_rotacion TEXT DEFAULT 'normal',
  estado_stock TEXT DEFAULT 'disponible',
  estado_rentabilidad TEXT DEFAULT 'sin_datos',
  banco_origen_id TEXT,
  observaciones TEXT,
  alertas TEXT,
  created_by TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS ventas (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL,
  producto_id TEXT,
  oc_id TEXT,
  fecha INTEGER NOT NULL,
  estado TEXT DEFAULT 'activa',
  cantidad INTEGER NOT NULL,
  precio_venta_unidad REAL NOT NULL,
  precio_compra_unidad REAL NOT NULL,
  precio_flete REAL DEFAULT 0,
  precio_flete_unidad REAL DEFAULT 0,
  precio_total_venta REAL NOT NULL,
  costo_total REAL DEFAULT 0,
  flete_total REAL DEFAULT 0,
  monto_pagado REAL DEFAULT 0,
  monto_restante REAL NOT NULL,
  porcentaje_pagado REAL DEFAULT 0,
  estado_pago TEXT DEFAULT 'pendiente',
  numero_abonos INTEGER DEFAULT 0,
  fecha_primer_abono INTEGER,
  fecha_ultimo_abono INTEGER,
  fecha_pago_completo INTEGER,
  monto_boveda_monte REAL DEFAULT 0,
  monto_fletes REAL DEFAULT 0,
  monto_utilidades REAL DEFAULT 0,
  capital_boveda_monte REAL DEFAULT 0,
  capital_fletes REAL DEFAULT 0,
  capital_utilidades REAL DEFAULT 0,
  ganancia_total REAL DEFAULT 0,
  ganancia_neta_venta REAL DEFAULT 0,
  margen_bruto REAL DEFAULT 0,
  margen_neto REAL DEFAULT 0,
  margen_sobre_costo REAL DEFAULT 0,
  ganancia_por_unidad REAL DEFAULT 0,
  dias_de_credito INTEGER DEFAULT 0,
  dias_para_pago INTEGER,
  es_moroso INTEGER DEFAULT 0,
  fecha_vencimiento INTEGER,
  origen_lotes TEXT,
  numero_lotes INTEGER DEFAULT 0,
  metodo_pago TEXT,
  banco_destino TEXT,
  observaciones TEXT,
  alertas TEXT,
  created_by TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS movimientos (
  id TEXT PRIMARY KEY,
  banco_id TEXT NOT NULL,
  tipo TEXT NOT NULL,
  concepto TEXT NOT NULL,
  descripcion TEXT,
  monto REAL NOT NULL,
  saldo_anterior REAL NOT NULL,
  saldo_posterior REAL NOT NULL,
  referencia_id TEXT,
  referencia_tipo TEXT,
  banco_origen_id TEXT,
  banco_destino_id TEXT,
  fecha INTEGER NOT NULL DEFAULT (unixepoch()),
  created_by TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS abonos (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL,
  referencia_id TEXT NOT NULL,
  monto REAL NOT NULL,
  monto_anterior REAL NOT NULL,
  monto_posterior REAL NOT NULL,
  saldo_anterior REAL NOT NULL,
  saldo_posterior REAL NOT NULL,
  banco_origen_id TEXT,
  metodo_pago TEXT,
  concepto TEXT,
  observaciones TEXT,
  fecha INTEGER NOT NULL DEFAULT (unixepoch()),
  created_by TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_bancos_tipo ON bancos(tipo);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_distribuidores_nombre ON distribuidores(nombre);
CREATE INDEX IF NOT EXISTS idx_oc_distribuidor ON ordenes_compra(distribuidor_id);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_movimientos_banco ON movimientos(banco_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos(fecha);
`)

// ══════════════════════════════════════════════════════════════════════════════
// 3. INSERTAR LOS 6 BANCOS SAGRADOS
// ══════════════════════════════════════════════════════════════════════════════
console.log('🏦 Creando los 6 bancos sagrados...')

const bancos = [
  // BANCOS QUE RECIBEN DISTRIBUCIÓN DE VENTAS (GYA)
  {
    id: 'boveda_monte',
    nombre: 'Bóveda Monte',
    tipo: 'operativo',
    color: '#8B5CF6', // violet
    icono: 'Vault',
    orden: 1,
    notas:
      'Recibe: precioCompraUnidad × cantidad de cada venta. Capital varía por gastos/transferencias.',
  },
  {
    id: 'flete_sur',
    nombre: 'Fletes',
    tipo: 'flete',
    color: '#F59E0B', // amber
    icono: 'Truck',
    orden: 2,
    notas:
      'Recibe: precioFlete × cantidad de cada venta (default 500 USD/unidad). Capital varía por gastos/transferencias.',
  },
  {
    id: 'utilidades',
    nombre: 'Utilidades',
    tipo: 'ganancia',
    color: '#10B981', // emerald
    icono: 'TrendingUp',
    orden: 3,
    notas:
      'Recibe: (precioVenta - precioCompra - precioFlete) × cantidad. GANANCIA NETA de cada venta.',
  },
  // BANCOS INDEPENDIENTES (capital por ingresos manuales o transferencias)
  {
    id: 'azteca',
    nombre: 'Azteca',
    tipo: 'inversion',
    color: '#EF4444', // red
    icono: 'Landmark',
    orden: 4,
    notas: 'Capital por ingresos manuales o transferencias. No recibe distribución de ventas.',
  },
  {
    id: 'leftie',
    nombre: 'Leftie',
    tipo: 'ahorro',
    color: '#3B82F6', // blue
    icono: 'PiggyBank',
    orden: 5,
    notas: 'Capital por ingresos manuales o transferencias. No recibe distribución de ventas.',
  },
  {
    id: 'profit',
    nombre: 'Profit',
    tipo: 'ganancia',
    color: '#EC4899', // pink
    icono: 'Gem',
    orden: 6,
    notas: 'Capital por ingresos manuales o transferencias. No recibe distribución de ventas.',
  },
]

const insertBanco = db.prepare(`
  INSERT INTO bancos (id, nombre, tipo, color, icono, orden, notas, capital_actual, historico_ingresos, historico_gastos)
  VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0)
`)

bancos.forEach((banco) => {
  insertBanco.run(
    banco.id,
    banco.nombre,
    banco.tipo,
    banco.color,
    banco.icono,
    banco.orden,
    banco.notas,
  )
  console.log(`   ✅ ${banco.nombre} (${banco.id})`)
})

// ══════════════════════════════════════════════════════════════════════════════
// 4. CREAR DISTRIBUIDORES DE EJEMPLO
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n👥 Creando distribuidores...')

const distribuidores = [
  {
    id: 'dist_001',
    nombre: 'Distribuidora Norte SA',
    empresa: 'Dist Norte',
    telefono: '+52 555 1234567',
    email: 'ventas@distnorte.com',
    tipo_productos: 'Electrónicos',
  },
  {
    id: 'dist_002',
    nombre: 'Importadora Global',
    empresa: 'ImpGlobal',
    telefono: '+52 555 7654321',
    email: 'contacto@impglobal.com',
    tipo_productos: 'Varios',
  },
  {
    id: 'dist_003',
    nombre: 'Tech Supplies MX',
    empresa: 'TechSupplies',
    telefono: '+52 555 9876543',
    email: 'orders@techsupplies.mx',
    tipo_productos: 'Tecnología',
  },
]

const insertDistribuidor = db.prepare(`
  INSERT INTO distribuidores (id, nombre, empresa, telefono, email, tipo_productos, saldo_pendiente, total_ordenes_compra)
  VALUES (?, ?, ?, ?, ?, ?, 0, 0)
`)

distribuidores.forEach((d) => {
  insertDistribuidor.run(d.id, d.nombre, d.empresa, d.telefono, d.email, d.tipo_productos)
  console.log(`   ✅ ${d.nombre}`)
})

// ══════════════════════════════════════════════════════════════════════════════
// 5. CREAR PRODUCTOS EN ALMACÉN
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n📦 Creando productos en almacén...')

const productos = [
  {
    id: 'prod_001',
    nombre: 'iPhone 15 Pro Max',
    descripcion: 'Smartphone Apple 256GB',
    categoria: 'Electrónicos',
    sku: 'IPH15PM256',
    stock_minimo: 5,
    precio_compra_promedio: 20000,
    precio_venta_sugerido: 28000,
  },
  {
    id: 'prod_002',
    nombre: 'MacBook Pro M3',
    descripcion: 'Laptop Apple 14" 512GB',
    categoria: 'Computadoras',
    sku: 'MBP14M3512',
    stock_minimo: 3,
    precio_compra_promedio: 35000,
    precio_venta_sugerido: 48000,
  },
  {
    id: 'prod_003',
    nombre: 'AirPods Pro 2',
    descripcion: 'Audífonos inalámbricos',
    categoria: 'Accesorios',
    sku: 'APP2',
    stock_minimo: 10,
    precio_compra_promedio: 4000,
    precio_venta_sugerido: 6500,
  },
]

const insertProducto = db.prepare(`
  INSERT INTO almacen (id, nombre, descripcion, categoria, sku, stock_minimo, precio_compra_promedio, precio_venta_sugerido, stock_actual, total_entradas, total_salidas)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)
`)

productos.forEach((p) => {
  insertProducto.run(
    p.id,
    p.nombre,
    p.descripcion,
    p.categoria,
    p.sku,
    p.stock_minimo,
    p.precio_compra_promedio,
    p.precio_venta_sugerido,
  )
  console.log(`   ✅ ${p.nombre} (SKU: ${p.sku})`)
})

// ══════════════════════════════════════════════════════════════════════════════
// 6. CREAR ÓRDENES DE COMPRA CON LÓGICA COMPLETA
// ══════════════════════════════════════════════════════════════════════════════
console.log(
  '\n📋 Creando órdenes de compra (generan adeudo a distribuidores y entradas al almacén)...',
)

const now = Math.floor(Date.now() / 1000)
const dia = 86400

// ORDEN DE COMPRA 1: Completamente pagada
const oc1 = {
  id: 'oc_001',
  distribuidor_id: 'dist_001',
  producto_id: 'prod_001',
  fecha: now - 30 * dia,
  numero_orden: 'OC-2025-001',
  producto: 'iPhone 15 Pro Max',
  cantidad: 20,
  precio_unitario: 20000,
  flete_unitario: 300,
  // Calculados
  get costo_unitario_total() {
    return this.precio_unitario + this.flete_unitario
  },
  get subtotal() {
    return this.precio_unitario * this.cantidad
  },
  get flete_total() {
    return this.flete_unitario * this.cantidad
  },
  get total() {
    return this.costo_unitario_total * this.cantidad
  },
  monto_pagado: 406000, // PAGADO COMPLETO
  get monto_restante() {
    return this.total - this.monto_pagado
  },
  estado: 'completo',
  stock_vendido: 15, // 15 vendidos
  get stock_actual() {
    return this.cantidad - this.stock_vendido
  },
}

// ORDEN DE COMPRA 2: Parcialmente pagada (genera adeudo)
const oc2 = {
  id: 'oc_002',
  distribuidor_id: 'dist_002',
  producto_id: 'prod_002',
  fecha: now - 15 * dia,
  numero_orden: 'OC-2025-002',
  producto: 'MacBook Pro M3',
  cantidad: 10,
  precio_unitario: 35000,
  flete_unitario: 500,
  get costo_unitario_total() {
    return this.precio_unitario + this.flete_unitario
  },
  get subtotal() {
    return this.precio_unitario * this.cantidad
  },
  get flete_total() {
    return this.flete_unitario * this.cantidad
  },
  get total() {
    return this.costo_unitario_total * this.cantidad
  },
  monto_pagado: 200000, // PARCIAL: pagamos 200,000 de 355,000
  get monto_restante() {
    return this.total - this.monto_pagado
  },
  estado: 'parcial',
  stock_vendido: 5,
  get stock_actual() {
    return this.cantidad - this.stock_vendido
  },
}

// ORDEN DE COMPRA 3: Pendiente de pago (genera adeudo total)
const oc3 = {
  id: 'oc_003',
  distribuidor_id: 'dist_003',
  producto_id: 'prod_003',
  fecha: now - 5 * dia,
  numero_orden: 'OC-2025-003',
  producto: 'AirPods Pro 2',
  cantidad: 50,
  precio_unitario: 4000,
  flete_unitario: 100,
  get costo_unitario_total() {
    return this.precio_unitario + this.flete_unitario
  },
  get subtotal() {
    return this.precio_unitario * this.cantidad
  },
  get flete_total() {
    return this.flete_unitario * this.cantidad
  },
  get total() {
    return this.costo_unitario_total * this.cantidad
  },
  monto_pagado: 0, // PENDIENTE: no hemos pagado nada
  get monto_restante() {
    return this.total - this.monto_pagado
  },
  estado: 'pendiente',
  stock_vendido: 20,
  get stock_actual() {
    return this.cantidad - this.stock_vendido
  },
}

const ordenesCompra = [oc1, oc2, oc3]

const insertOC = db.prepare(`
  INSERT INTO ordenes_compra (
    id, distribuidor_id, producto_id, fecha, numero_orden, producto, cantidad,
    precio_unitario, flete_unitario, costo_unitario_total, subtotal, flete_total, total,
    monto_pagado, monto_restante, porcentaje_pagado, estado,
    stock_actual, stock_vendido, estado_stock
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

ordenesCompra.forEach((oc) => {
  const porcentajePagado = (oc.monto_pagado / oc.total) * 100
  const estadoStock = oc.stock_actual > 0 ? 'disponible' : 'agotado'

  insertOC.run(
    oc.id,
    oc.distribuidor_id,
    oc.producto_id,
    oc.fecha,
    oc.numero_orden,
    oc.producto,
    oc.cantidad,
    oc.precio_unitario,
    oc.flete_unitario,
    oc.costo_unitario_total,
    oc.subtotal,
    oc.flete_total,
    oc.total,
    oc.monto_pagado,
    oc.monto_restante,
    porcentajePagado,
    oc.estado,
    oc.stock_actual,
    oc.stock_vendido,
    estadoStock,
  )
  console.log(
    `   ✅ ${oc.numero_orden}: ${oc.producto} x${oc.cantidad} - Total: $${oc.total.toLocaleString()} - Pagado: $${oc.monto_pagado.toLocaleString()} - Adeudo: $${oc.monto_restante.toLocaleString()}`,
  )
})

// ══════════════════════════════════════════════════════════════════════════════
// 7. ACTUALIZAR ALMACÉN (ENTRADAS de OC)
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n📊 Actualizando stock en almacén (entradas de OC)...')

const updateAlmacen = db.prepare(`
  UPDATE almacen SET
    stock_actual = stock_actual + ?,
    total_entradas = total_entradas + ?,
    valor_inventario = (stock_actual + ?) * precio_compra_promedio
  WHERE id = ?
`)

// Actualizar stock por cada OC
db.exec(
  "UPDATE almacen SET stock_actual = 5, total_entradas = 20, total_salidas = 15 WHERE id = 'prod_001'",
)
db.exec(
  "UPDATE almacen SET stock_actual = 5, total_entradas = 10, total_salidas = 5 WHERE id = 'prod_002'",
)
db.exec(
  "UPDATE almacen SET stock_actual = 30, total_entradas = 50, total_salidas = 20 WHERE id = 'prod_003'",
)

console.log('   ✅ Stock actualizado desde órdenes de compra')

// ══════════════════════════════════════════════════════════════════════════════
// 8. ACTUALIZAR DISTRIBUIDORES (Adeudos)
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n💰 Actualizando adeudos de distribuidores...')

// Distribuidor 1: Sin adeudo (OC pagada completa)
db.exec(`UPDATE distribuidores SET
  saldo_pendiente = 0,
  total_ordenes_compra = 406000,
  total_pagado = 406000,
  numero_ordenes = 1,
  ordenes_con_deuda = 0
  WHERE id = 'dist_001'`)
console.log('   ✅ Distribuidora Norte SA: Adeudo $0 (pagado completo)')

// Distribuidor 2: Adeudo parcial
const adeudo2 = oc2.monto_restante // 355,000 - 200,000 = 155,000
db.exec(`UPDATE distribuidores SET
  saldo_pendiente = ${adeudo2},
  total_ordenes_compra = 355000,
  total_pagado = 200000,
  numero_ordenes = 1,
  ordenes_con_deuda = 1
  WHERE id = 'dist_002'`)
console.log(`   ✅ Importadora Global: Adeudo $${adeudo2.toLocaleString()} (parcial)`)

// Distribuidor 3: Adeudo total
const adeudo3 = oc3.total // 205,000
db.exec(`UPDATE distribuidores SET
  saldo_pendiente = ${adeudo3},
  total_ordenes_compra = 205000,
  total_pagado = 0,
  numero_ordenes = 1,
  ordenes_con_deuda = 1
  WHERE id = 'dist_003'`)
console.log(`   ✅ Tech Supplies MX: Adeudo $${adeudo3.toLocaleString()} (pendiente total)`)

// ══════════════════════════════════════════════════════════════════════════════
// 9. CREAR CLIENTES
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n👤 Creando clientes...')

const clientes = [
  {
    id: 'cli_001',
    nombre: 'Carlos Mendoza',
    telefono: '+52 555 1111111',
    email: 'carlos@email.com',
  },
  { id: 'cli_002', nombre: 'María García', telefono: '+52 555 2222222', email: 'maria@email.com' },
  {
    id: 'cli_003',
    nombre: 'Roberto López',
    telefono: '+52 555 3333333',
    email: 'roberto@email.com',
  },
  { id: 'cli_004', nombre: 'Ana Martínez', telefono: '+52 555 4444444', email: 'ana@email.com' },
  { id: 'cli_005', nombre: 'Luis Hernández', telefono: '+52 555 5555555', email: 'luis@email.com' },
]

const insertCliente = db.prepare(`
  INSERT INTO clientes (id, nombre, telefono, email, saldo_pendiente, total_compras)
  VALUES (?, ?, ?, ?, 0, 0)
`)

clientes.forEach((c) => {
  insertCliente.run(c.id, c.nombre, c.telefono, c.email)
  console.log(`   ✅ ${c.nombre}`)
})

// ══════════════════════════════════════════════════════════════════════════════
// 10. CREAR VENTAS CON DISTRIBUCIÓN GYA COMPLETA
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n🛒 Creando ventas con distribución GYA (Bóveda Monte, Fletes, Utilidades)...')

/*
  LÓGICA SAGRADA DE DISTRIBUCIÓN:
  ═══════════════════════════════════════════════════════════════
  Por cada venta:
  - BÓVEDA MONTE recibe: precioCompraUnidad × cantidad (COSTO)
  - FLETES recibe: precioFlete × cantidad (default 500/unidad)
  - UTILIDADES recibe: (precioVenta - precioCompra - precioFlete) × cantidad (GANANCIA)

  El CAPITAL se distribuye proporcionalmente al ESTADO DE PAGO:
  - COMPLETO: 100% del monto va al capital
  - PARCIAL: proporción × monto va al capital
  - PENDIENTE: 0 al capital (solo histórico)
*/

interface VentaData {
  id: string
  cliente_id: string
  oc_id: string
  producto_id: string
  fecha: number
  cantidad: number
  precio_venta_unidad: number
  precio_compra_unidad: number
  precio_flete: number
  estado_pago: 'completo' | 'parcial' | 'pendiente'
  monto_pagado: number
}

const ventasData: VentaData[] = [
  // VENTA 1: PAGADA COMPLETO - Carlos compra 3 iPhones
  {
    id: 'venta_001',
    cliente_id: 'cli_001',
    oc_id: 'oc_001',
    producto_id: 'prod_001',
    fecha: now - 25 * dia,
    cantidad: 3,
    precio_venta_unidad: 28000, // Precio de venta
    precio_compra_unidad: 20000, // Costo del distribuidor
    precio_flete: 500, // Flete por unidad
    estado_pago: 'completo',
    monto_pagado: 84000, // 28000 × 3 = 84000 (pagado completo)
  },
  // VENTA 2: PARCIAL - María compra 2 MacBooks, paga 50%
  {
    id: 'venta_002',
    cliente_id: 'cli_002',
    oc_id: 'oc_002',
    producto_id: 'prod_002',
    fecha: now - 10 * dia,
    cantidad: 2,
    precio_venta_unidad: 48000,
    precio_compra_unidad: 35000,
    precio_flete: 500,
    estado_pago: 'parcial',
    monto_pagado: 48000, // 48000 × 2 = 96000, paga 48000 (50%)
  },
  // VENTA 3: PENDIENTE - Roberto compra 5 AirPods, no paga nada
  {
    id: 'venta_003',
    cliente_id: 'cli_003',
    oc_id: 'oc_003',
    producto_id: 'prod_003',
    fecha: now - 3 * dia,
    cantidad: 5,
    precio_venta_unidad: 6500,
    precio_compra_unidad: 4000,
    precio_flete: 500,
    estado_pago: 'pendiente',
    monto_pagado: 0,
  },
  // VENTA 4: COMPLETO - Ana compra 5 iPhones
  {
    id: 'venta_004',
    cliente_id: 'cli_004',
    oc_id: 'oc_001',
    producto_id: 'prod_001',
    fecha: now - 20 * dia,
    cantidad: 5,
    precio_venta_unidad: 28000,
    precio_compra_unidad: 20000,
    precio_flete: 500,
    estado_pago: 'completo',
    monto_pagado: 140000,
  },
  // VENTA 5: PARCIAL - Luis compra 10 AirPods, paga 70%
  {
    id: 'venta_005',
    cliente_id: 'cli_005',
    oc_id: 'oc_003',
    producto_id: 'prod_003',
    fecha: now - 2 * dia,
    cantidad: 10,
    precio_venta_unidad: 6500,
    precio_compra_unidad: 4000,
    precio_flete: 500,
    estado_pago: 'parcial',
    monto_pagado: 45500, // 65000 total, paga 45500 (70%)
  },
]

const insertVenta = db.prepare(`
  INSERT INTO ventas (
    id, cliente_id, oc_id, producto_id, fecha, cantidad,
    precio_venta_unidad, precio_compra_unidad, precio_flete, precio_flete_unidad,
    precio_total_venta, costo_total, flete_total,
    monto_pagado, monto_restante, porcentaje_pagado, estado_pago,
    monto_boveda_monte, monto_fletes, monto_utilidades,
    capital_boveda_monte, capital_fletes, capital_utilidades,
    ganancia_total, ganancia_por_unidad, margen_bruto
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

// Acumuladores para los bancos
let historicoBovedaMonte = 0
let historicoFletes = 0
let historicoUtilidades = 0
let capitalBovedaMonte = 0
let capitalFletes = 0
let capitalUtilidades = 0

ventasData.forEach((v) => {
  // Cálculos de la venta
  const precioTotalVenta = v.precio_venta_unidad * v.cantidad
  const costoTotal = v.precio_compra_unidad * v.cantidad
  const fleteTotal = v.precio_flete * v.cantidad
  const montoRestante = precioTotalVenta - v.monto_pagado
  const porcentajePagado = (v.monto_pagado / precioTotalVenta) * 100

  // Distribución GYA (HISTÓRICO - siempre se acumula)
  const montoBovedaMonte = costoTotal // precioCompra × cantidad
  const montoFletes = fleteTotal // flete × cantidad
  const montoUtilidades =
    (v.precio_venta_unidad - v.precio_compra_unidad - v.precio_flete) * v.cantidad // ganancia

  // Distribución CAPITAL (proporcional al pago)
  const proporcion = v.monto_pagado / precioTotalVenta
  const capitalBM = montoBovedaMonte * proporcion
  const capitalFL = montoFletes * proporcion
  const capitalUT = montoUtilidades * proporcion

  // Ganancia
  const gananciaTotal = montoUtilidades
  const gananciaPorUnidad = gananciaTotal / v.cantidad
  const margenBruto = (gananciaTotal / precioTotalVenta) * 100

  // Acumular
  historicoBovedaMonte += montoBovedaMonte
  historicoFletes += montoFletes
  historicoUtilidades += montoUtilidades
  capitalBovedaMonte += capitalBM
  capitalFletes += capitalFL
  capitalUtilidades += capitalUT

  insertVenta.run(
    v.id,
    v.cliente_id,
    v.oc_id,
    v.producto_id,
    v.fecha,
    v.cantidad,
    v.precio_venta_unidad,
    v.precio_compra_unidad,
    v.precio_flete,
    v.precio_flete,
    precioTotalVenta,
    costoTotal,
    fleteTotal,
    v.monto_pagado,
    montoRestante,
    porcentajePagado,
    v.estado_pago,
    montoBovedaMonte,
    montoFletes,
    montoUtilidades,
    capitalBM,
    capitalFL,
    capitalUT,
    gananciaTotal,
    gananciaPorUnidad,
    margenBruto,
  )

  console.log(
    `   ✅ ${v.id}: $${precioTotalVenta.toLocaleString()} - ${v.estado_pago.toUpperCase()}`,
  )
  console.log(
    `      → Bóveda Monte: $${montoBovedaMonte.toLocaleString()} (capital: $${capitalBM.toLocaleString()})`,
  )
  console.log(
    `      → Fletes: $${montoFletes.toLocaleString()} (capital: $${capitalFL.toLocaleString()})`,
  )
  console.log(
    `      → Utilidades: $${montoUtilidades.toLocaleString()} (capital: $${capitalUT.toLocaleString()})`,
  )
})

// ══════════════════════════════════════════════════════════════════════════════
// 11. ACTUALIZAR BANCOS CON DISTRIBUCIÓN GYA
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n🏦 Actualizando bancos con distribución de ventas...')

db.exec(`UPDATE bancos SET
  historico_ingresos = ${historicoBovedaMonte},
  capital_actual = ${capitalBovedaMonte},
  ingresos_mes = ${historicoBovedaMonte},
  porcentaje_distribucion_gya = 100
  WHERE id = 'boveda_monte'`)
console.log(
  `   ✅ Bóveda Monte: Histórico $${historicoBovedaMonte.toLocaleString()} | Capital $${capitalBovedaMonte.toLocaleString()}`,
)

db.exec(`UPDATE bancos SET
  historico_ingresos = ${historicoFletes},
  capital_actual = ${capitalFletes},
  ingresos_mes = ${historicoFletes},
  porcentaje_distribucion_gya = 100
  WHERE id = 'flete_sur'`)
console.log(
  `   ✅ Fletes: Histórico $${historicoFletes.toLocaleString()} | Capital $${capitalFletes.toLocaleString()}`,
)

db.exec(`UPDATE bancos SET
  historico_ingresos = ${historicoUtilidades},
  capital_actual = ${capitalUtilidades},
  ingresos_mes = ${historicoUtilidades},
  porcentaje_distribucion_gya = 100
  WHERE id = 'utilidades'`)
console.log(
  `   ✅ Utilidades: Histórico $${historicoUtilidades.toLocaleString()} | Capital $${capitalUtilidades.toLocaleString()}`,
)

// Bancos independientes con capital inicial
db.exec("UPDATE bancos SET capital_actual = 50000, historico_ingresos = 50000 WHERE id = 'azteca'")
db.exec("UPDATE bancos SET capital_actual = 75000, historico_ingresos = 75000 WHERE id = 'leftie'")
db.exec(
  "UPDATE bancos SET capital_actual = 100000, historico_ingresos = 100000 WHERE id = 'profit'",
)
console.log('   ✅ Azteca, Leftie, Profit: Capital inicial configurado')

// ══════════════════════════════════════════════════════════════════════════════
// 12. ACTUALIZAR CLIENTES (Deudas)
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n💳 Actualizando deudas de clientes...')

// Carlos: pagó completo, sin deuda
db.exec(
  "UPDATE clientes SET saldo_pendiente = 0, total_compras = 84000, total_pagado = 84000, numero_ventas = 1 WHERE id = 'cli_001'",
)
console.log('   ✅ Carlos Mendoza: Deuda $0 (pagado)')

// María: parcial, debe 48000
db.exec(
  "UPDATE clientes SET saldo_pendiente = 48000, total_compras = 96000, total_pagado = 48000, numero_ventas = 1 WHERE id = 'cli_002'",
)
console.log('   ✅ María García: Deuda $48,000 (parcial)')

// Roberto: pendiente, debe 32500
db.exec(
  "UPDATE clientes SET saldo_pendiente = 32500, total_compras = 32500, total_pagado = 0, numero_ventas = 1 WHERE id = 'cli_003'",
)
console.log('   ✅ Roberto López: Deuda $32,500 (pendiente)')

// Ana: pagó completo
db.exec(
  "UPDATE clientes SET saldo_pendiente = 0, total_compras = 140000, total_pagado = 140000, numero_ventas = 1 WHERE id = 'cli_004'",
)
console.log('   ✅ Ana Martínez: Deuda $0 (pagado)')

// Luis: parcial, debe 19500
db.exec(
  "UPDATE clientes SET saldo_pendiente = 19500, total_compras = 65000, total_pagado = 45500, numero_ventas = 1 WHERE id = 'cli_005'",
)
console.log('   ✅ Luis Hernández: Deuda $19,500 (parcial)')

// ══════════════════════════════════════════════════════════════════════════════
// 13. CREAR MOVIMIENTOS DE EJEMPLO (Transferencias y Gastos)
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n📝 Creando movimientos de ejemplo (transferencias y gastos)...')

const insertMovimiento = db.prepare(`
  INSERT INTO movimientos (id, banco_id, tipo, concepto, descripcion, monto, saldo_anterior, saldo_posterior, banco_origen_id, banco_destino_id, fecha)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

// Transferencia: Utilidades → Azteca de $10,000
const transferencia1 = {
  id: generateId('mov'),
  banco_id: 'utilidades',
  tipo: 'transferencia_salida',
  concepto: 'Transferencia a Azteca',
  descripcion: 'Inversión mensual en Azteca',
  monto: 10000,
  saldo_anterior: capitalUtilidades,
  saldo_posterior: capitalUtilidades - 10000,
  banco_destino_id: 'azteca',
  fecha: now - 1 * dia,
}

insertMovimiento.run(
  transferencia1.id,
  transferencia1.banco_id,
  transferencia1.tipo,
  transferencia1.concepto,
  transferencia1.descripcion,
  transferencia1.monto,
  transferencia1.saldo_anterior,
  transferencia1.saldo_posterior,
  null,
  transferencia1.banco_destino_id,
  transferencia1.fecha,
)

// Movimiento de entrada en Azteca
insertMovimiento.run(
  generateId('mov'),
  'azteca',
  'transferencia_entrada',
  'Transferencia desde Utilidades',
  'Inversión mensual desde Utilidades',
  10000,
  50000,
  60000,
  'utilidades',
  null,
  now - 1 * dia,
)

// Actualizar capitales por transferencia
db.exec(
  "UPDATE bancos SET capital_actual = capital_actual - 10000, historico_transferencias_salida = 10000 WHERE id = 'utilidades'",
)
db.exec(
  "UPDATE bancos SET capital_actual = capital_actual + 10000, historico_transferencias_entrada = 10000 WHERE id = 'azteca'",
)

console.log('   ✅ Transferencia: Utilidades → Azteca: $10,000')

// Gasto: Pago parcial a distribuidor desde Bóveda Monte
const gasto1 = {
  id: generateId('mov'),
  banco_id: 'boveda_monte',
  tipo: 'gasto',
  concepto: 'Pago a distribuidor',
  descripcion: 'Abono a Importadora Global por OC-2025-002',
  monto: 50000,
  saldo_anterior: capitalBovedaMonte,
  saldo_posterior: capitalBovedaMonte - 50000,
  fecha: now - 2 * dia,
}

insertMovimiento.run(
  gasto1.id,
  gasto1.banco_id,
  gasto1.tipo,
  gasto1.concepto,
  gasto1.descripcion,
  gasto1.monto,
  gasto1.saldo_anterior,
  gasto1.saldo_posterior,
  null,
  null,
  gasto1.fecha,
)

db.exec(
  "UPDATE bancos SET capital_actual = capital_actual - 50000, historico_gastos = 50000 WHERE id = 'boveda_monte'",
)
console.log('   ✅ Gasto: Pago a distribuidor desde Bóveda Monte: $50,000')

// ══════════════════════════════════════════════════════════════════════════════
// 14. CREAR ABONOS DE EJEMPLO
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n💵 Creando abonos de ejemplo...')

const insertAbono = db.prepare(`
  INSERT INTO abonos (id, tipo, referencia_id, monto, monto_anterior, monto_posterior, saldo_anterior, saldo_posterior, banco_origen_id, metodo_pago, concepto, fecha)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

// Abono de cliente María (parcial)
insertAbono.run(
  generateId('abono'),
  'venta',
  'venta_002',
  48000,
  0,
  48000,
  96000,
  48000,
  null,
  'transferencia',
  'Abono parcial 50%',
  now - 5 * dia,
)
console.log('   ✅ Abono de María García: $48,000 (50% de su compra)')

// Abono de cliente Luis (parcial)
insertAbono.run(
  generateId('abono'),
  'venta',
  'venta_005',
  45500,
  0,
  45500,
  65000,
  19500,
  null,
  'efectivo',
  'Abono parcial 70%',
  now - 1 * dia,
)
console.log('   ✅ Abono de Luis Hernández: $45,500 (70% de su compra)')

// Abono a distribuidor
insertAbono.run(
  generateId('abono'),
  'orden_compra',
  'oc_002',
  50000,
  200000,
  250000,
  155000,
  105000,
  'boveda_monte',
  'transferencia',
  'Abono a Importadora Global',
  now - 2 * dia,
)
console.log('   ✅ Abono a Importadora Global: $50,000 desde Bóveda Monte')

// ══════════════════════════════════════════════════════════════════════════════
// RESUMEN FINAL
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(70))
console.log('📊 RESUMEN DEL SEED - FLOWDISTRIBUTOR')
console.log('═'.repeat(70))

// Consultar datos finales
const bancosFinales = db
  .prepare(
    'SELECT id, nombre, capital_actual, historico_ingresos, historico_gastos FROM bancos ORDER BY orden',
  )
  .all() as any[]
const distribuidoresFinales = db
  .prepare('SELECT nombre, saldo_pendiente, total_ordenes_compra FROM distribuidores')
  .all() as any[]
const clientesFinales = db
  .prepare('SELECT nombre, saldo_pendiente, total_compras FROM clientes')
  .all() as any[]
const almacenFinal = db
  .prepare('SELECT nombre, stock_actual, total_entradas, total_salidas FROM almacen')
  .all() as any[]

console.log('\n🏦 BANCOS:')
bancosFinales.forEach((b: any) => {
  console.log(
    `   ${b.nombre}: Capital $${b.capital_actual?.toLocaleString()} | Histórico $${b.historico_ingresos?.toLocaleString()} | Gastos $${b.historico_gastos?.toLocaleString()}`,
  )
})

console.log('\n👥 DISTRIBUIDORES (Adeudos que debemos):')
distribuidoresFinales.forEach((d: any) => {
  console.log(
    `   ${d.nombre}: Adeudo $${d.saldo_pendiente?.toLocaleString()} | Total OC $${d.total_ordenes_compra?.toLocaleString()}`,
  )
})

console.log('\n👤 CLIENTES (Deudas que nos deben):')
clientesFinales.forEach((c: any) => {
  console.log(
    `   ${c.nombre}: Deuda $${c.saldo_pendiente?.toLocaleString()} | Total Compras $${c.total_compras?.toLocaleString()}`,
  )
})

console.log('\n📦 ALMACÉN:')
almacenFinal.forEach((a: any) => {
  console.log(
    `   ${a.nombre}: Stock ${a.stock_actual} | Entradas ${a.total_entradas} | Salidas ${a.total_salidas}`,
  )
})

const totalDeudaClientes = clientesFinales.reduce(
  (sum: number, c: any) => sum + (c.saldo_pendiente || 0),
  0,
)
const totalAdeudoDistribuidores = distribuidoresFinales.reduce(
  (sum: number, d: any) => sum + (d.saldo_pendiente || 0),
  0,
)
const capitalTotal = bancosFinales.reduce((sum: number, b: any) => sum + (b.capital_actual || 0), 0)

console.log('\n💰 TOTALES:')
console.log(`   Capital Total en Bancos: $${capitalTotal.toLocaleString()}`)
console.log(`   Deudas de Clientes (nos deben): $${totalDeudaClientes.toLocaleString()}`)
console.log(`   Adeudos a Distribuidores (debemos): $${totalAdeudoDistribuidores.toLocaleString()}`)

console.log('\n' + '═'.repeat(70))
console.log('✅ SEED COMPLETADO EXITOSAMENTE')
console.log('═'.repeat(70))

db.close()
