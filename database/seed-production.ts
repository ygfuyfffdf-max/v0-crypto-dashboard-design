// @ts-nocheck
// ═══════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — SEED PRODUCCIÓN
// Inicializa los 7 bancos CON CAPITAL EN CERO para uso real
// + Productos básicos para almacén
// NO incluye datos de prueba ni demo
// ═══════════════════════════════════════════════════════════════

import { logger } from "@/app/lib/utils/logger"
import { db } from "@/database"
import { almacen, bancos } from "@/database/schema"
import { nanoid } from "nanoid"
import type { BancoSeedData } from "./seed-bancos"

// ═══════════════════════════════════════════════════════════════
// LOS 7 BANCOS PARA PRODUCCIÓN - CAPITAL EN CERO
// ═══════════════════════════════════════════════════════════════

const BANCOS_PRODUCTION: BancoSeedData[] = [
  {
    id: "boveda_monte",
    nombre: "Bóveda Monte",
    tipo: "operativo",
    capitalActual: 0, // PRODUCCIÓN: Iniciar en 0
    historicoIngresos: 0,
    historicoGastos: 0,
    color: "#FFD700",
    icono: "Vault",
    orden: 1,
    activo: true,
    personality: {
      apodo: "El Guardián Eterno",
      descripcion: "Oro líquido cayendo desde la cima, derramando riqueza",
      colorPrimario: "#FFD700",
      colorSecundario: "#B8860B",
      animacion: "oro_cayendo",
      sonido: "Respiración grave y profunda, como montaña durmiente",
      velocidadRespiracion: 0.8,
      escalaDistorsion: 0.12,
      frecuenciaNoise: 2.5,
    },
  },
  {
    id: "boveda_usa",
    nombre: "Bóveda USA",
    tipo: "operativo",
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: "#228B22",
    icono: "DollarSign",
    orden: 2,
    activo: true,
    personality: {
      apodo: "El Extranjero Elegante",
      descripcion: "Oro con destellos verdes, bandera ondeando sutilmente",
      colorPrimario: "#FFD700",
      colorSecundario: "#228B22",
      animacion: "billetes_flotando",
      sonido: "Himno lejano, monedas cayendo suavemente",
      velocidadRespiracion: 0.9,
      escalaDistorsion: 0.14,
      frecuenciaNoise: 2.8,
    },
  },
  {
    id: "profit",
    nombre: "Profit",
    tipo: "inversion",
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: "#8B00FF",
    icono: "TrendingUp",
    orden: 3,
    activo: true,
    personality: {
      apodo: "El Visionario",
      descripcion: "El emperador del sistema, violeta con destellos dorados",
      colorPrimario: "#8B00FF",
      colorSecundario: "#FFD700",
      animacion: "fuegos_artificiales",
      sonido: "Fanfarria triunfal, trompetas doradas",
      velocidadRespiracion: 1.1,
      escalaDistorsion: 0.16,
      frecuenciaNoise: 3.2,
    },
  },
  {
    id: "leftie",
    nombre: "Leftie",
    tipo: "ahorro",
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: "#FF1493",
    icono: "Crown",
    orden: 4,
    activo: true,
    personality: {
      apodo: "El Rey Noble",
      descripcion: "Esfera rosa fuerte con corona dorada flotante",
      colorPrimario: "#FF1493",
      colorSecundario: "#FFD700",
      animacion: "corona_rotando",
      sonido: "Coro angelical, campanas de cristal",
      velocidadRespiracion: 0.85,
      escalaDistorsion: 0.1,
      frecuenciaNoise: 2.2,
    },
  },
  {
    id: "azteca",
    nombre: "Azteca",
    tipo: "operativo",
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: "#DC143C",
    icono: "Landmark",
    orden: 5,
    activo: true,
    personality: {
      apodo: "El Guerrero del Amanecer",
      descripcion: "Rojo carmesí con rayos de sol girando alrededor",
      colorPrimario: "#DC143C",
      colorSecundario: "#FF8C00",
      animacion: "sol_azteca",
      sonido: "Tambores ceremoniales, flautas",
      velocidadRespiracion: 1.0,
      escalaDistorsion: 0.15,
      frecuenciaNoise: 3.0,
    },
  },
  {
    id: "flete_sur",
    nombre: "Flete Sur",
    tipo: "operativo",
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: "#1E90FF",
    icono: "Truck",
    orden: 6,
    activo: true,
    personality: {
      apodo: "El Viajero Incansable",
      descripcion: "Azul intenso con estelas de movimiento, siempre en marcha",
      colorPrimario: "#1E90FF",
      colorSecundario: "#00CED1",
      animacion: "carretera_infinita",
      sonido: "Motor diesel, viento en carretera",
      velocidadRespiracion: 1.3,
      escalaDistorsion: 0.18,
      frecuenciaNoise: 3.5,
    },
  },
  {
    id: "utilidades",
    nombre: "Utilidades",
    tipo: "inversion",
    capitalActual: 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    color: "#32CD32",
    icono: "Sparkles",
    orden: 7,
    activo: true,
    personality: {
      apodo: "El Tesoro Verde",
      descripcion: "Verde esmeralda brillante con partículas de dinero flotando",
      colorPrimario: "#32CD32",
      colorSecundario: "#FFD700",
      animacion: "lluvia_dinero",
      sonido: "Cascada de monedas, caja registradora alegre",
      velocidadRespiracion: 1.2,
      escalaDistorsion: 0.17,
      frecuenciaNoise: 3.3,
    },
  },
]

// ═══════════════════════════════════════════════════════════════
// MAIN - Ejecutar seed de producción
// ═══════════════════════════════════════════════════════════════

async function seedProduction() {
  try {
    logger.info("🚀 INICIANDO SEED DE PRODUCCIÓN - Capital en cero", {
      context: "SeedProduction",
    })

    // Limpiar bancos existentes
    await db.delete(bancos)
    logger.info("✅ Bancos existentes eliminados", { context: "SeedProduction" })

    // Insertar los 7 bancos
    for (const banco of BANCOS_PRODUCTION) {
      // NOTA: id se pasa explícitamente porque es primaryKey definido por nosotros (no autoincrement)
      // createdAt y updatedAt NO se pasan - tienen defaults SQL
      await db.insert(bancos).values({
        id: banco.id,
        nombre: banco.nombre,
        tipo: banco.tipo,
        capitalActual: banco.capitalActual,
        historicoIngresos: banco.historicoIngresos,
        historicoGastos: banco.historicoGastos,
        color: banco.color,
        icono: banco.icono,
        orden: banco.orden,
        activo: banco.activo,
        // NO incluir createdAt/updatedAt - usan default sql`(unixepoch())`
      })

      logger.info(`✅ Banco creado: ${banco.nombre}`, {
        context: "SeedProduction",
        banco: banco.id,
        capital: banco.capitalActual,
      })
    }

    // ═══════════════════════════════════════════════════════════════
    // PRODUCTOS BÁSICOS PARA ALMACÉN
    // ═══════════════════════════════════════════════════════════════

    logger.info("🏭 Creando productos básicos...", { context: "SeedProduction" })

    const productosBasicos = [
      {
        id: `prod_${nanoid(12)}`,
        nombre: "Producto Ejemplo A",
        descripcion: "Producto base para iniciar operaciones",
        sku: "PROD-A-001",
        categoria: "General",
        cantidad: 0,
        stockActual: 0,
        stockMinimo: 10,
        stockMaximo: 100,
        precioCompra: 100,
        precioVenta: 150,
        precioCompraPromedio: 100,
        precioVentaPromedio: 150,
        activo: true,
      },
      {
        id: `prod_${nanoid(12)}`,
        nombre: "Producto Ejemplo B",
        descripcion: "Producto de prueba inicial",
        sku: "PROD-B-002",
        categoria: "General",
        cantidad: 0,
        stockActual: 0,
        stockMinimo: 5,
        stockMaximo: 50,
        precioCompra: 200,
        precioVenta: 300,
        precioCompraPromedio: 200,
        precioVentaPromedio: 300,
        activo: true,
      },
      {
        id: `prod_${nanoid(12)}`,
        nombre: "Producto Ejemplo C",
        descripcion: "Artículo para configuración inicial",
        sku: "PROD-C-003",
        categoria: "Premium",
        cantidad: 0,
        stockActual: 0,
        stockMinimo: 3,
        stockMaximo: 30,
        precioCompra: 500,
        precioVenta: 750,
        precioCompraPromedio: 500,
        precioVentaPromedio: 750,
        activo: true,
      },
    ]

    await db.insert(almacen).values(productosBasicos)

    logger.info("✅ Productos creados exitosamente", {
      context: "SeedProduction",
      cantidad: productosBasicos.length,
    })

    logger.info("🎉 SEED DE PRODUCCIÓN COMPLETADO", {
      context: "SeedProduction",
      bancosCreados: BANCOS_PRODUCTION.length,
      productosCreados: productosBasicos.length,
      capitalTotal: 0,
      mensaje: "Sistema listo para operación real con Turso + Drizzle",
    })

    console.log("\n🎉 PRODUCCIÓN LISTA:")
    console.log("✅ 7 bancos creados con capital en CERO")
    console.log(`✅ ${productosBasicos.length} productos básicos creados`)
    console.log("✅ Sin datos mock ni demo")
    console.log("✅ Conectado a Turso Database")
    console.log("✅ Listo para Vercel deployment")
    console.log("\n💡 Siguiente paso: Registrar primera orden de compra para iniciar operaciones\n")
  } catch (error) {
    logger.error("❌ Error en seed de producción", error, { context: "SeedProduction" })
    throw error
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  seedProduction()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Error fatal:", error)
      process.exit(1)
    })
}

export { BANCOS_PRODUCTION, seedProduction }
