/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ♿ CHRONOS 2026 — MOTION & ACCESSIBILITY SETTINGS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel de configuración de accesibilidad y preferencias de movimiento:
 * - Control de efectos 3D y parallax
 * - Intensidad de animaciones
 * - Reducir movimiento
 * - Presets de accesibilidad
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useMotionPreferencesStandalone } from '@/app/_hooks/useMotionPreferences'
import { cn } from '@/app/_lib/utils'
import {
    Accessibility,
    Eye,
    MonitorSmartphone,
    RotateCcw,
    Settings,
    Sparkles,
    Zap
} from 'lucide-react'
import { motion } from 'motion/react'
import { memo, useState } from 'react'
import { iOSListGroup, iOSModal, iOSToggle } from './ios'

// PascalCase aliases required for JSX (React treats lowercase-first names as HTML elements)
const IOSModal = iOSModal
const IOSListGroup = iOSListGroup
const IOSToggle = iOSToggle

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTES INTERNOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SettingsSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const SettingsSlider = memo(function SettingsSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.1,
}: SettingsSliderProps) {
  const percentage = Math.round(((value - min) / (max - min)) * 100)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[14px] text-white/70">{label}</span>
        <span className="text-[14px] font-medium text-violet-400">{percentage}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={cn(
          'w-full h-1.5 rounded-full appearance-none cursor-pointer',
          'bg-white/10',
          '[&::-webkit-slider-thumb]:appearance-none',
          '[&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
          '[&::-webkit-slider-thumb]:rounded-full',
          '[&::-webkit-slider-thumb]:bg-violet-500',
          '[&::-webkit-slider-thumb]:shadow-lg',
          '[&::-webkit-slider-thumb]:cursor-pointer',
          '[&::-webkit-slider-thumb]:transition-transform',
          '[&::-webkit-slider-thumb]:hover:scale-110',
        )}
      />
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL - MODAL DE SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MotionSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const MotionSettingsModal = memo(function MotionSettingsModal({
  isOpen,
  onClose,
}: MotionSettingsModalProps) {
  const {
    reducedMotion,
    disable3DEffects,
    disableParallax,
    disableImmersiveHover,
    disableDecorativeEffects,
    animationIntensity,
    durationMultiplier,
    isMobile,
    toggleReducedMotion,
    toggle3DEffects,
    toggleParallax,
    toggleDecorativeEffects,
    setAnimationIntensity,
    resetToDefaults,
    applyAccessibilityPreset,
    applyPerformancePreset,
  } = useMotionPreferencesStandalone()

  return (
    <IOSModal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración de Movimiento"
      subtitle="Accesibilidad y Rendimiento"
      variant="sheet"
      size="lg"
    >
      {/* Presets rápidos */}
      <div className="mb-6">
        <h4 className="text-[13px] font-semibold text-white/50 uppercase tracking-wide mb-3">
          Presets Rápidos
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={applyAccessibilityPreset}
            className="flex items-center gap-3 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            <Accessibility className="h-5 w-5 text-violet-400" />
            <div className="text-left">
              <p className="text-[14px] font-medium text-white">Accesibilidad</p>
              <p className="text-[12px] text-white/50">Menos animaciones</p>
            </div>
          </motion.button>

          <motion.button
            onClick={applyPerformancePreset}
            className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            <Zap className="h-5 w-5 text-emerald-400" />
            <div className="text-left">
              <p className="text-[14px] font-medium text-white">Rendimiento</p>
              <p className="text-[12px] text-white/50">Animaciones rápidas</p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Configuraciones principales */}
      <IOSListGroup header="Efectos de Movimiento">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-white/50" />
            <div>
              <p className="text-[15px] text-white">Reducir Movimiento</p>
              <p className="text-[13px] text-white/50">Minimizar animaciones</p>
            </div>
          </div>
          <IOSToggle checked={reducedMotion} onChange={toggleReducedMotion} />
        </div>

        <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <MonitorSmartphone className="h-5 w-5 text-white/50" />
            <div>
              <p className="text-[15px] text-white">Efectos 3D con Cursor</p>
              <p className="text-[13px] text-white/50">Tilt y profundidad</p>
            </div>
          </div>
          <IOSToggle checked={!disable3DEffects} onChange={toggle3DEffects} />
        </div>

        <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-white/50" />
            <div>
              <p className="text-[15px] text-white">Efectos Parallax</p>
              <p className="text-[13px] text-white/50">Movimiento con scroll</p>
            </div>
          </div>
          <IOSToggle checked={!disableParallax} onChange={toggleParallax} />
        </div>

        <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-white/50" />
            <div>
              <p className="text-[15px] text-white">Efectos Decorativos</p>
              <p className="text-[13px] text-white/50">Partículas y glows</p>
            </div>
          </div>
          <IOSToggle checked={!disableDecorativeEffects} onChange={toggleDecorativeEffects} />
        </div>
      </IOSListGroup>

      {/* Slider de intensidad */}
      <div className="mt-6 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
        <SettingsSlider
          label="Intensidad de Animaciones"
          value={animationIntensity}
          onChange={setAnimationIntensity}
        />
      </div>

      {/* Info del dispositivo */}
      <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <p className="text-[13px] text-white/40">
          {isMobile ? '📱 Dispositivo móvil detectado' : '🖥️ Dispositivo desktop'}
        </p>
        <p className="text-[12px] text-white/30 mt-1">
          Los efectos 3D con cursor están {disable3DEffects ? 'deshabilitados' : 'habilitados'} para
          una mejor experiencia.
        </p>
      </div>

      {/* Botón reset */}
      <motion.button
        onClick={resetToDefaults}
        className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl text-[15px] text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-colors"
        whileTap={{ scale: 0.98 }}
      >
        <RotateCcw className="h-4 w-4" />
        Restaurar Configuración Predeterminada
      </motion.button>
    </IOSModal>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE INLINE COMPACTO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MotionSettingsCompactProps {
  className?: string
}

export const MotionSettingsCompact = memo(function MotionSettingsCompact({
  className,
}: MotionSettingsCompactProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { disable3DEffects, disableParallax, reducedMotion } = useMotionPreferencesStandalone()

  const activeSettings = [
    reducedMotion && 'Movimiento reducido',
    disable3DEffects && '3D desactivado',
    disableParallax && 'Parallax desactivado',
  ].filter(Boolean)

  return (
    <>
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl',
          'bg-white/[0.04] border border-white/[0.08]',
          'hover:bg-white/[0.08] transition-colors',
          className
        )}
        whileTap={{ scale: 0.97 }}
      >
        <Settings className="h-4 w-4 text-white/50" />
        <span className="text-[13px] text-white/70">Movimiento</span>
        {activeSettings.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-md bg-violet-500/20 text-[11px] text-violet-400 font-medium">
            {activeSettings.length}
          </span>
        )}
      </motion.button>

      <MotionSettingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
    MotionSettingsCompactProps, MotionSettingsModalProps
}

