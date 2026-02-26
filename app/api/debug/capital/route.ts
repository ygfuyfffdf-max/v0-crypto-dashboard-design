import { db } from '@/database'
import { bancos } from '@/database/schema'
import { eq, sum } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Consulta de capital total
    const capitalResult = await db
      .select({ total: sum(bancos.capitalActual) })
      .from(bancos)
      .where(eq(bancos.activo, 1))

    // Consulta de todos los bancos
    const allBancos = await db.select().from(bancos)

    return NextResponse.json({
      capitalResult,
      capitalTotal: Number(capitalResult[0]?.total) || 0,
      bancos: allBancos.map((b) => ({
        id: b.id,
        nombre: b.nombre,
        capitalActual: b.capitalActual,
        activo: b.activo,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
