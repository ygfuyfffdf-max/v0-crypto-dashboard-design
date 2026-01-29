/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔒 CHRONOS INFINITY 2026 — Rate Limiter Tests
 * ═══════════════════════════════════════════════════════════════════════════════
 * Tests completos para el sistema de rate limiting
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { RATE_LIMIT_CONFIGS } from "@/app/lib/security/rate-limiter"

describe("Rate Limiter", () => {
  describe("RATE_LIMIT_CONFIGS", () => {
    it("debe tener configuración para APIs públicas", () => {
      expect(RATE_LIMIT_CONFIGS.public).toBeDefined()
      expect(RATE_LIMIT_CONFIGS.public.maxRequests).toBe(30)
      expect(RATE_LIMIT_CONFIGS.public.windowMs).toBe(60000)
      expect(RATE_LIMIT_CONFIGS.public.message).toBeDefined()
    })

    it("debe tener configuración para autenticación", () => {
      expect(RATE_LIMIT_CONFIGS.auth).toBeDefined()
      expect(RATE_LIMIT_CONFIGS.auth.maxRequests).toBe(5)
      expect(RATE_LIMIT_CONFIGS.auth.windowMs).toBe(900000) // 15 minutos
    })

    it("debe tener configuración para APIs autenticadas", () => {
      expect(RATE_LIMIT_CONFIGS.authenticated).toBeDefined()
      expect(RATE_LIMIT_CONFIGS.authenticated.maxRequests).toBe(200)
    })

    it("debe tener configuración para operaciones de escritura", () => {
      expect(RATE_LIMIT_CONFIGS.write).toBeDefined()
      expect(RATE_LIMIT_CONFIGS.write.maxRequests).toBe(20)
    })

    it("debe tener configuración para búsquedas", () => {
      expect(RATE_LIMIT_CONFIGS.search).toBeDefined()
      expect(RATE_LIMIT_CONFIGS.search.maxRequests).toBe(60)
    })

    it("todas las configuraciones deben tener windowMs válido", () => {
      Object.values(RATE_LIMIT_CONFIGS).forEach((config) => {
        expect(config.windowMs).toBeGreaterThan(0)
        expect(typeof config.windowMs).toBe("number")
      })
    })

    it("todas las configuraciones deben tener maxRequests válido", () => {
      Object.values(RATE_LIMIT_CONFIGS).forEach((config) => {
        expect(config.maxRequests).toBeGreaterThan(0)
        expect(typeof config.maxRequests).toBe("number")
      })
    })

    it("todas las configuraciones deben tener mensaje", () => {
      Object.values(RATE_LIMIT_CONFIGS).forEach((config) => {
        expect(config.message).toBeDefined()
        expect(typeof config.message).toBe("string")
        expect(config.message.length).toBeGreaterThan(5)
      })
    })
  })

  describe("Rate Limit Security", () => {
    it("auth debe ser más restrictivo que public", () => {
      // Auth permite menos requests por minuto efectivo que public
      const authRate =
        RATE_LIMIT_CONFIGS.auth.maxRequests / (RATE_LIMIT_CONFIGS.auth.windowMs / 60000)
      const publicRate =
        RATE_LIMIT_CONFIGS.public.maxRequests / (RATE_LIMIT_CONFIGS.public.windowMs / 60000)

      expect(authRate).toBeLessThan(publicRate)
    })

    it("write debe ser más restrictivo que search", () => {
      expect(RATE_LIMIT_CONFIGS.write.maxRequests).toBeLessThan(
        RATE_LIMIT_CONFIGS.search.maxRequests
      )
    })

    it("authenticated debe ser más permisivo que public", () => {
      expect(RATE_LIMIT_CONFIGS.authenticated.maxRequests).toBeGreaterThan(
        RATE_LIMIT_CONFIGS.public.maxRequests
      )
    })
  })
})
