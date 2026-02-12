'use client'

import { useOrdenesCompraData, useDistribuidoresData } from '@/app/hooks/useDataHooks'
import { iOSPageLayout, iOSGrid, iOSLoading } from './iOSIntegrationWrapper'
import { iOSMetricCard } from './iOSPremiumCards'
import { iOSVirtualizedTable, Column } from './iOSTableSystem'
import { formatMoney, formatDate } from '@/app/_lib/utils/formatters'
import { ShoppingCart, Truck, Clock, CheckCircle, Eye, FileText, Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatusPill, UserAvatar } from './iOSVisualComponents'
import { TransactionDetailsModal } from '@/app/_components/modals/TransactionDetailsModal'

export function iOSOrdenesPanel() {
  const { data: ordenes, loading: loadingOrdenes, error, refetch } = useOrdenesCompraData()
  const { data: distribuidores } = useDistribuidoresData()
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
    total: Array.from({ length: 15 }, () => 10000 + Math.random() * 5000),
    count: Array.from({ length: 15 }, () => 5 + Math.random() * 5),
    pending: Array.from({ length: 15 }, () => Math.random() * 3)
  }), [])

  // Map ordenes with distributor names
  const enrichedOrdenes = useMemo(() => {
    if (!ordenes) return []
    return ordenes.map(o => {
      const dist = distribuidores?.find(d => d.id === o.distribuidorId)
      return {
        ...o,
        distribuidorNombre: dist?.nombre || 'Proveedor General',
        distribuidorEmpresa: dist?.empresa
      }
    })
  }, [ordenes, distribuidores])

  const stats = useMemo(() => {
    if (!ordenes) return { total: 0, count: 0, pending: 0 }
    return {
      total: ordenes.reduce((acc, o) => acc + (o.total || 0), 0),
      count: ordenes.length,
      pending: ordenes.filter(o => o.estado === 'pendiente').length
    }
  }, [ordenes])

  const filteredData = useMemo(() => {
    return enrichedOrdenes.filter(o => {
      const matchesSearch = 
        o.distribuidorNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase())
      
      const oDate = new Date(o.fecha).toISOString().split('T')[0]
      const matchesDate = oDate >= startDate && oDate <= endDate

      return matchesSearch && matchesDate
    })
  }, [enrichedOrdenes, searchTerm, startDate, endDate])

  const handleExport = () => {
    if (!filteredData.length) return
    const headers = ['Fecha', 'Folio', 'Proveedor', 'Total', 'Estado']
    const rows = filteredData.map(o => [
      new Date(o.fecha).toLocaleDateString(),
      o.id,
      o.distribuidorNombre,
      o.total,
      o.estado
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `compras_${startDate}_${endDate}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns: Column<any>[] = [
    {
      key: 'fecha',
      header: 'Fecha',
      render: (o) => <span className="text-white/80 tabular-nums">{formatDate(new Date(o.fecha))}</span>,
      sortable: true,
      width: 120
    },
    {
      key: 'distribuidorNombre',
      header: 'Proveedor',
      render: (o) => (
        <UserAvatar name={o.distribuidorNombre} subtext={o.distribuidorEmpresa} />
      ),
      sortable: true
    },
    {
      key: 'total',
      header: 'Total',
      render: (o) => <span className="font-mono font-medium text-white">{formatMoney(o.total)}</span>,
      sortable: true,
      width: 140
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (o) => (
        <StatusPill
          label={o.estado}
          variant={o.estado === 'completada' ? 'success' : o.estado === 'pendiente' ? 'warning' : 'neutral'}
          pulsing={o.estado === 'pendiente'}
        />
      ),
      width: 120
    }
  ]

  if (loadingOrdenes && !ordenes) return (
    <iOSPageLayout title="Compras">
      <div className="h-[60vh] flex items-center justify-center">
        <iOSLoading text="Cargando órdenes..." />
      </div>
    </iOSPageLayout>
  )

  return (
    <iOSPageLayout title="Compras" subtitle="Órdenes de compra y abastecimiento">
      <iOSGrid cols={3} className="mb-8">
        <iOSMetricCard
          title="Compras Totales"
          value={formatMoney(stats.total)}
          icon={ShoppingCart}
          iconColor="#3B82F6"
          sparklineData={sparklines.total}
        />
        <iOSMetricCard
          title="Órdenes"
          value={stats.count}
          icon={Truck}
          iconColor="#8B5CF6"
          sparklineData={sparklines.count}
        />
        <iOSMetricCard
          title="Pendientes"
          value={stats.pending}
          icon={Clock}
          iconColor="#F59E0B"
          variant={stats.pending > 0 ? 'warning' : 'default'}
          sparklineData={sparklines.pending}
        />
      </iOSGrid>

      <iOSVirtualizedTable
        title="Historial de Compras"
        subtitle={`${filteredData.length} órdenes registradas`}
        data={filteredData}
        columns={columns}
        keyField="id"
        height="600px"
        rowHeight={64}
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: 'Buscar órdenes...'
        }}
        dateRange={{
          start: startDate,
          end: endDate,
          onStartChange: setStartDate,
          onEndChange: setEndDate
        }}
        onExport={handleExport}
        actions={[
          { label: 'Ver Detalles', icon: Eye, onClick: (item) => setSelectedTransaction(item) },
          { label: 'Factura', icon: FileText, onClick: () => {} }
        ]}
      />

      <TransactionDetailsModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        type="compra"
      />
    </iOSPageLayout>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
