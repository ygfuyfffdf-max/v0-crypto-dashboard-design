/**
 * 🎨 ADVANCED COLOR SYSTEM — Sistema de colores y gradientes avanzados
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Paletas dinámicas, gradientes complejos, modos de color
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// COLOR PALETTES — Paletas de colores premium
// ═══════════════════════════════════════════════════════════════════════════════════════

export const PREMIUM_COLORS = {
  // Violetas y púrpuras
  violet: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    glow: 'rgba(168, 85, 247, 0.5)',
  },

  // Cyans y teals
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    glow: 'rgba(6, 182, 212, 0.5)',
  },

  // Fucsias y rosas
  fuchsia: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    glow: 'rgba(217, 70, 239, 0.5)',
  },

  // Verdes esmeralda
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    glow: 'rgba(16, 185, 129, 0.5)',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GRADIENT PRESETS — Gradientes premium predefinidos
// ═══════════════════════════════════════════════════════════════════════════════════════

export const GRADIENTS = {
  // Gradientes violeta
  violetDream: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  violetNight: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #3b82f6 100%)',
  violetFire: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',

  // Gradientes cyan
  cyanWave: 'linear-gradient(135deg, #00d2ff 0%, #3a47d5 100%)',
  cyanOcean: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
  cyanAqua: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)',

  // Gradientes multicolor
  rainbow:
    'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #feca57 100%)',
  cosmic: 'linear-gradient(135deg, #fa709a 0%, #fee140 33%, #30cfd0 66%, #667eea 100%)',
  aurora: 'linear-gradient(135deg, #00f260 0%, #0575e6 33%, #667eea 66%, #f093fb 100%)',

  // Gradientes oscuros
  darkViolet: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #6b21a8 100%)',
  darkCyan: 'linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0e7490 100%)',
  midnight: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',

  // Gradientes glassmorphism
  glassViolet: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
  glassCyan: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)',
  glassFuchsia:
    'linear-gradient(135deg, rgba(217, 70, 239, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MESH GRADIENTS — Gradientes mesh complejos
// ═══════════════════════════════════════════════════════════════════════════════════════

export const MESH_GRADIENTS = {
  cosmic: `
    radial-gradient(at 40% 20%, hsla(280, 100%, 70%, 0.5) 0px, transparent 50%),
    radial-gradient(at 80% 0%, hsla(190, 100%, 70%, 0.5) 0px, transparent 50%),
    radial-gradient(at 0% 50%, hsla(340, 100%, 70%, 0.5) 0px, transparent 50%),
    radial-gradient(at 80% 50%, hsla(30, 100%, 70%, 0.5) 0px, transparent 50%),
    radial-gradient(at 0% 100%, hsla(240, 100%, 70%, 0.5) 0px, transparent 50%),
    radial-gradient(at 80% 100%, hsla(180, 100%, 70%, 0.5) 0px, transparent 50%)
  `,
  aurora: `
    radial-gradient(at 30% 20%, hsla(280, 100%, 80%, 0.4) 0px, transparent 50%),
    radial-gradient(at 70% 30%, hsla(200, 100%, 80%, 0.4) 0px, transparent 50%),
    radial-gradient(at 20% 70%, hsla(160, 100%, 80%, 0.4) 0px, transparent 50%),
    radial-gradient(at 80% 80%, hsla(320, 100%, 80%, 0.4) 0px, transparent 50%)
  `,
  neon: `
    radial-gradient(at 50% 0%, hsla(280, 100%, 70%, 0.6) 0px, transparent 40%),
    radial-gradient(at 0% 50%, hsla(180, 100%, 70%, 0.6) 0px, transparent 40%),
    radial-gradient(at 100% 50%, hsla(340, 100%, 70%, 0.6) 0px, transparent 40%),
    radial-gradient(at 50% 100%, hsla(60, 100%, 70%, 0.6) 0px, transparent 40%)
  `,
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GLOW EFFECTS — Efectos de resplandor
// ═══════════════════════════════════════════════════════════════════════════════════════

export const GLOW_EFFECTS = {
  violet: (intensity = 1) => `
    0 0 ${20 * intensity}px rgba(139, 92, 246, 0.3),
    0 0 ${40 * intensity}px rgba(139, 92, 246, 0.2),
    0 0 ${80 * intensity}px rgba(139, 92, 246, 0.1),
    inset 0 0 ${10 * intensity}px rgba(139, 92, 246, 0.1)
  `,
  cyan: (intensity = 1) => `
    0 0 ${20 * intensity}px rgba(6, 182, 212, 0.3),
    0 0 ${40 * intensity}px rgba(6, 182, 212, 0.2),
    0 0 ${80 * intensity}px rgba(6, 182, 212, 0.1),
    inset 0 0 ${10 * intensity}px rgba(6, 182, 212, 0.1)
  `,
  fuchsia: (intensity = 1) => `
    0 0 ${20 * intensity}px rgba(217, 70, 239, 0.3),
    0 0 ${40 * intensity}px rgba(217, 70, 239, 0.2),
    0 0 ${80 * intensity}px rgba(217, 70, 239, 0.1),
    inset 0 0 ${10 * intensity}px rgba(217, 70, 239, 0.1)
  `,
  emerald: (intensity = 1) => `
    0 0 ${20 * intensity}px rgba(16, 185, 129, 0.3),
    0 0 ${40 * intensity}px rgba(16, 185, 129, 0.2),
    0 0 ${80 * intensity}px rgba(16, 185, 129, 0.1),
    inset 0 0 ${10 * intensity}px rgba(16, 185, 129, 0.1)
  `,
  multiColor: (intensity = 1) => `
    0 0 ${20 * intensity}px rgba(139, 92, 246, 0.2),
    0 0 ${40 * intensity}px rgba(6, 182, 212, 0.2),
    0 0 ${60 * intensity}px rgba(217, 70, 239, 0.1),
    inset 0 0 ${10 * intensity}px rgba(168, 85, 247, 0.1)
  `,
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GLASSMORPHISM STYLES — Estilos glassmorphism avanzados
// ═══════════════════════════════════════════════════════════════════════════════════════

export const GLASS_STYLES = {
  default: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  strong: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(40px) saturate(200%)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  ultra: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(80px) saturate(200%) brightness(120%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  colored: (color: string, opacity = 0.1) => ({
    background: `${color}${Math.floor(opacity * 255)
      .toString(16)
      .padStart(2, '0')}`,
    backdropFilter: 'blur(30px) saturate(180%)',
    border: `1px solid ${color}40`,
  }),
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SHADOW PRESETS — Sombras premium
// ═══════════════════════════════════════════════════════════════════════════════════════

export const SHADOWS = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06)',
  md: '0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)',
  xl: '0 16px 64px rgba(0, 0, 0, 0.2), 0 8px 32px rgba(0, 0, 0, 0.15)',
  '2xl': '0 24px 96px rgba(0, 0, 0, 0.25), 0 12px 48px rgba(0, 0, 0, 0.2)',
  inner: 'inset 0 2px 8px rgba(0, 0, 0, 0.15)',
  colored: (color: string) => `
    0 8px 32px ${color}40,
    0 4px 16px ${color}30,
    0 2px 8px ${color}20
  `,
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS — Funciones de utilidad
// ═══════════════════════════════════════════════════════════════════════════════════════

export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const getContrastColor = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

export const interpolateColor = (color1: string, color2: string, factor: number): string => {
  const r1 = parseInt(color1.slice(1, 3), 16)
  const g1 = parseInt(color1.slice(3, 5), 16)
  const b1 = parseInt(color1.slice(5, 7), 16)

  const r2 = parseInt(color2.slice(1, 3), 16)
  const g2 = parseInt(color2.slice(3, 5), 16)
  const b2 = parseInt(color2.slice(5, 7), 16)

  const r = Math.round(r1 + (r2 - r1) * factor)
  const g = Math.round(g1 + (g2 - g1) * factor)
  const b = Math.round(b1 + (b2 - b1) * factor)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
