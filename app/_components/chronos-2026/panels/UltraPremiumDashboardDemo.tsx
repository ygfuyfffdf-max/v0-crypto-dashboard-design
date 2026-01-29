'use client'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎨 ULTRA PREMIUM DASHBOARD DEMO - CHRONOS 2026
// ═══════════════════════════════════════════════════════════════════════════════════════
// Ejemplo completo de dashboard usando componentes ultra-premium
// Demuestra: Cards, Buttons, Inputs, Animaciones, Layouts
// ═══════════════════════════════════════════════════════════════════════════════════════

import { motion } from 'motion/react'
import {
  ArrowUpRight,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import React from 'react'
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  UltraPremiumButton,
  UltraPremiumCard,
  UltraPremiumInput,
} from '../../ui/premium'

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

export function UltraPremiumDashboardDemo() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const stats = [
    {
      title: 'Ventas Totales',
      value: '$128,450',
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Clientes Activos',
      value: '342',
      change: '+5.2%',
      trend: 'up' as const,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Órdenes Pendientes',
      value: '15',
      change: '-3.4%',
      trend: 'down' as const,
      icon: ShoppingCart,
      color: 'from-orange-500 to-yellow-500',
    },
    {
      title: 'Productos en Stock',
      value: '1,234',
      change: '+8.7%',
      trend: 'up' as const,
      icon: Package,
      color: 'from-purple-500 to-pink-500',
    },
  ]

  const recentActivity = [
    { id: 1, action: 'Nueva venta', amount: '$2,450', time: 'Hace 5 min' },
    { id: 2, action: 'Cliente registrado', amount: 'Juan Pérez', time: 'Hace 12 min' },
    { id: 3, action: 'Orden completada', amount: '#ORD-1234', time: 'Hace 23 min' },
    { id: 4, action: 'Pago recibido', amount: '$5,780', time: 'Hace 1 hora' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 p-8">
      {/* ═══════════════════ ANIMATED BACKGROUND ═══════════════════ */}
      <div className="absolute inset-0 -z-10">
        <div className="animate-nebula-swirl absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-indigo-500/20 blur-3xl" />
        <div className="animate-nebula-swirl animation-delay-2000 absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-pink-500/20 blur-3xl" />
      </div>

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="mb-2 text-4xl font-bold text-white">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent animate-gradient">
              Dashboard Premium
            </span>
          </h1>
          <p className="text-gray-400">Bienvenido al sistema CHRONOS 2026</p>
        </div>

        <div className="flex gap-3">
          <UltraPremiumInput
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="glass"
            className="w-64"
          />

          <UltraPremiumButton
            variant="secondary"
            icon={RefreshCw}
            loading={isRefreshing}
            onClick={handleRefresh}
          >
            Actualizar
          </UltraPremiumButton>

          <UltraPremiumButton variant="primary" icon={Sparkles} energyPulse>
            Nuevo
          </UltraPremiumButton>
        </div>
      </motion.div>

      {/* ═══════════════════ STATS GRID ═══════════════════ */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
            >
              <UltraPremiumCard variant="glassmorphic" hover="lift" parallax>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${stat.color}`}
                    >
                      <Icon size={24} className="text-white" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      <TrendIcon size={16} />
                      {stat.change}
                    </div>
                  </div>

                  <p className="mb-1 text-sm text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </CardContent>
              </UltraPremiumCard>
            </motion.div>
          )
        })}
      </div>

      {/* ═══════════════════ MAIN CONTENT GRID ═══════════════════ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna Principal (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Gráfico de Ventas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <UltraPremiumCard variant="neon" hover="glow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ventas del Mes</CardTitle>
                    <CardDescription>Tendencia de ventas últimos 30 días</CardDescription>
                  </div>
                  <UltraPremiumButton variant="ghost" size="sm">
                    Ver más
                    <ArrowUpRight size={16} />
                  </UltraPremiumButton>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex h-64 items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Package size={48} className="mx-auto mb-4 text-violet-500" />
                    <p>Gráfico de ventas (Canvas)</p>
                    <p className="text-sm">Integración con visualizaciones Canvas aquí</p>
                  </div>
                </div>
              </CardContent>
            </UltraPremiumCard>
          </motion.div>

          {/* Productos Top */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <UltraPremiumCard variant="holographic" hover="scale">
              <CardHeader>
                <CardTitle>Productos Más Vendidos</CardTitle>
                <CardDescription>Top 5 esta semana</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/10 hover:bg-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                          {i}
                        </div>
                        <div>
                          <p className="font-medium text-white">Producto {i}</p>
                          <p className="text-sm text-gray-400">{150 - i * 10} unidades</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">${(2500 - i * 200).toLocaleString()}</p>
                        <p className="text-sm text-green-400">+{15 - i}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </UltraPremiumCard>
          </motion.div>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Actividad Reciente */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <UltraPremiumCard variant="glassmorphic" hover="lift">
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimas acciones del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-3 transition-all hover:border-violet-500/30 hover:bg-white/10"
                    >
                      <div className="mt-1 h-2 w-2 rounded-full bg-violet-500 animate-energy-pulse" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{activity.action}</p>
                        <p className="text-xs text-violet-400">{activity.amount}</p>
                        <p className="mt-1 text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <UltraPremiumButton variant="ghost" className="w-full">
                  Ver Todo
                </UltraPremiumButton>
              </CardFooter>
            </UltraPremiumCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <UltraPremiumCard variant="neon" hover="glow">
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>Tareas frecuentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <UltraPremiumButton variant="primary" className="w-full">
                    Nueva Venta
                  </UltraPremiumButton>
                  <UltraPremiumButton variant="secondary" className="w-full">
                    Registrar Cliente
                  </UltraPremiumButton>
                  <UltraPremiumButton variant="gold" className="w-full">
                    Nueva Orden
                  </UltraPremiumButton>
                  <UltraPremiumButton variant="success" className="w-full">
                    Generar Reporte
                  </UltraPremiumButton>
                </div>
              </CardContent>
            </UltraPremiumCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
