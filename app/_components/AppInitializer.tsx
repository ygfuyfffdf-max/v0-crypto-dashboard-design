'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 APP INITIALIZER — KOCMOC Cinematic Integration
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Componente que gestiona:
 * - Mostrar cinematográfica KOCMOC en primera visita
 * - Guardar estado en localStorage para no repetir
 * - Transición suave a la aplicación
 */

import { AnimatePresence, motion } from 'motion/react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Cargar cinematográfica dinámicamente (solo cliente)
const KocmocCinematic3D = dynamic(
  () => import('./cinematics/KocmocCinematic3D'),
  { ssr: false },
)

interface AppInitializerProps {
  children: React.ReactNode
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [showCinematic, setShowCinematic] = useState(false)
  const [cinematicComplete, setCinematicComplete] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Verificar si ya se mostró la cinematográfica
    const hasSeenCinematic = localStorage.getItem('chronos_kocmoc_seen')

    if (hasSeenCinematic) {
      // Ya la vio, pasar directo a la app
      setCinematicComplete(true)
      setIsReady(true)
    } else {
      // Primera visita, mostrar cinematográfica
      setShowCinematic(true)
      setIsReady(true)
    }
  }, [])

  const handleCinematicComplete = () => {
    // Guardar en localStorage que ya se mostró
    localStorage.setItem('chronos_kocmoc_seen', 'true')
    localStorage.setItem('chronos_kocmoc_date', new Date().toISOString())

    // Marcar como completada
    setShowCinematic(false)

    // Pequeño delay para transición suave
    setTimeout(() => {
      setCinematicComplete(true)
    }, 500)
  }

  // Mientras carga, mostrar nada (evita flash)
  if (!isReady) {
    return null
  }

  // Si debe mostrar cinematográfica
  if (showCinematic) {
    return (
      <KocmocCinematic3D
        onComplete={handleCinematicComplete}
        duration={8000}
        autoStart={true}
      />
    )
  }

  // Si cinematográfica no está completa, mostrar loading
  if (!cinematicComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <motion.div
          className="text-2xl font-bold text-white"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ΧΡΟΝΟΣ
        </motion.div>
      </div>
    )
  }

  // Cinematográfica completada o ya vista, mostrar app con fade in
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="app-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Función helper para resetear y volver a mostrar cinematográfica
export function resetCinematic() {
  localStorage.removeItem('chronos_kocmoc_seen')
  localStorage.removeItem('chronos_kocmoc_date')
  window.location.reload()
}
