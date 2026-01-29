#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# CHRONOS INFINITY 2026 — VERIFICACIÓN PRE-PRODUCCIÓN
# Script para validar que el sistema está listo para deploy
# ═══════════════════════════════════════════════════════════════

echo "🔍 VERIFICANDO ESTADO PARA PRODUCCIÓN..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de errores
ERRORS=0

# ═══════════════════════════════════════════════════════════════
# 1. VERIFICAR VARIABLES DE ENTORNO
# ═══════════════════════════════════════════════════════════════
echo "📋 1. Verificando variables de entorno..."

if [ -f .env.local ]; then
    if grep -q "DATABASE_URL" .env.local && grep -q "DATABASE_AUTH_TOKEN" .env.local; then
        echo -e "${GREEN}✅ Variables de base de datos configuradas${NC}"
    else
        echo -e "${RED}❌ Faltan variables de Turso en .env.local${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "NEXTAUTH_SECRET" .env.local; then
        echo -e "${GREEN}✅ NEXTAUTH_SECRET configurado${NC}"
    else
        echo -e "${YELLOW}⚠️  NEXTAUTH_SECRET no encontrado (necesario para auth)${NC}"
    fi
else
    echo -e "${RED}❌ Archivo .env.local no encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 2. VERIFICAR QUE NO HAY DATOS MOCK EN CÓDIGO
# ═══════════════════════════════════════════════════════════════
echo "🔍 2. Buscando datos mock o hardcodeados..."

# Buscar MOCK_DATA exportado
MOCK_EXPORTS=$(grep -r "export.*MOCK" app/ 2>/dev/null | grep -v node_modules | wc -l)
if [ "$MOCK_EXPORTS" -eq 0 ]; then
    echo -e "${GREEN}✅ No hay exports de MOCK_DATA${NC}"
else
    echo -e "${YELLOW}⚠️  Encontrados $MOCK_EXPORTS exports con 'MOCK' - revisar${NC}"
fi

# Buscar arrays hardcodeados grandes en APIs
HARDCODED=$(grep -r "const.*=.*\[{" app/api/ 2>/dev/null | grep -v node_modules | wc -l)
if [ "$HARDCODED" -eq 0 ]; then
    echo -e "${GREEN}✅ No hay arrays hardcodeados en APIs${NC}"
else
    echo -e "${YELLOW}⚠️  Posibles arrays hardcodeados en APIs - revisar${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 3. VERIFICAR IMPORTS DE DATABASE
# ═══════════════════════════════════════════════════════════════
echo "🗄️  3. Verificando uso de Turso Database..."

DB_IMPORTS=$(grep -r "from '@/database'" app/api/ 2>/dev/null | wc -l)
if [ "$DB_IMPORTS" -gt 0 ]; then
    echo -e "${GREEN}✅ $DB_IMPORTS APIs usan Turso Database${NC}"
else
    echo -e "${RED}❌ No se encontraron imports de database en APIs${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 4. VERIFICAR ARCHIVOS CRÍTICOS
# ═══════════════════════════════════════════════════════════════
echo "📁 4. Verificando archivos críticos..."

CRITICAL_FILES=(
    "database/index.ts"
    "database/schema.ts"
    "database/seed-production.ts"
    "drizzle.config.ts"
    "vercel.json"
    "PRODUCTION_DEPLOYMENT.md"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Falta: $file${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""

# ═══════════════════════════════════════════════════════════════
# 5. VERIFICAR CONFIGURACIÓN DE VERCEL
# ═══════════════════════════════════════════════════════════════
echo "⚡ 5. Verificando vercel.json..."

if [ -f "vercel.json" ]; then
    if grep -q "buildCommand" vercel.json && grep -q "outputDirectory" vercel.json; then
        echo -e "${GREEN}✅ vercel.json configurado correctamente${NC}"
    else
        echo -e "${YELLOW}⚠️  vercel.json incompleto${NC}"
    fi
else
    echo -e "${RED}❌ vercel.json no encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 6. VERIFICAR PACKAGE.JSON
# ═══════════════════════════════════════════════════════════════
echo "📦 6. Verificando package.json..."

if grep -q '"db:seed:prod"' package.json; then
    echo -e "${GREEN}✅ Script db:seed:prod encontrado${NC}"
else
    echo -e "${RED}❌ Falta script db:seed:prod en package.json${NC}"
    ERRORS=$((ERRORS + 1))
fi

if grep -q '"db:push"' package.json; then
    echo -e "${GREEN}✅ Script db:push encontrado${NC}"
else
    echo -e "${RED}❌ Falta script db:push en package.json${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# RESULTADO FINAL
# ═══════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 SISTEMA LISTO PARA PRODUCCIÓN${NC}"
    echo ""
    echo "Siguiente paso:"
    echo "  1. pnpm db:push          (Push schema a Turso)"
    echo "  2. pnpm db:seed:prod     (Inicializar bancos con capital = 0)"
    echo "  3. pnpm deploy:prod      (Deploy a Vercel)"
    echo ""
    exit 0
else
    echo -e "${RED}❌ $ERRORS ERRORES ENCONTRADOS - Revisar antes de deploy${NC}"
    echo ""
    exit 1
fi
