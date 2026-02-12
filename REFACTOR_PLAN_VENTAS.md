# 🏗️ Plan de Refactorización Modular: AuroraVentasPanelUnified
**Componente Objetivo:** `AuroraVentasPanelUnified.tsx` (~2000+ líneas)
**Objetivo:** Descomponer el "God Component" en una arquitectura modular, mantenible y testeable.

---

## 1. Arquitectura Propuesta

La nueva estructura seguirá el patrón de **Composición de Componentes** y **Separación de Responsabilidades (SoC)**.

### Estructura de Directorios
```
app/_components/chronos-2026/panels/ventas/
├── index.tsx                # Punto de entrada (Wrapper principal)
├── VentasContext.tsx        # Estado local (filtros, selección, UI state)
├── components/
│   ├── VentasHeader.tsx     # Título y acciones globales
│   ├── VentasStats.tsx      # Tarjetas de métricas (KPIs)
│   ├── VentasFilters.tsx    # Filtros avanzados y búsqueda
│   ├── VentasTable.tsx      # Tabla de datos (TanStack Table)
│   ├── VentasCharts.tsx     # Visualizaciones gráficas
│   └── modals/              # Modales aislados
│       ├── CreateVentaModal.tsx
│       └── EditVentaModal.tsx
├── hooks/
│   ├── useVentasData.ts     # Lógica de fetching y SWR/Query
│   └── useVentasActions.ts  # Handlers para Server Actions
└── types.ts                 # Definiciones de tipos compartidas
```

---

## 2. Análisis de Flujo de Datos

### Estado Actual (Problemático)
*   **Props Drilling:** `AuroraVentasPanelUnified` recibe `initialData` y lo pasa profundamente.
*   **Estado Gigante:** Un solo `useState` o `useReducer` implícito maneja filtros, datos, modales y errores.
*   **Lógica Mezclada:** Lógica de negocio (cálculo de GYA) mezclada con renderizado UI.

### Nuevo Flujo
1.  **Server Component (`page.tsx`)**: Fetch inicial de datos.
2.  **`VentasContext`**: Recibe datos iniciales. Provee `filtros`, `setFiltros`, `isLoading`, `refreshData`.
3.  **Hooks Especializados**:
    *   `useVentasActions`: Encapsula `createVenta`, `updateVenta` con manejo de `toast` y `revalidatePath`.
    *   `useVentasCalculations`: Aísla la lógica GYA para validaciones en cliente.

---

## 3. Plan de Implementación (Sprint)

### Fase 1: Extracción de Tipos y Utilidades (Día 1)
*   [ ] Mover todas las interfaces (`Venta`, `Filters`, etc.) a `panels/ventas/types.ts`.
*   [ ] Extraer funciones helper (formateo de moneda, cálculos GYA) a `lib/utils/ventas-helpers.ts`.

### Fase 2: Componentes de Presentación (Día 1-2)
*   [ ] Crear `VentasStats.tsx`: Componente puro que recibe métricas.
*   [ ] Crear `VentasHeader.tsx`: Componente puro para título y botones de acción.
*   [ ] Crear `VentasFilters.tsx`: Componente controlado que recibe estado de filtros.

### Fase 3: La Tabla y el Contexto (Día 2-3)
*   [ ] Implementar `VentasContext.tsx` para evitar prop drilling.
*   [ ] Migrar la lógica de la tabla a `VentasTable.tsx`.
*   [ ] Conectar tabla al contexto.

### Fase 4: Lógica de Negocio y Modales (Día 3-4)
*   [ ] Extraer lógica de creación/edición a `useVentasActions.ts`.
*   [ ] Mover modales a `components/modals/`.
*   [ ] Refactorizar modales para usar el hook de acciones.

### Fase 5: Integración y Limpieza (Día 5)
*   [ ] Reemplazar contenido de `AuroraVentasPanelUnified.tsx` con la nueva composición.
*   [ ] Verificar que no haya regresiones visuales ni funcionales.
*   [ ] Eliminar código muerto.

---

## 4. Métricas de Éxito
*   **Reducción de Líneas:** El archivo principal debe pasar de ~2500 líneas a <200 líneas.
*   **Complejidad Ciclomática:** Reducción del 50% en la complejidad del componente principal.
*   **Render Performance:** Reducción de re-renders innecesarios al escribir en filtros (aislamiento de estado).
*   **Testabilidad:** Posibilidad de escribir tests unitarios para `VentasStats` y `VentasTable` por separado.

## 5. Riesgos y Mitigación
*   **Riesgo:** Romper la funcionalidad de Server Actions durante la migración.
    *   *Mitigación:* No modificar los archivos en `app/_actions/` durante este refactor. Solo cambiar cómo se invocan.
*   **Riesgo:** Pérdida de estado de filtros al navegar.
    *   *Mitigación:* Sincronizar filtros con URL Search Params en `VentasContext` (opcional para Fase 2).
