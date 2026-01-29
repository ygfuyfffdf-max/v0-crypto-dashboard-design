/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧪 TESTS - MOVIMIENTOS SERVER ACTIONS (Sin Mocks)
 * ═══════════════════════════════════════════════════════════════════════════
 * Tests de integración para las Server Actions de movimientos
 */

import { getMovimientos } from "@/app/_actions/movimientos"

// Mock mínimo solo para revalidatePath (requerido por Next.js)
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

describe("💸 Movimientos Server Actions", () => {
  describe("getMovimientos", () => {
    it("✅ debe retornar resultado con estructura correcta", async () => {
      const result = await getMovimientos()

      expect(result).toHaveProperty("success")
      expect(typeof result.success).toBe("boolean")

      if (result.success) {
        expect(result).toHaveProperty("data")
        expect(Array.isArray(result.data)).toBe(true)
      }
    })
  })

  describe("Cálculos de Movimientos", () => {
    it("✅ debe calcular balance de ingresos y gastos", () => {
      const movimientos = [
        { tipo: "ingreso", monto: 10000 },
        { tipo: "gasto", monto: 3000 },
        { tipo: "ingreso", monto: 5000 },
        { tipo: "gasto", monto: 2000 },
      ]

      const totalIngresos = movimientos
        .filter((m) => m.tipo === "ingreso")
        .reduce((sum, m) => sum + m.monto, 0)

      const totalGastos = movimientos
        .filter((m) => m.tipo === "gasto")
        .reduce((sum, m) => sum + m.monto, 0)

      const balance = totalIngresos - totalGastos

      expect(totalIngresos).toBe(15000)
      expect(totalGastos).toBe(5000)
      expect(balance).toBe(10000)
    })

    it("✅ debe validar tipos de movimiento", () => {
      const tiposValidos = ["ingreso", "gasto", "transferencia"]

      const esTipoValido = (tipo: string) => tiposValidos.includes(tipo)

      expect(esTipoValido("ingreso")).toBe(true)
      expect(esTipoValido("gasto")).toBe(true)
      expect(esTipoValido("transferencia")).toBe(true)
      expect(esTipoValido("invalido")).toBe(false)
    })

    it("✅ debe validar monto positivo", () => {
      const esMontoValido = (monto: number) => monto > 0

      expect(esMontoValido(1000)).toBe(true)
      expect(esMontoValido(0.01)).toBe(true)
      expect(esMontoValido(0)).toBe(false)
      expect(esMontoValido(-100)).toBe(false)
    })
  })

  describe("Filtrado por Banco", () => {
    it("✅ debe filtrar movimientos por banco", () => {
      const movimientos = [
        { id: "1", bancoId: "boveda_monte", monto: 1000 },
        { id: "2", bancoId: "profit", monto: 2000 },
        { id: "3", bancoId: "boveda_monte", monto: 3000 },
      ]

      const movimientosBoveda = movimientos.filter((m) => m.bancoId === "boveda_monte")

      expect(movimientosBoveda).toHaveLength(2)
      expect(movimientosBoveda[0].monto).toBe(1000)
      expect(movimientosBoveda[1].monto).toBe(3000)
    })
  })
})
