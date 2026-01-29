#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# CHRONOS INFINITY 2026 — VERIFICACIÓN POST-DEPLOY
# Script para verificar que los parches de emergencia funcionen
# ═══════════════════════════════════════════════════════════════

echo "🔍 VERIFICANDO ESTADO POST-DEPLOY..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SITE_URL="https://v0-crypto-dashboard-design-alpha.vercel.app"

# ═══════════════════════════════════════════════════════════════
# 1. Verificar que el sitio responda
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}1. Verificando conectividad del sitio...${NC}"

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/dashboard" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Sitio accesible (HTTP $HTTP_STATUS)${NC}"
elif [ "$HTTP_STATUS" = "307" ] || [ "$HTTP_STATUS" = "301" ]; then
    echo -e "${YELLOW}⚠️  Sitio redirigiendo (HTTP $HTTP_STATUS) - normal${NC}"
else
    echo -e "${RED}❌ Sitio no accesible (HTTP $HTTP_STATUS)${NC}"
fi

# ═══════════════════════════════════════════════════════════════
# 2. Verificar APIs críticas
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}2. Verificando APIs...${NC}"

APIs=(
    "/api/bancos"
    "/api/distribuidores" 
    "/api/ordenes"
    "/api/clientes"
)

for api in "${APIs[@]}"; do
    echo -n "   • $api: "
    
    RESPONSE=$(curl -s "$SITE_URL$api" | head -100)
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        COUNT=$(echo "$RESPONSE" | grep -o '"data":\[' | wc -l)
        if [ "$COUNT" -gt 0 ]; then
            echo -e "${GREEN}✅ OK (formato correcto)${NC}"
        else
            echo -e "${YELLOW}⚠️  OK (sin datos)${NC}"
        fi
    elif echo "$RESPONSE" | grep -q '"error"'; then
        echo -e "${RED}❌ Error en respuesta${NC}"
    else
        echo -e "${YELLOW}⚠️  Respuesta inesperada${NC}"
    fi
done

# ═══════════════════════════════════════════════════════════════
# 3. Verificar páginas críticas
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}3. Verificando páginas críticas...${NC}"

PAGES=(
    "/dashboard"
    "/ordenes"
    "/ventas"
)

for page in "${PAGES[@]}"; do
    echo -n "   • $page: "
    
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL$page" || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ HTTP $HTTP_STATUS${NC}"
    fi
done

# ═══════════════════════════════════════════════════════════════
# 4. Verificar que no haya errores evidentes
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}4. Verificando errores de aplicación...${NC}"

DASHBOARD_CONTENT=$(curl -s "$SITE_URL/dashboard" | head -500)

if echo "$DASHBOARD_CONTENT" | grep -q "Application error"; then
    echo -e "${RED}❌ Se detectó 'Application error' en dashboard${NC}"
elif echo "$DASHBOARD_CONTENT" | grep -q "CHRONOS"; then
    echo -e "${GREEN}✅ Dashboard carga correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  Dashboard en estado desconocido${NC}"
fi

# ═══════════════════════════════════════════════════════════════
# RESULTADO FINAL
# ═══════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}🎯 VERIFICACIÓN COMPLETADA${NC}"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "   1. Acceder a $SITE_URL/ordenes"
echo "   2. Intentar crear nueva orden de compra"
echo "   3. Si aparece error controlado, el parche funciona"
echo "   4. Revisar consola del navegador para logs defensivos"
echo ""
echo "🔧 SI PERSISTEN ERRORES:"
echo "   • Error boundary los capturará y mostrará mensaje controlado"
echo "   • Logs defensivos aparecerán en consola"
echo "   • Sistema no crasheará completamente"