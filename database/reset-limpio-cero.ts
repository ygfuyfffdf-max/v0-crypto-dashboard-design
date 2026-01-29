// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔄 CHRONOS INFINITY 2026 — RESET COMPLETO A CERO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Script para resetear completamente la base de datos Turso:
 * 1. Elimina TODOS los datos existentes (ventas, OCs, movimientos, etc.)
 * 2. Resetea 7 bancos con capitales en 0
 * 3. Mantiene estructura lista para empezar desde cero
 */

import { db } from '@/database'
import {
    almacen,
    bancos,
    clientes,
    distribuidores,
    entradaAlmacen,
    movimientos,
    ordenesCompra,
    pagosDistribuidor,
    salidaAlmacen,
    ventas,
} from '@/database/schema'

console.log('🔄 INICIANDO RESET COMPLETO A CERO...\n')

async function resetACero() {
  try {
    const ahora = new Date()

    // ═══════════════════════════════════════════════════════════════
    // PASO 1: ELIMINAR TODOS LOS DATOS TRANSACCIONALES
    // ═══════════════════════════════════════════════════════════════
    console.log('🗑️  PASO 1: Eliminando datos transaccionales...')

    // Orden correcto para evitar errores de FK
    await db.delete(salidaAlmacen)
    console.log('   ✅ Salidas de almacén eliminadas')

    await db.delete(entradaAlmacen)
    console.log('   ✅ Entradas de almacén eliminadas')

    await db.delete(movimientos)
    console.log('   ✅ Movimientos eliminados')

    await db.delete(pagosDistribuidor).catch(() => console.log('   ⚠️ pagosDistribuidor no existe'))
    console.log('   ✅ Pagos a distribuidores eliminados')

    await db.delete(ventas)
    console.log('   ✅ Ventas eliminadas')

    await db.delete(ordenesCompra)
    console.log('   ✅ Órdenes de compra eliminadas')

    await db.delete(almacen)
    console.log('   ✅ Productos de almacén eliminados')

    await db.delete(clientes)
    console.log('   ✅ Clientes eliminados')

    await db.delete(distribuidores)
    console.log('   ✅ Distribuidores eliminados')

    console.log('\n')

    // ═══════════════════════════════════════════════════════════════
    // PASO 2: RESETEAR 7 BANCOS A CAPITAL 0
    // ═══════════════════════════════════════════════════════════════
    console.log('🏦 PASO 2: Reseteando 7 bancos a capital 0...')

    // Primero eliminar bancos existentes
    await db.delete(bancos)

    const bancosData = [
      {
        id: 'boveda_monte',
        nombre: 'Bóveda Monte',
        descripcion: 'Capital de compra (precioCompra × cantidad)',
        tipo: 'operativo' as const,
        capitalActual: 0,
        historicoIngresos: 0,
        historicoGastos: 0,
        color: '#8B5CF6',
        icono: '🏔️',
        orden: 1,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora,
      },
      {
        id: 'boveda_usa',
        nombre: 'Bóveda USA',
        descripcion: 'Capital en dólares',
        tipo: 'inversion' as const,
        capitalActual: 0,
        historicoIngresos: 0,
        historicoGastos: 0,
        color: '#06B6D4',
        icono: '🦅',
        orden: 2,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora,
      },
      {
        id: 'profit',
        nombre: 'Profit',
        descripcion: 'Banco operativo principal',
        tipo: 'operativo' as const,
        capitalActual: 0,
        historicoIngresos: 0,
        historicoGastos: 0,
        color: '#10B981',
        icono: '💎',
        orden: 3,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora,
      },
      {
        id: 'leftie',
        nombre: 'Leftie',
        descripcion: 'Banco secundario',
        tipo: 'ahorro' as const,
        capitalActual: 0,
        historicoIngresos: 0,
        historicoGastos: 0,
        color: '#F59E0B',
        icono: '🌟',
        orden: 4,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora,
      },
      {
        id: 'azteca',
        nombre: 'Azteca',
        descripcion: 'Banco operativo',
        tipo: 'operativo' as const,
        capitalActual: 0,
        historicoIngresos: 0,
        historicoGastos: 0,
        color: '#EC4899',
        icono: '🏛️',
        orden: 5,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora,
      },
      {
        id: 'flete_sur',
        nombre: 'Flete Sur',
        descripcion: 'Gastos de transporte (precioFlete × cantidad)',
        tipo: 'flete' as const,
        capitalActual: 0,
        historicoIngresos: 0,
        historicoGastos: 0,
        color: '#14B8A6',
        icono: '🚚',
        orden: 6,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora,
      },
      {
        id: 'utilidades',
        nombre: 'Utilidades',
        descripcion: 'Ganancias netas (precioVenta - costo - flete) × cantidad',
        tipo: 'ganancia' as const,
        capitalActual: 0,
        historicoIngresos: 0,
        historicoGastos: 0,
        color: '#22C55E',
        icono: '💰',
        orden: 7,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora,
      },
    ]

    for (const banco of bancosData) {
      await db.insert(bancos).values(banco)
      console.log(`   ✅ ${banco.nombre}: $0`)
    }

    console.log('\n')

    // ═══════════════════════════════════════════════════════════════
    // RESUMEN FINAL
    // ═══════════════════════════════════════════════════════════════
    console.log('═══════════════════════════════════════════════════════════════')
    console.log('✅ RESET COMPLETADO EXITOSAMENTE')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log('')
    console.log('📊 Estado actual:')
    console.log('   • 7 Bancos con capital $0')
    console.log('   • 0 Distribuidores')
    console.log('   • 0 Clientes')
    console.log('   • 0 Productos en almacén')
    console.log('   • 0 Órdenes de compra')
    console.log('   • 0 Ventas')
    console.log('   • 0 Movimientos')
    console.log('   • 0 Entradas/Salidas de almacén')
    console.log('')
    console.log('🚀 El sistema está listo para comenzar desde cero.')
    console.log('═══════════════════════════════════════════════════════════════')

  } catch (error) {
    console.error('❌ Error durante el reset:', error)
    throw error
  }
}

// Ejecutar
resetACero()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
