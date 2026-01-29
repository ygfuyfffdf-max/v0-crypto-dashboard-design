# Tests E2E - Lógica de Negocio

Tests de las fórmulas matemáticas y lógica de negocio del sistema CHRONOS.

## Ejecutar Tests

```bash
# Todos los tests de lógica
pnpm test:e2e e2e/logic/

# Test específico
pnpm test:e2e e2e/logic/distribucion-gya.spec.ts
pnpm test:e2e e2e/logic/abonos-proporcional.spec.ts
pnpm test:e2e e2e/logic/formulas-matematicas.spec.ts
pnpm test:e2e e2e/logic/persistencia-completa.spec.ts
```

## Cobertura

### 🧮 Distribución GYA (10 tests)

Tests de la distribución automática a 3 bancos:

**Fórmulas:**

```typescript
bovedaMonte = precioCompra × cantidad
fletes = precioFlete × cantidad
utilidades = (precioVenta - precioCompra - precioFlete) × cantidad
total = precioVenta × cantidad
```

**Tests:**

- ✅ Distribución venta al contado
- ✅ Distribución venta a crédito
- ✅ Caso matemático 15 relojes (del documento)
- ✅ Valores decimales
- ✅ Cantidad 1
- ✅ Cantidades grandes (1000)
- ✅ Margen de ganancia
- ✅ Caso sin flete
- ✅ Múltiples ventas proporcionales
- ✅ Validación: precio venta > costo

### 💰 Abonos Proporcionales (10 tests)

Tests de distribución proporcional cuando el pago es parcial:

**Fórmula:**

```typescript
proporción = montoPagado / precioTotalVenta
bovedaMonteParcial = bovedaMonteTotal × proporción
fletesParcial = fletesTotal × proporción
utilidadesParcial = utilidadesTotal × proporción
```

**Tests:**

- ✅ Proporción 50% (mitad pagada)
- ✅ Proporción 25%
- ✅ Proporción 75%
- ✅ Múltiples abonos acumulativos
- ✅ Enganche inicial (30%)
- ✅ Deuda pendiente
- ✅ Liquidación completa
- ✅ Valores decimales
- ✅ Edge case: abono > total
- ✅ Edge case: abono = $0

### 📐 Fórmulas Matemáticas (4 grupos, 20+ tests)

#### Capital Bancario

```typescript
capital = historicoIngresos - historicoGastos
```

- ✅ Capital positivo
- ✅ Capital negativo (gastos > ingresos)
- ✅ Capital cero
- ✅ Múltiples operaciones
- ✅ Valores decimales

#### Margen de Ganancia

```typescript
margen = ((precioVenta - costoTotal) / precioVenta) × 100
```

- ✅ Margen 35%, 50%, 100%
- ✅ Margen negativo
- ✅ Margen cero
- ✅ Considerando todos los costos

#### Saldo Pendiente

```typescript
saldo = totalVenta - totalPagado
```

- ✅ Saldo pendiente
- ✅ Saldo cero (pagado completo)
- ✅ Saldo negativo (sobrepago)
- ✅ Múltiples abonos
- ✅ Porcentaje pagado/pendiente

#### Fórmulas Combinadas

- ✅ Flujo completo de venta
- ✅ ROI (Return on Investment)
- ✅ Punto de equilibrio
- ✅ Tasa de rotación de inventario

#### Validaciones Matemáticas

- ✅ Suma distribución = total
- ✅ Suma porcentajes = 100%
- ✅ Capital no undefined/NaN

### 🔄 Persistencia Completa (14 tests)

Tests del ciclo Form → DB → UI:

**Tests:**

- ✅ UI actualizada sin refresh
- ✅ Datos persisten al navegar
- ✅ Cambios reflejados inmediatamente
- ✅ Saldos actualizados en tiempo real
- ✅ Stock actualizado
- ✅ Historial en tiempo real
- ✅ Filtros sin recargar página
- ✅ Búsqueda sin recargar página
- ✅ Paginación sin recargar página
- ✅ Modal mantiene estado
- ✅ Totales actualizados automáticamente
- ✅ KPIs actualizados
- ✅ Cambios persisten después de cerrar sesión
- ✅ Validación sin recargar formulario
- ✅ Estado global entre componentes

## Casos de Prueba Documentados

### Caso 1: Venta al Contado

```typescript
cantidad: 3
precioCompra: 5,000
precioVenta: 8,000
precioFlete: 200

// Distribución:
bovedaMonte: 15,000  // 5,000 × 3
fletes: 600          // 200 × 3
utilidades: 8,400    // (8,000 - 5,000 - 200) × 3
total: 24,000        // 8,000 × 3
```

### Caso 2: Venta a Crédito con Abono Parcial

```typescript
cantidad: 2
precioCompra: 7,000
precioVenta: 12,000
precioFlete: 500
montoPagado: 7,200  // 30% del total

// Total: 24,000
// Proporción: 0.3 (30%)
// Distribución parcial:
bovedaMonte: 4,200   // 14,000 × 0.3
fletes: 300          // 1,000 × 0.3
utilidades: 2,700    // 9,000 × 0.3
```

### Caso 3: Caso Matemático GYA Completo (15 Relojes)

```typescript
cantidad: 15
precioCompra: 7,000
precioVenta: 12,000
precioFlete: 800

// Distribución:
bovedaMonte: 105,000  // 7,000 × 15
fletes: 12,000        // 800 × 15
utilidades: 63,000    // (12,000 - 7,000 - 800) × 15
total: 180,000        // DEBE SUMAR EXACTAMENTE
```

## Validaciones Críticas

Estos tests validan que:

1. ✅ **Suma siempre es exacta**: `bovedaMonte + fletes + utilidades = total`
2. ✅ **Proporción válida**: `0 ≤ proporción ≤ 1.0`
3. ✅ **Capital correcto**: `capital = ingresos - gastos`
4. ✅ **Sin pérdidas de precisión** en operaciones con decimales
5. ✅ **Persistencia**: datos no se pierden al navegar
6. ✅ **UI reactiva**: cambios visibles sin refresh
