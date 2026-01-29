#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 CHRONOS - DEPLOYMENT AVANZADO AUTOMATIZADO
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuración
export PATH="/home/vscode/.local/share/pnpm:$HOME/.turso:$PATH"
export VERCEL_TOKEN="yXv5BOjUHai9Td6iUu8GF42d"

# Banner
clear
echo -e "${BLUE}"
cat << 'BANNER'
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ██████╗██╗  ██╗██████╗  ██████╗ ███╗   ██╗ ██████╗ ███████╗               ║
║  ██╔════╝██║  ██║██╔══██╗██╔═══██╗████╗  ██║██╔═══██╗██╔════╝               ║
║  ██║     ███████║██████╔╝██║   ██║██╔██╗ ██║██║   ██║███████╗               ║
║  ██║     ██╔══██║██╔══██╗██║   ██║██║╚██╗██║██║   ██║╚════██║               ║
║  ╚██████╗██║  ██║██║  ██║╚██████╔╝██║ ╚████║╚██████╔╝███████║               ║
║   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝               ║
║                                                                               ║
║              🚀 SISTEMA DE DEPLOYMENT AVANZADO v3.0                          ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
BANNER
echo -e "${NC}"

# Función de logging
log_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_step() {
    echo -e "${MAGENTA}➤${NC} ${BLUE}$1${NC}"
}

# Paso 1: Pre-flight checks
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
log_step "PASO 1/6: PRE-FLIGHT CHECKS"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""

log_info "Verificando Node.js..."
NODE_VERSION=$(node --version)
log_success "Node.js $NODE_VERSION"

log_info "Verificando pnpm..."
PNPM_VERSION=$(pnpm --version)
log_success "pnpm $PNPM_VERSION"

log_info "Verificando Vercel CLI..."
VERCEL_VERSION=$(vercel --version | head -1)
log_success "$VERCEL_VERSION"

log_info "Verificando Turso CLI..."
TURSO_VERSION=$(turso --version)
log_success "$TURSO_VERSION"

echo ""

# Paso 2: Validaciones de código
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
log_step "PASO 2/6: VALIDACIONES DE CÓDIGO"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""

log_info "Ejecutando TypeScript check..."
if pnpm type-check > /tmp/chronos-typecheck.log 2>&1; then
    log_success "TypeScript: 0 errores"
else
    log_error "TypeScript: Errores encontrados"
    tail -20 /tmp/chronos-typecheck.log
    exit 1
fi

log_info "Ejecutando ESLint..."
if pnpm lint --quiet 2>&1 | grep -q "error"; then
    log_error "ESLint: Errores encontrados"
    exit 1
else
    log_success "ESLint: Sin errores críticos"
fi

echo ""

# Paso 3: Build optimizado
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
log_step "PASO 3/6: BUILD OPTIMIZADO"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""

log_info "Limpiando builds anteriores..."
rm -rf .next
log_success "Cache limpiado"

log_info "Ejecutando build con optimizaciones..."
if pnpm build > /tmp/chronos-build.log 2>&1; then
    log_success "Build exitoso"
else
    log_error "Build falló"
    tail -50 /tmp/chronos-build.log
    exit 1
fi

echo ""

# Paso 4: Verificación de variables
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
log_step "PASO 4/6: VERIFICACIÓN DE VARIABLES"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""

if [ ! -f ".env.production" ]; then
    log_error "Archivo .env.production no encontrado"
    exit 1
fi

source .env.production

REQUIRED_VARS=("DATABASE_URL" "DATABASE_AUTH_TOKEN" "NEXTAUTH_URL" "NEXTAUTH_SECRET")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    else
        log_success "$var configurado"
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    log_error "Variables faltantes: ${MISSING_VARS[*]}"
    exit 1
fi

echo ""

# Paso 5: Conectividad
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
log_step "PASO 5/6: VERIFICACIÓN DE CONECTIVIDAD"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""

log_info "Verificando Vercel API..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://api.vercel.com/v2/user --header "Authorization: Bearer $VERCEL_TOKEN")
if [ "$HTTP_CODE" = "200" ]; then
    log_success "Vercel API: Conectado"
else
    log_error "Vercel API: Error ($HTTP_CODE)"
    exit 1
fi

log_info "Verificando Turso Database..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DATABASE_URL")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
    log_success "Turso DB: Accesible"
else
    log_warning "Turso DB: Respuesta $HTTP_CODE (puede ser normal)"
fi

echo ""

# Paso 6: Deployment
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
log_step "PASO 6/6: DEPLOYMENT A VERCEL"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""

log_info "Tipo de deployment:"
echo "  1) Preview (testing)"
echo "  2) Production"
echo "  3) Cancelar"
read -p "Selecciona (1-3): " DEPLOY_TYPE

case $DEPLOY_TYPE in
    1)
        log_info "Deploying a PREVIEW..."
        vercel --token $VERCEL_TOKEN
        ;;
    2)
        log_info "Deploying a PRODUCTION..."
        echo -e "${RED}⚠️  ADVERTENCIA: Deployment a PRODUCCIÓN${NC}"
        read -p "¿Continuar? (y/N): " CONFIRM
        if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
            vercel --prod --token $VERCEL_TOKEN
        else
            log_warning "Deployment cancelado"
            exit 0
        fi
        ;;
    3)
        log_warning "Deployment cancelado por usuario"
        exit 0
        ;;
    *)
        log_error "Opción inválida"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETADO EXITOSAMENTE${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

log_success "Proyecto deployado con éxito"
log_info "Verifica tu deployment en: https://vercel.com/dashboard"
echo ""
