import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

export const dynamic = "force-dynamic"
import { eq } from "drizzle-orm"

export async function GET() {
  const rows = await db.select().from(schema.ingresosBanco)
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const data = await request.json()
  const id = data.id || `ingreso-${Date.now()}`
  const now = new Date().toISOString()

  await db.insert(schema.ingresosBanco).values({
    id,
    tipo: data.tipo ?? "ingreso",
    fecha: data.fecha ?? now,
    monto: data.monto ?? 0,
    origen: data.origen ?? "",
    concepto: data.concepto ?? "",
    bancoId: data.bancoId ?? data.banco ?? "",
    referencia: data.referencia ?? "",
  })

  // Add to banco
  if (data.bancoId || data.banco) {
    const bancoId = data.bancoId || data.banco
    const [banco] = await db.select().from(schema.bancos).where(eq(schema.bancos.id, bancoId))
    if (banco) {
      await db.update(schema.bancos).set({
        capitalActual: banco.capitalActual + (data.monto ?? 0),
        historicoIngresos: banco.historicoIngresos + (data.monto ?? 0),
        updatedAt: now,
      }).where(eq(schema.bancos.id, bancoId))
    }
  }

  const [created] = await db.select().from(schema.ingresosBanco).where(eq(schema.ingresosBanco.id, id))
  return NextResponse.json(created, { status: 201 })
}
