/**
 * 🌌 KOCMOC QUANTUM REGISTER PAGE
 * Página de registro con fondo espacial profundo y logo KOCMOC orbital
 */

'use client'

import { KocmocLogoCompact } from '@/app/_components/chronos-2026/branding/KocmocLogo'
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'

const PALETTE = {
  void: '#000000',
  white: '#FFFFFF',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DEEP SPACE STARFIELD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Star {
  x: number
  y: number
  size: number
  brightness: number
  twinkleSpeed: number
  twinklePhase: number
  color: string
}

function DeepSpaceStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let animationId: number
    const stars: Star[] = []
    let time = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.scale(dpr, dpr)
    }

    const createStars = () => {
      stars.length = 0
      const count = 600
      const starColors = [
        'rgba(255, 255, 255, 1)',
        'rgba(200, 220, 255, 1)',
        'rgba(255, 240, 220, 1)',
        'rgba(255, 200, 200, 1)',
        'rgba(220, 200, 255, 1)',
      ]

      for (let i = 0; i < count; i++) {
        const isLargeStar = Math.random() > 0.95
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: isLargeStar ? Math.random() * 2 + 1.5 : Math.random() * 1.2 + 0.3,
          brightness: Math.random() * 0.5 + 0.5,
          twinkleSpeed: Math.random() * 2 + 1,
          twinklePhase: Math.random() * Math.PI * 2,
          color:
            starColors[Math.floor(Math.random() * starColors.length)] ?? 'rgba(255, 255, 255, 1)',
        })
      }
    }

    const drawStar = (star: Star) => {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7
      const alpha = star.brightness * twinkle

      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2)
      ctx.fillStyle = star.color.replace('1)', alpha + ')')
      ctx.fill()

      if (star.size > 1.5 && alpha > 0.7) {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3)
        gradient.addColorStop(0, star.color.replace('1)', alpha * 0.3 + ')'))
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.fill()

        ctx.strokeStyle = star.color.replace('1)', alpha * 0.15 + ')')
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(star.x - star.size * 4, star.y)
        ctx.lineTo(star.x + star.size * 4, star.y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(star.x, star.y - star.size * 4)
        ctx.lineTo(star.x, star.y + star.size * 4)
        ctx.stroke()
      }
    }

    const animate = () => {
      time += 0.016
      ctx.fillStyle = PALETTE.void
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
      stars.forEach(drawStar)
      animationId = requestAnimationFrame(animate)
    }

    resize()
    createStars()
    animate()

    const handleResize = () => {
      resize()
      createStars()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0" />
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS INPUT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlassInputProps {
  type: string
  placeholder: string
  value: string
  onChange: (_value: string) => void
  icon: React.ReactNode
  error?: string
  success?: boolean
}

function GlassInput({ type, placeholder, value, onChange, icon, error, success }: GlassInputProps) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="relative">
      <motion.div
        className="relative flex items-center overflow-hidden rounded-2xl"
        animate={{
          boxShadow: focused
            ? '0 0 20px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
            : error
              ? '0 0 15px rgba(255, 68, 68, 0.2)'
              : 'none',
        }}
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: error
            ? '1px solid rgba(255, 68, 68, 0.4)'
            : success
              ? '1px solid rgba(0, 255, 136, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="absolute left-4 text-white/40">{icon}</div>

        <input
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent py-4 pr-12 pl-12 text-sm font-light tracking-wide text-white outline-none placeholder:text-white/30"
          autoComplete={
            type === 'email' ? 'email' : type === 'password' ? 'current-password' : 'off'
          }
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-white/40 transition-colors hover:text-white/70"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {success && !isPassword && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute right-4 text-emerald-400"
          >
            <Check size={18} />
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-2 ml-1 text-xs text-red-400/80"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS BUTTON
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlassButtonProps {
  children: React.ReactNode
  type?: 'submit' | 'button'
  loading?: boolean
  onClick?: () => void
}

function GlassButton({ children, type = 'submit', loading, onClick }: GlassButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={loading}
      onClick={onClick}
      className="relative w-full overflow-hidden rounded-2xl py-4 font-medium tracking-wide text-white disabled:opacity-50"
      style={{
        background:
          'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 0 30px rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
      }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            {children}
            <ArrowRight size={18} className="opacity-70" />
          </>
        )}
      </span>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// REGISTER PAGE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  const validateName = useCallback((value: string) => {
    if (!value) return 'Nombre requerido'
    if (value.length < 2) return 'Mínimo 2 caracteres'
    return null
  }, [])

  const validateEmail = useCallback((value: string) => {
    if (!value) return 'Email requerido'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido'
    return null
  }, [])

  const validatePassword = useCallback((value: string) => {
    if (!value) return 'Contraseña requerida'
    if (value.length < 6) return 'Mínimo 6 caracteres'
    return null
  }, [])

  const validateConfirmPassword = useCallback(
    (value: string) => {
      if (!value) return 'Confirma tu contraseña'
      if (value !== password) return 'Las contraseñas no coinciden'
      return null
    },
    [password],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const nameErr = validateName(name)
      const emailErr = validateEmail(email)
      const passErr = validatePassword(password)
      const confirmErr = validateConfirmPassword(confirmPassword)

      setNameError(nameErr)
      setEmailError(emailErr)
      setPasswordError(passErr)
      setConfirmError(confirmErr)

      if (nameErr || emailErr || passErr || confirmErr) return

      setLoading(true)
      setError(null)

      try {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        router.push('/login')
      } catch {
        setError('Error al crear cuenta. Inténtalo de nuevo.')
      } finally {
        setLoading(false)
      }
    },
    [
      name,
      email,
      password,
      confirmPassword,
      validateName,
      validateEmail,
      validatePassword,
      validateConfirmPassword,
      router,
    ],
  )

  return (
    <main className="relative min-h-screen overflow-hidden">
      <DeepSpaceStarfield />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div
            className="rounded-[32px] p-8 md:p-10"
            style={{
              background: 'rgba(10, 10, 15, 0.6)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow:
                '0 0 0 1px rgba(255, 255, 255, 0.05) inset, 0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Logo */}
            <motion.div
              className="mb-8 flex flex-col items-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <KocmocLogoCompact size={90} />

              <motion.h1
                className="mt-4 text-[28px] font-light tracking-[0.25em]"
                style={{
                  color: PALETTE.white,
                  textShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
                }}
              >
                <span style={{ opacity: 0.7 }}>KOC</span>MOC
              </motion.h1>
              <p className="mt-1.5 text-xs tracking-[0.3em] text-white/35 uppercase">
                Crear Cuenta
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <GlassInput
                  type="text"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(v) => {
                    setName(v)
                    setNameError(null)
                  }}
                  icon={<User size={18} />}
                  error={nameError ?? undefined}
                  success={!!name && !nameError}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <GlassInput
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(v) => {
                    setEmail(v)
                    setEmailError(null)
                  }}
                  icon={<Mail size={18} />}
                  error={emailError ?? undefined}
                  success={!!email && !emailError}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <GlassInput
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(v) => {
                    setPassword(v)
                    setPasswordError(null)
                  }}
                  icon={<Lock size={18} />}
                  error={passwordError ?? undefined}
                  success={!!password && !passwordError}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <GlassInput
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(v) => {
                    setConfirmPassword(v)
                    setConfirmError(null)
                  }}
                  icon={<Lock size={18} />}
                  error={confirmError ?? undefined}
                  success={!!confirmPassword && !confirmError && confirmPassword === password}
                />
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                  >
                    <AlertCircle size={16} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-2"
              >
                <GlassButton type="submit" loading={loading}>
                  Crear Cuenta
                </GlassButton>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="pt-1 text-center"
              >
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/70"
                >
                  <User size={14} className="opacity-60 group-hover:opacity-100" />
                  ¿Ya tienes cuenta?{' '}
                  <span className="font-medium text-white/60 hover:text-white">Iniciar Sesión</span>
                </Link>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center"
            >
              <p className="text-xs tracking-wide text-white/25">
                Sistema de Gestión Financiera Premium
              </p>
              <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-white/15">
                <Sparkles size={10} className="text-white/40" />
                <span>Powered by Quantum AI</span>
                <Zap size={10} className="text-white/40" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
