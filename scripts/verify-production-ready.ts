/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * ✅ CHRONOS INFINITY 2026 — SCRIPT DE VERIFICACIÓN PRE-DEPLOY
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Verifica que todo esté listo para producción
 * 
 * Ejecutar: npx tsx scripts/verify-production-ready.ts
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════

interface CheckResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
}

const results: CheckResult[] = []

// ═══════════════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════

function check(name: string, condition: boolean, successMsg: string, failMsg: string, isWarning = false): void {
  results.push({
    name,
    status: condition ? 'pass' : (isWarning ? 'warn' : 'fail'),
    message: condition ? successMsg : failMsg,
  })
}

function fileExists(path: string): boolean {
  return existsSync(join(process.cwd(), path))
}

function getEnvVar(name: string): string | undefined {
  return process.env[name]
}

function readJsonFile(path: string): any {
  try {
    const content = readFileSync(join(process.cwd(), path), 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CHECKS
// ═══════════════════════════════════════════════════════════════════════════════════════

console.log('\n🔍 CHRONOS INFINITY 2026 - Verificación de Producción\n')
console.log('═'.repeat(60) + '\n')

// 1. Archivos esenciales
console.log('📁 Verificando archivos esenciales...\n')

check(
  'package.json',
  fileExists('package.json'),
  '✅ package.json existe',
  '❌ package.json no encontrado'
)

check(
  'next.config.ts',
  fileExists('next.config.ts') || fileExists('next.config.js'),
  '✅ next.config existe',
  '❌ next.config no encontrado'
)

check(
  'vercel.json',
  fileExists('vercel.json'),
  '✅ vercel.json existe',
  '❌ vercel.json no encontrado'
)

check(
  '.env.example',
  fileExists('.env.example') || fileExists('.env.production.example'),
  '✅ Archivo de ejemplo de ambiente existe',
  '⚠️ Se recomienda tener .env.example',
  true
)

// 2. Dependencias de producción
console.log('\n📦 Verificando dependencias críticas...\n')

const pkg = readJsonFile('package.json')

if (pkg) {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }
  
  check(
    'Next.js',
    deps['next'] !== undefined,
    `✅ Next.js instalado (${deps['next']})`,
    '❌ Next.js no encontrado'
  )
  
  check(
    'React',
    deps['react'] !== undefined,
    `✅ React instalado (${deps['react']})`,
    '❌ React no encontrado'
  )
  
  check(
    '@sentry/nextjs',
    deps['@sentry/nextjs'] !== undefined,
    '✅ Sentry instalado para error tracking',
    '⚠️ Se recomienda instalar @sentry/nextjs',
    true
  )
  
  check(
    '@vercel/analytics',
    deps['@vercel/analytics'] !== undefined,
    '✅ Vercel Analytics instalado',
    '⚠️ Se recomienda instalar @vercel/analytics',
    true
  )
}

// 3. Configuración de TypeScript
console.log('\n⚙️ Verificando configuración de TypeScript...\n')

const tsconfig = readJsonFile('tsconfig.json')

if (tsconfig) {
  check(
    'TypeScript strict mode',
    tsconfig.compilerOptions?.strict === true,
    '✅ Modo estricto habilitado',
    '⚠️ Se recomienda habilitar modo estricto',
    true
  )
  
  check(
    'TypeScript config',
    true,
    '✅ tsconfig.json válido',
    '❌ tsconfig.json inválido'
  )
}

// 4. Verificar estructura de carpetas
console.log('\n📂 Verificando estructura de proyecto...\n')

check(
  'app directory',
  fileExists('app'),
  '✅ Directorio app/ existe (App Router)',
  '❌ Directorio app/ no encontrado'
)

check(
  'public directory',
  fileExists('public'),
  '✅ Directorio public/ existe',
  '⚠️ Directorio public/ no encontrado',
  true
)

check(
  'API routes',
  fileExists('app/api'),
  '✅ Directorio app/api/ existe',
  '⚠️ Directorio app/api/ no encontrado',
  true
)

// 5. Verificar configuración de Vercel
console.log('\n☁️ Verificando configuración de Vercel...\n')

const vercelConfig = readJsonFile('vercel.json')

if (vercelConfig) {
  check(
    'Vercel framework',
    vercelConfig.framework === 'nextjs',
    '✅ Framework configurado como Next.js',
    '⚠️ Framework no especificado',
    true
  )
  
  check(
    'Build command',
    vercelConfig.buildCommand !== undefined,
    `✅ Build command: ${vercelConfig.buildCommand}`,
    '⚠️ Build command no especificado',
    true
  )
  
  check(
    'Security headers',
    vercelConfig.headers?.length > 0,
    '✅ Headers de seguridad configurados',
    '⚠️ Se recomienda configurar headers de seguridad',
    true
  )
}

// 6. Verificar scripts de npm
console.log('\n🔧 Verificando scripts de npm...\n')

if (pkg?.scripts) {
  check(
    'build script',
    pkg.scripts.build !== undefined,
    '✅ Script de build configurado',
    '❌ Script de build no encontrado'
  )
  
  check(
    'start script',
    pkg.scripts.start !== undefined,
    '✅ Script de start configurado',
    '❌ Script de start no encontrado'
  )
  
  check(
    'lint script',
    pkg.scripts.lint !== undefined,
    '✅ Script de lint configurado',
    '⚠️ Se recomienda tener script de lint',
    true
  )
  
  check(
    'test script',
    pkg.scripts.test !== undefined,
    '✅ Script de test configurado',
    '⚠️ Se recomienda tener script de test',
    true
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// RESULTADOS
// ═══════════════════════════════════════════════════════════════════════════════════════

console.log('\n' + '═'.repeat(60))
console.log('\n📊 RESUMEN DE VERIFICACIÓN\n')

const passed = results.filter(r => r.status === 'pass').length
const failed = results.filter(r => r.status === 'fail').length
const warnings = results.filter(r => r.status === 'warn').length

results.forEach(r => {
  const icon = r.status === 'pass' ? '✅' : r.status === 'warn' ? '⚠️' : '❌'
  console.log(`  ${icon} ${r.name}: ${r.message.replace(/^[✅❌⚠️]\s*/, '')}`)
})

console.log('\n' + '─'.repeat(60))
console.log(`\n  ✅ Pasaron: ${passed}`)
console.log(`  ⚠️ Advertencias: ${warnings}`)
console.log(`  ❌ Fallaron: ${failed}`)
console.log('')

if (failed > 0) {
  console.log('❌ HAY ERRORES CRÍTICOS. Corrige antes de deploy.\n')
  process.exit(1)
} else if (warnings > 0) {
  console.log('⚠️ Hay advertencias. Revisa antes de deploy.\n')
  console.log('✅ LISTO PARA DEPLOY (con advertencias)\n')
} else {
  console.log('✅ ¡TODO LISTO PARA PRODUCCIÓN!\n')
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PRÓXIMOS PASOS
// ═══════════════════════════════════════════════════════════════════════════════════════

console.log('═'.repeat(60))
console.log('\n🚀 PRÓXIMOS PASOS PARA DEPLOY:\n')
console.log('  1. Configura variables de entorno en Vercel Dashboard')
console.log('  2. Conecta tu repositorio a Vercel')
console.log('  3. Ejecuta: vercel --prod')
console.log('  4. Verifica el deploy en Vercel Dashboard')
console.log('  5. Configura dominio personalizado (opcional)')
console.log('')
console.log('📖 Guía completa: ./PRODUCTION_SERVICES_GUIDE.md')
console.log('')
