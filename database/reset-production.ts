// database/reset-production.ts
// ═══════════════════════════════════════════════════════════════════════════════
// 🧹 CHRONOS - RESET PRODUCCIÓN
// Limpia TODO y deja solo los 7 bancos con capital en 0
// ═══════════════════════════════════════════════════════════════════════════════

import { sql } from 'drizzle-orm'
import { db } from './index'
import { bancos } from './schema'

// ═══════════════════════════════════════════════════════════════
// LISTA DE TABLAS A LIMPIAR (en orden para evitar FK violations)
// ═══════════════════════════════════════════════════════════════

const tablesToClean = [
  // Tablas de auditoría y logs
  'auditoria',

  // Tablas de pagos
  'pagos_venta',
  'pagos_orden',

  // Tablas de ventas GYA
  'ventas_gya',

  // Lotes
  'lotes_venta',
  'lotes',

  // Movimientos y cortes
  'movimientos',
  'cortes_caja',

  // Abonos y gastos
  'abonos_cliente',
  'gastos_abonos',

  // Tablas principales
  'ventas',
  'ordenes_compra',
  'almacen',

  // Tablas maestras (excepto bancos)
  'clientes',
  'distribuidores',
]

// ═══════════════════════════════════════════════════════════════
// LOS 7 BANCOS LIMPIOS (sin capital, sin historial)
// ═══════════════════════════════════════════════════════════════

const BANCOS_LIMPIOS = [
  {
    id: 'boveda_monte',
    nombre: 'Bóveda Monte',
    tipo: 'principal',
    capitalActual: 0,
    capitalMinimo: 0,
    capitalMaximo: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    historicoTransferenciasEntrada: 0,
    historicoTransferenciasSalida: 0,
    ingresosHoy: 0,
    gastosHoy: 0,
    flujoNetoHoy: 0,
    movimientosHoy: 0,
    ingresosSemana: 0,
    gastosSemana: 0,
    flujoNetoSemana: 0,
    movimientosSemana: 0,
    ingresosMes: 0,
    gastosMes: 0,
    flujoNetoMes: 0,
    movimientosMes: 0,
    promedioIngresosDiario: 0,
    promedioGastosDiario: 0,
    porcentajeVentas: 0,
    porcentajeTransferencias: 0,
    porcentajeManual: 0,
    porcentajeDistribucionGYA: 0,
    tendenciaCapital: 'estable',
    tendenciaFlujo: 'neutro',
    variacionMesAnterior: 0,
    variacionSemanaAnterior: 0,
    proyeccionFinMes: 0,
    diasHastaAgotamiento: null,
    proyeccionTresMeses: 0,
    scoreLiquidez: 50,
    scoreFlujo: 50,
    scoreEstabilidad: 50,
    scoreTotal: 50,
    estadoSalud: 'bueno',
    color: '#a855f7', // Violeta
    icono: null,
    orden: 1,
    activo: true,
    alertas: null,
    notas: null,
    ultimoMovimiento: null,
    ultimaActualizacionFlujo: null,
    ultimaActualizacionMetricas: null,
  },
  {
    id: 'boveda_usa',
    nombre: 'Bóveda USA',
    tipo: 'principal',
    capitalActual: 0,
    capitalMinimo: 0,
    capitalMaximo: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    historicoTransferenciasEntrada: 0,
    historicoTransferenciasSalida: 0,
    ingresosHoy: 0,
    gastosHoy: 0,
    flujoNetoHoy: 0,
    movimientosHoy: 0,
    ingresosSemana: 0,
    gastosSemana: 0,
    flujoNetoSemana: 0,
    movimientosSemana: 0,
    ingresosMes: 0,
    gastosMes: 0,
    flujoNetoMes: 0,
    movimientosMes: 0,
    promedioIngresosDiario: 0,
    promedioGastosDiario: 0,
    porcentajeVentas: 0,
    porcentajeTransferencias: 0,
    porcentajeManual: 0,
    porcentajeDistribucionGYA: 0,
    tendenciaCapital: 'estable',
    tendenciaFlujo: 'neutro',
    variacionMesAnterior: 0,
    variacionSemanaAnterior: 0,
    proyeccionFinMes: 0,
    diasHastaAgotamiento: null,
    proyeccionTresMeses: 0,
    scoreLiquidez: 50,
    scoreFlujo: 50,
    scoreEstabilidad: 50,
    scoreTotal: 50,
    estadoSalud: 'bueno',
    color: '#3b82f6', // Azul
    icono: null,
    orden: 2,
    activo: true,
    alertas: null,
    notas: null,
    ultimoMovimiento: null,
    ultimaActualizacionFlujo: null,
    ultimaActualizacionMetricas: null,
  },
  {
    id: 'profit',
    nombre: 'Profit',
    tipo: 'operativo',
    capitalActual: 0,
    capitalMinimo: 0,
    capitalMaximo: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    historicoTransferenciasEntrada: 0,
    historicoTransferenciasSalida: 0,
    ingresosHoy: 0,
    gastosHoy: 0,
    flujoNetoHoy: 0,
    movimientosHoy: 0,
    ingresosSemana: 0,
    gastosSemana: 0,
    flujoNetoSemana: 0,
    movimientosSemana: 0,
    ingresosMes: 0,
    gastosMes: 0,
    flujoNetoMes: 0,
    movimientosMes: 0,
    promedioIngresosDiario: 0,
    promedioGastosDiario: 0,
    porcentajeVentas: 0,
    porcentajeTransferencias: 0,
    porcentajeManual: 0,
    porcentajeDistribucionGYA: 0,
    tendenciaCapital: 'estable',
    tendenciaFlujo: 'neutro',
    variacionMesAnterior: 0,
    variacionSemanaAnterior: 0,
    proyeccionFinMes: 0,
    diasHastaAgotamiento: null,
    proyeccionTresMeses: 0,
    scoreLiquidez: 50,
    scoreFlujo: 50,
    scoreEstabilidad: 50,
    scoreTotal: 50,
    estadoSalud: 'bueno',
    color: '#10b981', // Esmeralda
    icono: null,
    orden: 3,
    activo: true,
    alertas: null,
    notas: null,
    ultimoMovimiento: null,
    ultimaActualizacionFlujo: null,
    ultimaActualizacionMetricas: null,
  },
  {
    id: 'leftie',
    nombre: 'Leftie',
    tipo: 'operativo',
    capitalActual: 0,
    capitalMinimo: 0,
    capitalMaximo: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    historicoTransferenciasEntrada: 0,
    historicoTransferenciasSalida: 0,
    ingresosHoy: 0,
    gastosHoy: 0,
    flujoNetoHoy: 0,
    movimientosHoy: 0,
    ingresosSemana: 0,
    gastosSemana: 0,
    flujoNetoSemana: 0,
    movimientosSemana: 0,
    ingresosMes: 0,
    gastosMes: 0,
    flujoNetoMes: 0,
    movimientosMes: 0,
    promedioIngresosDiario: 0,
    promedioGastosDiario: 0,
    porcentajeVentas: 0,
    porcentajeTransferencias: 0,
    porcentajeManual: 0,
    porcentajeDistribucionGYA: 0,
    tendenciaCapital: 'estable',
    tendenciaFlujo: 'neutro',
    variacionMesAnterior: 0,
    variacionSemanaAnterior: 0,
    proyeccionFinMes: 0,
    diasHastaAgotamiento: null,
    proyeccionTresMeses: 0,
    scoreLiquidez: 50,
    scoreFlujo: 50,
    scoreEstabilidad: 50,
    scoreTotal: 50,
    estadoSalud: 'bueno',
    color: '#f59e0b', // Ámbar
    icono: null,
    orden: 4,
    activo: true,
    alertas: null,
    notas: null,
    ultimoMovimiento: null,
    ultimaActualizacionFlujo: null,
    ultimaActualizacionMetricas: null,
  },
  {
    id: 'azteca',
    nombre: 'Azteca',
    tipo: 'operativo',
    capitalActual: 0,
    capitalMinimo: 0,
    capitalMaximo: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    historicoTransferenciasEntrada: 0,
    historicoTransferenciasSalida: 0,
    ingresosHoy: 0,
    gastosHoy: 0,
    flujoNetoHoy: 0,
    movimientosHoy: 0,
    ingresosSemana: 0,
    gastosSemana: 0,
    flujoNetoSemana: 0,
    movimientosSemana: 0,
    ingresosMes: 0,
    gastosMes: 0,
    flujoNetoMes: 0,
    movimientosMes: 0,
    promedioIngresosDiario: 0,
    promedioGastosDiario: 0,
    porcentajeVentas: 0,
    porcentajeTransferencias: 0,
    porcentajeManual: 0,
    porcentajeDistribucionGYA: 0,
    tendenciaCapital: 'estable',
    tendenciaFlujo: 'neutro',
    variacionMesAnterior: 0,
    variacionSemanaAnterior: 0,
    proyeccionFinMes: 0,
    diasHastaAgotamiento: null,
    proyeccionTresMeses: 0,
    scoreLiquidez: 50,
    scoreFlujo: 50,
    scoreEstabilidad: 50,
    scoreTotal: 50,
    estadoSalud: 'bueno',
    color: '#ef4444', // Rojo
    icono: null,
    orden: 5,
    activo: true,
    alertas: null,
    notas: null,
    ultimoMovimiento: null,
    ultimaActualizacionFlujo: null,
    ultimaActualizacionMetricas: null,
  },
  {
    id: 'flete_sur',
    nombre: 'Flete Sur',
    tipo: 'operativo',
    capitalActual: 0,
    capitalMinimo: 0,
    capitalMaximo: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    historicoTransferenciasEntrada: 0,
    historicoTransferenciasSalida: 0,
    ingresosHoy: 0,
    gastosHoy: 0,
    flujoNetoHoy: 0,
    movimientosHoy: 0,
    ingresosSemana: 0,
    gastosSemana: 0,
    flujoNetoSemana: 0,
    movimientosSemana: 0,
    ingresosMes: 0,
    gastosMes: 0,
    flujoNetoMes: 0,
    movimientosMes: 0,
    promedioIngresosDiario: 0,
    promedioGastosDiario: 0,
    porcentajeVentas: 0,
    porcentajeTransferencias: 0,
    porcentajeManual: 0,
    porcentajeDistribucionGYA: 0,
    tendenciaCapital: 'estable',
    tendenciaFlujo: 'neutro',
    variacionMesAnterior: 0,
    variacionSemanaAnterior: 0,
    proyeccionFinMes: 0,
    diasHastaAgotamiento: null,
    proyeccionTresMeses: 0,
    scoreLiquidez: 50,
    scoreFlujo: 50,
    scoreEstabilidad: 50,
    scoreTotal: 50,
    estadoSalud: 'bueno',
    color: '#ec4899', // Rosa
    icono: null,
    orden: 6,
    activo: true,
    alertas: null,
    notas: null,
    ultimoMovimiento: null,
    ultimaActualizacionFlujo: null,
    ultimaActualizacionMetricas: null,
  },
  {
    id: 'utilidades',
    nombre: 'Utilidades',
    tipo: 'ganancias',
    capitalActual: 0,
    capitalMinimo: 0,
    capitalMaximo: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    historicoTransferenciasEntrada: 0,
    historicoTransferenciasSalida: 0,
    ingresosHoy: 0,
    gastosHoy: 0,
    flujoNetoHoy: 0,
    movimientosHoy: 0,
    ingresosSemana: 0,
    gastosSemana: 0,
    flujoNetoSemana: 0,
    movimientosSemana: 0,
    ingresosMes: 0,
    gastosMes: 0,
    flujoNetoMes: 0,
    movimientosMes: 0,
    promedioIngresosDiario: 0,
    promedioGastosDiario: 0,
    porcentajeVentas: 0,
    porcentajeTransferencias: 0,
    porcentajeManual: 0,
    porcentajeDistribucionGYA: 0,
    tendenciaCapital: 'estable',
    tendenciaFlujo: 'neutro',
    variacionMesAnterior: 0,
    variacionSemanaAnterior: 0,
    proyeccionFinMes: 0,
    diasHastaAgotamiento: null,
    proyeccionTresMeses: 0,
    scoreLiquidez: 50,
    scoreFlujo: 50,
    scoreEstabilidad: 50,
    scoreTotal: 50,
    estadoSalud: 'bueno',
    color: '#fbbf24', // Amarillo
    icono: null,
    orden: 7,
    activo: true,
    alertas: null,
    notas: null,
    ultimoMovimiento: null,
    ultimaActualizacionFlujo: null,
    ultimaActualizacionMetricas: null,
  },
]

// ═══════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════

async function resetProduction() {
  console.log('═'.repeat(70))
  console.log('🧹 CHRONOS INFINITY - RESET PRODUCCIÓN')
  console.log('═'.repeat(70))
  console.log('')

  // 1. Limpiar todas las tablas
  console.log('📋 Limpiando tablas de datos...')
  console.log('')

  for (const table of tablesToClean) {
    try {
      await db.run(sql.raw(`DELETE FROM ${table}`))
      console.log(`   ✅ ${table} - limpia`)
    } catch (error) {
      const msg = (error as Error).message
      if (msg.includes('no such table')) {
        console.log(`   ⚠️  ${table} - no existe`)
      } else {
        console.log(`   ❌ ${table} - error: ${msg}`)
      }
    }
  }

  // 2. Limpiar bancos
  console.log('')
  console.log('🏦 Limpiando tabla bancos...')
  try {
    await db.run(sql.raw('DELETE FROM bancos'))
    console.log('   ✅ bancos - limpia')
  } catch (error) {
    console.log(`   ❌ bancos - error: ${(error as Error).message}`)
  }

  // 3. Insertar los 7 bancos limpios
  console.log('')
  console.log('🏦 Insertando 7 bancos con capital = 0...')
  console.log('')

  for (const banco of BANCOS_LIMPIOS) {
    try {
      await db.insert(bancos).values(banco as typeof bancos.$inferInsert)
      console.log(`   ✅ ${banco.nombre} (${banco.id}) - capital: $0`)
    } catch (error) {
      console.log(`   ❌ ${banco.nombre} - error: ${(error as Error).message}`)
    }
  }

  // 4. Reiniciar secuencias
  console.log('')
  console.log('🔄 Reiniciando secuencias...')
  try {
    await db.run(sql.raw('DELETE FROM sqlite_sequence'))
    console.log('   ✅ Secuencias reiniciadas')
  } catch {
    console.log('   ⚠️  No hay secuencias que reiniciar')
  }

  // 5. Resumen final
  console.log('')
  console.log('═'.repeat(70))
  console.log('🎉 RESET COMPLETADO')
  console.log('═'.repeat(70))
  console.log('')
  console.log('📊 Estado final:')
  console.log('   • Ventas: 0')
  console.log('   • Clientes: 0')
  console.log('   • Distribuidores: 0')
  console.log('   • Órdenes de Compra: 0')
  console.log('   • Almacén: 0 productos')
  console.log('   • Movimientos: 0')
  console.log('   • Bancos: 7 (todos con capital $0)')
  console.log('')
  console.log('💡 El sistema está listo para datos reales.')
  console.log('   Los formularios guardarán en la base de datos Turso.')
  console.log('')
}

// Ejecutar
resetProduction()
  .then(() => {
    console.log('✨ Script finalizado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
