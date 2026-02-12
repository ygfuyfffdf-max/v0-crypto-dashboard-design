/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💰 FINANCIAL VALIDATOR — MOTOR DE REGLAS FINANCIERAS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Validador centralizado para operaciones financieras.
 * Implementa reglas de negocio, límites AML y verificaciones de saldo.
 *
 * @version 1.0.0
 */

export interface OperacionContext {
  montoOrigen: number
  divisaOrigen: string
  tipoOperacion: 'compra' | 'venta'
  clienteId?: string
  cajaId: string
}

export class FinancialValidator {
  
  /**
   * Valida si una operación cumple con todas las reglas financieras
   */
  static validateOperation(context: OperacionContext): { valid: boolean; error?: string } {
    
    // 1. Validación de Límites AML (Anti-Money Laundering)
    if (context.montoOrigen > 10000 && context.divisaOrigen === 'USD') {
      // En producción esto verificaría documentos adjuntos
      if (!context.clienteId) {
        return { valid: false, error: 'Operaciones > $10,000 USD requieren identificación de cliente obligatoria (AML)' }
      }
    }

    // 2. Validación de Límites Diarios por Caja (Simulado)
    const limiteCaja = 1000000 // 1M límite diario
    if (context.montoOrigen > limiteCaja) {
      return { valid: false, error: `Monto excede el límite operativo de la caja (${limiteCaja})` }
    }

    // 3. Validación de Saldo de Caja (Simulado)
    // En un sistema real, consultaríamos el saldo actual de la caja en DB
    if (context.tipoOperacion === 'venta') {
      // Simulamos que la caja siempre tiene fondos excepto si piden > 500k
      if (context.montoOrigen > 500000) {
        return { valid: false, error: 'Fondos insuficientes en caja para esta operación' }
      }
    }

    return { valid: true }
  }

  /**
   * Calcula el riesgo de una operación
   */
  static calculateRiskScore(context: OperacionContext): number {
    let score = 0
    
    // Montos altos aumentan riesgo
    if (context.montoOrigen > 5000) score += 0.3
    if (context.montoOrigen > 20000) score += 0.4

    // Operaciones en efectivo (asumido si no hay cliente)
    if (!context.clienteId) score += 0.2

    return Math.min(score, 1)
  }
}