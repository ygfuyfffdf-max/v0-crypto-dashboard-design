/**
 * Script para corregir datos corruptos en la tabla bancos usando SQL directo
 */
import { db } from "../database"

async function fixBancosData() {
  console.log("🔧 Corrigiendo datos de bancos con SQL directo...")

  try {
    // Usar SQL directo para asegurarnos de que se actualicen todos los campos
    await db.execute(`
      UPDATE bancos SET
        capital_minimo = 0,
        capital_maximo = 10000000,
        historico_transferencias_entrada = 0,
        historico_transferencias_salida = 0,
        ingresos_hoy = 0,
        gastos_hoy = 0,
        flujo_neto_hoy = 0,
        movimientos_hoy = 0,
        ingresos_semana = 0,
        gastos_semana = 0,
        flujo_neto_semana = 0,
        movimientos_semana = 0,
        ingresos_mes = 0,
        gastos_mes = 0,
        flujo_neto_mes = 0,
        movimientos_mes = 0,
        promedio_ingresos_diario = 0,
        promedio_gastos_diario = 0,
        porcentaje_ventas = 0,
        porcentaje_transferencias = 0,
        porcentaje_manual = 0,
        porcentaje_distribucion_gya = 0,
        tendencia_capital = 'estable',
        tendencia_flujo = 'estable',
        variacion_mes_anterior = 0,
        variacion_semana_anterior = 0,
        proyeccion_fin_mes = 0,
        dias_hasta_agotamiento = 0,
        proyeccion_tres_meses = 0,
        score_liquidez = 50,
        score_flujo = 50,
        score_estabilidad = 50,
        score_total = 50,
        estado_salud = 'bueno',
        alertas = NULL,
        notas = NULL,
        ultima_actualizacion_metricas = NULL
    `)

    console.log("✅ Datos de bancos corregidos exitosamente")

    // Verificar resultado
    const result = await db.execute(
      "SELECT id, nombre, capital_minimo, score_flujo FROM bancos LIMIT 1"
    )
    console.log("📊 Verificación:", result.rows[0])
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

fixBancosData()
