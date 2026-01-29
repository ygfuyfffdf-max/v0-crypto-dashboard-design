'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌✨ AURORA CONTENT — Para integrar con el layout del Dashboard
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Contenido Aurora sin sidebar propio (usa el sidebar del dashboard)
 * Con tabs internos para navegar entre paneles Aurora
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { Home, Sparkles, Truck, Vault, Wallet } from 'lucide-react'
import React, { useState } from 'react'

// Components
import { AuroraBovedaPanel } from '@/app/_components/chronos-2026/panels'
import { AuroraDashboardUnified as AuroraDashboard } from '@/app/_components/chronos-2026/panels/AuroraDashboardUnified'
import { AuroraDistribuidoresPanelUnified as AuroraDistribuidoresPanel } from '@/app/_components/chronos-2026/panels/AuroraDistribuidoresPanelUnified'
import { AuroraMovimientosPanel } from '@/app/_components/chronos-2026/panels/AuroraMovimientosPanel'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type PanelType = 'dashboard' | 'bovedas' | 'distribuidores' | 'movimientos'

interface PanelConfig {
  id: PanelType
  label: string
  icon: React.ReactNode
  color: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const panels: PanelConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} />, color: '#8B5CF6' },
  { id: 'bovedas', label: 'Bóvedas', icon: <Vault size={18} />, color: '#8B5CF6' },
  { id: 'distribuidores', label: 'Distribuidores', icon: <Truck size={18} />, color: '#06B6D4' },
  { id: 'movimientos', label: 'Movimientos', icon: <Wallet size={18} />, color: '#10B981' },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TAB NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TabNavProps {
  panels: PanelConfig[]
  activePanel: PanelType
  onPanelChange: (_panel: PanelType) => void
}

function TabNav({ panels, activePanel, onPanelChange }: TabNavProps) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2 backdrop-blur-xl">
      {panels.map((panel) => {
        const isActive = activePanel === panel.id
        return (
          <motion.button
            key={panel.id}
            onClick={() => onPanelChange(panel.id)}
            className={cn(
              'relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
              isActive ? 'text-white' : 'text-white/50 hover:bg-white/5 hover:text-white',
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Active background */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                layoutId="aurora-tab-active"
                style={{
                  background: `linear-gradient(135deg, ${panel.color}30, ${panel.color}10)`,
                  border: `1px solid ${panel.color}50`,
                  boxShadow: `0 0 20px ${panel.color}20`,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}

            {/* Content */}
            <span
              className="relative z-10 transition-colors"
              style={{ color: isActive ? panel.color : undefined }}
            >
              {panel.icon}
            </span>
            <span className="relative z-10">{panel.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AuroraContent() {
  const [activePanel, setActivePanel] = useState<PanelType>('dashboard')

  const renderPanel = () => {
    switch (activePanel) {
      case 'dashboard':
        return <AuroraDashboard />
      case 'bovedas':
        return <AuroraBovedaPanel />
      case 'distribuidores':
        return <AuroraDistribuidoresPanel />
      case 'movimientos':
        return <AuroraMovimientosPanel />
      default:
        return <AuroraDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-[#030308]">
      {/* Header with tabs */}
      <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#030308]/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Aurora Premium</h1>
              <p className="text-xs text-white/40">Sistema Glassmorphism 2026</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <TabNav panels={panels} activePanel={activePanel} onPanelChange={setActivePanel} />
        </div>
      </div>

      {/* Panel Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePanel}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderPanel()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default AuroraContent
