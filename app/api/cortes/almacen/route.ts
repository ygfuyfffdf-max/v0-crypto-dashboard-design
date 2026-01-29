import { NextResponse } from 'next/server'
import { db } from '@/database'
import { almacen } from '@/database/schema'
import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════
// GET - Corte de inventario de almacén
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
  try {
    // Obtener todos los productos del almacén
    const productos = await db.select().from(almacen).orderBy(almacen.nombre)

    // Calcular métricas del almacén
    const totalProductos = productos.length
    const productosActivos = productos.filter((p) => p.cantidad && p.cantidad > 0).length
    const productosSinStock = productos.filter((p) => !p.cantidad || p.cantidad === 0).length
    const productosStockBajo = productos.filter(
      (p) => (p.cantidad || 0) <= (p.minimo || 0) && (p.cantidad || 0) > 0,
    ).length

    // Calcular valorización del inventario
    const valorTotalCompra = productos.reduce((sum, p) => {
      const valor = (p.cantidad || 0) * (p.precioCompra || 0)
      return sum + valor
    }, 0)

    const valorTotalVenta = productos.reduce((sum, p) => {
      const valor = (p.cantidad || 0) * (p.precioVenta || 0)
      return sum + valor
    }, 0)

    const utilidadPotencial = valorTotalVenta - valorTotalCompra
    const margenPromedio = valorTotalCompra > 0 ? (utilidadPotencial / valorTotalCompra) * 100 : 0

    // Productos con stock más alto (Top 10)
    const top10MasStock = [...productos]
      .sort((a, b) => (b.cantidad || 0) - (a.cantidad || 0))
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        nombre: p.nombre,
        cantidad: p.cantidad,
        valorInventario: (p.cantidad || 0) * (p.precioCompra || 0),
      }))

    // Productos con mayor valor en inventario (Top 10)
    const top10MasValor = [...productos]
      .sort((a, b) => {
        const valorA = (a.cantidad || 0) * (a.precioCompra || 0)
        const valorB = (b.cantidad || 0) * (b.precioCompra || 0)
        return valorB - valorA
      })
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        nombre: p.nombre,
        cantidad: p.cantidad,
        precioCompra: p.precioCompra,
        valorInventario: (p.cantidad || 0) * (p.precioCompra || 0),
      }))

    // Productos con stock bajo o crítico
    const productosStockCritico = productos
      .filter((p) => (p.cantidad || 0) <= (p.minimo || 0))
      .map((p) => ({
        id: p.id,
        nombre: p.nombre,
        stockActual: p.cantidad,
        stockMinimo: p.minimo,
        diferencia: (p.minimo || 0) - (p.cantidad || 0),
      }))
      .sort((a, b) => b.diferencia - a.diferencia)

    // Agrupar por ubicación si existe
    const porUbicacion = productos.reduce(
      (acc, p) => {
        const ubicacion = p.ubicacion || 'Sin ubicación'
        if (!acc[ubicacion]) {
          acc[ubicacion] = {
            cantidad: 0,
            productos: 0,
            valorTotal: 0,
          }
        }
        acc[ubicacion].productos++
        acc[ubicacion].cantidad += p.cantidad || 0
        acc[ubicacion].valorTotal += (p.cantidad || 0) * (p.precioCompra || 0)
        return acc
      },
      {} as Record<string, { cantidad: number; productos: number; valorTotal: number }>,
    )

    const corteAlmacen = {
      resumen: {
        totalProductos,
        productosActivos,
        productosSinStock,
        productosStockBajo,
        productosStockCritico: productosStockCritico.length,
      },
      valorizacion: {
        valorTotalCompra,
        valorTotalVenta,
        utilidadPotencial,
        margenPromedio: Math.round(margenPromedio * 100) / 100,
      },
      tops: {
        masStock: top10MasStock,
        masValor: top10MasValor,
      },
      alertas: {
        stockCritico: productosStockCritico,
      },
      porUbicacion: Object.entries(porUbicacion).map(([ubicacion, data]) => ({
        ubicacion,
        ...data,
      })),
      generadoEn: new Date().toISOString(),
    }

    logger.info('Corte de almacén generado', {
      context: 'API/cortes/almacen',
      totalProductos,
      valorTotal: valorTotalCompra,
      productosStockCritico: productosStockCritico.length,
    })

    return NextResponse.json(corteAlmacen)
  } catch (error) {
    logger.error('Error generando corte de almacén:', error as Error, {
      context: 'API/cortes/almacen',
    })
    return NextResponse.json(
      {
        error: 'Error interno al generar corte de almacén',
      },
      { status: 500 },
    )
  }
}
