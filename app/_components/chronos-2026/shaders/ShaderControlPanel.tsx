'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎚️ SHADER CONTROL PANEL — CHRONOS ELITE 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel de control visual para personalizar los shaders en tiempo real.
 * Incluye sliders, color pickers y presets temáticos.
 *
 * @version 4.0.0 SUPREME ELITE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import {
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Eye,
  EyeOff,
  MousePointer,
  Palette,
  RefreshCw,
  Settings,
  Sliders,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useState } from 'react'
import {
  hexToRgb,
  rgbToHex,
  useShaderCustomization,
  type ShaderThemePreset,
} from './ShaderCustomizationContext'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SLIDER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  icon?: React.ReactNode
  formatValue?: (value: number) => string
}

const Slider = memo(function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  icon,
  formatValue = (v) => v.toFixed(2),
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-white/70">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-mono text-xs text-violet-400">{formatValue(value)}</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent opacity-0"
        />
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COLOR PICKER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ColorPickerProps {
  label: string
  value: [number, number, number]
  onChange: (value: [number, number, number]) => void
}

const ColorPicker = memo(function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const hexValue = rgbToHex(value)

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/70">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-white/50">{hexValue}</span>
        <div className="relative">
          <input
            type="color"
            value={hexValue}
            onChange={(e) => onChange(hexToRgb(e.target.value))}
            className="h-8 w-8 cursor-pointer appearance-none overflow-hidden rounded-lg border-2 border-white/20 bg-transparent"
          />
        </div>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TOGGLE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  icon?: React.ReactNode
}

const Toggle = memo(function Toggle({ label, checked, onChange, icon }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
    >
      <div className="flex items-center gap-2 text-sm text-white/70">
        {icon}
        <span>{label}</span>
      </div>
      <div
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? 'bg-violet-500' : 'bg-white/20'
        }`}
      >
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESET CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PresetCardProps {
  preset: ShaderThemePreset
  isSelected: boolean
  onSelect: () => void
}

const PresetCard = memo(function PresetCard({ preset, isSelected, onSelect }: PresetCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
        isSelected
          ? 'border-violet-500 bg-violet-500/20 shadow-lg shadow-violet-500/20'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      {isSelected && (
        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
      <span className="text-2xl">{preset.icon}</span>
      <span className="text-sm font-medium text-white">{preset.name}</span>
      <span className="text-xs text-white/50">{preset.description}</span>
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SHAPE SELECTOR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ShapeSelectorProps {
  value: 0 | 1 | 2 | 3
  onChange: (value: 0 | 1 | 2 | 3) => void
}

const shapes = [
  { value: 0 as const, label: 'Círculo', icon: '●' },
  { value: 1 as const, label: 'Estrella', icon: '★' },
  { value: 2 as const, label: 'Diamante', icon: '◆' },
  { value: 3 as const, label: 'Glow Orb', icon: '◉' },
]

const ShapeSelector = memo(function ShapeSelector({ value, onChange }: ShapeSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm text-white/70">Forma de Partículas</span>
      <div className="flex gap-2">
        {shapes.map((shape) => (
          <button
            key={shape.value}
            onClick={() => onChange(shape.value)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 transition-all ${
              value === shape.value
                ? 'border-violet-500 bg-violet-500/20'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <span className="text-xl">{shape.icon}</span>
            <span className="text-xs text-white/50">{shape.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUALITY SELECTOR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QualitySelectorProps {
  value: 'low' | 'medium' | 'high' | 'ultra'
  onChange: (value: 'low' | 'medium' | 'high' | 'ultra') => void
}

const qualities = [
  { value: 'low' as const, label: 'Baja', particles: '1K' },
  { value: 'medium' as const, label: 'Media', particles: '3K' },
  { value: 'high' as const, label: 'Alta', particles: '5K' },
  { value: 'ultra' as const, label: 'Ultra', particles: '10K' },
]

const QualitySelector = memo(function QualitySelector({ value, onChange }: QualitySelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-white/70">
        <Cpu className="h-4 w-4" />
        <span>Calidad</span>
      </div>
      <div className="flex gap-2">
        {qualities.map((q) => (
          <button
            key={q.value}
            onClick={() => onChange(q.value)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 transition-all ${
              value === q.value
                ? 'border-violet-500 bg-violet-500/20'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <span className="text-sm font-medium text-white">{q.label}</span>
            <span className="text-xs text-white/40">{q.particles}</span>
          </button>
        ))}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SECTION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SectionProps {
  title: string
  icon: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}

function Section({ title, icon, defaultOpen = true, children }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-white/10 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-left"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          {icon}
          <span>{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-white/50" />
        ) : (
          <ChevronDown className="h-4 w-4 text-white/50" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ShaderControlPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ShaderControlPanel({ isOpen, onClose }: ShaderControlPanelProps) {
  const {
    config,
    enabled,
    setEnabled,
    setIntensity,
    setQuality,
    setColorPrimary,
    setColorSecondary,
    setColorAccent,
    setParticleCount,
    setParticleSize,
    setParticleSpeed,
    setParticleShape,
    setTurbulence,
    setWaveAmplitude,
    setPulseIntensity,
    setBloomIntensity,
    setChromaticAberration,
    setMouseAttraction,
    setMouseRadius,
    setScrollParallax,
    setMood,
    applyPreset,
    resetToDefault,
    presets,
  } = useShaderCustomization()

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const handleSelectPreset = useCallback(
    (key: string, preset: ShaderThemePreset) => {
      setSelectedPreset(key)
      applyPreset(preset)
    },
    [applyPreset],
  )

  const handleReset = useCallback(() => {
    setSelectedPreset(null)
    resetToDefault()
  }, [resetToDefault])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-gray-900/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Personalizar Shaders</h2>
                  <p className="text-xs text-white/50">Ajusta los efectos visuales</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {/* Master Toggle */}
              <div className="mb-6 flex items-center justify-between rounded-xl bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 p-4">
                <div className="flex items-center gap-3">
                  {enabled ? (
                    <Eye className="h-5 w-5 text-violet-400" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-white/40" />
                  )}
                  <div>
                    <span className="text-sm font-medium text-white">Efectos de Shader</span>
                    <p className="text-xs text-white/50">
                      {enabled ? 'Activados' : 'Desactivados'}
                    </p>
                  </div>
                </div>
                <Toggle label="" checked={enabled} onChange={setEnabled} />
              </div>

              {/* Presets Section */}
              <Section
                title="Presets Temáticos"
                icon={<Sparkles className="h-4 w-4 text-violet-400" />}
              >
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(presets).map(([key, preset]) => (
                    <PresetCard
                      key={key}
                      preset={preset}
                      isSelected={selectedPreset === key}
                      onSelect={() => handleSelectPreset(key, preset)}
                    />
                  ))}
                </div>
              </Section>

              {/* Colors Section */}
              <Section title="Colores" icon={<Palette className="h-4 w-4 text-fuchsia-400" />}>
                <ColorPicker
                  label="Color Primario"
                  value={config.colorPrimary}
                  onChange={setColorPrimary}
                />
                <ColorPicker
                  label="Color Secundario"
                  value={config.colorSecondary}
                  onChange={setColorSecondary}
                />
                <ColorPicker
                  label="Color de Acento"
                  value={config.colorAccent}
                  onChange={setColorAccent}
                />
              </Section>

              {/* Particles Section */}
              <Section title="Partículas" icon={<Zap className="h-4 w-4 text-amber-400" />}>
                <ShapeSelector value={config.particleShape} onChange={setParticleShape} />
                <Slider
                  label="Cantidad"
                  value={config.particleCount}
                  min={500}
                  max={15000}
                  step={500}
                  onChange={setParticleCount}
                  formatValue={(v) => `${Math.round(v / 1000)}K`}
                />
                <Slider
                  label="Tamaño"
                  value={config.particleSize}
                  min={0.3}
                  max={2.5}
                  onChange={setParticleSize}
                />
                <Slider
                  label="Velocidad"
                  value={config.particleSpeed}
                  min={0}
                  max={2.5}
                  onChange={setParticleSpeed}
                />
              </Section>

              {/* Effects Section */}
              <Section
                title="Efectos"
                icon={<Sliders className="h-4 w-4 text-cyan-400" />}
                defaultOpen={false}
              >
                <Slider
                  label="Intensidad General"
                  value={config.intensity}
                  min={0}
                  max={1}
                  onChange={setIntensity}
                />
                <Slider
                  label="Turbulencia"
                  value={config.turbulence}
                  min={0}
                  max={1}
                  onChange={setTurbulence}
                />
                <Slider
                  label="Ondas"
                  value={config.waveAmplitude}
                  min={0}
                  max={0.3}
                  onChange={setWaveAmplitude}
                />
                <Slider
                  label="Pulso"
                  value={config.pulseIntensity}
                  min={0}
                  max={2}
                  onChange={setPulseIntensity}
                />
                <Slider
                  label="Bloom"
                  value={config.bloomIntensity}
                  min={0}
                  max={2}
                  onChange={setBloomIntensity}
                />
                <Slider
                  label="Aberración Cromática"
                  value={config.chromaticAberration}
                  min={0}
                  max={1}
                  onChange={setChromaticAberration}
                />
                <Slider
                  label="Mood"
                  value={config.mood}
                  min={-1}
                  max={1}
                  onChange={setMood}
                  formatValue={(v) => (v < 0 ? 'Tenso' : v > 0 ? 'Eufórico' : 'Neutral')}
                />
              </Section>

              {/* Interaction Section */}
              <Section
                title="Interacción"
                icon={<MousePointer className="h-4 w-4 text-emerald-400" />}
                defaultOpen={false}
              >
                <Slider
                  label="Atracción del Mouse"
                  value={config.mouseAttraction}
                  min={0}
                  max={1}
                  onChange={setMouseAttraction}
                />
                <Slider
                  label="Radio de Interacción"
                  value={config.mouseRadius}
                  min={0.1}
                  max={1.5}
                  onChange={setMouseRadius}
                />
                <Toggle
                  label="Parallax de Scroll"
                  checked={config.scrollParallax}
                  onChange={setScrollParallax}
                />
              </Section>

              {/* Performance Section */}
              <Section
                title="Rendimiento"
                icon={<Cpu className="h-4 w-4 text-rose-400" />}
                defaultOpen={false}
              >
                <QualitySelector value={config.quality} onChange={setQuality} />
                <Toggle
                  label="Reducir calidad automáticamente"
                  checked={config.autoReduceQuality}
                  onChange={(v) =>
                    useShaderCustomization().config.autoReduceQuality !== v &&
                    setQuality(config.quality)
                  }
                />
                <Toggle
                  label="Pausar cuando está oculto"
                  checked={config.pauseWhenHidden}
                  onChange={() => {}}
                />
              </Section>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-4">
              <button
                onClick={handleReset}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4" />
                Restaurar Valores por Defecto
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TRIGGER BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ShaderControlTriggerProps {
  onClick: () => void
}

export function ShaderControlTrigger({ onClick }: ShaderControlTriggerProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className="group fixed right-6 bottom-6 z-30 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-gray-900/80 shadow-lg shadow-violet-500/20 backdrop-blur-xl transition-all hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/30"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="bg-gradient-conic absolute inset-0 rounded-full from-violet-500 via-fuchsia-500 to-violet-500 opacity-0 transition-opacity group-hover:opacity-30"
      />
      <Settings className="h-6 w-6 text-white transition-transform group-hover:rotate-90" />
    </motion.button>
  )
}

export default ShaderControlPanel
