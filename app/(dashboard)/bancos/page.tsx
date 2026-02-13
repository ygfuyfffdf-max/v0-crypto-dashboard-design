import { Metadata } from 'next'
import { BancosPageClient } from './BancosPageClient'

export const metadata: Metadata = {
  title: 'Bancos | CHRONOS Supreme 2026',
  description: 'Gestión de capital y bóvedas con Aurora Glassmorphism',
}

export default function BancosPage() {
  return <BancosPageClient />
}
