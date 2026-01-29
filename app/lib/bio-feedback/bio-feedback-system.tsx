// @ts-nocheck
'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — BIO-FEEDBACK SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de bio-feedback supremo con:
 * - Detección de pulso cardíaco via webcam (rPPG)
 * - Análisis de estado emocional en tiempo real
 * - Adaptación dinámica de UI según mood
 * - Web Vibration API para haptic feedback
 * - Sistema de recompensas visuales (éxtasis financiero)
 */

import { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react'
import { QUANTUM_PALETTE, QUANTUM_SPRING } from '@/app/lib/design-system/quantum-infinity-2026'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type MoodState = 'calm' | 'flow' | 'stress' | 'euphoric' | 'neutral'
export type PulseQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'none'

export interface BioMetrics {
  heartRate: number | null
  heartRateVariability: number | null
  pulseQuality: PulseQuality
  mood: MoodState
  stressLevel: number // 0-100
  energyLevel: number // 0-100
  lastUpdate: Date
}

export interface MoodTheme {
  primaryGlow: string
  secondaryGlow: string
  particleSpeed: number
  blurIntensity: number
  animationSpeed: number
  hapticPattern: number[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 CONFIGURACIÓN DE MOODS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const MOOD_THEMES: Record<MoodState, MoodTheme> = {
  calm: {
    primaryGlow: QUANTUM_PALETTE.violet.glow30,
    secondaryGlow: QUANTUM_PALETTE.gold.glow20,
    particleSpeed: 0.5,
    blurIntensity: 40,
    animationSpeed: 0.8,
    hapticPattern: [50],
  },
  flow: {
    primaryGlow: QUANTUM_PALETTE.violet.glow50,
    secondaryGlow: QUANTUM_PALETTE.gold.glow40,
    particleSpeed: 1.0,
    blurIntensity: 30,
    animationSpeed: 1.0,
    hapticPattern: [30, 30],
  },
  stress: {
    primaryGlow: QUANTUM_PALETTE.plasma.glow40,
    secondaryGlow: QUANTUM_PALETTE.violet.glow30,
    particleSpeed: 1.5,
    blurIntensity: 25,
    animationSpeed: 1.3,
    hapticPattern: [100, 50, 100],
  },
  euphoric: {
    primaryGlow: QUANTUM_PALETTE.gold.glowIntense,
    secondaryGlow: QUANTUM_PALETTE.violet.glow60,
    particleSpeed: 2.0,
    blurIntensity: 20,
    animationSpeed: 1.5,
    hapticPattern: [50, 50, 50, 50, 200],
  },
  neutral: {
    primaryGlow: QUANTUM_PALETTE.violet.glow40,
    secondaryGlow: QUANTUM_PALETTE.white.ghost,
    particleSpeed: 0.7,
    blurIntensity: 35,
    animationSpeed: 0.9,
    hapticPattern: [20],
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💓 DETECCIÓN DE PULSO (rPPG simplificado)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PulseDetectorOptions {
  sampleRate: number
  windowSize: number
  minHeartRate: number
  maxHeartRate: number
}

const DEFAULT_PULSE_OPTIONS: PulseDetectorOptions = {
  sampleRate: 30, // fps
  windowSize: 150, // samples (5 segundos a 30fps)
  minHeartRate: 40,
  maxHeartRate: 180,
}

class PulseDetector {
  private options: PulseDetectorOptions
  private greenChannel: number[] = []
  private timestamps: number[] = []
  private lastPeaks: number[] = []

  constructor(options: Partial<PulseDetectorOptions> = {}) {
    this.options = { ...DEFAULT_PULSE_OPTIONS, ...options }
  }

  // Agregar sample de frame de video
  addSample(imageData: ImageData, timestamp: number): void {
    // Extraer canal verde promedio (más sensible a cambios de sangre)
    let greenSum = 0
    const pixels = imageData.data
    const pixelCount = pixels.length / 4

    for (let i = 0; i < pixels.length; i += 4) {
      greenSum += pixels[i + 1] // Canal verde
    }

    const greenAvg = greenSum / pixelCount

    this.greenChannel.push(greenAvg)
    this.timestamps.push(timestamp)

    // Mantener ventana de tamaño fijo
    if (this.greenChannel.length > this.options.windowSize) {
      this.greenChannel.shift()
      this.timestamps.shift()
    }
  }

  // Calcular heart rate
  calculateHeartRate(): { heartRate: number | null; quality: PulseQuality } {
    if (this.greenChannel.length < this.options.windowSize * 0.5) {
      return { heartRate: null, quality: 'none' }
    }

    // Normalizar señal
    const normalized = this.normalizeSignal(this.greenChannel)

    // Detectar picos
    const peaks = this.detectPeaks(normalized)

    if (peaks.length < 2) {
      return { heartRate: null, quality: 'poor' }
    }

    // Calcular intervalos entre picos
    const intervals: number[] = []
    for (let i = 1; i < peaks.length; i++) {
      const interval = this.timestamps[peaks[i]] - this.timestamps[peaks[i - 1]]
      if (interval > 0) {
        intervals.push(interval)
      }
    }

    if (intervals.length === 0) {
      return { heartRate: null, quality: 'poor' }
    }

    // Promedio de intervalos
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const heartRate = Math.round(60000 / avgInterval) // Convertir a BPM

    // Validar rango
    if (heartRate < this.options.minHeartRate || heartRate > this.options.maxHeartRate) {
      return { heartRate: null, quality: 'poor' }
    }

    // Calcular calidad basada en variabilidad
    const variance = this.calculateVariance(intervals)
    const quality = this.assessQuality(variance)

    return { heartRate, quality }
  }

  private normalizeSignal(signal: number[]): number[] {
    const mean = signal.reduce((a, b) => a + b, 0) / signal.length
    const std = Math.sqrt(
      signal.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / signal.length,
    )

    if (std === 0) return signal.map(() => 0)
    return signal.map((val) => (val - mean) / std)
  }

  private detectPeaks(signal: number[]): number[] {
    const peaks: number[] = []
    const minDistance = Math.floor(this.options.sampleRate * 0.3) // Mínimo 300ms entre picos

    for (let i = 1; i < signal.length - 1; i++) {
      if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1]) {
        if (signal[i] > 0.5) {
          // Threshold
          if (peaks.length === 0 || i - peaks[peaks.length - 1] >= minDistance) {
            peaks.push(i)
          }
        }
      }
    }

    return peaks
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  }

  private assessQuality(variance: number): PulseQuality {
    if (variance < 5000) return 'excellent'
    if (variance < 15000) return 'good'
    if (variance < 30000) return 'fair'
    return 'poor'
  }

  reset(): void {
    this.greenChannel = []
    this.timestamps = []
    this.lastPeaks = []
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧠 ANÁLISIS DE MOOD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function analyzeMood(
  heartRate: number | null,
  hrv: number | null,
  financialState: 'positive' | 'negative' | 'neutral',
): MoodState {
  // Si no hay datos de pulso, usar estado financiero
  if (heartRate === null) {
    switch (financialState) {
      case 'positive':
        return 'flow'
      case 'negative':
        return 'stress'
      default:
        return 'neutral'
    }
  }

  // Analizar basado en heart rate
  if (heartRate < 60) {
    return 'calm'
  } else if (heartRate < 80) {
    return financialState === 'positive' ? 'flow' : 'neutral'
  } else if (heartRate < 100) {
    return financialState === 'positive' ? 'euphoric' : 'stress'
  } else {
    return financialState === 'positive' ? 'euphoric' : 'stress'
  }
}

function calculateStressLevel(heartRate: number | null, hrv: number | null): number {
  if (heartRate === null) return 50

  // Normalizar heart rate a stress (40-60 bpm = bajo stress, >100 = alto)
  const hrStress = Math.min(100, Math.max(0, (heartRate - 60) * 2.5))

  // Si tenemos HRV, usarlo también (bajo HRV = alto stress)
  if (hrv !== null) {
    const hrvStress = Math.max(0, 100 - hrv * 2)
    return (hrStress + hrvStress) / 2
  }

  return hrStress
}

function calculateEnergyLevel(heartRate: number | null, mood: MoodState): number {
  if (heartRate === null) {
    switch (mood) {
      case 'euphoric':
        return 90
      case 'flow':
        return 70
      case 'stress':
        return 60
      case 'calm':
        return 40
      default:
        return 50
    }
  }

  // Normalizar heart rate a energía
  return Math.min(100, Math.max(0, (heartRate - 40) * 0.8))
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📳 HAPTIC FEEDBACK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function triggerHaptic(pattern: number[]): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

export function triggerEuphoricHaptic(): void {
  triggerHaptic([50, 50, 50, 50, 200, 100, 50, 50, 50, 50])
}

export function triggerSuccessHaptic(): void {
  triggerHaptic([30, 30, 60])
}

export function triggerWarningHaptic(): void {
  triggerHaptic([100, 50, 100])
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 HOOK: useBioFeedback
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UseBioFeedbackOptions {
  enabled?: boolean
  financialState?: 'positive' | 'negative' | 'neutral'
  onMoodChange?: (mood: MoodState) => void
}

export function useBioFeedback(options: UseBioFeedbackOptions = {}) {
  const { enabled = false, financialState = 'neutral', onMoodChange } = options

  const [metrics, setMetrics] = useState<BioMetrics>({
    heartRate: null,
    heartRateVariability: null,
    pulseQuality: 'none',
    mood: 'neutral',
    stressLevel: 50,
    energyLevel: 50,
    lastUpdate: new Date(),
  })
  const [isCapturing, setIsCapturing] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pulseDetectorRef = useRef<PulseDetector | null>(null)
  const animationFrameRef = useRef<number>()
  const streamRef = useRef<MediaStream | null>(null)

  // Inicializar detector
  useEffect(() => {
    pulseDetectorRef.current = new PulseDetector()
    return () => {
      pulseDetectorRef.current?.reset()
    }
  }, [])

  // Solicitar acceso a cámara
  const requestCameraAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 320 },
          height: { ideal: 240 },
        },
      })

      streamRef.current = stream
      setHasPermission(true)
      return true
    } catch {
      setHasPermission(false)
      return false
    }
  }, [])

  // Iniciar captura
  const startCapture = useCallback(async () => {
    if (!enabled) return

    const hasAccess = hasPermission ?? (await requestCameraAccess())
    if (!hasAccess || !streamRef.current) return

    // Crear elementos de video y canvas
    const video = document.createElement('video')
    video.srcObject = streamRef.current
    video.autoplay = true
    video.playsInline = true
    videoRef.current = video

    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 240
    canvasRef.current = canvas

    await video.play()
    setIsCapturing(true)

    // Loop de captura
    const capture = () => {
      if (!videoRef.current || !canvasRef.current || !pulseDetectorRef.current) return

      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return

      ctx.drawImage(videoRef.current, 0, 0, 320, 240)

      // Área de la cara (centro del frame)
      const faceRegion = ctx.getImageData(100, 60, 120, 120)

      pulseDetectorRef.current.addSample(faceRegion, Date.now())

      // Calcular métricas cada 30 frames
      if (Math.random() < 0.033) {
        // ~1/30
        const { heartRate, quality } = pulseDetectorRef.current.calculateHeartRate()

        const mood = analyzeMood(heartRate, null, financialState)
        const stressLevel = calculateStressLevel(heartRate, null)
        const energyLevel = calculateEnergyLevel(heartRate, mood)

        setMetrics((prev) => {
          const newMetrics = {
            heartRate,
            heartRateVariability: null,
            pulseQuality: quality,
            mood,
            stressLevel,
            energyLevel,
            lastUpdate: new Date(),
          }

          // Notificar cambio de mood
          if (prev.mood !== mood && onMoodChange) {
            onMoodChange(mood)
          }

          return newMetrics
        })
      }

      animationFrameRef.current = requestAnimationFrame(capture)
    }

    capture()
  }, [enabled, hasPermission, requestCameraAccess, financialState, onMoodChange])

  // Detener captura
  const stopCapture = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    videoRef.current = null
    canvasRef.current = null
    pulseDetectorRef.current?.reset()
    setIsCapturing(false)
  }, [])

  // Efecto para auto-start/stop
  useEffect(() => {
    if (enabled) {
      startCapture()
    } else {
      stopCapture()
    }

    return () => {
      stopCapture()
    }
  }, [enabled, startCapture, stopCapture])

  // Obtener tema actual basado en mood
  const currentTheme = useMemo(() => MOOD_THEMES[metrics.mood], [metrics.mood])

  // Trigger haptic basado en mood
  const triggerMoodHaptic = useCallback(() => {
    triggerHaptic(currentTheme.hapticPattern)
  }, [currentTheme])

  return {
    metrics,
    isCapturing,
    hasPermission,
    currentTheme,
    startCapture,
    stopCapture,
    requestCameraAccess,
    triggerMoodHaptic,
    triggerEuphoricHaptic,
    triggerSuccessHaptic,
    triggerWarningHaptic,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌐 CONTEXT PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface BioFeedbackContextValue {
  metrics: BioMetrics
  currentTheme: MoodTheme
  isEnabled: boolean
  setEnabled: (enabled: boolean) => void
  triggerHaptic: (pattern: number[]) => void
}

const BioFeedbackContext = createContext<BioFeedbackContextValue | null>(null)

export function BioFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setEnabled] = useState(false)
  const [financialState, setFinancialState] = useState<'positive' | 'negative' | 'neutral'>(
    'neutral',
  )

  const { metrics, currentTheme, triggerMoodHaptic } = useBioFeedback({
    enabled: isEnabled,
    financialState,
    onMoodChange: (mood) => {
      // Haptic feedback en cambio de mood
      if (mood === 'euphoric') {
        triggerEuphoricHaptic()
      }
    },
  })

  const value = useMemo(
    () => ({
      metrics,
      currentTheme,
      isEnabled,
      setEnabled,
      triggerHaptic,
    }),
    [metrics, currentTheme, isEnabled],
  )

  return <BioFeedbackContext.Provider value={value}>{children}</BioFeedbackContext.Provider>
}

export function useBioFeedbackContext() {
  const context = useContext(BioFeedbackContext)
  if (!context) {
    throw new Error('useBioFeedbackContext must be used within a BioFeedbackProvider')
  }
  return context
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💫 COMPONENTE: PULSE VISUALIZER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PulseVisualizerProps {
  heartRate: number | null
  quality: PulseQuality
  size?: number
  showLabel?: boolean
}

export function PulseVisualizer({
  heartRate,
  quality,
  size = 80,
  showLabel = true,
}: PulseVisualizerProps) {
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    if (!heartRate) return

    // Calcular intervalo basado en heart rate
    const interval = 60000 / heartRate

    const timer = setInterval(() => {
      setPulse((p) => (p + 1) % 2)
    }, interval / 2)

    return () => clearInterval(timer)
  }, [heartRate])

  const qualityColors: Record<PulseQuality, string> = {
    excellent: '#00FF88',
    good: QUANTUM_PALETTE.gold.pure,
    fair: QUANTUM_PALETTE.gold.soft,
    poor: QUANTUM_PALETTE.plasma.soft,
    none: QUANTUM_PALETTE.white.dim,
  }

  const color = qualityColors[quality]

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          background: `${color}20`,
          border: `2px solid ${color}`,
          boxShadow: pulse === 1 ? `0 0 ${size / 2}px ${color}` : 'none',
          transition: 'box-shadow 0.1s ease-out',
        }}
      >
        {/* Onda de pulso */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${color}`,
            transform: `scale(${1 + pulse * 0.3})`,
            opacity: 1 - pulse * 0.5,
            transition: 'all 0.3s ease-out',
          }}
        />

        {/* Valor */}
        <span className="text-lg font-bold" style={{ color }}>
          {heartRate ?? '--'}
        </span>
      </div>

      {showLabel && (
        <div className="text-center">
          <p className="text-xs" style={{ color: QUANTUM_PALETTE.white.text40 }}>
            {heartRate ? 'BPM' : 'Sin señal'}
          </p>
          <p className="text-xs capitalize" style={{ color }}>
            {quality}
          </p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎊 COMPONENTE: EUPHORIA PARTICLES (para ganancias altas)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface EuphoriaParticlesProps {
  active: boolean
  intensity?: number
}

export function EuphoriaParticles({ active, intensity = 1 }: EuphoriaParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!active || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      life: number
    }

    const particles: Particle[] = []
    const colors = [
      QUANTUM_PALETTE.gold.pure,
      QUANTUM_PALETTE.gold.neon,
      QUANTUM_PALETTE.violet.neon,
    ]

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 4 * intensity,
      vy: -8 * intensity - Math.random() * 5,
      size: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    })

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Crear nuevas partículas
      if (Math.random() < 0.3 * intensity) {
        particles.push(createParticle())
      }

      // Actualizar y dibujar
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        p.x += p.vx
        p.y += p.vy
        p.vy += 0.2 // Gravedad
        p.life -= 0.01

        if (p.life <= 0 || p.y > canvas.height + 20) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.shadowBlur = 20
        ctx.shadowColor = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Trigger haptic
    triggerEuphoricHaptic()

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [active, intensity])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 9999 }}
    />
  )
}

export default {
  useBioFeedback,
  useBioFeedbackContext,
  BioFeedbackProvider,
  PulseVisualizer,
  EuphoriaParticles,
  triggerHaptic,
  triggerEuphoricHaptic,
  triggerSuccessHaptic,
  triggerWarningHaptic,
  MOOD_THEMES,
}
