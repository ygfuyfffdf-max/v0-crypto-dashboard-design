#!/bin/bash

echo ""
echo "🌌 Iniciando CHRONOS INFINITY 2026..."
echo ""

# Configurar PATH
export PATH="$PATH:$HOME/.turso"

# Verificar que Turso DB esté disponible
if ! curl -s --max-time 5 "https://chronos-infinity-2026-zoro488.aws-us-west-2.turso.io" >/dev/null 2>&1; then
    echo "⚠️  Turso DB puede no estar disponible, pero continuando..."
fi

# Iniciar el servidor de desarrollo
echo "🚀 Iniciando servidor Next.js en modo desarrollo..."
pnpm dev
