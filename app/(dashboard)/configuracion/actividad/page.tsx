'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 ADMIN ACTIVITY PAGE — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { AdminActivityDashboard } from '@/app/_components/admin/AdminActivityDashboard'
import { useCallback } from 'react'
import { toast } from 'sonner'

export default function AdminActivityPage() {
  const handleRefresh = useCallback(() => {
    toast.info('Actualizando datos...')
    // En producción, recargar datos del servidor
  }, [])

  const handleAprobar = useCallback((id: string) => {
    toast.success('Solicitud aprobada correctamente')
    // En producción, llamar a aprobarSolicitud(id, ...)
  }, [])

  const handleRechazar = useCallback((id: string, motivo: string) => {
    const motivoFinal = prompt('Ingresa el motivo del rechazo:')
    if (motivoFinal) {
      toast.error('Solicitud rechazada')
      // En producción, llamar a rechazarSolicitud(id, ..., motivoFinal)
    }
  }, [])

  const handleResolverAlerta = useCallback((id: string) => {
    toast.success('Alerta resuelta')
    // En producción, marcar alerta como resuelta
  }, [])

  return (
    <div className="container mx-auto px-6 py-8">
      <AdminActivityDashboard
        onRefresh={handleRefresh}
        onAprobar={handleAprobar}
        onRechazar={handleRechazar}
        onResolverAlerta={handleResolverAlerta}
      />
    </div>
  )
}
