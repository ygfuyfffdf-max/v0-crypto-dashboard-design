/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎤 CHRONOS 2026 — WAKE WORD DETECTION HOOK
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Hook para detección de wake word "Hey Chronos" usando Web Speech API
 * o Deepgram streaming para activar el asistente de voz.
 *
 * Características:
 * - Detección continua en background con bajo consumo
 * - Soporte para múltiples variantes: "Hey Chronos", "Oye Chronos", "Chronos"
 * - Feedback visual cuando se detecta la palabra
 * - Integración con el sistema de voz existente
 * - Modo demo sin permisos de micrófono
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface WakeWordState {
  isListening: boolean
  isDetected: boolean
  hasPermission: boolean
  error: string | null
  lastDetection: number | null
  detectionCount: number
  confidence: number
}

interface UseWakeWordOptions {
  wakeWords?: string[]
  language?: string
  continuous?: boolean
  autoStart?: boolean
  onWakeWord?: (word: string, confidence: number) => void
  onListeningStart?: () => void
  onListeningStop?: () => void
  cooldownMs?: number // Minimum time between detections
}

interface UseWakeWordReturn {
  state: WakeWordState
  startListening: () => Promise<void>
  stopListening: () => void
  toggleListening: () => void
  resetDetection: () => void
  isSupported: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_WAKE_WORDS = [
  'hey chronos',
  'hola chronos',
  'oye chronos',
  'chronos',
  'hey cronos',
  'hola cronos',
]

const DEFAULT_OPTIONS: Required<UseWakeWordOptions> = {
  wakeWords: DEFAULT_WAKE_WORDS,
  language: 'es-MX',
  continuous: true,
  autoStart: false,
  onWakeWord: () => {},
  onListeningStart: () => {},
  onListeningStop: () => {},
  cooldownMs: 2000,
}

// ═══════════════════════════════════════════════════════════════════════════════
// WAKE WORD MATCHING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Normalize text for comparison
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z\s]/g, '') // Remove non-letters
    .trim()
}

/**
 * Calculate similarity between two strings (Levenshtein-based)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1)
  const s2 = normalizeText(str2)

  if (s1 === s2) return 1
  if (s1.length === 0 || s2.length === 0) return 0

  // Check if one contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    const maxLen = Math.max(s1.length, s2.length)
    const minLen = Math.min(s1.length, s2.length)
    return (minLen / maxLen) * 0.9
  }

  // Levenshtein distance
  const matrix: number[][] = Array.from({ length: s1.length + 1 }, () =>
    Array.from({ length: s2.length + 1 }, () => 0),
  )

  for (let i = 0; i <= s1.length; i++) {
    matrix[i]![0] = i
  }

  for (let j = 0; j <= s2.length; j++) {
    matrix[0]![j] = j
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      const row = matrix[i]
      const prevRow = matrix[i - 1]
      if (row && prevRow) {
        row[j] = Math.min(
          (prevRow[j] ?? 0) + 1,
          (row[j - 1] ?? 0) + 1,
          (prevRow[j - 1] ?? 0) + cost,
        )
      }
    }
  }

  const distance = matrix[s1.length]?.[s2.length] ?? 0
  const maxLen = Math.max(s1.length, s2.length)
  return 1 - distance / maxLen
}

/**
 * Check if transcript contains wake word
 */
function detectWakeWord(
  transcript: string,
  wakeWords: string[],
): { detected: boolean; word: string; confidence: number } {
  const normalized = normalizeText(transcript)

  for (const wakeWord of wakeWords) {
    const similarity = calculateSimilarity(normalized, wakeWord)

    // Direct match
    if (normalized.includes(normalizeText(wakeWord))) {
      return { detected: true, word: wakeWord, confidence: 0.95 }
    }

    // Fuzzy match
    if (similarity > 0.7) {
      return { detected: true, word: wakeWord, confidence: similarity }
    }
  }

  return { detected: false, word: '', confidence: 0 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPEECH RECOGNITION SETUP
// ═══════════════════════════════════════════════════════════════════════════════

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message?: string
}

type SpeechRecognitionType = {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onstart: (() => void) | null
  onend: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onspeechend: (() => void) | null
}

function createSpeechRecognition(): SpeechRecognitionType | null {
  if (typeof window === 'undefined') return null

  const SpeechRecognition =
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionType })
      .SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionType })
      .webkitSpeechRecognition

  if (!SpeechRecognition) return null

  return new SpeechRecognition()
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useWakeWord(options: UseWakeWordOptions = {}): UseWakeWordReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Refs
  const recognitionRef = useRef<SpeechRecognitionType | null>(null)
  const lastDetectionRef = useRef<number>(0)

  // State
  const [state, setState] = useState<WakeWordState>({
    isListening: false,
    isDetected: false,
    hasPermission: false,
    error: null,
    lastDetection: null,
    detectionCount: 0,
    confidence: 0,
  })

  // Check if supported
  const isSupported =
    typeof window !== 'undefined' &&
    !!(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    )

  // ═══════════════════════════════════════════════════════════════════════════════
  // HANDLE RESULT
  // ═══════════════════════════════════════════════════════════════════════════════

  const handleResult = useCallback(
    (event: SpeechRecognitionEvent) => {
      const now = Date.now()

      // Check cooldown
      if (now - lastDetectionRef.current < opts.cooldownMs) {
        return
      }

      // Get transcript
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (!result) continue

        const firstAlternative = result[0]
        if (!firstAlternative) continue

        const transcript = firstAlternative.transcript

        logger.info('Speech detected', {
          context: 'useWakeWord',
          data: { transcript, isFinal: result.isFinal },
        })

        // Check for wake word
        const detection = detectWakeWord(transcript, opts.wakeWords)

        if (detection.detected) {
          lastDetectionRef.current = now

          setState((prev) => ({
            ...prev,
            isDetected: true,
            lastDetection: now,
            detectionCount: prev.detectionCount + 1,
            confidence: detection.confidence,
          }))

          opts.onWakeWord(detection.word, detection.confidence)

          logger.info('Wake word detected!', {
            context: 'useWakeWord',
            data: { word: detection.word, confidence: detection.confidence },
          })

          // Auto-reset detection state after short delay
          setTimeout(() => {
            setState((prev) => ({ ...prev, isDetected: false }))
          }, 1000)
        }
      }
    },
    [opts],
  )

  // ═══════════════════════════════════════════════════════════════════════════════
  // START LISTENING
  // ═══════════════════════════════════════════════════════════════════════════════

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setState((prev) => ({
        ...prev,
        error: 'Speech recognition not supported in this browser',
      }))
      return
    }

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true })

      // Create recognition instance
      const recognition = createSpeechRecognition()
      if (!recognition) {
        throw new Error('Failed to create speech recognition')
      }

      // Configure
      recognition.continuous = opts.continuous
      recognition.interimResults = true
      recognition.lang = opts.language
      recognition.maxAlternatives = 3

      // Event handlers
      recognition.onstart = () => {
        setState((prev) => ({
          ...prev,
          isListening: true,
          hasPermission: true,
          error: null,
        }))
        opts.onListeningStart()
        logger.info('Wake word listening started', { context: 'useWakeWord' })
      }

      recognition.onend = () => {
        // Auto-restart if continuous
        if (opts.continuous && recognitionRef.current) {
          try {
            recognition.start()
          } catch (e) {
            // Ignore restart errors
          }
        } else {
          setState((prev) => ({ ...prev, isListening: false }))
          opts.onListeningStop()
        }
      }

      recognition.onresult = handleResult

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Ignore no-speech errors in continuous mode
        if (event.error === 'no-speech' && opts.continuous) {
          return
        }

        logger.error('Speech recognition error', event, { context: 'useWakeWord' })

        if (event.error === 'not-allowed') {
          setState((prev) => ({
            ...prev,
            hasPermission: false,
            error: 'Microphone permission denied',
          }))
        } else {
          setState((prev) => ({ ...prev, error: event.error }))
        }
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start listening'
      setState((prev) => ({ ...prev, error: message, hasPermission: false }))
      logger.error('Failed to start wake word detection', error, { context: 'useWakeWord' })
    }
  }, [isSupported, opts, handleResult])

  // ═══════════════════════════════════════════════════════════════════════════════
  // STOP LISTENING
  // ═══════════════════════════════════════════════════════════════════════════════

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null // Prevent auto-restart
      recognitionRef.current.abort()
      recognitionRef.current = null
    }

    setState((prev) => ({ ...prev, isListening: false }))
    opts.onListeningStop()

    logger.info('Wake word listening stopped', { context: 'useWakeWord' })
  }, [opts])

  // ═══════════════════════════════════════════════════════════════════════════════
  // TOGGLE LISTENING
  // ═══════════════════════════════════════════════════════════════════════════════

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [state.isListening, startListening, stopListening])

  // ═══════════════════════════════════════════════════════════════════════════════
  // RESET DETECTION
  // ═══════════════════════════════════════════════════════════════════════════════

  const resetDetection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDetected: false,
      lastDetection: null,
      detectionCount: 0,
      confidence: 0,
    }))
  }, [])

  // ═══════════════════════════════════════════════════════════════════════════════
  // AUTO-START & CLEANUP
  // ═══════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (opts.autoStart && isSupported) {
      startListening()
    }

    return () => {
      stopListening()
    }
  }, []) // Only run on mount/unmount

  return {
    state,
    startListening,
    stopListening,
    toggleListening,
    resetDetection,
    isSupported,
  }
}

export default useWakeWord
