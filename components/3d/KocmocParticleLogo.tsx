"use client"

import { useRef, useEffect, useCallback } from "react"

interface KocmocParticleLogoProps {
  className?: string
  text?: string
  fontSize?: number
  particleSize?: number
  color?: string
  interactive?: boolean
}

interface Particle {
  x: number
  y: number
  targetX: number
  targetY: number
  vx: number
  vy: number
  r: number
  g: number
  b: number
  size: number
  brightness: number
}

export function KocmocParticleLogo({
  className = "",
  text = "KOCMOC",
  fontSize = 28,
  particleSize = 1.2,
  color = "#60a5fa",
  interactive = true,
}: Readonly<KocmocParticleLogoProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animFrameRef = useRef<number>(0)
  const timeRef = useRef(0)

  const sampleTextPixels = useCallback(
    (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d")
      if (!ctx) return []

      const dpr = window.devicePixelRatio || 1
      const w = canvas.width / dpr
      const h = canvas.height / dpr

      // Render text to sample pixels
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.fillStyle = "#ffffff"
      ctx.font = `900 ${fontSize}px "Inter", "SF Pro Display", system-ui, sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(text, w / 2, h / 2)
      ctx.restore()

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Parse the base color
      const tempCanvas = document.createElement("canvas")
      const tempCtx = tempCanvas.getContext("2d")
      if (!tempCtx) return []
      tempCtx.fillStyle = color
      tempCtx.fillRect(0, 0, 1, 1)
      const [baseR, baseG, baseB] = tempCtx.getImageData(0, 0, 1, 1).data

      const particles: Particle[] = []
      const step = Math.max(1, Math.round(dpr * 1.8))

      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const i = (y * canvas.width + x) * 4
          const alpha = data[i + 3]
          if (alpha > 40) {
            const brightness = alpha / 255
            // Add slight color variation
            const variation = 0.7 + Math.random() * 0.6
            particles.push({
              x: x / dpr + (Math.random() - 0.5) * 40,
              y: y / dpr + (Math.random() - 0.5) * 40,
              targetX: x / dpr,
              targetY: y / dpr,
              vx: 0,
              vy: 0,
              r: Math.min(255, baseR * variation),
              g: Math.min(255, baseG * variation),
              b: Math.min(255, baseB * variation),
              size: particleSize * (0.6 + brightness * 0.8),
              brightness,
            })
          }
        }
      }

      return particles
    },
    [text, fontSize, color, particleSize],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    particlesRef.current = sampleTextPixels(canvas)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const animate = () => {
      timeRef.current += 0.016
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(dpr, dpr)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const dispersionRadius = 50
      const elasticity = 0.08
      const friction = 0.85

      for (const p of particlesRef.current) {
        // Mouse repulsion
        if (interactive) {
          const dx = p.x - mx
          const dy = p.y - my
          const dist = Math.hypot(dx, dy)
          if (dist < dispersionRadius && dist > 0) {
            const force = (1 - dist / dispersionRadius) * 3
            p.vx += (dx / dist) * force
            p.vy += (dy / dist) * force
          }
        }

        // Elastic return to target
        p.vx += (p.targetX - p.x) * elasticity
        p.vy += (p.targetY - p.y) * elasticity

        // Friction
        p.vx *= friction
        p.vy *= friction

        // Update position
        p.x += p.vx
        p.y += p.vy

        // Subtle breathing animation
        const breathe = Math.sin(timeRef.current * 2 + p.brightness * 6) * 0.15 + 1

        // Draw particle
        const alpha = p.brightness * (0.6 + Math.sin(timeRef.current * 1.5 + p.targetX * 0.05) * 0.2)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * breathe, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${Math.trunc(p.r)}, ${Math.trunc(p.g)}, ${Math.trunc(p.b)}, ${alpha})`
        ctx.fill()

        // Glow
        if (p.brightness > 0.7) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * breathe * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${Math.trunc(p.r)}, ${Math.trunc(p.g)}, ${Math.trunc(p.b)}, ${alpha * 0.15})`
          ctx.fill()
        }
      }

      ctx.restore()
      animFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [sampleTextPixels, interactive])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!interactive) return
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
      }
    },
    [interactive],
  )

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ imageRendering: "auto" }}
    />
  )
}

export default KocmocParticleLogo
