/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 QUANTUM LOGIN — ULTRA-PREMIUM GEN5 GLASS AUTHENTICATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Login PREMIUM con:
 * - Logo CHRONOS con partículas (K central)
 * - ΧΡΟΝΟΣ en tipografía griega
 * - Glassmorphism Gen-5 REAL (fondo completamente visible)
 * - Botones elegantes blancos/transparentes
 * - Opciones de login y registro
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { KocmocLogoCompact } from '@/app/_components/chronos-2026/branding/KocmocLogo'
import { useAuth } from '@/app/providers/AuthProvider'
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
import React, { useCallback, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const PALETTE = {
  black: '#000000',
  violet: '#8B00FF',
  violetGlow: 'rgba(139, 0, 255, 0.4)',
  gold: '#FFD700',
  goldGlow: 'rgba(255, 215, 0, 0.4)',
  plasma: '#FF1493',
  plasmaGlow: 'rgba(255, 20, 147, 0.4)',
  emerald: '#00FF88',
  white: '#FFFFFF',
  error: '#FF4444',
}

const SPRING_CONFIG = { stiffness: 300, damping: 30 }

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ANIMATED BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function _QuantumBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Base void */}
      <div className="absolute inset-0 bg-black" />

      {/* Animated orbs */}
      <motion.div
        className="pointer-events-none absolute h-[1000px] w-[1000px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${PALETTE.violetGlow} 0%, rgba(139,0,255,0.1) 40%, transparent 70%)`,
          left: '-25%',
          top: '-20%',
          filter: 'blur(80px)',
        }}
        animate={{
          x: [0, 150, -80, 0],
          y: [0, 80, -60, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="pointer-events-none absolute h-[800px] w-[800px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${PALETTE.goldGlow} 0%, rgba(255,215,0,0.1) 40%, transparent 70%)`,
          right: '-20%',
          bottom: '-15%',
          filter: 'blur(100px)',
        }}
        animate={{
          x: [0, -120, 60, 0],
          y: [0, -60, 80, 0],
          scale: [1, 0.85, 1.1, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="pointer-events-none absolute h-[600px] w-[600px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${PALETTE.plasmaGlow} 0%, transparent 60%)`,
          left: '40%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(120px)',
        }}
        animate={{
          scale: [0.9, 1.2, 0.85, 0.9],
          opacity: [0.4, 0.7, 0.3, 0.4],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(${PALETTE.violet}50 1px, transparent 1px),
            linear-gradient(90deg, ${PALETTE.violet}50 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
        }}
      />
    </div>
  )
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
  const inputType = isPassword && showPassword ? 'text' : type

  const borderColor = error
    ? PALETTE.error
    : success
      ? PALETTE.emerald
      : focused
        ? 'rgba(139, 0, 255, 0.5)'
        : 'rgba(255,255,255,0.06)'

  return (
    <motion.div
      className="relative"
      initial={false}
      animate={{
        scale: focused ? 1.01 : 1,
      }}
      transition={SPRING_CONFIG}
    >
      <div
        className="relative flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-300"
        style={{
          background: focused ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${borderColor}`,
          boxShadow: focused ? '0 0 25px rgba(139,0,255,0.15)' : 'none',
        }}
      >
        <motion.div
          animate={{
            color: focused ? 'rgba(139, 0, 255, 0.9)' : 'rgba(255,255,255,0.35)',
            scale: focused ? 1.05 : 1,
          }}
          transition={SPRING_CONFIG}
        >
          {icon}
        </motion.div>

        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
        />

        {isPassword && (
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={showPassword}
            className="text-white/35 transition-colors hover:text-white/60"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showPassword ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </motion.button>
        )}

        {success && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400/80">
            <Check size={18} />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-6 left-0 flex items-center gap-1 text-xs text-red-400/90"
          >
            <AlertCircle size={12} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS BUTTON
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlassButtonProps {
  children: React.ReactNode
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
}

function GlassButton({ children, onClick, loading, disabled, type = 'button' }: GlassButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="group relative w-full overflow-hidden rounded-2xl px-6 py-4 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
      whileHover={{
        scale: disabled ? 1 : 1.02,
        background: 'rgba(255, 255, 255, 0.12)',
        borderColor: 'rgba(139, 0, 255, 0.5)',
        boxShadow: '0 12px 40px rgba(139, 0, 255, 0.2)',
      }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={SPRING_CONFIG}
    >
      {/* Subtle shimmer */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      />

      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            {children}
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight size={18} />
            </motion.span>
          </>
        )}
      </span>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface QuantumLoginProps {
  onSuccess?: () => void
}

export function QuantumLogin({ onSuccess }: QuantumLoginProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const emailErr = validateEmail(email)
      const passErr = validatePassword(password)

      setEmailError(emailErr)
      setPasswordError(passErr)

      if (emailErr || passErr) return

      setLoading(true)
      setError(null)

      try {
        // Usar el AuthProvider para autenticar
        await signIn(email, password)

        // Esperar un momento para que se guarde la sesión
        await new Promise((resolve) => setTimeout(resolve, 500))

        onSuccess?.()
      } catch (error) {
        setError('Error al iniciar sesión. Verifica tus credenciales.')
      } finally {
        setLoading(false)
      }
    },
    [email, password, validateEmail, validatePassword, onSuccess],
  )

  return (
    <div className="relative flex items-center justify-center p-4">
      {/* Login Card - GLASS GEN5 REAL */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glass card - TRANSPARENCIA REAL */}
        <div
          className="rounded-[32px] p-8 md:p-10"
          style={{
            background: 'rgba(20, 20, 25, 0.45)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: `
              0 0 0 1px rgba(255, 255, 255, 0.05) inset,
              0 25px 50px -12px rgba(0, 0, 0, 0.5),
              0 0 100px rgba(139, 0, 255, 0.1)
            `,
          }}
        >
          {/* Logo */}
          <motion.div
            className="mb-8 flex flex-col items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <KocmocLogoCompact size={140} />

            {/* KOCMOC - Título elegante */}
            <motion.h1
              className="mt-4 text-[28px] font-light tracking-[0.4em]"
              style={{
                color: PALETTE.white,
                textShadow: '0 0 30px rgba(255, 255, 255, 0.2)',
              }}
            >
              KOCMOC
            </motion.h1>
            <p className="mt-1.5 text-xs tracking-[0.25em] text-white/30 uppercase">
              Quantum System
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
              transition={{ delay: 0.4 }}
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

            {/* Error message */}
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

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-2"
            >
              <GlassButton type="submit" loading={loading}>
                Iniciar Sesión
              </GlassButton>
            </motion.div>

            {/* Register link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="pt-1 text-center"
            >
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/70"
              >
                <User size={14} className="opacity-60 group-hover:opacity-100" />
                ¿No tienes cuenta?{' '}
                <span className="font-medium text-violet-400/80 hover:text-violet-300">
                  Registrarse
                </span>
              </Link>
            </motion.div>
          </form>

          {/* Footer */}
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
              <Sparkles size={10} className="text-violet-500/60" />
              <span>Powered by AI</span>
              <Zap size={10} className="text-amber-500/60" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default QuantumLogin
