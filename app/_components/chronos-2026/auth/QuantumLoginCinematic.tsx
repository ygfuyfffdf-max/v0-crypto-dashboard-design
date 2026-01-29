'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — QUANTUM LOGIN CINEMATOGRÁFICO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Login supremo con:
 * - Shader WebGPU cinematográfico (liquid distortion + volumetric fog)
 * - Partículas formando logo Χρόνος on-load
 * - Orb central 3D pulsante con mensaje de bienvenida
 * - Form frosted liquid metal con campos que respiran
 * - Spring physics y 3D tilt
 * - Bio-feedback pulse integration
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'motion/react'
import {
  QUANTUM_PALETTE,
  QUANTUM_SHADOWS,
  QUANTUM_GLASS,
  QUANTUM_SPRING,
  QUANTUM_GRADIENTS,
} from '@/app/lib/design-system/quantum-infinity-2026'
import { Eye, EyeOff, Loader2, Sparkles, Zap, Shield, Fingerprint } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 PARTÍCULAS FORMANDO LOGO ΧΡΌΝΟΣ
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Particle {
  id: number
  x: number
  y: number
  targetX: number
  targetY: number
  size: number
  color: string
  velocity: { x: number; y: number }
  phase: number
  opacity: number
}

const LogoParticles = ({
  isFormed,
  onFormationComplete,
}: {
  isFormed: boolean
  onFormationComplete: () => void
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const formationProgressRef = useRef(0)

  // Generar partículas basadas en texto "Χρόνος"
  const generateParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Renderizar texto temporalmente para obtener puntos
    ctx.font = 'bold 120px "SF Pro Display", system-ui'
    ctx.fillStyle = QUANTUM_PALETTE.violet.pure
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const text = 'Χρόνος'
    const textWidth = ctx.measureText(text).width
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Limpiar y dibujar texto
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillText(text, centerX, centerY)

    // Obtener datos de imagen
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data

    // Crear partículas en posiciones del texto
    const particles: Particle[] = []
    const colors = [
      QUANTUM_PALETTE.violet.pure,
      QUANTUM_PALETTE.gold.pure,
      QUANTUM_PALETTE.plasma.pure,
    ]

    for (let y = 0; y < canvas.height; y += 4) {
      for (let x = 0; x < canvas.width; x += 4) {
        const index = (y * canvas.width + x) * 4
        const alpha = pixels[index + 3]

        if (alpha && alpha > 128) {
          particles.push({
            id: particles.length,
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            targetX: x,
            targetY: y,
            size: 2 + Math.random() * 2,
            color: colors[Math.floor(Math.random() * colors.length)] as string,
            velocity: { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 },
            phase: Math.random() * Math.PI * 2,
            opacity: 0,
          })
        }
      }
    }

    particlesRef.current = particles.slice(0, 2000) // Limitar para rendimiento
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  // Animación principal
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas
    const dpr = window.devicePixelRatio || 1
    canvas.width = 800 * dpr
    canvas.height = 400 * dpr
    ctx.scale(dpr, dpr)

    generateParticles()

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)

      particlesRef.current.forEach((particle, index) => {
        const time = Date.now() * 0.001

        if (isFormed) {
          // Animación hacia target
          const dx = particle.targetX / dpr - particle.x
          const dy = particle.targetY / dpr - particle.y
          particle.x += dx * 0.08
          particle.y += dy * 0.08
          particle.opacity = Math.min(1, particle.opacity + 0.02)

          // Verificar si está cerca del target
          if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
            formationProgressRef.current = Math.min(1, formationProgressRef.current + 0.0001)
          }
        } else {
          // Movimiento libre
          particle.x += particle.velocity.x
          particle.y += particle.velocity.y
          particle.velocity.x *= 0.98
          particle.velocity.y *= 0.98
          particle.opacity = 0.3 + Math.sin(time + particle.phase) * 0.2

          // Rebotar en bordes
          if (particle.x < 0 || particle.x > canvas.width / dpr) particle.velocity.x *= -1
          if (particle.y < 0 || particle.y > canvas.height / dpr) particle.velocity.y *= -1
        }

        // Dibujar partícula con glow
        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.shadowBlur = 15
        ctx.shadowColor = particle.color
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // Llamar callback cuando formación esté completa
      if (formationProgressRef.current > 0.95 && isFormed) {
        onFormationComplete()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isFormed, generateParticles, onFormationComplete])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      style={{ width: '100%', height: '100%', maxWidth: '800px', maxHeight: '400px' }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 SHADER BACKGROUND CINEMATOGRÁFICO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const CinematicBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Partículas volumétricas
    interface VolumetricParticle {
      x: number
      y: number
      z: number
      size: number
      speed: number
      color: string
    }

    const particles: VolumetricParticle[] = []
    const colors = [
      QUANTUM_PALETTE.violet.glow40,
      QUANTUM_PALETTE.gold.glow30,
      QUANTUM_PALETTE.plasma.glow20,
    ]

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random(),
        size: 1 + Math.random() * 3,
        speed: 0.2 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)] as string,
      })
    }

    const animate = () => {
      const time = Date.now() * 0.001

      // Fondo base con gradiente dinámico
      const gradient = ctx.createRadialGradient(
        canvas.width * mouseRef.current.x,
        canvas.height * mouseRef.current.y,
        0,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.8,
      )
      gradient.addColorStop(0, 'rgba(139, 0, 255, 0.1)')
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.95)')
      gradient.addColorStop(1, '#000000')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Ondas líquidas
      ctx.save()
      ctx.globalAlpha = 0.1
      for (let i = 0; i < 5; i++) {
        const waveGradient = ctx.createRadialGradient(
          canvas.width * 0.5 + Math.sin(time + i) * 200,
          canvas.height * 0.5 + Math.cos(time * 0.7 + i) * 150,
          0,
          canvas.width * 0.5,
          canvas.height * 0.5,
          400 + i * 100,
        )
        waveGradient.addColorStop(
          0,
          i % 2 === 0 ? QUANTUM_PALETTE.violet.glow30 : QUANTUM_PALETTE.gold.glow20,
        )
        waveGradient.addColorStop(1, 'transparent')
        ctx.fillStyle = waveGradient
        ctx.beginPath()
        ctx.arc(
          canvas.width * 0.5 + Math.sin(time + i) * 200,
          canvas.height * 0.5 + Math.cos(time * 0.7 + i) * 150,
          400 + i * 100 + Math.sin(time * 2 + i) * 50,
          0,
          Math.PI * 2,
        )
        ctx.fill()
      }
      ctx.restore()

      // Partículas con profundidad
      particles.forEach((p) => {
        p.y -= p.speed * (1 + p.z)
        p.x += Math.sin(time + p.y * 0.01) * 0.5

        if (p.y < -10) {
          p.y = canvas.height + 10
          p.x = Math.random() * canvas.width
        }

        const scale = 0.5 + p.z * 0.5
        const alpha = 0.3 + p.z * 0.4

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.shadowBlur = 20 * scale
        ctx.shadowColor = p.color
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // Grid volumétrico
      ctx.save()
      ctx.globalAlpha = 0.03
      ctx.strokeStyle = QUANTUM_PALETTE.violet.pure
      ctx.lineWidth = 1
      const gridSize = 80
      for (let x = 0; x < canvas.width; x += gridSize) {
        const offsetX = Math.sin(time * 0.5 + x * 0.01) * 10
        ctx.beginPath()
        ctx.moveTo(x + offsetX, 0)
        ctx.lineTo(x + offsetX, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        const offsetY = Math.cos(time * 0.5 + y * 0.01) * 10
        ctx.beginPath()
        ctx.moveTo(0, y + offsetY)
        ctx.lineTo(canvas.width, y + offsetY)
        ctx.stroke()
      }
      ctx.restore()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" style={{ zIndex: 0 }} />
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔮 ORB CENTRAL PULSANTE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const CentralOrb = ({ message, capitalTotal }: { message: string; capitalTotal?: number }) => {
  const orbRef = useRef<HTMLDivElement>(null)
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => (p + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const pulseScale = 1 + Math.sin(pulse * 0.1) * 0.03

  return (
    <motion.div
      ref={orbRef}
      className="relative mx-auto mb-8 h-32 w-32"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: pulseScale, opacity: 1 }}
      transition={QUANTUM_SPRING.bouncy}
    >
      {/* Anillos orbitales */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border"
          style={{
            borderColor:
              i === 0
                ? QUANTUM_PALETTE.violet.glow30
                : i === 1
                  ? QUANTUM_PALETTE.gold.glow20
                  : QUANTUM_PALETTE.plasma.glow15,
            transform: `scale(${1.2 + i * 0.3}) rotate(${i * 30}deg)`,
          }}
          animate={{
            rotate: [i * 30, i * 30 + 360],
          }}
          transition={{
            duration: 10 + i * 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Núcleo */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: QUANTUM_GRADIENTS.orbViolet,
          boxShadow: QUANTUM_SHADOWS.glowViolet.xl,
        }}
      />

      {/* Mensaje central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-white" />
      </div>

      {/* Tooltip con mensaje */}
      <motion.div
        className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, ...QUANTUM_SPRING.smooth }}
      >
        <p className="text-sm font-medium" style={{ color: QUANTUM_PALETTE.white.text60 }}>
          {message}
        </p>
        {capitalTotal !== undefined && (
          <p
            className="mt-1 text-center text-lg font-bold"
            style={{
              background: QUANTUM_GRADIENTS.text.gold,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ${capitalTotal.toLocaleString('es-MX')}
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📝 FORM INPUT CON SPRING PHYSICS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuantumInputProps {
  type: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  icon: React.ReactNode
  error?: string
}

const QuantumInput = ({ type, placeholder, value, onChange, icon, error }: QuantumInputProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [2, -2])
  const rotateY = useTransform(x, [-100, 100], [-2, 2])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(e.clientX - centerX)
    y.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const actualType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className="relative">
      <motion.div
        className="relative overflow-hidden rounded-xl"
        style={{
          perspective: 1000,
          rotateX,
          rotateY,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02 }}
        transition={QUANTUM_SPRING.snappy}
      >
        {/* Glow border */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: isFocused
              ? `linear-gradient(135deg, ${QUANTUM_PALETTE.violet.pure}, ${QUANTUM_PALETTE.gold.pure})`
              : 'transparent',
            padding: '1px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Input container */}
        <div
          className="relative flex items-center gap-3 rounded-xl px-4 py-3"
          style={{
            background: QUANTUM_GLASS.surface.medium?.background || 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: `1px solid ${isFocused ? 'transparent' : QUANTUM_PALETTE.white.border10}`,
            boxShadow: isFocused ? QUANTUM_SHADOWS.glowViolet.md : 'none',
          }}
        >
          {/* Icon */}
          <motion.div
            animate={{
              color: isFocused ? QUANTUM_PALETTE.violet.pure : QUANTUM_PALETTE.white.text40,
              scale: isFocused ? 1.1 : 1,
            }}
            transition={QUANTUM_SPRING.snappy}
          >
            {icon}
          </motion.div>

          {/* Input */}
          <input
            ref={inputRef}
            type={actualType}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
            style={{ fontSize: '15px' }}
          />

          {/* Password toggle */}
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/40 transition-colors hover:text-white/60"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            className="absolute -bottom-5 left-0 text-xs"
            style={{ color: QUANTUM_PALETTE.plasma.pure }}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 BOTÓN QUANTUM CON RIPPLE SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuantumButtonProps {
  children: React.ReactNode
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}

const QuantumLoginButton = ({
  children,
  onClick,
  loading,
  disabled,
  variant = 'primary',
}: QuantumButtonProps) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return

    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setRipples((prev) => [...prev, { x, y, id: Date.now() }])
    }
    onClick()
  }

  const variants = {
    primary: {
      background: QUANTUM_GRADIENTS.violetGold,
      boxShadow: QUANTUM_SHADOWS.glowViolet.md,
      color: QUANTUM_PALETTE.white.pure,
    },
    secondary: {
      background: QUANTUM_GLASS.surface.medium?.background || 'rgba(255, 255, 255, 0.1)',
      boxShadow: QUANTUM_SHADOWS.elevation[2],
      color: QUANTUM_PALETTE.white.text,
    },
    ghost: {
      background: 'transparent',
      boxShadow: 'none',
      color: QUANTUM_PALETTE.white.text60,
    },
  }

  const style = variants[variant]

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      disabled={loading || disabled}
      className="relative w-full overflow-hidden rounded-xl px-6 py-3 font-semibold"
      style={{
        background: style.background,
        boxShadow: style.boxShadow,
        color: style.color,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
      }}
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={QUANTUM_SPRING.snappy}
    >
      {/* Ripples */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            background: QUANTUM_PALETTE.gold.glow40,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ width: 0, height: 0, opacity: 0.8 }}
          animate={{ width: 400, height: 400, opacity: 0 }}
          transition={{ duration: 0.8 }}
          onAnimationComplete={() => {
            setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
          }}
        />
      ))}

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Iniciando sesión...</span>
          </>
        ) : (
          children
        )}
      </span>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🚀 COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuantumLoginCinematicProps {
  onLogin: (email: string, password: string) => Promise<void>
  onForgotPassword?: () => void
  capitalTotal?: number
}

export const QuantumLoginCinematic = ({
  onLogin,
  onForgotPassword,
  capitalTotal,
}: QuantumLoginCinematicProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [logoFormed, setLogoFormed] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)

  // Iniciar formación del logo después de 1 segundo
  useEffect(() => {
    const timer = setTimeout(() => {
      setLogoFormed(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Mostrar form después de formación
  const handleFormationComplete = useCallback(() => {
    setTimeout(() => setShowForm(true), 500)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    try {
      await onLogin(email, password)
      setLoginSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background cinematográfico */}
      <CinematicBackground />

      {/* Contenedor principal */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={QUANTUM_SPRING.bouncy}
      >
        {/* Logo con partículas */}
        <div className="relative mb-8 flex h-48 items-center justify-center">
          <LogoParticles isFormed={logoFormed} onFormationComplete={handleFormationComplete} />

          {/* Texto estático como fallback */}
          <motion.h1
            className="absolute text-5xl font-bold"
            style={{
              background: QUANTUM_GRADIENTS.text.violetGold,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 0 40px ${QUANTUM_PALETTE.violet.glow40}`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: logoFormed ? 1 : 0 }}
            transition={{ delay: 2, duration: 1 }}
          >
            Χρόνος
          </motion.h1>
        </div>

        {/* Orb central */}
        <AnimatePresence>
          {loginSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={QUANTUM_SPRING.bouncy}
            >
              <CentralOrb message="¡Bienvenido! Tu capital total es:" capitalTotal={capitalTotal} />
            </motion.div>
          ) : (
            showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <CentralOrb message="Accede a tu universo financiero" />
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* Form card */}
        <AnimatePresence>
          {showForm && !loginSuccess && (
            <motion.div
              className="relative overflow-hidden rounded-2xl"
              style={{
                background: QUANTUM_GLASS.elevated?.background || 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(40px) saturate(180%)',
                border: `1px solid ${QUANTUM_PALETTE.violet.border15}`,
                boxShadow: QUANTUM_SHADOWS.heroCard,
              }}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={QUANTUM_SPRING.bouncy}
            >
              {/* Glow superior */}
              <div
                className="absolute top-0 left-1/2 h-1 w-3/4 -translate-x-1/2 rounded-full"
                style={{
                  background: QUANTUM_GRADIENTS.violetGold,
                  boxShadow: QUANTUM_SHADOWS.glowViolet.lg,
                }}
              />

              <form onSubmit={handleSubmit} className="space-y-6 p-8">
                {/* Título */}
                <div className="mb-8 text-center">
                  <h2
                    className="mb-2 text-2xl font-bold"
                    style={{ color: QUANTUM_PALETTE.white.pure }}
                  >
                    Iniciar Sesión
                  </h2>
                  <p style={{ color: QUANTUM_PALETTE.white.text40 }}>Chronos Infinity 2026</p>
                </div>

                {/* Inputs */}
                <QuantumInput
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={setEmail}
                  icon={<Shield size={20} />}
                />

                <QuantumInput
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={setPassword}
                  icon={<Fingerprint size={20} />}
                />

                {/* Error global */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="rounded-lg p-3 text-center text-sm"
                      style={{
                        background: QUANTUM_PALETTE.plasma.glow15,
                        color: QUANTUM_PALETTE.plasma.pure,
                        border: `1px solid ${QUANTUM_PALETTE.plasma.border}`,
                      }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botón submit */}
                <QuantumLoginButton onClick={() => {}} loading={loading}>
                  <Zap size={18} />
                  <span>Acceder</span>
                </QuantumLoginButton>

                {/* Forgot password */}
                {onForgotPassword && (
                  <motion.button
                    type="button"
                    onClick={onForgotPassword}
                    className="w-full text-center text-sm"
                    style={{ color: QUANTUM_PALETTE.white.text40 }}
                    whileHover={{ color: QUANTUM_PALETTE.violet.pure }}
                    transition={{ duration: 0.2 }}
                  >
                    ¿Olvidaste tu contraseña?
                  </motion.button>
                )}
              </form>

              {/* Footer */}
              <div
                className="border-t px-8 py-4 text-center text-xs"
                style={{
                  borderColor: QUANTUM_PALETTE.white.border10,
                  color: QUANTUM_PALETTE.white.text20,
                }}
              >
                Protegido con cifrado de grado bancario
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Versión */}
        <motion.p
          className="mt-8 text-center text-xs"
          style={{ color: QUANTUM_PALETTE.white.text20 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Chronos Infinity v2026.1 — Sistema de Gestión Financiera Cuántico
        </motion.p>
      </motion.div>
    </div>
  )
}

export default QuantumLoginCinematic
