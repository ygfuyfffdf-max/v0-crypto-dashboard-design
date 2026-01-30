'use client'

/**
 * 🌌 KOCMOC CINEMATIC 3D — SILVER SPACE EDITION
 * Cinematográfica premium con colores plata/negro/blanco
 */

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { SilverSpaceCinematic } from './KocmocPremiumSystem'

interface KocmocCinematic3DProps {
  onComplete?: () => void
  duration?: number
  autoStart?: boolean
}

export function KocmocCinematic3D({
  onComplete,
  duration = 7000,
  autoStart = true,
}: KocmocCinematic3DProps) {
  const [isVisible, setIsVisible] = useState(autoStart)

  const handleComplete = () => {
    setIsVisible(false)
    onComplete?.()
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <SilverSpaceCinematic
        onComplete={handleComplete}
        duration={duration}
        showChronos={true}
      />
    </AnimatePresence>
  )
}

export default KocmocCinematic3D
