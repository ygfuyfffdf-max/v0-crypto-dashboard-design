/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 KOCMOC ORBITAL LOGO — LOGO ESTILO КОСМОС CON ΧΡΟΝΟΣ
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Logo inspirado en el diseño КОСМОС con:
 * - Línea horizontal central con nodos
 * - Órbitas elípticas inclinadas (sólidas y punteadas)
 * - Núcleo central con anillo y punto brillante
 * - Texto ΧΡΟΝΟΣ (Chronos en griego) debajo
 *
 * @version 1.0.0 SUPREME ELITE
 * @author CHRONOS INFINITY TEAM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { motion } from 'motion/react'
import { memo, useEffect, useRef } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface KocmocLogoProps {
  /** Tamaño del logo */
  size?: number
  /** Mostrar texto ΧΡΟΝΟΣ */
  showText?: boolean
  /** Animar las órbitas */
  animated?: boolean
  /** Color principal (blanco por defecto) */
  color?: string
  /** Clase CSS adicional */
  className?: string
  /** Callback cuando termina la animación de entrada */
  onAnimationComplete?: () => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const KocmocLogo = memo(function KocmocLogo({
  size = 300,
  showText = true,
  animated = true,
  color = '#FFFFFF',
  className = '',
  onAnimationComplete,
}: KocmocLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const scale = size / 300

    // ═══════════════════════════════════════════════════════════════════════════
    // CONFIGURACIÓN DE ÓRBITAS (exactamente como la imagen КОСМОС)
    // ═══════════════════════════════════════════════════════════════════════════

    const orbits = [
      // Órbita 1: Grande, inclinada hacia arriba-izquierda, sólida
      { rx: 95 * scale, ry: 40 * scale, rotation: -30, dotted: false, opacity: 0.4 },
      // Órbita 2: Media-grande, inclinada hacia arriba-derecha, punteada
      { rx: 85 * scale, ry: 35 * scale, rotation: 25, dotted: true, opacity: 0.3 },
      // Órbita 3: Media, inclinada hacia abajo-izquierda, punteada
      { rx: 75 * scale, ry: 32 * scale, rotation: -15, dotted: true, opacity: 0.35 },
      // Órbita 4: Pequeña, inclinada hacia arriba, sólida
      { rx: 65 * scale, ry: 28 * scale, rotation: 40, dotted: false, opacity: 0.3 },
      // Órbita 5: Más pequeña, casi horizontal, punteada
      { rx: 55 * scale, ry: 24 * scale, rotation: -5, dotted: true, opacity: 0.25 },
    ]

    // ═══════════════════════════════════════════════════════════════════════════
    // CONFIGURACIÓN DE NODOS EN LA LÍNEA HORIZONTAL
    // ═══════════════════════════════════════════════════════════════════════════

    const lineLength = 100 * scale
    const lineNodes = [
      // Izquierda
      { offset: -1.0, size: 3 * scale, filled: true, hasRing: false },
      { offset: -0.65, size: 6 * scale, filled: false, innerSize: 2.5 * scale, hasRing: false },
      { offset: -0.35, size: 3 * scale, filled: true, hasRing: false },
      // Centro (núcleo principal)
      {
        offset: 0,
        size: 18 * scale,
        filled: false,
        innerSize: 8 * scale,
        hasRing: true,
        isCore: true,
      },
      // Derecha
      { offset: 0.35, size: 3 * scale, filled: true, hasRing: false },
      { offset: 0.65, size: 8 * scale, filled: false, innerSize: 3.5 * scale, hasRing: true },
      { offset: 1.0, size: 3 * scale, filled: true, hasRing: false },
    ]

    const animate = () => {
      if (animated) {
        timeRef.current += 0.008
      }

      ctx.clearRect(0, 0, size, size)

      // ═══════════════════════════════════════════════════════════════════════════
      // DIBUJAR ÓRBITAS ELÍPTICAS
      // ═══════════════════════════════════════════════════════════════════════════

      orbits.forEach((orbit, i) => {
        ctx.save()
        ctx.translate(cx, cy)

        // Rotación con animación sutil si está habilitada
        const rotationOffset = animated ? Math.sin(timeRef.current + i * 0.5) * 2 : 0
        ctx.rotate(((orbit.rotation + rotationOffset) * Math.PI) / 180)

        ctx.strokeStyle = `rgba(255, 255, 255, ${orbit.opacity})`
        ctx.lineWidth = orbit.dotted ? 0.8 : 1

        if (orbit.dotted) {
          ctx.setLineDash([2, 4])
        } else {
          ctx.setLineDash([])
        }

        ctx.beginPath()
        ctx.ellipse(0, 0, orbit.rx, orbit.ry, 0, 0, Math.PI * 2)
        ctx.stroke()

        ctx.restore()
      })

      // ═══════════════════════════════════════════════════════════════════════════
      // DIBUJAR LÍNEA HORIZONTAL PRINCIPAL
      // ═══════════════════════════════════════════════════════════════════════════

      ctx.setLineDash([])
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx - lineLength, cy)
      ctx.lineTo(cx + lineLength, cy)
      ctx.stroke()

      // ═══════════════════════════════════════════════════════════════════════════
      // DIBUJAR NODOS EN LA LÍNEA
      // ═══════════════════════════════════════════════════════════════════════════

      lineNodes.forEach((node) => {
        const nx = cx + node.offset * lineLength
        const ny = cy

        if (node.isCore) {
          // ═══ NÚCLEO CENTRAL ═══

          // Glow sutil del núcleo
          const coreGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, node.size * 1.5)
          coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
          coreGlow.addColorStop(1, 'transparent')
          ctx.fillStyle = coreGlow
          ctx.beginPath()
          ctx.arc(nx, ny, node.size * 1.5, 0, Math.PI * 2)
          ctx.fill()

          // Anillo exterior del núcleo
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(nx, ny, node.size, 0, Math.PI * 2)
          ctx.stroke()

          // Punto central brillante
          const pulse = animated ? 0.9 + Math.sin(timeRef.current * 3) * 0.1 : 1
          ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`
          ctx.beginPath()
          ctx.arc(nx, ny, node.innerSize!, 0, Math.PI * 2)
          ctx.fill()
        } else if (node.filled) {
          // ═══ NODO SÓLIDO ═══
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
          ctx.beginPath()
          ctx.arc(nx, ny, node.size, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // ═══ NODO CON ANILLO ═══

          // Anillo exterior
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(nx, ny, node.size, 0, Math.PI * 2)
          ctx.stroke()

          // Punto interior
          if (node.innerSize) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
            ctx.beginPath()
            ctx.arc(nx, ny, node.innerSize, 0, Math.PI * 2)
            ctx.fill()
          }

          // Anillo exterior adicional (más grande y sutil)
          if (node.hasRing) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.arc(nx, ny, node.size + 4 * scale, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [size, animated, color])

  return (
    <motion.div
      className={`relative inline-flex flex-col items-center ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      onAnimationComplete={onAnimationComplete}
    >
      {/* Canvas del logo */}
      <canvas ref={canvasRef} style={{ width: size, height: size }} className="block" />

      {/* Texto ΧΡΟΝΟΣ */}
      {showText && (
        <motion.h1
          className="mt-4 text-center tracking-[0.35em] select-none"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: `${size * 0.08}px`,
            fontWeight: 300,
            color: 'rgba(255, 255, 255, 0.85)',
            letterSpacing: '0.35em',
          }}
        >
          ΧΡΟΝΟΣ
        </motion.h1>
      )}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VERSIÓN COMPACTA (para formularios, headers, etc.)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const KocmocLogoCompact = memo(function KocmocLogoCompact({
  size = 80,
  animated = true,
  className = '',
}: {
  size?: number
  animated?: boolean
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const scale = size / 200

    const orbits = [
      { rx: 38 * scale, ry: 16 * scale, rotation: -25, dotted: false },
      { rx: 45 * scale, ry: 20 * scale, rotation: 20, dotted: true },
      { rx: 52 * scale, ry: 24 * scale, rotation: -35, dotted: true },
    ]

    const lineLength = 45 * scale

    const animate = () => {
      if (animated) {
        timeRef.current += 0.01
      }

      ctx.clearRect(0, 0, size, size)

      // Órbitas
      orbits.forEach((orbit, i) => {
        ctx.save()
        ctx.translate(cx, cy)
        const rotOffset = animated ? Math.sin(timeRef.current + i) * 2 : 0
        ctx.rotate(((orbit.rotation + rotOffset) * Math.PI) / 180)

        ctx.strokeStyle = `rgba(255, 255, 255, ${orbit.dotted ? 0.2 : 0.35})`
        ctx.lineWidth = 0.5

        if (orbit.dotted) {
          ctx.setLineDash([1.5, 3])
        } else {
          ctx.setLineDash([])
        }

        ctx.beginPath()
        ctx.ellipse(0, 0, orbit.rx, orbit.ry, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      })

      // Línea horizontal
      ctx.setLineDash([])
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.moveTo(cx - lineLength, cy)
      ctx.lineTo(cx + lineLength, cy)
      ctx.stroke()

      // Nodos simplificados
      const nodes = [
        { offset: -0.85, size: 2 * scale, filled: true },
        { offset: -0.5, size: 4 * scale, filled: false, inner: 1.5 * scale },
        { offset: 0.5, size: 5 * scale, filled: false, inner: 2 * scale, ring: true },
        { offset: 0.85, size: 2 * scale, filled: true },
      ]

      nodes.forEach((node) => {
        const nx = cx + node.offset * lineLength

        if (node.filled) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
          ctx.beginPath()
          ctx.arc(nx, cy, node.size, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
          ctx.lineWidth = 0.6
          ctx.beginPath()
          ctx.arc(nx, cy, node.size, 0, Math.PI * 2)
          ctx.stroke()

          if (node.inner) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
            ctx.beginPath()
            ctx.arc(nx, cy, node.inner, 0, Math.PI * 2)
            ctx.fill()
          }

          if (node.ring) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
            ctx.lineWidth = 0.4
            ctx.beginPath()
            ctx.arc(nx, cy, node.size + 2.5 * scale, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
      })

      // Núcleo central
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, 10 * scale, 0, Math.PI * 2)
      ctx.stroke()

      const pulse = animated ? 0.85 + Math.sin(timeRef.current * 3) * 0.15 : 1
      ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`
      ctx.beginPath()
      ctx.arc(cx, cy, 4 * scale, 0, Math.PI * 2)
      ctx.fill()

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [size, animated])

  return <canvas ref={canvasRef} className={className} style={{ width: size, height: size }} />
})

export default KocmocLogo
