/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔐 CHRONOS FORGOT PASSWORD PAGE — QUANTUM RECOVERY GATEWAY
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Página de recuperación de contraseña premium con:
 * - Glassmorphism Gen-5 auténtico
 * - Sistema de partículas cósmicas
 * - Transiciones cinematográficas
 * - Seguridad enterprise-grade
 * - Feedback visual en tiempo real
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { KocmocLogoCompact } from '@/app/_components/chronos-2026/branding/KocmocLogo'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Mail,
  Shield,
  Sparkles,
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
      const count = 400
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

      if (star.size > 1.5) {
        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.size * 3
        )
        gradient.addColorStop(0, star.color.replace('1)', `${alpha})`))
        gradient.addColorStop(0.5, star.color.replace('1)', `${alpha * 0.3})`))
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
      } else {
        ctx.fillStyle = star.color.replace('1)', `${alpha})`)
      }
      ctx.fill()
    }

    const animate = () => {
      time += 0.016
      ctx.fillStyle = PALETTE.void
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (const star of stars) {
        drawStar(star)
      }

      animationId = requestAnimationFrame(animate)
    }

    resize()
    createStars()
    animate()

    window.addEventListener('resize', () => {
      resize()
      createStars()
    })

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASSMORPHIC INPUT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlassInputProps {
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  icon?: React.ReactNode
  error?: string
  disabled?: boolean
  autoFocus?: boolean
}

function GlassInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  error,
  disabled,
  autoFocus,
}: GlassInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="relative">
      <div
        className={`
          relative flex items-center overflow-hidden rounded-xl
          border backdrop-blur-xl transition-all duration-300
          ${isFocused ? 'border-violet-500/50 bg-white/10 shadow-lg shadow-violet-500/20' : 'border-white/10 bg-white/5'}
          ${error ? 'border-red-500/50' : ''}
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        {icon && <span className="pl-4 text-white/40">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          autoFocus={autoFocus}
          className="w-full bg-transparent py-4 pr-4 pl-3 text-white placeholder:text-white/30 focus:outline-none"
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-1.5 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN FORGOT PASSWORD PAGE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type PageState = 'form' | 'sending' | 'success' | 'error'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [pageState, setPageState] = useState<PageState>('form')
  const [errorMessage, setErrorMessage] = useState('')

  // Email validation
  const validateEmail = useCallback((value: string): string => {
    if (!value.trim()) return 'El email es requerido'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return 'Email inválido'
    return ''
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // Validate
      const error = validateEmail(email)
      setEmailError(error)
      if (error) return

      setPageState('sending')

      try {
        // Simular envío de email (en producción, llamar a API real)
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // En producción, aquí iría la llamada a la API:
        // const response = await fetch('/api/auth/forgot-password', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ email }),
        // })
        // if (!response.ok) throw new Error('Error al enviar email')

        setPageState('success')
      } catch {
        setErrorMessage('No se pudo enviar el email. Por favor, intenta de nuevo.')
        setPageState('error')
      }
    },
    [email, validateEmail]
  )

  // Reset form
  const handleRetry = useCallback(() => {
    setPageState('form')
    setErrorMessage('')
    setEmail('')
    setEmailError('')
  }, [])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background */}
      <DeepSpaceStarfield />

      {/* Gradient overlays */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-[500px] w-[500px] translate-x-1/4 translate-y-1/4 rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glass card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-2xl">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
          </div>

          <div className="relative z-10">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <Link href="/" className="transition-transform hover:scale-105">
                <KocmocLogoCompact size="lg" />
              </Link>
            </div>

            {/* Title */}
            <div className="mb-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-2 flex items-center justify-center gap-2"
              >
                <Shield className="h-5 w-5 text-violet-400" />
                <h1 className="bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-2xl font-medium tracking-tight text-transparent">
                  Recuperar Contraseña
                </h1>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-white/50"
              >
                {pageState === 'form' && 'Ingresa tu email para recibir instrucciones'}
                {pageState === 'sending' && 'Enviando instrucciones...'}
                {pageState === 'success' && '¡Email enviado exitosamente!'}
                {pageState === 'error' && 'Ocurrió un error'}
              </motion.p>
            </div>

            <AnimatePresence mode="wait">
              {/* Form State */}
              {pageState === 'form' && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <GlassInput
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(v) => {
                      setEmail(v)
                      if (emailError) setEmailError(validateEmail(v))
                    }}
                    icon={<Mail size={18} />}
                    error={emailError}
                    autoFocus
                  />

                  {/* Info box */}
                  <div className="flex items-start gap-3 rounded-xl bg-violet-500/10 p-4 text-sm text-violet-200/80">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                    <p>
                      Te enviaremos un enlace seguro para restablecer tu contraseña. El enlace
                      expira en 24 horas.
                    </p>
                  </div>

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30"
                  >
                    <span>Enviar Instrucciones</span>
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </motion.button>
                </motion.form>
              )}

              {/* Sending State */}
              {pageState === 'sending' && (
                <motion.div
                  key="sending"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center py-8"
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/30" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600">
                      <Loader2 className="h-10 w-10 animate-spin text-white" />
                    </div>
                  </div>
                  <p className="text-white/60">Procesando tu solicitud...</p>
                </motion.div>
              )}

              {/* Success State */}
              {pageState === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="relative mb-6"
                  >
                    <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/30" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                      <Check className="h-10 w-10 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="mb-2 text-lg font-medium text-white">¡Revisa tu correo!</h3>
                  <p className="mb-6 text-center text-sm text-white/60">
                    Hemos enviado las instrucciones a <br />
                    <span className="font-medium text-violet-400">{email}</span>
                  </p>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 text-violet-400 transition-colors hover:text-violet-300"
                  >
                    <ArrowLeft size={16} />
                    <span>Volver al login</span>
                  </Link>
                </motion.div>
              )}

              {/* Error State */}
              {pageState === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="relative mb-6"
                  >
                    <div className="absolute inset-0 animate-pulse rounded-full bg-red-500/30" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-600">
                      <AlertCircle className="h-10 w-10 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="mb-2 text-lg font-medium text-white">Error al enviar</h3>
                  <p className="mb-6 text-center text-sm text-white/60">{errorMessage}</p>
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-white transition-colors hover:bg-white/20"
                  >
                    <span>Intentar de nuevo</span>
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back to login link */}
            {pageState === 'form' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 text-center"
              >
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
                >
                  <ArrowLeft
                    size={14}
                    className="transition-transform group-hover:-translate-x-1"
                  />
                  <span>Volver al inicio de sesión</span>
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-xs text-white/30"
        >
          © 2026 CHRONOS. Sistema de Gestión Empresarial Premium.
        </motion.p>
      </motion.div>
    </div>
  )
}
