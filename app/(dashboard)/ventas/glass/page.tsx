import { AuroraVentasPanelUnified } from '@/app/_components/chronos-2026/panels'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ventas Glass | CHRONOS 2026',
  description: 'Gestión de ventas con diseño Aurora Glassmorphism Premium',
}

export default function VentasGlassPage() {
  return <AuroraVentasPanelUnified />
}
