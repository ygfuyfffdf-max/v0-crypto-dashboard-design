"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef, useEffect, useState, memo } from "react"

interface QuantumOrbProps {
  size?: number
  value?: string | number
  label?: string
  variant?: "violet" | "gold" | "plasma"
  pulse?: boolean
  showRings?: boolean
  interactive?: boolean
  className?: string
  onClick?: () => void
}

const VARIANTS = {
  violet: {
    primary: "#8B00FF",
    secondary: "rgba(139, 0, 255, 0.6)",
    glow: "rgba(139, 0, 255, 0.4)",
    ring: "rgba(139, 0, 255, 0.3)",
  },
  gold: {
    primary: "#FFD700",
    secondary: "rgba(255, 215, 0, 0.6)",
    glow: "rgba(255, 215, 0, 0.4)",
    ring: "rgba(255, 215, 0, 0.3)",
  },
  plasma: {
    primary: "#FF1493",
    secondary: "rgba(255, 20, 147, 0.6)",
    glow: "rgba(255, 20, 147, 0.4)",
    ring: "rgba(255, 20, 147, 0.3)",
  },
}

const QuantumOrb = memo(function QuantumOrb({
  size = 200,
  value,
  label,
  variant = "violet",
  pulse = true,
  showRings = true,
  interactive = true,
  className = "",
  onClick,
}: QuantumOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  
  const colors = VARIANTS[variant]
  
  // Mouse tracking for 3D tilt effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const springConfig = { stiffness: 350, damping: 30 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig)
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    mouseX.set((e.clientX - centerX) / (rect.width / 2))
    mouseY.set((e.clientY - centerY) / (rect.height / 2))
  }
  
  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={containerRef}
      className={`relative cursor-pointer ${className}`}
      style={{
        width: size,
        height: size,
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Outer Glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={pulse ? {
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.6, 0.4],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          filter: "blur(30px)",
        }}
      />
      
      {/* Orbital Rings */}
      {showRings && (
        <>
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{
              duration: isHovered ? 8 : 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{
                width: size * 1.3,
                height: size * 1.3,
                borderColor: colors.ring,
                borderWidth: 1,
                transform: "translate(-50%, -50%) rotateX(75deg)",
              }}
            />
          </motion.div>
          
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: -360 }}
            transition={{
              duration: isHovered ? 12 : 30,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{
                width: size * 1.15,
                height: size * 1.15,
                borderColor: `${colors.ring}80`,
                borderWidth: 1,
                transform: "translate(-50%, -50%) rotateX(75deg) rotateZ(45deg)",
              }}
            />
          </motion.div>
        </>
      )}
      
      {/* Main Orb */}
      <motion.div
        className="absolute inset-[15%] rounded-full"
        style={{
          rotateX: interactive ? rotateX : 0,
          rotateY: interactive ? rotateY : 0,
          transformStyle: "preserve-3d",
          background: `
            radial-gradient(circle at 30% 30%, ${colors.secondary} 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, ${colors.glow} 0%, transparent 40%),
            radial-gradient(circle, rgba(0,0,0,0.8) 40%, ${colors.primary}40 100%)
          `,
          boxShadow: `
            0 0 60px ${colors.glow},
            0 0 120px ${colors.glow}80,
            inset 0 0 60px ${colors.glow}60,
            inset -20px -20px 40px rgba(0,0,0,0.8)
          `,
        }}
      >
        {/* Inner Highlight */}
        <div
          className="absolute top-[10%] left-[15%] w-[30%] h-[20%] rounded-full opacity-60"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 100%)`,
            filter: "blur(8px)",
          }}
        />
        
        {/* Content */}
        {(value || label) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            {value && (
              <motion.span
                className="text-2xl md:text-3xl font-bold text-white"
                style={{
                  textShadow: `0 0 20px ${colors.primary}, 0 0 40px ${colors.glow}`,
                }}
                animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              >
                {value}
              </motion.span>
            )}
            {label && (
              <span
                className="text-xs md:text-sm text-white/70 mt-1 uppercase tracking-wider"
              >
                {label}
              </span>
            )}
          </div>
        )}
      </motion.div>
      
      {/* Particle Effects on Hover */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: colors.primary,
                left: "50%",
                top: "50%",
                boxShadow: `0 0 10px ${colors.primary}`,
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i * Math.PI * 2) / 8) * size * 0.6,
                y: Math.sin((i * Math.PI * 2) / 8) * size * 0.6,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
})

export default QuantumOrb
