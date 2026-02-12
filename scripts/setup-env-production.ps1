# Configuración de Variables de Entorno para Producción
# Este script configura todas las variables necesarias de forma segura

echo "🔐 Configurando variables de entorno para producción..."

# Array de variables de entorno necesarias
$envVars = @{
    # Clerk Authentication
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" = ""
    "CLERK_SECRET_KEY" = ""
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL" = "/login"
    "NEXT_PUBLIC_CLERK_SIGN_UP_URL" = "/register"
    "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL" = "/dashboard"
    "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL" = "/dashboard"
    
    # Turso Database
    "TURSO_DATABASE_URL" = ""
    "TURSO_AUTH_TOKEN" = ""
    "DATABASE_URL" = "file:./turso.db"
    
    # AI Services
    "ELEVENLABS_API_KEY" = ""
    "ELEVENLABS_VOICE_ID" = "pNInz6obpgDQGcFmaJgB"
    "DEEPGRAM_API_KEY" = ""
    "OPENAI_API_KEY" = ""
    "ANTHROPIC_API_KEY" = ""
    
    # Vercel Analytics
    "NEXT_PUBLIC_VERCEL_ANALYTICS_ID" = ""
    
    # Security
    "NODE_ENV" = "production"
    "NEXT_TELEMETRY_DISABLED" = "1"
    
    # Performance
    "NEXT_OPTIMIZE_FONTS" = "true"
    "NEXT_OPTIMIZE_IMAGES" = "true"
    "NEXT_BUNDLE_ANALYZER" = "false"
}

echo "📋 Variables de entorno necesarias:"
foreach ($key in $envVars.Keys) {
    if ($envVars[$key] -eq "") {
        echo "  - $key = [REQUIRED - Obtener del servicio correspondiente]"
    } else {
        echo "  - $key = $($envVars[$key])"
    }
}

echo ""
echo "🔗 Instrucciones para obtener las claves:"
echo "1. Clerk: https://dashboard.clerk.com/ → API Keys"
echo "2. Turso: https://turso.tech/ → Database Settings"
echo "3. ElevenLabs: https://elevenlabs.io/app/api-keys"
echo "4. Deepgram: https://console.deepgram.com/ → API Keys"
echo "5. OpenAI: https://platform.openai.com/api-keys"
echo "6. Anthropic: https://console.anthropic.com/ → API Keys"
echo "7. Vercel Analytics: https://vercel.com/dashboard/analytics"

echo ""
echo "📖 Comandos para configurar en Vercel:"
foreach ($key in $envVars.Keys) {
    if ($envVars[$key] -eq "") {
        echo "npx vercel env add $key production"
    }
}

echo ""
echo "✅ Script preparado. Obtén las claves y ejecuta los comandos anteriores para completar la configuración."
echo "💡 Consejo: Usa 'npx vercel env add NOMBRE_VARIABLE production' para cada variable."