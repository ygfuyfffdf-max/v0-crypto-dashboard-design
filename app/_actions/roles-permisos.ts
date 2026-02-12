'use server'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔐 CHRONOS INFINITY 2026 — SERVER ACTIONS: ROLES Y PERMISOS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Acciones para gestión de roles y permisos granulares:
 * - CRUD de roles
 * - Asignación de permisos
 * - Validación de permisos en tiempo real
 * - Gestión de restricciones
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { db } from '@/database'
import { nanoid } from 'nanoid'
import { logger } from '@/app/lib/utils/logger'
import { revalidatePath } from 'next/cache'
import { registrarAuditoria } from './auditoria'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type BancoId = 'boveda_monte' | 'boveda_usa' | 'profit' | 'leftie' | 'azteca' | 'flete_sur' | 'utilidades'
export type Modulo = 'bancos' | 'ventas' | 'clientes' | 'distribuidores' | 'almacen' | 'ordenes' | 'reportes' | 'configuracion' | 'usuarios' | 'auditoria'
export type Accion = 'ver' | 'crear' | 'editar' | 'eliminar' | 'exportar' | 'aprobar' | 'ingreso' | 'gasto' | 'transferir' | 'ajuste' | 'corte'

export interface Restricciones {
  bancosPermitidos: BancoId[]
  categoriasPermitidas?: string[]
  clientesPermitidos?: string[]
  distribuidoresPermitidos?: string[]
  montoMinimo?: number
  montoMaximo?: number
  limiteDiario?: number
  limiteTransaccion?: number
  horaInicio?: string
  horaFin?: string
  diasPermitidos?: number[]
  requiereAprobacion: boolean
  aprobadorRolId?: string
  montoRequiereAprobacion?: number
  motivoRequerido: boolean
  referenciaRequerida: boolean
}

export interface Permiso {
  id: string
  modulo: Modulo
  accion: Accion
  activo: boolean
  restricciones: Restricciones
}

export interface Rol {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  color: string
  icono: string
  esAdmin: boolean
  esSistema: boolean
  prioridad: number
  activo: boolean
  permisos: Permiso[]
  creadoPor?: string
  creadoAt: Date
  modificadoPor?: string
  modificadoAt?: Date
}

export interface UsuarioRolAsignacion {
  id: string
  usuarioId: string
  rolId: string
  bancosPermitidos?: BancoId[]
  limiteGlobalDiario?: number
  limiteGlobalTransaccion?: number
  horaInicioAcceso?: string
  horaFinAcceso?: string
  diasPermitidos?: number[]
  requiereAprobacionGlobal: boolean
  activo: boolean
}

export interface ValidacionPermisoInput {
  usuarioId: string
  modulo: Modulo
  accion: Accion
  bancoId?: BancoId
  categoria?: string
  monto?: number
  clienteId?: string
  distribuidorId?: string
}

export interface ValidacionPermisoResult {
  permitido: boolean
  razon?: string
  requiereAprobacion?: boolean
  aprobadorRolId?: string
  restriccionViolada?: string
  permisoId?: string
  rolId?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DATOS MOCK (En producción, esto vendría de la BD)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ROLES_MOCK: Rol[] = [
  {
    id: 'admin_supremo',
    codigo: 'admin_supremo',
    nombre: 'Administrador Supremo',
    descripcion: 'Control total del sistema sin restricciones',
    color: '#FFD700',
    icono: 'crown',
    esAdmin: true,
    esSistema: true,
    prioridad: 100,
    activo: true,
    permisos: [],
    creadoAt: new Date(),
  },
  {
    id: 'operador_general',
    codigo: 'operador_general',
    nombre: 'Operador General',
    descripcion: 'Puede realizar operaciones en todos los bancos',
    color: '#8B5CF6',
    icono: 'user-cog',
    esAdmin: false,
    esSistema: false,
    prioridad: 50,
    activo: true,
    permisos: [
      {
        id: 'op1',
        modulo: 'bancos',
        accion: 'ver',
        activo: true,
        restricciones: {
          bancosPermitidos: [],
          requiereAprobacion: false,
          motivoRequerido: false,
          referenciaRequerida: false,
        },
      },
      {
        id: 'op2',
        modulo: 'bancos',
        accion: 'ingreso',
        activo: true,
        restricciones: {
          bancosPermitidos: [],
          montoMaximo: 100000,
          requiereAprobacion: false,
          motivoRequerido: true,
          referenciaRequerida: false,
        },
      },
      {
        id: 'op3',
        modulo: 'bancos',
        accion: 'gasto',
        activo: true,
        restricciones: {
          bancosPermitidos: [],
          montoMaximo: 50000,
          requiereAprobacion: true,
          motivoRequerido: true,
          referenciaRequerida: true,
        },
      },
    ],
    creadoAt: new Date(),
  },
  {
    id: 'cajero_profit',
    codigo: 'cajero_profit',
    nombre: 'Cajero Profit',
    descripcion: 'Solo puede registrar ingresos en la bóveda Profit',
    color: '#10B981',
    icono: 'shield',
    esAdmin: false,
    esSistema: false,
    prioridad: 20,
    activo: true,
    permisos: [
      {
        id: 'cp1',
        modulo: 'bancos',
        accion: 'ver',
        activo: true,
        restricciones: {
          bancosPermitidos: ['profit'],
          requiereAprobacion: false,
          motivoRequerido: false,
          referenciaRequerida: false,
        },
      },
      {
        id: 'cp2',
        modulo: 'bancos',
        accion: 'ingreso',
        activo: true,
        restricciones: {
          bancosPermitidos: ['profit'],
          limiteDiario: 500000,
          limiteTransaccion: 50000,
          horaInicio: '08:00',
          horaFin: '20:00',
          diasPermitidos: [1, 2, 3, 4, 5, 6],
          requiereAprobacion: false,
          motivoRequerido: true,
          referenciaRequerida: true,
        },
      },
    ],
    creadoAt: new Date(),
  },
]

// Estado en memoria para desarrollo
let rolesState = [...ROLES_MOCK]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CRUD ROLES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtener todos los roles
 */
export async function getRoles(): Promise<{ success: boolean; data?: Rol[]; error?: string }> {
  try {
    return { success: true, data: rolesState }
  } catch (error) {
    logger.error('Error al obtener roles', error, { context: 'getRoles' })
    return { success: false, error: 'Error al obtener roles' }
  }
}

/**
 * Obtener un rol por ID
 */
export async function getRolById(id: string): Promise<{ success: boolean; data?: Rol; error?: string }> {
  try {
    const rol = rolesState.find(r => r.id === id)
    if (!rol) {
      return { success: false, error: 'Rol no encontrado' }
    }
    return { success: true, data: rol }
  } catch (error) {
    logger.error('Error al obtener rol', error, { context: 'getRolById', id })
    return { success: false, error: 'Error al obtener rol' }
  }
}

/**
 * Crear un nuevo rol
 */
export async function crearRol(
  input: Omit<Rol, 'id' | 'creadoAt' | 'esSistema'>,
  usuarioId: string,
  usuarioNombre: string
): Promise<{ success: boolean; data?: Rol; error?: string }> {
  try {
    const id = nanoid()
    const nuevoRol: Rol = {
      ...input,
      id,
      esSistema: false,
      creadoPor: usuarioId,
      creadoAt: new Date(),
    }
    
    rolesState.push(nuevoRol)
    
    // Registrar auditoría
    await registrarAuditoria({
      usuarioId,
      usuarioNombre,
      accion: 'crear',
      modulo: 'roles',
      entidadTipo: 'rol',
      entidadId: id,
      entidadNombre: input.nombre,
      descripcion: `Creó el rol "${input.nombre}"`,
      datosNuevos: nuevoRol as unknown as Record<string, unknown>,
      exitoso: true,
    })
    
    revalidatePath('/configuracion/roles')
    
    return { success: true, data: nuevoRol }
  } catch (error) {
    logger.error('Error al crear rol', error, { context: 'crearRol' })
    return { success: false, error: 'Error al crear rol' }
  }
}

/**
 * Actualizar un rol existente
 */
export async function actualizarRol(
  id: string,
  input: Partial<Rol>,
  usuarioId: string,
  usuarioNombre: string
): Promise<{ success: boolean; data?: Rol; error?: string }> {
  try {
    const index = rolesState.findIndex(r => r.id === id)
    if (index === -1) {
      return { success: false, error: 'Rol no encontrado' }
    }
    
    const rolAnterior = { ...rolesState[index] }
    
    if (rolAnterior.esSistema) {
      return { success: false, error: 'No se pueden modificar roles del sistema' }
    }
    
    const rolActualizado = {
      ...rolAnterior,
      ...input,
      id, // Mantener ID
      esSistema: false, // No permitir cambiar esto
      modificadoPor: usuarioId,
      modificadoAt: new Date(),
    } as Rol
    
    rolesState[index] = rolActualizado
    
    // Registrar auditoría
    await registrarAuditoria({
      usuarioId,
      usuarioNombre,
      accion: 'editar',
      modulo: 'roles',
      entidadTipo: 'rol',
      entidadId: id,
      entidadNombre: rolActualizado.nombre,
      descripcion: `Actualizó el rol "${rolActualizado.nombre}"`,
      datosAnteriores: rolAnterior as unknown as Record<string, unknown>,
      datosNuevos: rolActualizado as unknown as Record<string, unknown>,
      exitoso: true,
    })
    
    revalidatePath('/configuracion/roles')
    
    return { success: true, data: rolActualizado }
  } catch (error) {
    logger.error('Error al actualizar rol', error, { context: 'actualizarRol', id })
    return { success: false, error: 'Error al actualizar rol' }
  }
}

/**
 * Eliminar un rol
 */
export async function eliminarRol(
  id: string,
  usuarioId: string,
  usuarioNombre: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const index = rolesState.findIndex(r => r.id === id)
    if (index === -1) {
      return { success: false, error: 'Rol no encontrado' }
    }
    
    const rol = rolesState[index]
    
    if (!rol) {
      return { success: false, error: 'Rol no encontrado' }
    }
    
    if (rol.esSistema) {
      return { success: false, error: 'No se pueden eliminar roles del sistema' }
    }
    
    rolesState.splice(index, 1)
    
    // Registrar auditoría
    await registrarAuditoria({
      usuarioId,
      usuarioNombre,
      accion: 'eliminar',
      modulo: 'roles',
      entidadTipo: 'rol',
      entidadId: id,
      entidadNombre: rol.nombre,
      descripcion: `Eliminó el rol "${rol.nombre}"`,
      datosAnteriores: rol as unknown as Record<string, unknown>,
      exitoso: true,
    })
    
    revalidatePath('/configuracion/roles')
    
    return { success: true }
  } catch (error) {
    logger.error('Error al eliminar rol', error, { context: 'eliminarRol', id })
    return { success: false, error: 'Error al eliminar rol' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VALIDACIÓN DE PERMISOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Validar si un usuario tiene permiso para realizar una acción
 */
export async function validarPermiso(
  input: ValidacionPermisoInput
): Promise<{ success: boolean; data?: ValidacionPermisoResult; error?: string }> {
  try {
    const ahora = new Date()
    const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`
    const diaActual = ahora.getDay()
    
    // En producción, obtener roles del usuario desde BD
    // Por ahora, asumir operador_general para demo
    const rolesUsuario = rolesState.filter(r => 
      r.id === 'operador_general' && r.activo
    )
    
    // Si tiene rol admin, permitir todo
    if (rolesUsuario.some(r => r.esAdmin)) {
      return { 
        success: true, 
        data: { permitido: true } 
      }
    }
    
    // Buscar permisos que coincidan
    for (const rol of rolesUsuario) {
      for (const permiso of rol.permisos) {
        if (permiso.modulo !== input.modulo || permiso.accion !== input.accion || !permiso.activo) {
          continue
        }
        
        const { restricciones } = permiso
        
        // Validar banco
        if (input.bancoId && restricciones.bancosPermitidos.length > 0) {
          if (!restricciones.bancosPermitidos.includes(input.bancoId)) {
            continue // Probar siguiente permiso
          }
        }
        
        // Validar monto máximo
        if (input.monto !== undefined && restricciones.montoMaximo !== undefined) {
          if (input.monto > restricciones.montoMaximo) {
            return {
              success: true,
              data: {
                permitido: false,
                razon: `El monto máximo permitido es $${restricciones.montoMaximo.toLocaleString()}`,
                restriccionViolada: 'montoMaximo',
                permisoId: permiso.id,
                rolId: rol.id,
              },
            }
          }
        }
        
        // Validar límite por transacción
        if (input.monto !== undefined && restricciones.limiteTransaccion !== undefined) {
          if (input.monto > restricciones.limiteTransaccion) {
            return {
              success: true,
              data: {
                permitido: false,
                razon: `El límite por transacción es $${restricciones.limiteTransaccion.toLocaleString()}`,
                restriccionViolada: 'limiteTransaccion',
                permisoId: permiso.id,
                rolId: rol.id,
              },
            }
          }
        }
        
        // Validar horario
        if (restricciones.horaInicio && restricciones.horaFin) {
          if (horaActual < restricciones.horaInicio || horaActual > restricciones.horaFin) {
            return {
              success: true,
              data: {
                permitido: false,
                razon: `Esta operación solo está permitida entre ${restricciones.horaInicio} y ${restricciones.horaFin}`,
                restriccionViolada: 'horario',
                permisoId: permiso.id,
                rolId: rol.id,
              },
            }
          }
        }
        
        // Validar días permitidos
        if (restricciones.diasPermitidos && restricciones.diasPermitidos.length > 0) {
          if (!restricciones.diasPermitidos.includes(diaActual)) {
            const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
            const diasStr = restricciones.diasPermitidos.map(d => dias[d]).join(', ')
            return {
              success: true,
              data: {
                permitido: false,
                razon: `Esta operación solo está permitida los días: ${diasStr}`,
                restriccionViolada: 'diasPermitidos',
                permisoId: permiso.id,
                rolId: rol.id,
              },
            }
          }
        }
        
        // Verificar si requiere aprobación
        if (restricciones.requiereAprobacion) {
          // Si hay monto de aprobación, verificar
          if (restricciones.montoRequiereAprobacion && input.monto !== undefined) {
            if (input.monto >= restricciones.montoRequiereAprobacion) {
              return {
                success: true,
                data: {
                  permitido: true,
                  requiereAprobacion: true,
                  aprobadorRolId: restricciones.aprobadorRolId,
                },
              }
            }
          } else {
            return {
              success: true,
              data: {
                permitido: true,
                requiereAprobacion: true,
                aprobadorRolId: restricciones.aprobadorRolId,
              },
            }
          }
        }
        
        // Permiso válido encontrado
        return {
          success: true,
          data: {
            permitido: true,
            permisoId: permiso.id,
            rolId: rol.id,
          },
        }
      }
    }
    
    // No se encontró permiso válido
    return {
      success: true,
      data: {
        permitido: false,
        razon: `No tienes permiso para ${input.accion} en ${input.modulo}`,
      },
    }
  } catch (error) {
    logger.error('Error al validar permiso', error, { context: 'validarPermiso', input })
    return { success: false, error: 'Error al validar permiso' }
  }
}

/**
 * Obtener bancos accesibles para un usuario
 */
export async function getBancosAccesibles(
  usuarioId: string,
  accion: Accion = 'ver'
): Promise<{ success: boolean; data?: BancoId[]; error?: string }> {
  try {
    // En producción, obtener roles del usuario y calcular bancos accesibles
    // Por ahora retornar todos
    const todosBancos: BancoId[] = [
      'boveda_monte', 'boveda_usa', 'profit', 'leftie', 'azteca', 'flete_sur', 'utilidades'
    ]
    
    return { success: true, data: todosBancos }
  } catch (error) {
    logger.error('Error al obtener bancos accesibles', error, { context: 'getBancosAccesibles', usuarioId })
    return { success: false, error: 'Error al obtener bancos' }
  }
}

/**
 * Obtener acciones permitidas en un módulo para un usuario
 */
export async function getAccionesPermitidas(
  usuarioId: string,
  modulo: Modulo,
  bancoId?: BancoId
): Promise<{ success: boolean; data?: Accion[]; error?: string }> {
  try {
    // En producción, calcular basado en roles del usuario
    // Por ahora retornar acciones comunes
    const acciones: Accion[] = ['ver', 'crear', 'editar', 'exportar']
    
    if (modulo === 'bancos') {
      acciones.push('ingreso', 'gasto', 'transferir')
    }
    
    return { success: true, data: acciones }
  } catch (error) {
    logger.error('Error al obtener acciones permitidas', error, { context: 'getAccionesPermitidas' })
    return { success: false, error: 'Error al obtener acciones' }
  }
}
