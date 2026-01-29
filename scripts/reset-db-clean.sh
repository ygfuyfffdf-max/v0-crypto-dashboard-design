#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# 🔄 CHRONOS INFINITY 2026 — SCRIPT RESET Y SEED LIMPIO
# ═══════════════════════════════════════════════════════════════════════════

echo "🔄 RESET Y SEED LIMPIO DE BASE DE DATOS TURSO"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Ejecutar script TypeScript de reset y seed
echo "📋 Ejecutando reset y seed..."
npx tsx database/reset-and-seed-clean.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ BASE DE DATOS RESETEAD A Y SEEDED CORRECTAMENTE"
    echo ""
    echo "🎯 Próximos pasos:"
    echo "   1. Reiniciar servidor dev (Ctrl+C y pnpm dev)"
    echo "   2. Refrescar navegador (Cmd/Ctrl + Shift + R)"
    echo "   3. Verificar datos en paneles"
    echo ""
else
    echo ""
    echo "❌ Error en reset y seed"
    exit 1
fi
