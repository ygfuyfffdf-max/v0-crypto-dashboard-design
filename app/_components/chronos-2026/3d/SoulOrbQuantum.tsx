/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 💎 CHRONOS 2026 — SOUL ORB QUANTUM
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * El "alma" del sistema CHRONOS - un orb 3D que representa el estado
 * financiero completo de la empresa en tiempo real.
 *
 * Características:
 * - Pulsa con el capital total (escala dinámica)
 * - Cambia de color según el mood financiero (-1 crisis → 0 neutro → +1 éxtasis)
 * - Sincroniza con el pulso del usuario (opcional via webcam PPG o manual)
 * - Partículas que representan flujo de transacciones
 * - Ondas de energía cuando hay ventas/ingresos
 *
 * Paleta: #8B00FF / #FFD700 / #FF1493 (⛔ CYAN PROHIBIDO)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useHaptic } from '@/app/_hooks/useHapticFeedback'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export type FinancialMood = 'crisis' | 'stress' | 'neutral' | 'flow' | 'ecstasy'

export interface SoulOrbQuantumProps {
  /** Capital total actual */
  capital: number
  /** Capital máximo histórico (para calcular escala relativa) */
  maxCapital?: number
  /** Mood financiero: -1 (crisis) a +1 (éxtasis) */
  mood?: number
  /** Pulso del usuario en BPM (60-120 típico) */
  userPulse?: number
  /** Tamaño del contenedor */
  size?: number
  /** Clase CSS adicional */
  className?: string
  /** Mostrar label de capital */
  showLabel?: boolean
  /** Callback cuando se hace click */
  onClick?: () => void
  /** Mostrar partículas de transacciones */
  showTransactions?: boolean
  /** Número de transacciones recientes (afecta intensidad de partículas) */
  recentTransactions?: number
}

interface CoreOrbProps {
  capital: number
  maxCapital: number
  mood: number
  userPulse: number
  showTransactions: boolean
  transactionIntensity: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLORES POR MOOD (Paleta CHRONOS)
// ═══════════════════════════════════════════════════════════════════════════════

const MOOD_COLORS = {
  crisis: { primary: '#ef4444', secondary: '#dc2626', glow: 'rgba(239, 68, 68, 0.6)' },
  stress: { primary: '#f97316', secondary: '#ea580c', glow: 'rgba(249, 115, 22, 0.5)' },
  neutral: { primary: '#8b5cf6', secondary: '#a855f7', glow: 'rgba(139, 92, 246, 0.5)' },
  flow: { primary: '#10b981', secondary: '#34d399', glow: 'rgba(16, 185, 129, 0.5)' },
  ecstasy: { primary: '#fbbf24', secondary: '#FFD700', glow: 'rgba(251, 191, 36, 0.7)' },
}

function getMoodFromValue(mood: number): FinancialMood {
  if (mood <= -0.6) return 'crisis'
  if (mood <= -0.2) return 'stress'
  if (mood <= 0.2) return 'neutral'
  if (mood <= 0.6) return 'flow'
  return 'ecstasy'
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE ORB (Esfera central con distorsión)
// ═══════════════════════════════════════════════════════════════════════════════

function CoreOrb({
  capital,
  maxCapital,
  mood,
  userPulse,
  showTransactions,
  transactionIntensity,
}: CoreOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const ringsRef = useRef<THREE.Group>(null)

  const moodType = getMoodFromValue(mood)
  const colors = MOOD_COLORS[moodType]

  // Calcular escala basada en capital (0.8 - 1.5)
  const capitalScale = useMemo(() => {
    const ratio = Math.min(capital / maxCapital, 1)
    return 0.8 + ratio * 0.7
  }, [capital, maxCapital])

  // Calcular frecuencia de pulso basada en userPulse
  const pulseFrequency = useMemo(() => {
    return (userPulse || 72) / 60 // BPM a Hz
  }, [userPulse])

  useFrame((state) => {
    if (!meshRef.current) return

    const time = state.clock.elapsedTime

    // Rotación lenta del orb
    meshRef.current.rotation.y = time * 0.1
    meshRef.current.rotation.x = Math.sin(time * 0.05) * 0.1

    // Pulso basado en BPM del usuario
    const pulse = Math.sin(time * pulseFrequency * Math.PI * 2) * 0.05 + 1
    meshRef.current.scale.setScalar(capitalScale * pulse)

    // Glow pulsante
    if (glowRef.current) {
      const glowPulse = Math.sin(time * pulseFrequency * Math.PI * 2) * 0.15 + 1
      glowRef.current.scale.setScalar(capitalScale * 1.3 * glowPulse)
    }

    // Anillos de energía rotando
    if (ringsRef.current) {
      ringsRef.current.rotation.z = time * 0.5
      ringsRef.current.rotation.x = Math.sin(time * 0.3) * 0.2
    }
  })

  // Distorsión basada en mood (más caótico en crisis, más suave en éxtasis)
  const distortAmount = useMemo(() => {
    if (mood <= -0.5) return 0.6 // Crisis: muy distorsionado
    if (mood <= 0) return 0.4 // Stress: moderado
    if (mood <= 0.5) return 0.3 // Normal: suave
    return 0.2 // Éxtasis: casi esférico perfecto
  }, [mood])

  return (
    <group>
      {/* Glow exterior */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshBasicMaterial
          color={colors.primary}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Orb principal con distorsión */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[1, 64, 64]} />
          <MeshDistortMaterial
            color={colors.primary}
            emissive={colors.secondary}
            emissiveIntensity={0.4}
            distort={distortAmount}
            speed={2 + mood} // Más rápido en éxtasis
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Float>

      {/* Anillos de energía */}
      <group ref={ringsRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.02, 16, 100]} />
          <meshBasicMaterial color={colors.secondary} transparent opacity={0.4} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
          <torusGeometry args={[1.7, 0.015, 16, 100]} />
          <meshBasicMaterial color={colors.primary} transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Partículas de transacciones */}
      {showTransactions && (
        <Sparkles
          count={50 + transactionIntensity * 50}
          scale={4}
          size={2 + transactionIntensity}
          speed={0.5 + mood * 0.5}
          color={colors.primary}
        />
      )}

      {/* Core brillante central */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export function SoulOrbQuantum({
  capital,
  maxCapital = capital * 1.5,
  mood = 0,
  userPulse = 72,
  size = 300,
  className = '',
  showLabel = true,
  onClick,
  showTransactions = true,
  recentTransactions = 0,
}: SoulOrbQuantumProps) {
  const { haptic } = useHaptic()
  const [isHovered, setIsHovered] = useState(false)

  const moodType = getMoodFromValue(mood)
  const colors = MOOD_COLORS[moodType]

  // Formatear capital
  const formattedCapital = useMemo(() => {
    if (capital >= 1000000) {
      return `$${(capital / 1000000).toFixed(2)}M`
    }
    if (capital >= 1000) {
      return `$${(capital / 1000).toFixed(1)}K`
    }
    return `$${capital.toLocaleString()}`
  }, [capital])

  // Mood label
  const moodLabel = useMemo(() => {
    switch (moodType) {
      case 'crisis':
        return '⚠️ Crisis'
      case 'stress':
        return '😰 Estrés'
      case 'neutral':
        return '😐 Neutral'
      case 'flow':
        return '✨ Flow'
      case 'ecstasy':
        return '🎉 Éxtasis'
    }
  }, [moodType])

  const handleClick = useCallback(() => {
    // Haptic feedback basado en mood
    if (moodType === 'ecstasy') {
      haptic('ecstasy')
    } else if (moodType === 'crisis') {
      haptic('error')
    } else {
      haptic('impact-medium')
    }
    onClick?.()
  }, [haptic, moodType, onClick])

  const handleHover = useCallback(
    (hovering: boolean) => {
      setIsHovered(hovering)
      if (hovering) {
        haptic('selection')
      }
    },
    [haptic],
  )

  // Intensidad de transacciones (0-1)
  const transactionIntensity = Math.min(recentTransactions / 10, 1)

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onHoverStart={() => handleHover(true)}
      onHoverEnd={() => handleHover(false)}
      onClick={handleClick}
    >
      {/* Glow background */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isHovered
            ? `0 0 60px 20px ${colors.glow}, 0 0 100px 40px ${colors.glow}`
            : `0 0 40px 10px ${colors.glow}`,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Canvas 3D */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color={colors.primary} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color={colors.secondary} />

        <CoreOrb
          capital={capital}
          maxCapital={maxCapital}
          mood={mood}
          userPulse={userPulse}
          showTransactions={showTransactions}
          transactionIntensity={transactionIntensity}
        />
      </Canvas>

      {/* Label de capital */}
      {showLabel && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-2xl font-bold text-white drop-shadow-lg">{formattedCapital}</div>
          <div className="text-sm font-medium" style={{ color: colors.primary }}>
            {moodLabel}
          </div>
        </motion.div>
      )}

      {/* Indicador de pulso */}
      {userPulse && (
        <motion.div
          className="absolute top-4 right-4 flex items-center gap-1 text-xs text-white/60"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 60 / userPulse, repeat: Infinity }}
        >
          <span className="text-red-400">❤️</span>
          <span>{userPulse} BPM</span>
        </motion.div>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default SoulOrbQuantum
