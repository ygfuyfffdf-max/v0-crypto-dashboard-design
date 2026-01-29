'use client'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎨 SHOWCASE ULTRA PREMIUM COMPONENTS - CHRONOS 2026
// ═══════════════════════════════════════════════════════════════════════════════════════
// Página de demostración de todos los componentes ultra-premium
// con animaciones cinematográficas y efectos avanzados
// ═══════════════════════════════════════════════════════════════════════════════════════

import { motion } from 'motion/react'
import { Heart, Lock, Mail, Rocket, Sparkles, Star, User, Zap } from 'lucide-react'
import { useState } from 'react'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  UltraPremiumButton,
  UltraPremiumCard,
  UltraPremiumInput,
  UltraPremiumTextarea,
} from './index'

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

export function UltraPremiumShowcase() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* ═══════════════════ ANIMATED BACKGROUND ═══════════════════ */}
      <div className="absolute inset-0 -z-10">
        {/* Nebula Blobs */}
        <div className="animate-nebula-swirl absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-indigo-500/20 blur-3xl" />
        <div className="animate-nebula-swirl animation-delay-2000 absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-pink-500/20 blur-3xl" />
      </div>

      {/* ═══════════════════ CONTENT ═══════════════════ */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="mb-4 text-6xl font-bold text-white">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent animate-gradient">
              Ultra Premium Components
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            Componentes cinematográficos de nivel enterprise con animaciones avanzadas
          </p>
        </motion.div>

        {/* ═══════════════════ BUTTONS SECTION ═══════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="mb-8 text-3xl font-bold text-white">Botones Premium</h2>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Botones Variantes */}
            <UltraPremiumCard>
              <CardHeader>
                <CardTitle>Variantes de Botones</CardTitle>
                <CardDescription>
                  Diferentes estilos con ripple effect y shimmer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <UltraPremiumButton variant="primary" icon={Sparkles} size="lg">
                    Primary Button
                  </UltraPremiumButton>

                  <UltraPremiumButton variant="secondary" icon={Rocket}>
                    Secondary Button
                  </UltraPremiumButton>

                  <UltraPremiumButton variant="danger" icon={Zap}>
                    Danger Button
                  </UltraPremiumButton>

                  <UltraPremiumButton variant="gold" icon={Star}>
                    Gold Button
                  </UltraPremiumButton>

                  <UltraPremiumButton variant="success" icon={Heart}>
                    Success Button
                  </UltraPremiumButton>

                  <UltraPremiumButton variant="ghost">Ghost Button</UltraPremiumButton>
                </div>
              </CardContent>
            </UltraPremiumCard>

            {/* Botones con Efectos Especiales */}
            <UltraPremiumCard variant="neon" hover="glow">
              <CardHeader>
                <CardTitle>Efectos Especiales</CardTitle>
                <CardDescription>Energy pulse y chromatic aberration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <UltraPremiumButton
                    variant="primary"
                    energyPulse
                    icon={Zap}
                    size="lg"
                  >
                    Energy Pulse Active
                  </UltraPremiumButton>

                  <UltraPremiumButton variant="secondary" chromatic icon={Sparkles}>
                    Chromatic Aberration
                  </UltraPremiumButton>

                  <UltraPremiumButton
                    variant="primary"
                    loading
                    icon={Rocket}
                  >
                    Loading State
                  </UltraPremiumButton>

                  <UltraPremiumButton
                    variant="gold"
                    shimmer={false}
                    ripple={false}
                  >
                    Without Effects
                  </UltraPremiumButton>

                  <UltraPremiumButton
                    variant="danger"
                    size="xl"
                    icon={Heart}
                    iconPosition="right"
                  >
                    Icon Right Large
                  </UltraPremiumButton>

                  <UltraPremiumButton variant="primary" size="sm">
                    Small Size
                  </UltraPremiumButton>
                </div>
              </CardContent>
            </UltraPremiumCard>
          </div>
        </motion.section>

        {/* ═══════════════════ CARDS SECTION ═══════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="mb-8 text-3xl font-bold text-white">Cards Premium</h2>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card Default */}
            <UltraPremiumCard variant="default" hover="lift">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Con hover lift effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Card con glassmorphism y animación de elevación al pasar el cursor.
                </p>
              </CardContent>
            </UltraPremiumCard>

            {/* Card Glassmorphic */}
            <UltraPremiumCard variant="glassmorphic" hover="glow">
              <CardHeader>
                <CardTitle>Glassmorphic</CardTitle>
                <CardDescription>Con glow effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Glassmorphism GEN5 con aurora background y scan line.
                </p>
              </CardContent>
            </UltraPremiumCard>

            {/* Card Neon */}
            <UltraPremiumCard variant="neon" hover="scale" energyBorder>
              <CardHeader>
                <CardTitle>Neon Card</CardTitle>
                <CardDescription>Con energy border</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Card con borde de energía pulsante y efecto neón.
                </p>
              </CardContent>
            </UltraPremiumCard>
          </div>

          {/* Card con Parallax */}
          <div className="mt-6">
            <UltraPremiumCard
              variant="holographic"
              hover="lift"
              parallax
              chromatic
              className="p-8"
            >
              <div className="text-center">
                <Sparkles className="mx-auto mb-4 h-12 w-12 text-violet-400" />
                <h3 className="mb-2 text-3xl font-bold text-white">
                  Card con Parallax 3D
                </h3>
                <p className="mb-6 text-gray-400">
                  Efecto de flotación parallax + chromatic aberration al hover
                </p>
                <UltraPremiumButton variant="primary" icon={Star} size="lg">
                  Explorar Más
                </UltraPremiumButton>
              </div>
            </UltraPremiumCard>
          </div>
        </motion.section>

        {/* ═══════════════════ INPUTS SECTION ═══════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="mb-8 text-3xl font-bold text-white">Inputs Premium</h2>

          <UltraPremiumCard className="p-8">
            <div className="mx-auto max-w-2xl space-y-6">
              <h3 className="mb-6 text-2xl font-bold text-white">
                Formulario de Registro
              </h3>

              {/* Input con Float Label */}
              <UltraPremiumInput
                label="Nombre de Usuario"
                placeholder="johndoe"
                icon={User}
                iconPosition="left"
                variant="glass"
              />

              {/* Input Email */}
              <UltraPremiumInput
                label="Correo Electrónico"
                type="email"
                placeholder="correo@ejemplo.com"
                icon={Mail}
                iconPosition="left"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                success={email.includes('@') && email.includes('.')}
                variant="glass"
              />

              {/* Input Password */}
              <UltraPremiumInput
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                iconPosition="left"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={password && password.length < 8 ? 'Mínimo 8 caracteres' : ''}
                variant="glass"
              />

              {/* Input con variante Neon */}
              <UltraPremiumInput
                label="Código de Invitación"
                placeholder="CHRONOS-2026"
                variant="neon"
              />

              {/* Textarea */}
              <UltraPremiumTextarea
                label="Mensaje"
                placeholder="Escribe tu mensaje aquí..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                variant="glass"
              />

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <UltraPremiumButton
                  variant="primary"
                  size="lg"
                  icon={Sparkles}
                  className="flex-1"
                  onClick={handleSubmit}
                >
                  Registrarse
                </UltraPremiumButton>

                <UltraPremiumButton variant="secondary" size="lg">
                  Cancelar
                </UltraPremiumButton>
              </div>

              {/* Success Message */}
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center text-green-400"
                >
                  ✓ ¡Registro exitoso! Bienvenido a CHRONOS 2026
                </motion.div>
              )}
            </div>
          </UltraPremiumCard>
        </motion.section>

        {/* ═══════════════════ FOOTER ═══════════════════ */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center text-gray-500"
        >
          <p>
            CHRONOS Ultra Premium Components 2026 · Diseñado con{' '}
            <Heart className="inline h-4 w-4 text-pink-500" /> por el equipo CHRONOS
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
