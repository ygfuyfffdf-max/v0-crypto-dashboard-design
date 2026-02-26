// @ts-nocheck
// ═══════════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — SEED LIMPIO (SOLO BANCOS)
// Sistema listo para llenar desde cero
// ═══════════════════════════════════════════════════════════════════════════════

import { db } from '@/database'
import {
  abonos,
  aiChatMessages,
  aiChatSessions,
  alertas,
  almacen,
  auditLog,
  bancos,
  clientes,
  conciliaciones,
  devoluciones,
  distribuidores,
  entradaAlmacen,
  kpisGlobales,
  movimientos,
  ordenesCompra,
  pagosDistribuidor,
  salidaAlmacen,
  usuarios,
  ventas,
} from '@/database/schema'

// ═══════════════════════════════════════════════════════════════
// 1. BANCOS — Los 7 Bancos Sagrados (INICIALIZADOS EN 0)
// ═══════════════════════════════════════════════════════════════

const BANCOS_DATA = [
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
  },
  {
    id: 'leftie',
    nombre: 'Leftie',
    tipo: 'ahorro' as const,
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: '#FFD700',
    icono: 'Crown',
    orden: 4,
  },
  {
    id: 'azteca',
    nombre: 'Azteca',
    tipo: 'operativo' as const,
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: '#8B0000',
    icono: 'Pyramid',
    orden: 5,
  },
  {
    id: 'flete_sur',
    nombre: 'Flete Sur',
    tipo: 'operativo' as const,
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: '#8B00FF',
    icono: 'Truck',
    orden: 6,
  },
  {
    id: 'utilidades',
    nombre: 'Utilidades',
    tipo: 'inversion' as const,
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: '#FF1493',
    icono: 'Sparkles',
    orden: 7,
  },
]

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE SEED
// ═══════════════════════════════════════════════════════════════

export async function seedCompleto(): Promise<void> {
  console.log('🚀 Iniciando limpieza total del sistema (SEED 0)...\n')

  // Limpiar tablas en orden correcto (por foreign keys)
  console.log('🧹 Limpiando TODAS las tablas...')

  // Tablas dependientes (hijas)
  await db.delete(devoluciones)
  await db.delete(abonos)
  await db.delete(movimientos)
  await db.delete(salidaAlmacen)
  await db.delete(entradaAlmacen)
  await db.delete(pagosDistribuidor)
  await db.delete(auditLog)
  await db.delete(alertas)
  await db.delete(conciliaciones)
  await db.delete(aiChatMessages)

  // Tablas principales
  await db.delete(ventas)
  await db.delete(ordenesCompra)
  await db.delete(almacen)
  await db.delete(clientes)
  await db.delete(distribuidores)
  await db.delete(bancos)
  await db.delete(kpisGlobales)
  await db.delete(aiChatSessions)
  await db.delete(usuarios)

  console.log('✨ Base de datos completamente limpia.')

  // 1. BANCOS
  console.log('\n🏦 Inicializando los 7 Bancos Sagrados en $0...')
  for (const banco of BANCOS_DATA) {
    await db.insert(bancos).values({
      ...banco,
      activo: true,
    })
    console.log(`   ✅ ${banco.nombre} creado`)
  }

  // 8. RESUMEN FINAL
  console.log('\n' + '═'.repeat(60))
  console.log('📊 RESUMEN DEL SISTEMA')
  console.log('═'.repeat(60))
  console.log('✅ Sistema reiniciado correctamente')
  console.log('✅ 7 Bancos creados con saldo $0')
  console.log('✅ 0 Clientes')
  console.log('✅ 0 Distribuidores')
  console.log('✅ 0 Productos')
  console.log('✅ 0 Ventas')
  console.log('\nLISTO PARA EMPEZAR DESDE CERO 🚀')
}

// Ejecutar si es llamado directamente
seedCompleto()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error en seed:', err)
    process.exit(1)
  })
