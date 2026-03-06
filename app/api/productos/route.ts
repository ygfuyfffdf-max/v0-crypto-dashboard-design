import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

export const dynamic = "force-dynamic"
import { eq } from "drizzle-orm"

export async function GET() {
  const productos = await db.select().from(schema.productos)
  // Attach movimientos for each producto
  const result = await Promise.all(
    productos.map(async (p) => {
      const movimientos = await db.select().from(schema.movimientosAlmacen)
        .where(eq(schema.movimientosAlmacen.productoId, p.id))
      const entradas = movimientos.filter((m) => m.tipo === "entrada")
      const salidas = movimientos.filter((m) => m.tipo === "salida")
      return { ...p, entradas, salidas }
    })
  )
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const data = await request.json()
  const id = data.id || `prod-${Date.now()}`
  const now = new Date().toISOString()

  await db.insert(schema.productos).values({
    id,
    nombre: data.nombre ?? "",
    origen: data.origen ?? "",
    stockActual: data.stockActual ?? 0,
    totalEntradas: data.totalEntradas ?? 0,
    totalSalidas: data.totalSalidas ?? 0,
    valorUnitario: data.valorUnitario ?? 0,
  })

  const [created] = await db.select().from(schema.productos).where(eq(schema.productos.id, id))
  return NextResponse.json(created, { status: 201 })
}

export async function PUT(request: Request) {
  const data = await request.json()
  if (!data.id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 })
  }
  const now = new Date().toISOString()
  const { id, ...updates } = data

  await db.update(schema.productos).set({
    ...updates,
    updatedAt: now,
  }).where(eq(schema.productos.id, id))

  const [updated] = await db.select().from(schema.productos).where(eq(schema.productos.id, id))
  return NextResponse.json(updated)
}
