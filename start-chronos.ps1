# ═══════════════════════════════════════════════════════════════════════════════════════
# 🚀 CHRONOS INFINITY 2026 — Script de Inicio para Windows (PowerShell)
# ═══════════════════════════════════════════════════════════════════════════════════════
#
# Este script inicia todos los servicios necesarios para el desarrollo:
# - Next.js Dev Server (puerto 3000)
# - WebSocket Server (puerto 3001)
#
# @version 3.0.0
# ═══════════════════════════════════════════════════════════════════════════════════════

$Host.UI.RawUI.ForegroundColor = "Magenta"
Write-Host @"

╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║   ██████╗██╗  ██╗██████╗  ██████╗ ███╗   ██╗ ██████╗ ███████╗                 ║
║  ██╔════╝██║  ██║██╔══██╗██╔═══██╗████╗  ██║██╔═══██╗██╔════╝                 ║
║  ██║     ███████║██████╔╝██║   ██║██╔██╗ ██║██║   ██║███████╗                 ║
║  ██║     ██╔══██║██╔══██╗██║   ██║██║╚██╗██║██║   ██║╚════██║                 ║
║  ╚██████╗██║  ██║██║  ██║╚██████╔╝██║ ╚████║╚██████╔╝███████║                 ║
║   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝                 ║
║                                                                                ║
║                       INFINITY 2026 — Ultra Premium System                     ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝

"@
$Host.UI.RawUI.ForegroundColor = "White"

# Verificar package.json
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json no encontrado. Ejecuta este script desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Verificar .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creando archivo .env.local..." -ForegroundColor Cyan
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
    } else {
        Write-Host "⚠️ No se encontró .env.example. Asegúrate de configurar .env.local manualmente." -ForegroundColor Yellow
    }
}

# Instalar dependencias del servidor WebSocket si es necesario
if (-not (Test-Path "server/node_modules")) {
    Write-Host "📦 Instalando dependencias del servidor WebSocket..." -ForegroundColor Cyan
    Push-Location server
    npm install ws
    Pop-Location
}

# Función para iniciar servicios
function Start-Services {
    Write-Host "`n🚀 Iniciando servicios..." -ForegroundColor Green

    # Iniciar WebSocket Server en una nueva ventana
    Write-Host "🔌 Iniciando WebSocket Server en puerto 3001..." -ForegroundColor Blue
    $wsJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npx tsx watch websocket-server.ts" -PassThru

    Start-Sleep -Seconds 2

    # Iniciar Next.js en una nueva ventana
    Write-Host "⚡ Iniciando Next.js Dev Server en puerto 3000..." -ForegroundColor Blue
    $nextJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm dev" -PassThru

    Start-Sleep -Seconds 3

    # Información final
    Write-Host "`n════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host "✨ CHRONOS INFINITY 2026 está corriendo!" -ForegroundColor Green
    Write-Host "════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "  📱 Aplicación:     https://localhost:3000" -ForegroundColor Cyan
    Write-Host "  🔌 WebSocket:      ws://localhost:3001" -ForegroundColor Cyan
    Write-Host "  🏥 Health Check:   http://localhost:3001/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Cierra las ventanas de terminal para detener los servicios" -ForegroundColor Blue
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Magenta

    # Abrir navegador
    Start-Sleep -Seconds 5
    Start-Process "https://localhost:3000"
}

# Ejecutar
Start-Services
