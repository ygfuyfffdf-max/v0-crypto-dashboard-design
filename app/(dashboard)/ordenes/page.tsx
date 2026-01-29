import { Metadata } from 'next'
import { OrdenesPageClient } from './OrdenesPageClient'

export const metadata: Metadata = {
  title: 'Órdenes de Compra | CHRONOS 2026',
  description: 'Gestión de órdenes de compra con distribución GYA',
}

export default function OrdenesPage() {
  return <OrdenesPageClient />
}
