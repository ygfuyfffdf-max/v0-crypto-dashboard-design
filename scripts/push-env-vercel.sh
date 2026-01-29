#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# ⚡ CHRONOS - Push variables a Vercel
# ═══════════════════════════════════════════════════════════════════════════════

echo "🚀 Configurando variables en Vercel..."

# Development
echo "📦 Development environment..."
echo "development" | vercel env add NEXT_PUBLIC_ENVIRONMENT development -y 2>/dev/null || true
echo "http://localhost:3000" | vercel env add NEXT_PUBLIC_BASE_URL development -y 2>/dev/null || true

# Preview
echo "📦 Preview environment..."
echo "preview" | vercel env add NEXT_PUBLIC_ENVIRONMENT preview -y 2>/dev/null || true

# Production
echo "📦 Production environment..."
echo "production" | vercel env add NEXT_PUBLIC_ENVIRONMENT production -y 2>/dev/null || true

echo ""
echo "✅ Variables configuradas en Vercel"
echo ""
echo "💡 Siguiente paso: configurar variables sensibles manualmente:"
echo "   vercel env add DATABASE_URL production preview"
echo "   vercel env add DATABASE_AUTH_TOKEN production preview"
echo "   vercel env add NEXTAUTH_URL production"
echo "   vercel env add NEXTAUTH_SECRET production preview development"
