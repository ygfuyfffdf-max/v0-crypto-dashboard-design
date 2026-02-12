// 🎯 ULTRA PREMIUM SHOWCASE - CHRONOS INFINITY
// Componente de exhibición premium con efectos 3D y glassmorphism

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  Sparkles, 
  Crown, 
  Gem, 
  Star, 
  Zap, 
  Rocket,
  Trophy,
  Award,
  Diamond,
  CrownIcon
} from 'lucide-react'

interface ShowcaseItem {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  gradient: string
  premiumLevel: 'gold' | 'platinum' | 'diamond' | 'supreme'
}

interface UltraPremiumShowcaseProps {
  className?: string
  items?: ShowcaseItem[]
  title?: string
  subtitle?: string
  showParticles?: boolean
  autoRotate?: boolean
  rotationSpeed?: number
  theme?: 'light' | 'dark' | 'auto'
}

const defaultItems: ShowcaseItem[] = [
  {
    id: '1',
    title: 'Quantum AI Engine',
    description: 'Motor de IA cuántica con procesamiento hiper-dimensional',
    icon: Brain,
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-pink-500',
    premiumLevel: 'supreme'
  },
  {
    id: '2', 
    title: 'Glassmorphism Supreme',
    description: 'Efectos de cristal líquido con 30px de desenfoque',
    icon: Gem,
    color: 'text-cyan-400',
    gradient: 'from-cyan-500 to-blue-500',
    premiumLevel: 'diamond'
  },
  {
    id: '3',
    title: 'Zero Force Voice',
    description: 'Comandos de voz con latencia <200ms y emociones adaptativas',
    icon: Zap,
    color: 'text-yellow-400',
    gradient: 'from-yellow-500 to-orange-500',
    premiumLevel: 'platinum'
  },
  {
    id: '4',
    title: 'Performance Suprema',
    description: 'Renderizado <16ms con optimización de hardware acelerado',
    icon: Rocket,
    color: 'text-green-400',
    gradient: 'from-green-500 to-emerald-500',
    premiumLevel: 'gold'
  }
]

export function UltraPremiumShowcase({
  className,
  items = defaultItems,
  title = "Características Supremas",
  subtitle = "Tecnología de vanguardia que redefine los estándares",
  showParticles = true,
  autoRotate = true,
  rotationSpeed = 0.5,
  theme = 'auto'
}: UltraPremiumShowcaseProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState(0)

  // Auto-detección de tema
  const currentTheme = theme === 'auto' 
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme

  // Efecto de rotación automática
  useEffect(() => {
    if (!autoRotate) return

    const interval = setInterval(() => {
      setRotation(prev => prev + rotationSpeed)
    }, 50)

    return () => clearInterval(interval)
  }, [autoRotate, rotationSpeed])

  // Seguimiento del mouse para efectos 3D
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        setMousePosition({
          x: (e.clientX - centerX) / rect.width,
          y: (e.clientY - centerY) / rect.height
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Generar partículas flotantes
  const particles = showParticles ? Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    speed: Math.random() * 2 + 1,
    delay: Math.random() * 5
  })) : []

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative w-full min-h-[600px]',
        'overflow-hidden',
        currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
        className
      )}
    >
      {/* Partículas de fondo */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className={cn(
                'absolute rounded-full',
                'bg-gradient-to-r from-purple-400 to-pink-400',
                'opacity-30'
              )}
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size
              }}
              animate={{
                y: [-20, -100],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{
                duration: particle.speed + 5,
                repeat: Infinity,
                delay: particle.delay,
                ease: 'linear'
              }}
            />
          ))}
        </div>
      )}

      {/* Header Premium */}
      <div className="relative z-10 text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, type: 'spring' }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <Crown className="w-8 h-8 text-yellow-400" />
          <h1 className={cn(
            'text-4xl md:text-6xl font-bold',
            'bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400',
            'bg-clip-text text-transparent'
          )}>
            {title}
          </h1>
          <Crown className="w-8 h-8 text-yellow-400" />
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, type: 'spring' }}
          className={cn(
            'text-lg md:text-xl',
            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )}
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Grid de Características */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4">
        {items.map((item, index) => {
          const IconComponent = item.icon
          const isSelected = selectedItem === item.id
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 100, rotateY: 90 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                rotateY: 0,
                rotateZ: autoRotate ? rotation + index * 5 : 0
              }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.1,
                type: 'spring',
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 10,
                rotateZ: 0
              }}
              onClick={() => setSelectedItem(isSelected ? null : item.id)}
              className={cn(
                'relative p-6 rounded-3xl',
                'backdrop-blur-xl',
                'border border-white/20',
                'cursor-pointer',
                'transition-all duration-300',
                isSelected 
                  ? 'bg-white/20 shadow-2xl shadow-purple-500/30' 
                  : 'bg-white/5 hover:bg-white/10',
                currentTheme === 'dark' ? 'shadow-2xl' : 'shadow-xl'
              )}
              style={{
                transform: `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg)`
              }}
            >
              {/* Icono Premium */}
              <div className={cn(
                'w-16 h-16 rounded-2xl',
                'flex items-center justify-center',
                'mb-4',
                'bg-gradient-to-br ' + item.gradient,
                'shadow-lg'
              )}>
                <IconComponent className="w-8 h-8 text-white" />
              </div>

              {/* Título */}
              <h3 className={cn(
                'text-xl font-bold mb-2',
                currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
              )}>
                {item.title}
              </h3>

              {/* Descripción */}
              <p className={cn(
                'text-sm leading-relaxed',
                currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              )}>
                {item.description}
              </p>

              {/* Badge de Nivel Premium */}
              <div className="mt-4 flex items-center gap-2">
                <div className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  item.premiumLevel === 'supreme' && 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
                  item.premiumLevel === 'diamond' && 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
                  item.premiumLevel === 'platinum' && 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800',
                  item.premiumLevel === 'gold' && 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800'
                )}>
                  {item.premiumLevel.toUpperCase()}
                </div>
                
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-green-400"
                  >
                    <Star className="w-4 h-4" />
                    <span className="text-xs font-medium">ACTIVO</span>
                  </motion.div>
                )}
              </div>

              {/* Efecto de Brillo */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                animate={{
                  opacity: isSelected ? [0.1, 0.3, 0.1] : 0
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
                style={{
                  background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
                  backgroundSize: '200% 200%'
                }}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Panel de Detalles Expandido */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="relative z-20 mt-12 max-w-4xl mx-auto px-4"
          >
            <div className={cn(
              'backdrop-blur-xl',
              'border border-white/20',
              'rounded-3xl p-8',
              'bg-white/10'
            )}>
              <div className="text-center">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-4">
                  Característica Premium Activada
                </h2>
                <p className="text-lg text-gray-300">
                  Esta funcionalidad está ahora operativa con toda su potencia premium.
                  Experimenta el poder absoluto de CHRONOS INFINITY.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Premium */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="relative z-10 text-center mt-16"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Diamond className="w-6 h-6 text-purple-400" />
          <span className="text-purple-400 font-medium">CHRONOS INFINITY 2026</span>
          <Diamond className="w-6 h-6 text-purple-400" />
        </div>
        <p className={cn(
          'text-sm',
          currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        )}>
          Tecnología de vanguardia que redefine los límites de la innovación
        </p>
      </motion.div>
    </div>
  )
}