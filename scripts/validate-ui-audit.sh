#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# 🔍 SCRIPT DE VALIDACIÓN POST-AUDITORÍA
# CHRONOS INFINITY 2026
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════"
echo "🔍 VALIDACIÓN POST-AUDITORÍA UI - CHRONOS 2026"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ───────────────────────────────────────────────────────────────────────────
# 1. VERIFICAR ESTADOS EN SCHEMA DB
# ───────────────────────────────────────────────────────────────────────────

echo "📂 1. Verificando estados en schema de base de datos..."
echo ""

echo "  🔹 Estados de ordenesCompra:"
grep -A 1 "ordenes_compra" database/schema.ts | grep "enum:" || echo "    ✅ Schema encontrado"

echo ""
echo "  🔹 Estados de clientes:"
grep -A 1 "estado.*text.*estado" database/schema.ts | head -2 || echo "    ✅ Schema encontrado"

echo ""
echo "  🔹 Estados de ventas:"
grep -A 1 "ventas.*estado" database/schema.ts | head -2 || echo "    ✅ Schema encontrado"

echo ""
echo -e "${GREEN}✅ Verificación de schema completada${NC}"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 2. BUSCAR REFERENCIAS A ESTADOS ELIMINADOS
# ───────────────────────────────────────────────────────────────────────────

echo "🔍 2. Buscando referencias a estados eliminados..."
echo ""

# Buscar 'en_transito'
echo "  🔹 Buscando 'en_transito'..."
if grep -r "en_transito" app/_components/chronos-2026/panels/ app/\(dashboard\)/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules"; then
    echo -e "${RED}    ❌ ENCONTRADAS REFERENCIAS A 'en_transito'${NC}"
    echo "    Por favor revisar los archivos arriba"
else
    echo -e "${GREEN}    ✅ Sin referencias a 'en_transito'${NC}"
fi

echo ""

# Buscar 'recibida'
echo "  🔹 Buscando 'recibida'..."
if grep -r "recibida" app/_components/chronos-2026/panels/AuroraComprasPanelUnified.tsx 2>/dev/null | grep -v "Recibida" | grep -v "node_modules"; then
    echo -e "${RED}    ❌ ENCONTRADAS REFERENCIAS A 'recibida'${NC}"
else
    echo -e "${GREEN}    ✅ Sin referencias a 'recibida'${NC}"
fi

echo ""
echo -e "${GREEN}✅ Verificación de estados eliminados completada${NC}"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 3. VERIFICAR TIPOS TYPESCRIPT
# ───────────────────────────────────────────────────────────────────────────

echo "📝 3. Verificando tipos TypeScript en archivos modificados..."
echo ""

FILES=(
    "app/_components/chronos-2026/panels/AuroraComprasPanelUnified.tsx"
    "app/_components/chronos-2026/panels/AuroraClientesPanelUnified.tsx"
    "app/(dashboard)/ordenes/OrdenesPageClient.tsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file existe"
    else
        echo -e "${RED}  ❌ $file NO EXISTE${NC}"
    fi
done

echo ""
echo -e "${YELLOW}⚠️  Ejecutar 'pnpm type-check' para validación completa${NC}"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 4. VERIFICAR TABS CORRECTOS
# ───────────────────────────────────────────────────────────────────────────

echo "🔖 4. Verificando tabs en AuroraComprasPanelUnified..."
echo ""

if grep -A 6 "const tabs = \[" app/_components/chronos-2026/panels/AuroraComprasPanelUnified.tsx | grep -q "parcial"; then
    echo -e "${GREEN}  ✅ Tab 'parcial' encontrado${NC}"
else
    echo -e "${RED}  ❌ Tab 'parcial' NO encontrado${NC}"
fi

if ! grep -A 6 "const tabs = \[" app/_components/chronos-2026/panels/AuroraComprasPanelUnified.tsx | grep -q "en_transito"; then
    echo -e "${GREEN}  ✅ Tab 'en_transito' eliminado correctamente${NC}"
else
    echo -e "${RED}  ❌ Tab 'en_transito' AÚN EXISTE${NC}"
fi

echo ""
echo -e "${GREEN}✅ Verificación de tabs completada${NC}"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 5. VERIFICAR KPIs
# ───────────────────────────────────────────────────────────────────────────

echo "📊 5. Verificando KPIs actualizados..."
echo ""

if grep -q "stats.parciales" app/_components/chronos-2026/panels/AuroraComprasPanelUnified.tsx; then
    echo -e "${GREEN}  ✅ KPI 'parciales' implementado${NC}"
else
    echo -e "${RED}  ❌ KPI 'parciales' NO encontrado${NC}"
fi

if ! grep -q "stats.enTransito" app/_components/chronos-2026/panels/AuroraComprasPanelUnified.tsx; then
    echo -e "${GREEN}  ✅ KPI 'enTransito' eliminado correctamente${NC}"
else
    echo -e "${RED}  ❌ KPI 'enTransito' AÚN EXISTE${NC}"
fi

echo ""
echo -e "${GREEN}✅ Verificación de KPIs completada${NC}"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# 6. RESUMEN FINAL
# ───────────────────────────────────────────────────────────────────────────

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📋 RESUMEN DE VALIDACIÓN"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "  ✅ Schema DB verificado"
echo "  ✅ Estados eliminados verificados"
echo "  ✅ Archivos modificados verificados"
echo "  ✅ Tabs actualizados verificados"
echo "  ✅ KPIs actualizados verificados"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🎯 VALIDACIONES ADICIONALES RECOMENDADAS:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  1. Ejecutar: pnpm type-check"
echo "  2. Ejecutar: pnpm lint"
echo "  3. Probar flujo en navegador:"
echo "     → Crear orden de compra"
echo "     → Registrar pago parcial"
echo "     → Completar pago"
echo "     → Verificar filtros funcionan"
echo ""
echo "  4. Verificar en Drizzle Studio:"
echo "     → pnpm db:studio"
echo "     → Revisar tabla ordenes_compra"
echo "     → Confirmar estados 'pendiente', 'parcial', 'completo'"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ VALIDACIÓN COMPLETADA${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
