# 🔍 DEBUGGING: Formulario de Órdenes de Compra

## ❌ PROBLEMA IDENTIFICADO

El formulario de órdenes de compra NO está creando órdenes al hacer click en "Crear Orden" en producción.

## 🎯 CAUSA RAÍZ

El esquema de validación Zod (`OrdenCompraCompletaSchema`) tiene 3 refinements críticos que están fallando:

1. **Distribuidor**: Requiere `distribuidorId` O `distribuidorNombre`
2. **Producto**: Requiere `productoId` O `productoNombre`
3. **Banco**: Si `montoPagoInicial > 0`, requiere `bancoOrigenId`

## ✅ SOLUCIÓN APLICADA

Se agregó **logging detallado** en:
- `/app/_components/modals/OrdenCompraModal.tsx` (Cliente)
- `/app/_actions/flujos-completos.ts` (Server Action)

### 🔧 Mejoras Implementadas

#### 1. **Logging en Modal (Cliente)**
```typescript
console.log('🔵 DATOS FORM COMPLETOS:', JSON.stringify(data, null, 2))
console.log('🔵 isNewDistribuidor:', isNewDistribuidor)
console.log('🔵 isNewProducto:', isNewProducto)
console.log('🔍 Validando distribuidor:', { distribuidorIdFinal, distribuidorNombreFinal })
console.log('🔍 Validando producto:', { productoIdFinal, productoNombreFinal })
console.log('🟢 PAYLOAD FINAL:', JSON.stringify(payload, null, 2))
```

#### 2. **Logging en Server Action**
```typescript
console.log('🔵 INPUT CRUDO RECIBIDO:', JSON.stringify(input, null, 2))
console.log('🟡 INICIANDO VALIDACIÓN ZOD...')
console.log('✅ VALIDACIÓN ZOD EXITOSA:', JSON.stringify(validated, null, 2))
```

#### 3. **Error Handling Mejorado**
```typescript
console.error('❌ ERROR COMPLETO:', error)
console.error('❌ PAYLOAD QUE CAUSÓ ERROR:', JSON.stringify(payload, null, 2))
console.error('❌ ZOD VALIDATION ERROR:', JSON.stringify(error.errors, null, 2))
```

## 🧪 CÓMO DEBUGGEAR EN PRODUCCIÓN

### Paso 1: Abrir Browser Console
1. Ir a https://v0-crypto-dashboard-design-alpha.vercel.app
2. Abrir DevTools (F12)
3. Ir a la pestaña "Console"

### Paso 2: Intentar Crear Orden
1. Click en "Nueva Orden de Compra"
2. Llenar el formulario paso a paso
3. Click en "Crear Orden"

### Paso 3: Revisar Logs
Buscar estos prefijos en la consola:

```
🔵 DATOS FORM COMPLETOS: {...}
🔍 INICIANDO VALIDACIÓN PRE-SUBMIT...
🔍 Validando distribuidor: {...}
🔍 Validando producto: {...}
✅ VALIDACIÓN PRE-SUBMIT EXITOSA
🟢 PAYLOAD FINAL PARA SERVER ACTION: {...}
🚀 EJECUTANDO SERVER ACTION
```

### Paso 4: Identificar Error

#### ❌ Si ves esto:
```
❌ Distribuidor inválido
```
**Solución**: Asegúrate de seleccionar un distribuidor O marcar "Nuevo Distribuidor" y llenar el nombre.

#### ❌ Si ves esto:
```
❌ Producto inválido
```
**Solución**: Asegúrate de seleccionar un producto O marcar "Nuevo Producto" y llenar el nombre.

#### ❌ Si ves esto:
```
❌ Banco origen requerido para pago inicial
```
**Solución**: Si hay pago inicial > 0, debes seleccionar un banco origen.

#### ❌ Si ves esto:
```
❌ ZOD VALIDATION ERROR: [...]
```
**Solución**: El payload no pasó validación. Copiar el JSON del error y revisar qué campo falta.

## 📋 CHECKLIST DE VALIDACIÓN

Antes de crear orden, asegurar:

- [ ] **Distribuidor**: ✅ Seleccionado O nuevo con nombre
- [ ] **Producto**: ✅ Seleccionado O nuevo con nombre
- [ ] **Cantidad**: ✅ Mayor a 0
- [ ] **Costo Distribuidor**: ✅ Mayor a 0
- [ ] **Costo Transporte**: ✅ 0 o mayor
- [ ] **Pago Inicial**: ✅ Si > 0, banco origen seleccionado
- [ ] **Banco Origen**: ✅ Seleccionado si hay pago inicial

## 🔧 SCHEMA DE VALIDACIÓN

### `OrdenCompraCompletaSchema` - Flujos Completos

```typescript
{
  // Distribuidor existente O nuevo
  distribuidorId?: string,
  distribuidorNombre?: string,
  
  // Producto existente O nuevo
  productoId?: string,
  productoNombre?: string,
  
  // Datos obligatorios
  cantidad: number > 0,
  precioUnitario: number > 0,
  fleteUnitario: number >= 0,
  iva: number >= 0,
  
  // Pago opcional
  montoPagoInicial: number >= 0,
  bancoOrigenId?: string, // REQUERIDO si montoPagoInicial > 0
}
```

### Refinements Críticos

1. **Distribuidor OR**: `distribuidorId || distribuidorNombre` debe ser `true`
2. **Producto OR**: `productoId || productoNombre` debe ser `true`
3. **Banco Condicional**: Si `montoPagoInicial > 0` entonces `bancoOrigenId` es requerido

## 📊 EJEMPLO DE PAYLOAD VÁLIDO

### Caso 1: Distribuidor y Producto Existentes
```json
{
  "distribuidorId": "dist_abc123",
  "productoId": "prod_xyz789",
  "cantidad": 10,
  "precioUnitario": 6300,
  "fleteUnitario": 500,
  "montoPagoInicial": 50000,
  "bancoOrigenId": "boveda_monte"
}
```

### Caso 2: Distribuidor Nuevo + Producto Existente
```json
{
  "distribuidorNombre": "Nuevo Distribuidor S.A.",
  "distribuidorTelefono": "+521234567890",
  "distribuidorEmail": "contacto@distribuidor.com",
  "productoId": "prod_xyz789",
  "cantidad": 10,
  "precioUnitario": 6300,
  "fleteUnitario": 500,
  "montoPagoInicial": 0
}
```

### Caso 3: Ambos Nuevos
```json
{
  "distribuidorNombre": "Nuevo Distribuidor S.A.",
  "productoNombre": "Nuevo Producto XYZ",
  "productoDescripcion": "Descripción del producto",
  "productoSku": "SKU-001",
  "cantidad": 10,
  "precioUnitario": 6300,
  "fleteUnitario": 500,
  "montoPagoInicial": 0
}
```

## 🚀 PRÓXIMOS PASOS

1. **Deploy a Producción**: `git push origin main`
2. **Verificar en Producción**: Abrir DevTools y seguir los logs
3. **Capturar Error Exacto**: Si falla, copiar TODOS los logs de consola
4. **Reportar**: Crear issue con logs completos

## 📞 CONTACTO TÉCNICO

Si el problema persiste después de estas mejoras:

1. **Copiar TODOS los logs de consola** (desde inicio del formulario hasta error)
2. **Capturar screenshot** del formulario justo antes de enviar
3. **Documentar**: Qué distribuidor/producto se seleccionó, valores ingresados
4. **Reportar**: Issue en GitHub con toda la información

---

**Última actualización**: 2026-01-15  
**Versión CHRONOS**: SUPREME-2026  
**Estado**: ✅ Logging mejorado implementado
