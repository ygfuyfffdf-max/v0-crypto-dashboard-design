import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

export const dynamic = "force-dynamic"
import { eq } from "drizzle-orm"

export async function GET() {
  const rows = await db.select().from(schema.distribuidores)
  // Also fetch historial pagos per distribuidor
  const pagos = await db.select().from(schema.historialPagos)
  const ocs = await db.select().from(schema.ordenesCompra)

  const result = rows.map((d) => ({
    ...d,
    historialPagos: pagos.filter((p) => p.distribuidorId === d.id),
    ordenesCompra: ocs.filter((oc) => oc.distribuidorId === d.id).map((oc) => oc.id),
  }))

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const data = await request.json()
  const id = data.id || `dist-${Date.now()}`

  await db.insert(schema.distribuidores).values({
    id,
    nombre: data.nombre,
    deudaTotal: data.deudaTotal ?? 0,
    totalOrdenesCompra: data.totalOrdenesCompra ?? 0,
    totalPagado: data.totalPagado ?? 0,
  })

  const [created] = await db.select().from(schema.distribuidores).where(eq(schema.distribuidores.id, id))
  return NextResponse.json(created, { status: 201 })
}

export async function PUT(request: Request) {
  const data = await request.json()
  const { id, ...updates } = data
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  await db.update(schema.distribuidores).set({ ...updates, updatedAt: new Date().toISOString() }).where(eq(schema.distribuidores.id, id))
  const [updated] = await db.select().from(schema.distribuidores).where(eq(schema.distribuidores.id, id))
  return NextResponse.json(updated)
}
