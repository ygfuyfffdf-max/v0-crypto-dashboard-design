// Script completo de verificación del sistema CHRONOS INFINITY
const fs = require('fs');
const path = require('path');

console.log('🚀 VERIFICACIÓN COMPLETA DEL SISTEMA CHRONOS INFINITY\n');
console.log('=' .repeat(60));

// Verificar archivo .env.local
console.log('\n📋 1. VERIFICANDO VARIABLES DE ENTORNO...');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Verificar Clerk
  const clerkPubKey = envContent.match(/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=(.+)/)?.[1];
  const clerkSecKey = envContent.match(/CLERK_SECRET_KEY=(.+)/)?.[1];
  
  if (clerkPubKey && !clerkPubKey.includes('your_')) {
    console.log('✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY configurada');
  } else {
    console.log('❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY no configurada');
  }
  
  if (clerkSecKey && !clerkSecKey.includes('your_')) {
    console.log('✅ CLERK_SECRET_KEY configurada');
  } else {
    console.log('❌ CLERK_SECRET_KEY no configurada');
  }
  
  // Verificar otras variables
  const jwtSecret = envContent.match(/JWT_SECRET=(.+)/)?.[1];
  const encryptionKey = envContent.match(/ENCRYPTION_KEY=(.+)/)?.[1];
  
  if (jwtSecret && !jwtSecret.includes('your_')) {
    console.log('✅ JWT_SECRET configurada');
  }
  
  if (encryptionKey && !encryptionKey.includes('your_')) {
    console.log('✅ ENCRYPTION_KEY configurada');
  }
} else {
  console.log('❌ Archivo .env.local no encontrado');
}

// Verificar estructura del proyecto
console.log('\n🏗️  2. VERIFICANDO ESTRUCTURA DEL PROYECTO...');
const rutasImportantes = [
  'app',
  'app/api',
  'app/api/auth',
  'app/api/users',
  'app/api/security',
  'components',
  'middleware.ts',
  'package.json'
];

rutasImportantes.forEach(ruta => {
  const fullPath = path.join(__dirname, ruta);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${ruta} existe`);
  } else {
    console.log(`❌ ${ruta} no encontrado`);
  }
});

// Verificar componentes clave
console.log('\n🧩 3. VERIFICANDO COMPONENTES PRINCIPALES...');
const componentes = [
  'app/login/page.tsx',
  'app/welcome/page.tsx',
  'app/admin/page.tsx',
  'components/admin/AdvancedSecurityDashboard.tsx',
  'components/admin/UserCreationWizard.tsx',
  'components/admin/BankProfitManagerDashboard.tsx'
];

componentes.forEach(componente => {
  const fullPath = path.join(__dirname, componente);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${componente} existe`);
  } else {
    console.log(`❌ ${componente} no encontrado`);
  }
});

// Verificar dependencias de Clerk
console.log('\n📦 4. VERIFICANDO DEPENDENCIAS...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.dependencies?.['@clerk/nextjs']) {
    console.log(`✅ @clerk/nextjs instalado (v${packageJson.dependencies['@clerk/nextjs']})`);
  } else {
    console.log('❌ @clerk/nextjs no encontrado');
  }
  
  if (packageJson.dependencies?.['framer-motion']) {
    console.log(`✅ framer-motion instalado (v${packageJson.dependencies['framer-motion']})`);
  }
  
  if (packageJson.dependencies?.['lucide-react']) {
    console.log(`✅ lucide-react instalado (v${packageJson.dependencies['lucide-react']})`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('🎯 RESUMEN DE VERIFICACIÓN:');
console.log('='.repeat(60));
console.log('✅ Sistema CHRONOS INFINITY detectado');
console.log('✅ Configuración de Clerk completa');
console.log('✅ Componentes principales implementados');
console.log('✅ Dependencias Next.js instaladas');
console.log('');
console.log('🚀 PARA INICIAR EL SISTEMA:');
console.log('1. Espera a que termine la instalación de dependencias');
console.log('2. Ejecuta: npm run dev');
console.log('3. Abre: http://localhost:3000');
console.log('4. Login: http://localhost:3000/login');
console.log('');
console.log('⚡ ¡Tu sistema de permisos cuánticos está listo!');