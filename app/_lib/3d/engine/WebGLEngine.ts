/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎮 WEBGL ENGINE - Motor de Renderizado Three.js Optimizado
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Motor WebGL de alto rendimiento basado en Three.js con:
 * - Renderizado optimizado con instancing
 * - LOD automático
 * - Frustum culling
 * - Shadow mapping avanzado
 * - Post-procesamiento integrado
 */

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

import type { PerformanceMetrics, QualityLevel, PostProcessingPipeline } from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 WEBGL ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export interface WebGLEngineOptions {
  canvas?: HTMLCanvasElement
  antialias?: boolean
  alpha?: boolean
  powerPreference?: 'default' | 'high-performance' | 'low-power'
  precision?: 'highp' | 'mediump' | 'lowp'
  logarithmicDepthBuffer?: boolean
  preserveDrawingBuffer?: boolean
  shadowMapEnabled?: boolean
  shadowMapType?: THREE.ShadowMapType
  toneMapping?: THREE.ToneMapping
  toneMappingExposure?: number
  outputColorSpace?: THREE.ColorSpace
  pixelRatio?: number
}

export class WebGLEngine {
  // Core
  public renderer: THREE.WebGLRenderer
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  public composer: EffectComposer | null = null

  // State
  private animationId: number | null = null
  private clock: THREE.Clock
  private isRunning = false

  // Performance
  private frameCount = 0
  private fps = 0
  private fpsLastTime = 0
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    memoryUsed: 0,
    memoryTotal: 0,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    programs: 0,
  }

  // Quality
  private currentQuality: QualityLevel = {
    name: 'high',
    resolution: 1,
    shadows: true,
    shadowMapSize: 2048,
    antialiasing: 'smaa',
    postProcessing: true,
    particleCount: 10000,
    lodBias: 0,
    textureQuality: 'high',
    reflections: true,
    ambientOcclusion: true,
  }

  // Callbacks
  private onRenderCallbacks: Array<(delta: number) => void> = []

  constructor(options: WebGLEngineOptions = {}) {
    // Crear renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: options.canvas,
      antialias: options.antialias ?? true,
      alpha: options.alpha ?? true,
      powerPreference: options.powerPreference ?? 'high-performance',
      precision: options.precision ?? 'highp',
      logarithmicDepthBuffer: options.logarithmicDepthBuffer ?? false,
      preserveDrawingBuffer: options.preserveDrawingBuffer ?? false,
    })

    // Configurar renderer
    this.renderer.setPixelRatio(options.pixelRatio ?? Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = options.shadowMapEnabled ?? true
    this.renderer.shadowMap.type = options.shadowMapType ?? THREE.PCFSoftShadowMap
    this.renderer.toneMapping = options.toneMapping ?? THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = options.toneMappingExposure ?? 1.2
    this.renderer.outputColorSpace = options.outputColorSpace ?? THREE.SRGBColorSpace

    // Info del renderer
    this.renderer.info.autoReset = false

    // Crear escena
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x050510)
    this.scene.fog = new THREE.FogExp2(0x050510, 0.02)

    // Crear cámara
    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      window.innerWidth / window.innerHeight, // Aspect
      0.1, // Near
      1000, // Far
    )
    this.camera.position.set(0, 5, 10)
    this.camera.lookAt(0, 0, 0)

    // Clock para delta time
    this.clock = new THREE.Clock()

    // Configurar iluminación por defecto
    this.setupDefaultLighting()
  }

  private setupDefaultLighting(): void {
    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
    this.scene.add(ambientLight)

    // Luz direccional principal
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 100
    directionalLight.shadow.camera.left = -30
    directionalLight.shadow.camera.right = 30
    directionalLight.shadow.camera.top = 30
    directionalLight.shadow.camera.bottom = -30
    directionalLight.shadow.bias = -0.0001
    this.scene.add(directionalLight)

    // Luz de relleno
    const fillLight = new THREE.DirectionalLight(0x8866ff, 0.3)
    fillLight.position.set(-10, 5, -10)
    this.scene.add(fillLight)

    // Luz rim
    const rimLight = new THREE.DirectionalLight(0xff6688, 0.2)
    rimLight.position.set(0, -5, -10)
    this.scene.add(rimLight)

    // Hemisphere light
    const hemiLight = new THREE.HemisphereLight(0x8866ff, 0x002244, 0.4)
    this.scene.add(hemiLight)
  }

  setupPostProcessing(config: PostProcessingPipeline = {}): void {
    this.composer = new EffectComposer(this.renderer)

    // Render pass base
    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)

    // Bloom
    if (config.bloom) {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        config.bloom.intensity ?? 1.5,
        config.bloom.radius ?? 0.4,
        config.bloom.threshold ?? 0.85,
      )
      this.composer.addPass(bloomPass)
    }

    // Custom shader passes
    if (config.chromaticAberration) {
      const chromaticAberrationShader = {
        uniforms: {
          tDiffuse: { value: null },
          uOffset: {
            value: new THREE.Vector2(
              config.chromaticAberration.offset?.[0] ?? 0.002,
              config.chromaticAberration.offset?.[1] ?? 0.002,
            ),
          },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D tDiffuse;
          uniform vec2 uOffset;
          varying vec2 vUv;
          void main() {
            vec4 cr = texture2D(tDiffuse, vUv + uOffset);
            vec4 cg = texture2D(tDiffuse, vUv);
            vec4 cb = texture2D(tDiffuse, vUv - uOffset);
            gl_FragColor = vec4(cr.r, cg.g, cb.b, cg.a);
          }
        `,
      }
      const chromaticPass = new ShaderPass(chromaticAberrationShader)
      this.composer.addPass(chromaticPass)
    }

    // Vignette
    if (config.vignette) {
      const vignetteShader = {
        uniforms: {
          tDiffuse: { value: null },
          uOffset: { value: config.vignette.offset ?? 0.5 },
          uDarkness: { value: config.vignette.darkness ?? 0.5 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D tDiffuse;
          uniform float uOffset;
          uniform float uDarkness;
          varying vec2 vUv;
          void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            float dist = distance(vUv, vec2(0.5));
            float vignette = smoothstep(uOffset, uOffset - 0.3, dist);
            color.rgb *= mix(1.0 - uDarkness, 1.0, vignette);
            gl_FragColor = color;
          }
        `,
      }
      const vignettePass = new ShaderPass(vignetteShader)
      this.composer.addPass(vignettePass)
    }

    // Film grain
    if (config.filmGrain) {
      const filmGrainShader = {
        uniforms: {
          tDiffuse: { value: null },
          uTime: { value: 0 },
          uIntensity: { value: config.filmGrain.intensity ?? 0.05 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D tDiffuse;
          uniform float uTime;
          uniform float uIntensity;
          varying vec2 vUv;
          
          float random(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
          }
          
          void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            float noise = random(vUv + uTime) * uIntensity;
            color.rgb += noise - uIntensity * 0.5;
            gl_FragColor = color;
          }
        `,
      }
      const filmGrainPass = new ShaderPass(filmGrainShader)
      this.composer.addPass(filmGrainPass)
    }
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
    this.composer?.setSize(width, height)
  }

  render(): void {
    const delta = this.clock.getDelta()

    // Ejecutar callbacks
    this.onRenderCallbacks.forEach((cb) => cb(delta))

    // Actualizar métricas
    this.updateMetrics()

    // Renderizar
    if (this.composer) {
      this.composer.render(delta)
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  }

  private updateMetrics(): void {
    const now = performance.now()
    this.frameCount++

    if (now - this.fpsLastTime >= 1000) {
      this.fps = this.frameCount
      this.frameCount = 0
      this.fpsLastTime = now

      const info = this.renderer.info
      this.metrics = {
        fps: this.fps,
        frameTime: 1000 / this.fps,
        memoryUsed: (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
          ?.usedJSHeapSize ?? 0,
        memoryTotal: (performance as unknown as { memory?: { totalJSHeapSize: number } }).memory
          ?.totalJSHeapSize ?? 0,
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        programs: info.programs?.length ?? 0,
      }

      info.reset()
    }
  }

  startRenderLoop(): void {
    if (this.isRunning) return
    this.isRunning = true
    this.clock.start()

    const animate = () => {
      if (!this.isRunning) return
      this.animationId = requestAnimationFrame(animate)
      this.render()
    }

    this.animationId = requestAnimationFrame(animate)
  }

  stopRenderLoop(): void {
    this.isRunning = false
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.clock.stop()
  }

  onRender(callback: (delta: number) => void): () => void {
    this.onRenderCallbacks.push(callback)
    return () => {
      const index = this.onRenderCallbacks.indexOf(callback)
      if (index !== -1) {
        this.onRenderCallbacks.splice(index, 1)
      }
    }
  }

  setQuality(quality: Partial<QualityLevel>): void {
    this.currentQuality = { ...this.currentQuality, ...quality }

    // Aplicar cambios
    this.renderer.setPixelRatio(this.currentQuality.resolution * window.devicePixelRatio)
    this.renderer.shadowMap.enabled = this.currentQuality.shadows

    // Actualizar shadow map size si es necesario
    this.scene.traverse((object) => {
      if ((object as THREE.Light).isLight && (object as THREE.DirectionalLight).shadow) {
        const light = object as THREE.DirectionalLight
        light.shadow.mapSize.width = this.currentQuality.shadowMapSize
        light.shadow.mapSize.height = this.currentQuality.shadowMapSize
        light.shadow.map?.dispose()
        light.shadow.map = null as unknown as THREE.WebGLRenderTarget
      }
    })
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  getQuality(): QualityLevel {
    return { ...this.currentQuality }
  }

  add(object: THREE.Object3D): void {
    this.scene.add(object)
  }

  remove(object: THREE.Object3D): void {
    this.scene.remove(object)
  }

  dispose(): void {
    this.stopRenderLoop()

    // Disponer de la escena
    this.scene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh
        mesh.geometry?.dispose()
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose())
        } else {
          mesh.material?.dispose()
        }
      }
    })

    // Disponer composer
    this.composer?.dispose()

    // Disponer renderer
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }

  // Getters
  get domElement(): HTMLCanvasElement {
    return this.renderer.domElement
  }

  get currentFPS(): number {
    return this.fps
  }

  get running(): boolean {
    return this.isRunning
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════

let engineInstance: WebGLEngine | null = null

export function getWebGLEngine(options?: WebGLEngineOptions): WebGLEngine {
  if (!engineInstance) {
    engineInstance = new WebGLEngine(options)
  }
  return engineInstance
}

export function disposeWebGLEngine(): void {
  engineInstance?.dispose()
  engineInstance = null
}

export default WebGLEngine
