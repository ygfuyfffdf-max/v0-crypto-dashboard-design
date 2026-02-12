'use client'

import { useDistribuidoresData } from '@/app/hooks/useDataHooks'
import { iOSPageLayout, iOSGrid, iOSLoading, iOSEmptyState, iOSButton } from './iOSIntegrationWrapper'
import { iOSMetricCard } from './iOSPremiumCards'
import { iOSVirtualizedTable, Column } from './iOSTableSystem'
import { Truck, Phone, Mail, Package, FileText, Plus, AlertCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { UserAvatar, StatusPill } from './iOSVisualComponents'
import { formatMoney } from '@/app/_lib/utils/formatters'

export function iOSDistribuidoresPanel() {
  const { data: distribuidores, loading, error, refetch } = useDistribuidoresData()
  const [searchTerm, setSearchTerm] = useState('')

  // Sparklines Mock
  const sparklines = useMemo(() => ({
    total: Array.from({ length: 15 }, () => 10 + Math.random() * 5),
    active: Array.from({ length: 15 }, () => 8 + Math.random() * 2)
  }), [])

  const filteredData = useMemo(() => {
    if (!distribuidores) return []
    return distribuidores.filter(d => 
      d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [distribuidores, searchTerm])

  const columns: Column<any>[] = [
    {
      key: 'nombre',
      header: 'Distribuidor',
      render: (d) => (
        <UserAvatar name={d.nombre} subtext={d.empresa} />
      ),
      sortable: true
    },
    {
      key: 'contacto',
      header: 'Contacto',
      render: (d) => (
        <div className="flex flex-col gap-1">
          {d.telefono && (
            <div className="flex items-center gap-1.5 text-xs text-white/60 bg-white/5 px-2 py-1 rounded-lg w-fit">
              <Phone size={10} /> {d.telefono}
            </div>
          )}
        </div>
      ),
      hideOnMobile: true
    },
    {
      key: 'saldoPendiente',
      header: 'Saldo',
      render: (d) => d.saldoPendiente > 0 ? (
        <span className="text-rose-400 font-mono font-medium">{formatMoney(d.saldoPendiente)}</span>
      ) : <span className="text-emerald-400 font-medium text-xs bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Al día</span>,
      sortable: true,
      width: 120
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (d) => (
        <StatusPill
          label={d.estado}
          variant={d.estado === 'activo' ? 'success' : 'neutral'}
          pulsing={d.estado === 'activo'}
        />
      ),
      width: 100
    }
  ]

  if (loading && !distribuidores) return (
    <iOSPageLayout title="Distribuidores">
      <div className="h-[60vh] flex items-center justify-center">
        <iOSLoading text="Cargando distribuidores..." />
      </div>
    </iOSPageLayout>
  )

  if (error) return (
    <iOSPageLayout title="Distribuidores">
      <iOSEmptyState title="Error" description="No se pudieron cargar los distribuidores" action={{ label: 'Reintentar', onClick: refetch }} />
    </iOSPageLayout>
  )

  return (
    <iOSPageLayout 
      title="Distribuidores" 
      subtitle="Proveedores y logística"
      headerAction={
        <iOSButton 
          variant="primary" 
          onClick={() => {}} // TODO: Create Distributor Modal
          className="bg-indigo-500 hover:bg-indigo-600 text-white border-none shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
        </iOSButton>
      }
    >
      <iOSGrid cols={2} className="mb-8">
        <iOSMetricCard
          title="Total Distribuidores"
          value={distribuidores?.length || 0}
          icon={Truck}
          iconColor="#8B5CF6"
          sparklineData={sparklines.total}
        />
        <iOSMetricCard
          title="Activos"
          value={distribuidores?.filter(d => d.estado === 'activo').length || 0}
          icon={Package}
          iconColor="#10B981"
          sparklineData={sparklines.active}
        />
      </iOSGrid>

      <iOSVirtualizedTable
        title="Lista de Proveedores"
        subtitle={`${filteredData.length} proveedores registrados`}
        data={filteredData}
        columns={columns}
        keyField="id"
        height="600px"
        rowHeight={64}
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: 'Buscar distribuidores...'
        }}
        actions={[
          { label: 'Estado Cuenta', icon: FileText, onClick: (d) => console.log('Estado de cuenta', d) },
          { label: 'Nueva Orden', variant: 'success', icon: Plus, onClick: (d) => console.log('Nueva orden', d) }
        ]}
      />
    </iOSPageLayout>
  )
}
