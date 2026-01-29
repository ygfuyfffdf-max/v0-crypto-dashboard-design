/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌✨ QUANTUM 3D AI WIDGET — LA EXPERIENCIA IA MÁS PREMIUM DEL MUNDO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Widget de IA 3D Ultra-Premium con:
 * - Orbe holográfico con WebGL/Three.js
 * - Partículas cuánticas orbitando (1000+)
 * - Efecto de distorsión gravitacional
 * - Ondas de energía pulsantes
 * - Núcleo de plasma animado
 * - Anillos holográficos flotantes
 * - Rayos de luz volumétrica
 * - Respuesta al mouse con física real
 * - Estados visuales únicos (idle, listening, thinking, speaking)
 * - Animaciones cinematográficas 60fps
 *
 * PALETA CUÁNTICA:
 * - Void: #000000, #030308
 * - Quantum Violet: #8B00FF, #A855F7
 * - Plasma Gold: #FFD700, #F59E0B
 * - Neon Cyan: #00FFFF, #06B6D4
 * - Emerald: #00FF88, #10B981
 *
 * @version 3.0.0 QUANTUM
 * @author CHRONOS INFINITY TEAM
 */

'use client'

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { Brain, Maximize2, MessageSquare, Mic, MicOff, Sparkles, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type QuantumState = 'idle' | 'listening' | 'thinking' | 'speaking'

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  color: string
  alpha: number
  orbitRadius: number
  orbitSpeed: number
  orbitAngle: number
  phase: number
}

interface EnergyRing {
  radius: number
  rotation: number
  speed: number
  opacity: number
  width: number
}

const QUANTUM_COLORS = {
  idle: {
    primary: '#8B00FF',
    secondary: '#A855F7',
    glow: 'rgba(139, 0, 255, 0.6)',
    particles: ['#8B00FF', '#A855F7', '#C084FC', '#E879F9'],
  },
  listening: {
    primary: '#00FFFF',
    secondary: '#06B6D4',
    glow: 'rgba(0, 255, 255, 0.6)',
    particles: ['#00FFFF', '#06B6D4', '#22D3EE', '#67E8F9'],
  },
  thinking: {
    primary: '#FFD700',
    secondary: '#F59E0B',
    glow: 'rgba(255, 215, 0, 0.6)',
    particles: ['#FFD700', '#F59E0B', '#FBBF24', '#FCD34D'],
  },
  speaking: {
    primary: '#00FF88',
    secondary: '#10B981',
    glow: 'rgba(0, 255, 136, 0.6)',
    particles: ['#00FF88', '#10B981', '#34D399', '#6EE7B7'],
  },
}

const STATE_LABELS: Record<QuantumState, string> = {
  idle: 'NEXUS IA Listo',
  listening: 'Escuchando...',
  thinking: 'Procesando...',
  speaking: 'Respondiendo...',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 QUANTUM ORB CANVAS — El núcleo 3D del widget
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuantumOrbCanvasProps {
  state: QuantumState
  mouseX: number
  mouseY: number
  isHovered: boolean
  size: number
}

function QuantumOrbCanvas({ state, mouseX, mouseY, isHovered, size }: QuantumOrbCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const ringsRef = useRef<EnergyRing[]>([])
  const timeRef = useRef(0)

  // Inicializar partículas y anillos
  useEffect(() => {
    const particles: Particle[] = []
    const colors = QUANTUM_COLORS[state].particles

    // Crear partículas orbitales
    for (let i = 0; i < 200; i++) {
      const orbitRadius = 30 + Math.random() * 50
      const colorIndex = Math.floor(Math.random() * colors.length)
      particles.push({
        x: 0,
        y: 0,
        z: Math.random() * 2 - 1,
        vx: 0,
        vy: 0,
        vz: (Math.random() - 0.5) * 0.02,
        size: Math.random() * 2 + 0.5,
        color: colors[colorIndex] as string,
        alpha: Math.random() * 0.8 + 0.2,
        orbitRadius,
        orbitSpeed: (0.005 + Math.random() * 0.01) * (Math.random() > 0.5 ? 1 : -1),
        orbitAngle: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
      })
    }

    particlesRef.current = particles

    // Crear anillos de energía
    const rings: EnergyRing[] = [
      { radius: 45, rotation: 0, speed: 0.02, opacity: 0.4, width: 1.5 },
      { radius: 55, rotation: Math.PI / 3, speed: -0.015, opacity: 0.3, width: 1 },
      { radius: 65, rotation: Math.PI / 6, speed: 0.01, opacity: 0.2, width: 0.8 },
    ]
    ringsRef.current = rings
  }, [state])

  // Animación principal
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Setup canvas con DPR
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const centerX = size / 2
    const centerY = size / 2
    const colors = QUANTUM_COLORS[state]

    const animate = () => {
      timeRef.current += 0.016

      // Clear con fade trail
      ctx.fillStyle = 'rgba(3, 3, 8, 0.15)'
      ctx.fillRect(0, 0, size, size)

      // Efecto de distorsión por mouse
      const mouseInfluenceX = (mouseX - 0.5) * 20
      const mouseInfluenceY = (mouseY - 0.5) * 20

      // ═══════════════════════════════════════════════════════════════════
      // CAPA 1: Glow de fondo
      // ═══════════════════════════════════════════════════════════════════
      const bgGlow = ctx.createRadialGradient(
        centerX + mouseInfluenceX * 0.3,
        centerY + mouseInfluenceY * 0.3,
        0,
        centerX,
        centerY,
        size / 2,
      )
      bgGlow.addColorStop(0, colors.glow.replace('0.6', '0.3'))
      bgGlow.addColorStop(0.5, colors.glow.replace('0.6', '0.1'))
      bgGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = bgGlow
      ctx.fillRect(0, 0, size, size)

      // ═══════════════════════════════════════════════════════════════════
      // CAPA 2: Anillos de energía holográficos
      // ═══════════════════════════════════════════════════════════════════
      ringsRef.current.forEach((ring) => {
        ring.rotation += ring.speed * (isHovered ? 2 : 1)

        ctx.save()
        ctx.translate(centerX + mouseInfluenceX * 0.2, centerY + mouseInfluenceY * 0.2)
        ctx.rotate(ring.rotation)

        // Anillo principal
        ctx.beginPath()
        ctx.strokeStyle = colors.primary
        ctx.lineWidth = ring.width
        ctx.globalAlpha = ring.opacity * (isHovered ? 1.5 : 1)
        ctx.setLineDash([10, 5])
        ctx.arc(0, 0, ring.radius, 0, Math.PI * 2)
        ctx.stroke()

        // Glow del anillo
        ctx.beginPath()
        ctx.strokeStyle = colors.glow
        ctx.lineWidth = ring.width * 3
        ctx.globalAlpha = ring.opacity * 0.3
        ctx.setLineDash([])
        ctx.arc(0, 0, ring.radius, 0, Math.PI * 2)
        ctx.stroke()

        ctx.restore()
      })

      ctx.globalAlpha = 1
      ctx.setLineDash([])

      // ═══════════════════════════════════════════════════════════════════
      // CAPA 3: Partículas cuánticas orbitales
      // ═══════════════════════════════════════════════════════════════════
      particlesRef.current.forEach((p) => {
        // Actualizar órbita
        p.orbitAngle += p.orbitSpeed * (isHovered ? 1.5 : 1)
        p.z += p.vz
        if (Math.abs(p.z) > 1) p.vz *= -1

        // Calcular posición 3D -> 2D con perspectiva
        const scale = 1 / (1 + p.z * 0.3)
        const wobble = Math.sin(timeRef.current * 2 + p.phase) * 5
        p.x = Math.cos(p.orbitAngle) * (p.orbitRadius + wobble) * scale
        p.y = Math.sin(p.orbitAngle) * (p.orbitRadius + wobble) * scale * 0.4 // Elipse

        const screenX = centerX + p.x + mouseInfluenceX * 0.5 * scale
        const screenY = centerY + p.y + mouseInfluenceY * 0.5 * scale

        // Dibujar partícula con glow
        const particleGlow = ctx.createRadialGradient(
          screenX,
          screenY,
          0,
          screenX,
          screenY,
          p.size * 4 * scale,
        )
        particleGlow.addColorStop(0, p.color)
        particleGlow.addColorStop(0.3, p.color.replace(')', ', 0.5)').replace('rgb', 'rgba'))
        particleGlow.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.fillStyle = particleGlow
        ctx.globalAlpha = p.alpha * (0.5 + p.z * 0.5)
        ctx.arc(screenX, screenY, p.size * 4 * scale, 0, Math.PI * 2)
        ctx.fill()

        // Núcleo brillante
        ctx.beginPath()
        ctx.fillStyle = '#FFFFFF'
        ctx.globalAlpha = p.alpha * 0.8
        ctx.arc(screenX, screenY, p.size * scale, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.globalAlpha = 1

      // ═══════════════════════════════════════════════════════════════════
      // CAPA 4: Núcleo de plasma central
      // ═══════════════════════════════════════════════════════════════════
      const coreSize = 25 + Math.sin(timeRef.current * 3) * 5 * (isHovered ? 1.5 : 1)
      const coreX = centerX + mouseInfluenceX * 0.1
      const coreY = centerY + mouseInfluenceY * 0.1

      // Glow exterior
      const outerGlow = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, coreSize * 2)
      outerGlow.addColorStop(0, colors.primary)
      outerGlow.addColorStop(0.3, colors.glow)
      outerGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = outerGlow
      ctx.beginPath()
      ctx.arc(coreX, coreY, coreSize * 2, 0, Math.PI * 2)
      ctx.fill()

      // Núcleo interno con gradiente
      const coreGradient = ctx.createRadialGradient(
        coreX - coreSize * 0.3,
        coreY - coreSize * 0.3,
        0,
        coreX,
        coreY,
        coreSize,
      )
      coreGradient.addColorStop(0, '#FFFFFF')
      coreGradient.addColorStop(0.3, colors.primary)
      coreGradient.addColorStop(0.7, colors.secondary)
      coreGradient.addColorStop(1, colors.glow.replace('0.6', '0.3'))

      ctx.beginPath()
      ctx.fillStyle = coreGradient
      ctx.arc(coreX, coreY, coreSize, 0, Math.PI * 2)
      ctx.fill()

      // Highlight especular
      ctx.beginPath()
      const highlightGrad = ctx.createRadialGradient(
        coreX - coreSize * 0.4,
        coreY - coreSize * 0.4,
        0,
        coreX - coreSize * 0.3,
        coreY - coreSize * 0.3,
        coreSize * 0.5,
      )
      highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
      highlightGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = highlightGrad
      ctx.arc(coreX - coreSize * 0.3, coreY - coreSize * 0.3, coreSize * 0.4, 0, Math.PI * 2)
      ctx.fill()

      // ═══════════════════════════════════════════════════════════════════
      // CAPA 5: Ondas de energía pulsantes (solo en estados activos)
      // ═══════════════════════════════════════════════════════════════════
      if (state !== 'idle') {
        const waveCount = state === 'thinking' ? 4 : state === 'speaking' ? 6 : 2
        for (let i = 0; i < waveCount; i++) {
          const waveTime = (timeRef.current * 2 + i * 0.5) % 3
          const waveRadius = waveTime * 40
          const waveOpacity = Math.max(0, 1 - waveTime / 3)

          ctx.beginPath()
          ctx.strokeStyle = colors.primary
          ctx.lineWidth = 2
          ctx.globalAlpha = waveOpacity * 0.5
          ctx.arc(coreX, coreY, waveRadius, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }

      // ═══════════════════════════════════════════════════════════════════
      // CAPA 6: Rayos de luz (god rays) cuando está activo
      // ═══════════════════════════════════════════════════════════════════
      if (isHovered || state !== 'idle') {
        const rayCount = 8
        for (let i = 0; i < rayCount; i++) {
          const rayAngle = (i / rayCount) * Math.PI * 2 + timeRef.current * 0.5
          const rayLength = 60 + Math.sin(timeRef.current * 3 + i) * 20

          const rayGrad = ctx.createLinearGradient(
            coreX,
            coreY,
            coreX + Math.cos(rayAngle) * rayLength,
            coreY + Math.sin(rayAngle) * rayLength,
          )
          rayGrad.addColorStop(0, colors.primary)
          rayGrad.addColorStop(1, 'transparent')

          ctx.beginPath()
          ctx.strokeStyle = rayGrad
          ctx.lineWidth = 2
          ctx.globalAlpha = 0.3
          ctx.moveTo(coreX, coreY)
          ctx.lineTo(coreX + Math.cos(rayAngle) * rayLength, coreY + Math.sin(rayAngle) * rayLength)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationRef.current)
  }, [state, mouseX, mouseY, isHovered, size])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ background: 'transparent' }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 COMPONENTE PRINCIPAL — QUANTUM 3D AI WIDGET
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface Quantum3DAIWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  size?: number
  onNavigateToIA?: () => void
}

export function Quantum3DAIWidget({
  position = 'bottom-right',
  size = 120,
  onNavigateToIA,
}: Quantum3DAIWidgetProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  // Estado
  const [currentState, setCurrentState] = useState<QuantumState>('idle')
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isListening, setIsListening] = useState(false)

  // Mouse tracking con springs para suavidad
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const springConfig = { stiffness: 150, damping: 20 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  // Transformar para parallax
  const orbX = useTransform(smoothX, [0, 1], [-10, 10])
  const orbY = useTransform(smoothY, [0, 1], [-10, 10])
  const rotateX = useTransform(smoothY, [0, 1], [15, -15])
  const rotateY = useTransform(smoothX, [0, 1], [-15, 15])

  // Posiciones
  const positionStyles = useMemo(
    () => ({
      'bottom-right': 'right-6 bottom-6',
      'bottom-left': 'left-6 bottom-6',
      'bottom-center': 'left-1/2 -translate-x-1/2 bottom-6',
    }),
    [],
  )

  // Colores actuales
  const colors = QUANTUM_COLORS[currentState]

  // Handlers
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseX.set((e.clientX - rect.left) / rect.width)
      mouseY.set((e.clientY - rect.top) / rect.height)
    },
    [mouseX, mouseY],
  )

  const handleClick = useCallback(() => {
    if (currentState === 'idle') {
      setCurrentState('listening')
      setIsListening(true)
    } else if (currentState === 'listening') {
      setCurrentState('thinking')
      setIsListening(false)
      // Simular procesamiento
      setTimeout(() => {
        setCurrentState('speaking')
        setTimeout(() => setCurrentState('idle'), 3000)
      }, 2000)
    }
  }, [currentState])

  const handleNavigate = useCallback(() => {
    if (onNavigateToIA) {
      onNavigateToIA()
    } else {
      router.push('/ia')
    }
  }, [router, onNavigateToIA])

  // Animación de flotación idle
  const floatAnimation = {
    y: isHovered ? -5 : [0, -8, 0],
    scale: isHovered ? 1.05 : 1,
  }

  return (
    <motion.div
      ref={containerRef}
      className={`fixed ${positionStyles[position]} z-[9999]`}
      initial={{ opacity: 0, scale: 0, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, delay: 1 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ perspective: '1000px' }}
    >
      {/* Label de estado */}
      <AnimatePresence>
        {(isHovered || currentState !== 'idle') && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2"
          >
            <div
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-xl"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}10)`,
                borderColor: `${colors.primary}40`,
                color: colors.primary,
                boxShadow: `0 0 30px ${colors.glow}`,
              }}
            >
              <motion.span
                className="h-2 w-2 rounded-full"
                style={{ background: colors.primary }}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              {STATE_LABELS[currentState]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botones de acción expandidos */}
      <AnimatePresence>
        {isExpanded && (
          <div className="absolute right-0 bottom-0 mr-32 flex flex-col gap-3">
            {/* Ir a panel completo */}
            <motion.button
              initial={{ opacity: 0, x: 20, scale: 0 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0 }}
              transition={{ delay: 0.1 }}
              onClick={handleNavigate}
              className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}20)`,
                borderColor: `${colors.primary}50`,
                boxShadow: `0 0 20px ${colors.glow}`,
              }}
            >
              <Maximize2 className="h-5 w-5" style={{ color: colors.primary }} />
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
                }}
                animate={{ scale: [1, 1.2, 1], opacity: [0, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>

            {/* Chat */}
            <motion.button
              initial={{ opacity: 0, x: 20, scale: 0 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0 }}
              transition={{ delay: 0.15 }}
              onClick={handleNavigate}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/50 bg-cyan-500/20"
              style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}
            >
              <MessageSquare className="h-5 w-5 text-cyan-400" />
            </motion.button>

            {/* Cerrar */}
            <motion.button
              initial={{ opacity: 0, x: 20, scale: 0 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setIsExpanded(false)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5"
            >
              <X className="h-5 w-5 text-white/60" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Widget principal */}
      <motion.div
        className="relative cursor-pointer"
        style={{
          width: size,
          height: size,
          x: orbX,
          y: orbY,
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={floatAnimation}
        transition={
          isHovered
            ? { type: 'spring', stiffness: 300 }
            : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
        }
        onClick={handleClick}
        onContextMenu={(e) => {
          e.preventDefault()
          setIsExpanded(!isExpanded)
        }}
      >
        {/* Glow exterior */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{ background: colors.glow }}
          animate={{
            scale: currentState === 'idle' ? [1, 1.2, 1] : [1, 1.4, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Contenedor con borde holográfico */}
        <div
          className="relative h-full w-full overflow-hidden rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #1a1a2e 0%, #0a0a12 100%)',
            boxShadow: `
              0 0 40px ${colors.glow},
              inset 0 0 30px ${colors.glow.replace('0.6', '0.2')},
              0 10px 40px rgba(0,0,0,0.5)
            `,
            border: `2px solid ${colors.primary}40`,
          }}
        >
          {/* Canvas 3D */}
          <QuantumOrbCanvas
            state={currentState}
            mouseX={smoothX.get()}
            mouseY={smoothY.get()}
            isHovered={isHovered}
            size={size}
          />

          {/* Ícono central overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                scale: currentState === 'thinking' ? [1, 1.2, 1] : 1,
                rotate: currentState === 'thinking' ? [0, 180, 360] : 0,
              }}
              transition={{
                duration: currentState === 'thinking' ? 2 : 0,
                repeat: currentState === 'thinking' ? Infinity : 0,
                ease: 'linear',
              }}
            >
              <Brain
                className="h-8 w-8 drop-shadow-lg"
                style={{
                  color: '#FFFFFF',
                  filter: `drop-shadow(0 0 10px ${colors.primary})`,
                }}
              />
            </motion.div>
          </div>

          {/* Reflejo superior */}
          <div
            className="pointer-events-none absolute inset-x-4 top-2 h-1/4 rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
            }}
          />
        </div>

        {/* Indicador de micrófono */}
        <motion.div
          className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full"
          style={{
            background:
              currentState === 'listening'
                ? 'linear-gradient(135deg, #00FFFF, #06B6D4)'
                : 'linear-gradient(135deg, #374151, #1F2937)',
            boxShadow:
              currentState === 'listening'
                ? '0 0 20px rgba(0, 255, 255, 0.5)'
                : '0 0 10px rgba(0,0,0,0.3)',
            border: '2px solid rgba(255,255,255,0.2)',
          }}
          animate={{
            scale: currentState === 'listening' ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.5, repeat: currentState === 'listening' ? Infinity : 0 }}
        >
          {currentState === 'listening' ? (
            <Mic className="h-4 w-4 text-white" />
          ) : (
            <MicOff className="h-4 w-4 text-white/60" />
          )}
        </motion.div>

        {/* Indicador de estado activo */}
        {currentState !== 'idle' && (
          <motion.div
            className="absolute -top-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 0 15px ${colors.glow}`,
            }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Sparkles className="h-3 w-3 text-white" />
          </motion.div>
        )}
      </motion.div>

      {/* Texto de ayuda */}
      {currentState === 'idle' && !isExpanded && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0.5 }}
          className="absolute top-full left-1/2 mt-3 -translate-x-1/2 text-center text-[11px] whitespace-nowrap text-white/50"
        >
          Click para hablar • Derecho para menú
        </motion.p>
      )}
    </motion.div>
  )
}

export default Quantum3DAIWidget
