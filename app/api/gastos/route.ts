import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

export const dynamic = "force-dynamic"
import { eq } from "drizzle-orm"

export async function GET() {
  const rows = await db.select().from(schema.gastosBanco)
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const data = await request.json()
  const id = data.id || `gasto-${Date.now()}`
  const now = new Date().toISOString()

  await db.insert(schema.gastosBanco).values({
    id,
    tipo: data.tipo ?? "gasto",
    fecha: data.fecha ?? now,
    monto: data.monto ?? 0,
    destino: data.destino ?? "",
    concepto: data.concepto ?? "",
    bancoId: data.bancoId ?? data.banco ?? "",
    referencia: data.referencia ?? "",
  })

  // Deduct from banco
  if (data.bancoId || data.banco) {
    const bancoId = data.bancoId || data.banco
    const [banco] = await db.select().from(schema.bancos).where(eq(schema.bancos.id, bancoId))
    if (banco) {
      await db.update(schema.bancos).set({
        capitalActual: banco.capitalActual - (data.monto ?? 0),
        historicoGastos: banco.historicoGastos + (data.monto ?? 0),
        updatedAt: now,
      }).where(eq(schema.bancos.id, bancoId))
    }
  }

  const [created] = await db.select().from(schema.gastosBanco).where(eq(schema.gastosBanco.id, id))
  return NextResponse.json(created, { status: 201 })
}
