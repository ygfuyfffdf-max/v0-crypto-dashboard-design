'use client'

import { memo } from 'react'
import { motion } from 'motion/react'
import { SilverDustBackground, LightningEffect, SILVER_SPACE_COLORS } from './KocmocPremiumSystem'
import { SilverSpaceThreeBackground } from './SilverSpaceThreeBackground'
import { cn } from '@/app/_lib/utils'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 KOCMOC UI WRAPPER - Contenedor Cinematográfico para Paneles
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface KocmocUIWrapperProps {
  children: React.ReactNode
  className?: string
  showParticles?: boolean
  showLightning?: boolean
  useWebGL?: boolean
  transparent?: boolean
}

export const KocmocUIWrapper = memo(function KocmocUIWrapper({
  children,
  className,
  showParticles = true,
  showLightning = true,
  useWebGL = false, // Default to false for UI panels to save battery, can be enabled for 'Pro' mode
  transparent = false
}: KocmocUIWrapperProps) {
  return (
    <div 
      className={cn("relative min-h-screen w-full overflow-x-hidden", className)} 
      style={{ background: transparent ? 'transparent' : SILVER_SPACE_COLORS.spaceBlack }}
    >
      
      {/* CAPA 1: FONDO CINEMATOGRÁFICO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {!transparent && (
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${SILVER_SPACE_COLORS.deepVoid} 0%, ${SILVER_SPACE_COLORS.absoluteBlack} 100%)`
            }}
          />
        )}
        
        {/* Partículas Ambientales (Optimizadas para UI) */}
        {showParticles && !transparent && (
          useWebGL ? (
            <SilverSpaceThreeBackground intensity="low" className="opacity-60" />
          ) : (
            <SilverDustBackground 
              particleCount={60} 
              intensity="low" 
              interactive={true}
              className="opacity-50"
            />
          )
        )}

        {/* Efecto Lightning Sutil */}
        {showLightning && (
          <LightningEffect intensity={0.05} active={true} />
        )}

        {/* Vignette Cinematográfica */}
        <div className="absolute inset-0 bg-[radial-gradient(transparent_0%,#000000_100%)] opacity-80" />
      </div>

      {/* CAPA 2: CONTENIDO CON EFECTO DE CÁMARA */}
      <motion.div 
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.16, 1, 0.3, 1], // Cubic bezier cinematográfico
          staggerChildren: 0.1
        }}
      >
        {children}
      </motion.div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🛸 KOCMOC MINI LOGO - Para Headers y Navbars
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const KocmocMiniLogo = memo(function KocmocMiniLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Núcleo */}
        <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        {/* Órbita 1 */}
        <div className="absolute w-full h-full border border-white/30 rounded-full rotate-45 scale-x-50" />
        {/* Órbita 2 */}
        <div className="absolute w-full h-full border border-white/30 rounded-full -rotate-45 scale-x-50" />
      </div>
      <span 
        className="text-sm font-light tracking-[0.2em] text-white/90"
        style={{ fontFamily: '"SF Pro Display", "Inter", sans-serif' }}
      >
        KOCMOC
      </span>
    </div>
  )
})
