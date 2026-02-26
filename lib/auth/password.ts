// @ts-nocheck
/**
 * 🔐 Secure Password Hashing — PBKDF2-SHA256
 *
 * Uses Web Crypto API (zero external dependencies).
 * Compatible with Node.js 20+, Edge Runtime, and Cloudflare Workers.
 *
 * Storage format: `<iterations>:<salt_hex>:<hash_hex>`
 */

const PBKDF2_ITERATIONS = 100_000
const SALT_BYTES = 16 // 128-bit salt
const KEY_BYTES = 32 // 256-bit derived key
const HASH_ALGO = 'SHA-256'

// ─── Hex helpers ────────────────────────────────────────────────────────────

function bufferToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

// ─── Core functions ─────────────────────────────────────────────────────────

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: HASH_ALGO,
    },
    keyMaterial,
    KEY_BYTES * 8,
  )

  return new Uint8Array(bits)
}

/**
 * Hash a plaintext password.
 *
 * @returns  A string in the format `iterations:salt_hex:hash_hex`
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await deriveKey(password, salt, PBKDF2_ITERATIONS)

  return `${PBKDF2_ITERATIONS}:${bufferToHex(salt)}:${bufferToHex(hash)}`
}

/**
 * Verify a plaintext password against a stored hash string.
 *
 * Uses constant-time comparison to prevent timing attacks.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  try {
    const parts = storedHash.split(':')
    if (parts.length !== 3) return false

    const [iterStr, saltHex, expectedHex] = parts
    const iterations = parseInt(iterStr!, 10)
    if (Number.isNaN(iterations) || iterations < 1) return false

    const salt = hexToBuffer(saltHex!)
    const derived = await deriveKey(password, salt, iterations)
    const computedHex = bufferToHex(derived)

    // Constant-time comparison to prevent timing side-channels
    if (computedHex.length !== expectedHex!.length) return false
    let diff = 0
    for (let i = 0; i < computedHex.length; i++) {
      diff |= computedHex.charCodeAt(i) ^ expectedHex!.charCodeAt(i)
    }
    return diff === 0
  } catch {
    return false
  }
}
