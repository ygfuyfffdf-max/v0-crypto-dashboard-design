'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 COGNITO AVATAR — Sistema de Partículas 3D Dinámico
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Avatar ultra-avanzado con:
 * - Sistema de partículas con física spring
 * - Núcleo dinámico con gradientes animados
 * - Ondas de energía reactivas al estado
 * - Conexiones neuronales entre partículas
 * - Reactividad al mouse con parallax 3D
 * - Efectos de glow y bloom dinámicos
 * - Animaciones por estado (idle, listening, thinking, speaking)
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { AvatarConfig, CognitoState, Particle } from './types'
import { STATE_COLORS } from './types'

interface CognitoAvatarProps {
  state: CognitoState
  size?: number
  audioLevel?: number
  className?: string
  config?: Partial<AvatarConfig>
  onInteract?: () => void
}

// Configuración por defecto
const DEFAULT_CONFIG: AvatarConfig = {
  style: 'particle',
  primaryColor: '#8B5CF6',
  secondaryColor: '#06B6D4',
  tertiaryColor: '#EC4899',
  glowIntensity: 1,
  particleCount: 120,
  reactToVoice: true,
}

export function CognitoAvatar({
  state,
  size = 280,
  audioLevel = 0,
  className,
  config: userConfig,
  onInteract,
}: CognitoAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5, isHovering: false })
  const particlesRef = useRef<Particle[]>([])
  const stateRef = useRef(state)
  const audioLevelRef = useRef(audioLevel)

  // Merge config
  const config = useMemo(() => ({ ...DEFAULT_CONFIG, ...userConfig }), [userConfig])

  // Actualizar refs
  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    audioLevelRef.current = audioLevel
  }, [audioLevel])

  // Colores del estado actual
  const colors = STATE_COLORS[state]

  // Inicializar partículas
  const initParticles = useCallback(() => {
    const particles: Particle[] = []
    for (let i = 0; i < config.particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const orbitRadius = 30 + Math.random() * 70
      const layerIndex = Math.floor(i / (config.particleCount / 4))

      particles.push({
        id: i,
        x: Math.cos(angle) * orbitRadius,
        y: Math.sin(angle) * orbitRadius,
        z: (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.1,
        size: 1 + Math.random() * 2.5,
        color:
          [config.primaryColor, config.secondaryColor, config.tertiaryColor, '#10B981'][
            layerIndex
          ] || config.primaryColor,
        alpha: 0.4 + Math.random() * 0.6,
        angle,
        orbitRadius,
        orbitSpeed: 0.008 + Math.random() * 0.015,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }
    particlesRef.current = particles
  }, [config])

  // Animación principal
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Setup canvas con DPR
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Inicializar partículas
    initParticles()

    const animate = () => {
      timeRef.current += 0.016
      const time = timeRef.current
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const currentState = stateRef.current
      const currentAudioLevel = audioLevelRef.current
      const mouse = mouseRef.current
      const stateColors = STATE_COLORS[currentState]

      // Clear con fade para trails
      ctx.fillStyle = 'rgba(3, 3, 8, 0.12)'
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Calcular offset parallax del mouse
      const parallaxX = (mouse.x - 0.5) * 25
      const parallaxY = (mouse.y - 0.5) * 25

      // ═══════════════════════════════════════════════════════════════
      // CAPA 1: GLOW EXTERIOR DIFUSO
      // ═══════════════════════════════════════════════════════════════
      const outerGlowRadius = 100 + Math.sin(time * 0.8) * 15 + currentAudioLevel * 30
      const outerGlow = ctx.createRadialGradient(
        centerX + parallaxX * 0.2,
        centerY + parallaxY * 0.2,
        0,
        centerX,
        centerY,
        outerGlowRadius,
      )
      outerGlow.addColorStop(0, stateColors.glow.replace('0.4', '0.15'))
      outerGlow.addColorStop(0.5, stateColors.glow.replace('0.4', '0.05'))
      outerGlow.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(centerX, centerY, outerGlowRadius, 0, Math.PI * 2)
      ctx.fillStyle = outerGlow
      ctx.fill()

      // ═══════════════════════════════════════════════════════════════
      // CAPA 2: ANILLOS DE ENERGÍA
      // ═══════════════════════════════════════════════════════════════
      const ringCount = currentState === 'listening' || currentState === 'speaking' ? 4 : 2

      for (let r = 0; r < ringCount; r++) {
        const ringProgress = (time * 0.5 + r * 0.3) % 1
        const ringRadius = 40 + ringProgress * 60 + currentAudioLevel * 20
        const ringAlpha = (1 - ringProgress) * 0.3

        ctx.beginPath()
        ctx.arc(centerX + parallaxX * 0.1, centerY + parallaxY * 0.1, ringRadius, 0, Math.PI * 2)
        ctx.strokeStyle = stateColors.primary
          .replace(')', `,${ringAlpha})`)
          .replace('rgb', 'rgba')
          .replace('#', '')

        // Convertir hex a rgba
        const hex = stateColors.primary.replace('#', '')
        const red = parseInt(hex.substring(0, 2), 16)
        const green = parseInt(hex.substring(2, 4), 16)
        const blue = parseInt(hex.substring(4, 6), 16)
        ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${ringAlpha})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // ═══════════════════════════════════════════════════════════════
      // CAPA 3: NÚCLEO PRINCIPAL
      // ═══════════════════════════════════════════════════════════════
      const coreRadius = 55 + Math.sin(time * 2) * 8 + currentAudioLevel * 15
      const coreGradient = ctx.createRadialGradient(
        centerX + parallaxX * 0.3 + Math.cos(time * 1.5) * 5,
        centerY + parallaxY * 0.3 + Math.sin(time * 1.5) * 5,
        0,
        centerX + parallaxX * 0.1,
        centerY + parallaxY * 0.1,
        coreRadius,
      )

      // Colores dinámicos según estado
      const hexPrimary = stateColors.primary.replace('#', '')
      const hexAccent = stateColors.accent.replace('#', '')

      coreGradient.addColorStop(
        0,
        `rgba(${parseInt(hexPrimary.substring(0, 2), 16)}, ${parseInt(hexPrimary.substring(2, 4), 16)}, ${parseInt(hexPrimary.substring(4, 6), 16)}, 0.9)`,
      )
      coreGradient.addColorStop(
        0.4,
        `rgba(${parseInt(hexAccent.substring(0, 2), 16)}, ${parseInt(hexAccent.substring(2, 4), 16)}, ${parseInt(hexAccent.substring(4, 6), 16)}, 0.5)`,
      )
      coreGradient.addColorStop(0.7, stateColors.glow)
      coreGradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(centerX + parallaxX * 0.15, centerY + parallaxY * 0.15, coreRadius, 0, Math.PI * 2)
      ctx.fillStyle = coreGradient
      ctx.fill()

      // Inner core brillante
      const innerCore = ctx.createRadialGradient(
        centerX + parallaxX * 0.2 - 10,
        centerY + parallaxY * 0.2 - 10,
        0,
        centerX + parallaxX * 0.1,
        centerY + parallaxY * 0.1,
        30,
      )
      innerCore.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
      innerCore.addColorStop(0.3, 'rgba(255, 255, 255, 0.3)')
      innerCore.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(
        centerX + parallaxX * 0.15,
        centerY + parallaxY * 0.15,
        25 + Math.sin(time * 3) * 3,
        0,
        Math.PI * 2,
      )
      ctx.fillStyle = innerCore
      ctx.fill()

      // ═══════════════════════════════════════════════════════════════
      // CAPA 4: PARTÍCULAS
      // ═══════════════════════════════════════════════════════════════
      const particles = particlesRef.current

      // Actualizar y dibujar partículas
      particles.forEach((p, i) => {
        // Calcular velocidad de órbita según estado
        let orbitSpeedMod = 1
        if (currentState === 'thinking') orbitSpeedMod = 2
        if (currentState === 'listening') orbitSpeedMod = 1.5
        if (currentState === 'speaking') orbitSpeedMod = 1.8

        // Actualizar ángulo de órbita
        p.angle += p.orbitSpeed * orbitSpeedMod

        // Calcular nueva posición con perturbación
        const perturbation = Math.sin(time * 2 + p.pulsePhase) * 5 + currentAudioLevel * 15
        const effectiveRadius = p.orbitRadius + perturbation

        // Posición base orbital
        const baseX = Math.cos(p.angle) * effectiveRadius
        const baseY = Math.sin(p.angle) * effectiveRadius

        // Añadir velocidad y fricción
        p.x = baseX + p.vx
        p.y = baseY + p.vy
        p.z += p.vz

        // Aplicar fricción
        p.vx *= 0.98
        p.vy *= 0.98
        p.vz *= 0.95

        // Efecto del mouse
        if (mouse.isHovering) {
          const mouseForceX = (mouse.x - 0.5) * 0.5
          const mouseForceY = (mouse.y - 0.5) * 0.5
          p.vx += mouseForceX * 0.1
          p.vy += mouseForceY * 0.1
        }

        // Mantener Z en rango
        if (Math.abs(p.z) > 30) p.vz *= -0.8

        // Calcular profundidad para 3D
        const depthScale = 1 + p.z / 100
        const screenX = centerX + p.x * depthScale + parallaxX * (0.1 + p.z / 200)
        const screenY = centerY + p.y * depthScale + parallaxY * (0.1 + p.z / 200)

        // Alpha dinámico
        const pulseAlpha =
          p.alpha * (0.6 + Math.sin(time * 3 + p.pulsePhase) * 0.4) * (0.5 + depthScale * 0.5)

        // Color de partícula según estado
        const particleColor =
          i % 3 === 0
            ? stateColors.primary
            : i % 3 === 1
              ? stateColors.accent
              : config.secondaryColor

        // Convertir color a rgba
        const pHex = particleColor.replace('#', '')
        const pR = parseInt(pHex.substring(0, 2), 16)
        const pG = parseInt(pHex.substring(2, 4), 16)
        const pB = parseInt(pHex.substring(4, 6), 16)

        // Dibujar glow de partícula
        const particleGlow = ctx.createRadialGradient(
          screenX,
          screenY,
          0,
          screenX,
          screenY,
          p.size * 4 * depthScale,
        )
        particleGlow.addColorStop(0, `rgba(${pR}, ${pG}, ${pB}, ${pulseAlpha * 0.8})`)
        particleGlow.addColorStop(0.5, `rgba(${pR}, ${pG}, ${pB}, ${pulseAlpha * 0.2})`)
        particleGlow.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(screenX, screenY, p.size * 4 * depthScale, 0, Math.PI * 2)
        ctx.fillStyle = particleGlow
        ctx.fill()

        // Dibujar partícula sólida
        ctx.beginPath()
        ctx.arc(screenX, screenY, p.size * depthScale, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${pR}, ${pG}, ${pB}, ${pulseAlpha})`
        ctx.fill()
      })

      // ═══════════════════════════════════════════════════════════════
      // CAPA 5: CONEXIONES NEURONALES
      // ═══════════════════════════════════════════════════════════════
      if (currentState === 'thinking' || currentState === 'listening') {
        ctx.strokeStyle = `${stateColors.glow.replace('0.4', '0.15')}`
        ctx.lineWidth = 0.5

        particles.slice(0, 40).forEach((p1, i) => {
          particles.slice(i + 1, i + 6).forEach((p2) => {
            const dx = p1.x - p2.x
            const dy = p1.y - p2.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < 45) {
              const alpha = (1 - dist / 45) * 0.3
              const depthScale1 = 1 + p1.z / 100
              const depthScale2 = 1 + p2.z / 100

              ctx.beginPath()
              ctx.moveTo(
                centerX + p1.x * depthScale1 + parallaxX * 0.1,
                centerY + p1.y * depthScale1 + parallaxY * 0.1,
              )
              ctx.lineTo(
                centerX + p2.x * depthScale2 + parallaxX * 0.1,
                centerY + p2.y * depthScale2 + parallaxY * 0.1,
              )

              const hexGlow = stateColors.accent.replace('#', '')
              ctx.strokeStyle = `rgba(${parseInt(hexGlow.substring(0, 2), 16)}, ${parseInt(hexGlow.substring(2, 4), 16)}, ${parseInt(hexGlow.substring(4, 6), 16)}, ${alpha})`
              ctx.stroke()
            }
          })
        })
      }

      // ═══════════════════════════════════════════════════════════════
      // CAPA 6: ANILLO EXTERIOR DECORATIVO
      // ═══════════════════════════════════════════════════════════════
      const outerRingRadius = 85 + Math.sin(time * 0.5) * 5

      // Anillo principal
      ctx.beginPath()
      ctx.arc(centerX, centerY, outerRingRadius, 0, Math.PI * 2)
      const ringHex = stateColors.primary.replace('#', '')
      ctx.strokeStyle = `rgba(${parseInt(ringHex.substring(0, 2), 16)}, ${parseInt(ringHex.substring(2, 4), 16)}, ${parseInt(ringHex.substring(4, 6), 16)}, ${0.2 + Math.sin(time) * 0.1})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Marcadores en el anillo
      for (let i = 0; i < 12; i++) {
        const markerAngle = (i / 12) * Math.PI * 2 + time * 0.2
        const markerX = centerX + Math.cos(markerAngle) * outerRingRadius
        const markerY = centerY + Math.sin(markerAngle) * outerRingRadius

        ctx.beginPath()
        ctx.arc(markerX, markerY, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${parseInt(ringHex.substring(0, 2), 16)}, ${parseInt(ringHex.substring(2, 4), 16)}, ${parseInt(ringHex.substring(4, 6), 16)}, ${0.4 + Math.sin(time * 2 + i) * 0.3})`
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [initParticles, config])

  // Eventos del mouse
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
      isHovering: true,
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { ...mouseRef.current, isHovering: false }
  }, [])

  const handleClick = useCallback(() => {
    // Añadir impulso a las partículas
    particlesRef.current.forEach((p) => {
      p.vx += (Math.random() - 0.5) * 3
      p.vy += (Math.random() - 0.5) * 3
    })
    onInteract?.()
  }, [onInteract])

  return (
    <div className={cn('relative cursor-pointer', className)} style={{ width: size, height: size }}>
      {/* Outer glow effect */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full transition-all duration-500"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          filter: 'blur(20px)',
          transform: state !== 'idle' ? 'scale(1.2)' : 'scale(1)',
          opacity: state !== 'idle' ? 0.8 : 0.5,
        }}
      />

      {/* Canvas principal */}
      <canvas
        ref={canvasRef}
        className="h-full w-full rounded-full"
        style={{ background: 'transparent' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />

      {/* Highlight reflection */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/4 h-1/3 w-1/3 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

export default CognitoAvatar
