// @ts-nocheck
/**
 * 🔐 CHRONOS LOGIN PAGE - LOGIN PREMIUM CINEMATOGRÁFICO
 * ═══════════════════════════════════════════════════════════════════════════
 * Página de autenticación con fondo animado de partículas,
 * logo orbital y formulario glassmorphism premium
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Eye, EyeOff, Fingerprint, Loader2, Lock, Mail } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChronosLogo } from './ChronosLogo'
import { CinematicOpening } from './CinematicOpening'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export interface ChronosLoginProps {
  onLogin?: (email: string, password: string) => Promise<void>
  onGoogleLogin?: () => Promise<void>
  onForgotPassword?: () => void
  showCinematic?: boolean
  logoSize?: number
}

// ═══════════════════════════════════════════════════════════════════════════
// FONDO DE PARTÍCULAS
// ═══════════════════════════════════════════════════════════════════════════

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const particles: {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }[] = []
    const stars: { x: number; y: number; size: number; twinkle: number }[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const init = () => {
      resize()
      particles.length = 0
      stars.length = 0

      // Partículas flotantes
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.1,
        })
      }

      // Estrellas de fondo
      for (let i = 0; i < 150; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.3,
          twinkle: Math.random() * Math.PI * 2,
        })
      }
    }

    const animate = () => {
      ctx.fillStyle = '#050510'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Dibujar estrellas
      const time = performance.now() * 0.001
      stars.forEach((star) => {
        const opacity = 0.3 + Math.sin(time * 0.5 + star.twinkle) * 0.3
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.fill()
      })

      // Dibujar partículas
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        // Wrap around
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`
        ctx.fill()

        // Glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        gradient.addColorStop(0, `rgba(139, 92, 246, ${p.opacity * 0.3})`)
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.fillRect(p.x - p.size * 4, p.y - p.size * 4, p.size * 8, p.size * 8)
      })

      // Líneas de conexión
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.05)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i]
          const p2 = particles[j]
          if (!p1 || !p2) continue
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.globalAlpha = ((120 - dist) / 120) * 0.3
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }
      }

      // Nebulosa gradient overlay
      const nebula = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height * 0.3,
        0,
        canvas.width / 2,
        canvas.height * 0.3,
        canvas.width * 0.6,
      )
      nebula.addColorStop(0, 'rgba(139, 92, 246, 0.03)')
      nebula.addColorStop(0.5, 'rgba(88, 28, 135, 0.02)')
      nebula.addColorStop(1, 'transparent')
      ctx.fillStyle = nebula
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationId = requestAnimationFrame(animate)
    }

    init()
    animate()

    window.addEventListener('resize', () => {
      resize()
      init()
    })

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 h-full w-full" />
}

// ═══════════════════════════════════════════════════════════════════════════
// INPUT PREMIUM
// ═══════════════════════════════════════════════════════════════════════════

interface PremiumInputProps {
  type: 'email' | 'password' | 'text'
  placeholder: string
  value: string
  onChange: (value: string) => void
  icon: React.ReactNode
  error?: string
  disabled?: boolean
}

function PremiumInput({
  type,
  placeholder,
  value,
  onChange,
  icon,
  error,
  disabled,
}: PremiumInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <motion.div
      className="relative"
      animate={{ scale: isFocused ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div
        className={`relative flex items-center gap-3 rounded-xl border px-4 py-4 backdrop-blur-xl transition-all duration-300 ${
          isFocused
            ? 'border-purple-500/50 bg-white/10 shadow-lg shadow-purple-500/10'
            : 'border-white/10 bg-white/5 hover:border-white/20'
        } ${error ? 'border-red-500/50' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : ''} `}
      >
        <span className={`transition-colors ${isFocused ? 'text-purple-400' : 'text-white/40'}`}>
          {icon}
        </span>

        <input
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm tracking-wide text-white outline-none placeholder:text-white/30"
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-white/40 transition-colors hover:text-white/70"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {/* Focus glow effect */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-xl bg-purple-500/20 blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            className="absolute -bottom-5 left-0 text-xs text-red-400"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export function ChronosLogin({
  onLogin,
  onGoogleLogin,
  onForgotPassword,
  showCinematic = true,
  logoSize = 180,
}: ChronosLoginProps) {
  const [showIntro, setShowIntro] = useState(showCinematic)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')

      if (!email || !password) {
        setError('Por favor completa todos los campos')
        return
      }

      setIsLoading(true)
      try {
        await onLogin?.(email, password)
      } catch (err) {
        setError('Credenciales inválidas')
      } finally {
        setIsLoading(false)
      }
    },
    [email, password, onLogin],
  )

  const handleGoogleLogin = useCallback(async () => {
    setIsLoading(true)
    try {
      await onGoogleLogin?.()
    } catch (err) {
      setError('Error al iniciar sesión con Google')
    } finally {
      setIsLoading(false)
    }
  }, [onGoogleLogin])

  if (!mounted) return null

  return (
    <>
      {/* Cinematográfica de apertura */}
      <AnimatePresence>
        {showIntro && (
          <CinematicOpening
            onComplete={() => setShowIntro(false)}
            duration={5000}
            skipEnabled={true}
          />
        )}
      </AnimatePresence>

      {/* Página de Login */}
      <AnimatePresence>
        {!showIntro && (
          <motion.div
            className="flex min-h-screen w-full items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <ParticleBackground />

            {/* Contenedor principal */}
            <motion.div
              className="w-full max-w-md"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
            >
              {/* Logo */}
              <motion.div
                className="mb-8 flex justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <ChronosLogo
                  size={logoSize}
                  animated={true}
                  showText={true}
                  variant="full"
                  theme="dark"
                />
              </motion.div>

              {/* Card de Login */}
              <motion.div
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 shadow-2xl shadow-black/50 backdrop-blur-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {/* Glow decorativo */}
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-violet-600/10 blur-3xl" />

                {/* Título */}
                <div className="relative z-10 mb-8 text-center">
                  <h2 className="mb-2 text-2xl font-light tracking-wide text-white">Bienvenido</h2>
                  <p className="text-sm text-white/40">Ingresa a tu cuenta para continuar</p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                  <PremiumInput
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={setEmail}
                    icon={<Mail size={18} />}
                    disabled={isLoading}
                  />

                  <PremiumInput
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={setPassword}
                    icon={<Lock size={18} />}
                    disabled={isLoading}
                  />

                  {/* Error global */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className="rounded-lg border border-red-500/20 bg-red-500/10 p-3"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <p className="text-center text-sm text-red-400">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Olvidé contraseña */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="text-sm text-white/40 transition-colors hover:text-purple-400"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  {/* Botón Submit */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-4 font-medium text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:from-purple-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <span>Iniciar Sesión</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="relative z-10 my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="text-xs tracking-widest text-white/30 uppercase">
                    o continúa con
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>

                {/* Botones sociales */}
                <div className="relative z-10 grid grid-cols-2 gap-4">
                  <motion.button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white/70 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Google</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white/70 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Fingerprint size={20} />
                    <span>Biométrico</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Footer */}
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <p className="text-xs tracking-wide text-white/30">
                  © 2026 CHRONOS · Sistema de Gestión Empresarial
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChronosLogin

