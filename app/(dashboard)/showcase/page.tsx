'use client'

import dynamic from 'next/dynamic'

// KOCMOC Showcase - Silver Space Edition
const KocmocShowcase = dynamic(
  () => import('@/app/_components/cinematics/KocmocShowcase').then((mod) => mod.KocmocShowcase),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white/40 text-sm tracking-widest">CARGANDO...</div>
      </div>
    ),
  }
)

export default function ShowcasePage() {
  return <KocmocShowcase />
}
