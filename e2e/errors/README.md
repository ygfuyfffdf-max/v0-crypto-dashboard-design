# Tests E2E - Detección de Errores

Tests para capturar y fallar si hay errores en la consola del navegador.

## Ejecutar Tests

```bash
# Todos los tests de errores
pnpm test:e2e e2e/errors/

# Test específico
pnpm test:e2e e2e/errors/console-errors.spec.ts
```

## Cobertura

### 🐛 Console Errors (16 tests)

Tests que capturan `console.error` y `pageerror` durante la ejecución:

**Navegación:**

- ✅ No errores en página principal
- ✅ No errores al navegar a Ventas
- ✅ No errores al navegar a Clientes
- ✅ No errores al navegar a Bancos
- ✅ No errores al navegar a Órdenes
- ✅ No errores al navegar a Inventario
- ✅ No errores al navegar a Distribuidores

**Interacciones:**

- ✅ No errores al abrir modal de nueva venta
- ✅ No errores al abrir modal de nuevo cliente
- ✅ No errores al usar búsqueda
- ✅ No errores al usar filtros
- ✅ No errores al hacer click en filas

**Flujos:**

- ✅ No errores al navegar entre múltiples paneles
- ✅ No memory leaks al abrir/cerrar modales repetidamente
- ✅ No errores en carga inicial de datos
- ✅ No errores críticos de React

## Errores Ignorados

Algunos errores conocidos y no críticos se ignoran:

```typescript
const IGNORED_ERRORS = [
  /Failed to load resource/, // Recursos opcionales
  /favicon.ico/, // Favicon no crítico
  /net::ERR_FAILED/, // Errores de red esperados
  /WebSocket connection/, // WebSocket opcional
  /Hydration/, // Warnings de hidratación
  /useLayoutEffect/, // SSR warnings
]
```

## Funcionamiento

### Captura de Errores

```typescript
page.on("console", (msg) => {
  if (msg.type() === "error") {
    const text = msg.text()

    // Ignorar errores conocidos
    const shouldIgnore = IGNORED_ERRORS.some((pattern) => pattern.test(text))

    if (!shouldIgnore) {
      consoleErrors.push(text)
    }
  }
})

page.on("pageerror", (error) => {
  consoleErrors.push(`Page Error: ${error.message}`)
})
```

### Verificación

```typescript
if (consoleErrors.length > 0) {
  console.log("❌ Errores detectados:", consoleErrors)
}

expect(consoleErrors).toHaveLength(0)
```

## Tipos de Errores Detectados

### 1. Console Errors

Errores explícitos en el código:

```javascript
console.error("Error al cargar datos")
```

### 2. Page Errors

Errores no capturados de JavaScript:

```javascript
throw new Error("Unexpected error")
```

### 3. React Errors

Errores del framework:

- Hydration mismatches
- Prop type errors
- Hook rules violations
- Cannot read property of undefined

### 4. Memory Leaks

Detectados al abrir/cerrar modales repetidamente:

- Event listeners no removidos
- Timers no limpiados
- Referencias DOM colgadas

## Configuración por Test

Cada test:

1. ✅ Limpia el array de errores antes de ejecutar
2. ✅ Captura todos los errores durante la ejecución
3. ✅ Filtra errores ignorados
4. ✅ Verifica que el array esté vacío al final
5. ✅ Imprime errores encontrados si los hay

## Beneficios

- ✅ **Detección temprana** de errores en desarrollo
- ✅ **Prevención** de errores en producción
- ✅ **Visibilidad** de problemas ocultos
- ✅ **Calidad** del código mejorada
- ✅ **Debugging** más fácil

## Casos de Uso

### Caso 1: Error de Referencia Nula

```javascript
// ❌ Error detectado
const user = undefined
console.log(user.name) // TypeError: Cannot read property 'name' of undefined
```

### Caso 2: Error de Hidratación React

```javascript
// ❌ Error detectado
// Server: <div>Loading...</div>
// Client: <div>{data.value}</div>
// Hydration mismatch
```

### Caso 3: Memory Leak

```javascript
// ❌ Error detectado
useEffect(() => {
  const interval = setInterval(() => {
    // Do something
  }, 1000)
  // Missing: return () => clearInterval(interval)
})
```

### Caso 4: Async Error No Capturado

```javascript
// ❌ Error detectado
async function loadData() {
  const response = await fetch("/api/data")
  // No hay try-catch
  const data = response.json() // Puede fallar
}
```

## Recomendaciones

1. **Ejecutar siempre** antes de hacer commit
2. **Revisar logs** cuando fallen los tests
3. **No ignorar** errores sin justificación
4. **Actualizar lista** de errores ignorados cuando sea necesario
5. **Documentar** errores conocidos

## Ejemplo de Salida

### ✅ Test Pasando

```
✓ no debe haber errores en página principal (2s)
✓ no debe haber errores al navegar a Ventas (1.5s)
✓ no debe haber errores al abrir modal (1s)
```

### ❌ Test Fallando

```
✗ no debe haber errores al navegar a Clientes (1.2s)

❌ Errores detectados: [
  'TypeError: Cannot read property "map" of undefined',
  'Warning: Each child in a list should have a unique "key" prop'
]

expect(consoleErrors).toHaveLength(0)
Expected: 0
Received: 2
```
