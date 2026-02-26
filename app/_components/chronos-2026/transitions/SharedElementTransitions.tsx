"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔗✨ SHARED ELEMENT TRANSITIONS — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de transiciones de elementos compartidos entre vistas.
 * Utiliza Framer Motion layoutId para morphing suave entre estados.
 *
 * Características:
 * - Shared Element Transition (layoutId)
 * - Morph automático de posición, tamaño, border-radius
 * - Coordinated transitions entre páginas
 * - Persist elements durante navegación
 *
 * Inspirado en: Material Design shared axis, iOS hero transitions
 *
 * @version 1.0.0 SUPREME
 * @author IY Supreme Agent
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { AnimatePresence, LayoutGroup, motion, type Transition } from "motion/react"
import { createContext, memo, useContext, useMemo, useState, type ReactNode } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SharedElementContextType {
  activeElementId: string | null
  setActiveElementId: (id: string | null) => void
  registerElement: (id: string) => void
  unregisterElement: (id: string) => void
}

interface SharedElementProviderProps {
  children: ReactNode
  groupId?: string
}

interface SharedElementProps {
  id: string
  children: ReactNode
  className?: string
  variant?: "default" | "hero" | "card" | "logo"
  transition?: Transition
  as?: "div" | "span" | "article" | "section" | "button"
}

interface SharedElementImageProps extends SharedElementProps {
  src: string
  alt: string
  width?: number
  height?: number
}

interface SharedElementTextProps extends Omit<SharedElementProps, 'as'> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES: Transiciones predefinidas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const SHARED_TRANSITIONS: Record<string, Transition> = {
  default: {
    type: "spring",
    stiffness: 350,
    damping: 30,
    mass: 0.8,
  },
  hero: {
    type: "spring",
    stiffness: 280,
    damping: 35,
    mass: 1,
  },
  card: {
    type: "spring",
    stiffness: 400,
    damping: 28,
    mass: 0.6,
  },
  logo: {
    type: "spring",
    stiffness: 500,
    damping: 25,
    mass: 0.5,
  },
  smooth: {
    duration: 0.5,
    ease: [0.16, 1, 0.3, 1],
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const SharedElementContext = createContext<SharedElementContextType | null>(null)

function useSharedElement() {
  const context = useContext(SharedElementContext)
  if (!context) {
    throw new Error("useSharedElement must be used within SharedElementProvider")
  }
  return context
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PROVIDER: SharedElementProvider
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const SharedElementProvider = memo(function SharedElementProvider({
  children,
  groupId = "shared-elements",
}: SharedElementProviderProps) {
  const [activeElementId, setActiveElementId] = useState<string | null>(null)
  const [registeredElements, setRegisteredElements] = useState<Set<string>>(new Set())

  const registerElement = (id: string) => {
    setRegisteredElements((prev) => new Set(prev).add(id))
  }

  const unregisterElement = (id: string) => {
    setRegisteredElements((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const value = useMemo(
    () => ({
      activeElementId,
      setActiveElementId,
      registerElement,
      unregisterElement,
    }),
    [activeElementId]
  )

  return (
    <SharedElementContext.Provider value={value}>
      <LayoutGroup id={groupId}>{children}</LayoutGroup>
    </SharedElementContext.Provider>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SharedElement - Elemento compartido básico
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const SharedElement = memo(function SharedElement({
  id,
  children,
  className,
  variant = "default",
  transition,
  as = "div",
}: SharedElementProps) {
  const resolvedTransition = transition ?? SHARED_TRANSITIONS[variant]

  const Component = motion[as] as typeof motion.div

  return (
    <Component layoutId={id} className={className} transition={resolvedTransition} initial={false}>
      {children}
    </Component>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SharedElementImage - Imagen compartida con morph
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const SharedElementImage = memo(function SharedElementImage({
  id,
  src,
  alt,
  width,
  height,
  className,
  variant = "hero",
  transition,
}: SharedElementImageProps) {
  const resolvedTransition = transition ?? SHARED_TRANSITIONS[variant]

  return (
    <motion.img
      layoutId={id}
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      transition={resolvedTransition}
      initial={false}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SharedElementText - Texto compartido con morph
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const SharedElementText = memo(function SharedElementText({
  id,
  children,
  className,
  variant = "default",
  transition,
  as = "span",
}: SharedElementTextProps) {
  const resolvedTransition = transition ?? SHARED_TRANSITIONS[variant]

  const Component = motion[as] as typeof motion.span

  return (
    <Component layoutId={id} className={className} transition={resolvedTransition} initial={false}>
      {children}
    </Component>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SharedElementCard - Card compartida con animación
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SharedElementCardProps {
  id: string
  isExpanded?: boolean
  children: ReactNode
  expandedContent?: ReactNode
  className?: string
  expandedClassName?: string
  onToggle?: () => void
}

export const SharedElementCard = memo(function SharedElementCard({
  id,
  isExpanded = false,
  children,
  expandedContent,
  className,
  expandedClassName,
  onToggle,
}: SharedElementCardProps) {
  return (
    <motion.div
      layoutId={id}
      onClick={onToggle}
      className={cn(
        "cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl",
        "transition-colors duration-300 hover:border-white/20 hover:bg-white/10",
        isExpanded ? expandedClassName : className
      )}
      transition={SHARED_TRANSITIONS.card}
      initial={false}
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {expandedContent ?? children}
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SharedLogo - Logo persistente con morph entre vistas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SharedLogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
  showText?: boolean
}

export const SharedLogo = memo(function SharedLogo({
  size = "md",
  className,
  showText = true,
}: SharedLogoProps) {
  const sizes = {
    sm: { orb: 32, text: "text-lg" },
    md: { orb: 48, text: "text-2xl" },
    lg: { orb: 64, text: "text-4xl" },
  }

  const { orb, text } = sizes[size]

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Orb con layoutId para morph */}
      <motion.div
        layoutId="chronos-logo-orb"
        className="relative rounded-full"
        style={{
          width: orb,
          height: orb,
          background: "radial-gradient(circle, #FFD700 0%, #8B5CF6 100%)",
          boxShadow: "0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(255,215,0,0.3)",
        }}
        transition={SHARED_TRANSITIONS.logo}
        initial={false}
      />

      {/* Text con layoutId para morph */}
      {showText && (
        <motion.span
          layoutId="chronos-logo-text"
          className={cn("font-bold tracking-wider text-white", text)}
          transition={SHARED_TRANSITIONS.logo}
          initial={false}
        >
          CHRONOS
        </motion.span>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: PageMorphTransition - Transición de página con morph
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PageMorphTransitionProps {
  children: ReactNode
  pathname: string
  className?: string
}

export const PageMorphTransition = memo(function PageMorphTransition({
  children,
  pathname,
  className,
}: PageMorphTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className={className}
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.02, y: -20 }}
        transition={SHARED_TRANSITIONS.hero}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { SHARED_TRANSITIONS, useSharedElement }

export default SharedElement
