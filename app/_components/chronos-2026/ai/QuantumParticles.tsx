// @ts-nocheck
/**
 * ✨ QUANTUM PARTICLES — Sistema de partículas cuánticas
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Sistema avanzado de partículas con físicas realistas
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { motion } from 'motion/react'
import React, { useEffect, useRef } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  opacity: number
  color: string
}

interface QuantumParticlesProps {
  count?: number
  colors?: string[]
  speed?: number
  isActive?: boolean
}

export const QuantumParticles: React.FC<QuantumParticlesProps> = ({
  count = 50,
  colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981'],
  speed = 1,
  isActive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })

  // Inicializar partículas
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    particlesRef.current = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      z: Math.random() * 100,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      vz: (Math.random() - 0.5) * speed * 0.1,
      size: 1 + Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.7,
      color: colors[Math.floor(Math.random() * colors.length)] || '#8b5cf6',
    }))
  }, [count, colors, speed])

  // Tracking del mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Animación principal
  useEffect(() => {
    if (!isActive || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Ajustar tamaño del canvas
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const animate = () => {
      if (!ctx || !canvas) return

      // Limpiar canvas con fade trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Actualizar y dibujar partículas
      particlesRef.current.forEach((particle) => {
        // Física de movimiento
        particle.x += particle.vx
        particle.y += particle.vy
        particle.z += particle.vz

        // Atracción al mouse
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 200) {
          const force = (200 - distance) / 200
          particle.vx += (dx / distance) * force * 0.01
          particle.vy += (dy / distance) * force * 0.01
        }

        // Fricción
        particle.vx *= 0.99
        particle.vy *= 0.99
        particle.vz *= 0.99

        // Rebote en bordes
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
        if (particle.z < 0 || particle.z > 100) particle.vz *= -1

        // Calcular profundidad (z-index)
        const scale = 0.5 + (particle.z / 100) * 0.5

        // Dibujar partícula
        ctx.save()
        ctx.globalAlpha = particle.opacity * scale
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * scale, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()

        // Glow effect
        ctx.shadowBlur = 20 * scale
        ctx.shadowColor = particle.color
        ctx.fill()

        ctx.restore()

        // Líneas de conexión entre partículas cercanas
        particlesRef.current.forEach((other) => {
          if (other.id <= particle.id) return

          const dx = other.x - particle.x
          const dy = other.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.save()
            ctx.globalAlpha = (1 - distance / 100) * 0.2
            ctx.strokeStyle = particle.color
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.stroke()
            ctx.restore()
          }
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [isActive])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}

/**
 * 🌟 ENERGY FIELD — Campo de energía alrededor del orb
 */
export const EnergyField: React.FC<{ isActive: boolean; intensity?: number }> = ({
  isActive,
  intensity = 1,
}) => {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Anillos de energía */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-500/20"
          style={{
            width: `${40 + i * 20}%`,
            height: `${40 + i * 20}%`,
          }}
          animate={{
            scale: isActive ? [1, 1.1, 1] : 1,
            opacity: isActive ? [0.2, 0.4, 0.2] : 0,
            rotate: 360,
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Rayos de energía */}
      {isActive &&
        [...Array(8)].map((_, i) => (
          <motion.div
            key={`ray-${i}`}
            className="absolute top-1/2 left-1/2 origin-left"
            style={{
              width: '50%',
              height: '2px',
              background: `linear-gradient(to right, rgba(139, 92, 246, ${intensity}), transparent)`,
              transform: `rotate(${i * 45}deg)`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scaleX: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.25,
              ease: 'easeInOut',
            }}
          />
        ))}
    </div>
  )
}
