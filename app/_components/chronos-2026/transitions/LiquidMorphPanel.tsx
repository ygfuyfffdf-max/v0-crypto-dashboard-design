"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌊✨ LIQUID MORPH PANEL NAVIGATION — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Navegación de paneles con efectos líquidos morphing.
 * SVG clipPath animado para transiciones fluidas tipo líquido/blob.
 *
 * Características:
 * - Liquid morph entre estados
 * - SVG clipPath animado
 * - Blob organic shapes
 * - Navegación tab con morph indicator
 * - Panel transitions con wave effect
 *
 * Inspirado en: Stripe dashboard, Linear app, Framer sites premium
 *
 * @version 1.0.0 SUPREME
 * @author IY Supreme Agent
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { AnimatePresence, motion, useMotionValue } from "motion/react"
import { memo, useCallback, useId, useMemo, useState, type ReactNode } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LiquidTab {
  id: string
  label: string
  icon?: ReactNode
  content: ReactNode
  color?: string
}

interface LiquidMorphTabsProps {
  tabs: LiquidTab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  className?: string
  variant?: "default" | "pills" | "underline" | "liquid"
}

interface LiquidPanelProps {
  children: ReactNode
  isActive: boolean
  direction?: "left" | "right"
  className?: string
}

interface LiquidBlobProps {
  className?: string
  color?: string
  size?: number
  animate?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES: Paths SVG para morphing
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const BLOB_PATHS = {
  state1:
    "M44.2,-51.5C58.3,-42.9,71.5,-29.5,76.1,-13.3C80.7,2.9,76.7,21.8,67.1,36.9C57.5,52,42.3,63.3,25.4,68.7C8.5,74.1,-10.1,73.6,-27.4,68.2C-44.7,62.8,-60.7,52.5,-69.8,37.3C-78.9,22.1,-81.1,2,-76.8,-15.8C-72.5,-33.6,-61.7,-49.1,-47.3,-57.6C-32.9,-66.1,-14.9,-67.6,1.1,-68.9C17.1,-70.2,30.1,-60.1,44.2,-51.5Z",
  state2:
    "M42.7,-52.9C56.9,-43.8,71,-32.3,76.5,-17.2C82,7.9,78.9,29.6,68.4,45.8C57.9,62,40,72.7,21,76.2C2,79.7,-18.1,76,-35.1,67.3C-52.1,58.6,-66,44.9,-73.1,28.2C-80.2,11.5,-80.5,-8.2,-73.9,-24.8C-67.3,-41.4,-53.8,-54.9,-38.8,-63.7C-23.8,-72.5,-7.3,-76.6,5.5,-83.2C18.3,-89.8,28.5,-62,42.7,-52.9Z",
  state3:
    "M38.9,-47.7C51.8,-38.4,64.5,-28.5,70.6,-15C76.7,-1.5,76.2,15.6,69.4,29.8C62.6,44,49.5,55.3,34.8,62.1C20.1,68.9,3.8,71.2,-12.9,69.6C-29.6,68,-46.7,62.5,-58.2,51C-69.7,39.5,-75.6,22,-76.4,4.5C-77.2,-13,-72.9,-30.5,-62.6,-42.8C-52.3,-55.1,-36,-62.2,-20.7,-68.0C-5.4,-73.8,-.9,-78.3,6.5,-86.4C13.9,-94.5,26,-57,38.9,-47.7Z",
}

const WAVE_PATH = {
  idle: "M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z",
  wave1: "M0,50 Q25,70 50,50 T100,50 L100,100 L0,100 Z",
  wave2: "M0,50 Q25,20 50,50 T100,50 L100,100 L0,100 Z",
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: LiquidBlob - Blob animado SVG
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const LiquidBlob = memo(function LiquidBlob({
  className,
  color = "#8B5CF6",
  size = 200,
  animate = true,
}: LiquidBlobProps) {
  const id = useId()

  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={cn("absolute", className)}
    >
      <defs>
        <linearGradient id={`blob-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="50%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </linearGradient>
        <filter id={`blob-blur-${id}`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
        </filter>
      </defs>
      <g transform="translate(100, 100)">
        <motion.path
          fill={`url(#blob-gradient-${id})`}
          filter={`url(#blob-blur-${id})`}
          animate={
            animate
              ? {
                  d: [BLOB_PATHS.state1, BLOB_PATHS.state2, BLOB_PATHS.state3, BLOB_PATHS.state1],
                }
              : undefined
          }
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          d={BLOB_PATHS.state1}
        />
      </g>
    </motion.svg>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: LiquidIndicator - Indicador de tab con morph líquido
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const LiquidIndicator = memo(function LiquidIndicator({
  rect,
  color,
}: {
  rect: { left: number; width: number }
  color: string
}) {
  return (
    <motion.div
      className="absolute bottom-0 h-full rounded-xl"
      layoutId="liquid-indicator"
      style={{
        background: `linear-gradient(135deg, ${color}20, ${color}10)`,
        border: `1px solid ${color}40`,
        boxShadow: `0 0 20px ${color}20, inset 0 1px 1px rgba(255,255,255,0.1)`,
      }}
      initial={false}
      animate={{
        left: rect.left,
        width: rect.width,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: LiquidPanel - Panel con transición líquida
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const LiquidPanel = memo(function LiquidPanel({
  children,
  isActive,
  direction = "right",
  className,
}: LiquidPanelProps) {
  const xOffset = direction === "right" ? 100 : -100

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key="panel"
          className={cn("w-full", className)}
          initial={{
            opacity: 0,
            x: xOffset,
            scale: 0.95,
            filter: "blur(10px)",
          }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
            filter: "blur(0px)",
          }}
          exit={{
            opacity: 0,
            x: -xOffset,
            scale: 0.95,
            filter: "blur(10px)",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: LiquidWaveTransition - Transición con onda líquida
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LiquidWaveTransitionProps {
  isActive: boolean
  color?: string
  className?: string
}

export const LiquidWaveTransition = memo(function LiquidWaveTransition({
  isActive,
  color = "#8B5CF6",
  className,
}: LiquidWaveTransitionProps) {
  const id = useId()

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className={cn("pointer-events-none fixed inset-0 z-50", className)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`wave-gradient-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={color} stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <motion.path
              fill={`url(#wave-gradient-${id})`}
              initial={{ d: WAVE_PATH.idle, y: 100 }}
              animate={{
                d: [WAVE_PATH.idle, WAVE_PATH.wave1, WAVE_PATH.wave2, WAVE_PATH.idle],
                y: [100, 0, 0, -100],
              }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                times: [0, 0.4, 0.6, 1],
              }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: LiquidMorphTabs
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const LiquidMorphTabs = memo(function LiquidMorphTabs({
  tabs,
  defaultTab,
  onChange,
  className,
  variant = "liquid",
}: LiquidMorphTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id)
  const [tabRects, setTabRects] = useState<Record<string, { left: number; width: number }>>({})
  const [direction, setDirection] = useState<"left" | "right">("right")

  const activeTabData = useMemo(() => tabs.find((t) => t.id === activeTab), [tabs, activeTab])
  const activeColor = activeTabData?.color ?? "#8B5CF6"

  const handleTabClick = useCallback(
    (tabId: string, index: number) => {
      const currentIndex = tabs.findIndex((t) => t.id === activeTab)
      setDirection(index > currentIndex ? "right" : "left")
      setActiveTab(tabId)
      onChange?.(tabId)
    },
    [tabs, activeTab, onChange]
  )

  const handleTabRef = useCallback((el: HTMLButtonElement | null, tabId: string) => {
    if (el) {
      const rect = el.getBoundingClientRect()
      const parentRect = el.parentElement?.getBoundingClientRect()
      if (parentRect) {
        setTabRects((prev) => ({
          ...prev,
          [tabId]: {
            left: rect.left - parentRect.left,
            width: rect.width,
          },
        }))
      }
    }
  }, [])

  return (
    <div className={cn("w-full", className)}>
      {/* Tab List */}
      <div className="relative mb-6">
        <div
          className={cn(
            "relative flex gap-1 rounded-xl p-1",
            variant === "liquid" && "bg-white/5 backdrop-blur-xl",
            variant === "pills" && "bg-transparent",
            variant === "underline" && "border-b border-white/10"
          )}
        >
          {/* Liquid Indicator */}
          {variant === "liquid" && tabRects[activeTab] && (
            <LiquidIndicator rect={tabRects[activeTab]} color={activeColor} />
          )}

          {/* Tabs */}
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => handleTabRef(el, tab.id)}
              onClick={() => handleTabClick(tab.id, index)}
              className={cn(
                "relative z-10 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200",
                activeTab === tab.id ? "text-white" : "text-white/60 hover:text-white/80"
              )}
            >
              {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Panel Content */}
      <div className="relative min-h-[200px]">
        {tabs.map((tab) => (
          <LiquidPanel
            key={tab.id}
            isActive={activeTab === tab.id}
            direction={direction}
            className="absolute inset-0"
          >
            {tab.content}
          </LiquidPanel>
        ))}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: LiquidMorphCard - Card con efecto líquido hover
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LiquidMorphCardProps {
  children: ReactNode
  color?: string
  className?: string
  onClick?: () => void
}

export const LiquidMorphCard = memo(function LiquidMorphCard({
  children,
  color = "#8B5CF6",
  className,
  onClick,
}: LiquidMorphCardProps) {
  const id = useId()
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    },
    [mouseX, mouseY]
  )

  return (
    <motion.div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl",
        onClick && "cursor-pointer",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {/* Liquid blob effect on hover */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${color}30, transparent 40%)`,
        }}
      />

      {/* Animated blob background */}
      <div className="pointer-events-none absolute -top-20 -right-20 opacity-0 transition-opacity duration-700 group-hover:opacity-30">
        <LiquidBlob color={color} size={300} animate />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { BLOB_PATHS, WAVE_PATH }

export default LiquidMorphTabs
