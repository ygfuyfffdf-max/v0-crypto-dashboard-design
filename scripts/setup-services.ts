/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔧 CHRONOS INFINITY 2026 — INTERACTIVE SERVICE SETUP
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Script interactivo para configurar servicios de producción.
 * Ejecutar: pnpm tsx scripts/setup-services.ts
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import * as fs from 'fs'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim())
    })
  })
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('🔧 CHRONOS INFINITY 2026 — SERVICE CONFIGURATION')
  console.log('═══════════════════════════════════════════════════════════════\n')

  // Read current .env.local
  let envContent = ''
  try {
    envContent = fs.readFileSync('.env.local', 'utf-8')
  } catch {
    console.log('❌ .env.local not found!')
    process.exit(1)
  }

  const updates: Record<string, string> = {}

  // ═══════════════════════════════════════════════════════════════════════════════
  // CLERK AUTH
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n🔐 CLERK AUTH CONFIGURATION')
  console.log('─'.repeat(50))
  console.log('📍 Get keys from: https://dashboard.clerk.com/last-active?path=api-keys')
  console.log('')

  const clerkPubKey = await question('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ')
  if (clerkPubKey && !clerkPubKey.startsWith('YOUR_')) {
    updates['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'] = clerkPubKey
  }

  const clerkSecretKey = await question('CLERK_SECRET_KEY: ')
  if (clerkSecretKey && !clerkSecretKey.startsWith('YOUR_')) {
    updates['CLERK_SECRET_KEY'] = clerkSecretKey
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // UPSTASH REDIS
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n🔴 UPSTASH REDIS CONFIGURATION')
  console.log('─'.repeat(50))
  console.log('📍 Create Redis DB at: https://console.upstash.com/redis')
  console.log('   Then click on your database and go to "REST API" tab')
  console.log('')

  const redisUrl = await question('UPSTASH_REDIS_REST_URL: ')
  if (redisUrl && !redisUrl.startsWith('YOUR_')) {
    updates['UPSTASH_REDIS_REST_URL'] = redisUrl
  }

  const redisToken = await question('UPSTASH_REDIS_REST_TOKEN: ')
  if (redisToken && !redisToken.startsWith('YOUR_')) {
    updates['UPSTASH_REDIS_REST_TOKEN'] = redisToken
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // ALGOLIA
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n🔍 ALGOLIA SEARCH CONFIGURATION')
  console.log('─'.repeat(50))
  console.log('📍 Get App ID from: https://dashboard.algolia.com/account/api-keys')
  console.log('')

  const algoliaAppId = await question('NEXT_PUBLIC_ALGOLIA_APP_ID: ')
  if (algoliaAppId && !algoliaAppId.startsWith('YOUR_')) {
    updates['NEXT_PUBLIC_ALGOLIA_APP_ID'] = algoliaAppId
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // UPDATE .env.local
  // ═══════════════════════════════════════════════════════════════════════════════
  if (Object.keys(updates).length > 0) {
    console.log('\n📝 Updating .env.local...')

    for (const [key, value] of Object.entries(updates)) {
      // Replace existing placeholder or add new
      const regex = new RegExp(`^${key}=.*$`, 'm')
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}="${value}"`)
      } else {
        envContent += `\n${key}="${value}"`
      }
      console.log(`   ✅ ${key} updated`)
    }

    fs.writeFileSync('.env.local', envContent)
    console.log('\n✅ .env.local updated successfully!')
  } else {
    console.log('\n⚠️ No changes made.')
  }

  rl.close()

  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('🔄 Run validation: pnpm tsx scripts/validate-services.ts')
  console.log('═══════════════════════════════════════════════════════════════\n')
}

main().catch(console.error)
