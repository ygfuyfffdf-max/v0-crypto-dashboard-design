// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔐 CHRONOS 2026 — ULTRA LOGIN SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de login cinematográfico con:
 * - Background 3D con partículas financieras
 * - Animaciones de transición fluidas
 * - Microinteracciones premium
 * - Validación en tiempo real
 * - Integración con Firebase Auth
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { Environment, Float, Stars } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { AnimatePresence, motion } from 'motion/react'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Chrome,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import * as THREE from 'three'
import { ChronosPostProcessing } from '../3d/effects/ChronosPostProcessing'
import { FinancialParticleSystem } from '../3d/engine/WebGPUComputeEngine'
import { UltraCinematicOpening } from './UltraCinematicOpening'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface UltraLoginProps {
  onLogin?: (email: string, password: string) => Promise<void>
  onGoogleLogin?: () => Promise<void>
  onForgotPassword?: (email: string) => void
  onCreateAccount?: () => void
  showCinematic?: boolean
  logoText?: string
  tagline?: string
}

interface FormState {
  email: string
  password: string
  rememberMe: boolean
}

interface ValidationState {
  email: boolean | null
  password: boolean | null
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACKGROUND 3D SCENE
// ═══════════════════════════════════════════════════════════════════════════════

function LoginBackground() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

      <Environment preset="night" />

      <Stars radius={50} depth={100} count={2000} factor={3} saturation={0} fade speed={0.5} />

      <FinancialParticleSystem
        count={10000}
        volatility={0.3}
        growth={0.8}
        colorProfit={new THREE.Color(0x8b5cf6)}
        colorLoss={new THREE.Color(0x3b82f6)}
      />

      <ChronosPostProcessing
        enabled
        quality="high"
        bloom={{ enabled: true, intensity: 0.8, luminanceThreshold: 0.4, luminanceSmoothing: 0.3 }}
        vignette={{ enabled: true, darkness: 0.5, offset: 0.3 }}
        chromatic={{ enabled: true, offset: 0.0005 }}
        filmGrain={{ enabled: true, intensity: 0.02 }}
      />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLOATING ORB LOGO
// ═══════════════════════════════════════════════════════════════════════════════

function FloatingLogo() {
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh>
        <icosahedronGeometry args={[0.5, 4]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
          wireframe
        />
      </mesh>
      <mesh scale={0.9}>
        <icosahedronGeometry args={[0.5, 2]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.3}
          transparent
          opacity={0.5}
        />
      </mesh>
    </Float>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface PremiumInputProps {
  type: 'email' | 'password' | 'text'
  value: string
  onChange: (value: string) => void
  placeholder: string
  icon: React.ReactNode
  isValid?: boolean | null
  errorMessage?: string
  disabled?: boolean
  autoComplete?: string
}

function PremiumInput({
  type,
  value,
  onChange,
  placeholder,
  icon,
  isValid,
  errorMessage,
  disabled,
  autoComplete,
}: PremiumInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <motion.div
      className="relative"
      animate={{
        scale: isFocused ? 1.02 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`relative flex items-center gap-3 rounded-xl border bg-white/5 px-4 py-3 backdrop-blur-xl transition-all duration-300 ${
          isFocused
            ? 'border-purple-500/50 shadow-lg shadow-purple-500/20'
            : isValid === false
              ? 'border-red-500/50'
              : isValid === true
                ? 'border-emerald-500/50'
                : 'border-white/10 hover:border-white/20'
        } `}
      >
        {/* Icon */}
        <div
          className={`transition-colors duration-300 ${
            isFocused ? 'text-purple-400' : 'text-white/40'
          }`}
        >
          {icon}
        </div>

        {/* Input */}
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className="flex-1 bg-transparent text-sm font-medium text-white placeholder-white/30 outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />

        {/* Password toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-white/40 transition-colors hover:text-white/60"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}

        {/* Validation indicator */}
        {isValid !== null && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={isValid ? 'text-emerald-400' : 'text-red-400'}
          >
            {isValid ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          </motion.div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {errorMessage && isValid === false && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 ml-4 text-xs text-red-400"
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LOGIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function UltraLogin({
  onLogin,
  onGoogleLogin,
  onForgotPassword,
  onCreateAccount,
  showCinematic = true,
  logoText = 'CHRONOS',
  tagline = 'FlowDistributor Ultra Premium',
}: UltraLoginProps) {
  const [showIntro, setShowIntro] = useState(showCinematic)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [validation, setValidation] = useState<ValidationState>({
    email: null,
    password: null,
  })
  const [loginSuccess, setLoginSuccess] = useState(false)

  // Email validation
  const validateEmail = useCallback((email: string) => {
    if (!email) return null
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }, [])

  // Password validation
  const validatePassword = useCallback((password: string) => {
    if (!password) return null
    return password.length >= 6
  }, [])

  // Update validation on input change
  useEffect(() => {
    setValidation({
      email: form.email ? validateEmail(form.email) : null,
      password: form.password ? validatePassword(form.password) : null,
    })
  }, [form.email, form.password, validateEmail, validatePassword])

  // Handle login
  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      if (!validateEmail(form.email) || !validatePassword(form.password)) {
        setError('Por favor, completa todos los campos correctamente')
        return
      }

      setIsLoading(true)

      try {
        await onLogin?.(form.email, form.password)
        setLoginSuccess(true)
      } catch (err) {
        setError('Credenciales inválidas. Intenta de nuevo.')
      } finally {
        setIsLoading(false)
      }
    },
    [form, onLogin, validateEmail, validatePassword],
  )

  // Handle Google login
  const handleGoogleLogin = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    try {
      await onGoogleLogin?.()
      setLoginSuccess(true)
    } catch (err) {
      setError('Error al iniciar sesión con Google')
    } finally {
      setIsLoading(false)
    }
  }, [onGoogleLogin])

  // Show intro cinematic
  if (showIntro) {
    return (
      <UltraCinematicOpening
        onComplete={() => setShowIntro(false)}
        duration={5000}
        logoText={logoText}
        tagline={tagline}
        theme="cosmic"
        skipEnabled
        showProgress
      />
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ antialias: true, alpha: false }}>
          <LoginBackground />
        </Canvas>
      </div>

      {/* Login Form Overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* 3D Logo Canvas */}
            <div className="mx-auto mb-4 h-24 w-24">
              <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[5, 5, 5]} intensity={1} />
                <FloatingLogo />
              </Canvas>
            </div>

            <h1 className="text-3xl font-bold tracking-wider text-white">{logoText}</h1>
            <p className="mt-1 text-sm tracking-widest text-white/50 uppercase">{tagline}</p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <PremiumInput
                type="email"
                value={form.email}
                onChange={(email) => setForm({ ...form, email })}
                placeholder="tu@email.com"
                icon={<Mail className="h-5 w-5" />}
                isValid={validation.email}
                errorMessage="Email inválido"
                disabled={isLoading}
                autoComplete="email"
              />

              {/* Password */}
              <PremiumInput
                type="password"
                value={form.password}
                onChange={(password) => setForm({ ...form, password })}
                placeholder="••••••••"
                icon={<Lock className="h-5 w-5" />}
                isValid={validation.password}
                errorMessage="Mínimo 6 caracteres"
                disabled={isLoading}
                autoComplete="current-password"
              />

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between text-sm">
                <label className="group flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                    className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/20"
                  />
                  <span className="text-white/50 transition-colors group-hover:text-white/70">
                    Recordarme
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => onForgotPassword?.(form.email)}
                  className="text-purple-400 transition-colors hover:text-purple-300"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={isLoading || loginSuccess}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium text-white transition-all duration-300 ${
                  loginSuccess
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500'
                } shadow-lg hover:shadow-xl hover:shadow-purple-500/25 disabled:cursor-not-allowed disabled:opacity-50`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : loginSuccess ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    ¡Bienvenido!
                  </>
                ) : (
                  <>
                    <KeyRound className="h-5 w-5" />
                    Iniciar Sesión
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs tracking-wider text-white/30 uppercase">o continúa con</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Social login */}
            <motion.button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition-all duration-300 hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Chrome className="h-5 w-5" />
              Google
            </motion.button>

            {/* Create account */}
            <p className="mt-6 text-center text-sm text-white/50">
              ¿No tienes cuenta?{' '}
              <button
                onClick={onCreateAccount}
                className="font-medium text-purple-400 transition-colors hover:text-purple-300"
              >
                Crear cuenta
              </button>
            </p>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="mt-6 text-center text-xs text-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            © 2025 Chronos FlowDistributor. Todos los derechos reservados.
          </motion.p>
        </motion.div>
      </div>

      {/* Ambient particles */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>
    </div>
  )
}

export default UltraLogin

