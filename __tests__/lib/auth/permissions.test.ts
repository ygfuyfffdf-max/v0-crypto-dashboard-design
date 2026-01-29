/**
 * Tests para el sistema de permisos
 */

import {
  canAccess,
  getRolePermissions,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "@/app/lib/auth/permissions"

describe("Sistema de Permisos", () => {
  describe("hasPermission", () => {
    it("admin debe tener todos los permisos", () => {
      expect(hasPermission("admin", "ventas.create")).toBe(true)
      expect(hasPermission("admin", "bancos.transfer")).toBe(true)
      expect(hasPermission("admin", "settings.edit")).toBe(true)
      expect(hasPermission("admin", "users.manage")).toBe(true)
    })

    it("operator debe tener permisos operativos", () => {
      expect(hasPermission("operator", "ventas.create")).toBe(true)
      expect(hasPermission("operator", "ventas.update")).toBe(true)
      expect(hasPermission("operator", "bancos.read")).toBe(true)
    })

    it("operator NO debe tener permisos administrativos", () => {
      expect(hasPermission("operator", "users.manage")).toBe(false)
      expect(hasPermission("operator", "settings.edit")).toBe(false)
      expect(hasPermission("operator", "ventas.delete")).toBe(false)
      expect(hasPermission("operator", "bancos.transfer")).toBe(false)
    })

    it("viewer solo debe tener permisos de lectura", () => {
      expect(hasPermission("viewer", "ventas.read")).toBe(true)
      expect(hasPermission("viewer", "bancos.read")).toBe(true)
      expect(hasPermission("viewer", "reportes.view")).toBe(true)
    })

    it("viewer NO debe poder crear/editar/eliminar", () => {
      expect(hasPermission("viewer", "ventas.create")).toBe(false)
      expect(hasPermission("viewer", "ventas.update")).toBe(false)
      expect(hasPermission("viewer", "ventas.delete")).toBe(false)
    })

    it("debe retornar false para rol undefined", () => {
      expect(hasPermission(undefined, "ventas.create")).toBe(false)
    })
  })

  describe("hasAllPermissions", () => {
    it("debe verificar múltiples permisos correctamente", () => {
      expect(hasAllPermissions("admin", ["ventas.create", "ventas.update", "ventas.delete"])).toBe(
        true
      )

      expect(hasAllPermissions("operator", ["ventas.create", "ventas.update"])).toBe(true)

      expect(hasAllPermissions("operator", ["ventas.create", "ventas.delete"])).toBe(false)
    })
  })

  describe("hasAnyPermission", () => {
    it("debe verificar al menos un permiso", () => {
      expect(hasAnyPermission("viewer", ["ventas.read", "ventas.create"])).toBe(true)

      expect(hasAnyPermission("viewer", ["ventas.create", "ventas.delete"])).toBe(false)
    })
  })

  describe("canAccess", () => {
    it("debe verificar acceso a recursos correctamente", () => {
      expect(canAccess("admin", "ventas", "create")).toBe(true)
      expect(canAccess("operator", "ventas", "create")).toBe(true)
      expect(canAccess("viewer", "ventas", "create")).toBe(false)

      expect(canAccess("admin", "bancos", "transfer")).toBe(true)
      expect(canAccess("operator", "bancos", "transfer")).toBe(false)
      expect(canAccess("viewer", "bancos", "transfer")).toBe(false)
    })
  })

  describe("getRolePermissions", () => {
    it("debe retornar todos los permisos de un rol", () => {
      const adminPerms = getRolePermissions("admin")
      expect(adminPerms).toContain("ventas.create")
      expect(adminPerms).toContain("users.manage")
      expect(adminPerms.length).toBeGreaterThan(40) // Admin tiene 46 permisos

      const viewerPerms = getRolePermissions("viewer")
      expect(viewerPerms).toContain("ventas.read")
      expect(viewerPerms).not.toContain("ventas.create")
      expect(viewerPerms.length).toBeLessThan(adminPerms.length)
    })
  })
})
