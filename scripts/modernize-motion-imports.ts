#!/usr/bin/env tsx
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🚀 CHRONOS OMEGA — MOTION IMPORT MODERNIZER
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Moderniza TODOS los imports de framer-motion a motion/react
 * Basado en la documentación oficial de Motion + Figma Make
 *
 * CAMBIOS:
 * - framer-motion → motion/react
 * - Conserva todos los named imports
 * - Actualiza types y utilities
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../')

async function modernizeMotionImports() {
  console.log('🚀 Iniciando modernización de imports Motion...\n')

  // Buscar todos los archivos TypeScript/React
  const files = await glob('**/*.{ts,tsx}', {
    cwd: ROOT,
    ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**'],
    absolute: true,
  })

  let filesModified = 0
  let totalReplacements = 0

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')

    // Buscar imports de framer-motion
    if (!content.includes('framer-motion')) {
      continue
    }

    let newContent = content

    // PATRÓN 1: import { ... } from 'motion/react'
    newContent = newContent.replace(
      /import\s+\{([^}]+)\}\s+from\s+['"]framer-motion['"]/g,
      (match, imports) => {
        totalReplacements++
        return `import {${imports}} from 'motion/react'`
      },
    )

    // PATRÓN 2: import type { ... } from 'motion/react'
    newContent = newContent.replace(
      /import\s+type\s+\{([^}]+)\}\s+from\s+['"]framer-motion['"]/g,
      (match, imports) => {
        totalReplacements++
        return `import type {${imports}} from 'motion/react'`
      },
    )

    // PATRÓN 3: import * as Motion from 'motion/react'
    newContent = newContent.replace(
      /import\s+\*\s+as\s+(\w+)\s+from\s+['"]framer-motion['"]/g,
      (match, namespace) => {
        totalReplacements++
        return `import * as ${namespace} from 'motion/react'`
      },
    )

    // Si hubo cambios, guardar
    if (newContent !== content) {
      writeFileSync(file, newContent, 'utf-8')
      filesModified++
      console.log(`✅ ${file.replace(ROOT, '')}`)
    }
  }

  console.log(`\n${'═'.repeat(80)}`)
  console.log(`✨ MODERNIZACIÓN COMPLETADA`)
  console.log(`   Archivos modificados: ${filesModified}`)
  console.log(`   Total de reemplazos: ${totalReplacements}`)
  console.log(`${'═'.repeat(80)}\n`)
}

modernizeMotionImports().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
