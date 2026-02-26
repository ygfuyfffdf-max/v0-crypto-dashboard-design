/**
 * 🔐 Session Token Management — HMAC-SHA256
 *
 * Lightweight signed-token system using Web Crypto API.
 * Zero external dependencies — compatible with Node.js 20+, Edge Runtime.
 *
 * Token format: `<base64url_payload>.<base64url_signature>`
 */

import type { NextRequest } from 'next/server'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SessionPayload {
  userId: string
  email: string
  nombre: string
  role: string
  /** Issued-at (unix seconds) */
  iat: number
  /** Expiration  (unix seconds) */
  exp: number
}

// ─── Config ─────────────────────────────────────────────────────────────────

const SESSION_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds
const COOKIE_NAME = 'chronos-session'

// ─── Internals ──────────────────────────────────────────────────────────────

function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET environment variable must be set in production')
  }
  return secret || 'chronos-dev-secret-change-in-production'
}

async function getSigningKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

/** Encode a UTF-8 string to base64url */
function toBase64Url(str: string): string {
  const encoded = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < encoded.length; i++) {
    binary += String.fromCharCode(encoded[i]!)
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/** Decode a base64url string to UTF-8 */
function fromBase64Url(encoded: string): string {
  const padded =
    encoded.replace(/-/g, '+').replace(/_/g, '/') +
    '=='.slice(0, (4 - (encoded.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Create a signed session token containing user information.
 */
export async function createSessionToken(
  userId: string,
  email: string,
  nombre: string,
  role: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    userId,
    email,
    nombre,
    role,
    iat: now,
    exp: now + SESSION_MAX_AGE,
  }

  const payloadB64 = toBase64Url(JSON.stringify(payload))

  const key = await getSigningKey()
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payloadB64),
  )

  // Signature bytes → base64url
  const sigBytes = new Uint8Array(sig)
  let sigBinary = ''
  for (let i = 0; i < sigBytes.length; i++) {
    sigBinary += String.fromCharCode(sigBytes[i]!)
  }
  const sigB64 = btoa(sigBinary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return `${payloadB64}.${sigB64}`
}

/**
 * Verify a session token string.
 * Returns the decoded payload if valid & non-expired, `null` otherwise.
 */
export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const dotIdx = token.indexOf('.')
    if (dotIdx === -1) return null

    const payloadB64 = token.slice(0, dotIdx)
    const sigB64 = token.slice(dotIdx + 1)
    if (!payloadB64 || !sigB64) return null

    // Decode signature from base64url
    const sigPadded =
      sigB64.replace(/-/g, '+').replace(/_/g, '/') +
      '=='.slice(0, (4 - (sigB64.length % 4)) % 4)
    const sigBinary = atob(sigPadded)
    const sigBytes = new Uint8Array(sigBinary.length)
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i)
    }

    // Verify HMAC
    const key = await getSigningKey()
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(payloadB64),
    )
    if (!valid) return null

    // Decode & validate payload
    const payload: SessionPayload = JSON.parse(fromBase64Url(payloadB64))
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) return null

    return payload
  } catch {
    return null
  }
}

/**
 * Extract and verify session from a `NextRequest` cookie.
 * Convenience helper for API route handlers.
 */
export async function getSessionFromRequest(
  request: NextRequest,
): Promise<SessionPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

/** The cookie name used for sessions (shared constant). */
export { COOKIE_NAME, SESSION_MAX_AGE }
