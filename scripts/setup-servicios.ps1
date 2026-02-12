#Requires -Version 5.1
# ═══════════════════════════════════════════════════════════════════════════════
# CHRONOS INFINITY - Setup de Servicios (Git, GitHub, Vercel, Turso, Clerk, ElevenLabs)
# ═══════════════════════════════════════════════════════════════════════════════

param(
    [switch]$Git,
    [switch]$Env,
    [switch]$Turso,
    [switch]$Verificar
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

function Write-Step { param($msg) Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok { param($msg) Write-Host "  OK: $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "  !! $msg" -ForegroundColor Yellow }
function Write-Err { param($msg) Write-Host "  X  $msg" -ForegroundColor Red }

# Si no se pasó ningún flag, mostrar menú
if (-not ($Git -or $Env -or $Turso -or $Verificar)) {
    Write-Host @"

  CHRONOS INFINITY - Configuracion de Servicios
  =============================================

  Opciones:
    1. Configurar Git y conectar GitHub
    2. Crear .env.local desde template
    3. Verificar Turso y ejecutar migraciones
    4. Verificar toda la configuracion

  Ejecutar con: .\setup-servicios.ps1 -Git
                .\setup-servicios.ps1 -Env
                .\setup-servicios.ps1 -Turso
                .\setup-servicios.ps1 -Verificar

  Ver guia completa: CONFIGURACION_SERVICIOS_COMPLETA.md

"@ -ForegroundColor White
    exit 0
}

Set-Location $ProjectRoot

# ─── GIT & GITHUB ─────────────────────────────────────────────────────────
if ($Git) {
    Write-Step "Configuracion Git / GitHub"
    
    if (-not (Test-Path ".git")) {
        git init
        Write-Ok "Repositorio Git inicializado"
    } else {
        Write-Ok "Repositorio Git ya existe"
    }
    
    $remote = git remote get-url origin 2>$null
    if (-not $remote) {
        Write-Warn "No hay remote 'origin' configurado"
        $repo = Read-Host "Ingresa URL del repo GitHub (ej: https://github.com/user/repo.git)"
        if ($repo) {
            git remote add origin $repo
            Write-Ok "Remote origin agregado"
        }
    } else {
        Write-Ok "Remote: $remote"
    }
    
    Write-Host "`nPara subir: git add . && git commit -m 'Initial' && git push -u origin main"
}

# ─── ENV.LOCAL ────────────────────────────────────────────────────────────
if ($Env) {
    Write-Step "Archivo .env.local"
    
    $envPath = Join-Path $ProjectRoot ".env.local"
    $examplePath = Join-Path $ProjectRoot ".env.example"
    
    if (-not (Test-Path $examplePath)) {
        Write-Err ".env.example no encontrado"
        exit 1
    }
    
    if (Test-Path $envPath) {
        Write-Warn ".env.local ya existe. No se sobrescribira."
        Write-Host "  Editalo manualmente con tus API keys."
    } else {
        Copy-Item $examplePath $envPath
        Write-Ok ".env.local creado desde .env.example"
        Write-Warn "IMPORTANTE: Edita .env.local y completa:"
        Write-Host "  - TURSO_DATABASE_URL, TURSO_AUTH_TOKEN"
        Write-Host "  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY"
        Write-Host "  - ELEVENLABS_API_KEY (opcional)"
    }
}

# ─── TURSO ────────────────────────────────────────────────────────────────
if ($Turso) {
    Write-Step "Turso - Base de datos"
    
    # Cargar .env.local si existe
    $envPath = Join-Path $ProjectRoot ".env.local"
    if (Test-Path $envPath) {
        Get-Content $envPath | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
                $key = $matches[1].Trim()
                $val = $matches[2].Trim().Trim('"').Trim("'")
                [Environment]::SetEnvironmentVariable($key, $val, "Process")
            }
        }
    }
    
    $url = $env:TURSO_DATABASE_URL
    $token = $env:TURSO_AUTH_TOKEN
    
    if (-not $url -or -not $token) {
        Write-Warn "TURSO_DATABASE_URL o TURSO_AUTH_TOKEN no configurados"
        Write-Host "  Ejecuta primero: .\setup-servicios.ps1 -Env"
        Write-Host "  Luego edita .env.local con tus credenciales Turso"
        exit 1
    }
    
    Write-Ok "Variables Turso encontradas"
    
    # Intentar db:push
    Write-Host "`n  Ejecutando: pnpm db:push"
    try {
        pnpm db:push
        Write-Ok "Migraciones aplicadas"
    } catch {
        Write-Err "Error en db:push. Verifica tu conexion a Turso."
        Write-Host $_.Exception.Message
    }
}

# ─── VERIFICAR TODO ───────────────────────────────────────────────────────
if ($Verificar) {
    Write-Step "Verificacion de configuracion"
    
    $envPath = Join-Path $ProjectRoot ".env.local"
    $checks = @()
    
    # .env.local existe
    $checks += @{ Name = ".env.local existe"; Ok = (Test-Path $envPath) }
    
    if (Test-Path $envPath) {
        $content = Get-Content $envPath -Raw
        $checks += @{ Name = "TURSO_DATABASE_URL"; Ok = ($content -match "TURSO_DATABASE_URL=.+[^=]$") }
        $checks += @{ Name = "TURSO_AUTH_TOKEN"; Ok = ($content -match "TURSO_AUTH_TOKEN=.+[^=]$") }
        $checks += @{ Name = "CLERK Publishable"; Ok = ($content -match "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_") }
        $checks += @{ Name = "CLERK Secret"; Ok = ($content -match "CLERK_SECRET_KEY=sk_") }
    }
    
    $checks += @{ Name = "node_modules"; Ok = (Test-Path (Join-Path $ProjectRoot "node_modules")) }
    $checks += @{ Name = "Git repo"; Ok = (Test-Path (Join-Path $ProjectRoot ".git")) }
    
    foreach ($c in $checks) {
        if ($c.Ok) { Write-Ok $c.Name } else { Write-Err $c.Name }
    }
    
    $passed = ($checks | Where-Object { $_.Ok }).Count
    $total = $checks.Count
    Write-Host "`n  Resultado: $passed / $total verificaciones OK" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })
    
    if ($passed -lt $total) {
        Write-Host "`n  Ver: CONFIGURACION_SERVICIOS_COMPLETA.md" -ForegroundColor Cyan
    }
}
