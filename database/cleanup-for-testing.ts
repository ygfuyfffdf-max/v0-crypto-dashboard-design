// @ts-nocheck
// database/cleanup-for-testing.ts
// ═══════════════════════════════════════════════════════════════════════════════
// Script para limpiar la base de datos manteniendo los bancos
// Resetea todos los valores a 0 para pruebas de trazabilidad
// ═══════════════════════════════════════════════════════════════════════════════

import { sql } from 'drizzle-orm'
import { db } from './index'
import {
  abonos,
  aiChatMessages,
  aiChatSessions,
  alertas,
  alertasConfig,
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
} from './schema'

async function cleanupDatabase() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('🧹 LIMPIEZA DE BASE DE DATOS PARA PRUEBAS')
  console.log('═══════════════════════════════════════════════════════════════')

  try {
    // ═══════════════════════════════════════════════════════════════
    // PASO 1: Eliminar registros de todas las tablas EXCEPTO bancos
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 PASO 1: Eliminando registros de tablas...\n')

    // Orden importante por foreign keys (de hijos a padres)
    const tablasALimpiar = [
      { nombre: 'audit_log', tabla: auditLog },
      { nombre: 'conciliaciones', tabla: conciliaciones },
      { nombre: 'ai_chat_messages', tabla: aiChatMessages },
      { nombre: 'ai_chat_sessions', tabla: aiChatSessions },
      { nombre: 'alertas', tabla: alertas },
      { nombre: 'alertas_config', tabla: alertasConfig },
      { nombre: 'devoluciones', tabla: devoluciones },
      { nombre: 'pagos_distribuidor', tabla: pagosDistribuidor },
      { nombre: 'entrada_almacen', tabla: entradaAlmacen },
      { nombre: 'salida_almacen', tabla: salidaAlmacen },
      { nombre: 'abonos', tabla: abonos },
      { nombre: 'movimientos', tabla: movimientos },
      { nombre: 'ventas', tabla: ventas },
      { nombre: 'ordenes_compra', tabla: ordenesCompra },
      { nombre: 'almacen', tabla: almacen },
      { nombre: 'clientes', tabla: clientes },
      { nombre: 'distribuidores', tabla: distribuidores },
      { nombre: 'kpis_globales', tabla: kpisGlobales },
      { nombre: 'usuarios', tabla: usuarios },
    ]

    for (const { nombre, tabla } of tablasALimpiar) {
      try {
        await db.delete(tabla)
        console.log(`   ✅ ${nombre} - limpiada`)
      } catch (error) {
        console.log(`   ⚠️ ${nombre} - error: ${(error as Error).message}`)
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // PASO 2: Resetear TODOS los valores de bancos a 0
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 PASO 2: Reseteando valores de bancos a 0...\n')

    await db.update(bancos).set({
      // Capital
      capitalActual: 0,
      capitalMinimo: 0,
      capitalMaximo: 0,

      // Histórico inmutable - reseteado a 0
      historicoIngresos: 0,
      historicoGastos: 0,
      historicoTransferenciasEntrada: 0,
      historicoTransferenciasSalida: 0,

      // Flujo diario
      ingresosHoy: 0,
      gastosHoy: 0,
      flujoNetoHoy: 0,
      movimientosHoy: 0,

      // Flujo semanal
      ingresosSemana: 0,
      gastosSemana: 0,
      flujoNetoSemana: 0,
      movimientosSemana: 0,

      // Flujo mensual
      ingresosMes: 0,
      gastosMes: 0,
      flujoNetoMes: 0,
      movimientosMes: 0,
      promedioIngresosDiario: 0,
      promedioGastosDiario: 0,

      // Origen de ingresos
      porcentajeVentas: 0,
      porcentajeTransferencias: 0,
      porcentajeManual: 0,
      porcentajeDistribucionGYA: 0,

      // Tendencias
      tendenciaCapital: 'estable',
      tendenciaFlujo: 'neutro',
      variacionMesAnterior: 0,
      variacionSemanaAnterior: 0,

      // Proyecciones
      proyeccionFinMes: 0,
      diasHastaAgotamiento: null,
      proyeccionTresMeses: 0,

      // Scoring
      scoreLiquidez: 50,
      scoreFlujo: 50,
      scoreEstabilidad: 50,
      scoreTotal: 50,
      estadoSalud: 'bueno',

      // Timestamps
      ultimoMovimiento: null,
      ultimaActualizacionFlujo: null,
      ultimaActualizacionMetricas: null,
      updatedAt: sql`(unixepoch())`,
    })

    console.log('   ✅ Bancos reseteados a valores iniciales (capital = 0)')

    // ═══════════════════════════════════════════════════════════════
    // PASO 3: Verificación final
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 PASO 3: Verificación de limpieza...\n')

    // Contar registros restantes en bancos
    const bancosRestantes = await db.query.bancos.findMany()
    console.log(`   📊 Bancos preservados: ${bancosRestantes.length}`)

    for (const banco of bancosRestantes) {
      console.log(`      - ${banco.nombre}: $${banco.capitalActual.toLocaleString()}`)
    }

    // Verificar que otras tablas están vacías
    const ventasCount = await db.query.ventas.findMany()
    const clientesCount = await db.query.clientes.findMany()
    const distribuidoresCount = await db.query.distribuidores.findMany()
    const ordenesCount = await db.query.ordenesCompra.findMany()
    const movimientosCount = await db.query.movimientos.findMany()

    console.log('\n   📊 Conteo de registros post-limpieza:')
    console.log(`      - Ventas: ${ventasCount.length}`)
    console.log(`      - Clientes: ${clientesCount.length}`)
    console.log(`      - Distribuidores: ${distribuidoresCount.length}`)
    console.log(`      - Órdenes de Compra: ${ordenesCount.length}`)
    console.log(`      - Movimientos: ${movimientosCount.length}`)

    console.log('\n═══════════════════════════════════════════════════════════════')
    console.log('✅ LIMPIEZA COMPLETADA - Base de datos lista para pruebas')
    console.log('═══════════════════════════════════════════════════════════════\n')
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
    throw error
  }
}

// Ejecutar
cleanupDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
