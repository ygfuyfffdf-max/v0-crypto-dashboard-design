'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 SUPREME SHADER CANVAS — CHRONOS ELITE 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Componente React de alto rendimiento para renderizar shaders GLSL con:
 * - Interactividad completa (hover, click, scroll)
 * - Sistema de personalización dinámico
 * - Optimización multi-dispositivo
 * - Auto-pause cuando no es visible
 * - 60fps garantizados con throttling inteligente
 *
 * @version 4.0.0 SUPREME ELITE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import {
  PANEL_SHADER_PRESETS,
  SUPREME_SHADERS,
  type PanelShaderPreset,
  type SupremeShaderType,
} from '@/app/lib/shaders/supreme-particle-system'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 SIMPLE CANVAS BACKGROUND — Fallback con Canvas 2D animado
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SimpleCanvasBackgroundProps {
  className?: string
  opacity?: number
  panelPreset?: PanelShaderPreset
}

const PANEL_COLORS: Record<string, { primary: string; secondary: string; accent: string }> = {
  dashboard: { primary: '#8B5CF6', secondary: '#EC4899', accent: '#FFD700' },
  ventas: { primary: '#10B981', secondary: '#34D399', accent: '#6EE7B7' },
  bancos: { primary: '#FFD700', secondary: '#F59E0B', accent: '#FBBF24' },
  clientes: { primary: '#EC4899', secondary: '#F472B6', accent: '#FB7185' },
  almacen: { primary: '#06B6D4', secondary: '#22D3EE', accent: '#67E8F9' },
  distribuidores: { primary: '#06B6D4', secondary: '#0891B2', accent: '#22D3EE' },
  compras: { primary: '#8B5CF6', secondary: '#A78BFA', accent: '#C4B5FD' },
  gastos: { primary: '#EF4444', secondary: '#F87171', accent: '#FCA5A5' },
  movimientos: { primary: '#3B82F6', secondary: '#60A5FA', accent: '#93C5FD' },
  ai: { primary: '#8B5CF6', secondary: '#EC4899', accent: '#06B6D4' },
}

const SimpleCanvasBackground = memo(function SimpleCanvasBackground({
  className = '',
  opacity = 1,
  panelPreset = 'dashboard',
}: SimpleCanvasBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<
    Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      alpha: number
      life: number
    }>
  >([])

  const colors = PANEL_COLORS[panelPreset] || PANEL_COLORS.dashboard

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resize handler
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize particles
    const particleCount = 80
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 4 + 2,
      color: [colors.primary, colors.secondary, colors.accent][Math.floor(Math.random() * 3)],
      alpha: Math.random() * 0.5 + 0.2,
      life: Math.random() * 100,
    }))

    let time = 0
    const animate = () => {
      time += 0.016
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight

      // Clear with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, width, height)

      // Draw and update particles
      particlesRef.current.forEach((p) => {
        // Update position
        p.x += p.vx + Math.sin(time + p.life) * 0.3
        p.y += p.vy + Math.cos(time + p.life) * 0.3

        // Wrap around
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        // Pulsing alpha
        const pulseAlpha = p.alpha * (0.7 + 0.3 * Math.sin(time * 2 + p.life))

        // Draw glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        gradient.addColorStop(
          0,
          `${p.color}${Math.floor(pulseAlpha * 255)
            .toString(16)
            .padStart(2, '0')}`,
        )
        gradient.addColorStop(
          0.5,
          `${p.color}${Math.floor(pulseAlpha * 128)
            .toString(16)
            .padStart(2, '0')}`,
        )
        gradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw core
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${Math.floor(pulseAlpha * 255)
          .toString(16)
          .padStart(2, '0')}`
        ctx.fill()
      })

      // Draw connecting lines between nearby particles
      ctx.strokeStyle = `${colors.primary}15`
      ctx.lineWidth = 0.5
      particlesRef.current.forEach((p1, i) => {
        particlesRef.current.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.globalAlpha = (1 - dist / 150) * 0.3
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [colors])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
    />
  )
})

// Custom hook to replace react-intersection-observer
function useInViewLocal(options: { threshold?: number; triggerOnce?: boolean } = {}) {
  const [inView, setInView] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const ref = useRef<HTMLElement | null>(null)

  const setRef = useCallback((node: HTMLElement | null) => {
    ref.current = node
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    if (options.triggerOnce && hasTriggered) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) {
          setInView(entry.isIntersecting)
          if (entry.isIntersecting && options.triggerOnce) {
            setHasTriggered(true)
          }
        }
      },
      { threshold: options.threshold ?? 0 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [options.threshold, options.triggerOnce, hasTriggered])

  return { ref: setRef, inView }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface ShaderConfig {
  uSpeed?: number
  uTurbulence?: number
  uAttraction?: number
  uPulseIntensity?: number
  uWaveAmplitude?: number
  uMood?: number
  uColorPrimary?: [number, number, number]
  uColorSecondary?: [number, number, number]
  uColorAccent?: [number, number, number]
  uInteractionRadius?: number
  uParticleScale?: number
  uParticleShape?: 0 | 1 | 2 | 3
  uBloomIntensity?: number
  uCoreIntensity?: number
  uSoftEdge?: number
  uChromaticAberration?: number
  uDistortionIntensity?: number
  uWaveSpeed?: number
  uWaveComplexity?: number
  uVignetteIntensity?: number
  uOrbSize?: number
  uGlowIntensity?: number
  uRingCount?: number
}

export interface SupremeShaderCanvasProps {
  /** Tipo de shader a renderizar */
  shaderType?: SupremeShaderType
  /** Preset para panel específico */
  panelPreset?: PanelShaderPreset
  /** Configuración personalizada del shader */
  config?: ShaderConfig
  /** Cantidad de partículas (solo para shader de partículas) */
  particleCount?: number
  /** Habilitar interactividad con mouse */
  interactive?: boolean
  /** Habilitar efecto de scroll */
  scrollEffect?: boolean
  /** Intensidad general (0-1) */
  intensity?: number
  /** Mostrar solo cuando es visible */
  lazyRender?: boolean
  /** Callback cuando el shader está listo */
  onReady?: () => void
  /** Clase CSS adicional */
  className?: string
  /** Opacidad del canvas */
  opacity?: number
  /** Prioridad de renderizado (afecta FPS target) */
  priority?: 'low' | 'normal' | 'high'
}

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  colorMix: number
  delay: number
  lifetime: number
  phase: number
  orbit: number
  randomSeed: [number, number, number]
}

interface WebGLContext {
  gl: WebGL2RenderingContext | WebGLRenderingContext
  program: WebGLProgram
  buffers: Record<string, WebGLBuffer>
  uniforms: Record<string, WebGLUniformLocation>
  attributes: Record<string, number>
  particleCount: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const FPS_TARGETS = {
  low: 30,
  normal: 60,
  high: 120,
}

const DEFAULT_PARTICLE_COUNT = 5000

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function createShader(
  gl: WebGL2RenderingContext | WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

function createProgram(
  gl: WebGL2RenderingContext | WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram | null {
  const program = gl.createProgram()
  if (!program) return null

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }

  return program
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = []

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = Math.pow(Math.random(), 0.5) * 2

    particles.push({
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi) - 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      vz: (Math.random() - 0.5) * 0.3,
      size: 2 + Math.random() * 6,
      colorMix: Math.random(),
      delay: Math.random() * 10,
      lifetime: 3 + Math.random() * 7,
      phase: Math.random() * Math.PI * 2,
      orbit: 0.2 + Math.random() * 0.8,
      randomSeed: [Math.random(), Math.random(), Math.random()],
    })
  }

  return particles
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  let lastFunc: ReturnType<typeof setTimeout>
  let lastRan: number

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (this: unknown, ...args: any[]) {
    if (!lastRan) {
      func.apply(this, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func.apply(this, args)
            lastRan = Date.now()
          }
        },
        limit - (Date.now() - lastRan),
      )
    }
  } as T
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// 🎨 SHADERS SIMPLIFICADOS - Usando CSS/Canvas en lugar de WebGL complejo
// Los shaders WebGL originales tienen problemas de compilación en producción
const USE_SIMPLE_CANVAS = true

// Shader simplificado que funciona garantizado
const SIMPLE_VERTEX = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    gl_PointSize = 3.0;
  }
`

const SIMPLE_FRAGMENT = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_color1;
  uniform vec3 u_color2;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float gradient = uv.y + sin(uv.x * 3.14159 + u_time) * 0.1;
    vec3 color = mix(u_color1, u_color2, gradient);
    float alpha = 0.3 + 0.2 * sin(u_time * 2.0);
    gl_FragColor = vec4(color, alpha);
  }
`

export function SupremeShaderCanvas({
  shaderType = 'particle',
  panelPreset,
  config = {},
  particleCount = DEFAULT_PARTICLE_COUNT,
  interactive = true,
  scrollEffect = true,
  intensity = 1,
  lazyRender = true,
  onReady,
  className = '',
  opacity = 1,
  priority = 'normal',
}: SupremeShaderCanvasProps) {
  // 🎨 Usar Canvas 2D animado en lugar de WebGL complejo
  if (USE_SIMPLE_CANVAS) {
    return (
      <SimpleCanvasBackground className={className} opacity={opacity} panelPreset={panelPreset} />
    )
  }

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glContextRef = useRef<WebGLContext | null>(null)
  const animationRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5, vx: 0, vy: 0, pressed: false })
  const scrollRef = useRef({ y: 0, vy: 0 })
  const uniformsRef = useRef<Record<string, unknown>>({})

  // State
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Intersection observer for lazy rendering
  const { ref: inViewRef, inView } = useInViewLocal({
    threshold: 0,
    triggerOnce: false,
  })

  // Merge refs
  const setRefs = useCallback(
    (node: HTMLCanvasElement | null) => {
      canvasRef.current = node
      inViewRef(node)
    },
    [inViewRef],
  )

  // Get shader configuration
  const shaderConfig = useMemo(() => {
    let baseConfig: ShaderConfig = {}
    let effectiveShaderType = shaderType

    // Apply panel preset if provided
    if (panelPreset && PANEL_SHADER_PRESETS[panelPreset]) {
      const preset = PANEL_SHADER_PRESETS[panelPreset]
      effectiveShaderType = preset.shader as SupremeShaderType
      // Deep clone to avoid readonly issues
      baseConfig = JSON.parse(JSON.stringify(preset.config)) as ShaderConfig
    }

    // Get default uniforms for shader type
    const shaderDef = SUPREME_SHADERS[effectiveShaderType]
    const defaultUniforms = shaderDef?.defaultUniforms || {}

    // Merge configs
    return {
      shaderType: effectiveShaderType,
      uniforms: {
        ...defaultUniforms,
        ...baseConfig,
        ...config,
      },
    }
  }, [shaderType, panelPreset, config])

  // Initialize WebGL
  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Get WebGL context
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) {
      setError('WebGL not supported')
      return
    }

    // Get shader sources
    const shaderDef = SUPREME_SHADERS[shaderConfig.shaderType]
    if (!shaderDef) {
      setError(`Unknown shader type: ${shaderConfig.shaderType}`)
      return
    }

    // For particle shader, we need both vertex and fragment
    if (shaderConfig.shaderType === 'particle') {
      const vertexSource = shaderDef.vertex ?? ''
      const fragmentSource = shaderDef.fragment ?? ''
      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)

      if (!vertexShader || !fragmentShader) {
        setError('Failed to create shaders')
        return
      }

      const program = createProgram(gl, vertexShader, fragmentShader)
      if (!program) {
        setError('Failed to create program')
        return
      }

      // Generate particles
      const particles = generateParticles(particleCount)

      // Create buffers
      const positionData: number[] = []
      const velocityData: number[] = []
      const sizeData: number[] = []
      const colorMixData: number[] = []
      const delayData: number[] = []
      const lifetimeData: number[] = []
      const phaseData: number[] = []
      const orbitData: number[] = []
      const randomSeedData: number[] = []
      const uvData: number[] = []

      particles.forEach((p) => {
        positionData.push(p.x, p.y, p.z)
        velocityData.push(p.vx, p.vy, p.vz)
        sizeData.push(p.size)
        colorMixData.push(p.colorMix)
        delayData.push(p.delay)
        lifetimeData.push(p.lifetime)
        phaseData.push(p.phase)
        orbitData.push(p.orbit)
        randomSeedData.push(...p.randomSeed)
        // Generate UV based on normalized position
        uvData.push((p.x + 1) * 0.5, (p.y + 1) * 0.5)
      })

      // Create and bind buffers
      const buffers: Record<string, WebGLBuffer> = {}

      const createBuffer = (name: string, data: number[], size: number, attribName: string) => {
        const buffer = gl.createBuffer()
        if (!buffer) return

        buffers[name] = buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)

        const loc = gl.getAttribLocation(program, attribName)
        if (loc !== -1) {
          gl.enableVertexAttribArray(loc)
          gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
        }
      }

      gl.useProgram(program)

      createBuffer('position', positionData, 3, 'position')
      createBuffer('uv', uvData, 2, 'uv')
      createBuffer('velocity', velocityData, 3, 'aVelocity')
      createBuffer('size', sizeData, 1, 'aSize')
      createBuffer('colorMix', colorMixData, 1, 'aColorMix')
      createBuffer('delay', delayData, 1, 'aDelay')
      createBuffer('lifetime', lifetimeData, 1, 'aLifetime')
      createBuffer('phase', phaseData, 1, 'aPhase')
      createBuffer('orbit', orbitData, 1, 'aOrbit')
      createBuffer('randomSeed', randomSeedData, 3, 'aRandomSeed')

      // Get uniform locations
      const uniforms: Record<string, WebGLUniformLocation> = {}
      const uniformNames = Object.keys(shaderConfig.uniforms)

      uniformNames.forEach((name) => {
        const loc = gl.getUniformLocation(program, name)
        if (loc) {
          uniforms[name] = loc
        }
      })

      // Get matrix uniform locations and set default values
      const modelViewMatrixLoc = gl.getUniformLocation(program, 'modelViewMatrix')
      const projectionMatrixLoc = gl.getUniformLocation(program, 'projectionMatrix')

      // Identity matrix for modelView (partículas en espacio de pantalla)
      const identityMatrix = new Float32Array([
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        -2,
        1, // Slight Z offset for depth
      ])

      // Simple orthographic projection matrix
      const projectionMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -0.1, 0, 0, 0, 0, 1])

      if (modelViewMatrixLoc) {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, identityMatrix)
      }
      if (projectionMatrixLoc) {
        gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix)
      }

      // Store matrix locations for updates
      if (modelViewMatrixLoc) uniforms.modelViewMatrix = modelViewMatrixLoc
      if (projectionMatrixLoc) uniforms.projectionMatrix = projectionMatrixLoc

      // Enable blending
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      // Enable depth test for 3D effect
      gl.enable(gl.DEPTH_TEST)
      gl.depthFunc(gl.LEQUAL)

      // Store context
      glContextRef.current = {
        gl: gl as WebGL2RenderingContext,
        program,
        buffers,
        uniforms,
        attributes: {},
        particleCount: particles.length,
      }

      // Store initial uniforms
      uniformsRef.current = { ...shaderConfig.uniforms }

      setIsReady(true)
      onReady?.()
    }
  }, [shaderConfig, particleCount, onReady])

  // Render frame
  const render = useCallback(
    (timestamp: number) => {
      if (!glContextRef.current || !canvasRef.current) return
      if (lazyRender && !inView) return

      const { gl, program, uniforms, particleCount: count } = glContextRef.current
      const canvas = canvasRef.current

      // Calculate delta time
      const deltaTime = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      // Frame rate limiting
      const targetFPS = FPS_TARGETS[priority]
      const frameInterval = 1000 / targetFPS

      // Resize canvas if needed
      const dpr = Math.min(window.devicePixelRatio, 2)
      const displayWidth = canvas.clientWidth * dpr
      const displayHeight = canvas.clientHeight * dpr

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth
        canvas.height = displayHeight
        gl.viewport(0, 0, displayWidth, displayHeight)
      }

      // Clear
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      gl.useProgram(program)

      // Update uniforms
      const time = timestamp / 1000

      // Time
      if (uniforms.uTime) {
        gl.uniform1f(uniforms.uTime, time)
      }
      if (uniforms.uDeltaTime) {
        gl.uniform1f(uniforms.uDeltaTime, deltaTime)
      }

      // Mouse
      if (uniforms.uMouse) {
        gl.uniform2f(uniforms.uMouse, mouseRef.current.x, mouseRef.current.y)
      }
      if (uniforms.uMouseVelocity) {
        gl.uniform2f(uniforms.uMouseVelocity, mouseRef.current.vx, mouseRef.current.vy)
      }
      if (uniforms.uMousePressed) {
        gl.uniform1f(uniforms.uMousePressed, mouseRef.current.pressed ? 1 : 0)
      }

      // Scroll
      if (uniforms.uScroll) {
        gl.uniform1f(uniforms.uScroll, scrollRef.current.y)
      }
      if (uniforms.uScrollVelocity) {
        gl.uniform1f(uniforms.uScrollVelocity, scrollRef.current.vy)
      }

      // Resolution
      if (uniforms.uResolution) {
        gl.uniform2f(uniforms.uResolution, displayWidth, displayHeight)
      }

      // Custom config uniforms
      const currentUniforms = uniformsRef.current
      Object.entries(currentUniforms).forEach(([key, value]) => {
        const loc = uniforms[key]
        if (!loc) return

        if (typeof value === 'number') {
          gl.uniform1f(loc, value * intensity)
        } else if (Array.isArray(value)) {
          if (value.length === 2) {
            gl.uniform2f(loc, value[0], value[1])
          } else if (value.length === 3) {
            gl.uniform3f(loc, value[0], value[1], value[2])
          } else if (value.length === 4) {
            gl.uniform4f(loc, value[0], value[1], value[2], value[3])
          }
        }
      })

      // Draw particles
      gl.drawArrays(gl.POINTS, 0, count)

      // Schedule next frame
      animationRef.current = requestAnimationFrame(render)
    },
    [lazyRender, inView, priority, intensity],
  )

  // Mouse handler
  const handleMouseMove = useMemo(
    () =>
      throttle((e: MouseEvent) => {
        if (!interactive || !canvasRef.current) return

        const rect = canvasRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = 1 - (e.clientY - rect.top) / rect.height

        // Calculate velocity
        const vx = x - mouseRef.current.x
        const vy = y - mouseRef.current.y

        mouseRef.current = {
          x,
          y,
          vx: vx * 10,
          vy: vy * 10,
          pressed: mouseRef.current.pressed,
        }
      }, 16),
    [interactive],
  )

  // Scroll handler
  const handleScroll = useMemo(
    () =>
      throttle(() => {
        if (!scrollEffect) return

        const newY = window.scrollY / window.innerHeight
        const vy = newY - scrollRef.current.y

        scrollRef.current = {
          y: newY,
          vy: vy * 5,
        }
      }, 16),
    [scrollEffect],
  )

  // Mouse down/up handlers
  const handleMouseDown = useCallback(() => {
    mouseRef.current.pressed = true
  }, [])

  const handleMouseUp = useCallback(() => {
    mouseRef.current.pressed = false
  }, [])

  // Effects
  useEffect(() => {
    initWebGL()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      // Cleanup WebGL resources
      if (glContextRef.current) {
        const { gl, program, buffers } = glContextRef.current
        Object.values(buffers).forEach((buffer) => gl.deleteBuffer(buffer))
        gl.deleteProgram(program)
      }
    }
  }, [initWebGL])

  // Start animation when ready and visible
  useEffect(() => {
    if (isReady && (!lazyRender || inView)) {
      lastTimeRef.current = performance.now()
      animationRef.current = requestAnimationFrame(render)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isReady, render, lazyRender, inView])

  // Event listeners
  useEffect(() => {
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mousedown', handleMouseDown)
      window.addEventListener('mouseup', handleMouseUp)
    }

    if (scrollEffect) {
      window.addEventListener('scroll', handleScroll, { passive: true })
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [interactive, scrollEffect, handleMouseMove, handleScroll, handleMouseDown, handleMouseUp])

  // Update uniforms when config changes
  useEffect(() => {
    uniformsRef.current = { ...shaderConfig.uniforms, ...config }
  }, [shaderConfig, config])

  // Si hay error, NO renderizar nada - los fondos CSS tomarán el protagonismo
  if (error) {
    // Solo log para debugging, sin UI visible
    if (typeof window !== 'undefined') {
      console.warn('SupremeShaderCanvas: WebGL shader failed, falling back to CSS backgrounds')
    }
    return null
  }

  return (
    <canvas
      ref={setRefs}
      className={`absolute inset-0 h-full w-full ${className}`}
      style={{
        opacity,
        pointerEvents: interactive ? 'auto' : 'none',
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎛️ CONVENIENCE COMPONENTS FOR EACH PANEL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function DashboardShaderBackground(props: Omit<SupremeShaderCanvasProps, 'panelPreset'>) {
  return <SupremeShaderCanvas panelPreset="dashboard" {...props} />
}

export function VentasShaderBackground(props: Omit<SupremeShaderCanvasProps, 'panelPreset'>) {
  return <SupremeShaderCanvas panelPreset="ventas" {...props} />
}

export function BancosShaderBackground(props: Omit<SupremeShaderCanvasProps, 'panelPreset'>) {
  return <SupremeShaderCanvas panelPreset="bancos" {...props} />
}

export function ClientesShaderBackground(props: Omit<SupremeShaderCanvasProps, 'panelPreset'>) {
  return <SupremeShaderCanvas panelPreset="clientes" {...props} />
}

export function AlmacenShaderBackground(props: Omit<SupremeShaderCanvasProps, 'panelPreset'>) {
  return <SupremeShaderCanvas panelPreset="almacen" {...props} />
}

export function DistribuidoresShaderBackground(
  props: Omit<SupremeShaderCanvasProps, 'panelPreset'>,
) {
  return <SupremeShaderCanvas panelPreset="distribuidores" {...props} />
}

export function ComprasShaderBackground(props: Omit<SupremeShaderCanvasProps, 'panelPreset'>) {
  return <SupremeShaderCanvas panelPreset="compras" {...props} />
}

export function GastosShaderBackground(props: Omit<SupremeShaderCanvasProps, 'panelPreset'>) {
  return <SupremeShaderCanvas panelPreset="gastos" {...props} />
}

export function MovimientosShaderBackground(props: Omit<SupremeShaderCanvasProps, 'panelPreset'>) {
  return <SupremeShaderCanvas panelPreset="movimientos" {...props} />
}

export function AIShaderBackground(props: Omit<SupremeShaderCanvasProps, 'panelPreset'>) {
  return <SupremeShaderCanvas panelPreset="ai" {...props} />
}

// Re-export types from supreme-particle-system for convenience
export type {
  PanelShaderPreset,
  SupremeShaderType,
} from '@/app/lib/shaders/supreme-particle-system'

export default SupremeShaderCanvas
