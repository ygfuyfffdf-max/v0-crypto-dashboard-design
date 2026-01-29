import { Metadata } from 'next'
import { DistribuidoresPageClient } from './DistribuidoresPageClient'

export const metadata: Metadata = {
  title: 'Distribuidores | CHRONOS Aurora 2026',
  description: 'Gestión de distribuidores con glassmorphism aurora boreal',
}

export default function DistribuidoresPage() {
  return <DistribuidoresPageClient />
}
