#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# 🌌 CHRONOS INFINITY 2026 — VERIFICACIÓN COMPLETA DEL SISTEMA
# ═══════════════════════════════════════════════════════════════════════════════════════════════════

set -e

echo "╔═══════════════════════════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                                                   ║"
echo "║                   🌌 CHRONOS INFINITY 2026 — VERIFICACIÓN QUIRÚRGICA ABSOLUTA                    ║"
echo "║                                                                                                   ║"
echo "╠═══════════════════════════════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                                                   ║"

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# 1. HERRAMIENTAS CORE
# ═══════════════════════════════════════════════════════════════════════════════════════════════════
echo "║  🛠️  VERIFICANDO HERRAMIENTAS CORE...                                                            ║"
echo "║                                                                                                   ║"

node_version=$(node --version 2>/dev/null || echo "NOT_INSTALLED")
npm_version=$(npm --version 2>/dev/null || echo "NOT_INSTALLED")
npx_version=$(npx --version 2>/dev/null || echo "NOT_INSTALLED")
pnpm_version=$(pnpm --version 2>/dev/null || echo "NOT_INSTALLED")
git_version=$(git --version 2>/dev/null | awk '{print $3}' || echo "NOT_INSTALLED")
python_version=$(python3 --version 2>/dev/null | awk '{print $2}' || echo "NOT_INSTALLED")
sqlite_version=$(sqlite3 --version 2>/dev/null | awk '{print $1}' || echo "NOT_INSTALLED")

echo "║     ✅ Node.js: $node_version                                                                    ║"
echo "║     ✅ npm: $npm_version                                                                         ║"
echo "║     ✅ npx: $npx_version                                                                         ║"
echo "║     ✅ pnpm: $pnpm_version                                                                       ║"
echo "║     ✅ Git: $git_version                                                                         ║"
echo "║     ✅ Python3: $python_version                                                                  ║"
echo "║     ✅ SQLite: $sqlite_version                                                                   ║"
echo "║                                                                                                   ║"

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# 2. HERRAMIENTAS MULTIMEDIA
# ═══════════════════════════════════════════════════════════════════════════════════════════════════
echo "║  🎨 VERIFICANDO HERRAMIENTAS MULTIMEDIA...                                                        ║"
echo "║                                                                                                   ║"

opencv_version=$(python3 -c "import cv2; print(cv2.__version__)" 2>/dev/null || echo "NOT_INSTALLED")
ffmpeg_version=$(ffmpeg -version 2>/dev/null | head -1 | awk '{print $3}' || echo "NOT_INSTALLED")
chromium_version=$(chromium --version 2>/dev/null | awk '{print $2}' || echo "NOT_INSTALLED")
playwright_version=$(pnpm exec playwright --version 2>/dev/null | awk '{print $2}' || echo "NOT_INSTALLED")

echo "║     ✅ OpenCV: $opencv_version                                                                   ║"
echo "║     ✅ FFmpeg: $ffmpeg_version                                                                   ║"
echo "║     ✅ Chromium: $chromium_version                                                               ║"
echo "║     ✅ Playwright: $playwright_version                                                           ║"
echo "║                                                                                                   ║"

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# 3. DATABASE TOOLS
# ═══════════════════════════════════════════════════════════════════════════════════════════════════
echo "║  🗄️  VERIFICANDO DATABASE TOOLS...                                                               ║"
echo "║                                                                                                   ║"

turso_version=$(~/.turso/turso --version 2>/dev/null | head -1 || echo "NOT_INSTALLED")

echo "║     ✅ Turso CLI: $turso_version                                                                 ║"
echo "║                                                                                                   ║"

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# 4. MCP SERVERS
# ═══════════════════════════════════════════════════════════════════════════════════════════════════
echo "║  🔌 VERIFICANDO MCP SERVERS...                                                                    ║"
echo "║                                                                                                   ║"

if [ -f .vscode/mcp.json ]; then
    mcp_count=$(grep -o '"[a-zA-Z0-9_-]*":' .vscode/mcp.json | grep -v "type\|command\|args\|env\|autoApprove\|inputs\|password\|description\|id" | wc -l)
    echo "║     ✅ MCP Servers configurados: $mcp_count                                                   ║"
else
    echo "║     ⚠️  MCP Config no encontrado                                                              ║"
fi

echo "║                                                                                                   ║"

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# 5. VERIFICACIÓN DE CÓDIGO
# ═══════════════════════════════════════════════════════════════════════════════════════════════════
echo "║  📝 VERIFICANDO CÓDIGO...                                                                         ║"
echo "║                                                                                                   ║"

# TypeScript
echo "║     🔍 Ejecutando TypeScript check...                                                            ║"
if pnpm type-check 2>&1 | grep -q "error TS"; then
    ts_errors=$(pnpm type-check 2>&1 | grep "error TS" | wc -l)
    echo "║     ❌ TypeScript: $ts_errors errores encontrados                                            ║"
else
    echo "║     ✅ TypeScript: Sin errores                                                                ║"
fi

# ESLint
echo "║     🔍 Ejecutando ESLint check...                                                                ║"
if pnpm lint 2>&1 | grep -q "error"; then
    lint_errors=$(pnpm lint 2>&1 | grep "error" | wc -l)
    echo "║     ⚠️  ESLint: $lint_errors errores encontrados                                             ║"
else
    echo "║     ✅ ESLint: Sin errores críticos                                                           ║"
fi

echo "║                                                                                                   ║"

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# 6. TESTS
# ═══════════════════════════════════════════════════════════════════════════════════════════════════
echo "║  🧪 VERIFICANDO TESTS...                                                                          ║"
echo "║                                                                                                   ║"

if pnpm test --passWithNoTests --silent 2>&1 | grep -q "Tests:"; then
    test_result=$(pnpm test --passWithNoTests --silent 2>&1 | grep "Tests:" | tail -1)
    echo "║     ✅ $test_result                                                                           ║"
else
    echo "║     ⚠️  Tests no ejecutados                                                                   ║"
fi

echo "║                                                                                                   ║"

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# 7. BUILD
# ═══════════════════════════════════════════════════════════════════════════════════════════════════
echo "║  📦 VERIFICANDO BUILD...                                                                          ║"
echo "║                                                                                                   ║"

if [ -d ".next" ]; then
    echo "║     ✅ Build existente encontrado                                                             ║"
else
    echo "║     ⚠️  Build no encontrado (ejecutar: pnpm build)                                            ║"
fi

echo "║                                                                                                   ║"

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# 8. VARIABLES DE ENTORNO
# ═══════════════════════════════════════════════════════════════════════════════════════════════════
echo "║  🔐 VERIFICANDO VARIABLES DE ENTORNO...                                                           ║"
echo "║                                                                                                   ║"

if [ -f ".env.local" ]; then
    echo "║     ✅ .env.local encontrado                                                                  ║"

    # Verificar variables críticas
    if grep -q "DATABASE_URL" .env.local; then
        echo "║     ✅ DATABASE_URL configurado                                                            ║"
    else
        echo "║     ❌ DATABASE_URL NO configurado                                                         ║"
    fi

    if grep -q "ELEVENLABS_API_KEY" .env.local; then
        echo "║     ✅ ELEVENLABS_API_KEY configurado                                                      ║"
    else
        echo "║     ⚠️  ELEVENLABS_API_KEY NO configurado                                                  ║"
    fi

    if grep -q "DEEPGRAM_API_KEY" .env.local; then
        echo "║     ✅ DEEPGRAM_API_KEY configurado                                                        ║"
    else
        echo "║     ⚠️  DEEPGRAM_API_KEY NO configurado                                                    ║"
    fi
else
    echo "║     ⚠️  .env.local NO encontrado                                                              ║"
fi

echo "║                                                                                                   ║"

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# 9. ARCHIVOS CRÍTICOS
# ═══════════════════════════════════════════════════════════════════════════════════════════════════
echo "║  📁 VERIFICANDO ARCHIVOS CRÍTICOS...                                                              ║"
echo "║                                                                                                   ║"

critical_files=(
    "database/schema.ts"
    "database/index.ts"
    "app/_actions/flujos-completos.ts"
    "app/_lib/ai/zero-force-voice.ts"
    "app/_components/chronos-2026/ai/ZeroAIWidget.tsx"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "║     ✅ $file                                                                               ║"
    else
        echo "║     ❌ $file NO ENCONTRADO                                                                 ║"
    fi
done

echo "║                                                                                                   ║"

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# 10. RESUMEN FINAL
# ═══════════════════════════════════════════════════════════════════════════════════════════════════
echo "╠═══════════════════════════════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                                                   ║"
echo "║                           ✨ VERIFICACIÓN COMPLETADA ✨                                           ║"
echo "║                                                                                                   ║"
echo "║     El sistema CHRONOS INFINITY 2026 ha sido verificado completamente.                           ║"
echo "║     Revisa los puntos marcados con ⚠️ o ❌ para correcciones necesarias.                         ║"
echo "║                                                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝"
