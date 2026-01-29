/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ✨ POST-PROCESSING - Efectos de Post-Procesamiento Cinematográficos
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export * from './CustomShaderMaterial'
export * from './ShaderLibrary'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎬 POST-PROCESSING PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

import type { PostProcessingPipeline } from '../types'

/**
 * Presets de post-procesamiento para diferentes estilos visuales
 */
export const PostProcessingPresets: Record<string, PostProcessingPipeline> = {
  // Cinematográfico - Estilo película
  cinematic: {
    bloom: {
      intensity: 1.5,
      threshold: 0.8,
      smoothing: 0.3,
      radius: 0.8,
      luminanceThreshold: 0.8,
      luminanceSmoothing: 0.3,
      mipmapBlur: true,
    },
    chromaticAberration: {
      offset: [0.001, 0.001],
      radialModulation: true,
      modulationOffset: 0.5,
    },
    vignette: {
      offset: 0.4,
      darkness: 0.5,
    },
    filmGrain: {
      intensity: 0.05,
      opacity: 0.5,
    },
    colorGrading: {
      contrast: 1.1,
      saturation: 1.05,
      brightness: 1.0,
      hue: 0,
      temperature: 0,
      tint: 0,
    },
  },

  // Cyberpunk - Neón y glitch
  cyberpunk: {
    bloom: {
      intensity: 2.5,
      threshold: 0.5,
      smoothing: 0.5,
      radius: 1.0,
      luminanceThreshold: 0.5,
      luminanceSmoothing: 0.5,
      mipmapBlur: true,
    },
    chromaticAberration: {
      offset: [0.005, 0.005],
      radialModulation: false,
      modulationOffset: 0,
    },
    glitch: {
      delay: [1.5, 3.5],
      duration: [0.1, 0.3],
      strength: [0.2, 0.6],
    },
    scanlines: {
      count: 400,
      intensity: 0.1,
    },
    colorGrading: {
      contrast: 1.2,
      saturation: 1.3,
      brightness: 0.95,
      hue: 0,
      temperature: -0.1,
      tint: 0.1,
    },
  },

  // Ethereal - Suave y soñador
  ethereal: {
    bloom: {
      intensity: 3.0,
      threshold: 0.3,
      smoothing: 0.8,
      radius: 1.2,
      luminanceThreshold: 0.3,
      luminanceSmoothing: 0.8,
      mipmapBlur: true,
    },
    vignette: {
      offset: 0.5,
      darkness: 0.3,
    },
    noise: {
      opacity: 0.02,
      premultiply: true,
    },
    colorGrading: {
      contrast: 0.95,
      saturation: 0.9,
      brightness: 1.1,
      hue: 0,
      temperature: 0.1,
      tint: 0.05,
    },
  },

  // Dark Mode - Oscuro y elegante
  darkMode: {
    bloom: {
      intensity: 1.2,
      threshold: 0.9,
      smoothing: 0.2,
      radius: 0.5,
      luminanceThreshold: 0.9,
      luminanceSmoothing: 0.2,
      mipmapBlur: true,
    },
    vignette: {
      offset: 0.3,
      darkness: 0.7,
    },
    colorGrading: {
      contrast: 1.15,
      saturation: 0.85,
      brightness: 0.9,
      hue: 0,
      temperature: -0.05,
      tint: 0,
    },
  },

  // Synthwave - Retro 80s
  synthwave: {
    bloom: {
      intensity: 2.0,
      threshold: 0.6,
      smoothing: 0.4,
      radius: 0.9,
      luminanceThreshold: 0.6,
      luminanceSmoothing: 0.4,
      mipmapBlur: true,
    },
    chromaticAberration: {
      offset: [0.003, 0.002],
      radialModulation: true,
      modulationOffset: 0.3,
    },
    scanlines: {
      count: 300,
      intensity: 0.15,
    },
    colorGrading: {
      contrast: 1.1,
      saturation: 1.4,
      brightness: 1.0,
      hue: 0.05,
      temperature: 0.2,
      tint: 0.2,
    },
  },

  // Minimal - Limpio y simple
  minimal: {
    bloom: {
      intensity: 0.8,
      threshold: 0.95,
      smoothing: 0.1,
      radius: 0.3,
      luminanceThreshold: 0.95,
      luminanceSmoothing: 0.1,
      mipmapBlur: true,
    },
    vignette: {
      offset: 0.6,
      darkness: 0.2,
    },
    colorGrading: {
      contrast: 1.0,
      saturation: 0.95,
      brightness: 1.0,
      hue: 0,
      temperature: 0,
      tint: 0,
    },
  },

  // Performance - Mínimo impacto
  performance: {
    bloom: {
      intensity: 0.5,
      threshold: 0.9,
      smoothing: 0.1,
      radius: 0.2,
      luminanceThreshold: 0.9,
      luminanceSmoothing: 0.1,
      mipmapBlur: false,
    },
  },
}

/**
 * Crear configuración de post-procesamiento personalizada
 */
export function createPostProcessingConfig(
  preset: keyof typeof PostProcessingPresets,
  overrides?: Partial<PostProcessingPipeline>,
): PostProcessingPipeline {
  return {
    ...PostProcessingPresets[preset],
    ...overrides,
  }
}

/**
 * Interpolar entre dos configuraciones de post-procesamiento
 */
export function lerpPostProcessing(
  from: PostProcessingPipeline,
  to: PostProcessingPipeline,
  t: number,
): PostProcessingPipeline {
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  const result: PostProcessingPipeline = {}

  // Bloom
  if (from.bloom && to.bloom) {
    result.bloom = {
      intensity: lerp(from.bloom.intensity, to.bloom.intensity, t),
      threshold: lerp(from.bloom.threshold, to.bloom.threshold, t),
      smoothing: lerp(from.bloom.smoothing, to.bloom.smoothing, t),
      radius: lerp(from.bloom.radius, to.bloom.radius, t),
      luminanceThreshold: lerp(from.bloom.luminanceThreshold, to.bloom.luminanceThreshold, t),
      luminanceSmoothing: lerp(from.bloom.luminanceSmoothing, to.bloom.luminanceSmoothing, t),
      mipmapBlur: t < 0.5 ? from.bloom.mipmapBlur : to.bloom.mipmapBlur,
    }
  }

  // Vignette
  if (from.vignette && to.vignette) {
    result.vignette = {
      offset: lerp(from.vignette.offset, to.vignette.offset, t),
      darkness: lerp(from.vignette.darkness, to.vignette.darkness, t),
    }
  }

  // Chromatic Aberration
  if (from.chromaticAberration && to.chromaticAberration) {
    result.chromaticAberration = {
      offset: [
        lerp(from.chromaticAberration.offset[0], to.chromaticAberration.offset[0], t),
        lerp(from.chromaticAberration.offset[1], to.chromaticAberration.offset[1], t),
      ],
      radialModulation:
        t < 0.5
          ? from.chromaticAberration.radialModulation
          : to.chromaticAberration.radialModulation,
      modulationOffset: lerp(
        from.chromaticAberration.modulationOffset,
        to.chromaticAberration.modulationOffset,
        t,
      ),
    }
  }

  // Film Grain
  if (from.filmGrain && to.filmGrain) {
    result.filmGrain = {
      intensity: lerp(from.filmGrain.intensity, to.filmGrain.intensity, t),
      opacity: lerp(from.filmGrain.opacity, to.filmGrain.opacity, t),
    }
  }

  // Color Grading
  if (from.colorGrading && to.colorGrading) {
    result.colorGrading = {
      contrast: lerp(from.colorGrading.contrast, to.colorGrading.contrast, t),
      saturation: lerp(from.colorGrading.saturation, to.colorGrading.saturation, t),
      brightness: lerp(from.colorGrading.brightness, to.colorGrading.brightness, t),
      hue: lerp(from.colorGrading.hue, to.colorGrading.hue, t),
      temperature: lerp(from.colorGrading.temperature, to.colorGrading.temperature, t),
      tint: lerp(from.colorGrading.tint, to.colorGrading.tint, t),
    }
  }

  return result
}

export default PostProcessingPresets
