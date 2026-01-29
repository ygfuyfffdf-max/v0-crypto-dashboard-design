'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ⚙️ QUICK SETTINGS PANEL — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * Panel de configuración rápida accesible desde el header
 */

import { cn } from '@/app/_lib/utils'
import { useCurrency } from '@/app/hooks/useCurrency'
import { AnimatePresence, motion } from 'motion/react'
import {
  Bell,
  Contrast,
  DollarSign,
  ExternalLink,
  Globe,
  Keyboard,
  Moon,
  Palette,
  Settings,
  Sun,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuickSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

type ThemeMode = 'dark' | 'light' | 'system'
type AccentColor = 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose'

interface QuickSettings {
  theme: ThemeMode
  accentColor: AccentColor
  soundEnabled: boolean
  notificationsEnabled: boolean
  animations: 'full' | 'reduced' | 'none'
  language: 'es' | 'en'
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ACCENT COLORS CONFIG
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const accentColors: { id: AccentColor; label: string; color: string }[] = [
  { id: 'violet', label: 'Violeta', color: '#8B5CF6' },
  { id: 'cyan', label: 'Cyan', color: '#06B6D4' },
  { id: 'emerald', label: 'Esmeralda', color: '#10B981' },
  { id: 'amber', label: 'Ámbar', color: '#F59E0B' },
  { id: 'rose', label: 'Rosa', color: '#F43F5E' },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CURRENCY SECTION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function CurrencySection() {
  const {
    displayCurrency,
    exchangeRate,
    showDualCurrency,
    setDisplayCurrency,
    setExchangeRate,
    setShowDualCurrency,
  } = useCurrency()

  const presetRates = [17.00, 17.50, 18.00, 18.50, 19.00]

  return (
    <div>
      <h4 className="mb-3 flex items-center gap-2 text-xs font-medium tracking-wider text-white/40 uppercase">
        <DollarSign size={14} />
        Moneda
      </h4>

      {/* Display Currency */}
      <div className="flex gap-2 mb-3">
        {(['USD', 'MXN'] as const).map((currency) => (
          <button
            key={currency}
            onClick={() => setDisplayCurrency(currency)}
            className={cn(
              'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
              displayCurrency === currency
                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10',
            )}
          >
            {currency === 'USD' ? 'Dólares' : 'Pesos MX'}
          </button>
        ))}
      </div>

      {/* Exchange Rate */}
      <div className="mb-3">
        <label className="block text-xs text-white/40 mb-2">
          Tipo de cambio (1 USD = MXN)
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {presetRates.map((rate) => (
            <button
              key={rate}
              onClick={() => setExchangeRate(rate)}
              className={cn(
                'px-2.5 py-1.5 rounded text-xs transition-colors',
                Math.abs(exchangeRate - rate) < 0.01
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              )}
            >
              ${rate.toFixed(2)}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Currency Toggle */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <span className="text-white/60">💱</span>
          <span className="text-sm text-white/80">Mostrar conversión</span>
        </div>
        <button
          onClick={() => setShowDualCurrency(!showDualCurrency)}
          className={cn(
            'relative h-6 w-11 rounded-full transition-colors',
            showDualCurrency ? 'bg-emerald-500' : 'bg-white/20',
          )}
        >
          <motion.div
            className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-md"
            animate={{ left: showDualCurrency ? 'calc(100% - 20px)' : '4px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      <div className="mt-2 text-xs text-white/30 text-center">
        1 USD = {exchangeRate.toFixed(2)} MXN
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TOGGLE SWITCH COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function ToggleSwitch({
  enabled,
  onChange,
  label,
  icon,
}: {
  enabled: boolean
  onChange: (value: boolean) => void
  label: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span className="text-white/60">{icon}</span>
        <span className="text-sm text-white/80">{label}</span>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          enabled ? 'bg-violet-500' : 'bg-white/20',
        )}
        role="switch"
        aria-checked={enabled}
      >
        <motion.div
          className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-md"
          animate={{ left: enabled ? 'calc(100% - 20px)' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function QuickSettingsPanel({ isOpen, onClose }: QuickSettingsPanelProps) {
  const [settings, setSettings] = useState<QuickSettings>({
    theme: 'dark',
    accentColor: 'violet',
    soundEnabled: true,
    notificationsEnabled: true,
    animations: 'full',
    language: 'es',
  })

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
    return undefined
  }, [isOpen, onClose])

  // Update setting
  const updateSetting = useCallback(
    <K extends keyof QuickSettings>(key: K, value: QuickSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }))
      // TODO: Persistir en localStorage o API
    },
    [],
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed top-16 right-4 z-50 w-80 overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-cyan-400" />
                <h3 className="font-semibold text-white">Configuración Rápida</h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Settings Sections */}
            <div className="space-y-5 p-4">
              {/* Theme */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-xs font-medium tracking-wider text-white/40 uppercase">
                  <Contrast size={14} />
                  Tema
                </h4>
                <div className="flex gap-2">
                  {[
                    { id: 'dark' as ThemeMode, icon: <Moon size={16} />, label: 'Oscuro' },
                    { id: 'light' as ThemeMode, icon: <Sun size={16} />, label: 'Claro' },
                    { id: 'system' as ThemeMode, icon: <Zap size={16} />, label: 'Sistema' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => updateSetting('theme', theme.id)}
                      className={cn(
                        'flex flex-1 flex-col items-center gap-1.5 rounded-xl p-3 transition-all',
                        settings.theme === theme.id
                          ? 'bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      {theme.icon}
                      <span className="text-xs">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-xs font-medium tracking-wider text-white/40 uppercase">
                  <Palette size={14} />
                  Color de acento
                </h4>
                <div className="flex justify-between">
                  {accentColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => updateSetting('accentColor', color.id)}
                      className={cn(
                        'relative flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110',
                        settings.accentColor === color.id &&
                          'ring-2 ring-white ring-offset-2 ring-offset-gray-900',
                      )}
                      style={{ backgroundColor: color.color }}
                      title={color.label}
                    >
                      {settings.accentColor === color.id && (
                        <motion.div
                          layoutId="accent-check"
                          className="h-2 w-2 rounded-full bg-white"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-1">
                <h4 className="mb-3 flex items-center gap-2 text-xs font-medium tracking-wider text-white/40 uppercase">
                  <Zap size={14} />
                  Preferencias
                </h4>

                <ToggleSwitch
                  enabled={settings.soundEnabled}
                  onChange={(v) => updateSetting('soundEnabled', v)}
                  label="Sonidos"
                  icon={settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                />

                <ToggleSwitch
                  enabled={settings.notificationsEnabled}
                  onChange={(v) => updateSetting('notificationsEnabled', v)}
                  label="Notificaciones"
                  icon={<Bell size={16} />}
                />
              </div>

              {/* Animations */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-xs font-medium tracking-wider text-white/40 uppercase">
                  <Zap size={14} />
                  Animaciones
                </h4>
                <div className="flex gap-2">
                  {[
                    { id: 'full' as const, label: 'Completas' },
                    { id: 'reduced' as const, label: 'Reducidas' },
                    { id: 'none' as const, label: 'Ninguna' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateSetting('animations', opt.id)}
                      className={cn(
                        'flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all',
                        settings.animations === opt.id
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-white/5 text-white/60 hover:bg-white/10',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-xs font-medium tracking-wider text-white/40 uppercase">
                  <Globe size={14} />
                  Idioma
                </h4>
                <div className="flex gap-2">
                  {[
                    { id: 'es' as const, label: 'Español', flag: '🇪🇸' },
                    { id: 'en' as const, label: 'English', flag: '🇺🇸' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => updateSetting('language', lang.id)}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-all',
                        settings.language === lang.id
                          ? 'bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30'
                          : 'bg-white/5 text-white/60 hover:bg-white/10',
                      )}
                    >
                      <span>{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency - Tipo de Cambio */}
              <CurrencySection />
            </div>

            {/* Footer - Link to full settings */}
            <div className="border-t border-white/5 p-3">
              <Link
                href="/configuracion"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Keyboard size={14} />
                Configuración avanzada
                <ExternalLink size={12} />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default QuickSettingsPanel
