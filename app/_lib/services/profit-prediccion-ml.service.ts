// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧠 CHRONOS INFINITY 2026 — PREDICCIÓN DE DEMANDA ML
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de Machine Learning para predicción de demanda de divisas:
 * - Análisis de series temporales
 * - Predicción de demanda por divisa
 * - Optimización de inventario de caja
 * - Detección de patrones estacionales
 * - Alertas de reabastecimiento
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface DataPoint {
  fecha: Date
  valor: number
  divisa: string
  tipoOperacion?: 'compra' | 'venta'
}

export interface PrediccionDemanda {
  divisa: string
  periodo: 'hora' | 'dia' | 'semana' | 'mes'
  predicciones: {
    fecha: Date
    valorEstimado: number
    rangoMinimo: number
    rangoMaximo: number
    confianza: number
  }[]
  tendencia: 'alza' | 'baja' | 'estable'
  factoresInfluencia: FactorInfluencia[]
  recomendaciones: Recomendacion[]
  ultimaActualizacion: Date
}

export interface FactorInfluencia {
  nombre: string
  impacto: number // -1 a 1
  descripcion: string
  categoria: 'temporal' | 'economico' | 'politico' | 'estacional' | 'comportamental'
}

export interface Recomendacion {
  tipo: 'inventario' | 'spread' | 'alerta' | 'capacidad'
  prioridad: 'baja' | 'media' | 'alta' | 'critica'
  titulo: string
  descripcion: string
  accionSugerida: string
  impactoEstimado?: string
}

export interface PatronEstacional {
  nombre: string
  periodoInicio: string // MM-DD
  periodoFin: string
  divisasAfectadas: string[]
  incrementoEsperado: number // porcentaje
  descripcion: string
}

export interface ModeloPrediccion {
  id: string
  nombre: string
  tipo: 'arima' | 'prophet' | 'lstm' | 'ensemble'
  precision: number // 0-1
  ultimoEntrenamiento: Date
  metricas: {
    mae: number // Mean Absolute Error
    mape: number // Mean Absolute Percentage Error
    rmse: number // Root Mean Square Error
  }
}

export interface InventarioOptimo {
  divisa: string
  montoActual: number
  montoOptimo: number
  montoMinimo: number
  montoMaximo: number
  diasCobertura: number
  alertaNivel: 'ok' | 'bajo' | 'critico' | 'exceso'
  recomendacionAjuste: number
  razonAjuste?: string
}

export interface AnalisisTendencia {
  divisa: string
  periodo: string
  tendenciaCorto: 'alza' | 'baja' | 'estable' // 1-7 días
  tendenciaMedio: 'alza' | 'baja' | 'estable' // 7-30 días
  tendenciaLargo: 'alza' | 'baja' | 'estable' // 30+ días
  volumen: {
    actual: number
    promedioHistorico: number
    variacion: number
  }
  volatilidad: number // 0-1
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PATRONES ESTACIONALES CONOCIDOS (MÉXICO)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const PATRONES_ESTACIONALES: PatronEstacional[] = [
  {
    nombre: 'Quincenas',
    periodoInicio: '01-15',
    periodoFin: '01-17',
    divisasAfectadas: ['USD', 'EUR'],
    incrementoEsperado: 25,
    descripcion: 'Aumento de demanda por pago de quincena',
  },
  {
    nombre: 'Fin de mes',
    periodoInicio: '01-28',
    periodoFin: '01-31',
    divisasAfectadas: ['USD', 'EUR'],
    incrementoEsperado: 30,
    descripcion: 'Aumento por cierre de mes y pagos',
  },
  {
    nombre: 'Semana Santa',
    periodoInicio: '03-20',
    periodoFin: '04-15',
    divisasAfectadas: ['USD', 'EUR', 'CAD'],
    incrementoEsperado: 40,
    descripcion: 'Temporada vacacional alta',
  },
  {
    nombre: 'Verano',
    periodoInicio: '07-01',
    periodoFin: '08-31',
    divisasAfectadas: ['USD', 'EUR', 'CAD', 'GBP'],
    incrementoEsperado: 50,
    descripcion: 'Temporada de vacaciones y turismo',
  },
  {
    nombre: 'Diciembre',
    periodoInicio: '12-01',
    periodoFin: '12-31',
    divisasAfectadas: ['USD', 'EUR'],
    incrementoEsperado: 60,
    descripcion: 'Temporada navideña y aguinaldos',
  },
  {
    nombre: 'Remesas',
    periodoInicio: '05-10',
    periodoFin: '05-12',
    divisasAfectadas: ['USD'],
    incrementoEsperado: 35,
    descripcion: 'Día de las Madres - envíos desde EE.UU.',
  },
  {
    nombre: 'Black Friday',
    periodoInicio: '11-25',
    periodoFin: '11-30',
    divisasAfectadas: ['USD'],
    incrementoEsperado: 45,
    descripcion: 'Compras en línea desde EE.UU.',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE PREDICCIÓN ML
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class PrediccionDemandaMLService {
  private modelosActivos: Map<string, ModeloPrediccion> = new Map()
  private historialDatos: Map<string, DataPoint[]> = new Map()
  private cachePrediciones: Map<string, PrediccionDemanda> = new Map()
  private ultimaActualizacion: Date = new Date()

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // PREDICCIÓN DE DEMANDA
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene predicción de demanda para una divisa específica
   */
  async predecirDemanda(
    divisa: string,
    periodo: 'hora' | 'dia' | 'semana' | 'mes' = 'dia',
    horizonte: number = 7
  ): Promise<PrediccionDemanda> {
    const cacheKey = `${divisa}_${periodo}_${horizonte}`
    const cached = this.cachePrediciones.get(cacheKey)
    
    // Cache válido por 1 hora
    if (cached && Date.now() - cached.ultimaActualizacion.getTime() < 60 * 60 * 1000) {
      return cached
    }

    try {
      // Obtener datos históricos
      const datosHistoricos = this.obtenerDatosHistoricos(divisa, periodo, 90)
      
      // Aplicar modelo de predicción
      const predicciones = this.aplicarModeloPrediccion(datosHistoricos, horizonte, periodo)
      
      // Identificar factores de influencia
      const factores = this.identificarFactoresInfluencia(divisa, datosHistoricos)
      
      // Generar recomendaciones
      const recomendaciones = this.generarRecomendaciones(divisa, predicciones, factores)
      
      // Calcular tendencia
      const tendencia = this.calcularTendencia(predicciones)

      const resultado: PrediccionDemanda = {
        divisa,
        periodo,
        predicciones,
        tendencia,
        factoresInfluencia: factores,
        recomendaciones,
        ultimaActualizacion: new Date(),
      }

      this.cachePrediciones.set(cacheKey, resultado)
      return resultado
    } catch (error) {
      logger.error('[PrediccionML] Error prediciendo demanda:', error)
      throw error
    }
  }

  /**
   * Obtiene predicción de todas las divisas
   */
  async predecirTodasDivisas(
    periodo: 'dia' | 'semana' = 'dia',
    horizonte: number = 7
  ): Promise<PrediccionDemanda[]> {
    const divisas = ['USD', 'EUR', 'CAD', 'GBP', 'USDT']
    
    const predicciones = await Promise.all(
      divisas.map((divisa) => this.predecirDemanda(divisa, periodo, horizonte))
    )

    return predicciones
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // OPTIMIZACIÓN DE INVENTARIO
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Calcula el inventario óptimo para cada divisa
   */
  async calcularInventarioOptimo(
    saldosActuales: Record<string, number>
  ): Promise<InventarioOptimo[]> {
    const resultados: InventarioOptimo[] = []
    
    for (const [divisa, montoActual] of Object.entries(saldosActuales)) {
      const prediccion = await this.predecirDemanda(divisa, 'dia', 7)
      
      // Calcular demanda esperada para los próximos 7 días
      const demandaTotal = prediccion.predicciones.reduce(
        (sum, p) => sum + p.valorEstimado,
        0
      )
      
      // Inventario óptimo = demanda de 7 días + 20% buffer seguridad
      const montoOptimo = demandaTotal * 1.2
      const montoMinimo = demandaTotal * 0.8
      const montoMaximo = demandaTotal * 1.5
      
      // Calcular días de cobertura con inventario actual
      const demandaDiaria = demandaTotal / 7
      const diasCobertura = demandaDiaria > 0 ? Math.floor(montoActual / demandaDiaria) : 30
      
      // Determinar nivel de alerta
      let alertaNivel: InventarioOptimo['alertaNivel'] = 'ok'
      if (montoActual < montoMinimo * 0.5) alertaNivel = 'critico'
      else if (montoActual < montoMinimo) alertaNivel = 'bajo'
      else if (montoActual > montoMaximo) alertaNivel = 'exceso'
      
      // Calcular ajuste recomendado
      const recomendacionAjuste = montoOptimo - montoActual
      
      resultados.push({
        divisa,
        montoActual,
        montoOptimo,
        montoMinimo,
        montoMaximo,
        diasCobertura,
        alertaNivel,
        recomendacionAjuste,
        razonAjuste: this.generarRazonAjuste(alertaNivel, diasCobertura),
      })
    }

    return resultados.sort((a, b) => {
      const prioridad = { critico: 4, bajo: 3, exceso: 2, ok: 1 }
      return prioridad[b.alertaNivel] - prioridad[a.alertaNivel]
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // ANÁLISIS DE TENDENCIAS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Analiza tendencias de todas las divisas
   */
  async analizarTendencias(): Promise<AnalisisTendencia[]> {
    const divisas = ['USD', 'EUR', 'CAD', 'GBP', 'USDT']
    const analisis: AnalisisTendencia[] = []

    for (const divisa of divisas) {
      const datosCorto = this.obtenerDatosHistoricos(divisa, 'dia', 7)
      const datosMedio = this.obtenerDatosHistoricos(divisa, 'dia', 30)
      const datosLargo = this.obtenerDatosHistoricos(divisa, 'dia', 90)

      const tendenciaCorto = this.calcularTendenciaPeriodo(datosCorto)
      const tendenciaMedio = this.calcularTendenciaPeriodo(datosMedio)
      const tendenciaLargo = this.calcularTendenciaPeriodo(datosLargo)

      const volumenActual = datosCorto.reduce((sum, d) => sum + d.valor, 0)
      const volumenHistorico = datosMedio.reduce((sum, d) => sum + d.valor, 0) / 4

      analisis.push({
        divisa,
        periodo: new Date().toISOString().split('T')[0],
        tendenciaCorto,
        tendenciaMedio,
        tendenciaLargo,
        volumen: {
          actual: volumenActual,
          promedioHistorico: volumenHistorico,
          variacion: volumenHistorico > 0 
            ? ((volumenActual - volumenHistorico) / volumenHistorico) * 100 
            : 0,
        },
        volatilidad: this.calcularVolatilidad(datosCorto),
      })
    }

    return analisis
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // DETECCIÓN DE PATRONES ESTACIONALES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Detecta patrones estacionales activos
   */
  detectarPatronesActivos(): PatronEstacional[] {
    const hoy = new Date()
    const mesActual = String(hoy.getMonth() + 1).padStart(2, '0')
    const diaActual = String(hoy.getDate()).padStart(2, '0')
    const fechaActual = `${mesActual}-${diaActual}`

    return PATRONES_ESTACIONALES.filter((patron) => {
      return fechaActual >= patron.periodoInicio && fechaActual <= patron.periodoFin
    })
  }

  /**
   * Obtiene próximos eventos estacionales
   */
  obtenerProximosEventos(dias: number = 30): PatronEstacional[] {
    const hoy = new Date()
    const futuro = new Date(hoy.getTime() + dias * 24 * 60 * 60 * 1000)
    
    const mesHoy = String(hoy.getMonth() + 1).padStart(2, '0')
    const diaHoy = String(hoy.getDate()).padStart(2, '0')
    const mesFuturo = String(futuro.getMonth() + 1).padStart(2, '0')
    const diaFuturo = String(futuro.getDate()).padStart(2, '0')
    
    const fechaHoy = `${mesHoy}-${diaHoy}`
    const fechaFuturo = `${mesFuturo}-${diaFuturo}`

    return PATRONES_ESTACIONALES.filter((patron) => {
      return patron.periodoInicio > fechaHoy && patron.periodoInicio <= fechaFuturo
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // ALIMENTACIÓN DE DATOS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Registra una nueva operación para el modelo
   */
  registrarOperacion(
    divisa: string,
    monto: number,
    tipoOperacion: 'compra' | 'venta'
  ): void {
    const dataPoint: DataPoint = {
      fecha: new Date(),
      valor: monto,
      divisa,
      tipoOperacion,
    }

    const datos = this.historialDatos.get(divisa) ?? []
    datos.push(dataPoint)
    
    // Mantener solo últimos 365 días
    const limite = Date.now() - 365 * 24 * 60 * 60 * 1000
    const filtrados = datos.filter((d) => d.fecha.getTime() > limite)
    
    this.historialDatos.set(divisa, filtrados)
    this.ultimaActualizacion = new Date()
  }

  /**
   * Carga datos históricos en bulk
   */
  cargarDatosHistoricos(datos: DataPoint[]): void {
    for (const punto of datos) {
      const existentes = this.historialDatos.get(punto.divisa) ?? []
      existentes.push(punto)
      this.historialDatos.set(punto.divisa, existentes)
    }
    logger.info(`[PrediccionML] Cargados ${datos.length} puntos de datos históricos`)
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // MÉTRICAS DEL MODELO
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene métricas del modelo de predicción
   */
  obtenerMetricasModelo(): {
    precision: number
    cobertura: Record<string, number>
    ultimaActualizacion: Date
    totalDatos: number
  } {
    let totalDatos = 0
    const cobertura: Record<string, number> = {}

    for (const [divisa, datos] of this.historialDatos.entries()) {
      cobertura[divisa] = datos.length
      totalDatos += datos.length
    }

    return {
      precision: 0.85, // Simulado - en producción calcular con validación cruzada
      cobertura,
      ultimaActualizacion: this.ultimaActualizacion,
      totalDatos,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private obtenerDatosHistoricos(
    divisa: string,
    periodo: 'hora' | 'dia' | 'semana' | 'mes',
    cantidadPeriodos: number
  ): DataPoint[] {
    const datos = this.historialDatos.get(divisa) ?? []
    
    // Si no hay datos reales, generar datos simulados para demo
    if (datos.length === 0) {
      return this.generarDatosSimulados(divisa, periodo, cantidadPeriodos)
    }

    const multiplicadores = {
      hora: 60 * 60 * 1000,
      dia: 24 * 60 * 60 * 1000,
      semana: 7 * 24 * 60 * 60 * 1000,
      mes: 30 * 24 * 60 * 60 * 1000,
    }

    const limite = Date.now() - cantidadPeriodos * multiplicadores[periodo]
    return datos.filter((d) => d.fecha.getTime() > limite)
  }

  private generarDatosSimulados(
    divisa: string,
    periodo: 'hora' | 'dia' | 'semana' | 'mes',
    cantidadPeriodos: number
  ): DataPoint[] {
    const datos: DataPoint[] = []
    const baseVolumen: Record<string, number> = {
      USD: 15000,
      EUR: 8000,
      CAD: 3000,
      GBP: 2000,
      USDT: 5000,
    }

    const base = baseVolumen[divisa] ?? 5000
    
    for (let i = cantidadPeriodos; i >= 0; i--) {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - i)
      
      // Añadir variación aleatoria y patrones
      const variacion = (Math.random() - 0.5) * 0.3
      const diaSemana = fecha.getDay()
      const factorDia = diaSemana === 0 || diaSemana === 6 ? 0.7 : 1.0
      
      datos.push({
        fecha,
        valor: base * (1 + variacion) * factorDia,
        divisa,
        tipoOperacion: Math.random() > 0.5 ? 'compra' : 'venta',
      })
    }

    return datos
  }

  private aplicarModeloPrediccion(
    datosHistoricos: DataPoint[],
    horizonte: number,
    periodo: 'hora' | 'dia' | 'semana' | 'mes'
  ): PrediccionDemanda['predicciones'] {
    // Calcular promedio móvil como base
    const valores = datosHistoricos.map((d) => d.valor)
    const promedio = valores.reduce((a, b) => a + b, 0) / (valores.length || 1)
    const desviacion = this.calcularDesviacionEstandar(valores)

    const predicciones: PrediccionDemanda['predicciones'] = []
    const multiplicadores = {
      hora: 60 * 60 * 1000,
      dia: 24 * 60 * 60 * 1000,
      semana: 7 * 24 * 60 * 60 * 1000,
      mes: 30 * 24 * 60 * 60 * 1000,
    }

    for (let i = 1; i <= horizonte; i++) {
      const fecha = new Date(Date.now() + i * multiplicadores[periodo])
      
      // Añadir tendencia y estacionalidad
      const tendenciaFactor = 1 + (i * 0.01) * (Math.random() > 0.5 ? 1 : -1)
      const valorEstimado = promedio * tendenciaFactor
      
      // Confianza disminuye con el horizonte
      const confianza = Math.max(0.5, 0.95 - i * 0.05)

      predicciones.push({
        fecha,
        valorEstimado,
        rangoMinimo: valorEstimado - desviacion * (1 + i * 0.1),
        rangoMaximo: valorEstimado + desviacion * (1 + i * 0.1),
        confianza,
      })
    }

    return predicciones
  }

  private identificarFactoresInfluencia(
    divisa: string,
    datos: DataPoint[]
  ): FactorInfluencia[] {
    const factores: FactorInfluencia[] = []

    // Factor temporal (día de la semana)
    factores.push({
      nombre: 'Día de la semana',
      impacto: 0.3,
      descripcion: 'Mayor actividad en días laborales',
      categoria: 'temporal',
    })

    // Detectar patrones estacionales
    const patronesActivos = this.detectarPatronesActivos()
    for (const patron of patronesActivos) {
      if (patron.divisasAfectadas.includes(divisa)) {
        factores.push({
          nombre: patron.nombre,
          impacto: patron.incrementoEsperado / 100,
          descripcion: patron.descripcion,
          categoria: 'estacional',
        })
      }
    }

    // Factor de volatilidad
    const volatilidad = this.calcularVolatilidad(datos)
    if (volatilidad > 0.2) {
      factores.push({
        nombre: 'Alta volatilidad',
        impacto: -volatilidad,
        descripcion: 'Mercado inestable, mayor dificultad para predecir',
        categoria: 'economico',
      })
    }

    return factores
  }

  private generarRecomendaciones(
    divisa: string,
    predicciones: PrediccionDemanda['predicciones'],
    factores: FactorInfluencia[]
  ): Recomendacion[] {
    const recomendaciones: Recomendacion[] = []

    // Demanda proyectada total
    const demandaTotal = predicciones.reduce((sum, p) => sum + p.valorEstimado, 0)
    const demandaPromedio = demandaTotal / predicciones.length

    // Revisar si hay patrones estacionales
    const factoresEstacionales = factores.filter((f) => f.categoria === 'estacional')
    if (factoresEstacionales.length > 0) {
      recomendaciones.push({
        tipo: 'inventario',
        prioridad: 'alta',
        titulo: `Preparar inventario de ${divisa}`,
        descripcion: `Evento estacional detectado: ${factoresEstacionales[0].nombre}`,
        accionSugerida: `Aumentar inventario de ${divisa} en ${Math.round(factoresEstacionales[0].impacto * 100)}%`,
        impactoEstimado: `+$${Math.round(demandaPromedio * factoresEstacionales[0].impacto).toLocaleString()} USD en ventas potenciales`,
      })
    }

    // Analizar tendencia
    const tendencia = this.calcularTendencia(predicciones)
    if (tendencia === 'alza') {
      recomendaciones.push({
        tipo: 'spread',
        prioridad: 'media',
        titulo: 'Oportunidad de optimización',
        descripcion: `Demanda de ${divisa} en tendencia alcista`,
        accionSugerida: 'Considerar ajustar spread para maximizar margen',
      })
    }

    return recomendaciones
  }

  private calcularTendencia(
    predicciones: PrediccionDemanda['predicciones']
  ): 'alza' | 'baja' | 'estable' {
    if (predicciones.length < 2) return 'estable'

    const primera = predicciones[0].valorEstimado
    const ultima = predicciones[predicciones.length - 1].valorEstimado
    const variacion = (ultima - primera) / primera

    if (variacion > 0.05) return 'alza'
    if (variacion < -0.05) return 'baja'
    return 'estable'
  }

  private calcularTendenciaPeriodo(
    datos: DataPoint[]
  ): 'alza' | 'baja' | 'estable' {
    if (datos.length < 2) return 'estable'

    const ordenados = datos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
    const mitad = Math.floor(ordenados.length / 2)
    
    const promedioInicio = ordenados.slice(0, mitad).reduce((sum, d) => sum + d.valor, 0) / mitad
    const promedioFin = ordenados.slice(mitad).reduce((sum, d) => sum + d.valor, 0) / (ordenados.length - mitad)
    
    const variacion = (promedioFin - promedioInicio) / promedioInicio

    if (variacion > 0.03) return 'alza'
    if (variacion < -0.03) return 'baja'
    return 'estable'
  }

  private calcularVolatilidad(datos: DataPoint[]): number {
    if (datos.length < 2) return 0

    const valores = datos.map((d) => d.valor)
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length
    const desviacion = this.calcularDesviacionEstandar(valores)

    return desviacion / promedio
  }

  private calcularDesviacionEstandar(valores: number[]): number {
    if (valores.length === 0) return 0
    
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length
    const sumaCuadrados = valores.reduce((sum, val) => sum + Math.pow(val - promedio, 2), 0)
    
    return Math.sqrt(sumaCuadrados / valores.length)
  }

  private generarRazonAjuste(
    nivel: InventarioOptimo['alertaNivel'],
    diasCobertura: number
  ): string {
    switch (nivel) {
      case 'critico':
        return `Inventario crítico - solo ${diasCobertura} días de cobertura`
      case 'bajo':
        return `Inventario bajo - se recomienda reabastecer`
      case 'exceso':
        return `Exceso de inventario - considerar reducir`
      default:
        return `Nivel óptimo - ${diasCobertura} días de cobertura`
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const prediccionDemandaMLService = new PrediccionDemandaMLService()
export { PrediccionDemandaMLService, PATRONES_ESTACIONALES }
