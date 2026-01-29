/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 RENDER PIPELINE - Pipeline de Renderizado Avanzado
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Pipeline configurable para renderizado multi-pass con soporte para:
 * - Deferred rendering
 * - Forward+ rendering
 * - Path tracing
 * - Screen-space effects
 */

import * as THREE from 'three'
import type { PostProcessingPipeline, QualityLevel } from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 RENDER PASS TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type RenderPassType =
  | 'geometry'
  | 'lighting'
  | 'shadows'
  | 'reflections'
  | 'ambient-occlusion'
  | 'post-processing'
  | 'ui'
  | 'debug'

export interface RenderPassConfig {
  type: RenderPassType
  enabled: boolean
  priority: number
  renderTarget?: THREE.WebGLRenderTarget
  clear?: boolean
  clearColor?: THREE.Color
  clearAlpha?: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎬 RENDER PIPELINE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class RenderPipeline {
  private passes: Map<string, RenderPassConfig> = new Map()
  private sortedPasses: RenderPassConfig[] = []
  private needsSort = false

  // Render targets
  private gBuffer: {
    position: THREE.WebGLRenderTarget
    normal: THREE.WebGLRenderTarget
    albedo: THREE.WebGLRenderTarget
    depth: THREE.WebGLRenderTarget
  } | null = null

  // Quality settings
  private quality: QualityLevel

  // Post-processing
  private postProcessing: PostProcessingPipeline = {}

  constructor(quality: QualityLevel) {
    this.quality = quality
    this.setupDefaultPasses()
  }

  private setupDefaultPasses(): void {
    // Geometry pass
    this.addPass('geometry', {
      type: 'geometry',
      enabled: true,
      priority: 0,
      clear: true,
    })

    // Shadow pass
    this.addPass('shadows', {
      type: 'shadows',
      enabled: this.quality.shadows,
      priority: 1,
    })

    // Lighting pass
    this.addPass('lighting', {
      type: 'lighting',
      enabled: true,
      priority: 2,
    })

    // Reflections pass
    this.addPass('reflections', {
      type: 'reflections',
      enabled: this.quality.reflections,
      priority: 3,
    })

    // AO pass
    this.addPass('ambient-occlusion', {
      type: 'ambient-occlusion',
      enabled: this.quality.ambientOcclusion,
      priority: 4,
    })

    // Post-processing pass
    this.addPass('post-processing', {
      type: 'post-processing',
      enabled: this.quality.postProcessing,
      priority: 5,
    })

    // UI pass (always last)
    this.addPass('ui', {
      type: 'ui',
      enabled: true,
      priority: 100,
    })
  }

  addPass(id: string, config: RenderPassConfig): void {
    this.passes.set(id, config)
    this.needsSort = true
  }

  removePass(id: string): void {
    this.passes.delete(id)
    this.needsSort = true
  }

  enablePass(id: string, enabled: boolean): void {
    const pass = this.passes.get(id)
    if (pass) {
      pass.enabled = enabled
    }
  }

  private sortPasses(): void {
    if (!this.needsSort) return
    this.sortedPasses = Array.from(this.passes.values())
      .filter((p) => p.enabled)
      .sort((a, b) => a.priority - b.priority)
    this.needsSort = false
  }

  getActivePasses(): RenderPassConfig[] {
    this.sortPasses()
    return this.sortedPasses
  }

  setQuality(quality: QualityLevel): void {
    this.quality = quality

    // Actualizar passes según calidad
    this.enablePass('shadows', quality.shadows)
    this.enablePass('reflections', quality.reflections)
    this.enablePass('ambient-occlusion', quality.ambientOcclusion)
    this.enablePass('post-processing', quality.postProcessing)
  }

  setPostProcessing(config: PostProcessingPipeline): void {
    this.postProcessing = config
  }

  getPostProcessing(): PostProcessingPipeline {
    return this.postProcessing
  }

  // G-Buffer para deferred rendering
  initializeGBuffer(width: number, height: number): void {
    const createRenderTarget = (type: THREE.TextureDataType = THREE.FloatType) => {
      return new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type,
        generateMipmaps: false,
      })
    }

    this.gBuffer = {
      position: createRenderTarget(),
      normal: createRenderTarget(),
      albedo: createRenderTarget(THREE.UnsignedByteType),
      depth: createRenderTarget(),
    }
  }

  resizeGBuffer(width: number, height: number): void {
    if (this.gBuffer) {
      this.gBuffer.position.setSize(width, height)
      this.gBuffer.normal.setSize(width, height)
      this.gBuffer.albedo.setSize(width, height)
      this.gBuffer.depth.setSize(width, height)
    }
  }

  getGBuffer() {
    return this.gBuffer
  }

  dispose(): void {
    if (this.gBuffer) {
      this.gBuffer.position.dispose()
      this.gBuffer.normal.dispose()
      this.gBuffer.albedo.dispose()
      this.gBuffer.depth.dispose()
      this.gBuffer = null
    }

    this.passes.clear()
    this.sortedPasses = []
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default RenderPipeline
