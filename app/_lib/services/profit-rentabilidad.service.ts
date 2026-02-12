/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💱 PROFIT CASA DE CAMBIO — CONFIGURACIÓN DE COMISIONES Y RENTABILIDAD
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Configuración detallada del modelo de negocio:
 * - Comisiones por método de pago
 * - Descuentos por volumen
 * - Tarjetas Negras (primera emisión vs recargas)
 * - Cálculo de rentabilidad
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type MetodoPagoVenta = 
  | 'efectivo'           // Sin comisión, tipo cambio normal
  | 'transferencia'      // +3% comisión sobre tipo cambio
  | 'cripto'             // +1.5% comisión
  | 'tarjeta_negra'      // 8% primera vez, 3% recargas

export type TipoTarjetaNegra = 'primera_emision' | 'recarga'

export interface ConfigComisionMetodo {
  id: MetodoPagoVenta
  nombre: string
  descripcion: string
  icono: string
  color: string
  
  // Comisión sobre el monto
  comisionPorcentaje: number
  comisionFija: number
  
  // Ajuste al tipo de cambio (+ = peor para cliente, - = mejor para cliente)
  ajusteTipoCambioPorcentaje: number
  
  // Para tarjetas negras
  esTarjetaNegra?: boolean
  comisionPrimeraEmision?: number
  comisionRecarga?: number
  
  // Genera historial fiscal?
  generaHistorial: boolean
  
  // Requiere identificación?
  requiereIdentificacion: boolean
  montoRequiereId: number
  
  activo: boolean
}

export interface ConfigDescuentoVolumen {
  montoMinimo: number      // USD equivalente
  montoMaximo: number      // USD equivalente
  descuentoCentavos: number // Centavos a restar del tipo de cambio
  descuentoPorcentaje: number // O porcentaje de descuento
  descripcion: string
}

export interface TarjetaNegraCliente {
  id: string
  clienteId: string
  clienteNombre: string
  
  // Estado de la tarjeta
  numeroTarjeta: string  // Últimos 4 dígitos o referencia
  saldoActual: number
  saldoInicial: number
  
  // Comisiones pagadas
  comisionPagadaTotal: number
  esRecarga: boolean  // true = ya no paga 8%, solo 3%
  
  // Historial
  totalRecargas: number
  montoTotalRecargado: number
  
  // Estado
  estado: 'activa' | 'bloqueada' | 'vencida'
  fechaEmision: Date
  fechaUltimaRecarga?: Date
}

export interface CalculoVentaCliente {
  // Entrada
  divisa: string
  cantidadDivisa: number
  metodoPago: MetodoPagoVenta
  esTarjetaNegra?: boolean
  esRecargaTarjeta?: boolean
  tarjetaNegraId?: string
  
  // Tipo de cambio
  tipoCambioBase: number        // TC de referencia (competencia)
  tipoCambioAjustado: number    // TC con ajuste por método
  
  // Montos
  montoBaseMxn: number          // cantidad * TC base
  ajusteTipoCambio: number      // Diferencia por método
  
  // Comisiones
  comisionMetodoPorcentaje: number
  comisionMetodoMonto: number
  
  // Descuento volumen (si aplica)
  aplicaDescuentoVolumen: boolean
  descuentoVolumenMonto: number
  
  // Totales
  totalCobrarCliente: number    // Lo que paga el cliente
  totalEntregarDivisa: number   // Lo que recibe el cliente
  
  // Rentabilidad
  costoAdquisicionDivisa: number  // Lo que nos cuesta la divisa
  gananciaSpread: number          // Ganancia por diferencia TC
  gananciaComision: number        // Ganancia por comisión
  gananciaTotal: number           // Ganancia total de la operación
  rentabilidadPorcentaje: number  // % de rentabilidad
  
  // Info adicional
  generaHistorialFiscal: boolean
  requiereIdentificacion: boolean
  alertas: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE COMISIONES POR MÉTODO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const CONFIG_COMISIONES_METODO: Record<MetodoPagoVenta, ConfigComisionMetodo> = {
  efectivo: {
    id: 'efectivo',
    nombre: 'Efectivo',
    descripcion: 'Pago en efectivo, sin comisión adicional',
    icono: '💵',
    color: '#22C55E',
    comisionPorcentaje: 0,
    comisionFija: 0,
    ajusteTipoCambioPorcentaje: 0,
    generaHistorial: true,
    requiereIdentificacion: true,
    montoRequiereId: 3000, // USD equiv
    activo: true,
  },
  
  transferencia: {
    id: 'transferencia',
    nombre: 'Transferencia Bancaria',
    descripcion: 'Pago por SPEI/Transferencia, +3% sobre tipo de cambio',
    icono: '🏦',
    color: '#3B82F6',
    comisionPorcentaje: 3,           // 3% de comisión
    comisionFija: 0,
    ajusteTipoCambioPorcentaje: 0,   // El 3% se aplica como comisión directa
    generaHistorial: true,
    requiereIdentificacion: true,
    montoRequiereId: 3000,
    activo: true,
  },
  
  cripto: {
    id: 'cripto',
    nombre: 'Criptomoneda (USDT/BTC)',
    descripcion: 'Pago en cripto, +1.5% sobre tipo de cambio',
    icono: '₿',
    color: '#F59E0B',
    comisionPorcentaje: 1.5,
    comisionFija: 0,
    ajusteTipoCambioPorcentaje: 0,
    generaHistorial: false,  // Cripto no genera historial fiscal directo
    requiereIdentificacion: false,
    montoRequiereId: 10000,
    activo: true,
  },
  
  tarjeta_negra: {
    id: 'tarjeta_negra',
    nombre: 'Tarjeta Negra',
    descripcion: 'Tarjeta prepagada sin historial. Primera emisión 8%, recargas 3%',
    icono: '💳',
    color: '#1F2937',
    comisionPorcentaje: 8,           // 8% primera emisión (default)
    comisionFija: 0,
    ajusteTipoCambioPorcentaje: 0,
    esTarjetaNegra: true,
    comisionPrimeraEmision: 8,       // 8% en primera emisión
    comisionRecarga: 3,              // 3% en recargas
    generaHistorial: false,          // NO genera historial fiscal
    requiereIdentificacion: false,   // No requiere ID
    montoRequiereId: 0,
    activo: true,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE DESCUENTOS POR VOLUMEN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const CONFIG_DESCUENTOS_VOLUMEN: ConfigDescuentoVolumen[] = [
  {
    montoMinimo: 0,
    montoMaximo: 9999,
    descuentoCentavos: 0,
    descuentoPorcentaje: 0,
    descripcion: 'Sin descuento',
  },
  {
    montoMinimo: 10000,
    montoMaximo: 24999,
    descuentoCentavos: 5,   // -$0.05 del TC
    descuentoPorcentaje: 0,
    descripcion: 'Descuento $10K-$25K: -5 centavos',
  },
  {
    montoMinimo: 25000,
    montoMaximo: 49999,
    descuentoCentavos: 10,  // -$0.10 del TC
    descuentoPorcentaje: 0,
    descripcion: 'Descuento $25K-$50K: -10 centavos',
  },
  {
    montoMinimo: 50000,
    montoMaximo: 99999,
    descuentoCentavos: 15,  // -$0.15 del TC
    descuentoPorcentaje: 0,
    descripcion: 'Descuento $50K-$100K: -15 centavos',
  },
  {
    montoMinimo: 100000,
    montoMaximo: Infinity,
    descuentoCentavos: 20,  // -$0.20 del TC
    descuentoPorcentaje: 0,
    descripcion: 'Descuento $100K+: -20 centavos (VIP)',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS DE CAMBIO BASE (Referencia competencia)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const TIPOS_CAMBIO_REFERENCIA = {
  USD: {
    competencia: 17.50,      // Precio en otras casas de cambio
    nuestroCosto: 17.20,     // Lo que nos cuesta a nosotros
    ventaBase: 17.50,        // Nuestro precio base de venta (igual a competencia)
  },
  EUR: {
    competencia: 19.00,
    nuestroCosto: 18.60,
    ventaBase: 19.00,
  },
  CAD: {
    competencia: 12.80,
    nuestroCosto: 12.50,
    ventaBase: 12.80,
  },
  GBP: {
    competencia: 22.00,
    nuestroCosto: 21.50,
    ventaBase: 22.00,
  },
  USDT: {
    competencia: 17.45,
    nuestroCosto: 17.15,
    ventaBase: 17.45,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// BASE DE DATOS EN MEMORIA - TARJETAS NEGRAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const tarjetasNegrasDB: Map<string, TarjetaNegraCliente> = new Map()

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE CÁLCULO DE RENTABILIDAD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class ProfitRentabilidadService {
  
  /**
   * Calcula todos los detalles de una venta a cliente
   */
  calcularVentaCliente(params: {
    divisa: string
    cantidadDivisa: number
    metodoPago: MetodoPagoVenta
    esRecargaTarjeta?: boolean
    tarjetaNegraId?: string
  }): CalculoVentaCliente {
    const { divisa, cantidadDivisa, metodoPago, esRecargaTarjeta, tarjetaNegraId } = params
    
    // Obtener configuración del método
    const configMetodo = CONFIG_COMISIONES_METODO[metodoPago]
    
    // Obtener tipos de cambio
    const tcRef = TIPOS_CAMBIO_REFERENCIA[divisa as keyof typeof TIPOS_CAMBIO_REFERENCIA]
    if (!tcRef) {
      throw new Error(`Divisa ${divisa} no soportada`)
    }
    
    // Tipo de cambio base (competencia)
    let tipoCambioBase = tcRef.ventaBase
    const costoAdquisicion = tcRef.nuestroCosto
    
    // Calcular descuento por volumen
    const descuentoVolumen = this.obtenerDescuentoVolumen(cantidadDivisa)
    const aplicaDescuentoVolumen = descuentoVolumen.descuentoCentavos > 0
    
    // Si aplica descuento volumen, reducir TC para beneficio del cliente
    if (aplicaDescuentoVolumen) {
      tipoCambioBase -= descuentoVolumen.descuentoCentavos / 100
    }
    
    // Calcular comisión según método
    let comisionPorcentaje = configMetodo.comisionPorcentaje
    
    // Caso especial: Tarjeta negra
    if (metodoPago === 'tarjeta_negra') {
      if (esRecargaTarjeta) {
        comisionPorcentaje = configMetodo.comisionRecarga ?? 3
      } else {
        comisionPorcentaje = configMetodo.comisionPrimeraEmision ?? 8
      }
    }
    
    // Monto base en MXN (lo que pagaría el cliente sin comisión)
    const montoBaseMxn = cantidadDivisa * tipoCambioBase
    
    // Calcular comisión del método
    const comisionMetodoMonto = (montoBaseMxn * comisionPorcentaje / 100) + configMetodo.comisionFija
    
    // Descuento volumen en MXN
    const descuentoVolumenMonto = aplicaDescuentoVolumen 
      ? cantidadDivisa * (descuentoVolumen.descuentoCentavos / 100)
      : 0
    
    // Total a cobrar al cliente
    const totalCobrarCliente = montoBaseMxn + comisionMetodoMonto
    
    // Tipo de cambio efectivo (lo que realmente paga el cliente por cada dólar)
    const tipoCambioAjustado = totalCobrarCliente / cantidadDivisa
    
    // Calcular rentabilidad
    const costoTotalDivisa = cantidadDivisa * costoAdquisicion
    const gananciaSpread = (tipoCambioBase - costoAdquisicion) * cantidadDivisa
    const gananciaComision = comisionMetodoMonto
    const gananciaTotal = gananciaSpread + gananciaComision - descuentoVolumenMonto
    const rentabilidadPorcentaje = (gananciaTotal / costoTotalDivisa) * 100
    
    // Alertas
    const alertas: string[] = []
    if (cantidadDivisa >= 10000 && configMetodo.requiereIdentificacion) {
      alertas.push('⚠️ Operación requiere reporte SAT (>$10,000 USD)')
    }
    if (cantidadDivisa >= configMetodo.montoRequiereId && configMetodo.requiereIdentificacion) {
      alertas.push('📋 Requiere identificación oficial')
    }
    if (!configMetodo.generaHistorial) {
      alertas.push('🔒 Esta operación NO genera historial fiscal')
    }
    if (aplicaDescuentoVolumen) {
      alertas.push(`💰 Descuento VIP aplicado: ${descuentoVolumen.descripcion}`)
    }
    
    return {
      divisa,
      cantidadDivisa,
      metodoPago,
      esTarjetaNegra: metodoPago === 'tarjeta_negra',
      esRecargaTarjeta,
      tarjetaNegraId,
      
      tipoCambioBase: tcRef.ventaBase,
      tipoCambioAjustado,
      
      montoBaseMxn,
      ajusteTipoCambio: tipoCambioAjustado - tcRef.ventaBase,
      
      comisionMetodoPorcentaje: comisionPorcentaje,
      comisionMetodoMonto,
      
      aplicaDescuentoVolumen,
      descuentoVolumenMonto,
      
      totalCobrarCliente,
      totalEntregarDivisa: cantidadDivisa,
      
      costoAdquisicionDivisa: costoTotalDivisa,
      gananciaSpread,
      gananciaComision,
      gananciaTotal,
      rentabilidadPorcentaje,
      
      generaHistorialFiscal: configMetodo.generaHistorial,
      requiereIdentificacion: configMetodo.requiereIdentificacion && cantidadDivisa >= configMetodo.montoRequiereId,
      alertas,
    }
  }
  
  /**
   * Obtiene el descuento por volumen aplicable
   */
  obtenerDescuentoVolumen(montoUsd: number): ConfigDescuentoVolumen {
    for (const descuento of CONFIG_DESCUENTOS_VOLUMEN) {
      if (montoUsd >= descuento.montoMinimo && montoUsd <= descuento.montoMaximo) {
        return descuento
      }
    }
    return CONFIG_DESCUENTOS_VOLUMEN[0]
  }
  
  /**
   * Compara rentabilidad entre métodos de pago
   */
  compararMetodosPago(divisa: string, cantidadDivisa: number): {
    metodo: MetodoPagoVenta
    config: ConfigComisionMetodo
    calculo: CalculoVentaCliente
  }[] {
    const metodos: MetodoPagoVenta[] = ['efectivo', 'transferencia', 'cripto', 'tarjeta_negra']
    
    return metodos.map(metodo => ({
      metodo,
      config: CONFIG_COMISIONES_METODO[metodo],
      calculo: this.calcularVentaCliente({
        divisa,
        cantidadDivisa,
        metodoPago: metodo,
        esRecargaTarjeta: false,
      }),
    })).sort((a, b) => b.calculo.gananciaTotal - a.calculo.gananciaTotal)
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // GESTIÓN DE TARJETAS NEGRAS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  
  /**
   * Emite una nueva tarjeta negra
   */
  emitirTarjetaNegra(params: {
    clienteId: string
    clienteNombre: string
    montoInicial: number  // Lo que deposita el cliente
    divisa: string
  }): {
    tarjeta: TarjetaNegraCliente
    calculo: CalculoVentaCliente
  } {
    const calculo = this.calcularVentaCliente({
      divisa: params.divisa,
      cantidadDivisa: params.montoInicial,
      metodoPago: 'tarjeta_negra',
      esRecargaTarjeta: false,
    })
    
    // El saldo de la tarjeta es el monto menos la comisión del 8%
    const comision8Porciento = params.montoInicial * 0.08
    const saldoTarjeta = params.montoInicial - comision8Porciento
    
    const tarjetaId = `TN-${Date.now()}`
    const tarjeta: TarjetaNegraCliente = {
      id: tarjetaId,
      clienteId: params.clienteId,
      clienteNombre: params.clienteNombre,
      numeroTarjeta: `****${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      saldoActual: saldoTarjeta,
      saldoInicial: saldoTarjeta,
      comisionPagadaTotal: comision8Porciento,
      esRecarga: true, // A partir de ahora, las recargas son al 3%
      totalRecargas: 0,
      montoTotalRecargado: params.montoInicial,
      estado: 'activa',
      fechaEmision: new Date(),
    }
    
    tarjetasNegrasDB.set(tarjetaId, tarjeta)
    
    return { tarjeta, calculo }
  }
  
  /**
   * Recarga una tarjeta negra existente
   */
  recargarTarjetaNegra(params: {
    tarjetaId: string
    montoRecarga: number
    divisa: string
  }): {
    tarjeta: TarjetaNegraCliente
    calculo: CalculoVentaCliente
  } | null {
    const tarjeta = tarjetasNegrasDB.get(params.tarjetaId)
    if (!tarjeta) return null
    
    const calculo = this.calcularVentaCliente({
      divisa: params.divisa,
      cantidadDivisa: params.montoRecarga,
      metodoPago: 'tarjeta_negra',
      esRecargaTarjeta: true, // Solo 3% de comisión
      tarjetaNegraId: params.tarjetaId,
    })
    
    // El saldo de recarga es el monto menos la comisión del 3%
    const comision3Porciento = params.montoRecarga * 0.03
    const saldoRecarga = params.montoRecarga - comision3Porciento
    
    // Actualizar tarjeta
    tarjeta.saldoActual += saldoRecarga
    tarjeta.comisionPagadaTotal += comision3Porciento
    tarjeta.totalRecargas++
    tarjeta.montoTotalRecargado += params.montoRecarga
    tarjeta.fechaUltimaRecarga = new Date()
    
    tarjetasNegrasDB.set(params.tarjetaId, tarjeta)
    
    return { tarjeta, calculo }
  }
  
  /**
   * Obtiene tarjeta negra por ID
   */
  getTarjetaNegra(tarjetaId: string): TarjetaNegraCliente | null {
    return tarjetasNegrasDB.get(tarjetaId) ?? null
  }
  
  /**
   * Lista tarjetas negras de un cliente
   */
  getTarjetasCliente(clienteId: string): TarjetaNegraCliente[] {
    return Array.from(tarjetasNegrasDB.values())
      .filter(t => t.clienteId === clienteId)
  }
  
  /**
   * Lista todas las tarjetas negras
   */
  getAllTarjetasNegras(): TarjetaNegraCliente[] {
    return Array.from(tarjetasNegrasDB.values())
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // ACTUALIZACIÓN DE TIPOS DE CAMBIO
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  
  /**
   * Actualiza tipo de cambio de referencia
   */
  actualizarTipoCambio(divisa: string, datos: {
    competencia?: number
    nuestroCosto?: number
    ventaBase?: number
  }): boolean {
    const tc = TIPOS_CAMBIO_REFERENCIA[divisa as keyof typeof TIPOS_CAMBIO_REFERENCIA]
    if (!tc) return false
    
    if (datos.competencia !== undefined) tc.competencia = datos.competencia
    if (datos.nuestroCosto !== undefined) tc.nuestroCosto = datos.nuestroCosto
    if (datos.ventaBase !== undefined) tc.ventaBase = datos.ventaBase
    
    return true
  }
  
  /**
   * Obtiene todos los tipos de cambio con rentabilidad estimada
   */
  getTiposCambioConRentabilidad(): Record<string, {
    competencia: number
    nuestroCosto: number
    ventaBase: number
    spreadGanancia: number
    spreadPorcentaje: number
  }> {
    const resultado: Record<string, {
      competencia: number
      nuestroCosto: number
      ventaBase: number
      spreadGanancia: number
      spreadPorcentaje: number
    }> = {}
    
    for (const [divisa, tc] of Object.entries(TIPOS_CAMBIO_REFERENCIA)) {
      resultado[divisa] = {
        ...tc,
        spreadGanancia: tc.ventaBase - tc.nuestroCosto,
        spreadPorcentaje: ((tc.ventaBase - tc.nuestroCosto) / tc.nuestroCosto) * 100,
      }
    }
    
    return resultado
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // REPORTES DE RENTABILIDAD
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  
  /**
   * Simula rentabilidad para diferentes escenarios
   */
  simularRentabilidad(divisa: string, montos: number[]): {
    monto: number
    porMetodo: Record<MetodoPagoVenta, {
      totalCliente: number
      gananciaTotal: number
      rentabilidadPct: number
    }>
  }[] {
    return montos.map(monto => {
      const porMetodo: Record<MetodoPagoVenta, { totalCliente: number; gananciaTotal: number; rentabilidadPct: number }> = {
        efectivo: { totalCliente: 0, gananciaTotal: 0, rentabilidadPct: 0 },
        transferencia: { totalCliente: 0, gananciaTotal: 0, rentabilidadPct: 0 },
        cripto: { totalCliente: 0, gananciaTotal: 0, rentabilidadPct: 0 },
        tarjeta_negra: { totalCliente: 0, gananciaTotal: 0, rentabilidadPct: 0 },
      }
      
      for (const metodo of Object.keys(porMetodo) as MetodoPagoVenta[]) {
        const calculo = this.calcularVentaCliente({
          divisa,
          cantidadDivisa: monto,
          metodoPago: metodo,
          esRecargaTarjeta: false,
        })
        
        porMetodo[metodo] = {
          totalCliente: calculo.totalCobrarCliente,
          gananciaTotal: calculo.gananciaTotal,
          rentabilidadPct: calculo.rentabilidadPorcentaje,
        }
      }
      
      return { monto, porMetodo }
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const profitRentabilidadService = new ProfitRentabilidadService()
export { ProfitRentabilidadService }
