#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 CHRONOS INFINITY 2026 — Bundle Analyzer Script
 * ═══════════════════════════════════════════════════════════════════════════════
 * Script para analizar el bundle size y detectar problemas de performance
 * Uso: node scripts/analyze-bundle.js
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const fs = require("fs")
const path = require("path")

// Colores para output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function getColor(size, thresholds) {
  if (size > thresholds.danger) return colors.red
  if (size > thresholds.warning) return colors.yellow
  return colors.green
}

function analyzeBuildOutput() {
  const buildDir = path.join(process.cwd(), ".next")

  if (!fs.existsSync(buildDir)) {
    console.log(
      `${colors.red}❌ No se encontró directorio .next. Ejecuta 'pnpm build' primero.${colors.reset}`
    )
    process.exit(1)
  }

  console.log(
    `\n${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════════════════════${colors.reset}`
  )
  console.log(`${colors.bright}${colors.cyan}  🚀 CHRONOS — Análisis de Bundle${colors.reset}`)
  console.log(
    `${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════════════════════${colors.reset}\n`
  )

  // Analizar chunks
  const staticDir = path.join(buildDir, "static", "chunks")
  if (!fs.existsSync(staticDir)) {
    console.log(`${colors.yellow}⚠️ No se encontraron chunks estáticos.${colors.reset}`)
    return
  }

  const chunks = []
  const thresholds = {
    warning: 50 * 1024, // 50KB
    danger: 200 * 1024, // 200KB
  }

  function scanDir(dir, prefix = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        scanDir(fullPath, `${prefix}${entry.name}/`)
      } else if (entry.name.endsWith(".js")) {
        const stats = fs.statSync(fullPath)
        chunks.push({
          name: `${prefix}${entry.name}`,
          size: stats.size,
        })
      }
    }
  }

  scanDir(staticDir)

  // Ordenar por tamaño
  chunks.sort((a, b) => b.size - a.size)

  // Estadísticas
  const totalSize = chunks.reduce((sum, c) => sum + c.size, 0)
  const largeChunks = chunks.filter((c) => c.size > thresholds.danger)
  const mediumChunks = chunks.filter(
    (c) => c.size > thresholds.warning && c.size <= thresholds.danger
  )

  console.log(`${colors.bright}📊 Resumen General${colors.reset}`)
  console.log(`   Total chunks: ${chunks.length}`)
  console.log(`   Tamaño total: ${formatBytes(totalSize)}`)
  console.log(`   Chunks grandes (>200KB): ${colors.red}${largeChunks.length}${colors.reset}`)
  console.log(
    `   Chunks medianos (50-200KB): ${colors.yellow}${mediumChunks.length}${colors.reset}`
  )
  console.log()

  // Top 15 chunks más grandes
  console.log(`${colors.bright}📦 Top 15 Chunks Más Grandes${colors.reset}`)
  console.log(`${"─".repeat(70)}`)

  chunks.slice(0, 15).forEach((chunk, i) => {
    const color = getColor(chunk.size, thresholds)
    const bar = "█".repeat(Math.min(30, Math.floor((chunk.size / thresholds.danger) * 10)))
    console.log(
      `${String(i + 1).padStart(2)}. ${color}${formatBytes(chunk.size).padStart(10)}${colors.reset} ${bar}`
    )
    console.log(`    ${colors.cyan}${chunk.name}${colors.reset}`)
  })

  // Alertas
  console.log()
  if (largeChunks.length > 0) {
    console.log(`${colors.red}${colors.bright}⚠️ ALERTAS DE PERFORMANCE${colors.reset}`)
    console.log(`${"─".repeat(70)}`)

    largeChunks.forEach((chunk) => {
      console.log(`${colors.red}❌ ${chunk.name}${colors.reset}`)
      console.log(`   Tamaño: ${formatBytes(chunk.size)} - Considerar code splitting`)
    })
    console.log()
  }

  // Recomendaciones
  console.log(`${colors.bright}💡 Recomendaciones${colors.reset}`)
  console.log(`${"─".repeat(70)}`)

  if (totalSize > 1024 * 1024) {
    console.log(`${colors.yellow}• Bundle total >1MB. Revisar imports innecesarios.${colors.reset}`)
  }

  if (largeChunks.length > 3) {
    console.log(`${colors.yellow}• Muchos chunks grandes. Implementar lazy loading.${colors.reset}`)
  }

  const hasThreeJs = chunks.some((c) => c.name.includes("three"))
  if (hasThreeJs) {
    console.log(
      `${colors.blue}• Three.js detectado. Usar dynamic imports para escenas 3D.${colors.reset}`
    )
  }

  console.log()
  console.log(`${colors.green}✅ Análisis completado${colors.reset}`)
  console.log()
}

// Ejecutar
analyzeBuildOutput()
