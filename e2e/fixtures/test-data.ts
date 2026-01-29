/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎭 CHRONOS 2026 — FIXTURES DE DATOS PARA E2E TESTS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Datos de prueba centralizados para todos los tests E2E.
 * Basados en la lógica de negocio real del sistema.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Tipos locales para tests E2E (evita dependencias de @/app/types)
type BancoId =
  | "boveda_monte"
  | "boveda_usa"
  | "profit"
  | "leftie"
  | "azteca"
  | "flete_sur"
  | "utilidades"
type MetodoPago = "efectivo" | "tarjeta" | "transferencia" | "credito"

/**
 * Datos de venta al contado - Caso 1 del documento
 * Precio compra $5,000, precio venta $8,000, flete $200
 * 3 relojes
 */
export const VENTA_CONTADO_CASO_1 = {
  cantidad: 3,
  precioVenta: 8000,
  precioCompra: 5000,
  precioFlete: 200,
  metodoPago: "efectivo" as MetodoPago,
  estadoPago: "completo" as const,
  // Distribución esperada
  distribucionEsperada: {
    bovedaMonte: 15000, // 5,000 × 3
    fletes: 600, // 200 × 3
    utilidades: 8400, // (8,000 - 5,000 - 200) × 3
    total: 24000, // Suma total (cantidad × (precioVenta + flete))
  },
}

/**
 * Datos de venta a crédito - Caso 2
 * 2 relojes, $12,000 c/u, enganche $5,000
 */
export const VENTA_CREDITO_CASO_2 = {
  cantidad: 2,
  precioVenta: 12000,
  precioCompra: 7000,
  precioFlete: 500,
  metodoPago: "credito" as MetodoPago,
  estadoPago: "parcial" as const,
  montoPagado: 5000,
  // Cálculos esperados
  totalVenta: 24000, // 12,000 × 2 (sin flete en este cálculo)
  deudaInicial: 19000, // 24,000 - 5,000
  // Abonos a registrar
  abonos: [
    { monto: 10000, fecha: new Date() },
    { monto: 9000, fecha: new Date() },
  ],
}

/**
 * Caso matemático GYA completo - Caso 8
 * 15 relojes: compra $7,000, venta $12,000, flete $800
 */
export const VENTA_GYA_COMPLETO = {
  cantidad: 15,
  precioVenta: 12000,
  precioCompra: 7000,
  precioFlete: 800,
  metodoPago: "efectivo" as MetodoPago,
  estadoPago: "completo" as const,
  // Distribución esperada (verificación crítica)
  distribucionEsperada: {
    bovedaMonte: 105000, // 7,000 × 15
    fletes: 12000, // 800 × 15
    utilidades: 63000, // (12,000 - 7,000 - 800) × 15
    total: 180000, // Debe sumar exactamente
  },
}

/**
 * Datos de cliente de prueba
 */
export const CLIENTE_TEST = {
  nombre: `Cliente E2E ${Date.now()}`,
  telefono: "5551234567",
  email: "test-e2e@chronos.com",
  direccion: "Av. Test #123, CDMX",
}

/**
 * Datos de distribuidor de prueba
 */
export const DISTRIBUIDOR_TEST = {
  nombre: `Distribuidor E2E ${Date.now()}`,
  empresa: "Empresa Test SA de CV",
  telefono: "5559876543",
  email: "distribuidor@test.com",
}

/**
 * Datos de orden de compra
 */
export const ORDEN_COMPRA_TEST = {
  cantidad: 20,
  costoDistribuidor: 5000,
  costoTransporte: 300,
  pagoInicial: 0,
  // Cálculos esperados
  costoPorUnidad: 5300, // 5,000 + 300
  costoTotal: 106000, // 5,300 × 20
  deuda: 106000, // 106,000 - 0
}

/**
 * Datos de transferencia entre bancos
 */
export const TRANSFERENCIA_TEST = {
  bancoOrigen: "utilidades" as BancoId,
  bancoDestino: "boveda_monte" as BancoId,
  monto: 50000,
  concepto: "Transferencia E2E Test",
}

/**
 * Datos de inventario
 */
export const INVENTARIO_TEST = {
  entradaUnidades: 10,
  salidaUnidades: 3,
  productoNombre: "Producto Test E2E",
}

/**
 * Selectores comunes del sistema - CHRONOS Gen5 Complete Panels
 */
export const SELECTORES = {
  // Navegación (sidebar y tabs)
  navVentas:
    '[href="/ventas"], button:has-text("Ventas"), a:has-text("Ventas"), [data-panel="ventas"]',
  navClientes:
    '[href="/clientes"], button:has-text("Clientes"), a:has-text("Clientes"), [data-panel="clientes"]',
  navBancos:
    '[href="/bancos"], button:has-text("Bancos"), a:has-text("Bancos"), [data-panel="bancos"]',
  navInventario:
    '[href="/almacen"], button:has-text("Almacén"), a:has-text("Almacén"), [data-panel="almacen"]',
  navOrdenes:
    '[href="/ordenes"], button:has-text("Órdenes"), a:has-text("Órdenes"), [data-panel="ordenes"]',
  navDistribuidores:
    '[href="/distribuidores"], button:has-text("Distribuidores"), a:has-text("Distribuidores"]',
  navGastos:
    '[href="/gastos"], button:has-text("Gastos"), a:has-text("Gastos"), [data-panel="gastos"]',
  navMovimientos:
    '[href="/movimientos"], button:has-text("Movimientos"), a:has-text("Movimientos")]',

  // Modales Glass Gen5
  modal: '[role="dialog"], [class*="FormModal"], [class*="glass"]',
  modalClose:
    '[role="dialog"] button:has-text("×"), [role="dialog"] button:has-text("Cerrar"), [aria-label="Close"], button:has-text("Cancelar")',

  // Botones comunes - Glass Gen5 Complete Panels
  btnNuevaVenta:
    'button:has-text("Nueva Venta"), button:has-text("Crear Venta"), button:has-text("Registrar Venta")',
  btnNuevoCliente:
    'button:has-text("Nuevo Cliente"), button:has-text("Crear Cliente"), button:has-text("Agregar Cliente")',
  btnNuevaOrden:
    'button:has-text("Nueva Orden"), button:has-text("Crear Orden"), button:has-text("Nueva OC")',
  btnNuevoDistribuidor:
    'button:has-text("Nuevo Distribuidor"), button:has-text("Agregar Distribuidor")',
  btnNuevoGasto: 'button:has-text("Nuevo Gasto"), button:has-text("Registrar Gasto")',
  btnTransferencia:
    'button:has-text("Transferencia"), button:has-text("Transferir"), button:has-text("Nueva Transferencia")',
  btnGuardar:
    'button:has-text("Guardar"), button:has-text("Crear"), button:has-text("Registrar"), button[type="submit"]',
  btnSiguiente: 'button:has-text("Siguiente"), button:has-text("Continuar")',
  btnConfirmar: 'button:has-text("Confirmar"), button:has-text("Aceptar"), button:has-text("Sí")',
  btnAbono:
    'button:has-text("Abono"), button:has-text("Registrar Abono"), button:has-text("Nuevo Abono")',
  btnExportar: 'button:has-text("Exportar"), button:has-text("Descargar")',
  btnRefresh: 'button:has-text("Actualizar"), button[aria-label="Refresh"]',

  // Tablas Glass Gen5 (PremiumDataTable)
  tabla:
    'table, [role="grid"], div[class*="PremiumDataTable"], div[class*="DataTable"], [data-testid*="table"]',
  fila: 'tr, [role="row"], [class*="TableRow"]',
  celda: 'td, [role="cell"], [class*="TableCell"]',

  // Tabs Glass Gen5 (GlassTabs)
  tabs: '[role="tablist"], [class*="GlassTabs"]',
  tab: '[role="tab"], button[class*="tab"]',
  tabPanel: '[role="tabpanel"]',

  // Inputs Glass Gen5
  inputText: 'input[type="text"], [class*="GlassInput"]',
  inputNumber: 'input[type="number"], [class*="GlassInput"]',
  select: 'select, [class*="GlassSelect"]',
  textarea: 'textarea, [class*="GlassTextarea"]',

  // KPIs y métricas - Solo divs visibles, no SVGs
  kpiCard: 'div[class*="KPI"], div[class*="metric"], div[class*="GlassCard"], div[class*="card"]',
  capital: '[class*="capital"], [class*="saldo"], [class*="monto"]',

  // Charts
  chart: '[class*="Chart"], [class*="chart"], canvas, svg[class*="recharts"]',

  // Toast y notificaciones (Sonner)
  toast: '[data-sonner-toast], [class*="toast"], [role="alert"]',

  // Búsqueda - Solo inputs, no SVGs
  searchInput: 'input[type="search"], input[placeholder*="Buscar"], input[class*="search"]',

  // Distribución GYA
  gyaSection: '[class*="GYA"], [class*="distribucion"], [class*="Distribution"]',
  bovedaMonte: "text=/Bóveda Monte|COSTO/i",
  fleteSur: "text=/Flete|TRANSPORTE/i",
  utilidades: "text=/Utilidades|GANANCIA/i",
}

/**
 * Timeouts comunes
 */
export const TIMEOUTS = {
  corto: 2000,
  medio: 5000,
  largo: 10000,
  red: 15000,
}

/**
 * URLs del sistema
 */
export const URLS = {
  home: "/",
  ventas: "/ventas",
  clientes: "/clientes",
  bancos: "/bancos",
  inventario: "/inventario",
  ordenes: "/ordenes",
}

/**
 * Mensajes de éxito esperados
 */
export const MENSAJES_EXITO = {
  ventaCreada: /venta creada|éxito|success|guardad[oa]/i,
  clienteCreado: /cliente creado|registrado|guardado/i,
  ordenCreada: /orden creada|registrada/i,
  transferenciaExitosa: /transferencia exitosa|completada/i,
  abonoRegistrado: /abono registrado|pago aplicado/i,
}

/**
 * Bancos del sistema
 */
export const BANCOS = {
  BOVEDA_MONTE: "boveda_monte" as BancoId,
  BOVEDA_USA: "boveda_usa" as BancoId,
  PROFIT: "profit" as BancoId,
  LEFTIE: "leftie" as BancoId,
  AZTECA: "azteca" as BancoId,
  FLETE_SUR: "flete_sur" as BancoId,
  UTILIDADES: "utilidades" as BancoId,
}

/**
 * Nombres de bancos para búsqueda en UI
 */
export const BANCOS_NOMBRES = {
  [BANCOS.BOVEDA_MONTE]: /bóveda monte|monte/i,
  [BANCOS.BOVEDA_USA]: /bóveda usa|usa/i,
  [BANCOS.PROFIT]: /profit/i,
  [BANCOS.LEFTIE]: /leftie/i,
  [BANCOS.AZTECA]: /azteca/i,
  [BANCOS.FLETE_SUR]: /flete|flete sur/i,
  [BANCOS.UTILIDADES]: /utilidades|ganancia/i,
}
