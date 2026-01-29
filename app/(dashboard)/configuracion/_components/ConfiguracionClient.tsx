'use client'

import { CinematicControls } from '@/app/_components/CinematicControls'
import { cn } from '@/app/_lib/utils'
import { motion } from 'motion/react'
import {
  Bell,
  Database,
  Film,
  KeyRound,
  Moon,
  Palette,
  Save,
  Shield,
  Smartphone,
  Sun,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const sections = [
  {
    id: 'perfil',
    title: 'Perfil',
    icon: User,
    description: 'Información de tu cuenta',
  },
  {
    id: 'cinematica',
    title: 'Cinematográfica',
    icon: Film,
    description: 'Control de intro KOCMOC',
  },
  {
    id: 'notificaciones',
    title: 'Notificaciones',
    icon: Bell,
    description: 'Preferencias de alertas',
  },
  {
    id: 'apariencia',
    title: 'Apariencia',
    icon: Palette,
    description: 'Tema y diseño visual',
  },
  {
    id: 'seguridad',
    title: 'Seguridad',
    icon: Shield,
    description: 'Contraseña y autenticación',
  },
  {
    id: 'datos',
    title: 'Datos',
    icon: Database,
    description: 'Respaldo y exportación',
  },
]

export function ConfiguracionClient() {
  const [activeSection, setActiveSection] = useState('perfil')
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    ventas: true,
    pagos: true,
  })

  const handleSave = () => {
    toast.success('Configuración guardada', {
      description: 'Tus preferencias han sido actualizadas',
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Sidebar Navigation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-1"
      >
        <nav className="space-y-1 rounded-2xl border border-white/5 bg-white/[0.02] p-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all',
                activeSection === section.id
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-muted-foreground hover:bg-white/5',
              )}
            >
              <section.icon className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">{section.title}</p>
                <p className="text-xs opacity-60">{section.description}</p>
              </div>
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 lg:col-span-3"
      >
        {activeSection === 'perfil' && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-xl font-semibold">Perfil de Usuario</h2>
              <div className="grid gap-4">
                <div>
                  <label className="text-muted-foreground text-sm">Nombre</label>
                  <input
                    type="text"
                    defaultValue="Administrador"
                    className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground text-sm">Email</label>
                  <input
                    type="email"
                    defaultValue="admin@chronos.com"
                    className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'cinematica' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Cinematográfica KOCMOC</h2>
            <CinematicControls />
          </div>
        )}

        {activeSection === 'notificaciones' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Notificaciones</h2>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4"
                >
                  <div>
                    <p className="font-medium capitalize">{key}</p>
                    <p className="text-muted-foreground text-xs">Recibir notificaciones de {key}</p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        [key]: !prev[key as keyof typeof notifications],
                      }))
                    }
                    className={cn(
                      'relative h-6 w-12 rounded-full transition-colors',
                      value ? 'bg-purple-500' : 'bg-white/10',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 h-4 w-4 rounded-full bg-white transition-transform',
                        value ? 'left-7' : 'left-1',
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'apariencia' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Apariencia</h2>
            <div className="grid grid-cols-3 gap-4">
              {(['dark', 'light', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    'rounded-xl border p-4 text-center transition-all',
                    theme === t
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/5 hover:border-white/10',
                  )}
                >
                  {t === 'dark' && <Moon className="mx-auto mb-2 h-8 w-8" />}
                  {t === 'light' && <Sun className="mx-auto mb-2 h-8 w-8" />}
                  {t === 'system' && <Smartphone className="mx-auto mb-2 h-8 w-8" />}
                  <p className="font-medium capitalize">{t}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'seguridad' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Seguridad</h2>
            <div className="space-y-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="mb-4 flex items-center gap-3">
                  <KeyRound className="h-5 w-5 text-purple-400" />
                  <p className="font-medium">Cambiar Contraseña</p>
                </div>
                <div className="grid gap-3">
                  <input
                    type="password"
                    placeholder="Contraseña actual"
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Nueva contraseña"
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'datos' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Datos</h2>
            <div className="grid gap-4">
              <button className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-blue-400" />
                  <div className="text-left">
                    <p className="font-medium">Exportar Datos</p>
                    <p className="text-muted-foreground text-xs">
                      Descargar todos tus datos en formato CSV
                    </p>
                  </div>
                </div>
              </button>
              <button className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-green-400" />
                  <div className="text-left">
                    <p className="font-medium">Crear Respaldo</p>
                    <p className="text-muted-foreground text-xs">
                      Generar copia de seguridad completa
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 border-t border-white/5 pt-6">
          <button
            onClick={handleSave}
            className="flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 px-6 text-sm font-medium transition-opacity hover:opacity-90"
          >
            <Save className="h-4 w-4" />
            Guardar Cambios
          </button>
        </div>
      </motion.div>
    </div>
  )
}
