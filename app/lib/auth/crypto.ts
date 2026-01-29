// ═══════════════════════════════════════════════════════════════
// UTILIDADES DE HASH - PRODUCCIÓN CON BCRYPT (WEB CRYPTO)
// ═══════════════════════════════════════════════════════════════

const PEPPER = 'chronos_pepper_2025_prod'

export async function hashPassword(password: string): Promise<string> {
  // Usar Web Crypto API compatible con Edge Runtime
  const encoder = new TextEncoder()
  const data = encoder.encode(password + PEPPER)

  // PBKDF2 con 100,000 iteraciones para mayor seguridad
  const keyMaterial = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits'])

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )

  // Combinar salt + hash para almacenamiento
  const hashArray = new Uint8Array(derivedBits)
  const combined = new Uint8Array(salt.length + hashArray.length)
  combined.set(salt)
  combined.set(hashArray, salt.length)

  // Convertir a base64 para almacenamiento
  return btoa(String.fromCharCode(...combined))
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + PEPPER)

    // Decodificar el hash almacenado
    const combined = new Uint8Array(
      atob(storedHash)
        .split('')
        .map((c) => c.charCodeAt(0)),
    )

    // Extraer salt (primeros 16 bytes) y hash
    const salt = combined.slice(0, 16)
    const storedHashBytes = combined.slice(16)

    const keyMaterial = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits'])

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256,
    )

    const newHashBytes = new Uint8Array(derivedBits)

    // Comparación de tiempo constante para evitar timing attacks
    if (storedHashBytes.length !== newHashBytes.length) return false
    let result = 0
    for (let i = 0; i < storedHashBytes.length; i++) {
      const a = storedHashBytes[i] ?? 0
      const b = newHashBytes[i] ?? 0
      result |= a ^ b
    }
    return result === 0
  } catch {
    // Fallback para hashes legacy (SHA-256 simple)
    const encoder = new TextEncoder()
    const legacyData = encoder.encode(password + 'chronos_salt_2025')
    const hashBuffer = await crypto.subtle.digest('SHA-256', legacyData)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const legacyHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return legacyHash === storedHash
  }
}
