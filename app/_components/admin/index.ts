/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 👑 ADMIN MODULE — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de administración con:
 * - UserManagementPanel: Gestión de usuarios con restricciones granulares
 * - RolePermissionsManager: Gestión de roles y permisos
 * - AdminActivityDashboard: Dashboard de actividad administrativa
 * - ApprovalsPanelSupreme: Panel de aprobaciones pendientes
 * - AdminDashboardSupreme: Dashboard supremo de administración
 * - AuditDashboardSupreme: Centro de auditoría completo
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// User Management
export { UserManagementPanel, default as UserManagementPanelDefault } from './UserManagementPanel'

// Role & Permissions Management
export { default as RolePermissionsManager } from './RolePermissionsManager'

// Admin Dashboards
export { default as AdminActivityDashboard } from './AdminActivityDashboard'
export { default as AdminDashboardSupreme } from './AdminDashboardSupreme'

// Approvals Panel
export { default as ApprovalsPanelSupreme } from './ApprovalsPanelSupreme'

// Audit Dashboard
export {
  AuditDashboardSupreme,
  default as AuditDashboardSupremeDefault,
  type EntradaAudit,
  type AlertaAudit,
  type EstadisticasAudit,
  type AccionAudit,
  type ModuloAudit,
  type SeveridadAudit,
  type DispositivoAudit,
  type UsuarioAudit,
} from './AuditDashboardSupreme'
