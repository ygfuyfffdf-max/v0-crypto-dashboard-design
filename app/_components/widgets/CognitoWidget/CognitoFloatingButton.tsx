'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌✨ AURA AI FLOATING BUTTON — Botón Flotante Premium del Asistente IA
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Botón flotante premium que activa el widget Aura AI desde cualquier parte del dashboard.
 * Incluye indicadores de estado, notificaciones y animaciones cinematográficas.
 *
 * Actualizado para usar el nuevo AuraAIWidget con diseño premium estilo Aura AI Concept.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { Bot, Sparkles, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { STATE_COLORS } from './types'
import { useCognitoState, useCognitoStore, useCognitoSuggestions } from './useCognitoStore'

// Lazy load del nuevo widget Aura AI (versión completa con todas las funcionalidades)
const AuraAIWidget = lazy(() => import('../AuraAIWidget/AuraAIWidgetFull'))

interface CognitoFloatingButtonProps {
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
}

export function CognitoFloatingButton({
  className,
  position = 'bottom-right',
  size = 'lg',
}: CognitoFloatingButtonProps) {
  const { isOpen, setOpen } = useCognitoStore()
  const state = useCognitoState()
  const suggestions = useCognitoSuggestions()
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const colors = STATE_COLORS[state]

  // Mostrar tooltip después de 3 segundos si no está abierto
  useEffect(() => {
    if (!isOpen && suggestions.length > 0) {
      const timer = setTimeout(() => setShowTooltip(true), 3000)
      return () => clearTimeout(timer)
    } else {
      setShowTooltip(false)
    }
  }, [isOpen, suggestions.length])

  // Posiciones
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-20 right-6',
    'top-left': 'top-20 left-6',
  }

  // Tamaños
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
  }

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 28,
  }

  // Panel positions
  const panelPositions = {
    'bottom-right': 'bottom-24 right-0',
    'bottom-left': 'bottom-24 left-0',
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
  }

  return (
    <>
      {/* Panel del Widget - TAMAÑO GRANDE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              'fixed z-50',
              position.includes('right') ? 'right-4' : 'left-4',
              position.includes('bottom') ? 'bottom-4' : 'top-4',
            )}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="h-[calc(100vh-6rem)] w-[500px]">
              <Suspense
                fallback={
                  <div className="flex h-full w-full items-center justify-center rounded-3xl border border-white/10 bg-gray-900/95 backdrop-blur-xl">
                    <div className="flex flex-col items-center gap-3">
                      <motion.div
                        className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      <span className="text-sm text-white/50">Iniciando Sistema Zero...</span>
                    </div>
                  </div>
                }
              >
                <CognitoWidget
                  className="h-full w-full"
                  onToggleCollapse={() => setOpen(false)}
                  initialMode="chat"
                  showMetrics={true}
                  enableVoice={true}
                  enableProactive={true}
                />
              </Suspense>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Flotante */}
      <div className={cn('fixed z-50', positionClasses[position], className)}>
        {/* Tooltip de sugerencia */}
        <AnimatePresence>
          {showTooltip && suggestions.length > 0 && !isOpen && (
            <motion.div
              className={cn(
                'absolute mb-3 w-64 rounded-xl border border-white/10 bg-gray-900/95 p-3 backdrop-blur-xl',
                position.includes('right') ? 'right-0' : 'left-0',
                'bottom-full',
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 flex-shrink-0 text-amber-400" />
                <div>
                  <div className="text-xs font-medium text-white">{suggestions[0]?.title}</div>
                  <div className="mt-0.5 text-[10px] text-white/50">
                    {suggestions[0]?.description?.substring(0, 80)}...
                  </div>
                </div>
                <button
                  onClick={() => setShowTooltip(false)}
                  className="ml-auto text-white/30 hover:text-white/60"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              {/* Arrow */}
              <div
                className={cn(
                  'absolute -bottom-1.5 h-3 w-3 rotate-45 border-r border-b border-white/10 bg-gray-900/95',
                  position.includes('right') ? 'right-6' : 'left-6',
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge de notificación */}
        <AnimatePresence>
          {suggestions.length > 0 && !isOpen && (
            <motion.div
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              {suggestions.length}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón principal */}
        <motion.button
          onClick={() => setOpen(!isOpen)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            'relative flex items-center justify-center rounded-full transition-all',
            sizeClasses[size],
            isOpen
              ? 'bg-white/10 backdrop-blur-xl'
              : 'bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700',
          )}
          style={{
            boxShadow: isOpen
              ? 'none'
              : `0 8px 32px ${colors.glow}, 0 0 0 1px rgba(139, 92, 246, 0.2)`,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Pulse rings cuando no está abierto */}
          {!isOpen && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-violet-500/30"
                animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-violet-500/20"
                animate={{ scale: [1, 1.8, 1.8], opacity: [0.3, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}

          {/* Glow when hovered */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
            }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Icon */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {isOpen ? (
              <X className="text-white" size={iconSizes[size]} />
            ) : (
              <Bot className="text-white" size={iconSizes[size]} />
            )}
          </motion.div>

          {/* State indicator ring */}
          {!isOpen && state !== 'idle' && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${colors.primary}`,
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.button>
      </div>
    </>
  )
}

export default CognitoFloatingButton
