#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🌌 CHRONOS SYSTEM - Configuración Maestro
# ═══════════════════════════════════════════════════════════════════════════════
#
# Script automatizado para configurar todos los servicios del proyecto CHRONOS
#
# Uso: bash scripts/configure-all.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🌌 CHRONOS SYSTEM - Configuración Completa"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. VERIFICACIÓN DE HERRAMIENTAS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "🔍 1. Verificando herramientas instaladas..."
echo ""

TOOLS_OK=true

# Node.js
if command -v node &> /dev/null; then
    echo "  ✅ Node.js $(node --version)"
else
    echo "  ❌ Node.js NO instalado"
    TOOLS_OK=false
fi

# pnpm
if command -v pnpm &> /dev/null; then
    echo "  ✅ pnpm $(pnpm --version)"
else
    echo "  ❌ pnpm NO instalado - Instalar: npm install -g pnpm"
    TOOLS_OK=false
fi

# Turso CLI
if command -v turso &> /dev/null; then
    echo "  ✅ Turso CLI $(turso --version)"
else
    echo "  ❌ Turso CLI NO instalado - Instalar: curl -sSfL https://get.tur.so/install.sh | bash"
    TOOLS_OK=false
fi

# Vercel CLI
if command -v vercel &> /dev/null; then
    echo "  ✅ Vercel CLI $(vercel --version)"
else
    echo "  ⚠️  Vercel CLI NO instalado - Instalar: pnpm add -g vercel"
fi

# GitHub CLI
if command -v gh &> /dev/null; then
    echo "  ✅ GitHub CLI $(gh --version | head -1)"
else
    echo "  ⚠️  GitHub CLI NO instalado - Instalar: apk add github-cli"
fi

echo ""

if [ "$TOOLS_OK" = false ]; then
    echo "❌ Faltan herramientas esenciales. Por favor instálalas y vuelve a ejecutar."
    exit 1
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. INSTALACIÓN DE DEPENDENCIAS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "📦 2. Instalando dependencias del proyecto..."
echo ""
pnpm install
echo "  ✅ Dependencias instaladas"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. CONFIGURACIÓN DE TURSO
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "🗄️  3. Configurando Turso Database..."
echo ""

# Verificar autenticación
if turso auth whoami &> /dev/null; then
    echo "  ✅ Ya autenticado en Turso: $(turso auth whoami)"
else
    echo "  🔐 Necesitas autenticarte en Turso..."
    turso auth login
fi

# Mostrar base de datos
echo ""
echo "  📊 Base de datos actual:"
turso db show chronos-infinity-2026 2>/dev/null || echo "  ⚠️  Base de datos no encontrada"

echo ""
echo "  💡 Para obtener credenciales:"
echo "     turso db show chronos-infinity-2026 --url"
echo "     turso db tokens create chronos-infinity-2026"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. CONFIGURACIÓN DE VERCEL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if command -v vercel &> /dev/null; then
    echo "🚀 4. Configurando Vercel..."
    echo ""

    # Verificar si está logueado
    if vercel whoami &> /dev/null; then
        echo "  ✅ Ya autenticado en Vercel: $(vercel whoami)"
    else
        echo "  🔐 Autenticando con Vercel..."
        vercel login
    fi

    # Vincular proyecto si no está vinculado
    if [ ! -d ".vercel" ]; then
        echo "  🔗 Vinculando proyecto..."
        vercel link
    else
        echo "  ✅ Proyecto ya vinculado"
    fi

    echo ""
    echo "  💡 Siguiente paso: configurar variables de entorno"
    echo "     bash scripts/push-env-vercel.sh"
    echo ""
else
    echo "⚠️  4. Vercel CLI no instalado - Saltando configuración"
    echo ""
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5. CONFIGURACIÓN DE GITHUB
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if command -v gh &> /dev/null; then
    echo "🐙 5. Configurando GitHub CLI..."
    echo ""

    if gh auth status &> /dev/null; then
        echo "  ✅ Ya autenticado en GitHub"
        gh repo view 2>/dev/null || echo "  ⚠️  No se pudo obtener info del repo"
    else
        echo "  🔐 Necesitas autenticarte en GitHub..."
        gh auth login
    fi
    echo ""
else
    echo "⚠️  5. GitHub CLI no instalado - Saltando configuración"
    echo ""
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 6. CONFIGURACIÓN DE BASE DE DATOS LOCAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "🔧 6. Configurando base de datos local..."
echo ""

if [ ! -f "sqlite.db" ]; then
    echo "  📝 Aplicando schema a SQLite local..."
    pnpm db:push

    echo "  🌱 Ejecutando seed inicial..."
    pnpm db:seed

    echo "  ✅ Base de datos local lista"
else
    echo "  ✅ Base de datos local ya existe"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 7. VALIDACIÓN FINAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "✅ 7. Ejecutando validación final..."
echo ""

echo "  🔍 Type check..."
pnpm type-check

echo ""
echo "  🧹 Lint..."
pnpm lint

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RESUMEN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "✨ CONFIGURACIÓN COMPLETADA"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Siguiente pasos:"
echo ""
echo "  1. Verificar .env.local tiene todas las variables necesarias"
echo "  2. Configurar variables de producción en Vercel:"
echo "     bash scripts/push-env-vercel.sh"
echo ""
echo "  3. Iniciar servidor de desarrollo:"
echo "     pnpm dev"
echo ""
echo "  4. Abrir Drizzle Studio:"
echo "     pnpm db:studio"
echo ""
echo "📚 Documentación completa:"
echo "   docs/SERVICIOS_CONFIGURACION.md"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
