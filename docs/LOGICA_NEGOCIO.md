# 🎯 LÓGICA DE NEGOCIO - CHRONOS 2026

**Sistema Financiero con Distribución GYA Automática**

---

## 📊 LÓGICA SAGRADA GYA

### Principio Fundamental

Cuando se registra una **venta**, el dinero se **descompone en 3 flujos sagrados** automáticos:

1. **Bóveda Monte** → Recibe el **costo del producto** (precio compra × cantidad)
2. **Fletes** (`flete_sur`) → Recibe el **costo de transporte** (flete × cantidad)
3. **Utilidades** → Recibe la **ganancia neta** (venta - compra - flete) × cantidad

### Fórmulas Matemáticas

```typescript
// Distribución GYA
montoBovedaMonte = precioCompra × cantidad
montoFletes = precioFlete × cantidad
montoUtilidades = (precioVenta - precioCompra - precioFlete) × cantidad
precioTotalVenta = precioVenta × cantidad  // ✅ SIN SUMAR FLETE EXTRA

// Verificación: siempre debe cumplirse
montoBovedaMonte + montoFletes + montoUtilidades === precioTotalVenta
```

### Ejemplo Numérico

```
Datos de entrada:
- Precio venta: $10,000/u
- Precio compra: $6,300/u
- Flete: $500/u (costo INTERNO)
- Cantidad: 10 unidades

Cálculos:
- Precio total venta: 10,000 × 10 = $100,000 (lo que PAGA el cliente)
- Bóveda Monte: 6,300 × 10 = $63,000
- Fletes: 500 × 10 = $5,000
- Utilidades: (10,000 - 6,300 - 500) × 10 = $32,000

Verificación: $63,000 + $5,000 + $32,000 = $100,000 ✅
```

### Reglas Inmutables

1. **Histórico Inmutable**: Los montos en histórico siempre son 100%, independiente del pago
2. **Capital Proporcional**:
   - Completo: Capital = 100% del histórico
   - Parcial: Capital = (montoPagado / precioTotalVenta) × histórico
   - Pendiente: Capital = $0
3. **Prohibiciones**:
   - Nunca restar del histórico
   - Nunca distribuir a otros bancos desde ventas
   - Nunca alterar la fórmula base

---

## 🛒 FLUJO: ORDEN DE COMPRA

### Archivo: `app/_actions/flujos-completos.ts` → `crearOrdenCompraCompleta`

### Proceso Paso a Paso

```
1. CREAR/OBTENER DISTRIBUIDOR
   - Si distribuidorId → usar existente
   - Si distribuidorNombre → crear nuevo

2. CREAR/OBTENER PRODUCTO
   - Si productoId → usar existente
   - Si productoNombre → crear nuevo en almacén

3. CALCULAR TOTALES
   subtotal = precioUnitario × cantidad
   fleteTotal = fleteUnitario × cantidad
   ivaAmount = subtotal × (iva / 100)
   total = subtotal + fleteTotal + ivaAmount

4. CREAR ORDEN DE COMPRA
   - Estado: "completo" | "parcial" | "pendiente"

5. ACTUALIZAR STOCK
   - almacen.stockActual += cantidad

6. REGISTRAR ENTRADA (trazabilidad)

7. ACTUALIZAR DISTRIBUIDOR
   - saldoPendiente += montoRestante
   - totalOrdenesCompra += total

8. SI HAY PAGO INICIAL
   - Reducir capital del banco origen
   - Registrar movimiento

9. REVALIDAR RUTAS
```

---

## 💰 FLUJO: VENTA COMPLETA

### Archivo: `app/_actions/flujos-completos.ts` → `crearVentaCompleta`

### Proceso Paso a Paso

```
1. VERIFICAR STOCK DISPONIBLE
   - Si stockActual < cantidad → ERROR

2. CREAR/OBTENER CLIENTE
   - Si clienteId → usar existente
   - Si clienteNombre → crear nuevo

3. CALCULAR DISTRIBUCIÓN GYA
   - Usar calcularDistribucionGYA()

4. CREAR VENTA
   - Guardar montos GYA (100%)
   - Estado de pago según abono

5. ACTUALIZAR CLIENTE
   - saldoPendiente += montoRestante
   - totalCompras += precioTotalVenta

6. REDUCIR STOCK
   - almacen.stockActual -= cantidad

7. REGISTRAR SALIDA (trazabilidad)

8. SI HAY ABONO:
   A) BÓVEDA MONTE
      - capitalActual += capitalBovedaMonte
      - historicoIngresos += montoBovedaMonte (100%)

   B) FLETES
      - capitalActual += capitalFletes
      - historicoIngresos += montoFletes (100%)

   C) UTILIDADES
      - capitalActual += capitalUtilidades
      - historicoIngresos += montoUtilidades (100%)

9. REVALIDAR RUTAS
```

---

## 💳 FLUJO: ABONO A VENTA

### Archivo: `app/_actions/flujos-completos.ts` → `abonarVentaCompleta`

```
1. VALIDAR
   - Venta existe y no está "completo"
   - monto <= montoRestante

2. CALCULAR PROPORCIÓN DEL ABONO
   proporcionAbono = monto / precioTotalVenta

3. CALCULAR INCREMENTO DE CAPITAL
   incrementoBovedaMonte = montoBovedaMonte × proporcionAbono
   incrementoFletes = montoFletes × proporcionAbono
   incrementoUtilidades = montoUtilidades × proporcionAbono

4. ACTUALIZAR VENTA
   - montoPagado += monto
   - montoRestante -= monto
   - estadoPago = (montoRestante == 0 ? "completo" : "parcial")

5. ACTUALIZAR CLIENTE
   - saldoPendiente -= monto
   - totalAbonos += monto

6. DISTRIBUIR INCREMENTO A 3 BANCOS
   - Mismo proceso que venta inicial

7. REGISTRAR ABONO (trazabilidad)
```

---

## 🏦 7 BANCOS DEL SISTEMA

| ID             | Nombre       | Propósito                 |
| -------------- | ------------ | ------------------------- |
| `boveda_monte` | Bóveda Monte | Recibe COSTO de ventas    |
| `boveda_usa`   | Bóveda USA   | Capital USD               |
| `flete_sur`    | Fletes       | Recibe FLETES de ventas   |
| `utilidades`   | Utilidades   | Recibe GANANCIA de ventas |
| `azteca`       | Azteca       | Banco operativo           |
| `leftie`       | Leftie       | Banco operativo           |
| `profit`       | Profit       | Banco operativo           |

**Importante**: Solo `boveda_monte`, `flete_sur` y `utilidades` reciben distribución automática de
ventas. Los otros 4 son operativos y se alimentan manualmente o por transferencias.

---

## 📊 FÓRMULAS DE CAPITAL

```typescript
// Capital bancario (dinámico)
capitalActual = historicoIngresos - historicoGastos

// historicoIngresos y historicoGastos son acumulativos fijos, NUNCA disminuyen

// Proporción de pago
proporcion = montoPagado / precioTotalVenta

// Capital disponible por banco (cuando hay pago parcial)
capitalDisponible = montoHistorico × proporcion
```

---

## 🔐 REGLAS DE SEGURIDAD

1. **Transacciones Atómicas**: Todo flujo usa `db.transaction()` para garantizar consistencia
2. **Validación Zod**: Todos los inputs se validan antes de procesar
3. **Queries Parametrizadas**: Drizzle ORM previene SQL injection
4. **Revalidación Automática**: `revalidatePath()` actualiza UI automáticamente

---

## 📁 ARCHIVOS CRÍTICOS

```
app/_actions/
├── flujos-completos.ts  → Ventas, OC, Abonos (CRÍTICO)
├── bancos.ts            → Operaciones bancarias (CRÍTICO)
├── triggers.ts          → Automatizaciones
├── alertas.ts           → Sistema de alertas
└── index.ts             → Exports centralizados

app/_lib/utils/
├── gya-calculo.ts       → Fórmulas GYA (SAGRADO)
└── logger.ts            → Sistema de logging

database/
├── schema.ts            → Definición de tablas
└── index.ts             → Cliente Drizzle + Turso
```
