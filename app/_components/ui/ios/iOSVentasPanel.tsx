'use client'

import { useVentasData, useClientesData } from '@/app/hooks/useDataHooks'
import { iOSPageLayout, iOSGrid, iOSSection, iOSLoading, iOSEmptyState } from './iOSIntegrationWrapper'
import { iOSMetricCard } from './iOSPremiumCards'
import { iOSVirtualizedTable, Column } from './iOSTableSystem'
import { formatMoney, formatDate } from '@/app/_lib/utils/formatters'
import { DollarSign, ShoppingCart, Calendar, CheckCircle, Clock, AlertCircle, Eye, Printer, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CreateVentaModal } from '@/app/_components/modals/CreateVentaModal'
import { iOSButton } from './iOSIntegrationWrapper'
import { StatusPill, UserAvatar } from './iOSVisualComponents'

export function iOSVentasPanel() {
  const { data: ventas, loading: loadingVentas, error, refetch } = useVentasData()
  const { data: clientes } = useClientesData()
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  // Date Filters (Default: Current Month)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  // Map ventas with client names
  const enrichedVentas = useMemo(() => {
    if (!ventas) return []
    return ventas.map(v => {
      const cliente = clientes?.find(c => c.id === v.clienteId)
      return {
        ...v,
        clienteNombre: cliente?.nombre || 'Cliente General',
        clienteEmail: cliente?.email
      }
    })
  }, [ventas, clientes])

  // Métricas
  const stats = useMemo(() => {
    if (!ventas) return { total: 0, count: 0, pending: 0 }
    return {
      total: ventas.reduce((acc, v) => acc + (v.precioTotalVenta || 0), 0),
      count: ventas.length,
      pending: ventas.filter(v => v.estadoPago === 'pendiente').length
    }
  }, [ventas])

  // Mock Sparkline Data (Simulando actividad)
  const sparklines = useMemo(() => ({
    ventas: Array.from({ length: 20 }, () => 1000 + Math.random() * 5000),
    operaciones: Array.from({ length: 20 }, () => 10 + Math.random() * 50),
    pendientes: Array.from({ length: 20 }, () => Math.random() * 10)
  }), [])

  // Filtrado
  const filteredVentas = useMemo(() => {
    return enrichedVentas.filter(v => {
      const matchesSearch = 
        v.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.id.toLowerCase().includes(searchTerm.toLowerCase())
      
      const vDate = new Date(v.fecha).toISOString().split('T')[0]
      const matchesDate = vDate >= startDate && vDate <= endDate

      return matchesSearch && matchesDate
    })
  }, [enrichedVentas, searchTerm, startDate, endDate])

  const handleExport = () => {
    if (!filteredVentas.length) return

    const headers = ['Fecha', 'Folio', 'Cliente', 'Total', 'Estado', 'Saldo']
    const rows = filteredVentas.map(v => [
      new Date(v.fecha).toLocaleDateString(),
      v.id,
      v.clienteNombre,
      v.precioTotalVenta,
      v.estadoPago,
      v.montoRestante
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `ventas_${startDate}_${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns: Column<any>[] = [
    {
      key: 'fecha',
      header: 'Fecha',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-white/40" />
          <span className="text-white/80 tabular-nums">{formatDate(new Date(item.fecha))}</span>
        </div>
      ),
      sortable: true,
      width: 150
    },
    {
      key: 'clienteNombre',
      header: 'Cliente',
      render: (item) => (
        <UserAvatar name={item.clienteNombre} subtext={item.clienteEmail} size="sm" />
      ),
      sortable: true
    },
    {
      key: 'precioTotalVenta',
      header: 'Total',
      render: (item) => <span className="font-mono font-medium text-emerald-400">{formatMoney(item.precioTotalVenta)}</span>,
      sortable: true,
      width: 150
    },
    {
      key: 'estadoPago',
      header: 'Estado',
      render: (item) => (
        <StatusPill 
          label={item.estadoPago === 'completo' ? 'Pagado' : item.estadoPago === 'parcial' ? 'Parcial' : 'Pendiente'}
          variant={item.estadoPago === 'completo' ? 'success' : item.estadoPago === 'parcial' ? 'warning' : 'error'}
          pulsing={item.estadoPago === 'pendiente'}
        />
      ),
      mobileLabel: 'Estado Pago',
      width: 120
    },
    {
      key: 'montoRestante',
      header: 'Saldo',
      render: (item) => item.montoRestante > 0 ? (
        <span className="text-red-400 text-xs font-mono bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">-{formatMoney(item.montoRestante)}</span>
      ) : <span className="text-white/30 text-xs">-</span>,
      hideOnMobile: true,
      width: 120
    }
  ]

  if (loadingVentas && !ventas) {
    return (
      <iOSPageLayout title="Ventas">
        <div className="h-[60vh] flex items-center justify-center">
          <iOSLoading text="Cargando ventas..." />
        </div>
      </iOSPageLayout>
    )
  }

  if (error) {
    return (
      <iOSPageLayout title="Ventas">
        <iOSEmptyState 
          title="Error al cargar" 
          description="No se pudieron obtener las ventas." 
          icon={AlertCircle}
          action={{ label: 'Reintentar', onClick: refetch }}
        />
      </iOSPageLayout>
    )
  }

  return (
    <iOSPageLayout 
      title="Ventas" 
      subtitle="Gestión de ventas y cobros"
      headerAction={
        <iOSButton 
          variant="primary" 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Venta
        </iOSButton>
      }
    >
      {/* Metrics Grid */}
      <iOSGrid cols={3} className="mb-8">
        <iOSMetricCard
          title="Ventas Totales"
          value={formatMoney(stats.total)}
          icon={DollarSign}
          iconColor="#10B981"
          trend={{ value: 12.5, direction: 'up' }}
          sparklineData={sparklines.ventas}
        />
        <iOSMetricCard
          title="Operaciones"
          value={stats.count}
          icon={ShoppingCart}
          iconColor="#8B5CF6"
          sparklineData={sparklines.operaciones}
        />
        <iOSMetricCard
          title="Pendientes Cobro"
          value={stats.pending}
          icon={Clock}
          iconColor="#F59E0B"
          variant={stats.pending > 0 ? 'warning' : 'default'}
          sparklineData={sparklines.pendientes}
        />
      </iOSGrid>

      {/* Virtualized Table for Performance */}
      <iOSVirtualizedTable
        title="Historial de Ventas"
        subtitle={`${filteredVentas.length} registros encontrados`}
        data={filteredVentas}
        columns={columns}
        keyField="id"
        height="600px"
        rowHeight={64}
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: 'Buscar por cliente o folio...'
        }}
        dateRange={{
          start: startDate,
          end: endDate,
          onStartChange: setStartDate,
          onEndChange: setEndDate
        }}
        onExport={handleExport}
        actions={[
          { label: 'Ver', icon: Eye, onClick: (item) => console.log('View', item) },
          { label: 'Imprimir', icon: Printer, onClick: (item) => console.log('Print', item) }
        ]}
      />

      <CreateVentaModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </iOSPageLayout>
  )
}



function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
