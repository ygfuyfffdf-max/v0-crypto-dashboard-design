// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💱 PROFIT CASA DE CAMBIO — SERVICIO COMPRAS/VENTAS COMPLETO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema integral de compras a proveedores y ventas a clientes:
 * - Múltiples métodos de pago (transferencia, efectivo, tarjeta, cripto)
 * - Tipos de cambio diferenciados por método
 * - Gestión de proveedores y clientes
 * - Órdenes de compra/venta completas
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES - MÉTODOS DE PAGO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type MetodoPago = 'transferencia' | 'efectivo' | 'tarjeta' | 'cripto'

export interface TipoCambioPorMetodo {
  transferencia: number
  efectivo: number
  tarjeta: number
  cripto: number
}

export interface ConfigMetodoPago {
  id: MetodoPago
  nombre: string
  nombreCorto: string
  icono: string
  color: string
  comisionPorcentaje: number
  comisionFija: number
  tiempoProcesamientoMin: number
  activo: boolean
  requiereDatos: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES - PROVEEDORES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface Proveedor {
  id: string
  nombre: string
  razonSocial?: string
  rfc?: string

  // Contacto
  contactoPrincipal?: string
  telefono?: string
  whatsapp?: string
  email?: string

  // Divisas que maneja
  divisasDisponibles: string[]

  // Métodos de pago aceptados
  metodosAceptados: MetodoPago[]

  // Datos bancarios (transferencia)
  banco?: string
  clabe?: string
  cuentaBancaria?: string
  beneficiario?: string

  // Datos cripto
  walletUsdt?: string
  walletBtc?: string
  redPreferida?: 'TRC20' | 'ERC20' | 'BEP20'

  // Tipos de cambio por método y divisa
  tiposCambio: Record<string, TipoCambioPorMetodo>

  // Disponibilidad
  disponibilidad: Record<string, number>

  // Límites
  montoMinimo: number
  montoMaximo: number

  // Estado
  estado: 'activo' | 'inactivo' | 'suspendido'
  calificacion: number
  totalCompras: number
  esPreferido: boolean

  createdAt: Date
  updatedAt: Date
}

export interface OrdenCompraProveedor {
  id: string
  folio: string

  // Proveedor
  proveedorId: string
  proveedorNombre: string

  // Divisa
  divisa: string
  cantidadDivisa: number

  // Método y tipo de cambio
  metodoPago: MetodoPago
  tipoCambioAplicado: number

  // Montos
  montoBaseMxn: number
  comisionMetodo: number
  comisionProveedor: number
  totalMxn: number

  // Datos de pago según método
  datosPago: DatosPago

  // Estado
  estado: 'cotizacion' | 'pendiente_pago' | 'pagada' | 'en_proceso' | 'recibida' | 'cancelada'

  // Fechas
  fechaCotizacion: Date
  fechaPago?: Date
  fechaRecepcion?: Date

  // Recepción
  cantidadRecibida?: number
  diferencia?: number

  // Comprobantes
  comprobantePago?: string
  comprobanteRecepcion?: string

  notas?: string
  creadoPor: string

  createdAt: Date
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES - CLIENTES Y VENTAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface ClienteVenta {
  id: string

  // Datos básicos
  nombre: string
  apellidoPaterno: string
  apellidoMaterno?: string
  nombreCompleto: string

  // Identificación
  tipoIdentificacion?: 'INE' | 'PASAPORTE' | 'LICENCIA' | 'FM2' | 'FM3'
  numeroIdentificacion?: string

  // Contacto
  telefono?: string
  email?: string
  whatsapp?: string

  // Datos fiscales
  rfc?: string
  curp?: string

  // Datos bancarios (para transferencia)
  banco?: string
  clabe?: string
  cuentaBancaria?: string

  // Datos cripto
  walletUsdt?: string
  walletBtc?: string

  // Métricas
  totalOperaciones: number
  montoTotalOperado: number
  ultimaOperacion?: Date

  // KYC
  nivelKyc: 'basico' | 'intermedio' | 'completo'
  estado: 'activo' | 'inactivo' | 'bloqueado'

  createdAt: Date
  updatedAt: Date
}

export interface VentaCliente {
  id: string
  folio: string

  // Cliente
  clienteId?: string
  clienteNombre: string
  clienteTelefono?: string
  clienteIdentificacion?: string

  // Divisa
  divisa: string
  cantidadDivisa: number

  // Método y tipo de cambio
  metodoPago: MetodoPago
  tipoCambioAplicado: number

  // Montos - Cliente COMPRA divisa
  montoRecibeMxn: number  // Lo que paga el cliente en MXN (o equivalente)
  comisionMetodo: number
  totalCobroCliente: number

  // Ganancia
  tipoCambioCosto: number  // Nuestro costo de la divisa
  gananciaOperacion: number

  // Datos de pago según método
  datosPago: DatosPago

  // Estado
  estado: 'cotizacion' | 'pendiente_pago' | 'pagada' | 'entregada' | 'cancelada'

  // Fechas
  fechaCotizacion: Date
  fechaPago?: Date
  fechaEntrega?: Date

  // Entrega
  cantidadEntregada?: number
  entregadoPor?: string

  // Comprobantes
  comprobantePago?: string
  comprobanteEntrega?: string

  notas?: string
  cajeroId: string
  cajeroNombre: string

  createdAt: Date
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES - DATOS DE PAGO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface DatosPago {
  // Transferencia
  bancoOrigen?: string
  bancoDestino?: string
  clabeOrigen?: string
  clabeDestino?: string
  referencia?: string

  // Efectivo
  denominacionesRecibidas?: { valor: number; cantidad: number }[]
  denominacionesEntregadas?: { valor: number; cantidad: number }[]

  // Tarjeta
  tipoTarjeta?: 'debito' | 'credito' | 'negra'
  ultimosDigitos?: string
  autorizacion?: string
  terminal?: string

  // Cripto
  wallet?: string
  red?: 'TRC20' | 'ERC20' | 'BEP20' | 'Lightning' | 'Mainnet'
  hashTransaccion?: string
  confirmaciones?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE MÉTODOS DE PAGO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const METODOS_PAGO_CONFIG: Record<MetodoPago, ConfigMetodoPago> = {
  transferencia: {
    id: 'transferencia',
    nombre: 'Transferencia Bancaria',
    nombreCorto: 'Transferencia',
    icono: '🏦',
    color: '#3B82F6',
    comisionPorcentaje: 0,
    comisionFija: 0,
    tiempoProcesamientoMin: 5,
    activo: true,
    requiereDatos: ['banco', 'clabe', 'referencia'],
  },
  efectivo: {
    id: 'efectivo',
    nombre: 'Efectivo',
    nombreCorto: 'Efectivo',
    icono: '💵',
    color: '#22C55E',
    comisionPorcentaje: 0,
    comisionFija: 0,
    tiempoProcesamientoMin: 0,
    activo: true,
    requiereDatos: ['denominaciones'],
  },
  tarjeta: {
    id: 'tarjeta',
    nombre: 'Tarjeta (Débito/Crédito/Negra)',
    nombreCorto: 'Tarjeta',
    icono: '💳',
    color: '#8B5CF6',
    comisionPorcentaje: 2.5,
    comisionFija: 0,
    tiempoProcesamientoMin: 1,
    activo: true,
    requiereDatos: ['ultimosDigitos', 'autorizacion'],
  },
  cripto: {
    id: 'cripto',
    nombre: 'Criptomoneda (USDT/BTC)',
    nombreCorto: 'Cripto',
    icono: '₿',
    color: '#F59E0B',
    comisionPorcentaje: 0.5,
    comisionFija: 0,
    tiempoProcesamientoMin: 10,
    activo: true,
    requiereDatos: ['wallet', 'red', 'hashTransaccion'],
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS DE CAMBIO BASE (Simulados - en producción desde API/DB)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const TIPOS_CAMBIO_BASE = {
  USD: {
    referencia: 20.15,
    // Para COMPRAS a proveedores (nosotros compramos)
    compra: {
      transferencia: 20.00,  // Mejor precio por transferencia
      efectivo: 20.05,       // Precio efectivo
      tarjeta: 20.30,        // Más caro por comisión tarjeta
      cripto: 19.95,         // Buen precio cripto (USDT)
    },
    // Para VENTAS a clientes (nosotros vendemos)
    venta: {
      transferencia: 20.35,  // Precio transferencia
      efectivo: 20.45,       // Precio efectivo (más común)
      tarjeta: 20.60,        // Precio tarjeta (incluye comisión)
      cripto: 20.30,         // Precio cripto
    },
  },
  EUR: {
    referencia: 22.00,
    compra: {
      transferencia: 21.80,
      efectivo: 21.90,
      tarjeta: 22.20,
      cripto: 21.75,
    },
    venta: {
      transferencia: 22.20,
      efectivo: 22.35,
      tarjeta: 22.55,
      cripto: 22.15,
    },
  },
  CAD: {
    referencia: 14.80,
    compra: {
      transferencia: 14.60,
      efectivo: 14.70,
      tarjeta: 14.95,
      cripto: 14.55,
    },
    venta: {
      transferencia: 14.95,
      efectivo: 15.10,
      tarjeta: 15.30,
      cripto: 14.90,
    },
  },
  GBP: {
    referencia: 25.60,
    compra: {
      transferencia: 25.35,
      efectivo: 25.45,
      tarjeta: 25.80,
      cripto: 25.30,
    },
    venta: {
      transferencia: 25.80,
      efectivo: 26.00,
      tarjeta: 26.25,
      cripto: 25.75,
    },
  },
  USDT: {
    referencia: 20.05,
    compra: {
      transferencia: 19.90,
      efectivo: 19.95,
      tarjeta: 20.15,
      cripto: 19.85,  // P2P cripto
    },
    venta: {
      transferencia: 20.20,
      efectivo: 20.35,
      tarjeta: 20.50,
      cripto: 20.15,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// BASE DE DATOS EN MEMORIA (Demo)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

let proveedoresDB: Proveedor[] = [
  {
    id: 'prov_001',
    nombre: 'Divisas Express',
    razonSocial: 'Divisas Express SA de CV',
    rfc: 'DEX190315XXX',
    contactoPrincipal: 'Roberto Méndez',
    telefono: '5551234567',
    whatsapp: '5551234567',
    email: 'ventas@divisasexpress.com',
    divisasDisponibles: ['USD', 'EUR', 'CAD'],
    metodosAceptados: ['transferencia', 'efectivo', 'cripto'],
    banco: 'BBVA',
    clabe: '012180001234567890',
    beneficiario: 'Divisas Express SA de CV',
    walletUsdt: 'TRX7abc123...',
    redPreferida: 'TRC20',
    tiposCambio: {
      USD: { transferencia: 20.00, efectivo: 20.05, tarjeta: 20.30, cripto: 19.95 },
      EUR: { transferencia: 21.80, efectivo: 21.90, tarjeta: 22.20, cripto: 21.75 },
      CAD: { transferencia: 14.60, efectivo: 14.70, tarjeta: 14.95, cripto: 14.55 },
    },
    disponibilidad: { USD: 50000, EUR: 20000, CAD: 15000 },
    montoMinimo: 1000,
    montoMaximo: 100000,
    estado: 'activo',
    calificacion: 4.8,
    totalCompras: 156,
    esPreferido: true,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date(),
  },
  {
    id: 'prov_002',
    nombre: 'CryptoMex',
    razonSocial: 'CryptoMex Digital SA de CV',
    contactoPrincipal: 'Ana Vega',
    telefono: '5559876543',
    whatsapp: '5559876543',
    divisasDisponibles: ['USD', 'USDT'],
    metodosAceptados: ['transferencia', 'cripto'],
    banco: 'Banorte',
    clabe: '072180009876543210',
    walletUsdt: 'TRX9xyz789...',
    walletBtc: 'bc1q...',
    redPreferida: 'TRC20',
    tiposCambio: {
      USD: { transferencia: 19.98, efectivo: 20.03, tarjeta: 20.25, cripto: 19.90 },
      USDT: { transferencia: 19.90, efectivo: 19.95, tarjeta: 20.10, cripto: 19.82 },
    },
    disponibilidad: { USD: 30000, USDT: 100000 },
    montoMinimo: 500,
    montoMaximo: 200000,
    estado: 'activo',
    calificacion: 4.9,
    totalCompras: 89,
    esPreferido: true,
    createdAt: new Date('2025-03-20'),
    updatedAt: new Date(),
  },
]

let clientesDB: ClienteVenta[] = []
let ordenesCompraDB: OrdenCompraProveedor[] = []
let ventasDB: VentaCliente[] = []

let contadorOC = 0
let contadorVenta = 0

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class ProfitComprasVentasService {

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // TIPOS DE CAMBIO
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene tipos de cambio para compra a proveedores
   */
  getTiposCambioCompra(divisa: string): TipoCambioPorMetodo | null {
    const tc = TIPOS_CAMBIO_BASE[divisa as keyof typeof TIPOS_CAMBIO_BASE]
    if (!tc) return null
    return tc.compra
  }

  /**
   * Obtiene tipos de cambio para venta a clientes
   */
  getTiposCambioVenta(divisa: string): TipoCambioPorMetodo | null {
    const tc = TIPOS_CAMBIO_BASE[divisa as keyof typeof TIPOS_CAMBIO_BASE]
    if (!tc) return null
    return tc.venta
  }

  /**
   * Obtiene todos los tipos de cambio
   */
  getTodosTiposCambio(): Record<string, { compra: TipoCambioPorMetodo; venta: TipoCambioPorMetodo; referencia: number }> {
    const resultado: Record<string, { compra: TipoCambioPorMetodo; venta: TipoCambioPorMetodo; referencia: number }> = {}

    for (const [divisa, tc] of Object.entries(TIPOS_CAMBIO_BASE)) {
      resultado[divisa] = {
        compra: tc.compra,
        venta: tc.venta,
        referencia: tc.referencia,
      }
    }

    return resultado
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // PROVEEDORES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Lista todos los proveedores
   */
  getProveedores(filtros?: {
    divisa?: string
    metodo?: MetodoPago
    soloActivos?: boolean
  }): Proveedor[] {
    let proveedores = [...proveedoresDB]

    if (filtros?.soloActivos !== false) {
      proveedores = proveedores.filter(p => p.estado === 'activo')
    }

    if (filtros?.divisa) {
      proveedores = proveedores.filter(p => p.divisasDisponibles.includes(filtros.divisa!))
    }

    if (filtros?.metodo) {
      proveedores = proveedores.filter(p => p.metodosAceptados.includes(filtros.metodo!))
    }

    return proveedores.sort((a, b) => {
      if (a.esPreferido !== b.esPreferido) return b.esPreferido ? 1 : -1
      return b.calificacion - a.calificacion
    })
  }

  /**
   * Obtiene un proveedor por ID
   */
  getProveedor(id: string): Proveedor | null {
    return proveedoresDB.find(p => p.id === id) ?? null
  }

  /**
   * Crea un nuevo proveedor
   */
  crearProveedor(datos: Omit<Proveedor, 'id' | 'createdAt' | 'updatedAt' | 'totalCompras' | 'calificacion'>): Proveedor {
    const nuevoProveedor: Proveedor = {
      ...datos,
      id: `prov_${Date.now()}`,
      calificacion: 5,
      totalCompras: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    proveedoresDB.push(nuevoProveedor)
    logger.info(`[ComprasVentas] Proveedor creado: ${nuevoProveedor.nombre}`)
    return nuevoProveedor
  }

  /**
   * Actualiza un proveedor
   */
  actualizarProveedor(id: string, datos: Partial<Proveedor>): Proveedor | null {
    const index = proveedoresDB.findIndex(p => p.id === id)
    if (index === -1) return null

    proveedoresDB[index] = {
      ...proveedoresDB[index],
      ...datos,
      updatedAt: new Date(),
    }

    return proveedoresDB[index]
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // COTIZACIÓN COMPRA A PROVEEDOR
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Genera cotización de compra a proveedor
   */
  cotizarCompraProveedor(params: {
    proveedorId: string
    divisa: string
    cantidadDivisa: number
    metodoPago: MetodoPago
  }): {
    exito: boolean
    cotizacion?: {
      proveedorNombre: string
      divisa: string
      cantidadDivisa: number
      metodoPago: MetodoPago
      tipoCambio: number
      montoBaseMxn: number
      comisionMetodo: number
      totalMxn: number
      disponible: number
      validezMinutos: number
    }
    mensaje: string
  } {
    const proveedor = this.getProveedor(params.proveedorId)
    if (!proveedor) {
      return { exito: false, mensaje: 'Proveedor no encontrado' }
    }

    if (!proveedor.divisasDisponibles.includes(params.divisa)) {
      return { exito: false, mensaje: `Proveedor no maneja ${params.divisa}` }
    }

    if (!proveedor.metodosAceptados.includes(params.metodoPago)) {
      return { exito: false, mensaje: `Proveedor no acepta ${params.metodoPago}` }
    }

    const disponible = proveedor.disponibilidad[params.divisa] ?? 0
    if (params.cantidadDivisa > disponible) {
      return { exito: false, mensaje: `Disponibilidad insuficiente. Máximo: ${disponible} ${params.divisa}` }
    }

    // Obtener tipo de cambio del proveedor
    const tcProveedor = proveedor.tiposCambio[params.divisa]
    if (!tcProveedor) {
      return { exito: false, mensaje: 'Tipo de cambio no disponible' }
    }

    const tipoCambio = tcProveedor[params.metodoPago]
    const montoBaseMxn = params.cantidadDivisa * tipoCambio

    // Calcular comisión del método
    const configMetodo = METODOS_PAGO_CONFIG[params.metodoPago]
    const comisionMetodo = (montoBaseMxn * configMetodo.comisionPorcentaje / 100) + configMetodo.comisionFija

    const totalMxn = montoBaseMxn + comisionMetodo

    return {
      exito: true,
      cotizacion: {
        proveedorNombre: proveedor.nombre,
        divisa: params.divisa,
        cantidadDivisa: params.cantidadDivisa,
        metodoPago: params.metodoPago,
        tipoCambio,
        montoBaseMxn: Math.round(montoBaseMxn * 100) / 100,
        comisionMetodo: Math.round(comisionMetodo * 100) / 100,
        totalMxn: Math.round(totalMxn * 100) / 100,
        disponible,
        validezMinutos: 15,
      },
      mensaje: 'Cotización generada',
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // CREAR ORDEN DE COMPRA
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Crea orden de compra a proveedor
   */
  crearOrdenCompra(params: {
    proveedorId: string
    divisa: string
    cantidadDivisa: number
    metodoPago: MetodoPago
    datosPago: DatosPago
    notas?: string
    creadoPor: string
  }): { exito: boolean; orden?: OrdenCompraProveedor; mensaje: string } {
    // Validar cotización
    const cotizacion = this.cotizarCompraProveedor({
      proveedorId: params.proveedorId,
      divisa: params.divisa,
      cantidadDivisa: params.cantidadDivisa,
      metodoPago: params.metodoPago,
    })

    if (!cotizacion.exito || !cotizacion.cotizacion) {
      return { exito: false, mensaje: cotizacion.mensaje }
    }

    // Validar datos de pago requeridos
    const configMetodo = METODOS_PAGO_CONFIG[params.metodoPago]
    for (const campo of configMetodo.requiereDatos) {
      if (campo === 'denominaciones') continue // Opcional para efectivo
      if (!params.datosPago[campo as keyof DatosPago]) {
        return { exito: false, mensaje: `Falta dato de pago: ${campo}` }
      }
    }

    // Generar folio
    const fecha = new Date()
    const fechaStr = fecha.toISOString().split('T')[0].replace(/-/g, '').substring(2)
    contadorOC++
    const folio = `OC-${fechaStr}-${String(contadorOC).padStart(4, '0')}`

    const orden: OrdenCompraProveedor = {
      id: `oc_${Date.now()}`,
      folio,
      proveedorId: params.proveedorId,
      proveedorNombre: cotizacion.cotizacion.proveedorNombre,
      divisa: params.divisa,
      cantidadDivisa: params.cantidadDivisa,
      metodoPago: params.metodoPago,
      tipoCambioAplicado: cotizacion.cotizacion.tipoCambio,
      montoBaseMxn: cotizacion.cotizacion.montoBaseMxn,
      comisionMetodo: cotizacion.cotizacion.comisionMetodo,
      comisionProveedor: 0,
      totalMxn: cotizacion.cotizacion.totalMxn,
      datosPago: params.datosPago,
      estado: 'pendiente_pago',
      fechaCotizacion: fecha,
      notas: params.notas,
      creadoPor: params.creadoPor,
      createdAt: fecha,
    }

    ordenesCompraDB.unshift(orden)
    logger.info(`[ComprasVentas] Orden de compra creada: ${folio}`)

    return { exito: true, orden, mensaje: `Orden ${folio} creada exitosamente` }
  }

  /**
   * Actualiza estado de orden de compra
   */
  actualizarOrdenCompra(
    ordenId: string,
    estado: OrdenCompraProveedor['estado'],
    datos?: Partial<OrdenCompraProveedor>
  ): OrdenCompraProveedor | null {
    const index = ordenesCompraDB.findIndex(o => o.id === ordenId)
    if (index === -1) return null

    ordenesCompraDB[index] = {
      ...ordenesCompraDB[index],
      ...datos,
      estado,
    }

    // Si se recibió, actualizar disponibilidad del proveedor
    if (estado === 'recibida' && datos?.cantidadRecibida) {
      // En producción: actualizar inventario de caja
    }

    return ordenesCompraDB[index]
  }

  /**
   * Lista órdenes de compra
   */
  getOrdenesCompra(filtros?: {
    proveedorId?: string
    estado?: OrdenCompraProveedor['estado']
    fechaDesde?: Date
    fechaHasta?: Date
  }): OrdenCompraProveedor[] {
    let ordenes = [...ordenesCompraDB]

    if (filtros?.proveedorId) {
      ordenes = ordenes.filter(o => o.proveedorId === filtros.proveedorId)
    }

    if (filtros?.estado) {
      ordenes = ordenes.filter(o => o.estado === filtros.estado)
    }

    if (filtros?.fechaDesde) {
      ordenes = ordenes.filter(o => o.createdAt >= filtros.fechaDesde!)
    }

    if (filtros?.fechaHasta) {
      ordenes = ordenes.filter(o => o.createdAt <= filtros.fechaHasta!)
    }

    return ordenes
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // CLIENTES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Lista clientes
   */
  getClientes(busqueda?: string): ClienteVenta[] {
    if (!busqueda) return clientesDB

    const termino = busqueda.toLowerCase()
    return clientesDB.filter(c =>
      c.nombreCompleto.toLowerCase().includes(termino) ||
      c.telefono?.includes(termino) ||
      c.rfc?.toLowerCase().includes(termino)
    )
  }

  /**
   * Obtiene cliente por ID
   */
  getCliente(id: string): ClienteVenta | null {
    return clientesDB.find(c => c.id === id) ?? null
  }

  /**
   * Crea nuevo cliente
   */
  crearCliente(datos: Omit<ClienteVenta, 'id' | 'createdAt' | 'updatedAt' | 'totalOperaciones' | 'montoTotalOperado' | 'nivelKyc'>): ClienteVenta {
    const cliente: ClienteVenta = {
      ...datos,
      id: `cli_${Date.now()}`,
      nombreCompleto: [datos.nombre, datos.apellidoPaterno, datos.apellidoMaterno].filter(Boolean).join(' '),
      totalOperaciones: 0,
      montoTotalOperado: 0,
      nivelKyc: datos.tipoIdentificacion && datos.rfc ? 'completo' : datos.tipoIdentificacion ? 'intermedio' : 'basico',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    clientesDB.push(cliente)
    return cliente
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // COTIZACIÓN VENTA A CLIENTE
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Genera cotización de venta a cliente
   */
  cotizarVentaCliente(params: {
    divisa: string
    cantidadDivisa: number
    metodoPago: MetodoPago
  }): {
    exito: boolean
    cotizacion?: {
      divisa: string
      cantidadDivisa: number
      metodoPago: MetodoPago
      tipoCambioVenta: number
      montoRecibeMxn: number
      comisionMetodo: number
      totalCobroCliente: number
      tipoCambioCosto: number
      gananciaEstimada: number
      validezMinutos: number
    }
    mensaje: string
  } {
    const tcVenta = this.getTiposCambioVenta(params.divisa)
    const tcCompra = this.getTiposCambioCompra(params.divisa)

    if (!tcVenta || !tcCompra) {
      return { exito: false, mensaje: `Divisa ${params.divisa} no disponible` }
    }

    const tipoCambioVenta = tcVenta[params.metodoPago]
    const tipoCambioCosto = tcCompra.efectivo // Asumimos costo promedio

    const montoRecibeMxn = params.cantidadDivisa * tipoCambioVenta

    // Comisión por método de pago
    const configMetodo = METODOS_PAGO_CONFIG[params.metodoPago]
    const comisionMetodo = (montoRecibeMxn * configMetodo.comisionPorcentaje / 100) + configMetodo.comisionFija

    const totalCobroCliente = montoRecibeMxn + comisionMetodo

    // Ganancia (diferencia entre venta y costo)
    const gananciaEstimada = (tipoCambioVenta - tipoCambioCosto) * params.cantidadDivisa

    return {
      exito: true,
      cotizacion: {
        divisa: params.divisa,
        cantidadDivisa: params.cantidadDivisa,
        metodoPago: params.metodoPago,
        tipoCambioVenta,
        montoRecibeMxn: Math.round(montoRecibeMxn * 100) / 100,
        comisionMetodo: Math.round(comisionMetodo * 100) / 100,
        totalCobroCliente: Math.round(totalCobroCliente * 100) / 100,
        tipoCambioCosto,
        gananciaEstimada: Math.round(gananciaEstimada * 100) / 100,
        validezMinutos: 5,
      },
      mensaje: 'Cotización generada',
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // CREAR VENTA A CLIENTE
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Crea venta a cliente
   */
  crearVenta(params: {
    clienteId?: string
    clienteNombre: string
    clienteTelefono?: string
    clienteIdentificacion?: string
    divisa: string
    cantidadDivisa: number
    metodoPago: MetodoPago
    datosPago: DatosPago
    notas?: string
    cajeroId: string
    cajeroNombre: string
  }): { exito: boolean; venta?: VentaCliente; mensaje: string } {
    // Validar cotización
    const cotizacion = this.cotizarVentaCliente({
      divisa: params.divisa,
      cantidadDivisa: params.cantidadDivisa,
      metodoPago: params.metodoPago,
    })

    if (!cotizacion.exito || !cotizacion.cotizacion) {
      return { exito: false, mensaje: cotizacion.mensaje }
    }

    // Generar folio
    const fecha = new Date()
    const fechaStr = fecha.toISOString().split('T')[0].replace(/-/g, '').substring(2)
    contadorVenta++
    const folio = `VTA-${fechaStr}-${String(contadorVenta).padStart(4, '0')}`

    const venta: VentaCliente = {
      id: `vta_${Date.now()}`,
      folio,
      clienteId: params.clienteId,
      clienteNombre: params.clienteNombre,
      clienteTelefono: params.clienteTelefono,
      clienteIdentificacion: params.clienteIdentificacion,
      divisa: params.divisa,
      cantidadDivisa: params.cantidadDivisa,
      metodoPago: params.metodoPago,
      tipoCambioAplicado: cotizacion.cotizacion.tipoCambioVenta,
      montoRecibeMxn: cotizacion.cotizacion.montoRecibeMxn,
      comisionMetodo: cotizacion.cotizacion.comisionMetodo,
      totalCobroCliente: cotizacion.cotizacion.totalCobroCliente,
      tipoCambioCosto: cotizacion.cotizacion.tipoCambioCosto,
      gananciaOperacion: cotizacion.cotizacion.gananciaEstimada,
      datosPago: params.datosPago,
      estado: 'pendiente_pago',
      fechaCotizacion: fecha,
      notas: params.notas,
      cajeroId: params.cajeroId,
      cajeroNombre: params.cajeroNombre,
      createdAt: fecha,
    }

    ventasDB.unshift(venta)

    // Actualizar métricas del cliente si existe
    if (params.clienteId) {
      const clienteIndex = clientesDB.findIndex(c => c.id === params.clienteId)
      if (clienteIndex !== -1) {
        clientesDB[clienteIndex].totalOperaciones++
        clientesDB[clienteIndex].montoTotalOperado += cotizacion.cotizacion.totalCobroCliente
        clientesDB[clienteIndex].ultimaOperacion = fecha
      }
    }

    logger.info(`[ComprasVentas] Venta creada: ${folio}`)
    return { exito: true, venta, mensaje: `Venta ${folio} registrada` }
  }

  /**
   * Actualiza estado de venta
   */
  actualizarVenta(
    ventaId: string,
    estado: VentaCliente['estado'],
    datos?: Partial<VentaCliente>
  ): VentaCliente | null {
    const index = ventasDB.findIndex(v => v.id === ventaId)
    if (index === -1) return null

    ventasDB[index] = {
      ...ventasDB[index],
      ...datos,
      estado,
    }

    return ventasDB[index]
  }

  /**
   * Lista ventas
   */
  getVentas(filtros?: {
    clienteId?: string
    estado?: VentaCliente['estado']
    metodoPago?: MetodoPago
    fechaDesde?: Date
    fechaHasta?: Date
  }): VentaCliente[] {
    let ventas = [...ventasDB]

    if (filtros?.clienteId) {
      ventas = ventas.filter(v => v.clienteId === filtros.clienteId)
    }

    if (filtros?.estado) {
      ventas = ventas.filter(v => v.estado === filtros.estado)
    }

    if (filtros?.metodoPago) {
      ventas = ventas.filter(v => v.metodoPago === filtros.metodoPago)
    }

    if (filtros?.fechaDesde) {
      ventas = ventas.filter(v => v.createdAt >= filtros.fechaDesde!)
    }

    if (filtros?.fechaHasta) {
      ventas = ventas.filter(v => v.createdAt <= filtros.fechaHasta!)
    }

    return ventas
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // MÉTRICAS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene resumen de operaciones
   */
  getResumenOperaciones(): {
    compras: {
      total: number
      pendientes: number
      montoTotalMxn: number
      porMetodo: Record<MetodoPago, number>
    }
    ventas: {
      total: number
      pendientes: number
      montoTotalMxn: number
      gananciaTotal: number
      porMetodo: Record<MetodoPago, number>
    }
  } {
    const compras = {
      total: ordenesCompraDB.length,
      pendientes: ordenesCompraDB.filter(o => ['pendiente_pago', 'pagada', 'en_proceso'].includes(o.estado)).length,
      montoTotalMxn: ordenesCompraDB.reduce((sum, o) => sum + o.totalMxn, 0),
      porMetodo: {
        transferencia: ordenesCompraDB.filter(o => o.metodoPago === 'transferencia').length,
        efectivo: ordenesCompraDB.filter(o => o.metodoPago === 'efectivo').length,
        tarjeta: ordenesCompraDB.filter(o => o.metodoPago === 'tarjeta').length,
        cripto: ordenesCompraDB.filter(o => o.metodoPago === 'cripto').length,
      },
    }

    const ventas = {
      total: ventasDB.length,
      pendientes: ventasDB.filter(v => ['pendiente_pago', 'pagada'].includes(v.estado)).length,
      montoTotalMxn: ventasDB.reduce((sum, v) => sum + v.totalCobroCliente, 0),
      gananciaTotal: ventasDB.reduce((sum, v) => sum + v.gananciaOperacion, 0),
      porMetodo: {
        transferencia: ventasDB.filter(v => v.metodoPago === 'transferencia').length,
        efectivo: ventasDB.filter(v => v.metodoPago === 'efectivo').length,
        tarjeta: ventasDB.filter(v => v.metodoPago === 'tarjeta').length,
        cripto: ventasDB.filter(v => v.metodoPago === 'cripto').length,
      },
    }

    return { compras, ventas }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const profitComprasVentasService = new ProfitComprasVentasService()
export { ProfitComprasVentasService }
