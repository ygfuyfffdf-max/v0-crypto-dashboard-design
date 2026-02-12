'use client'

import { useBancosData, useMovimientosData } from '@/app/hooks/useDataHooks'
import { iOSPageLayout, iOSGrid, iOSSection, iOSLoading, iOSEmptyState } from './iOSIntegrationWrapper'
import { iOSMetricCard, iOSActionCard } from './iOSPremiumCards'
import { iOSVirtualizedTable, Column } from './iOSTableSystem'
import { formatMoney, formatDate } from '@/app/_lib/utils/formatters'
import { Landmark, Wallet, TrendingUp, TrendingDown, ArrowRightLeft, DollarSign, History, ArrowDownLeft, ArrowUpRight, Eye } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SupremeSparkline, StatusPill } from './iOSVisualComponents'
import { TransactionDetailsModal } from '@/app/_components/modals/TransactionDetailsModal'

export function iOSBancosPanel() {
  const { data: bancos, loading: bancosLoading, refetch: refetchBancos } = useBancosData()
  const { data: movimientos, loading: movLoading } = useMovimientosData()
  const router = useRouter()
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  const capitalTotal = useMemo(() => 
    bancos?.reduce((acc, b) => acc + b.capitalActual, 0) || 0
  , [bancos])

  const movimientosRecientes = useMemo(() => 
    movimientos?.slice(0, 10) || []
  , [movimientos])

  // Sparkline for Capital (Mock)
  const capitalSparkline = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => 100000 + (i * 2000) + (Math.random() * 50000))
  , [])

  const columns: Column<any>[] = [
    {
      key: 'fecha',
      header: 'Fecha',
      render: (m) => <span className="text-white/80 tabular-nums">{formatDate(new Date(m.fecha))}</span>,
      width: 120
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (m) => {
        const isIngreso = m.tipo === 'ingreso' || m.tipo === 'abono'
        return (
          <StatusPill
            label={m.tipo.replace('_', ' ')}
            variant={isIngreso ? 'success' : 'error'}
            icon={isIngreso ? ArrowDownLeft : ArrowUpRight}
          />
        )
      },
      width: 140
    },
    {
      key: 'concepto',
      header: 'Concepto',
      render: (m) => <span className="font-medium text-white">{m.concepto}</span>
    },
    {
      key: 'monto',
      header: 'Monto',
      render: (m) => {
        const isIngreso = m.tipo === 'ingreso' || m.tipo === 'abono'
        return (
          <span className={`font-mono font-medium ${isIngreso ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isIngreso ? '+' : '-'}{formatMoney(m.monto)}
          </span>
        )
      },
      className: 'text-right',
      width: 120
    }
  ]

  if (bancosLoading && !bancos) return (
    <iOSPageLayout title="Bancos & Bóvedas">
      <div className="h-[60vh] flex items-center justify-center">
        <iOSLoading text="Sincronizando bóvedas..." />
      </div>
    </iOSPageLayout>
  )

  return (
    <iOSPageLayout 
      title="Bancos & Bóvedas" 
      subtitle="Gestión de capital y distribución GYA"
      headerRightAction={
        <button 
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          onClick={() => refetchBancos()}
        >
          <History size={20} className="text-white" />
        </button>
      }
    >
      {/* Resumen Capital */}
      <iOSSection>
        <div className="bg-gradient-to-br from-violet-600 to-indigo-900 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-2xl shadow-violet-500/20 border border-white/10">
          <div className="relative z-10">
            <span className="text-white/70 font-medium tracking-wide text-sm uppercase flex items-center gap-2">
              <Wallet size={16} /> Capital Total Consolidado
            </span>
            <h1 className="text-5xl font-bold text-white mt-3 mb-6 tracking-tight drop-shadow-lg">{formatMoney(capitalTotal)}</h1>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                <TrendingUp size={18} className="text-emerald-400" />
                <span className="text-white/90 text-sm font-medium">+12.5% vs mes anterior</span>
              </div>
            </div>
          </div>
          
          {/* Sparkline Background */}
          <div className="absolute bottom-0 left-0 right-0 h-48 opacity-20 pointer-events-none mix-blend-screen">
             <SupremeSparkline data={capitalSparkline} color="#ffffff" height={192} />
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        </div>
      </iOSSection>

      {/* Grid de Bancos */}
      <iOSSection title="Bóvedas Activas">
        <iOSGrid cols={3} gap="md">
          {bancos?.map((banco) => (
            <iOSActionCard
              key={banco.id}
              title={banco.nombre}
              description={`Capital: ${formatMoney(banco.capitalActual)}`}
              icon={Landmark}
              iconColor={
                banco.id === 'boveda_monte' ? '#10B981' :
                banco.id === 'boveda_usa' ? '#3B82F6' :
                banco.id === 'utilidades' ? '#F59E0B' :
                '#8B5CF6'
              }
              primaryAction={{
                label: 'Ver Detalles',
                onClick: () => router.push(`/bancos/${banco.id}`)
              }}
              secondaryAction={{
                label: 'Transferir',
                onClick: () => console.log('Transferir', banco.id)
              }}
            >
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-white/40 block mb-1">Ingresos</span>
                  <span className="text-sm text-emerald-400 font-mono font-medium flex items-center gap-1">
                    <ArrowDownLeft size={12} /> {formatMoney(banco.historicoIngresos)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-white/40 block mb-1">Gastos</span>
                  <span className="text-sm text-rose-400 font-mono font-medium flex items-center gap-1">
                    <ArrowUpRight size={12} /> {formatMoney(banco.historicoGastos)}
                  </span>
                </div>
              </div>
            </iOSActionCard>
          ))}
        </iOSGrid>
      </iOSSection>

      {/* Movimientos Recientes */}
      <iOSSection title="Últimos Movimientos">
        <iOSVirtualizedTable
          data={movimientosRecientes}
          keyField="id"
          columns={columns}
          height="400px"
          actions={[
            { label: 'Ver', icon: Eye, onClick: (item) => setSelectedTransaction(item) }
          ]}
        />
      </iOSSection>

      <TransactionDetailsModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        type="movimiento"
      />
    </iOSPageLayout>
  )
}
