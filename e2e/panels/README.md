# Tests E2E - Paneles

Tests completos de TODOS los botones y acciones de cada panel del sistema CHRONOS.

## Ejecutar Tests

```bash
# Todos los tests de paneles
pnpm test:e2e e2e/panels/

# Test específico de un panel
pnpm test:e2e e2e/panels/ventas-panel-buttons.spec.ts
pnpm test:e2e e2e/panels/clientes-panel-buttons.spec.ts
pnpm test:e2e e2e/panels/bancos-panel-buttons.spec.ts
pnpm test:e2e e2e/panels/ordenes-panel-buttons.spec.ts
pnpm test:e2e e2e/panels/almacen-panel-buttons.spec.ts
pnpm test:e2e e2e/panels/distribuidores-panel-buttons.spec.ts
```

## Cobertura

### 📊 Panel Ventas (9 grupos de tests)

- ✅ Botón "Nueva Venta" (modal, campos, validación, cerrar)
- ✅ Botón "Exportar" (descarga archivo)
- ✅ Botones de fila: Ver, Editar, Eliminar
- ✅ Botón "Registrar Abono"
- ✅ Filtros (estado, fecha)
- ✅ Paginación (siguiente, anterior)
- ✅ Búsqueda (nombre, limpia resultados)

### 👥 Panel Clientes (7 grupos de tests)

- ✅ Botón "Nuevo Cliente" (modal, validación)
- ✅ Botón "Editar" (pre-llenado, guardar)
- ✅ Botón "Eliminar" (confirmación, cancelar)
- ✅ Botón "Historial" (ventas asociadas)
- ✅ Botón "Abono Rápido" (validación, actualizar saldo)
- ✅ Búsqueda (nombre, teléfono)
- ✅ Filtros (estado de saldo)

### 🏦 Panel Bancos (8 grupos de tests)

- ✅ Visualización de 7 bancos (Bóveda Monte, USA, Profit, Leftie, Azteca, Flete Sur, Utilidades)
- ✅ Botón "Ingreso" por cada banco (validación monto)
- ✅ Botón "Gasto" por cada banco (validación capital)
- ✅ Botón "Transferencia" (origen/destino, validación)
- ✅ Botón "Corte de Caja" (reporte, exportar)
- ✅ Botón "Movimientos" (historial, filtros, colores)
- ✅ Integración completa

### 📦 Panel Órdenes (5 grupos de tests)

- ✅ Botón "Nueva Orden" (modal, campos, validación)
- ✅ Botón "Editar" (pre-llenado, restricciones)
- ✅ Botón "Cancelar" (confirmación, restricciones)
- ✅ Botón "Registrar Pago" (validación, actualizar saldo)
- ✅ Botón "Marcar Recibida" (confirmación, actualizar inventario)

### 📦 Panel Almacén (4 grupos de tests)

- ✅ Botón "Nuevo Producto" (modal, stock inicial)
- ✅ Botón "Editar" (pre-llenado)
- ✅ Botón "Ajustar Stock" (entrada/salida, motivo, historial)
- ✅ Botón "Corte Inventario" (reporte, valor, stock bajo, exportar)

### 🚚 Panel Distribuidores (5 grupos CRUD)

- ✅ CREATE: "Nuevo Distribuidor"
- ✅ READ: "Ver Detalle"
- ✅ UPDATE: "Editar"
- ✅ DELETE: "Eliminar" (confirmación)
- ✅ Historial de Órdenes

## Patrones de Tests

Todos los tests siguen patrones consistentes:

1. **Navigation**: `await navigateToPanel(page, 'NombrePanel')`
2. **Wait**: `await page.waitForTimeout(1000)`
3. **Find Button**: `page.getByRole('button', { name: /patrón/i })`
4. **Verify Modal**: `await waitForModal(page)`
5. **Skip if not found**: `if (!visible) test.skip()`

## Notas Importantes

- Los tests son **no destructivos**: no modifican datos reales
- Usan **selectores flexibles** para adaptarse a cambios de UI
- Implementan **timeouts** configurables
- Incluyen **skip automático** cuando elementos no existen
- Todos los textos de búsqueda están en **español**
