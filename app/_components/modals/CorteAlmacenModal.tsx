'use client'

import { getReporteAlmacen } from '@/app/_actions/reportes'
import {
  convertirACSV,
  descargarCSV,
  formatearFecha,
  formatearMoneda,
  generarHTMLParaImpresion,
} from '@/app/lib/utils/export-helpers'
import { logger } from '@/app/lib/utils/logger'
import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, ArrowUp, Box, Download, Printer, X } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button, Modal } from '../ui/Modal'

interface CorteAlmacenModalProps {
  open: boolean
  onClose: () => void
}

interface AlmacenStats {
  totalProductos: number
  valorInventario: number
  valorVentaPotencial: number
  unidadesTotales: number
  margenPotencial: number
}

interface ProductoReporte {
  id: string
  nombre: string
  cantidad: number
  minimo: number
  precioCompra: number
  precioVenta: number
  ubicacion?: string
}

export function CorteAlmacenModal({ open, onClose }: CorteAlmacenModalProps) {
  const [isPending, startTransition] = useTransition()
  const [stats, setStats] = useState<AlmacenStats | null>(null)
  const [productosBajoStock, setProductosBajoStock] = useState<ProductoReporte[]>([])
  const [productosAgotados, setProductosAgotados] = useState<ProductoReporte[]>([])
  const [topProductos, setTopProductos] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'resumen' | 'alertas' | 'top'>('resumen')

  useEffect(() => {
    if (open) {
      cargarDatos()
    }
  }, [open])

  const cargarDatos = () => {
    startTransition(async () => {
      try {
        const result = await getReporteAlmacen()
        if (result.success && result.data) {
          setStats(result.data.stats)
          setProductosBajoStock(result.data.productosBajoStock as any[])
          setProductosAgotados(result.data.productosAgotados as any[])
          setTopProductos(result.data.topProductosValor)
        } else {
          toast.error('Error al cargar datos del almacén')
        }
      } catch (error) {
        logger.error('Error cargando reporte almacén', error as Error)
        toast.error('Error de conexión')
      }
    })
  }

  const handleExportCSV = () => {
    if (!stats) return

    const data = [
      { Concepto: 'Total Productos', Valor: stats.totalProductos },
      { Concepto: 'Unidades Totales', Valor: stats.unidadesTotales },
      { Concepto: 'Valor Inventario (Costo)', Valor: formatearMoneda(stats.valorInventario) },
      { Concepto: 'Valor Venta Potencial', Valor: formatearMoneda(stats.valorVentaPotencial) },
      { Concepto: 'Margen Potencial', Valor: formatearMoneda(stats.margenPotencial) },
      {},
      { Concepto: 'PRODUCTOS BAJO STOCK', Valor: '' },
      ...productosBajoStock.map((p) => ({
        Concepto: p.nombre,
        Valor: `${p.cantidad} (Mín: ${p.minimo})`,
      })),
    ]

    const csv = convertirACSV(data)
    descargarCSV(csv, `corte-almacen-${formatearFecha(new Date())}`)
    toast.success('Reporte CSV descargado')
  }

  const handlePrint = () => {
    if (!stats) return

    const contenido = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1 style="text-align: center; color: #333;">Reporte de Almacén</h1>
        <p style="text-align: center; color: #666;">Fecha: ${formatearFecha(new Date())}</p>

        <div style="margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
            <h3>Valor Inventario</h3>
            <p style="font-size: 24px; font-weight: bold;">${formatearMoneda(stats.valorInventario)}</p>
          </div>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
            <h3>Unidades Totales</h3>
            <p style="font-size: 24px; font-weight: bold;">${stats.unidadesTotales}</p>
          </div>
        </div>

        <h3 style="margin-top: 30px;">Productos Bajo Stock (${productosBajoStock.length})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr style="background: #eee;">
            <th style="padding: 10px; text-align: left;">Producto</th>
            <th style="padding: 10px; text-align: right;">Stock</th>
            <th style="padding: 10px; text-align: right;">Mínimo</th>
          </tr>
          ${productosBajoStock
            .map(
              (p) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px;">${p.nombre}</td>
              <td style="padding: 10px; text-align: right; color: #e11d48; font-weight: bold;">${p.cantidad}</td>
              <td style="padding: 10px; text-align: right;">${p.minimo}</td>
            </tr>
          `,
            )
            .join('')}
        </table>
      </div>
    `

    generarHTMLParaImpresion('Corte de Almacén', contenido)
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Corte de Almacén"
      subtitle="Estado actual del inventario y valoración"
      size="lg"
    >
      <div className="flex h-full flex-col">
        {/* Tabs */}
        <div className="mb-6 flex space-x-1 rounded-xl bg-white/5 p-1">
          {[
            { id: 'resumen', label: 'Resumen General', icon: Box },
            { id: 'alertas', label: 'Alertas de Stock', icon: AlertTriangle },
            { id: 'top', label: 'Top Valor', icon: ArrowUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.id === 'alertas' && productosBajoStock.length > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">
                  {productosBajoStock.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isPending ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-purple-500" />
            </div>
          ) : !stats ? (
            <div className="py-10 text-center text-white/40">No hay datos disponibles</div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'resumen' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard
                      label="Valor Inventario (Costo)"
                      value={formatearMoneda(stats.valorInventario)}
                      sublabel="Capital Invertido"
                      color="blue"
                    />
                    <StatCard
                      label="Valor Venta Potencial"
                      value={formatearMoneda(stats.valorVentaPotencial)}
                      sublabel="Ingreso Esperado"
                      color="green"
                    />
                    <StatCard
                      label="Margen Potencial"
                      value={formatearMoneda(stats.margenPotencial)}
                      sublabel="Ganancia Bruta"
                      color="purple"
                    />
                    <StatCard
                      label="Unidades Totales"
                      value={stats.unidadesTotales.toString()}
                      sublabel={`${stats.totalProductos} productos únicos`}
                      color="orange"
                    />
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <h4 className="mb-3 text-sm font-medium text-white/60">
                      Estado del Inventario
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-white">Productos con Stock</span>
                        <span className="text-green-400">
                          {stats.totalProductos - productosAgotados.length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white">Productos Agotados</span>
                        <span className="text-red-400">{productosAgotados.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white">Bajo Mínimo</span>
                        <span className="text-orange-400">{productosBajoStock.length}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'alertas' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {productosBajoStock.length === 0 && productosAgotados.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center text-white/40">
                      <Box className="mb-2 h-8 w-8 opacity-50" />
                      <p>Todo el inventario está saludable</p>
                    </div>
                  ) : (
                    <>
                      {productosAgotados.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-red-400 uppercase">
                            <X className="h-3 w-3" /> Agotados ({productosAgotados.length})
                          </h4>
                          {productosAgotados.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/10 p-3"
                            >
                              <span className="font-medium text-red-200">{p.nombre}</span>
                              <span className="text-xs text-red-400">Stock: 0</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {productosBajoStock.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-orange-400 uppercase">
                            <AlertTriangle className="h-3 w-3" /> Bajo Stock (
                            {productosBajoStock.length})
                          </h4>
                          {productosBajoStock.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between rounded-lg border border-orange-500/20 bg-orange-500/10 p-3"
                            >
                              <div>
                                <div className="font-medium text-orange-200">{p.nombre}</div>
                                <div className="text-xs text-orange-400/60">
                                  Mínimo requerido: {p.minimo}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-orange-400">
                                  {p.cantidad}
                                </div>
                                <div className="text-xs text-orange-400/60">unidades</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === 'top' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h4 className="mb-2 text-xs font-bold tracking-wider text-white/40 uppercase">
                    Productos de Mayor Valor
                  </h4>
                  {topProductos.map((p, i) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3 transition-colors hover:bg-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-xs font-bold text-white/60">
                          {i + 1}
                        </span>
                        <div>
                          <div className="font-medium text-white">{p.nombre}</div>
                          <div className="text-xs text-white/40">{p.cantidad} unidades</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-400">
                          {formatearMoneda(p.valorTotal)}
                        </div>
                        <div className="text-xs text-white/40">Valor Total</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-between border-t border-white/10 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handlePrint} disabled={!stats} icon={<Printer />}>
              Imprimir
            </Button>
            <Button onClick={handleExportCSV} disabled={!stats} icon={<Download />}>
              Exportar CSV
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function StatCard({
  label,
  value,
  sublabel,
  color,
}: {
  label: string
  value: string
  sublabel: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colors = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  }

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="my-1 text-xl font-bold text-white">{value}</div>
      <div className="text-xs opacity-60">{sublabel}</div>
    </div>
  )
}
