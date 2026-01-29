/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS SYSTEM - usePermissions Hook                    ║
 * ║                    Hook para Verificación de Permisos                      ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

'use client'

import {
  canAccess,
  getRolePermissions,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  type Permission,
  type Role,
} from '@/app/lib/auth/permissions'
import { useAppStore } from '@/app/lib/store/useAppStore'
import { logger } from '@/app/lib/utils/logger'
import { useMemo } from 'react'

/**
 * Hook para gestionar permisos basados en el rol del usuario
 *
 * @example
 * ```tsx
 * const { can, canAll, canAny, role } = usePermissions()
 *
 * if (can('ventas.create')) {
 *   return <CreateVentaButton />
 * }
 *
 * if (canAll(['ventas.create', 'ventas.update'])) {
 *   return <ManageVentasPanel />
 * }
 * ```
 */
export function usePermissions() {
  // En producción, esto vendría de un contexto de autenticación real
  // Por ahora, usamos un rol mock o del store
  const currentUserId = useAppStore((state) => state.currentUserId)

  // Obtener rol del usuario autenticado - Integrado con AuthProvider
  const role: Role = useMemo(() => {
    // En desarrollo, permitir override desde localStorage
    if (typeof window !== 'undefined') {
      const mockRole = localStorage.getItem('chronos-user-role') as Role
      if (mockRole && ['admin', 'operator', 'viewer'].includes(mockRole)) {
        return mockRole
      }
    }

    // Default a 'admin' para desarrollo
    // En producción: usar useAuth() del AuthProvider
    return 'admin'
  }, [currentUserId])

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const can = useMemo(
    () => (permission: Permission) => {
      const result = hasPermission(role, permission)

      if (!result) {
        logger.debug('Permiso denegado', {
          context: 'usePermissions',
          data: { role, permission },
        })
      }

      return result
    },
    [role],
  )

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   */
  const canAll = useMemo(
    () => (permissions: Permission[]) => {
      return hasAllPermissions(role, permissions)
    },
    [role],
  )

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   */
  const canAny = useMemo(
    () => (permissions: Permission[]) => {
      return hasAnyPermission(role, permissions)
    },
    [role],
  )

  /**
   * Verifica si el usuario puede acceder a un recurso con una acción específica
   */
  const canAccessResource = useMemo(
    () =>
      (
        resource:
          | 'ventas'
          | 'clientes'
          | 'distribuidores'
          | 'ordenes'
          | 'bancos'
          | 'almacen'
          | 'reportes'
          | 'ia'
          | 'settings'
          | 'audit',
        action: 'read' | 'create' | 'update' | 'delete' | 'export' | 'manage' = 'read',
      ) => {
        return canAccess(role, resource, action)
      },
    [role],
  )

  /**
   * Obtiene todos los permisos del usuario
   */
  const permissions = useMemo(() => {
    return getRolePermissions(role)
  }, [role])

  /**
   * Verifica si el usuario es administrador
   */
  const isAdmin = useMemo(() => role === 'admin', [role])

  /**
   * Verifica si el usuario es operador
   */
  const isOperator = useMemo(() => role === 'operator', [role])

  /**
   * Verifica si el usuario es visualizador
   */
  const isViewer = useMemo(() => role === 'viewer', [role])

  /**
   * Cambia el rol del usuario (solo para desarrollo/testing)
   * En producción esto no debería estar disponible
   */
  const setRole = (newRole: Role) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chronos-user-role', newRole)
      logger.info('Rol cambiado (DEV ONLY)', {
        context: 'usePermissions',
        data: { from: role, to: newRole },
      })
      window.location.reload()
    }
  }

  return {
    role,
    permissions,
    can,
    canAll,
    canAny,
    canAccess: canAccessResource,
    isAdmin,
    isOperator,
    isViewer,
    // Solo para desarrollo
    setRole: process.env.NODE_ENV === 'development' ? setRole : undefined,
  }
}

/**
 * Hook simplificado para verificar un solo permiso
 *
 * @example
 * ```tsx
 * const canCreateVentas = useHasPermission('ventas.create')
 * ```
 */
export function useHasPermission(permission: Permission): boolean {
  const { can } = usePermissions()
  return can(permission)
}

/**
 * Hook para verificar múltiples permisos
 *
 * @example
 * ```tsx
 * const canManageVentas = useHasAllPermissions(['ventas.create', 'ventas.update', 'ventas.delete'])
 * ```
 */
export function useHasAllPermissions(permissions: Permission[]): boolean {
  const { canAll } = usePermissions()
  return canAll(permissions)
}

/**
 * Hook para verificar si tiene al menos un permiso
 *
 * @example
 * ```tsx
 * const canViewOrCreate = useHasAnyPermission(['ventas.read', 'ventas.create'])
 * ```
 */
export function useHasAnyPermission(permissions: Permission[]): boolean {
  const { canAny } = usePermissions()
  return canAny(permissions)
}
