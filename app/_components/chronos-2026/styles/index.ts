/**
 * 🎨 CHRONOS 2026 STYLES
 * Exportaciones centralizadas del sistema de diseño
 */

export * from './design-tokens'

// CSS utilities
export const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ')

// Tailwind class generators
export const glassClasses = {
  card: 'backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] shadow-glass',
  cardHover:
    'hover:bg-white/[0.05] hover:border-white/[0.12] hover:shadow-glassHover transition-all duration-300',
  surface: 'backdrop-blur-2xl bg-white/[0.02] border border-white/[0.06]',
  panel: 'backdrop-blur-3xl bg-black/40 border border-white/[0.05]',
}
