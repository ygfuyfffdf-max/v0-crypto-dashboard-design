"use client"

/**
 * 🚀 ULTRA LOGIN - Sistema de Login Avanzado con Animaciones Premium
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { AnimatePresence, motion } from "framer-motion"
import { Eye, EyeOff, Lock, Mail, Sparkles, Zap } from "lucide-react"
import { useState } from "react"

export interface UltraLoginProps {
  onLogin?: (credentials: { email: string; password: string }) => Promise<void>
  onRegister?: () => void
  onForgotPassword?: () => void
  className?: string
  showParticles?: boolean
}

export function UltraLogin({
  onLogin,
  onRegister,
  onForgotPassword,
  className = "",
  showParticles = true,
}: UltraLoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onLogin) return

    setIsLoading(true)
    setError(null)

    try {
      await onLogin({ email, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`relative min-h-screen w-full overflow-hidden bg-gray-950 ${className}`}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-gray-900 to-indigo-950/50" />

        {/* Animated Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            {/* Glow Effect */}
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-violet-500/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-indigo-500/30 blur-3xl" />

            <div className="relative z-10">
              {/* Logo */}
              <div className="mb-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500"
                >
                  <Zap className="h-8 w-8 text-white" />
                </motion.div>
                <h1 className="bg-gradient-to-r from-white via-violet-200 to-indigo-200 bg-clip-text text-3xl font-bold text-transparent">
                  CHRONOS INFINITY
                </h1>
                <p className="mt-2 text-sm text-gray-400">Sistema Financiero Premium</p>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div className="group relative">
                  <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-violet-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pr-4 pl-12 text-white placeholder-gray-500 ring-0 transition-all outline-none focus:border-violet-500/50 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="group relative">
                  <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-violet-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pr-12 pl-12 text-white placeholder-gray-500 ring-0 transition-all outline-none focus:border-violet-500/50 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 transition-colors hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Forgot Password */}
                {onForgotPassword && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="text-sm text-gray-400 transition-colors hover:text-violet-400"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 py-4 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/40 disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                      />
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Iniciar Sesión
                      </>
                    )}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.button>
              </form>

              {/* Register Link */}
              {onRegister && (
                <p className="mt-6 text-center text-sm text-gray-400">
                  ¿No tienes cuenta?{" "}
                  <button
                    onClick={onRegister}
                    className="font-medium text-violet-400 transition-colors hover:text-violet-300"
                  >
                    Regístrate
                  </button>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
