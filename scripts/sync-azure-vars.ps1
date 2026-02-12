$envFile = "..\azure-services.env"
if (!(Test-Path $envFile)) { 
    Write-Host "❌ Archivo env no encontrado: $envFile" -ForegroundColor Red
    exit 1 
}

Write-Host "🚀 Sincronizando variables de Azure con Vercel..." -ForegroundColor Cyan

Get-Content $envFile | ForEach-Object {
    # Ignorar comentarios y líneas vacías
    if ($_ -match "^\s*#") { return }
    if ([string]::IsNullOrWhiteSpace($_)) { return }

    if ($_ -match "^(AZURE_[^=]+)=(.*)$") {
        $key = $matches[1]
        $value = $matches[2]
        
        # Limpiar comillas si existen
        $value = $value.Trim('"').Trim("'")

        if ($value) {
            Write-Host "   👉 Configurando $key..." -ForegroundColor Green
            # Usar input object para pasar el valor al comando vercel
            # Nota: vercel env add espera el valor por stdin
            $value | vercel env add $key production
        }
    }
}

Write-Host "✅ Sincronización completada." -ForegroundColor Green
