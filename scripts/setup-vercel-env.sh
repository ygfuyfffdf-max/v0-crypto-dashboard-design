#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# CHRONOS INFINITY 2026 — Script de Configuración de Environment Variables Vercel
# ═══════════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════"
echo "🚀 CHRONOS INFINITY 2026 — Configuración Vercel"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Verificar que Vercel CLI esté instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado"
    echo "Instalar con: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI detectado"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN DE ENVIRONMENT VARIABLES
# ═══════════════════════════════════════════════════════════════════════════════

echo "📝 Configurando environment variables..."
echo ""

# Función para agregar variable
add_env() {
    local name=$1
    local value=$2
    local env_type=${3:-production}

    if [ -z "$value" ] || [ "$value" = "SKIP" ]; then
        echo "⏭️  Saltando: $name"
        return
    fi

    echo "Adding $name to $env_type..."
    echo "$value" | vercel env add "$name" "$env_type" --yes 2>/dev/null || echo "✓ Ya existe o error"
}

echo "════════════════════════════════════════════════════════════════"
echo "🗄️  TURSO DATABASE (REQUERIDO)"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Obtén las credenciales de Turso:"
echo "1. Ir a: https://turso.tech/app"
echo "2. Crear base de datos 'chronos-db'"
echo "3. Obtener URL y Auth Token"
echo ""
read -p "DATABASE_URL (libsql://...turso.io): " DATABASE_URL
read -p "DATABASE_AUTH_TOKEN: " DATABASE_AUTH_TOKEN

add_env "DATABASE_URL" "$DATABASE_URL" "production"
add_env "DATABASE_AUTH_TOKEN" "$DATABASE_AUTH_TOKEN" "production"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🔐 NEXTAUTH (REQUERIDO)"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Generar NEXTAUTH_SECRET automáticamente
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "GENERATE_THIS_IN_PRODUCTION")
echo "NEXTAUTH_SECRET generado automáticamente"

read -p "NEXTAUTH_URL (https://tu-dominio.vercel.app): " NEXTAUTH_URL

add_env "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET" "production"
add_env "NEXTAUTH_URL" "$NEXTAUTH_URL" "production"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🤖 AI PROVIDERS (OPCIONAL)"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Estos son opcionales pero recomendados para funciones de IA"
echo "Presiona ENTER para saltar cualquiera"
echo ""

read -p "OPENAI_API_KEY (sk-...): " OPENAI_API_KEY
add_env "OPENAI_API_KEY" "$OPENAI_API_KEY" "production"

read -p "ANTHROPIC_API_KEY (sk-ant-...): " ANTHROPIC_API_KEY
add_env "ANTHROPIC_API_KEY" "$ANTHROPIC_API_KEY" "production"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🔊 VOICE & TTS (OPCIONAL - Para Zero Force)"
echo "════════════════════════════════════════════════════════════════"
echo ""

read -p "ELEVENLABS_API_KEY (el_...): " ELEVENLABS_API_KEY
add_env "ELEVENLABS_API_KEY" "$ELEVENLABS_API_KEY" "production"

read -p "NEXT_PUBLIC_ZERO_VOICE_ID (default: TxGEqnHWrfWFTfGW9XjX): " ZERO_VOICE_ID
ZERO_VOICE_ID=${ZERO_VOICE_ID:-TxGEqnHWrfWFTfGW9XjX}
add_env "NEXT_PUBLIC_ZERO_VOICE_ID" "$ZERO_VOICE_ID" "production"

read -p "DEEPGRAM_API_KEY (dg_...): " DEEPGRAM_API_KEY
add_env "DEEPGRAM_API_KEY" "$DEEPGRAM_API_KEY" "production"

read -p "ASSEMBLYAI_API_KEY: " ASSEMBLYAI_API_KEY
add_env "ASSEMBLYAI_API_KEY" "$ASSEMBLYAI_API_KEY" "production"

read -p "GOOGLE_TTS_API_KEY (AIza...): " GOOGLE_TTS_API_KEY
add_env "GOOGLE_TTS_API_KEY" "$GOOGLE_TTS_API_KEY" "production"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📊 MONITOREO (OPCIONAL)"
echo "════════════════════════════════════════════════════════════════"
echo ""

read -p "SENTRY_DSN (https://...): " SENTRY_DSN
add_env "SENTRY_DSN" "$SENTRY_DSN" "production"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ CONFIGURACIÓN COMPLETADA"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Próximo paso: vercel --prod"
echo ""
