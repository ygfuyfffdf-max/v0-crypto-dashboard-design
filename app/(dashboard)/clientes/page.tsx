import { Metadata } from 'next'
import { ClientesPageClient } from './ClientesPageClient'

export const metadata: Metadata = {
  title: 'Clientes | CHRONOS Supreme 2026',
  description: 'Gestión suprema de clientes con Aurora Glassmorphism',
}

export default function ClientesPage() {
  return <ClientesPageClient />
}
