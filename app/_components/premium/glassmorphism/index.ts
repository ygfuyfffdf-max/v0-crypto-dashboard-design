/**
 * 🎨 CHRONOS INFINITY PREMIUM GLASSMORPHISM SYSTEM
 * Sistema completo de componentes con glassmorphism avanzado
 */

// 🚀 Componente principal GlassWidget
export { default as GlassWidget } from './GlassWidget'
export type { GlassWidgetProps, AICapabilities } from './GlassWidget'

// 🎨 Estilos premium de glassmorphism
import './GlassWidget.css'

// 🎯 Utilidades y tipos
export interface GlassStyle {
  backdropFilter: string
  WebkitBackdropFilter: string
  background: string
  border: string
  borderRadius: string
  boxShadow: string
  transform?: string
}

export interface GlassEffectOptions {
  blur: number
  opacity: number
  border: string
  performance: 'low' | 'medium' | 'high'
}

// 🔧 Función utilitaria para crear efectos glass
export const createGlassEffect = (options: GlassEffectOptions): GlassStyle => {
  const { blur, opacity, border, performance } = options
  
  // Optimizaciones basadas en rendimiento
  const actualBlur = performance === 'low' ? Math.min(blur, 10) : blur
  const actualOpacity = performance === 'low' ? Math.min(opacity, 0.05) : opacity
  
  return {
    backdropFilter: `blur(${actualBlur}px)`,
    WebkitBackdropFilter: `blur(${actualBlur}px)`,
    background: `rgba(255, 255, 255, ${actualOpacity})`,
    border,
    borderRadius: '16px',
    boxShadow: performance === 'low' 
      ? '0 4px 16px rgba(0, 0, 0, 0.1)'
      : '0 8px 32px rgba(0, 0, 0, 0.15)'
  }
}

// 🌈 Temas predefinidos
export const glassThemes = {
  light: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  accent: {
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    shadow: '0 8px 32px rgba(59, 130, 246, 0.2)'
  }
}

// ⚡ Clases CSS utilitarias
export const glassClasses = {
  widget: 'glass-widget',
  card: 'glass-card',
  button: 'glass-button',
  input: 'glass-input',
  header: 'glass-widget-header',
  content: 'glass-widget-content',
  icon: 'glass-widget-icon',
  toggle: 'glass-widget-toggle',
  shimmer: 'glass-shimmer',
  loading: 'glass-loading',
  gradient: {
    primary: 'glass-gradient-primary',
    secondary: 'glass-gradient-secondary'
  }
}

// 🎯 Variantes de animación
export const glassAnimations = {
  slideInUp: 'glass-animate-in',
  scaleIn: 'glass-animate-scale',
  shimmer: 'glass-shimmer'
}

// 🎨 Presets de efectos glass
export const glassPresets = {
  subtle: createGlassEffect({
    blur: 10,
    opacity: 0.05,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    performance: 'high'
  }),
  
  medium: createGlassEffect({
    blur: 20,
    opacity: 0.1,
    border: '1px solid rgba(255, 255, 255, 0.3)',
    performance: 'high'
  }),
  
  strong: createGlassEffect({
    blur: 30,
    opacity: 0.15,
    border: '1px solid rgba(255, 255, 255, 0.4)',
    performance: 'medium'
  }),
  
  premium: createGlassEffect({
    blur: 40,
    opacity: 0.2,
    border: '1px solid rgba(255, 255, 255, 0.5)',
    performance: 'high'
  })
}

// 🔧 Función de optimización de rendimiento
export const optimizeGlassPerformance = (blur: number, devicePerformance: 'low' | 'medium' | 'high'): number => {
  switch (devicePerformance) {
    case 'low':
      return Math.min(blur, 10)
    case 'medium':
      return Math.min(blur, 25)
    case 'high':
      return Math.min(blur, 50)
    default:
      return blur
  }
}

// 🌟 Helper para detectar soporte de backdrop-filter
export const supportsBackdropFilter = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return CSS.supports('backdrop-filter', 'blur(1px)') || 
         CSS.supports('-webkit-backdrop-filter', 'blur(1px)')
}

// 🎯 Exportar todo como módulo premium
export const GlassmorphismSystem = {
  createGlassEffect,
  glassThemes,
  glassClasses,
  glassAnimations,
  glassPresets,
  optimizeGlassPerformance,
  supportsBackdropFilter
} as const

export default GlassmorphismSystem