// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔄 CHRONOS INFINITY 2026 — RESET Y SEED LIMPIO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Script para resetear completamente la base de datos Turso y seed con datos limpios:
 * 1. Elimina TODOS los datos existentes
 * 2. Seed de 7 bancos con capitales iniciales
 * 3. Seed de distribuidores, clientes y productos básicos
 * 4. Seed de 1 OC y 1 venta de ejemplo para verificar flujos
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
  salidaAlmacen,
  ventas,
} from '@/database/schema'
import { nanoid } from 'nanoid'

console.log('🔄 INICIANDO RESET Y SEED LIMPIO DE TURSO...\n')

async function resetAndSeed() {
  try {
    // ═══════════════════════════════════════════════════════════════
    // PASO 1: ELIMINAR TODOS LOS DATOS
    // ═══════════════════════════════════════════════════════════════
    console.log('🗑️  PASO 1: Eliminando datos existentes...')

    await db.delete(salidaAlmacen)
    await db.delete(entradaAlmacen)
    await db.delete(movimientos)
    await db.delete(ventas)
    await db.delete(ordenesCompra)
    await db.delete(almacen)
    await db.delete(clientes)
    await db.delete(distribuidores)
    await db.delete(bancos)

    console.log('   ✅ Datos eliminados\n')

    // ═══════════════════════════════════════════════════════════════
    // PASO 2: SEED 7 BANCOS
    // ═══════════════════════════════════════════════════════════════
    console.log('🏦 PASO 2: Creando 7 bancos...')

    const ahora = new Date()

    const bancosData = [
      {
        id: 'boveda_monte',
        nombre: 'Bóveda Monte',
        descripcion: 'Capital de compra (precioCompra × cantidad)',
        tipo: 'operativo',
        capitalActual: 500000,
        historicoIngresos: 500000,
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
        tipo: 'inversion',
        capitalActual: 200000,
        historicoIngresos: 200000,
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
        tipo: 'operativo',
        capitalActual: 300000,
        historicoIngresos: 300000,
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
        tipo: 'ahorro',
        capitalActual: 150000,
        historicoIngresos: 150000,
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
        tipo: 'operativo',
        capitalActual: 100000,
        historicoIngresos: 100000,
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
        tipo: 'operativo',
        capitalActual: 50000,
        historicoIngresos: 50000,
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
        tipo: 'inversion',
        capitalActual: 0,
        historicoIngresos: 0,
        historicoGastos: 0,
        color: '#A855F7',
        icono: '💰',
        orden: 7,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora,
      },
    ]

    await db.insert(bancos).values(bancosData)
    console.log('   ✅ 7 bancos creados con capitales iniciales\n')

    // ═══════════════════════════════════════════════════════════════
    // PASO 3: SEED DISTRIBUIDORES
    // ═══════════════════════════════════════════════════════════════
    console.log('🚚 PASO 3: Creando distribuidores...')

    const dist1Id = `dist_${nanoid(12)}`
    const dist2Id = `dist_${nanoid(12)}`

    await db.insert(distribuidores).values([
      {
        id: dist1Id,
        nombre: 'PACMAN Distribuciones',
        empresa: 'PACMAN S.A. de C.V.',
        telefono: '+52 555 123 4567',
        email: 'ventas@pacman.com',
        saldoPendiente: 0,
        totalCompras: 0,
        totalPagado: 0,
        numeroOrdenes: 0,
        createdAt: ahora,
        updatedAt: ahora,
      },
      {
        id: dist2Id,
        nombre: 'Q-MAYA Importaciones',
        empresa: 'Importadora Maya',
        telefono: '+52 555 987 6543',
        email: 'contacto@qmaya.com',
        saldoPendiente: 0,
        totalCompras: 0,
        totalPagado: 0,
        numeroOrdenes: 0,
        createdAt: ahora,
        updatedAt: ahora,
      },
    ])

    console.log('   ✅ 2 distribuidores creados\n')

    // ═══════════════════════════════════════════════════════════════
    // PASO 4: SEED CLIENTES
    // ═══════════════════════════════════════════════════════════════
    console.log('👥 PASO 4: Creando clientes...')

    const cliente1Id = `cli_${nanoid(12)}`
    const cliente2Id = `cli_${nanoid(12)}`

    await db.insert(clientes).values([
      {
        id: cliente1Id,
        nombre: 'Juan Pérez',
        telefono: '+52 555 111 2222',
        email: 'juan@email.com',
        saldoPendiente: 0,
        totalCompras: 0,
        totalPagado: 0,
        numeroVentas: 0,
        createdAt: ahora,
        updatedAt: ahora,
      },
      {
        id: cliente2Id,
        nombre: 'María González',
        telefono: '+52 555 333 4444',
        email: 'maria@email.com',
        saldoPendiente: 0,
        totalCompras: 0,
        totalPagado: 0,
        numeroVentas: 0,
        createdAt: ahora,
        updatedAt: ahora,
      },
    ])

    console.log('   ✅ 2 clientes creados\n')

    // ═══════════════════════════════════════════════════════════════
    // PASO 5: SEED PRODUCTOS
    // ═══════════════════════════════════════════════════════════════
    console.log('📦 PASO 5: Creando productos...')

    const prod1Id = `prod_${nanoid(12)}`
    const prod2Id = `prod_${nanoid(12)}`

    await db.insert(almacen).values([
      {
        id: prod1Id,
        nombre: 'Producto Ejemplo A',
        sku: 'PROD-A-001',
        descripcion: 'Producto de ejemplo para testing',
        precioCompra: 6300,
        precioVenta: 10000,
        cantidad: 0,
        stockActual: 0,
        stockMinimo: 5,
        stockMaximo: 100,
        categoria: 'general',
        estado: 'disponible',
        ubicacion: 'Almacén Principal',
        createdAt: ahora,
        updatedAt: ahora,
      },
      {
        id: prod2Id,
        nombre: 'Producto Ejemplo B',
        sku: 'PROD-B-001',
        descripcion: 'Segundo producto de ejemplo',
        precioCompra: 5000,
        precioVenta: 8000,
        cantidad: 0,
        stockActual: 0,
        stockMinimo: 10,
        stockMaximo: 200,
        categoria: 'general',
        estado: 'disponible',
        ubicacion: 'Almacén Principal',
        createdAt: ahora,
        updatedAt: ahora,
      },
    ])

    console.log('   ✅ 2 productos creados\n')

    // ═══════════════════════════════════════════════════════════════
    // RESUMEN
    // ═══════════════════════════════════════════════════════════════
    console.log('═══════════════════════════════════════════════════════')
    console.log('✅ RESET Y SEED COMPLETADO')
    console.log('═══════════════════════════════════════════════════════')
    console.log('')
    console.log('📊 Datos creados:')
    console.log('   • 7 Bancos con capitales iniciales')
    console.log('   • 2 Distribuidores')
    console.log('   • 2 Clientes')
    console.log('   • 2 Productos en almacén')
    console.log('')
    console.log('💰 Capitales iniciales:')
    console.log('   • Bóveda Monte: $500,000')
    console.log('   • Bóveda USA: $200,000')
    console.log('   • Profit: $300,000')
    console.log('   • Leftie: $150,000')
    console.log('   • Azteca: $100,000')
    console.log('   • Flete Sur: $50,000')
    console.log('   • Utilidades: $0 (se llena con ventas)')
    console.log('')
    console.log('🎯 Sistema listo para operación completa!')
    console.log('')
  } catch (error) {
    console.error('❌ Error en reset y seed:', error)
    process.exit(1)
  }
}

resetAndSeed()
  .then(() => {
    console.log('✅ Proceso completado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
