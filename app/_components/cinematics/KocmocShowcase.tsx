/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 KOCMOC SHOWCASE — SILVER SPACE PREMIUM DEMO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Showcase de los componentes KOCMOC Silver Space:
 * - Cinematográfica de apertura
 * - Sistema de partículas
 * - Logo animado
 * - Colores: Plata espacial, Negro absoluto, Blanco puro
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useCallback } from 'react'
import { Play, RefreshCw, Sparkles, Moon, Sun, Settings, Eye } from 'lucide-react'
import {
  SilverDustBackground,
  KocmocLogoPremium,
  SilverSpaceCinematic,
  LightningEffect,
  SILVER_SPACE_COLORS,
} from '../cinematics/KocmocPremiumSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SHOWCASE CARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ShowcaseCardProps {
  title: string
  description: string
  children: React.ReactNode
  className?: string
}

function ShowcaseCard({ title, description, children, className }: ShowcaseCardProps) {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-zinc-900/60 backdrop-blur-xl',
        'border border-white/[0.08]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-white/50 mb-6">{description}</p>
        {children}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SILVER BUTTON
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SilverButtonProps {
  children: React.ReactNode
  onClick?: () => void
  icon?: React.ElementType
  variant?: 'default' | 'primary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

function SilverButton({
  children,
  onClick,
  icon: Icon,
  variant = 'default',
  size = 'md',
  disabled = false,
  className,
}: SilverButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variantClasses = {
    default: 'bg-white/[0.08] hover:bg-white/[0.12] border-white/[0.1]',
    primary: 'bg-white/90 hover:bg-white text-black border-white/20',
    outline: 'bg-transparent hover:bg-white/[0.05] border-white/20',
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex items-center justify-center gap-2 rounded-xl',
        'font-medium transition-all duration-200',
        'border backdrop-blur-sm',
        'disabled:opacity-50 disabled:pointer-events-none',
        sizeClasses[size],
        variantClasses[variant],
        variant !== 'primary' && 'text-white/90',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN SHOWCASE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function KocmocShowcase() {
  const [showCinematic, setShowCinematic] = useState(false)
  const [particleIntensity, setParticleIntensity] = useState<'low' | 'medium' | 'high'>('medium')
  const [showLightning, setShowLightning] = useState(true)
  const [logoPhase, setLogoPhase] = useState<'hidden' | 'forming' | 'complete'>('complete')

  const handlePlayCinematic = useCallback(() => {
    setShowCinematic(true)
  }, [])

  const handleCinematicComplete = useCallback(() => {
    setShowCinematic(false)
  }, [])

  const handleReplayLogo = useCallback(() => {
    setLogoPhase('hidden')
    setTimeout(() => setLogoPhase('forming'), 100)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: SILVER_SPACE_COLORS.absoluteBlack }}>
      {/* Fondo de partículas */}
      <SilverDustBackground
        particleCount={150}
        interactive={true}
        intensity={particleIntensity}
        className="z-0"
      />

      {/* Lightning effect */}
      <LightningEffect active={showLightning} intensity={0.1} />

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-white/[0.05] bg-black/40 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <KocmocLogoPremium size={50} animated showText={false} animationPhase="complete" />
                <div>
                  <h1 className="text-lg font-semibold text-white">KOCMOC Showcase</h1>
                  <p className="text-xs text-white/40">Silver Space Premium Edition</p>
                </div>
              </div>

              <SilverButton
                onClick={handlePlayCinematic}
                icon={Play}
                variant="primary"
                size="md"
              >
                Reproducir Cinematográfica
              </SilverButton>
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <main className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {/* Logo Card */}
            <ShowcaseCard
              title="Logo KOCMOC"
              description="Logo orbital animado con formación fluida"
              className="lg:col-span-2 lg:row-span-2"
            >
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <KocmocLogoPremium
                  size={280}
                  animated={true}
                  showText={true}
                  animationPhase={logoPhase}
                  onAnimationComplete={() => setLogoPhase('complete')}
                />
                <div className="mt-8 flex gap-3">
                  <SilverButton onClick={handleReplayLogo} icon={RefreshCw} size="sm">
                    Replay Formación
                  </SilverButton>
                </div>
              </div>
            </ShowcaseCard>

            {/* Partículas Control */}
            <ShowcaseCard
              title="Sistema de Partículas"
              description="Polvo de plata espacial interactivo"
            >
              <div className="space-y-4">
                <p className="text-xs text-white/40">Intensidad:</p>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((intensity) => (
                    <SilverButton
                      key={intensity}
                      onClick={() => setParticleIntensity(intensity)}
                      variant={particleIntensity === intensity ? 'primary' : 'outline'}
                      size="sm"
                    >
                      {intensity === 'low' && 'Bajo'}
                      {intensity === 'medium' && 'Medio'}
                      {intensity === 'high' && 'Alto'}
                    </SilverButton>
                  ))}
                </div>
                <p className="text-xs text-white/30 mt-4">
                  Mueve el cursor sobre las partículas para interactuar
                </p>
              </div>
            </ShowcaseCard>

            {/* Lightning Control */}
            <ShowcaseCard
              title="Efecto Lightning"
              description="Destellos de iluminación sutiles"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Habilitado</span>
                  <SilverButton
                    onClick={() => setShowLightning(!showLightning)}
                    variant={showLightning ? 'primary' : 'outline'}
                    size="sm"
                  >
                    {showLightning ? 'ON' : 'OFF'}
                  </SilverButton>
                </div>
                <p className="text-xs text-white/30">
                  Destellos aleatorios que simulan tormentas espaciales
                </p>
              </div>
            </ShowcaseCard>

            {/* Color Palette */}
            <ShowcaseCard
              title="Paleta de Colores"
              description="Silver Space: Plata, Negro, Blanco"
            >
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Negro Absoluto', color: SILVER_SPACE_COLORS.absoluteBlack },
                  { name: 'Void Profundo', color: SILVER_SPACE_COLORS.deepVoid },
                  { name: 'Negro Espacial', color: SILVER_SPACE_COLORS.spaceBlack },
                  { name: 'Plata Espejo', color: SILVER_SPACE_COLORS.silverMirror },
                  { name: 'Plata Claro', color: SILVER_SPACE_COLORS.silverLight },
                  { name: 'Blanco Puro', color: SILVER_SPACE_COLORS.pureWhite },
                ].map((item) => (
                  <div key={item.name} className="text-center">
                    <div
                      className="w-full aspect-square rounded-xl border border-white/10 mb-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="text-[10px] text-white/40 truncate">{item.name}</p>
                  </div>
                ))}
              </div>
            </ShowcaseCard>

            {/* Info Card */}
            <ShowcaseCard
              title="Especificaciones"
              description="Detalles técnicos del sistema"
              className="md:col-span-2"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Partículas', value: '150+' },
                  { label: 'FPS Target', value: '60' },
                  { label: 'Canvas', value: 'HighDPI' },
                  { label: 'Colores', value: '3' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center"
                  >
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/40 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </ShowcaseCard>

          </div>
        </main>
      </div>

      {/* Cinematográfica Modal */}
      <AnimatePresence>
        {showCinematic && (
          <SilverSpaceCinematic
            onComplete={handleCinematicComplete}
            duration={7000}
            showChronos={true}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default KocmocShowcase
