'use client'

import { useMovimientosData } from '@/app/hooks/useDataHooks'
import { iOSPageLayout, iOSGrid, iOSLoading, iOSEmptyState } from './iOSIntegrationWrapper'
import { iOSMetricCard } from './iOSPremiumCards'
import { iOSVirtualizedTable, Column } from './iOSTableSystem'
import { formatMoney, formatDate } from '@/app/_lib/utils/formatters'
import { Activity, ArrowDownLeft, ArrowUpRight, TrendingUp, Filter, RefreshCw, Download, Wallet, CreditCard } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatusPill } from './iOSVisualComponents'

export function iOSMovimientosPanel() {
  const { data: movimientos, loading, error, refetch } = useMovimientosData()
  const [searchTerm, setSearchTerm] = useState('')

  // Date Filters
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  // Sparklines Mock
  const sparklines = useMemo(() => ({
    ingresos: Array.from({ length: 15 }, () => 5000 + Math.random() * 10000),
    egresos: Array.from({ length: 15 }, () => 2000 + Math.random() * 5000),
    neto: Array.from({ length: 15 }, () => 1000 + Math.random() * 8000)
  }), [])

  const stats = useMemo(() => {
    if (!movimientos) return { ingresos: 0, egresos: 0, neto: 0 }
    const sourceData = movimientos
    
    const ingresos = sourceData
      .filter(m => m.tipo === 'ingreso' || m.tipo === 'abono')
      .reduce((acc, m) => acc + m.monto, 0)
    const egresos = sourceData
      .filter(m => m.tipo === 'gasto' || m.tipo === 'retiro')
      .reduce((acc, m) => acc + m.monto, 0)
    return { ingresos, egresos, neto: ingresos - egresos }
  }, [movimientos])

  const filteredData = useMemo(() => {
    if (!movimientos) return []
    return movimientos.filter(m => {
      const matchesSearch = 
        m.concepto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m as any).categoria?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const mDate = new Date(m.fecha).toISOString().split('T')[0]
      const matchesDate = mDate >= startDate && mDate <= endDate

      return matchesSearch && matchesDate
    })
  }, [movimientos, searchTerm, startDate, endDate])

  const handleExport = () => {
    if (!filteredData.length) return

    const headers = ['Fecha', 'Tipo', 'Concepto', 'Monto']
    const rows = filteredData.map(m => [
      new Date(m.fecha).toLocaleDateString(),
      m.tipo,
      m.concepto,
      m.monto
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `movimientos_${startDate}_${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns: Column<any>[] = [
    {
      key: 'fecha',
      header: 'Fecha',
      render: (item) => <span className="text-white/80 tabular-nums">{formatDate(new Date(item.fecha))}</span>,
      sortable: true,
      width: 120
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (item) => {
        const isIngreso = item.tipo === 'ingreso' || item.tipo === 'abono' || item.tipo === 'transferencia_entrada'
        return (
          <StatusPill
            label={item.tipo.replace('_', ' ')}
            variant={isIngreso ? 'success' : 'error'}
            icon={isIngreso ? ArrowDownLeft : ArrowUpRight}
          />
        )
      },
      sortable: true,
      width: 160
    },
    {
      key: 'concepto',
      header: 'Concepto',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-white">{item.concepto}</span>
          {item.categoria && (
            <span className="text-xs text-white/40 flex items-center gap-1">
              <CreditCard size={10} /> {item.categoria}
            </span>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'monto',
      header: 'Monto',
      render: (item) => {
        const isIngreso = item.tipo === 'ingreso' || item.tipo === 'abono' || item.tipo === 'transferencia_entrada'
        return (
          <span className={`font-mono font-medium ${isIngreso ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isIngreso ? '+' : '-'}{formatMoney(item.monto)}
          </span>
        )
      },
      sortable: true,
      className: 'text-right',
      width: 140
    }
  ]

  if (loading && !movimientos) return (
    <iOSPageLayout title="Movimientos">
      <div className="h-[60vh] flex items-center justify-center">
        <iOSLoading text="Cargando movimientos..." />
      </div>
    </iOSPageLayout>
  )

  if (error) return (
    <iOSPageLayout title="Movimientos">
      <iOSEmptyState title="Error" description="No se pudieron cargar los movimientos" action={{ label: 'Reintentar', onClick: refetch }} />
    </iOSPageLayout>
  )

  return (
    <iOSPageLayout title="Movimientos" subtitle="Registro detallado de flujo de caja">
      <iOSGrid cols={3} className="mb-8">
        <iOSMetricCard
          title="Ingresos Totales"
          value={formatMoney(stats.ingresos)}
          icon={ArrowDownLeft}
          iconColor="#10B981"
          sparklineData={sparklines.ingresos}
        />
        <iOSMetricCard
          title="Egresos Totales"
          value={formatMoney(stats.egresos)}
          icon={ArrowUpRight}
          iconColor="#F43F5E"
          sparklineData={sparklines.egresos}
        />
        <iOSMetricCard
          title="Flujo Neto"
          value={formatMoney(stats.neto)}
          icon={Activity}
          iconColor="#8B5CF6"
          variant={stats.neto >= 0 ? 'default' : 'warning'}
          sparklineData={sparklines.neto}
        />
      </iOSGrid>

      <iOSVirtualizedTable
        title="Historial de Transacciones"
        subtitle={`${filteredData.length} transacciones registradas`}
        data={filteredData}
        columns={columns}
        keyField="id"
        height="600px"
        rowHeight={64}
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: 'Buscar por concepto...'
        }}
        dateRange={{
          start: startDate,
          end: endDate,
          onStartChange: setStartDate,
          onEndChange: setEndDate
        }}
        onExport={handleExport}
      />
    </iOSPageLayout>
  )
}
