/**
 * 🎤 VOICE COMMANDS HOOK — CHRONOS 2026
 * ═══════════════════════════════════════════════════════════════════════════
 * Hook para comandos de voz usando Web Speech API
 * Soporta español mexicano con comandos naturales
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

// Extender Window para SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

export interface VoiceCommand {
  /** Frases que activan el comando */
  phrases: string[]
  /** Acción a ejecutar */
  action: () => void
  /** Mensaje de feedback */
  feedback: string
  /** Categoría del comando */
  category: 'navigation' | 'action' | 'query'
}

export interface UseVoiceCommandsOptions {
  /** Idioma de reconocimiento (default: es-MX) */
  lang?: string
  /** Comandos personalizados adicionales */
  customCommands?: VoiceCommand[]
  /** Callback cuando se reconoce un comando */
  onCommand?: (command: VoiceCommand, transcript: string) => void
  /** Callback cuando no se reconoce */
  onUnrecognized?: (transcript: string) => void
}

/**
 * Hook para comandos de voz con Web Speech API
 *
 * @example
 * ```tsx
 * const { isListening, transcript, startListening, stopListening } = useVoiceCommands()
 *
 * <button onClick={startListening}>
 *   {isListening ? '🎤 Escuchando...' : '🎤 Hablar'}
 * </button>
 * ```
 */
export function useVoiceCommands(options: UseVoiceCommandsOptions = {}) {
  const { lang = 'es-MX', customCommands = [], onCommand, onUnrecognized } = options

  const router = useRouter()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Comandos por defecto del sistema CHRONOS
  const defaultCommands: VoiceCommand[] = [
    // Navegación
    {
      phrases: ['ir a dashboard', 'mostrar dashboard', 'inicio', 'pantalla principal'],
      action: () => router.push('/dashboard'),
      feedback: 'Navegando al dashboard',
      category: 'navigation',
    },
    {
      phrases: ['ir a ventas', 'mostrar ventas', 'ver ventas'],
      action: () => router.push('/ventas'),
      feedback: 'Navegando a ventas',
      category: 'navigation',
    },
    {
      phrases: ['ir a bancos', 'mostrar bancos', 'ver bóvedas', 'bóvedas'],
      action: () => router.push('/bancos'),
      feedback: 'Navegando a bancos',
      category: 'navigation',
    },
    {
      phrases: ['ir a clientes', 'mostrar clientes', 'ver clientes'],
      action: () => router.push('/clientes'),
      feedback: 'Navegando a clientes',
      category: 'navigation',
    },
    {
      phrases: ['ir a distribuidores', 'mostrar distribuidores', 'proveedores'],
      action: () => router.push('/distribuidores'),
      feedback: 'Navegando a distribuidores',
      category: 'navigation',
    },
    {
      phrases: ['ir a órdenes', 'mostrar órdenes', 'órdenes de compra'],
      action: () => router.push('/ordenes'),
      feedback: 'Navegando a órdenes de compra',
      category: 'navigation',
    },
    {
      phrases: ['ir a almacén', 'mostrar almacén', 'inventario'],
      action: () => router.push('/almacen'),
      feedback: 'Navegando al almacén',
      category: 'navigation',
    },

    // Acciones
    {
      phrases: ['nueva venta', 'crear venta', 'registrar venta', 'agregar venta'],
      action: () => document.querySelector<HTMLButtonElement>('[data-action="new-sale"]')?.click(),
      feedback: 'Abriendo formulario de nueva venta',
      category: 'action',
    },
    {
      phrases: ['transferir', 'hacer transferencia', 'mover dinero', 'transferencia'],
      action: () => document.querySelector<HTMLButtonElement>('[data-action="transfer"]')?.click(),
      feedback: 'Abriendo modal de transferencia',
      category: 'action',
    },
    {
      phrases: ['nuevo cliente', 'agregar cliente', 'crear cliente'],
      action: () =>
        document.querySelector<HTMLButtonElement>('[data-action="new-client"]')?.click(),
      feedback: 'Abriendo formulario de nuevo cliente',
      category: 'action',
    },
    {
      phrases: ['buscar', 'búsqueda', 'buscar algo'],
      action: () => document.querySelector<HTMLButtonElement>('[data-action="search"]')?.click(),
      feedback: 'Abriendo búsqueda',
      category: 'action',
    },

    // Consultas
    {
      phrases: ['cuánto capital', 'capital total', 'cuánto tengo'],
      action: () => {
        const capitalElement = document.querySelector('[data-metric="total-capital"]')
        if (capitalElement) {
          // Announce via screen reader
          const announcement = document.createElement('div')
          announcement.setAttribute('role', 'status')
          announcement.setAttribute('aria-live', 'polite')
          announcement.textContent = `Capital total: ${capitalElement.textContent}`
          document.body.appendChild(announcement)
          setTimeout(() => announcement.remove(), 1000)
        }
      },
      feedback: 'Consultando capital total',
      category: 'query',
    },
  ]

  // Combinar comandos por defecto con personalizados
  const allCommands = [...defaultCommands, ...customCommands]

  /**
   * Procesa el texto transcrito y ejecuta el comando correspondiente
   */
  const processCommand = useCallback(
    (text: string): boolean => {
      const normalizedText = text.toLowerCase().trim()

      for (const command of allCommands) {
        const matched = command.phrases.some((phrase) =>
          normalizedText.includes(phrase.toLowerCase()),
        )

        if (matched) {
          // Ejecutar acción
          command.action()

          // Callback opcional
          onCommand?.(command, text)

          // Feedback visual (toast o similar)
          const event = new CustomEvent('voice-command', {
            detail: { command, transcript: text },
          })
          window.dispatchEvent(event)

          return true
        }
      }

      // Comando no reconocido
      onUnrecognized?.(text)
      return false
    },
    [allCommands, onCommand, onUnrecognized],
  )

  /**
   * Inicia el reconocimiento de voz
   */
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
      setError('Tu navegador no soporta reconocimiento de voz')
      return
    }

    try {
      const recognition = new SpeechRecognitionAPI()
      recognition.lang = lang
      recognition.continuous = false
      recognition.interimResults = true
      recognition.maxAlternatives = 3

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
        setTranscript('')
      }

      recognition.onresult = (event) => {
        const current = event.resultIndex
        const result = event.results[current]
        const transcript = result?.[0]?.transcript ?? ''

        setTranscript(transcript)

        if (result?.isFinal) {
          processCommand(transcript)
        }
      }

      recognition.onerror = (event) => {
        setError(`Error: ${event.error}`)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      setError('Error al iniciar reconocimiento de voz')
    }
  }, [lang, processCommand])

  /**
   * Detiene el reconocimiento de voz
   */
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  /**
   * Alterna el estado de escucha
   */
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  // Verificar soporte al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition)
      setIsSupported(supported)
    }
  }, [])

  // Keyboard shortcut: Ctrl+Shift+V
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        toggleListening()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleListening])

  return {
    // Estado
    isListening,
    isSupported,
    transcript,
    error,

    // Métodos
    startListening,
    stopListening,
    toggleListening,

    // Utilidades
    commands: allCommands,
  }
}
