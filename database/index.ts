// @ts-nocheck
/**
 * DATABASE CLIENT — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════
 * • Dev: file:./database/sqlite.db
 * • Prod (no remote URL): file:/tmp/chronos.db (Vercel writable tmp)
 * • Remote Turso: libsql://... (set TURSO_DATABASE_URL)
 * ═══════════════════════════════════════
 */
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

// ─── URL resolution ───────────────────────────────────────────────
const isProd = process.env.NODE_ENV === 'production'

function resolveUrl(): string {
  if (process.env.TURSO_DATABASE_URL) return process.env.TURSO_DATABASE_URL
  if (process.env.DATABASE_URL?.startsWith('libsql://')) return process.env.DATABASE_URL
  // In Vercel production /tmp is writable; local dev uses project directory
  return isProd ? 'file:/tmp/chronos.db' : 'file:./database/sqlite.db'
}

const dbUrl   = resolveUrl()
const dbToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || ''

let client: ReturnType<typeof createClient>
let _db: ReturnType<typeof drizzle>

try {
  client = createClient({ url: dbUrl, authToken: dbToken || undefined })
  _db = drizzle(client, { schema })
} catch (e) {
  console.error('[DB] Failed to create client, using memory fallback:', e)
  client = createClient({ url: 'file::memory:', authToken: undefined })
  _db = drizzle(client, { schema })
}

export const db = _db
export const tursoClient = client

// ─── Auto-init for production (create tables + seed if empty) ────
let _initialized = false

export async function ensureInit(): Promise<void> {
  if (_initialized) return
  _initialized = true
  try {
    // Create bancos table if missing (basic guard)
    await client.execute(`CREATE TABLE IF NOT EXISTS bancos (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'efectivo',
      capital_actual REAL NOT NULL DEFAULT 0,
      historico_ingresos REAL NOT NULL DEFAULT 0,
      historico_gastos REAL NOT NULL DEFAULT 0,
      color TEXT NOT NULL DEFAULT '#8B5CF6',
      icono TEXT,
      orden INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      updated_at INTEGER DEFAULT (unixepoch())
    )`)
    await client.execute(`CREATE TABLE IF NOT EXISTS clientes (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      telefono TEXT,
      email TEXT,
      activo INTEGER DEFAULT 1,
      saldo_pendiente REAL DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )`)
    await client.execute(`CREATE TABLE IF NOT EXISTS ventas (
      id TEXT PRIMARY KEY NOT NULL,
      cliente_id TEXT,
      producto_id TEXT,
      oc_id TEXT,
      monto_total REAL NOT NULL DEFAULT 0,
      monto_cobrado REAL DEFAULT 0,
      pendiente REAL DEFAULT 0,
      estado TEXT DEFAULT 'activa',
      created_at INTEGER DEFAULT (unixepoch()),
      fecha TEXT
    )`)
    await client.execute(`CREATE TABLE IF NOT EXISTS almacen (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      cantidad INTEGER DEFAULT 0,
      precio_compra REAL NOT NULL DEFAULT 0,
      precio_venta REAL NOT NULL DEFAULT 0,
      minimo INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      sku TEXT,
      categoria TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )`)
    await client.execute(`CREATE TABLE IF NOT EXISTS distribuidores (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      telefono TEXT,
      activo INTEGER DEFAULT 1,
      saldo_pendiente REAL DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch())
    )`)
    await client.execute(`CREATE TABLE IF NOT EXISTS movimientos (
      id TEXT PRIMARY KEY NOT NULL,
      banco_id TEXT,
      tipo TEXT,
      monto REAL DEFAULT 0,
      concepto TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    )`)
    await client.execute(`CREATE TABLE IF NOT EXISTS ordenes_compra (
      id TEXT PRIMARY KEY NOT NULL,
      distribuidor_id TEXT,
      total REAL DEFAULT 0,
      estado TEXT DEFAULT 'pendiente',
      created_at INTEGER DEFAULT (unixepoch())
    )`)
    await client.execute(`CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL,
      nombre TEXT,
      rol TEXT DEFAULT 'operador',
      activo INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (unixepoch())
    )`)

    // Seed bancos if empty
    const bancosCount = await client.execute('SELECT COUNT(*) as c FROM bancos')
    if ((bancosCount.rows[0].c as number) === 0) {
      await seedBancos()
      await seedClientes()
      await seedProductos()
      await seedDistribuidores()
      console.log('[DB] Seeded production in-memory DB')
    }
  } catch (e) {
    console.error('[DB] ensureInit error:', e)
  }
}

async function seedBancos() {
  const bancosData = [
    { id: 'boveda-monte', nombre: 'Bóveda Monte', tipo: 'efectivo', capital_actual: 42300, historico_ingresos: 280000, historico_gastos: 185000, color: '#8B5CF6', orden: 1 },
    { id: 'boveda-usa', nombre: 'Bóveda USA', tipo: 'digital', capital_actual: 28400, historico_ingresos: 180000, historico_gastos: 120000, color: '#3B82F6', orden: 2 },
    { id: 'profit', nombre: 'Profit', tipo: 'digital', capital_actual: 18900, historico_ingresos: 95000, historico_gastos: 62000, color: '#10B981', orden: 3 },
    { id: 'leftie', nombre: 'Leftie', tipo: 'efectivo', capital_actual: 12500, historico_ingresos: 75000, historico_gastos: 48000, color: '#F59E0B', orden: 4 },
    { id: 'azteca', nombre: 'Azteca', tipo: 'banco', capital_actual: 52780, historico_ingresos: 320000, historico_gastos: 210000, color: '#EC4899', orden: 5 },
    { id: 'flete-sur', nombre: 'Flete Sur', tipo: 'efectivo', capital_actual: 8900, historico_ingresos: 55000, historico_gastos: 38000, color: '#6366F1', orden: 6 },
    { id: 'utilidades', nombre: 'Utilidades', tipo: 'digital', capital_actual: 31200, historico_ingresos: 200000, historico_gastos: 140000, color: '#14B8A6', orden: 7 },
  ]
  for (const b of bancosData) {
    await client.execute({
      sql: 'INSERT OR IGNORE INTO bancos (id,nombre,tipo,capital_actual,historico_ingresos,historico_gastos,color,orden) VALUES (?,?,?,?,?,?,?,?)',
      args: [b.id, b.nombre, b.tipo, b.capital_actual, b.historico_ingresos, b.historico_gastos, b.color, b.orden],
    })
  }
}

async function seedClientes() {
  const cs = [
    ['cli-001','Carlos Mendoza','555-0001','carlos@ejemplo.com',0],
    ['cli-002','María García','555-0002','maria@ejemplo.com',15200],
    ['cli-003','Roberto Silva','555-0003','roberto@ejemplo.com',8400],
    ['cli-004','Ana Torres','555-0004','ana@ejemplo.com',0],
    ['cli-005','Luis Ramírez','555-0005','luis@ejemplo.com',22100],
    ['cli-006','Patricia López','555-0006','patricia@ejemplo.com',3750],
    ['cli-007','Jorge Hernández','555-0007','jorge@ejemplo.com',0],
    ['cli-008','Sandra Morales','555-0008','sandra@ejemplo.com',9800],
    ['cli-009','Ricardo Pérez','555-0009','ricardo@ejemplo.com',0],
    ['cli-010','Carmen Ruiz','555-0010','carmen@ejemplo.com',5600],
  ]
  for (const c of cs) {
    await client.execute({
      sql: 'INSERT OR IGNORE INTO clientes (id,nombre,telefono,email,saldo_pendiente) VALUES (?,?,?,?,?)',
      args: c,
    })
  }
}

async function seedProductos() {
  const ps = [
    ['prod-001','Producto Alpha','100','850','1200','alpha-001','Electrónica'],
    ['prod-002','Producto Beta','45','1200','1750','beta-001','Electrónica'],
    ['prod-003','Producto Gamma','200','350','520','gamma-001','General'],
    ['prod-004','Producto Delta','8','2400','3200','delta-001','Premium'],
    ['prod-005','Producto Epsilon','30','680','950','eps-001','General'],
  ]
  for (const p of ps) {
    await client.execute({
      sql: 'INSERT OR IGNORE INTO almacen (id,nombre,cantidad,precio_compra,precio_venta,sku,categoria) VALUES (?,?,?,?,?,?,?)',
      args: p,
    })
  }
}

async function seedDistribuidores() {
  const ds = [
    ['dist-001','Distribuidora Norte','555-1001',0],
    ['dist-002','Distribuidora Centro','555-1002',14300],
    ['dist-003','Distribuidora Sur','555-1003',0],
    ['dist-004','Importaciones Premium','555-1004',8900],
    ['dist-005','Comercial Pacífico','555-1005',0],
  ]
  for (const d of ds) {
    await client.execute({
      sql: 'INSERT OR IGNORE INTO distribuidores (id,nombre,telefono,saldo_pendiente) VALUES (?,?,?,?)',
      args: d,
    })
  }
}

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await client.execute('SELECT 1')
    return true
  } catch {
    return false
  }
}

export const databaseConfig = {
  connectionTimeout: 30000,
  idleTimeout: 60000,
  maxRetries: 3,
  retryDelay: 1000,
}
