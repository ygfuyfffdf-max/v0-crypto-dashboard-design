import { Metadata } from 'next'
import { VentasPageClient } from './VentasPageClient'

export const metadata: Metadata = {
  title: 'Ventas | CHRONOS Supreme 2026',
  description: 'Gestión suprema de ventas con Aurora Glassmorphism',
}

export default function VentasPage() {
  return <VentasPageClient />
}
