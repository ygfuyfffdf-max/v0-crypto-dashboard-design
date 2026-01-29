import { Metadata } from 'next'
import { GastosPageClient } from './GastosPageClient'

export const metadata: Metadata = {
  title: 'Gastos | CHRONOS 2026',
  description: 'Gestión completa de gastos y egresos bancarios',
}

export default function GastosPage() {
  return <GastosPageClient />
}
