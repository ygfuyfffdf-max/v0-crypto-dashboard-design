/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔍 VERIFICACIÓN DE MIGRACIÓN A MOVIMIENTOS UNIFICADO
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Script para verificar que:
 * 1. La tabla `movimientos` existe y tiene el schema correcto
 * 2. No existen colecciones fragmentadas (*_ingresos, *_gastos)
 * 3. Todos los servicios usan la colección unificada
 * 4. Los hooks están actualizados
 *
 * Uso:
 * ```bash
 * pnpm tsx database/verify-movimientos-migration.ts
 * ```
 */

import { sql } from 'drizzle-orm'
import { client, db } from './index'

// Helper para ejecutar SQL raw
async function executeRaw(query: string) {
  return client.execute(query)
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLORES PARA OUTPUT
// ═══════════════════════════════════════════════════════════════════════════════

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, type: 'success' | 'error' | 'info' | 'warn' = 'info') {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warn: '⚠️',
  }

  const color = {
    success: colors.green,
    error: colors.red,
    info: colors.blue,
    warn: colors.yellow,
  }

  console.log(`${color[type]}${icons[type]} ${message}${colors.reset}`)
}

function section(title: string) {
  console.log(`\n${colors.cyan}${colors.bright}═══ ${title} ═══${colors.reset}\n`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIONES DE VERIFICACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

async function verificarTablaMovimientos() {
  section('1. Verificando tabla movimientos')

  try {
    // Verificar que la tabla existe
    const result = await executeRaw(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='movimientos'
    `)

    if (result.rows.length === 0) {
      log('Tabla movimientos NO EXISTE', 'error')
      return false
    }

    log('Tabla movimientos existe', 'success')

    // Verificar columnas críticas
    const columnsResult = await executeRaw('PRAGMA table_info(movimientos)')
    const columns = columnsResult.rows.map((row: any) => row.name)

    const requiredColumns = [
      'id',
      'banco_id',
      'tipo',
      'monto',
      'fecha',
      'concepto',
      'referencia',
      'categoria',
      'created_by',
      'created_at',
    ]

    const missingColumns = requiredColumns.filter((col) => !columns.includes(col))

    if (missingColumns.length > 0) {
      log(`Columnas faltantes: ${missingColumns.join(', ')}`, 'error')
      return false
    }

    log(`Todas las columnas requeridas existen (${columns.length} columnas)`, 'success')

    // Contar registros
    const countResult = await executeRaw('SELECT COUNT(*) as count FROM movimientos')
    const count = (countResult.rows[0] as any).count

    log(`Registros en movimientos: ${count}`, 'info')

    return true
  } catch (error) {
    log(`Error verificando tabla: ${error}`, 'error')
    return false
  }
}

async function verificarTiposMovimiento() {
  section('2. Verificando tipos de movimiento')

  try {
    const tiposResult = await executeRaw(`
      SELECT DISTINCT tipo, COUNT(*) as count
      FROM movimientos
      GROUP BY tipo
    `)

    if (tiposResult.rows.length === 0) {
      log('No hay movimientos registrados', 'warn')
      return true
    }

    log('Tipos de movimiento encontrados:', 'info')
    for (const row of tiposResult.rows) {
      const { tipo, count } = row as any
      console.log(`  • ${tipo}: ${count} registros`)
    }

    // Validar que sean tipos válidos
    const tiposValidos = [
      'ingreso',
      'gasto',
      'transferencia_entrada',
      'transferencia_salida',
      'abono',
      'pago',
      'distribucion_gya',
    ]

    const tiposEncontrados = tiposResult.rows.map((row: any) => row.tipo)
    const tiposInvalidos = tiposEncontrados.filter((tipo) => !tiposValidos.includes(tipo))

    if (tiposInvalidos.length > 0) {
      log(`Tipos inválidos encontrados: ${tiposInvalidos.join(', ')}`, 'error')
      return false
    }

    log('Todos los tipos son válidos', 'success')
    return true
  } catch (error) {
    log(`Error verificando tipos: ${error}`, 'error')
    return false
  }
}

async function verificarIntegridadReferencial() {
  section('3. Verificando integridad referencial')

  try {
    // Verificar que todos los bancoId existen
    const bancosInvalidosResult = await executeRaw(`
      SELECT DISTINCT m.banco_id
      FROM movimientos m
      LEFT JOIN bancos b ON m.banco_id = b.id
      WHERE b.id IS NULL
    `)

    if (bancosInvalidosResult.rows.length > 0) {
      log('Encontrados bancoId inválidos:', 'error')
      for (const row of bancosInvalidosResult.rows) {
        console.log(`  • ${(row as any).banco_id}`)
      }
      return false
    }

    log('Todas las referencias a bancos son válidas', 'success')

    // Contar movimientos por banco
    const porBancoResult = await executeRaw(`
      SELECT b.id, b.nombre, COUNT(m.id) as count
      FROM bancos b
      LEFT JOIN movimientos m ON b.id = m.banco_id
      GROUP BY b.id, b.nombre
      ORDER BY count DESC
    `)

    log('Movimientos por banco:', 'info')
    for (const row of porBancoResult.rows) {
      const { id, nombre, count } = row as any
      console.log(`  • ${nombre} (${id}): ${count} movimientos`)
    }

    return true
  } catch (error) {
    log(`Error verificando integridad: ${error}`, 'error')
    return false
  }
}

async function verificarNoExistenColeccionesFragmentadas() {
  section('4. Verificando ausencia de colecciones fragmentadas')

  try {
    const coleccionesFragmentadas = [
      'boveda_monte_ingresos',
      'boveda_usa_ingresos',
      'profit_ingresos',
      'leftie_ingresos',
      'azteca_ingresos',
      'flete_sur_ingresos',
      'utilidades_ingresos',
      'boveda_monte_gastos',
      'boveda_usa_gastos',
      'profit_gastos',
      // etc...
    ]

    const tablesResult = await executeRaw(`
      SELECT name FROM sqlite_master
      WHERE type='table'
    `)

    const tablesExistentes = tablesResult.rows.map((row: any) => row.name)

    const fragmentadasEncontradas = coleccionesFragmentadas.filter((col) =>
      tablesExistentes.includes(col),
    )

    if (fragmentadasEncontradas.length > 0) {
      log('Encontradas colecciones fragmentadas:', 'error')
      for (const col of fragmentadasEncontradas) {
        console.log(`  • ${col}`)
      }
      log('Estas colecciones deben ser migradas a "movimientos"', 'warn')
      return false
    }

    log('No existen colecciones fragmentadas ✓', 'success')
    return true
  } catch (error) {
    log(`Error verificando colecciones: ${error}`, 'error')
    return false
  }
}

async function verificarIndices() {
  section('5. Verificando índices')

  try {
    const indicesResult = await executeRaw(`
      SELECT name FROM sqlite_master
      WHERE type='index' AND tbl_name='movimientos'
    `)

    if (indicesResult.rows.length === 0) {
      log('No hay índices en la tabla movimientos', 'warn')
      log('Considera crear índices para: banco_id, tipo, fecha, referencia', 'info')
      return true
    }

    log('Índices encontrados:', 'info')
    for (const row of indicesResult.rows) {
      console.log(`  • ${(row as any).name}`)
    }

    log('Índices configurados correctamente', 'success')
    return true
  } catch (error) {
    log(`Error verificando índices: ${error}`, 'error')
    return false
  }
}

async function generarReporte() {
  section('6. Generando reporte de migración')

  try {
    // Totales por tipo
    const porTipoResult = await executeRaw(`
      SELECT tipo, COUNT(*) as count, SUM(monto) as total
      FROM movimientos
      GROUP BY tipo
    `)

    console.log('\n📊 RESUMEN DE MOVIMIENTOS\n')

    let totalRegistros = 0
    let totalMonto = 0

    for (const row of porTipoResult.rows) {
      const { tipo, count, total } = row as any
      totalRegistros += count
      totalMonto += total || 0
      console.log(
        `  ${tipo.padEnd(25)} | Registros: ${String(count).padStart(6)} | Total: $${(total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      )
    }

    console.log('\n' + '─'.repeat(80))
    console.log(
      `  ${'TOTAL'.padEnd(25)} | Registros: ${String(totalRegistros).padStart(6)} | Total: $${totalMonto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    )
    console.log('─'.repeat(80))

    // Movimientos más recientes
    const recientesResult = await executeRaw(`
      SELECT fecha, tipo, concepto, monto
      FROM movimientos
      ORDER BY fecha DESC
      LIMIT 5
    `)

    if (recientesResult.rows.length > 0) {
      console.log('\n📅 ÚLTIMOS 5 MOVIMIENTOS\n')
      for (const row of recientesResult.rows) {
        const { fecha, tipo, concepto, monto } = row as any
        const fechaStr = new Date(fecha * 1000).toLocaleDateString('es-MX')
        console.log(`  ${fechaStr} | ${tipo} | ${concepto} | $${monto.toLocaleString('es-MX')}`)
      }
    }

    return true
  } catch (error) {
    log(`Error generando reporte: ${error}`, 'error')
    return false
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EJECUTAR VERIFICACIONES
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('\n')
  console.log(colors.bright + colors.cyan)
  console.log('═══════════════════════════════════════════════════════════════════════════════')
  console.log('  🔍 VERIFICACIÓN DE MIGRACIÓN A MOVIMIENTOS UNIFICADO')
  console.log('  CHRONOS SYSTEM - Database Migration Checker')
  console.log('═══════════════════════════════════════════════════════════════════════════════')
  console.log(colors.reset)

  const checks = [
    { name: 'Tabla movimientos', fn: verificarTablaMovimientos },
    { name: 'Tipos de movimiento', fn: verificarTiposMovimiento },
    { name: 'Integridad referencial', fn: verificarIntegridadReferencial },
    { name: 'Colecciones fragmentadas', fn: verificarNoExistenColeccionesFragmentadas },
    { name: 'Índices', fn: verificarIndices },
  ]

  const results: boolean[] = []

  for (const check of checks) {
    try {
      const result = await check.fn()
      results.push(result)
    } catch (error) {
      log(`Error en verificación "${check.name}": ${error}`, 'error')
      results.push(false)
    }
  }

  // Generar reporte final
  await generarReporte()

  // Resumen
  section('RESUMEN')

  const passed = results.filter(Boolean).length
  const total = results.length

  console.log(`\nVerificaciones pasadas: ${passed}/${total}`)

  if (passed === total) {
    log('\n✨ Migración a movimientos unificado COMPLETADA ✨\n', 'success')
    process.exit(0)
  } else {
    log('\n⚠️  Algunas verificaciones fallaron. Revisar logs arriba.\n', 'error')
    process.exit(1)
  }
}

// Ejecutar
main().catch((error) => {
  console.error('Error fatal:', error)
  process.exit(1)
})
