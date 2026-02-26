// @ts-nocheck
"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎙️ useVoiceFormFill — Voice-to-Form Automation Hook
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Conecta Deepgram STT con OpenAI para parsear intenciones de voz
 * y auto-llenar campos de formulario.
 *
 * Flujo:
 *  1. Graba audio via MediaRecorder
 *  2. Envía a /api/voice/transcribe (Deepgram)
 *  3. Envía transcript a /api/ai/parse-form-intent (OpenAI)
 *  4. Retorna campos parseados con confianza
 *  5. Fallback local si las APIs fallan
 *
 * @version 1.0.0
 */

import { useCallback, useEffect, useRef, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS E INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface VoiceFormField {
  name: string
  label: string
  type: "text" | "number" | "currency" | "select" | "date"
  options?: { value: string; label: string }[] // para tipo select
}

export interface VoiceFormResult {
  fields: Record<string, string | number>
  confidence: number
  rawTranscript: string
}

interface UseVoiceFormFillOptions {
  formFields: VoiceFormField[]
  onResult?: (result: VoiceFormResult) => void
  onError?: (error: string) => void
  language?: string // default 'es'
}

interface UseVoiceFormFillReturn {
  isListening: boolean
  isProcessing: boolean
  transcript: string
  result: VoiceFormResult | null
  error: string | null
  startListening: () => Promise<void>
  stopListening: () => void
  reset: () => void
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════

const FALLBACK_CONFIDENCE = 0.4

/** Mapeo de números en español a valores numéricos */
const SPANISH_NUMBERS: Record<string, number> = {
  cero: 0,
  uno: 1,
  una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
  veinte: 20,
  treinta: 30,
  cuarenta: 40,
  cincuenta: 50,
  sesenta: 60,
  setenta: 70,
  ochenta: 80,
  noventa: 90,
  cien: 100,
  ciento: 100,
  doscientos: 200,
  trescientos: 300,
  cuatrocientos: 400,
  quinientos: 500,
  seiscientos: 600,
  setecientos: 700,
  ochocientos: 800,
  novecientos: 900,
  mil: 1000,
  millón: 1000000,
  millon: 1000000,
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS — FALLBACK LOCAL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extrae un número de un texto en español.
 * Soporta: "$1,234.56", "1234", "mil doscientos", etc.
 */
function extractNumber(text: string): number | null {
  // Intentar patrones de moneda: $1,234.56 o 1.234,56
  const currencyMatch = text.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/)
  if (currencyMatch) {
    const cleaned = currencyMatch[1].replace(/,/g, "")
    const num = parseFloat(cleaned)
    if (!isNaN(num)) return num
  }

  // Intentar número directo
  const directMatch = text.match(/(\d[\d,.]*\d|\d+)/)
  if (directMatch) {
    const cleaned = directMatch[1].replace(/,/g, "")
    const num = parseFloat(cleaned)
    if (!isNaN(num)) return num
  }

  // Intentar números en español
  const words = text.toLowerCase().split(/\s+/)
  let total = 0
  let current = 0
  let found = false

  for (const word of words) {
    const val = SPANISH_NUMBERS[word]
    if (val !== undefined) {
      found = true
      if (val === 1000) {
        current = current === 0 ? 1000 : current * 1000
      } else if (val === 1000000) {
        current = current === 0 ? 1000000 : current * 1000000
        total += current
        current = 0
      } else {
        current += val
      }
    }
  }

  if (found) {
    total += current
    return total
  }

  return null
}

/**
 * Extrae una fecha de un texto en español.
 * Soporta: "hoy", "ayer", "mañana", formatos de fecha, etc.
 */
function extractDate(text: string): string | null {
  const lower = text.toLowerCase()

  const today = new Date()

  if (lower.includes("hoy")) {
    return today.toISOString().split("T")[0]
  }

  if (lower.includes("ayer")) {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split("T")[0]
  }

  if (lower.includes("mañana") && !lower.includes("por la mañana")) {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  // dd/mm/yyyy o dd-mm-yyyy
  const dateMatch = text.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/)
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, "0")
    const month = dateMatch[2].padStart(2, "0")
    let year = dateMatch[3]
    if (year.length === 2) year = "20" + year
    return `${year}-${month}-${day}`
  }

  // yyyy-mm-dd (ISO)
  const isoMatch = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`
  }

  return null
}

/**
 * Fuzzy match: compara una palabra contra las opciones de un select.
 * Retorna la opción con mayor similitud.
 */
function fuzzyMatchOption(
  text: string,
  options: { value: string; label: string }[]
): { value: string; label: string } | null {
  const lower = text.toLowerCase()

  // Primero: coincidencia exacta en label
  for (const opt of options) {
    if (lower.includes(opt.label.toLowerCase())) {
      return opt
    }
  }

  // Segundo: coincidencia exacta en value
  for (const opt of options) {
    if (lower.includes(opt.value.toLowerCase())) {
      return opt
    }
  }

  // Tercero: coincidencia parcial (al menos 3 chars consecutivos)
  let bestMatch: { value: string; label: string } | null = null
  let bestScore = 0

  for (const opt of options) {
    const optLabel = opt.label.toLowerCase()
    const words = lower.split(/\s+/)

    for (const word of words) {
      if (word.length < 3) continue

      if (optLabel.includes(word)) {
        const score = word.length / optLabel.length
        if (score > bestScore) {
          bestScore = score
          bestMatch = opt
        }
      }
    }
  }

  return bestScore > 0.3 ? bestMatch : null
}

/**
 * Fallback local: intenta parsear el transcript sin APIs externas.
 * Retorna campos con baja confianza (0.4).
 */
function localFallbackParse(
  transcript: string,
  fields: VoiceFormField[]
): Record<string, string | number> {
  const result: Record<string, string | number> = {}
  const lower = transcript.toLowerCase()

  for (const field of fields) {
    switch (field.type) {
      case "number":
      case "currency": {
        const num = extractNumber(transcript)
        if (num !== null) {
          result[field.name] = num
        }
        break
      }

      case "date": {
        const date = extractDate(transcript)
        if (date) {
          result[field.name] = date
        }
        break
      }

      case "select": {
        if (field.options && field.options.length > 0) {
          const match = fuzzyMatchOption(lower, field.options)
          if (match) {
            result[field.name] = match.value
          }
        }
        break
      }

      case "text":
      default: {
        // Para campos de texto, usar el transcript completo
        // Solo si el transcript menciona el label del campo o si es el único campo de texto
        const textFields = fields.filter((f) => f.type === "text")
        if (textFields.length === 1) {
          result[field.name] = transcript.trim()
        } else if (lower.includes(field.label.toLowerCase())) {
          // Intentar extraer el valor después del label
          const labelIdx = lower.indexOf(field.label.toLowerCase())
          const afterLabel = transcript.substring(labelIdx + field.label.length).trim()
          if (afterLabel.length > 0) {
            // Tomar hasta el siguiente label o fin del texto
            const nextLabelIdx = fields
              .filter((f) => f.name !== field.name)
              .map((f) => lower.indexOf(f.label.toLowerCase(), labelIdx + 1))
              .filter((idx) => idx > -1)
              .sort((a, b) => a - b)[0]

            result[field.name] = nextLabelIdx
              ? transcript.substring(labelIdx + field.label.length, nextLabelIdx).trim()
              : afterLabel
          }
        }
        break
      }
    }
  }

  return result
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export function useVoiceFormFill(options: UseVoiceFormFillOptions): UseVoiceFormFillReturn {
  const { formFields, onResult, onError, language = "es" } = options

  // ── Estado ──────────────────────────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [result, setResult] = useState<VoiceFormResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ── Refs ────────────────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // Refs estables para callbacks (evita stale closures)
  const formFieldsRef = useRef(formFields)
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)
  const languageRef = useRef(language)

  useEffect(() => {
    formFieldsRef.current = formFields
  }, [formFields])

  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    languageRef.current = language
  }, [language])

  // ── Helpers internos ───────────────────────────────────────────────────────

  const setErrorState = useCallback((msg: string) => {
    setError(msg)
    onErrorRef.current?.(msg)
  }, [])

  const cleanupRecorder = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    mediaRecorderRef.current = null

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    audioChunksRef.current = []
  }, [])

  // ── Transcribir audio via API ──────────────────────────────────────────────

  const transcribeAudio = useCallback(
    async (audioBlob: Blob): Promise<{ text: string; confidence: number } | null> => {
      try {
        const formData = new FormData()
        formData.append("audio", audioBlob, "recording.webm")
        formData.append("language", languageRef.current)

        const response = await fetch("/api/voice/transcribe", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Transcription failed: ${response.status}`)
        }

        const data = await response.json()

        return {
          text: data.transcript || data.text || "",
          confidence: data.confidence ?? 0.8,
        }
      } catch (err) {
        console.warn("[useVoiceFormFill] Transcription API failed, will use fallback:", err)
        return null
      }
    },
    []
  )

  // ── Parsear intención via API ──────────────────────────────────────────────

  const parseFormIntent = useCallback(
    async (
      transcriptText: string,
      fields: VoiceFormField[]
    ): Promise<{ fields: Record<string, string | number>; confidence: number } | null> => {
      try {
        const response = await fetch("/api/ai/parse-form-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: transcriptText, fields }),
        })

        if (!response.ok) {
          throw new Error(`Parse intent failed: ${response.status}`)
        }

        const data = await response.json()

        return {
          fields: data.fields || {},
          confidence: data.confidence ?? 0.7,
        }
      } catch (err) {
        console.warn("[useVoiceFormFill] Parse intent API failed, will use fallback:", err)
        return null
      }
    },
    []
  )

  // ── Procesar audio completo ────────────────────────────────────────────────

  const processAudio = useCallback(
    async (audioBlob: Blob) => {
      setIsProcessing(true)
      setError(null)

      const currentFields = formFieldsRef.current

      try {
        // Paso 1: Transcribir audio
        let transcriptText = ""
        let transcriptConfidence = 0.5

        const transcriptionResult = await transcribeAudio(audioBlob)

        if (transcriptionResult && transcriptionResult.text) {
          transcriptText = transcriptionResult.text
          transcriptConfidence = transcriptionResult.confidence
        } else {
          // Si la transcripción falla completamente, no podemos continuar
          setErrorState("No se pudo transcribir el audio. Intenta de nuevo.")
          setIsProcessing(false)
          return
        }

        setTranscript(transcriptText)

        // Paso 2: Parsear intención de formulario
        let parsedFields: Record<string, string | number> = {}
        let parseConfidence = FALLBACK_CONFIDENCE

        const intentResult = await parseFormIntent(transcriptText, currentFields)

        if (intentResult && Object.keys(intentResult.fields).length > 0) {
          parsedFields = intentResult.fields
          parseConfidence = intentResult.confidence
        } else {
          // Fallback local
          console.info("[useVoiceFormFill] Using local fallback parser")
          parsedFields = localFallbackParse(transcriptText, currentFields)
          parseConfidence = FALLBACK_CONFIDENCE
        }

        // Calcular confianza combinada
        const combinedConfidence = Math.min(transcriptConfidence, parseConfidence)

        const formResult: VoiceFormResult = {
          fields: parsedFields,
          confidence: combinedConfidence,
          rawTranscript: transcriptText,
        }

        setResult(formResult)
        onResultRef.current?.(formResult)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error procesando audio"
        setErrorState(msg)
      } finally {
        setIsProcessing(false)
      }
    },
    [transcribeAudio, parseFormIntent, setErrorState]
  )

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTROLES PÚBLICOS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Inicia la grabación de audio.
   * Solicita permisos de micrófono y comienza a grabar via MediaRecorder.
   */
  const startListening = useCallback(async () => {
    // Validar soporte del navegador
    if (typeof window === "undefined") {
      setErrorState("Este hook solo funciona en el navegador")
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorState("Tu navegador no soporta grabación de audio")
      return
    }

    if (!window.MediaRecorder) {
      setErrorState("Tu navegador no soporta grabación de audio")
      return
    }

    // Limpiar estado previo
    cleanupRecorder()
    setError(null)
    setTranscript("")
    setResult(null)

    try {
      // Solicitar permisos de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      streamRef.current = stream
      audioChunksRef.current = []

      // Determinar MIME type soportado
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4"

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder

      // Recolectar chunks de audio
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      // Cuando se detiene la grabación, procesar el audio
      recorder.onstop = () => {
        const chunks = audioChunksRef.current
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: mimeType })
          processAudio(audioBlob)
        } else {
          setErrorState("No se grabó audio. Intenta de nuevo.")
        }
      }

      recorder.onerror = () => {
        setErrorState("Error durante la grabación de audio")
        setIsListening(false)
        cleanupRecorder()
      }

      // Iniciar grabación (chunks cada 250ms para progresividad)
      recorder.start(250)
      setIsListening(true)
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setErrorState("Permiso de micrófono denegado. Habilita el acceso al micrófono.")
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setErrorState("No se encontró micrófono. Conecta un dispositivo de audio.")
      } else {
        const msg = err instanceof Error ? err.message : "Error al acceder al micrófono"
        setErrorState(msg)
      }
    }
  }, [cleanupRecorder, processAudio, setErrorState])

  /**
   * Detiene la grabación y dispara el procesamiento.
   */
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }

    // Detener tracks del stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setIsListening(false)
  }, [])

  /**
   * Resetea todo el estado del hook.
   */
  const reset = useCallback(() => {
    cleanupRecorder()
    setIsListening(false)
    setIsProcessing(false)
    setTranscript("")
    setResult(null)
    setError(null)
  }, [cleanupRecorder])

  // ── Cleanup al desmontar ───────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      cleanupRecorder()
    }
  }, [cleanupRecorder])

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    isListening,
    isProcessing,
    transcript,
    result,
    error,
    startListening,
    stopListening,
    reset,
  }
}

export default useVoiceFormFill
