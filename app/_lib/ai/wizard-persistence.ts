/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💾 WIZARD SESSION PERSISTENCE — Persistencia de sesiones de wizard
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

export interface WizardSession {
  id: string
  tipo: 'venta' | 'orden_compra' | 'abono'
  paso: number
  totalPasos: number
  datos: Record<string, unknown>
  completado: boolean
  createdAt: Date
  expiresAt: Date
  userId?: string
}

// Cache en memoria para acceso rápido (backup de DB)
const sessionCache = new Map<string, WizardSession>()

// Tiempo de expiración: 30 minutos
const SESSION_EXPIRY_MS = 30 * 60 * 1000

/**
 * Crear o actualizar una sesión de wizard
 */
export async function saveWizardSession(session: WizardSession): Promise<void> {
  try {
    // Guardar en cache
    sessionCache.set(session.id, session)

    // Guardar en DB (tabla temporal o usar movimientos con tipo especial)
    // Por ahora usamos cache + localStorage en cliente
    logger.info('💾 Wizard session guardada', {
      context: 'WizardPersistence',
      data: { sessionId: session.id, tipo: session.tipo, paso: session.paso },
    })
  } catch (error) {
    logger.error('❌ Error guardando wizard session', error as Error, {
      context: 'WizardPersistence',
    })
  }
}

/**
 * Obtener una sesión de wizard
 */
export async function getWizardSession(sessionId: string): Promise<WizardSession | null> {
  try {
    // Primero buscar en cache
    const cached = sessionCache.get(sessionId)

    if (cached) {
      // Verificar si expiró
      if (new Date() > cached.expiresAt) {
        sessionCache.delete(sessionId)
        logger.info('⏰ Wizard session expirada', {
          context: 'WizardPersistence',
          data: { sessionId },
        })
        return null
      }
      return cached
    }

    return null
  } catch (error) {
    logger.error('❌ Error obteniendo wizard session', error as Error, {
      context: 'WizardPersistence',
    })
    return null
  }
}

/**
 * Eliminar una sesión de wizard
 */
export async function deleteWizardSession(sessionId: string): Promise<void> {
  try {
    sessionCache.delete(sessionId)
    logger.info('🗑️ Wizard session eliminada', {
      context: 'WizardPersistence',
      data: { sessionId },
    })
  } catch (error) {
    logger.error('❌ Error eliminando wizard session', error as Error, {
      context: 'WizardPersistence',
    })
  }
}

/**
 * Crear una nueva sesión de wizard
 */
export function createWizardSession(tipo: WizardSession['tipo'], userId?: string): WizardSession {
  const now = new Date()
  const session: WizardSession = {
    id: `wizard-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    tipo,
    paso: 1,
    totalPasos: tipo === 'venta' ? 5 : 3,
    datos: {},
    completado: false,
    createdAt: now,
    expiresAt: new Date(now.getTime() + SESSION_EXPIRY_MS),
    userId,
  }

  // Guardar inmediatamente
  sessionCache.set(session.id, session)

  return session
}

/**
 * Actualizar el paso de una sesión
 */
export async function updateWizardStep(
  sessionId: string,
  paso: number,
  datos: Record<string, unknown>,
): Promise<WizardSession | null> {
  const session = await getWizardSession(sessionId)

  if (!session) {
    return null
  }

  session.paso = paso
  session.datos = { ...session.datos, ...datos }

  // Extender expiración
  session.expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS)

  await saveWizardSession(session)

  return session
}

/**
 * Marcar sesión como completada
 */
export async function completeWizardSession(sessionId: string): Promise<void> {
  const session = await getWizardSession(sessionId)

  if (session) {
    session.completado = true
    await saveWizardSession(session)
  }
}

/**
 * Limpiar sesiones expiradas
 */
export function cleanupExpiredSessions(): number {
  const now = new Date()
  let cleaned = 0

  for (const [id, session] of sessionCache.entries()) {
    if (now > session.expiresAt) {
      sessionCache.delete(id)
      cleaned++
    }
  }

  if (cleaned > 0) {
    logger.info(`🧹 Wizard cleanup: ${cleaned} sesiones expiradas eliminadas`, {
      context: 'WizardPersistence',
    })
  }

  return cleaned
}

// Limpiar cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredSessions, 5 * 60 * 1000)
}

/**
 * Obtener todas las sesiones activas de un usuario
 */
export function getUserActiveSessions(userId: string): WizardSession[] {
  const sessions: WizardSession[] = []
  const now = new Date()

  for (const session of sessionCache.values()) {
    if (session.userId === userId && now < session.expiresAt && !session.completado) {
      sessions.push(session)
    }
  }

  return sessions
}
