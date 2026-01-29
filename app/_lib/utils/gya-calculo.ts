// ═══════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2030 — CÁLCULO GYA PURO
// Función de cálculo de distribución GYA
//
// FÓRMULA GYA (GRABADA EN PIEDRA — NUNCA SE MODIFICA):
// - Bóveda Monte = precioCompra × cantidad (COSTO)
// - Flete Sur    = precioFlete × cantidad  (TRANSPORTE)
// - Utilidades   = (precioVenta - precioCompra - precioFlete) × cantidad (GANANCIA NETA)
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface DistribucionGYA {
  montoBovedaMonte: number // Costo total (precioCompra × cantidad)
  montoFletes: number // Fletes total (precioFlete × cantidad)
  montoUtilidades: number // Ganancia neta
  precioTotalVenta: number // Total que paga el cliente
  margenNeto: number // % de ganancia sobre venta
  margenBruto: number // % sobre costo
}

// ═══════════════════════════════════════════════════════════════
// FUNCIÓN DE CÁLCULO GYA — PURA, SIN EFECTOS SECUNDARIOS
// Esta función puede usarse en cliente y servidor
// ═══════════════════════════════════════════════════════════════

/**
 * Calcula la distribución GYA de una venta.
 * FÓRMULAS INMUTABLES — LA BASE DEL SISTEMA FINANCIERO
 *
 * @param precioVenta - Precio de venta al cliente por unidad
 * @param precioCompra - Precio de compra (costo) por unidad
 * @param precioFlete - Precio de flete por unidad
 * @param cantidad - Cantidad de unidades vendidas
 * @returns Distribución GYA con los montos para cada banco
 */
export function calcularDistribucionGYA(
  precioVenta: number,
  precioCompra: number,
  precioFlete: number,
  cantidad: number,
): DistribucionGYA {
  // FÓRMULAS INMUTABLES — GRABADAS EN PIEDRA
  const montoBovedaMonte = precioCompra * cantidad // COSTO total
  const montoFletes = precioFlete * cantidad // FLETE total
  const montoUtilidades = (precioVenta - precioCompra - precioFlete) * cantidad // GANANCIA NETA
  const precioTotalVenta = precioVenta * cantidad // Total que paga el cliente

  // Calcular márgenes
  const margenNeto = precioTotalVenta > 0 ? (montoUtilidades / precioTotalVenta) * 100 : 0

  const margenBruto =
    montoBovedaMonte + montoFletes > 0
      ? (montoUtilidades / (montoBovedaMonte + montoFletes)) * 100
      : 0

  return {
    montoBovedaMonte,
    montoFletes,
    montoUtilidades,
    precioTotalVenta,
    margenNeto: Number(margenNeto.toFixed(2)),
    margenBruto: Number(margenBruto.toFixed(2)),
  }
}

/**
 * Calcula la distribución proporcional para un pago parcial
 * @param distribucion - Distribución original de la venta
 * @param proporcion - Proporción del pago (0-1)
 */
export function calcularDistribucionProporcional(
  distribucion: DistribucionGYA,
  proporcion: number,
): DistribucionGYA {
  const prop = Math.max(0, Math.min(1, proporcion))

  return {
    montoBovedaMonte: Math.round(distribucion.montoBovedaMonte * prop),
    montoFletes: Math.round(distribucion.montoFletes * prop),
    montoUtilidades: Math.round(distribucion.montoUtilidades * prop),
    precioTotalVenta: Math.round(distribucion.precioTotalVenta * prop),
    margenNeto: distribucion.margenNeto,
    margenBruto: distribucion.margenBruto,
  }
}

/**
 * Valida si una venta tiene margen positivo
 */
export function validarMargenVenta(
  precioVenta: number,
  precioCompra: number,
  precioFlete: number,
): { valido: boolean; margen: number; mensaje?: string } {
  const gananciaUnidad = precioVenta - precioCompra - precioFlete
  const margen = precioVenta > 0 ? (gananciaUnidad / precioVenta) * 100 : 0

  if (gananciaUnidad <= 0) {
    return {
      valido: false,
      margen,
      mensaje: 'El precio de venta debe ser mayor al costo + flete',
    }
  }

  if (margen < 10) {
    return {
      valido: true,
      margen,
      mensaje: 'Advertencia: Margen menor al 10%',
    }
  }

  return { valido: true, margen }
}
