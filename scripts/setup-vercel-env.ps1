# ═══════════════════════════════════════════════════════════════════════════════════════
# 🚀 CHRONOS INFINITY 2026 — VERCEL ENVIRONMENT SETUP
# ═══════════════════════════════════════════════════════════════════════════════════════
#
# Ejecutar después de configurar todas las API keys en .env.local:
# ./scripts/setup-vercel-env.ps1
#
# ═══════════════════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 CHRONOS INFINITY 2026 — VERCEL ENVIRONMENT SETUP" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Check if linked to Vercel project
Write-Host "🔗 Linking to Vercel project..." -ForegroundColor Yellow
vercel link

# Read .env.local and set environment variables
Write-Host ""
Write-Host "📤 Uploading environment variables to Vercel..." -ForegroundColor Yellow

$envFile = ".env.local"
if (Test-Path $envFile) {
    $lines = Get-Content $envFile
    
    foreach ($line in $lines) {
        # Skip comments and empty lines
        if ($line -match "^\s*#" -or $line -match "^\s*$") {
            continue
        }
        
        # Parse KEY=VALUE
        if ($line -match "^([^=]+)=(.*)$") {
            $key = $Matches[1].Trim()
            $value = $Matches[2].Trim().Trim('"')
            
            # Skip placeholder values
            if ($value -match "^YOUR_" -or $value -eq "") {
                Write-Host "⏭️ Skipping $key (not configured)" -ForegroundColor Gray
                continue
            }
            
            Write-Host "📝 Setting $key..." -ForegroundColor Blue
            
            # Set for all environments
            $value | vercel env add $key production --yes 2>$null
            $value | vercel env add $key preview --yes 2>$null
            $value | vercel env add $key development --yes 2>$null
        }
    }
    
    Write-Host ""
    Write-Host "✅ Environment variables uploaded!" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local not found!" -ForegroundColor Red
    exit 1
}

# List current environment variables
Write-Host ""
Write-Host "📋 Current Vercel environment variables:" -ForegroundColor Yellow
vercel env ls

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎉 Setup complete! Deploy with: vercel --prod" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
