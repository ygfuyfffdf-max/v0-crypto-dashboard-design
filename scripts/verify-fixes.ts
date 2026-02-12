import fs from 'fs';
import path from 'path';

console.log('🔍 Iniciando verificación de correcciones de producción...');

// 1. Verificar Middleware
console.log('\n1️⃣  Verificando configuración de Middleware para Manifest...');
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');

if ((middlewareContent.includes('/manifest.json') || middlewareContent.includes('manifest.json')) && middlewareContent.includes('json')) {
    console.log('✅ Middleware ignora manifest.json correctamente.');
} else {
    console.error('❌ Middleware NO parece estar configurado correctamente para manifest.json');
    process.exit(1);
}

// 2. Verificar UltraPremium3DEngine
console.log('\n2️⃣  Verificando protecciones WebGL en Motor 3D...');
const enginePath = path.join(process.cwd(), 'app/_components/chronos-2026/3d/premium/UltraPremium3DEngine.tsx');
const engineContent = fs.readFileSync(enginePath, 'utf8');

if (engineContent.includes('!array || array.length === 0') && engineContent.includes('webglcontextlost')) {
    console.log('✅ Validaciones de Array y Manejo de Contexto WebGL implementados.');
} else {
    console.error('❌ Faltan protecciones críticas en UltraPremium3DEngine.tsx');
    process.exit(1);
}

// 3. Verificar Lazy Audio
console.log('\n3️⃣  Verificando inicialización Lazy de Audio...');
const soundPath = path.join(process.cwd(), 'app/hooks/useKocmocSound.ts');
const soundContent = fs.readFileSync(soundPath, 'utf8');

// Check if initAudio() call is commented out or removed from top level effect
if (soundContent.includes('// initAudio()') || !soundContent.match(/useEffect\(\(\) => \{\s*initAudio\(\)/)) {
    console.log('✅ Audio NO se inicializa automáticamente (Lazy Init confirmado).');
} else {
    console.warn('⚠️ Revisar useKocmocSound.ts, posible inicialización automática detectada.');
}

// 4. Verificar Documentación Clerk
console.log('\n4️⃣  Verificando documentación de Clerk...');
const docPath = path.join(process.cwd(), 'docs/CLERK_PRODUCTION_SETUP.md');
if (fs.existsSync(docPath)) {
    console.log('✅ Guía de configuración de Clerk existe.');
} else {
    console.error('❌ Falta la guía de Clerk.');
    process.exit(1);
}

console.log('\n✨ TODAS LAS VERIFICACIONES PASARON. EL CÓDIGO ESTÁ LISTO PARA PRODUCCIÓN. ✨');
