"use client"

/**
 * 🔐 CHRONOS LOGIN - Componente de Login Premium
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { motion } from "framer-motion"
import { Lock, Mail, Sparkles } from "lucide-react"
import { useState } from "react"

export interface ChronosLoginProps {
  onLogin?: (email: string, password: string) => Promise<void>
  className?: string
}

export function ChronosLogin({ onLogin, className = "" }: ChronosLoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onLogin) return
    setIsLoading(true)
    try {
      await onLogin(email, password)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-violet-950/30 to-gray-900 p-8 backdrop-blur-xl ${className}`}
    >
      {/* Background Effects */}
      <div className="bg-grid-white/5 absolute inset-0" />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative z-10">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-violet-400" />
          <h1 className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-3xl font-bold text-transparent">
            CHRONOS
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="group relative">
            <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-violet-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pr-4 pl-12 text-white placeholder-gray-500 transition-all outline-none focus:border-violet-500/50 focus:bg-white/10"
              required
            />
          </div>

          {/* Password */}
          <div className="group relative">
            <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-violet-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pr-4 pl-12 text-white placeholder-gray-500 transition-all outline-none focus:border-violet-500/50 focus:bg-white/10"
              required
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 py-4 font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-50"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mx-auto h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
              />
            ) : (
              "Iniciar Sesión"
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  )
}
