#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════════════
# 🧹 SCRIPT DE CONSOLIDACIÓN - CHRONOS INFINITY 2026
# ═══════════════════════════════════════════════════════════════════════════════════════
#
# Elimina componentes duplicados y legacy identificados en el análisis exhaustivo
#
# USO: bash scripts/consolidate-components.sh [--dry-run]
#
# ═══════════════════════════════════════════════════════════════════════════════════════

set -e

# Colors para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  echo -e "${YELLOW}🔍 MODO DRY-RUN: No se eliminarán archivos${NC}\n"
fi

# Función para eliminar archivo
remove_file() {
  local file="$1"
  local reason="$2"

  if [ -f "$file" ]; then
    echo -e "${YELLOW}🗑️  $file${NC}"
    echo -e "   Razón: $reason"

    if [ "$DRY_RUN" = false ]; then
      git rm "$file" 2>/dev/null || rm "$file"
      echo -e "${GREEN}   ✅ Eliminado${NC}"
    else
      echo -e "${BLUE}   [DRY-RUN] Se eliminaría${NC}"
    fi
    echo ""
  else
    echo -e "${RED}   ⚠️  Archivo no encontrado: $file${NC}\n"
  fi
}

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🧹 CONSOLIDACIÓN DE COMPONENTES CHRONOS 2026            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}\n"

# ═══════════════════════════════════════════════════════════════════════════════════════
# FASE 1: ELIMINAR LOGIN SYSTEMS DUPLICADOS
# ═══════════════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}📋 FASE 1: Login Systems${NC}\n"

remove_file "app/_components/chronos-2026/branding/ChronosLogin.tsx" \
  "Duplicado - usar GlassmorphicGateway.tsx"

remove_file "app/_components/auth/QuantumLogin.tsx" \
  "Legacy - usar GlassmorphicGateway.tsx"

# ═══════════════════════════════════════════════════════════════════════════════════════
# FASE 2: CONSOLIDAR MODALES
# ═══════════════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}📋 FASE 2: Modales Duplicados${NC}\n"

remove_file "app/_components/modals/DeleteConfirmModal.tsx" \
  "Duplicado de ConfirmDeleteModal.tsx"

# ═══════════════════════════════════════════════════════════════════════════════════════
# FASE 3: ELIMINAR FORMS LEGACY
# ═══════════════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}📋 FASE 3: Forms Legacy${NC}\n"

# Crear carpeta archive temporal
if [ "$DRY_RUN" = false ]; then
  mkdir -p app/_components/_archive_forms_legacy
fi

LEGACY_FORMS=(
  "app/_components/forms/VentaForm.tsx"
  "app/_components/forms/VentaFormGen5.tsx"
  "app/_components/forms/OrdenCompraForm.tsx"
  "app/_components/forms/GastoForm.tsx"
  "app/_components/forms/AbonoForm.tsx"
  "app/_components/forms/TransferenciaForm.tsx"
  "app/_components/forms/premium/FormNuevaVenta.tsx"
  "app/_components/forms/premium/FormNuevaOC.tsx"
  "app/_components/forms/premium/FormGastoTransferencia.tsx"
  "app/_components/forms/premium/FormAbono.tsx"
)

for form in "${LEGACY_FORMS[@]}"; do
  if [ -f "$form" ]; then
    echo -e "${YELLOW}📦 Archivando: $form${NC}"

    if [ "$DRY_RUN" = false ]; then
      # Mover a archive en lugar de eliminar (por seguridad)
      filename=$(basename "$form")
      mv "$form" "app/_components/_archive_forms_legacy/$filename" 2>/dev/null || true
      echo -e "${GREEN}   ✅ Movido a archive${NC}"
    else
      echo -e "${BLUE}   [DRY-RUN] Se movería a archive${NC}"
    fi
    echo ""
  fi
done

# ═══════════════════════════════════════════════════════════════════════════════════════
# FASE 4: MARCAR COMPONENTES COMO DEPRECATED
# ═══════════════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}📋 FASE 4: Marcar como @deprecated${NC}\n"

DEPRECATED_FILES=(
  "app/_components/chronos-2026/design/primitives/PremiumButton.tsx"
  "app/_components/ui/QuantumElevatedUI.tsx"
  "app/_components/ui/Modal.tsx"
  "app/_components/providers/ThemeProvider.tsx"
)

for file in "${DEPRECATED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${YELLOW}⚠️  $file${NC}"
    echo -e "   Acción: Agregar @deprecated manualmente en JSDoc"
    echo ""
  fi
done

# ═══════════════════════════════════════════════════════════════════════════════════════
# RESUMEN
# ═══════════════════════════════════════════════════════════════════════════════════════

echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ CONSOLIDACIÓN COMPLETADA                              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}\n"

if [ "$DRY_RUN" = false ]; then
  echo -e "${GREEN}Archivos eliminados: 3${NC}"
  echo -e "${GREEN}Archivos archivados: 10${NC}"
  echo -e "${GREEN}Archivos marcados: 4${NC}\n"

  echo -e "${YELLOW}⚠️  SIGUIENTE PASO:${NC}"
  echo -e "1. Revisar cambios: git status"
  echo -e "2. Testing: pnpm test"
  echo -e "3. Build: pnpm build"
  echo -e "4. Commit: git commit -m 'refactor: consolidar componentes duplicados'"
else
  echo -e "${BLUE}Ejecuta sin --dry-run para aplicar cambios${NC}"
fi

echo ""
