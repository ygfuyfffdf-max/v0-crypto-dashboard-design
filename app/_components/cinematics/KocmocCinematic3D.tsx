'use client'

/**
 * 🌌 KOCMOC CINEMATIC 3D — Safe Version with Fallback
 */

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

interface KocmocCinematic3DProps {
  onComplete?: () => void
  duration?: number
  autoStart?: boolean
}

type Phase = 'fadein' | 'chaos' | 'forming' | 'complete' | 'forming-text' | 'finished'

// Fallback 2D cinematográfica (sin Three.js)
function CinematicFallback2D({ phase, duration }: { phase: Phase; duration: number }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      {/* Logo KOCMOC */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative mb-12">
          {/* Logo atómico simplificado */}
          <div className="relative h-48 w-48">
            {/* Núcleo */}
            <motion.div
              className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-sm"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Órbitas */}
            {[80, 120, 160].map((size, i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                style={{
                  width: size,
                  height: size,
                  borderColor: ['#8B5CF6', '#06B6D4', '#EC4899'][i],
                  opacity: 0.3,
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 10 + i * 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}

            {/* Texto КОСМОС */}
            <motion.div
              className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-2xl font-bold text-white/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'complete' ? 0.4 : 0 }}
            >
              КОСМОС
            </motion.div>
          </div>
        </div>

        {/* Texto ΧΡΟΝΟΣ */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{
            opacity: phase === 'forming-text' || phase === 'finished' ? 1 : 0,
            y: phase === 'forming-text' || phase === 'finished' ? 0 : 50,
          }}
          transition={{ duration: 1, delay: 5 }}
        >
          <div
            className="text-6xl font-bold tracking-widest md:text-8xl"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 50%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(139, 92, 246, 0.8))',
            }}
          >
            ΧΡΟΝΟΣ
          </div>
        </motion.div>
      </motion.div>

      {/* Progress bar */}
      <motion.div className="absolute bottom-8 left-1/2 h-1 w-64 -translate-x-1/2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 via-cyan-500 to-fuchsia-500"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      </motion.div>
    </div>
  )
}

export function KocmocCinematic3D({
  onComplete,
  duration = 8000,
  autoStart = true,
}: KocmocCinematic3DProps) {
  const [phase, setPhase] = useState<Phase>('fadein')
  const [isVisible, setIsVisible] = useState(autoStart)
  const [use3D] = useState(false) // Deshabilitado temporalmente por issues de WebGL

  useEffect(() => {
    if (!isVisible) return

    const timers = [
      setTimeout(() => setPhase('chaos'), 1000),
      setTimeout(() => setPhase('forming'), 3000),
      setTimeout(() => setPhase('complete'), 5000),
      setTimeout(() => setPhase('forming-text'), 6000),
      setTimeout(() => setPhase('finished'), 7000),
      setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, duration),
    ]

    return () => timers.forEach(t => clearTimeout(t))
  }, [isVisible, duration, onComplete])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Usar fallback 2D por ahora */}
        <CinematicFallback2D phase={phase} duration={duration} />
      </motion.div>
    </AnimatePresence>
  )
}

export default KocmocCinematic3D
