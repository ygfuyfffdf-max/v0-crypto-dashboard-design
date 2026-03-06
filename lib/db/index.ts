import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import * as schema from "./schema"

let _db: ReturnType<typeof drizzle> | null = null

export function getDB() {
  if (_db) return _db
  const url = process.env.TURSO_DATABASE_URL
  if (!url) {
    throw new Error("TURSO_DATABASE_URL is not set")
  }
  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  _db = drizzle(client, { schema })
  return _db
}

// Keep backward-compat default export (lazy)
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return (getDB() as any)[prop]
  },
})
