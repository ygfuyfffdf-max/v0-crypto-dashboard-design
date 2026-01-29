/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🏛️ CHRONOS INFINITY 2030 — 30+ MÉTRICAS FINANCIERAS AVANZADAS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de KPIs financieros en tiempo real
 * Basado en los documentos de lógica del sistema
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { Banco, Venta, OrdenCompra, Cliente, Distribuidor } from '@/app/types'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export interface MetricaFinanciera {
  id: string
  nombre: string
  nombreCorto: string
  valor: number
  valorFormateado: string
  unidad: '%' | '$' | 'unidades' | 'días' | 'ratio' | 'veces'
  categoria: 'liquidez' | 'rentabilidad' | 'operativo' | 'deuda' | 'eficiencia' | 'crecimiento'
  tendencia: 'up' | 'down' | 'stable'
  variacion?: number
  descripcion: string
  colorPositivo: boolean // true si mayor es mejor
  umbralAlerta?: number
  umbralCritico?: number
}

export interface ResumenFinanciero {
  // Capital
  capitalTotal: number
  capitalDisponible: number
  capitalBloqueado: number

  // Ingresos/Gastos
  ingresosTotales: number
  gastosTotales: number
  utilidadNeta: number

  // Cuentas
  cuentasPorCobrar: number
  cuentasPorPagar: number
  balanceNeto: number

  // Stock
  stockTotal: number
  valorInventario: number

  // Métricas avanzadas
  metricas: MetricaFinanciera[]
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIONES DE CÁLCULO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula el capital total de todos los bancos
 */
export function calcularCapitalTotal(bancos: Record<string, Banco>): number {
  return Object.values(bancos).reduce((acc, banco) => acc + (banco.capitalActual || 0), 0)
}

/**
 * Calcula el histórico de ingresos total
 */
export function calcularIngresosHistoricos(bancos: Record<string, Banco>): number {
  return Object.values(bancos).reduce((acc, banco) => acc + (banco.historicoIngresos || 0), 0)
}

/**
 * Calcula el histórico de gastos total
 */
export function calcularGastosHistoricos(bancos: Record<string, Banco>): number {
  return Object.values(bancos).reduce((acc, banco) => acc + (banco.historicoGastos || 0), 0)
}

/**
 * Calcula total de cuentas por cobrar (deuda de clientes)
 */
export function calcularCuentasPorCobrar(ventas: Venta[]): number {
  return ventas.reduce((acc, venta) => acc + (venta.montoRestante || 0), 0)
}

/**
 * Calcula total de cuentas por pagar (deuda a distribuidores)
 */
export function calcularCuentasPorPagar(ordenesCompra: OrdenCompra[]): number {
  return ordenesCompra.reduce((acc, oc) => acc + (oc.deuda || 0), 0)
}

/**
 * Calcula stock total en almacén
 */
export function calcularStockTotal(ordenesCompra: OrdenCompra[]): number {
  return ordenesCompra.reduce((acc, oc) => acc + (oc.stockActual || 0), 0)
}

/**
 * Calcula valor del inventario al costo
 */
export function calcularValorInventario(ordenesCompra: OrdenCompra[]): number {
  return ordenesCompra.reduce((acc, oc) => {
    const stock = oc.stockActual || 0
    const costo = oc.costoPorUnidad || 0
    return acc + stock * costo
  }, 0)
}

// ═══════════════════════════════════════════════════════════════════════════
// 30+ MÉTRICAS FINANCIERAS
// ═══════════════════════════════════════════════════════════════════════════

export function calcular30Metricas(datos: {
  bancos: Record<string, Banco>
  ventas: Venta[]
  ordenesCompra: OrdenCompra[]
  clientes: Cliente[]
  distribuidores: Distribuidor[]
}): MetricaFinanciera[] {
  const { bancos, ventas, ordenesCompra, clientes, distribuidores } = datos

  // Cálculos base
  const capitalTotal = calcularCapitalTotal(bancos)
  const ingresosHistoricos = calcularIngresosHistoricos(bancos)
  const gastosHistoricos = calcularGastosHistoricos(bancos)
  const cuentasPorCobrar = calcularCuentasPorCobrar(ventas)
  const cuentasPorPagar = calcularCuentasPorPagar(ordenesCompra)
  const stockTotal = calcularStockTotal(ordenesCompra)
  const valorInventario = calcularValorInventario(ordenesCompra)

  // Ventas
  const ventasTotales = ventas.reduce(
    (acc, v) => acc + (v.totalVenta || v.precioTotalVenta || 0),
    0,
  )
  const ventasCompletadas = ventas.filter((v) => v.estadoPago === 'completo')
  const ventasPendientes = ventas.filter((v) => v.estadoPago === 'pendiente')
  const ventasParciales = ventas.filter((v) => v.estadoPago === 'parcial')

  // Utilidades
  const utilidadesTotales = ventas.reduce((acc, v) => acc + (v.utilidad || v.ganancia || 0), 0)

  // Clientes
  const clientesActivos = clientes.filter((c) => c.estado === 'activo').length
  const clientesConDeuda = clientes.filter((c) => (c.deudaTotal || 0) > 0).length

  // Helper para formatear
  const formatMoney = (n: number) => {
    if (Math.abs(n) >= 1000000) return `$${(n / 1000000).toFixed(2)}M`
    if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}K`
    return `$${n.toFixed(0)}`
  }

  const formatPercent = (n: number) => `${n.toFixed(1)}%`

  const metricas: MetricaFinanciera[] = [
    // ═══════════════════════════════════════════════════════════════
    // LIQUIDEZ (1-6)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'capital_total',
      nombre: 'Capital Total',
      nombreCorto: 'Capital',
      valor: capitalTotal,
      valorFormateado: formatMoney(capitalTotal),
      unidad: '$',
      categoria: 'liquidez',
      tendencia: 'stable',
      descripcion: 'Suma del capital actual de los 7 bancos',
      colorPositivo: true,
    },
    {
      id: 'liquidez_neta',
      nombre: 'Liquidez Neta',
      nombreCorto: 'Liquidez',
      valor: capitalTotal - cuentasPorPagar,
      valorFormateado: formatMoney(capitalTotal - cuentasPorPagar),
      unidad: '$',
      categoria: 'liquidez',
      tendencia: capitalTotal > cuentasPorPagar ? 'up' : 'down',
      descripcion: 'Capital disponible después de pagar deudas',
      colorPositivo: true,
      umbralAlerta: 0,
      umbralCritico: -50000,
    },
    {
      id: 'ratio_liquidez',
      nombre: 'Ratio de Liquidez',
      nombreCorto: 'R. Liquidez',
      valor: cuentasPorPagar > 0 ? capitalTotal / cuentasPorPagar : 999,
      valorFormateado:
        cuentasPorPagar > 0 ? `${(capitalTotal / cuentasPorPagar).toFixed(2)}x` : '∞',
      unidad: 'veces',
      categoria: 'liquidez',
      tendencia: capitalTotal / (cuentasPorPagar || 1) > 1.5 ? 'up' : 'down',
      descripcion: 'Capital / Deuda a proveedores (>1.5 es saludable)',
      colorPositivo: true,
      umbralAlerta: 1.0,
      umbralCritico: 0.5,
    },
    {
      id: 'capital_trabajo',
      nombre: 'Capital de Trabajo',
      nombreCorto: 'Cap. Trabajo',
      valor: capitalTotal + cuentasPorCobrar - cuentasPorPagar,
      valorFormateado: formatMoney(capitalTotal + cuentasPorCobrar - cuentasPorPagar),
      unidad: '$',
      categoria: 'liquidez',
      tendencia: 'stable',
      descripcion: 'Capital + Cuentas por cobrar - Cuentas por pagar',
      colorPositivo: true,
    },
    {
      id: 'efectivo_rapido',
      nombre: 'Efectivo Rápido',
      nombreCorto: 'Efectivo',
      valor: capitalTotal,
      valorFormateado: formatMoney(capitalTotal),
      unidad: '$',
      categoria: 'liquidez',
      tendencia: 'stable',
      descripcion: 'Efectivo disponible inmediatamente',
      colorPositivo: true,
    },
    {
      id: 'cobertura_deuda',
      nombre: 'Cobertura de Deuda',
      nombreCorto: 'Cobertura',
      valor: cuentasPorPagar > 0 ? (capitalTotal / cuentasPorPagar) * 100 : 100,
      valorFormateado: formatPercent(
        cuentasPorPagar > 0 ? (capitalTotal / cuentasPorPagar) * 100 : 100,
      ),
      unidad: '%',
      categoria: 'liquidez',
      tendencia: capitalTotal >= cuentasPorPagar ? 'up' : 'down',
      descripcion: 'Capacidad de cubrir deudas con capital actual',
      colorPositivo: true,
    },

    // ═══════════════════════════════════════════════════════════════
    // RENTABILIDAD (7-12)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'utilidad_neta',
      nombre: 'Utilidad Neta',
      nombreCorto: 'Utilidad',
      valor: utilidadesTotales,
      valorFormateado: formatMoney(utilidadesTotales),
      unidad: '$',
      categoria: 'rentabilidad',
      tendencia: utilidadesTotales > 0 ? 'up' : 'down',
      descripcion: 'Suma de utilidades de todas las ventas',
      colorPositivo: true,
    },
    {
      id: 'margen_utilidad',
      nombre: 'Margen de Utilidad',
      nombreCorto: 'Margen',
      valor: ventasTotales > 0 ? (utilidadesTotales / ventasTotales) * 100 : 0,
      valorFormateado: formatPercent(
        ventasTotales > 0 ? (utilidadesTotales / ventasTotales) * 100 : 0,
      ),
      unidad: '%',
      categoria: 'rentabilidad',
      tendencia: 'stable',
      descripcion: 'Utilidad / Ventas totales',
      colorPositivo: true,
      umbralAlerta: 20,
      umbralCritico: 10,
    },
    {
      id: 'roce',
      nombre: 'ROCE (Retorno Capital)',
      nombreCorto: 'ROCE',
      valor: capitalTotal > 0 ? (utilidadesTotales / capitalTotal) * 100 : 0,
      valorFormateado: formatPercent(
        capitalTotal > 0 ? (utilidadesTotales / capitalTotal) * 100 : 0,
      ),
      unidad: '%',
      categoria: 'rentabilidad',
      tendencia: 'stable',
      descripcion: 'Retorno sobre capital empleado',
      colorPositivo: true,
    },
    {
      id: 'roi',
      nombre: 'ROI (Retorno Inversión)',
      nombreCorto: 'ROI',
      valor:
        gastosHistoricos > 0
          ? ((ingresosHistoricos - gastosHistoricos) / gastosHistoricos) * 100
          : 0,
      valorFormateado: formatPercent(
        gastosHistoricos > 0
          ? ((ingresosHistoricos - gastosHistoricos) / gastosHistoricos) * 100
          : 0,
      ),
      unidad: '%',
      categoria: 'rentabilidad',
      tendencia: 'stable',
      descripcion: '(Ingresos - Gastos) / Gastos',
      colorPositivo: true,
    },
    {
      id: 'ganancia_promedio',
      nombre: 'Ganancia Promedio/Venta',
      nombreCorto: 'Gan. Prom.',
      valor: ventas.length > 0 ? utilidadesTotales / ventas.length : 0,
      valorFormateado: formatMoney(ventas.length > 0 ? utilidadesTotales / ventas.length : 0),
      unidad: '$',
      categoria: 'rentabilidad',
      tendencia: 'stable',
      descripcion: 'Utilidad promedio por cada venta',
      colorPositivo: true,
    },
    {
      id: 'ratio_gasto',
      nombre: 'Ratio de Gastos',
      nombreCorto: 'R. Gastos',
      valor: ingresosHistoricos > 0 ? (gastosHistoricos / ingresosHistoricos) * 100 : 0,
      valorFormateado: formatPercent(
        ingresosHistoricos > 0 ? (gastosHistoricos / ingresosHistoricos) * 100 : 0,
      ),
      unidad: '%',
      categoria: 'rentabilidad',
      tendencia: gastosHistoricos < ingresosHistoricos * 0.7 ? 'up' : 'down',
      descripcion: 'Gastos / Ingresos (menor es mejor)',
      colorPositivo: false,
      umbralAlerta: 70,
      umbralCritico: 90,
    },

    // ═══════════════════════════════════════════════════════════════
    // OPERATIVO (13-18)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'ventas_totales',
      nombre: 'Ventas Totales',
      nombreCorto: 'Ventas',
      valor: ventasTotales,
      valorFormateado: formatMoney(ventasTotales),
      unidad: '$',
      categoria: 'operativo',
      tendencia: 'up',
      descripcion: 'Valor total de todas las ventas',
      colorPositivo: true,
    },
    {
      id: 'numero_ventas',
      nombre: 'Número de Ventas',
      nombreCorto: '# Ventas',
      valor: ventas.length,
      valorFormateado: ventas.length.toString(),
      unidad: 'unidades',
      categoria: 'operativo',
      tendencia: 'stable',
      descripcion: 'Total de ventas registradas',
      colorPositivo: true,
    },
    {
      id: 'ticket_promedio',
      nombre: 'Ticket Promedio',
      nombreCorto: 'Ticket Prom.',
      valor: ventas.length > 0 ? ventasTotales / ventas.length : 0,
      valorFormateado: formatMoney(ventas.length > 0 ? ventasTotales / ventas.length : 0),
      unidad: '$',
      categoria: 'operativo',
      tendencia: 'stable',
      descripcion: 'Valor promedio por venta',
      colorPositivo: true,
    },
    {
      id: 'unidades_vendidas',
      nombre: 'Unidades Vendidas',
      nombreCorto: 'Und. Vendidas',
      valor: ventas.reduce((acc, v) => acc + (v.cantidad || 0), 0),
      valorFormateado: ventas.reduce((acc, v) => acc + (v.cantidad || 0), 0).toLocaleString(),
      unidad: 'unidades',
      categoria: 'operativo',
      tendencia: 'stable',
      descripcion: 'Total de unidades vendidas',
      colorPositivo: true,
    },
    {
      id: 'tasa_conversion_pago',
      nombre: 'Tasa Conversión Pago',
      nombreCorto: 'Conv. Pago',
      valor: ventas.length > 0 ? (ventasCompletadas.length / ventas.length) * 100 : 0,
      valorFormateado: formatPercent(
        ventas.length > 0 ? (ventasCompletadas.length / ventas.length) * 100 : 0,
      ),
      unidad: '%',
      categoria: 'operativo',
      tendencia: 'stable',
      descripcion: 'Ventas pagadas completamente / Total ventas',
      colorPositivo: true,
    },
    {
      id: 'ordenes_activas',
      nombre: 'Órdenes de Compra Activas',
      nombreCorto: 'OC Activas',
      valor: ordenesCompra.filter((oc) => oc.estado !== 'completo' && oc.estado !== 'cancelado')
        .length,
      valorFormateado: ordenesCompra
        .filter((oc) => oc.estado !== 'completo' && oc.estado !== 'cancelado')
        .length.toString(),
      unidad: 'unidades',
      categoria: 'operativo',
      tendencia: 'stable',
      descripcion: 'OC pendientes de pago o entrega',
      colorPositivo: true,
    },

    // ═══════════════════════════════════════════════════════════════
    // DEUDA (19-24)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'cuentas_cobrar',
      nombre: 'Cuentas por Cobrar',
      nombreCorto: 'Por Cobrar',
      valor: cuentasPorCobrar,
      valorFormateado: formatMoney(cuentasPorCobrar),
      unidad: '$',
      categoria: 'deuda',
      tendencia: cuentasPorCobrar > capitalTotal * 0.5 ? 'down' : 'stable',
      descripcion: 'Total que deben los clientes',
      colorPositivo: false,
    },
    {
      id: 'cuentas_pagar',
      nombre: 'Cuentas por Pagar',
      nombreCorto: 'Por Pagar',
      valor: cuentasPorPagar,
      valorFormateado: formatMoney(cuentasPorPagar),
      unidad: '$',
      categoria: 'deuda',
      tendencia: cuentasPorPagar > capitalTotal ? 'down' : 'stable',
      descripcion: 'Total que debemos a distribuidores',
      colorPositivo: false,
    },
    {
      id: 'balance_deuda',
      nombre: 'Balance de Deuda',
      nombreCorto: 'Balance',
      valor: cuentasPorCobrar - cuentasPorPagar,
      valorFormateado: formatMoney(cuentasPorCobrar - cuentasPorPagar),
      unidad: '$',
      categoria: 'deuda',
      tendencia: cuentasPorCobrar > cuentasPorPagar ? 'up' : 'down',
      descripcion: 'Por cobrar - Por pagar',
      colorPositivo: true,
    },
    {
      id: 'clientes_con_deuda',
      nombre: 'Clientes con Deuda',
      nombreCorto: 'Cli. Deuda',
      valor: clientesConDeuda,
      valorFormateado: clientesConDeuda.toString(),
      unidad: 'unidades',
      categoria: 'deuda',
      tendencia: 'stable',
      descripcion: 'Clientes que tienen saldo pendiente',
      colorPositivo: false,
    },
    {
      id: 'ventas_pendientes',
      nombre: 'Ventas Pendientes',
      nombreCorto: 'V. Pendientes',
      valor: ventasPendientes.length,
      valorFormateado: ventasPendientes.length.toString(),
      unidad: 'unidades',
      categoria: 'deuda',
      tendencia: ventasPendientes.length > ventas.length * 0.3 ? 'down' : 'stable',
      descripcion: 'Ventas sin pago alguno',
      colorPositivo: false,
    },
    {
      id: 'ventas_parciales',
      nombre: 'Ventas Parciales',
      nombreCorto: 'V. Parciales',
      valor: ventasParciales.length,
      valorFormateado: ventasParciales.length.toString(),
      unidad: 'unidades',
      categoria: 'deuda',
      tendencia: 'stable',
      descripcion: 'Ventas con pago parcial',
      colorPositivo: false,
    },

    // ═══════════════════════════════════════════════════════════════
    // EFICIENCIA (25-30)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'stock_total',
      nombre: 'Stock Total',
      nombreCorto: 'Stock',
      valor: stockTotal,
      valorFormateado: stockTotal.toLocaleString(),
      unidad: 'unidades',
      categoria: 'eficiencia',
      tendencia: stockTotal < 10 ? 'down' : 'stable',
      descripcion: 'Unidades en almacén disponibles',
      colorPositivo: true,
      umbralAlerta: 20,
      umbralCritico: 5,
    },
    {
      id: 'valor_inventario',
      nombre: 'Valor del Inventario',
      nombreCorto: 'Val. Inv.',
      valor: valorInventario,
      valorFormateado: formatMoney(valorInventario),
      unidad: '$',
      categoria: 'eficiencia',
      tendencia: 'stable',
      descripcion: 'Stock × Costo unitario',
      colorPositivo: true,
    },
    {
      id: 'rotacion_inventario',
      nombre: 'Rotación de Inventario',
      nombreCorto: 'Rotación',
      valor: valorInventario > 0 ? ventasTotales / valorInventario : 0,
      valorFormateado: `${(valorInventario > 0 ? ventasTotales / valorInventario : 0).toFixed(1)}x`,
      unidad: 'veces',
      categoria: 'eficiencia',
      tendencia: 'stable',
      descripcion: 'Ventas / Valor inventario (más alto = más eficiente)',
      colorPositivo: true,
    },
    {
      id: 'clientes_activos',
      nombre: 'Clientes Activos',
      nombreCorto: 'Cli. Activos',
      valor: clientesActivos,
      valorFormateado: clientesActivos.toString(),
      unidad: 'unidades',
      categoria: 'eficiencia',
      tendencia: 'stable',
      descripcion: 'Clientes en estado activo',
      colorPositivo: true,
    },
    {
      id: 'distribuidores_activos',
      nombre: 'Distribuidores Activos',
      nombreCorto: 'Dist. Activos',
      valor: distribuidores.filter((d) => d.estado === 'activo').length,
      valorFormateado: distribuidores.filter((d) => d.estado === 'activo').length.toString(),
      unidad: 'unidades',
      categoria: 'eficiencia',
      tendencia: 'stable',
      descripcion: 'Proveedores en estado activo',
      colorPositivo: true,
    },
    {
      id: 'ingreso_historico',
      nombre: 'Ingresos Históricos',
      nombreCorto: 'Ing. Hist.',
      valor: ingresosHistoricos,
      valorFormateado: formatMoney(ingresosHistoricos),
      unidad: '$',
      categoria: 'eficiencia',
      tendencia: 'up',
      descripcion: 'Total de ingresos acumulados en todos los bancos',
      colorPositivo: true,
    },

    // ═══════════════════════════════════════════════════════════════
    // CRECIMIENTO (31-35)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'boveda_monte',
      nombre: 'Capital Bóveda Monte',
      nombreCorto: 'Bóveda Monte',
      valor: bancos['boveda_monte']?.capitalActual || 0,
      valorFormateado: formatMoney(bancos['boveda_monte']?.capitalActual || 0),
      unidad: '$',
      categoria: 'crecimiento',
      tendencia: 'stable',
      descripcion: 'Capital actual en Bóveda Monte (COSTO)',
      colorPositivo: true,
    },
    {
      id: 'flete_sur',
      nombre: 'Capital Flete Sur',
      nombreCorto: 'Flete Sur',
      valor: bancos['flete_sur']?.capitalActual || 0,
      valorFormateado: formatMoney(bancos['flete_sur']?.capitalActual || 0),
      unidad: '$',
      categoria: 'crecimiento',
      tendencia: 'stable',
      descripcion: 'Capital actual en Flete Sur (TRANSPORTE)',
      colorPositivo: true,
    },
    {
      id: 'utilidades_banco',
      nombre: 'Capital Utilidades',
      nombreCorto: 'Utilidades',
      valor: bancos['utilidades']?.capitalActual || 0,
      valorFormateado: formatMoney(bancos['utilidades']?.capitalActual || 0),
      unidad: '$',
      categoria: 'crecimiento',
      tendencia: (bancos['utilidades']?.capitalActual || 0) > 0 ? 'up' : 'stable',
      descripcion: 'Capital actual en Utilidades (GANANCIA)',
      colorPositivo: true,
    },
    {
      id: 'profit_banco',
      nombre: 'Capital Profit',
      nombreCorto: 'Profit',
      valor: bancos['profit']?.capitalActual || 0,
      valorFormateado: formatMoney(bancos['profit']?.capitalActual || 0),
      unidad: '$',
      categoria: 'crecimiento',
      tendencia: 'stable',
      descripcion: 'Capital en banco Profit',
      colorPositivo: true,
    },
    {
      id: 'azteca_banco',
      nombre: 'Capital Azteca',
      nombreCorto: 'Azteca',
      valor: bancos['azteca']?.capitalActual || 0,
      valorFormateado: formatMoney(bancos['azteca']?.capitalActual || 0),
      unidad: '$',
      categoria: 'crecimiento',
      tendencia: (bancos['azteca']?.capitalActual || 0) < 0 ? 'down' : 'stable',
      descripcion: 'Capital en banco Azteca',
      colorPositivo: true,
    },
  ]

  return metricas
}

// ═══════════════════════════════════════════════════════════════════════════
// RESUMEN RÁPIDO
// ═══════════════════════════════════════════════════════════════════════════

export function calcularResumenFinanciero(datos: {
  bancos: Record<string, Banco>
  ventas: Venta[]
  ordenesCompra: OrdenCompra[]
  clientes: Cliente[]
  distribuidores: Distribuidor[]
}): ResumenFinanciero {
  const { bancos, ventas, ordenesCompra, clientes, distribuidores } = datos

  const capitalTotal = calcularCapitalTotal(bancos)
  const ingresosTotales = calcularIngresosHistoricos(bancos)
  const gastosTotales = calcularGastosHistoricos(bancos)
  const cuentasPorCobrar = calcularCuentasPorCobrar(ventas)
  const cuentasPorPagar = calcularCuentasPorPagar(ordenesCompra)
  const stockTotal = calcularStockTotal(ordenesCompra)
  const valorInventario = calcularValorInventario(ordenesCompra)
  const utilidadNeta = ventas.reduce((acc, v) => acc + (v.utilidad || v.ganancia || 0), 0)

  return {
    capitalTotal,
    capitalDisponible: capitalTotal,
    capitalBloqueado: 0,
    ingresosTotales,
    gastosTotales,
    utilidadNeta,
    cuentasPorCobrar,
    cuentasPorPagar,
    balanceNeto: cuentasPorCobrar - cuentasPorPagar,
    stockTotal,
    valorInventario,
    metricas: calcular30Metricas(datos),
  }
}
