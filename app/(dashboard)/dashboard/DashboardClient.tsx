/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🚀 DASHBOARD CLIENT WRAPPER — CHRONOS INFINITY 2026 PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Con animación de apertura KOCMOC ΧΡΟΝΟΣ premium
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'motion/react'
import { useState, useEffect, useCallback } from 'react'

// Logo KOCMOC para loading premium
const KocmocLogo = dynamic(
  () =>
    import('@/app/_components/chronos-2026/branding/KocmocLogo').then((mod) => ({
      default: mod.KocmocLogo,
    })),
  { ssr: false }
)

// Lazy load del dashboard para evitar errores en SSR
const AuroraDashboardUnified = dynamic(
  () =>
    import('@/app/_components/chronos-2026/panels/AuroraDashboardUnified').then((mod) => ({
      default: mod.AuroraDashboardUnified,
    })),
  {
    ssr: false,
    loading: () => null, // Manejamos el loading manualmente
  }
)

// ═══════════════════════════════════════════════════════════════════════════════════════
// KOCMOC PREMIUM LOADING SCREEN
// ═══════════════════════════════════════════════════════════════════════════════════════

function KocmocLoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'logo' | 'loading' | 'complete'>('logo')

  useEffect(() => {
    // Fase 1: Logo aparece (0-30%)
    const timer1 = setTimeout(() => {
      setPhase('loading')
    }, 800)

    // Fase 2: Carga progresiva
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setPhase('complete')
          return 100
        }
        return p + 3
      })
    }, 50)

    return () => {
      clearTimeout(timer1)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (phase === 'complete') {
      const timer = setTimeout(() => {
        onComplete?.()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [phase, onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Fondo de partículas cósmicas */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Aurora orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 0, 255, 0.3) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-1/3 bottom-1/3 h-[400px] w-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {/* Estrellas estáticas */}
        {Array.from({ length: 80 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Logo KOCMOC */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <KocmocLogo
          size={280}
          showText={true}
          animated={true}
          color="#FFFFFF"
        />
      </motion.div>

      {/* Barra de progreso premium */}
      <motion.div
        className="relative z-10 mt-12 w-64"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        {/* Contenedor de la barra */}
        <div className="relative h-1 overflow-hidden rounded-full bg-white/10">
          {/* Barra de progreso con gradiente */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #8B00FF, #00F0FF, #FFD700)',
              width: `${progress}%`,
            }}
            initial={{ width: '0%' }}
          />
          {/* Brillo animado */}
          <motion.div
            className="absolute inset-y-0 h-full w-20"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            }}
            animate={{ x: ['-100%', '400%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Texto de estado */}
        <motion.p
          className="mt-4 text-center text-sm tracking-[0.3em] text-white/60"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {phase === 'logo' && 'INICIALIZANDO'}
          {phase === 'loading' && 'CARGANDO SISTEMA'}
          {phase === 'complete' && 'ΧΡΟΝΟΣ READY'}
        </motion.p>

        {/* Porcentaje */}
        <p className="mt-2 text-center text-xs text-white/40 font-mono">
          {progress}%
        </p>
      </motion.div>

      {/* Texto inferior */}
      <motion.div
        className="absolute bottom-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-xs tracking-[0.5em] text-white/30">
          CHRONOS INFINITY 2026
        </p>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN CLIENT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

export default function DashboardClient() {
  const [isLoading, setIsLoading] = useState(true)
  const [showDashboard, setShowDashboard] = useState(false)

  // Verificar si ya se mostró el loading en esta sesión
  useEffect(() => {
    const hasLoaded = sessionStorage.getItem('chronos-dashboard-loaded')
    if (hasLoaded) {
      setIsLoading(false)
      setShowDashboard(true)
    }
  }, [])

  const handleLoadingComplete = useCallback(() => {
    sessionStorage.setItem('chronos-dashboard-loaded', 'true')
    setIsLoading(false)
    setTimeout(() => setShowDashboard(true), 100)
  }, [])

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <KocmocLoadingScreen onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDashboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AuroraDashboardUnified />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
