/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🤖 AI SUPREME SHOWCASE — Demo Page
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { AIPanelSupreme } from '@/app/_components/panels'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IA Supreme | CHRONOS Elite',
  description:
    'Panel de IA ultra-avanzado con 3D neural orb, voice bidireccional y múltiples modos',
}

export default function AISupremePage() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Grid Background */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
            IA Supreme Panel
          </h1>
          <p className="text-lg text-gray-400">
            Sistema de IA ultra-avanzado con visualización 3D, voz bidireccional y análisis en
            tiempo real
          </p>
        </div>

        {/* Main Panel */}
        <div className="h-[calc(100vh-200px)] overflow-hidden rounded-3xl border border-white/10 bg-gray-900/50 shadow-2xl backdrop-blur-xl">
          <AIPanelSupreme showMetrics enableVoice initialMode="chat" />
        </div>

        {/* Features Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: '🎮',
              title: 'Neural Orb 3D',
              description: 'Visualización WebGL con partículas dinámicas y física spring',
            },
            {
              icon: '🎙️',
              title: 'Voz Bidireccional',
              description: 'Speech-to-Text y Text-to-Speech con visualizador de audio premium',
            },
            {
              icon: '🧠',
              title: '4 Modos IA',
              description: 'Chat, Análisis, Predicciones e Insights con datos en tiempo real',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:border-white/20"
            >
              <div className="mb-3 text-4xl">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-bold text-white">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>

              {/* Hover gradient */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
