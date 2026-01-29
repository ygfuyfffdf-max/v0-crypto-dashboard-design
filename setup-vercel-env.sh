#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🔐 CHRONOS - Configuración Automática de Variables de Entorno en Vercel
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Banner
echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════════"
echo "🔐 CONFIGURACIÓN DE VARIABLES DE ENTORNO EN VERCEL"
echo "═══════════════════════════════════════════════════════════════"
echo -e "${NC}"

# Configurar PATH
export PATH="/home/vscode/.local/share/pnpm:$PATH"

# Verificar Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}✗ Vercel CLI no encontrado${NC}"
    echo -e "${YELLOW}Ejecuta primero: pnpm add -g vercel${NC}"
    exit 1
fi

# Verificar .env.local
if [ ! -f ".env.local" ]; then
    echo -e "${RED}✗ Archivo .env.local no encontrado${NC}"
    exit 1
fi

echo -e "${YELLOW}Este script te ayudará a configurar las variables de entorno en Vercel${NC}"
echo ""

# Generar nuevo NEXTAUTH_SECRET para producción
echo -e "${CYAN}🔑 Generando nuevo NEXTAUTH_SECRET para producción...${NC}"
NEXTAUTH_SECRET_PROD=$(openssl rand -base64 32)
echo -e "${GREEN}✓ Generado: ${NEXTAUTH_SECRET_PROD}${NC}"
echo ""

# Preguntar dominio de producción
echo -e "${YELLOW}📝 Ingresa tu dominio de Vercel para NEXTAUTH_URL:${NC}"
echo -e "${CYAN}Ejemplos:${NC}"
echo "  - https://chronos-infinity-2026.vercel.app"
echo "  - https://tu-dominio-personalizado.com"
read -p "URL: " NEXTAUTH_URL_PROD

if [ -z "$NEXTAUTH_URL_PROD" ]; then
    echo -e "${RED}✗ URL requerida${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}📋 VARIABLES A CONFIGURAR:${NC}"
echo ""

# Leer variables del .env.local
source .env.local

# Array de variables críticas
declare -A VARS
VARS[DATABASE_URL]="${DATABASE_URL}"
VARS[DATABASE_AUTH_TOKEN]="${DATABASE_AUTH_TOKEN}"
VARS[NEXTAUTH_URL]="${NEXTAUTH_URL_PROD}"
VARS[NEXTAUTH_SECRET]="${NEXTAUTH_SECRET_PROD}"

# Variables opcionales de IA
VARS[XAI_API_KEY]="${XAI_API_KEY}"
VARS[ELEVENLABS_API_KEY]="${ELEVENLABS_API_KEY}"
VARS[DEEPGRAM_API_KEY]="${DEEPGRAM_API_KEY}"
VARS[OPENAI_API_KEY]="${OPENAI_API_KEY}"
VARS[GITHUB_MODELS_ENDPOINT]="${GITHUB_MODELS_ENDPOINT}"
VARS[GITHUB_MODEL_PRIMARY]="${GITHUB_MODEL_PRIMARY}"
VARS[GITHUB_MODEL_REASONING]="${GITHUB_MODEL_REASONING}"
VARS[GITHUB_MODEL_FAST]="${GITHUB_MODEL_FAST}"
VARS[ELEVENLABS_VOICE_ID]="${ELEVENLABS_VOICE_ID}"
VARS[ELEVENLABS_MODEL_ID]="${ELEVENLABS_MODEL_ID}"
VARS[ELEVENLABS_VOICE_NAME]="${ELEVENLABS_VOICE_NAME}"
VARS[NEXT_PUBLIC_ENABLE_VOICE]="${NEXT_PUBLIC_ENABLE_VOICE}"
VARS[NEXT_PUBLIC_VOICE_LANGUAGE]="${NEXT_PUBLIC_VOICE_LANGUAGE}"
VARS[NEXT_PUBLIC_AI_NAME]="${NEXT_PUBLIC_AI_NAME}"
VARS[DEEPGRAM_MODEL]="${DEEPGRAM_MODEL}"

# Mostrar resumen
echo -e "${GREEN}✓ Variables Críticas (4):${NC}"
echo "  DATABASE_URL"
echo "  DATABASE_AUTH_TOKEN"
echo "  NEXTAUTH_URL → ${NEXTAUTH_URL_PROD}"
echo "  NEXTAUTH_SECRET → ${NEXTAUTH_SECRET_PROD:0:20}..."
echo ""
echo -e "${YELLOW}⚠ Variables de IA (15 - opcional):${NC}"
echo "  XAI_API_KEY, ELEVENLABS_API_KEY, DEEPGRAM_API_KEY, etc."
echo ""

# Preguntar qué configurar
echo -e "${YELLOW}¿Qué variables deseas configurar?${NC}"
echo "1) Solo críticas (DATABASE + NEXTAUTH)"
echo "2) Críticas + APIs de IA"
echo "3) Generar archivo .env.production (sin subir)"
read -p "Opción [1-3]: " option

echo ""

case $option in
    1)
        echo -e "${CYAN}📤 Configurando variables CRÍTICAS en Vercel...${NC}"
        VARS_TO_SET=(DATABASE_URL DATABASE_AUTH_TOKEN NEXTAUTH_URL NEXTAUTH_SECRET)
        ;;
    2)
        echo -e "${CYAN}📤 Configurando TODAS las variables en Vercel...${NC}"
        VARS_TO_SET=(${!VARS[@]})
        ;;
    3)
        echo -e "${CYAN}📝 Generando archivo .env.production...${NC}"

        cat > .env.production << EOF
# ═══════════════════════════════════════════════════════════════════════════════
# CHRONOS INFINITY 2026 — Production Environment Variables
# ═══════════════════════════════════════════════════════════════════════════════
# ⚠️ NO COMMITEAR ESTE ARCHIVO - Solo para referencia
# Configurar estas variables en Vercel Dashboard: Settings → Environment Variables

# 🗄️ TURSO DATABASE (CRÍTICO)
DATABASE_URL="${DATABASE_URL}"
DATABASE_AUTH_TOKEN="${DATABASE_AUTH_TOKEN}"

# 🔐 NEXTAUTH (CRÍTICO)
NEXTAUTH_URL="${NEXTAUTH_URL_PROD}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET_PROD}"

# 🤖 AI APIs (OPCIONAL)
XAI_API_KEY="${XAI_API_KEY}"
ELEVENLABS_API_KEY="${ELEVENLABS_API_KEY}"
DEEPGRAM_API_KEY="${DEEPGRAM_API_KEY}"
OPENAI_API_KEY="${OPENAI_API_KEY}"

# 🆓 GitHub Models (GRATIS)
GITHUB_MODELS_ENDPOINT="${GITHUB_MODELS_ENDPOINT}"
GITHUB_MODEL_PRIMARY="${GITHUB_MODEL_PRIMARY}"
GITHUB_MODEL_REASONING="${GITHUB_MODEL_REASONING}"
GITHUB_MODEL_FAST="${GITHUB_MODEL_FAST}"

# 🎙️ Voice Settings
ELEVENLABS_VOICE_ID="${ELEVENLABS_VOICE_ID}"
ELEVENLABS_MODEL_ID="${ELEVENLABS_MODEL_ID}"
ELEVENLABS_VOICE_NAME="${ELEVENLABS_VOICE_NAME}"
NEXT_PUBLIC_ENABLE_VOICE="${NEXT_PUBLIC_ENABLE_VOICE}"
NEXT_PUBLIC_VOICE_LANGUAGE="${NEXT_PUBLIC_VOICE_LANGUAGE}"
NEXT_PUBLIC_AI_NAME="${NEXT_PUBLIC_AI_NAME}"
DEEPGRAM_MODEL="${DEEPGRAM_MODEL}"
EOF

        echo -e "${GREEN}✓ Archivo .env.production creado${NC}"
        echo ""
        echo -e "${YELLOW}📋 COPIA estas variables a Vercel Dashboard:${NC}"
        echo -e "${CYAN}   https://vercel.com/dashboard → Tu Proyecto → Settings → Environment Variables${NC}"
        echo ""
        echo -e "${YELLOW}Puedes copiar todas las variables ejecutando:${NC}"
        echo -e "${CYAN}   cat .env.production${NC}"
        echo ""
        exit 0
        ;;
    *)
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac

# Preguntar ambiente
echo ""
echo -e "${YELLOW}¿A qué ambientes configurar?${NC}"
echo "1) Production"
echo "2) Preview"
echo "3) Production + Preview"
read -p "Opción [1-3]: " env_option

case $env_option in
    1) ENV_FLAG="production" ;;
    2) ENV_FLAG="preview" ;;
    3) ENV_FLAG="production,preview" ;;
    *)
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${CYAN}🚀 Configurando variables en Vercel...${NC}"
echo -e "${YELLOW}   Ambiente: ${ENV_FLAG}${NC}"
echo ""

# Contador
success=0
failed=0

# Configurar cada variable
for var_name in "${VARS_TO_SET[@]}"; do
    var_value="${VARS[$var_name]}"

    if [ -z "$var_value" ]; then
        echo -e "${YELLOW}⚠ ${var_name}: valor vacío, omitiendo${NC}"
        continue
    fi

    echo -n "  Configurando ${var_name}... "

    # Usar vercel env add
    if echo "$var_value" | vercel env add "$var_name" "$ENV_FLAG" --force > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        ((success++))
    else
        echo -e "${RED}✗${NC}"
        ((failed++))
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════════"

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✅ CONFIGURACIÓN EXITOSA${NC}"
    echo -e "${GREEN}   Variables configuradas: ${success}${NC}"
    echo ""
    echo -e "${YELLOW}Próximos pasos:${NC}"
    echo "  1. Verificar en Vercel Dashboard"
    echo "  2. Ejecutar: ./deploy.sh"
    echo "  3. O deployar directamente: vercel --prod"
else
    echo -e "${YELLOW}⚠ CONFIGURACIÓN PARCIAL${NC}"
    echo -e "${GREEN}   Exitosas: ${success}${NC}"
    echo -e "${RED}   Fallidas: ${failed}${NC}"
    echo ""
    echo -e "${YELLOW}Configura manualmente las fallidas en:${NC}"
    echo -e "${CYAN}   https://vercel.com/dashboard${NC}"
fi

echo "═══════════════════════════════════════════════════════════════"
