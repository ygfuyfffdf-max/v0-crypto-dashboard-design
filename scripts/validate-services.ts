/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * ✅ CHRONOS INFINITY 2026 — PRODUCTION ENVIRONMENT VALIDATOR
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Valida todas las variables de entorno y servicios antes del despliegue.
 * Ejecutar: pnpm tsx scripts/validate-services.ts
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

interface ServiceCheck {
  name: string
  required: string[]
  optional?: string[]
  test?: () => Promise<boolean>
}

const services: ServiceCheck[] = [
  {
    name: '🗄️ Turso Database',
    required: ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'],
  },
  {
    name: '🔐 Clerk Auth (optional - has bypass mode)',
    required: [],
    optional: ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY', 'CLERK_WEBHOOK_SECRET'],
  },
  {
    name: '🔴 Upstash Redis (optional - has memory fallback)',
    required: [],
    optional: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
  },
  {
    name: '📊 PostHog Analytics',
    required: ['NEXT_PUBLIC_POSTHOG_KEY'],
    optional: ['NEXT_PUBLIC_POSTHOG_HOST'],
  },
  {
    name: '🔌 Ably Realtime',
    required: ['ABLY_API_KEY'],
    optional: ['NEXT_PUBLIC_ABLY_API_KEY'],
  },
  {
    name: '🐛 Sentry',
    required: ['SENTRY_AUTH_TOKEN', 'SENTRY_ORG', 'SENTRY_PROJECT'],
    optional: ['NEXT_PUBLIC_SENTRY_DSN'],
  },
  {
    name: '🔍 Algolia Search (optional - has Fuse.js fallback)',
    required: [],
    optional: ['NEXT_PUBLIC_ALGOLIA_APP_ID', 'NEXT_PUBLIC_ALGOLIA_SEARCH_KEY', 'ALGOLIA_ADMIN_KEY'],
  },
  {
    name: '📧 Resend Email',
    required: ['RESEND_API_KEY'],
    optional: ['EMAIL_FROM', 'EMAIL_FROM_NAME'],
  },
  {
    name: '🤖 OpenAI',
    required: ['OPENAI_API_KEY'],
    optional: ['NEXT_PUBLIC_DEFAULT_AI_MODEL'],
  },
]

async function validateEnvironment() {
  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('🔍 CHRONOS INFINITY 2026 — PRODUCTION VALIDATION')
  console.log('═══════════════════════════════════════════════════════════════\n')

  let hasErrors = false
  let hasWarnings = false

  for (const service of services) {
    console.log(`\n${service.name}`)
    console.log('─'.repeat(50))

    // Check required variables
    const missingRequired: string[] = []
    for (const key of service.required) {
      const value = process.env[key]
      if (!value || value.startsWith('YOUR_')) {
        missingRequired.push(key)
        console.log(`  ❌ ${key}: NOT CONFIGURED`)
      } else {
        const masked = value.length > 20
          ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
          : '***'
        console.log(`  ✅ ${key}: ${masked}`)
      }
    }

    // Check optional variables
    if (service.optional) {
      for (const key of service.optional) {
        const value = process.env[key]
        if (!value || value.startsWith('YOUR_')) {
          console.log(`  ⚠️ ${key}: Not set (optional)`)
          hasWarnings = true
        } else {
          console.log(`  ✅ ${key}: Configured`)
        }
      }
    }

    if (missingRequired.length > 0) {
      hasErrors = true
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('📋 VALIDATION SUMMARY')
  console.log('═══════════════════════════════════════════════════════════════\n')

  if (hasErrors) {
    console.log('❌ FAILED: Missing required configuration')
    console.log('\n🔧 To fix:')
    console.log('   1. Update .env.local with your actual API keys')
    console.log('   2. Run this script again to validate')
    console.log('   3. For Vercel, run: vercel env pull')
    process.exit(1)
  } else if (hasWarnings) {
    console.log('⚠️ PASSED WITH WARNINGS: Some optional configuration missing')
    console.log('\n📝 Note: Optional services will be disabled until configured.')
    process.exit(0)
  } else {
    console.log('✅ ALL SERVICES CONFIGURED CORRECTLY!')
    console.log('\n🚀 Ready for production deployment:')
    console.log('   vercel --prod')
    process.exit(0)
  }
}

// Run validation
validateEnvironment().catch(console.error)
