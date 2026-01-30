/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔐 KOCMOC AUTH GATEWAY — SILVER SPACE PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de autenticación premium integrado con Clerk:
 * - Diseño Silver Space (Plata/Negro/Blanco)
 * - Login y Register con estilos consistentes
 * - Integración directa con Clerk
 * - Micro-interacciones elegantes
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { useSignIn, useSignUp } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'motion/react'
import { memo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
  Shield,
} from 'lucide-react'
import Link from 'next/link'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COLORES SILVER SPACE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const SILVER_COLORS = {
  absoluteBlack: '#000000',
  void: '#030305',
  silverMirror: '#C0C0C0',
  silverLight: '#E8E8E8',
  silverDark: '#8A8A8A',
  pureWhite: '#FFFFFF',
  softWhite: 'rgba(255, 255, 255, 0.9)',
  glass: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glassHover: 'rgba(255, 255, 255, 0.12)',
  success: '#10B981',
  error: '#EF4444',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SILVER INPUT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SilverInputProps {
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  icon?: React.ElementType
  error?: string
  disabled?: boolean
  showPasswordToggle?: boolean
}

const SilverInput = memo(function SilverInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  disabled = false,
  showPasswordToggle = false,
}: SilverInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const inputType = showPasswordToggle && showPassword ? 'text' : type

  return (
    <div className="space-y-2">
      <motion.div
        className={cn(
          'relative flex items-center gap-3',
          'rounded-xl border px-4 py-3',
          'bg-white/[0.04] backdrop-blur-xl',
          'transition-all duration-200',
          isFocused && 'border-white/30 bg-white/[0.08]',
          !isFocused && 'border-white/[0.08]',
          error && 'border-red-500/50',
          disabled && 'opacity-50 pointer-events-none'
        )}
        animate={{
          boxShadow: isFocused
            ? '0 0 20px rgba(192, 192, 192, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.02)'
            : 'none',
        }}
      >
        {Icon && (
          <Icon
            className={cn(
              'w-5 h-5 flex-shrink-0 transition-colors',
              isFocused ? 'text-white/70' : 'text-white/40'
            )}
          />
        )}

        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={cn(
            'flex-1 bg-transparent outline-none',
            'text-white placeholder-white/30',
            'text-sm font-medium'
          )}
        />

        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}

        {value && !error && (
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        )}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-red-400 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SILVER BUTTON
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SilverButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
  disabled?: boolean
  icon?: React.ElementType
  className?: string
}

const SilverButton = memo(function SilverButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  icon: Icon,
  className,
}: SilverButtonProps) {
  const isPrimary = variant === 'primary'
  const isSecondary = variant === 'secondary'

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'relative w-full flex items-center justify-center gap-2',
        'rounded-xl font-semibold text-sm',
        'transition-all duration-200',
        'disabled:opacity-50 disabled:pointer-events-none',
        isPrimary && [
          'py-3.5 px-6',
          'bg-white text-black',
          'hover:bg-white/90',
          'shadow-[0_4px_20px_rgba(255,255,255,0.15)]',
        ],
        isSecondary && [
          'py-3.5 px-6',
          'bg-white/[0.08] text-white border border-white/[0.1]',
          'hover:bg-white/[0.12]',
        ],
        variant === 'ghost' && [
          'py-2 px-4',
          'text-white/60 hover:text-white',
        ],
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.99 }}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          {children}
        </>
      )}
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// KOCMOC AUTH FORM - LOGIN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface KocmocLoginFormProps {
  onSuccess?: () => void
  onSignUpClick?: () => void
}

export const KocmocLoginForm = memo(function KocmocLoginForm({
  onSuccess,
  onSignUpClick,
}: KocmocLoginFormProps) {
  const router = useRouter()
  const { isLoaded, signIn, setActive } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return

    setIsLoading(true)
    setError('')

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        onSuccess?.()
        router.push('/dashboard')
      } else {
        setError('Verificación adicional requerida')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      const errorMessage = err.errors?.[0]?.message || 'Credenciales inválidas'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [isLoaded, signIn, email, password, setActive, onSuccess, router])

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Card */}
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl',
          'bg-white/[0.04] backdrop-blur-2xl',
          'border border-white/[0.08]',
          'shadow-[0_8px_40px_rgba(0,0,0,0.4)]',
          'p-8'
        )}
      >
        {/* Top shine */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.08] mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Shield className="w-7 h-7 text-white/80" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Bienvenido</h1>
          <p className="text-white/50 text-sm">Ingresa a tu cuenta CHRONOS</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <SilverInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={setEmail}
            icon={Mail}
            disabled={isLoading}
          />

          <SilverInput
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={setPassword}
            icon={Lock}
            disabled={isLoading}
            showPasswordToggle
          />

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <div className="pt-2">
            <SilverButton
              type="submit"
              variant="primary"
              loading={isLoading}
              icon={ArrowRight}
            >
              Iniciar Sesión
            </SilverButton>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-xs text-white/30 bg-[#030305]">o</span>
          </div>
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-white/40 text-sm">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSignUpClick || (() => router.push('/register'))}
              className="text-white font-medium hover:underline underline-offset-4"
            >
              Crear cuenta
            </button>
          </p>
        </div>

        {/* Forgot password */}
        <div className="text-center mt-4">
          <Link
            href="/forgot-password"
            className="text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>

      {/* Security badge */}
      <motion.div
        className="flex items-center justify-center gap-2 mt-6 text-white/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Lock className="w-3 h-3" />
        <span className="text-[10px] tracking-wider uppercase">Conexión Segura SSL</span>
      </motion.div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// KOCMOC AUTH FORM - REGISTER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface KocmocRegisterFormProps {
  onSuccess?: () => void
  onSignInClick?: () => void
}

export const KocmocRegisterForm = memo(function KocmocRegisterForm({
  onSuccess,
  onSignInClick,
}: KocmocRegisterFormProps) {
  const router = useRouter()
  const { isLoaded, signUp, setActive } = useSignUp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return

    setIsLoading(true)
    setError('')

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || undefined,
      })

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err: any) {
      console.error('Register error:', err)
      const errorMessage = err.errors?.[0]?.message || 'Error al crear la cuenta'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [isLoaded, signUp, email, password, name])

  const handleVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return

    setIsLoading(true)
    setError('')

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        onSuccess?.()
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Verification error:', err)
      const errorMessage = err.errors?.[0]?.message || 'Código inválido'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [isLoaded, signUp, verificationCode, setActive, onSuccess, router])

  // Verification screen
  if (pendingVerification) {
    return (
      <motion.div
        className="w-full max-w-md mx-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-3xl',
            'bg-white/[0.04] backdrop-blur-2xl',
            'border border-white/[0.08]',
            'shadow-[0_8px_40px_rgba(0,0,0,0.4)]',
            'p-8'
          )}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Mail className="w-7 h-7 text-emerald-400" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Verifica tu Email</h1>
            <p className="text-white/50 text-sm">
              Enviamos un código a <span className="text-white">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <SilverInput
              type="text"
              placeholder="Código de verificación"
              value={verificationCode}
              onChange={setVerificationCode}
              icon={Shield}
              disabled={isLoading}
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                >
                  <p className="text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <SilverButton type="submit" variant="primary" loading={isLoading}>
              Verificar Código
            </SilverButton>
          </form>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl',
          'bg-white/[0.04] backdrop-blur-2xl',
          'border border-white/[0.08]',
          'shadow-[0_8px_40px_rgba(0,0,0,0.4)]',
          'p-8'
        )}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.08] mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Sparkles className="w-7 h-7 text-white/80" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Crear Cuenta</h1>
          <p className="text-white/50 text-sm">Únete a CHRONOS INFINITY</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <SilverInput
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={setName}
            icon={User}
            disabled={isLoading}
          />

          <SilverInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={setEmail}
            icon={Mail}
            disabled={isLoading}
          />

          <SilverInput
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={setPassword}
            icon={Lock}
            disabled={isLoading}
            showPasswordToggle
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-2">
            <SilverButton type="submit" variant="primary" loading={isLoading} icon={ArrowRight}>
              Crear Cuenta
            </SilverButton>
          </div>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-xs text-white/30 bg-[#030305]">o</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-white/40 text-sm">
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSignInClick || (() => router.push('/login'))}
              className="text-white font-medium hover:underline underline-offset-4"
            >
              Iniciar Sesión
            </button>
          </p>
        </div>
      </div>

      <motion.div
        className="flex items-center justify-center gap-2 mt-6 text-white/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Shield className="w-3 h-3" />
        <span className="text-[10px] tracking-wider uppercase">Datos Protegidos</span>
      </motion.div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { SilverInput, SilverButton, SILVER_COLORS }
