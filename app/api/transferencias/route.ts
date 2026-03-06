import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

export const dynamic = "force-dynamic"
import { eq } from "drizzle-orm"

export async function GET() {
  const rows = await db.select().from(schema.transferencias)
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const data = await request.json()
  const id = data.id || `trans-${Date.now()}`
  const now = new Date().toISOString()

  await db.insert(schema.transferencias).values({
    id,
    fecha: data.fecha ?? now,
    tipo: data.tipo ?? "transferencia",
    monto: data.monto ?? 0,
    bancoOrigen: data.bancoOrigen ?? "",
    bancoDestino: data.bancoDestino ?? "",
    concepto: data.concepto ?? "",
    referencia: data.referencia ?? "",
    estado: data.estado ?? "completada",
  })

  // Deduct from origin bank
  if (data.bancoOrigen) {
    const [origen] = await db.select().from(schema.bancos).where(eq(schema.bancos.id, data.bancoOrigen))
    if (origen) {
      await db.update(schema.bancos).set({
        capitalActual: origen.capitalActual - (data.monto ?? 0),
        historicoTransferencias: origen.historicoTransferencias + (data.monto ?? 0),
        updatedAt: now,
      }).where(eq(schema.bancos.id, data.bancoOrigen))
    }
  }

  // Add to destination bank
  if (data.bancoDestino) {
    const [destino] = await db.select().from(schema.bancos).where(eq(schema.bancos.id, data.bancoDestino))
    if (destino) {
      await db.update(schema.bancos).set({
        capitalActual: destino.capitalActual + (data.monto ?? 0),
        updatedAt: now,
      }).where(eq(schema.bancos.id, data.bancoDestino))
    }
  }

  const [created] = await db.select().from(schema.transferencias).where(eq(schema.transferencias.id, id))
  return NextResponse.json(created, { status: 201 })
}
