#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 CHRONOS - Script de Deployment Automatizado
# ═══════════════════════════════════════════════════════════════════════════════
# Deployment automatizado a Vercel con validaciones completas

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════════"
echo "🚀 CHRONOS INFINITY - DEPLOYMENT AUTOMATIZADO"
echo "═══════════════════════════════════════════════════════════════"
echo -e "${NC}"

# Configurar PATH
export PATH="/home/vscode/.local/share/pnpm:$PATH"

# Verificar herramientas
echo -e "${YELLOW}🔍 Verificando herramientas...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js no encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}✗ pnpm no encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ pnpm $(pnpm --version)${NC}"

if ! command -v vercel &> /dev/null; then
    echo -e "${RED}✗ Vercel CLI no encontrado${NC}"
    echo -e "${YELLOW}Instalando Vercel CLI...${NC}"
    pnpm add -g vercel
fi
echo -e "${GREEN}✓ Vercel CLI instalado${NC}"

echo ""

# Preguntar tipo de deployment
echo -e "${YELLOW}Selecciona el tipo de deployment:${NC}"
echo "1) Preview (testing)"
echo "2) Production"
echo "3) Validación solamente (no deploy)"
read -p "Opción [1-3]: " deploy_type

echo ""

# Validación
echo -e "${YELLOW}📝 Ejecutando validaciones...${NC}"

echo -n "  Lint... "
if pnpm lint --quiet 2>&1 | grep -q "error"; then
    echo -e "${RED}✗ FALLÓ${NC}"
    echo -e "${RED}Hay errores de lint que deben corregirse${NC}"
    exit 1
else
    echo -e "${GREEN}✓${NC}"
fi

echo -n "  TypeScript... "
if ! pnpm type-check > /dev/null 2>&1; then
    echo -e "${RED}✗ FALLÓ${NC}"
    echo -e "${RED}Hay errores de TypeScript que deben corregirse${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC}"

echo -n "  Build... "
if ! pnpm build > /tmp/chronos-build.log 2>&1; then
    echo -e "${RED}✗ FALLÓ${NC}"
    echo -e "${RED}Error en el build. Ver detalles en /tmp/chronos-build.log${NC}"
    tail -20 /tmp/chronos-build.log
    exit 1
fi
echo -e "${GREEN}✓${NC}"

echo ""
echo -e "${GREEN}✅ Todas las validaciones pasaron${NC}"
echo ""

# Si solo es validación, terminar aquí
if [ "$deploy_type" == "3" ]; then
    echo -e "${GREEN}✅ Validación completa - Proyecto listo para deploy${NC}"
    echo ""
    echo -e "${YELLOW}Para deployar, ejecuta:${NC}"
    echo "  Preview:    vercel"
    echo "  Production: vercel --prod"
    exit 0
fi

# Deployment
if [ "$deploy_type" == "1" ]; then
    echo -e "${YELLOW}🚀 Deploying a Preview...${NC}"
    vercel
elif [ "$deploy_type" == "2" ]; then
    echo -e "${YELLOW}🚀 Deploying a Production...${NC}"
    echo ""
    echo -e "${RED}⚠️  ADVERTENCIA: Estás a punto de deployar a PRODUCCIÓN${NC}"
    read -p "¿Continuar? (y/N): " confirm

    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo -e "${YELLOW}Deployment cancelado${NC}"
        exit 0
    fi

    vercel --prod
else
    echo -e "${RED}Opción inválida${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETADO${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
