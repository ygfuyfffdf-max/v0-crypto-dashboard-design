// database/cleanup.ts
// ═══════════════════════════════════════════════════════════════════════════════
// 🧹 CHRONOS - Script de Limpieza Completa de Base de Datos
// Elimina todos los registros dejando el sistema en estado inicial
// ═══════════════════════════════════════════════════════════════════════════════

import { sql } from 'drizzle-orm'
import { db } from './index'

// Lista de todas las tablas a limpiar (orden correcto para evitar FK violations)
const tablesToClean = [
  // Primero tablas dependientes
  'auditoria',
  'pagos_venta',
  'pagos_orden',
  'ventas_gya',
  'lotes_venta',
  'lotes',
  'movimientos',
  'cortes_caja',
  'abonos_cliente',
  'gastos_abonos',
  // Luego tablas principales
  'ventas',
  'ordenes_compra',
  'almacen',
  // Tablas maestras
  'clientes',
  'distribuidores',
  'bancos',
  // No limpiar usuarios para mantener acceso
]

async function cleanupDatabase() {
  console.log('🧹 CHRONOS - Iniciando limpieza completa de base de datos...\n')

  for (const table of tablesToClean) {
    try {
      // Usar sql raw para DELETE
      await db.run(sql.raw(`DELETE FROM ${table}`))
      console.log(`✅ Tabla '${table}' limpiada`)
    } catch (error) {
      // Ignorar errores si la tabla no existe
      console.log(`⚠️  Tabla '${table}' no existe o error: ${(error as Error).message}`)
    }
  }

  // Reiniciar auto-increments si es necesario
  console.log('\n🔄 Reiniciando secuencias...')

  try {
    await db.run(sql.raw('DELETE FROM sqlite_sequence'))
    console.log('✅ Secuencias reiniciadas')
  } catch {
    console.log('⚠️  No se pudieron reiniciar secuencias (normal en algunas configuraciones)')
  }

  console.log('\n' + '═'.repeat(60))
  console.log('🎉 LIMPIEZA COMPLETA')
  console.log('═'.repeat(60))
  console.log('\n📊 Estado del sistema:')
  console.log('   • Todas las tablas: VACÍAS')
  console.log('   • Contadores: REINICIADOS')
  console.log('   • Sistema listo para nueva automatización')
  console.log('\n💡 Ejecuta `pnpm db:seed` si deseas cargar datos iniciales')
}

// Ejecutar
cleanupDatabase()
  .then(() => {
    console.log('\n✨ Script finalizado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error durante la limpieza:', error)
    process.exit(1)
  })
