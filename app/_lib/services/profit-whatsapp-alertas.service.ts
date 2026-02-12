/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📱 CHRONOS INFINITY 2026 — SISTEMA DE ALERTAS WHATSAPP
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de notificaciones por WhatsApp para casa de cambio:
 * - Alertas de operaciones grandes
 * - Notificaciones de caja
 * - Alertas CNBV/PLD
 * - Actualizaciones de tipos de cambio
 * - Reportes automáticos
 *
 * Integración con:
 * - WhatsApp Business API
 * - Twilio WhatsApp
 * - Meta WhatsApp Cloud API
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type TipoAlertaWhatsApp =
  | 'operacion_grande'
  | 'operacion_sospechosa'
  | 'apertura_caja'
  | 'cierre_caja'
  | 'diferencia_caja'
  | 'tipo_cambio'
  | 'reporte_cnbv'
  | 'cliente_bloqueado'
  | 'fraccionamiento'
  | 'pep_detectado'
  | 'resumen_diario'

export type PrioridadAlerta = 'baja' | 'media' | 'alta' | 'urgente'

export type EstadoMensaje = 'pendiente' | 'enviado' | 'entregado' | 'leido' | 'fallido'

export interface DestinatarioWhatsApp {
  id: string
  nombre: string
  telefono: string
  rol: 'gerente' | 'supervisor' | 'oficial_cumplimiento' | 'propietario' | 'sistema'
  activo: boolean
  alertasPermitidas: TipoAlertaWhatsApp[]
  prioridadMinima: PrioridadAlerta
  horariosActivos?: { inicio: string; fin: string }[]
  ultimaNotificacion?: Date
}

export interface MensajeWhatsApp {
  id: string
  destinatarioId: string
  destinatarioTelefono: string
  tipo: TipoAlertaWhatsApp
  prioridad: PrioridadAlerta
  asunto: string
  mensaje: string
  datos?: Record<string, unknown>
  estado: EstadoMensaje
  intentos: number
  errorMensaje?: string
  messageId?: string // ID de WhatsApp/Twilio
  createdAt: Date
  enviadoAt?: Date
  entregadoAt?: Date
  leidoAt?: Date
}

export interface PlantillaMensaje {
  id: string
  tipo: TipoAlertaWhatsApp
  nombre: string
  plantilla: string
  variables: string[]
  emoji: string
  prioridadDefault: PrioridadAlerta
}

export interface ConfiguracionWhatsApp {
  proveedor: 'meta' | 'twilio' | 'demo'
  apiKey?: string
  apiSecret?: string
  accountSid?: string
  authToken?: string
  phoneNumberId?: string
  sender: string
  webhook?: string
  maxReintentos: number
  intervaloReintentos: number // minutos
  horariosEnvio: { inicio: string; fin: string }
  resperarHorarios: boolean
  umbralOperacionGrande: number // USD
  umbralAlertaUrgente: number // USD
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PLANTILLAS DE MENSAJES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const PLANTILLAS: PlantillaMensaje[] = [
  {
    id: 'operacion_grande',
    tipo: 'operacion_grande',
    nombre: 'Operación Grande',
    emoji: '💰',
    prioridadDefault: 'alta',
    variables: ['folio', 'cliente', 'monto', 'divisa', 'tipoCambio', 'cajero', 'sucursal'],
    plantilla: `💰 *OPERACIÓN GRANDE*

📋 Folio: {{folio}}
👤 Cliente: {{cliente}}
💵 Monto: {{monto}} {{divisa}}
📊 T.C.: {{tipoCambio}}
🏪 Sucursal: {{sucursal}}
👨‍💼 Cajero: {{cajero}}
⏰ {{fecha}} {{hora}}

_Operación registrada correctamente._`,
  },
  {
    id: 'operacion_sospechosa',
    tipo: 'operacion_sospechosa',
    nombre: 'Operación Sospechosa',
    emoji: '🚨',
    prioridadDefault: 'urgente',
    variables: ['folio', 'cliente', 'monto', 'motivo', 'cajero'],
    plantilla: `🚨 *ALERTA: OPERACIÓN SOSPECHOSA*

⚠️ {{motivo}}

📋 Folio: {{folio}}
👤 Cliente: {{cliente}}
💵 Monto: {{monto}}
👨‍💼 Cajero: {{cajero}}
⏰ {{fecha}} {{hora}}

*Requiere revisión inmediata del Oficial de Cumplimiento.*`,
  },
  {
    id: 'apertura_caja',
    tipo: 'apertura_caja',
    nombre: 'Apertura de Caja',
    emoji: '🔓',
    prioridadDefault: 'baja',
    variables: ['caja', 'cajero', 'saldoInicial'],
    plantilla: `🔓 *CAJA ABIERTA*

🏪 Caja: {{caja}}
👨‍💼 Cajero: {{cajero}}
💰 Saldo inicial: {{saldoInicial}}
⏰ {{fecha}} {{hora}}`,
  },
  {
    id: 'cierre_caja',
    tipo: 'cierre_caja',
    nombre: 'Cierre de Caja',
    emoji: '🔐',
    prioridadDefault: 'media',
    variables: ['caja', 'cajero', 'operaciones', 'ganancia', 'diferencia'],
    plantilla: `🔐 *CORTE DE CAJA*

🏪 Caja: {{caja}}
👨‍💼 Cajero: {{cajero}}
📊 Operaciones: {{operaciones}}
💵 Ganancia: {{ganancia}}
{{diferencia}}
⏰ {{fecha}} {{hora}}`,
  },
  {
    id: 'diferencia_caja',
    tipo: 'diferencia_caja',
    nombre: 'Diferencia en Caja',
    emoji: '⚠️',
    prioridadDefault: 'alta',
    variables: ['caja', 'cajero', 'diferencia', 'divisa'],
    plantilla: `⚠️ *ALERTA: DIFERENCIA EN CAJA*

🏪 Caja: {{caja}}
👨‍💼 Cajero: {{cajero}}
❌ Diferencia: {{diferencia}} {{divisa}}
⏰ {{fecha}} {{hora}}

*Requiere justificación y/o arqueo.*`,
  },
  {
    id: 'tipo_cambio',
    tipo: 'tipo_cambio',
    nombre: 'Actualización Tipo de Cambio',
    emoji: '📈',
    prioridadDefault: 'baja',
    variables: ['divisa', 'compra', 'venta', 'variacion'],
    plantilla: `📈 *ACTUALIZACIÓN T.C.*

💱 {{divisa}}/MXN
📉 Compra: ${{compra}}
📈 Venta: ${{venta}}
{{variacion}}
⏰ {{fecha}} {{hora}}`,
  },
  {
    id: 'reporte_cnbv',
    tipo: 'reporte_cnbv',
    nombre: 'Reporte CNBV Generado',
    emoji: '🏛️',
    prioridadDefault: 'alta',
    variables: ['tipoReporte', 'folio', 'operaciones', 'monto'],
    plantilla: `🏛️ *REPORTE CNBV*

📄 Tipo: {{tipoReporte}}
📋 Folio: {{folio}}
📊 Operaciones: {{operaciones}}
💵 Monto total: {{monto}}

*Pendiente de revisión y envío.*`,
  },
  {
    id: 'fraccionamiento',
    tipo: 'fraccionamiento',
    nombre: 'Posible Fraccionamiento',
    emoji: '🔍',
    prioridadDefault: 'urgente',
    variables: ['cliente', 'operaciones', 'montoTotal'],
    plantilla: `🔍 *ALERTA: POSIBLE FRACCIONAMIENTO*

👤 Cliente: {{cliente}}
📊 Operaciones hoy: {{operaciones}}
💵 Monto total: {{montoTotal}}
⏰ {{fecha}}

*El cliente podría estar fraccionando operaciones para evadir reportes. Requiere análisis.*`,
  },
  {
    id: 'resumen_diario',
    tipo: 'resumen_diario',
    nombre: 'Resumen Diario',
    emoji: '📊',
    prioridadDefault: 'media',
    variables: ['fecha', 'operaciones', 'compras', 'ventas', 'ganancia'],
    plantilla: `📊 *RESUMEN DEL DÍA*

📅 {{fecha}}

💼 Total operaciones: {{operaciones}}
📈 Compras: {{compras}}
📉 Ventas: {{ventas}}
💰 Ganancia: {{ganancia}}

_Resumen generado automáticamente._`,
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEFAULT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const CONFIG_DEFAULT: ConfiguracionWhatsApp = {
  proveedor: 'demo',
  sender: '+52 55 1234 5678',
  maxReintentos: 3,
  intervaloReintentos: 5,
  horariosEnvio: { inicio: '07:00', fin: '22:00' },
  resperarHorarios: true,
  umbralOperacionGrande: 5000,
  umbralAlertaUrgente: 10000,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO WHATSAPP ALERTAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class WhatsAppAlertasService {
  private static instance: WhatsAppAlertasService
  private configuracion: ConfiguracionWhatsApp
  private destinatarios: Map<string, DestinatarioWhatsApp> = new Map()
  private mensajes: MensajeWhatsApp[] = []
  private plantillas: Map<string, PlantillaMensaje> = new Map()
  private colaEnvio: MensajeWhatsApp[] = []
  private procesandoCola = false

  private constructor() {
    this.configuracion = CONFIG_DEFAULT
    this.inicializar()
  }

  static getInstance(): WhatsAppAlertasService {
    if (!WhatsAppAlertasService.instance) {
      WhatsAppAlertasService.instance = new WhatsAppAlertasService()
    }
    return WhatsAppAlertasService.instance
  }

  private inicializar(): void {
    // Cargar plantillas
    PLANTILLAS.forEach(p => this.plantillas.set(p.id, p))

    // Cargar destinatarios demo
    this.cargarDestinatariosDemo()

    // Iniciar procesador de cola
    this.iniciarProcesadorCola()

    logger.info('📱 Sistema WhatsApp Alertas inicializado', {
      proveedor: this.configuracion.proveedor,
      destinatarios: this.destinatarios.size,
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // ENVÍO DE ALERTAS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  async enviarAlerta(
    tipo: TipoAlertaWhatsApp,
    datos: Record<string, unknown>,
    destinatariosIds?: string[]
  ): Promise<{ enviados: number; fallidos: number; mensajes: MensajeWhatsApp[] }> {
    const plantilla = this.plantillas.get(tipo)
    if (!plantilla) {
      logger.error('Plantilla no encontrada', { tipo })
      return { enviados: 0, fallidos: 0, mensajes: [] }
    }

    // Determinar destinatarios
    let destinatarios = this.obtenerDestinatariosParaTipo(tipo)
    if (destinatariosIds) {
      destinatarios = destinatarios.filter(d => destinatariosIds.includes(d.id))
    }

    const mensajesCreados: MensajeWhatsApp[] = []
    let enviados = 0
    let fallidos = 0

    // Agregar datos de fecha/hora
    datos.fecha = new Date().toLocaleDateString('es-MX')
    datos.hora = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

    for (const dest of destinatarios) {
      // Verificar si el destinatario puede recibir esta prioridad
      if (!this.puedeRecibirPrioridad(dest, plantilla.prioridadDefault)) {
        continue
      }

      // Verificar horarios
      if (this.configuracion.resperarHorarios && !this.dentroDeHorario(dest)) {
        // Encolar para después si no es urgente
        if (plantilla.prioridadDefault !== 'urgente') {
          continue
        }
      }

      const mensaje = this.crearMensaje(dest, plantilla, datos)
      mensajesCreados.push(mensaje)

      // Agregar a cola de envío
      this.colaEnvio.push(mensaje)
    }

    // Procesar cola inmediatamente para urgentes
    if (plantilla.prioridadDefault === 'urgente') {
      await this.procesarCola()
    }

    // Contar resultados (simplificado para demo)
    enviados = mensajesCreados.length
    fallidos = 0

    logger.info('📱 Alertas enviadas', { tipo, enviados, fallidos })

    return { enviados, fallidos, mensajes: mensajesCreados }
  }

  async enviarMensajeDirecto(
    telefono: string,
    mensaje: string,
    prioridad: PrioridadAlerta = 'media'
  ): Promise<MensajeWhatsApp> {
    const msg: MensajeWhatsApp = {
      id: this.generarId(),
      destinatarioId: 'directo',
      destinatarioTelefono: telefono,
      tipo: 'operacion_grande',
      prioridad,
      asunto: 'Mensaje directo',
      mensaje,
      estado: 'pendiente',
      intentos: 0,
      createdAt: new Date(),
    }

    this.colaEnvio.push(msg)
    await this.procesarCola()

    return msg
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // ALERTAS ESPECÍFICAS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  async alertarOperacionGrande(operacion: {
    folio: string
    cliente: string
    monto: number
    divisa: string
    tipoCambio: number
    cajero: string
    sucursal: string
  }): Promise<void> {
    const montoUsd = operacion.divisa === 'USD' ? operacion.monto :
                     operacion.divisa === 'MXN' ? operacion.monto / operacion.tipoCambio :
                     operacion.monto * operacion.tipoCambio

    // Determinar tipo basado en monto
    if (montoUsd >= this.configuracion.umbralAlertaUrgente) {
      // Alerta urgente para montos muy grandes
      await this.enviarAlerta('operacion_sospechosa', {
        ...operacion,
        monto: `$${operacion.monto.toLocaleString()}`,
        motivo: `Operación superior a $${this.configuracion.umbralAlertaUrgente.toLocaleString()} USD`,
      })
    } else if (montoUsd >= this.configuracion.umbralOperacionGrande) {
      await this.enviarAlerta('operacion_grande', {
        ...operacion,
        monto: `$${operacion.monto.toLocaleString()}`,
      })
    }
  }

  async alertarCorteCaja(corte: {
    caja: string
    cajero: string
    operaciones: number
    ganancia: number
    diferencias: { divisa: string; monto: number }[]
  }): Promise<void> {
    const tieneDiferencia = corte.diferencias.some(d => d.monto !== 0)

    if (tieneDiferencia) {
      const difStr = corte.diferencias
        .filter(d => d.monto !== 0)
        .map(d => `${d.divisa}: $${d.monto.toFixed(2)}`)
        .join(', ')

      await this.enviarAlerta('diferencia_caja', {
        caja: corte.caja,
        cajero: corte.cajero,
        diferencia: difStr,
        divisa: '',
      })
    }

    await this.enviarAlerta('cierre_caja', {
      caja: corte.caja,
      cajero: corte.cajero,
      operaciones: corte.operaciones.toString(),
      ganancia: `$${corte.ganancia.toFixed(2)} MXN`,
      diferencia: tieneDiferencia ? '⚠️ Con diferencias' : '✅ Cuadrada',
    })
  }

  async alertarFraccionamiento(datos: {
    cliente: string
    operaciones: number
    montoTotal: number
  }): Promise<void> {
    await this.enviarAlerta('fraccionamiento', {
      cliente: datos.cliente,
      operaciones: datos.operaciones.toString(),
      montoTotal: `$${datos.montoTotal.toLocaleString()} USD`,
    })
  }

  async enviarResumenDiario(resumen: {
    fecha: string
    operaciones: number
    compras: number
    ventas: number
    ganancia: number
  }): Promise<void> {
    await this.enviarAlerta('resumen_diario', {
      fecha: resumen.fecha,
      operaciones: resumen.operaciones.toString(),
      compras: `$${resumen.compras.toLocaleString()} MXN`,
      ventas: `$${resumen.ventas.toLocaleString()} MXN`,
      ganancia: `$${resumen.ganancia.toLocaleString()} MXN`,
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // GESTIÓN DE DESTINATARIOS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  agregarDestinatario(dest: Omit<DestinatarioWhatsApp, 'id'>): DestinatarioWhatsApp {
    const id = this.generarId()
    const destinatario: DestinatarioWhatsApp = { ...dest, id }
    this.destinatarios.set(id, destinatario)
    logger.info('📱 Destinatario agregado', { id, nombre: dest.nombre })
    return destinatario
  }

  actualizarDestinatario(id: string, datos: Partial<DestinatarioWhatsApp>): boolean {
    const dest = this.destinatarios.get(id)
    if (!dest) return false

    this.destinatarios.set(id, { ...dest, ...datos })
    return true
  }

  eliminarDestinatario(id: string): boolean {
    return this.destinatarios.delete(id)
  }

  getDestinatarios(): DestinatarioWhatsApp[] {
    return Array.from(this.destinatarios.values())
  }

  getDestinatario(id: string): DestinatarioWhatsApp | undefined {
    return this.destinatarios.get(id)
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // HISTORIAL Y ESTADÍSTICAS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  getMensajes(filtros?: {
    tipo?: TipoAlertaWhatsApp
    estado?: EstadoMensaje
    destinatarioId?: string
    desde?: Date
    hasta?: Date
  }): MensajeWhatsApp[] {
    let resultado = [...this.mensajes]

    if (filtros?.tipo) {
      resultado = resultado.filter(m => m.tipo === filtros.tipo)
    }
    if (filtros?.estado) {
      resultado = resultado.filter(m => m.estado === filtros.estado)
    }
    if (filtros?.destinatarioId) {
      resultado = resultado.filter(m => m.destinatarioId === filtros.destinatarioId)
    }
    if (filtros?.desde) {
      resultado = resultado.filter(m => m.createdAt >= filtros.desde!)
    }
    if (filtros?.hasta) {
      resultado = resultado.filter(m => m.createdAt <= filtros.hasta!)
    }

    return resultado.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getEstadisticas(): {
    total: number
    enviados: number
    entregados: number
    fallidos: number
    porTipo: Record<string, number>
    ultimoEnvio?: Date
  } {
    const stats = {
      total: this.mensajes.length,
      enviados: this.mensajes.filter(m => ['enviado', 'entregado', 'leido'].includes(m.estado)).length,
      entregados: this.mensajes.filter(m => ['entregado', 'leido'].includes(m.estado)).length,
      fallidos: this.mensajes.filter(m => m.estado === 'fallido').length,
      porTipo: {} as Record<string, number>,
      ultimoEnvio: undefined as Date | undefined,
    }

    this.mensajes.forEach(m => {
      stats.porTipo[m.tipo] = (stats.porTipo[m.tipo] ?? 0) + 1
    })

    const ultimoEnviado = this.mensajes
      .filter(m => m.enviadoAt)
      .sort((a, b) => (b.enviadoAt?.getTime() ?? 0) - (a.enviadoAt?.getTime() ?? 0))[0]

    if (ultimoEnviado?.enviadoAt) {
      stats.ultimoEnvio = ultimoEnviado.enviadoAt
    }

    return stats
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // PROCESAMIENTO INTERNO
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private crearMensaje(
    dest: DestinatarioWhatsApp,
    plantilla: PlantillaMensaje,
    datos: Record<string, unknown>
  ): MensajeWhatsApp {
    let mensaje = plantilla.plantilla

    // Reemplazar variables
    plantilla.variables.forEach(v => {
      const valor = datos[v] ?? ''
      mensaje = mensaje.replace(new RegExp(`{{${v}}}`, 'g'), String(valor))
    })

    // Reemplazar fecha/hora comunes
    mensaje = mensaje.replace(/{{fecha}}/g, String(datos.fecha ?? ''))
    mensaje = mensaje.replace(/{{hora}}/g, String(datos.hora ?? ''))

    return {
      id: this.generarId(),
      destinatarioId: dest.id,
      destinatarioTelefono: dest.telefono,
      tipo: plantilla.tipo,
      prioridad: plantilla.prioridadDefault,
      asunto: `${plantilla.emoji} ${plantilla.nombre}`,
      mensaje,
      datos,
      estado: 'pendiente',
      intentos: 0,
      createdAt: new Date(),
    }
  }

  private obtenerDestinatariosParaTipo(tipo: TipoAlertaWhatsApp): DestinatarioWhatsApp[] {
    return Array.from(this.destinatarios.values()).filter(d =>
      d.activo && d.alertasPermitidas.includes(tipo)
    )
  }

  private puedeRecibirPrioridad(dest: DestinatarioWhatsApp, prioridad: PrioridadAlerta): boolean {
    const prioridadNivel: Record<PrioridadAlerta, number> = {
      baja: 1,
      media: 2,
      alta: 3,
      urgente: 4,
    }
    return prioridadNivel[prioridad] >= prioridadNivel[dest.prioridadMinima]
  }

  private dentroDeHorario(dest: DestinatarioWhatsApp): boolean {
    const ahora = new Date()
    const horaActual = ahora.getHours() * 100 + ahora.getMinutes()

    const { inicio, fin } = this.configuracion.horariosEnvio
    const horaInicio = parseInt(inicio.replace(':', ''))
    const horaFin = parseInt(fin.replace(':', ''))

    return horaActual >= horaInicio && horaActual <= horaFin
  }

  private async procesarCola(): Promise<void> {
    if (this.procesandoCola) return
    this.procesandoCola = true

    while (this.colaEnvio.length > 0) {
      const mensaje = this.colaEnvio.shift()
      if (!mensaje) continue

      await this.enviarMensaje(mensaje)
    }

    this.procesandoCola = false
  }

  private async enviarMensaje(mensaje: MensajeWhatsApp): Promise<void> {
    mensaje.intentos++

    try {
      // Simular envío según proveedor
      switch (this.configuracion.proveedor) {
        case 'meta':
          await this.enviarViaMetaApi(mensaje)
          break
        case 'twilio':
          await this.enviarViaTwilio(mensaje)
          break
        default:
          // Demo mode
          await this.simularEnvio(mensaje)
      }

      mensaje.estado = 'enviado'
      mensaje.enviadoAt = new Date()

      // Simular entrega después de un momento
      setTimeout(() => {
        mensaje.estado = 'entregado'
        mensaje.entregadoAt = new Date()
      }, 2000)

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      mensaje.errorMensaje = errorMsg

      if (mensaje.intentos >= this.configuracion.maxReintentos) {
        mensaje.estado = 'fallido'
        logger.error('📱 Mensaje fallido', { id: mensaje.id, error: errorMsg })
      } else {
        // Re-encolar para reintento
        setTimeout(() => {
          this.colaEnvio.push(mensaje)
          this.procesarCola()
        }, this.configuracion.intervaloReintentos * 60 * 1000)
      }
    }

    this.mensajes.push(mensaje)

    // Actualizar última notificación del destinatario
    const dest = this.destinatarios.get(mensaje.destinatarioId)
    if (dest) {
      dest.ultimaNotificacion = new Date()
    }
  }

  private async enviarViaMetaApi(_mensaje: MensajeWhatsApp): Promise<void> {
    // Implementación real usaría fetch a Meta WhatsApp Cloud API
    // Por ahora simulamos
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  private async enviarViaTwilio(_mensaje: MensajeWhatsApp): Promise<void> {
    // Implementación real usaría Twilio SDK
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  private async simularEnvio(mensaje: MensajeWhatsApp): Promise<void> {
    // Simulación de envío para desarrollo
    await new Promise(resolve => setTimeout(resolve, 300))
    logger.info('📱 [DEMO] Mensaje enviado', {
      id: mensaje.id,
      tipo: mensaje.tipo,
      telefono: mensaje.destinatarioTelefono,
    })
  }

  private iniciarProcesadorCola(): void {
    // Procesar cola cada 30 segundos
    setInterval(() => {
      if (this.colaEnvio.length > 0) {
        this.procesarCola()
      }
    }, 30000)
  }

  private generarId(): string {
    return `wa_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // CONFIGURACIÓN
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  getConfiguracion(): ConfiguracionWhatsApp {
    return { ...this.configuracion }
  }

  actualizarConfiguracion(config: Partial<ConfiguracionWhatsApp>): void {
    this.configuracion = { ...this.configuracion, ...config }
    logger.info('📱 Configuración WhatsApp actualizada')
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // DATOS DEMO
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private cargarDestinatariosDemo(): void {
    const destinatariosDemo: Omit<DestinatarioWhatsApp, 'id'>[] = [
      {
        nombre: 'Juan Pérez (Gerente)',
        telefono: '+525512345678',
        rol: 'gerente',
        activo: true,
        alertasPermitidas: ['operacion_grande', 'operacion_sospechosa', 'diferencia_caja', 'fraccionamiento', 'resumen_diario'],
        prioridadMinima: 'media',
      },
      {
        nombre: 'María García (Cumplimiento)',
        telefono: '+525523456789',
        rol: 'oficial_cumplimiento',
        activo: true,
        alertasPermitidas: ['operacion_sospechosa', 'reporte_cnbv', 'fraccionamiento', 'pep_detectado', 'cliente_bloqueado'],
        prioridadMinima: 'alta',
      },
      {
        nombre: 'Carlos López (Propietario)',
        telefono: '+525534567890',
        rol: 'propietario',
        activo: true,
        alertasPermitidas: ['operacion_grande', 'operacion_sospechosa', 'resumen_diario'],
        prioridadMinima: 'alta',
      },
    ]

    destinatariosDemo.forEach(d => this.agregarDestinatario(d))
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const whatsAppAlertasService = WhatsAppAlertasService.getInstance()

export default whatsAppAlertasService
