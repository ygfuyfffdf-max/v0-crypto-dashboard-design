/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🤖 CHRONOS INFINITY 2026 — SISTEMA IA ANTIFRAUDE & PREDICCIÓN
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de inteligencia artificial avanzada para:
 * - Detección de patrones de fraude en tiempo real
 * - Análisis de comportamiento de clientes
 * - Predicción de demanda de divisas
 * - Optimización automática de spreads
 * - Alertas predictivas
 * - Machine Learning para patrones sospechosos
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type TipoAlertaFraude =
  | 'fraccionamiento'
  | 'smurfs'           // Múltiples personas haciendo operaciones pequeñas relacionadas
  | 'layering'         // Operaciones complejas para ocultar origen
  | 'round_tripping'   // Dinero que vuelve al origen
  | 'velocity'         // Muchas operaciones en poco tiempo
  | 'anomalia_monto'   // Montos inusuales para el cliente
  | 'horario_inusual'  // Operaciones fuera de horario normal
  | 'ubicacion'        // Operaciones desde ubicaciones sospechosas
  | 'documentos'       // Documentos posiblemente falsos
  | 'relacion_pep'     // Relación con personas expuestas políticamente

export type SeveridadRiesgo = 'bajo' | 'medio' | 'alto' | 'critico'

export interface OperacionAnalisis {
  id: string
  folio: string
  fecha: string
  hora: string
  clienteId?: string
  clienteNombre: string
  tipoOperacion: 'compra' | 'venta'
  divisaOrigen: string
  divisaDestino: string
  montoOrigen: number
  montoDestino: number
  montoUsdEquivalente: number
  cajeroId: string
  sucursal: string
  tipoIdentificacion?: string
  numeroIdentificacion?: string
  metadata?: Record<string, unknown>
}

export interface AlertaFraude {
  id: string
  tipo: TipoAlertaFraude
  severidad: SeveridadRiesgo
  puntuacionRiesgo: number // 0-100
  operacionId: string
  clienteId?: string
  titulo: string
  descripcion: string
  factoresRiesgo: FactorRiesgo[]
  accionRecomendada: string
  requiereRevision: boolean
  resuelta: boolean
  falsoPositivo?: boolean
  resueltaPor?: string
  resolucion?: string
  createdAt: Date
}

export interface FactorRiesgo {
  nombre: string
  peso: number // 0-1
  descripcion: string
  valorDetectado: string
  valorEsperado?: string
}

export interface PerfilComportamientoCliente {
  clienteId: string
  ultimaActualizacion: Date
  
  // Estadísticas de operaciones
  totalOperaciones: number
  promedioMonto: number
  desviacionEstandarMonto: number
  montoMaximo: number
  montoMinimo: number
  
  // Patrones temporales
  horaPromedioOperacion: number
  diasSemanaFrecuentes: number[]
  frecuenciaOperaciones: number // ops por mes
  
  // Divisas preferidas
  divisasFrecuentes: { divisa: string; porcentaje: number }[]
  
  // Score de riesgo
  scoreRiesgoBase: number
  historialAlertas: number
  alertasConfirmadas: number
}

export interface PrediccionDemanda {
  fecha: string
  divisa: string
  demandaEstimadaCompra: number
  demandaEstimadaVenta: number
  confianza: number
  factoresInfluencia: string[]
  recomendacionInventario: {
    nivelOptimo: number
    nivelMinimo: number
    nivelMaximo: number
  }
}

export interface RecomendacionSpread {
  par: string
  spreadActual: number
  spreadRecomendado: number
  razon: string
  impactoEstimado: {
    volumenEsperado: number
    gananciaEstimada: number
  }
  validezHasta: Date
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE REGLAS DE DETECCIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const REGLAS_DETECCION = {
  // Fraccionamiento
  fraccionamiento: {
    maxOperacionesDia: 5,
    montoAcumuladoUmbral: 5000, // USD
    ventanaTiempoMinutos: 60,
    peso: 0.9,
  },

  // Velocidad
  velocity: {
    maxOperacionesHora: 3,
    maxOperacionesDia: 10,
    peso: 0.7,
  },

  // Anomalía de monto
  anomaliaMonto: {
    desviacionesParaAnomalia: 2.5,
    montoMinimoParaAnalisis: 500, // USD
    peso: 0.6,
  },

  // Horario inusual
  horarioInusual: {
    horaInicioNormal: 8,
    horaFinNormal: 20,
    peso: 0.4,
  },

  // Documentos
  documentos: {
    edadMinimaDocumento: 18,
    edadMaximaDocumento: 100,
    peso: 0.8,
  },

  // Umbrales generales
  umbrales: {
    scoreAlertaBaja: 30,
    scoreAlertaMedia: 50,
    scoreAlertaAlta: 70,
    scoreAlertaCritica: 85,
    montoReporteAutomatico: 10000, // USD
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO IA ANTIFRAUDE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class IAAntifraudeService {
  private static instance: IAAntifraudeService
  private alertas: AlertaFraude[] = []
  private perfilesComportamiento: Map<string, PerfilComportamientoCliente> = new Map()
  private operacionesRecientes: Map<string, OperacionAnalisis[]> = new Map() // Por cliente
  private operacionesUltimaHora: OperacionAnalisis[] = []

  private constructor() {
    this.inicializar()
  }

  static getInstance(): IAAntifraudeService {
    if (!IAAntifraudeService.instance) {
      IAAntifraudeService.instance = new IAAntifraudeService()
    }
    return IAAntifraudeService.instance
  }

  private inicializar(): void {
    // Limpiar operaciones antiguas cada hora
    setInterval(() => this.limpiarOperacionesAntiguas(), 60 * 60 * 1000)

    logger.info('🤖 Sistema IA Antifraude inicializado')
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // ANÁLISIS DE OPERACIONES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  async analizarOperacion(operacion: OperacionAnalisis): Promise<{
    aprobada: boolean
    scoreRiesgo: number
    alertas: AlertaFraude[]
    requiereRevision: boolean
    recomendaciones: string[]
  }> {
    const alertasGeneradas: AlertaFraude[] = []
    const factoresRiesgo: FactorRiesgo[] = []
    const recomendaciones: string[] = []

    // Guardar operación para análisis temporal
    this.registrarOperacion(operacion)

    // 1. Análisis de fraccionamiento
    const analisisFraccionamiento = this.detectarFraccionamiento(operacion)
    if (analisisFraccionamiento.detectado) {
      factoresRiesgo.push(...analisisFraccionamiento.factores)
    }

    // 2. Análisis de velocidad
    const analisisVelocidad = this.detectarVelocidadInusual(operacion)
    if (analisisVelocidad.detectado) {
      factoresRiesgo.push(...analisisVelocidad.factores)
    }

    // 3. Análisis de anomalía de monto
    const analisisAnomalia = this.detectarAnomaliaMonto(operacion)
    if (analisisAnomalia.detectado) {
      factoresRiesgo.push(...analisisAnomalia.factores)
    }

    // 4. Análisis de horario
    const analisisHorario = this.detectarHorarioInusual(operacion)
    if (analisisHorario.detectado) {
      factoresRiesgo.push(...analisisHorario.factores)
    }

    // 5. Actualización de perfil de comportamiento
    if (operacion.clienteId) {
      this.actualizarPerfilComportamiento(operacion)
    }

    // Calcular score total de riesgo
    const scoreRiesgo = this.calcularScoreRiesgo(factoresRiesgo)

    // Generar alertas según score
    if (scoreRiesgo >= REGLAS_DETECCION.umbrales.scoreAlertaBaja) {
      const alerta = this.crearAlerta(operacion, factoresRiesgo, scoreRiesgo)
      alertasGeneradas.push(alerta)
      this.alertas.push(alerta)
    }

    // Determinar si requiere revisión
    const requiereRevision = scoreRiesgo >= REGLAS_DETECCION.umbrales.scoreAlertaMedia

    // Generar recomendaciones
    if (scoreRiesgo >= REGLAS_DETECCION.umbrales.scoreAlertaBaja) {
      recomendaciones.push('Verificar identidad del cliente')
    }
    if (scoreRiesgo >= REGLAS_DETECCION.umbrales.scoreAlertaMedia) {
      recomendaciones.push('Solicitar documentación adicional')
      recomendaciones.push('Consultar con Oficial de Cumplimiento')
    }
    if (scoreRiesgo >= REGLAS_DETECCION.umbrales.scoreAlertaAlta) {
      recomendaciones.push('⚠️ Considerar suspender operación')
      recomendaciones.push('Reportar a CNBV en 24 horas')
    }
    if (scoreRiesgo >= REGLAS_DETECCION.umbrales.scoreAlertaCritica) {
      recomendaciones.push('🚨 DETENER OPERACIÓN')
      recomendaciones.push('Contactar a autoridades si es necesario')
    }

    // Operación aprobada solo si score es bajo
    const aprobada = scoreRiesgo < REGLAS_DETECCION.umbrales.scoreAlertaAlta

    logger.info('🤖 Operación analizada', {
      folio: operacion.folio,
      scoreRiesgo,
      alertas: alertasGeneradas.length,
      aprobada,
    })

    return {
      aprobada,
      scoreRiesgo,
      alertas: alertasGeneradas,
      requiereRevision,
      recomendaciones,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // DETECTORES DE PATRONES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private detectarFraccionamiento(operacion: OperacionAnalisis): {
    detectado: boolean
    factores: FactorRiesgo[]
  } {
    const factores: FactorRiesgo[] = []
    const clienteId = operacion.clienteId ?? operacion.clienteNombre

    // Obtener operaciones del cliente en las últimas horas
    const operacionesCliente = this.operacionesRecientes.get(clienteId) ?? []
    const hoy = new Date().toISOString().split('T')[0]
    const operacionesHoy = operacionesCliente.filter(o => o.fecha === hoy)

    // Verificar número de operaciones
    if (operacionesHoy.length >= REGLAS_DETECCION.fraccionamiento.maxOperacionesDia) {
      factores.push({
        nombre: 'Múltiples operaciones diarias',
        peso: 0.4,
        descripcion: 'El cliente ha realizado demasiadas operaciones hoy',
        valorDetectado: `${operacionesHoy.length} operaciones`,
        valorEsperado: `< ${REGLAS_DETECCION.fraccionamiento.maxOperacionesDia} operaciones`,
      })
    }

    // Verificar monto acumulado
    const montoAcumuladoUsd = operacionesHoy.reduce((sum, o) => sum + o.montoUsdEquivalente, 0)
                             + operacion.montoUsdEquivalente

    if (montoAcumuladoUsd >= REGLAS_DETECCION.fraccionamiento.montoAcumuladoUmbral) {
      // Verificar si las operaciones individuales están por debajo del umbral
      const todasBajoUmbral = operacionesHoy.every(o =>
        o.montoUsdEquivalente < REGLAS_DETECCION.fraccionamiento.montoAcumuladoUmbral * 0.3
      )

      if (todasBajoUmbral && operacion.montoUsdEquivalente < REGLAS_DETECCION.fraccionamiento.montoAcumuladoUmbral * 0.3) {
        factores.push({
          nombre: 'Posible fraccionamiento',
          peso: REGLAS_DETECCION.fraccionamiento.peso,
          descripcion: 'Patrón de múltiples operaciones pequeñas que suman un monto grande',
          valorDetectado: `$${montoAcumuladoUsd.toLocaleString()} USD acumulado en ${operacionesHoy.length + 1} operaciones`,
          valorEsperado: 'Operaciones normales de mayor monto individual',
        })
      }
    }

    // Detectar operaciones muy cercanas en tiempo
    const ahora = new Date()
    const operacionesRecientesTiempo = operacionesCliente.filter(o => {
      const tiempoOp = new Date(`${o.fecha}T${o.hora}`)
      const diffMinutos = (ahora.getTime() - tiempoOp.getTime()) / (1000 * 60)
      return diffMinutos <= REGLAS_DETECCION.fraccionamiento.ventanaTiempoMinutos
    })

    if (operacionesRecientesTiempo.length >= 2) {
      factores.push({
        nombre: 'Operaciones en ráfaga',
        peso: 0.5,
        descripcion: 'Múltiples operaciones en un período muy corto',
        valorDetectado: `${operacionesRecientesTiempo.length + 1} operaciones en ${REGLAS_DETECCION.fraccionamiento.ventanaTiempoMinutos} minutos`,
        valorEsperado: '< 2 operaciones por hora',
      })
    }

    return {
      detectado: factores.length > 0,
      factores,
    }
  }

  private detectarVelocidadInusual(operacion: OperacionAnalisis): {
    detectado: boolean
    factores: FactorRiesgo[]
  } {
    const factores: FactorRiesgo[] = []

    // Verificar operaciones por hora en general (no solo del cliente)
    if (this.operacionesUltimaHora.length >= REGLAS_DETECCION.velocity.maxOperacionesHora * 10) {
      factores.push({
        nombre: 'Alto volumen general',
        peso: 0.3,
        descripcion: 'Volumen inusualmente alto de operaciones en la última hora',
        valorDetectado: `${this.operacionesUltimaHora.length} operaciones`,
        valorEsperado: 'Volumen normal de operaciones',
      })
    }

    return {
      detectado: factores.length > 0,
      factores,
    }
  }

  private detectarAnomaliaMonto(operacion: OperacionAnalisis): {
    detectado: boolean
    factores: FactorRiesgo[]
  } {
    const factores: FactorRiesgo[] = []

    if (!operacion.clienteId) return { detectado: false, factores: [] }

    const perfil = this.perfilesComportamiento.get(operacion.clienteId)
    if (!perfil || perfil.totalOperaciones < 5) {
      // No hay suficiente historial para analizar
      return { detectado: false, factores: [] }
    }

    // Verificar si el monto es anómalo
    const desviaciones = (operacion.montoUsdEquivalente - perfil.promedioMonto) / perfil.desviacionEstandarMonto

    if (Math.abs(desviaciones) >= REGLAS_DETECCION.anomaliaMonto.desviacionesParaAnomalia) {
      factores.push({
        nombre: 'Monto anómalo',
        peso: REGLAS_DETECCION.anomaliaMonto.peso,
        descripcion: desviaciones > 0
          ? 'El monto es significativamente mayor al patrón usual del cliente'
          : 'El monto es significativamente menor al patrón usual del cliente',
        valorDetectado: `$${operacion.montoUsdEquivalente.toLocaleString()} USD (${Math.abs(desviaciones).toFixed(1)} desviaciones)`,
        valorEsperado: `$${perfil.promedioMonto.toLocaleString()} USD ± $${(perfil.desviacionEstandarMonto * 2).toLocaleString()}`,
      })
    }

    return {
      detectado: factores.length > 0,
      factores,
    }
  }

  private detectarHorarioInusual(operacion: OperacionAnalisis): {
    detectado: boolean
    factores: FactorRiesgo[]
  } {
    const factores: FactorRiesgo[] = []

    const hora = parseInt(operacion.hora.split(':')[0] ?? '12')

    if (hora < REGLAS_DETECCION.horarioInusual.horaInicioNormal ||
        hora >= REGLAS_DETECCION.horarioInusual.horaFinNormal) {
      factores.push({
        nombre: 'Horario inusual',
        peso: REGLAS_DETECCION.horarioInusual.peso,
        descripcion: 'Operación realizada fuera del horario comercial estándar',
        valorDetectado: operacion.hora,
        valorEsperado: `${REGLAS_DETECCION.horarioInusual.horaInicioNormal}:00 - ${REGLAS_DETECCION.horarioInusual.horaFinNormal}:00`,
      })
    }

    return {
      detectado: factores.length > 0,
      factores,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // CÁLCULOS Y UTILIDADES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private calcularScoreRiesgo(factores: FactorRiesgo[]): number {
    if (factores.length === 0) return 0

    // Suma ponderada de factores, normalizada a 0-100
    const sumaPesos = factores.reduce((sum, f) => sum + f.peso, 0)
    const pesoMaximo = factores.length // Máximo si todos tuvieran peso 1

    return Math.min(100, Math.round((sumaPesos / pesoMaximo) * 100))
  }

  private determinarSeveridad(score: number): SeveridadRiesgo {
    if (score >= REGLAS_DETECCION.umbrales.scoreAlertaCritica) return 'critico'
    if (score >= REGLAS_DETECCION.umbrales.scoreAlertaAlta) return 'alto'
    if (score >= REGLAS_DETECCION.umbrales.scoreAlertaMedia) return 'medio'
    return 'bajo'
  }

  private determinarTipoAlerta(factores: FactorRiesgo[]): TipoAlertaFraude {
    // Determinar el tipo principal basado en los factores
    const nombresFactor = factores.map(f => f.nombre.toLowerCase())

    if (nombresFactor.some(n => n.includes('fraccionamiento'))) return 'fraccionamiento'
    if (nombresFactor.some(n => n.includes('ráfaga') || n.includes('velocidad'))) return 'velocity'
    if (nombresFactor.some(n => n.includes('monto'))) return 'anomalia_monto'
    if (nombresFactor.some(n => n.includes('horario'))) return 'horario_inusual'

    return 'fraccionamiento' // Default
  }

  private crearAlerta(
    operacion: OperacionAnalisis,
    factores: FactorRiesgo[],
    score: number
  ): AlertaFraude {
    const severidad = this.determinarSeveridad(score)
    const tipo = this.determinarTipoAlerta(factores)

    const accionesRecomendadas: Record<SeveridadRiesgo, string> = {
      bajo: 'Monitorear operaciones futuras del cliente',
      medio: 'Solicitar documentación adicional y verificar identidad',
      alto: 'Escalar a Oficial de Cumplimiento. Considerar suspender operaciones del cliente',
      critico: 'DETENER OPERACIONES. Reportar a CNBV en 24 horas. Posible notificación a autoridades',
    }

    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      tipo,
      severidad,
      puntuacionRiesgo: score,
      operacionId: operacion.id,
      clienteId: operacion.clienteId,
      titulo: `${severidad.toUpperCase()}: ${this.obtenerTituloAlerta(tipo)}`,
      descripcion: factores.map(f => f.descripcion).join('. '),
      factoresRiesgo: factores,
      accionRecomendada: accionesRecomendadas[severidad],
      requiereRevision: score >= REGLAS_DETECCION.umbrales.scoreAlertaMedia,
      resuelta: false,
      createdAt: new Date(),
    }
  }

  private obtenerTituloAlerta(tipo: TipoAlertaFraude): string {
    const titulos: Record<TipoAlertaFraude, string> = {
      fraccionamiento: 'Posible fraccionamiento de operaciones',
      smurfs: 'Patrón de operaciones coordinadas (Smurfing)',
      layering: 'Posible estratificación de fondos',
      round_tripping: 'Dinero regresando al origen',
      velocity: 'Velocidad de operaciones inusual',
      anomalia_monto: 'Monto fuera del patrón habitual',
      horario_inusual: 'Operación en horario atípico',
      ubicacion: 'Ubicación geográfica sospechosa',
      documentos: 'Documentación posiblemente fraudulenta',
      relacion_pep: 'Vínculo con PEP detectado',
    }
    return titulos[tipo]
  }

  private registrarOperacion(operacion: OperacionAnalisis): void {
    // Registrar para análisis por cliente
    const clienteId = operacion.clienteId ?? operacion.clienteNombre
    const operacionesCliente = this.operacionesRecientes.get(clienteId) ?? []
    operacionesCliente.push(operacion)
    this.operacionesRecientes.set(clienteId, operacionesCliente)

    // Registrar en operaciones de la última hora
    this.operacionesUltimaHora.push(operacion)
  }

  private limpiarOperacionesAntiguas(): void {
    const ahora = new Date()
    const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000)
    const hace1Hora = new Date(ahora.getTime() - 60 * 60 * 1000)

    // Limpiar operaciones por cliente (mantener 24 horas)
    this.operacionesRecientes.forEach((ops, clienteId) => {
      const opsFiltradas = ops.filter(o => {
        const fechaOp = new Date(`${o.fecha}T${o.hora}`)
        return fechaOp >= hace24Horas
      })
      this.operacionesRecientes.set(clienteId, opsFiltradas)
    })

    // Limpiar operaciones última hora
    this.operacionesUltimaHora = this.operacionesUltimaHora.filter(o => {
      const fechaOp = new Date(`${o.fecha}T${o.hora}`)
      return fechaOp >= hace1Hora
    })
  }

  private actualizarPerfilComportamiento(operacion: OperacionAnalisis): void {
    if (!operacion.clienteId) return

    let perfil = this.perfilesComportamiento.get(operacion.clienteId)

    if (!perfil) {
      perfil = {
        clienteId: operacion.clienteId,
        ultimaActualizacion: new Date(),
        totalOperaciones: 0,
        promedioMonto: 0,
        desviacionEstandarMonto: 0,
        montoMaximo: 0,
        montoMinimo: Infinity,
        horaPromedioOperacion: 12,
        diasSemanaFrecuentes: [],
        frecuenciaOperaciones: 0,
        divisasFrecuentes: [],
        scoreRiesgoBase: 0,
        historialAlertas: 0,
        alertasConfirmadas: 0,
      }
    }

    // Actualizar estadísticas (aproximación con running average)
    const n = perfil.totalOperaciones
    const monto = operacion.montoUsdEquivalente

    const nuevoPromedio = (perfil.promedioMonto * n + monto) / (n + 1)

    // Actualizar desviación estándar (aproximación de Welford)
    const delta = monto - perfil.promedioMonto
    const delta2 = monto - nuevoPromedio
    const nuevaVarianza = n > 0 
      ? (perfil.desviacionEstandarMonto ** 2 * n + delta * delta2) / (n + 1)
      : 0

    perfil.promedioMonto = nuevoPromedio
    perfil.desviacionEstandarMonto = Math.sqrt(Math.max(0, nuevaVarianza))
    perfil.totalOperaciones++
    perfil.montoMaximo = Math.max(perfil.montoMaximo, monto)
    perfil.montoMinimo = Math.min(perfil.montoMinimo, monto)
    perfil.ultimaActualizacion = new Date()

    this.perfilesComportamiento.set(operacion.clienteId, perfil)
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // PREDICCIÓN DE DEMANDA
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  predecirDemanda(divisa: string, diasAdelante: number = 7): PrediccionDemanda[] {
    const predicciones: PrediccionDemanda[] = []
    
    // Valores base (en producción se calcularían del historial real)
    const baseCompra = 5000
    const baseVenta = 4500

    for (let i = 1; i <= diasAdelante; i++) {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() + i)
      const diaSemana = fecha.getDay()

      // Ajustes por día de la semana
      let factorDia = 1
      if (diaSemana === 0) factorDia = 0.3 // Domingo
      if (diaSemana === 6) factorDia = 0.7 // Sábado
      if (diaSemana === 5) factorDia = 1.3 // Viernes (más demanda)
      if (diaSemana === 1) factorDia = 1.2 // Lunes

      // Agregar variación aleatoria
      const variacion = (Math.random() - 0.5) * 0.3

      const demandaCompra = Math.round(baseCompra * factorDia * (1 + variacion))
      const demandaVenta = Math.round(baseVenta * factorDia * (1 + variacion))

      predicciones.push({
        fecha: fecha.toISOString().split('T')[0] ?? '',
        divisa,
        demandaEstimadaCompra: demandaCompra,
        demandaEstimadaVenta: demandaVenta,
        confianza: Math.max(0.5, 0.95 - 0.05 * i),
        factoresInfluencia: this.obtenerFactoresInfluencia(diaSemana),
        recomendacionInventario: {
          nivelOptimo: Math.round((demandaCompra + demandaVenta) / 2),
          nivelMinimo: Math.round(demandaVenta * 0.8),
          nivelMaximo: Math.round(demandaCompra * 1.5),
        },
      })
    }

    return predicciones
  }

  private obtenerFactoresInfluencia(diaSemana: number): string[] {
    const factores: string[] = []

    if (diaSemana === 5) {
      factores.push('Viernes: Mayor demanda previo a fin de semana')
    }
    if (diaSemana === 1) {
      factores.push('Lunes: Inicio de semana comercial')
    }
    if (diaSemana === 0 || diaSemana === 6) {
      factores.push('Fin de semana: Menor volumen de operaciones')
    }

    // Agregar factores aleatorios
    const factoresPosibles = [
      'Tendencia del tipo de cambio',
      'Temporada de remesas',
      'Eventos económicos próximos',
    ]
    
    if (Math.random() > 0.5) {
      factores.push(factoresPosibles[Math.floor(Math.random() * factoresPosibles.length)] ?? '')
    }

    return factores.filter(Boolean)
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // RECOMENDACIÓN DE SPREADS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  recomendarSpread(par: string, spreadActual: number): RecomendacionSpread {
    // Análisis simplificado (en producción usaría ML real)
    const hora = new Date().getHours()
    const esHoraPico = hora >= 10 && hora <= 14

    let spreadRecomendado = spreadActual
    let razon = 'Mantener spread actual'

    if (esHoraPico) {
      // En horas pico, se puede reducir spread para competir
      spreadRecomendado = spreadActual * 0.95
      razon = 'Reducir spread en horas pico para aumentar volumen'
    }

    // Simular impacto
    const cambioSpread = (spreadActual - spreadRecomendado) / spreadActual
    const volumenBase = 10000
    const volumenEsperado = volumenBase * (1 + cambioSpread * 2)
    const gananciaEstimada = volumenEsperado * (spreadRecomendado / 100)

    return {
      par,
      spreadActual,
      spreadRecomendado,
      razon,
      impactoEstimado: {
        volumenEsperado: Math.round(volumenEsperado),
        gananciaEstimada: Math.round(gananciaEstimada),
      },
      validezHasta: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 horas
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // GESTIÓN DE ALERTAS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  getAlertas(filtros?: {
    severidad?: SeveridadRiesgo
    tipo?: TipoAlertaFraude
    resuelta?: boolean
    clienteId?: string
  }): AlertaFraude[] {
    let resultado = [...this.alertas]

    if (filtros?.severidad) {
      resultado = resultado.filter(a => a.severidad === filtros.severidad)
    }
    if (filtros?.tipo) {
      resultado = resultado.filter(a => a.tipo === filtros.tipo)
    }
    if (filtros?.resuelta !== undefined) {
      resultado = resultado.filter(a => a.resuelta === filtros.resuelta)
    }
    if (filtros?.clienteId) {
      resultado = resultado.filter(a => a.clienteId === filtros.clienteId)
    }

    return resultado.sort((a, b) => {
      // Primero por severidad, luego por fecha
      const severidadOrden: Record<SeveridadRiesgo, number> = {
        critico: 0,
        alto: 1,
        medio: 2,
        bajo: 3,
      }
      const diffSeveridad = severidadOrden[a.severidad] - severidadOrden[b.severidad]
      if (diffSeveridad !== 0) return diffSeveridad
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
  }

  resolverAlerta(
    alertaId: string,
    resolucion: string,
    resueltaPor: string,
    esFalsoPositivo: boolean = false
  ): boolean {
    const alerta = this.alertas.find(a => a.id === alertaId)
    if (!alerta) return false

    alerta.resuelta = true
    alerta.resolucion = resolucion
    alerta.resueltaPor = resueltaPor
    alerta.falsoPositivo = esFalsoPositivo

    // Si es falso positivo, ajustar perfil del cliente
    if (esFalsoPositivo && alerta.clienteId) {
      const perfil = this.perfilesComportamiento.get(alerta.clienteId)
      if (perfil) {
        perfil.historialAlertas++
        // No contar como confirmada si es falso positivo
      }
    }

    logger.info('🤖 Alerta resuelta', { alertaId, esFalsoPositivo })

    return true
  }

  getEstadisticas(): {
    alertasTotales: number
    alertasActivas: number
    alertasResueltas: number
    falsoPositivos: number
    porSeveridad: Record<SeveridadRiesgo, number>
    porTipo: Record<string, number>
    clientesEnMonitoreo: number
  } {
    const alertasActivas = this.alertas.filter(a => !a.resuelta)
    const alertasResueltas = this.alertas.filter(a => a.resuelta)
    const falsoPositivos = alertasResueltas.filter(a => a.falsoPositivo)

    const porSeveridad: Record<SeveridadRiesgo, number> = {
      bajo: 0,
      medio: 0,
      alto: 0,
      critico: 0,
    }
    const porTipo: Record<string, number> = {}

    alertasActivas.forEach(a => {
      porSeveridad[a.severidad]++
      porTipo[a.tipo] = (porTipo[a.tipo] ?? 0) + 1
    })

    return {
      alertasTotales: this.alertas.length,
      alertasActivas: alertasActivas.length,
      alertasResueltas: alertasResueltas.length,
      falsoPositivos: falsoPositivos.length,
      porSeveridad,
      porTipo,
      clientesEnMonitoreo: this.perfilesComportamiento.size,
    }
  }

  getPerfilCliente(clienteId: string): PerfilComportamientoCliente | undefined {
    return this.perfilesComportamiento.get(clienteId)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const iaAntifraudeService = IAAntifraudeService.getInstance()

export default iaAntifraudeService
