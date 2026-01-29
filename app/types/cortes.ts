// ═══════════════════════════════════════════════════════════════════════════
// TIPOS PARA CORTES DE CUENTA
// ═══════════════════════════════════════════════════════════════════════════

export interface CorteData {
  bancoId: string
  periodo: {
    inicio: string
    fin: string
    tipo: 'mensual' | 'semanal' | 'anual' | 'personalizado'
  }
  capital: {
    inicial: number
    final: number
    variacion: number
  }
  movimientos: {
    total: number
    ingresos: {
      cantidad: number
      monto: number
    }
    gastos: {
      cantidad: number
      monto: number
    }
    transferenciasEntrada: {
      cantidad: number
      monto: number
    }
    transferenciasSalida: {
      cantidad: number
      monto: number
    }
  }
  balance: number
  fecha_corte: string
}

export interface CorteRequest {
  fechaInicio?: string
  fechaFin?: string
  tipo?: 'mensual' | 'semanal' | 'anual' | 'personalizado'
}
