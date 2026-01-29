import {
  db,
  bancos,
  clientes,
  distribuidores,
  ventas,
  ordenesCompra,
  movimientos,
  almacen,
} from "../database"

async function checkDb() {
  try {
    // Contar registros en cada tabla
    const [bancosCount] = await db.select().from(bancos)
    const [clientesCount] = await db.select().from(clientes)
    const [distribuidoresCount] = await db.select().from(distribuidores)

    console.log("📊 Estado de la base de datos:")
    console.log("================================")

    const bancosAll = await db.select().from(bancos)
    const clientesAll = await db.select().from(clientes)
    const distribuidoresAll = await db.select().from(distribuidores)
    const ventasAll = await db.select().from(ventas)
    const ocAll = await db.select().from(ordenesCompra)
    const movAll = await db.select().from(movimientos)
    const almacenAll = await db.select().from(almacen)

    console.log(`  🏦 Bancos: ${bancosAll.length}`)
    console.log(`  👥 Clientes: ${clientesAll.length}`)
    console.log(`  �� Distribuidores: ${distribuidoresAll.length}`)
    console.log(`  💰 Ventas: ${ventasAll.length}`)
    console.log(`  📦 Órdenes de Compra: ${ocAll.length}`)
    console.log(`  📊 Movimientos: ${movAll.length}`)
    console.log(`  📦 Almacén: ${almacenAll.length}`)

    console.log("\n✅ Base de datos conectada correctamente")
  } catch (error) {
    console.error("❌ Error:", error)
  }
  process.exit(0)
}

checkDb()
