/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💱 CHRONOS INFINITY 2026 — SISTEMA COMPLETO CASA DE CAMBIO "PROFIT"
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema integral para operaciones de casa de cambio:
 * - Cotización en tiempo real con spreads configurables
 * - Gestión de operaciones compra/venta
 * - Control de caja con denominaciones
 * - Sistema de clientes con KYC
 * - Reportes y análisis
 * - Cumplimiento regulatorio CNBV
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type DivisaId = 'MXN' | 'USD' | 'EUR' | 'USDT' | 'CAD' | 'GBP'

export interface DivisaConfig {
  id: DivisaId
  nombre: string
  nombreCorto: string
  simbolo: string
  bandera: string
  decimales: number
  esCripto: boolean
  activa: boolean
  color: string
}

export interface TipoCambioConfig {
  id: string
  par: string
  divisaBase: DivisaId
  divisaCotizacion: DivisaId
  precioCompra: number    // Precio al que COMPRAMOS del cliente
  precioVenta: number     // Precio al que VENDEMOS al cliente
  precioReferencia: number
  spreadCompra: number    // % spread en compra
  spreadVenta: number     // % spread en venta
  comisionFija: number
  limiteMinimo: number
  limiteMaximo: number
  limiteDiarioCliente: number
  montoRequiereID: number
  activo: boolean
  ultimaActualizacion: Date
}

export interface ClienteCambio {
  id: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno?: string
  nombreCompleto: string
  tipoID?: 'INE' | 'PASAPORTE' | 'LICENCIA' | 'FM2' | 'FM3'
  numeroID?: string
  telefono?: string
  email?: string
  rfc?: string
  nacionalidad: string
  ocupacion?: string
  totalOperaciones: number
  montoTotalOperado: number
  ultimaOperacion?: Date
  nivelKYC: 'basico' | 'intermedio' | 'completo'
  estado: 'activo' | 'inactivo' | 'bloqueado'
}

export interface SolicitudCotizacion {
  tipoOperacion: 'compra' | 'venta' // Desde perspectiva del CLIENTE
  divisaEntrega: DivisaId           // Lo que entrega el cliente
  divisaRecibe: DivisaId            // Lo que recibe el cliente
  monto: number                      // Monto en divisa entrega
  esMontoRecibe?: boolean           // Si el monto es lo que quiere recibir
  clienteId?: string
}

export interface Cotizacion {
  id: string
  valida: boolean
  tipoOperacion: 'compra' | 'venta'
  divisaEntrega: DivisaId
  divisaRecibe: DivisaId
  montoEntrega: number
  montoRecibe: number
  tipoCambio: number
  tipoCambioReferencia: number
  spread: number
  comision: number
  gananciaEstimada: number
  requiereID: boolean
  mensaje?: string
  expiracion: Date
  createdAt: Date
}

export interface OperacionCambio {
  id: string
  folio: string
  tipoOperacion: 'compra' | 'venta'

  // Cliente
  clienteId?: string
  clienteNombre: string
  clienteTelefono?: string
  tipoID?: string
  numeroID?: string

  // Operación
  divisaEntrega: DivisaId
  divisaRecibe: DivisaId
  montoEntrega: number
  montoRecibe: number
  tipoCambioAplicado: number

  // Financiero
  spread: number
  comision: number
  gananciaOperacion: number

  // Denominaciones
  denominacionesRecibidas?: DenominacionConteo[]
  denominacionesEntregadas?: DenominacionConteo[]

  // Caja
  cajaId: string
  cajeroId: string
  cajeroNombre: string

  // Estado
  estado: 'pendiente' | 'completada' | 'cancelada' | 'reversada'

  // Timestamps
  fecha: string
  hora: string
  createdAt: Date
}

export interface DenominacionConteo {
  valor: number
  cantidad: number
  subtotal: number
}

export interface EstadoCaja {
  id: string
  nombre: string
  estado: 'abierta' | 'cerrada' | 'arqueo'
  cajeroId?: string
  cajeroNombre?: string
  fechaApertura?: Date

  // Saldos por divisa
  saldos: Record<DivisaId, {
    monto: number
    denominaciones: DenominacionConteo[]
  }>

  // Métricas del turno
  operacionesTurno: number
  comprasTurno: number
  ventasTurno: number
  gananciasTurno: number

  // Alertas
  alertas: {
    tipo: 'bajo' | 'alto' | 'limite'
    divisa: DivisaId
    mensaje: string
  }[]
}

export interface ResumenDiario {
  fecha: string
  totalOperaciones: number
  operacionesCompra: number
  operacionesVenta: number

  // Por divisa
  volumenes: Record<DivisaId, {
    comprado: number
    vendido: number
    neto: number
  }>

  // Financiero
  gananciasSpread: number
  gananciasComisiones: number
  gananciaTotal: number

  // Clientes
  clientesAtendidos: number
  clientesNuevos: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const DIVISAS_CONFIG: Record<DivisaId, DivisaConfig> = {
  MXN: {
    id: 'MXN',
    nombre: 'Peso Mexicano',
    nombreCorto: 'Pesos',
    simbolo: '$',
    bandera: '🇲🇽',
    decimales: 2,
    esCripto: false,
    activa: true,
    color: '#10B981',
  },
  USD: {
    id: 'USD',
    nombre: 'Dólar Estadounidense',
    nombreCorto: 'Dólares',
    simbolo: '$',
    bandera: '🇺🇸',
    decimales: 2,
    esCripto: false,
    activa: true,
    color: '#22C55E',
  },
  EUR: {
    id: 'EUR',
    nombre: 'Euro',
    nombreCorto: 'Euros',
    simbolo: '€',
    bandera: '🇪🇺',
    decimales: 2,
    esCripto: false,
    activa: true,
    color: '#3B82F6',
  },
  USDT: {
    id: 'USDT',
    nombre: 'Tether USDT',
    nombreCorto: 'USDT',
    simbolo: '₮',
    bandera: '💎',
    decimales: 2,
    esCripto: true,
    activa: true,
    color: '#26A17B',
  },
  CAD: {
    id: 'CAD',
    nombre: 'Dólar Canadiense',
    nombreCorto: 'CAD',
    simbolo: '$',
    bandera: '🇨🇦',
    decimales: 2,
    esCripto: false,
    activa: true,
    color: '#EF4444',
  },
  GBP: {
    id: 'GBP',
    nombre: 'Libra Esterlina',
    nombreCorto: 'Libras',
    simbolo: '£',
    bandera: '🇬🇧',
    decimales: 2,
    esCripto: false,
    activa: true,
    color: '#8B5CF6',
  },
}

export const DENOMINACIONES = {
  MXN: [
    { valor: 1000, tipo: 'billete', color: '#7C3AED', imagen: '💵' },
    { valor: 500, tipo: 'billete', color: '#3B82F6', imagen: '💵' },
    { valor: 200, tipo: 'billete', color: '#10B981', imagen: '💵' },
    { valor: 100, tipo: 'billete', color: '#EF4444', imagen: '💵' },
    { valor: 50, tipo: 'billete', color: '#F59E0B', imagen: '💵' },
    { valor: 20, tipo: 'billete', color: '#06B6D4', imagen: '💵' },
    { valor: 10, tipo: 'moneda', color: '#94A3B8', imagen: '🪙' },
    { valor: 5, tipo: 'moneda', color: '#94A3B8', imagen: '🪙' },
    { valor: 2, tipo: 'moneda', color: '#94A3B8', imagen: '🪙' },
    { valor: 1, tipo: 'moneda', color: '#94A3B8', imagen: '🪙' },
  ],
  USD: [
    { valor: 100, tipo: 'billete', color: '#22C55E', imagen: '💵' },
    { valor: 50, tipo: 'billete', color: '#22C55E', imagen: '💵' },
    { valor: 20, tipo: 'billete', color: '#22C55E', imagen: '💵' },
    { valor: 10, tipo: 'billete', color: '#22C55E', imagen: '💵' },
    { valor: 5, tipo: 'billete', color: '#22C55E', imagen: '💵' },
    { valor: 2, tipo: 'billete', color: '#22C55E', imagen: '💵' },
    { valor: 1, tipo: 'billete', color: '#22C55E', imagen: '💵' },
  ],
  EUR: [
    { valor: 500, tipo: 'billete', color: '#3B82F6', imagen: '💶' },
    { valor: 200, tipo: 'billete', color: '#3B82F6', imagen: '💶' },
    { valor: 100, tipo: 'billete', color: '#3B82F6', imagen: '💶' },
    { valor: 50, tipo: 'billete', color: '#3B82F6', imagen: '💶' },
    { valor: 20, tipo: 'billete', color: '#3B82F6', imagen: '💶' },
    { valor: 10, tipo: 'billete', color: '#3B82F6', imagen: '💶' },
    { valor: 5, tipo: 'billete', color: '#3B82F6', imagen: '💶' },
  ],
}

// Configuración inicial de tipos de cambio
export const TIPOS_CAMBIO_INICIALES: TipoCambioConfig[] = [
  {
    id: 'USD_MXN',
    par: 'USD/MXN',
    divisaBase: 'USD',
    divisaCotizacion: 'MXN',
    precioCompra: 19.85,
    precioVenta: 20.45,
    precioReferencia: 20.15,
    spreadCompra: 1.5,
    spreadVenta: 1.5,
    comisionFija: 0,
    limiteMinimo: 1,
    limiteMaximo: 10000,
    limiteDiarioCliente: 50000,
    montoRequiereID: 3000,
    activo: true,
    ultimaActualizacion: new Date(),
  },
  {
    id: 'EUR_MXN',
    par: 'EUR/MXN',
    divisaBase: 'EUR',
    divisaCotizacion: 'MXN',
    precioCompra: 21.65,
    precioVenta: 22.35,
    precioReferencia: 22.00,
    spreadCompra: 1.6,
    spreadVenta: 1.6,
    comisionFija: 0,
    limiteMinimo: 1,
    limiteMaximo: 5000,
    limiteDiarioCliente: 25000,
    montoRequiereID: 2500,
    activo: true,
    ultimaActualizacion: new Date(),
  },
  {
    id: 'USDT_MXN',
    par: 'USDT/MXN',
    divisaBase: 'USDT',
    divisaCotizacion: 'MXN',
    precioCompra: 19.75,
    precioVenta: 20.35,
    precioReferencia: 20.05,
    spreadCompra: 1.5,
    spreadVenta: 1.5,
    comisionFija: 0,
    limiteMinimo: 10,
    limiteMaximo: 50000,
    limiteDiarioCliente: 100000,
    montoRequiereID: 5000,
    activo: true,
    ultimaActualizacion: new Date(),
  },
  {
    id: 'CAD_MXN',
    par: 'CAD/MXN',
    divisaBase: 'CAD',
    divisaCotizacion: 'MXN',
    precioCompra: 14.50,
    precioVenta: 15.10,
    precioReferencia: 14.80,
    spreadCompra: 2.0,
    spreadVenta: 2.0,
    comisionFija: 0,
    limiteMinimo: 1,
    limiteMaximo: 5000,
    limiteDiarioCliente: 20000,
    montoRequiereID: 4000,
    activo: true,
    ultimaActualizacion: new Date(),
  },
  {
    id: 'GBP_MXN',
    par: 'GBP/MXN',
    divisaBase: 'GBP',
    divisaCotizacion: 'MXN',
    precioCompra: 25.20,
    precioVenta: 26.00,
    precioReferencia: 25.60,
    spreadCompra: 1.6,
    spreadVenta: 1.6,
    comisionFija: 0,
    limiteMinimo: 1,
    limiteMaximo: 3000,
    limiteDiarioCliente: 15000,
    montoRequiereID: 2000,
    activo: true,
    ultimaActualizacion: new Date(),
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO PROFIT CASA DE CAMBIO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class ProfitCasaCambioService {
  private static instance: ProfitCasaCambioService
  private tiposCambio: Map<string, TipoCambioConfig> = new Map()
  private cotizaciones: Map<string, Cotizacion> = new Map()
  private operaciones: OperacionCambio[] = []
  private clientes: Map<string, ClienteCambio> = new Map()
  private cajaActual: EstadoCaja | null = null
  private folioCounter: number = 1

  private constructor() {
    this.inicializar()
  }

  static getInstance(): ProfitCasaCambioService {
    if (!ProfitCasaCambioService.instance) {
      ProfitCasaCambioService.instance = new ProfitCasaCambioService()
    }
    return ProfitCasaCambioService.instance
  }

  private inicializar(): void {
    // Cargar tipos de cambio iniciales
    TIPOS_CAMBIO_INICIALES.forEach(tc => {
      this.tiposCambio.set(tc.id, tc)
    })

    // Inicializar caja
    this.cajaActual = {
      id: 'caja_profit_01',
      nombre: 'Caja Principal Profit',
      estado: 'cerrada',
      saldos: {
        MXN: { monto: 50000, denominaciones: [] },
        USD: { monto: 2000, denominaciones: [] },
        EUR: { monto: 500, denominaciones: [] },
        USDT: { monto: 0, denominaciones: [] },
        CAD: { monto: 200, denominaciones: [] },
        GBP: { monto: 100, denominaciones: [] },
      },
      operacionesTurno: 0,
      comprasTurno: 0,
      ventasTurno: 0,
      gananciasTurno: 0,
      alertas: [],
    }

    logger.info('💱 Sistema Casa de Cambio Profit inicializado', {
      pares: Array.from(this.tiposCambio.keys()),
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // TIPOS DE CAMBIO
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  getTiposCambio(): TipoCambioConfig[] {
    return Array.from(this.tiposCambio.values()).filter(tc => tc.activo)
  }

  getTipoCambio(id: string): TipoCambioConfig | undefined {
    return this.tiposCambio.get(id)
  }

  actualizarTipoCambio(id: string, precioCompra: number, precioVenta: number): boolean {
    const tc = this.tiposCambio.get(id)
    if (!tc) return false

    const precioReferencia = (precioCompra + precioVenta) / 2

    this.tiposCambio.set(id, {
      ...tc,
      precioCompra,
      precioVenta,
      precioReferencia,
      spreadCompra: ((precioReferencia - precioCompra) / precioReferencia) * 100,
      spreadVenta: ((precioVenta - precioReferencia) / precioReferencia) * 100,
      ultimaActualizacion: new Date(),
    })

    return true
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // COTIZACIÓN
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  cotizar(solicitud: SolicitudCotizacion): Cotizacion {
    const { tipoOperacion, divisaEntrega, divisaRecibe, monto, esMontoRecibe } = solicitud

    // Buscar tipo de cambio
    let tipoCambio: TipoCambioConfig | undefined
    let invertido = false

    // Primero buscar directo
    tipoCambio = this.tiposCambio.get(`${divisaEntrega}_${divisaRecibe}`)

    if (!tipoCambio) {
      tipoCambio = this.tiposCambio.get(`${divisaRecibe}_${divisaEntrega}`)
      invertido = true
    }

    // Si es MXN, buscar contra la otra divisa
    if (!tipoCambio && divisaEntrega === 'MXN') {
      tipoCambio = this.tiposCambio.get(`${divisaRecibe}_MXN`)
      invertido = true
    }
    if (!tipoCambio && divisaRecibe === 'MXN') {
      tipoCambio = this.tiposCambio.get(`${divisaEntrega}_MXN`)
    }

    if (!tipoCambio) {
      return this.cotizacionInvalida(`Par ${divisaEntrega}/${divisaRecibe} no disponible`)
    }

    // Determinar precio según tipo de operación
    // COMPRA = cliente compra divisa extranjera -> vendemos al precioVenta
    // VENTA = cliente vende divisa extranjera -> compramos al precioCompra
    let precioAplicado: number
    let spread: number

    if (tipoOperacion === 'compra') {
      // Cliente compra USD con MXN
      precioAplicado = invertido ? 1 / tipoCambio.precioVenta : tipoCambio.precioVenta
      spread = tipoCambio.spreadVenta
    } else {
      // Cliente vende USD por MXN
      precioAplicado = invertido ? 1 / tipoCambio.precioCompra : tipoCambio.precioCompra
      spread = tipoCambio.spreadCompra
    }

    // Calcular montos
    let montoEntrega: number
    let montoRecibe: number

    if (esMontoRecibe) {
      // El cliente especificó cuánto quiere RECIBIR
      montoRecibe = monto
      montoEntrega = monto / precioAplicado
    } else {
      // El cliente especificó cuánto va a ENTREGAR
      montoEntrega = monto
      montoRecibe = monto * precioAplicado
    }

    // Redondear
    const decimalesEntrega = DIVISAS_CONFIG[divisaEntrega].decimales
    const decimalesRecibe = DIVISAS_CONFIG[divisaRecibe].decimales
    montoEntrega = this.redondear(montoEntrega, decimalesEntrega)
    montoRecibe = this.redondear(montoRecibe, decimalesRecibe)

    // Calcular ganancia
    const precioReferencia = invertido ? 1 / tipoCambio.precioReferencia : tipoCambio.precioReferencia
    const diferencia = Math.abs(precioAplicado - precioReferencia)
    const gananciaEstimada = this.redondear(montoEntrega * diferencia, 2)

    // Verificar si requiere ID
    const montoUSD = divisaEntrega === 'USD' ? montoEntrega :
                     divisaRecibe === 'USD' ? montoRecibe :
                     divisaEntrega === 'MXN' ? montoEntrega / tipoCambio.precioReferencia :
                     montoRecibe / tipoCambio.precioReferencia
    const requiereID = montoUSD >= tipoCambio.montoRequiereID

    // Crear cotización
    const cotizacion: Cotizacion = {
      id: `cot_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      valida: true,
      tipoOperacion,
      divisaEntrega,
      divisaRecibe,
      montoEntrega,
      montoRecibe,
      tipoCambio: precioAplicado,
      tipoCambioReferencia: precioReferencia,
      spread,
      comision: tipoCambio.comisionFija,
      gananciaEstimada,
      requiereID,
      expiracion: new Date(Date.now() + 60000), // 1 minuto
      createdAt: new Date(),
    }

    this.cotizaciones.set(cotizacion.id, cotizacion)

    logger.info('💱 Cotización generada', {
      id: cotizacion.id,
      tipoOperacion,
      montoEntrega: `${montoEntrega} ${divisaEntrega}`,
      montoRecibe: `${montoRecibe} ${divisaRecibe}`,
      tipoCambio: precioAplicado,
    })

    return cotizacion
  }

  private cotizacionInvalida(mensaje: string): Cotizacion {
    return {
      id: '',
      valida: false,
      tipoOperacion: 'compra',
      divisaEntrega: 'MXN',
      divisaRecibe: 'USD',
      montoEntrega: 0,
      montoRecibe: 0,
      tipoCambio: 0,
      tipoCambioReferencia: 0,
      spread: 0,
      comision: 0,
      gananciaEstimada: 0,
      requiereID: false,
      mensaje,
      expiracion: new Date(),
      createdAt: new Date(),
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // OPERACIONES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  ejecutarOperacion(params: {
    cotizacionId: string
    clienteNombre: string
    clienteTelefono?: string
    tipoID?: string
    numeroID?: string
    denominacionesRecibidas?: DenominacionConteo[]
    denominacionesEntregadas?: DenominacionConteo[]
    cajeroId: string
    cajeroNombre: string
    notas?: string
  }): { exito: boolean; operacion?: OperacionCambio; mensaje: string } {
    const cotizacion = this.cotizaciones.get(params.cotizacionId)

    if (!cotizacion) {
      return { exito: false, mensaje: 'Cotización no encontrada' }
    }

    if (!cotizacion.valida) {
      return { exito: false, mensaje: 'Cotización inválida' }
    }

    if (new Date() > cotizacion.expiracion) {
      return { exito: false, mensaje: 'Cotización expirada' }
    }

    if (cotizacion.requiereID && (!params.tipoID || !params.numeroID)) {
      return { exito: false, mensaje: 'Se requiere identificación oficial' }
    }

    if (!this.cajaActual || this.cajaActual.estado !== 'abierta') {
      return { exito: false, mensaje: 'La caja no está abierta' }
    }

    // Generar folio
    const fecha = new Date()
    const folio = this.generarFolio(fecha)

    // Crear operación
    const operacion: OperacionCambio = {
      id: `op_${Date.now()}`,
      folio,
      tipoOperacion: cotizacion.tipoOperacion,
      clienteNombre: params.clienteNombre,
      clienteTelefono: params.clienteTelefono,
      tipoID: params.tipoID,
      numeroID: params.numeroID,
      divisaEntrega: cotizacion.divisaEntrega,
      divisaRecibe: cotizacion.divisaRecibe,
      montoEntrega: cotizacion.montoEntrega,
      montoRecibe: cotizacion.montoRecibe,
      tipoCambioAplicado: cotizacion.tipoCambio,
      spread: cotizacion.spread,
      comision: cotizacion.comision,
      gananciaOperacion: cotizacion.gananciaEstimada,
      denominacionesRecibidas: params.denominacionesRecibidas,
      denominacionesEntregadas: params.denominacionesEntregadas,
      cajaId: this.cajaActual.id,
      cajeroId: params.cajeroId,
      cajeroNombre: params.cajeroNombre,
      estado: 'completada',
      fecha: fecha.toISOString().split('T')[0]!,
      hora: fecha.toTimeString().split(' ')[0]!,
      createdAt: fecha,
    }

    // Actualizar saldos de caja
    if (this.cajaActual.saldos[cotizacion.divisaEntrega]) {
      this.cajaActual.saldos[cotizacion.divisaEntrega].monto += cotizacion.montoEntrega
    }
    if (this.cajaActual.saldos[cotizacion.divisaRecibe]) {
      this.cajaActual.saldos[cotizacion.divisaRecibe].monto -= cotizacion.montoRecibe
    }

    // Actualizar métricas
    this.cajaActual.operacionesTurno += 1
    this.cajaActual.gananciasTurno += cotizacion.gananciaEstimada

    if (cotizacion.tipoOperacion === 'compra') {
      this.cajaActual.ventasTurno += cotizacion.montoRecibe
    } else {
      this.cajaActual.comprasTurno += cotizacion.montoEntrega
    }

    // Guardar operación
    this.operaciones.push(operacion)

    // Eliminar cotización usada
    this.cotizaciones.delete(params.cotizacionId)

    logger.info('💱 Operación ejecutada', {
      folio,
      tipo: cotizacion.tipoOperacion,
      monto: `${cotizacion.montoEntrega} ${cotizacion.divisaEntrega} -> ${cotizacion.montoRecibe} ${cotizacion.divisaRecibe}`,
      ganancia: cotizacion.gananciaEstimada,
    })

    return {
      exito: true,
      operacion,
      mensaje: `Operación ${folio} completada exitosamente`,
    }
  }

  private generarFolio(fecha: Date): string {
    const year = fecha.getFullYear().toString().slice(-2)
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0')
    const day = fecha.getDate().toString().padStart(2, '0')
    const seq = (this.folioCounter++).toString().padStart(4, '0')
    return `PRF${year}${month}${day}-${seq}`
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // CAJA
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  getEstadoCaja(): EstadoCaja | null {
    return this.cajaActual
  }

  abrirCaja(cajeroId: string, cajeroNombre: string): boolean {
    if (!this.cajaActual) return false
    if (this.cajaActual.estado === 'abierta') return false

    this.cajaActual = {
      ...this.cajaActual,
      estado: 'abierta',
      cajeroId,
      cajeroNombre,
      fechaApertura: new Date(),
      operacionesTurno: 0,
      comprasTurno: 0,
      ventasTurno: 0,
      gananciasTurno: 0,
      alertas: [],
    }

    logger.info('💱 Caja abierta', { cajero: cajeroNombre })
    return true
  }

  cerrarCaja(): { exito: boolean; resumen?: ResumenDiario } {
    if (!this.cajaActual || this.cajaActual.estado !== 'abierta') {
      return { exito: false }
    }

    const resumen: ResumenDiario = {
      fecha: new Date().toISOString().split('T')[0]!,
      totalOperaciones: this.cajaActual.operacionesTurno,
      operacionesCompra: this.operaciones.filter(o => o.tipoOperacion === 'venta').length,
      operacionesVenta: this.operaciones.filter(o => o.tipoOperacion === 'compra').length,
      volumenes: {
        MXN: { comprado: 0, vendido: 0, neto: 0 },
        USD: { comprado: 0, vendido: 0, neto: 0 },
        EUR: { comprado: 0, vendido: 0, neto: 0 },
        USDT: { comprado: 0, vendido: 0, neto: 0 },
        CAD: { comprado: 0, vendido: 0, neto: 0 },
        GBP: { comprado: 0, vendido: 0, neto: 0 },
      },
      gananciasSpread: this.cajaActual.gananciasTurno,
      gananciasComisiones: 0,
      gananciaTotal: this.cajaActual.gananciasTurno,
      clientesAtendidos: this.cajaActual.operacionesTurno,
      clientesNuevos: 0,
    }

    this.cajaActual.estado = 'cerrada'
    this.cajaActual.cajeroId = undefined
    this.cajaActual.cajeroNombre = undefined

    logger.info('💱 Caja cerrada', { resumen })
    return { exito: true, resumen }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // OPERACIONES HISTORIAL
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  getOperaciones(filtros?: { fecha?: string; tipo?: 'compra' | 'venta'; cliente?: string }): OperacionCambio[] {
    let resultado = [...this.operaciones]

    if (filtros?.fecha) {
      resultado = resultado.filter(o => o.fecha === filtros.fecha)
    }
    if (filtros?.tipo) {
      resultado = resultado.filter(o => o.tipoOperacion === filtros.tipo)
    }
    if (filtros?.cliente) {
      resultado = resultado.filter(o =>
        o.clienteNombre.toLowerCase().includes(filtros.cliente!.toLowerCase())
      )
    }

    return resultado.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getOperacionPorFolio(folio: string): OperacionCambio | undefined {
    return this.operaciones.find(o => o.folio === folio)
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private redondear(valor: number, decimales: number): number {
    const factor = Math.pow(10, decimales)
    return Math.round(valor * factor) / factor
  }

  formatearMonto(monto: number, divisa: DivisaId): string {
    const config = DIVISAS_CONFIG[divisa]
    return `${config.simbolo}${new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: config.decimales,
      maximumFractionDigits: config.decimales,
    }).format(monto)} ${config.id}`
  }

  calcularDenominaciones(monto: number, divisa: DivisaId): DenominacionConteo[] {
    const denominaciones = DENOMINACIONES[divisa as keyof typeof DENOMINACIONES] || []
    const resultado: DenominacionConteo[] = []
    let restante = monto

    for (const denom of denominaciones) {
      if (restante >= denom.valor) {
        const cantidad = Math.floor(restante / denom.valor)
        resultado.push({
          valor: denom.valor,
          cantidad,
          subtotal: cantidad * denom.valor,
        })
        restante = this.redondear(restante - (cantidad * denom.valor), 2)
      }
    }

    return resultado
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const profitCasaCambioService = ProfitCasaCambioService.getInstance()

export default profitCasaCambioService
