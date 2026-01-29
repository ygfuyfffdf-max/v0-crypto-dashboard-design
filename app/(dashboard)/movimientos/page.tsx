import { Metadata } from 'next'
import { AuroraMovimientosPageClient } from './AuroraMovimientosPageClient'

export const metadata: Metadata = {
  title: 'Movimientos | CHRONOS Aurora 2026',
  description: 'Historial de movimientos financieros con glassmorphism aurora boreal',
}

export default function MovimientosPage() {
  return <AuroraMovimientosPageClient />
}
