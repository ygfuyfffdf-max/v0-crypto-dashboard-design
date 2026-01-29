'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💸 GASTOS PAGE CLIENT — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { AuroraGastosYAbonosPanelUnified } from '@/app/_components/chronos-2026/panels'
import { ConfirmDeleteModal } from '@/app/_components/modals/ConfirmDeleteModal'
import { GastoModal } from '@/app/_components/modals/GastoModal'
import { IngresoModal } from '@/app/_components/modals/IngresoModal'
import { logger } from '@/app/lib/utils/logger'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES (matching AuroraGastosYAbonosPanelUnified internal types)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type TipoMovimiento = 'gasto' | 'abono'

type CategoriaGasto =
  | 'Transporte'
  | 'Servicios'
  | 'Mantenimiento'
  | 'Nómina'
  | 'Marketing'
  | 'Compras'
  | 'Impuestos'
  | 'Renta'
  | 'Otros'

type EstadoMovimiento = 'completado' | 'pendiente' | 'cancelado'

type GastoBancoId =
  | 'boveda_monte'
  | 'boveda_usa'
  | 'profit'
  | 'leftie'
  | 'azteca'
  | 'flete_sur'
  | 'utilidades'

interface GastoAbono {
  id: string
  fecha: string
  hora: string
  tipo: TipoMovimiento
  concepto: string
  monto: number
  categoria: CategoriaGasto
  bancoOrigen: GastoBancoId
  bancoDestino?: GastoBancoId
  referencia?: string
  estado: EstadoMovimiento
  ventaId?: string
  clienteId?: string
  notas?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MovimientoFromAPI {
  id: string
  bancoId: string
  tipo: 'ingreso' | 'gasto'
  monto: number
  concepto: string
  fecha: Date | string
  referencia?: string
  categoria?: string
}

// Mapping de categorías de API a categorías del panel
const CATEGORIA_MAP: Record<string, CategoriaGasto> = {
  Operaciones: 'Otros',
  Transporte: 'Transporte',
  Servicios: 'Servicios',
  Nómina: 'Nómina',
  Impuestos: 'Impuestos',
  Mantenimiento: 'Mantenimiento',
  Marketing: 'Marketing',
  Compras: 'Compras',
  Renta: 'Renta',
  Otros: 'Otros',
  Ventas: 'Otros',
  Cobros: 'Otros',
  Inversiones: 'Otros',
  Préstamos: 'Otros',
  Devoluciones: 'Otros',
  Intereses: 'Otros',
}

// Mapping de bancos de API a bancos del panel
const BANCO_MAP: Record<string, GastoBancoId> = {
  boveda_monte: 'boveda_monte',
  boveda_usa: 'boveda_usa',
  profit: 'profit',
  leftie: 'leftie',
  azteca: 'azteca',
  flete_sur: 'flete_sur',
  utilidades: 'utilidades',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TRANSFORM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function transformMovimientoForPanel(m: MovimientoFromAPI): GastoAbono {
  const fecha = new Date(m.fecha)
  const categoriaRaw = m.categoria ?? 'Otros'
  const categoria: CategoriaGasto = CATEGORIA_MAP[categoriaRaw] ?? 'Otros'
  const bancoOrigen: GastoBancoId = BANCO_MAP[m.bancoId] ?? 'boveda_monte'

  return {
    id: m.id,
    fecha: fecha.toISOString().split('T')[0] ?? '',
    hora: fecha.toTimeString().slice(0, 5),
    tipo: m.tipo === 'ingreso' ? 'abono' : 'gasto',
    concepto: m.concepto,
    monto: m.monto,
    categoria,
    bancoOrigen,
    referencia: m.referencia,
    estado: 'completado',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function GastosPageClient() {
  const [movimientos, setMovimientos] = useState<GastoAbono[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Modal states
  const [showGastoModal, setShowGastoModal] = useState(false)
  const [showIngresoModal, setShowIngresoModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedMovimiento, setSelectedMovimiento] = useState<GastoAbono | null>(null)

  // Fetch data
  const fetchMovimientos = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/movimientos')
      if (!response.ok) throw new Error('Error fetching movimientos')

      const result = await response.json()
      // Extraer data del formato { success: true, data: [] }
      const dataArray = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : [])
      setMovimientos(dataArray.map(transformMovimientoForPanel))

      logger.info('Movimientos cargados', {
        context: 'GastosPageClient',
        data: { count: dataArray.length },
      })
    } catch (error) {
      logger.error('Error cargando movimientos', error as Error, { context: 'GastosPageClient' })
      toast.error('Error al cargar movimientos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMovimientos()
  }, [fetchMovimientos, refreshKey])

  // Handlers
  const handleNuevoGasto = useCallback(() => setShowGastoModal(true), [])
  const handleNuevoAbono = useCallback(() => setShowIngresoModal(true), [])

  const handleVerDetalle = useCallback((m: GastoAbono) => {
    setSelectedMovimiento(m)
    toast.info(`Movimiento: ${m.concepto} - $${m.monto.toLocaleString()}`)
  }, [])

  const handleEditarMovimiento = useCallback((m: GastoAbono) => {
    setSelectedMovimiento(m)
    if (m.tipo === 'gasto') {
      setShowGastoModal(true)
    } else {
      setShowIngresoModal(true)
    }
  }, [])

  const handleEliminarMovimiento = useCallback((m: GastoAbono) => {
    setSelectedMovimiento(m)
    setShowDeleteModal(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedMovimiento) return

    try {
      const response = await fetch(`/api/movimientos/${selectedMovimiento.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error eliminando movimiento')
      }

      toast.success('Movimiento eliminado')
      setShowDeleteModal(false)
      setSelectedMovimiento(null)
      setRefreshKey((k) => k + 1)
    } catch (error) {
      logger.error('Error eliminando movimiento', error as Error, { context: 'GastosPageClient' })
      toast.error(error instanceof Error ? error.message : 'Error al eliminar')
    }
  }, [selectedMovimiento])

  const handleRefresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const handleModalClose = useCallback(() => {
    setShowGastoModal(false)
    setShowIngresoModal(false)
    setShowDeleteModal(false)
    setSelectedMovimiento(null)
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <>
      <AuroraGastosYAbonosPanelUnified
        movimientos={movimientos}
        onNuevoGasto={handleNuevoGasto}
        onNuevoAbono={handleNuevoAbono}
        onVerDetalle={handleVerDetalle}
        onEditarMovimiento={handleEditarMovimiento}
        onEliminarMovimiento={handleEliminarMovimiento}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <GastoModal isOpen={showGastoModal} onClose={handleModalClose} />

      <IngresoModal isOpen={showIngresoModal} onClose={handleModalClose} />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Movimiento"
        message={`¿Eliminar "${selectedMovimiento?.concepto}"? Esta acción no se puede deshacer.`}
      />
    </>
  )
}
