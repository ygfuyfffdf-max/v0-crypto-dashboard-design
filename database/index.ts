// database/index.ts
import { createClient, type Client } from '@libsql/client'
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql'
import * as schema from './schema'

// Limpiar URL de posibles caracteres invisibles
let databaseUrl = (process.env.DATABASE_URL || '').trim()

// Fallback robusto para build/deploy si la URL es inválida o placeholder
if (!databaseUrl || databaseUrl === 'your_database_url_here' || databaseUrl === 'file:database/sqlite.db') {
  console.warn('⚠️ Invalid or default DATABASE_URL. Using in-memory fallback for build safety.')
  databaseUrl = 'file::memory:'
}

// Intentar crear cliente de forma segura
let client
try {
  client = createClient({
    url: databaseUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN?.trim(),
  })
} catch (e) {
  console.error('⚠️ DB Connection Failed. Using memory fallback.', e)
  client = createClient({ url: 'file::memory:' })
}

// Extender el tipo de db para incluir execute
type ExtendedDB = LibSQLDatabase<typeof schema> & {
  execute: Client['execute']
}

const baseDb = drizzle(client, { schema })

// Agregar método execute al objeto db
export const db = Object.assign(baseDb, {
  execute: client.execute.bind(client),
}) as ExtendedDB

export * from './schema'
export { client, schema }
