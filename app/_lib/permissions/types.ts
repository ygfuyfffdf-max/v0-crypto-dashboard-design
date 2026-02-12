/**
 * CHRONOS INFINITY - Permission Types
 * Type definitions for the quantum permission engine
 */

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'operator'
  | 'viewer'
  | 'guest';

export interface PermissionRequest {
  userId: string;
  role: UserRole;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
  context?: Record<string, unknown>;
  riskScore?: number;
  biometricVerified?: boolean;
}

export interface PermissionResponse {
  granted: boolean;
  reason?: string;
  restrictions?: string[];
  expiresAt?: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface PermissionRule {
  id: string;
  role: UserRole;
  resource: string;
  actions: string[];
  conditions?: Record<string, unknown>;
  priority: number;
}
