'use client'

import { useClientesData } from '@/app/hooks/useDataHooks'
import { iOSPageLayout, iOSGrid, iOSLoading, iOSEmptyState, iOSButton } from './iOSIntegrationWrapper'
import { iOSMetricCard } from './iOSPremiumCards'
import { iOSTable, Column } from './iOSTableSystem'
import { formatMoney } from '@/app/_lib/utils/formatters'
import { Users, UserPlus, Phone, Mail, MapPin, AlertCircle, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CreateClienteModal } from '@/app/_components/modals/CreateClienteModal'
import { UserAvatar, StatusPill } from './iOSVisualComponents'

export function iOSClientesPanel() {
  const { data: clientes, loading, error, refetch } = useClientesData()
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Sparklines Mock
  const sparklines = useMemo(() => ({
    total: Array.from({ length: 15 }, () => 100 + Math.random() * 20),
    active: Array.from({ length: 15 }, () => 80 + Math.random() * 10),
    debt: Array.from({ length: 15 }, () => 5000 + Math.random() * 2000)
  }), [])

  const stats = useMemo(() => {
    if (!clientes) return { total: 0, active: 0, debt: 0 }
    return {
      total: clientes.length,
      active: clientes.filter(c => c.estado === 'activo').length,
      debt: clientes.reduce((acc, c) => acc + (c.saldoPendiente || 0), 0)
    }
  }, [clientes])

  const filteredData = useMemo(() => {
    if (!clientes) return []
    return clientes.filter(c => 
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [clientes, searchTerm])

  const columns: Column<any>[] = [
    {
      key: 'nombre',
      header: 'Cliente',
      render: (c) => (
        <UserAvatar name={c.nombre} subtext={c.email} />
      ),
      sortable: true
    },
    {
      key: 'telefono',
      header: 'Contacto',
      render: (c) => c.telefono ? (
        <div className="flex items-center gap-2 text-white/70 bg-white/5 px-2 py-1 rounded-lg w-fit">
          <Phone size={12} className="text-white/50" />
          <span className="text-xs">{c.telefono}</span>
        </div>
      ) : <span className="text-white/30">-</span>
    },
    {
      key: 'saldoPendiente',
      header: 'Saldo',
      render: (c) => c.saldoPendiente > 0 ? (
        <span className="text-rose-400 font-mono font-medium">{formatMoney(c.saldoPendiente)}</span>
      ) : <span className="text-emerald-400 font-medium text-xs bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Al día</span>,
      sortable: true
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (c) => (
        <StatusPill
          label={c.estado}
          variant={c.estado === 'activo' ? 'success' : 'neutral'}
          pulsing={c.estado === 'activo'}
        />
      )
    }
  ]

  if (loading && !clientes) return (
    <iOSPageLayout title="Clientes">
      <div className="h-[60vh] flex items-center justify-center">
        <iOSLoading text="Cargando clientes..." />
      </div>
    </iOSPageLayout>
  )

  if (error) return (
    <iOSPageLayout title="Clientes">
      <iOSEmptyState title="Error" description="No se pudieron cargar los clientes" action={{ label: 'Reintentar', onClick: refetch }} />
    </iOSPageLayout>
  )

  return (
    <iOSPageLayout 
      title="Clientes" 
      subtitle="Cartera de clientes y contactos"
      headerAction={
        <iOSButton 
          variant="primary" 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-violet-500 hover:bg-violet-600 text-white border-none shadow-lg shadow-violet-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </iOSButton>
      }
    >
      <iOSGrid cols={3} className="mb-8">
        <iOSMetricCard
          title="Total Clientes"
          value={stats.total}
          icon={Users}
          iconColor="#3B82F6"
          sparklineData={sparklines.total}
        />
        <iOSMetricCard
          title="Clientes Activos"
          value={stats.active}
          icon={UserPlus}
          iconColor="#10B981"
          sparklineData={sparklines.active}
        />
        <iOSMetricCard
          title="Deuda Total"
          value={formatMoney(stats.debt)}
          icon={AlertCircle}
          iconColor="#F43F5E"
          variant={stats.debt > 0 ? 'warning' : 'default'}
          sparklineData={sparklines.debt}
        />
      </iOSGrid>

      <iOSTable
        title="Directorio de Clientes"
        data={filteredData}
        columns={columns}
        keyField="id"
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: 'Buscar cliente...'
        }}
        pagination={{
          currentPage: 1,
          totalPages: Math.ceil(filteredData.length / 10),
          onPageChange: () => {}
        }}
      />

      <CreateClienteModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </iOSPageLayout>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
