// database/index.ts
import { createClient, type Client } from '@libsql/client'
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql'
import * as schema from './schema'

// Limpiar URL de posibles caracteres invisibles
const databaseUrl = (process.env.DATABASE_URL || 'file:database/sqlite.db').trim()

const client = createClient({
  url: databaseUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN?.trim(),
})

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
