// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🏆 CHRONOS INFINITY 2026 — SERVICIOS DE PRODUCCIÓN
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Integraciones enterprise-ready para producción
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🗄️ TURSO - DATABASE EDGE
// ═══════════════════════════════════════════════════════════════════════════════════════

import { createClient, type Client } from '@libsql/client'

let tursoClient: Client | null = null

export function getTursoClient(): Client {
  if (!tursoClient) {
    tursoClient = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return tursoClient
}

// Queries con retry automático
export async function queryWithRetry<T>(
  sql: string,
  args?: any[],
  maxRetries = 3
): Promise<T[]> {
  const client = getTursoClient()
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await client.execute({ sql, args: args || [] })
      return result.rows as T[]
    } catch (error) {
      lastError = error as Error
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100))
    }
  }
  
  throw lastError
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 💾 UPSTASH REDIS - CACHE & RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════════════════

import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

let redisClient: Redis | null = null

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return redisClient
}

// Cache helper con TTL
export async function cacheGet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  const redis = getRedisClient()
  
  try {
    const cached = await redis.get<T>(key)
    if (cached !== null) return cached
  } catch (error) {
    console.error('Redis cache get error:', error)
  }
  
  const fresh = await fetcher()
  
  try {
    await redis.setex(key, ttlSeconds, fresh)
  } catch (error) {
    console.error('Redis cache set error:', error)
  }
  
  return fresh
}

// Rate limiter preconfigurado
export function createRateLimiter(
  requests: number = 10,
  window: '1m' | '1h' | '1d' = '1m'
) {
  return new Ratelimit({
    redis: getRedisClient(),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
  })
}

// Rate limit helper para rutas API
export async function checkRateLimit(
  identifier: string,
  limiter?: Ratelimit
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const ratelimit = limiter || createRateLimiter()
  const result = await ratelimit.limit(identifier)
  return result
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📧 RESEND - EMAIL SERVICE
// ═══════════════════════════════════════════════════════════════════════════════════════

import { Resend } from 'resend'

let resendClient: Resend | null = null

export function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  cc?: string[]
  bcc?: string[]
  attachments?: { filename: string; content: Buffer }[]
}

export async function sendEmail(options: EmailOptions) {
  const resend = getResendClient()
  
  try {
    const result = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'CHRONOS'} <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
    })
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

// Templates de email predefinidos
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: '¡Bienvenido a CHRONOS!',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #a855f7;">¡Hola ${name}!</h1>
        <p>Bienvenido a CHRONOS INFINITY 2026. Tu cuenta ha sido creada exitosamente.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="display: inline-block; background: linear-gradient(to right, #a855f7, #ec4899); 
                  color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
          Ir al Dashboard
        </a>
      </div>
    `,
  }),
  
  passwordReset: (resetLink: string) => ({
    subject: 'Restablecer contraseña',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #a855f7;">Restablecer Contraseña</h1>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}" 
           style="display: inline-block; background: #a855f7; color: white; 
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          Restablecer Contraseña
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          Este enlace expira en 1 hora. Si no solicitaste esto, ignora este email.
        </p>
      </div>
    `,
  }),
  
  reportReady: (reportName: string, downloadUrl: string) => ({
    subject: `Reporte listo: ${reportName}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #a855f7;">📊 Tu Reporte está Listo</h1>
        <p>El reporte "${reportName}" ha sido generado exitosamente.</p>
        <a href="${downloadUrl}" 
           style="display: inline-block; background: linear-gradient(to right, #10b981, #14b8a6); 
                  color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          Descargar Reporte
        </a>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔔 ABLY - REALTIME
// ═══════════════════════════════════════════════════════════════════════════════════════

import Ably from 'ably'

let ablyClient: Ably.Realtime | null = null

export function getAblyClient(): Ably.Realtime {
  if (!ablyClient && process.env.ABLY_API_KEY) {
    ablyClient = new Ably.Realtime({
      key: process.env.ABLY_API_KEY,
      clientId: 'chronos-server',
    })
  }
  return ablyClient!
}

export function subscribeToChannel(
  channelName: string,
  eventName: string,
  callback: (message: Ably.Message) => void
): () => void {
  const ably = getAblyClient()
  const channel = ably.channels.get(channelName)
  
  channel.subscribe(eventName, callback)
  
  return () => {
    channel.unsubscribe(eventName, callback)
  }
}

export async function publishToChannel(
  channelName: string,
  eventName: string,
  data: any
): Promise<void> {
  const ably = getAblyClient()
  const channel = ably.channels.get(channelName)
  await channel.publish(eventName, data)
}

// Presence (quién está online)
export async function enterPresence(
  channelName: string,
  userData: any
): Promise<void> {
  const ably = getAblyClient()
  const channel = ably.channels.get(channelName)
  await channel.presence.enter(userData)
}

export async function getPresence(channelName: string): Promise<Ably.PresenceMessage[]> {
  const ably = getAblyClient()
  const channel = ably.channels.get(channelName)
  return channel.presence.get()
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📊 POSTHOG - ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════════════

import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null

export function getPostHogClient(): PostHog {
  if (!posthogClient && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    })
  }
  return posthogClient!
}

export function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
): void {
  const posthog = getPostHogClient()
  if (posthog) {
    posthog.capture({
      distinctId,
      event,
      properties,
    })
  }
}

export function identifyUser(
  distinctId: string,
  properties: Record<string, any>
): void {
  const posthog = getPostHogClient()
  if (posthog) {
    posthog.identify({
      distinctId,
      properties,
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔒 SENTRY - ERROR TRACKING
// ═══════════════════════════════════════════════════════════════════════════════════════

import * as Sentry from '@sentry/nextjs'

export function captureException(error: Error, context?: Record<string, any>): void {
  Sentry.captureException(error, {
    extra: context,
  })
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(message, level)
}

export function setUserContext(user: {
  id: string
  email?: string
  username?: string
}): void {
  Sentry.setUser(user)
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🤖 AI - OPENAI
// ═══════════════════════════════════════════════════════════════════════════════════════

import OpenAI from 'openai'

let openaiClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

export async function generateAIResponse(
  prompt: string,
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
  }
): Promise<string> {
  const openai = getOpenAIClient()
  
  const messages: OpenAI.ChatCompletionMessageParam[] = []
  
  if (options?.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt })
  }
  
  messages.push({ role: 'user', content: prompt })
  
  const response = await openai.chat.completions.create({
    model: options?.model || 'gpt-4o',
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1000,
  })
  
  return response.choices[0].message.content || ''
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📁 VERCEL BLOB - STORAGE
// ═══════════════════════════════════════════════════════════════════════════════════════

import { put, del, list } from '@vercel/blob'

export async function uploadFile(
  filename: string,
  data: Buffer | Blob | ReadableStream,
  options?: { contentType?: string; access?: 'public' }
): Promise<{ url: string; pathname: string }> {
  const blob = await put(filename, data, {
    access: options?.access || 'public',
    contentType: options?.contentType,
  })
  
  return {
    url: blob.url,
    pathname: blob.pathname,
  }
}

export async function deleteFile(url: string): Promise<void> {
  await del(url)
}

export async function listFiles(prefix?: string): Promise<{ blobs: { url: string; pathname: string }[] }> {
  return list({ prefix })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTACIONES
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  // Database
  getTursoClient,
  queryWithRetry,
  
  // Cache
  getRedisClient,
  cacheGet,
  createRateLimiter,
  checkRateLimit,
  
  // Email
  getResendClient,
  sendEmail,
  emailTemplates,
  
  // Realtime
  getAblyClient,
  subscribeToChannel,
  publishToChannel,
  enterPresence,
  getPresence,
  
  // Analytics
  getPostHogClient,
  trackServerEvent,
  identifyUser,
  
  // Error Tracking
  captureException,
  captureMessage,
  setUserContext,
  
  // AI
  getOpenAIClient,
  generateAIResponse,
  
  // Storage
  uploadFile,
  deleteFile,
  listFiles,
}
