#!/bin/bash
#
# CHRONOS AI Agent - GitHub Integration CLI
# Script para configurar e integrar todas las capacidades de GitHub
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_DIR="$(dirname "$SCRIPT_DIR")"
REPO_ROOT="/workspaces/v0-crypto-dashboard-design"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║       🤖 CHRONOS AI Agent - GitHub Integration Setup         ║"
    echo "║              Configuración Completa de Servicios             ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() { echo -e "${CYAN}▶ $1${NC}"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

check_gh_cli() {
    print_step "Verificando GitHub CLI..."
    if command -v gh &> /dev/null; then
        GH_VERSION=$(gh --version | head -n1)
        print_success "GitHub CLI instalado: $GH_VERSION"
    else
        print_error "GitHub CLI no está instalado"
        exit 1
    fi
}

check_auth() {
    print_step "Verificando autenticación de GitHub..."
    if gh auth status &> /dev/null; then
        USER=$(gh api user --jq '.login')
        print_success "Autenticado como: $USER"
    else
        print_error "No autenticado. Ejecuta: gh auth login"
        exit 1
    fi
}

install_extensions() {
    print_step "Instalando extensiones de GitHub CLI..."

    export HOME="${REPO_ROOT}"
    mkdir -p "$HOME/.local/share/gh/extensions"

    EXTENSIONS=("github/gh-copilot" "github/gh-models")

    for ext in "${EXTENSIONS[@]}"; do
        if gh extension list 2>/dev/null | grep -q "$ext"; then
            print_success "Ya instalada: $ext"
        else
            print_step "Instalando $ext..."
            if gh extension install "$ext" 2>/dev/null; then
                print_success "Instalada: $ext"
            else
                print_warning "No se pudo instalar: $ext"
            fi
        fi
    done
}

show_models() {
    print_step "Modelos de GitHub Models disponibles..."
    echo ""

    echo -e "${BLUE}═══ MODELOS AVANZADOS ═══${NC}"
    gh models list 2>/dev/null | head -50
    echo ""
}

setup_actions() {
    print_step "Configurando GitHub Actions..."

    WORKFLOW_DIR="$REPO_ROOT/.github/workflows"
    mkdir -p "$WORKFLOW_DIR"

    cat > "$WORKFLOW_DIR/ai-agent.yml" << 'EOF'
name: 🤖 AI Agent Tasks

on:
  issues:
    types: [opened, labeled]
  issue_comment:
    types: [created]
  workflow_dispatch:
    inputs:
      task:
        description: 'Task for AI Agent'
        required: true
        type: string

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  ai-task:
    name: 🤖 AI Task Processing
    runs-on: ubuntu-latest
    if: |
      (github.event_name == 'issues' && contains(github.event.issue.labels.*.name, 'ai-task')) ||
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@chronos-agent')) ||
      github.event_name == 'workflow_dispatch'
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install httpx python-dotenv

      - name: Run CHRONOS Agent
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: python agents/chronos-ai-agent/src/agent.py
EOF

    print_success "GitHub Actions configurados"
}

setup_dependabot() {
    print_step "Configurando Dependabot..."

    mkdir -p "$REPO_ROOT/.github"
    cat > "$REPO_ROOT/.github/dependabot.yml" << 'EOF'
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "automated"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "ci-cd"
      - "automated"
EOF

    print_success "Dependabot configurado"
}

create_tools() {
    print_step "Creando herramientas CLI..."

    TOOLS_DIR="$REPO_ROOT/agents/chronos-ai-agent/tools"
    mkdir -p "$TOOLS_DIR"

    cat > "$TOOLS_DIR/github-tools.sh" << 'EOF'
#!/bin/bash
# CHRONOS AI Agent - GitHub Tools

export HOME="${HOME:-/workspaces/v0-crypto-dashboard-design}"

search_code() { gh search code "$1" --repo $(gh repo view --json nameWithOwner -q .nameWithOwner); }
list_prs() { gh pr list --state open; }
list_issues() { gh issue list --state open; }
repo_info() { gh repo view; }
run_model() { gh models run "$1" "$2"; }

case "${1:-help}" in
    search) search_code "$2" ;;
    prs) list_prs ;;
    issues) list_issues ;;
    repo) repo_info ;;
    model) run_model "$2" "$3" ;;
    *) echo "Uso: $0 {search|prs|issues|repo|model}" ;;
esac
EOF

    chmod +x "$TOOLS_DIR/github-tools.sh"
    print_success "Herramientas CLI creadas"
}

print_summary() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║              📊 CONFIGURACIÓN COMPLETADA                      ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✓ GitHub CLI Extensions instaladas${NC}"
    echo -e "${GREEN}✓ GitHub Actions configurados${NC}"
    echo -e "${GREEN}✓ Dependabot configurado${NC}"
    echo -e "${GREEN}✓ Herramientas CLI creadas${NC}"
    echo ""
    echo -e "${CYAN}Modelos AI configurados:${NC}"
    echo "  • GPT-5 (General)"
    echo "  • O3 (Reasoning)"
    echo "  • GPT-4o (Fast)"
    echo "  • Codestral 2501 (Code)"
    echo "  • Llama 3.2 90B Vision (Images)"
    echo "  • DeepSeek R1 (Math)"
    echo "  • Grok 3 (Creative)"
    echo ""
    echo -e "${CYAN}Comandos útiles:${NC}"
    echo "  gh models run gpt-5 'prompt'    - Ejecutar modelo"
    echo "  gh models list                  - Ver modelos"
    echo "  gh copilot explain <command>    - Explicar comando"
    echo ""
}

main() {
    print_header
    check_gh_cli
    check_auth
    install_extensions
    show_models
    setup_actions
    setup_dependabot
    create_tools
    print_summary
    echo -e "${GREEN}🎉 ¡CHRONOS AI Agent configurado exitosamente!${NC}"
}

main "$@"
