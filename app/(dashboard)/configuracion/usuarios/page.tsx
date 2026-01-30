/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 👥 USER MANAGEMENT PAGE — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { Metadata } from 'next'
import { Suspense } from 'react'
import { UserManagementPanel } from '@/app/_components/admin/UserManagementPanel'

export const metadata: Metadata = {
  title: 'Gestión de Usuarios | CHRONOS Premium 2026',
  description: 'Administración de usuarios y permisos del sistema',
}

export const dynamic = 'force-dynamic'

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
        </div>
      }
    >
      <div className="container mx-auto px-6 py-8">
        <UserManagementPanel />
      </div>
    </Suspense>
  )
}
