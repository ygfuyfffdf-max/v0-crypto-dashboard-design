/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS REGISTER PAGE — SILVER SPACE PREMIUM EDITION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Página de registro premium con:
 * - Partículas de plata espacial de alta calidad
 * - Logo KOCMOC animado
 * - Integración con Clerk para registro de usuarios
 * - Verificación de email
 * - Colores: Plata/Negro/Blanco únicamente
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import dynamic from 'next/dynamic'

// Auth Gateway integrado con Clerk
import { KocmocRegisterForm } from '@/app/_components/auth/KocmocAuthGateway'

// KOCMOC Premium System - Silver Space
const SilverDustBackground = dynamic(
  () => import('@/app/_components/cinematics/KocmocPremiumSystem').then((mod) => mod.SilverDustBackground),
  { ssr: false }
)

const KocmocLogoPremium = dynamic(
  () => import('@/app/_components/cinematics/KocmocPremiumSystem').then((mod) => mod.KocmocLogoPremium),
  { ssr: false }
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN REGISTER PAGE - SILVER SPACE EDITION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default function RegisterPage() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(true)

  const handleSuccess = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  const handleSignInClick = useCallback(() => {
    router.push('/login')
  }, [router])

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Contenido principal - Register con fondo de partículas */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            className="relative min-h-screen flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <KocmocLogoPremium
                size={100}
                animated={true}
                showText={true}
                animationPhase="complete"
              />
            </motion.div>

            {/* Formulario de Registro con Clerk */}
            <div className="relative z-10 w-full px-4 pt-28 pb-8">
              <KocmocRegisterForm
                onSuccess={handleSuccess}
                onSignInClick={handleSignInClick}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
