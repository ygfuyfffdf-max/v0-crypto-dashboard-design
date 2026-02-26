// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🏛️ CHRONOS INFINITY 2026 — SISTEMA DE REPORTES CNBV
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de generación de reportes regulatorios para CNBV:
 * - Reporte de Operaciones Relevantes (ROR)
 * - Reporte de Operaciones Inusuales (ROI)
 * - Reporte de Operaciones Internas Preocupantes (ROIP)
 * - Reporte 24 horas
 * - Reportes mensuales y trimestrales
 * - Avisos por operaciones en efectivo > $7,500 USD
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type TipoReporte = 'ROR' | 'ROI' | 'ROIP' | 'R24H' | 'MENSUAL' | 'TRIMESTRAL'

export interface OperacionReportable {
  id: string
  folio: string
  fecha: string
  hora: string
  tipoOperacion: 'compra' | 'venta'

  // Cliente
  clienteNombre: string
  clienteRfc?: string
  clienteCurp?: string
  clienteNacionalidad?: string
  tipoIdentificacion?: string
  numeroIdentificacion?: string

  // Operación
  divisaOrigen: string
  divisaDestino: string
  montoOrigen: number
  montoDestino: number
  montoUsdEquivalente: number

  // Cajero
  cajeroId: string
  cajeroNombre: string
  sucursal: string

  // Clasificación
  esRelevante: boolean
  esInusual: boolean
  esPreocupante: boolean
  motivosAlerta: string[]
}

export interface ReporteCNBV {
  id: string
  tipo: TipoReporte
  folio: string
  periodo: {
    inicio: string
    fin: string
  }
  fechaGeneracion: string
  fechaEnvio?: string

  // Datos del sujeto obligado
  sujetoObligado: {
    razonSocial: string
    rfc: string
    clave: string
    domicilio: string
    telefono: string
    email: string
    representanteLegal: string
  }

  // Contenido
  operaciones: OperacionReportable[]
  resumen: ResumenReporte

  // Estado
  estado: 'borrador' | 'revisado' | 'aprobado' | 'enviado' | 'aceptado' | 'rechazado'
  observaciones?: string
  archivoXml?: string
  archivoXmlFirmado?: string
  acuseRecibo?: string

  // Auditoría
  creadoPor: string
  revisadoPor?: string
  aprobadoPor?: string
  enviadoPor?: string
  createdAt: Date
  updatedAt: Date
}

export interface ResumenReporte {
  totalOperaciones: number
  // Por tipo
  operacionesCompra: number
  operacionesVenta: number
  // Por divisa
  operacionesPorDivisa: Record<string, { cantidad: number; montoTotal: number }>
  // Montos totales
  montoTotalMxn: number
  montoTotalUsdEquiv: number
  // Mayores a umbral
  operacionesMayoresUmbral: number
  // Clientes
  clientesUnicos: number
  clientesFrecuentes: { id: string; nombre: string; operaciones: number }[]
  // Alertas
  operacionesRelevantes: number
  operacionesInusuales: number
  operacionesPreocupantes: number
}

export interface ConfiguracionCNBV {
  umbrales: {
    reporteInmediato: number // USD
    identificacionRequerida: number // USD
    operacionRelevante: number // USD
    operacionGrandeEfectivo: number // USD
    fraccionamientoSospechoso: number // Operaciones por día
    montoFraccionamientoDia: number // USD diario por cliente
  }
  tiempos: {
    reporteRor: number // días para enviar ROR
    reporteRoi: number // días para enviar ROI
    reporteRoip: number // días para enviar ROIP
    reporte24h: number // horas para reporte inmediato
  }
  sujetoObligado: {
    razonSocial: string
    rfc: string
    clave: string
    domicilio: string
    telefono: string
    email: string
    representanteLegal: string
  }
}

export interface AlertaCNBV {
  id: string
  tipo: 'relevante' | 'inusual' | 'preocupante' | 'fraccionamiento' | 'pep' | 'lista_negra'
  severidad: 'baja' | 'media' | 'alta' | 'critica'
  operacionId: string
  clienteId?: string
  mensaje: string
  detalles: string
  requiereAccion: boolean
  accionRequerida?: string
  resuelta: boolean
  resueltaPor?: string
  fechaResolucion?: Date
  createdAt: Date
}

export interface PatronFraccionamiento {
  clienteId: string
  clienteNombre: string
  fecha: string
  operaciones: number
  montoTotal: number
  montoPromedio: number
  umbralSuperado: boolean
  divisasUsadas: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN POR DEFECTO CNBV
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const CONFIGURACION_DEFAULT: ConfiguracionCNBV = {
  umbrales: {
    reporteInmediato: 10000,        // $10,000 USD - Reporte 24h
    identificacionRequerida: 3000,  // $3,000 USD - Requiere ID
    operacionRelevante: 7500,       // $7,500 USD - Operación relevante
    operacionGrandeEfectivo: 10000, // $10,000 USD - Efectivo grande
    fraccionamientoSospechoso: 5,   // 5 operaciones/día = sospechoso
    montoFraccionamientoDia: 5000,  // $5,000 USD total día
  },
  tiempos: {
    reporteRor: 60,  // 60 días para ROR
    reporteRoi: 30,  // 30 días para ROI
    reporteRoip: 15, // 15 días para ROIP
    reporte24h: 24,  // 24 horas para reporte inmediato
  },
  sujetoObligado: {
    razonSocial: 'Casa de Cambio PROFIT S.A. de C.V.',
    rfc: 'CCP901231XX0',
    clave: 'CC-2024-001234',
    domicilio: 'Av. Reforma 222, Col. Juárez, CDMX, 06600',
    telefono: '+52 55 1234 5678',
    email: 'pld@casacambioprofit.mx',
    representanteLegal: 'Juan Carlos Pérez García',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO CNBV REPORTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class CnbvReportesService {
  private static instance: CnbvReportesService
  private configuracion: ConfiguracionCNBV
  private reportes: Map<string, ReporteCNBV> = new Map()
  private alertas: AlertaCNBV[] = []
  private patronesFraccionamiento: Map<string, PatronFraccionamiento[]> = new Map()
  private folioCounter = 1

  private constructor() {
    this.configuracion = CONFIGURACION_DEFAULT
    this.inicializar()
  }

  static getInstance(): CnbvReportesService {
    if (!CnbvReportesService.instance) {
      CnbvReportesService.instance = new CnbvReportesService()
    }
    return CnbvReportesService.instance
  }

  private inicializar(): void {
    logger.info('🏛️ Sistema CNBV Reportes inicializado', {
      umbrales: this.configuracion.umbrales,
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // ANÁLISIS DE OPERACIONES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  analizarOperacion(operacion: OperacionReportable): {
    esRelevante: boolean
    esInusual: boolean
    esPreocupante: boolean
    alertas: AlertaCNBV[]
  } {
    const alertas: AlertaCNBV[] = []
    let esRelevante = false
    let esInusual = false
    let esPreocupante = false

    // Verificar monto relevante
    if (operacion.montoUsdEquivalente >= this.configuracion.umbrales.operacionRelevante) {
      esRelevante = true
      alertas.push(this.crearAlerta({
        tipo: 'relevante',
        severidad: 'media',
        operacionId: operacion.id,
        mensaje: `Operación relevante: $${operacion.montoUsdEquivalente.toLocaleString()} USD`,
        detalles: `Cliente: ${operacion.clienteNombre}. Operación supera umbral de $${this.configuracion.umbrales.operacionRelevante} USD`,
        requiereAccion: false,
      }))
    }

    // Verificar reporte inmediato (24h)
    if (operacion.montoUsdEquivalente >= this.configuracion.umbrales.reporteInmediato) {
      esInusual = true
      alertas.push(this.crearAlerta({
        tipo: 'inusual',
        severidad: 'alta',
        operacionId: operacion.id,
        mensaje: `⚠️ Requiere Reporte 24h: $${operacion.montoUsdEquivalente.toLocaleString()} USD`,
        detalles: `Operación supera $10,000 USD. Se debe reportar a CNBV en las próximas 24 horas.`,
        requiereAccion: true,
        accionRequerida: 'Generar y enviar Reporte 24 horas a CNBV',
      }))
    }

    // Verificar falta de identificación en monto alto
    if (
      operacion.montoUsdEquivalente >= this.configuracion.umbrales.identificacionRequerida &&
      !operacion.numeroIdentificacion
    ) {
      esPreocupante = true
      alertas.push(this.crearAlerta({
        tipo: 'preocupante',
        severidad: 'critica',
        operacionId: operacion.id,
        mensaje: `🚨 Operación sin ID: $${operacion.montoUsdEquivalente.toLocaleString()} USD`,
        detalles: `Operación mayor a $${this.configuracion.umbrales.identificacionRequerida} USD sin identificación oficial`,
        requiereAccion: true,
        accionRequerida: 'Revisar y documentar caso. Posible sanción regulatoria.',
      }))
    }

    // Guardar alertas generadas
    alertas.forEach(a => this.alertas.push(a))

    return { esRelevante, esInusual, esPreocupante, alertas }
  }

  detectarFraccionamiento(
    clienteId: string,
    clienteNombre: string,
    operacionesDelDia: OperacionReportable[]
  ): PatronFraccionamiento | null {
    if (operacionesDelDia.length < this.configuracion.umbrales.fraccionamientoSospechoso) {
      return null
    }

    const montoTotal = operacionesDelDia.reduce((sum, op) => sum + op.montoUsdEquivalente, 0)
    const montoPromedio = montoTotal / operacionesDelDia.length
    const divisasUsadas = [...new Set(operacionesDelDia.flatMap(op => [op.divisaOrigen, op.divisaDestino]))]

    const patron: PatronFraccionamiento = {
      clienteId,
      clienteNombre,
      fecha: new Date().toISOString().split('T')[0] ?? '',
      operaciones: operacionesDelDia.length,
      montoTotal,
      montoPromedio,
      umbralSuperado: montoTotal >= this.configuracion.umbrales.montoFraccionamientoDia,
      divisasUsadas,
    }

    // Verificar si es sospechoso
    const esSospechoso =
      operacionesDelDia.length >= this.configuracion.umbrales.fraccionamientoSospechoso ||
      montoTotal >= this.configuracion.umbrales.montoFraccionamientoDia

    if (esSospechoso) {
      // Generar alerta
      this.alertas.push(this.crearAlerta({
        tipo: 'fraccionamiento',
        severidad: 'alta',
        operacionId: operacionesDelDia[0]?.id ?? '',
        clienteId,
        mensaje: `⚠️ Posible Fraccionamiento: ${clienteNombre}`,
        detalles: `${operacionesDelDia.length} operaciones totalizando $${montoTotal.toLocaleString()} USD en el día`,
        requiereAccion: true,
        accionRequerida: 'Analizar patrón de operaciones y determinar si es intencional',
      }))

      // Guardar patrón
      if (!this.patronesFraccionamiento.has(clienteId)) {
        this.patronesFraccionamiento.set(clienteId, [])
      }
      this.patronesFraccionamiento.get(clienteId)?.push(patron)
    }

    return esSospechoso ? patron : null
  }

  private crearAlerta(data: Partial<AlertaCNBV>): AlertaCNBV {
    return {
      id: `alerta_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      tipo: data.tipo ?? 'relevante',
      severidad: data.severidad ?? 'media',
      operacionId: data.operacionId ?? '',
      clienteId: data.clienteId,
      mensaje: data.mensaje ?? '',
      detalles: data.detalles ?? '',
      requiereAccion: data.requiereAccion ?? false,
      accionRequerida: data.accionRequerida,
      resuelta: false,
      createdAt: new Date(),
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // GENERACIÓN DE REPORTES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  generarReporte(
    tipo: TipoReporte,
    operaciones: OperacionReportable[],
    periodo: { inicio: string; fin: string },
    creadoPor: string
  ): ReporteCNBV {
    const folio = this.generarFolioReporte(tipo)
    const resumen = this.calcularResumen(operaciones)

    const reporte: ReporteCNBV = {
      id: `rep_${Date.now()}`,
      tipo,
      folio,
      periodo,
      fechaGeneracion: new Date().toISOString(),
      sujetoObligado: this.configuracion.sujetoObligado,
      operaciones,
      resumen,
      estado: 'borrador',
      creadoPor,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Generar XML
    reporte.archivoXml = this.generarXmlReporte(reporte)

    this.reportes.set(reporte.id, reporte)

    logger.info('🏛️ Reporte CNBV generado', {
      tipo,
      folio,
      operaciones: operaciones.length,
    })

    return reporte
  }

  generarReporte24Horas(operacion: OperacionReportable, creadoPor: string): ReporteCNBV {
    const hoy = new Date().toISOString().split('T')[0] ?? ''
    return this.generarReporte('R24H', [operacion], { inicio: hoy, fin: hoy }, creadoPor)
  }

  private generarFolioReporte(tipo: TipoReporte): string {
    const fecha = new Date()
    const year = fecha.getFullYear()
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0')
    const seq = (this.folioCounter++).toString().padStart(4, '0')
    return `${tipo}-${year}${month}-${seq}`
  }

  private calcularResumen(operaciones: OperacionReportable[]): ResumenReporte {
    const clientesUnicos = new Set(operaciones.map(o => o.clienteNombre)).size

    // Contar por divisa
    const operacionesPorDivisa: Record<string, { cantidad: number; montoTotal: number }> = {}
    operaciones.forEach(op => {
      if (!operacionesPorDivisa[op.divisaOrigen]) {
        operacionesPorDivisa[op.divisaOrigen] = { cantidad: 0, montoTotal: 0 }
      }
      operacionesPorDivisa[op.divisaOrigen].cantidad++
      operacionesPorDivisa[op.divisaOrigen].montoTotal += op.montoOrigen
    })

    // Clientes frecuentes
    const conteoClientes = new Map<string, { nombre: string; count: number }>()
    operaciones.forEach(op => {
      const existente = conteoClientes.get(op.clienteNombre)
      if (existente) {
        existente.count++
      } else {
        conteoClientes.set(op.clienteNombre, { nombre: op.clienteNombre, count: 1 })
      }
    })

    const clientesFrecuentes = Array.from(conteoClientes.entries())
      .filter(([_, v]) => v.count >= 3)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([id, v]) => ({ id, nombre: v.nombre, operaciones: v.count }))

    return {
      totalOperaciones: operaciones.length,
      operacionesCompra: operaciones.filter(o => o.tipoOperacion === 'compra').length,
      operacionesVenta: operaciones.filter(o => o.tipoOperacion === 'venta').length,
      operacionesPorDivisa,
      montoTotalMxn: operaciones.reduce((sum, op) =>
        sum + (op.divisaDestino === 'MXN' ? op.montoDestino : op.montoOrigen), 0),
      montoTotalUsdEquiv: operaciones.reduce((sum, op) => sum + op.montoUsdEquivalente, 0),
      operacionesMayoresUmbral: operaciones.filter(o =>
        o.montoUsdEquivalente >= this.configuracion.umbrales.operacionRelevante).length,
      clientesUnicos,
      clientesFrecuentes,
      operacionesRelevantes: operaciones.filter(o => o.esRelevante).length,
      operacionesInusuales: operaciones.filter(o => o.esInusual).length,
      operacionesPreocupantes: operaciones.filter(o => o.esPreocupante).length,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // GENERACIÓN XML CNBV
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private generarXmlReporte(reporte: ReporteCNBV): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>'
    const fechaActual = new Date().toISOString()

    const operacionesXml = reporte.operaciones.map((op, idx) => `
    <Operacion numero="${idx + 1}">
      <Folio>${op.folio}</Folio>
      <FechaOperacion>${op.fecha}</FechaOperacion>
      <HoraOperacion>${op.hora}</HoraOperacion>
      <TipoOperacion>${op.tipoOperacion === 'compra' ? 'COMPRA' : 'VENTA'}</TipoOperacion>
      <Cliente>
        <Nombre>${this.escaparXml(op.clienteNombre)}</Nombre>
        ${op.clienteRfc ? `<RFC>${op.clienteRfc}</RFC>` : ''}
        ${op.clienteCurp ? `<CURP>${op.clienteCurp}</CURP>` : ''}
        ${op.clienteNacionalidad ? `<Nacionalidad>${op.clienteNacionalidad}</Nacionalidad>` : ''}
        ${op.tipoIdentificacion ? `<TipoIdentificacion>${op.tipoIdentificacion}</TipoIdentificacion>` : ''}
        ${op.numeroIdentificacion ? `<NumeroIdentificacion>${op.numeroIdentificacion}</NumeroIdentificacion>` : ''}
      </Cliente>
      <Montos>
        <DivisaOrigen>${op.divisaOrigen}</DivisaOrigen>
        <MontoOrigen>${op.montoOrigen.toFixed(2)}</MontoOrigen>
        <DivisaDestino>${op.divisaDestino}</DivisaDestino>
        <MontoDestino>${op.montoDestino.toFixed(2)}</MontoDestino>
        <MontoUSDEquivalente>${op.montoUsdEquivalente.toFixed(2)}</MontoUSDEquivalente>
      </Montos>
      <Sucursal>${this.escaparXml(op.sucursal)}</Sucursal>
      <Cajero>
        <Id>${op.cajeroId}</Id>
        <Nombre>${this.escaparXml(op.cajeroNombre)}</Nombre>
      </Cajero>
    </Operacion>`).join('')

    const xml = `${xmlHeader}
<ReporteCNBV version="2.0" tipo="${reporte.tipo}">
  <Encabezado>
    <Folio>${reporte.folio}</Folio>
    <FechaGeneracion>${fechaActual}</FechaGeneracion>
    <Periodo>
      <Inicio>${reporte.periodo.inicio}</Inicio>
      <Fin>${reporte.periodo.fin}</Fin>
    </Periodo>
  </Encabezado>
  <SujetoObligado>
    <RazonSocial>${this.escaparXml(reporte.sujetoObligado.razonSocial)}</RazonSocial>
    <RFC>${reporte.sujetoObligado.rfc}</RFC>
    <ClaveCNBV>${reporte.sujetoObligado.clave}</ClaveCNBV>
    <Domicilio>${this.escaparXml(reporte.sujetoObligado.domicilio)}</Domicilio>
    <Telefono>${reporte.sujetoObligado.telefono}</Telefono>
    <Email>${reporte.sujetoObligado.email}</Email>
    <RepresentanteLegal>${this.escaparXml(reporte.sujetoObligado.representanteLegal)}</RepresentanteLegal>
  </SujetoObligado>
  <Operaciones total="${reporte.operaciones.length}">
    ${operacionesXml}
  </Operaciones>
  <Resumen>
    <TotalOperaciones>${reporte.resumen.totalOperaciones}</TotalOperaciones>
    <OperacionesCompra>${reporte.resumen.operacionesCompra}</OperacionesCompra>
    <OperacionesVenta>${reporte.resumen.operacionesVenta}</OperacionesVenta>
    <MontoTotalMXN>${reporte.resumen.montoTotalMxn.toFixed(2)}</MontoTotalMXN>
    <MontoTotalUSDEquiv>${reporte.resumen.montoTotalUsdEquiv.toFixed(2)}</MontoTotalUSDEquiv>
    <OperacionesMayoresUmbral>${reporte.resumen.operacionesMayoresUmbral}</OperacionesMayoresUmbral>
    <ClientesUnicos>${reporte.resumen.clientesUnicos}</ClientesUnicos>
  </Resumen>
</ReporteCNBV>`

    return xml
  }

  private escaparXml(texto: string): string {
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // GESTIÓN DE REPORTES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  getReporte(id: string): ReporteCNBV | undefined {
    return this.reportes.get(id)
  }

  getReportes(filtros?: {
    tipo?: TipoReporte
    estado?: ReporteCNBV['estado']
    fechaDesde?: string
    fechaHasta?: string
  }): ReporteCNBV[] {
    let resultado = Array.from(this.reportes.values())

    if (filtros?.tipo) {
      resultado = resultado.filter(r => r.tipo === filtros.tipo)
    }
    if (filtros?.estado) {
      resultado = resultado.filter(r => r.estado === filtros.estado)
    }
    if (filtros?.fechaDesde) {
      resultado = resultado.filter(r => r.fechaGeneracion >= filtros.fechaDesde!)
    }
    if (filtros?.fechaHasta) {
      resultado = resultado.filter(r => r.fechaGeneracion <= filtros.fechaHasta!)
    }

    return resultado.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  actualizarEstadoReporte(
    id: string,
    estado: ReporteCNBV['estado'],
    usuario: string,
    observaciones?: string
  ): boolean {
    const reporte = this.reportes.get(id)
    if (!reporte) return false

    reporte.estado = estado
    reporte.observaciones = observaciones
    reporte.updatedAt = new Date()

    switch (estado) {
      case 'revisado':
        reporte.revisadoPor = usuario
        break
      case 'aprobado':
        reporte.aprobadoPor = usuario
        break
      case 'enviado':
        reporte.enviadoPor = usuario
        reporte.fechaEnvio = new Date().toISOString()
        break
    }

    return true
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // ALERTAS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  getAlertas(soloActivas: boolean = true): AlertaCNBV[] {
    const alertas = soloActivas
      ? this.alertas.filter(a => !a.resuelta)
      : [...this.alertas]

    return alertas.sort((a, b) => {
      const severidadOrden = { critica: 0, alta: 1, media: 2, baja: 3 }
      return severidadOrden[a.severidad] - severidadOrden[b.severidad]
    })
  }

  getAlertasPorOperacion(operacionId: string): AlertaCNBV[] {
    return this.alertas.filter(a => a.operacionId === operacionId)
  }

  resolverAlerta(alertaId: string, usuario: string): boolean {
    const alerta = this.alertas.find(a => a.id === alertaId)
    if (!alerta) return false

    alerta.resuelta = true
    alerta.resueltaPor = usuario
    alerta.fechaResolucion = new Date()

    return true
  }

  getEstadisticasAlertas(): {
    total: number
    activas: number
    porTipo: Record<string, number>
    porSeveridad: Record<string, number>
  } {
    const activas = this.alertas.filter(a => !a.resuelta)

    const porTipo: Record<string, number> = {}
    const porSeveridad: Record<string, number> = {}

    activas.forEach(a => {
      porTipo[a.tipo] = (porTipo[a.tipo] ?? 0) + 1
      porSeveridad[a.severidad] = (porSeveridad[a.severidad] ?? 0) + 1
    })

    return {
      total: this.alertas.length,
      activas: activas.length,
      porTipo,
      porSeveridad,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // CONFIGURACIÓN
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  getConfiguracion(): ConfiguracionCNBV {
    return { ...this.configuracion }
  }

  actualizarConfiguracion(config: Partial<ConfiguracionCNBV>): void {
    this.configuracion = {
      ...this.configuracion,
      ...config,
      umbrales: {
        ...this.configuracion.umbrales,
        ...(config.umbrales ?? {}),
      },
      tiempos: {
        ...this.configuracion.tiempos,
        ...(config.tiempos ?? {}),
      },
      sujetoObligado: {
        ...this.configuracion.sujetoObligado,
        ...(config.sujetoObligado ?? {}),
      },
    }

    logger.info('🏛️ Configuración CNBV actualizada', this.configuracion)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const cnbvReportesService = CnbvReportesService.getInstance()

export default cnbvReportesService
