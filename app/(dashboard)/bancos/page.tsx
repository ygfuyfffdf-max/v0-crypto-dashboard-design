import { AuroraBancosPanelUnified } from '@/app/_components/chronos-2026/panels'
import { db } from '@/database'
import { bancos, movimientos } from '@/database/schema'
import { desc, eq } from 'drizzle-orm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bancos & Bóvedas | CHRONOS Premium 2026',
  description: 'Sistema de 7 bóvedas con diseño premium Aurora',
}

// Force dynamic rendering to avoid SSG issues with database
export const dynamic = 'force-dynamic'

// Tipo para el formato que espera el componente
type BancoForPanel = {
  id: 'boveda_monte' | 'boveda_usa' | 'profit' | 'leftie' | 'azteca' | 'flete_sur' | 'utilidades'
  nombre: string
  descripcion: string
  capitalActual: number
  historicoIngresos: number
  historicoGastos: number
  ultimoMovimiento: string
  tendencia: 'up' | 'down' | 'neutral'
  porcentajeCambio: number
}

type MovimientoForPanel = {
  id: string
  fecha: string
  hora: string
  bancoId: BancoForPanel['id']
  bancoOrigenId?: BancoForPanel['id']
  bancoDestinoId?: BancoForPanel['id']
  tipo: 'ingreso' | 'gasto' | 'transferencia_entrada' | 'transferencia_salida' | 'corte'
  monto: number
  concepto: string
  referencia?: string
  estado?: 'completado' | 'pendiente' | 'cancelado'
  categoria?: string
  notas?: string
}

export default async function BancosPage() {
  // Cargar bancos desde la base de datos
  const bancosData = await db.query.bancos.findMany({
    where: eq(bancos.activo, true),
    orderBy: (bancos, { asc }) => [asc(bancos.orden)],
  })

  // Cargar últimos movimientos
  const movimientosData = await db.query.movimientos.findMany({
    orderBy: [desc(movimientos.fecha)],
    limit: 50,
  })

  // Transformar al formato del componente
  const bancosFormatted: BancoForPanel[] = bancosData.map((banco) => {
    // Calcular tendencia basada en movimientos recientes
    const tendencia: 'up' | 'down' | 'neutral' =
      banco.capitalActual > 0 ? 'up' : banco.capitalActual < 0 ? 'down' : 'neutral'

    // Calcular porcentaje de cambio (simplificado)
    const porcentajeCambio =
      banco.historicoIngresos > 0 ? (banco.capitalActual / banco.historicoIngresos) * 100 : 0

    return {
      id: banco.id as BancoForPanel['id'],
      nombre: banco.nombre,
      descripcion: banco.notas || '',
      capitalActual: banco.capitalActual,
      historicoIngresos: banco.historicoIngresos,
      historicoGastos: banco.historicoGastos,
      ultimoMovimiento: banco.ultimoMovimiento
        ? (new Date(banco.ultimoMovimiento).toISOString().split('T')[0] ?? '')
        : (new Date().toISOString().split('T')[0] ?? ''),
      tendencia,
      porcentajeCambio: Math.round(porcentajeCambio * 10) / 10,
    }
  })

  // Transformar movimientos al formato del componente
  const movimientosFormatted: MovimientoForPanel[] = movimientosData.map((mov) => {
    const fecha = new Date(mov.fecha)
    return {
      id: mov.id,
      fecha: fecha.toISOString().split('T')[0] ?? '',
      hora: fecha.toTimeString().slice(0, 5),
      bancoId: mov.bancoId as BancoForPanel['id'],
      bancoOrigenId: mov.bancoOrigenId as BancoForPanel['id'] | undefined,
      bancoDestinoId: mov.bancoDestinoId as BancoForPanel['id'] | undefined,
      tipo: mov.tipo as MovimientoForPanel['tipo'],
      monto: mov.monto,
      concepto: mov.concepto || '',
      referencia: mov.referencia || undefined,
      estado: 'completado' as const,
      categoria: mov.categoria || undefined,
      notas: mov.observaciones || undefined,
    }
  })

  return <AuroraBancosPanelUnified bancos={bancosFormatted} movimientos={movimientosFormatted} />
}
