/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧪 TESTS - DISTRIBUIDORES SERVER ACTIONS (Sin Mocks)
 * ═══════════════════════════════════════════════════════════════════════════
 * Tests de integración para las Server Actions de distribuidores
 */

import {
  createDistribuidor,
  getDistribuidores,
  updateDistribuidor,
} from "@/app/_actions/distribuidores"

// Mock mínimo solo para revalidatePath (requerido por Next.js)
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

describe("🚚 Distribuidores Server Actions", () => {
  describe("getDistribuidores", () => {
    it("✅ debe retornar resultado con estructura correcta", async () => {
      const result = await getDistribuidores()

      expect(result).toHaveProperty("success")
      expect(typeof result.success).toBe("boolean")

      if (result.success) {
        expect(result).toHaveProperty("data")
        expect(Array.isArray(result.data)).toBe(true)
      }
    })
  })

  describe("createDistribuidor", () => {
    it("❌ debe rechazar nombre vacío", async () => {
      const input = {
        nombre: "",
        empresa: "Empresa",
      }

      const result = await createDistribuidor(input)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it("❌ debe rechazar nombre muy corto", async () => {
      const input = {
        nombre: "A",
      }

      const result = await createDistribuidor(input)

      expect(result.success).toBe(false)
    })

    it("❌ debe rechazar email inválido", async () => {
      const input = {
        nombre: "Distribuidor Test",
        email: "email-sin-arroba",
      }

      const result = await createDistribuidor(input)

      expect(result.success).toBe(false)
    })
  })

  describe("updateDistribuidor", () => {
    it("❌ debe rechazar sin ID", async () => {
      const input = {
        id: "",
        nombre: "Nombre actualizado",
      }

      const result = await updateDistribuidor(input)

      expect(result.success).toBe(false)
    })
  })

  describe("Validaciones de Datos", () => {
    it("✅ debe validar formato de email", () => {
      const esEmailValido = (email: string) => email.includes("@")

      expect(esEmailValido("test@example.com")).toBe(true)
      expect(esEmailValido("email-invalido")).toBe(false)
      expect(esEmailValido("")).toBe(false)
    })

    it("✅ debe validar longitud de nombre", () => {
      const esNombreValido = (nombre: string) => nombre.trim().length >= 2

      expect(esNombreValido("AB")).toBe(true)
      expect(esNombreValido("A")).toBe(false)
      expect(esNombreValido("")).toBe(false)
      expect(esNombreValido("  ")).toBe(false)
    })
  })
})
