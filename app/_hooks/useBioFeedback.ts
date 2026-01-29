/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 💓 CHRONOS 2026 — BIO-FEEDBACK WEBCAM PPG HOOK
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Hook para detección de ritmo cardíaco mediante análisis PPG de la webcam.
 * Utiliza photoplethysmography (PPG) para estimar BPM desde la cara del usuario.
 *
 * Características:
 * - Acceso a webcam con permisos
 * - Extracción de canal rojo de región de interés (frente/mejillas)
 * - Filtrado de señal para aislamiento de pulso
 * - Estimación de BPM en tiempo real
 * - Detección de estrés basada en HRV
 *
 * PRIVACIDAD: Todo el procesamiento es local, no se envía video al servidor.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface PPGData {
  bpm: number
  confidence: number
  rawSignal: number[]
  filteredSignal: number[]
  timestamp: number
}

interface BioFeedbackState {
  isEnabled: boolean
  isCalibrating: boolean
  hasPermission: boolean
  error: string | null
  currentBPM: number
  averageBPM: number
  confidence: number
  stressLevel: 'calm' | 'normal' | 'elevated' | 'high'
  hrv: number // Heart Rate Variability
}

interface UseBioFeedbackOptions {
  sampleRate?: number // Frames per second to analyze (default: 30)
  windowSize?: number // Seconds of data for BPM calculation (default: 10)
  calibrationTime?: number // Seconds for initial calibration (default: 5)
  autoStart?: boolean // Start capturing automatically (default: false)
}

interface UseBioFeedbackReturn {
  state: BioFeedbackState
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  start: () => Promise<void>
  stop: () => void
  requestPermission: () => Promise<boolean>
  ppgHistory: PPGData[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_OPTIONS: Required<UseBioFeedbackOptions> = {
  sampleRate: 30,
  windowSize: 10,
  calibrationTime: 5,
  autoStart: false,
}

// BPM ranges for stress detection
const BPM_THRESHOLDS = {
  calm: { min: 50, max: 65 },
  normal: { min: 60, max: 85 },
  elevated: { min: 80, max: 100 },
  high: { min: 95, max: 180 },
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNAL PROCESSING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Simple moving average filter
 */
function movingAverage(data: number[], windowSize: number): number[] {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1)
    const window = data.slice(start, i + 1)
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length
    result.push(avg)
  }
  return result
}

/**
 * Bandpass filter simulation (keeps frequencies between lowCut and highCut Hz)
 * Simplified implementation using moving average
 */
function bandpassFilter(
  data: number[],
  sampleRate: number,
  lowCut: number = 0.7, // ~42 BPM
  highCut: number = 3.0, // ~180 BPM
): number[] {
  // Remove DC component (high-pass effect)
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length
  const centered = data.map((val) => val - mean)

  // Low-pass to remove noise
  const lowPassWindow = Math.floor(sampleRate / highCut)
  const filtered = movingAverage(centered, Math.max(2, lowPassWindow))

  return filtered
}

/**
 * Detect peaks in signal to count heartbeats
 */
function detectPeaks(data: number[], minDistance: number = 10): number[] {
  const peaks: number[] = []

  for (let i = 1; i < data.length - 1; i++) {
    const curr = data[i] ?? 0
    const prev = data[i - 1] ?? 0
    const next = data[i + 1] ?? 0

    // Check if this point is a local maximum
    if (curr > prev && curr > next) {
      // Check minimum distance from last peak
      const lastPeak = peaks[peaks.length - 1]
      if (peaks.length === 0 || (lastPeak !== undefined && i - lastPeak >= minDistance)) {
        // Check if peak is significant (above mean)
        const localMean =
          data.slice(Math.max(0, i - 20), i + 20).reduce((sum, val) => sum + val, 0) / 40
        if (curr > localMean * 1.1) {
          peaks.push(i)
        }
      }
    }
  }

  return peaks
}

/**
 * Calculate BPM from detected peaks
 */
function calculateBPM(peaks: number[], sampleRate: number): { bpm: number; confidence: number } {
  if (peaks.length < 2) {
    return { bpm: 0, confidence: 0 }
  }

  // Calculate intervals between peaks
  const intervals: number[] = []
  for (let i = 1; i < peaks.length; i++) {
    const curr = peaks[i]
    const prev = peaks[i - 1]
    if (curr !== undefined && prev !== undefined) {
      intervals.push(curr - prev)
    }
  }

  // Convert to BPM
  const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length
  const bpm = (60 * sampleRate) / avgInterval

  // Calculate confidence based on interval consistency
  const intervalStd = Math.sqrt(
    intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length,
  )
  const cv = intervalStd / avgInterval // Coefficient of variation
  const confidence = Math.max(0, Math.min(1, 1 - cv * 2))

  return { bpm: Math.round(bpm), confidence }
}

/**
 * Calculate Heart Rate Variability (simplified RMSSD)
 */
function calculateHRV(peaks: number[], sampleRate: number): number {
  if (peaks.length < 3) return 0

  const rrIntervals: number[] = []
  for (let i = 1; i < peaks.length; i++) {
    const curr = peaks[i]
    const prev = peaks[i - 1]
    if (curr !== undefined && prev !== undefined) {
      rrIntervals.push(((curr - prev) / sampleRate) * 1000) // in ms
    }
  }

  // RMSSD calculation
  let sumSquares = 0
  for (let i = 1; i < rrIntervals.length; i++) {
    const curr = rrIntervals[i]
    const prev = rrIntervals[i - 1]
    if (curr !== undefined && prev !== undefined) {
      const diff = curr - prev
      sumSquares += diff * diff
    }
  }

  return Math.sqrt(sumSquares / (rrIntervals.length - 1))
}

/**
 * Determine stress level from BPM and HRV
 */
function getStressLevel(bpm: number, hrv: number): BioFeedbackState['stressLevel'] {
  // Low HRV with high BPM = high stress
  // High HRV with normal BPM = calm

  if (bpm < BPM_THRESHOLDS.calm.max && hrv > 50) return 'calm'
  if (bpm < BPM_THRESHOLDS.normal.max) return 'normal'
  if (bpm < BPM_THRESHOLDS.elevated.max) return 'elevated'
  return 'high'
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useBioFeedback(options: UseBioFeedbackOptions = {}): UseBioFeedbackReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const rawSignalBuffer = useRef<number[]>([])
  const bpmHistory = useRef<number[]>([])

  // State
  const [state, setState] = useState<BioFeedbackState>({
    isEnabled: false,
    isCalibrating: false,
    hasPermission: false,
    error: null,
    currentBPM: 0,
    averageBPM: 0,
    confidence: 0,
    stressLevel: 'normal',
    hrv: 0,
  })

  const [ppgHistory, setPPGHistory] = useState<PPGData[]>([])

  // ═══════════════════════════════════════════════════════════════════════════════
  // REQUEST PERMISSION
  // ═══════════════════════════════════════════════════════════════════════════════

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user',
          frameRate: { ideal: opts.sampleRate },
        },
      })

      // Stop the stream immediately, we just wanted permission
      stream.getTracks().forEach((track) => track.stop())

      setState((prev) => ({ ...prev, hasPermission: true, error: null }))
      logger.info('Webcam permission granted', { context: 'useBioFeedback' })
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Permission denied'
      setState((prev) => ({ ...prev, hasPermission: false, error: message }))
      logger.error('Webcam permission denied', error, { context: 'useBioFeedback' })
      return false
    }
  }, [opts.sampleRate])

  // ═══════════════════════════════════════════════════════════════════════════════
  // PROCESS FRAME
  // ═══════════════════════════════════════════════════════════════════════════════

  const processFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas || video.readyState !== 4) {
      animationRef.current = requestAnimationFrame(processFrame)
      return
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) {
      animationRef.current = requestAnimationFrame(processFrame)
      return
    }

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Extract region of interest (center of frame - forehead/cheek area)
    const roiX = Math.floor(canvas.width * 0.3)
    const roiY = Math.floor(canvas.height * 0.2)
    const roiWidth = Math.floor(canvas.width * 0.4)
    const roiHeight = Math.floor(canvas.height * 0.3)

    const imageData = ctx.getImageData(roiX, roiY, roiWidth, roiHeight)
    const data = imageData.data

    // Calculate average red channel value (PPG signal)
    let redSum = 0
    let pixelCount = 0

    for (let i = 0; i < data.length; i += 4) {
      const redValue = data[i] // Red channel
      if (redValue !== undefined) {
        redSum += redValue
        pixelCount++
      }
    }

    const avgRed = redSum / pixelCount
    rawSignalBuffer.current.push(avgRed)

    // Keep buffer size limited
    const maxBufferSize = opts.sampleRate * opts.windowSize
    if (rawSignalBuffer.current.length > maxBufferSize) {
      rawSignalBuffer.current = rawSignalBuffer.current.slice(-maxBufferSize)
    }

    // Process signal when we have enough data
    if (rawSignalBuffer.current.length >= opts.sampleRate * 3) {
      const filtered = bandpassFilter(rawSignalBuffer.current, opts.sampleRate)
      const peaks = detectPeaks(filtered, Math.floor(opts.sampleRate * 0.4)) // Min 0.4s between beats
      const { bpm, confidence } = calculateBPM(peaks, opts.sampleRate)
      const hrv = calculateHRV(peaks, opts.sampleRate)

      // Update BPM history
      if (bpm > 40 && bpm < 180 && confidence > 0.3) {
        bpmHistory.current.push(bpm)
        if (bpmHistory.current.length > 10) {
          bpmHistory.current = bpmHistory.current.slice(-10)
        }

        const avgBPM = Math.round(
          bpmHistory.current.reduce((sum, val) => sum + val, 0) / bpmHistory.current.length,
        )

        const stressLevel = getStressLevel(avgBPM, hrv)

        setState((prev) => ({
          ...prev,
          isCalibrating: bpmHistory.current.length < 3,
          currentBPM: bpm,
          averageBPM: avgBPM,
          confidence,
          hrv,
          stressLevel,
        }))

        // Add to history
        const ppgData: PPGData = {
          bpm,
          confidence,
          rawSignal: rawSignalBuffer.current.slice(-30),
          filteredSignal: filtered.slice(-30),
          timestamp: Date.now(),
        }

        setPPGHistory((prev) => [...prev.slice(-100), ppgData])
      }
    }

    animationRef.current = requestAnimationFrame(processFrame)
  }, [opts.sampleRate, opts.windowSize])

  // ═══════════════════════════════════════════════════════════════════════════════
  // START CAPTURE
  // ═══════════════════════════════════════════════════════════════════════════════

  const start = useCallback(async () => {
    try {
      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user',
          frameRate: { ideal: opts.sampleRate },
        },
      })

      streamRef.current = stream

      // Set up video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Set up canvas
      if (canvasRef.current) {
        canvasRef.current.width = 320
        canvasRef.current.height = 240
      }

      // Reset buffers
      rawSignalBuffer.current = []
      bpmHistory.current = []

      setState((prev) => ({
        ...prev,
        isEnabled: true,
        isCalibrating: true,
        hasPermission: true,
        error: null,
      }))

      // Start processing
      animationRef.current = requestAnimationFrame(processFrame)

      logger.info('Bio-feedback started', { context: 'useBioFeedback' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start webcam'
      setState((prev) => ({ ...prev, error: message }))
      logger.error('Failed to start bio-feedback', error, { context: 'useBioFeedback' })
    }
  }, [opts.sampleRate, processFrame])

  // ═══════════════════════════════════════════════════════════════════════════════
  // STOP CAPTURE
  // ═══════════════════════════════════════════════════════════════════════════════

  const stop = useCallback(() => {
    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    // Stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    // Clear video
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setState((prev) => ({
      ...prev,
      isEnabled: false,
      isCalibrating: false,
      currentBPM: 0,
      averageBPM: 0,
      confidence: 0,
    }))

    logger.info('Bio-feedback stopped', { context: 'useBioFeedback' })
  }, [])

  // ═══════════════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (opts.autoStart) {
      start()
    }

    return () => {
      stop()
    }
  }, [opts.autoStart, start, stop])

  return {
    state,
    videoRef,
    canvasRef,
    start,
    stop,
    requestPermission,
    ppgHistory,
  }
}

export default useBioFeedback
