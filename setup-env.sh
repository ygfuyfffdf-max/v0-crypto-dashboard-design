#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 CHRONOS - Script de Configuración de Entorno
# ═══════════════════════════════════════════════════════════════════════════════
# Configura Node.js, pnpm y Vercel CLI en el contenedor de desarrollo

set -e

echo "🔧 Configurando entorno de desarrollo CHRONOS..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Agregar pnpm al PATH
export PATH="/home/vscode/.local/share/pnpm:$PATH"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js no encontrado, instalando...${NC}"
    sudo apk add --no-cache nodejs npm
fi

echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm no encontrado, instalando...${NC}"
    wget -qO- https://get.pnpm.io/install.sh | sh -
    source ~/.bashrc
fi

echo -e "${GREEN}✓ pnpm $(pnpm --version)${NC}"

# Verificar Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI no encontrado, instalando...${NC}"
    pnpm add -g vercel
fi

echo -e "${GREEN}✓ Vercel CLI instalado${NC}"

# Verificar dependencias del proyecto
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Instalando dependencias del proyecto...${NC}"
    pnpm install
fi

echo -e "${GREEN}✓ Dependencias instaladas${NC}"

# Verificar favicon
if [ ! -f "public/favicon.ico" ]; then
    echo -e "${YELLOW}⚠️  Creando favicon.ico...${NC}"
    cp public/icon-light-32x32.png public/favicon.ico
    echo -e "${GREEN}✓ favicon.ico creado${NC}"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Entorno configurado correctamente${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Comandos disponibles:${NC}"
echo "  pnpm dev          - Iniciar servidor de desarrollo"
echo "  pnpm build        - Build de producción"
echo "  pnpm lint         - Ejecutar linter"
echo "  pnpm type-check   - Verificar tipos TypeScript"
echo "  pnpm test         - Ejecutar tests"
echo "  vercel            - Deploy a Vercel"
echo ""
