'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎬 VISUAL SHOWCASE PAGE — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Página de showcase completo para visualizar todos los componentes visuales:
 * - Cinemáticas de apertura
 * - Páginas de Login
 * - Fondos y backgrounds
 * - Sistemas de partículas
 * - Orbs 3D
 * - Shaders WebGPU
 * - Efectos especiales
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import {
  Box,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers,
  Maximize2,
  Minimize2,
  Monitor,
  Moon,
  Palette,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  Star,
  Sun,
  Volume2,
  VolumeX,
  Zap,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import dynamic from 'next/dynamic'
import { useCallback, useMemo, useState, Suspense, type ReactNode } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DYNAMIC IMPORTS — Lazy load all visual components
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Cinematics
const CinematicOpening = dynamic(
  () => import('@/app/_components/chronos-2026/branding/CinematicOpening').then((m) => m.CinematicOpening),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const UltraCinematicOpening = dynamic(
  () => import('@/app/_components/chronos-2026/branding/UltraCinematicOpening').then((m) => m.UltraCinematicOpening),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const ChronosOpeningCinematic = dynamic(
  () => import('@/app/_components/chronos-2026/animations/ChronosOpeningCinematic').then((m) => m.ChronosOpeningCinematic),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const LogoOpeningCinematic = dynamic(
  () => import('@/app/_components/chronos-2026/animations/LogoOpeningCinematic').then((m) => m.LogoOpeningCinematic),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const KocmocCinematic3D = dynamic(
  () => import('@/app/_components/cinematics/KocmocCinematic3D').then((m) => m.KocmocCinematic3D),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)

// Login Pages
const QuantumLogin = dynamic(
  () => import('@/app/_components/auth/QuantumLogin').then((m) => m.QuantumLogin),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const QuantumLoginCinematic = dynamic(
  () => import('@/app/_components/chronos-2026/auth/QuantumLoginCinematic').then((m) => m.QuantumLoginCinematic),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const ChronosLogin = dynamic(
  () => import('@/app/_components/chronos-2026/branding/ChronosLogin').then((m) => m.ChronosLogin),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const UltraLogin = dynamic(
  () => import('@/app/_components/chronos-2026/branding/UltraLogin').then((m) => m.UltraLogin),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)

// Backgrounds
const AuroraBackground = dynamic(
  () => import('@/app/_components/chronos-2026/design/effects/AuroraBackground').then((m) => m.AuroraBackground),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const LiquidMeshBackground = dynamic(
  () => import('@/app/_components/chronos-2026/backgrounds/LiquidMeshBackground').then((m) => m.LiquidMeshBackground),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const UnifiedBackground = dynamic(
  () => import('@/app/_components/chronos-2026/particles/UnifiedBackground').then((m) => m.UnifiedBackground),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const QuantumBackgrounds = dynamic(
  () => import('@/app/_components/chronos-2026/shaders/QuantumBackgrounds').then((m) => m.QuantumBackgrounds || m.default),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)

// Particle Systems
const FloatingParticles = dynamic(
  () => import('@/app/_components/chronos-2026/design/effects/FloatingParticles').then((m) => m.FloatingParticles),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const QuantumParticleField = dynamic(
  () => import('@/app/_components/chronos-2026/particles/QuantumParticleField').then((m) => m.QuantumParticleField),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const ParticleSystems = dynamic(
  () => import('@/app/_components/chronos-2026/particles/ParticleSystems').then((m) => m.default || m.ParticleSystems),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const EnhancedWebGLParticles = dynamic(
  () => import('@/app/_components/chronos-2026/particles/EnhancedWebGLParticles').then((m) => m.EnhancedWebGLParticles),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const ParticleExplosion = dynamic(
  () => import('@/app/_components/chronos-2026/interactive/ParticleExplosion').then((m) => m.ParticleExplosion),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)

// Orbs
const AI3DOrb = dynamic(
  () => import('@/app/_components/chronos-2026/3d/AI3DOrb').then((m) => m.AI3DOrb),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const QuantumOrb3D = dynamic(
  () => import('@/app/_components/chronos-2026/3d/QuantumOrb3D').then((m) => m.QuantumOrb3D),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const SoulOrbQuantum = dynamic(
  () => import('@/app/_components/chronos-2026/3d/SoulOrbQuantum').then((m) => m.SoulOrbQuantum),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const OrbFondoVivo = dynamic(
  () => import('@/app/_components/chronos-2026/3d/OrbFondoVivo').then((m) => m.OrbFondoVivo),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const WebGLOrb = dynamic(
  () => import('@/app/_components/chronos-2026/ai/WebGLOrb').then((m) => m.WebGLOrb),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const FloatingOrb = dynamic(
  () => import('@/app/_components/ui/FloatingOrb').then((m) => m.FloatingOrb),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)

// 3D Components
const BankVault3D = dynamic(
  () => import('@/app/_components/chronos-2026/3d/BankVault3D').then((m) => m.BankVault3D),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const Warehouse3D = dynamic(
  () => import('@/app/_components/chronos-2026/3d/Warehouse3D').then((m) => m.Warehouse3D),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const FinancialTurbulence3D = dynamic(
  () => import('@/app/_components/chronos-2026/3d/FinancialTurbulence3D').then((m) => m.FinancialTurbulence3D),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)

// Effects
const CyberGrid = dynamic(
  () => import('@/app/_components/chronos-2026/design/effects/CyberGrid').then((m) => m.CyberGrid),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const ScanLineEffect = dynamic(
  () => import('@/app/_components/chronos-2026/design/effects/ScanLineEffect').then((m) => m.ScanLineEffect),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)
const HolographicEffects = dynamic(
  () => import('@/app/_components/chronos-2026/ai/HolographicEffects').then((m) => m.HolographicEffects),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ShowcaseItem {
  id: string
  name: string
  description: string
  category: 'cinematic' | 'login' | 'background' | 'particle' | 'orb' | '3d' | 'effect' | 'shader'
  component: ReactNode
  props?: Record<string, unknown>
  isFullscreen?: boolean
  hasInteraction?: boolean
}

type Category = ShowcaseItem['category']

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LOADING PLACEHOLDER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function LoadingPlaceholder() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[300px] bg-black/50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-white/50">Cargando componente...</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ERROR BOUNDARY WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function ComponentWrapper({ children, name }: { children: ReactNode; name: string }) {
  try {
    return <Suspense fallback={<LoadingPlaceholder />}>{children}</Suspense>
  } catch (error) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[300px] bg-rose-500/10 border border-rose-500/20 rounded-xl">
        <div className="text-center p-4">
          <p className="text-rose-400 font-medium">Error al cargar: {name}</p>
          <p className="text-sm text-white/50 mt-1">El componente no pudo renderizarse</p>
        </div>
      </div>
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CATEGORY CONFIG
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const categoryConfig: Record<Category, { label: string; icon: ReactNode; color: string }> = {
  cinematic: { label: 'Cinemáticas', icon: <Monitor className="h-4 w-4" />, color: 'violet' },
  login: { label: 'Páginas Login', icon: <Eye className="h-4 w-4" />, color: 'blue' },
  background: { label: 'Fondos', icon: <Layers className="h-4 w-4" />, color: 'emerald' },
  particle: { label: 'Partículas', icon: <Sparkles className="h-4 w-4" />, color: 'amber' },
  orb: { label: 'Orbs 3D', icon: <Star className="h-4 w-4" />, color: 'rose' },
  '3d': { label: 'Componentes 3D', icon: <Box className="h-4 w-4" />, color: 'sky' },
  effect: { label: 'Efectos', icon: <Zap className="h-4 w-4" />, color: 'orange' },
  shader: { label: 'Shaders WebGPU', icon: <Palette className="h-4 w-4" />, color: 'pink' },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SHOWCASE DATA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const showcaseItems: ShowcaseItem[] = [
  // CINEMATICAS
  {
    id: 'cinematic-opening',
    name: 'Cinematic Opening',
    description: 'Apertura cinematográfica con animación de logo',
    category: 'cinematic',
    component: <CinematicOpening onComplete={() => {}} />,
    isFullscreen: true,
  },
  {
    id: 'ultra-cinematic',
    name: 'Ultra Cinematic Opening',
    description: 'Apertura ultra premium con efectos avanzados',
    category: 'cinematic',
    component: <UltraCinematicOpening />,
    isFullscreen: true,
  },
  {
    id: 'chronos-opening',
    name: 'Chronos Opening Cinematic',
    description: 'Cinemática principal de CHRONOS con partículas',
    category: 'cinematic',
    component: <ChronosOpeningCinematic onComplete={() => {}} />,
    isFullscreen: true,
  },
  {
    id: 'logo-opening',
    name: 'Logo Opening Cinematic',
    description: 'Apertura centrada en el logo animado',
    category: 'cinematic',
    component: <LogoOpeningCinematic />,
    isFullscreen: true,
  },
  {
    id: 'kocmoc-cinematic',
    name: 'Kocmoc Cinematic 3D',
    description: 'Cinemática 3D inspirada en cosmos',
    category: 'cinematic',
    component: <KocmocCinematic3D />,
    isFullscreen: true,
  },

  // LOGIN PAGES
  {
    id: 'quantum-login',
    name: 'Quantum Login',
    description: 'Login con efectos cuánticos y partículas',
    category: 'login',
    component: <QuantumLogin />,
    isFullscreen: true,
  },
  {
    id: 'quantum-login-cinematic',
    name: 'Quantum Login Cinematic',
    description: 'Login con cinemática completa',
    category: 'login',
    component: <QuantumLoginCinematic />,
    isFullscreen: true,
  },
  {
    id: 'chronos-login',
    name: 'Chronos Login',
    description: 'Login oficial de CHRONOS',
    category: 'login',
    component: <ChronosLogin />,
    isFullscreen: true,
  },
  {
    id: 'ultra-login',
    name: 'Ultra Login',
    description: 'Login premium ultra detallado',
    category: 'login',
    component: <UltraLogin />,
    isFullscreen: true,
  },

  // BACKGROUNDS
  {
    id: 'aurora-bg',
    name: 'Aurora Background',
    description: 'Fondo con aurora boreal animada',
    category: 'background',
    component: <AuroraBackground />,
  },
  {
    id: 'liquid-mesh',
    name: 'Liquid Mesh Background',
    description: 'Fondo con malla líquida 3D',
    category: 'background',
    component: <LiquidMeshBackground />,
  },
  {
    id: 'unified-bg',
    name: 'Unified Background',
    description: 'Fondo unificado optimizado',
    category: 'background',
    component: <UnifiedBackground />,
  },
  {
    id: 'quantum-bg',
    name: 'Quantum Backgrounds',
    description: 'Fondos cuánticos con shaders',
    category: 'background',
    component: <QuantumBackgrounds />,
  },

  // PARTICLE SYSTEMS
  {
    id: 'floating-particles',
    name: 'Floating Particles',
    description: 'Partículas flotantes suaves',
    category: 'particle',
    component: <FloatingParticles />,
    hasInteraction: true,
  },
  {
    id: 'quantum-particles',
    name: 'Quantum Particle Field',
    description: 'Campo de partículas cuánticas',
    category: 'particle',
    component: <QuantumParticleField />,
    hasInteraction: true,
  },
  {
    id: 'particle-systems',
    name: 'Particle Systems',
    description: 'Sistema avanzado de partículas',
    category: 'particle',
    component: <ParticleSystems />,
  },
  {
    id: 'webgl-particles',
    name: 'Enhanced WebGL Particles',
    description: 'Partículas WebGL optimizadas',
    category: 'particle',
    component: <EnhancedWebGLParticles />,
  },
  {
    id: 'particle-explosion',
    name: 'Particle Explosion',
    description: 'Explosión de partículas interactiva',
    category: 'particle',
    component: <ParticleExplosion />,
    hasInteraction: true,
  },

  // ORBS
  {
    id: 'ai-3d-orb',
    name: 'AI 3D Orb',
    description: 'Orbe 3D de asistente IA',
    category: 'orb',
    component: <AI3DOrb />,
    hasInteraction: true,
  },
  {
    id: 'quantum-orb-3d',
    name: 'Quantum Orb 3D',
    description: 'Orbe cuántico con efectos avanzados',
    category: 'orb',
    component: <QuantumOrb3D />,
    hasInteraction: true,
  },
  {
    id: 'soul-orb',
    name: 'Soul Orb Quantum',
    description: 'Orbe con alma y personalidad',
    category: 'orb',
    component: <SoulOrbQuantum />,
    hasInteraction: true,
  },
  {
    id: 'orb-fondo-vivo',
    name: 'Orb Fondo Vivo',
    description: 'Orbe con fondo viviente',
    category: 'orb',
    component: <OrbFondoVivo />,
  },
  {
    id: 'webgl-orb',
    name: 'WebGL Orb',
    description: 'Orbe WebGL puro',
    category: 'orb',
    component: <WebGLOrb />,
    hasInteraction: true,
  },
  {
    id: 'floating-orb',
    name: 'Floating Orb',
    description: 'Orbe flotante simple',
    category: 'orb',
    component: <FloatingOrb />,
  },

  // 3D COMPONENTS
  {
    id: 'bank-vault-3d',
    name: 'Bank Vault 3D',
    description: 'Bóveda bancaria 3D interactiva',
    category: '3d',
    component: <BankVault3D />,
    hasInteraction: true,
  },
  {
    id: 'warehouse-3d',
    name: 'Warehouse 3D',
    description: 'Almacén 3D para inventario',
    category: '3d',
    component: <Warehouse3D />,
    hasInteraction: true,
  },
  {
    id: 'financial-turbulence',
    name: 'Financial Turbulence 3D',
    description: 'Visualización de turbulencia financiera',
    category: '3d',
    component: <FinancialTurbulence3D />,
    hasInteraction: true,
  },

  // EFFECTS
  {
    id: 'cyber-grid',
    name: 'Cyber Grid',
    description: 'Cuadrícula cyberpunk animada',
    category: 'effect',
    component: <CyberGrid />,
  },
  {
    id: 'scan-line',
    name: 'Scan Line Effect',
    description: 'Efecto de línea de escaneo',
    category: 'effect',
    component: <ScanLineEffect />,
  },
  {
    id: 'holographic',
    name: 'Holographic Effects',
    description: 'Efectos holográficos',
    category: 'effect',
    component: <HolographicEffects />,
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PREVIEW CARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PreviewCardProps {
  item: ShowcaseItem
  onSelect: () => void
  isSelected: boolean
}

function PreviewCard({ item, onSelect, isSelected }: PreviewCardProps) {
  const config = categoryConfig[item.category]

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl border cursor-pointer transition-all',
        isSelected
          ? 'border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/30'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
      )}
      onClick={onSelect}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Preview thumbnail */}
      <div className="relative h-32 overflow-hidden bg-black/50">
        <div className="absolute inset-0 flex items-center justify-center text-white/20">
          {config.icon}
        </div>
        {/* Badge */}
        <div className={cn(
          'absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium',
          `bg-${config.color}-500/20 text-${config.color}-400`
        )}>
          {config.label}
        </div>
        {item.hasInteraction && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
            Interactivo
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-white text-sm truncate">{item.name}</h3>
        <p className="text-xs text-white/50 truncate mt-0.5">{item.description}</p>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FULLSCREEN VIEWER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FullscreenViewerProps {
  item: ShowcaseItem | null
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}

function FullscreenViewer({
  item,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: FullscreenViewerProps) {
  const [isPlaying, setIsPlaying] = useState(true)

  if (!item) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Component render */}
      <div className="absolute inset-0 overflow-hidden">
        <ComponentWrapper name={item.name}>
          {item.component}
        </ComponentWrapper>
      </div>

      {/* Controls overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{item.name}</h2>
              <p className="text-sm text-white/60">{item.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </motion.button>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        {hasPrev && (
          <motion.button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors pointer-events-auto"
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="h-6 w-6" />
          </motion.button>
        )}
        {hasNext && (
          <motion.button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors pointer-events-auto"
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="h-6 w-6" />
          </motion.button>
        )}

        {/* Bottom info bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                `bg-${categoryConfig[item.category].color}-500/20 text-${categoryConfig[item.category].color}-400`
              )}>
                {categoryConfig[item.category].label}
              </span>
              {item.hasInteraction && (
                <span className="text-xs text-amber-400">
                  ✨ Componente interactivo
                </span>
              )}
              {item.isFullscreen && (
                <span className="text-xs text-blue-400">
                  🖥️ Optimizado para pantalla completa
                </span>
              )}
            </div>
            <span className="text-xs text-white/40">
              Presiona ESC para cerrar
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default function VisualShowcasePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [selectedItem, setSelectedItem] = useState<ShowcaseItem | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return showcaseItems
    return showcaseItems.filter((item) => item.category === selectedCategory)
  }, [selectedCategory])

  // Get counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: showcaseItems.length }
    showcaseItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1
    })
    return counts
  }, [])

  // Navigation handlers
  const selectedIndex = selectedItem ? filteredItems.findIndex((i) => i.id === selectedItem.id) : -1

  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) {
      setSelectedItem(filteredItems[selectedIndex - 1])
    }
  }, [selectedIndex, filteredItems])

  const handleNext = useCallback(() => {
    if (selectedIndex < filteredItems.length - 1) {
      setSelectedItem(filteredItems[selectedIndex + 1])
    }
  }, [selectedIndex, filteredItems])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedItem) {
      if (e.key === 'Escape') setSelectedItem(null)
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
  }, [selectedItem, handlePrev, handleNext])

  // Setup keyboard listener
  useState(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-violet-400" />
                Visual Showcase
              </h1>
              <p className="text-sm text-white/50">
                Explora todas las cinemáticas, animaciones y efectos visuales
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/40">
                {filteredItems.length} componentes
              </span>
            </div>
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                selectedCategory === 'all'
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'bg-white/5 text-white/50 hover:text-white/70'
              )}
            >
              Todos ({categoryCounts.all})
            </button>
            {(Object.keys(categoryConfig) as Category[]).map((cat) => {
              const config = categoryConfig[cat]
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    selectedCategory === cat
                      ? `bg-${config.color}-500/20 text-${config.color}-400`
                      : 'bg-white/5 text-white/50 hover:text-white/70'
                  )}
                >
                  {config.icon}
                  {config.label}
                  <span className="text-xs text-white/30">({categoryCounts[cat] || 0})</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <PreviewCard
              key={item.id}
              item={item}
              onSelect={() => setSelectedItem(item)}
              isSelected={selectedItem?.id === item.id}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Eye className="h-12 w-12 text-white/20 mb-4" />
            <p className="text-white/50">No hay componentes en esta categoría</p>
          </div>
        )}
      </main>

      {/* Fullscreen viewer */}
      <AnimatePresence>
        {selectedItem && (
          <FullscreenViewer
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onPrev={handlePrev}
            onNext={handleNext}
            hasPrev={selectedIndex > 0}
            hasNext={selectedIndex < filteredItems.length - 1}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
