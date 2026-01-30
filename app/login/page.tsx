/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS LOGIN PAGE — SILVER SPACE PREMIUM EDITION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Página de login premium con:
 * - Animación KOCMOC Silver Space (logo orbital)
 * - Partículas de plata espacial de alta calidad
 * - Integración con Clerk para autenticación
 * - Colores: Plata/Negro/Blanco únicamente
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Auth Gateway integrado con Clerk
import { KocmocLoginForm } from '@/app/_components/auth/KocmocAuthGateway'

// KOCMOC Premium System - Silver Space
const SilverSpaceCinematic = dynamic(
  () => import('@/app/_components/cinematics/KocmocPremiumSystem').then((mod) => mod.SilverSpaceCinematic),
  { ssr: false }
)

const SilverDustBackground = dynamic(
  () => import('@/app/_components/cinematics/KocmocPremiumSystem').then((mod) => mod.SilverDustBackground),
  { ssr: false }
)

const KocmocLogoPremium = dynamic(
  () => import('@/app/_components/cinematics/KocmocPremiumSystem').then((mod) => mod.KocmocLogoPremium),
  { ssr: false }
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN LOGIN PAGE - SILVER SPACE EDITION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default function LoginPage() {
  const router = useRouter()
  const [showIntro, setShowIntro] = useState(true)
  const [isReady, setIsReady] = useState(false)

  // Verificar si ya se mostró la animación de intro en esta sesión
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('kocmoc-intro-v4')
    if (hasSeenIntro) {
      setShowIntro(false)
      setIsReady(true)
    }
  }, [])

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem('kocmoc-intro-v4', 'true')
    setShowIntro(false)
    setTimeout(() => setIsReady(true), 100)
  }, [])

  const handleSuccess = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  const handleSignUpClick = useCallback(() => {
    router.push('/register')
  }, [router])

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Cinematográfica de Intro - KOCMOC Silver Space */}
      <AnimatePresence mode="wait">
        {showIntro && (
          <SilverSpaceCinematic
            onComplete={handleIntroComplete}
            duration={6000}
            showChronos={true}
          />
        )}
      </AnimatePresence>

      {/* Contenido principal - Login con fondo de partículas */}
      <AnimatePresence>
        {!showIntro && isReady && (
          <motion.div
            className="relative min-h-screen flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Fondo de partículas Silver Dust */}
            <SilverDustBackground
              particleCount={100}
              interactive={true}
              intensity="medium"
              className="z-0"
            />

            {/* Logo en header */}
            <motion.div
              className="absolute top-8 left-1/2 -translate-x-1/2 z-20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <KocmocLogoPremium
                size={120}
                animated={true}
                showText={true}
                animationPhase="complete"
              />
            </motion.div>

            {/* Formulario de Login con Clerk */}
            <div className="relative z-10 w-full px-4 pt-32 pb-8">
              <KocmocLoginForm
                onSuccess={handleSuccess}
                onSignUpClick={handleSignUpClick}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
