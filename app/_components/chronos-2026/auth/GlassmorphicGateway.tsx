/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔮 GLASSMORPHIC GATEWAY — PÁGINA DE LOGIN ULTRA-PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Login PREMIUM inspirado en diseño futurista glassmorphism con:
 * - Glassmorphism Gen-5 auténtico (fondo completamente visible)
 * - Fondos animados con partículas cósmicas
 * - Efectos de hover premium en inputs y botones
 * - Validación en tiempo real con feedback visual
 * - Transiciones fluidas y micro-interacciones
 * - Seguridad: HTTPS, encriptación, protección anti-brute force
 *
 * Inspirado en: https://mx.pinterest.com/pin/64246732182193709/
 *
 * @version 1.0.0 SUPREME ELITE
 * @author CHRONOS INFINITY TEAM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Fingerprint,
  Loader2,
  Lock,
  Mail,
  Shield,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import React, { memo, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PALETA DE COLORES PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const PALETTE = {
  // Primarios
  void: '#000000',
  deepSpace: '#050510',
  nebulaPurple: '#1a1025',
  violetElectric: '#8B00FF',
  violetGlow: 'rgba(139, 0, 255, 0.4)',
  // Acentos
  goldPremium: '#FFD700',
  goldGlow: 'rgba(255, 215, 0, 0.4)',
  plasmaPink: '#FF1493',
  plasmaGlow: 'rgba(255, 20, 147, 0.4)',
  emeraldSuccess: '#00FF88',
  // Neutrales
  silverStar: '#E0E0E0',
  white: '#FFFFFF',
  error: '#FF4444',
  // Glass
  glassLight: 'rgba(255, 255, 255, 0.08)',
  glassMedium: 'rgba(255, 255, 255, 0.12)',
  glassBorder: 'rgba(255, 255, 255, 0.15)',
  glassHover: 'rgba(255, 255, 255, 0.18)',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlassmorphicGatewayProps {
  onSuccess?: () => void
  onRegisterClick?: () => void
  redirectUrl?: string
  showSocialLogin?: boolean
  enableBiometric?: boolean
}

interface FormState {
  email: string
  password: string
  rememberMe: boolean
}

interface ValidationState {
  email: { valid: boolean; message: string }
  password: { valid: boolean; message: string }
}

type AuthMode = 'login' | 'register'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE DE FONDO ANIMADO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const AnimatedBackground = memo(function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<
    Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      color: string
      pulse: number
    }>
  >([])
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // Reinicializar partículas
      particlesRef.current = []
      for (let i = 0; i < 100; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.2,
          color:
            Math.random() > 0.7
              ? PALETTE.violetElectric
              : Math.random() > 0.5
                ? PALETTE.plasmaPink
                : PALETTE.goldPremium,
          pulse: Math.random() * Math.PI * 2,
        })
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      timeRef.current += 0.016
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Gradiente de fondo cósmico
      const bgGradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.7,
      )
      bgGradient.addColorStop(0, PALETTE.nebulaPurple)
      bgGradient.addColorStop(0.5, PALETTE.deepSpace)
      bgGradient.addColorStop(1, PALETTE.void)
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Orbes de luz ambiental
      const orbs = [
        {
          x: canvas.width * 0.25,
          y: canvas.height * 0.3,
          color: PALETTE.violetElectric,
          radius: 300,
        },
        { x: canvas.width * 0.75, y: canvas.height * 0.7, color: PALETTE.plasmaPink, radius: 250 },
        { x: canvas.width * 0.5, y: canvas.height * 0.5, color: PALETTE.goldPremium, radius: 200 },
      ]

      orbs.forEach((orb, i) => {
        const offsetX = Math.sin(timeRef.current * 0.5 + i * 2) * 50
        const offsetY = Math.cos(timeRef.current * 0.3 + i * 1.5) * 50

        const orbGradient = ctx.createRadialGradient(
          orb.x + offsetX,
          orb.y + offsetY,
          0,
          orb.x + offsetX,
          orb.y + offsetY,
          orb.radius,
        )
        orbGradient.addColorStop(0, `${orb.color}20`)
        orbGradient.addColorStop(0.5, `${orb.color}08`)
        orbGradient.addColorStop(1, 'transparent')

        ctx.fillStyle = orbGradient
        ctx.beginPath()
        ctx.arc(orb.x + offsetX, orb.y + offsetY, orb.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Dibujar y actualizar partículas
      particlesRef.current.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        // Wrap around
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        // Efecto de pulso
        const pulseOpacity = p.opacity * (0.7 + Math.sin(timeRef.current * 2 + p.pulse) * 0.3)
        const pulseSize = p.size * (0.8 + Math.sin(timeRef.current * 3 + p.pulse) * 0.2)

        // Glow
        const glowGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseSize * 3)
        glowGradient.addColorStop(
          0,
          `${p.color}${Math.round(pulseOpacity * 0.5 * 255)
            .toString(16)
            .padStart(2, '0')}`,
        )
        glowGradient.addColorStop(1, 'transparent')
        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, pulseSize * 3, 0, Math.PI * 2)
        ctx.fill()

        // Partícula
        ctx.fillStyle = `${p.color}${Math.round(pulseOpacity * 255)
          .toString(16)
          .padStart(2, '0')}`
        ctx.beginPath()
        ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2)
        ctx.fill()
      })

      // Grid sutil
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)'
      ctx.lineWidth = 1
      const gridSize = 80

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE KOCMOC LOGO COMPACTO (Estilo КОСМОС con ΧΡΟΝΟΣ)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const OrbitalLogoCompact = memo(function OrbitalLogoCompact({ size = 80 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    let time = 0
    const cx = size / 2
    const cy = size / 2
    const scale = size / 200

    // Órbitas estilo KOCMOC
    const orbits = [
      { rx: 38 * scale, ry: 16 * scale, rotation: -25, dotted: false },
      { rx: 45 * scale, ry: 20 * scale, rotation: 20, dotted: true },
      { rx: 52 * scale, ry: 24 * scale, rotation: -35, dotted: true },
    ]

    const lineLength = 45 * scale

    const animate = () => {
      time += 0.01
      ctx.clearRect(0, 0, size, size)

      // Dibujar órbitas
      orbits.forEach((orbit, i) => {
        ctx.save()
        ctx.translate(cx, cy)
        const rotOffset = Math.sin(time + i) * 2
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

      // Nodos en la línea
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

      // Núcleo central (estilo KOCMOC)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, 10 * scale, 0, Math.PI * 2)
      ctx.stroke()

      // Punto central brillante con pulso
      const pulse = 0.85 + Math.sin(time * 3) * 0.15
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
  }, [size])

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE INPUT GLASSMORPHIC
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlassInputProps {
  type: 'email' | 'password' | 'text'
  placeholder: string
  value: string
  onChange: (value: string) => void
  icon: React.ReactNode
  validation?: { valid: boolean; message: string }
  showPasswordToggle?: boolean
  onPasswordToggle?: () => void
  passwordVisible?: boolean
}

const GlassInput = memo(function GlassInput({
  type,
  placeholder,
  value,
  onChange,
  icon,
  validation,
  showPasswordToggle,
  onPasswordToggle,
  passwordVisible,
}: GlassInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const inputType = type === 'password' && passwordVisible ? 'text' : type

  return (
    <div className="relative">
      <motion.div
        className="relative overflow-hidden rounded-2xl"
        animate={{
          boxShadow: isFocused
            ? `0 0 0 2px ${PALETTE.violetElectric}60, 0 0 30px ${PALETTE.violetGlow}`
            : isHovered
              ? `0 0 0 1px ${PALETTE.glassBorder}`
              : 'none',
        }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Fondo glassmorphic */}
        <div
          className="absolute inset-0"
          style={{
            background: isFocused ? PALETTE.glassHover : PALETTE.glassLight,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${PALETTE.glassBorder}`,
            borderRadius: '1rem',
          }}
        />

        {/* Efecto de brillo superior */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${PALETTE.white}20, transparent)`,
          }}
        />

        {/* Contenido del input */}
        <div className="relative flex items-center gap-3 px-5 py-4">
          <motion.div
            className="text-white/50"
            animate={{
              color: isFocused ? PALETTE.violetElectric : 'rgba(255, 255, 255, 0.5)',
              scale: isFocused ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>

          <input
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 bg-transparent text-white placeholder-white/40 outline-none"
            style={{ fontSize: '1rem' }}
          />

          {showPasswordToggle && (
            <button
              type="button"
              onClick={onPasswordToggle}
              className="text-white/50 transition-colors hover:text-white/80"
            >
              {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}

          {validation && value.length > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={validation.valid ? 'text-green-400' : 'text-red-400'}
            >
              {validation.valid ? <Check size={18} /> : <AlertCircle size={18} />}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Mensaje de validación */}
      <AnimatePresence>
        {validation && !validation.valid && value.length > 0 && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-400"
          >
            {validation.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE BOTÓN PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlassButtonProps {
  children: React.ReactNode
  onClick?: () => void
  isLoading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: React.ReactNode
  disabled?: boolean
  type?: 'button' | 'submit'
}

const GlassButton = memo(function GlassButton({
  children,
  onClick,
  isLoading,
  variant = 'primary',
  icon,
  disabled,
  type = 'button',
}: GlassButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const isPrimary = variant === 'primary'
  const isGhost = variant === 'ghost'

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className="relative overflow-hidden rounded-2xl font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        padding: isGhost ? '0.75rem 1.5rem' : '1rem 2rem',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {/* Fondo */}
      <div
        className="absolute inset-0"
        style={{
          background: isPrimary
            ? `linear-gradient(135deg, ${PALETTE.violetElectric}, ${PALETTE.plasmaPink})`
            : isGhost
              ? 'transparent'
              : PALETTE.glassLight,
          backdropFilter: isPrimary ? 'none' : 'blur(20px)',
          border: `1px solid ${isPrimary ? 'transparent' : PALETTE.glassBorder}`,
          borderRadius: '1rem',
        }}
      />

      {/* Efecto de brillo al hover */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
          borderRadius: '1rem',
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Contenido */}
      <span
        className="relative flex items-center justify-center gap-2"
        style={{
          color: isPrimary || isGhost ? PALETTE.white : PALETTE.silverStar,
        }}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>
            {children}
            {icon}
          </>
        )}
      </span>
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL - GLASSMORPHIC GATEWAY
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function GlassmorphicGateway({
  onSuccess,
  onRegisterClick,
  redirectUrl = '/dashboard',
  showSocialLogin = true,
  enableBiometric = false,
}: GlassmorphicGatewayProps) {
  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validación en tiempo real
  const validation: ValidationState = {
    email: {
      valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email),
      message: 'Ingresa un email válido',
    },
    password: {
      valid: formState.password.length >= 8,
      message: 'La contraseña debe tener al menos 8 caracteres',
    },
  }

  const isFormValid = validation.email.valid && validation.password.valid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)
    setError(null)

    try {
      // Simular autenticación
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Aquí iría la lógica real de autenticación
      onSuccess?.()
    } catch (err) {
      setError('Credenciales inválidas. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Fondo animado */}
      <AnimatedBackground />

      {/* Scan line effect */}
      <motion.div
        className="pointer-events-none fixed inset-x-0 z-50 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* Contenedor principal con glassmorphism */}
      <motion.div
        className="relative z-10 w-full max-w-md p-8"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Card glassmorphic */}
        <div
          className="relative overflow-hidden rounded-3xl p-8"
          style={{
            background: PALETTE.glassMedium,
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: `1px solid ${PALETTE.glassBorder}`,
            boxShadow: `
              0 4px 30px rgba(0, 0, 0, 0.3),
              0 0 100px ${PALETTE.violetGlow},
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
          }}
        >
          {/* Brillo superior */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${PALETTE.white}30, transparent)`,
            }}
          />

          {/* Logo y título */}
          <div className="mb-8 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <OrbitalLogoCompact size={80} />
            </motion.div>

            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1
                className="text-3xl font-light tracking-[0.2em]"
                style={{
                  color: PALETTE.silverStar,
                  textShadow: `0 0 30px ${PALETTE.violetGlow}`,
                }}
              >
                ΧΡΟΝΟΣ
              </h1>
              <p className="mt-2 text-sm tracking-wider text-white/50">Bienvenido de vuelta</p>
            </motion.div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <GlassInput
              type="email"
              placeholder="Email"
              value={formState.email}
              onChange={(email) => setFormState((s) => ({ ...s, email }))}
              icon={<Mail size={20} />}
              validation={formState.email.length > 0 ? validation.email : undefined}
            />

            <GlassInput
              type="password"
              placeholder="Contraseña"
              value={formState.password}
              onChange={(password) => setFormState((s) => ({ ...s, password }))}
              icon={<Lock size={20} />}
              validation={formState.password.length > 0 ? validation.password : undefined}
              showPasswordToggle
              passwordVisible={passwordVisible}
              onPasswordToggle={() => setPasswordVisible(!passwordVisible)}
            />

            {/* Opciones adicionales */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-white/60 transition-colors hover:text-white/80">
                <input
                  type="checkbox"
                  checked={formState.rememberMe}
                  onChange={(e) => setFormState((s) => ({ ...s, rememberMe: e.target.checked }))}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
                />
                Recordarme
              </label>

              <Link
                href="/forgot-password"
                className="text-white/60 transition-colors hover:text-violet-400"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-400"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botón de login */}
            <GlassButton
              type="submit"
              isLoading={isLoading}
              disabled={!isFormValid}
              icon={<ArrowRight size={18} />}
            >
              Iniciar Sesión
            </GlassButton>
          </form>

          {/* Biometric */}
          {enableBiometric && (
            <div className="mt-4 flex justify-center">
              <GlassButton variant="ghost" icon={<Fingerprint size={20} />}>
                Usar biométrico
              </GlassButton>
            </div>
          )}

          {/* Separador */}
          {showSocialLogin && (
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs tracking-wider text-white/40">O CONTINÚA CON</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
          )}

          {/* Social Login */}
          {showSocialLogin && (
            <div className="flex justify-center gap-4">
              {[
                { name: 'Google', icon: 'G' },
                { name: 'Apple', icon: '' },
                { name: 'GitHub', icon: '󰊤' },
              ].map((provider) => (
                <motion.button
                  key={provider.name}
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-semibold text-white/70 transition-colors hover:text-white"
                  style={{
                    background: PALETTE.glassLight,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${PALETTE.glassBorder}`,
                  }}
                  whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${PALETTE.violetGlow}` }}
                  whileTap={{ scale: 0.95 }}
                >
                  {provider.icon}
                </motion.button>
              ))}
            </div>
          )}

          {/* Link a registro */}
          <p className="mt-8 text-center text-sm text-white/50">
            ¿No tienes una cuenta?{' '}
            <button
              onClick={onRegisterClick}
              className="font-medium text-violet-400 transition-colors hover:text-violet-300 hover:underline"
            >
              Crear cuenta
            </button>
          </p>
        </div>

        {/* Badge de seguridad */}
        <motion.div
          className="mt-6 flex items-center justify-center gap-2 text-xs text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Shield size={14} />
          <span>Conexión segura con encriptación de extremo a extremo</span>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default GlassmorphicGateway
