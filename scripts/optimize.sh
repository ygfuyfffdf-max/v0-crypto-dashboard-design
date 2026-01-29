#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# 🚀 CHRONOS - SCRIPT DE OPTIMIZACIÓN AVANZADA
# Optimiza el workspace, limpia caches y prepara el ambiente
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "🚀 CHRONOS - Optimización del Workspace"
echo "════════════════════════════════════════"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════
# 🧹 LIMPIEZA DE CACHES
# ═══════════════════════════════════════════════════════════════════════════
echo -e "\n${BLUE}🧹 Limpiando caches...${NC}"

# Next.js cache
if [ -d ".next" ]; then
  rm -rf .next
  echo -e "${GREEN}✓${NC} Cache de Next.js limpiado"
fi

# Turbo cache
if [ -d ".turbo" ]; then
  rm -rf .turbo
  echo -e "${GREEN}✓${NC} Cache de Turbo limpiado"
fi

# TypeScript cache
if [ -f "tsconfig.tsbuildinfo" ]; then
  rm -f tsconfig.tsbuildinfo
  echo -e "${GREEN}✓${NC} Cache de TypeScript limpiado"
fi

# Jest cache
if [ -d "coverage" ]; then
  rm -rf coverage
  echo -e "${GREEN}✓${NC} Coverage de Jest limpiado"
fi

# Playwright cache
if [ -d "playwright-report" ]; then
  rm -rf playwright-report
  echo -e "${GREEN}✓${NC} Reportes de Playwright limpiados"
fi

if [ -d "test-results" ]; then
  rm -rf test-results
  echo -e "${GREEN}✓${NC} Resultados de tests limpiados"
fi

# ═══════════════════════════════════════════════════════════════════════════
# 📦 VERIFICACIÓN DE DEPENDENCIAS
# ═══════════════════════════════════════════════════════════════════════════
echo -e "\n${BLUE}📦 Verificando dependencias...${NC}"

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
  echo -e "${YELLOW}⚠${NC} pnpm no encontrado, instalando..."
  corepack enable
  corepack prepare pnpm@latest --activate
fi

# Instalar dependencias si node_modules no existe
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}⚠${NC} node_modules no encontrado, instalando..."
  pnpm install --frozen-lockfile
else
  echo -e "${GREEN}✓${NC} Dependencias verificadas"
fi

# ═══════════════════════════════════════════════════════════════════════════
# 🔧 VERIFICACIÓN DE CONFIGURACIÓN
# ═══════════════════════════════════════════════════════════════════════════
echo -e "\n${BLUE}🔧 Verificando configuración...${NC}"

# Verificar .env.local
if [ ! -f ".env.local" ]; then
  if [ -f ".env.example" ]; then
    echo -e "${YELLOW}⚠${NC} Copiando .env.example a .env.local..."
    cp .env.example .env.local
  else
    echo -e "${RED}✗${NC} Archivo .env.local no encontrado"
  fi
else
  echo -e "${GREEN}✓${NC} Archivo .env.local presente"
fi

# Verificar base de datos SQLite
if [ ! -d "database" ]; then
  mkdir -p database
  echo -e "${GREEN}✓${NC} Directorio database creado"
fi

# ═══════════════════════════════════════════════════════════════════════════
# 🧪 VERIFICACIÓN DE HERRAMIENTAS
# ═══════════════════════════════════════════════════════════════════════════
echo -e "\n${BLUE}🧪 Verificando herramientas...${NC}"

# TypeScript check
if pnpm type-check 2>/dev/null; then
  echo -e "${GREEN}✓${NC} TypeScript: Sin errores"
else
  echo -e "${YELLOW}⚠${NC} TypeScript: Hay advertencias (revisar con pnpm type-check)"
fi

# ═══════════════════════════════════════════════════════════════════════════
# 📊 RESUMEN
# ═══════════════════════════════════════════════════════════════════════════
echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ OPTIMIZACIÓN COMPLETADA${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"

echo -e "\n${BLUE}Comandos disponibles:${NC}"
echo "  pnpm dev         - Iniciar servidor de desarrollo"
echo "  pnpm build       - Build de producción"
echo "  pnpm lint        - Ejecutar ESLint"
echo "  pnpm test        - Ejecutar tests"
echo "  pnpm test:e2e    - Ejecutar tests E2E"
echo "  pnpm db:studio   - Abrir Drizzle Studio"

echo -e "\n${YELLOW}🚀 ¡Workspace listo para desarrollo!${NC}\n"
