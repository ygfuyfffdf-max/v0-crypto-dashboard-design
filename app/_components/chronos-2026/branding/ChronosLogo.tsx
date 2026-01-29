/**
 * 🌌 CHRONOS LOGO - LOGO ORBITAL COSMOS PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════
 * Logo animado estilo cosmos con órbitas, geometría sagrada y tipografía
 * Inspirado en el concepto КОСМОС con órbitas planetarias
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import React, { useEffect, useRef, useMemo } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export interface ChronosLogoProps {
  size?: number
  animated?: boolean
  showText?: boolean
  variant?: 'full' | 'icon' | 'minimal'
  theme?: 'dark' | 'light'
  className?: string
  onAnimationComplete?: () => void
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export function ChronosLogo({
  size = 200,
  animated = true,
  showText = true,
  variant = 'full',
  theme = 'dark',
  className = '',
  onAnimationComplete,
}: ChronosLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Colores según tema
  const colors = useMemo(
    () => ({
      primary: theme === 'dark' ? '#FFFFFF' : '#000000',
      secondary: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
      glow: theme === 'dark' ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.3)',
      accent: '#8B5CF6',
    }),
    [theme],
  )

  const scale = size / 200

  // Animaciones de las órbitas
  const orbitVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: i * 0.2, duration: 1.5, ease: 'easeInOut' as const },
        opacity: { delay: i * 0.2, duration: 0.5 },
      },
    }),
  }

  // Animación de los nodos/planetas
  const nodeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.8 + i * 0.15,
        duration: 0.5,
        type: 'spring' as const,
        stiffness: 200,
      },
    }),
  }

  // Animación del núcleo central
  const coreVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.3,
        duration: 0.8,
        type: 'spring' as const,
        stiffness: 150,
      },
    },
  }

  // Animación del texto
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 1.8,
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  }

  return (
    <motion.div
      ref={containerRef}
      className={`relative inline-flex flex-col items-center justify-center ${className}`}
      style={{ width: size, height: showText ? size * 1.3 : size }}
      initial="hidden"
      animate="visible"
      onAnimationComplete={onAnimationComplete}
    >
      {/* SVG del Logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Definiciones de gradientes y filtros */}
        <defs>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient para el core */}
          <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor={colors.accent} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Gradient para líneas */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor={colors.primary} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Órbitas externas (elipses rotadas) */}
        {animated ? (
          <>
            {/* Órbita 1 - más grande, inclinada */}
            <motion.ellipse
              cx="100"
              cy="100"
              rx="80"
              ry="35"
              stroke={colors.secondary}
              strokeWidth="0.5"
              strokeDasharray="4 4"
              fill="none"
              transform="rotate(-30 100 100)"
              variants={orbitVariants}
              custom={0}
            />

            {/* Órbita 2 */}
            <motion.ellipse
              cx="100"
              cy="100"
              rx="70"
              ry="28"
              stroke={colors.secondary}
              strokeWidth="0.5"
              strokeDasharray="4 4"
              fill="none"
              transform="rotate(20 100 100)"
              variants={orbitVariants}
              custom={1}
            />

            {/* Órbita 3 */}
            <motion.ellipse
              cx="100"
              cy="100"
              rx="55"
              ry="22"
              stroke={colors.secondary}
              strokeWidth="0.5"
              strokeDasharray="4 4"
              fill="none"
              transform="rotate(-10 100 100)"
              variants={orbitVariants}
              custom={2}
            />
          </>
        ) : (
          <>
            <ellipse
              cx="100"
              cy="100"
              rx="80"
              ry="35"
              stroke={colors.secondary}
              strokeWidth="0.5"
              strokeDasharray="4 4"
              fill="none"
              transform="rotate(-30 100 100)"
            />
            <ellipse
              cx="100"
              cy="100"
              rx="70"
              ry="28"
              stroke={colors.secondary}
              strokeWidth="0.5"
              strokeDasharray="4 4"
              fill="none"
              transform="rotate(20 100 100)"
            />
            <ellipse
              cx="100"
              cy="100"
              rx="55"
              ry="22"
              stroke={colors.secondary}
              strokeWidth="0.5"
              strokeDasharray="4 4"
              fill="none"
              transform="rotate(-10 100 100)"
            />
          </>
        )}

        {/* Línea horizontal principal */}
        <motion.line
          x1="20"
          y1="100"
          x2="180"
          y2="100"
          stroke={colors.primary}
          strokeWidth="1"
          variants={orbitVariants}
          custom={0.5}
        />

        {/* Nodos en la línea horizontal */}
        {/* Nodo izquierdo pequeño */}
        <motion.circle
          cx="30"
          cy="100"
          r="3"
          fill={colors.primary}
          variants={nodeVariants}
          custom={0}
        />

        {/* Nodo izquierdo con círculo */}
        <motion.g variants={nodeVariants} custom={1}>
          <circle cx="55" cy="100" r="8" stroke={colors.primary} strokeWidth="1" fill="none" />
          <circle cx="55" cy="100" r="3" fill={colors.primary} opacity="0.5" />
        </motion.g>

        {/* Nodo pequeño izquierdo */}
        <motion.circle
          cx="78"
          cy="100"
          r="2"
          fill={colors.primary}
          variants={nodeVariants}
          custom={2}
        />

        {/* NÚCLEO CENTRAL */}
        <motion.g variants={coreVariants} filter="url(#glow)">
          {/* Círculo externo del core */}
          <circle cx="100" cy="100" r="18" stroke={colors.primary} strokeWidth="2" fill="none" />
          {/* Círculo interno con gradiente */}
          <circle cx="100" cy="100" r="10" fill={colors.primary} />
          {/* Punto brillante central */}
          <circle cx="100" cy="100" r="5" fill="url(#coreGradient)" />
        </motion.g>

        {/* Nodo pequeño derecho */}
        <motion.circle
          cx="122"
          cy="100"
          r="2"
          fill={colors.primary}
          variants={nodeVariants}
          custom={3}
        />

        {/* Nodo derecho con círculo */}
        <motion.g variants={nodeVariants} custom={4}>
          <circle cx="145" cy="100" r="6" stroke={colors.primary} strokeWidth="1" fill="none" />
          <circle cx="145" cy="100" r="2" fill={colors.primary} opacity="0.5" />
        </motion.g>

        {/* Nodo derecho pequeño */}
        <motion.circle
          cx="170"
          cy="100"
          r="3"
          fill={colors.primary}
          variants={nodeVariants}
          custom={5}
        />

        {/* Planetas orbitando (en las elipses) */}
        {animated && (
          <>
            <motion.circle
              cx="40"
              cy="80"
              r="2"
              fill={colors.primary}
              animate={{
                cx: [40, 160, 40],
                cy: [80, 120, 80],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <motion.circle
              cx="160"
              cy="85"
              r="1.5"
              fill={colors.primary}
              opacity={0.7}
              animate={{
                cx: [160, 40, 160],
                cy: [85, 115, 85],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </>
        )}
      </svg>

      {/* Texto CHRONOS */}
      {showText && (
        <motion.div className="mt-4 text-center" variants={textVariants}>
          <h1
            className="font-light tracking-[0.5em] uppercase"
            style={{
              color: colors.primary,
              fontSize: size * 0.12,
              letterSpacing: size * 0.025,
            }}
          >
            ΧΡΟΝΟΣ
          </h1>
          <p
            className="mt-1 font-extralight tracking-[0.3em] uppercase opacity-60"
            style={{
              color: colors.primary,
              fontSize: size * 0.06,
            }}
          >
            CHRONOS
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGO MINI (para header/navbar)
// ═══════════════════════════════════════════════════════════════════════════

export function ChronosLogoMini({
  size = 40,
  className = '',
  animated = false,
}: {
  size?: number
  className?: string
  animated?: boolean
}) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={animated ? { scale: 1.05 } : undefined}
      whileTap={animated ? { scale: 0.95 } : undefined}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Órbitas simplificadas */}
        <ellipse
          cx="20"
          cy="20"
          rx="16"
          ry="7"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          fill="none"
          transform="rotate(-25 20 20)"
        />
        <ellipse
          cx="20"
          cy="20"
          rx="14"
          ry="5"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          fill="none"
          transform="rotate(15 20 20)"
        />

        {/* Línea horizontal */}
        <line x1="4" y1="20" x2="36" y2="20" stroke="white" strokeWidth="0.8" />

        {/* Nodos */}
        <circle cx="8" cy="20" r="1.5" fill="white" />
        <circle cx="14" cy="20" r="2.5" stroke="white" strokeWidth="0.5" fill="none" />
        <circle cx="14" cy="20" r="1" fill="white" opacity="0.5" />

        {/* Core central */}
        <circle cx="20" cy="20" r="4" stroke="white" strokeWidth="1" fill="none" />
        <circle cx="20" cy="20" r="2.5" fill="white" />

        {/* Nodos derechos */}
        <circle cx="26" cy="20" r="2" stroke="white" strokeWidth="0.5" fill="none" />
        <circle cx="26" cy="20" r="0.8" fill="white" opacity="0.5" />
        <circle cx="32" cy="20" r="1.5" fill="white" />
      </svg>
    </motion.div>
  )
}

export default ChronosLogo
