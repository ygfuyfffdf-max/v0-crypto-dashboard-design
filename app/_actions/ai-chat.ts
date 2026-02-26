'use server'

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 💬 AI CHAT SERVER ACTIONS - Persistencia con Turso/Drizzle
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Acciones para persistir conversaciones del chat AI ZERO en Turso.
 * Incluye gestión de mensajes y sesiones.
 *
 * @author CHRONOS System
 * @version 2026
 */

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { aiChatMessages, aiChatSessions } from '@/database/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SaveMessageInput {
  sessionId: string
  userId?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  intent?: string
  entities?: Record<string, unknown>
  confidence?: number
  responseTime?: number
  tokensUsed?: number
  model?: string
  metadata?: Record<string, unknown>
}

export interface CreateSessionInput {
  userId?: string
  title?: string
  context?: Record<string, unknown>
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Guardar un mensaje en Turso
 */
export async function saveAIChatMessage(input: SaveMessageInput) {
  try {
    const messageId = nanoid()

    const [message] = await db
      .insert(aiChatMessages)
      .values({
        id: messageId,
        sessionId: input.sessionId,
        userId: input.userId,
        role: input.role,
        content: input.content,
        intent: input.intent,
        entities: input.entities ? JSON.stringify(input.entities) : null,
        confidence: input.confidence,
        responseTime: input.responseTime,
        tokensUsed: input.tokensUsed,
        model: input.model,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      })
      .returning()

    // Actualizar contador de sesión
    await db
      .update(aiChatSessions)
      .set({
        messageCount: sql`${aiChatSessions.messageCount} + 1`,
        lastMessageAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(aiChatSessions.id, input.sessionId))

    logger.info('Mensaje AI guardado', {
      context: 'AI-Chat',
      data: { messageId, sessionId: input.sessionId, role: input.role },
    })

    return { success: true, message }
  } catch (error) {
    logger.error('Error guardando mensaje AI', error as Error, { context: 'AI-Chat' })
    return { success: false, error: 'Error al guardar mensaje' }
  }
}

/**
 * Obtener mensajes de una sesión
 */
export async function getSessionMessages(sessionId: string, limit = 50) {
  try {
    const messages = await db.query.aiChatMessages.findMany({
      where: eq(aiChatMessages.sessionId, sessionId),
      orderBy: [desc(aiChatMessages.createdAt)],
      limit,
    })

    // Parsear JSON fields y ordenar cronológicamente
    const parsed = messages
      .map((m) => ({
        ...m,
        entities: m.entities ? JSON.parse(m.entities) : null,
        metadata: m.metadata ? JSON.parse(m.metadata) : null,
      }))
      .reverse()

    return { success: true, messages: parsed }
  } catch (error) {
    logger.error('Error obteniendo mensajes AI', error as Error, { context: 'AI-Chat' })
    return { success: false, error: 'Error al obtener mensajes', messages: [] }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SESSION ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Crear nueva sesión de chat
 */
export async function createAIChatSession(input: CreateSessionInput) {
  try {
    const sessionId = nanoid()

    const [session] = await db
      .insert(aiChatSessions)
      .values({
        id: sessionId,
        userId: input.userId,
        title: input.title || 'Nueva conversación',
        context: input.context ? JSON.stringify(input.context) : null,
        messageCount: 0,
        isActive: 1,
      })
      .returning()

    logger.info('Sesión AI creada', {
      context: 'AI-Chat',
      data: { sessionId, userId: input.userId },
    })

    return { success: true, session }
  } catch (error) {
    logger.error('Error creando sesión AI', error as Error, { context: 'AI-Chat' })
    return { success: false, error: 'Error al crear sesión' }
  }
}

/**
 * Obtener sesión por ID
 */
export async function getAIChatSession(sessionId: string) {
  try {
    const session = await db.query.aiChatSessions.findFirst({
      where: eq(aiChatSessions.id, sessionId),
    })

    if (!session) {
      return { success: false, error: 'Sesión no encontrada' }
    }

    const messages = await db.query.aiChatMessages.findMany({
      where: eq(aiChatMessages.sessionId, sessionId),
      orderBy: [desc(aiChatMessages.createdAt)],
      limit: 100,
    })

    // Parsear JSON fields
    const parsed = {
      ...session,
      context: session.context ? JSON.parse(session.context) : null,
      messages: messages
        .map((m) => ({
          ...m,
          entities: m.entities ? JSON.parse(m.entities) : null,
          metadata: m.metadata ? JSON.parse(m.metadata) : null,
        }))
        .reverse(),
    }

    return { success: true, session: parsed }
  } catch (error) {
    logger.error('Error obteniendo sesión AI', error as Error, { context: 'AI-Chat' })
    return { success: false, error: 'Error al obtener sesión' }
  }
}

/**
 * Listar sesiones de un usuario
 */
export async function getUserSessions(userId?: string, limit = 20) {
  try {
    const sessions = await db.query.aiChatSessions.findMany({
      where: userId
        ? and(eq(aiChatSessions.userId, userId), eq(aiChatSessions.isActive, 1))
        : eq(aiChatSessions.isActive, 1),
      orderBy: [desc(aiChatSessions.lastMessageAt)],
      limit,
    })

    const parsed = sessions.map((s) => ({
      ...s,
      context: s.context ? JSON.parse(s.context) : null,
    }))

    return { success: true, sessions: parsed }
  } catch (error) {
    logger.error('Error listando sesiones AI', error as Error, { context: 'AI-Chat' })
    return { success: false, error: 'Error al listar sesiones', sessions: [] }
  }
}

/**
 * Actualizar título/contexto de sesión
 */
export async function updateAIChatSession(
  sessionId: string,
  updates: {
    title?: string
    summary?: string
    context?: Record<string, unknown>
    isActive?: boolean
  },
) {
  try {
    const [session] = await db
      .update(aiChatSessions)
      .set({
        ...(updates.title && { title: updates.title }),
        ...(updates.summary && { summary: updates.summary }),
        ...(updates.context && { context: JSON.stringify(updates.context) }),
        ...(typeof updates.isActive === 'boolean' && { isActive: updates.isActive ? 1 : 0 }),
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(aiChatSessions.id, sessionId))
      .returning()

    return { success: true, session }
  } catch (error) {
    logger.error('Error actualizando sesión AI', error as Error, { context: 'AI-Chat' })
    return { success: false, error: 'Error al actualizar sesión' }
  }
}

/**
 * Archivar/desactivar sesión
 */
export async function archiveAIChatSession(sessionId: string) {
  return updateAIChatSession(sessionId, { isActive: false })
}

/**
 * Eliminar mensajes de una sesión (hard delete)
 */
export async function clearSessionMessages(sessionId: string) {
  try {
    await db.delete(aiChatMessages).where(eq(aiChatMessages.sessionId, sessionId))

    await db
      .update(aiChatSessions)
      .set({
        messageCount: 0,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(aiChatSessions.id, sessionId))

    logger.info('Mensajes de sesión eliminados', {
      context: 'AI-Chat',
      data: { sessionId },
    })

    return { success: true }
  } catch (error) {
    logger.error('Error limpiando mensajes AI', error as Error, { context: 'AI-Chat' })
    return { success: false, error: 'Error al limpiar mensajes' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtener estadísticas de uso del chat AI
 */
export async function getAIChatStats(userId?: string) {
  try {
    const [sessionCount] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(aiChatSessions)
      .where(userId ? eq(aiChatSessions.userId, userId) : undefined)

    const [messageCount] = await db
      .select({
        count: sql<number>`count(*)`,
        avgResponseTime: sql<number>`avg(${aiChatMessages.responseTime})`,
        avgConfidence: sql<number>`avg(${aiChatMessages.confidence})`,
      })
      .from(aiChatMessages)
      .where(userId ? eq(aiChatMessages.userId, userId) : undefined)

    // Top intents
    const topIntents = await db
      .select({
        intent: aiChatMessages.intent,
        count: sql<number>`count(*)`,
      })
      .from(aiChatMessages)
      .where(sql`${aiChatMessages.intent} IS NOT NULL`)
      .groupBy(aiChatMessages.intent)
      .orderBy(sql`count(*) DESC`)
      .limit(5)

    return {
      success: true,
      stats: {
        totalSessions: sessionCount?.count ?? 0,
        totalMessages: messageCount?.count ?? 0,
        avgResponseTime: Math.round(messageCount?.avgResponseTime ?? 0),
        avgConfidence: Number((messageCount?.avgConfidence ?? 0).toFixed(2)),
        topIntents: topIntents.map((i) => ({ intent: i.intent || 'unknown', count: i.count })),
      },
    }
  } catch (error) {
    logger.error('Error obteniendo stats AI', error as Error, { context: 'AI-Chat' })
    return { success: false, error: 'Error al obtener estadísticas' }
  }
}
