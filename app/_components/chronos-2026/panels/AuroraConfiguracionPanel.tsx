'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * ⚙️ AURORA CONFIGURACIÓN PANEL — Panel de configuración unificado
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Panel completo de configuración con:
 * ▸ Selector de temas
 * ▸ Configuración de audio y hápticos
 * ▸ Preferencias de interfaz
 * ▸ Información del sistema
 * 
 * @version 1.0.0 — OMEGA SUPREME EDITION
 */

import { motion } from 'framer-motion'
import { cn } from '@/app/_lib/utils'
import { useFeedback } from '@/app/hooks/useSupremeSystems'
import { ThemeSelector } from '../widgets/ThemeSelectorWidget'
import { SoundSettings } from '../widgets/SoundSettingsWidget'
import {
  Settings,
  Palette,
  Volume2,
  Eye,
  Bell,
  Shield,
  Database,
  Info,
  ChevronRight,
  Sparkles,
  Zap,
  Globe,
  Layers,
} from 'lucide-react'
import { useState } from 'react'
import { AuroraButtonEnhanced, AuroraCardEnhanced, AuroraTabsEnhanced } from '../../ui/AuroraEnhancedSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type SettingsSection = 'apariencia' | 'audio' | 'interfaz' | 'notificaciones' | 'sistema'

interface SettingsTab {
  id: SettingsSection
  label: string
  icon: React.ReactNode
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📱 INTERFACE SETTINGS — Configuración de interfaz
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function InterfaceSettings() {
  const feedback = useFeedback()
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [particlesEnabled, setParticlesEnabled] = useState(true)
  const [compactMode, setCompactMode] = useState(false)

  const SettingToggle = ({ 
    enabled, 
    onChange, 
    label, 
    description 
  }: { 
    enabled: boolean
    onChange: (v: boolean) => void
    label: string
    description: string 
  }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <span className="text-white font-medium">{label}</span>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => {
          feedback.click()
          onChange(!enabled)
        }}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200',
          enabled ? 'bg-violet-500' : 'bg-white/20'
        )}
      >
        <motion.div
          className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md"
          animate={{ x: enabled ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
          <Eye className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Interfaz</h3>
          <p className="text-sm text-gray-400">Ajusta la experiencia visual</p>
        </div>
      </div>

      <div className="space-y-1 p-4 rounded-xl bg-white/5 border border-white/10">
        <SettingToggle
          enabled={animationsEnabled}
          onChange={setAnimationsEnabled}
          label="Animaciones"
          description="Efectos de transición y movimiento"
        />
        <div className="border-t border-white/10" />
        <SettingToggle
          enabled={particlesEnabled}
          onChange={setParticlesEnabled}
          label="Partículas 3D"
          description="Efectos visuales de fondo (puede afectar rendimiento)"
        />
        <div className="border-t border-white/10" />
        <SettingToggle
          enabled={compactMode}
          onChange={setCompactMode}
          label="Modo compacto"
          description="Reduce el espaciado para ver más información"
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔔 NOTIFICATION SETTINGS — Configuración de notificaciones
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function NotificationSettings() {
  const feedback = useFeedback()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [soundNotifications, setSoundNotifications] = useState(true)

  const SettingToggle = ({ 
    enabled, 
    onChange, 
    label, 
    description,
    color = 'violet'
  }: { 
    enabled: boolean
    onChange: (v: boolean) => void
    label: string
    description: string
    color?: 'violet' | 'emerald' | 'amber'
  }) => {
    const colors = {
      violet: 'bg-violet-500',
      emerald: 'bg-emerald-500',
      amber: 'bg-amber-500',
    }

    return (
      <div className="flex items-center justify-between py-3">
        <div>
          <span className="text-white font-medium">{label}</span>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
        <button
          onClick={() => {
            feedback.click()
            onChange(!enabled)
          }}
          className={cn(
            'relative w-11 h-6 rounded-full transition-colors duration-200',
            enabled ? colors[color] : 'bg-white/20'
          )}
        >
          <motion.div
            className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md"
            animate={{ x: enabled ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Notificaciones</h3>
          <p className="text-sm text-gray-400">Configura las alertas del sistema</p>
        </div>
      </div>

      <div className="space-y-1 p-4 rounded-xl bg-white/5 border border-white/10">
        <SettingToggle
          enabled={emailNotifications}
          onChange={setEmailNotifications}
          label="Email"
          description="Recibe resúmenes diarios por correo"
          color="emerald"
        />
        <div className="border-t border-white/10" />
        <SettingToggle
          enabled={pushNotifications}
          onChange={setPushNotifications}
          label="Push"
          description="Notificaciones en tiempo real"
          color="violet"
        />
        <div className="border-t border-white/10" />
        <SettingToggle
          enabled={soundNotifications}
          onChange={setSoundNotifications}
          label="Sonido"
          description="Alerta sonora en notificaciones importantes"
          color="amber"
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💾 SYSTEM INFO — Información del sistema
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function SystemInfo() {
  const feedback = useFeedback()

  const systemStats = [
    { label: 'Versión', value: '2026.1.0', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Build', value: 'OMEGA SUPREME', icon: <Zap className="w-4 h-4" /> },
    { label: 'Framework', value: 'Next.js 16 + React 19', icon: <Globe className="w-4 h-4" /> },
    { label: 'Base de datos', value: 'Turso (LibSQL)', icon: <Database className="w-4 h-4" /> },
    { label: 'UI System', value: 'Aurora Glass Gen5', icon: <Layers className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Sistema</h3>
          <p className="text-sm text-gray-400">Información de CHRONOS INFINITY</p>
        </div>
      </div>

      <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
        {systemStats.map((stat, index) => (
          <div 
            key={stat.label}
            className={cn(
              'flex items-center justify-between py-2',
              index < systemStats.length - 1 && 'border-b border-white/10'
            )}
          >
            <div className="flex items-center gap-2 text-gray-400">
              {stat.icon}
              <span className="text-sm">{stat.label}</span>
            </div>
            <span className="text-sm text-white font-medium">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <AuroraButtonEnhanced
          variant="secondary"
          size="sm"
          feedbackType="refresh"
          onClick={() => feedback.notification()}
          className="flex-1"
        >
          Verificar actualizaciones
        </AuroraButtonEnhanced>
        <AuroraButtonEnhanced
          variant="ghost"
          size="sm"
          feedbackType="click"
          className="flex-1"
        >
          Reportar problema
        </AuroraButtonEnhanced>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚙️ MAIN SETTINGS PANEL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraConfiguracionPanelProps {
  className?: string
}

export function AuroraConfiguracionPanel({ className }: AuroraConfiguracionPanelProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('apariencia')

  const tabs: SettingsTab[] = [
    { id: 'apariencia', label: 'Apariencia', icon: <Palette className="w-4 h-4" /> },
    { id: 'audio', label: 'Audio', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'interfaz', label: 'Interfaz', icon: <Eye className="w-4 h-4" /> },
    { id: 'notificaciones', label: 'Alertas', icon: <Bell className="w-4 h-4" /> },
    { id: 'sistema', label: 'Sistema', icon: <Info className="w-4 h-4" /> },
  ]

  const renderSection = () => {
    switch (activeSection) {
      case 'apariencia':
        return <ThemeSelector layout="grid" />
      case 'audio':
        return <SoundSettings />
      case 'interfaz':
        return <InterfaceSettings />
      case 'notificaciones':
        return <NotificationSettings />
      case 'sistema':
        return <SystemInfo />
      default:
        return null
    }
  }

  return (
    <div className={cn('min-h-screen', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Configuración</h1>
            <p className="text-gray-400">Personaliza tu experiencia CHRONOS</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <AuroraTabsEnhanced
        tabs={tabs.map(t => ({ id: t.id, label: t.label, icon: t.icon }))}
        activeTab={activeSection}
        onChange={(id) => setActiveSection(id as SettingsSection)}
        variant="pills"
        className="mb-8"
      />

      {/* Content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <AuroraCardEnhanced padding="lg">
          {renderSection()}
        </AuroraCardEnhanced>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { InterfaceSettings, NotificationSettings, SystemInfo }
export type { AuroraConfiguracionPanelProps, SettingsSection }
