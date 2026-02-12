'use client'

import { useMovimientosData } from '@/app/hooks/useDataHooks'
import { iOSPageLayout, iOSGrid, iOSLoading, iOSEmptyState, iOSButton } from './iOSIntegrationWrapper'
import { iOSMetricCard } from './iOSPremiumCards'
import { iOSVirtualizedTable, Column } from './iOSTableSystem'
import { formatMoney, formatDate } from '@/app/_lib/utils/formatters'
import { TrendingDown, Calendar, ArrowUpRight, Plus, Eye, Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatusPill } from './iOSVisualComponents'
import { TransactionDetailsModal } from '@/app/_components/modals/TransactionDetailsModal'

export function iOSGastosPanel() {
  const { data: movimientos, loading, error, refetch } = useMovimientosData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  // Date Filters
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  // Sparklines Mock
  const sparklines = useMemo(() => ({
    total: Array.from({ length: 15 }, () => 2000 + Math.random() * 5000),
    count: Array.from({ length: 15 }, () => 2 + Math.random() * 5)
  }), [])

  const gastos = useMemo(() => {
    if (!movimientos) return []
    return movimientos.filter(m => m.tipo === 'gasto' || m.tipo === 'retiro')
  }, [movimientos])

  const stats = useMemo(() => {
    return {
      total: gastos.reduce((acc, g) => acc + g.monto, 0),
      count: gastos.length
    }
  }, [gastos])

  const filteredData = useMemo(() => {
    return gastos.filter(g => {
      const matchesSearch = 
        g.concepto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g as any).categoria?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const gDate = new Date(g.fecha).toISOString().split('T')[0]
      const matchesDate = gDate >= startDate && gDate <= endDate

      return matchesSearch && matchesDate
    })
  }, [gastos, searchTerm, startDate, endDate])

  const handleExport = () => {
    if (!filteredData.length) return
    const headers = ['Fecha', 'Concepto', 'Categoría', 'Monto']
    const rows = filteredData.map(g => [
      new Date(g.fecha).toLocaleDateString(),
      g.concepto,
      (g as any).categoria || 'General',
      g.monto
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `gastos_${startDate}_${endDate}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns: Column<any>[] = [
    {
      key: 'fecha',
      header: 'Fecha',
      render: (g) => <span className="text-white/80 tabular-nums">{formatDate(new Date(g.fecha))}</span>,
      sortable: true,
      width: 120
    },
    {
      key: 'concepto',
      header: 'Concepto',
      render: (g) => (
        <div className="flex flex-col">
          <span className="font-medium text-white">{g.concepto}</span>
          <span className="text-xs text-white/40">{(g as any).categoria || 'Operativo'}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'monto',
      header: 'Monto',
      render: (g) => <span className="font-mono font-medium text-rose-400">-{formatMoney(g.monto)}</span>,
      sortable: true,
      className: 'text-right',
      width: 140
    },
    {
      key: 'estado',
      header: 'Estado',
      render: () => <StatusPill label="Pagado" variant="error" />,
      width: 100
    }
  ]

  if (loading && !movimientos) return (
    <iOSPageLayout title="Gastos">
      <div className="h-[60vh] flex items-center justify-center">
        <iOSLoading text="Cargando gastos..." />
      </div>
    </iOSPageLayout>
  )

  if (error) return (
    <iOSPageLayout title="Gastos">
      <iOSEmptyState title="Error" description="No se pudieron cargar los gastos" action={{ label: 'Reintentar', onClick: refetch }} />
    </iOSPageLayout>
  )

  return (
    <iOSPageLayout 
      title="Gastos y Abonos" 
      subtitle="Control de egresos operativos"
      headerAction={
        <iOSButton 
          variant="primary" 
          onClick={() => {}} // TODO: Create Expense Modal
          className="bg-rose-500 hover:bg-rose-600 text-white border-none shadow-lg shadow-rose-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Gasto
        </iOSButton>
      }
    >
      <iOSGrid cols={2} className="mb-8">
        <iOSMetricCard
          title="Gastos Totales"
          value={formatMoney(stats.total)}
          icon={TrendingDown}
          iconColor="#F43F5E"
          sparklineData={sparklines.total}
        />
        <iOSMetricCard
          title="Registros"
          value={stats.count}
          icon={ArrowUpRight}
          iconColor="#8B5CF6"
          sparklineData={sparklines.count}
        />
      </iOSGrid>

      <iOSVirtualizedTable
        title="Historial de Gastos"
        subtitle={`${filteredData.length} gastos registrados`}
        data={filteredData}
        columns={columns}
        keyField="id"
        height="600px"
        rowHeight={64}
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: 'Buscar gastos...'
        }}
        dateRange={{
          start: startDate,
          end: endDate,
          onStartChange: setStartDate,
          onEndChange: setEndDate
        }}
        onExport={handleExport}
        actions={[
          { label: 'Ver Detalles', icon: Eye, onClick: (item) => setSelectedTransaction(item) }
        ]}
      />

      <TransactionDetailsModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        type="movimiento"
      />
    </iOSPageLayout>
  )
}
