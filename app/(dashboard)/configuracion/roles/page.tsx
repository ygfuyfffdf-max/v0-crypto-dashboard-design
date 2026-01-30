'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ ROLES MANAGEMENT PAGE — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { RolePermissionsManager } from '@/app/_components/admin/RolePermissionsManager'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

// Mock data - En producción esto vendría de la API
const INITIAL_ROLES = [
  {
    id: 'admin_supremo',
    nombre: 'Administrador Supremo',
    codigo: 'admin_supremo',
    descripcion: 'Control total del sistema sin restricciones',
    color: '#FFD700',
    icono: 'crown',
    esAdmin: true,
    activo: true,
    permisos: [],
  },
  {
    id: 'operador_general',
    nombre: 'Operador General',
    codigo: 'operador_general',
    descripcion: 'Puede realizar operaciones en todos los bancos',
    color: '#8B5CF6',
    icono: 'user-cog',
    esAdmin: false,
    activo: true,
    permisos: [
      {
        id: 'op1',
        modulo: 'bancos' as const,
        accion: 'ver' as const,
        activo: true,
        restricciones: { bancos: [], requiereAprobacion: false },
      },
      {
        id: 'op2',
        modulo: 'bancos' as const,
        accion: 'ingreso' as const,
        activo: true,
        restricciones: { bancos: [], montoMaximo: 100000, requiereAprobacion: false },
      },
      {
        id: 'op3',
        modulo: 'bancos' as const,
        accion: 'gasto' as const,
        activo: true,
        restricciones: { bancos: [], montoMaximo: 50000, requiereAprobacion: true },
      },
    ],
  },
  {
    id: 'cajero_profit',
    nombre: 'Cajero Profit',
    codigo: 'cajero_profit',
    descripcion: 'Solo puede registrar ingresos en la bóveda Profit',
    color: '#10B981',
    icono: 'shield',
    esAdmin: false,
    activo: true,
    permisos: [
      {
        id: 'cp1',
        modulo: 'bancos' as const,
        accion: 'ver' as const,
        activo: true,
        restricciones: { bancos: ['profit' as const], requiereAprobacion: false },
      },
      {
        id: 'cp2',
        modulo: 'bancos' as const,
        accion: 'ingreso' as const,
        activo: true,
        restricciones: {
          bancos: ['profit' as const],
          limiteDiario: 500000,
          montoMaximo: 50000,
          horaInicio: '08:00',
          horaFin: '20:00',
          diasPermitidos: [1, 2, 3, 4, 5, 6],
          requiereAprobacion: false,
        },
      },
    ],
  },
  {
    id: 'visor_reportes',
    nombre: 'Visor de Reportes',
    codigo: 'visor_reportes',
    descripcion: 'Solo puede ver información y exportar reportes',
    color: '#3B82F6',
    icono: 'eye',
    esAdmin: false,
    activo: true,
    permisos: [
      {
        id: 'vr1',
        modulo: 'bancos' as const,
        accion: 'ver' as const,
        activo: true,
        restricciones: { bancos: [], requiereAprobacion: false },
      },
      {
        id: 'vr2',
        modulo: 'reportes' as const,
        accion: 'ver' as const,
        activo: true,
        restricciones: { bancos: [], requiereAprobacion: false },
      },
      {
        id: 'vr3',
        modulo: 'reportes' as const,
        accion: 'exportar' as const,
        activo: true,
        restricciones: { bancos: [], requiereAprobacion: true },
      },
    ],
  },
]

export default function RolesPage() {
  const [roles, setRoles] = useState(INITIAL_ROLES)

  const handleSaveRole = useCallback((updatedRole: typeof INITIAL_ROLES[0]) => {
    setRoles((prev) => prev.map((r) => (r.id === updatedRole.id ? updatedRole : r)))
    toast.success(`Rol "${updatedRole.nombre}" actualizado exitosamente`)
  }, [])

  const handleDeleteRole = useCallback((id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id))
    toast.success('Rol eliminado exitosamente')
  }, [])

  const handleCreateRole = useCallback((newRole: Omit<typeof INITIAL_ROLES[0], 'id'>) => {
    const roleWithId = { ...newRole, id: `role_${Date.now()}` }
    setRoles((prev) => [...prev, roleWithId])
    toast.success(`Rol "${newRole.nombre}" creado exitosamente`)
  }, [])

  return (
    <div className="container mx-auto px-6 py-8">
      <RolePermissionsManager
        roles={roles}
        onSaveRole={handleSaveRole}
        onDeleteRole={handleDeleteRole}
        onCreateRole={handleCreateRole}
      />
    </div>
  )
}
