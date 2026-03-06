export interface Banco {
  id: string
  nombre: string
  icon: string
  color: string
  tipo: "operativo" | "inversion" | "externo"
  descripcion: string
  // Capital dinámico
  capitalActual: number
  // Históricos fijos (acumulativos)
  historicoIngresos: number
  historicoGastos: number
  historicoTransferencias: number
  estado: "activo" | "negativo"
  operaciones?: Operacion[]
  createdAt: any
  updatedAt: any
}

export interface OrdenCompra {
  id: string
  fecha: string
  origen: string
  distribuidor: string
  producto: string
  cantidad: number
  costoDistribuidor: number // Precio al que compramos
  costoTransporte: number
  costoPorUnidad: number // costoDistribuidor + costoTransporte
  costoTotal: number // costoPorUnidad × cantidad
  pagoDistribuidor: number // Monto pagado al distribuidor
  deuda: number // costoTotal - pagoDistribuidor
  estado: "pendiente" | "parcial" | "pagado"
  bancoOrigen?: string // Banco desde el que se pagó (si aplica)
  createdAt: any
  updatedAt: any
}

export interface Venta {
  id: string
  fecha: string
  cliente: string
  producto: string
  cantidad: number
  precioVentaUnidad: number // Precio al que vendemos
  precioCompraUnidad: number // Costo unitario del producto
  precioFlete: number // Flete por unidad (default 500)
  precioTotalUnidad: number // precioVentaUnidad + precioFlete
  precioTotalVenta: number // precioTotalUnidad × cantidad
  // Distribución en 3 bancos
  distribucionBancos: {
    bovedaMonte: number // precioCompraUnidad × cantidad
    fletes: number // precioFlete × cantidad
    utilidades: number // (precioVentaUnidad - precioCompraUnidad - precioFlete) × cantidad
  }
  montoPagado: number
  montoRestante: number
  estadoPago: "completo" | "parcial" | "pendiente"
  createdAt: any
  updatedAt: any
}

export interface Distribuidor {
  id: string
  nombre: string
  deudaTotal: number
  totalOrdenesCompra: number
  totalPagado: number
  ordenesCompra: string[] // IDs de órdenes de compra
  historialPagos: HistorialPago[]
  createdAt: any
  updatedAt: any
}

export interface Cliente {
  id: string
  nombre: string
  deudaTotal: number
  totalVentas: number
  totalPagado: number
  ventas: string[] // IDs de ventas
  historialPagos: HistorialPago[]
  createdAt: any
  updatedAt: any
}

export interface HistorialPago {
  fecha: any
  monto: number
  bancoOrigen?: string
  ordenCompraId?: string
  ventaId?: string
}

export interface Producto {
  id: string
  nombre: string
  origen: string
  stockActual: number // Dinámico: totalEntradas - totalSalidas
  totalEntradas: number // Acumulativo fijo
  totalSalidas: number // Acumulativo fijo
  valorUnitario: number
  entradas: MovimientoAlmacen[]
  salidas: MovimientoAlmacen[]
  createdAt: any
  updatedAt: any
}

export interface MovimientoAlmacen {
  id: string
  tipo: "entrada" | "salida"
  fecha: any
  cantidad: number
  origen?: string // Distribuidor (para entradas)
  destino?: string // Cliente (para salidas)
}

export interface Operacion {
  id: string
  tipo: "ingreso" | "gasto" | "transferencia_entrada" | "transferencia_salida"
  fecha: any
  monto: number
  concepto: string
  referencia?: string
  bancoRelacionado?: string
}

export interface IngresosBanco {
  id: string
  tipo: string
  fecha: string
  monto: number
  origen: string
  concepto: string
  bancoId: string
  referencia?: string
  createdAt: any
}

export interface GastosBanco {
  id: string
  tipo: string
  fecha: string
  monto: number
  destino: string
  concepto: string
  bancoId: string
  referencia?: string
  createdAt: any
}

export interface Transferencia {
  id: string
  fecha: string
  tipo: "entrada" | "salida"
  monto: number
  bancoOrigen: string
  bancoDestino: string
  concepto: string
  referencia?: string
  estado: string
  createdAt: any
}

export interface CorteBanco {
  id: string
  bancoId: string
  periodo: "diario" | "semanal" | "mensual" | "trimestral" | "anual"
  fechaInicio: string
  fechaFin: string
  capitalInicial: number
  totalIngresosPeriodo: number
  totalGastosPeriodo: number
  capitalFinal: number
  diferencia: number
  variacionPorcentaje: number
  estado: "positivo" | "negativo" | "neutro"
  createdAt: any
}
                    <div className="space-y-2">
                      <label className="text-sm text-white/60">Producto</label>
                      <input
                        type="text"
                        value={formData.producto}
                        onChange={(e) => setFormData({ ...formData, producto: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-white/60">Cantidad</label>
                      <input
                        type="number"
                        value={formData.cantidad}
                        onChange={(e) => setFormData({ ...formData, cantidad: Number(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-bold">Costos y Pagos</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-white/60">Costo Distribuidor (Unitario)</label>
                      <input
                        type="number"
                        value={formData.costoDistribuidor}
                        onChange={(e) => setFormData({ ...formData, costoDistribuidor: Number(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-white/60">Costo Transporte (Unitario)</label>
                      <input
                        type="number"
                        value={formData.costoTransporte}
                        onChange={(e) => setFormData({ ...formData, costoTransporte: Number(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-white/60">Pago Inicial</label>
                      <input
                        type="number"
                        value={formData.pagoInicial}
                        onChange={(e) => setFormData({ ...formData, pagoInicial: Number(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                        placeholder="0 para crédito total"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-white/60">Banco para Pago</label>
                      <select
                        value={formData.bancoOrigen}
                        onChange={(e) => setFormData({ ...formData, bancoOrigen: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                      >
                        {bancos.map((banco) => (
                          <option key={banco.id} value={banco.id}>
                            {banco.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Costo Total:</span>
                        <span className="ml-2 font-bold">
                          $
                          {(
                            (formData.costoDistribuidor + formData.costoTransporte) *
                            formData.cantidad
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/60">Deuda Generada:</span>
                        <span className="ml-2 font-bold text-orange-400">
                          $
                          {(
                            (formData.costoDistribuidor + formData.costoTransporte) * formData.cantidad -
                            formData.pagoInicial
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-bold">Confirmar Orden</h3>
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Distribuidor</span>
                      <span className="font-bold">{formData.distribuidor}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Producto</span>
                      <span className="font-bold">
                        {formData.producto} x {formData.cantidad}
                      </span>
                    </div>
                    <div className="h-px bg-white/10 my-4" />
                    <div className="flex justify-between items-center text-xl font-bold text-blue-400">
                      <span>Total Estimado</span>
                      <span>
                        $
                        {((formData.costoDistribuidor + formData.costoTransporte) * formData.cantidad).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="h-20 border-t border-white/10 bg-white/5 px-8 flex items-center justify-between">
          <button
            onClick={step === 1 ? onClose : prevStep}
            className="px-6 py-2 rounded-xl text-white/60 hover:text-white transition-colors"
          >
            {step === 1 ? "Cancelar" : "Atrás"}
          </button>

          <button
            onClick={step === 4 ? handleSubmit : nextStep}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? "Procesando..." : step === 4 ? "Confirmar Orden" : "Siguiente"}
            {!loading && step !== 4 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateOrdenCompraModal
                      <td className="px-6 py-4 text-white/80">${item.valorUnitario || item.precio.toLocaleString()}</td>
                      <td className="px-6 py-4 text-white/80">
                        ${(item.stock || item.stockActual) * (item.valorUnitario || item.precio).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            (item.stock || item.stockActual) < 20
                              ? "bg-red-500/20 text-red-400"
                              : (item.stock || item.stockActual) < 50
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {(item.stock || item.stockActual) < 20
                            ? "Bajo"
                            : (item.stock || item.stockActual) < 50
                              ? "Medio"
                              : "Alto"}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === "modificaciones" && <ModificacionesTable />}
      </motion.div>

      {showEntradaModal && (
        <CreateEntradaAlmacenModal isOpen={showEntradaModal} onClose={() => setShowEntradaModal(false)} />
      )}

      {showSalidaModal && (
        <CreateSalidaAlmacenModal isOpen={showSalidaModal} onClose={() => setShowSalidaModal(false)} />
      )}
    </div>
  )
}

function KPI_Card({ title, value, subValue, icon: Icon, color, delay, highlight = false }: any) {
  const colors = {
    green: "from-emerald-500 to-teal-600 text-emerald-400 bg-emerald-500/10",
    red: "from-rose-500 to-pink-600 text-rose-400 bg-rose-500/10",
    blue: "from-blue-500 to-cyan-600 text-cyan-400 bg-cyan-500/10",
    purple: "from-violet-500 to-purple-600 text-purple-400 bg-purple-500/10",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`relative p-6 rounded-3xl border border-white/5 overflow-hidden group ${highlight ? "bg-white/[0.03]" : "glass"}`}
    >
      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-50" />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/50 text-sm font-medium uppercase tracking-wider">{title}</span>
          <div className={`p-2.5 rounded-xl ${colors[color].split(" ").slice(2).join(" ")}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className={`h-1 flex-1 rounded-full bg-white/10 overflow-hidden`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "60%" }}
              transition={{ delay: delay + 0.5, duration: 1 }}
              className={`h-full bg-gradient-to-r ${colors[color].split(" ").slice(0, 2).join(" ")}`}
            />
          </div>
          <p className={`text-xs font-medium ${colors[color].split(" ")[2]}`}>{subValue}</p>
        </div>
      </div>
    </motion.div>
  )
}

function ModificacionesTable() {
  return (
    <div className="crystal-card p-1 relative overflow-hidden group">
      <div className="flex items-center justify-between p-6 relative z-10">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Modificaciones Manuales</h3>
          <p className="text-white/40 text-sm mt-1">Registro de ajustes de inventario</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-premium bg-purple-500 hover:bg-purple-400 text-white border-none flex items-center gap-2 shadow-lg shadow-purple-900/20"
        >
          <Edit className="w-4 h-4" />
          Nuevo Ajuste
        </motion.button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="text-left py-4 px-6 text-white/40 text-xs font-semibold uppercase tracking-wider">
                Fecha
              </th>
              <th className="text-left py-4 px-6 text-white/40 text-xs font-semibold uppercase tracking-wider">Tipo</th>
              <th className="text-right py-4 px-6 text-white/40 text-xs font-semibold uppercase tracking-wider">
                Cantidad
              </th>
              <th className="text-left py-4 px-6 text-white/40 text-xs font-semibold uppercase tracking-wider">
                Motivo
              </th>
              <th className="text-left py-4 px-6 text-white/40 text-xs font-semibold uppercase tracking-wider">
                Usuario
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">{/* Placeholder for actual data */}</tbody>
        </table>
      </div>
    </div>
  )
}
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const q = query(collection(db, "gastos_y_abonos"), orderBy("fecha", "desc"))

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const gya = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setData(gya)
          setLoading(false)
          setError(null) // Clear error on success
        },
        (err) => {
          console.warn("[v0] Firebase error in gastos y abonos, using mock data:", err.message)
          setData(MOCK_GASTOS.map((g) => ({ ...g, tipo: "gasto" })))
          setLoading(false)
          setError(null)
        },
      )

      return () => unsubscribe()
    } catch (err: any) {
      console.warn("[v0] Error subscribing to gastos y abonos, using mock data:", err)
      setData(MOCK_GASTOS.map((g) => ({ ...g, tipo: "gasto" })))
      setLoading(false)
      setError(null)
    }
  }, [])

  return { data, loading, error }
}

// ===================================================================
// HOOKS DE BANCO INDIVIDUALES (IMPLEMENTACIÓN FALTANTE)
// ===================================================================

export function useIngresosBanco(bancoId: string): FirestoreHookResult<any> {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bancoId) {
      setLoading(false)
      return
    }
    try {
      const q = query(collection(db, `${bancoId}_ingresos`), orderBy("fecha", "desc"))
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          setData(items)
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.warn(`[v0] Firebase error in ingresos ${bancoId}, using mock data:`, err.message)
          setData(MOCK_INGRESOS.filter((i) => i.bancoId === bancoId || !i.bancoId))
          setLoading(false)
          setError(null)
        },
      )
      return () => unsubscribe()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }, [bancoId])

  return { data, loading, error }
}

export function useGastos(bancoId: string): FirestoreHookResult<any> {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bancoId) {
      setLoading(false)
      return
    }
    try {
      const q = query(collection(db, `${bancoId}_gastos`), orderBy("fecha", "desc"))
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          setData(items)
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.warn(`[v0] Firebase error in gastos ${bancoId}, using mock data:`, err.message)
          setData(MOCK_GASTOS.filter((i) => i.bancoId === bancoId || !i.bancoId))
          setLoading(false)
          setError(null)
        },
      )
      return () => unsubscribe()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }, [bancoId])

  return { data, loading, error }
}

export function useTransferencias(bancoId: string): FirestoreHookResult<any> {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bancoId) {
      setLoading(false)
      return
    }
    try {
      const q = query(collection(db, `${bancoId}_transferencias`), orderBy("fecha", "desc"))
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          setData(items)
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.warn(`[v0] Firebase error in transferencias ${bancoId}, using mock data:`, err.message)
          setData(MOCK_TRANSFERENCIAS)
          setLoading(false)
          setError(null)
        },
      )
      return () => unsubscribe()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }, [bancoId])

  return { data, loading, error }
}

export function useCorteBancario(bancoId: string): FirestoreHookResult<any> {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bancoId) {
      setLoading(false)
      return
    }
    try {
      const q = query(collection(db, `${bancoId}_cortes`), orderBy("fechaInicio", "desc"))
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          setData(items)
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.warn(`[v0] Firebase error in cortes ${bancoId}, using mock data:`, err.message)
          setData(MOCK_CORTES)
          setLoading(false)
          setError(null)
        },
      )
      return () => unsubscribe()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }, [bancoId])

  return { data, loading, error }
}

// ===================================================================
// NEW HOOKS: useEntradasAlmacen and useSalidasAlmacen
// ===================================================================

export function useEntradasAlmacen(): FirestoreHookResult<any> {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const q = query(collection(db, "almacen_entradas"), orderBy("fecha", "desc"))

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const entradas = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setData(entradas)
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.warn("[v0] Firebase error in entradas almacen, using mock data:", err.message)
          setData(MOCK_ENTRADAS)
          setLoading(false)
          setError(null)
        },
      )

      return () => unsubscribe()
    } catch (err: any) {
      console.error("[v0] Catch error in useEntradasAlmacen:", err)
      setData(MOCK_ENTRADAS)
      setLoading(false)
      setError(null)
    }
  }, [])

  return { data, loading, error }
}

export function useSalidasAlmacen(): FirestoreHookResult<any> {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const q = query(collection(db, "almacen_salidas"), orderBy("fecha", "desc"))

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const salidas = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setData(salidas)
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.warn("[v0] Firebase error in salidas almacen, using mock data:", err.message)
          setData(MOCK_SALIDAS)
          setLoading(false)
          setError(null)
        },
      )

      return () => unsubscribe()
    } catch (err: any) {
      console.error("[v0] Catch error in useSalidasAlmacen:", err)
      setData(MOCK_SALIDAS)
      setLoading(false)
      setError(null)
    }
  }, [])

  return { data, loading, error }
}

// ===================================================================
// EXPORT ALIASES
// ===================================================================

export const useVentas = useVentasData
export const useOrdenesCompra = useOrdenesCompraData
export const useProductos = useAlmacenData
export const useClientes = useClientesData
export const useDistribuidores = useDistribuidoresData

// ===================================================================
// MOCK DATA CONSTANTS
// ===================================================================

const MOCK_CLIENTES = [
  { id: "C-001", nombre: "Cliente VIP 1", email: "vip1@example.com", telefono: "555-0001", saldo: 0 },
  { id: "C-002", nombre: "Cliente Regular 2", email: "reg2@example.com", telefono: "555-0002", saldo: 1500 },
]

const MOCK_INGRESOS = [
  {
    id: "I-001",
    fecha: new Date().toISOString(),
    monto: 5000,
    concepto: "Venta del día",
    origen: "Ventas",
    referencia: "REF-123",
    bancoId: "banco_1",
  },
  {
    id: "I-002",
    fecha: new Date(Date.now() - 86400000).toISOString(),
    monto: 12000,
    concepto: "Abono Cliente",
    origen: "Cliente VIP 1",
    referencia: "REF-124",
    bancoId: "banco_1",
  },
]

const MOCK_GASTOS = [
  {
    id: "G-001",
    fecha: new Date().toISOString(),
    monto: 2000,
    concepto: "Pago de Luz",
    categoria: "Servicios",
    bancoId: "banco_1",
  },
  {
    id: "G-002",
    fecha: new Date(Date.now() - 86400000).toISOString(),
    monto: 5000,
    concepto: "Compra Material",
    categoria: "Inventario",
    bancoId: "banco_1",
  },
]

const MOCK_TRANSFERENCIAS = [
  {
    id: "T-001",
    fecha: new Date().toISOString(),
    monto: 1000,
    origen: "Banco A",
    destino: "Banco B",
    referencia: "TR-001",
  },
]

const MOCK_CORTES = [
  {
    id: "CT-001",
    periodo: "Marzo 2024",
    fechaInicio: new Date(Date.now() - 2592000000).toISOString(),
    fechaFin: new Date().toISOString(),
    capitalInicial: 50000,
    capitalFinal: 65000,
    diferencia: 0,
  },
]

const MOCK_DISTRIBUIDORES = [
  {
    id: "1",
    nombre: "Distribuidor Alpha",
    totalOrdenesCompra: 150000,
    deudaTotal: 50000,
    totalPagado: 100000,
    ordenesCompra: ["oc1", "oc2"],
  },
  {
    id: "2",
    nombre: "Distribuidor Beta",
    totalOrdenesCompra: 80000,
    deudaTotal: 0,
    totalPagado: 80000,
    ordenesCompra: ["oc3"],
  },
  {
    id: "3",
    nombre: "Distribuidor Gamma",
    totalOrdenesCompra: 200000,
    deudaTotal: 150000,
    totalPagado: 50000,
    ordenesCompra: ["oc4", "oc5", "oc6"],
  },
]

const MOCK_ORDENES_COMPRA = [
  {
    id: "OC-001",
    fecha: "2024-03-20",
    distribuidor: "Distribuidor Alpha",
    cantidad: 100,
    costoTotal: 50000,
    deuda: 20000,
    pagoDistribuidor: 30000,
    estado: "pendiente",
  },
  {
    id: "OC-002",
    fecha: "2024-03-18",
    distribuidor: "Distribuidor Beta",
    cantidad: 50,
    costoTotal: 25000,
    deuda: 0,
    pagoDistribuidor: 25000,
    estado: "pagado",
  },
  {
    id: "OC-003",
    fecha: "2024-03-15",
    distribuidor: "Distribuidor Gamma",
    cantidad: 200,
    costoTotal: 100000,
    deuda: 100000,
    pagoDistribuidor: 0,
    estado: "pendiente",
  },
]

const MOCK_VENTAS = [
  { id: "V-001", fecha: "2024-03-21", cliente: "Cliente A", total: 1500, estado: "completado", productos: [] },
  { id: "V-002", fecha: "2024-03-21", cliente: "Cliente B", total: 3500, estado: "completado", productos: [] },
  { id: "V-003", fecha: "2024-03-20", cliente: "Cliente C", total: 900, estado: "pendiente", productos: [] },
]

const MOCK_PRODUCTOS = [
  { id: "P-001", nombre: "Producto Premium A", stock: 150, precio: 299, categoria: "Electrónica" },
  { id: "P-002", nombre: "Producto Básico B", stock: 500, precio: 99, categoria: "Hogar" },
  { id: "P-003", nombre: "Servicio C", stock: 0, precio: 1500, categoria: "Servicios" },
]

const MOCK_ENTRADAS = [
  {
    id: "E-001",
    fecha: new Date().toISOString(),
    origen: "Distribuidor Alpha",
    cantidad: 100,
    valorUnitario: 500,
    valorTotal: 50000,
    referencia: "OC-001",
  },
  {
    id: "E-002",
    fecha: new Date(Date.now() - 86400000).toISOString(),
    origen: "Distribuidor Beta",
    cantidad: 50,
    valorUnitario: 500,
    valorTotal: 25000,
    referencia: "OC-002",
  },
]

const MOCK_SALIDAS = [
  {
    id: "S-001",
    fecha: new Date().toISOString(),
    destino: "Cliente VIP",
    cantidad: 10,
    valorUnitario: 1000,
    valorTotal: 10000,
    referencia: "V-001",
  },
  {
    id: "S-002",
    fecha: new Date(Date.now() - 86400000).toISOString(),
    destino: "Cliente Regular",
    cantidad: 5,
    valorUnitario: 1000,
    valorTotal: 5000,
    referencia: "V-002",
  },
]
