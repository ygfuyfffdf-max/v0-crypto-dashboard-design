/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌊 CHRONOS 2026 — PARALLAX SCROLL HOOK
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de parallax scroll premium con 5+ capas de profundidad.
 * Integración con Framer Motion para animaciones fluidas.
 *
 * Características:
 * - Múltiples capas con velocidades diferentes
 * - Soporte para scroll horizontal y vertical
 * - Transformaciones 3D (rotateX, perspective)
 * - Fade in/out basado en scroll
 * - Optimización con will-change
 *
 * Paleta: #8B00FF / #FFD700 / #FF1493 (⛔ CYAN PROHIBIDO)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useScroll, useTransform, useSpring, MotionValue, SpringOptions } from 'motion/react'
import { useRef, RefObject, useMemo } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ParallaxLayerConfig {
  /** Velocidad relativa: 0 = estático, 1 = normal, 2 = doble velocidad, negativo = reverso */
  speed: number
  /** Desplazamiento inicial en píxeles */
  offset?: number
  /** Opacidad inicial (0-1) */
  opacity?: [number, number]
  /** Escala inicial y final */
  scale?: [number, number]
  /** Rotación en eje X (grados) */
  rotateX?: [number, number]
  /** Rotación en eje Y (grados) */
  rotateY?: [number, number]
  /** Blur inicial y final (px) */
  blur?: [number, number]
}

export interface ParallaxConfig {
  /** Elemento contenedor para scroll (default: window) */
  container?: RefObject<HTMLElement>
  /** Dirección del parallax */
  direction?: 'vertical' | 'horizontal'
  /** Rango de scroll que activa el efecto [start, end] como porcentaje */
  scrollRange?: [number, number]
  /** Spring physics para suavizado */
  spring?: SpringOptions
}

export interface UseParallaxScrollReturn {
  /** Ref para el contenedor */
  containerRef: RefObject<HTMLDivElement>
  /** Progreso del scroll (0-1) */
  scrollProgress: MotionValue<number>
  /** Progreso con spring */
  smoothProgress: MotionValue<number>
  /** Crear transformación para una capa */
  createLayerStyle: (config: ParallaxLayerConfig) => {
    y: MotionValue<number>
    x: MotionValue<number>
    opacity: MotionValue<number>
    scale: MotionValue<number>
    rotateX: MotionValue<number>
    rotateY: MotionValue<number>
    filter: MotionValue<string>
  }
  /** Crear múltiples capas preset */
  createLayers: (count: number) => ParallaxLayerConfig[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIONES PRESET
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_SPRING: SpringOptions = {
  stiffness: 100,
  damping: 30,
  mass: 1,
}

/** Preset de 5 capas con profundidad cinematográfica */
export const CINEMATIC_LAYERS: ParallaxLayerConfig[] = [
  // Capa 0: Fondo lejano (muy lento)
  { speed: 0.1, opacity: [0.3, 0.6], scale: [1.1, 1], blur: [2, 0] },
  // Capa 1: Fondo medio
  { speed: 0.3, opacity: [0.5, 0.8], scale: [1.05, 1] },
  // Capa 2: Contenido principal (normal)
  { speed: 0.5, opacity: [0.7, 1], scale: [1, 1] },
  // Capa 3: Elementos flotantes
  { speed: 0.7, opacity: [0.8, 1], rotateX: [-5, 0] },
  // Capa 4: Primer plano (rápido)
  { speed: 1.0, opacity: [0.6, 1], scale: [0.95, 1], rotateY: [3, 0] },
  // Capa 5: Overlay/UI (más rápido aún)
  { speed: 1.2, opacity: [0.4, 1] },
]

/** Preset para efecto "inmersivo" tipo Apple */
export const IMMERSIVE_LAYERS: ParallaxLayerConfig[] = [
  { speed: 0.05, scale: [1.2, 1], blur: [5, 0] },
  { speed: 0.15, scale: [1.15, 1], blur: [3, 0] },
  { speed: 0.3, scale: [1.1, 1], blur: [1, 0] },
  { speed: 0.5, scale: [1.05, 1] },
  { speed: 0.7, scale: [1, 1] },
  { speed: 1, scale: [0.98, 1] },
]

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export function useParallaxScroll(config: ParallaxConfig = {}): UseParallaxScrollReturn {
  const {
    container,
    direction = 'vertical',
    scrollRange = [0, 1],
    spring = DEFAULT_SPRING,
  } = config

  const containerRef = useRef<HTMLDivElement>(null!)

  // Obtener progreso del scroll
  const { scrollYProgress, scrollXProgress } = useScroll({
    container: container,
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // Seleccionar dirección
  const scrollProgress = direction === 'vertical' ? scrollYProgress : scrollXProgress

  // Suavizar con spring
  const smoothProgress = useSpring(scrollProgress, spring)

  // Factory para crear estilos de capa
  const createLayerStyle = useMemo(() => {
    return (layerConfig: ParallaxLayerConfig) => {
      const {
        speed,
        offset = 0,
        opacity = [1, 1],
        scale = [1, 1],
        rotateX = [0, 0],
        rotateY = [0, 0],
        blur = [0, 0],
      } = layerConfig

      // Calcular desplazamiento basado en velocidad
      const displacement = 200 * speed // Rango de -200px a +200px

      return {
        y: useTransform(
          smoothProgress,
          scrollRange,
          direction === 'vertical' ? [offset - displacement, offset + displacement] : [0, 0],
        ),
        x: useTransform(
          smoothProgress,
          scrollRange,
          direction === 'horizontal' ? [offset - displacement, offset + displacement] : [0, 0],
        ),
        opacity: useTransform(smoothProgress, scrollRange, opacity),
        scale: useTransform(smoothProgress, scrollRange, scale),
        rotateX: useTransform(smoothProgress, scrollRange, rotateX),
        rotateY: useTransform(smoothProgress, scrollRange, rotateY),
        filter: useTransform(
          smoothProgress,
          scrollRange,
          blur[0] !== blur[1]
            ? [`blur(${blur[0]}px)`, `blur(${blur[1]}px)`]
            : ['blur(0px)', 'blur(0px)'],
        ),
      }
    }
  }, [smoothProgress, scrollRange, direction])

  // Crear capas preset
  const createLayers = useMemo(() => {
    return (count: number): ParallaxLayerConfig[] => {
      return Array.from({ length: count }, (_, i) => {
        const progress = i / (count - 1) // 0 to 1
        return {
          speed: 0.1 + progress * 0.9, // 0.1 to 1.0
          opacity: [0.4 + progress * 0.3, 0.8 + progress * 0.2] as [number, number],
          scale: [1 + (1 - progress) * 0.1, 1] as [number, number],
          blur: [(1 - progress) * 3, 0] as [number, number],
        }
      })
    }
  }, [])

  return {
    containerRef,
    scrollProgress,
    smoothProgress,
    createLayerStyle,
    createLayers,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK SIMPLIFICADO PARA UNA SOLA CAPA
// ═══════════════════════════════════════════════════════════════════════════════

export function useParallaxLayer(speed: number = 0.5, config: ParallaxConfig = {}) {
  const { createLayerStyle, containerRef, scrollProgress } = useParallaxScroll(config)

  const style = useMemo(() => {
    return createLayerStyle({ speed })
  }, [createLayerStyle, speed])

  return {
    containerRef,
    scrollProgress,
    style,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default useParallaxScroll
