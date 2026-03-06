import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

export const dynamic = "force-dynamic"
import { eq } from "drizzle-orm"

export async function GET() {
  const rows = await db.select().from(schema.bancos)
  return NextResponse.json(rows)
}

export async function PUT(request: Request) {
  const data = await request.json()
  const { id, ...updates } = data
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  await db.update(schema.bancos).set({ ...updates, updatedAt: new Date().toISOString() }).where(eq(schema.bancos.id, id))
  const [updated] = await db.select().from(schema.bancos).where(eq(schema.bancos.id, id))
  return NextResponse.json(updated)
}
