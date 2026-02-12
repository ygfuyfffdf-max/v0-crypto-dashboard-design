# Configuración de Servicios de IA para Producción
# ElevenLabs + Deepgram + Vercel AI SDK

echo "🤖 Configurando servicios de IA para producción..."

# Variables de entorno necesarias para servicios de IA
$iaEnvVars = @{
    "ELEVENLABS_API_KEY" = "tu-elevenlabs-api-key"
    "ELEVENLABS_VOICE_ID" = "tu-voice-id-predeterminado"
    "DEEPGRAM_API_KEY" = "tu-deepgram-api-key"
    "OPENAI_API_KEY" = "tu-openai-api-key"
    "ANTHROPIC_API_KEY" = "tu-anthropic-api-key"
    "VERCEL_AI_GATEWAY_KEY" = "tu-vercel-ai-gateway-key"
}

echo "📋 Variables de entorno necesarias para IA:"
foreach ($key in $iaEnvVars.Keys) {
    echo "  - $key = [REDACTED]"
}

echo ""
echo "🔗 Pasos para obtener las claves de API:"
echo "1. ElevenLabs: https://elevenlabs.io/app/api-keys"
echo "2. Deepgram: https://console.deepgram.com/"
echo "3. OpenAI: https://platform.openai.com/api-keys"
echo "4. Anthropic: https://console.anthropic.com/"
echo "5. Vercel AI Gateway: https://vercel.com/dashboard/ai"
echo ""
echo "📖 Configuración en Vercel:"
echo "npx vercel env add ELEVENLABS_API_KEY production"
echo "npx vercel env add DEEPGRAM_API_KEY production"
echo "npx vercel env add OPENAI_API_KEY production"
echo "npx vercel env add ANTHROPIC_API_KEY production"
echo "npx vercel env add VERCEL_AI_GATEWAY_KEY production"

echo ""
echo "✅ Configuración de IA preparada. Obtén las claves y configúralas en Vercel."