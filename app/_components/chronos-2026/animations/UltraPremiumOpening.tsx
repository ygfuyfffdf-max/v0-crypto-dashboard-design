/**
 * 🎬 ULTRA PREMIUM OPENING - Versión optimizada
 * Animación cinematográfica con efectos avanzados 2D
 */

'use client'

import { AnimatePresence, motion, useAnimation } from 'motion/react'
import { useEffect, useState } from 'react'

interface UltraPremiumOpeningProps {
  onComplete?: () => void
  duration?: number
}

export function UltraPremiumOpening({ onComplete, duration = 6500 }: UltraPremiumOpeningProps) {
  const [phase, setPhase] = useState<'intro' | 'logo' | 'name' | 'complete'>('intro')
  const [show, setShow] = useState(true)
  const controls = useAnimation()

  useEffect(() => {
    const sequence = async () => {
      await controls.start({ opacity: 1 })

      setTimeout(() => setPhase('logo'), 300)
      setTimeout(() => setPhase('name'), 2500)
      setTimeout(() => setPhase('complete'), 5000)

      setTimeout(async () => {
        await controls.start({ opacity: 0 })
        setShow(false)
        onComplete?.()
      }, duration)
    }

    sequence()
  }, [duration, onComplete, controls])

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={controls}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at center, #0a0a0f 0%, #000000 100%)',
          backdropFilter: 'blur(0px)',
          willChange: 'opacity, backdrop-filter',
        }}
      >
        {/* Aurora dinámica mejorada */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 0% 50%, rgba(139,92,246,0.6) 0%, rgba(236,72,153,0.3) 30%, transparent 60%)',
                'radial-gradient(circle at 100% 50%, rgba(236,72,153,0.6) 0%, rgba(6,182,212,0.3) 30%, transparent 60%)',
                'radial-gradient(circle at 50% 0%, rgba(6,182,212,0.6) 0%, rgba(139,92,246,0.3) 30%, transparent 60%)',
                'radial-gradient(circle at 50% 100%, rgba(139,92,246,0.6) 0%, rgba(236,72,153,0.3) 30%, transparent 60%)',
                'radial-gradient(circle at 0% 50%, rgba(139,92,246,0.6) 0%, rgba(236,72,153,0.3) 30%, transparent 60%)',
              ],
              scale: [1, 1.1, 1, 0.9, 1],
              rotate: [0, 5, -5, 10, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: [0.45, 0, 0.55, 1],
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
            className="absolute inset-0 blur-[100px] opacity-80"
            style={{ mixBlendMode: 'screen' }}
          />

          {/* Aurora secundaria para más profundidad */}
          <motion.div
            animate={{
              background: [
                'radial-gradient(ellipse at 30% 30%, rgba(168,85,247,0.4) 0%, transparent 50%)',
                'radial-gradient(ellipse at 70% 70%, rgba(244,114,182,0.4) 0%, transparent 50%)',
                'radial-gradient(ellipse at 70% 30%, rgba(34,211,238,0.4) 0%, transparent 50%)',
                'radial-gradient(ellipse at 30% 70%, rgba(168,85,247,0.4) 0%, transparent 50%)',
                'radial-gradient(ellipse at 30% 30%, rgba(168,85,247,0.4) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 blur-[120px] opacity-60"
            style={{ mixBlendMode: 'soft-light' }}
          />
        </div>

        {/* Grid holográfico animado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.12, 0.08, 0.15, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139,92,246,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139,92,246,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />

        {/* Líneas de energía flotantes */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 0.6, 0],
              y: ['-100%', '100%'],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'easeInOut',
            }}
            className="absolute left-0 right-0 h-px"
            style={{
              top: `${20 + i * 15}%`,
              background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent)',
              transformOrigin: 'center',
            }}
          />
        ))}

        {/* Logo KOCMOC */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0, rotateY: -180 }}
            animate={{
              opacity: phase === 'logo' || phase === 'name' ? 1 : 0,
              scale: phase === 'logo' || phase === 'name' ? 1 : 0,
              rotateY: phase === 'logo' || phase === 'name' ? 0 : -180,
              y: phase === 'name' ? -120 : 0,
            }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
            style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
          >
            {/* Logo 3D simulado con múltiples capas mejorado */}
            <div className="relative" style={{ filter: 'drop-shadow(0 0 60px rgba(139,92,246,0.4))' }}>
              {/* Sombras de profundidad con blur progresivo */}
              {[...Array(12)].map((_, i) => (
                <motion.h1
                  key={i}
                  animate={{
                    textShadow: [
                      `0 0 ${30 + i * 4}px rgba(139,92,246,${0.4 - i * 0.03})`,
                      `0 ${i * 2}px ${40 + i * 4}px rgba(236,72,153,${0.4 - i * 0.03})`,
                      `${i}px 0 ${30 + i * 4}px rgba(6,182,212,${0.4 - i * 0.03})`,
                      `0 0 ${30 + i * 4}px rgba(139,92,246,${0.4 - i * 0.03})`,
                    ],
                    filter: [
                      `blur(${i * 0.3}px)`,
                      `blur(${i * 0.5}px)`,
                      `blur(${i * 0.3}px)`,
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.08,
                    ease: [0.45, 0, 0.55, 1],
                  }}
                  className="absolute inset-0 text-[12rem] font-black tracking-[0.4em]"
                  style={{
                    transform: `translateZ(${-i * 2.5}px) scale(${1 - i * 0.01})`,
                    opacity: 1 - i * 0.08,
                    willChange: 'transform, filter',
                  }}
                >
                  <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
                    KOCMOC
                  </span>
                </motion.h1>
              ))}

              {/* Texto principal con efectos de cristal */}
              <motion.h1
                animate={{
                  textShadow: [
                    '0 0 50px rgba(139,92,246,1), 0 0 100px rgba(139,92,246,0.6), 0 10px 60px rgba(139,92,246,0.3)',
                    '0 0 60px rgba(236,72,153,1), 0 0 120px rgba(236,72,153,0.6), 0 10px 80px rgba(236,72,153,0.3)',
                    '0 0 50px rgba(6,182,212,1), 0 0 100px rgba(6,182,212,0.6), 0 10px 60px rgba(6,182,212,0.3)',
                    '0 0 50px rgba(139,92,246,1), 0 0 100px rgba(139,92,246,0.6), 0 10px 60px rgba(139,92,246,0.3)',
                  ],
                  filter: [
                    'brightness(1.1) contrast(1.1)',
                    'brightness(1.3) contrast(1.2)',
                    'brightness(1.2) contrast(1.15)',
                    'brightness(1.1) contrast(1.1)',
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative text-[12rem] font-black tracking-[0.4em]"
                style={{
                  transform: 'translateZ(0px)',
                  willChange: 'filter, text-shadow',
                }}
              >
                <span className="relative bg-gradient-to-r from-violet-300 via-fuchsia-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-gradient">
                  KOCMOC
                  {/* Brillo interno */}
                  <span className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/60 to-white/40 bg-clip-text text-transparent mix-blend-overlay animate-shimmer" />
                </span>
              </motion.h1>

              {/* Reflejos */}
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-t from-violet-500/20 to-transparent blur-xl"
                style={{ transform: 'translateZ(-20px) scaleY(-1)', transformOrigin: 'top' }}
              />
            </div>

            {/* Indicadores de carga */}
            <div className="flex items-center justify-center gap-4 mt-8">
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [0.3, 1, 0.3],
                    backgroundColor: [
                      'rgba(139,92,246,0.5)',
                      'rgba(236,72,153,0.8)',
                      'rgba(6,182,212,0.5)',
                      'rgba(139,92,246,0.5)',
                    ],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.12,
                  }}
                  className="w-4 h-4 rounded-full"
                  style={{
                    boxShadow: '0 0 20px currentColor',
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* CHRONOS griego */}
          <motion.div
            initial={{ opacity: 0, y: 200, scale: 0.5, filter: 'blur(30px)' }}
            animate={{
              opacity: phase === 'name' || phase === 'complete' ? 1 : 0,
              y: phase === 'name' || phase === 'complete' ? 120 : 200,
              scale: phase === 'name' || phase === 'complete' ? 1 : 0.5,
              filter: phase === 'name' || phase === 'complete' ? 'blur(0px)' : 'blur(30px)',
            }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="text-center"
          >
            {/* Título griego con múltiples capas y efecto cristal */}
            <div className="relative mb-8" style={{ filter: 'drop-shadow(0 0 80px rgba(139,92,246,0.5))' }}>
              {/* Capas de profundidad con blur progresivo */}
              {[...Array(7)].map((_, i) => (
                <motion.h2
                  key={i}
                  animate={{
                    textShadow: [
                      `0 0 ${50 + i * 8}px rgba(139,92,246,${0.5 - i * 0.06})`,
                      `0 ${i * 3}px ${60 + i * 10}px rgba(236,72,153,${0.5 - i * 0.06})`,
                      `${i * 2}px 0 ${50 + i * 8}px rgba(6,182,212,${0.5 - i * 0.06})`,
                      `0 0 ${50 + i * 8}px rgba(139,92,246,${0.5 - i * 0.06})`,
                    ],
                    filter: `blur(${i * 0.5}px) brightness(${1.2 - i * 0.05})`,
                    scale: [1, 1.02, 0.98, 1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: [0.45, 0, 0.55, 1],
                  }}
                  className="absolute inset-0 text-9xl font-bold tracking-[0.3em]"
                  style={{
                    transform: `translateZ(${-i * 1.5}px) scale(${1 - i * 0.008})`,
                    opacity: 1 - i * 0.12,
                    willChange: 'transform, filter',
                  }}
                >
                  <span className="text-white">ΧΡΟΝΟΣ</span>
                </motion.h2>
              ))}

              {/* Texto principal con efecto de cristal */}
              <motion.h2
                animate={{
                  textShadow: [
                    '0 0 80px rgba(139,92,246,1), 0 0 150px rgba(139,92,246,0.8), 0 20px 100px rgba(139,92,246,0.4)',
                    '0 0 90px rgba(236,72,153,1), 0 0 170px rgba(236,72,153,0.8), 0 20px 120px rgba(236,72,153,0.4)',
                    '0 0 80px rgba(6,182,212,1), 0 0 150px rgba(6,182,212,0.8), 0 20px 100px rgba(6,182,212,0.4)',
                    '0 0 80px rgba(139,92,246,1), 0 0 150px rgba(139,92,246,0.8), 0 20px 100px rgba(139,92,246,0.4)',
                  ],
                  scale: [1, 1.015, 1],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative text-9xl font-bold tracking-[0.3em]"
                style={{ willChange: 'transform, text-shadow' }}
              >
                <span className="relative text-white">
                  ΧΡΟΝΟΣ
                  {/* Overlay de brillo */}
                  <motion.span
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent bg-[length:200%_100%] bg-clip-text text-transparent"
                  />
                </span>
              </motion.h2>

              {/* Partículas de energía alrededor del texto */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  animate={{
                    x: [0, Math.cos(i * 45 * Math.PI / 180) * 80, 0],
                    y: [0, Math.sin(i * 45 * Math.PI / 180) * 80, 0],
                    opacity: [0, 0.8, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeOut',
                  }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                  style={{
                    background: i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#ec4899' : '#06b6d4',
                    boxShadow: '0 0 20px currentColor',
                  }}
                />
              ))}
            </div>

            {/* Subtítulo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="space-y-3"
            >
              <p className="text-3xl text-gray-300 tracking-[0.4em] font-light">
                INFINITY SYSTEM
              </p>

              {/* Línea animada con flujo de energía */}
              <div className="relative w-96 h-2 mx-auto rounded-full overflow-hidden">
                <motion.div
                  animate={{
                    background: [
                      'linear-gradient(90deg, rgba(139,92,246,0) 0%, rgba(139,92,246,1) 50%, rgba(139,92,246,0) 100%)',
                      'linear-gradient(90deg, rgba(236,72,153,0) 0%, rgba(236,72,153,1) 50%, rgba(236,72,153,0) 100%)',
                      'linear-gradient(90deg, rgba(6,182,212,0) 0%, rgba(6,182,212,1) 50%, rgba(6,182,212,0) 100%)',
                      'linear-gradient(90deg, rgba(139,92,246,0) 0%, rgba(139,92,246,1) 50%, rgba(139,92,246,0) 100%)',
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="h-full w-full rounded-full"
                  style={{
                    boxShadow: '0 0 30px currentColor, inset 0 0 20px rgba(255,255,255,0.3)',
                    filter: 'blur(1px)',
                  }}
                />

                {/* Pulsos de energía que viajan */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      x: ['-100%', '300%'],
                      opacity: [0, 1, 1, 0],
                      scale: [0.5, 1.2, 1, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.7,
                      ease: 'easeInOut',
                    }}
                    className="absolute top-0 left-0 w-20 h-full rounded-full"
                    style={{
                      background: 'radial-gradient(ellipse, rgba(255,255,255,0.9), transparent)',
                      filter: 'blur(2px)',
                    }}
                  />
                ))}
              </div>

              <p className="text-2xl text-gray-500 tracking-[0.6em] font-extralight">
                2026
              </p>
            </motion.div>
          </motion.div>
        </div>

{/* Partículas flotantes hexagonales mejoradas */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(25)].map((_, i) => {
            const startX = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920)
            const color = i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#ec4899' : '#06b6d4'
            const size = 60 + Math.random() * 80

            return (
              <motion.div
                key={i}
                initial={{
                  x: startX,
                  y: (typeof window !== 'undefined' ? window.innerHeight : 1080) + 100,
                  rotate: 0,
                  scale: 0.3 + Math.random() * 0.7,
                  opacity: 0,
                }}
                animate={{
                  y: -200,
                  x: [
                    startX,
                    startX + Math.sin(i) * 150,
                    startX - Math.cos(i) * 100,
                    startX + Math.sin(i * 2) * 120,
                    startX,
                  ],
                  rotate: [0, 180, 360],
                  opacity: [0, 0.7, 0.8, 0.6, 0],
                  scale: [
                    0.3 + Math.random() * 0.7,
                    0.8 + Math.random() * 0.4,
                    0.5 + Math.random() * 0.5,
                  ],
                  filter: [
                    'blur(0px) brightness(1)',
                    'blur(2px) brightness(1.3)',
                    'blur(1px) brightness(1.1)',
                    'blur(0px) brightness(1)',
                  ],
                }}
                transition={{
                  duration: 12 + Math.random() * 6,
                  repeat: Infinity,
                  delay: Math.random() * 8,
                  ease: [0.45, 0, 0.55, 1],
                  times: [0, 0.3, 0.6, 0.9, 1],
                }}
                className="absolute"
                style={{
                  width: size,
                  height: size,
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  background: `linear-gradient(135deg, ${color}70, transparent)`,
                  border: `2px solid ${color}`,
                  boxShadow: `0 0 40px ${color}, inset 0 0 30px ${color}40`,
                  backdropFilter: 'blur(4px)',
                  willChange: 'transform, opacity, filter',
                }}
              />
            )
          })}
        </div>

        {/* Scan lines */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] bg-[size:100%_4px] opacity-40" />

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            className="h-full relative overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #06b6d4, #8b5cf6)',
              backgroundSize: '200% 100%',
              boxShadow: '0 0 20px currentColor',
            }}
          >
            <motion.div
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 w-1/3"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
