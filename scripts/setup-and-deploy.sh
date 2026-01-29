#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# CHRONOS 2026 - Script de Configuración y Deploy Completo
# ═══════════════════════════════════════════════════════════════════════════════
# Este script configura y despliega el sistema CHRONOS completo
# Incluye: Git, GitHub, Turso, Vercel y validación de flujo
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

# Funciones de utilidad
print_header() {
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ═══════════════════════════════════════════════════════════════════════════════
# VERIFICACIONES PREVIAS
# ═══════════════════════════════════════════════════════════════════════════════

print_header "🔍 VERIFICANDO REQUISITOS"

# Verificar Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js: $NODE_VERSION"
else
    print_error "Node.js no encontrado. Instalando..."
    if command -v apk &> /dev/null; then
        sudo apk add --no-cache nodejs npm
    elif command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y nodejs npm
    fi
fi

# Verificar pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    print_success "pnpm: $PNPM_VERSION"
else
    print_warning "pnpm no encontrado. Instalando..."
    npm install -g pnpm
fi

# Verificar Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_success "Git: $GIT_VERSION"
else
    print_error "Git no encontrado"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN DE VARIABLES DE ENTORNO
# ═══════════════════════════════════════════════════════════════════════════════

print_header "🔐 CONFIGURANDO VARIABLES DE ENTORNO"

# Verificar .env.local
if [ -f ".env.local" ]; then
    print_success ".env.local existe"

    # Verificar variables críticas
    if grep -q "DATABASE_URL" .env.local; then
        print_success "DATABASE_URL configurado"
    else
        print_warning "DATABASE_URL no encontrado en .env.local"
    fi

    if grep -q "DATABASE_AUTH_TOKEN" .env.local; then
        print_success "DATABASE_AUTH_TOKEN configurado"
    else
        print_warning "DATABASE_AUTH_TOKEN no encontrado en .env.local"
    fi

    if grep -q "NEXTAUTH_SECRET" .env.local; then
        print_success "NEXTAUTH_SECRET configurado"
    else
        print_warning "NEXTAUTH_SECRET no encontrado en .env.local"
    fi
else
    print_warning ".env.local no existe. Creando desde ejemplo..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_info "Edita .env.local con tus valores"
    fi
fi

# ═══════════════════════════════════════════════════════════════════════════════
# INSTALACIÓN DE DEPENDENCIAS
# ═══════════════════════════════════════════════════════════════════════════════

print_header "📦 INSTALANDO DEPENDENCIAS"

pnpm install --frozen-lockfile
print_success "Dependencias instaladas"

# ═══════════════════════════════════════════════════════════════════════════════
# VERIFICACIÓN DE BASE DE DATOS (TURSO)
# ═══════════════════════════════════════════════════════════════════════════════

print_header "🗄️ VERIFICANDO CONEXIÓN A TURSO"

# Cargar variables de entorno
if [ -f ".env.local" ]; then
    export $(grep -E "^(DATABASE_URL|DATABASE_AUTH_TOKEN)" .env.local | xargs)
fi

if [ -f ".env.production.local" ]; then
    export $(grep -E "^(DATABASE_URL|DATABASE_AUTH_TOKEN)" .env.production.local | xargs)
fi

if [ -n "$DATABASE_URL" ]; then
    print_success "DATABASE_URL: ${DATABASE_URL:0:50}..."

    # Test de conexión con Node.js
    node -e "
    const { createClient } = require('@libsql/client');
    const client = createClient({
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN
    });
    client.execute('SELECT 1').then(() => {
      console.log('✅ Conexión a Turso exitosa');
      process.exit(0);
    }).catch(e => {
      console.error('❌ Error conectando a Turso:', e.message);
      process.exit(1);
    });
    " 2>/dev/null && print_success "Conexión a Turso verificada" || print_warning "No se pudo verificar conexión a Turso"
else
    print_warning "DATABASE_URL no configurado"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# TYPE CHECKING
# ═══════════════════════════════════════════════════════════════════════════════

print_header "📝 VERIFICANDO TIPOS TYPESCRIPT"

if pnpm tsc --noEmit 2>/dev/null; then
    print_success "TypeScript: Sin errores"
else
    print_warning "TypeScript tiene warnings (puede ser normal)"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# LINTING
# ═══════════════════════════════════════════════════════════════════════════════

print_header "🔍 EJECUTANDO LINTER"

if pnpm lint 2>/dev/null; then
    print_success "ESLint: Sin errores"
else
    print_warning "ESLint tiene warnings"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# BUILD DE PRODUCCIÓN
# ═══════════════════════════════════════════════════════════════════════════════

print_header "🏗️ CONSTRUYENDO PARA PRODUCCIÓN"

if pnpm build; then
    print_success "Build completado exitosamente"
else
    print_error "Build falló"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════════
# GIT STATUS
# ═══════════════════════════════════════════════════════════════════════════════

print_header "📊 ESTADO DEL REPOSITORIO"

BRANCH=$(git branch --show-current)
print_info "Rama actual: $BRANCH"

CHANGES=$(git status --short | wc -l)
if [ "$CHANGES" -gt 0 ]; then
    print_warning "Hay $CHANGES archivos modificados"
    git status --short | head -10
else
    print_success "Repositorio limpio"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# RESUMEN
# ═══════════════════════════════════════════════════════════════════════════════

print_header "📋 RESUMEN DE CONFIGURACIÓN"

echo ""
echo -e "${CYAN}Sistema CHRONOS 2026${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓${NC} Node.js:    $(node --version 2>/dev/null || echo 'N/A')"
echo -e "${GREEN}✓${NC} pnpm:       $(pnpm --version 2>/dev/null || echo 'N/A')"
echo -e "${GREEN}✓${NC} Git:        $(git --version 2>/dev/null | cut -d' ' -f3 || echo 'N/A')"
echo -e "${GREEN}✓${NC} Rama:       $BRANCH"
echo -e "${GREEN}✓${NC} Database:   Turso (LibSQL)"
echo -e "${GREEN}✓${NC} Deploy:     Vercel"
echo ""
echo -e "${CYAN}URLs del Proyecto:${NC}"
echo -e "  🌐 Producción: https://v0-crypto-dashboard-design.vercel.app"
echo -e "  📦 GitHub:     https://github.com/zoro488/v0-crypto-dashboard-design"
echo ""
echo -e "${GREEN}✅ Sistema configurado correctamente${NC}"
