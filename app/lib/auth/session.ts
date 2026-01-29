import { cookies } from 'next/headers'
import { logger } from '@/app/lib/utils/logger'

export interface UserSession {
  id: string
  email: string
  nombre: string
  role: 'admin' | 'operator' | 'viewer'
}

export async function getSession(): Promise<{ user: UserSession | null }> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('chronos_session')
    const userCookie = cookieStore.get('chronos_user')

    if (!sessionCookie || !userCookie) {
      return { user: null }
    }

    const user = JSON.parse(userCookie.value) as UserSession
    return { user }
  } catch (error) {
    logger.error('Error parsing session', error as Error, { context: 'auth.getSession' })
    return { user: null }
  }
}

export async function requireAuth() {
  const { user } = await getSession()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }
  return user
}
