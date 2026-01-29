/**
 * 🎨 HOLOGRAPHIC EFFECTS — Efectos holográficos y de neón
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Sistema de efectos visuales cinematográficos
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { motion } from 'motion/react'
import React from 'react'

/**
 * 💎 HOLOGRAM OVERLAY — Efecto holográfico sobre elementos
 */
export const HologramOverlay: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Líneas de escaneo */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent"
        style={{ height: '20%' }}
        animate={
          isActive
            ? {
                top: ['-20%', '120%'],
              }
            : {}
        }
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Líneas horizontales */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px w-full bg-cyan-500/5"
            style={{ top: `${i * 2.5}%` }}
            animate={
              isActive
                ? {
                    opacity: [0.05, 0.2, 0.05],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.05,
            }}
          />
        ))}
      </div>

      {/* Glitch effect */}
      {isActive && (
        <motion.div
          className="absolute inset-0 mix-blend-screen"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              rgba(255, 0, 0, 0.03),
              rgba(255, 0, 0, 0.03) 1px,
              transparent 1px,
              transparent 2px
            )`,
          }}
          animate={{
            x: [0, -2, 2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.1,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      )}
    </div>
  )
}

/**
 * 🌈 CHROMATIC ABERRATION — Aberración cromática
 */
export const ChromaticAberration: React.FC<{
  children: React.ReactNode
  intensity?: number
  isActive?: boolean
}> = ({ children, intensity = 1, isActive = true }) => {
  return (
    <div className="relative">
      {isActive && (
        <>
          <div
            className="absolute inset-0 opacity-30 mix-blend-screen"
            style={{
              transform: `translateX(${-2 * intensity}px)`,
              filter: 'hue-rotate(180deg)',
            }}
          >
            {children}
          </div>
          <div
            className="absolute inset-0 opacity-30 mix-blend-screen"
            style={{
              transform: `translateX(${2 * intensity}px)`,
              filter: 'hue-rotate(-180deg)',
            }}
          >
            {children}
          </div>
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

/**
 * 💫 CYBER GRID — Grid cibernético de fondo
 */
export const CyberGrid: React.FC<{ opacity?: number }> = ({ opacity = 0.1 }) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity }}>
      {/* Grid vertical */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`v-${i}`}
            className="absolute h-full w-px bg-gradient-to-b from-transparent via-violet-500/50 to-transparent"
            style={{ left: `${i * 5}%` }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Grid horizontal */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`h-${i}`}
            className="absolute h-px w-full bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"
            style={{ top: `${i * 5}%` }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Puntos de intersección */}
      {[...Array(100)].map((_, i) => {
        const x = (i % 10) * 10
        const y = Math.floor(i / 10) * 10
        return (
          <motion.div
            key={`dot-${i}`}
            className="absolute h-1 w-1 rounded-full bg-violet-500"
            style={{ left: `${x}%`, top: `${y}%` }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.02,
            }}
          />
        )
      })}
    </div>
  )
}

/**
 * ⚡ NEON GLOW — Resplandor de neón animado
 */
export const NeonGlow: React.FC<{
  color?: string
  intensity?: number
  pulse?: boolean
}> = ({ color = 'violet', intensity = 1, pulse = true }) => {
  const colorMap: Record<string, string> = {
    violet: '139, 92, 246',
    pink: '236, 72, 153',
    cyan: '6, 182, 212',
    green: '16, 185, 129',
  }

  const rgb = colorMap[color] || colorMap.violet

  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      animate={
        pulse
          ? {
              opacity: [0.3 * intensity, 0.6 * intensity, 0.3 * intensity],
            }
          : {}
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        boxShadow: `
          0 0 ${20 * intensity}px rgba(${rgb}, 0.3),
          0 0 ${40 * intensity}px rgba(${rgb}, 0.2),
          0 0 ${80 * intensity}px rgba(${rgb}, 0.1),
          inset 0 0 ${20 * intensity}px rgba(${rgb}, 0.1)
        `,
      }}
    />
  )
}

/**
 * 🔮 MATRIX RAIN — Lluvia estilo Matrix
 */
export const MatrixRain: React.FC<{ speed?: number; density?: number }> = ({
  speed = 1,
  density = 20,
}) => {
  const chars = 'CHRONOSZERO01'

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
      {[...Array(density)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute font-mono text-xs text-green-500"
          style={{
            left: `${(i * 100) / density}%`,
            fontFamily: 'monospace',
          }}
          animate={{
            top: ['-10%', '110%'],
          }}
          transition={{
            duration: 5 / speed,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'linear',
          }}
        >
          {Array.from({ length: 10 }, (_, j) => (
            <div key={j} style={{ opacity: 1 - j * 0.1 }}>
              {chars.charAt(Math.floor(Math.random() * chars.length))}
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  )
}

/**
 * 🌟 SPOTLIGHT EFFECT — Efecto de foco de luz
 */
export const SpotlightEffect: React.FC<{ mousePosition?: { x: number; y: number } }> = ({
  mousePosition,
}) => {
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        left: mousePosition?.x || 0,
        top: mousePosition?.y || 0,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}
