// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔐 PERMISSIONS SERVICE — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de verificación y gestión de permisos:
 * - Verificación granular por módulo, acción y recurso
 * - Cache de permisos para rendimiento
 * - Auditoría automática de acciones
 * - Restricciones por banco, horario, IP, etc.
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { db } from '@/database'
import {
  permisos,
  roles,
  rolesPermisos,
  usuariosExtendido,
  usuariosPermisos,
  auditoria,
  sesiones,
  type Permiso,
  type UsuarioExtendido,
} from '@/database/schema-permisos'
import { usuarios } from '@/database/schema'
import { and, eq, inArray } from 'drizzle-orm'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type Modulo =
  | 'dashboard'
  | 'bancos'
  | 'ventas'
  | 'clientes'
  | 'distribuidores'
  | 'ordenes'
  | 'inventario'
  | 'gastos'
  | 'abonos'
  | 'transferencias'
  | 'reportes'
  | 'cortes'
  | 'configuracion'
  | 'usuarios'

export type Accion = 'ver' | 'crear' | 'editar' | 'eliminar' | 'exportar' | 'aprobar'

export type BancoId =
  | 'boveda_monte'
  | 'boveda_usa'
  | 'profit'
  | 'leftie'
  | 'azteca'
  | 'flete_sur'
  | 'utilidades'

export interface PermissionCheck {
  modulo: Modulo
  accion: Accion
  recurso?: string // Banco específico u otro recurso
  monto?: number // Para verificar límites
}

export interface PermissionContext {
  usuarioId: string
  ip?: string
  userAgent?: string
  dispositivo?: string
}

export interface PermissionResult {
  permitido: boolean
  razon?: string
  requiereAprobacion?: boolean
}

export interface AuditoriaData {
  usuarioId: string
  usuarioNombre?: string
  accion: 'crear' | 'editar' | 'eliminar' | 'ver' | 'exportar' | 'login' | 'logout' | 'error'
  modulo: string
  recurso?: string
  recursoId?: string
  descripcion?: string
  datosAntes?: Record<string, unknown>
  datosDespues?: Record<string, unknown>
  cambios?: Record<string, unknown>
  ip?: string
  userAgent?: string
  dispositivo?: string
  exitoso?: boolean
  errorMensaje?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CACHE DE PERMISOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CachedPermissions {
  permisos: Set<string>
  bancosPermitidos: string[]
  limiteMontoOperacion?: number
  limiteDiario?: number
  requiereAprobacion: boolean
  montoRequiereAprobacion?: number
  horaInicioAcceso?: string
  horaFinAcceso?: string
  diasPermitidos?: number[]
  ipsPermitidas?: string[]
  cachedAt: number
}

const permissionsCache = new Map<string, CachedPermissions>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FUNCIONES PRINCIPALES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtiene todos los permisos de un usuario (rol + específicos)
 */
export async function obtenerPermisosUsuario(usuarioId: string): Promise<CachedPermissions | null> {
  // Verificar cache
  const cached = permissionsCache.get(usuarioId)
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return cached
  }

  try {
    // Obtener usuario extendido
    const usuarioExt = await db.query.usuariosExtendido.findFirst({
      where: eq(usuariosExtendido.usuarioId, usuarioId),
      with: {
        rol: {
          with: {
            permisos: {
              with: {
                permiso: true,
              },
            },
          },
        },
        permisosEspecificos: {
          with: {
            permiso: true,
          },
        },
      },
    })

    if (!usuarioExt) {
      return null
    }

    // Construir set de permisos
    const permisosSet = new Set<string>()

    // Es admin tiene todos los permisos
    if (usuarioExt.rol?.esAdmin) {
      permisosSet.add('*') // Wildcard para admin
    } else {
      // Agregar permisos del rol
      usuarioExt.rol?.permisos?.forEach((rp) => {
        if (rp.permiso) {
          permisosSet.add(rp.permiso.codigo)
        }
      })

      // Procesar permisos específicos (override)
      usuarioExt.permisosEspecificos?.forEach((up) => {
        if (up.concedido) {
          permisosSet.add(up.permiso.codigo)
        } else {
          permisosSet.delete(up.permiso.codigo)
        }
      })
    }

    // Parsear restricciones
    const bancosPermitidos = usuarioExt.bancosPermitidos
      ? JSON.parse(usuarioExt.bancosPermitidos)
      : []
    const diasPermitidos = usuarioExt.diasPermitidos
      ? JSON.parse(usuarioExt.diasPermitidos)
      : undefined
    const ipsPermitidas = usuarioExt.ipsPermitidas
      ? JSON.parse(usuarioExt.ipsPermitidas)
      : undefined

    const result: CachedPermissions = {
      permisos: permisosSet,
      bancosPermitidos,
      limiteMontoOperacion: usuarioExt.limiteMontoOperacion || undefined,
      limiteDiario: usuarioExt.limiteDiario || undefined,
      requiereAprobacion: usuarioExt.requiereAprobacion || false,
      montoRequiereAprobacion: usuarioExt.montoRequiereAprobacion || undefined,
      horaInicioAcceso: usuarioExt.horaInicioAcceso || undefined,
      horaFinAcceso: usuarioExt.horaFinAcceso || undefined,
      diasPermitidos,
      ipsPermitidas,
      cachedAt: Date.now(),
    }

    // Guardar en cache
    permissionsCache.set(usuarioId, result)

    return result
  } catch (error) {
    console.error('Error obteniendo permisos:', error)
    return null
  }
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export async function verificarPermiso(
  context: PermissionContext,
  check: PermissionCheck
): Promise<PermissionResult> {
  const permisos = await obtenerPermisosUsuario(context.usuarioId)

  if (!permisos) {
    return { permitido: false, razon: 'Usuario no encontrado o sin configuración de permisos' }
  }

  // Admin tiene todos los permisos
  if (permisos.permisos.has('*')) {
    return { permitido: true }
  }

  // Verificar horario de acceso
  if (permisos.horaInicioAcceso && permisos.horaFinAcceso) {
    const ahora = new Date()
    const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`

    if (horaActual < permisos.horaInicioAcceso || horaActual > permisos.horaFinAcceso) {
      return {
        permitido: false,
        razon: `Acceso permitido solo entre ${permisos.horaInicioAcceso} y ${permisos.horaFinAcceso}`,
      }
    }
  }

  // Verificar día de la semana
  if (permisos.diasPermitidos) {
    const diaActual = new Date().getDay()
    if (!permisos.diasPermitidos.includes(diaActual)) {
      return { permitido: false, razon: 'Acceso no permitido en este día' }
    }
  }

  // Verificar IP
  if (permisos.ipsPermitidas && permisos.ipsPermitidas.length > 0 && context.ip) {
    if (!permisos.ipsPermitidas.includes(context.ip)) {
      return { permitido: false, razon: 'IP no autorizada' }
    }
  }

  // Verificar restricción de banco
  if (check.recurso && permisos.bancosPermitidos.length > 0) {
    if (!permisos.bancosPermitidos.includes(check.recurso)) {
      return { permitido: false, razon: `No tienes acceso al banco: ${check.recurso}` }
    }
  }

  // Construir código de permiso
  const codigoPermiso = check.recurso
    ? `${check.modulo}.${check.recurso}.${check.accion}`
    : `${check.modulo}.${check.accion}`

  const codigoPermisoGeneral = `${check.modulo}.${check.accion}`

  // Verificar permiso específico o general
  const tienePermiso =
    permisos.permisos.has(codigoPermiso) ||
    permisos.permisos.has(codigoPermisoGeneral) ||
    permisos.permisos.has(`${check.modulo}.*`)

  if (!tienePermiso) {
    return { permitido: false, razon: 'No tienes permiso para realizar esta acción' }
  }

  // Verificar límite de monto
  if (check.monto && permisos.limiteMontoOperacion) {
    if (check.monto > permisos.limiteMontoOperacion) {
      return {
        permitido: false,
        razon: `El monto excede tu límite por operación ($${permisos.limiteMontoOperacion.toLocaleString()})`,
      }
    }
  }

  // Verificar si requiere aprobación
  if (
    permisos.requiereAprobacion &&
    check.monto &&
    permisos.montoRequiereAprobacion &&
    check.monto >= permisos.montoRequiereAprobacion
  ) {
    return {
      permitido: true,
      requiereAprobacion: true,
      razon: `El monto requiere aprobación (>=$${permisos.montoRequiereAprobacion.toLocaleString()})`,
    }
  }

  return { permitido: true }
}

/**
 * Registra una acción en la auditoría
 */
export async function registrarAuditoria(data: AuditoriaData): Promise<void> {
  try {
    await db.insert(auditoria).values({
      id: crypto.randomUUID(),
      usuarioId: data.usuarioId,
      usuarioNombre: data.usuarioNombre,
      accion: data.accion,
      modulo: data.modulo,
      recurso: data.recurso,
      recursoId: data.recursoId,
      descripcion: data.descripcion,
      datosAntes: data.datosAntes ? JSON.stringify(data.datosAntes) : undefined,
      datosDespues: data.datosDespues ? JSON.stringify(data.datosDespues) : undefined,
      cambios: data.cambios ? JSON.stringify(data.cambios) : undefined,
      ip: data.ip,
      userAgent: data.userAgent,
      dispositivo: data.dispositivo,
      exitoso: data.exitoso ?? true,
      errorMensaje: data.errorMensaje,
      fecha: Math.floor(Date.now() / 1000),
    })
  } catch (error) {
    console.error('Error registrando auditoría:', error)
  }
}

/**
 * Invalida el cache de permisos de un usuario
 */
export function invalidarCachePermisos(usuarioId: string): void {
  permissionsCache.delete(usuarioId)
}

/**
 * Invalida todo el cache de permisos
 */
export function invalidarTodoElCache(): void {
  permissionsCache.clear()
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FUNCIONES DE GESTIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Crea un nuevo rol
 */
export async function crearRol(data: {
  nombre: string
  descripcion?: string
  color?: string
  icono?: string
  esAdmin?: boolean
  permisosIds?: string[]
}): Promise<string> {
  const id = crypto.randomUUID()

  await db.insert(roles).values({
    id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    color: data.color,
    icono: data.icono,
    esAdmin: data.esAdmin || false,
    activo: true,
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
  })

  // Asignar permisos
  if (data.permisosIds && data.permisosIds.length > 0) {
    await db.insert(rolesPermisos).values(
      data.permisosIds.map((permisoId) => ({
        id: crypto.randomUUID(),
        rolId: id,
        permisoId,
        createdAt: Math.floor(Date.now() / 1000),
      }))
    )
  }

  return id
}

/**
 * Asigna un rol a un usuario
 */
export async function asignarRolUsuario(
  usuarioId: string,
  rolId: string,
  opciones?: {
    bancosPermitidos?: string[]
    limiteMontoOperacion?: number
    limiteDiario?: number
    requiereAprobacion?: boolean
    montoRequiereAprobacion?: number
    horaInicioAcceso?: string
    horaFinAcceso?: string
    diasPermitidos?: number[]
  }
): Promise<void> {
  const id = crypto.randomUUID()

  await db.insert(usuariosExtendido).values({
    id,
    usuarioId,
    rolId,
    bancosPermitidos: opciones?.bancosPermitidos
      ? JSON.stringify(opciones.bancosPermitidos)
      : undefined,
    limiteMontoOperacion: opciones?.limiteMontoOperacion,
    limiteDiario: opciones?.limiteDiario,
    requiereAprobacion: opciones?.requiereAprobacion,
    montoRequiereAprobacion: opciones?.montoRequiereAprobacion,
    horaInicioAcceso: opciones?.horaInicioAcceso,
    horaFinAcceso: opciones?.horaFinAcceso,
    diasPermitidos: opciones?.diasPermitidos
      ? JSON.stringify(opciones.diasPermitidos)
      : undefined,
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
  })

  // Invalidar cache
  invalidarCachePermisos(usuarioId)
}

/**
 * Inicializa los permisos del sistema (seed)
 */
export async function inicializarPermisos(): Promise<void> {
  const modulosYAcciones = {
    dashboard: ['ver'],
    bancos: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    ventas: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    clientes: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    distribuidores: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    ordenes: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    inventario: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    gastos: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    abonos: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    transferencias: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    reportes: ['ver', 'exportar'],
    cortes: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    configuracion: ['ver', 'editar'],
    usuarios: ['ver', 'crear', 'editar', 'eliminar'],
  } as const

  const bancosIds: BancoId[] = [
    'boveda_monte',
    'boveda_usa',
    'profit',
    'leftie',
    'azteca',
    'flete_sur',
    'utilidades',
  ]

  const permisosData: Array<{
    codigo: string
    nombre: string
    descripcion: string
    modulo: Modulo
    accion: Accion
    recurso?: string
  }> = []

  // Generar permisos generales
  for (const [modulo, acciones] of Object.entries(modulosYAcciones)) {
    for (const accion of acciones) {
      permisosData.push({
        codigo: `${modulo}.${accion}`,
        nombre: `${accion.charAt(0).toUpperCase() + accion.slice(1)} ${modulo}`,
        descripcion: `Permite ${accion} en el módulo ${modulo}`,
        modulo: modulo as Modulo,
        accion: accion as Accion,
      })
    }
  }

  // Generar permisos específicos por banco
  for (const bancoId of bancosIds) {
    const accionesBanco = ['ver', 'crear', 'editar'] as const
    for (const accion of accionesBanco) {
      permisosData.push({
        codigo: `bancos.${bancoId}.${accion}`,
        nombre: `${accion.charAt(0).toUpperCase() + accion.slice(1)} en ${bancoId}`,
        descripcion: `Permite ${accion} operaciones en el banco ${bancoId}`,
        modulo: 'bancos',
        accion: accion as Accion,
        recurso: bancoId,
      })
    }
  }

  // Insertar permisos
  for (const permiso of permisosData) {
    try {
      await db.insert(permisos).values({
        id: crypto.randomUUID(),
        codigo: permiso.codigo,
        nombre: permiso.nombre,
        descripcion: permiso.descripcion,
        modulo: permiso.modulo,
        accion: permiso.accion,
        recurso: permiso.recurso,
        activo: true,
        createdAt: Math.floor(Date.now() / 1000),
      })
    } catch (error) {
      // Ignorar si ya existe
    }
  }

  console.log(`Permisos inicializados: ${permisosData.length}`)
}

export default {
  obtenerPermisosUsuario,
  verificarPermiso,
  registrarAuditoria,
  invalidarCachePermisos,
  invalidarTodoElCache,
  crearRol,
  asignarRolUsuario,
  inicializarPermisos,
}
