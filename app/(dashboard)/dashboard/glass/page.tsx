import { AuroraDashboardUnified } from '@/app/_components/chronos-2026/panels'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard Glass | CHRONOS 2026',
  description: 'Dashboard Premium con diseño Aurora Glassmorphism',
}

export default function DashboardGlassPage() {
  return <AuroraDashboardUnified />
}
