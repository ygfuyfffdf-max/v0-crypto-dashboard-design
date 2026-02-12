# Análisis Profundo de Flujos de Trabajo

## 1. Flujo Crítico: Creación de Venta Completa

Este proceso orquesta múltiples actualizaciones en una sola transacción atómica para garantizar la integridad de los datos financiera y de inventario.

### Diagrama de Flujo

1.  **Inicio**: Usuario envía formulario de nueva venta.
2.  **Validación**: Se verifican datos con `VentaCompletaSchema` (Zod).
3.  **Verificación de Stock**: Se consulta `almacen` para asegurar existencia.
    *   *Excepción*: Si `stock < cantidad`, se aborta con error.
4.  **Cálculo GYA**: Se distribuyen los montos (Bóveda, Fletes, Utilidades).
5.  **Transacción Atómica (DB)**:
    *   **Paso 5.1**: Crear/Buscar Cliente.
    *   **Paso 5.2**: Insertar registro en `ventas`.
    *   **Paso 5.3**: Actualizar `almacen` (restar stock, actualizar contadores).
    *   **Paso 5.4**: Insertar `salidaAlmacen` (historial).
    *   **Paso 5.5**: Actualizar `ordenesCompra` (si hay trazabilidad).
    *   **Paso 5.6**: Actualizar `bancos` (sumar capital a los 3 bancos según GYA).
    *   **Paso 5.7**: Insertar `movimientos` para cada banco.
    *   **Paso 5.8**: Actualizar `clientes` (saldo pendiente, total compras).
6.  **Revalidación**: Se invalidan cachés de Next.js (`revalidatePath`).
7.  **Fin**: Retorno de éxito con IDs generados.

### Actores y Permisos
*   **Actor**: Vendedor / Administrador.
*   **Permisos**: Requiere rol `admin` o `vendedor` con permiso `write:ventas`.

### Estados y Transiciones
*   **Inicial**: `N/A`
*   **En Proceso**: Transacción DB abierta.
*   **Final Exitoso**: Venta `activa` (pagada/pendiente/parcial).
*   **Final Error**: Rollback completo (ningún dato persiste).

## 2. Flujo Crítico: Registro de Abono

Permite pagos parciales posteriores a la venta, manteniendo la distribución GYA proporcional.

### Pasos
1.  **Validación**: Monto positivo y no mayor a la deuda.
2.  **Cálculo**: Determinar proporción del abono respecto al total original.
3.  **Transacción**:
    *   Actualizar `ventas` (monto pagado, restante, estado).
    *   Actualizar `clientes` (reducir deuda).
    *   Actualizar `bancos` (incrementar capital proporcionalmente).
    *   Registrar `movimientos` de tipo `abono`.

## 3. Flujo Crítico: Creación de Orden de Compra (OC)

Entrada de mercancía al sistema.

### Pasos
1.  **Validación**: Datos de proveedor y producto.
2.  **Gestión Entidades**: Crear Distribuidor/Producto si no existen.
3.  **Transacción**:
    *   Crear `ordenesCompra`.
    *   Actualizar `almacen` (sumar stock, recalcular precio promedio).
    *   Registrar `entradaAlmacen`.
    *   Actualizar `distribuidores` (deuda).
    *   Si hay pago inicial: reducir capital de `bancos` y registrar `movimiento`.
