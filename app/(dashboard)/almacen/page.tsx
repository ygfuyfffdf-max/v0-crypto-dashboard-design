import { Metadata } from 'next'
import { AlmacenPageClient } from './AlmacenPageClient'

export const metadata: Metadata = {
  title: 'Almacén | CHRONOS 2026',
  description: 'Control de inventario y stock en tiempo real',
}

export default function AlmacenPage() {
  return <AlmacenPageClient />
}
