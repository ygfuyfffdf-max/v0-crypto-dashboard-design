'use client'

import { useAlmacenData } from '@/app/hooks/useDataHooks'
import { iOSPageLayout, iOSGrid, iOSLoading, iOSEmptyState } from './iOSIntegrationWrapper'
import { iOSMetricCard } from './iOSPremiumCards'
import { iOSTable, Column } from './iOSTableSystem'
import { formatMoney } from '@/app/_lib/utils/formatters'
import { Package, AlertTriangle, Search, Box } from 'lucide-react'
import { useMemo, useState } from 'react'

export function iOSAlmacenPanel() {
  const { data: almacen, loading, error, refetch } = useAlmacenData()
  const [searchTerm, setSearchTerm] = useState('')

  const productos = useMemo(() => almacen?.productos || [], [almacen])

  const stats = useMemo(() => {
    return {
      total: productos.length,
      valor: productos.reduce((acc, p) => acc + (p.precioVenta * p.cantidad), 0),
      bajoStock: productos.filter(p => p.cantidad < (p.minimo || 5)).length
    }
  }, [productos])

  const filteredData = useMemo(() => {
    return productos.filter(p => 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [productos, searchTerm])

  const columns: Column<any>[] = [
    {
      key: 'nombre',
      header: 'Producto',
      render: (p) => (
        <div className="flex flex-col">
          <span className="font-medium text-white">{p.nombre}</span>
          <span className="text-xs text-white/40">{p.codigo || 'Sin código'}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'cantidad',
      header: 'Stock',
      render: (p) => (
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-mono font-medium",
            p.cantidad < (p.minimo || 5) ? "text-rose-400" : "text-white"
          )}>
            {p.cantidad}
          </span>
          {p.cantidad < (p.minimo || 5) && (
            <AlertTriangle size={12} className="text-rose-400" />
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'precioVenta',
      header: 'Precio',
      render: (p) => <span className="text-white/80">{formatMoney(p.precioVenta)}</span>,
      sortable: true
    },
    {
      key: 'categoria',
      header: 'Categoría',
      render: (p) => (
        <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/60 border border-white/10">
          {p.categoria || 'General'}
        </span>
      ),
      hideOnMobile: true
    }
  ]

  if (loading && !almacen) return (
    <iOSPageLayout title="Almacén">
      <div className="h-[60vh] flex items-center justify-center">
        <iOSLoading text="Inventariando..." />
      </div>
    </iOSPageLayout>
  )

  return (
    <iOSPageLayout title="Almacén" subtitle="Control de inventario y productos">
      <iOSGrid cols={3} className="mb-8">
        <iOSMetricCard
          title="Total Productos"
          value={stats.total}
          icon={Package}
          iconColor="#8B5CF6"
        />
        <iOSMetricCard
          title="Valor Inventario"
          value={formatMoney(stats.valor)}
          icon={Box}
          iconColor="#3B82F6"
        />
        <iOSMetricCard
          title="Bajo Stock"
          value={stats.bajoStock}
          icon={AlertTriangle}
          iconColor="#F43F5E"
          variant={stats.bajoStock > 0 ? 'warning' : 'default'}
        />
      </iOSGrid>

      <iOSTable
        title="Inventario"
        data={filteredData}
        columns={columns}
        keyField="id"
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: 'Buscar productos...'
        }}
        actions={[
          { label: 'Ajustar', onClick: () => {} },
          { label: 'Historial', variant: 'ghost', onClick: () => {} }
        ]}
        pagination={{
          currentPage: 1,
          totalPages: Math.ceil(filteredData.length / 10),
          onPageChange: () => {}
        }}
      />
    </iOSPageLayout>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
