/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 AI ANALYZE API ROUTE — Análisis Especializado
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Endpoint para análisis especializados con IA:
 * - Predicción de ventas
 * - Detección de anomalías
 * - Recomendaciones de inventario
 * - Análisis de tendencias
 *
 * @version 1.0.0
 */

import { db } from '@/database'
import { ventas, clientes, bancos } from '@/database/schema'
import { logger } from '@/app/lib/utils/logger'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { desc, gte, sql } from 'drizzle-orm'
import { NextRequest } from 'next/server'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const analyzeRequestSchema = z.object({
  type: z.enum([
    'ventas_prediccion',
    'anomalias',
    'recomendaciones_inventario',
    'tendencias',
    'clientes_riesgo',
    'optimizacion_capital',
  ]),
  periodo: z.enum(['semana', 'mes', 'trimestre', 'año']).optional().default('mes'),
  incluirGraficos: z.boolean().optional().default(false),
})

const prediccionVentasSchema = z.object({
  prediccionProximoMes: z.number().describe('Monto estimado de ventas para el próximo mes'),
  confianza: z.number().min(0).max(1).describe('Nivel de confianza de la predicción (0-1)'),
  tendencia: z.enum(['alza', 'baja', 'estable']).describe('Tendencia general de las ventas'),
  factores: z.array(z.string()).describe('Factores clave que influyen en la predicción'),
  recomendaciones: z.array(z.string()).describe('Acciones recomendadas basadas en la predicción'),
})

const anomaliasSchema = z.object({
  anomaliasDetectadas: z.array(
    z.object({
      tipo: z.string(),
      descripcion: z.string(),
      severidad: z.enum(['baja', 'media', 'alta']),
      accionSugerida: z.string(),
    }),
  ),
  totalAnomalias: z.number(),
})

const recomendacionesInventarioSchema = z.object({
  productosReabastecer: z.array(
    z.object({
      producto: z.string(),
      stockActual: z.number(),
      cantidadRecomendada: z.number(),
      prioridad: z.enum(['baja', 'media', 'alta']),
      razon: z.string(),
    }),
  ),
  presupuestoEstimado: z.number(),
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

async function obtenerDatosVentas(dias: number = 30) {
  const fechaInicio = new Date()
  fechaInicio.setDate(fechaInicio.getDate() - dias)

  const ventasData = await db.query.ventas.findMany({
    where: gte(ventas.fecha, fechaInicio),
    orderBy: [desc(ventas.fecha)],
    limit: 100,
  })

  return ventasData
}

async function obtenerEstadisticasGenerales() {
  const [ventasData, clientesData, bancosData] = await Promise.all([
    db.query.ventas.findMany({ limit: 50, orderBy: [desc(ventas.fecha)] }),
    db.query.clientes.findMany(),
    db.query.bancos.findMany(),
  ])

  const totalVentas = ventasData.length
  const montoTotalVentas = ventasData.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)
  const deudaTotal = clientesData.reduce((sum, c) => sum + (c.saldoPendiente || 0), 0)
  const capitalTotal = bancosData.reduce((sum, b) => sum + (b.capitalActual || 0), 0)

  return {
    totalVentas,
    montoTotalVentas,
    ticketPromedio: totalVentas > 0 ? montoTotalVentas / totalVentas : 0,
    deudaTotal,
    capitalTotal,
    clientesActivos: clientesData.filter((c) => c.estado === 'activo').length,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ANÁLISIS ESPECÍFICOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

async function analizarPrediccionVentas() {
  const ventasData = await obtenerDatosVentas(30)
  const stats = await obtenerEstadisticasGenerales()

  if (!process.env.OPENAI_API_KEY) {
    // Predicción simple sin IA
    const promedioVentas = stats.montoTotalVentas / 30
    return {
      prediccionProximoMes: Math.round(promedioVentas * 30),
      confianza: 0.6,
      tendencia: 'estable' as const,
      factores: ['Promedio histórico de 30 días'],
      recomendaciones: ['Configura OPENAI_API_KEY para análisis avanzado'],
    }
  }

  const contexto = `Analiza las siguientes ventas de los últimos 30 días:
- Total ventas: ${ventasData.length}
- Monto total: $${stats.montoTotalVentas.toLocaleString()} MXN
- Ticket promedio: $${Math.round(stats.ticketPromedio).toLocaleString()}
- Capital disponible: $${stats.capitalTotal.toLocaleString()}

Datos de ventas recientes (últimas 10):
${ventasData
  .slice(0, 10)
  .map(
    (v, i) =>
      `${i + 1}. Fecha: ${new Date(v.fecha).toLocaleDateString()}, Monto: $${v.precioTotalVenta?.toLocaleString()}`,
  )
  .join('\n')}

Predice las ventas del próximo mes considerando:
- Tendencias históricas
- Estacionalidad
- Comportamiento de clientes
- Capital disponible para nuevas compras`

  const result = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: prediccionVentasSchema,
    prompt: contexto,
  })

  return result.object
}

async function detectarAnomalias() {
  const ventasData = await obtenerDatosVentas(30)
  const stats = await obtenerEstadisticasGenerales()

  if (!process.env.OPENAI_API_KEY) {
    return {
      anomaliasDetectadas: [],
      totalAnomalias: 0,
    }
  }

  const contexto = `Analiza los siguientes datos del sistema para detectar anomalías:

**Ventas:**
- Total últimos 30 días: ${ventasData.length}
- Monto total: $${stats.montoTotalVentas.toLocaleString()}
- Ticket promedio: $${Math.round(stats.ticketPromedio).toLocaleString()}

**Finanzas:**
- Capital total: $${stats.capitalTotal.toLocaleString()}
- Deuda pendiente: $${stats.deudaTotal.toLocaleString()}

**Clientes:**
- Clientes activos: ${stats.clientesActivos}

Detecta anomalías como:
- Caídas bruscas en ventas
- Aumentos inusuales de deuda
- Patrones irregulares en tickets
- Problemas de flujo de caja`

  const result = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: anomaliasSchema,
    prompt: contexto,
  })

  return result.object
}

async function generarRecomendacionesInventario() {
  const stats = await obtenerEstadisticasGenerales()

  if (!process.env.OPENAI_API_KEY) {
    return {
      productosReabastecer: [],
      presupuestoEstimado: 0,
    }
  }

  const contexto = `Genera recomendaciones de inventario basadas en:

**Ventas recientes:**
- Total ventas: ${stats.totalVentas}
- Monto total: $${stats.montoTotalVentas.toLocaleString()}

**Capital disponible:**
- Total: $${stats.capitalTotal.toLocaleString()}

Considera:
- Rotación de productos
- Estacionalidad
- Capital disponible para compras
- Productos de alta demanda`

  const result = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: recomendacionesInventarioSchema,
    prompt: contexto,
  })

  return result.object
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = analyzeRequestSchema.parse(body)

    logger.info('[AI Analyze] Processing analysis request', {
      context: 'AIAnalyze',
      data: validatedData,
    })

    let resultado

    switch (validatedData.type) {
      case 'ventas_prediccion':
        resultado = await analizarPrediccionVentas()
        break

      case 'anomalias':
        resultado = await detectarAnomalias()
        break

      case 'recomendaciones_inventario':
        resultado = await generarRecomendacionesInventario()
        break

      case 'tendencias':
        resultado = {
          mensaje: 'Análisis de tendencias en desarrollo',
          datos: await obtenerEstadisticasGenerales(),
        }
        break

      case 'clientes_riesgo':
        const clientesData = await db.query.clientes.findMany({
          where: sql`${clientes.saldoPendiente} > 0`,
          orderBy: [desc(clientes.saldoPendiente)],
          limit: 10,
        })
        resultado = {
          clientesEnRiesgo: clientesData.map((c) => ({
            id: c.id,
            nombre: c.nombre,
            deuda: c.saldoPendiente,
          })),
        }
        break

      case 'optimizacion_capital':
        const bancosData = await db.query.bancos.findMany()
        resultado = {
          distribucion: bancosData.map((b) => ({
            banco: b.nombre,
            capital: b.capitalActual,
            tipo: b.tipo,
          })),
          recomendaciones: [
            'Distribuir capital según prioridades operativas',
            'Mantener reserva de emergencia en bóvedas',
          ],
        }
        break

      default:
        resultado = { error: 'Tipo de análisis no soportado' }
    }

    logger.info('[AI Analyze] Analysis completed', {
      context: 'AIAnalyze',
      data: { type: validatedData.type },
    })

    return new Response(JSON.stringify({ success: true, data: resultado }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    logger.error('[AI Analyze] Error', error as Error, { context: 'AIAnalyze' })

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al procesar análisis',
        details: error instanceof Error ? error.message : 'Error desconocido',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}

// GET para health check
export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      endpoint: 'AI Analyze',
      analysisTypes: [
        'ventas_prediccion',
        'anomalias',
        'recomendaciones_inventario',
        'tendencias',
        'clientes_riesgo',
        'optimizacion_capital',
      ],
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )
}
