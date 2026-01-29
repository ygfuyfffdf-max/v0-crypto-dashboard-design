#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 CHRONOS - Configuración Vercel CLI
# ═══════════════════════════════════════════════════════════════════════════════

echo "🔧 Configurando Vercel para CHRONOS..."

# Variables críticas del proyecto
VARS=(
  "DATABASE_URL:Turso database URL (production)"
  "DATABASE_AUTH_TOKEN:Turso auth token"
  "NEXTAUTH_URL:NextAuth URL (production)"
  "NEXTAUTH_SECRET:NextAuth secret key"
  "NEXT_PUBLIC_ENVIRONMENT:Environment name"
  "NEXT_PUBLIC_BASE_URL:Base URL"
  "XAI_API_KEY:xAI API key"
)

echo ""
echo "📋 Variables requeridas:"
for var_info in "${VARS[@]}"; do
  var_name="${var_info%%:*}"
  var_desc="${var_info#*:}"
  echo "  - $var_name: $var_desc"
done

echo ""
echo "💡 Para agregar variables:"
echo "   vercel env add VARIABLE_NAME"
echo ""
echo "💡 Para ver variables:"
echo "   vercel env ls"
echo ""
echo "💡 Para eliminar variables:"
echo "   vercel env rm VARIABLE_NAME"

# Verificar si Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado"
    echo "   Instalar con: pnpm add -g vercel"
    exit 1
fi

echo "✅ Vercel CLI configurado"
