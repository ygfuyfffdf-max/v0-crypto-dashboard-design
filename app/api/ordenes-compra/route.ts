import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

export const dynamic = "force-dynamic"
import { eq } from "drizzle-orm"

export async function GET() {
  const rows = await db.select().from(schema.ordenesCompra)
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const data = await request.json()
  const id = data.id || `oc-${Date.now()}`
  const now = new Date().toISOString()

  // Find or create distribuidor
  let [distribuidor] = await db.select().from(schema.distribuidores)
    .where(eq(schema.distribuidores.nombre, data.distribuidor))

  if (!distribuidor) {
    const distId = `dist-${Date.now()}`
    await db.insert(schema.distribuidores).values({
      id: distId,
      nombre: data.distribuidor,
      deudaTotal: data.deuda ?? 0,
      totalOrdenesCompra: data.costoTotal ?? 0,
      totalPagado: data.pagoDistribuidor ?? 0,
    })
    distribuidor = (await db.select().from(schema.distribuidores).where(eq(schema.distribuidores.id, distId)))[0]
  } else {
    await db.update(schema.distribuidores).set({
      deudaTotal: distribuidor.deudaTotal + (data.deuda ?? 0),
      totalOrdenesCompra: distribuidor.totalOrdenesCompra + (data.costoTotal ?? 0),
      updatedAt: now,
    }).where(eq(schema.distribuidores.id, distribuidor.id))
  }

  // Create orden
  await db.insert(schema.ordenesCompra).values({
    id,
    fecha: data.fecha ?? now,
    origen: data.origen ?? "",
    distribuidor: data.distribuidor,
    producto: data.producto ?? "",
    cantidad: data.cantidad ?? 0,
    costoDistribuidor: data.costoDistribuidor ?? 0,
    costoTransporte: data.costoTransporte ?? 0,
    costoPorUnidad: data.costoPorUnidad ?? 0,
    costoTotal: data.costoTotal ?? 0,
    pagoDistribuidor: data.pagoDistribuidor ?? 0,
    deuda: data.deuda ?? 0,
    estado: data.estado ?? "pendiente",
    bancoOrigen: data.bancoOrigen ?? null,
    distribuidorId: distribuidor.id,
  })

  // Register inventory entry
  const [producto] = await db.select().from(schema.productos)
    .where(eq(schema.productos.nombre, data.producto ?? ""))

  if (producto) {
    await db.update(schema.productos).set({
      stockActual: producto.stockActual + (data.cantidad ?? 0),
      totalEntradas: producto.totalEntradas + (data.cantidad ?? 0),
      updatedAt: now,
    }).where(eq(schema.productos.id, producto.id))

    await db.insert(schema.movimientosAlmacen).values({
      id: `mov-${Date.now()}`,
      productoId: producto.id,
      tipo: "entrada",
      fecha: now,
      cantidad: data.cantidad ?? 0,
      origen: data.distribuidor,
    })
  }

  // Process payment from banco
  const pagoDistribuidor = data.pagoDistribuidor ?? 0
  if (pagoDistribuidor > 0) {
    const bancoId = data.bancoOrigen ?? "boveda-monte"
    const [banco] = await db.select().from(schema.bancos).where(eq(schema.bancos.id, bancoId))
    if (banco) {
      await db.update(schema.bancos).set({
        capitalActual: banco.capitalActual - pagoDistribuidor,
        updatedAt: now,
      }).where(eq(schema.bancos.id, bancoId))
    }
  }

  const [created] = await db.select().from(schema.ordenesCompra).where(eq(schema.ordenesCompra.id, id))
  return NextResponse.json(created, { status: 201 })
}
