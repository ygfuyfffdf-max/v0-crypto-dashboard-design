'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎯 DEMO PAGE — TODAS LAS MEJORAS SUPREME INTEGRADAS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Página de demostración que muestra TODAS las mejoras Supreme funcionando:
 * ✅ Theme System (Dark/Light + 8 paletas)
 * ✅ Sound System (15 efectos + control de volumen)
 * ✅ Advanced Gestures (swipe, pinch, long press, double tap)
 * ✅ Enhanced WebGL Particles (10,000+ partículas interactivas)
 * ✅ Haptic Feedback
 * ✅ Integración con componentes existentes
 */

import {
  EnhancedModal,
  EnhancedModalButton,
} from '@/app/_components/chronos-2026/enhanced/EnhancedModal'
import { EnhancedPremiumBancoCard } from '@/app/_components/chronos-2026/enhanced/EnhancedPremiumBancoCard'
import { EnhancedWebGLParticles } from '@/app/_components/chronos-2026/particles/EnhancedWebGLParticles'
import { ThemeCustomizationUI } from '@/app/_components/chronos-2026/widgets/ThemeCustomizationUI'
import { ThemeToggle } from '@/app/_components/chronos-2026/widgets/ThemeToggle'
import {
  SoundButton,
  SoundCard,
} from '@/app/_components/chronos-2026/wrappers/SoundEnhancedComponents'
import { ThemeProvider } from '@/app/_components/providers/ThemeProvider'
import { SoundControlPanel, useSoundManager } from '@/app/lib/audio/sound-system'
import {
  useDoubleTap,
  useLongPress,
  usePinchZoom,
  useSwipe,
} from '@/app/lib/gestures/advanced-gestures'
import { Cpu, Fingerprint, Headphones, Info, Palette, Sparkles, Volume2, X, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function SupremeIntegrationDemoPage() {
  const [showModal, setShowModal] = useState(false)
  const [showThemeUI, setShowThemeUI] = useState(false)
  const [currentBancoIndex, setCurrentBancoIndex] = useState(0)
  const { play } = useSoundManager()

  // ═════════════════════════════════════════════════════════════════════════════════════════════════
  // DEMO BANCOS DATA
  // ═════════════════════════════════════════════════════════════════════════════════════════════════

  const demoBancos = [
    {
      id: 'boveda_monte_demo',
      nombre: 'Bóveda Monte',
      capitalActual: 250000,
      historicoIngresos: 500000,
      historicoGastos: 250000,
      cambio: 15.5,
      color: '#a78bfa',
    },
    {
      id: 'boveda_usa_demo',
      nombre: 'Bóveda USA',
      capitalActual: 180000,
      historicoIngresos: 400000,
      historicoGastos: 220000,
      cambio: 8.2,
      color: '#60a5fa',
    },
    {
      id: 'profit_demo',
      nombre: 'Profit',
      capitalActual: 95000,
      historicoIngresos: 150000,
      historicoGastos: 55000,
      cambio: -3.1,
      color: '#34d399',
    },
  ]

  const currentBanco = demoBancos[currentBancoIndex]

  // ═════════════════════════════════════════════════════════════════════════════════════════════════
  // GESTURES DEMO
  // ═════════════════════════════════════════════════════════════════════════════════════════════════

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      toast.info('👈 Swipe Left detectado')
      play('whoosh')
    },
    onSwipeRight: () => {
      toast.info('👉 Swipe Right detectado')
      play('whoosh')
    },
    onSwipeUp: () => {
      toast.info('👆 Swipe Up detectado')
      play('whoosh')
    },
    onSwipeDown: () => {
      toast.info('👇 Swipe Down detectado')
      play('whoosh')
    },
  })

  const [scale, setScale] = useState(1)
  const pinchHandlers = usePinchZoom({
    onPinch: (newScale) => {
      setScale(newScale.scale)
      if (newScale.scale > 1.5) {
        toast.success(`🔍 Zoom: ${(newScale.scale * 100).toFixed(0)}%`)
      }
    },
  })

  const longPressHandlers = useLongPress({
    onLongPress: () => {
      toast.success('⏳ Long Press detectado (600ms)')
      play('success')
      navigator.vibrate?.([50, 100, 50])
    },
    longPressDelay: 600,
  })

  const doubleTapHandlers = useDoubleTap(
    () => {
      toast.success('👆👆 Double Tap detectado')
      play('pop')
      navigator.vibrate?.([10, 50, 10])
    },
    { doubleTapDelay: 300 }
  )

  return (
    <ThemeProvider>
      <div className="relative min-h-screen overflow-hidden bg-gray-950 text-white">
        {/* ═════════════ PARTICLES BACKGROUND ═════════════ */}
        <EnhancedWebGLParticles preset="cosmic" />

        {/* ═════════════ HEADER ═════════════ */}
        <header className="relative z-10 border-b border-white/10 bg-gray-900/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                    CHRONOS SUPREME
                  </span>
                </h1>
                <p className="text-sm text-gray-400">Integración Completa — 2026</p>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <SoundButton clickSound="click" className="rounded-full">
                  <Headphones className="h-5 w-5" />
                </SoundButton>
              </div>
            </div>
          </div>
        </header>

        {/* ═════════════ MAIN CONTENT ═════════════ */}
        <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
          {/* Stats */}
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SoundCard hoverSound="hover">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <div className="mb-2 flex items-center gap-2">
                    <Palette className="h-5 w-5 text-violet-400" />
                    <h3 className="font-bold">Theme System</h3>
                  </div>
                  <p className="text-2xl font-bold">8 Paletas</p>
                  <p className="text-sm text-gray-400">Dark/Light + Custom</p>
                </div>
              </SoundCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SoundCard hoverSound="hover">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <div className="mb-2 flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-indigo-400" />
                    <h3 className="font-bold">Sound System</h3>
                  </div>
                  <p className="text-2xl font-bold">15 Efectos</p>
                  <p className="text-sm text-gray-400">Web Audio API</p>
                </div>
              </SoundCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SoundCard hoverSound="hover">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <div className="mb-2 flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-fuchsia-400" />
                    <h3 className="font-bold">Gestures</h3>
                  </div>
                  <p className="text-2xl font-bold">4 Tipos</p>
                  <p className="text-sm text-gray-400">Swipe, Pinch, Press, Tap</p>
                </div>
              </SoundCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <SoundCard hoverSound="hover">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-bold">Particles</h3>
                  </div>
                  <p className="text-2xl font-bold">10,000+</p>
                  <p className="text-sm text-gray-400">WebGL Accelerated</p>
                </div>
              </SoundCard>
            </motion.div>
          </div>

          {/* Sound Control Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <SoundControlPanel />
          </motion.div>

          {/* Banco Cards Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
              <Cpu className="h-6 w-6 text-violet-400" />
              Enhanced Banco Cards
              <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-400">
                Swipe · Pinch · Long Press · Double Tap
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {demoBancos.map((banco, index) => (
                <EnhancedPremiumBancoCard
                  key={banco.id}
                  {...banco}
                  onClick={() => {
                    toast.success(`Abriendo detalles de ${banco.nombre}`)
                    setShowModal(true)
                  }}
                  onSwipeLeft={() => {
                    const newIndex = (index + 1) % demoBancos.length
                    setCurrentBancoIndex(newIndex)
                    const nextBanco = demoBancos[newIndex]
                    if (nextBanco) {
                      toast.info(`Navegando a ${nextBanco.nombre}`)
                    }
                  }}
                  onSwipeRight={() => {
                    const newIndex = (index - 1 + demoBancos.length) % demoBancos.length
                    setCurrentBancoIndex(newIndex)
                    const nextBanco = demoBancos[newIndex]
                    if (nextBanco) {
                      toast.info(`Navegando a ${nextBanco.nombre}`)
                    }
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Gestures Demo Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-12"
          >
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
              <Zap className="h-6 w-6 text-fuchsia-400" />
              Gestures Demo Zone
            </h2>
            <div
              {...swipeHandlers}
              {...pinchHandlers}
              {...longPressHandlers}
              {...doubleTapHandlers}
              className="touch-pan-y rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-12 text-center backdrop-blur-xl"
              style={{ transform: `scale(${scale})`, transition: 'transform 0.1s' }}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
              >
                <Fingerprint className="mx-auto mb-4 h-16 w-16 text-fuchsia-400" />
              </motion.div>
              <h3 className="mb-2 text-xl font-bold">Interactúa aquí</h3>
              <p className="mb-4 text-gray-400">
                Swipe en cualquier dirección · Pinch to zoom · Long press · Double tap
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                <span className="rounded-full bg-white/5 px-3 py-1">👆 Swipe</span>
                <span className="rounded-full bg-white/5 px-3 py-1">🤏 Pinch</span>
                <span className="rounded-full bg-white/5 px-3 py-1">⏳ Long Press</span>
                <span className="rounded-full bg-white/5 px-3 py-1">👆👆 Double Tap</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <SoundButton
              clickSound="click"
              onClick={() => setShowModal(true)}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-medium hover:from-violet-500 hover:to-indigo-500"
            >
              <Info className="mr-2 inline h-5 w-5" />
              Abrir Modal Demo
            </SoundButton>

            <SoundButton
              clickSound="whoosh"
              onClick={() => setShowThemeUI(true)}
              className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-6 py-3 font-medium hover:from-fuchsia-500 hover:to-pink-500"
            >
              <Palette className="mr-2 inline h-5 w-5" />
              Personalizar Theme
            </SoundButton>
          </motion.div>
        </main>

        {/* ═════════════ MODALS ═════════════ */}
        <EnhancedModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Modal Demo — Supreme Integration"
          size="lg"
          footer={
            <div className="flex justify-end gap-4">
              <EnhancedModalButton variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </EnhancedModalButton>
              <EnhancedModalButton
                variant="success"
                soundEffect="success"
                onClick={() => {
                  toast.success('¡Acción ejecutada!')
                  setShowModal(false)
                }}
              >
                <Sparkles className="mr-2 inline h-4 w-4" />
                Confirmar
              </EnhancedModalButton>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              Este modal incluye <strong>sound effects automáticos</strong> al abrir, cerrar y en
              todos los botones.
            </p>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h4 className="mb-2 font-bold text-white">Características integradas:</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>✅ Sonido al abrir/cerrar</li>
                <li>✅ Haptic feedback en interacciones</li>
                <li>✅ Animaciones cinematográficas</li>
                <li>✅ Aurora background dinámico</li>
                <li>✅ ESC para cerrar</li>
                <li>✅ Click fuera para cerrar (configurable)</li>
              </ul>
            </div>
          </div>
        </EnhancedModal>

        {showThemeUI && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="relative max-w-4xl">
              <button
                onClick={() => {
                  play('whoosh')
                  setShowThemeUI(false)
                }}
                className="absolute -top-4 -right-4 rounded-full bg-white/10 p-2 hover:bg-white/20"
              >
                <X className="h-6 w-6" />
              </button>
              <ThemeCustomizationUI />
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  )
}
