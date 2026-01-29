#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# 🌌 CHRONOS INFINITY — MEGA TOOLS SUITE 2026
# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# 
# Suite de herramientas CLI supremas para el agente CHRONOS INFINITY
# Incluye: GitHub, Sistema, Análisis, DevOps, Database, AI
#
# ═══════════════════════════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN
# ═══════════════════════════════════════════════════════════════════════════════════════════════════

CHRONOS_VERSION="INFINITY-2026"
WORKSPACE_ROOT="${WORKSPACE_ROOT:-/workspaces/v0-crypto-dashboard-design}"
LOG_FILE="${WORKSPACE_ROOT}/.chronos-agent.log"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# UTILIDADES
# ═══════════════════════════════════════════════════════════════════════════════════════════════════

log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        INFO)  echo -e "${CYAN}[${timestamp}]${NC} ${GREEN}INFO${NC}  $message" ;;
        WARN)  echo -e "${CYAN}[${timestamp}]${NC} ${YELLOW}WARN${NC}  $message" ;;
        ERROR) echo -e "${CYAN}[${timestamp}]${NC} ${RED}ERROR${NC} $message" ;;
        DEBUG) echo -e "${CYAN}[${timestamp}]${NC} ${PURPLE}DEBUG${NC} $message" ;;
        *)     echo -e "${CYAN}[${timestamp}]${NC} $message" ;;
    esac
    
    echo "[${timestamp}] [${level}] ${message}" >> "$LOG_FILE"
}

banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════════╗"
    echo "║       🌌 CHRONOS INFINITY — MEGA TOOLS SUITE 2026                   ║"
    echo "╚══════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# GITHUB TOOLS
# ═══════════════════════════════════════════════════════════════════════════════════════════════════

github_create_issue() {
    local title="${1:-}"
    local body="${2:-}"
    local labels="${3:-}"
    
    if [[ -z "$title" ]]; then
        error "Título requerido para crear issue"
        return 1
    fi
    
    log INFO "Creando issue: $title"
    
    local cmd="gh issue create --title \"$title\""
    [[ -n "$body" ]] && cmd+=" --body \"$body\""
    [[ -n "$labels" ]] && cmd+=" --label \"$labels\""
    
    eval $cmd
    success "Issue creado exitosamente"
}

github_create_pr() {
    local title="${1:-}"
    local body="${2:-}"
    local base="${3:-main}"
    local draft="${4:-false}"
    
    if [[ -z "$title" ]]; then
        error "Título requerido para crear PR"
        return 1
    fi
    
    log INFO "Creando PR: $title"
    
    local cmd="gh pr create --title \"$title\" --base \"$base\""
    [[ -n "$body" ]] && cmd+=" --body \"$body\""
    [[ "$draft" == "true" ]] && cmd+=" --draft"
    
    eval $cmd
    success "PR creado exitosamente"
}

github_list_issues() {
    local state="${1:-open}"
    local limit="${2:-10}"
    
    log INFO "Listando issues ($state, limit: $limit)"
    gh issue list --state "$state" --limit "$limit" --json number,title,state,author,createdAt \
        | jq -r '.[] | "[\(.number)] \(.title) - \(.state) by \(.author.login)"'
}

github_list_prs() {
    local state="${1:-open}"
    local limit="${2:-10}"
    
    log INFO "Listando PRs ($state, limit: $limit)"
    gh pr list --state "$state" --limit "$limit" --json number,title,state,author,createdAt \
        | jq -r '.[] | "[\(.number)] \(.title) - \(.state) by \(.author.login)"'
}

github_repo_stats() {
    log INFO "Obteniendo estadísticas del repositorio"
    
    echo -e "\n${CYAN}📊 Estadísticas del Repositorio${NC}\n"
    
    # Info básica
    gh repo view --json name,description,stargazerCount,forkCount,watchers \
        | jq -r '"📦 Repo: \(.name)\n📝 Descripción: \(.description // "N/A")\n⭐ Stars: \(.stargazerCount)\n🍴 Forks: \(.forkCount)\n👀 Watchers: \(.watchers.totalCount)"'
    
    echo -e "\n${CYAN}📈 Actividad Reciente${NC}"
    echo "Commits última semana: $(git log --oneline --since='7 days ago' | wc -l)"
    echo "Issues abiertos: $(gh issue list --state open --json number | jq length)"
    echo "PRs abiertos: $(gh pr list --state open --json number | jq length)"
}

github_workflow_run() {
    local workflow="${1:-}"
    local branch="${2:-main}"
    
    if [[ -z "$workflow" ]]; then
        log INFO "Listando workflows disponibles"
        gh workflow list
        return
    fi
    
    log INFO "Ejecutando workflow: $workflow en branch $branch"
    gh workflow run "$workflow" --ref "$branch"
    success "Workflow iniciado"
}

github_merge_pr() {
    local pr_number="${1:-}"
    local method="${2:-squash}"
    
    if [[ -z "$pr_number" ]]; then
        error "Número de PR requerido"
        return 1
    fi
    
    log INFO "Mergeando PR #$pr_number con método $method"
    gh pr merge "$pr_number" --"$method" --auto
    success "PR mergeado"
}

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# SYSTEM TOOLS
# ═══════════════════════════════════════════════════════════════════════════════════════════════════

system_health_check() {
    log INFO "Ejecutando health check del sistema"
    
    echo -e "\n${CYAN}🏥 Health Check del Sistema${NC}\n"
    
    # Verificar Node
    echo -n "Node.js: "
    if command -v node &> /dev/null; then
        success "$(node --version)"
    else
        error "No instalado"
    fi
    
    # Verificar pnpm
    echo -n "pnpm: "
    if command -v pnpm &> /dev/null; then
        success "$(pnpm --version)"
    else
        error "No instalado"
    fi
    
    # Verificar TypeScript
    echo -n "TypeScript: "
    if [[ -f "$WORKSPACE_ROOT/node_modules/.bin/tsc" ]]; then
        success "$($WORKSPACE_ROOT/node_modules/.bin/tsc --version)"
    else
        warning "No encontrado en node_modules"
    fi
    
    # Verificar Git
    echo -n "Git: "
    if command -v git &> /dev/null; then
        success "$(git --version | cut -d' ' -f3)"
    else
        error "No instalado"
    fi
    
    # Verificar GitHub CLI
    echo -n "GitHub CLI: "
    if command -v gh &> /dev/null; then
        success "$(gh --version | head -n1 | cut -d' ' -f3)"
    else
        warning "No instalado"
    fi
    
    # Espacio en disco
    echo -e "\n${CYAN}💾 Espacio en Disco${NC}"
    df -h "$WORKSPACE_ROOT" | tail -1 | awk '{print "Usado: "$3" / "$2" ("$5" usado)"}'
    
    # Memoria
    echo -e "\n${CYAN}🧠 Memoria${NC}"
    free -h | grep Mem | awk '{print "Usada: "$3" / "$2}'
    
    # Procesos Node
    echo -e "\n${CYAN}⚡ Procesos Node${NC}"
    pgrep -c node 2>/dev/null && echo "procesos Node.js activos" || echo "Sin procesos Node activos"
}

system_clean() {
    log INFO "Limpiando sistema"
    
    echo -e "\n${CYAN}🧹 Limpieza del Sistema${NC}\n"
    
    # Limpiar node_modules cache
    echo "Limpiando cache de pnpm..."
    pnpm store prune 2>/dev/null || true
    
    # Limpiar .next
    if [[ -d "$WORKSPACE_ROOT/.next" ]]; then
        echo "Eliminando .next/..."
        rm -rf "$WORKSPACE_ROOT/.next"
        success ".next eliminado"
    fi
    
    # Limpiar logs antiguos
    if [[ -f "$LOG_FILE" ]]; then
        local size=$(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null || echo "0")
        if [[ $size -gt 10485760 ]]; then # > 10MB
            echo "Rotando log file..."
            mv "$LOG_FILE" "${LOG_FILE}.old"
            success "Log rotado"
        fi
    fi
    
    # Git cleanup
    echo "Limpiando Git..."
    git gc --aggressive --prune=now 2>/dev/null || true
    
    success "Limpieza completada"
}

system_start_dev() {
    log INFO "Iniciando servidor de desarrollo"
    
    cd "$WORKSPACE_ROOT"
    
    # Verificar si ya está corriendo
    if pgrep -f "next dev" > /dev/null; then
        warning "Servidor ya está corriendo"
        return 0
    fi
    
    # Iniciar servidor
    pnpm dev &
    
    # Esperar a que inicie
    local attempts=0
    while ! curl -s http://localhost:3000 > /dev/null && [[ $attempts -lt 30 ]]; do
        sleep 1
        ((attempts++))
    done
    
    if curl -s http://localhost:3000 > /dev/null; then
        success "Servidor iniciado en http://localhost:3000"
    else
        warning "Servidor iniciando... (puede tomar más tiempo)"
    fi
}

system_stop_dev() {
    log INFO "Deteniendo servidor de desarrollo"
    
    pkill -f "next dev" 2>/dev/null || true
    success "Servidor detenido"
}

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# DATABASE TOOLS
# ═══════════════════════════════════════════════════════════════════════════════════════════════════

db_migrate() {
    log INFO "Ejecutando migraciones"
    cd "$WORKSPACE_ROOT"
    pnpm db:push
    success "Migraciones aplicadas"
}

db_generate() {
    log INFO "Generando schema de base de datos"
    cd "$WORKSPACE_ROOT"
    pnpm db:generate
    success "Schema generado"
}

db_studio() {
    log INFO "Abriendo Drizzle Studio"
    cd "$WORKSPACE_ROOT"
    pnpm db:studio &
    success "Studio iniciado"
}

db_seed() {
    log INFO "Ejecutando seed de base de datos"
    cd "$WORKSPACE_ROOT"
    pnpm tsx database/seed-bancos.ts
    success "Seed completado"
}

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# TEST TOOLS
# ═══════════════════════════════════════════════════════════════════════════════════════════════════

test_unit() {
    log INFO "Ejecutando tests unitarios"
    cd "$WORKSPACE_ROOT"
    pnpm test
}

test_e2e() {
    log INFO "Ejecutando tests E2E"
    cd "$WORKSPACE_ROOT"
    pnpm test:e2e
}

test_coverage() {
    log INFO "Ejecutando tests con coverage"
    cd "$WORKSPACE_ROOT"
    pnpm test:coverage
}

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# BUILD TOOLS
# ═══════════════════════════════════════════════════════════════════════════════════════════════════

build_production() {
    log INFO "Construyendo para producción"
    cd "$WORKSPACE_ROOT"
    pnpm build
    success "Build completado"
}

build_analyze() {
    log INFO "Analizando bundle"
    cd "$WORKSPACE_ROOT"
    pnpm analyze
}

lint_check() {
    log INFO "Ejecutando linter"
    cd "$WORKSPACE_ROOT"
    pnpm lint
}

lint_fix() {
    log INFO "Corrigiendo errores de lint"
    cd "$WORKSPACE_ROOT"
    pnpm lint:fix
    success "Lint fix completado"
}

type_check() {
    log INFO "Verificando tipos TypeScript"
    cd "$WORKSPACE_ROOT"
    pnpm type-check
}

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# ANALYSIS TOOLS
# ═══════════════════════════════════════════════════════════════════════════════════════════════════

analyze_codebase() {
    log INFO "Analizando codebase"
    
    echo -e "\n${CYAN}📊 Análisis del Codebase${NC}\n"
    
    cd "$WORKSPACE_ROOT"
    
    echo "📁 Estructura:"
    echo "  - Archivos TypeScript: $(find . -name '*.ts' -o -name '*.tsx' | grep -v node_modules | wc -l)"
    echo "  - Archivos JavaScript: $(find . -name '*.js' -o -name '*.jsx' | grep -v node_modules | wc -l)"
    echo "  - Archivos CSS: $(find . -name '*.css' | grep -v node_modules | wc -l)"
    echo "  - Tests: $(find . -name '*.test.ts' -o -name '*.spec.ts' | grep -v node_modules | wc -l)"
    
    echo -e "\n📏 Líneas de código:"
    find . -name '*.ts' -o -name '*.tsx' | grep -v node_modules | xargs wc -l 2>/dev/null | tail -1
    
    echo -e "\n📦 Dependencias:"
    echo "  - Producción: $(jq '.dependencies | length' package.json)"
    echo "  - Desarrollo: $(jq '.devDependencies | length' package.json)"
}

analyze_security() {
    log INFO "Analizando seguridad"
    
    echo -e "\n${CYAN}🔒 Análisis de Seguridad${NC}\n"
    
    cd "$WORKSPACE_ROOT"
    
    # Buscar posibles problemas
    echo "Buscando patrones problemáticos..."
    
    # API keys expuestas
    echo -n "API keys potencialmente expuestas: "
    grep -r "API_KEY\|SECRET\|PASSWORD" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -v ".env" | wc -l
    
    # Console.log en producción
    echo -n "Console.log statements: "
    grep -r "console\.log" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | wc -l
    
    # @ts-ignore
    echo -n "@ts-ignore directives: "
    grep -r "@ts-ignore\|@ts-expect-error" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | wc -l
    
    # any types
    echo -n "'any' type usage: "
    grep -r ": any" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | wc -l
}

analyze_performance() {
    log INFO "Analizando performance"
    
    echo -e "\n${CYAN}⚡ Análisis de Performance${NC}\n"
    
    cd "$WORKSPACE_ROOT"
    
    # Tamaño de archivos grandes
    echo "Archivos más grandes:"
    find . -name '*.ts' -o -name '*.tsx' | grep -v node_modules | xargs ls -la 2>/dev/null | sort -k5 -rn | head -10
    
    # Imports pesados potenciales
    echo -e "\n📦 Imports potencialmente pesados:"
    grep -r "import.*from" --include="*.ts" --include="*.tsx" . 2>/dev/null | \
        grep -v node_modules | \
        grep -E "(lodash|moment|date-fns|@mui|antd)" | \
        head -10
}

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# AI TOOLS
# ═══════════════════════════════════════════════════════════════════════════════════════════════════

ai_chat() {
    local prompt="${1:-Hola}"
    
    log INFO "Enviando prompt a CHRONOS INFINITY"
    
    curl -s "https://models.github.ai/inference/chat/completions" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"gpt-4o\",
            \"messages\": [
                {\"role\": \"system\", \"content\": \"Eres CHRONOS INFINITY, asistente supremo de gestión empresarial.\"},
                {\"role\": \"user\", \"content\": \"$prompt\"}
            ],
            \"max_tokens\": 1000
        }" | jq -r '.choices[0].message.content'
}

ai_code_review() {
    local file="${1:-}"
    
    if [[ -z "$file" || ! -f "$file" ]]; then
        error "Archivo no especificado o no existe"
        return 1
    fi
    
    log INFO "Analizando código: $file"
    
    local code=$(cat "$file")
    local prompt="Analiza el siguiente código TypeScript y proporciona mejoras:\n\n$code"
    
    ai_chat "$prompt"
}

ai_explain_error() {
    local error_msg="${1:-}"
    
    if [[ -z "$error_msg" ]]; then
        error "Mensaje de error requerido"
        return 1
    fi
    
    log INFO "Explicando error"
    
    ai_chat "Explica este error y cómo solucionarlo: $error_msg"
}

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# DEPLOY TOOLS
# ═══════════════════════════════════════════════════════════════════════════════════════════════════

deploy_vercel() {
    log INFO "Desplegando a Vercel"
    
    cd "$WORKSPACE_ROOT"
    
    if ! command -v vercel &> /dev/null; then
        warning "Vercel CLI no instalado. Instalando..."
        pnpm add -g vercel
    fi
    
    vercel --prod
    success "Desplegado a Vercel"
}

deploy_preview() {
    log INFO "Desplegando preview a Vercel"
    
    cd "$WORKSPACE_ROOT"
    vercel
    success "Preview desplegado"
}

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# HELP
# ═══════════════════════════════════════════════════════════════════════════════════════════════════

show_help() {
    banner
    
    echo -e "${WHITE}Uso: chronos-tools <comando> [argumentos]${NC}\n"
    
    echo -e "${CYAN}📦 GITHUB${NC}"
    echo "  github_create_issue <título> [body] [labels]  - Crear issue"
    echo "  github_create_pr <título> [body] [base]       - Crear PR"
    echo "  github_list_issues [state] [limit]            - Listar issues"
    echo "  github_list_prs [state] [limit]               - Listar PRs"
    echo "  github_repo_stats                             - Estadísticas del repo"
    echo "  github_workflow_run [workflow] [branch]       - Ejecutar workflow"
    echo "  github_merge_pr <number> [method]             - Mergear PR"
    
    echo -e "\n${CYAN}🖥️  SYSTEM${NC}"
    echo "  system_health_check                           - Health check"
    echo "  system_clean                                  - Limpiar sistema"
    echo "  system_start_dev                              - Iniciar dev server"
    echo "  system_stop_dev                               - Detener dev server"
    
    echo -e "\n${CYAN}🗄️  DATABASE${NC}"
    echo "  db_migrate                                    - Ejecutar migraciones"
    echo "  db_generate                                   - Generar schema"
    echo "  db_studio                                     - Abrir Drizzle Studio"
    echo "  db_seed                                       - Seed de datos"
    
    echo -e "\n${CYAN}🧪 TEST${NC}"
    echo "  test_unit                                     - Tests unitarios"
    echo "  test_e2e                                      - Tests E2E"
    echo "  test_coverage                                 - Tests con coverage"
    
    echo -e "\n${CYAN}🔨 BUILD${NC}"
    echo "  build_production                              - Build de producción"
    echo "  build_analyze                                 - Analizar bundle"
    echo "  lint_check                                    - Verificar lint"
    echo "  lint_fix                                      - Corregir lint"
    echo "  type_check                                    - Verificar tipos"
    
    echo -e "\n${CYAN}📊 ANALYSIS${NC}"
    echo "  analyze_codebase                              - Analizar codebase"
    echo "  analyze_security                              - Análisis de seguridad"
    echo "  analyze_performance                           - Análisis de performance"
    
    echo -e "\n${CYAN}🤖 AI${NC}"
    echo "  ai_chat <prompt>                              - Chat con CHRONOS"
    echo "  ai_code_review <file>                         - Review de código"
    echo "  ai_explain_error <error>                      - Explicar error"
    
    echo -e "\n${CYAN}🚀 DEPLOY${NC}"
    echo "  deploy_vercel                                 - Deploy a producción"
    echo "  deploy_preview                                - Deploy preview"
}

# ═══════════════════════════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════════════════════════

main() {
    local command="${1:-help}"
    shift 2>/dev/null || true
    
    case "$command" in
        # GitHub
        github_create_issue) github_create_issue "$@" ;;
        github_create_pr) github_create_pr "$@" ;;
        github_list_issues) github_list_issues "$@" ;;
        github_list_prs) github_list_prs "$@" ;;
        github_repo_stats) github_repo_stats ;;
        github_workflow_run) github_workflow_run "$@" ;;
        github_merge_pr) github_merge_pr "$@" ;;
        
        # System
        system_health_check|health) system_health_check ;;
        system_clean|clean) system_clean ;;
        system_start_dev|start|dev) system_start_dev ;;
        system_stop_dev|stop) system_stop_dev ;;
        
        # Database
        db_migrate|migrate) db_migrate ;;
        db_generate|generate) db_generate ;;
        db_studio|studio) db_studio ;;
        db_seed|seed) db_seed ;;
        
        # Test
        test_unit|test) test_unit ;;
        test_e2e|e2e) test_e2e ;;
        test_coverage|coverage) test_coverage ;;
        
        # Build
        build_production|build) build_production ;;
        build_analyze|analyze) build_analyze ;;
        lint_check|lint) lint_check ;;
        lint_fix|fix) lint_fix ;;
        type_check|types) type_check ;;
        
        # Analysis
        analyze_codebase|codebase) analyze_codebase ;;
        analyze_security|security) analyze_security ;;
        analyze_performance|perf) analyze_performance ;;
        
        # AI
        ai_chat|chat) ai_chat "$@" ;;
        ai_code_review|review) ai_code_review "$@" ;;
        ai_explain_error|explain) ai_explain_error "$@" ;;
        
        # Deploy
        deploy_vercel|deploy) deploy_vercel ;;
        deploy_preview|preview) deploy_preview ;;
        
        # Help
        help|-h|--help) show_help ;;
        
        *)
            error "Comando desconocido: $command"
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar si es llamado directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
