/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔐 CHRONOS INFINITY 2026 — ADAPTIVE AUTH SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Autenticación adaptativa: Usa Clerk cuando está disponible, bypass para desarrollo.
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import CONFIG from './config'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export type UserRole = 'admin' | 'manager' | 'user' | 'viewer' | 'guest'

export interface ChronosUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  fullName: string
  imageUrl: string
  role: UserRole
  permissions: string[]
  metadata: Record<string, unknown>
}

export interface SessionInfo {
  userId: string
  sessionId: string
  mode: 'clerk' | 'bypass'
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ROLE PERMISSIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['read:all', 'write:all', 'delete:all', 'manage:users', 'manage:settings'],
  manager: ['read:all', 'write:own', 'write:team', 'access:analytics'],
  user: ['read:own', 'read:team', 'write:own'],
  viewer: ['read:own', 'read:team'],
  guest: ['read:public'],
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// BYPASS MODE (Development without Clerk)
// ═══════════════════════════════════════════════════════════════════════════════════════

const BYPASS_USER: ChronosUser = {
  id: 'dev-user-001',
  email: 'dev@chronos.local',
  firstName: 'Developer',
  lastName: 'Mode',
  fullName: 'Developer Mode',
  imageUrl: '/avatars/default.png',
  role: 'admin',
  permissions: ROLE_PERMISSIONS.admin,
  metadata: { bypass: true },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CLERK CLIENT (LAZY LOAD)
// ═══════════════════════════════════════════════════════════════════════════════════════

async function getClerkAuth() {
  if (CONFIG.AUTH_MODE !== 'clerk') return null
  
  try {
    const { auth, currentUser } = await import('@clerk/nextjs/server')
    return { auth, currentUser }
  } catch {
    console.warn('⚠️ Clerk not available, using bypass mode')
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// AUTH FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Get current session info
 */
export async function getSession(): Promise<SessionInfo | null> {
  // Try Clerk first
  if (CONFIG.AUTH_MODE === 'clerk') {
    try {
      const clerk = await getClerkAuth()
      if (clerk) {
        const authResult = await clerk.auth()
        if (authResult.userId) {
          return {
            userId: authResult.userId,
            sessionId: authResult.sessionId || '',
            mode: 'clerk',
          }
        }
        return null
      }
    } catch (error) {
      console.warn('⚠️ Clerk auth failed:', error)
    }
  }

  // Bypass mode for development
  if (process.env.NODE_ENV !== 'production') {
    return {
      userId: BYPASS_USER.id,
      sessionId: 'bypass-session',
      mode: 'bypass',
    }
  }

  return null
}

/**
 * Get current user with profile
 */
export async function getUser(): Promise<ChronosUser | null> {
  // Try Clerk first
  if (CONFIG.AUTH_MODE === 'clerk') {
    try {
      const clerk = await getClerkAuth()
      if (clerk) {
        const user = await clerk.currentUser()
        if (user) {
          const role = (user.publicMetadata?.role as UserRole) || 'user'
          return {
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress ?? '',
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
            imageUrl: user.imageUrl,
            role,
            permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.guest,
            metadata: user.publicMetadata as Record<string, unknown>,
          }
        }
        return null
      }
    } catch (error) {
      console.warn('⚠️ Clerk user fetch failed:', error)
    }
  }

  // Bypass mode for development
  if (process.env.NODE_ENV !== 'production') {
    return BYPASS_USER
  }

  return null
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

/**
 * Check if user has role
 */
export async function hasRole(allowedRoles: UserRole[]): Promise<boolean> {
  const user = await getUser()
  if (!user) return false
  return allowedRoles.includes(user.role)
}

/**
 * Check if user has permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const user = await getUser()
  if (!user) return false
  return user.permissions.includes(permission) || user.permissions.includes('write:all')
}

/**
 * Require authentication - returns user or null
 */
export async function requireAuth(): Promise<ChronosUser | null> {
  const user = await getUser()
  
  if (!user && CONFIG.AUTH_MODE === 'clerk') {
    // In production with Clerk, redirect will be handled by middleware
    return null
  }
  
  return user
}

/**
 * Require specific role
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<ChronosUser | null> {
  const user = await getUser()
  
  if (!user) return null
  if (!allowedRoles.includes(user.role)) return null
  
  return user
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const adaptiveAuth = {
  getSession,
  getUser,
  isAuthenticated,
  hasRole,
  hasPermission,
  requireAuth,
  requireRole,
  mode: CONFIG.AUTH_MODE,
  bypassUser: CONFIG.AUTH_MODE === 'bypass' ? BYPASS_USER : null,
}

export default adaptiveAuth
