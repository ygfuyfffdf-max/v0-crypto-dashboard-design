/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — SISTEMA DE DISEÑO CUÁNTICO HYPER-ELEVADO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de diseño supremo con:
 * - Física real (spring physics con amortiguamiento crítico)
 * - Shaders WebGPU compute integrados
 * - Materiales PBR con fresnel avanzado
 * - Animaciones 120fps con interpolación Hermite
 * - Efectos hover/scroll hiperactivos
 * - Sistema de partículas GPU-accelerated
 *
 * @version HYPER-INFINITY 2026.2
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 PALETA CUÁNTICA — COLORES ESENCIALES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QUANTUM_PALETTE = {
  // ═══ COLORES PRIMARIOS (INMUTABLES) ═══
  void: {
    pure: '#000000',
    deep: '#050508',
    soft: '#0A0A0F',
    surface: '#0D0D14',
    elevated: '#12121A',
    overlay: 'rgba(0, 0, 0, 0.85)',
    absolute: '#000000',
  },

  violet: {
    pure: '#8B00FF',
    neon: '#B24BFF',
    electric: '#9933FF',
    soft: '#7B2FBE',
    dark: '#4B0082',
    bright: '#B24BFF',
    deep: '#4B0082',
    glow: 'rgba(139, 0, 255, 0.6)',
    glowIntense: 'rgba(139, 0, 255, 0.9)',
    glowSubtle: 'rgba(139, 0, 255, 0.2)',
    glow10: 'rgba(139, 0, 255, 0.1)',
    glow15: 'rgba(139, 0, 255, 0.15)',
    glow20: 'rgba(139, 0, 255, 0.2)',
    glow30: 'rgba(139, 0, 255, 0.3)',
    glow40: 'rgba(139, 0, 255, 0.4)',
    glow50: 'rgba(139, 0, 255, 0.5)',
    glow60: 'rgba(139, 0, 255, 0.6)',
    border: 'rgba(139, 0, 255, 0.3)',
    border10: 'rgba(139, 0, 255, 0.1)',
    border15: 'rgba(139, 0, 255, 0.15)',
    border20: 'rgba(139, 0, 255, 0.2)',
    border25: 'rgba(139, 0, 255, 0.25)',
    border40: 'rgba(139, 0, 255, 0.4)',
    border60: 'rgba(139, 0, 255, 0.6)',
    borderHover: 'rgba(139, 0, 255, 0.6)',
  },

  gold: {
    pure: '#FFD700',
    neon: '#FFE44D',
    electric: '#FFDF33',
    soft: '#D4AF37',
    dark: '#B8860B',
    bright: '#FFE44D',
    deep: '#B8860B',
    glow: 'rgba(255, 215, 0, 0.6)',
    glowIntense: 'rgba(255, 215, 0, 0.9)',
    glowSubtle: 'rgba(255, 215, 0, 0.2)',
    glow10: 'rgba(255, 215, 0, 0.1)',
    glow15: 'rgba(255, 215, 0, 0.15)',
    glow20: 'rgba(255, 215, 0, 0.2)',
    glow30: 'rgba(255, 215, 0, 0.3)',
    glow40: 'rgba(255, 215, 0, 0.4)',
    glow50: 'rgba(255, 215, 0, 0.5)',
    glow60: 'rgba(255, 215, 0, 0.6)',
    border: 'rgba(255, 215, 0, 0.3)',
    border40: 'rgba(255, 215, 0, 0.4)',
    borderHover: 'rgba(255, 215, 0, 0.6)',
  },

  plasma: {
    pure: '#FF1493',
    neon: '#FF4DB8',
    electric: '#FF2BA8',
    soft: '#DB1485',
    dark: '#C71585',
    bright: '#FF4DB8',
    deep: '#C71585',
    glow: 'rgba(255, 20, 147, 0.6)',
    glowIntense: 'rgba(255, 20, 147, 0.9)',
    glowSubtle: 'rgba(255, 20, 147, 0.2)',
    glow10: 'rgba(255, 20, 147, 0.1)',
    glow15: 'rgba(255, 20, 147, 0.15)',
    glow20: 'rgba(255, 20, 147, 0.2)',
    glow30: 'rgba(255, 20, 147, 0.3)',
    glow40: 'rgba(255, 20, 147, 0.4)',
    glow50: 'rgba(255, 20, 147, 0.5)',
    glow60: 'rgba(255, 20, 147, 0.6)',
    border: 'rgba(255, 20, 147, 0.3)',
    border40: 'rgba(255, 20, 147, 0.4)',
    borderHover: 'rgba(255, 20, 147, 0.6)',
  },

  white: {
    pure: '#FFFFFF',
    soft: '#F5F5F7',
    muted: '#E5E5EA',
    dim: '#8E8E93',
    secondary: '#CCCCCC',
    subtle: 'rgba(255, 255, 255, 0.05)',
    ghost: 'rgba(255, 255, 255, 0.1)',
    ghostHover: 'rgba(255, 255, 255, 0.15)',
    border10: 'rgba(255, 255, 255, 0.1)',
    border15: 'rgba(255, 255, 255, 0.15)',
    border20: 'rgba(255, 255, 255, 0.2)',
    border25: 'rgba(255, 255, 255, 0.25)',
    text: 'rgba(255, 255, 255, 0.95)',
    text80: 'rgba(255, 255, 255, 0.8)',
    text60: 'rgba(255, 255, 255, 0.6)',
    text40: 'rgba(255, 255, 255, 0.4)',
    text20: 'rgba(255, 255, 255, 0.2)',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
  },

  // ═══ COLORES ACENTUADOS ADICIONALES ═══
  cyan: {
    pure: '#00FFFF',
    neon: '#4DFFFF',
    glow: 'rgba(0, 255, 255, 0.6)',
  },

  emerald: {
    pure: '#00FF88',
    neon: '#4DFF9F',
    glow: 'rgba(0, 255, 136, 0.6)',
  },

  // ═══ ESTADOS SEMÁNTICOS ═══
  success: {
    pure: '#00FF88',
    glow: 'rgba(0, 255, 136, 0.5)',
    surface: 'rgba(0, 255, 136, 0.1)',
  },

  warning: {
    pure: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.5)',
    surface: 'rgba(255, 215, 0, 0.1)',
  },

  error: {
    pure: '#FF4757',
    glow: 'rgba(255, 71, 87, 0.5)',
    surface: 'rgba(255, 71, 87, 0.1)',
  },

  info: {
    pure: '#00BFFF',
    glow: 'rgba(0, 191, 255, 0.5)',
    surface: 'rgba(0, 191, 255, 0.1)',
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌈 GRADIENTES SUPREMOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QUANTUM_GRADIENTS = {
  // ═══ GRADIENTES LINEALES PRIMARIOS ═══
  violetGold: 'linear-gradient(135deg, #8B00FF 0%, #FFD700 100%)',
  violetPlasma: 'linear-gradient(135deg, #8B00FF 0%, #FF1493 100%)',
  goldPlasma: 'linear-gradient(135deg, #FFD700 0%, #FF1493 100%)',
  voidViolet: 'linear-gradient(180deg, #000000 0%, #8B00FF 100%)',
  voidGold: 'linear-gradient(180deg, #000000 0%, #FFD700 100%)',
  goldViolet: 'linear-gradient(135deg, #FFD700 0%, #8B00FF 100%)',
  violetPrimary: 'linear-gradient(135deg, #8B00FF 0%, #B24BFF 100%)',
  goldPrimary: 'linear-gradient(135deg, #FFD700 0%, #FFE44D 100%)',
  plasmaPrimary: 'linear-gradient(135deg, #FF1493 0%, #FF4DB8 100%)',
  plasmaAccent: 'linear-gradient(135deg, #FF1493 0%, #FF4DB8 50%, #8B00FF 100%)',

  // ═══ GRADIENTES PARA TEXTO (WebkitBackgroundClip) ═══
  text: {
    violet: 'linear-gradient(135deg, #8B00FF 0%, #B24BFF 100%)',
    gold: 'linear-gradient(135deg, #FFD700 0%, #FFE44D 100%)',
    plasma: 'linear-gradient(135deg, #FF1493 0%, #FF4DB8 100%)',
    violetGold: 'linear-gradient(135deg, #8B00FF 0%, #FFD700 100%)',
    goldViolet: 'linear-gradient(135deg, #FFD700 0%, #8B00FF 100%)',
    violetPlasma: 'linear-gradient(135deg, #8B00FF 0%, #FF1493 100%)',
    holographic: 'linear-gradient(135deg, #8B00FF, #FFD700, #FF1493, #00FFFF)',
  },

  // ═══ GRADIENTES LINEALES CON PREFIJO ═══
  linear: {
    violetGold: 'linear-gradient(135deg, #8B00FF 0%, #FFD700 100%)',
    violetPlasma: 'linear-gradient(135deg, #8B00FF 0%, #FF1493 100%)',
    goldPlasma: 'linear-gradient(135deg, #FFD700 0%, #FF1493 100%)',
    goldViolet: 'linear-gradient(135deg, #FFD700 0%, #8B00FF 100%)',
  },

  // ═══ GRADIENTES MESH (CSS Houdini ready) ═══
  meshHolographic: `
    radial-gradient(ellipse at 20% 30%, rgba(139, 0, 255, 0.4) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(255, 215, 0, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 90%, rgba(255, 20, 147, 0.35) 0%, transparent 50%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)
  `,

  meshAurora: `
    radial-gradient(ellipse at 0% 0%, rgba(139, 0, 255, 0.5) 0%, transparent 40%),
    radial-gradient(ellipse at 100% 0%, rgba(0, 255, 255, 0.4) 0%, transparent 40%),
    radial-gradient(ellipse at 50% 100%, rgba(255, 20, 147, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 100% 100%, rgba(255, 215, 0, 0.35) 0%, transparent 45%),
    linear-gradient(180deg, #000000 0%, #050508 100%)
  `,

  meshNebula: `
    radial-gradient(ellipse at 30% 20%, rgba(139, 0, 255, 0.6) 0%, transparent 30%),
    radial-gradient(ellipse at 70% 60%, rgba(255, 20, 147, 0.5) 0%, transparent 35%),
    radial-gradient(ellipse at 90% 10%, rgba(255, 215, 0, 0.4) 0%, transparent 25%),
    radial-gradient(ellipse at 10% 80%, rgba(0, 255, 136, 0.3) 0%, transparent 30%),
    linear-gradient(180deg, #000000 0%, #0A0A0F 100%)
  `,

  meshInfinity: `
    radial-gradient(ellipse at 25% 25%, rgba(139, 0, 255, 0.5) 0%, transparent 45%),
    radial-gradient(ellipse at 75% 75%, rgba(255, 215, 0, 0.4) 0%, transparent 45%),
    radial-gradient(ellipse at 50% 50%, rgba(255, 20, 147, 0.3) 0%, transparent 60%),
    linear-gradient(180deg, #000000 0%, #0A0A0F 100%)
  `,

  // ═══ GRADIENTES ORB (para esferas 3D) ═══
  orbViolet:
    'radial-gradient(circle at 30% 30%, rgba(178, 75, 255, 0.9) 0%, rgba(139, 0, 255, 0.6) 40%, rgba(75, 0, 130, 0.3) 70%, transparent 100%)',
  orbGold:
    'radial-gradient(circle at 30% 30%, rgba(255, 228, 77, 0.9) 0%, rgba(255, 215, 0, 0.6) 40%, rgba(184, 134, 11, 0.3) 70%, transparent 100%)',
  orbPlasma:
    'radial-gradient(circle at 30% 30%, rgba(255, 77, 184, 0.9) 0%, rgba(255, 20, 147, 0.6) 40%, rgba(199, 21, 133, 0.3) 70%, transparent 100%)',

  // ═══ GRADIENTES CÓNICOS (para orbs) ═══
  conicSpectrum:
    'conic-gradient(from 0deg at 50% 50%, #8B00FF, #FF1493, #FFD700, #00FFFF, #8B00FF)',
  conicVioletGold: 'conic-gradient(from 0deg at 50% 50%, #8B00FF, #FFD700, #8B00FF)',
  conicPlasma: 'conic-gradient(from 0deg at 50% 50%, #FF1493, #8B00FF, #FF1493)',

  // ═══ GRADIENTES RADIALES (para glows) ═══
  radialViolet: 'radial-gradient(circle at center, rgba(139, 0, 255, 0.8) 0%, transparent 70%)',
  radialGold: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.8) 0%, transparent 70%)',
  radialPlasma: 'radial-gradient(circle at center, rgba(255, 20, 147, 0.8) 0%, transparent 70%)',

  // ═══ GRADIENTES ANIMADOS (keyframes defined separately) ═══
  animatedHolo: `
    linear-gradient(
      var(--gradient-angle, 45deg),
      #8B00FF,
      #FFD700,
      #FF1493,
      #00FFFF,
      #8B00FF
    )
  `,
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 SOMBRAS Y GLOWS SUPREMOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QUANTUM_SHADOWS = {
  // ═══ SOMBRAS BASE ═══
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
  md: '0 4px 8px rgba(0, 0, 0, 0.6)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.7)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.8)',
  '2xl': '0 24px 64px rgba(0, 0, 0, 0.9)',

  // ═══ ELEVACIÓN (MATERIAL DESIGN INSPIRED) ═══
  elevation: {
    0: 'none',
    1: '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
    2: '0 3px 6px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.4)',
    3: '0 6px 12px rgba(0, 0, 0, 0.55), 0 4px 8px rgba(0, 0, 0, 0.45)',
    4: '0 10px 20px rgba(0, 0, 0, 0.6), 0 6px 12px rgba(0, 0, 0, 0.5)',
    5: '0 16px 32px rgba(0, 0, 0, 0.65), 0 8px 16px rgba(0, 0, 0, 0.55)',
    6: '0 24px 48px rgba(0, 0, 0, 0.7), 0 12px 24px rgba(0, 0, 0, 0.6)',
  },

  // ═══ GLOWS NEON ═══
  glowViolet: {
    sm: '0 0 8px rgba(139, 0, 255, 0.4)',
    md: '0 0 16px rgba(139, 0, 255, 0.5), 0 0 32px rgba(139, 0, 255, 0.3)',
    lg: '0 0 24px rgba(139, 0, 255, 0.6), 0 0 48px rgba(139, 0, 255, 0.4), 0 0 72px rgba(139, 0, 255, 0.2)',
    xl: '0 0 32px rgba(139, 0, 255, 0.7), 0 0 64px rgba(139, 0, 255, 0.5), 0 0 96px rgba(139, 0, 255, 0.3), 0 0 128px rgba(139, 0, 255, 0.15)',
    pulse:
      '0 0 40px rgba(139, 0, 255, 0.8), 0 0 80px rgba(139, 0, 255, 0.6), 0 0 120px rgba(139, 0, 255, 0.4)',
  },

  glowGold: {
    sm: '0 0 8px rgba(255, 215, 0, 0.4)',
    md: '0 0 16px rgba(255, 215, 0, 0.5), 0 0 32px rgba(255, 215, 0, 0.3)',
    lg: '0 0 24px rgba(255, 215, 0, 0.6), 0 0 48px rgba(255, 215, 0, 0.4), 0 0 72px rgba(255, 215, 0, 0.2)',
    xl: '0 0 32px rgba(255, 215, 0, 0.7), 0 0 64px rgba(255, 215, 0, 0.5), 0 0 96px rgba(255, 215, 0, 0.3), 0 0 128px rgba(255, 215, 0, 0.15)',
    pulse:
      '0 0 40px rgba(255, 215, 0, 0.8), 0 0 80px rgba(255, 215, 0, 0.6), 0 0 120px rgba(255, 215, 0, 0.4)',
  },

  glowPlasma: {
    sm: '0 0 8px rgba(255, 20, 147, 0.4)',
    md: '0 0 16px rgba(255, 20, 147, 0.5), 0 0 32px rgba(255, 20, 147, 0.3)',
    lg: '0 0 24px rgba(255, 20, 147, 0.6), 0 0 48px rgba(255, 20, 147, 0.4), 0 0 72px rgba(255, 20, 147, 0.2)',
    xl: '0 0 32px rgba(255, 20, 147, 0.7), 0 0 64px rgba(255, 20, 147, 0.5), 0 0 96px rgba(255, 20, 147, 0.3), 0 0 128px rgba(255, 20, 147, 0.15)',
    pulse:
      '0 0 40px rgba(255, 20, 147, 0.8), 0 0 80px rgba(255, 20, 147, 0.6), 0 0 120px rgba(255, 20, 147, 0.4)',
  },

  glowCyan: {
    sm: '0 0 8px rgba(0, 255, 255, 0.4)',
    md: '0 0 16px rgba(0, 255, 255, 0.5), 0 0 32px rgba(0, 255, 255, 0.3)',
    lg: '0 0 24px rgba(0, 255, 255, 0.6), 0 0 48px rgba(0, 255, 255, 0.4), 0 0 72px rgba(0, 255, 255, 0.2)',
  },

  // ═══ INNER GLOWS ═══
  innerViolet: 'inset 0 0 20px rgba(139, 0, 255, 0.3), inset 0 0 40px rgba(139, 0, 255, 0.15)',
  innerGold: 'inset 0 0 20px rgba(255, 215, 0, 0.3), inset 0 0 40px rgba(255, 215, 0, 0.15)',
  innerPlasma: 'inset 0 0 20px rgba(255, 20, 147, 0.3), inset 0 0 40px rgba(255, 20, 147, 0.15)',

  // ═══ INTENSE GLOW SHORTCUTS (acceso directo rápido) ═══
  glowVioletIntense:
    '0 0 32px rgba(139, 0, 255, 0.8), 0 0 64px rgba(139, 0, 255, 0.6), 0 0 96px rgba(139, 0, 255, 0.4)',
  glowGoldIntense:
    '0 0 32px rgba(255, 215, 0, 0.8), 0 0 64px rgba(255, 215, 0, 0.6), 0 0 96px rgba(255, 215, 0, 0.4)',
  glowPlasmaIntense:
    '0 0 32px rgba(255, 20, 147, 0.8), 0 0 64px rgba(255, 20, 147, 0.6), 0 0 96px rgba(255, 20, 147, 0.4)',

  // ═══ MULTI-LAYER (para elementos hero) ═══
  heroCard: `
    0 0 0 1px rgba(139, 0, 255, 0.1),
    0 0 20px rgba(139, 0, 255, 0.1),
    0 8px 32px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.05)
  `,
  heroButton: `
    0 0 0 1px rgba(139, 0, 255, 0.3),
    0 0 16px rgba(139, 0, 255, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.4)
  `,

  // ═══ NEON SHORTCUTS (acceso directo para componentes) ═══
  neon: {
    violet: {
      sm: '0 0 8px rgba(139, 0, 255, 0.4)',
      md: '0 0 16px rgba(139, 0, 255, 0.5), 0 0 32px rgba(139, 0, 255, 0.3)',
      lg: '0 0 24px rgba(139, 0, 255, 0.6), 0 0 48px rgba(139, 0, 255, 0.4)',
    },
    gold: {
      sm: '0 0 8px rgba(255, 215, 0, 0.4)',
      md: '0 0 16px rgba(255, 215, 0, 0.5), 0 0 32px rgba(255, 215, 0, 0.3)',
      lg: '0 0 24px rgba(255, 215, 0, 0.6), 0 0 48px rgba(255, 215, 0, 0.4)',
    },
    plasma: {
      sm: '0 0 8px rgba(255, 20, 147, 0.4)',
      md: '0 0 16px rgba(255, 20, 147, 0.5), 0 0 32px rgba(255, 20, 147, 0.3)',
      lg: '0 0 24px rgba(255, 20, 147, 0.6), 0 0 48px rgba(255, 20, 147, 0.4)',
    },
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🪟 GLASS MORPHISM GEN-5
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QUANTUM_GLASS = {
  // ═══ NIVELES DE BLUR ═══
  blur: {
    none: 'blur(0px)',
    xs: 'blur(4px)',
    sm: 'blur(8px)',
    md: 'blur(16px)',
    lg: 'blur(24px)',
    xl: 'blur(40px)',
    '2xl': 'blur(64px)',
    '3xl': 'blur(96px)',
    saturate: 'saturate(180%)',
  },

  // ═══ SUPERFICIES DE VIDRIO ═══
  surface: {
    // Valores por defecto (standard)
    background: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.1)',
    blur: 'blur(20px) saturate(180%)',

    ghost: {
      background: 'rgba(255, 255, 255, 0.02)',
      backdropFilter: 'blur(8px) saturate(150%)',
      border: '1px solid rgba(255, 255, 255, 0.03)',
    },
    subtle: {
      background: 'rgba(255, 255, 255, 0.04)',
      backdropFilter: 'blur(12px) saturate(160%)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
    },
    light: {
      background: 'rgba(255, 255, 255, 0.06)',
      backdropFilter: 'blur(16px) saturate(170%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
    },
    standard: {
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(24px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
    },
    strong: {
      background: 'rgba(255, 255, 255, 0.12)',
      backdropFilter: 'blur(32px) saturate(200%)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
    },
    frosted: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(40px) saturate(200%)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    card: {
      background:
        'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
      backdropFilter: 'blur(24px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    },
    modal: {
      background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.9) 0%, rgba(5, 5, 8, 0.95) 100%)',
      backdropFilter: 'blur(40px) saturate(180%)',
      border: '1px solid rgba(139, 0, 255, 0.2)',
      boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(139, 0, 255, 0.15)',
    },
  },

  // ═══ VIDRIO CON TINTE DE COLOR ═══
  tinted: {
    violet: {
      background: 'rgba(139, 0, 255, 0.08)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(139, 0, 255, 0.2)',
    },
    gold: {
      background: 'rgba(255, 215, 0, 0.06)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 215, 0, 0.15)',
    },
    plasma: {
      background: 'rgba(255, 20, 147, 0.06)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 20, 147, 0.15)',
    },
  },

  // ═══ LIQUID METAL GLASS (gen-5) ═══
  liquidMetal: {
    // Root aliases (para acceso directo)
    background:
      'linear-gradient(135deg, rgba(139, 0, 255, 0.15) 0%, rgba(75, 0, 130, 0.08) 50%, rgba(139, 0, 255, 0.15) 100%)',
    backdropFilter: 'blur(24px) saturate(200%)',
    border: '1px solid rgba(139, 0, 255, 0.3)',
    boxShadow:
      'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 0, 255, 0.2)',
    // Variants
    chrome: {
      background:
        'linear-gradient(135deg, rgba(200, 200, 220, 0.1) 0%, rgba(150, 150, 180, 0.05) 50%, rgba(200, 200, 220, 0.1) 100%)',
      backdropFilter: 'blur(24px) saturate(200%) brightness(110%)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow:
        'inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.2), 0 8px 32px rgba(0, 0, 0, 0.5)',
    },
    gold: {
      background:
        'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(218, 165, 32, 0.08) 50%, rgba(255, 215, 0, 0.15) 100%)',
      backdropFilter: 'blur(24px) saturate(200%)',
      border: '1px solid rgba(255, 215, 0, 0.3)',
      boxShadow:
        'inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.2)',
    },
    violet: {
      background:
        'linear-gradient(135deg, rgba(139, 0, 255, 0.15) 0%, rgba(75, 0, 130, 0.08) 50%, rgba(139, 0, 255, 0.15) 100%)',
      backdropFilter: 'blur(24px) saturate(200%)',
      border: '1px solid rgba(139, 0, 255, 0.3)',
      boxShadow:
        'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 0, 255, 0.2)',
    },
  },

  // ═══ ALIASES DE NIVEL RAÍZ (para acceso simplificado) ═══
  ghost: {
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(8px) saturate(150%)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    blur: 'blur(8px) saturate(150%)',
  },
  elevated: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    blur: 'blur(20px) saturate(180%)',
  },
  frosted: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(40px) saturate(200%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    blur: 'blur(40px) saturate(200%)',
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚡ FÍSICA SPRING — AMORTIGUAMIENTO CRÍTICO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QUANTUM_SPRING = {
  // ═══ PRESETS DE SPRING (Framer Motion) ═══
  instant: { type: 'spring', stiffness: 800, damping: 40, mass: 0.5 },
  snappy: { type: 'spring', stiffness: 500, damping: 35, mass: 0.8 },
  quick: { type: 'spring', stiffness: 400, damping: 30, mass: 1 },
  balanced: { type: 'spring', stiffness: 300, damping: 25, mass: 1 },
  smooth: { type: 'spring', stiffness: 200, damping: 25, mass: 1.2 },
  gentle: { type: 'spring', stiffness: 150, damping: 20, mass: 1.5 },
  slow: { type: 'spring', stiffness: 100, damping: 20, mass: 2 },
  bouncy: { type: 'spring', stiffness: 400, damping: 15, mass: 1 },
  extraBouncy: { type: 'spring', stiffness: 500, damping: 10, mass: 0.8 },
  wobbly: { type: 'spring', stiffness: 350, damping: 12, mass: 1 },
  elastic: { type: 'spring', stiffness: 600, damping: 15, mass: 0.5 },

  // ═══ QUANTUM EFFECTS (efectos especiales) ═══
  quantum: { type: 'spring', stiffness: 260, damping: 20, mass: 0.8 },
  tilt3D: { type: 'spring', stiffness: 180, damping: 22, mass: 1.1 },

  // ═══ PHYSICS-BASED TIMING FUNCTIONS (CSS) ═══
  easing: {
    springIn: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    springOut: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    springInOut: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smoothIn: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smoothOut: 'cubic-bezier(0, 0, 0.2, 1)',
    smoothInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    expoIn: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
    expoOut: 'cubic-bezier(0.19, 1, 0.22, 1)',
    expoInOut: 'cubic-bezier(0.87, 0, 0.13, 1)',
    backIn: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
    backOut: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    backInOut: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // ═══ DURACIONES OPTIMIZADAS ═══
  duration: {
    instant: 0.1,
    fast: 0.15,
    quick: 0.2,
    normal: 0.3,
    smooth: 0.4,
    slow: 0.6,
    dramatic: 1,
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 3D TILT & PERSPECTIVE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QUANTUM_TILT = {
  subtle: { maxTilt: 5, perspective: 1500, scale: 1.02, speed: 1000, glare: false },
  standard: {
    maxTilt: 10,
    perspective: 1200,
    scale: 1.03,
    speed: 800,
    glare: true,
    maxGlare: 0.15,
  },
  intense: { maxTilt: 15, perspective: 1000, scale: 1.05, speed: 600, glare: true, maxGlare: 0.25 },
  dramatic: { maxTilt: 20, perspective: 800, scale: 1.08, speed: 400, glare: true, maxGlare: 0.35 },
  extreme: { maxTilt: 25, perspective: 600, scale: 1.1, speed: 300, glare: true, maxGlare: 0.5 },

  perspective: {
    none: 'none',
    xs: '2000px',
    sm: '1500px',
    md: '1200px',
    lg: '1000px',
    xl: '800px',
    '2xl': '600px',
  },

  origin: {
    center: 'center center',
    top: 'center top',
    bottom: 'center bottom',
    left: 'left center',
    right: 'right center',
    topLeft: 'left top',
    topRight: 'right top',
    bottomLeft: 'left bottom',
    bottomRight: 'right bottom',
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 ESTADOS EMOCIONALES / MOODS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QUANTUM_MOODS = {
  flow: {
    primary: QUANTUM_PALETTE.violet.pure,
    secondary: QUANTUM_PALETTE.gold.pure,
    accentColor: '#8B00FF',
    glow: QUANTUM_SHADOWS.glowViolet.lg,
    gradient: QUANTUM_GRADIENTS.violetGold,
    spring: QUANTUM_SPRING.smooth,
    description: 'Estado de productividad y concentración óptima',
  },
  calm: {
    primary: QUANTUM_PALETTE.violet.soft,
    secondary: QUANTUM_PALETTE.cyan.pure,
    accentColor: '#7B2FBE',
    glow: QUANTUM_SHADOWS.glowViolet.md,
    gradient: 'linear-gradient(135deg, #7B2FBE 0%, #00FFFF 100%)',
    spring: QUANTUM_SPRING.gentle,
    description: 'Ambiente relajado y tranquilo',
  },
  euphoric: {
    primary: QUANTUM_PALETTE.gold.pure,
    secondary: QUANTUM_PALETTE.plasma.pure,
    accentColor: '#FFD700',
    glow: QUANTUM_SHADOWS.glowGold.xl,
    gradient: QUANTUM_GRADIENTS.goldPlasma,
    spring: QUANTUM_SPRING.bouncy,
    description: 'Celebración y éxito',
  },
  stress: {
    primary: QUANTUM_PALETTE.plasma.pure,
    secondary: QUANTUM_PALETTE.error.pure,
    accentColor: '#FF1493',
    glow: QUANTUM_SHADOWS.glowPlasma.lg,
    gradient: 'linear-gradient(135deg, #FF1493 0%, #FF4757 100%)',
    spring: QUANTUM_SPRING.quick,
    description: 'Alerta y atención urgente',
  },
  focus: {
    primary: QUANTUM_PALETTE.violet.electric,
    secondary: QUANTUM_PALETTE.white.pure,
    accentColor: '#9933FF',
    glow: QUANTUM_SHADOWS.glowViolet.md,
    gradient: 'linear-gradient(135deg, #9933FF 0%, #FFFFFF 100%)',
    spring: QUANTUM_SPRING.snappy,
    description: 'Máxima concentración',
  },
  night: {
    primary: QUANTUM_PALETTE.void.deep,
    secondary: QUANTUM_PALETTE.violet.dark,
    accentColor: '#4B0082',
    glow: 'none',
    gradient: QUANTUM_GRADIENTS.voidViolet,
    spring: QUANTUM_SPRING.slow,
    description: 'Modo nocturno ultra oscuro',
  },
  neutral: {
    primary: QUANTUM_PALETTE.white.muted,
    secondary: QUANTUM_PALETTE.violet.soft,
    accentColor: '#8B00FF',
    glow: QUANTUM_SHADOWS.glowViolet.sm,
    gradient: 'linear-gradient(135deg, #8B00FF 0%, #FFD700 100%)',
    spring: QUANTUM_SPRING.balanced,
    description: 'Estado neutral equilibrado',
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📐 LAYOUT & SPACING
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QUANTUM_LAYOUT = {
  radius: {
    none: '0px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '48px',
    full: '9999px',
    pill: '100px',
    card: '16px',
    cardLarge: '24px',
    button: '12px',
    buttonLarge: '16px',
  },

  space: {
    0: '0px',
    px: '1px',
    0.5: '2px',
    1: '4px',
    1.5: '6px',
    2: '8px',
    2.5: '10px',
    3: '12px',
    3.5: '14px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    11: '44px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
    28: '112px',
    32: '128px',
    36: '144px',
    40: '160px',
    44: '176px',
    48: '192px',
    52: '208px',
    56: '224px',
    60: '240px',
    64: '256px',
    72: '288px',
    80: '320px',
    96: '384px',
  },

  container: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1920px',
    full: '100%',
  },

  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    overlay: 400,
    modal: 500,
    popover: 600,
    toast: 700,
    tooltip: 800,
    max: 9999,
  },

  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1920px',
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔤 TIPOGRAFÍA SUPREMA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QUANTUM_TYPOGRAPHY = {
  fontFamily: {
    display: '"SF Pro Display", "Inter", system-ui, sans-serif',
    body: '"SF Pro Text", "Inter", system-ui, sans-serif',
    mono: '"SF Mono", "JetBrains Mono", "Fira Code", monospace',
  },

  fontSize: {
    '3xs': '0.625rem',
    '2xs': '0.6875rem',
    xs: '0.75rem',
    sm: '0.8125rem',
    base: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },

  fontWeight: {
    thin: 100,
    extraLight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  lineHeight: { none: 1, tight: 1.1, snug: 1.25, normal: 1.5, relaxed: 1.625, loose: 2 },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
    ultraWide: '0.2em',
  },

  preset: {
    heroTitle: { fontSize: '4.5rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' },
    pageTitle: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.015em' },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    cardTitle: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.005em',
    },
    bodyLarge: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.6, letterSpacing: '0em' },
    body: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0em' },
    bodySmall: {
      fontSize: '0.8125rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.005em',
    },
    label: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.02em',
      textTransform: 'uppercase' as const,
    },
    caption: { fontSize: '0.6875rem', fontWeight: 400, lineHeight: 1.4, letterSpacing: '0.01em' },
    mono: {
      fontFamily: '"SF Mono", "JetBrains Mono", monospace',
      fontSize: '0.8125rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0em',
    },
    stat: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' },
    statLarge: { fontSize: '3rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' },
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🏦 COLORES DE BANCOS (CHRONOS SPECIFIC)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const BANK_COLORS = {
  boveda_monte: {
    primary: '#8B00FF',
    glow: 'rgba(139, 0, 255, 0.5)',
    gradient: 'linear-gradient(135deg, #8B00FF 0%, #B24BFF 100%)',
    icon: '🏔️',
    name: 'Bóveda Monte',
  },
  boveda_usa: {
    primary: '#00BFFF',
    glow: 'rgba(0, 191, 255, 0.5)',
    gradient: 'linear-gradient(135deg, #00BFFF 0%, #4DD2FF 100%)',
    icon: '🇺🇸',
    name: 'Bóveda USA',
  },
  profit: {
    primary: '#00FF88',
    glow: 'rgba(0, 255, 136, 0.5)',
    gradient: 'linear-gradient(135deg, #00FF88 0%, #4DFFA8 100%)',
    icon: '📈',
    name: 'Profit',
  },
  leftie: {
    primary: '#FF1493',
    glow: 'rgba(255, 20, 147, 0.5)',
    gradient: 'linear-gradient(135deg, #FF1493 0%, #FF4DB8 100%)',
    icon: '🎯',
    name: 'Leftie',
  },
  azteca: {
    primary: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.5)',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFE44D 100%)',
    icon: '🏛️',
    name: 'Azteca',
  },
  flete_sur: {
    primary: '#FF6B35',
    glow: 'rgba(255, 107, 53, 0.5)',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF8F66 100%)',
    icon: '🚛',
    name: 'Flete Sur',
  },
  utilidades: {
    primary: '#00FFFF',
    glow: 'rgba(0, 255, 255, 0.5)',
    gradient: 'linear-gradient(135deg, #00FFFF 0%, #4DFFFF 100%)',
    icon: '💎',
    name: 'Utilidades',
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎬 ANIMACIONES AVANZADAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QUANTUM_ANIMATIONS = {
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  scaleInBounce: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 15 } },
    exit: { opacity: 0, scale: 0.8 },
  },
  slideInBottom: {
    initial: { opacity: 0, y: '100%' },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' },
  },
  slideInTop: {
    initial: { opacity: 0, y: '-100%' },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '-100%' },
  },
  staggerContainer: { animate: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } },
  staggerContainerSlow: { animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } },
  staggerItem: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
  hoverLift: {
    whileHover: { y: -4, transition: { duration: 0.2 } },
    whileTap: { y: 0, scale: 0.98 },
  },
  hoverScale: {
    whileHover: { scale: 1.02, transition: { duration: 0.2 } },
    whileTap: { scale: 0.98 },
  },
  hoverGlow: {
    whileHover: {
      boxShadow: '0 0 20px rgba(139, 0, 255, 0.4), 0 0 40px rgba(139, 0, 255, 0.2)',
      transition: { duration: 0.3 },
    },
  },

  keyframes: {
    pulse:
      '@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }',
    glow: '@keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(139, 0, 255, 0.4); } 50% { box-shadow: 0 0 40px rgba(139, 0, 255, 0.6), 0 0 60px rgba(139, 0, 255, 0.4); } }',
    float:
      '@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }',
    spin: '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }',
    shimmer:
      '@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }',
    gradientShift:
      '@keyframes gradientShift { 0% { --gradient-angle: 0deg; } 100% { --gradient-angle: 360deg; } }',
    scan: '@keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }',
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔧 SCROLL & HOVER EFFECTS CONFIG
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QUANTUM_EFFECTS = {
  scroll: {
    fadeInOnScroll: {
      initial: { opacity: 0, y: 50 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: '-100px' },
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
    parallaxSlow: { yFactor: 0.1, smoothing: 0.1 },
    parallaxMedium: { yFactor: 0.3, smoothing: 0.15 },
    parallaxFast: { yFactor: 0.5, smoothing: 0.2 },
    scaleOnScroll: {
      initial: { scale: 0.8, opacity: 0 },
      whileInView: { scale: 1, opacity: 1 },
      viewport: { once: true },
      transition: { type: 'spring', stiffness: 300, damping: 25 },
    },
  },

  hover: {
    lift: { y: -8, boxShadow: QUANTUM_SHADOWS.elevation[4], transition: QUANTUM_SPRING.snappy },
    glow: { boxShadow: QUANTUM_SHADOWS.glowViolet.lg, transition: QUANTUM_SPRING.smooth },
    scale: { scale: 1.03, transition: QUANTUM_SPRING.snappy },
    tilt: QUANTUM_TILT.standard,
    magnetic: { stiffness: 150, damping: 15, mass: 0.1 },
  },

  cursor: {
    default: 'default',
    pointer: 'pointer',
    grab: 'grab',
    grabbing: 'grabbing',
    quantum: "url('/cursors/quantum.svg'), pointer",
    orb: "url('/cursors/orb.svg'), pointer",
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 EXPORTS PRINCIPALES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QUANTUM_DESIGN_SYSTEM = {
  palette: QUANTUM_PALETTE,
  gradients: QUANTUM_GRADIENTS,
  shadows: QUANTUM_SHADOWS,
  glass: QUANTUM_GLASS,
  spring: QUANTUM_SPRING,
  tilt: QUANTUM_TILT,
  moods: QUANTUM_MOODS,
  layout: QUANTUM_LAYOUT,
  typography: QUANTUM_TYPOGRAPHY,
  animations: QUANTUM_ANIMATIONS,
  effects: QUANTUM_EFFECTS,
  bankColors: BANK_COLORS,
} as const

export type QuantumPalette = typeof QUANTUM_PALETTE
export type QuantumGradients = typeof QUANTUM_GRADIENTS
export type QuantumShadows = typeof QUANTUM_SHADOWS
export type QuantumGlass = typeof QUANTUM_GLASS
export type QuantumSpring = typeof QUANTUM_SPRING
export type QuantumTilt = typeof QUANTUM_TILT
export type QuantumMoods = typeof QUANTUM_MOODS
export type QuantumMood = keyof typeof QUANTUM_MOODS
export type QuantumLayout = typeof QUANTUM_LAYOUT
export type QuantumTypography = typeof QUANTUM_TYPOGRAPHY
export type QuantumAnimations = typeof QUANTUM_ANIMATIONS
export type QuantumEffects = typeof QUANTUM_EFFECTS
export type BankColors = typeof BANK_COLORS
export type BankId = keyof typeof BANK_COLORS
export type BancoId = BankId

export default QUANTUM_DESIGN_SYSTEM
