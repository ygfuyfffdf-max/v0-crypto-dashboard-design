import { Metadata } from 'next'
import { IASentientPageClient } from './IASentientPageClient'

export const metadata: Metadata = {
  title: 'CHRONOS AI — Asistente Inteligente | CHRONOS INFINITY 2026',
  description:
    'Panel premium de inteligencia artificial con Orb 3D, chat contextual y métricas en tiempo real',
}

export default function IAPage() {
  // Usar el cliente que tiene el handler conectado a la API
  return <IASentientPageClient />
}
