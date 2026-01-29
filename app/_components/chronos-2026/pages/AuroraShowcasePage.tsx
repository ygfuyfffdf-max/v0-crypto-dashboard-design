'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌✨ CHRONOS AURORA SHOWCASE — PAGE DEMO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Página de demostración del sistema Aurora completo:
 * - Navegación entre paneles
 * - Aurora Dashboard completo
 * - Panel Bóvedas
 * - Panel Distribuidores
 * - Panel Movimientos
 * - Widget IA siempre visible
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { BarChart3, Home, Settings, Truck, Vault, Wallet } from 'lucide-react'
import React, { useState } from 'react'

// Components
import { AuroraBovedaPanel } from '../panels'
import { AuroraDashboardUnified as AuroraDashboard } from '../panels/AuroraDashboardUnified'
import { AuroraDistribuidoresPanelUnified as AuroraDistribuidoresPanel } from '../panels/AuroraDistribuidoresPanelUnified'
import { AuroraMovimientosPanel } from '../panels/AuroraMovimientosPanel'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NAVIGATION SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NavItemProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
  color: string
}

function NavItem({ icon, label, isActive, onClick, color }: NavItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all',
        isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white',
      )}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute top-1/2 left-0 h-1/2 w-1 -translate-y-1/2 rounded-r-full"
          style={{ background: color, boxShadow: `0 0 15px ${color}` }}
          layoutId="nav-indicator"
        />
      )}

      {/* Icon */}
      <span
        className={cn('transition-colors', isActive && 'drop-shadow-lg')}
        style={{ color: isActive ? color : undefined }}
      >
        {icon}
      </span>

      {/* Label */}
      <span className="text-sm font-medium">{label}</span>

      {/* Glow effect */}
      {isActive && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(circle at 20% 50%, ${color}20, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN SHOWCASE PAGE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type PanelType = 'dashboard' | 'bovedas' | 'distribuidores' | 'movimientos'

const panels: Array<{
  id: PanelType
  label: string
  icon: React.ReactNode
  color: string
}> = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} />, color: '#8B5CF6' },
  { id: 'bovedas', label: 'Bóvedas', icon: <Vault size={20} />, color: '#8B5CF6' },
  { id: 'distribuidores', label: 'Distribuidores', icon: <Truck size={20} />, color: '#06B6D4' },
  { id: 'movimientos', label: 'Movimientos', icon: <Wallet size={20} />, color: '#10B981' },
]

export default function AuroraShowcasePage() {
  const [activePanel, setActivePanel] = useState<PanelType>('dashboard')
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)

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
    <div className="flex min-h-screen bg-[#030308]">
      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full',
          'border-r border-white/[0.06] bg-black/40 backdrop-blur-xl',
          'flex flex-col',
        )}
        initial={{ width: 240 }}
        animate={{ width: isNavCollapsed ? 72 : 240 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="border-b border-white/[0.06] p-4">
          <motion.div
            className="flex items-center gap-3"
            animate={{ justifyContent: isNavCollapsed ? 'center' : 'flex-start' }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500">
              <BarChart3 className="text-white" size={20} />
            </div>
            <AnimatePresence>
              {!isNavCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <h1 className="text-lg font-bold whitespace-nowrap text-white">CHRONOS</h1>
                  <p className="text-xs whitespace-nowrap text-white/40">Aurora 2026</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {panels.map((panel) => (
            <div key={panel.id}>
              {isNavCollapsed ? (
                <motion.button
                  onClick={() => setActivePanel(panel.id)}
                  className={cn(
                    'relative mx-auto flex h-12 w-12 items-center justify-center rounded-xl transition-all',
                    activePanel === panel.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:bg-white/5 hover:text-white',
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    color: activePanel === panel.id ? panel.color : undefined,
                    boxShadow: activePanel === panel.id ? `0 0 20px ${panel.color}30` : undefined,
                  }}
                  title={panel.label}
                >
                  {panel.icon}
                </motion.button>
              ) : (
                <NavItem
                  icon={panel.icon}
                  label={panel.label}
                  isActive={activePanel === panel.id}
                  onClick={() => setActivePanel(panel.id)}
                  color={panel.color}
                />
              )}
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-white/[0.06] p-3">
          <motion.button
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
            className="flex w-full items-center justify-center rounded-xl bg-white/5 p-3 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={{ rotate: isNavCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Settings size={18} />
            </motion.div>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: isNavCollapsed ? 72 : 240 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activePanel}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPanel()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
