import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

export const dynamic = "force-dynamic"
import { eq } from "drizzle-orm"

// POST /api/abonos — handles both abonar distribuidor and abonar cliente
export async function POST(request: Request) {
  const data = await request.json()
  const { tipo, monto, bancoOrigen, distribuidorId, clienteId } = data
  const now = new Date().toISOString()

  if (!tipo || !monto || !bancoOrigen) {
    return NextResponse.json({ error: "tipo, monto, bancoOrigen requeridos" }, { status: 400 })
  }

  // Deduct from banco
  const [banco] = await db.select().from(schema.bancos).where(eq(schema.bancos.id, bancoOrigen))
  if (!banco) {
    return NextResponse.json({ error: "Banco no encontrado" }, { status: 404 })
  }

  if (tipo === "distribuidor" && distribuidorId) {
    // Abonar distribuidor
    const [dist] = await db.select().from(schema.distribuidores).where(eq(schema.distribuidores.id, distribuidorId))
    if (!dist) {
      return NextResponse.json({ error: "Distribuidor no encontrado" }, { status: 404 })
    }

    // Update distribuidor
    await db.update(schema.distribuidores).set({
      deudaTotal: Math.max(0, dist.deudaTotal - monto),
      totalPagado: dist.totalPagado + monto,
      updatedAt: now,
    }).where(eq(schema.distribuidores.id, distribuidorId))

    // Deduct from banco
    await db.update(schema.bancos).set({
      capitalActual: banco.capitalActual - monto,
      updatedAt: now,
    }).where(eq(schema.bancos.id, bancoOrigen))

    // Create historial pago
    await db.insert(schema.historialPagos).values({
      fecha: now,
      monto,
      bancoOrigen,
      distribuidorId,
    })

    return NextResponse.json({ success: true, tipo: "distribuidor", monto })

  } else if (tipo === "cliente" && clienteId) {
    // Abonar cliente — distribute proportionally to 3 bancos based on oldest pending venta
    const [cli] = await db.select().from(schema.clientes).where(eq(schema.clientes.id, clienteId))
    if (!cli) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    // Get pending ventas for this cliente (sorted by fecha asc)
    const ventasPendientes = await db.select().from(schema.ventas)
      .where(eq(schema.ventas.clienteId, clienteId))

    const pendientes = ventasPendientes
      .filter((v) => v.montoRestante > 0)
      .sort((a, b) => (a.fecha ?? "").localeCompare(b.fecha ?? ""))

    let remaining = monto

    // Deduct from the specified banco first
    await db.update(schema.bancos).set({
      capitalActual: banco.capitalActual - monto,
      updatedAt: now,
    }).where(eq(schema.bancos.id, bancoOrigen))

    // Distribute proportionally across bancos based on venta distribution
    let totalBovedaMonte = 0
    let totalFletes = 0
    let totalUtilidades = 0

    for (const venta of pendientes) {
      if (remaining <= 0) break

      const abonoVenta = Math.min(remaining, venta.montoRestante)
      remaining -= abonoVenta

      const dist = JSON.parse(venta.distribucionBancosJson || "{}")
      const totalVenta = (dist.bovedaMonte ?? 0) + (dist.fletes ?? 0) + (dist.utilidades ?? 0)

      if (totalVenta > 0) {
        totalBovedaMonte += abonoVenta * ((dist.bovedaMonte ?? 0) / totalVenta)
        totalFletes += abonoVenta * ((dist.fletes ?? 0) / totalVenta)
        totalUtilidades += abonoVenta * ((dist.utilidades ?? 0) / totalVenta)
      }

      // Update venta
      await db.update(schema.ventas).set({
        montoPagado: venta.montoPagado + abonoVenta,
        montoRestante: venta.montoRestante - abonoVenta,
        estadoPago: venta.montoRestante - abonoVenta <= 0 ? "pagado" : "parcial",
        updatedAt: now,
      }).where(eq(schema.ventas.id, venta.id))
    }

    // Distribute to the 3 bancos (add income)
    if (totalBovedaMonte > 0) {
      const [bm] = await db.select().from(schema.bancos).where(eq(schema.bancos.id, "boveda-monte"))
      if (bm) {
        await db.update(schema.bancos).set({
          capitalActual: bm.capitalActual + totalBovedaMonte,
          updatedAt: now,
        }).where(eq(schema.bancos.id, "boveda-monte"))
      }
    }
    if (totalFletes > 0) {
      const [fl] = await db.select().from(schema.bancos).where(eq(schema.bancos.id, "fletes"))
      if (fl) {
        await db.update(schema.bancos).set({
          capitalActual: fl.capitalActual + totalFletes,
          updatedAt: now,
        }).where(eq(schema.bancos.id, "fletes"))
      }
    }
    if (totalUtilidades > 0) {
      const [ut] = await db.select().from(schema.bancos).where(eq(schema.bancos.id, "utilidades"))
      if (ut) {
        await db.update(schema.bancos).set({
          capitalActual: ut.capitalActual + totalUtilidades,
          updatedAt: now,
        }).where(eq(schema.bancos.id, "utilidades"))
      }
    }

    // Update cliente
    await db.update(schema.clientes).set({
      deudaTotal: Math.max(0, cli.deudaTotal - monto),
      totalPagado: cli.totalPagado + monto,
      updatedAt: now,
    }).where(eq(schema.clientes.id, clienteId))

    // Create historial pago
    await db.insert(schema.historialPagos).values({
      fecha: now,
      monto,
      bancoOrigen,
      clienteId,
    })

    return NextResponse.json({
      success: true,
      tipo: "cliente",
      monto,
      distribucion: { bovedaMonte: totalBovedaMonte, fletes: totalFletes, utilidades: totalUtilidades },
    })
  }

  return NextResponse.json({ error: "tipo debe ser 'distribuidor' o 'cliente'" }, { status: 400 })
}
