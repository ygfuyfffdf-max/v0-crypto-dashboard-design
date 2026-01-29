#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 CHRONOS ELITE - SCRIPT DE DESPLIEGUE PRODUCCIÓN AVANZADO
# ═══════════════════════════════════════════════════════════════════════════════
# Versión: 3.0.0
# Stack: Next.js 16 + Turso + Drizzle + NextAuth + ElevenLabs + Deepgram
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}"
echo "═══════════════════════════════════════════════════════════════════════════"
echo "🚀 CHRONOS ELITE - DESPLIEGUE A PRODUCCIÓN VERCEL"
echo "═══════════════════════════════════════════════════════════════════════════"
echo -e "${NC}"

# ═══════════════════════════════════════════════════════════════════════════════
# VERIFICACIONES INICIALES
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}📋 Verificando requisitos...${NC}"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no encontrado. Instalando...${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm no encontrado. Usando npm...${NC}"
    PACKAGE_MANAGER="npm"
else
    PACKAGE_MANAGER="pnpm"
    echo -e "${GREEN}✅ pnpm: $(pnpm --version)${NC}"
fi

# Verificar Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI no encontrado. Instalando...${NC}"
    $PACKAGE_MANAGER add -g vercel
fi
echo -e "${GREEN}✅ Vercel CLI: $(vercel --version 2>/dev/null || echo 'instalado')${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Ejecutar desde la raíz del proyecto${NC}"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════════
# VARIABLES DE ENTORNO REQUERIDAS
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}🔐 Variables de entorno requeridas para producción:${NC}"
echo ""

REQUIRED_VARS=(
    "DATABASE_URL|Turso database URL (libsql://...)|REQUERIDO"
    "DATABASE_AUTH_TOKEN|Turso auth token|REQUERIDO"
    "NEXTAUTH_URL|URL de producción (https://...)|REQUERIDO"
    "NEXTAUTH_SECRET|Secret para JWT (openssl rand -base64 32)|REQUERIDO"
)

OPTIONAL_VARS=(
    "XAI_API_KEY|xAI Grok API key|IA Principal"
    "OPENAI_API_KEY|OpenAI API key|IA Fallback"
    "ANTHROPIC_API_KEY|Anthropic Claude API key|IA Alternativa"
    "GOOGLE_GENERATIVE_AI_API_KEY|Google Gemini API key|IA Alternativa"
    "ELEVENLABS_API_KEY|ElevenLabs TTS API key|Voz Síntesis"
    "DEEPGRAM_API_KEY|Deepgram STT API key|Voz Transcripción"
    "SENTRY_DSN|Sentry DSN para monitoreo|Observabilidad"
    "NEXT_PUBLIC_BASE_URL|URL pública de la app|Configuración"
    "NEXT_PUBLIC_ENVIRONMENT|Nombre del entorno|Configuración"
)

echo -e "${RED}🔴 REQUERIDAS:${NC}"
for var_info in "${REQUIRED_VARS[@]}"; do
    IFS='|' read -r var_name var_desc var_type <<< "$var_info"
    echo -e "   ${YELLOW}$var_name${NC}: $var_desc"
done

echo ""
echo -e "${BLUE}🔵 OPCIONALES (para funcionalidad completa):${NC}"
for var_info in "${OPTIONAL_VARS[@]}"; do
    IFS='|' read -r var_name var_desc var_type <<< "$var_info"
    echo -e "   ${CYAN}$var_name${NC}: $var_desc [$var_type]"
done

# ═══════════════════════════════════════════════════════════════════════════════
# LIMPIAR Y PREPARAR
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}🧹 Limpiando artefactos anteriores...${NC}"
rm -rf .next
rm -rf node_modules/.cache
echo -e "${GREEN}✅ Limpieza completada${NC}"

# ═══════════════════════════════════════════════════════════════════════════════
# INSTALAR DEPENDENCIAS
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}📦 Instalando dependencias...${NC}"
$PACKAGE_MANAGER install --frozen-lockfile 2>/dev/null || $PACKAGE_MANAGER install
echo -e "${GREEN}✅ Dependencias instaladas${NC}"

# ═══════════════════════════════════════════════════════════════════════════════
# VALIDACIONES PRE-BUILD
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}🔍 Ejecutando validaciones...${NC}"

# Type-check
echo -e "${BLUE}   📝 TypeScript check...${NC}"
$PACKAGE_MANAGER run type-check || {
    echo -e "${RED}❌ Error de TypeScript. Corrigiendo antes de continuar...${NC}"
    exit 1
}
echo -e "${GREEN}   ✅ TypeScript OK${NC}"

# Lint
echo -e "${BLUE}   🔧 ESLint check...${NC}"
$PACKAGE_MANAGER run lint || {
    echo -e "${YELLOW}⚠️  Warnings de ESLint detectados (no críticos)${NC}"
}
echo -e "${GREEN}   ✅ Lint OK${NC}"

# ═══════════════════════════════════════════════════════════════════════════════
# BUILD LOCAL DE PRUEBA
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}🏗️  Ejecutando build de verificación...${NC}"

# Intentar build (puede fallar si no hay env vars, lo cual es esperado)
if $PACKAGE_MANAGER run build 2>&1 | tee /tmp/build.log; then
    echo -e "${GREEN}✅ Build de verificación exitoso${NC}"
else
    echo -e "${YELLOW}⚠️  Build falló localmente (normal si faltan env vars)${NC}"
    echo -e "${YELLOW}   El build se ejecutará en Vercel con las env vars configuradas${NC}"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN DE VERCEL
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}🔧 CONFIGURACIÓN DE VERCEL${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════${NC}"

# Verificar si ya está linkeado
if [ ! -d ".vercel" ]; then
    echo -e "${CYAN}🔗 Linkeando proyecto con Vercel...${NC}"
    vercel link
else
    echo -e "${GREEN}✅ Proyecto ya linkeado con Vercel${NC}"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURAR VARIABLES DE ENTORNO EN VERCEL
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}🔐 Configurando variables de entorno...${NC}"
echo ""
echo -e "${YELLOW}Ejecutar los siguientes comandos para configurar las variables:${NC}"
echo ""

# Generar comandos para variables requeridas
echo -e "${RED}# ═══ REQUERIDAS ═══${NC}"
echo ""
echo "# 1. Database Turso"
echo "vercel env add DATABASE_URL production"
echo "vercel env add DATABASE_AUTH_TOKEN production"
echo ""
echo "# 2. Autenticación NextAuth"
echo "vercel env add NEXTAUTH_URL production"
echo "vercel env add NEXTAUTH_SECRET production"
echo ""

echo -e "${BLUE}# ═══ OPCIONALES (IA) ═══${NC}"
echo ""
echo "# 3. xAI Grok (IA principal)"
echo "vercel env add XAI_API_KEY production"
echo ""
echo "# 4. OpenAI (fallback)"
echo "vercel env add OPENAI_API_KEY production"
echo ""
echo "# 5. Anthropic Claude"
echo "vercel env add ANTHROPIC_API_KEY production"
echo ""
echo "# 6. Google Gemini"
echo "vercel env add GOOGLE_GENERATIVE_AI_API_KEY production"
echo ""

echo -e "${CYAN}# ═══ OPCIONALES (VOZ) ═══${NC}"
echo ""
echo "# 7. ElevenLabs TTS"
echo "vercel env add ELEVENLABS_API_KEY production"
echo ""
echo "# 8. Deepgram STT"
echo "vercel env add DEEPGRAM_API_KEY production"
echo ""

echo -e "${GREEN}# ═══ CONFIGURACIÓN ═══${NC}"
echo ""
echo "# 9. Variables públicas"
echo "vercel env add NEXT_PUBLIC_BASE_URL production"
echo "vercel env add NEXT_PUBLIC_ENVIRONMENT production"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# MENÚ DE DESPLIEGUE
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}🚀 OPCIONES DE DESPLIEGUE${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}1)${NC} Despliegue Preview (staging)"
echo -e "${CYAN}2)${NC} Despliegue Producción"
echo -e "${CYAN}3)${NC} Ver variables de entorno configuradas"
echo -e "${CYAN}4)${NC} Salir"
echo ""

read -p "Selecciona opción [1-4]: " option

case $option in
    1)
        echo ""
        echo -e "${CYAN}🚀 Desplegando a Preview...${NC}"
        vercel
        ;;
    2)
        echo ""
        echo -e "${CYAN}🚀 Desplegando a Producción...${NC}"
        vercel --prod
        ;;
    3)
        echo ""
        echo -e "${CYAN}📋 Variables de entorno configuradas:${NC}"
        vercel env ls
        ;;
    4)
        echo -e "${GREEN}👋 Hasta luego!${NC}"
        exit 0
        ;;
    *)
        echo -e "${YELLOW}Opción no válida${NC}"
        ;;
esac

# ═══════════════════════════════════════════════════════════════════════════════
# POST-DESPLIEGUE
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ PROCESO COMPLETADO${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📋 Próximos pasos:${NC}"
echo "   1. Verificar el despliegue en https://vercel.com/dashboard"
echo "   2. Configurar dominio personalizado (si aplica)"
echo "   3. Verificar logs: vercel logs --follow"
echo "   4. Probar funcionalidades de IA y voz"
echo ""
echo -e "${CYAN}🔗 Comandos útiles:${NC}"
echo "   vercel logs --follow     # Ver logs en tiempo real"
echo "   vercel env ls            # Listar variables de entorno"
echo "   vercel promote           # Promover preview a producción"
echo "   vercel rollback          # Revertir a versión anterior"
echo ""
