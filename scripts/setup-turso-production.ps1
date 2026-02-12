# Configuración de Turso para Producción
# Script para configurar Turso con Drizzle ORM

echo "🚀 Configurando Turso con Drizzle para producción..."

# Verificar si Turso CLI está instalado
if (!(Get-Command turso -ErrorAction SilentlyContinue)) {
    echo "📦 Instalando Turso CLI..."
    iwr -useb https://get.tur.so/install.ps1 | iex
}

# Crear archivo de configuración de Turso
echo "🔧 Creando configuración de Turso..."

# Variables de entorno necesarias para Turso
$envVars = @{
    "TURSO_DATABASE_URL" = "libsql://tu-database.turso.io"
    "TURSO_AUTH_TOKEN" = "tu-auth-token-aqui"
    "DATABASE_URL" = "file:./turso.db"
}

echo "📋 Variables de entorno necesarias para Turso:"
foreach ($key in $envVars.Keys) {
    echo "  - $key = $($envVars[$key])"
}

echo ""
echo "📖 Pasos para configurar Turso en producción:"
echo "1. Regístrate en https://turso.tech/"
echo "2. Crea una nueva base de datos: turso db create tu-database"
echo "3. Obtén el URL: turso db show tu-database --url"
echo "4. Genera el token: turso db tokens create tu-database"
echo "5. Configura las variables en Vercel con:"
echo "   npx vercel env add TURSO_DATABASE_URL production"
echo "   npx vercel env add TURSO_AUTH_TOKEN production"

echo ""
echo "✅ Configuración de Turso preparada. Ejecuta los pasos anteriores para completar la configuración."