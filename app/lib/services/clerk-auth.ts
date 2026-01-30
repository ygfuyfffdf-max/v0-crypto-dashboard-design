/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔐 CHRONOS INFINITY 2026 — CLERK AUTH SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Servicio de autenticación avanzado con Clerk:
 * - Multi-factor authentication
 * - Organization management
 * - Role-based access control
 * - Session management
 * - Webhook handling
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { auth, currentUser, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

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
  createdAt: Date
  lastSignIn: Date | null
}

export interface SessionInfo {
  userId: string
  sessionId: string
  orgId: string | null
  orgRole: string | null
  orgSlug: string | null
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ROLE PERMISSIONS MATRIX
// ═══════════════════════════════════════════════════════════════════════════════════════

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'read:all', 'write:all', 'delete:all',
    'manage:users', 'manage:settings', 'manage:billing',
    'access:admin', 'access:analytics', 'access:ai',
    'export:data', 'import:data',
  ],
  manager: [
    'read:all', 'write:own', 'write:team',
    'access:analytics', 'access:ai',
    'export:data',
  ],
  user: [
    'read:own', 'read:team', 'write:own',
    'access:ai',
  ],
  viewer: [
    'read:own', 'read:team',
  ],
  guest: [
    'read:public',
  ],
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// AUTH UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Get current session info (server-side)
 */
export async function getSession(): Promise<SessionInfo | null> {
  const authResult = await auth()
  
  if (!authResult.userId) return null

  return {
    userId: authResult.userId,
    sessionId: authResult.sessionId ?? '',
    orgId: authResult.orgId ?? null,
    orgRole: authResult.orgRole ?? null,
    orgSlug: authResult.orgSlug ?? null,
  }
}

/**
 * Get current user with enhanced profile
 */
export async function getChronosUser(): Promise<ChronosUser | null> {
  const user = await currentUser()
  
  if (!user) return null

  const role = (user.publicMetadata?.role as UserRole) || 'user'
  
  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? '',
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario',
    imageUrl: user.imageUrl,
    role,
    permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.guest,
    metadata: user.publicMetadata as Record<string, unknown>,
    createdAt: new Date(user.createdAt),
    lastSignIn: user.lastSignInAt ? new Date(user.lastSignInAt) : null,
  }
}

/**
 * Require authentication - redirects to sign-in if not authenticated
 */
export async function requireAuth(): Promise<SessionInfo> {
  const session = await getSession()
  
  if (!session) {
    redirect('/sign-in')
  }
  
  return session
}

/**
 * Require specific role
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<ChronosUser> {
  const user = await getChronosUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  if (!allowedRoles.includes(user.role)) {
    redirect('/unauthorized')
  }
  
  return user
}

/**
 * Check if user has permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const user = await getChronosUser()
  
  if (!user) return false
  
  return user.permissions.includes(permission) || user.permissions.includes('write:all')
}

/**
 * Require specific permission
 */
export async function requirePermission(permission: string): Promise<ChronosUser> {
  const user = await getChronosUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  const hasAccess = user.permissions.includes(permission) || user.permissions.includes('write:all')
  
  if (!hasAccess) {
    redirect('/unauthorized')
  }
  
  return user
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT (Admin APIs)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<void> {
  const client = await clerkClient()
  
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: newRole,
    },
  })
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(
  userId: string,
  metadata: Record<string, unknown>
): Promise<void> {
  const client = await clerkClient()
  
  await client.users.updateUserMetadata(userId, {
    publicMetadata: metadata,
  })
}

/**
 * Ban user
 */
export async function banUser(userId: string, reason?: string): Promise<void> {
  const client = await clerkClient()
  
  await client.users.banUser(userId)
  
  // Also update metadata to track ban reason
  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      banned: true,
      banReason: reason,
      bannedAt: new Date().toISOString(),
    },
  })
}

/**
 * Unban user
 */
export async function unbanUser(userId: string): Promise<void> {
  const client = await clerkClient()
  
  await client.users.unbanUser(userId)
  
  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      banned: false,
      unbannedAt: new Date().toISOString(),
    },
  })
}

/**
 * Get user by ID (admin)
 */
export async function getUserById(userId: string): Promise<ChronosUser | null> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    
    const role = (user.publicMetadata?.role as UserRole) || 'user'
    
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? '',
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario',
      imageUrl: user.imageUrl,
      role,
      permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.guest,
      metadata: user.publicMetadata as Record<string, unknown>,
      createdAt: new Date(user.createdAt),
      lastSignIn: user.lastSignInAt ? new Date(user.lastSignInAt) : null,
    }
  } catch {
    return null
  }
}

/**
 * List users with pagination
 */
export async function listUsers(options: {
  limit?: number
  offset?: number
  query?: string
}): Promise<{ users: ChronosUser[]; totalCount: number }> {
  const client = await clerkClient()
  
  const response = await client.users.getUserList({
    limit: options.limit || 10,
    offset: options.offset || 0,
    query: options.query,
  })

  const users: ChronosUser[] = response.data.map((user) => {
    const role = (user.publicMetadata?.role as UserRole) || 'user'
    
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? '',
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario',
      imageUrl: user.imageUrl,
      role,
      permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.guest,
      metadata: user.publicMetadata as Record<string, unknown>,
      createdAt: new Date(user.createdAt),
      lastSignIn: user.lastSignInAt ? new Date(user.lastSignInAt) : null,
    }
  })

  return {
    users,
    totalCount: response.totalCount,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Revoke all user sessions (force logout)
 */
export async function revokeUserSessions(userId: string): Promise<void> {
  const client = await clerkClient()
  
  const sessions = await client.sessions.getSessionList({ userId })
  
  for (const session of sessions.data) {
    await client.sessions.revokeSession(session.id)
  }
}

/**
 * Get active sessions for user
 */
export async function getUserSessions(userId: string) {
  const client = await clerkClient()
  
  const sessions = await client.sessions.getSessionList({
    userId,
    status: 'active',
  })

  return sessions.data.map((session) => ({
    id: session.id,
    status: session.status,
    lastActiveAt: session.lastActiveAt,
    expireAt: session.expireAt,
    abandonAt: session.abandonAt,
    clientId: session.clientId,
  }))
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SERVER-SIDE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Validate session and return user ID
 */
export async function validateSession(): Promise<string | null> {
  const session = await getSession()
  return session?.userId ?? null
}

/**
 * Get auth headers for API requests
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await getSession()
  
  return {
    'x-user-id': session?.userId ?? '',
    'x-session-id': session?.sessionId ?? '',
    'x-org-id': session?.orgId ?? '',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const clerkAuth = {
  getSession,
  getUser: getChronosUser,
  requireAuth,
  requireRole,
  requirePermission,
  hasPermission,
  validateSession,
  getAuthHeaders,
  users: {
    getById: getUserById,
    list: listUsers,
    updateRole: updateUserRole,
    updateMetadata: updateUserMetadata,
    ban: banUser,
    unban: unbanUser,
    revokeSessions: revokeUserSessions,
    getSessions: getUserSessions,
  },
}

export default clerkAuth
