/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS SYSTEM - Permissions System                     ║
 * ║                    Sistema de Permisos Basado en Roles (RBAC)             ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

import { logger } from '@/app/lib/utils/logger'

/**
 * Roles disponibles en el sistema (Extended for Quantum System)
 */
export type Role = 
  | 'admin' 
  | 'operator' 
  | 'viewer'
  // Executive Roles
  | 'ceo'
  | 'cfo'
  | 'financial_director'
  | 'financial_manager'
  // Operational Roles
  | 'sales_manager'
  | 'regional_manager'
  | 'accountant'
  // Technical Roles
  | 'analyst'
  | 'developer'
  | 'tester'
  | 'data_scientist'
  | 'ai_engineer'
  | 'auditor'

/**
 * 🌌 QUANTUM PERMISSION CONTEXT
 * Contexto multidimensional para evaluación de permisos
 */
export interface QuantumContext {
  time?: Date
  location?: {
    ip?: string
    country?: string
    networkType?: 'internal' | 'vpn' | 'public'
    coordinates?: { lat: number; lng: number }
  }
  device?: {
    id?: string
    type?: 'desktop' | 'mobile' | 'tablet'
    isManaged?: boolean
    biometricVerified?: boolean
    trustScore?: number
  }
  session?: {
    mfaVerified?: boolean
    duration?: number
    riskScore?: number
  }
}

/**
 * Permisos granulares del sistema
 */
export type Permission =
  // Ventas
  | 'ventas.create'
  | 'ventas.read'
  | 'ventas.update'
  | 'ventas.delete'
  | 'ventas.export'
  // Clientes
  | 'clientes.create'
  | 'clientes.read'
  | 'clientes.update'
  | 'clientes.delete'
  | 'clientes.export'
  | 'clientes.manage_credit'
  // Distribuidores
  | 'distribuidores.create'
  | 'distribuidores.read'
  | 'distribuidores.update'
  | 'distribuidores.delete'
  | 'distribuidores.export'
  // Órdenes de Compra
  | 'ordenes.create'
  | 'ordenes.read'
  | 'ordenes.update'
  | 'ordenes.delete'
  | 'ordenes.receive'
  | 'ordenes.export'
  // Bancos
  | 'bancos.read'
  | 'bancos.transfer'
  | 'bancos.ingreso'
  | 'bancos.gasto'
  | 'bancos.export'
  // Almacén
  | 'almacen.read'
  | 'almacen.entrada'
  | 'almacen.salida'
  | 'almacen.ajuste'
  | 'almacen.export'
  // Reportes
  | 'reportes.view'
  | 'reportes.create'
  | 'reportes.export'
  | 'reportes.schedule'
  // IA
  | 'ia.use'
  | 'ia.analyze'
  | 'ia.predict'
  // Configuración y Admin
  | 'settings.view'
  | 'settings.edit'
  | 'users.manage'
  | 'audit.view'
  | 'audit.export'
  // Sistema
  | 'system.backup'
  | 'system.restore'

/**
 * Matriz de permisos por rol
 */
export const rolePermissions: Record<Role, Permission[]> = {
  /**
   * ADMIN: Control total del sistema
   */
  admin: [
    // Ventas
    'ventas.create',
    'ventas.read',
    'ventas.update',
    'ventas.delete',
    'ventas.export',
    // Clientes
    'clientes.create',
    'clientes.read',
    'clientes.update',
    'clientes.delete',
    'clientes.export',
    'clientes.manage_credit',
    // Distribuidores
    'distribuidores.create',
    'distribuidores.read',
    'distribuidores.update',
    'distribuidores.delete',
    'distribuidores.export',
    // Órdenes
    'ordenes.create',
    'ordenes.read',
    'ordenes.update',
    'ordenes.delete',
    'ordenes.receive',
    'ordenes.export',
    // Bancos
    'bancos.read',
    'bancos.transfer',
    'bancos.ingreso',
    'bancos.gasto',
    'bancos.export',
    // Almacén
    'almacen.read',
    'almacen.entrada',
    'almacen.salida',
    'almacen.ajuste',
    'almacen.export',
    // Reportes
    'reportes.view',
    'reportes.create',
    'reportes.export',
    'reportes.schedule',
    // IA
    'ia.use',
    'ia.analyze',
    'ia.predict',
    // Admin
    'settings.view',
    'settings.edit',
    'users.manage',
    'audit.view',
    'audit.export',
    'system.backup',
    'system.restore',
  ],

  /**
   * OPERATOR: Operaciones diarias sin acceso a configuración crítica
   */
  operator: [
    // Ventas
    'ventas.create',
    'ventas.read',
    'ventas.update',
    'ventas.export',
    // Clientes
    'clientes.create',
    'clientes.read',
    'clientes.update',
    'clientes.export',
    // Distribuidores
    'distribuidores.read',
    'distribuidores.export',
    // Órdenes
    'ordenes.create',
    'ordenes.read',
    'ordenes.update',
    'ordenes.receive',
    'ordenes.export',
    // Bancos
    'bancos.read',
    'bancos.ingreso',
    'bancos.gasto',
    // Almacén
    'almacen.read',
    'almacen.entrada',
    'almacen.salida',
    'almacen.export',
    // Reportes
    'reportes.view',
    'reportes.create',
    'reportes.export',
    // IA
    'ia.use',
    'ia.analyze',
    // Settings
    'settings.view',
  ],

  /**
   * VIEWER: Solo lectura y reportes básicos
   */
  viewer: [
    // Lectura básica
    'ventas.read',
    'clientes.read',
    'distribuidores.read',
    'ordenes.read',
    'bancos.read',
    'almacen.read',
    // Reportes
    'reportes.view',
    // IA consulta
    'ia.use',
    // Settings
    'settings.view',
  ],

  // ════════════════════════════════════════════════════════════════════════════════════════
  // 👔 EXECUTIVE ROLES (QUANTUM TIER)
  // ════════════════════════════════════════════════════════════════════════════════════════
  
  ceo: [
    // Access to EVERYTHING except low-level system admin
    'ventas.read', 'ventas.export',
    'clientes.read', 'clientes.export',
    'distribuidores.read',
    'ordenes.read', 'ordenes.export',
    'bancos.read', 'bancos.export',
    'almacen.read', 'almacen.export',
    'reportes.view', 'reportes.create', 'reportes.export', 'reportes.schedule',
    'ia.use', 'ia.analyze', 'ia.predict',
    'settings.view', 'audit.view', 'audit.export'
  ],

  cfo: [
    // Financial Focus
    'bancos.read', 'bancos.transfer', 'bancos.ingreso', 'bancos.gasto', 'bancos.export',
    'ordenes.read', 'ordenes.create', 'ordenes.update', 'ordenes.export',
    'ventas.read', 'ventas.export',
    'reportes.view', 'reportes.create', 'reportes.export',
    'ia.use', 'ia.analyze', 'ia.predict',
    'audit.view'
  ],

  financial_director: [
    'bancos.read', 'bancos.ingreso', 'bancos.gasto', 'bancos.export',
    'ordenes.read', 'ordenes.export',
    'reportes.view', 'reportes.create',
    'audit.view'
  ],

  financial_manager: [
    'bancos.read', 'bancos.ingreso', 'bancos.gasto',
    'ordenes.read',
    'reportes.view'
  ],

  // ════════════════════════════════════════════════════════════════════════════════════════
  // 🏢 OPERATIONAL ROLES
  // ════════════════════════════════════════════════════════════════════════════════════════

  sales_manager: [
    'ventas.create', 'ventas.read', 'ventas.update', 'ventas.delete', 'ventas.export',
    'clientes.create', 'clientes.read', 'clientes.update', 'clientes.export', 'clientes.manage_credit',
    'reportes.view'
  ],

  regional_manager: [
    'ventas.read', 'ventas.export',
    'clientes.read',
    'reportes.view'
  ],

  accountant: [
    'ventas.read', 'ventas.export',
    'ordenes.read', 'ordenes.export',
    'bancos.read', 'bancos.export',
    'reportes.view', 'reportes.create', 'reportes.export'
  ],

  // ════════════════════════════════════════════════════════════════════════════════════════
  // 🛠️ TECHNICAL & SPECIALIST ROLES
  // ════════════════════════════════════════════════════════════════════════════════════════

  analyst: [
    'ventas.read', 'clientes.read', 'almacen.read', 'bancos.read',
    'reportes.view', 'reportes.create', 'reportes.export',
    'ia.use', 'ia.analyze'
  ],

  data_scientist: [
    'reportes.view', 'reportes.create', 'reportes.export',
    'ia.use', 'ia.analyze', 'ia.predict',
    'almacen.read', 'ventas.read'
  ],

  ai_engineer: [
    'ia.use', 'ia.analyze', 'ia.predict',
    'settings.view', 'system.backup'
  ],

  developer: [
    'settings.view', 'settings.edit',
    'system.backup', 'system.restore',
    'audit.view'
  ],

  tester: [
    'ventas.read', 'clientes.read', 'almacen.read',
    'settings.view'
  ],

  auditor: [
    'audit.view', 'audit.export',
    'ventas.read', 'clientes.read', 'bancos.read', 'ordenes.read', 'almacen.read', 'distribuidores.read',
    'settings.view'
  ]
}

/**
 * 🔐 QUANTUM PERMISSION EVALUATOR
 * Evalúa permisos basándose en contexto, no solo en rol.
 */
export function evaluateQuantumPermission(
  role: Role, 
  permission: Permission, 
  context?: QuantumContext
): { allowed: boolean; reason?: string; riskScore?: number } {
  // 1. Check basic RBAC first
  if (!hasPermission(role, permission)) {
    return { allowed: false, reason: 'Role does not have basic permission', riskScore: 0 }
  }

  // 2. Quantum Context Evaluation (Advanced ABAC)
  if (context) {
    // 2.1 TIME DIMENSION: Temporal Restrictions
    if (context.time) {
      const hour = context.time.getHours()
      const isWorkHours = hour >= 8 && hour <= 20
      // Operators only work during work hours unless emergency override
      if (role === 'operator' && !isWorkHours) {
         return { allowed: false, reason: 'Access denied outside operating hours (Temporal Lock)', riskScore: 0.8 }
      }
    }

    // 2.2 SPACE DIMENSION: Geo-Fencing
    if (context.location?.country) {
       const allowedCountries = ['MX', 'US', 'CA'] // Example configuration
       if (!allowedCountries.includes(context.location.country)) {
         return { allowed: false, reason: `Access denied from restricted region: ${context.location.country}`, riskScore: 0.95 }
       }
    }

    // 2.3 BEHAVIOR DIMENSION: Risk Scoring
    // Critical actions require low risk score
    if (permission.includes('delete') || permission.includes('transfer') || permission.includes('system')) {
      if (context.session?.riskScore && context.session.riskScore > 0.6) {
        return { allowed: false, reason: 'Behavioral risk score too high for critical action', riskScore: context.session.riskScore }
      }
      
      // Biometric/Device Trust requirement for financial movements
      if (permission.includes('bancos')) {
         if (context.device?.trustScore && context.device.trustScore < 0.7) {
            return { allowed: false, reason: 'Device trust score insufficient for financial operation', riskScore: 0.7 }
         }
      }
    }
    
    // 2.4 NETWORK DIMENSION
    if (role === 'admin' && context.location?.networkType === 'public') {
       // Admins should prefer VPN or Internal
       // We allow it but flag it with higher risk
       return { allowed: true, reason: 'Admin access from public network monitored', riskScore: 0.4 }
    }
  }

  return { allowed: true, riskScore: 0.1 }
}

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) {
    logger.warn('Verificación de permiso sin rol', {
      context: 'Permissions',
      data: { permission },
    })
    return false
  }

  const permissions = rolePermissions[role]
  const hasAccess = permissions.includes(permission)

  logger.debug('Verificación de permiso', {
    context: 'Permissions',
    data: { role, permission, hasAccess },
  })

  return hasAccess
}

/**
 * Verifica si un rol tiene todos los permisos especificados
 */
export function hasAllPermissions(role: Role | undefined, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

/**
 * Verifica si un rol tiene al menos uno de los permisos especificados
 */
export function hasAnyPermission(role: Role | undefined, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

/**
 * Obtiene todos los permisos de un rol
 */
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role]
}

/**
 * Verifica si un rol puede acceder a un recurso
 */
export function canAccess(
  role: Role | undefined,
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
): boolean {
  const permission = `${resource}.${action}` as Permission
  return hasPermission(role, permission)
}

/**
 * Descripción legible de los permisos
 */
export const permissionDescriptions: Record<Permission, string> = {
  // Ventas
  'ventas.create': 'Crear ventas',
  'ventas.read': 'Ver ventas',
  'ventas.update': 'Editar ventas',
  'ventas.delete': 'Eliminar ventas',
  'ventas.export': 'Exportar ventas',
  // Clientes
  'clientes.create': 'Crear clientes',
  'clientes.read': 'Ver clientes',
  'clientes.update': 'Editar clientes',
  'clientes.delete': 'Eliminar clientes',
  'clientes.export': 'Exportar clientes',
  'clientes.manage_credit': 'Gestionar crédito de clientes',
  // Distribuidores
  'distribuidores.create': 'Crear distribuidores',
  'distribuidores.read': 'Ver distribuidores',
  'distribuidores.update': 'Editar distribuidores',
  'distribuidores.delete': 'Eliminar distribuidores',
  'distribuidores.export': 'Exportar distribuidores',
  // Órdenes
  'ordenes.create': 'Crear órdenes de compra',
  'ordenes.read': 'Ver órdenes de compra',
  'ordenes.update': 'Editar órdenes de compra',
  'ordenes.delete': 'Eliminar órdenes de compra',
  'ordenes.receive': 'Recibir órdenes de compra',
  'ordenes.export': 'Exportar órdenes de compra',
  // Bancos
  'bancos.read': 'Ver bancos',
  'bancos.transfer': 'Transferir entre bancos',
  'bancos.ingreso': 'Registrar ingresos',
  'bancos.gasto': 'Registrar gastos',
  'bancos.export': 'Exportar movimientos bancarios',
  // Almacén
  'almacen.read': 'Ver almacén',
  'almacen.entrada': 'Registrar entradas',
  'almacen.salida': 'Registrar salidas',
  'almacen.ajuste': 'Ajustar inventario',
  'almacen.export': 'Exportar inventario',
  // Reportes
  'reportes.view': 'Ver reportes',
  'reportes.create': 'Crear reportes',
  'reportes.export': 'Exportar reportes',
  'reportes.schedule': 'Programar reportes',
  // IA
  'ia.use': 'Usar asistente IA',
  'ia.analyze': 'Análisis con IA',
  'ia.predict': 'Predicciones con IA',
  // Admin
  'settings.view': 'Ver configuración',
  'settings.edit': 'Editar configuración',
  'users.manage': 'Gestionar usuarios',
  'audit.view': 'Ver auditoría',
  'audit.export': 'Exportar auditoría',
  'system.backup': 'Hacer respaldo',
  'system.restore': 'Restaurar respaldo',
}

/**
 * Descripción legible de los roles
 */
export const roleDescriptions: Record<Role, { name: string; description: string }> = {
  admin: {
    name: 'Administrador',
    description: 'Control total del sistema',
  },
  operator: {
    name: 'Operador',
    description: 'Operaciones diarias sin acceso a configuración crítica',
  },
  viewer: {
    name: 'Visualizador',
    description: 'Solo lectura y reportes básicos',
  },
}
