'use client'

import { Card } from '@/app/_components/ui/card'

export function GastosPageClient() {
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <Card className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Gastos</h1>
        <p className="text-gray-400 mb-6">Control de Egresos</p>
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Panel de Gastos</h2>
          <p className="text-gray-400">Funcionalidad de gastos en desarrollo</p>
        </div>
      </Card>
    </div>
  )
}
