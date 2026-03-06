import { db } from "../lib/db"
import * as schema from "../lib/db/schema"
import { BANCOS } from "../lib/constants"
import {
  distribuidoresData,
  clientesData,
  ordenesCompraData,
  ventasData,
  productosData,
} from "../lib/data/initial-data"

async function seed() {
  console.log("🌱 Seeding database...")

  // Seed Bancos
  for (const banco of BANCOS) {
    await db.insert(schema.bancos).values({
      id: banco.id,
      nombre: banco.nombre,
      icon: banco.icon,
      color: banco.color,
      tipo: banco.tipo,
      descripcion: banco.descripcion ?? "",
      capitalActual: banco.capitalActual,
      historicoIngresos: banco.historicoIngresos ?? 0,
      historicoGastos: banco.historicoGastos ?? 0,
      historicoTransferencias: banco.historicoTransferencias ?? 0,
      estado: banco.estado,
    }).onConflictDoNothing()
  }
  console.log(`  ✅ ${BANCOS.length} bancos`)

  // Seed Distribuidores
  for (const dist of distribuidoresData) {
    await db.insert(schema.distribuidores).values({
      id: dist.id,
      nombre: dist.nombre,
      deudaTotal: dist.deudaTotal,
      totalOrdenesCompra: dist.totalOrdenesCompra,
      totalPagado: dist.totalPagado,
    }).onConflictDoNothing()
  }
  console.log(`  ✅ ${distribuidoresData.length} distribuidores`)

  // Seed Clientes
  for (const cli of clientesData) {
    await db.insert(schema.clientes).values({
      id: cli.id,
      nombre: cli.nombre,
      deudaTotal: cli.deudaTotal,
      totalVentas: cli.totalVentas,
      totalPagado: cli.totalPagado,
    }).onConflictDoNothing()
  }
  console.log(`  ✅ ${clientesData.length} clientes`)

  // Seed Ordenes de Compra
  for (const oc of ordenesCompraData) {
    await db.insert(schema.ordenesCompra).values({
      id: oc.id,
      fecha: typeof oc.fecha === "string" ? oc.fecha : new Date(oc.fecha).toISOString(),
      origen: oc.origen,
      distribuidor: oc.distribuidor,
      producto: oc.producto,
      cantidad: oc.cantidad,
      costoDistribuidor: oc.costoDistribuidor,
      costoTransporte: oc.costoTransporte ?? 0,
      costoPorUnidad: oc.costoPorUnidad,
      costoTotal: oc.costoTotal,
      pagoDistribuidor: oc.pagoDistribuidor ?? 0,
      deuda: oc.deuda ?? 0,
      estado: oc.estado ?? "pendiente",
      bancoOrigen: oc.bancoOrigen ?? null,
    }).onConflictDoNothing()
  }
  console.log(`  ✅ ${ordenesCompraData.length} ordenes de compra`)

  // Seed Ventas
  for (const venta of ventasData) {
    await db.insert(schema.ventas).values({
      id: venta.id,
      fecha: typeof venta.fecha === "string" ? venta.fecha : new Date(venta.fecha).toISOString(),
      cliente: venta.cliente,
      producto: venta.producto,
      cantidad: venta.cantidad,
      precioVentaUnidad: venta.precioVentaUnidad,
      precioCompraUnidad: venta.precioCompraUnidad,
      precioFlete: venta.precioFlete ?? 500,
      precioTotalUnidad: venta.precioTotalUnidad ?? venta.precioVentaUnidad,
      precioTotalVenta: venta.precioTotalVenta,
      distribucionBancosJson: JSON.stringify(venta.distribucionBancos ?? {}),
      montoPagado: venta.montoPagado ?? 0,
      montoRestante: venta.montoRestante ?? 0,
      estadoPago: venta.estadoPago ?? "pendiente",
    }).onConflictDoNothing()
  }
  console.log(`  ✅ ${ventasData.length} ventas`)

  // Seed Productos
  for (const prod of productosData) {
    await db.insert(schema.productos).values({
      id: prod.id,
      nombre: prod.nombre,
      origen: prod.origen ?? "",
      stockActual: prod.stockActual ?? 0,
      totalEntradas: prod.totalEntradas ?? 0,
      totalSalidas: prod.totalSalidas ?? 0,
      valorUnitario: prod.valorUnitario ?? 0,
    }).onConflictDoNothing()
  }
  console.log(`  ✅ ${productosData.length} productos`)

  console.log("🎉 Seed complete!")
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
