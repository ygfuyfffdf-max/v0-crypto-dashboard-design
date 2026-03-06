const BASE = ""

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText)
    throw new Error(`API ${res.status}: ${err}`)
  }
  return res.json()
}

export const api = {
  // Bancos
  getBancos: () => fetchJson<any[]>("/api/bancos"),
  updateBanco: (data: any) => fetchJson<any>("/api/bancos", { method: "PUT", body: JSON.stringify(data) }),

  // Distribuidores
  getDistribuidores: () => fetchJson<any[]>("/api/distribuidores"),
  createDistribuidor: (data: any) => fetchJson<any>("/api/distribuidores", { method: "POST", body: JSON.stringify(data) }),
  updateDistribuidor: (data: any) => fetchJson<any>("/api/distribuidores", { method: "PUT", body: JSON.stringify(data) }),

  // Clientes
  getClientes: () => fetchJson<any[]>("/api/clientes"),
  createCliente: (data: any) => fetchJson<any>("/api/clientes", { method: "POST", body: JSON.stringify(data) }),
  updateCliente: (data: any) => fetchJson<any>("/api/clientes", { method: "PUT", body: JSON.stringify(data) }),

  // Ordenes de compra
  getOrdenesCompra: () => fetchJson<any[]>("/api/ordenes-compra"),
  createOrdenCompra: (data: any) => fetchJson<any>("/api/ordenes-compra", { method: "POST", body: JSON.stringify(data) }),

  // Ventas
  getVentas: () => fetchJson<any[]>("/api/ventas"),
  createVenta: (data: any) => fetchJson<any>("/api/ventas", { method: "POST", body: JSON.stringify(data) }),

  // Productos
  getProductos: () => fetchJson<any[]>("/api/productos"),
  createProducto: (data: any) => fetchJson<any>("/api/productos", { method: "POST", body: JSON.stringify(data) }),
  updateProducto: (id: string, data: any) => fetchJson<any>("/api/productos", { method: "PUT", body: JSON.stringify({ id, ...data }) }),

  // Gastos
  getGastos: () => fetchJson<any[]>("/api/gastos"),
  createGasto: (data: any) => fetchJson<any>("/api/gastos", { method: "POST", body: JSON.stringify(data) }),

  // Ingresos
  getIngresos: () => fetchJson<any[]>("/api/ingresos"),
  createIngreso: (data: any) => fetchJson<any>("/api/ingresos", { method: "POST", body: JSON.stringify(data) }),

  // Transferencias
  getTransferencias: () => fetchJson<any[]>("/api/transferencias"),
  createTransferencia: (data: any) => fetchJson<any>("/api/transferencias", { method: "POST", body: JSON.stringify(data) }),

  // Abonos
  createAbono: (data: any) => fetchJson<any>("/api/abonos", { method: "POST", body: JSON.stringify(data) }),
}
