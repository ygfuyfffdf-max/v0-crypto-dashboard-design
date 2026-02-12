'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎨 THEME SELECTOR — Selector de temas dinámicos premium
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Panel de selección de temas con:
 * ▸ Vista previa en tiempo real
 * ▸ 5 temas disponibles (dark, light, cyber, aurora, midnight)
 * ▸ Transiciones suaves entre temas
 * ▸ Feedback de sonido y háptico
 * 
 * @version 1.0.0 — OMEGA SUPREME EDITION
 */

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/app/_lib/utils'
import { useTheme, useFeedback } from '@/app/hooks/useSupremeSystems'
import { Check, Sun, Moon, Sparkles, Waves, CloudMoon, Monitor, Palette } from 'lucide-react'
import type { ThemeMode } from '@/app/_lib/systems/SupremeSystemsHub'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// THEME CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ThemeOption {
  id: ThemeMode
  name: string
  description: string
  icon: React.ReactNode
  preview: {
    bg: string
    text: string
    accent: string
    border: string
  }
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'dark',
    name: 'Oscuro',
    description: 'Elegante y profesional',
    icon: <Moon className="w-5 h-5" />,
    preview: {
      bg: '#0a0a0f',
      text: '#ffffff',
      accent: '#8B5CF6',
      border: 'rgba(255, 255, 255, 0.1)',
    },
  },
  {
    id: 'light',
    name: 'Claro',
    description: 'Limpio y minimalista',
    icon: <Sun className="w-5 h-5" />,
    preview: {
      bg: '#ffffff',
      text: '#111827',
      accent: '#8B5CF6',
      border: 'rgba(0, 0, 0, 0.1)',
    },
  },
  {
    id: 'cyber',
    name: 'Cyber',
    description: 'Futurista y neón',
    icon: <Sparkles className="w-5 h-5" />,
    preview: {
      bg: '#000000',
      text: '#00ff88',
      accent: '#00d9ff',
      border: 'rgba(0, 255, 136, 0.2)',
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Vibrante y colorido',
    icon: <Waves className="w-5 h-5" />,
    preview: {
      bg: '#0c0a1d',
      text: '#f0eaff',
      accent: '#a855f7',
      border: 'rgba(168, 85, 247, 0.2)',
    },
  },
  {
    id: 'midnight',
    name: 'Medianoche',
    description: 'Profundo y sereno',
    icon: <CloudMoon className="w-5 h-5" />,
    preview: {
      bg: '#020617',
      text: '#f1f5f9',
      accent: '#3b82f6',
      border: 'rgba(71, 85, 105, 0.4)',
    },
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 THEME CARD — Individual theme option card
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ThemeCardProps {
  option: ThemeOption
  isActive: boolean
  onSelect: () => void
}

function ThemeCard({ option, isActive, onSelect }: ThemeCardProps) {
  const feedback = useFeedback()

  const handleClick = () => {
    if (!isActive) {
      feedback.tabSwitch()
      onSelect()
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative w-full p-4 rounded-xl text-left transition-all duration-300',
        'border-2',
        isActive
          ? 'border-violet-500 bg-violet-500/10'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
      )}
    >
      {/* Preview mini-window */}
      <div 
        className="relative w-full h-24 rounded-lg mb-3 overflow-hidden"
        style={{ backgroundColor: option.preview.bg, border: `1px solid ${option.preview.border}` }}
      >
        {/* Mock header */}
        <div 
          className="h-4 px-2 flex items-center gap-1"
          style={{ backgroundColor: option.preview.border }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>
        
        {/* Mock content */}
        <div className="p-2 space-y-1.5">
          <div 
            className="h-2 w-16 rounded-full"
            style={{ backgroundColor: option.preview.accent }}
          />
          <div 
            className="h-1.5 w-24 rounded-full opacity-60"
            style={{ backgroundColor: option.preview.text }}
          />
          <div 
            className="h-1.5 w-20 rounded-full opacity-40"
            style={{ backgroundColor: option.preview.text }}
          />
          <div className="flex gap-1 mt-2">
            <div 
              className="h-5 w-12 rounded"
              style={{ backgroundColor: option.preview.accent }}
            />
            <div 
              className="h-5 w-12 rounded"
              style={{ backgroundColor: option.preview.border }}
            />
          </div>
        </div>
      </div>

      {/* Theme info */}
      <div className="flex items-center gap-3">
        <div 
          className={cn(
            'p-2 rounded-lg',
            isActive ? 'bg-violet-500 text-white' : 'bg-white/10 text-white/70'
          )}
        >
          {option.icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white">{option.name}</h4>
          <p className="text-xs text-gray-400">{option.description}</p>
        </div>
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-1 rounded-full bg-violet-500"
          >
            <Check className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </div>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎛️ THEME SELECTOR — Main selector component
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ThemeSelectorProps {
  className?: string
  layout?: 'grid' | 'list' | 'compact'
}

export function ThemeSelector({ className, layout = 'grid' }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme()
  const feedback = useFeedback()

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
          <Palette className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Tema de la Interfaz</h3>
          <p className="text-sm text-gray-400">Personaliza la apariencia del sistema</p>
        </div>
      </div>

      {/* Theme options */}
      {layout === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {THEME_OPTIONS.map((option) => (
            <ThemeCard
              key={option.id}
              option={option}
              isActive={theme === option.id}
              onSelect={() => setTheme(option.id)}
            />
          ))}
        </div>
      )}

      {layout === 'list' && (
        <div className="space-y-2">
          {THEME_OPTIONS.map((option) => (
            <ThemeCard
              key={option.id}
              option={option}
              isActive={theme === option.id}
              onSelect={() => setTheme(option.id)}
            />
          ))}
        </div>
      )}

      {layout === 'compact' && (
        <div className="flex flex-wrap gap-2">
          {THEME_OPTIONS.map((option) => (
            <motion.button
              key={option.id}
              onClick={() => {
                if (theme !== option.id) {
                  feedback.tabSwitch()
                  setTheme(option.id)
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                theme === option.id
                  ? 'bg-violet-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              )}
            >
              {option.icon}
              <span className="text-sm font-medium">{option.name}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* System preference option */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
      >
        <Monitor className="w-5 h-5 text-gray-400" />
        <div className="flex-1 text-left">
          <span className="text-sm text-white/80">Usar preferencia del sistema</span>
        </div>
        <div className="w-10 h-5 rounded-full bg-white/20 relative">
          <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40" />
        </div>
      </motion.button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔘 THEME TOGGLE — Compact theme toggle button
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const feedback = useFeedback()

  const currentOption = THEME_OPTIONS.find(o => o.id === theme) || THEME_OPTIONS[0]

  const handleToggle = () => {
    feedback.tabSwitch()
    toggleTheme()
  }

  return (
    <motion.button
      onClick={handleToggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg',
        'bg-white/10 hover:bg-white/15 transition-colors',
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {currentOption.icon}
        </motion.div>
      </AnimatePresence>
      {showLabel && (
        <span className="text-sm font-medium text-white/80">{currentOption.name}</span>
      )}
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { THEME_OPTIONS }
export type { ThemeOption, ThemeSelectorProps, ThemeToggleProps }
