import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import {
    almacen,
    bancos,
    clientes,
    distribuidores,
    entradaAlmacen,
    movimientos,
    ordenesCompra,
    salidaAlmacen,
    ventas,
} from '@/database/schema'
import { NextResponse, type NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// POST - Resetear todo el sistema a estado limpio con bancos en 0
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { confirmar = false, capitalInicial = 0 } = body

    // Requerir confirmación explícita
    if (!confirmar) {
      return NextResponse.json(
        {
          error: 'Confirmación requerida',
          mensaje:
            'Envía { confirmar: true } para resetear todo el sistema. Esta acción es IRREVERSIBLE.',
        },
        { status: 400 },
      )
    }

    const ahora = new Date()
    const resultados = {
      salidasEliminadas: 0,
      entradasEliminadas: 0,
      movimientosEliminados: 0,
      ventasEliminadas: 0,
      ordenesEliminadas: 0,
      productosEliminados: 0,
      clientesEliminados: 0,
      distribuidoresEliminados: 0,
      bancosReseteados: 0,
    }

    logger.info('🔄 Iniciando RESET COMPLETO del sistema', {
      context: 'API/sistema/reset',
      capitalInicial,
    })

    // ═══════════════════════════════════════════════════════════════
    // PASO 1: ELIMINAR DATOS TRANSACCIONALES (orden correcto para FK)
    // ═══════════════════════════════════════════════════════════════

    // 1. Salidas de almacén
    const salidas = await db.delete(salidaAlmacen).returning()
    resultados.salidasEliminadas = salidas.length

    // 2. Entradas de almacén
    const entradas = await db.delete(entradaAlmacen).returning()
    resultados.entradasEliminadas = entradas.length

    // 3. Movimientos
    const movs = await db.delete(movimientos).returning()
    resultados.movimientosEliminados = movs.length

    // 4. Ventas
    const vtas = await db.delete(ventas).returning()
    resultados.ventasEliminadas = vtas.length

    // 5. Órdenes de compra
    const ocs = await db.delete(ordenesCompra).returning()
    resultados.ordenesEliminadas = ocs.length

    // 6. Productos de almacén
    const prods = await db.delete(almacen).returning()
    resultados.productosEliminados = prods.length

    // 7. Clientes
    const clis = await db.delete(clientes).returning()
    resultados.clientesEliminados = clis.length

    // 8. Distribuidores
    const dists = await db.delete(distribuidores).returning()
    resultados.distribuidoresEliminados = dists.length

    // ═══════════════════════════════════════════════════════════════
    // PASO 2: RESETEAR BANCOS A CAPITAL INICIAL (por defecto 0)
    // ═══════════════════════════════════════════════════════════════

    // Eliminar bancos existentes
    await db.delete(bancos)

    // Crear 7 bancos con capital inicial
    const bancosData = [
      {
        id: 'boveda_monte',
        nombre: 'Bóveda Monte',
        descripcion: 'Capital de compra (precioCompra × cantidad)',
        tipo: 'operativo' as const,
        capitalActual: capitalInicial,
        historicoIngresos: capitalInicial,
        historicoGastos: 0,
        color: '#8B5CF6',
        icono: '🏔️',
        orden: 1,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora,
      },
      {
        id: 'boveda_usa',
        nombre: 'Bóveda USA',
        descripcion: 'Capital en dólares',
        tipo: 'inversion' as const,
        capitalActual: capitalInicial,
        historicoIngresos: capitalInicial,
        historicoGastos: 0,
        color: '#06B6D4',
        icono: '🦅',
        orden: 2,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora,
      },
      {
        id: 'profit',
        nombre: 'Profit',
        descripcion: 'Banco operativo principal',
        tipo: 'operativo' as const,
        capitalActual: capitalInicial,
        historicoIngresos: capitalInicial,
        historicoGastos: 0,
        color: '#10B981',
        icono: '💎',
        orden: 3,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora,
      },
      {
        id: 'leftie',
        nombre: 'Leftie',
        descripcion: 'Banco secundario',
        tipo: 'ahorro' as const,
        capitalActual: capitalInicial,
        historicoIngresos: capitalInicial,
        historicoGastos: 0,
        color: '#F59E0B',
        icono: '🌟',
        orden: 4,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora,
      },
      {
        id: 'azteca',
        nombre: 'Azteca',
        descripcion: 'Banco operativo',
        tipo: 'operativo' as const,
        capitalActual: capitalInicial,
        historicoIngresos: capitalInicial,
        historicoGastos: 0,
        color: '#EC4899',
        icono: '🏛️',
        orden: 5,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora,
      },
      {
        id: 'flete_sur',
        nombre: 'Flete Sur',
        descripcion: 'Gastos de transporte (precioFlete × cantidad)',
        tipo: 'flete' as const,
        capitalActual: capitalInicial,
        historicoIngresos: capitalInicial,
        historicoGastos: 0,
        color: '#14B8A6',
        icono: '🚚',
        orden: 6,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora,
      },
      {
        id: 'utilidades',
        nombre: 'Utilidades',
        descripcion: 'Ganancias netas (precioVenta - costo - flete) × cantidad',
        tipo: 'ganancia' as const,
        capitalActual: capitalInicial,
        historicoIngresos: capitalInicial,
        historicoGastos: 0,
        color: '#22C55E',
        icono: '💰',
        orden: 7,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora,
      },
    ]

    for (const banco of bancosData) {
      await db.insert(bancos).values(banco)
      resultados.bancosReseteados++
    }

    logger.info('✅ Reset completo exitoso', {
      context: 'API/sistema/reset',
      resultados,
    })

    return NextResponse.json({
      success: true,
      mensaje: 'Sistema reseteado completamente',
      timestamp: ahora.toISOString(),
      resultados,
      estadoActual: {
        bancos: 7,
        capitalPorBanco: capitalInicial,
        distribuidores: 0,
        clientes: 0,
        productos: 0,
        ordenesCompra: 0,
        ventas: 0,
        movimientos: 0,
      },
    })
  } catch (error) {
    logger.error('Error en reset del sistema:', error as Error, {
      context: 'API/sistema/reset',
    })
    return NextResponse.json(
      { error: 'Error al resetear el sistema', detalle: (error as Error).message },
      { status: 500 },
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener estado actual del sistema
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
  try {
    const [bancosData, distribuidoresData, clientesData, productosData, ordenesData, ventasData, movimientosData] =
      await Promise.all([
        db.select().from(bancos),
        db.select().from(distribuidores),
        db.select().from(clientes),
        db.select().from(almacen),
        db.select().from(ordenesCompra),
        db.select().from(ventas),
        db.select().from(movimientos),
      ])

    const capitalTotal = bancosData.reduce((sum, b) => sum + (b.capitalActual || 0), 0)

    return NextResponse.json({
      estado: {
        bancos: bancosData.length,
        capitalTotal,
        distribuidores: distribuidoresData.length,
        clientes: clientesData.length,
        productos: productosData.length,
        ordenesCompra: ordenesData.length,
        ventas: ventasData.length,
        movimientos: movimientosData.length,
      },
      detalleBancos: bancosData.map((b) => ({
        id: b.id,
        nombre: b.nombre,
        capital: b.capitalActual,
        ingresos: b.historicoIngresos,
        gastos: b.historicoGastos,
      })),
    })
  } catch (error) {
    logger.error('Error obteniendo estado del sistema:', error as Error, {
      context: 'API/sistema/reset',
    })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
