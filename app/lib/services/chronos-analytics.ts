/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 - SISTEMA DE ANÁLISIS FINANCIERO AVANZADO
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Funciones de cálculo y análisis para gestión financiera completa:
 * - Métricas de rendimiento por OC
 * - Análisis de clientes y distribuidores
 * - KPIs financieros globales
 * - Alertas y recomendaciones
 *
 * @author CHRONOS Team
 * @version 2026.1
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS DE ANÁLISIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Métricas completas de una Orden de Compra
 * Incluye todo lo necesario para análisis visual y gestión
 */
export interface OCMetricas {
  // === IDENTIFICACIÓN ===
  ocId: string
  numeroOrden: string
  distribuidorId: string
  distribuidorNombre: string
  fechaCreacion: Date

  // === STOCK (en piezas) ===
  stockInicial: number // Cantidad original comprada
  stockActual: number // Stock disponible
  stockVendido: number // stockInicial - stockActual
  porcentajeVendido: number // (stockVendido / stockInicial) × 100

  // === COSTOS (dinero pagado/debido al distribuidor) ===
  costoTotal: number // Costo total de la OC
  costoUnitario: number // Precio por unidad (incluye flete)
  montoPagadoDistribuidor: number // Cuánto se ha pagado
  montoDeudaDistribuidor: number // Cuánto se debe todavía
  porcentajePagado: number // (montoPagado / costoTotal) × 100

  // === VENTAS (ingresos generados por esta OC) ===
  totalVentas: number // Dinero generado por ventas de esta OC
  piezasVendidas: number // Cantidad de unidades vendidas
  precioVentaPromedio: number // Precio promedio de venta por unidad
  ingresoPorPieza: number // totalVentas / piezasVendidas

  // === GANANCIAS ===
  gananciaTotal: number // totalVentas - costoTotal
  gananciaPorPieza: number // gananciaTotal / piezasVendidas
  gananciaRealizada: number // Ganancia de stock vendido
  gananciaPotencial: number // Ganancia de stock restante (estimada)
  margenBruto: number // (gananciaTotal / totalVentas) × 100
  margenSobreCosto: number // (gananciaTotal / costoTotal) × 100

  // === COBROS A CLIENTES (de ventas de esta OC) ===
  montoCobrado: number // Dinero cobrado de ventas de esta OC
  montoSinCobrar: number // Dinero pendiente de clientes
  porcentajeCobrado: number // (montoCobrado / totalVentas) × 100

  // === FLUJO DE EFECTIVO ===
  efectivoNeto: number // montoCobrado - montoPagadoDistribuidor
  roi: number // (gananciaRealizada / montoPagadoDistribuidor) × 100
  roiProyectado: number // (gananciaPotencial / costoTotal) × 100

  // === ESTADOS ===
  estadoPago: 'pendiente' | 'parcial' | 'completo'
  estadoStock: 'disponible' | 'bajo' | 'agotado'
  estadoRentabilidad: 'excelente' | 'buena' | 'regular' | 'mala'

  // === TIEMPOS ===
  diasDesdeCompra: number // Días desde la creación
  diasEstimadosAgotamiento: number // Estimación de cuándo se agota
  velocidadVenta: number // Piezas vendidas por día

  // === ALERTAS ===
  alertas: string[] // Lista de alertas/observaciones
}

/**
 * Métricas completas de una Venta
 */
export interface VentaMetricas {
  // === IDENTIFICACIÓN ===
  ventaId: string
  clienteId: string
  clienteNombre: string
  fecha: Date

  // === PRODUCTOS ===
  cantidad: number
  precioVentaUnidad: number
  precioCompraUnidad: number
  precioFleteUnidad: number

  // === TOTALES ===
  totalVenta: number // precioVentaUnidad × cantidad
  totalCosto: number // precioCompraUnidad × cantidad
  totalFlete: number // precioFleteUnidad × cantidad

  // === DISTRIBUCIÓN GYA ===
  montoBovedaMonte: number // Costo → Bóveda Monte
  montoFletes: number // Flete → Flete Sur
  montoUtilidades: number // Ganancia → Utilidades

  // === PAGOS ===
  montoPagado: number
  montoRestante: number
  porcentajePagado: number
  estadoPago: 'pendiente' | 'parcial' | 'completo'

  // === RENTABILIDAD ===
  gananciaTotal: number // totalVenta - totalCosto - totalFlete
  margenBruto: number // (ganancia / totalVenta) × 100
  margenSobreCosto: number // (ganancia / totalCosto) × 100
  gananciaPorUnidad: number

  // === CRÉDITO ===
  diasDeCredito: number // Días desde venta hasta hoy (si no está pagada)
  esMoroso: boolean // Más de 30 días sin pagar

  // === TRAZABILIDAD ===
  origenLotes: { ocId: string; cantidad: number }[]
}

/**
 * Métricas completas de un Cliente
 */
export interface ClienteMetricas {
  // === IDENTIFICACIÓN ===
  clienteId: string
  nombre: string
  estado: 'activo' | 'inactivo' | 'suspendido'

  // === HISTORIAL DE COMPRAS ===
  totalCompras: number // Suma histórica de todas las compras
  numeroVentas: number // Cantidad de transacciones
  promedioCompra: number // totalCompras / numeroVentas
  ultimaCompra: Date | null // Fecha de última compra
  diasSinComprar: number // Días desde última compra

  // === PAGOS ===
  totalPagado: number // Suma de todos los pagos
  totalAbonos: number // Cantidad de abonos realizados
  promedioAbono: number // totalPagado / totalAbonos

  // === DEUDAS ===
  deudaActual: number // Suma de montoRestante de ventas activas
  deudaMaximaHistorica: number // Mayor deuda que ha tenido
  ventasPendientes: number // Cantidad de ventas sin pagar completamente

  // === COMPORTAMIENTO ===
  porcentajePagoPuntual: number // % de ventas pagadas en menos de 30 días
  diasPromedioCredito: number // Promedio de días que tarda en pagar
  frecuenciaCompra: number // Compras por mes (últimos 6 meses)

  // === RENTABILIDAD ===
  gananciaGenerada: number // Suma de utilidades de sus compras
  ticketPromedio: number // Promedio de monto por compra
  valorVidaCliente: number // LTV: totalCompras - costos

  // === SCORING ===
  scoreCredito: number // 0-100: Qué tan confiable es para dar crédito
  scoreFrecuencia: number // 0-100: Qué tan frecuente compra
  scoreRentabilidad: number // 0-100: Qué tan rentable es
  scoreTotal: number // Promedio ponderado

  // === CATEGORIZACIÓN ===
  categoria: 'VIP' | 'frecuente' | 'ocasional' | 'nuevo' | 'inactivo' | 'moroso'
  limiteCredito: number // Crédito máximo sugerido

  // === ALERTAS ===
  alertas: string[]
}

/**
 * Métricas completas de un Distribuidor
 */
export interface DistribuidorMetricas {
  // === IDENTIFICACIÓN ===
  distribuidorId: string
  nombre: string
  empresa: string | null
  estado: 'activo' | 'inactivo'

  // === HISTORIAL DE COMPRAS ===
  totalOrdenesCompra: number // Suma histórica de todas las OC
  numeroOrdenes: number // Cantidad de OC
  promedioOrden: number // totalOC / numeroOrdenes
  ultimaOrden: Date | null // Fecha de última OC
  diasSinOrdenar: number // Días desde última orden

  // === PAGOS ===
  totalPagado: number // Suma de todos los pagos
  numeroPagos: number // Cantidad de pagos realizados
  promedioPago: number // totalPagado / numeroPagos

  // === DEUDAS ===
  deudaActual: number // Suma de montoRestante de OC activas
  deudaMaximaHistorica: number // Mayor deuda que hemos tenido con él
  ordenesConDeuda: number // Cantidad de OC sin pagar completamente

  // === STOCK ===
  stockTotal: number // Stock actual de sus OC
  stockVendido: number // Total vendido de sus OC
  porcentajeStockVendido: number // % de lo comprado que se ha vendido

  // === RENTABILIDAD ===
  ventasGeneradas: number // Total vendido de productos de este distribuidor
  gananciaGenerada: number // Utilidades de productos de este distribuidor
  margenPromedio: number // Margen promedio de sus productos

  // === TIEMPOS ===
  tiempoPromedioEntrega: number // Días promedio de entrega (si aplica)
  confiabilidad: number // 0-100: Entregas a tiempo / Total entregas

  // === SCORING ===
  scoreCalidad: number // 0-100: Calidad de productos
  scorePrecio: number // 0-100: Competitividad de precios
  scoreRelacion: number // 0-100: Relación costo-beneficio
  scoreTotal: number // Promedio ponderado

  // === CATEGORIZACIÓN ===
  categoria: 'estrategico' | 'preferido' | 'normal' | 'ocasional' | 'nuevo'

  // === ALERTAS ===
  alertas: string[]
}

/**
 * KPIs Globales del Sistema
 */
export interface KPIsGlobales {
  // === RESUMEN FINANCIERO ===
  capitalTotal: number // Suma de capital de todos los bancos
  liquidezDisponible: number // Capital que se puede usar ahora
  deudaClientes: number // Lo que nos deben los clientes
  deudaDistribuidores: number // Lo que debemos a distribuidores
  patrimonioNeto: number // capitalTotal + deudaClientes - deudaDistribuidores

  // === VENTAS ===
  ventasHoy: number
  ventasSemana: number
  ventasMes: number
  ventasAnio: number
  promedioVentaDiaria: number

  // === GANANCIAS ===
  gananciaHoy: number
  gananciaSemana: number
  gananciaMes: number
  gananciaAnio: number
  margenPromedioGlobal: number

  // === STOCK ===
  stockTotalPiezas: number
  stockTotalValorCosto: number // Valor del stock a precio de costo
  stockTotalValorVenta: number // Valor del stock a precio de venta
  gananciaPotencialStock: number // stockValorVenta - stockValorCosto

  // === EFICIENCIA ===
  rotacionInventario: number // Ventas / Stock promedio
  diasInventario: number // 365 / rotacionInventario
  cobranza: number // % de ventas cobradas
  puntualidadPagos: number // % de pagos a tiempo a distribuidores

  // === TENDENCIAS ===
  tendenciaVentas: 'subiendo' | 'estable' | 'bajando'
  tendenciaGanancias: 'subiendo' | 'estable' | 'bajando'
  tendenciaLiquidez: 'subiendo' | 'estable' | 'bajando'

  // === SALUD FINANCIERA ===
  indiceSaludFinanciera: number // 0-100
  riesgoLiquidez: 'bajo' | 'medio' | 'alto'
  riesgoCredito: 'bajo' | 'medio' | 'alto'

  // === ALERTAS CRÍTICAS ===
  alertas: {
    tipo: 'critica' | 'advertencia' | 'info'
    mensaje: string
    accion?: string
  }[]
}

/**
 * Análisis de un Banco individual
 */
export interface BancoMetricas {
  bancoId: string
  nombre: string
  tipo: string

  // === CAPITAL ===
  capitalActual: number
  capitalInicial: number // Para comparación
  variacionCapital: number // capitalActual - capitalInicial
  porcentajeVariacion: number

  // === HISTÓRICO ===
  historicoIngresos: number
  historicoGastos: number
  balanceHistorico: number // ingresos - gastos

  // === MOVIMIENTOS ===
  totalMovimientos: number
  ingresosHoy: number
  gastosHoy: number
  ingresosMes: number
  gastosMes: number

  // === FLUJO ===
  flujoNetoHoy: number // ingresosHoy - gastosHoy
  flujoNetoMes: number // ingresosMes - gastosMes
  tendenciaFlujo: 'positivo' | 'neutro' | 'negativo'

  // === PROYECCIONES ===
  proyeccionMesSiguiente: number
  diasHastaAgotamiento: number | null // null si es positivo
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIONES DE CÁLCULO - ÓRDENES DE COMPRA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calcula métricas completas de una Orden de Compra
 */
export function calcularOCMetricas(
  oc: {
    id: string
    numeroOrden?: string | null
    distribuidorId: string
    distribuidorNombre?: string
    fecha: Date
    cantidad: number
    stockActual: number
    precioUnitario: number
    fleteUnitario?: number | null
    total: number
    montoPagado?: number | null
    montoRestante?: number | null
    estado?: string | null
  },
  ventasDeOC: {
    cantidad: number
    precioTotalVenta: number
    montoPagado?: number | null
  }[] = [],
): OCMetricas {
  const now = new Date()
  const diasDesdeCompra = Math.floor((now.getTime() - oc.fecha.getTime()) / (1000 * 60 * 60 * 24))

  const stockInicial = oc.cantidad
  const stockActual = oc.stockActual ?? 0
  const stockVendido = stockInicial - stockActual
  const porcentajeVendido = stockInicial > 0 ? (stockVendido / stockInicial) * 100 : 0

  const costoTotal = oc.total
  const costoUnitario = oc.precioUnitario + (oc.fleteUnitario ?? 0)
  const montoPagadoDistribuidor = oc.montoPagado ?? 0
  const montoDeudaDistribuidor = oc.montoRestante ?? costoTotal - montoPagadoDistribuidor
  const porcentajePagado = costoTotal > 0 ? (montoPagadoDistribuidor / costoTotal) * 100 : 0

  const totalVentas = ventasDeOC.reduce((sum, v) => sum + v.precioTotalVenta, 0)
  const piezasVendidas = ventasDeOC.reduce((sum, v) => sum + v.cantidad, 0)
  const precioVentaPromedio = piezasVendidas > 0 ? totalVentas / piezasVendidas : 0
  const ingresoPorPieza = piezasVendidas > 0 ? totalVentas / piezasVendidas : 0

  const gananciaTotal = totalVentas - costoTotal
  const gananciaPorPieza =
    piezasVendidas > 0 ? (totalVentas - costoUnitario * piezasVendidas) / piezasVendidas : 0
  const costoStockVendido = costoUnitario * stockVendido
  const gananciaRealizada = totalVentas - costoStockVendido
  const gananciaPotencial =
    stockActual > 0 ? (precioVentaPromedio - costoUnitario) * stockActual : 0
  const margenBruto = totalVentas > 0 ? (gananciaTotal / totalVentas) * 100 : 0
  const margenSobreCosto = costoTotal > 0 ? (gananciaTotal / costoTotal) * 100 : 0

  const montoCobrado = ventasDeOC.reduce((sum, v) => sum + (v.montoPagado ?? 0), 0)
  const montoSinCobrar = totalVentas - montoCobrado
  const porcentajeCobrado = totalVentas > 0 ? (montoCobrado / totalVentas) * 100 : 0

  const efectivoNeto = montoCobrado - montoPagadoDistribuidor
  const roi = montoPagadoDistribuidor > 0 ? (gananciaRealizada / montoPagadoDistribuidor) * 100 : 0
  const roiProyectado =
    costoTotal > 0 ? ((gananciaRealizada + gananciaPotencial) / costoTotal) * 100 : 0

  const velocidadVenta = diasDesdeCompra > 0 ? stockVendido / diasDesdeCompra : 0
  const diasEstimadosAgotamiento = velocidadVenta > 0 ? stockActual / velocidadVenta : Infinity

  // Estados
  let estadoPago: 'pendiente' | 'parcial' | 'completo' = 'pendiente'
  if (porcentajePagado >= 99.9) estadoPago = 'completo'
  else if (porcentajePagado > 0) estadoPago = 'parcial'

  let estadoStock: 'disponible' | 'bajo' | 'agotado' = 'disponible'
  if (stockActual <= 0) estadoStock = 'agotado'
  else if (porcentajeVendido >= 80) estadoStock = 'bajo'

  let estadoRentabilidad: 'excelente' | 'buena' | 'regular' | 'mala' = 'regular'
  if (margenSobreCosto >= 50) estadoRentabilidad = 'excelente'
  else if (margenSobreCosto >= 30) estadoRentabilidad = 'buena'
  else if (margenSobreCosto >= 10) estadoRentabilidad = 'regular'
  else estadoRentabilidad = 'mala'

  // Alertas
  const alertas: string[] = []
  if (estadoStock === 'bajo') alertas.push('⚠️ Stock bajo - considerar reorden')
  if (estadoStock === 'agotado') alertas.push('🔴 Stock agotado')
  if (estadoPago === 'pendiente' && diasDesdeCompra > 30) {
    alertas.push('⚠️ Deuda pendiente > 30 días')
  }
  if (margenSobreCosto < 15) alertas.push('⚠️ Margen bajo - revisar precios')
  if (porcentajeCobrado < 50 && piezasVendidas > 0) alertas.push('⚠️ Bajo cobro de ventas')
  if (efectivoNeto < 0) alertas.push('🔴 Flujo de efectivo negativo')

  return {
    ocId: oc.id,
    numeroOrden: oc.numeroOrden ?? oc.id,
    distribuidorId: oc.distribuidorId,
    distribuidorNombre: oc.distribuidorNombre ?? 'Desconocido',
    fechaCreacion: oc.fecha,
    stockInicial,
    stockActual,
    stockVendido,
    porcentajeVendido,
    costoTotal,
    costoUnitario,
    montoPagadoDistribuidor,
    montoDeudaDistribuidor,
    porcentajePagado,
    totalVentas,
    piezasVendidas,
    precioVentaPromedio,
    ingresoPorPieza,
    gananciaTotal,
    gananciaPorPieza,
    gananciaRealizada,
    gananciaPotencial,
    margenBruto,
    margenSobreCosto,
    montoCobrado,
    montoSinCobrar,
    porcentajeCobrado,
    efectivoNeto,
    roi,
    roiProyectado,
    estadoPago,
    estadoStock,
    estadoRentabilidad,
    diasDesdeCompra,
    diasEstimadosAgotamiento:
      diasEstimadosAgotamiento === Infinity ? -1 : Math.ceil(diasEstimadosAgotamiento),
    velocidadVenta,
    alertas,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIONES DE CÁLCULO - CLIENTES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calcula el score de crédito de un cliente (0-100)
 */
export function calcularScoreCredito(
  porcentajePagoPuntual: number,
  diasPromedioCredito: number,
  deudaActual: number,
  limiteCredito: number,
): number {
  // Puntualidad (40%)
  const scorePuntualidad = Math.min(porcentajePagoPuntual, 100) * 0.4

  // Días de crédito (30%) - Menos días = mejor score
  let scoreDias = 0
  if (diasPromedioCredito <= 7) scoreDias = 30
  else if (diasPromedioCredito <= 15) scoreDias = 25
  else if (diasPromedioCredito <= 30) scoreDias = 20
  else if (diasPromedioCredito <= 45) scoreDias = 10
  else scoreDias = 0

  // Utilización de crédito (30%) - Menos uso = mejor score
  let scoreUtilizacion = 30
  if (limiteCredito > 0) {
    const utilizacion = (deudaActual / limiteCredito) * 100
    if (utilizacion > 90) scoreUtilizacion = 0
    else if (utilizacion > 75) scoreUtilizacion = 10
    else if (utilizacion > 50) scoreUtilizacion = 20
    else scoreUtilizacion = 30
  }

  return Math.round(scorePuntualidad + scoreDias + scoreUtilizacion)
}

/**
 * Categoriza al cliente según su comportamiento
 */
export function categorizarCliente(
  scoreTotal: number,
  numeroVentas: number,
  diasSinComprar: number,
  deudaActual: number,
  diasPromedioCredito: number,
): 'VIP' | 'frecuente' | 'ocasional' | 'nuevo' | 'inactivo' | 'moroso' {
  // Moroso: deuda y muchos días sin pagar
  if (deudaActual > 0 && diasPromedioCredito > 45) return 'moroso'

  // Inactivo: más de 90 días sin comprar
  if (diasSinComprar > 90) return 'inactivo'

  // Nuevo: menos de 3 compras
  if (numeroVentas < 3) return 'nuevo'

  // VIP: alto score y frecuente
  if (scoreTotal >= 85 && numeroVentas >= 10) return 'VIP'

  // Frecuente: compra regularmente
  if (numeroVentas >= 5 && diasSinComprar <= 30) return 'frecuente'

  // Ocasional: el resto
  return 'ocasional'
}

/**
 * Calcula el límite de crédito sugerido
 */
export function calcularLimiteCredito(
  promedioCompra: number,
  scoreCredito: number,
  gananciaGenerada: number,
): number {
  // Base: 2x el promedio de compra
  let limite = promedioCompra * 2

  // Ajustar por score
  if (scoreCredito >= 80) limite *= 1.5
  else if (scoreCredito >= 60) limite *= 1.2
  else if (scoreCredito < 40) limite *= 0.5

  // Ajustar por rentabilidad
  if (gananciaGenerada > promedioCompra) limite *= 1.3

  // Redondear a miles
  return Math.round(limite / 1000) * 1000
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIONES DE CÁLCULO - DISTRIBUIDORES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Categoriza al distribuidor según su relación comercial
 */
export function categorizarDistribuidor(
  numeroOrdenes: number,
  totalOrdenesCompra: number,
  gananciaGenerada: number,
  margenPromedio: number,
): 'estrategico' | 'preferido' | 'normal' | 'ocasional' | 'nuevo' {
  // Nuevo: menos de 2 órdenes
  if (numeroOrdenes < 2) return 'nuevo'

  // Estratégico: alto volumen + alta rentabilidad
  if (totalOrdenesCompra > 100000 && margenPromedio >= 30) return 'estrategico'

  // Preferido: buen volumen o buena rentabilidad
  if (totalOrdenesCompra > 50000 || margenPromedio >= 40) return 'preferido'

  // Normal: volumen moderado
  if (numeroOrdenes >= 3) return 'normal'

  // Ocasional: poco volumen
  return 'ocasional'
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIONES DE CÁLCULO - KPIs GLOBALES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calcula el índice de salud financiera (0-100)
 */
export function calcularIndiceSaludFinanciera(
  capitalTotal: number,
  deudaClientes: number,
  deudaDistribuidores: number,
  cobranza: number,
  margenPromedio: number,
): number {
  // Liquidez (25%)
  const patrimonioNeto = capitalTotal + deudaClientes - deudaDistribuidores
  let scoreLiquidez = 0
  if (capitalTotal > deudaDistribuidores * 1.5) scoreLiquidez = 25
  else if (capitalTotal > deudaDistribuidores) scoreLiquidez = 20
  else if (capitalTotal > deudaDistribuidores * 0.5) scoreLiquidez = 10
  else scoreLiquidez = 0

  // Cobranza (25%)
  const scoreCobranza = Math.min(cobranza, 100) * 0.25

  // Margen (25%)
  let scoreMargen = 0
  if (margenPromedio >= 40) scoreMargen = 25
  else if (margenPromedio >= 30) scoreMargen = 20
  else if (margenPromedio >= 20) scoreMargen = 15
  else if (margenPromedio >= 10) scoreMargen = 10
  else scoreMargen = 5

  // Patrimonio (25%)
  let scorePatrimonio = 0
  if (patrimonioNeto > 0) scorePatrimonio = Math.min(25, (patrimonioNeto / capitalTotal) * 25)

  return Math.round(scoreLiquidez + scoreCobranza + scoreMargen + scorePatrimonio)
}

/**
 * Determina el nivel de riesgo de liquidez
 */
export function evaluarRiesgoLiquidez(
  capitalTotal: number,
  deudaDistribuidores: number,
  gastosMes: number,
): 'bajo' | 'medio' | 'alto' {
  const mesesCobertura = gastosMes > 0 ? capitalTotal / gastosMes : Infinity
  const ratioDeuda = capitalTotal > 0 ? deudaDistribuidores / capitalTotal : Infinity

  if (mesesCobertura >= 3 && ratioDeuda < 0.5) return 'bajo'
  if (mesesCobertura >= 1 && ratioDeuda < 1) return 'medio'
  return 'alto'
}

/**
 * Determina el nivel de riesgo de crédito
 */
export function evaluarRiesgoCredito(
  deudaClientes: number,
  ventasMes: number,
  porcentajeCobranza: number,
): 'bajo' | 'medio' | 'alto' {
  const ratioDeuda = ventasMes > 0 ? deudaClientes / ventasMes : 0

  if (porcentajeCobranza >= 80 && ratioDeuda < 1) return 'bajo'
  if (porcentajeCobranza >= 60 && ratioDeuda < 2) return 'medio'
  return 'alto'
}

/**
 * Determina la tendencia basada en comparación de períodos
 */
export function determinarTendencia(
  valorActual: number,
  valorAnterior: number,
): 'subiendo' | 'estable' | 'bajando' {
  if (valorAnterior === 0) return 'estable'
  const variacion = ((valorActual - valorAnterior) / valorAnterior) * 100

  if (variacion > 5) return 'subiendo'
  if (variacion < -5) return 'bajando'
  return 'estable'
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENERADORES DE ALERTAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Genera alertas críticas del sistema
 */
export function generarAlertasSistema(kpis: {
  capitalTotal: number
  deudaDistribuidores: number
  deudaClientes: number
  cobranza: number
  stockTotalPiezas: number
  indiceSaludFinanciera: number
}): { tipo: 'critica' | 'advertencia' | 'info'; mensaje: string; accion?: string }[] {
  const alertas: { tipo: 'critica' | 'advertencia' | 'info'; mensaje: string; accion?: string }[] =
    []

  // Críticas
  if (kpis.capitalTotal < kpis.deudaDistribuidores) {
    alertas.push({
      tipo: 'critica',
      mensaje: '🔴 Capital insuficiente para cubrir deudas con distribuidores',
      accion: 'Priorizar cobros a clientes o pausar compras',
    })
  }

  if (kpis.indiceSaludFinanciera < 30) {
    alertas.push({
      tipo: 'critica',
      mensaje: '🔴 Salud financiera crítica',
      accion: 'Revisar urgentemente flujo de efectivo',
    })
  }

  // Advertencias
  if (kpis.cobranza < 60) {
    alertas.push({
      tipo: 'advertencia',
      mensaje: '⚠️ Cobranza baja: ' + kpis.cobranza.toFixed(0) + '%',
      accion: 'Contactar clientes con deudas pendientes',
    })
  }

  if (kpis.stockTotalPiezas < 50) {
    alertas.push({
      tipo: 'advertencia',
      mensaje: '⚠️ Stock total bajo: ' + kpis.stockTotalPiezas + ' piezas',
      accion: 'Considerar reorden de inventario',
    })
  }

  if (kpis.deudaClientes > kpis.capitalTotal * 2) {
    alertas.push({
      tipo: 'advertencia',
      mensaje: '⚠️ Deuda de clientes muy alta respecto al capital',
      accion: 'Revisar política de crédito',
    })
  }

  // Info
  if (kpis.indiceSaludFinanciera >= 80) {
    alertas.push({
      tipo: 'info',
      mensaje: '✅ Excelente salud financiera',
    })
  }

  return alertas
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILIDADES DE FORMATEO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Formatea un número como moneda MXN
 */
export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

/**
 * Formatea un porcentaje
 */
export function formatearPorcentaje(valor: number): string {
  return valor.toFixed(1) + '%'
}

/**
 * Calcula días entre dos fechas
 */
export function diasEntre(fecha1: Date, fecha2: Date): number {
  return Math.floor((fecha2.getTime() - fecha1.getTime()) / (1000 * 60 * 60 * 24))
}
