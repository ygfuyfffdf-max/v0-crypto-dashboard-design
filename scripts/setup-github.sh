#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🐙 CHRONOS - Configuración GitHub CLI
# ═══════════════════════════════════════════════════════════════════════════════

echo "🔧 Configurando GitHub CLI para CHRONOS..."

# Verificar si GitHub CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI no está instalado"
    echo "   Instalar con: apk add github-cli"
    exit 1
fi

# Verificar autenticación
if ! gh auth status &> /dev/null; then
    echo "🔐 Autenticando con GitHub..."
    gh auth login
else
    echo "✅ Ya autenticado con GitHub"
fi

# Mostrar info del repo
echo ""
echo "📦 Información del repositorio:"
gh repo view

echo ""
echo "💡 Comandos útiles GitHub CLI:"
echo "   gh repo view              - Ver info del repo"
echo "   gh pr list               - Listar PRs"
echo "   gh pr create             - Crear PR"
echo "   gh issue list            - Listar issues"
echo "   gh workflow list         - Listar workflows"
echo "   gh secret list           - Listar secrets"
echo "   gh secret set VAR        - Crear secret"

echo ""
echo "✅ GitHub CLI configurado"
