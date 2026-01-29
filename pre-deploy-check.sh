#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# ✅ CHRONOS - Checklist Pre-Deployment
# ═══════════════════════════════════════════════════════════════════════════════
# Verifica que todo está listo antes de deployar

export PATH="/home/vscode/.local/share/pnpm:$PATH"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "════════════════════════════════════════════════════════════════"
echo "✅ CHRONOS - CHECKLIST PRE-DEPLOYMENT"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Contador de errores
errors=0

# 1. Verificar Node.js
echo -n "1. Node.js instalado... "
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ $(node --version)${NC}"
else
    echo -e "${RED}✗ NO INSTALADO${NC}"
    ((errors++))
fi

# 2. Verificar pnpm
echo -n "2. pnpm instalado... "
if command -v pnpm &> /dev/null; then
    echo -e "${GREEN}✓ $(pnpm --version)${NC}"
else
    echo -e "${RED}✗ NO INSTALADO${NC}"
    ((errors++))
fi

# 3. Verificar Vercel CLI
echo -n "3. Vercel CLI instalado... "
if command -v vercel &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ NO INSTALADO${NC}"
    ((errors++))
fi

# 4. Verificar node_modules
echo -n "4. Dependencias instaladas... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ node_modules no existe${NC}"
    ((errors++))
fi

# 5. Verificar .env.local
echo -n "5. Variables de entorno (.env.local)... "
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ No existe (puede ser normal)${NC}"
fi

# 6. Verificar favicon
echo -n "6. Favicon presente... "
if [ -f "public/favicon.ico" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ NO EXISTE${NC}"
    ((errors++))
fi

# 7. TypeScript check
echo -n "7. TypeScript sin errores... "
if pnpm type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ HAY ERRORES${NC}"
    ((errors++))
fi

# 8. Build test
echo -n "8. Build exitoso... "
if [ -d ".next" ]; then
    echo -e "${GREEN}✓ (build existente)${NC}"
else
    echo -e "${YELLOW}⚠ Ejecutando build...${NC}"
    if pnpm build > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓ Build exitoso${NC}"
    else
        echo -e "   ${RED}✗ Build falló${NC}"
        ((errors++))
    fi
fi

# 9. Verificar vercel.json
echo -n "9. Configuración Vercel (vercel.json)... "
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ NO EXISTE${NC}"
    ((errors++))
fi

# 10. Verificar .vercelignore
echo -n "10. Archivo .vercelignore... "
if [ -f ".vercelignore" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ No existe (opcional)${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"

if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✅ TODO LISTO PARA DEPLOYMENT${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "  1. Configurar variables de entorno en Vercel Dashboard"
    echo "  2. Ejecutar: ./deploy.sh"
    echo "  3. O ejecutar manualmente:"
    echo "     - Preview:    vercel"
    echo "     - Production: vercel --prod"
else
    echo -e "${RED}❌ ENCONTRADOS $errors ERROR(ES)${NC}"
    echo ""
    echo "Corrige los errores antes de deployar."
    echo "Para ayuda, consulta: QUICK_DEPLOY_GUIDE.md"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
