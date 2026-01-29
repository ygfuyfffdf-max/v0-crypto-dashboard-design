/**
 * Utils - Exportaciones centralizadas
 * Sistema Chronos v2.1
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ═══════════════════════════════════════════════════════════════════════════════
// CLASS NAME UTILITY (Tailwind CSS)
// ═══════════════════════════════════════════════════════════════════════════════
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGER (USAR SIEMPRE en lugar de console.log)
// ═══════════════════════════════════════════════════════════════════════════════
export { logger, type LogLevel, type LogOptions } from './logger'

// ═══════════════════════════════════════════════════════════════════════════════
// RESULT PATTERN (Manejo de errores consistente)
// ═══════════════════════════════════════════════════════════════════════════════
export {
  AppError,
  BusinessRuleError,
  combineResults,
  DatabaseError,
  DuplicateEntryError,
  executeAll,
  fromDatabaseError,
  fromFirebaseError, // @deprecated - usar fromDatabaseError
  fromUnknownError,
  fromZodErrors,
  InsufficientFundsError,
  InsufficientStockError,
  NotFoundError,
  Result,
  tryCatch,
  tryCatchSync,
  ValidationError,
  type ErrorCode,
} from './result'

// Cálculos de negocio
export {
  calcularAnalisisMargen,
  calcularCapitalTotal,
  calcularCostoTotalOrden,
  calcularCrecimiento,
  calcularDeudaOrden,
  calcularDeudaTotalClientes,
  calcularDiasMora,
  calcularDistribucionVenta,
  calcularMargenBruto,
  calcularMargenNeto,
  calcularPorcentajeMargen,
  calcularRentabilidad,
  calcularValorInventario,
  formatearMoneda,
  formatearNumero,
  formatearPorcentaje,
  proyectarVentas,
  redondear,
  type DistribucionVenta,
  type MargenCalculo,
  type OrdenCompraData,
  type ProyeccionData,
  type VentaData,
} from './calculations'

// Default export de calculations
export { default as business } from './calculations'

// Validadores Zod
export {
  abonoClienteSchema,
  abonoDistribuidorSchema,
  bancoSchema,
  clienteSchema,
  distribuidorSchema,
  filtroReporteSchema,
  formatearTelefono,
  gastoSchema,
  loginSchema,
  movimientoAlmacenSchema,
  normalizarNombre,
  ordenCompraSchema,
  productoSchema,
  registroSchema,
  reporteProgramadoSchema,
  sanitizarString,
  schemas,
  transferenciaSchema,
  validarCampo,
  validarDatos,
  ventaSchema,
  type AbonoClienteInput,
  type AbonoDistribuidorInput,
  type BancoInput,
  type ClienteInput,
  type DistribuidorInput,
  type FiltroReporteInput,
  type GastoInput,
  type LoginInput,
  type MovimientoAlmacenInput,
  type OrdenCompraInput,
  type ProductoInput,
  type RegistroInput,
  type ReporteProgramadoInput,
  type TransferenciaInput,
  type VentaInput,
} from './validators'

// Formateadores
export {
  capitalize,
  currency,
  date,
  file,
  formatChange,
  formatCompact,
  formatCurrency,
  formatDate,
  formatDateRange,
  formatDuration,
  formatFileSize,
  formatList,
  formatMXN,
  formatName,
  formatNumber,
  formatPercent,
  formatPhone,
  formatQuantity,
  formatRelativeTime,
  formatStatus,
  formatTime,
  formatUSD,
  number,
  parseCurrency,
  text,
  titleCase,
  truncate,
} from './formatters'

// ═══════════════════════════════════════════════════════════════════════════════
// GESTIÓN DE INVENTARIO / STOCK
// ═══════════════════════════════════════════════════════════════════════════════
export {
  calcularCostoPromedioPonderado,
  calcularNuevoStock,
  calcularRotacion,
  determinarNivelStock,
  generarTimelineMovimientos,
  proyectarAgotamiento,
  recomendarReabastecimiento,
  valorizarInventario,
  type MovimientoStock,
  type NivelStock,
  type Producto,
  type ProyeccionAgotamiento,
  type RotacionInventario,
  type ValorizacionInventario,
} from './stock'

// ═══════════════════════════════════════════════════════════════════════════════
// GESTIÓN DE CRÉDITO
// ═══════════════════════════════════════════════════════════════════════════════
export {
  analizarCredito,
  calcularCalificacionCrediticia,
  calcularCreditoDisponible,
  calcularFacturasVencidas,
  calcularLimiteCreditoRecomendado,
  generarEstadoCuenta,
  procesarPago,
  validarCreditoParaVenta,
  type AnalisisCredito,
  type Distribuidor,
  type Factura,
  type Pago,
  type ResultadoValidacion,
} from './credit'

// ═══════════════════════════════════════════════════════════════════════════════
// CORTES DE CAJA
// ═══════════════════════════════════════════════════════════════════════════════
export {
  calcularCorte,
  cerrarCorte,
  conciliarTransferencias,
  detectarDiscrepancias,
  generarCierreMensual,
  generarCorteDiario,
  generarHistorialCortes,
  generarResumenDiario,
  obtenerSaldoAnterior,
  type CorteCaja,
  type Discrepancia,
  type MovimientoCaja,
  type ResumenDiario,
} from './cortes'
