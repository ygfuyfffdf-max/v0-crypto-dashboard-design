/**
 * Script para verificar la respuesta de las APIs de almacén
 */

async function main() {
  const BASE_URL = 'http://localhost:3000'

  console.log('🔍 VERIFICANDO APIs DE ALMACÉN')
  console.log('═'.repeat(50))

  try {
    // 1. API de entradas
    console.log('\n📥 GET /api/almacen/entradas')
    const entradasRes = await fetch(`${BASE_URL}/api/almacen/entradas`)
    const entradasData = await entradasRes.json()
    console.log(`   Status: ${entradasRes.status}`)
    console.log(`   Entradas: ${entradasData.data?.length || 0}`)
    if (entradasData.data?.length > 0) {
      console.log(`   Primera entrada:`, JSON.stringify(entradasData.data[0], null, 2).substring(0, 200))
    }

    // 2. API de salidas
    console.log('\n📤 GET /api/almacen/salidas')
    const salidasRes = await fetch(`${BASE_URL}/api/almacen/salidas`)
    const salidasData = await salidasRes.json()
    console.log(`   Status: ${salidasRes.status}`)
    console.log(`   Salidas: ${salidasData.data?.length || 0}`)
    if (salidasData.data?.length > 0) {
      console.log(`   Primera salida:`, JSON.stringify(salidasData.data[0], null, 2).substring(0, 200))
    }

    // 3. API de productos
    console.log('\n📦 GET /api/almacen')
    const productosRes = await fetch(`${BASE_URL}/api/almacen`)
    const productosData = await productosRes.json()
    console.log(`   Status: ${productosRes.status}`)
    console.log(`   Productos: ${productosData.data?.length || productosData.length || 0}`)

    console.log('\n' + '═'.repeat(50))
    console.log('✅ Verificación completada')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()
