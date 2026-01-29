#!/bin/bash
set -e

echo "=========================================="
echo "🚀 CHRONOS - Setup de Deployment Tools"
echo "=========================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Instalar Vercel CLI
echo -e "\n${YELLOW}[1/4] Instalando Vercel CLI...${NC}"
if command -v vercel &> /dev/null; then
    echo -e "${GREEN}✓ Vercel ya instalado: $(vercel --version)${NC}"
else
    sudo npm install -g vercel@latest
    echo -e "${GREEN}✓ Vercel instalado: $(vercel --version)${NC}"
fi

# 2. Instalar GitHub CLI
echo -e "\n${YELLOW}[2/4] Instalando GitHub CLI...${NC}"
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✓ GitHub CLI ya instalado: $(gh --version | head -1)${NC}"
else
    sudo apk add --no-cache github-cli
    echo -e "${GREEN}✓ GitHub CLI instalado: $(gh --version | head -1)${NC}"
fi

# 3. Instalar Turso CLI
echo -e "\n${YELLOW}[3/4] Instalando Turso CLI...${NC}"
export PATH="$HOME/.turso:$PATH"
if command -v turso &> /dev/null; then
    echo -e "${GREEN}✓ Turso ya instalado: $(turso --version)${NC}"
else
    curl -sSfL https://get.tur.so/install.sh | bash
    export PATH="$HOME/.turso:$PATH"
    echo -e "${GREEN}✓ Turso instalado: $(turso --version)${NC}"
fi

# 4. Verificar estado del proyecto
echo -e "\n${YELLOW}[4/4] Verificando proyecto...${NC}"
cd /workspaces/v0-crypto-dashboard-design

echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"
echo "pnpm: $(pnpm -v)"

# Verificar .env.local
if [ -f .env.local ]; then
    echo -e "${GREEN}✓ .env.local existe${NC}"
else
    echo -e "${RED}✗ .env.local no existe - crear antes de deploy${NC}"
fi

# Verificar vercel.json
if [ -f vercel.json ]; then
    echo -e "${GREEN}✓ vercel.json existe${NC}"
else
    echo -e "${YELLOW}⚠ vercel.json no existe${NC}"
fi

echo -e "\n${GREEN}=========================================="
echo "✅ Setup completado!"
echo "==========================================${NC}"
