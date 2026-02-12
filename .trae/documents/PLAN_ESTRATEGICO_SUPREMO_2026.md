# 🧠 PLAN ESTRATÉGICO SUPREMO: CHRONOS INFINITY 2026
**"Optimización al Átomo"**

## 1. Análisis de Estado Actual vs. Visión Suprema

Tras una auditoría exhaustiva del código fuente, el esquema de base de datos y la lógica de negocio (`FlowDistributorEngine`), se ha determinado el estado actual del sistema frente a los requerimientos de "Inteligencia Financiera Viva".

### ✅ Lo que ya está construido (La Base Sólida)
*   **Esquema de Datos (Schema Drizzle):** Es sorprendentemente avanzado. Tablas como `ordenes_compra`, `clientes` y `distribuidores` ya contienen campos para métricas de alto nivel (`roi`, `gananciaRealizada`, `scoreRentabilidad`, `valorVidaCliente`).
*   **Interfaz de Usuario:** Diseño "KOCMOC" premium implementado. Navegación migrada exitosamente al Header (Dropdowns) eliminando el Sidebar, maximizando el espacio para paneles 3D.
*   **Lógica de Distribución Sagrada:** Los principios de división en 3 bancos (Monte, Flete, Utilidades) están codificados.

### 🚨 El Eslabón Perdido: Trazabilidad Real vs. Promedios
El sistema actual utiliza una lógica de **Costo Promedio Ponderado** en el `FlowDistributorEngine`:
```typescript
// Código actual en FlowDistributorEngine.ts
const costoPromedioUnitario = almacen.stockActual > 0 ? almacen.valorStockUSD / almacen.stockActual : 0;
```

**El Problema:** Al usar promedios, se "suaviza" la realidad. Si compraste un lote barato al Distribuidor A y uno caro al Distribuidor B, y vendes productos, el sistema actual mezcla ambos costos.
**Consecuencia:** No puedes cumplir la promesa de *"Saber exactamente qué proveedor/lote te da más margen"*, porque el margen se calcula sobre un promedio global del producto, no sobre el lote específico.

## 2. La Solución: Motor de Trazabilidad FIFO (First-In, First-Out)

Para elevar la experiencia a un nivel "Supremo", debemos refactorizar el motor de cálculo para que abandone los promedios y adopte la **Identificación Específica de Lotes**.

### Nuevo Flujo de Venta "Quirúrgico"
1.  **Solicitud de Venta:** El usuario pide vender 10 unidades.
2.  **Algoritmo de Asignación (FIFO):**
    *   El sistema busca las Órdenes de Compra (OC) activas con `stockRestante > 0`, ordenadas por antigüedad.
    *   *Ejemplo:* Toma 4 unidades del Lote #1 (Costo $50) y 6 unidades del Lote #2 (Costo $60).
3.  **Cálculo de Costo Real:**
    *   Costo Total = (4 * $50) + (6 * $60) = $200 + $360 = $560.
    *   *Sistema Anterior (Promedio):* Hubiera calculado 10 * $55 = $550. ¡La diferencia es la precisión que buscamos!
4.  **Impacto en Métricas:**
    *   La ganancia se atribuye **específicamente** a las OC #1 y #2.
    *   El Distribuidor del Lote #1 recibe "puntos de rentabilidad" por su bajo costo.
    *   El Distribuidor del Lote #2 baja su score si su costo reduce nuestro margen.

## 3. Especificaciones Técnicas para la Implementación

### A. Refactorización de `FlowDistributorEngine`
Se requiere implementar una función `asignarLotesVenta` que:
*   Reciba `productoId` y `cantidad`.
*   Consulte `ordenes_compra` filtrando `stockRestante > 0` y ordenando por `fecha ASC`.
*   Retorne un array de "LotesAsignados": `{ ocId, cantidad, costoUnitario, fleteUnitario, distribuidorId }`.

### B. Actualización de Tablas (Schema)
Aunque el esquema es robusto, necesitamos asegurar que `ventas` pueda almacenar esta complejidad sin perder rendimiento.
*   **Campo `origenLotes` en `ventas`:** Ya existe como texto. Se debe estandarizar para guardar un JSON estricto:
    ```json
    [
      {"ocId": "oc_123", "cantidad": 4, "costoReal": 50, "margenContribucion": 20},
      {"ocId": "oc_456", "cantidad": 6, "costoReal": 60, "margenContribucion": 10}
    ]
    ```

### C. Nuevos Visualizadores "Supremos"
Con los datos precisos, podemos construir los paneles solicitados:

1.  **Panel "ADN del Margen":** Un gráfico Sankey que muestre cómo fluye el dinero desde Proveedores específicos -> Lotes -> Ventas -> Utilidad Neta.
2.  **Radar de Distribuidores:** Comparativa real basada en el margen neto histórico de sus lotes, no solo en precios de lista.
3.  **Alerta de "Lotes Tóxicos":** Identificación de OCs que tienen `rotacionDias > 60` y están drenando capital operativo.

## 4. Conclusión y Siguientes Pasos

Hemos eliminado el panel "Showcase" para limpiar la interfaz. El sistema está listo visualmente y en estructura de datos.
**El siguiente paso crítico** no es visual, es lógico: **Implementar el Algoritmo FIFO en el Engine**.

Sin esto, cualquier gráfico de "Rentabilidad por Distribuidor" será una aproximación. Con esto, será una verdad matemática absoluta.

> *Chronos no estima. Chronos sabe.*
