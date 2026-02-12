// Script para verificar la configuración de Clerk
const fs = require('fs');
const path = require('path');

// Leer el archivo .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

console.log('🔍 VERIFICANDO CONFIGURACIÓN DE CLERK...\n');

// Extraer las claves
const publishableKey = envContent.match(/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=(.+)/)?.[1];
const secretKey = envContent.match(/CLERK_SECRET_KEY=(.+)/)?.[1];

console.log('📊 ANÁLISIS DE CLAVES:');
console.log('========================');

// Verificar Publishable Key
if (publishableKey) {
  console.log(`✅ Publishable Key encontrada: ${publishableKey.substring(0, 20)}...`);
  
  if (publishableKey.startsWith('pk_test_')) {
    console.log('✅ Publishable Key es válida (modo desarrollo)');
  } else if (publishableKey.startsWith('pk_live_')) {
    console.log('✅ Publishable Key es válida (modo producción)');
  } else if (publishableKey.includes('your_')) {
    console.log('❌ Publishable Key aún es placeholder');
  } else {
    console.log('⚠️  Publishable Key tiene formato inusual');
  }
} else {
  console.log('❌ Publishable Key no encontrada');
}

// Verificar Secret Key
if (secretKey) {
  console.log(`✅ Secret Key encontrada: ${secretKey.substring(0, 20)}...`);
  
  if (secretKey.startsWith('sk_test_')) {
    console.log('✅ Secret Key es válida (modo desarrollo)');
  } else if (secretKey.startsWith('sk_live_')) {
    console.log('✅ Secret Key es válida (modo producción)');
  } else if (secretKey.includes('your_')) {
    console.log('❌ Secret Key aún es placeholder');
  } else {
    console.log('⚠️  Secret Key tiene formato inusual');
  }
} else {
  console.log('❌ Secret Key no encontrada');
}

console.log('\n🎯 RESUMEN:');
console.log('=============');
if (publishableKey && secretKey && 
    !publishableKey.includes('your_') && 
    !secretKey.includes('your_')) {
  console.log('🎉 ¡CONFIGURACIÓN DE CLERK COMPLETA!');
  console.log('✅ El sistema está listo para usar');
  console.log('✅ Puedes iniciar el servidor con: npm run dev');
} else {
  console.log('⚠️  Faltan configurar las claves de Clerk');
  console.log('📋 Por favor, actualiza el archivo .env.local');
}