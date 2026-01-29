import { db, bancos, clientes, distribuidores, ventas, ordenesCompra } from "../database"

async function showData() {
  console.log("\n🏦 BANCOS:")
  console.log("═".repeat(80))
  const bancosData = await db.select().from(bancos)
  bancosData.forEach((b) => {
    console.log(
      `  ${b.nombre}: $${b.capitalActual?.toLocaleString()} | Ingresos: $${b.historicoIngresos?.toLocaleString()} | Gastos: $${b.historicoGastos?.toLocaleString()}`
    )
  })

  console.log("\n👥 CLIENTES:")
  console.log("═".repeat(80))
  const clientesData = await db.select().from(clientes)
  clientesData.slice(0, 5).forEach((c) => {
    console.log(
      `  ${c.nombre} | Saldo Pendiente: $${c.saldoPendiente?.toLocaleString()} | Score: ${c.scoreTotal}`
    )
  })

  console.log("\n🚚 DISTRIBUIDORES:")
  console.log("═".repeat(80))
  const distData = await db.select().from(distribuidores)
  distData.forEach((d) => {
    console.log(
      `  ${d.nombre} (${d.empresa}) | Saldo Pendiente: $${d.saldoPendiente?.toLocaleString()}`
    )
  })

  console.log("\n💰 VENTAS:")
  console.log("═".repeat(80))
  const ventasData = await db.select().from(ventas)
  ventasData.forEach((v) => {
    console.log(
      `  Venta ${v.id.slice(0, 8)}... | Total: $${v.precioTotalVenta?.toLocaleString()} | Pagado: $${v.montoPagado?.toLocaleString()} | Estado: ${v.estadoPago}`
    )
  })

  console.log("\n📦 ÓRDENES DE COMPRA:")
  console.log("═".repeat(80))
  const ocData = await db.select().from(ordenesCompra)
  ocData.forEach((oc) => {
    console.log(
      `  OC ${oc.id.slice(0, 8)}... | ${oc.producto} | Stock: ${oc.stockActual}/${oc.cantidad} | Total: $${oc.total?.toLocaleString()}`
    )
  })

  process.exit(0)
}

showData()
