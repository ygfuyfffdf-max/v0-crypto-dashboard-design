// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔐 CHRONOS INFINITY 2026 — SISTEMA DE PERMISOS GRANULARES SUPREMO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de permisos ultra-granulares con:
 * - Restricciones por banco específico (ej: solo Profit)
 * - Restricciones por tipo de operación (ej: solo ingresos)
 * - Restricciones por hora/día
 * - Restricciones por monto máximo
 * - Restricciones por categoría
 * - Sistema de aprobaciones
 * - Auditoría completa
 *
 * EJEMPLO: Usuario que solo puede registrar ingresos a Profit
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Módulos del sistema
 */
export type ModuloSistema =
  | 'bancos'
  | 'ventas'
  | 'clientes'
  | 'distribuidores'
  | 'almacen'
  | 'ordenes_compra'
  | 'reportes'
  | 'configuracion'
  | 'usuarios'
  | 'auditoria'

/**
 * Acciones posibles en cada módulo
 */
export type AccionModulo =
  | 'ver'
  | 'crear'
  | 'editar'
  | 'eliminar'
  | 'exportar'
  | 'aprobar'
  | 'cancelar'
  | 'transferir'
  | 'ingreso'
  | 'gasto'
  | 'ajuste'
  | 'corte'

/**
 * Bancos/Bóvedas disponibles
 */
export type BancoId =
  | 'boveda_monte'
  | 'boveda_usa'
  | 'profit'
  | 'leftie'
  | 'azteca'
  | 'flete_sur'
  | 'utilidades'

/**
 * Categorías de transacciones
 */
export type CategoriaTransaccion =
  | 'ventas'
  | 'pagos_distribuidores'
  | 'gastos_operativos'
  | 'nomina'
  | 'servicios'
  | 'transferencias_internas'
  | 'retiros'
  | 'depositos'
  | 'ajustes'
  | 'otros'

/**
 * Configuración granular de un permiso
 */
export interface PermisoGranular {
  id: string
  modulo: ModuloSistema
  accion: AccionModulo
  activo: boolean

  // Restricciones específicas
  restricciones: {
    // Bancos permitidos (vacío = todos)
    bancosPermitidos: BancoId[]

    // Categorías permitidas (vacío = todas)
    categoriasPermitidas: CategoriaTransaccion[]

    // Límites de monto
    montoMinimo?: number
    montoMaximo?: number
    limiteDiario?: number
    limiteTransaccion?: number

    // Restricciones de tiempo
    horaInicio?: string // "08:00"
    horaFin?: string    // "18:00"
    diasPermitidos?: number[] // [1,2,3,4,5] = Lun-Vie

    // Requisitos adicionales
    requiereAprobacion: boolean
    aprobadorRequerido?: string // ID del usuario aprobador
    motivoRequerido: boolean
    referenciaRequerida: boolean

    // Restricciones de cliente/distribuidor
    clientesPermitidos?: string[] // IDs
    distribuidoresPermitidos?: string[] // IDs

    // Restricciones geográficas (IP)
    ipsPermitidas?: string[]
    dispositivosPermitidos?: string[]
  }
}

/**
 * Rol personalizado con permisos granulares
 */
export interface RolGranular {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  color: string
  icono: string

  // Configuración
  esAdmin: boolean
  activo: boolean
  prioridad: number

  // Permisos granulares
  permisos: PermisoGranular[]

  // Metadata
  creadoPor: string
  creadoAt: number
  modificadoPor?: string
  modificadoAt?: number
}

/**
 * Usuario con permisos granulares asignados
 */
export interface UsuarioGranular {
  id: string
  email: string
  nombre: string
  avatarUrl?: string

  // Roles asignados (pueden ser múltiples)
  rolesIds: string[]

  // Overrides específicos del usuario (sobrescriben los roles)
  permisosOverride?: PermisoGranular[]

  // Restricciones adicionales del usuario
  restriccionesUsuario: {
    bancosPermitidos: BancoId[]
    limiteGlobalDiario?: number
    limiteGlobalTransaccion?: number
    horaInicioAcceso?: string
    horaFinAcceso?: string
    diasPermitidos?: number[]
    requiereAprobacionGlobal: boolean
    bloqueado: boolean
    motivoBloqueo?: string
  }

  // Auditoría
  ultimoAcceso?: number
  ultimaIp?: string
  ultimoDispositivo?: string
  intentosFallidos: number
}

/**
 * Solicitud de validación de permiso
 */
export interface SolicitudPermiso {
  usuarioId: string
  modulo: ModuloSistema
  accion: AccionModulo

  // Contexto de la operación
  contexto: {
    bancoId?: BancoId
    categoria?: CategoriaTransaccion
    monto?: number
    clienteId?: string
    distribuidorId?: string
    ip?: string
    dispositivo?: string
    timestamp?: number
  }
}

/**
 * Resultado de validación de permiso
 */
export interface ResultadoPermiso {
  permitido: boolean
  razon?: string
  detalles?: {
    permisoId?: string
    rolId?: string
    restriccionViolada?: string
  }
  requiereAprobacion?: boolean
  aprobadorRequerido?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Información de los bancos/bóvedas
 */
export const BANCOS_INFO: Record<BancoId, { nombre: string; color: string; icono: string }> = {
  boveda_monte: { nombre: 'Bóveda Monte', color: '#FFD700', icono: 'vault' },
  boveda_usa: { nombre: 'Bóveda USA', color: '#228B22', icono: 'dollar' },
  profit: { nombre: 'Profit', color: '#8B5CF6', icono: 'trending-up' },
  leftie: { nombre: 'Leftie', color: '#FF1493', icono: 'credit-card' },
  azteca: { nombre: 'Azteca', color: '#FF4500', icono: 'building' },
  flete_sur: { nombre: 'Flete Sur', color: '#00CED1', icono: 'truck' },
  utilidades: { nombre: 'Utilidades', color: '#32CD32', icono: 'percent' },
}

/**
 * Información de categorías
 */
export const CATEGORIAS_INFO: Record<CategoriaTransaccion, { nombre: string; icono: string }> = {
  ventas: { nombre: 'Ventas', icono: 'shopping-cart' },
  pagos_distribuidores: { nombre: 'Pagos a Distribuidores', icono: 'truck' },
  gastos_operativos: { nombre: 'Gastos Operativos', icono: 'file-text' },
  nomina: { nombre: 'Nómina', icono: 'users' },
  servicios: { nombre: 'Servicios', icono: 'settings' },
  transferencias_internas: { nombre: 'Transferencias Internas', icono: 'arrow-left-right' },
  retiros: { nombre: 'Retiros', icono: 'arrow-up' },
  depositos: { nombre: 'Depósitos', icono: 'arrow-down' },
  ajustes: { nombre: 'Ajustes', icono: 'edit' },
  otros: { nombre: 'Otros', icono: 'more-horizontal' },
}

/**
 * Templates de roles predefinidos
 */
export const ROLES_PREDEFINIDOS: Omit<RolGranular, 'id' | 'creadoPor' | 'creadoAt'>[] = [
  {
    codigo: 'admin_supremo',
    nombre: 'Administrador Supremo',
    descripcion: 'Control total del sistema sin restricciones',
    color: '#FFD700',
    icono: 'crown',
    esAdmin: true,
    activo: true,
    prioridad: 100,
    permisos: [], // Admin tiene todos los permisos implícitamente
  },
  {
    codigo: 'operador_general',
    nombre: 'Operador General',
    descripcion: 'Puede realizar operaciones en todos los bancos',
    color: '#8B5CF6',
    icono: 'user-cog',
    esAdmin: false,
    activo: true,
    prioridad: 50,
    permisos: [
      {
        id: 'op_gen_bancos_ver',
        modulo: 'bancos',
        accion: 'ver',
        activo: true,
        restricciones: {
          bancosPermitidos: [],
          categoriasPermitidas: [],
          requiereAprobacion: false,
          motivoRequerido: false,
          referenciaRequerida: false,
        },
      },
      {
        id: 'op_gen_bancos_ingreso',
        modulo: 'bancos',
        accion: 'ingreso',
        activo: true,
        restricciones: {
          bancosPermitidos: [],
          categoriasPermitidas: [],
          montoMaximo: 100000,
          requiereAprobacion: false,
          motivoRequerido: true,
          referenciaRequerida: false,
        },
      },
      {
        id: 'op_gen_bancos_gasto',
        modulo: 'bancos',
        accion: 'gasto',
        activo: true,
        restricciones: {
          bancosPermitidos: [],
          categoriasPermitidas: [],
          montoMaximo: 50000,
          requiereAprobacion: true,
          motivoRequerido: true,
          referenciaRequerida: true,
        },
      },
    ],
  },
  {
    codigo: 'cajero_profit',
    nombre: 'Cajero Profit',
    descripcion: 'Solo puede registrar ingresos en la bóveda Profit',
    color: '#10B981',
    icono: 'dollar-sign',
    esAdmin: false,
    activo: true,
    prioridad: 20,
    permisos: [
      {
        id: 'cajero_profit_ver',
        modulo: 'bancos',
        accion: 'ver',
        activo: true,
        restricciones: {
          bancosPermitidos: ['profit'],
          categoriasPermitidas: [],
          requiereAprobacion: false,
          motivoRequerido: false,
          referenciaRequerida: false,
        },
      },
      {
        id: 'cajero_profit_ingreso',
        modulo: 'bancos',
        accion: 'ingreso',
        activo: true,
        restricciones: {
          bancosPermitidos: ['profit'],
          categoriasPermitidas: ['ventas', 'depositos'],
          limiteDiario: 500000,
          limiteTransaccion: 50000,
          horaInicio: '08:00',
          horaFin: '20:00',
          diasPermitidos: [1, 2, 3, 4, 5, 6], // Lun-Sab
          requiereAprobacion: false,
          motivoRequerido: true,
          referenciaRequerida: true,
        },
      },
    ],
  },
  {
    codigo: 'tesorero_boveda',
    nombre: 'Tesorero de Bóvedas',
    descripcion: 'Maneja transferencias entre bóvedas principales',
    color: '#F59E0B',
    icono: 'vault',
    esAdmin: false,
    activo: true,
    prioridad: 40,
    permisos: [
      {
        id: 'tesorero_ver',
        modulo: 'bancos',
        accion: 'ver',
        activo: true,
        restricciones: {
          bancosPermitidos: ['boveda_monte', 'boveda_usa', 'profit'],
          categoriasPermitidas: [],
          requiereAprobacion: false,
          motivoRequerido: false,
          referenciaRequerida: false,
        },
      },
      {
        id: 'tesorero_transferir',
        modulo: 'bancos',
        accion: 'transferir',
        activo: true,
        restricciones: {
          bancosPermitidos: ['boveda_monte', 'boveda_usa', 'profit'],
          categoriasPermitidas: ['transferencias_internas'],
          montoMaximo: 200000,
          requiereAprobacion: true,
          motivoRequerido: true,
          referenciaRequerida: true,
        },
      },
    ],
  },
  {
    codigo: 'pagador_distribuidores',
    nombre: 'Pagador de Distribuidores',
    descripcion: 'Solo puede realizar pagos a distribuidores desde Leftie',
    color: '#EC4899',
    icono: 'truck',
    esAdmin: false,
    activo: true,
    prioridad: 25,
    permisos: [
      {
        id: 'pagador_ver',
        modulo: 'bancos',
        accion: 'ver',
        activo: true,
        restricciones: {
          bancosPermitidos: ['leftie'],
          categoriasPermitidas: [],
          requiereAprobacion: false,
          motivoRequerido: false,
          referenciaRequerida: false,
        },
      },
      {
        id: 'pagador_gasto',
        modulo: 'bancos',
        accion: 'gasto',
        activo: true,
        restricciones: {
          bancosPermitidos: ['leftie'],
          categoriasPermitidas: ['pagos_distribuidores'],
          montoMaximo: 100000,
          requiereAprobacion: true,
          motivoRequerido: true,
          referenciaRequerida: true,
        },
      },
      {
        id: 'pagador_dist_ver',
        modulo: 'distribuidores',
        accion: 'ver',
        activo: true,
        restricciones: {
          bancosPermitidos: [],
          categoriasPermitidas: [],
          requiereAprobacion: false,
          motivoRequerido: false,
          referenciaRequerida: false,
        },
      },
    ],
  },
  {
    codigo: 'visor_reportes',
    nombre: 'Visor de Reportes',
    descripcion: 'Solo puede ver información y exportar reportes',
    color: '#06B6D4',
    icono: 'eye',
    esAdmin: false,
    activo: true,
    prioridad: 10,
    permisos: [
      {
        id: 'visor_bancos',
        modulo: 'bancos',
        accion: 'ver',
        activo: true,
        restricciones: {
          bancosPermitidos: [],
          categoriasPermitidas: [],
          requiereAprobacion: false,
          motivoRequerido: false,
          referenciaRequerida: false,
        },
      },
      {
        id: 'visor_reportes_ver',
        modulo: 'reportes',
        accion: 'ver',
        activo: true,
        restricciones: {
          bancosPermitidos: [],
          categoriasPermitidas: [],
          requiereAprobacion: false,
          motivoRequerido: false,
          referenciaRequerida: false,
        },
      },
      {
        id: 'visor_reportes_exportar',
        modulo: 'reportes',
        accion: 'exportar',
        activo: true,
        restricciones: {
          bancosPermitidos: [],
          categoriasPermitidas: [],
          requiereAprobacion: true,
          motivoRequerido: true,
          referenciaRequerida: false,
        },
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Valida si un usuario tiene permiso para realizar una acción
 */
export function validarPermiso(
  usuario: UsuarioGranular,
  roles: RolGranular[],
  solicitud: SolicitudPermiso
): ResultadoPermiso {
  const ahora = solicitud.contexto.timestamp || Date.now()
  const horaActual = new Date(ahora)
  const diaActual = horaActual.getDay() // 0 = Dom, 1 = Lun, etc.
  const horaString = `${horaActual.getHours().toString().padStart(2, '0')}:${horaActual.getMinutes().toString().padStart(2, '0')}`

  // Verificar si el usuario está bloqueado
  if (usuario.restriccionesUsuario.bloqueado) {
    return {
      permitido: false,
      razon: `Usuario bloqueado: ${usuario.restriccionesUsuario.motivoBloqueo || 'Sin motivo especificado'}`,
    }
  }

  // Verificar restricciones globales del usuario
  if (usuario.restriccionesUsuario.diasPermitidos?.length) {
    if (!usuario.restriccionesUsuario.diasPermitidos.includes(diaActual)) {
      return {
        permitido: false,
        razon: 'Acceso no permitido en este día de la semana',
      }
    }
  }

  if (usuario.restriccionesUsuario.horaInicioAcceso && usuario.restriccionesUsuario.horaFinAcceso) {
    if (horaString < usuario.restriccionesUsuario.horaInicioAcceso ||
        horaString > usuario.restriccionesUsuario.horaFinAcceso) {
      return {
        permitido: false,
        razon: `Acceso solo permitido entre ${usuario.restriccionesUsuario.horaInicioAcceso} y ${usuario.restriccionesUsuario.horaFinAcceso}`,
      }
    }
  }

  // Verificar restricción de banco global del usuario
  if (solicitud.contexto.bancoId && usuario.restriccionesUsuario.bancosPermitidos.length > 0) {
    if (!usuario.restriccionesUsuario.bancosPermitidos.includes(solicitud.contexto.bancoId)) {
      return {
        permitido: false,
        razon: `No tienes acceso al banco ${BANCOS_INFO[solicitud.contexto.bancoId]?.nombre}`,
        detalles: {
          restriccionViolada: 'bancosPermitidos',
        },
      }
    }
  }

  // Obtener roles activos del usuario
  const rolesUsuario = roles.filter(r => usuario.rolesIds.includes(r.id) && r.activo)

  // Si es admin, tiene todos los permisos
  if (rolesUsuario.some(r => r.esAdmin)) {
    return { permitido: true }
  }

  // Buscar permisos que coincidan
  const permisosCoincidentes: { permiso: PermisoGranular; rol: RolGranular }[] = []

  for (const rol of rolesUsuario) {
    for (const permiso of rol.permisos) {
      if (permiso.modulo === solicitud.modulo &&
          permiso.accion === solicitud.accion &&
          permiso.activo) {
        permisosCoincidentes.push({ permiso, rol })
      }
    }
  }

  // Agregar permisos override del usuario
  if (usuario.permisosOverride) {
    for (const permiso of usuario.permisosOverride) {
      if (permiso.modulo === solicitud.modulo &&
          permiso.accion === solicitud.accion &&
          permiso.activo) {
        // Los override tienen máxima prioridad
        permisosCoincidentes.unshift({
          permiso,
          rol: { id: 'override', prioridad: 999 } as RolGranular
        })
      }
    }
  }

  if (permisosCoincidentes.length === 0) {
    return {
      permitido: false,
      razon: `No tienes permiso para ${solicitud.accion} en ${solicitud.modulo}`,
    }
  }

  // Ordenar por prioridad (mayor primero)
  permisosCoincidentes.sort((a, b) => (b.rol.prioridad || 0) - (a.rol.prioridad || 0))

  // Validar restricciones del permiso con mayor prioridad
  const { permiso, rol } = permisosCoincidentes[0]
  const restricciones = permiso.restricciones

  // Validar banco permitido
  if (solicitud.contexto.bancoId && restricciones.bancosPermitidos.length > 0) {
    if (!restricciones.bancosPermitidos.includes(solicitud.contexto.bancoId)) {
      return {
        permitido: false,
        razon: `Esta acción solo está permitida en: ${restricciones.bancosPermitidos.map(b => BANCOS_INFO[b]?.nombre).join(', ')}`,
        detalles: {
          permisoId: permiso.id,
          rolId: rol.id,
          restriccionViolada: 'bancosPermitidos',
        },
      }
    }
  }

  // Validar categoría permitida
  if (solicitud.contexto.categoria && restricciones.categoriasPermitidas.length > 0) {
    if (!restricciones.categoriasPermitidas.includes(solicitud.contexto.categoria)) {
      return {
        permitido: false,
        razon: `Esta categoría no está permitida para esta operación`,
        detalles: {
          permisoId: permiso.id,
          rolId: rol.id,
          restriccionViolada: 'categoriasPermitidas',
        },
      }
    }
  }

  // Validar monto
  if (solicitud.contexto.monto !== undefined) {
    if (restricciones.montoMinimo !== undefined && solicitud.contexto.monto < restricciones.montoMinimo) {
      return {
        permitido: false,
        razon: `El monto mínimo permitido es ${restricciones.montoMinimo}`,
        detalles: {
          permisoId: permiso.id,
          rolId: rol.id,
          restriccionViolada: 'montoMinimo',
        },
      }
    }

    if (restricciones.montoMaximo !== undefined && solicitud.contexto.monto > restricciones.montoMaximo) {
      return {
        permitido: false,
        razon: `El monto máximo permitido es ${restricciones.montoMaximo}`,
        detalles: {
          permisoId: permiso.id,
          rolId: rol.id,
          restriccionViolada: 'montoMaximo',
        },
      }
    }

    if (restricciones.limiteTransaccion !== undefined && solicitud.contexto.monto > restricciones.limiteTransaccion) {
      return {
        permitido: false,
        razon: `El límite por transacción es ${restricciones.limiteTransaccion}`,
        detalles: {
          permisoId: permiso.id,
          rolId: rol.id,
          restriccionViolada: 'limiteTransaccion',
        },
      }
    }
  }

  // Validar horario
  if (restricciones.horaInicio && restricciones.horaFin) {
    if (horaString < restricciones.horaInicio || horaString > restricciones.horaFin) {
      return {
        permitido: false,
        razon: `Esta operación solo está permitida entre ${restricciones.horaInicio} y ${restricciones.horaFin}`,
        detalles: {
          permisoId: permiso.id,
          rolId: rol.id,
          restriccionViolada: 'horario',
        },
      }
    }
  }

  // Validar días permitidos
  if (restricciones.diasPermitidos && restricciones.diasPermitidos.length > 0) {
    if (!restricciones.diasPermitidos.includes(diaActual)) {
      const diasNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
      const diasPermitidosStr = restricciones.diasPermitidos.map(d => diasNombres[d]).join(', ')
      return {
        permitido: false,
        razon: `Esta operación solo está permitida los días: ${diasPermitidosStr}`,
        detalles: {
          permisoId: permiso.id,
          rolId: rol.id,
          restriccionViolada: 'diasPermitidos',
        },
      }
    }
  }

  // Validar cliente permitido
  if (solicitud.contexto.clienteId && restricciones.clientesPermitidos?.length) {
    if (!restricciones.clientesPermitidos.includes(solicitud.contexto.clienteId)) {
      return {
        permitido: false,
        razon: 'No tienes permiso para operar con este cliente',
        detalles: {
          permisoId: permiso.id,
          rolId: rol.id,
          restriccionViolada: 'clientesPermitidos',
        },
      }
    }
  }

  // Validar distribuidor permitido
  if (solicitud.contexto.distribuidorId && restricciones.distribuidoresPermitidos?.length) {
    if (!restricciones.distribuidoresPermitidos.includes(solicitud.contexto.distribuidorId)) {
      return {
        permitido: false,
        razon: 'No tienes permiso para operar con este distribuidor',
        detalles: {
          permisoId: permiso.id,
          rolId: rol.id,
          restriccionViolada: 'distribuidoresPermitidos',
        },
      }
    }
  }

  // Validar IP permitida
  if (solicitud.contexto.ip && restricciones.ipsPermitidas?.length) {
    if (!restricciones.ipsPermitidas.includes(solicitud.contexto.ip)) {
      return {
        permitido: false,
        razon: 'Acceso no permitido desde esta ubicación',
        detalles: {
          permisoId: permiso.id,
          rolId: rol.id,
          restriccionViolada: 'ipsPermitidas',
        },
      }
    }
  }

  // Verificar si requiere aprobación
  if (restricciones.requiereAprobacion || usuario.restriccionesUsuario.requiereAprobacionGlobal) {
    return {
      permitido: true,
      requiereAprobacion: true,
      aprobadorRequerido: restricciones.aprobadorRequerido,
    }
  }

  // TODO: Validar límite diario (requiere consulta a BD)

  logger.info('Permiso validado exitosamente', {
    context: 'GranularPermissions',
    data: {
      usuarioId: usuario.id,
      modulo: solicitud.modulo,
      accion: solicitud.accion,
      permisoId: permiso.id,
      rolId: rol.id,
    },
  })

  return { permitido: true }
}

/**
 * Obtiene los bancos a los que un usuario tiene acceso
 */
export function obtenerBancosAccesibles(
  usuario: UsuarioGranular,
  roles: RolGranular[],
  accion: AccionModulo = 'ver'
): BancoId[] {
  // Verificar restricción global del usuario primero
  if (usuario.restriccionesUsuario.bancosPermitidos.length > 0) {
    return usuario.restriccionesUsuario.bancosPermitidos
  }

  const rolesUsuario = roles.filter(r => usuario.rolesIds.includes(r.id) && r.activo)

  // Si es admin, tiene acceso a todos
  if (rolesUsuario.some(r => r.esAdmin)) {
    return Object.keys(BANCOS_INFO) as BancoId[]
  }

  const bancosAccesibles = new Set<BancoId>()

  for (const rol of rolesUsuario) {
    for (const permiso of rol.permisos) {
      if (permiso.modulo === 'bancos' && permiso.accion === accion && permiso.activo) {
        if (permiso.restricciones.bancosPermitidos.length === 0) {
          // Acceso a todos los bancos
          return Object.keys(BANCOS_INFO) as BancoId[]
        }
        permiso.restricciones.bancosPermitidos.forEach(b => bancosAccesibles.add(b))
      }
    }
  }

  return Array.from(bancosAccesibles)
}

/**
 * Obtiene las acciones permitidas para un usuario en un módulo específico
 */
export function obtenerAccionesPermitidas(
  usuario: UsuarioGranular,
  roles: RolGranular[],
  modulo: ModuloSistema,
  bancoId?: BancoId
): AccionModulo[] {
  const rolesUsuario = roles.filter(r => usuario.rolesIds.includes(r.id) && r.activo)

  // Si es admin, tiene todas las acciones
  if (rolesUsuario.some(r => r.esAdmin)) {
    return ['ver', 'crear', 'editar', 'eliminar', 'exportar', 'aprobar', 'cancelar', 'transferir', 'ingreso', 'gasto', 'ajuste', 'corte']
  }

  const accionesPermitidas = new Set<AccionModulo>()

  for (const rol of rolesUsuario) {
    for (const permiso of rol.permisos) {
      if (permiso.modulo === modulo && permiso.activo) {
        // Verificar si el banco está permitido
        if (bancoId && permiso.restricciones.bancosPermitidos.length > 0) {
          if (!permiso.restricciones.bancosPermitidos.includes(bancoId)) {
            continue
          }
        }
        accionesPermitidas.add(permiso.accion)
      }
    }
  }

  return Array.from(accionesPermitidas)
}

/**
 * Genera un resumen de permisos para un usuario
 */
export function generarResumenPermisos(
  usuario: UsuarioGranular,
  roles: RolGranular[]
): {
  modulo: ModuloSistema
  acciones: AccionModulo[]
  bancos: BancoId[]
  restricciones: string[]
}[] {
  const modulos: ModuloSistema[] = [
    'bancos', 'ventas', 'clientes', 'distribuidores',
    'almacen', 'ordenes_compra', 'reportes', 'configuracion',
    'usuarios', 'auditoria'
  ]

  return modulos.map(modulo => {
    const acciones = obtenerAccionesPermitidas(usuario, roles, modulo)
    const bancos = modulo === 'bancos'
      ? obtenerBancosAccesibles(usuario, roles)
      : []

    const restricciones: string[] = []

    // Agregar restricciones del usuario
    if (usuario.restriccionesUsuario.horaInicioAcceso && usuario.restriccionesUsuario.horaFinAcceso) {
      restricciones.push(`Horario: ${usuario.restriccionesUsuario.horaInicioAcceso} - ${usuario.restriccionesUsuario.horaFinAcceso}`)
    }
    if (usuario.restriccionesUsuario.limiteGlobalDiario) {
      restricciones.push(`Límite diario: $${usuario.restriccionesUsuario.limiteGlobalDiario.toLocaleString()}`)
    }
    if (usuario.restriccionesUsuario.requiereAprobacionGlobal) {
      restricciones.push('Requiere aprobación para todas las operaciones')
    }

    return {
      modulo,
      acciones,
      bancos,
      restricciones,
    }
  }).filter(m => m.acciones.length > 0)
}
