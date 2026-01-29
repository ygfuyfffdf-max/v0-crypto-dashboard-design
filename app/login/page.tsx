/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS LOGIN PAGE — KOCMOC GATEWAY SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Página de login premium con:
 * - Animación de inicio KOCMOC ΧΡΟΝΟΣ (logo orbital)
 * - Glassmorphism Gen-5 auténtico
 * - Sistema de partículas cósmicas
 * - Transiciones cinematográficas
 * - Seguridad enterprise-grade
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Componentes premium
import { GlassmorphicGateway } from '@/app/_components/chronos-2026/auth/GlassmorphicGateway'

// Logo KOCMOC con lazy loading
const KocmocLogo = dynamic(
  () => import('@/app/_components/chronos-2026/branding/KocmocLogo').then((mod) => mod.KocmocLogo),
  { ssr: false }
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 KOCMOC OPENING ANIMATION — Animación de apertura con logo orbital
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function KocmocOpeningAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'void' | 'logo' | 'text' | 'complete'>('void')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Fase 1: Void (oscuridad) - 500ms
    const t1 = setTimeout(() => setPhase('logo'), 500)

    // Fase 2: Logo aparece - 2000ms
    const t2 = setTimeout(() => setPhase('text'), 2500)

    // Fase 3: Texto y finalización - 1500ms más
    const t3 = setTimeout(() => setPhase('complete'), 4000)

    // Progreso animado
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 2, 100))
    }, 80)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (phase === 'complete') {
      const timer = setTimeout(onComplete, 800)
      return () => clearTimeout(timer)
    }
  }, [phase, onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #080818 0%, #000000 100%)' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Fondo de estrellas */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 0.5,
              height: Math.random() * 2 + 0.5,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase !== 'void' ? [0.1, 0.6, 0.1] : 0,
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Aurora orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 h-[600px] w-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 0, 255, 0.25) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: phase === 'logo' || phase === 'text' ? [0.2, 0.4, 0.2] : 0,
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: phase === 'logo' || phase === 'text' ? [0.15, 0.35, 0.15] : 0,
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Logo KOCMOC Central */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: phase !== 'void' ? 1 : 0,
          scale: phase !== 'void' ? 1 : 0.5,
        }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <KocmocLogo
          size={320}
          showText={true}
          animated={true}
          color="#FFFFFF"
        />
      </motion.div>

      {/* Texto CHRONOS INFINITY */}
      <motion.div
        className="relative z-10 mt-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity: phase === 'text' || phase === 'complete' ? 1 : 0,
          y: phase === 'text' || phase === 'complete' ? 0 : 30,
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.p
          className="text-center text-sm tracking-[0.5em] text-white/70"
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          INFINITY 2026
        </motion.p>
      </motion.div>

      {/* Barra de progreso */}
      <motion.div
        className="absolute bottom-20 w-48"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase !== 'void' ? 1 : 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="h-0.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #8B00FF, #FFD700)',
              width: `${progress}%`,
            }}
          />
        </div>
        <motion.p
          className="mt-3 text-center text-xs tracking-[0.3em] text-white/40"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {progress < 30 && 'INICIALIZANDO'}
          {progress >= 30 && progress < 70 && 'CARGANDO SISTEMA'}
          {progress >= 70 && progress < 100 && 'PREPARANDO'}
          {progress >= 100 && 'ΧΡΟΝΟΣ READY'}
        </motion.p>
      </motion.div>

      {/* Skip hint */}
      <motion.p
        className="absolute bottom-8 text-xs text-white/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'text' ? 0.5 : 0 }}
      >
        Click para continuar
      </motion.p>

      {/* Click to skip */}
      <div
        className="absolute inset-0 z-20 cursor-pointer"
        onClick={() => phase === 'text' && onComplete()}
      />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default function LoginPage() {
  const router = useRouter()
  const [showIntro, setShowIntro] = useState(true)
  const [isReady, setIsReady] = useState(false)

  // Verificar si ya se mostró la animación de intro en esta sesión
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('chronos-intro-seen-v2')
    if (hasSeenIntro) {
      setShowIntro(false)
      setIsReady(true)
    }
  }, [])

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem('chronos-intro-seen-v2', 'true')
    setShowIntro(false)
    setTimeout(() => setIsReady(true), 100)
  }, [])

  const handleSuccess = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  const handleRegisterClick = useCallback(() => {
    router.push('/register')
  }, [router])

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animación de Intro - KOCMOC Opening */}
      <AnimatePresence mode="wait">
        {showIntro && (
          <KocmocOpeningAnimation onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {/* Contenido principal - Login */}
      <AnimatePresence>
        {!showIntro && isReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlassmorphicGateway
              onSuccess={handleSuccess}
              onRegisterClick={handleRegisterClick}
              showSocialLogin={true}
              enableBiometric={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
