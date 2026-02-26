// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════
 * CHRONOS — SEED LIMPIO DEL SISTEMA
 *
 * Este script:
 * 1. Limpia TODOS los datos existentes
 * 2. Crea los 7 bancos con capital en 0
 * 3. Crea 3 clientes de ejemplo
 * 4. Crea 2 distribuidores de ejemplo
 * 5. NO crea ventas, órdenes ni movimientos (para probar el flujo real)
 * ═══════════════════════════════════════════════════════════════
 */

import { sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from './index'
import { bancos, clientes, distribuidores } from './schema'

// ═══════════════════════════════════════════════════════════════
// BANCOS OFICIALES (capital inicial en 0)
// ═══════════════════════════════════════════════════════════════

const BANCOS_INICIALES = [
  {
    id: 'boveda_monte',
    nombre: 'Bóveda Monte',
    tipo: 'operativo' as const,
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: '#FFD700',
    icono: 'Vault',
    orden: 1,
    activo: true,
    descripcion: 'Recibe el costo de mercancía (precioCompra × cantidad)',
  },
  {
    id: 'boveda_usa',
    nombre: 'Bóveda USA',
    tipo: 'operativo' as const,
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: '#228B22',
    icono: 'DollarSign',
    orden: 2,
    activo: true,
    descripcion: 'Operaciones en dólares',
  },
  {
    id: 'profit',
    nombre: 'Profit',
    tipo: 'inversion' as const,
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: '#8B00FF',
    icono: 'TrendingUp',
    orden: 3,
    activo: true,
    descripcion: 'Inversiones y rendimientos',
  },
  {
    id: 'leftie',
    nombre: 'Leftie',
    tipo: 'ahorro' as const,
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: '#FF1493',
    icono: 'Heart',
    orden: 4,
    activo: true,
    descripcion: 'Fondo de emergencia personal',
  },
  {
    id: 'azteca',
    nombre: 'Azteca',
    tipo: 'operativo' as const,
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: '#FF4500',
    icono: 'Building',
    orden: 5,
    activo: true,
    descripcion: 'Operaciones locales',
  },
  {
    id: 'flete_sur',
    nombre: 'Flete Sur',
    tipo: 'operativo' as const,
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: '#00CED1',
    icono: 'Truck',
    orden: 6,
    activo: true,
    descripcion: 'Recibe costos de flete (precioFlete × cantidad)',
  },
  {
    id: 'utilidades',
    nombre: 'Utilidades',
    tipo: 'operativo' as const,
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: '#00FF88',
    icono: 'Sparkles',
    orden: 7,
    activo: true,
    descripcion: 'Recibe ganancia neta (precioVenta - precioCompra - precioFlete)',
  },
]

// ═══════════════════════════════════════════════════════════════
// CLIENTES DE EJEMPLO
// ═══════════════════════════════════════════════════════════════

const CLIENTES_INICIALES = [
  {
    id: nanoid(),
    nombre: 'Juan Pérez García',
    email: 'juan.perez@email.com',
    telefono: '555-0101',
    direccion: 'Av. Principal 123, Col. Centro',
    rfc: 'PEGJ900101ABC',
    categoria: 'nuevo' as const,
    estado: 'activo' as const,
    limiteCredito: 50000,
    creditoDisponible: 50000,
    saldoPendiente: 0,
    totalCompras: 0,
    numeroVentas: 0,
    scoreCredito: 70,
    scoreTotal: 70,
  },
  {
    id: nanoid(),
    nombre: 'María López Hernández',
    email: 'maria.lopez@email.com',
    telefono: '555-0102',
    direccion: 'Calle Secundaria 456, Col. Norte',
    rfc: 'LOHM850215XYZ',
    categoria: 'nuevo' as const,
    estado: 'activo' as const,
    limiteCredito: 75000,
    creditoDisponible: 75000,
    saldoPendiente: 0,
    totalCompras: 0,
    numeroVentas: 0,
    scoreCredito: 80,
    scoreTotal: 80,
  },
  {
    id: nanoid(),
    nombre: 'Carlos Rodríguez Sánchez',
    email: 'carlos.rodriguez@email.com',
    telefono: '555-0103',
    direccion: 'Blvd. Reforma 789, Col. Sur',
    rfc: 'ROSC780930DEF',
    categoria: 'nuevo' as const,
    estado: 'activo' as const,
    limiteCredito: 100000,
    creditoDisponible: 100000,
    saldoPendiente: 0,
    totalCompras: 0,
    numeroVentas: 0,
    scoreCredito: 85,
    scoreTotal: 85,
  },
]

// ═══════════════════════════════════════════════════════════════
// DISTRIBUIDORES DE EJEMPLO
// ═══════════════════════════════════════════════════════════════

const DISTRIBUIDORES_INICIALES = [
  {
    id: nanoid(),
    nombre: 'Distribuidora Nacional S.A.',
    empresa: 'DINASA',
    telefono: '555-1001',
    email: 'ventas@dinasa.com',
    direccion: 'Parque Industrial #100',
    tipoProductos: 'Electrónicos',
    estado: 'activo' as const,
    totalPagado: 0,
    totalOrdenesCompra: 0,
    numeroOrdenes: 0,
    saldoPendiente: 0,
  },
  {
    id: nanoid(),
    nombre: 'Importadora del Pacífico',
    empresa: 'IMPAC',
    telefono: '555-1002',
    email: 'contacto@impac.mx',
    direccion: 'Puerto Industrial #50',
    tipoProductos: 'Accesorios',
    estado: 'activo' as const,
    totalPagado: 0,
    totalOrdenesCompra: 0,
    numeroOrdenes: 0,
    saldoPendiente: 0,
  },
]

// ═══════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL DE SEED
// ═══════════════════════════════════════════════════════════════

async function cleanAndSeed() {
  console.log('🧹 Limpiando base de datos...')

  // Desactivar foreign keys temporalmente
  await db.run(sql`PRAGMA foreign_keys = OFF`)

  // Limpiar todas las tablas
  await db.run(sql`DELETE FROM movimientos`)
  await db.run(sql`DELETE FROM ventas`)
  await db.run(sql`DELETE FROM ordenes_compra`)
  await db.run(sql`DELETE FROM clientes`)
  await db.run(sql`DELETE FROM distribuidores`)
  await db.run(sql`DELETE FROM bancos`)

  // Reactivar foreign keys
  await db.run(sql`PRAGMA foreign_keys = ON`)

  console.log('✅ Base de datos limpia')

  // Insertar bancos
  console.log('🏦 Creando bancos...')
  for (const banco of BANCOS_INICIALES) {
    await db.insert(bancos).values(banco)
  }
  console.log(`  ✓ ${BANCOS_INICIALES.length} bancos creados`)

  // Insertar clientes
  console.log('👥 Creando clientes...')
  for (const cliente of CLIENTES_INICIALES) {
    await db.insert(clientes).values(cliente)
  }
  console.log(`  ✓ ${CLIENTES_INICIALES.length} clientes creados`)

  // Insertar distribuidores
  console.log('🏭 Creando distribuidores...')
  for (const dist of DISTRIBUIDORES_INICIALES) {
    await db.insert(distribuidores).values(dist)
  }
  console.log(`  ✓ ${DISTRIBUIDORES_INICIALES.length} distribuidores creados`)

  console.log('')
  console.log('═══════════════════════════════════════════════════')
  console.log('🎉 SEED COMPLETO - Base de datos lista para usar')
  console.log('═══════════════════════════════════════════════════')
  console.log('')
  console.log('📊 Estado inicial:')
  console.log('  • 7 Bancos con capital $0')
  console.log('  • 3 Clientes de ejemplo')
  console.log('  • 2 Distribuidores de ejemplo')
  console.log('  • 0 Ventas (crear desde el sistema)')
  console.log('  • 0 Órdenes de compra (crear desde el sistema)')
  console.log('  • 0 Movimientos (se generan automáticamente)')
  console.log('')
  console.log('💡 Ahora puedes:')
  console.log('  1. Crear tu primera venta desde el panel')
  console.log('  2. Ver cómo se distribuye automáticamente a los 3 bancos')
  console.log('  3. Registrar gastos/ingresos en cualquier banco')
}

// Ejecutar
cleanAndSeed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err)
    process.exit(1)
  })
