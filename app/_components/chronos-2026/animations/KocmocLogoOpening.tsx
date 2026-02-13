"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌✨ KOCMOC LOGO OPENING — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Logo Opening Animation ultra premium basado en el diseño KOCMOC (КОСМОС).
 * Animación cinematográfica con órbitas planetarias, orb central, y reveal elegante.
 *
 * Características:
 * - Órbitas concéntricas animadas (SVG stroke-dasharray)
 * - Planetas orbitando con física realista
 * - Orb central con glow volumétrico pulsante
 * - Línea axis horizontal con reveal
 * - Texto KOCMOC con efecto typewriter premium
 * - Aurora dinámica de fondo
 * - Partículas estelares sutiles
 *
 * Inspirado en: Diseño minimalista geométrico, estética cosmos/space premium
 *
 * @version 1.0.0 SUPREME
 * @author IY Supreme Agent
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { AnimatePresence, motion, useAnimation } from "motion/react"
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface KocmocLogoOpeningProps {
  onComplete?: () => void
  duration?: number
  skipEnabled?: boolean
  showText?: boolean
  textContent?: string
}

interface OrbitConfig {
  radius: number
  strokeWidth: number
  dashArray: string
  rotationDuration: number
  delay: number
}

interface PlanetConfig {
  orbitRadius: number
  size: number
  angle: number
  orbitDuration: number
  hasRing?: boolean
  hasDot?: boolean
  delay: number
}

type Phase = "dormant" | "axis" | "orbits" | "planets" | "core" | "text" | "complete"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ORBITS: OrbitConfig[] = [
  { radius: 40, strokeWidth: 1, dashArray: "2 4", rotationDuration: 30, delay: 0.2 },
  { radius: 60, strokeWidth: 0.8, dashArray: "3 6", rotationDuration: 45, delay: 0.4 },
  { radius: 85, strokeWidth: 0.6, dashArray: "4 8", rotationDuration: 60, delay: 0.6 },
  { radius: 110, strokeWidth: 0.5, dashArray: "2 6", rotationDuration: 80, delay: 0.8 },
  { radius: 140, strokeWidth: 0.4, dashArray: "5 10", rotationDuration: 100, delay: 1.0 },
]

const PLANETS: PlanetConfig[] = [
  {
    orbitRadius: 40,
    size: 6,
    angle: 180,
    orbitDuration: 8,
    hasRing: false,
    hasDot: false,
    delay: 0.5,
  },
  {
    orbitRadius: 60,
    size: 4,
    angle: 45,
    orbitDuration: 12,
    hasRing: false,
    hasDot: true,
    delay: 0.7,
  },
  {
    orbitRadius: 110,
    size: 10,
    angle: 0,
    orbitDuration: 20,
    hasRing: true,
    hasDot: true,
    delay: 1.0,
  },
  {
    orbitRadius: 140,
    size: 5,
    angle: 270,
    orbitDuration: 28,
    hasRing: false,
    hasDot: false,
    delay: 1.2,
  },
]

const PHASE_TIMING = {
  dormant: 0,
  axis: 300,
  orbits: 800,
  planets: 1500,
  core: 2500,
  text: 4000,
  complete: 6000,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: OrbitRing - Órbita individual animada
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const OrbitRing = memo(function OrbitRing({
  config,
  isVisible,
  center,
}: {
  config: OrbitConfig
  isVisible: boolean
  center: number
}) {
  const circumference = 2 * Math.PI * config.radius

  return (
    <motion.circle
      cx={center}
      cy={center}
      r={config.radius}
      fill="none"
      stroke="rgba(255, 255, 255, 0.3)"
      strokeWidth={config.strokeWidth}
      strokeDasharray={config.dashArray}
      initial={{ pathLength: 0, opacity: 0, rotate: 0 }}
      animate={
        isVisible
          ? {
              pathLength: 1,
              opacity: 1,
              rotate: 360,
            }
          : { pathLength: 0, opacity: 0 }
      }
      transition={{
        pathLength: { duration: 1.5, delay: config.delay, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.5, delay: config.delay },
        rotate: { duration: config.rotationDuration, repeat: Infinity, ease: "linear" },
      }}
      style={{
        strokeDashoffset: 0,
        transformOrigin: `${center}px ${center}px`,
      }}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: Planet - Planeta orbitando
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const Planet = memo(function Planet({
  config,
  isVisible,
  center,
}: {
  config: PlanetConfig
  isVisible: boolean
  center: number
}) {
  const id = useId()

  // Calcular posición inicial en la órbita
  const initialX = center + config.orbitRadius * Math.cos((config.angle * Math.PI) / 180)
  const initialY = center + config.orbitRadius * Math.sin((config.angle * Math.PI) / 180)

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={
        isVisible
          ? {
              opacity: 1,
              scale: 1,
              rotate: 360,
            }
          : { opacity: 0, scale: 0 }
      }
      transition={{
        opacity: { duration: 0.5, delay: config.delay },
        scale: { type: "spring", stiffness: 300, damping: 20, delay: config.delay },
        rotate: { duration: config.orbitDuration, repeat: Infinity, ease: "linear" },
      }}
      style={{ transformOrigin: `${center}px ${center}px` }}
    >
      {/* Planeta principal */}
      <circle
        cx={initialX}
        cy={initialY}
        r={config.size / 2}
        fill={config.hasDot ? "none" : "white"}
        stroke="white"
        strokeWidth={config.hasDot ? 1 : 0}
      />

      {/* Anillo del planeta (si tiene) */}
      {config.hasRing && (
        <ellipse
          cx={initialX}
          cy={initialY}
          rx={config.size + 4}
          ry={config.size / 3}
          fill="none"
          stroke="white"
          strokeWidth={0.8}
        />
      )}

      {/* Punto central interno (si tiene) */}
      {config.hasDot && <circle cx={initialX} cy={initialY} r={1.5} fill="white" />}
    </motion.g>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: CentralOrb - Orb central con glow
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const CentralOrb = memo(function CentralOrb({
  isVisible,
  center,
}: {
  isVisible: boolean
  center: number
}) {
  const id = useId()

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={
        isVisible
          ? {
              opacity: 1,
              scale: 1,
            }
          : { opacity: 0, scale: 0 }
      }
      transition={{
        opacity: { duration: 0.8 },
        scale: { type: "spring", stiffness: 200, damping: 15 },
      }}
    >
      {/* Definiciones de filtros */}
      <defs>
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`core-gradient-${id}`} cx="40%" cy="40%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0.8" />
        </radialGradient>
      </defs>

      {/* Anillo exterior del orb */}
      <motion.circle
        cx={center}
        cy={center}
        r={18}
        fill="none"
        stroke="white"
        strokeWidth={2.5}
        filter={`url(#glow-${id})`}
        initial={{ pathLength: 0 }}
        animate={isVisible ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Core interno brillante */}
      <motion.circle
        cx={center}
        cy={center}
        r={10}
        fill={`url(#core-gradient-${id})`}
        filter={`url(#glow-${id})`}
        animate={
          isVisible
            ? {
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{ transformOrigin: `${center}px ${center}px` }}
      />
    </motion.g>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: AxisLine - Línea horizontal del eje
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const AxisLine = memo(function AxisLine({
  isVisible,
  width,
  center,
}: {
  isVisible: boolean
  width: number
  center: number
}) {
  return (
    <motion.line
      x1={0}
      y1={center}
      x2={width}
      y2={center}
      stroke="white"
      strokeWidth={1}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={isVisible ? { pathLength: 1, opacity: 0.8 } : { pathLength: 0, opacity: 0 }}
      transition={{
        pathLength: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.5 },
      }}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: StarField - Campo de estrellas de fondo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const StarField = memo(function StarField({ isVisible }: { isVisible: boolean }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 2,
        duration: Math.random() * 3 + 2,
      })),
    []
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          initial={{ opacity: 0 }}
          animate={
            isVisible
              ? {
                  opacity: [0, 0.8, 0],
                }
              : { opacity: 0 }
          }
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: KocmocText - Texto KOCMOC/КОСМОС animado
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const KocmocText = memo(function KocmocText({
  isVisible,
  text,
}: {
  isVisible: boolean
  text: string
}) {
  const letters = text.split("")

  return (
    <motion.div
      className="flex items-center justify-center gap-1"
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className="text-2xl font-light tracking-[0.5em] text-white sm:text-3xl md:text-4xl"
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          initial={{ opacity: 0, y: 15 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{
            duration: 0.5,
            delay: index * 0.1 + 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: KocmocLogoOpening
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const KocmocLogoOpening = memo(function KocmocLogoOpening({
  onComplete,
  duration = 7000,
  skipEnabled = true,
  showText = true,
  textContent = "КОСМОС",
}: KocmocLogoOpeningProps) {
  const [phase, setPhase] = useState<Phase>("dormant")
  const [isVisible, setIsVisible] = useState(true)
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)

  // Dimensiones del SVG
  const svgSize = 340
  const center = svgSize / 2

  // Skip handler
  const handleSkip = useCallback(() => {
    if (skipEnabled) {
      controls.start({ opacity: 0 }).then(() => {
        setIsVisible(false)
        onComplete?.()
      })
    }
  }, [skipEnabled, controls, onComplete])

  // Secuencia de fases
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    timers.push(setTimeout(() => setPhase("axis"), PHASE_TIMING.axis))
    timers.push(setTimeout(() => setPhase("orbits"), PHASE_TIMING.orbits))
    timers.push(setTimeout(() => setPhase("planets"), PHASE_TIMING.planets))
    timers.push(setTimeout(() => setPhase("core"), PHASE_TIMING.core))
    timers.push(setTimeout(() => setPhase("text"), PHASE_TIMING.text))
    timers.push(setTimeout(() => setPhase("complete"), PHASE_TIMING.complete))

    timers.push(
      setTimeout(async () => {
        await controls.start({ opacity: 0 })
        setIsVisible(false)
        onComplete?.()
      }, duration)
    )

    return () => timers.forEach(clearTimeout)
  }, [duration, onComplete, controls])

  // Keyboard skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " " || e.key === "Escape") && skipEnabled) {
        handleSkip()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSkip, skipEnabled])

  if (!isVisible) return null

  // Determinar qué elementos son visibles según la fase
  const showAxis = phase !== "dormant"
  const showOrbits = ["orbits", "planets", "core", "text", "complete"].includes(phase)
  const showPlanets = ["planets", "core", "text", "complete"].includes(phase)
  const showCore = ["core", "text", "complete"].includes(phase)
  const showTextPhase = ["text", "complete"].includes(phase)

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={controls}
        exit={{ opacity: 0 }}
        onClick={handleSkip}
        role="presentation"
        aria-label="Cargando KOCMOC"
        className="fixed inset-0 z-[9999] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#1a1a1a]"
      >
        {/* Star field background */}
        <StarField isVisible={showAxis} />

        {/* Main SVG Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg
            width={svgSize}
            height={svgSize}
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="overflow-visible"
          >
            {/* Axis Line */}
            <AxisLine isVisible={showAxis} width={svgSize} center={center} />

            {/* Orbit Rings */}
            {ORBITS.map((orbit, index) => (
              <OrbitRing key={index} config={orbit} isVisible={showOrbits} center={center} />
            ))}

            {/* Planets */}
            {PLANETS.map((planet, index) => (
              <Planet key={index} config={planet} isVisible={showPlanets} center={center} />
            ))}

            {/* Central Orb */}
            <CentralOrb isVisible={showCore} center={center} />
          </svg>
        </motion.div>

        {/* KOCMOC Text */}
        {showText && (
          <div className="mt-12">
            <KocmocText isVisible={showTextPhase} text={textContent} />
          </div>
        )}

        {/* Skip hint */}
        {skipEnabled && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase !== "dormant" ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 2 }}
          >
            Presiona cualquier tecla para continuar
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VARIANTE: KocmocLogoStatic - Logo estático para headers/footers
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface KocmocLogoStaticProps {
  size?: number
  showText?: boolean
  text?: string
  className?: string
  animate?: boolean
}

export const KocmocLogoStatic = memo(function KocmocLogoStatic({
  size = 60,
  showText = false,
  text = "KOCMOC",
  className,
  animate = true,
}: KocmocLogoStaticProps) {
  const id = useId()
  const center = size / 2
  const scale = size / 340 // Escala relativa al SVG original

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Axis line */}
        <line
          x1={0}
          y1={center}
          x2={size}
          y2={center}
          stroke="white"
          strokeWidth={0.5 * scale}
          opacity={0.6}
        />

        {/* Simplified orbits */}
        {[0.3, 0.5, 0.7].map((r, i) => (
          <motion.circle
            key={i}
            cx={center}
            cy={center}
            r={center * r}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={0.5}
            strokeDasharray="2 4"
            animate={animate ? { rotate: 360 } : {}}
            transition={{ duration: 30 + i * 20, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: `${center}px ${center}px` }}
          />
        ))}

        {/* Central orb */}
        <circle
          cx={center}
          cy={center}
          r={center * 0.12}
          fill="none"
          stroke="white"
          strokeWidth={1.5}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={center * 0.06}
          fill="white"
          animate={animate ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Small planets */}
        <circle cx={center - center * 0.5} cy={center} r={2} fill="white" />
        <circle
          cx={center + center * 0.7}
          cy={center}
          r={3}
          stroke="white"
          strokeWidth={0.5}
          fill="none"
        />
      </svg>

      {showText && <span className="text-lg font-light tracking-[0.3em] text-white">{text}</span>}
    </div>
  )
})

export default KocmocLogoOpening
