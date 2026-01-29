/**
 * 🧪 Test de conexión a Turso DB
 */

import { createClient } from "@libsql/client"

const url = process.env.DATABASE_URL || "file:database/sqlite.db"
const token = process.env.DATABASE_AUTH_TOKEN

console.log("🔌 Testing Turso DB Connection...")
console.log("URL:", url)
console.log("Token exists:", !!token)

const client = createClient({ url, authToken: token })

async function testConnection() {
  try {
    // Test básico
    const result = await client.execute("SELECT 1 as test")
    console.log("✅ Conexión básica exitosa:", result.rows)

    // Test tablas
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'")
    console.log(
      "📋 Tablas existentes:",
      tables.rows.map((r) => r.name)
    )

    // Test bancos
    const bancos = await client.execute("SELECT * FROM bancos LIMIT 5")
    console.log("🏦 Bancos:", bancos.rows)
  } catch (err) {
    console.error("❌ Error:", err)
  }
}

testConnection()
