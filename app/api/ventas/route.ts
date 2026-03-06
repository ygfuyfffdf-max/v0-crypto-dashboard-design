import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

export const dynamic = "force-dynamic"
import { eq } from "drizzle-orm"

export async function GET() {
  const rows = await db.select().from(schema.ventas)
  // Parse distribucionBancosJson back to object
  const result = rows.map((v) => ({
    ...v,
    distribucionBancos: JSON.parse(v.distribucionBancosJson || "{}"),
  }))
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const data = await request.json()
  const id = data.id || `venta-${Date.now()}`
  const now = new Date().toISOString()

  // Find or create cliente
  let [cliente] = await db.select().from(schema.clientes)
    .where(eq(schema.clientes.nombre, data.cliente))

  if (!cliente) {
    const cliId = `cli-${Date.now()}`
    await db.insert(schema.clientes).values({
      id: cliId,
      nombre: data.cliente,
      deudaTotal: data.montoRestante ?? 0,
      totalVentas: data.precioTotalVenta ?? 0,
      totalPagado: data.montoPagado ?? 0,
    })
    cliente = (await db.select().from(schema.clientes).where(eq(schema.clientes.id, cliId)))[0]
  } else {
    await db.update(schema.clientes).set({
      deudaTotal: cliente.deudaTotal + (data.montoRestante ?? 0),
      totalVentas: cliente.totalVentas + (data.precioTotalVenta ?? 0),
      totalPagado: cliente.totalPagado + (data.montoPagado ?? 0),
      updatedAt: now,
    }).where(eq(schema.clientes.id, cliente.id))
  }

  // Calculate banco distribution
  const montoBovedaMonte = (data.precioCompraUnidad ?? 0) * (data.cantidad ?? 0)
  const montoFletes = (data.precioFlete ?? 500) * (data.cantidad ?? 0)
  const montoUtilidades = ((data.precioVentaUnidad ?? 0) - (data.precioCompraUnidad ?? 0) - (data.precioFlete ?? 500)) * (data.cantidad ?? 0)

  const distribucionBancos = {
    bovedaMonte: montoBovedaMonte,
    fletes: montoFletes,
    utilidades: montoUtilidades,
  }

  // Create venta
  await db.insert(schema.ventas).values({
    id,
    fecha: data.fecha ?? now,
    cliente: data.cliente,
    producto: data.producto ?? "",
    cantidad: data.cantidad ?? 0,
    precioVentaUnidad: data.precioVentaUnidad ?? 0,
    precioCompraUnidad: data.precioCompraUnidad ?? 0,
    precioFlete: data.precioFlete ?? 500,
    precioTotalUnidad: data.precioTotalUnidad ?? data.precioVentaUnidad ?? 0,
    precioTotalVenta: data.precioTotalVenta ?? 0,
    distribucionBancosJson: JSON.stringify(distribucionBancos),
    montoPagado: data.montoPagado ?? 0,
    montoRestante: data.montoRestante ?? 0,
    estadoPago: data.estadoPago ?? "pendiente",
    clienteId: cliente.id,
  })

  // Deduct stock
  const [producto] = await db.select().from(schema.productos)
    .where(eq(schema.productos.nombre, data.producto ?? ""))

  if (producto) {
    await db.update(schema.productos).set({
      stockActual: producto.stockActual - (data.cantidad ?? 0),
      totalSalidas: producto.totalSalidas + (data.cantidad ?? 0),
      updatedAt: now,
    }).where(eq(schema.productos.id, producto.id))

    await db.insert(schema.movimientosAlmacen).values({
      id: `mov-${Date.now()}`,
      productoId: producto.id,
      tipo: "salida",
      fecha: now,
      cantidad: data.cantidad ?? 0,
      destino: data.cliente,
    })
  }

  // Distribute payment to bancos if montoPagado > 0
  if ((data.montoPagado ?? 0) > 0) {
    const proporcionPagada = data.montoPagado / data.precioTotalVenta

    const [bancoMonte] = await db.select().from(schema.bancos).where(eq(schema.bancos.id, "boveda-monte"))
    if (bancoMonte) {
      await db.update(schema.bancos).set({
        capitalActual: bancoMonte.capitalActual + montoBovedaMonte * proporcionPagada,
        updatedAt: now,
      }).where(eq(schema.bancos.id, "boveda-monte"))
    }

    const [bancoFletes] = await db.select().from(schema.bancos).where(eq(schema.bancos.id, "fletes"))
    if (bancoFletes) {
      await db.update(schema.bancos).set({
        capitalActual: bancoFletes.capitalActual + montoFletes * proporcionPagada,
        updatedAt: now,
      }).where(eq(schema.bancos.id, "fletes"))
    }

    const [bancoUtil] = await db.select().from(schema.bancos).where(eq(schema.bancos.id, "utilidades"))
    if (bancoUtil) {
      await db.update(schema.bancos).set({
        capitalActual: bancoUtil.capitalActual + montoUtilidades * proporcionPagada,
        updatedAt: now,
      }).where(eq(schema.bancos.id, "utilidades"))
    }
  }

  const [created] = await db.select().from(schema.ventas).where(eq(schema.ventas.id, id))
  return NextResponse.json({
    ...created,
    distribucionBancos,
  }, { status: 201 })
}
