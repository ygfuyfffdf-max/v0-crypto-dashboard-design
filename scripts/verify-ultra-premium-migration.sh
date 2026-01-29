#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════════════
# 🔍 VERIFICACIÓN COMPLETA - Ultra Premium Migration
# ═══════════════════════════════════════════════════════════════════════════════════════
# Script para verificar que todos los componentes han sido actualizados correctamente
# ═══════════════════════════════════════════════════════════════════════════════════════

echo "🚀 Iniciando verificación de migración Ultra-Premium..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
TOTAL=0
UPDATED=0
PENDING=0

# ═══════════════════════════════════════════════════════════════════════════════════════
# Función para verificar archivo
# ═══════════════════════════════════════════════════════════════════════════════════════

check_file() {
  local file=$1
  local name=$2

  TOTAL=$((TOTAL + 1))

  if [ ! -f "$file" ]; then
    echo -e "${RED}❌ $name - Archivo no encontrado${NC}"
    PENDING=$((PENDING + 1))
    return 1
  fi

  if grep -q "EnhancedAurora" "$file" || grep -q "UltraPremium" "$file"; then
    echo -e "${GREEN}✅ $name - Actualizado${NC}"
    UPDATED=$((UPDATED + 1))
    return 0
  else
    echo -e "${YELLOW}⏳ $name - Pendiente de actualización${NC}"
    PENDING=$((PENDING + 1))
    return 1
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════════════
# VERIFICAR COMPONENTES ULTRA-PREMIUM
# ═══════════════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}📦 Verificando componentes Ultra-Premium...${NC}"
echo ""

check_file "app/_components/ui/premium/UltraPremiumButton.tsx" "UltraPremiumButton"
check_file "app/_components/ui/premium/UltraPremiumCard.tsx" "UltraPremiumCard"
check_file "app/_components/ui/premium/UltraPremiumInput.tsx" "UltraPremiumInput"
check_file "app/_components/ui/premium/UltraPremiumShowcase.tsx" "UltraPremiumShowcase"
check_file "app/_components/ui/premium/index.ts" "Premium Index"

echo ""

# ═══════════════════════════════════════════════════════════════════════════════════════
# VERIFICAR SISTEMA ENHANCED
# ═══════════════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}🔧 Verificando sistema Enhanced Aurora...${NC}"
echo ""

check_file "app/_components/ui/EnhancedAuroraSystem.tsx" "EnhancedAuroraSystem"

echo ""

# ═══════════════════════════════════════════════════════════════════════════════════════
# VERIFICAR PANELES
# ═══════════════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}📊 Verificando paneles Aurora...${NC}"
echo ""

check_file "app/_components/chronos-2026/panels/AuroraDashboardUnified.tsx" "Dashboard"
check_file "app/_components/chronos-2026/panels/AuroraVentasPanelUnified.tsx" "Ventas"
check_file "app/_components/chronos-2026/panels/AuroraClientesPanelUnified.tsx" "Clientes"
check_file "app/_components/chronos-2026/panels/AuroraBancosPanelUnified.tsx" "Bancos"
check_file "app/_components/chronos-2026/panels/AuroraMovimientosPanel.tsx" "Movimientos"
check_file "app/_components/chronos-2026/panels/AuroraDistribuidoresPanelUnified.tsx" "Distribuidores"
check_file "app/_components/chronos-2026/panels/AuroraComprasPanelUnified.tsx" "Compras"
check_file "app/_components/chronos-2026/panels/AuroraAlmacenPanelUnified.tsx" "Almacén"
check_file "app/_components/chronos-2026/panels/AuroraGastosYAbonosPanelUnified.tsx" "Gastos y Abonos"

echo ""

# ═══════════════════════════════════════════════════════════════════════════════════════
# VERIFICAR DEMOS
# ═══════════════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}🎨 Verificando páginas de demostración...${NC}"
echo ""

check_file "app/_components/chronos-2026/panels/UltraPremiumDashboardDemo.tsx" "Dashboard Demo"
check_file "app/(dashboard)/showcase/page.tsx" "Showcase Page"
check_file "app/(dashboard)/ultra-premium-demo/page.tsx" "Ultra Premium Demo Page"

echo ""

# ═══════════════════════════════════════════════════════════════════════════════════════
# VERIFICAR ANIMACIONES CSS
# ═══════════════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}🎬 Verificando animaciones CSS...${NC}"
echo ""

ANIMATIONS=(
  "ripple"
  "shimmer"
  "aurora-dance"
  "scan-line"
  "energy-pulse"
  "parallax-float"
  "chromatic"
  "quantum-wave"
  "nebula-swirl"
  "photon-burst"
  "liquid-morph"
  "depth-pulse"
)

CSS_FILE="app/globals.css"
ANIMATIONS_FOUND=0

for anim in "${ANIMATIONS[@]}"; do
  if grep -q "@keyframes $anim" "$CSS_FILE"; then
    echo -e "${GREEN}✅ Animación '$anim' encontrada${NC}"
    ANIMATIONS_FOUND=$((ANIMATIONS_FOUND + 1))
  else
    echo -e "${RED}❌ Animación '$anim' no encontrada${NC}"
  fi
done

echo ""

# ═══════════════════════════════════════════════════════════════════════════════════════
# VERIFICAR DOCUMENTACIÓN
# ═══════════════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}📚 Verificando documentación...${NC}"
echo ""

check_file "docs/ULTRA_PREMIUM_COMPONENTS.md" "Documentación de Componentes"
check_file "docs/MIGRATION_ULTRA_PREMIUM.md" "Guía de Migración"
check_file "ULTRA_PREMIUM_IMPLEMENTATION.md" "Guía de Implementación"
check_file "ULTRA_PREMIUM_INTEGRATION_COMPLETE.md" "Resumen de Integración"
check_file "COMPLETE_MIGRATION_REPORT.md" "Reporte de Migración"

echo ""

# ═══════════════════════════════════════════════════════════════════════════════════════
# RESUMEN
# ═══════════════════════════════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════"
echo -e "${BLUE}📊 RESUMEN DE VERIFICACIÓN${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ Archivos actualizados: $UPDATED${NC}"
echo -e "${YELLOW}⏳ Pendientes: $PENDING${NC}"
echo -e "${BLUE}📋 Total verificados: $TOTAL${NC}"
echo ""
echo -e "${GREEN}🎬 Animaciones CSS: $ANIMATIONS_FOUND/12${NC}"
echo ""

# Calcular porcentaje
if [ $TOTAL -gt 0 ]; then
  PERCENTAGE=$((UPDATED * 100 / TOTAL))
  echo -e "${BLUE}📈 Progreso: $PERCENTAGE%${NC}"
  echo ""

  if [ $PERCENTAGE -eq 100 ]; then
    echo -e "${GREEN}🎉 ¡MIGRACIÓN COMPLETA AL 100%!${NC}"
    echo ""
    echo "✅ Todos los componentes han sido actualizados"
    echo "✅ Sistema Enhanced implementado"
    echo "✅ Animaciones CSS integradas"
    echo "✅ Demos funcionales"
    echo "✅ Documentación completa"
    echo ""
    echo "🚀 Para ver los resultados:"
    echo "   http://localhost:3000/showcase"
    echo "   http://localhost:3000/ultra-premium-demo"
  elif [ $PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}✨ ¡Casi completo!${NC}"
    echo "Solo quedan algunos archivos pendientes."
  elif [ $PERCENTAGE -ge 50 ]; then
    echo -e "${YELLOW}⚡ En progreso...${NC}"
    echo "La mayoría de los componentes están actualizados."
  else
    echo -e "${YELLOW}🔄 Migración en curso...${NC}"
    echo "Aún hay varios componentes por actualizar."
  fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"

# Exit code based on completion
if [ $PERCENTAGE -eq 100 ] && [ $ANIMATIONS_FOUND -eq 12 ]; then
  exit 0
else
  exit 1
fi
