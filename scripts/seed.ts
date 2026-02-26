import { BANCOS_ORDENADOS } from "@/app/_lib/constants/bancos"
import { db } from "@/database"
import {
    almacen,
    bancos,
    clientes,
    distribuidores,
    movimientos,
    ordenesCompra,
    usuarios,
    ventas,
} from "@/database/schema"
import { hashPassword } from "@/lib/auth/password"
import { nanoid } from "nanoid"

/**
 * Script de seed para inicializar la base de datos con datos de prueba
 * Ejecutar con: pnpm tsx scripts/seed.ts
 *
 * Passwords se hashean con PBKDF2-SHA256 (compatible con /api/auth/login)
 * Admin:    admin@chronos.com  / chronos2025
 * Operador: operador@chronos.com / operador123
 */

async function seed() {
  console.log("🌱 Iniciando seed de la base de datos...")

  try {
    // 1. Crear usuario admin con password hasheado
    console.log("📝 Creando usuario admin...")
    const adminPasswordHash = await hashPassword("chronos2025")
    await db
      .insert(usuarios)
      .values({
        id: "admin-1",
        email: "admin@chronos.com",
        password: adminPasswordHash,
        nombre: "Administrador",
        role: "admin",
      })
      .onConflictDoNothing()

    // Usuario operador
    const operadorPasswordHash = await hashPassword("operador123")
    await db
      .insert(usuarios)
      .values({
        id: "operador-1",
        email: "operador@chronos.com",
        password: operadorPasswordHash,
        nombre: "Operador Sistema",
        role: "operator",
      })
      .onConflictDoNothing()

    // 2. Crear los 7 bancos/bóvedas con capital inicial
    console.log("🏦 Creando bancos/bóvedas...")
    const capitalesIniciales: Record<string, number> = {
      boveda_monte: 150000,
      boveda_usa: 85000,
      profit: 42000,
      leftie: 28500,
      azteca: 15000,
      flete_sur: 12500,
      utilidades: 67000,
    }

    for (const banco of BANCOS_ORDENADOS) {
      await db
        .insert(bancos)
        .values({
          id: banco.id,
          nombre: banco.nombre,
          tipo: banco.tipo,
          capitalActual: capitalesIniciales[banco.id] || 0,
          historicoIngresos: capitalesIniciales[banco.id] || 0,
          historicoGastos: 0,
          color: banco.color,
          icono: banco.icono,
          orden: banco.orden,
          activo: true,
        })
        .onConflictDoNothing()
    }

    // 3. Crear clientes de ejemplo
    console.log("👥 Creando clientes...")
    const clientesData = [
      {
        nombre: "Juan Pérez",
        email: "juan@empresa.com",
        telefono: "555-1234",
        direccion: "Calle Principal 123",
        limiteCredito: 50000,
      },
      {
        nombre: "María García",
        email: "maria@negocio.com",
        telefono: "555-5678",
        direccion: "Av. Central 456",
        limiteCredito: 75000,
      },
      {
        nombre: "Carlos López",
        email: "carlos@comercial.com",
        telefono: "555-9012",
        direccion: "Blvd. Norte 789",
        limiteCredito: 100000,
      },
      {
        nombre: "Ana Martínez",
        email: "ana@distribuidora.com",
        telefono: "555-3456",
        direccion: "Plaza Sur 321",
        limiteCredito: 60000,
      },
      {
        nombre: "Roberto Sánchez",
        email: "roberto@tienda.com",
        telefono: "555-7890",
        direccion: "Calle Comercio 654",
        limiteCredito: 45000,
      },
      {
        nombre: "Laura Hernández",
        email: "laura@almacen.com",
        telefono: "555-2345",
        direccion: "Av. Industrial 987",
        limiteCredito: 80000,
      },
      {
        nombre: "Miguel Torres",
        email: "miguel@mayorista.com",
        telefono: "555-6789",
        direccion: "Zona Centro 147",
        limiteCredito: 120000,
      },
      {
        nombre: "Patricia Díaz",
        email: "patricia@retail.com",
        telefono: "555-0123",
        direccion: "Plaza Mayor 258",
        limiteCredito: 55000,
      },
      {
        nombre: "Fernando Ruiz",
        email: "fernando@market.com",
        telefono: "555-4567",
        direccion: "Calle Principal 369",
        limiteCredito: 90000,
      },
      {
        nombre: "Carmen Morales",
        email: "carmen@comercio.com",
        telefono: "555-8901",
        direccion: "Av. Libertad 741",
        limiteCredito: 70000,
      },
    ]

    for (const cliente of clientesData) {
      await db
        .insert(clientes)
        .values({
          id: nanoid(),
          ...cliente,
          saldoPendiente: 0,
          estado: "activo",
        })
        .onConflictDoNothing()
    }

    // 4. Crear distribuidores de ejemplo
    console.log("🚚 Creando distribuidores...")
    const distribuidoresData = [
      {
        nombre: "Proveedor Nacional SA",
        empresa: "Proveedor Nacional",
        telefono: "555-1111",
        email: "ventas@provnacional.com",
        tipoProductos: "Electrónicos",
      },
      {
        nombre: "Importadora del Norte",
        empresa: "Importadora Norte",
        telefono: "555-2222",
        email: "contacto@impnorte.com",
        tipoProductos: "Accesorios",
      },
      {
        nombre: "Distribuidora Central",
        empresa: "Dist. Central",
        telefono: "555-3333",
        email: "pedidos@distcentral.com",
        tipoProductos: "Varios",
      },
      {
        nombre: "Mayorista Sur",
        empresa: "Mayorista Sur SA",
        telefono: "555-4444",
        email: "ventas@mayosur.com",
        tipoProductos: "Tecnología",
      },
      {
        nombre: "Comercializadora Este",
        empresa: "Com. Este",
        telefono: "555-5555",
        email: "info@comeste.com",
        tipoProductos: "Hogar",
      },
    ]

    for (const dist of distribuidoresData) {
      await db
        .insert(distribuidores)
        .values({
          id: nanoid(),
          ...dist,
          saldoPendiente: 0,
          estado: "activo",
        })
        .onConflictDoNothing()
    }

    // 5. Crear productos de almacén
    console.log("📦 Creando productos de almacén...")
    const productosData = [
      {
        nombre: "Producto A",
        descripcion: "Producto premium tipo A",
        cantidad: 150,
        precioCompra: 500,
        precioVenta: 750,
        minimo: 20,
      },
      {
        nombre: "Producto B",
        descripcion: "Producto estándar tipo B",
        cantidad: 80,
        precioCompra: 350,
        precioVenta: 525,
        minimo: 15,
      },
      {
        nombre: "Producto C",
        descripcion: "Producto económico tipo C",
        cantidad: 200,
        precioCompra: 200,
        precioVenta: 320,
        minimo: 30,
      },
      {
        nombre: "Producto D",
        descripcion: "Producto especial tipo D",
        cantidad: 45,
        precioCompra: 800,
        precioVenta: 1200,
        minimo: 10,
      },
      {
        nombre: "Producto E",
        descripcion: "Producto importado tipo E",
        cantidad: 25,
        precioCompra: 1500,
        precioVenta: 2200,
        minimo: 5,
      },
    ]

    for (const prod of productosData) {
      await db
        .insert(almacen)
        .values({
          id: nanoid(),
          ...prod,
          ubicacion: "Almacén Principal",
        })
        .onConflictDoNothing()
    }

    // 6. Crear órdenes de compra con stock
    console.log("📦 Creando órdenes de compra...")

    // Obtener distribuidores creados
    const distList = await db.select().from(distribuidores).limit(5)

    const ordenesData = [
      {
        producto: "iPhone 15 Pro",
        cantidad: 50,
        precioUnitario: 18000,
        flete: 500,
        distribuidorIdx: 0,
      },
      {
        producto: "MacBook Air M3",
        cantidad: 30,
        precioUnitario: 25000,
        flete: 800,
        distribuidorIdx: 1,
      },
      {
        producto: 'iPad Pro 12.9"',
        cantidad: 40,
        precioUnitario: 22000,
        flete: 600,
        distribuidorIdx: 2,
      },
      {
        producto: "AirPods Pro 2",
        cantidad: 100,
        precioUnitario: 4500,
        flete: 100,
        distribuidorIdx: 3,
      },
      {
        producto: "Apple Watch Ultra 2",
        cantidad: 25,
        precioUnitario: 17000,
        flete: 300,
        distribuidorIdx: 4,
      },
      {
        producto: "Samsung Galaxy S24 Ultra",
        cantidad: 35,
        precioUnitario: 22000,
        flete: 500,
        distribuidorIdx: 0,
      },
      {
        producto: "PlayStation 5 Pro",
        cantidad: 20,
        precioUnitario: 14000,
        flete: 600,
        distribuidorIdx: 1,
      },
    ]

    let ordenNumero = 1
    for (const orden of ordenesData) {
      const dist = distList[orden.distribuidorIdx % distList.length]
      if (!dist) continue

      const subtotal = orden.precioUnitario * orden.cantidad
      const fleteTotal = orden.flete * orden.cantidad
      const total = subtotal + fleteTotal
      const montoPagado = total * 0.6 // 60% pagado

      await db
        .insert(ordenesCompra)
        .values({
          id: nanoid(),
          distribuidorId: dist.id,
          fecha: new Date(),
          numeroOrden: `OC${String(ordenNumero++).padStart(4, "0")}`,
          producto: orden.producto,
          cantidad: orden.cantidad,
          stockActual: orden.cantidad, // Todo disponible
          stockVendido: 0,
          precioUnitario: orden.precioUnitario,
          fleteUnitario: orden.flete,
          costoUnitarioTotal: orden.precioUnitario + orden.flete,
          subtotal,
          fleteTotal,
          total,
          montoPagado,
          montoRestante: total - montoPagado,
          porcentajePagado: 60,
          estado: "parcial",
          estadoStock: "disponible",
        })
        .onConflictDoNothing()
    }

    // 7. Crear algunas ventas de ejemplo
    console.log("💰 Creando ventas de ejemplo...")

    // Obtener clientes y ordenes creados
    const clientesList = await db.select().from(clientes).limit(5)
    const ordenesList = await db.select().from(ordenesCompra).limit(3)

    for (let i = 0; i < 5; i++) {
      const cliente = clientesList[i % clientesList.length]
      const orden = ordenesList[i % ordenesList.length]
      if (!cliente || !orden) continue

      const cantidad = 2 + Math.floor(Math.random() * 5)
      const precioVenta = (orden.precioUnitario ?? 0) * 1.35 // 35% margen
      const precioCompra = orden.precioUnitario ?? 0
      const precioFlete = orden.fleteUnitario ?? 0
      const totalVenta = precioVenta * cantidad
      const estadoPago = i < 2 ? "completo" : i < 4 ? "parcial" : "pendiente"
      const montoPagado =
        estadoPago === "completo" ? totalVenta : estadoPago === "parcial" ? totalVenta * 0.5 : 0

      await db
        .insert(ventas)
        .values({
          id: nanoid(),
          clienteId: cliente.id,
          fecha: new Date(),
          cantidad,
          precioVentaUnidad: precioVenta,
          precioCompraUnidad: precioCompra,
          precioFlete,
          precioTotalVenta: totalVenta,
          montoPagado,
          montoRestante: totalVenta - montoPagado,
          estadoPago,
          bancoDestino: "boveda_monte",
          observaciones: `Venta de ${orden.producto}`,
          origenLotes: JSON.stringify([{ ocId: orden.id, cantidad }]),
        })
        .onConflictDoNothing()
    }

    // 8. Crear movimientos de ejemplo
    console.log("📊 Creando movimientos de ejemplo...")

    const movimientosData = [
      { tipo: "ingreso", bancoId: "boveda_monte", monto: 50000, concepto: "Ingreso inicial" },
      { tipo: "ingreso", bancoId: "utilidades", monto: 25000, concepto: "Ganancias mes anterior" },
      { tipo: "gasto", bancoId: "profit", monto: 8000, concepto: "Gastos operativos" },
      {
        tipo: "transferencia",
        bancoId: "boveda_monte",
        monto: 15000,
        concepto: "Transferencia a Profit",
      },
      { tipo: "ingreso", bancoId: "flete_sur", monto: 5000, concepto: "Recuperación fletes" },
    ]

    for (const mov of movimientosData) {
      await db
        .insert(movimientos)
        .values({
          id: nanoid(),
          tipo: mov.tipo as "ingreso" | "gasto" | "transferencia",
          bancoId: mov.bancoId,
          bancoOrigenId: mov.tipo === "transferencia" ? mov.bancoId : null,
          bancoDestinoId: mov.tipo === "transferencia" ? "profit" : null,
          monto: mov.monto,
          concepto: mov.concepto,
          fecha: new Date(),
        })
        .onConflictDoNothing()
    }

    console.log("✅ Seed completado exitosamente!")
    console.log("📊 Resumen:")
    console.log("   - 2 usuarios (admin + operador)")
    console.log("   - 7 bancos/bóvedas con capital inicial")
    console.log("   - 10 clientes")
    console.log("   - 5 distribuidores")
    console.log("   - 5 productos en almacén")
    console.log("   - 7 órdenes de compra con stock")
    console.log("   - 5 ventas de ejemplo")
    console.log("   - 5 movimientos bancarios")
    console.log("")
    console.log("🔐 Credenciales:")
    console.log("   Admin: admin@chronos.com / chronos2025")
    console.log("   Operador: operador@chronos.com / operador123")
  } catch (error) {
    console.error("❌ Error en seed:", error)
    process.exit(1)
  }
}

seed()
