# Análisis de Lógica de Negocio

## 1. Reglas de Negocio Fundamentales

### 1.1 Distribución GYA (Global Yield Allocation)
Cada venta se descompone internamente en tres componentes financieros que alimentan bancos virtuales distintos. Esta regla es invariable.

*   **Fórmula**:
    *   `Monto Bóveda Monte` = (Costo Unitario * Cantidad) * (% Pagado)
    *   `Monto Flete Sur` = (Costo Flete * Cantidad) * (% Pagado)
    *   `Monto Utilidades` = ((Precio Venta - Costo Unitario - Costo Flete) * Cantidad) * (% Pagado)

*   **Regla de Proporcionalidad**: El capital real disponible en los bancos solo aumenta cuando entra dinero real (abono o pago inicial). El histórico de ingresos ("ventas teóricas") se registra al 100% al momento de la venta, pero el `capitalActual` depende del flujo de caja.

### 1.2 Integridad de Inventario
*   **Stock No Negativo**: El sistema impide transacciones que dejen el stock físico en negativo.
*   **Costo Promedio Ponderado**: Al ingresar mercancía (OC), el costo del producto se recalcula automáticamente basado en el stock actual y el nuevo costo.

### 1.3 Gestión de Entidades "Lazy"
*   **Creación Implícita**: Si se registra una venta con un nombre de cliente que no existe, el sistema crea automáticamente el perfil del cliente. Lo mismo aplica para Distribuidores y Productos en las Órdenes de Compra.
*   **Normalización**: Los nombres se normalizan (lowercase, trim) para evitar duplicados.

## 2. Análisis de Edge Cases y Escenarios Límite

### 2.1 Pagos Parciales Infinitesimales
*   **Escenario**: Abonos de $0.01.
*   **Manejo**: El sistema acepta el abono y distribuye fracciones de centavo a los bancos. Drizzle/Postgres manejan la precisión, pero se recomienda redondear a 2 decimales en la interfaz.

### 2.2 Eliminación de Ventas (Cancelación)
*   **Escenario**: Cancelar una venta ya procesada.
*   **Manejo Actual**: Soft delete (estado `cancelada`).
*   **Riesgo**: Actualmente la función `deleteVenta` solo marca el estado. **Alerta**: No parece revertir el stock ni los movimientos bancarios automáticamente en el código analizado (`ventas.ts`). Esto es un punto crítico a revisar. *Recomendación*: Implementar un flujo de reversión completo ("Nota de Crédito").

### 2.3 Concurrencia
*   **Escenario**: Dos ventas simultáneas del último producto.
*   **Manejo**: La transacción de base de datos (`db.transaction`) debería manejar el aislamiento, pero sin un bloqueo explícito de fila (`FOR UPDATE`), podría haber una condición de carrera en la lectura del stock.

## 3. Matriz de Decisiones Críticas

| Decisión | Impacto | Justificación |
|----------|---------|---------------|
| **Transacciones Atómicas** | Alto | Garantiza que no haya "dinero fantasma" o inventario desalineado si falla una parte del proceso. |
| **Server Actions** | Medio | Simplifica la comunicación Cliente-Servidor y aprovecha el caché de Next.js. |
| **Cálculo en Servidor** | Alto | Previene manipulación de precios o totales desde el cliente. |
