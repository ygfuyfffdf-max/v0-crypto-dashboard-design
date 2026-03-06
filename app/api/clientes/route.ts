import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

export const dynamic = "force-dynamic"
import { eq } from "drizzle-orm"

export async function GET() {
  const rows = await db.select().from(schema.clientes)
  const pagos = await db.select().from(schema.historialPagos)
  const ventasRows = await db.select().from(schema.ventas)

  const result = rows.map((c) => ({
    ...c,
    historialPagos: pagos.filter((p) => p.clienteId === c.id),
    ventas: ventasRows.filter((v) => v.clienteId === c.id).map((v) => v.id),
  }))

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const data = await request.json()
  const id = data.id || `cli-${Date.now()}`

  await db.insert(schema.clientes).values({
    id,
    nombre: data.nombre,
    deudaTotal: data.deudaTotal ?? 0,
    totalVentas: data.totalVentas ?? 0,
    totalPagado: data.totalPagado ?? 0,
  })

  const [created] = await db.select().from(schema.clientes).where(eq(schema.clientes.id, id))
  return NextResponse.json(created, { status: 201 })
}

export async function PUT(request: Request) {
  const data = await request.json()
  const { id, ...updates } = data
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  await db.update(schema.clientes).set({ ...updates, updatedAt: new Date().toISOString() }).where(eq(schema.clientes.id, id))
  const [updated] = await db.select().from(schema.clientes).where(eq(schema.clientes.id, id))
  return NextResponse.json(updated)
}
