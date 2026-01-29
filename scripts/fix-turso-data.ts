/**
 * Script para corregir datos corruptos en Turso
 */
import { createClient } from "@libsql/client"

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
})

async function fixBancosData() {
  console.log("🔧 Corrigiendo datos de bancos...")

  const updateSQL = `
    UPDATE bancos SET
      capital_minimo = 0,
      capital_maximo = 1000000,
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
      dias_hasta_agotamiento = NULL,
      proyeccion_tres_meses = 0,
      score_liquidez = 100,
      score_flujo = 100,
      score_estabilidad = 100,
      score_total = 100,
      estado_salud = 'excelente',
      alertas = NULL,
      notas = NULL,
      ultima_actualizacion_metricas = NULL
  `

  await client.execute(updateSQL)
  console.log("✅ Bancos actualizados")
}

async function main() {
  try {
    await fixBancosData()

    const bancos = await client.execute(
      "SELECT id, nombre, capital_minimo, capital_maximo, score_total FROM bancos"
    )
    console.log("\n📊 Verificación:")
    bancos.rows.forEach((r) => {
      console.log(
        `  ${r.id}: capitalMin=${r.capital_minimo}, capitalMax=${r.capital_maximo}, score=${r.score_total}`
      )
    })

    console.log("\n🎉 Datos corregidos exitosamente")
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

main()
