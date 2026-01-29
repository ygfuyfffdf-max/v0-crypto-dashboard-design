/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔒 CHRONOS INFINITY 2026 — Audit Logger Tests
 * ═══════════════════════════════════════════════════════════════════════════════
 * Tests completos para el sistema de auditoría
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { logAudit, audit, AuditAction, AuditSeverity } from "@/app/lib/security/audit-logger"

describe("Audit Logger", () => {
  describe("logAudit", () => {
    it("debe registrar un evento de auditoría", async () => {
      await expect(
        logAudit({
          action: "LOGIN",
          resource: "auth",
          userId: "user-123",
          severity: "INFO",
          details: { method: "email" },
          success: true,
        })
      ).resolves.not.toThrow()
    })

    it("debe manejar todos los tipos de acción", async () => {
      const actions: AuditAction[] = [
        "CREATE",
        "READ",
        "UPDATE",
        "DELETE",
        "LOGIN",
        "LOGOUT",
        "LOGIN_FAILED",
        "TRANSFER",
        "PAYMENT",
        "REFUND",
        "EXPORT",
        "IMPORT",
        "SETTINGS_CHANGE",
        "PERMISSION_CHANGE",
      ]

      for (const action of actions) {
        await expect(
          logAudit({
            action,
            resource: "test",
            severity: "INFO",
            details: {},
            success: true,
          })
        ).resolves.not.toThrow()
      }
    })

    it("debe manejar todos los niveles de severidad", async () => {
      const severities: AuditSeverity[] = ["INFO", "WARNING", "ERROR", "CRITICAL"]

      for (const severity of severities) {
        await expect(
          logAudit({
            action: "READ",
            resource: "test",
            severity,
            details: {},
            success: true,
          })
        ).resolves.not.toThrow()
      }
    })

    it("debe manejar entradas con todos los campos opcionales", async () => {
      await expect(
        logAudit({
          action: "UPDATE",
          resource: "ventas",
          resourceId: "venta-123",
          userId: "admin-1",
          severity: "WARNING",
          details: { oldValue: 100, newValue: 200 },
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0",
          success: true,
        })
      ).resolves.not.toThrow()
    })

    it("debe manejar entradas fallidas", async () => {
      await expect(
        logAudit({
          action: "LOGIN_FAILED",
          resource: "auth",
          severity: "WARNING",
          details: { email: "test@test.com" },
          success: false,
          errorMessage: "Invalid credentials",
        })
      ).resolves.not.toThrow()
    })
  })

  describe("audit helpers", () => {
    it("debe tener helper ventaCreada", async () => {
      await expect(audit.ventaCreada("venta-1", "user-1", { monto: 1000 })).resolves.not.toThrow()
    })

    it("debe tener helper ventaActualizada", async () => {
      await expect(audit.ventaActualizada("venta-2", "user-2")).resolves.not.toThrow()
    })

    it("debe tener helper transferencia", async () => {
      await expect(audit.transferencia("banco-a", "banco-b", 50000, "admin")).resolves.not.toThrow()
    })

    it("debe tener helper loginSuccess", async () => {
      await expect(audit.loginSuccess("user-123", "10.0.0.1")).resolves.not.toThrow()
    })

    it("debe tener helper loginFailed", async () => {
      await expect(
        audit.loginFailed("test@test.com", "10.0.0.1", "Bad password")
      ).resolves.not.toThrow()
    })

    it("debe tener helper dataExport", async () => {
      await expect(audit.dataExport("ventas", "admin", 100)).resolves.not.toThrow()
    })

    it("debe tener helper criticalError", async () => {
      const error = new Error("Database connection failed")
      await expect(audit.criticalError("database", error, { retry: 3 })).resolves.not.toThrow()
    })
  })

  describe("Edge Cases", () => {
    it("debe manejar details vacío", async () => {
      await expect(
        logAudit({
          action: "READ",
          resource: "test",
          severity: "INFO",
          details: {},
          success: true,
        })
      ).resolves.not.toThrow()
    })

    it("debe manejar details con datos complejos", async () => {
      await expect(
        logAudit({
          action: "UPDATE",
          resource: "bancos",
          severity: "INFO",
          details: {
            nested: { a: 1, b: { c: 2 } },
            array: [1, 2, 3],
            date: new Date().toISOString(),
          },
          success: true,
        })
      ).resolves.not.toThrow()
    })

    it("debe manejar userId undefined", async () => {
      await expect(
        logAudit({
          action: "READ",
          resource: "public",
          severity: "INFO",
          details: {},
          success: true,
          // userId no definido
        })
      ).resolves.not.toThrow()
    })
  })

  describe("Security Scenarios", () => {
    it("debe loguear intento de brute force", async () => {
      for (let i = 0; i < 5; i++) {
        await audit.loginFailed("attacker@evil.com", "10.0.0.1", "Invalid password")
      }
      // No debe lanzar error
    })

    it("debe loguear acceso a datos sensibles", async () => {
      await expect(
        logAudit({
          action: "READ",
          resource: "bancos",
          resourceId: "boveda_monte",
          userId: "admin",
          severity: "WARNING",
          details: { accessType: "capital_actual" },
          success: true,
        })
      ).resolves.not.toThrow()
    })
  })
})
