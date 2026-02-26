// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔌 CHRONOS INFINITY 2026 — ABLY REALTIME SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Servicio de comunicación en tiempo real:
 * - Pub/Sub messaging
 * - Presence (usuarios online)
 * - Channel management
 * - History & replay
 * - Connection state management
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import Ably from 'ably'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface RealtimeMessage<T = unknown> {
  name: string
  data: T
  timestamp: number
  clientId?: string
}

export interface PresenceMember {
  clientId: string
  data?: {
    userId?: string
    name?: string
    avatar?: string
    status?: 'online' | 'away' | 'busy'
    [key: string]: unknown
  }
  action: 'enter' | 'leave' | 'update' | 'present'
  timestamp: number
}

export interface ChannelConfig {
  name: string
  options?: {
    params?: Record<string, string>
    cipher?: {
      key: string
      algorithm?: string
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CHANNEL DEFINITIONS — CHRONOS SPECIFIC
// ═══════════════════════════════════════════════════════════════════════════════════════

export const ChronosChannels = {
  // Global channels
  GLOBAL_NOTIFICATIONS: 'chronos:notifications',
  GLOBAL_ALERTS: 'chronos:alerts',
  SYSTEM_STATUS: 'chronos:system',
  
  // Dashboard channels
  DASHBOARD_METRICS: 'chronos:dashboard:metrics',
  DASHBOARD_UPDATES: 'chronos:dashboard:updates',
  
  // Business channels
  SALES_UPDATES: 'chronos:sales',
  ORDERS_UPDATES: 'chronos:orders',
  INVENTORY_UPDATES: 'chronos:inventory',
  PAYMENTS_UPDATES: 'chronos:payments',
  
  // Per-user channels
  userChannel: (userId: string) => `chronos:user:${userId}`,
  
  // Per-entity channels
  entityChannel: (type: string, id: string) => `chronos:${type}:${id}`,
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════
// SERVER-SIDE ABLY CLIENT
// ═══════════════════════════════════════════════════════════════════════════════════════

let ablyRest: Ably.Rest | null = null

export function getAblyRest(): Ably.Rest {
  if (ablyRest) return ablyRest

  const apiKey = process.env.ABLY_API_KEY

  if (!apiKey) {
    throw new Error('❌ Ably API key not configured')
  }

  ablyRest = new Ably.Rest({
    key: apiKey,
    clientId: 'chronos-server',
    log: {
      level: process.env.NODE_ENV === 'development' ? 2 : 0,
    },
  })

  return ablyRest
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PUBLISHING MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Publish message to channel
 */
export async function publishMessage<T>(
  channelName: string,
  eventName: string,
  data: T
): Promise<void> {
  const ably = getAblyRest()
  const channel = ably.channels.get(channelName)
  
  await channel.publish(eventName, {
    ...data,
    timestamp: Date.now(),
    source: 'server',
  })
}

/**
 * Publish to multiple channels
 */
export async function publishToChannels<T>(
  channels: string[],
  eventName: string,
  data: T
): Promise<void> {
  const promises = channels.map((channelName) =>
    publishMessage(channelName, eventName, data)
  )
  
  await Promise.all(promises)
}

/**
 * Publish notification to user
 */
export async function notifyUser<T>(
  userId: string,
  eventName: string,
  data: T
): Promise<void> {
  await publishMessage(ChronosChannels.userChannel(userId), eventName, data)
}

/**
 * Broadcast to all users
 */
export async function broadcast<T>(
  eventName: string,
  data: T
): Promise<void> {
  await publishMessage(ChronosChannels.GLOBAL_NOTIFICATIONS, eventName, data)
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CHRONOS REALTIME EVENTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const RealtimeEvents = {
  // Metrics updates
  METRICS_UPDATE: 'metrics:update',
  KPI_UPDATE: 'kpi:update',
  
  // Sales events
  SALE_CREATED: 'sale:created',
  SALE_UPDATED: 'sale:updated',
  SALE_COMPLETED: 'sale:completed',
  
  // Order events
  ORDER_CREATED: 'order:created',
  ORDER_STATUS_CHANGED: 'order:status',
  ORDER_COMPLETED: 'order:completed',
  
  // Inventory events
  STOCK_LOW: 'inventory:low',
  STOCK_UPDATED: 'inventory:updated',
  
  // Payment events
  PAYMENT_RECEIVED: 'payment:received',
  PAYMENT_PENDING: 'payment:pending',
  
  // Notifications
  NOTIFICATION: 'notification',
  ALERT: 'alert',
  
  // System events
  SYSTEM_UPDATE: 'system:update',
  MAINTENANCE: 'system:maintenance',
} as const

export type RealtimeEventName = (typeof RealtimeEvents)[keyof typeof RealtimeEvents]

/**
 * Publish Chronos event
 */
export async function publishChronosEvent<T>(
  channel: string,
  event: RealtimeEventName,
  data: T
): Promise<void> {
  await publishMessage(channel, event, {
    event,
    data,
    timestamp: Date.now(),
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PRESENCE (ADMIN)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Get presence members in channel
 */
export async function getPresenceMembers(
  channelName: string
): Promise<PresenceMember[]> {
  const ably = getAblyRest()
  const channel = ably.channels.get(channelName)
  
  const presencePage = await channel.presence.get()
  
  return presencePage.map((member) => ({
    clientId: member.clientId || '',
    data: member.data as PresenceMember['data'],
    action: member.action as PresenceMember['action'],
    timestamp: member.timestamp || Date.now(),
  }))
}

/**
 * Get online users count
 */
export async function getOnlineUsersCount(
  channelName: string = 'chronos:presence'
): Promise<number> {
  const members = await getPresenceMembers(channelName)
  return members.length
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HISTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Get channel history
 */
export async function getChannelHistory<T>(
  channelName: string,
  options?: {
    limit?: number
    start?: number
    end?: number
    direction?: 'forwards' | 'backwards'
  }
): Promise<RealtimeMessage<T>[]> {
  const ably = getAblyRest()
  const channel = ably.channels.get(channelName)
  
  const historyPage = await channel.history({
    limit: options?.limit || 100,
    start: options?.start,
    end: options?.end,
    direction: options?.direction || 'backwards',
  })

  return historyPage.items.map((item) => ({
    name: item.name || '',
    data: item.data as T,
    timestamp: item.timestamp || Date.now(),
    clientId: item.clientId,
  }))
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TOKEN GENERATION (for clients)
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface TokenParams {
  clientId: string
  capability?: Record<string, string[]>
  ttl?: number
}

/**
 * Generate token for client authentication
 */
export async function generateToken(params: TokenParams): Promise<{
  token: string
  expires: number
}> {
  const ably = getAblyRest()
  
  // Default capabilities - user can subscribe to their channel and global channels
  const defaultCapability = {
    [ChronosChannels.userChannel(params.clientId)]: ['subscribe', 'presence'],
    [ChronosChannels.GLOBAL_NOTIFICATIONS]: ['subscribe'],
    [ChronosChannels.DASHBOARD_METRICS]: ['subscribe'],
    'chronos:presence': ['presence', 'subscribe'],
  }

  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: params.clientId,
    capability: JSON.stringify(params.capability || defaultCapability),
    ttl: params.ttl || 3600 * 1000, // 1 hour default
  })

  return {
    token: JSON.stringify(tokenRequest),
    expires: Date.now() + (params.ttl || 3600 * 1000),
  }
}

/**
 * Generate admin token (full access)
 */
export async function generateAdminToken(clientId: string): Promise<{
  token: string
  expires: number
}> {
  return generateToken({
    clientId,
    capability: {
      '*': ['*'], // Full access to all channels
    },
    ttl: 3600 * 1000, // 1 hour
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// STATS & MONITORING
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Get Ably stats (requires stats capability)
 */
export async function getStats(options?: {
  unit?: 'minute' | 'hour' | 'day' | 'month'
  limit?: number
}): Promise<unknown[]> {
  try {
    const ably = getAblyRest()
    const statsPage = await ably.stats({
      unit: options?.unit || 'hour',
      limit: options?.limit || 24,
    })
    return statsPage.items
  } catch {
    return []
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency: number
  details?: string
}> {
  const start = Date.now()
  
  try {
    const ably = getAblyRest()
    await ably.time()
    const latency = Date.now() - start
    
    return {
      status: latency < 200 ? 'healthy' : 'degraded',
      latency,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const ablyRealtime = {
  client: getAblyRest,
  publish: publishMessage,
  publishToChannels,
  notifyUser,
  broadcast,
  publishEvent: publishChronosEvent,
  presence: {
    get: getPresenceMembers,
    getOnlineCount: getOnlineUsersCount,
  },
  history: getChannelHistory,
  auth: {
    generateToken,
    generateAdminToken,
  },
  stats: getStats,
  health: healthCheck,
  channels: ChronosChannels,
  events: RealtimeEvents,
}

export default ablyRealtime
