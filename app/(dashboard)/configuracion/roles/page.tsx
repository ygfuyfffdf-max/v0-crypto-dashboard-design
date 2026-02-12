'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ ROLES MANAGEMENT PAGE — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { RolePermissionsManager } from '@/app/_components/admin/RolePermissionsManager'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

// Tipos compatibles con RolePermissionsManager
type BancoId = 'boveda_monte' | 'boveda_usa' | 'profit' | 'leftie' | 'azteca' | 'flete_sur' | 'utilidades'
type Modulo = 'bancos' | 'ventas' | 'clientes' | 'distribuidores' | 'almacen' | 'ordenes' | 'reportes' | 'configuracion' | 'usuarios' | 'auditoria'
type Accion = 'ver' | 'crear' | 'editar' | 'eliminar' | 'exportar' | 'aprobar' | 'ingreso' | 'gasto' | 'transferir'

interface Permiso {
  id: string
  modulo: Modulo
  accion: Accion
  activo: boolean
  restricciones: {
    bancos: BancoId[]
    montoMaximo?: number
    limiteDiario?: number
    horaInicio?: string
    horaFin?: string
    diasPermitidos?: number[]
    requiereAprobacion: boolean
  }
}

interface Rol {
  id: string
  nombre: string
  codigo: string
  descripcion: string
  color: string
  icono: string
  esAdmin: boolean
  activo: boolean
  permisos: Permiso[]
}

// Mock data - En producción esto vendría de la API
const INITIAL_ROLES: Rol[] = [
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
        modulo: 'bancos',
        accion: 'ver',
        activo: true,
        restricciones: { bancos: ['boveda_monte', 'boveda_usa', 'profit', 'leftie', 'azteca', 'flete_sur', 'utilidades'], requiereAprobacion: false },
      },
      {
        id: 'op2',
        modulo: 'bancos',
        accion: 'ingreso',
        activo: true,
        restricciones: { bancos: ['boveda_monte', 'boveda_usa', 'profit', 'leftie', 'azteca', 'flete_sur', 'utilidades'], montoMaximo: 100000, requiereAprobacion: false },
      },
      {
        id: 'op3',
        modulo: 'bancos',
        accion: 'gasto',
        activo: true,
        restricciones: { bancos: ['boveda_monte', 'boveda_usa', 'profit', 'leftie', 'azteca', 'flete_sur', 'utilidades'], montoMaximo: 50000, requiereAprobacion: true },
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
        modulo: 'bancos',
        accion: 'ver',
        activo: true,
        restricciones: { bancos: ['profit'], requiereAprobacion: false },
      },
      {
        id: 'cp2',
        modulo: 'bancos',
        accion: 'ingreso',
        activo: true,
        restricciones: {
          bancos: ['profit'],
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
        modulo: 'bancos',
        accion: 'ver',
        activo: true,
        restricciones: { bancos: ['boveda_monte', 'boveda_usa', 'profit', 'leftie', 'azteca', 'flete_sur', 'utilidades'], requiereAprobacion: false },
      },
      {
        id: 'vr2',
        modulo: 'reportes',
        accion: 'ver',
        activo: true,
        restricciones: { bancos: ['boveda_monte', 'boveda_usa', 'profit', 'leftie', 'azteca', 'flete_sur', 'utilidades'], requiereAprobacion: false },
      },
      {
        id: 'vr3',
        modulo: 'reportes',
        accion: 'exportar',
        activo: true,
        restricciones: { bancos: ['boveda_monte', 'boveda_usa', 'profit', 'leftie', 'azteca', 'flete_sur', 'utilidades'], requiereAprobacion: true },
      },
    ],
  },
]

export default function RolesPage() {
  const [roles, setRoles] = useState<Rol[]>(INITIAL_ROLES)

  const handleSaveRole = useCallback((updatedRole: Rol) => {
    setRoles((prev) => prev.map((r) => (r.id === updatedRole.id ? updatedRole : r)))
    toast.success(`Rol "${updatedRole.nombre}" actualizado exitosamente`)
  }, [])

  const handleDeleteRole = useCallback((id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id))
    toast.success('Rol eliminado exitosamente')
  }, [])

  const handleCreateRole = useCallback((newRole: Omit<Rol, 'id'>) => {
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
