/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔐 CHRONOS SYSTEM - JWT Authentication Utils
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Utilidades para manejo de JWT tokens en autenticación.
 * Incluye verificación, generación y extracción de tokens.
 *
 * Implementación ligera sin dependencias externas usando Node.js crypto.
 *
 * @version 1.0.1
 * @author CHRONOS Security Team
 */

import { createHmac } from 'crypto'
import type { NextRequest } from 'next/server'
import { logger } from '../utils/logger'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export interface JWTPayload {
  /** Subject (user ID) */
  sub?: string
  /** Issuer */
  iss?: string
  /** Audience */
  aud?: string
  /** Expiration time (Unix timestamp) */
  exp?: number
  /** Issued at (Unix timestamp) */
  iat?: number
  /** Not before (Unix timestamp) */
  nbf?: number
  /** JWT ID */
  jti?: string
  /** Allow additional claims */
  [key: string]: unknown
}

export interface TokenPayload extends JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'operator' | 'viewer'
  name?: string
}

export interface TokenOptions {
  /** Tiempo de expiración (ej: "1h", "7d") */
  expiresIn?: string
  /** Issuer del token */
  issuer?: string
  /** Audience del token */
  audience?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_EXPIRATION = '24h'
const ISSUER = 'chronos-system'
const AUDIENCE = 'chronos-app'
const ALGORITHM = 'HS256'

// Nombre de la cookie de autenticación
export const AUTH_COOKIE_NAME = 'chronos-auth-token'
export const REFRESH_COOKIE_NAME = 'chronos-refresh-token'

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS INTERNOS
// ═══════════════════════════════════════════════════════════════════════════

function getSecretKey(): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET or NEXTAUTH_SECRET environment variable is required')
  }
  return secret
}

// ═══════════════════════════════════════════════════════════════════════════
// BASE64URL ENCODING (RFC 7515)
// ═══════════════════════════════════════════════════════════════════════════

function base64UrlEncode(input: string | Buffer): string {
  const base64 = Buffer.isBuffer(input)
    ? input.toString('base64')
    : Buffer.from(input).toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64
  return Buffer.from(padded, 'base64').toString('utf-8')
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS PARA TIEMPO DE EXPIRACIÓN
// ═══════════════════════════════════════════════════════════════════════════

function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhdw])$/)
  if (!match) throw new Error(`Invalid expiresIn format: ${expiresIn}`)

  const value = parseInt(match[1] ?? '0', 10)
  const unit = match[2]

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
    w: 60 * 60 * 24 * 7,
  }

  return Math.floor(Date.now() / 1000) + value * (multipliers[unit ?? 'h'] ?? 3600)
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERACIÓN DE TOKENS (Implementación nativa con Node.js crypto)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Genera un JWT token con el payload proporcionado.
 *
 * @param payload - Datos del usuario a incluir en el token
 * @param options - Opciones de configuración del token
 * @returns Token JWT firmado
 *
 * @example
 * ```ts
 * const token = await generateToken({
 *   userId: "user-123",
 *   email: "user@example.com",
 *   role: "operator",
 * })
 * ```
 */
export async function generateToken(
  payload: Omit<TokenPayload, 'iat' | 'exp' | 'iss' | 'aud'>,
  options: TokenOptions = {},
): Promise<string> {
  const { expiresIn = DEFAULT_EXPIRATION, issuer = ISSUER, audience = AUDIENCE } = options

  try {
    const header = { alg: ALGORITHM, typ: 'JWT' }

    const now = Math.floor(Date.now() / 1000)
    const fullPayload = {
      ...payload,
      iss: issuer,
      aud: audience,
      iat: now,
      exp: parseExpiresIn(expiresIn),
    } as TokenPayload

    const encodedHeader = base64UrlEncode(JSON.stringify(header))
    const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload))

    const signatureInput = `${encodedHeader}.${encodedPayload}`
    const signature = createHmac('sha256', getSecretKey()).update(signatureInput).digest()

    const encodedSignature = base64UrlEncode(signature)
    const token = `${signatureInput}.${encodedSignature}`

    logger.info('Token generated successfully', {
      context: 'JWT',
      data: { userId: payload.userId, role: payload.role },
    })

    return token
  } catch (error) {
    logger.error('Failed to generate token', error as Error, {
      context: 'JWT',
    })
    throw new Error('Failed to generate authentication token')
  }
}

/**
 * Genera un par de tokens: access token (corta duración) y refresh token (larga duración).
 */
export async function generateTokenPair(
  payload: Omit<TokenPayload, 'iat' | 'exp' | 'iss' | 'aud'>,
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = await generateToken(payload, { expiresIn: '15m' })
  const refreshToken = await generateToken(payload, { expiresIn: '7d' })

  return { accessToken, refreshToken }
}

// ═══════════════════════════════════════════════════════════════════════════
// VERIFICACIÓN DE TOKENS (Implementación nativa con Node.js crypto)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Verifica y decodifica un JWT token.
 *
 * @param token - Token JWT a verificar
 * @returns Payload decodificado del token
 * @throws Error si el token es inválido o expirado
 *
 * @example
 * ```ts
 * try {
 *   const payload = await verifyToken(token)
 *   console.log(payload.userId, payload.role)
 * } catch {
 *   // Token inválido o expirado
 * }
 * ```
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token structure')
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts

    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      throw new Error('Invalid token parts')
    }

    // Verify signature
    const signatureInput = `${encodedHeader}.${encodedPayload}`
    const expectedSignature = base64UrlEncode(
      createHmac('sha256', getSecretKey()).update(signatureInput).digest(),
    )

    if (expectedSignature !== encodedSignature) {
      throw new Error('Invalid signature')
    }

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as TokenPayload

    // Verify expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired')
    }

    // Verify issuer and audience
    if (payload.iss !== ISSUER) {
      throw new Error('Invalid issuer')
    }
    if (payload.aud !== AUDIENCE) {
      throw new Error('Invalid audience')
    }

    return payload
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logger.warn('Token verification failed', {
      context: 'JWT',
      data: { error: errorMessage },
    })

    throw new Error('Invalid or expired token')
  }
}

/**
 * Verifica un token sin lanzar excepción.
 * Útil para verificaciones opcionales.
 */
export async function verifyTokenSafe(
  token: string,
): Promise<{ success: true; payload: TokenPayload } | { success: false; error: string }> {
  try {
    const payload = await verifyToken(token)
    return { success: true, payload }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Token verification failed',
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTRACCIÓN DE TOKENS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extrae el token de autenticación de un NextRequest.
 * Busca en: Authorization header, cookies.
 *
 * @param request - NextRequest de Next.js
 * @returns Token si existe, null si no
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // 1. Intentar desde Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // 2. Intentar desde cookie
  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (cookieToken) {
    return cookieToken
  }

  return null
}

/**
 * Extrae el token de una cabecera Authorization estándar.
 */
export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  return null
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES DE COOKIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Genera opciones de cookie seguras para tokens.
 */
export function getSecureCookieOptions(maxAge: number = 86400) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
  }
}

/**
 * Decodifica un token sin verificar firma (solo para inspección).
 * ⚠️ NO usar para autenticación, solo para debugging/logs.
 */
export function decodeTokenUnsafe(token: string): TokenPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payloadPart = parts[1]
    if (!payloadPart) return null

    const payload = JSON.parse(base64UrlDecode(payloadPart))
    return payload as TokenPayload
  } catch {
    return null
  }
}

/**
 * Verifica si un token está próximo a expirar.
 * @param payload - Payload del token
 * @param thresholdSeconds - Segundos antes de expiración para considerar "próximo"
 */
export function isTokenExpiringSoon(payload: TokenPayload, thresholdSeconds = 300): boolean {
  const exp = payload.exp
  if (typeof exp !== 'number') return false
  const now = Math.floor(Date.now() / 1000)
  return exp - now < thresholdSeconds
}
