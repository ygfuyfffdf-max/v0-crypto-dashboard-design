// ═══════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2030 — IA COLABORATIVA CFO DIGITAL
// Sistema de voz avanzado para gestión financiera
// LA IA NUNCA HACE NADA SIN TU ORDEN EXPLÍCITA
// Solo recomienda, explica, pregunta y ejecuta cuando dices "sí"
// ═══════════════════════════════════════════════════════════════

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type IAActionType =
  | 'crear_venta'
  | 'transferir'
  | 'pagar_distribuidor'
  | 'generar_reporte'
  | 'mostrar_metricas'
  | 'mostrar_clientes'
  | 'mostrar_morosos'
  | 'enviar_cobro'
  | 'consulta_general'

export interface IAAction {
  type: IAActionType
  params: Record<string, unknown>
  requiereConfirmacion: boolean
  mensajeConfirmacion?: string
}

export interface IAResponse {
  mensaje: string
  accion?: IAAction
  datos?: Record<string, unknown>
  sugerencias?: string[]
}

export interface VentaFormData {
  cliente?: string
  cantidad?: number
  precioVenta?: number
  precioCompra?: number
  precioFlete?: number
}

// ═══════════════════════════════════════════════════════════════
// PATRONES DE RECONOCIMIENTO DE VOZ
// ═══════════════════════════════════════════════════════════════

const PATRONES_COMANDOS: Record<string, { regex: RegExp; action: IAActionType }[]> = {
  ventas: [
    { regex: /^(crear|nueva|registrar)\s*(una\s*)?(venta|factura)/i, action: 'crear_venta' },
    { regex: /^venta\s+de\s+(\d+)\s+piezas/i, action: 'crear_venta' },
  ],
  transferencias: [
    {
      regex: /^transfiere?\s+(\d+[\d,]*)\s*(millones?|mil|pesos)?\s*(de\s+)?(\w+)\s+(a\s+)?(\w+)/i,
      action: 'transferir',
    },
    { regex: /^mover?\s+(\d+[\d,]*)\s*(de\s+)?(\w+)\s+(a\s+)?(\w+)/i, action: 'transferir' },
  ],
  consultas: [
    { regex: /^(cuánto|cuanto)\s+(tengo|hay)\s+(en|de)\s+(\w+)/i, action: 'mostrar_metricas' },
    { regex: /^liquidez|capital|roce|margen/i, action: 'mostrar_metricas' },
    {
      regex: /^(muéstrame|mostrar|ver)\s+(las\s+)?(métricas|finanzas|números)/i,
      action: 'mostrar_metricas',
    },
  ],
  clientes: [
    { regex: /^(clientes?\s+)?morosos?/i, action: 'mostrar_morosos' },
    { regex: /^(muéstrame|ver|mostrar)\s+(los\s+)?clientes/i, action: 'mostrar_clientes' },
    { regex: /^(cobrar|enviar\s+cobro)\s+(a\s+)?(.+)/i, action: 'enviar_cobro' },
  ],
  reportes: [
    {
      regex: /^(generar?|crear?)\s+(reporte|informe)\s*(del?\s*)?(mes|semana|día)?/i,
      action: 'generar_reporte',
    },
  ],
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useVoiceRecognition
// Reconocimiento de voz con Web Speech API
// ═══════════════════════════════════════════════════════════════

export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'es-MX'

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const result = event.results[event.results.length - 1]
          if (result?.[0]) {
            const text = result[0].transcript
            setTranscript(text)

            if (result.isFinal) {
              logger.info('Voz reconocida', { context: 'IAColaborativa', data: { text } })
            }
          }
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          logger.error('Error en reconocimiento de voz', new Error(event.error), {
            context: 'IAColaborativa',
          })
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [isListening])

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useTextToSpeech
// Síntesis de voz con Web Speech API
// ═══════════════════════════════════════════════════════════════

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true)
    }
  }, [])

  const speak = useCallback(
    (text: string, options?: { rate?: number; pitch?: number }) => {
      if (!isSupported) return

      // Cancelar voz anterior si existe
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-MX'
      utterance.rate = options?.rate || 1.0
      utterance.pitch = options?.pitch || 1.0

      // Buscar voz en español
      const voices = window.speechSynthesis.getVoices()
      const spanishVoice = voices.find((v) => v.lang.startsWith('es'))
      if (spanishVoice) {
        utterance.voice = spanishVoice
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)

      logger.info('IA hablando', {
        context: 'IAColaborativa',
        data: { text: text.substring(0, 50) + '...' },
      })
    },
    [isSupported],
  )

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  return { isSpeaking, isSupported, speak, stop }
}

// ═══════════════════════════════════════════════════════════════
// PARSER DE COMANDOS DE VOZ
// ═══════════════════════════════════════════════════════════════

export function parseVoiceCommand(text: string): IAAction | null {
  const normalizedText = text.toLowerCase().trim()

  // Buscar en todos los patrones
  for (const [, patterns] of Object.entries(PATRONES_COMANDOS)) {
    for (const pattern of patterns) {
      const match = normalizedText.match(pattern.regex)
      if (match) {
        return buildAction(pattern.action, match, normalizedText)
      }
    }
  }

  // Comando no reconocido
  return {
    type: 'consulta_general',
    params: { texto: text },
    requiereConfirmacion: false,
  }
}

function buildAction(type: IAActionType, match: RegExpMatchArray, text: string): IAAction {
  switch (type) {
    case 'crear_venta': {
      const cantidadMatch = text.match(/(\d+)\s*piezas?/i)
      return {
        type: 'crear_venta',
        params: {
          cantidad: cantidadMatch?.[1] ? parseInt(cantidadMatch[1]) : undefined,
        },
        requiereConfirmacion: true,
        mensajeConfirmacion: '¿Quieres crear esta venta?',
      }
    }

    case 'transferir': {
      // Extraer monto
      let monto = 0
      const montoMatch = text.match(/(\d+[\d,]*)/i)
      if (montoMatch?.[1]) {
        monto = parseInt(montoMatch[1].replace(/,/g, ''))
        if (text.includes('millon')) monto *= 1000000
        else if (text.includes('mil')) monto *= 1000
      }

      // Extraer origen y destino
      const palabras = text.split(/\s+/)
      const deIndex = palabras.findIndex((p) => p === 'de')
      const aIndex = palabras.findIndex((p) => p === 'a')

      const origen =
        deIndex >= 0 && deIndex + 1 < palabras.length ? palabras[deIndex + 1] : undefined
      const destino = aIndex >= 0 && aIndex + 1 < palabras.length ? palabras[aIndex + 1] : undefined

      return {
        type: 'transferir',
        params: { monto, origen, destino },
        requiereConfirmacion: true,
        mensajeConfirmacion: `¿Confirmas transferir $${monto.toLocaleString()} de ${origen} a ${destino}?`,
      }
    }

    case 'mostrar_metricas':
      return {
        type: 'mostrar_metricas',
        params: {},
        requiereConfirmacion: false,
      }

    case 'mostrar_morosos':
      return {
        type: 'mostrar_morosos',
        params: {},
        requiereConfirmacion: false,
      }

    case 'mostrar_clientes':
      return {
        type: 'mostrar_clientes',
        params: {},
        requiereConfirmacion: false,
      }

    case 'enviar_cobro': {
      const clienteMatch = text.match(/cobrar?\s+(a\s+)?(.+)/i)
      return {
        type: 'enviar_cobro',
        params: { cliente: clienteMatch?.[2] },
        requiereConfirmacion: true,
        mensajeConfirmacion: `¿Enviar recordatorio de cobro a ${clienteMatch?.[2]}?`,
      }
    }

    case 'generar_reporte':
      return {
        type: 'generar_reporte',
        params: {
          periodo: text.includes('mes') ? 'mes' : text.includes('semana') ? 'semana' : 'dia',
        },
        requiereConfirmacion: false,
      }

    default:
      return {
        type: 'consulta_general',
        params: { texto: text },
        requiereConfirmacion: false,
      }
  }
}

// ═══════════════════════════════════════════════════════════════
// GENERADOR DE RESPUESTAS DE IA
// ═══════════════════════════════════════════════════════════════

export function generateIAResponse(action: IAAction, data?: Record<string, unknown>): IAResponse {
  switch (action.type) {
    case 'crear_venta':
      return {
        mensaje: '¿Para qué cliente? ¿Cuántas piezas? ¿Precio de venta? ¿Precio de compra? ¿Flete?',
        accion: action,
        sugerencias: ['Ejemplo: 20 piezas a Playa Azul, venta 12,500, costo 7,800, flete 600'],
      }

    case 'transferir':
      if (action.params.monto && action.params.origen && action.params.destino) {
        const monto = action.params.monto as number
        return {
          mensaje:
            `¿Confirmas $${monto.toLocaleString()} de ${action.params.origen} → ${action.params.destino}? ` +
            'Esto mejorará tu liquidez en aproximadamente 14 días y ROCE en +1.8%',
          accion: action,
        }
      }
      return {
        mensaje: '¿De qué banco a cuál y cuánto quieres transferir?',
        sugerencias: ['Ejemplo: Transfiere 2 millones de Utilidades a Bóveda Monte'],
      }

    case 'mostrar_metricas': {
      const metricas = data as
        | {
            capitalTotal?: number
            liquidezDias?: number
            margenNeto?: number
            roce?: number
            saludFinanciera?: number
          }
        | undefined

      if (metricas) {
        return {
          mensaje:
            `Capital total: $${(metricas.capitalTotal || 0).toLocaleString()}. ` +
            `Liquidez: ${metricas.liquidezDias || 0} días. ` +
            `Margen neto: ${metricas.margenNeto || 0}%. ` +
            `ROCE: ${metricas.roce || 0}%. ` +
            `Salud financiera: ${metricas.saludFinanciera || 0}/100.`,
          datos: metricas,
        }
      }
      return {
        mensaje: 'Cargando métricas financieras...',
      }
    }

    case 'mostrar_morosos': {
      const morosos = data as { count?: number; monto?: number } | undefined
      if (morosos) {
        return {
          mensaje:
            `Tienes ${morosos.count || 0} clientes morosos con un total de $${(morosos.monto || 0).toLocaleString()} pendiente. ` +
            '¿Quieres que les envíe recordatorio automático?',
          datos: morosos,
          sugerencias: ['Sí, envía cobros', 'Mostrar detalle'],
        }
      }
      return {
        mensaje: 'Buscando clientes morosos...',
      }
    }

    case 'generar_reporte':
      return {
        mensaje:
          `Generando reporte del ${action.params.periodo}... ` +
          '¿Lo leo completo o te envío el PDF?',
        sugerencias: ['Léelo', 'Envía PDF'],
      }

    default:
      return {
        mensaje:
          'No entendí el comando. Puedes decir cosas como: ' +
          '"crear venta", "transferir", "mostrar métricas", "clientes morosos"',
        sugerencias: ['Nueva venta', 'Ver métricas', 'Clientes morosos', 'Generar reporte'],
      }
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK PRINCIPAL: useIAColaborativa
// Integra voz, reconocimiento y respuestas
// ═══════════════════════════════════════════════════════════════

export interface IAColaborativaState {
  isActive: boolean
  currentAction: IAAction | null
  pendingConfirmation: boolean
  conversationHistory: Array<{
    role: 'user' | 'ia'
    mensaje: string
    timestamp: Date
  }>
}

export function useIAColaborativa() {
  const voice = useVoiceRecognition()
  const tts = useTextToSpeech()

  const [state, setState] = useState<IAColaborativaState>({
    isActive: false,
    currentAction: null,
    pendingConfirmation: false,
    conversationHistory: [],
  })

  const addToHistory = useCallback((role: 'user' | 'ia', mensaje: string) => {
    setState((prev) => ({
      ...prev,
      conversationHistory: [
        ...prev.conversationHistory,
        { role, mensaje, timestamp: new Date() },
      ].slice(-20), // Mantener solo últimos 20 mensajes
    }))
  }, [])

  const processCommand = useCallback(
    async (text: string) => {
      addToHistory('user', text)

      // Verificar si es confirmación
      const isConfirmation = /^(sí|si|confirma|ok|dale|hazlo|ejecuta)/i.test(text.trim())
      const isNegation = /^(no|cancela|olvídalo)/i.test(text.trim())

      if (state.pendingConfirmation && state.currentAction) {
        if (isConfirmation) {
          // Ejecutar acción confirmada
          const response =
            `Ejecutando: ${state.currentAction.type}. ` + 'Acción completada exitosamente.'
          addToHistory('ia', response)
          tts.speak(response)

          setState((prev) => ({
            ...prev,
            currentAction: null,
            pendingConfirmation: false,
          }))

          return { confirmed: true, action: state.currentAction }
        } else if (isNegation) {
          const response = 'Acción cancelada. ¿En qué más puedo ayudarte?'
          addToHistory('ia', response)
          tts.speak(response)

          setState((prev) => ({
            ...prev,
            currentAction: null,
            pendingConfirmation: false,
          }))

          return { confirmed: false }
        }
      }

      // Parsear nuevo comando
      const action = parseVoiceCommand(text)
      if (!action) {
        const response = 'No entendí. Intenta de nuevo.'
        addToHistory('ia', response)
        tts.speak(response)
        return null
      }

      // Generar respuesta
      const iaResponse = generateIAResponse(action)
      addToHistory('ia', iaResponse.mensaje)
      tts.speak(iaResponse.mensaje)

      if (action.requiereConfirmacion) {
        setState((prev) => ({
          ...prev,
          currentAction: action,
          pendingConfirmation: true,
        }))
      }

      return { action, response: iaResponse }
    },
    [state.pendingConfirmation, state.currentAction, addToHistory, tts],
  )

  const activate = useCallback(() => {
    setState((prev) => ({ ...prev, isActive: true }))
    tts.speak('Chronos activado. ¿En qué puedo ayudarte?')
    voice.startListening()
  }, [tts, voice])

  const deactivate = useCallback(() => {
    setState((prev) => ({ ...prev, isActive: false }))
    voice.stopListening()
    tts.stop()
  }, [voice, tts])

  // Procesar transcripción cuando está completa
  useEffect(() => {
    if (voice.transcript && !voice.isListening && state.isActive) {
      processCommand(voice.transcript)
    }
  }, [voice.transcript, voice.isListening, state.isActive, processCommand])

  return {
    ...state,
    voice,
    tts,
    activate,
    deactivate,
    processCommand,
  }
}

// ═══════════════════════════════════════════════════════════════
// TIPOS GLOBALES PARA WEB SPEECH API
// ═══════════════════════════════════════════════════════════════

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
