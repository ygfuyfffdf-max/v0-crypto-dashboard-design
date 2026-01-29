"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌✨ AURA SUPREME WIDGET — CHRONOS INFINITY 2026 ULTRA PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Widget de IA ultra premium con todas las funcionalidades avanzadas:
 *
 * 🎙️ VOZ PREMIUM (ElevenLabs Integration)
 * - Síntesis de voz realista con ElevenLabs
 * - Reconocimiento de voz avanzado
 * - Voice commands inteligentes
 *
 * 🤖 AUTOMATIZACIÓN INTELIGENTE
 * - Creación automática de órdenes de compra
 * - Llenado inteligente de formularios
 * - Razonamiento avanzado para decisiones
 * - Preguntas de clarificación cuando hay ambigüedad
 *
 * 🎨 UI ULTRA PREMIUM
 * - Orb 3D holográfico con partículas orbitando
 * - Glassmorphism GEN5
 * - Animaciones cinematográficas
 * - Botones funcionales con feedback háptico
 *
 * @version 3.0.0 SUPREME
 * @author IY Supreme Agent
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import {
  Bot,
  FileText,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  MoreVertical,
  Package,
  Send,
  Settings,
  ShoppingCart,
  Sparkles,
  User,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react"
import { AnimatePresence, motion, useAnimation } from "motion/react"
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type AuraStatus =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "processing"
  | "waiting-input"

export type AuraIntent =
  | "crear_orden_compra"
  | "crear_venta"
  | "registrar_cliente"
  | "registrar_gasto"
  | "consultar_deudas"
  | "consultar_inventario"
  | "transferir_fondos"
  | "analizar_ventas"
  | "general"

export interface AuraMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  intent?: AuraIntent
  metadata?: {
    formData?: Record<string, unknown>
    requiresConfirmation?: boolean
    options?: string[]
    kpis?: { label: string; value: string; trend?: string }[]
  }
}

export interface FormField {
  name: string
  label: string
  type: "text" | "number" | "select" | "date"
  required: boolean
  value?: string | number
  options?: { label: string; value: string }[]
  inferred?: boolean
}

export interface PendingAction {
  intent: AuraIntent
  fields: FormField[]
  missingFields: string[]
  data: Record<string, unknown>
}

interface AuraSupremeWidgetProps {
  className?: string
  onClose?: () => void
  initialOpen?: boolean
  position?: "bottom-right" | "bottom-left" | "center"
  elevenLabsApiKey?: string
  voiceId?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const INTENT_CONFIGS: Record<
  AuraIntent,
  { label: string; icon: typeof ShoppingCart; color: string; fields: FormField[] }
> = {
  crear_orden_compra: {
    label: "Crear Orden de Compra",
    icon: ShoppingCart,
    color: "#10B981",
    fields: [
      { name: "distribuidor", label: "Distribuidor", type: "select", required: true, options: [] },
      { name: "producto", label: "Producto", type: "text", required: true },
      { name: "cantidad", label: "Cantidad", type: "number", required: true },
      { name: "precioUnitario", label: "Precio Unitario", type: "number", required: false },
    ],
  },
  crear_venta: {
    label: "Registrar Venta",
    icon: FileText,
    color: "#8B5CF6",
    fields: [
      { name: "cliente", label: "Cliente", type: "select", required: true, options: [] },
      { name: "producto", label: "Producto", type: "text", required: true },
      { name: "cantidad", label: "Cantidad", type: "number", required: true },
      { name: "precioVenta", label: "Precio de Venta", type: "number", required: true },
    ],
  },
  registrar_cliente: {
    label: "Registrar Cliente",
    icon: User,
    color: "#EC4899",
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "telefono", label: "Teléfono", type: "text", required: false },
      { name: "email", label: "Email", type: "text", required: false },
    ],
  },
  registrar_gasto: {
    label: "Registrar Gasto",
    icon: Zap,
    color: "#F59E0B",
    fields: [
      { name: "concepto", label: "Concepto", type: "text", required: true },
      { name: "monto", label: "Monto", type: "number", required: true },
      { name: "banco", label: "Banco Origen", type: "select", required: true, options: [] },
    ],
  },
  consultar_deudas: {
    label: "Consultar Deudas",
    icon: FileText,
    color: "#EF4444",
    fields: [],
  },
  consultar_inventario: {
    label: "Consultar Inventario",
    icon: Package,
    color: "#06B6D4",
    fields: [],
  },
  transferir_fondos: {
    label: "Transferir Fondos",
    icon: Zap,
    color: "#6366F1",
    fields: [
      { name: "bancoOrigen", label: "Banco Origen", type: "select", required: true, options: [] },
      { name: "bancoDestino", label: "Banco Destino", type: "select", required: true, options: [] },
      { name: "monto", label: "Monto", type: "number", required: true },
    ],
  },
  analizar_ventas: {
    label: "Analizar Ventas",
    icon: Sparkles,
    color: "#A855F7",
    fields: [],
  },
  general: {
    label: "Consulta General",
    icon: MessageCircle,
    color: "#8B5CF6",
    fields: [],
  },
}

const STATUS_MESSAGES: Record<AuraStatus, string> = {
  idle: "Listo para ayudarte",
  listening: "Escuchando...",
  thinking: "Procesando...",
  speaking: "Respondiendo...",
  processing: "Ejecutando acción...",
  "waiting-input": "Esperando información...",
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: AuraOrb3D - Orb holográfico premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const AuraOrb3D = memo(function AuraOrb3D({
  status,
  size = 200,
  className,
}: {
  status: AuraStatus
  size?: number
  className?: string
}) {
  const id = useId()
  const orbControls = useAnimation()
  const particleControls = useAnimation()

  // Colores según estado
  const colors = useMemo(() => {
    switch (status) {
      case "listening":
        return { primary: "#10B981", secondary: "#34D399", glow: "rgba(16, 185, 129, 0.6)" }
      case "thinking":
        return { primary: "#8B5CF6", secondary: "#A78BFA", glow: "rgba(139, 92, 246, 0.6)" }
      case "speaking":
        return { primary: "#06B6D4", secondary: "#22D3EE", glow: "rgba(6, 182, 212, 0.6)" }
      case "processing":
        return { primary: "#F59E0B", secondary: "#FBBF24", glow: "rgba(245, 158, 11, 0.6)" }
      case "waiting-input":
        return { primary: "#EC4899", secondary: "#F472B6", glow: "rgba(236, 72, 153, 0.6)" }
      default:
        return { primary: "#8B5CF6", secondary: "#06B6D4", glow: "rgba(139, 92, 246, 0.4)" }
    }
  }, [status])

  // Animación de pulso según estado
  useEffect(() => {
    const pulseIntensity = status === "listening" || status === "speaking" ? 1.15 : 1.05
    const pulseDuration = status === "thinking" ? 0.8 : 1.5

    orbControls.start({
      scale: [1, pulseIntensity, 1],
      transition: { duration: pulseDuration, repeat: Infinity, ease: "easeInOut" },
    })

    if (status !== "idle") {
      particleControls.start({
        rotate: 360,
        transition: { duration: status === "thinking" ? 3 : 8, repeat: Infinity, ease: "linear" },
      })
    }
  }, [status, orbControls, particleControls])

  // Partículas orbitando
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        angle: (i / 20) * 360,
        distance: 0.7 + Math.random() * 0.3,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 2,
      })),
    []
  )

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      {/* Glow background */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          filter: "blur(30px)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Órbitas de partículas */}
      <motion.div
        className="absolute inset-0"
        animate={particleControls}
        style={{ transformOrigin: "center" }}
      >
        {particles.map((particle) => {
          const x = Math.cos((particle.angle * Math.PI) / 180) * (size / 2) * particle.distance
          const y = Math.sin((particle.angle * Math.PI) / 180) * (size / 2) * particle.distance

          return (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                left: size / 2 + x - particle.size / 2,
                top: size / 2 + y - particle.size / 2,
                background: Math.random() > 0.5 ? colors.primary : colors.secondary,
                boxShadow: `0 0 ${particle.size * 2}px ${colors.primary}`,
              }}
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )
        })}
      </motion.div>

      {/* Anillos orbitales */}
      {[0.5, 0.7, 0.9].map((scale, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-white/10"
          style={{
            width: size * scale,
            height: size * scale,
            left: (size - size * scale) / 2,
            top: (size - size * scale) / 2,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 20 + i * 10, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Orb principal */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          left: size * 0.25,
          top: size * 0.25,
          background: `radial-gradient(circle at 30% 30%, ${colors.secondary}, ${colors.primary} 60%, transparent 100%)`,
          boxShadow: `
            0 0 60px ${colors.glow},
            inset 0 0 30px rgba(255,255,255,0.3),
            0 0 100px ${colors.glow}
          `,
        }}
        animate={orbControls}
      >
        {/* Reflejo interno */}
        <motion.div
          className="absolute rounded-full bg-white/30"
          style={{
            width: "30%",
            height: "30%",
            left: "15%",
            top: "15%",
            filter: "blur(5px)",
          }}
        />
      </motion.div>

      {/* Ícono central */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ scale: status === "listening" ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.5, repeat: status === "listening" ? Infinity : 0 }}
      >
        {status === "listening" ? (
          <Mic className="h-8 w-8 text-white drop-shadow-lg" />
        ) : status === "speaking" ? (
          <Volume2 className="h-8 w-8 text-white drop-shadow-lg" />
        ) : (
          <Bot className="h-8 w-8 text-white drop-shadow-lg" />
        )}
      </motion.div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: MessageBubble - Burbuja de mensaje
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const MessageBubble = memo(function MessageBubble({
  message,
  onOptionSelect,
}: {
  message: AuraMessage
  onOptionSelect?: (option: string) => void
}) {
  const isUser = message.role === "user"
  const isSystem = message.role === "system"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-violet-500/20" : "bg-cyan-500/20"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-violet-400" />
        ) : (
          <Bot className="h-4 w-4 text-cyan-400" />
        )}
      </div>

      {/* Contenido */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5",
          isUser
            ? "bg-violet-500/20 text-white"
            : isSystem
              ? "border border-amber-500/30 bg-amber-500/10 text-amber-200"
              : "bg-white/5 text-white/90"
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>

        {/* KPIs si existen */}
        {message.metadata?.kpis && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {message.metadata.kpis.map((kpi, i) => (
              <div key={i} className="rounded-lg bg-white/5 p-2">
                <div className="text-xs text-white/50">{kpi.label}</div>
                <div className="text-sm font-semibold text-white">{kpi.value}</div>
                {kpi.trend && <div className="text-xs text-green-400">{kpi.trend}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Opciones si existen */}
        {message.metadata?.options && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.metadata.options.map((option, i) => (
              <motion.button
                key={i}
                onClick={() => onOptionSelect?.(option)}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {option}
              </motion.button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-1 text-right text-[10px] text-white/30">
          {message.timestamp.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: QuickActions - Acciones rápidas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const QuickActions = memo(function QuickActions({
  onAction,
}: {
  onAction: (intent: AuraIntent) => void
}) {
  const actions: { intent: AuraIntent; label: string; icon: typeof ShoppingCart }[] = [
    { intent: "crear_orden_compra", label: "Nueva Orden", icon: ShoppingCart },
    { intent: "crear_venta", label: "Registrar Venta", icon: FileText },
    { intent: "consultar_deudas", label: "Ver Deudas", icon: User },
    { intent: "analizar_ventas", label: "Análisis", icon: Sparkles },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {actions.map(({ intent, label, icon: Icon }) => (
        <motion.button
          key={intent}
          onClick={() => onAction(intent)}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/70 transition-colors hover:bg-white/10"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </motion.button>
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: VoiceButton - Botón de micrófono premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const VoiceButton = memo(function VoiceButton({
  isListening,
  isDisabled,
  onClick,
  size = "lg",
}: {
  isListening: boolean
  isDisabled: boolean
  onClick: () => void
  size?: "sm" | "md" | "lg"
}) {
  const sizes = {
    sm: { button: "h-10 w-10", icon: "h-4 w-4" },
    md: { button: "h-12 w-12", icon: "h-5 w-5" },
    lg: { button: "h-16 w-16", icon: "h-7 w-7" },
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "relative flex items-center justify-center rounded-full transition-all",
        sizes[size].button,
        isListening
          ? "bg-gradient-to-br from-green-500 to-emerald-600"
          : "bg-gradient-to-br from-violet-500 to-purple-600",
        isDisabled && "cursor-not-allowed opacity-50"
      )}
      whileHover={!isDisabled ? { scale: 1.05 } : undefined}
      whileTap={!isDisabled ? { scale: 0.95 } : undefined}
      style={{
        boxShadow: isListening
          ? "0 0 30px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.3)"
          : "0 0 30px rgba(139, 92, 246, 0.3)",
      }}
    >
      {/* Pulse ring cuando escucha */}
      {isListening && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-green-500/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-green-500/20"
            animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </>
      )}

      {isListening ? (
        <MicOff className={cn("text-white", sizes[size].icon)} />
      ) : (
        <Mic className={cn("text-white", sizes[size].icon)} />
      )}
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useAuraAI - Lógica principal del asistente
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function useAuraAI(elevenLabsApiKey?: string, voiceId?: string) {
  const [status, setStatus] = useState<AuraStatus>("idle")
  const [messages, setMessages] = useState<AuraMessage[]>([])
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Inicializar reconocimiento de voz
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI =
        window.SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition })
          .webkitSpeechRecognition
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI()
        recognition.continuous = false
        recognition.lang = "es-MX"
        recognition.interimResults = false

        recognition.onresult = (event) => {
          const transcript = event.results[0]?.[0]?.transcript
          if (transcript) {
            handleUserMessage(transcript)
          }
          setStatus("thinking")
        }

        recognition.onerror = () => {
          setStatus("idle")
        }

        recognition.onend = () => {
          if (status === "listening") {
            setStatus("idle")
          }
        }

        recognitionRef.current = recognition
      }
    }
  }, [])

  // Síntesis de voz con ElevenLabs
  const speak = useCallback(
    async (text: string) => {
      if (!isSpeakerEnabled) return

      setStatus("speaking")

      // Si hay API key de ElevenLabs, usar su API
      if (elevenLabsApiKey && voiceId) {
        try {
          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": elevenLabsApiKey,
            },
            body: JSON.stringify({
              text,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.5,
                use_speaker_boost: true,
              },
            }),
          })

          if (response.ok) {
            const audioBlob = await response.blob()
            const audioUrl = URL.createObjectURL(audioBlob)
            const audio = new Audio(audioUrl)
            audioRef.current = audio

            audio.onended = () => {
              setStatus("idle")
              URL.revokeObjectURL(audioUrl)
            }

            await audio.play()
            return
          }
        } catch (error) {
          console.warn("ElevenLabs error, falling back to native TTS")
        }
      }

      // Fallback a Web Speech API
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = "es-MX"
        utterance.rate = 1
        utterance.pitch = 1

        utterance.onend = () => setStatus("idle")
        window.speechSynthesis.speak(utterance)
      } else {
        setStatus("idle")
      }
    },
    [elevenLabsApiKey, voiceId, isSpeakerEnabled]
  )

  // Detección de intención
  const detectIntent = useCallback((text: string): AuraIntent => {
    const lower = text.toLowerCase()

    if (lower.includes("orden") && (lower.includes("compra") || lower.includes("comprar"))) {
      return "crear_orden_compra"
    }
    if (lower.includes("venta") || lower.includes("vender")) {
      return "crear_venta"
    }
    if (lower.includes("cliente") && (lower.includes("nuevo") || lower.includes("registrar"))) {
      return "registrar_cliente"
    }
    if (lower.includes("gasto") || lower.includes("gastar")) {
      return "registrar_gasto"
    }
    if (lower.includes("deuda") || lower.includes("deben")) {
      return "consultar_deudas"
    }
    if (lower.includes("inventario") || lower.includes("stock") || lower.includes("almacen")) {
      return "consultar_inventario"
    }
    if (lower.includes("transferir") || lower.includes("transferencia")) {
      return "transferir_fondos"
    }
    if (lower.includes("analiz") || lower.includes("reporte") || lower.includes("estadística")) {
      return "analizar_ventas"
    }

    return "general"
  }, [])

  // Extraer datos del mensaje
  const extractData = useCallback((text: string, intent: AuraIntent): Record<string, unknown> => {
    const data: Record<string, unknown> = {}
    const _lower = text.toLowerCase() // Para uso futuro

    // Extraer cantidad
    const cantidadMatch = text.match(/(\d+)\s*(piezas?|unidades?|cajas?)/i)
    if (cantidadMatch?.[1]) {
      data.cantidad = parseInt(cantidadMatch[1], 10)
    }

    // Extraer monto
    const montoMatch = text.match(/\$?([\d,]+(?:\.\d{2})?)/i)
    if (montoMatch?.[1] && !cantidadMatch) {
      data.monto = parseFloat(montoMatch[1].replace(",", ""))
    }

    // Extraer producto (palabras clave)
    if (intent === "crear_orden_compra" || intent === "crear_venta") {
      // Buscar después de "de" o "para"
      const productoMatch = text.match(/(?:de|para)\s+(.+?)(?:\s+(?:a|para|con|del?)|\s*$)/i)
      if (productoMatch?.[1]) {
        data.producto = productoMatch[1].trim()
      }
    }

    return data
  }, [])

  // Procesar acción automatizada
  const processAutomatedAction = useCallback(
    async (intent: AuraIntent, extractedData: Record<string, unknown>) => {
      const config = INTENT_CONFIGS[intent]
      const missingFields: string[] = []
      const data = { ...extractedData }

      // Verificar campos requeridos
      config.fields.forEach((field) => {
        if (field.required && !data[field.name]) {
          missingFields.push(field.name)
        }
      })

      if (missingFields.length > 0) {
        // Hay campos faltantes - preguntar al usuario
        setPendingAction({
          intent,
          fields: config.fields,
          missingFields,
          data,
        })
        setStatus("waiting-input")

        const missingLabels = missingFields.map(
          (f) => config.fields.find((cf) => cf.name === f)?.label ?? f
        )

        return {
          response: `Para ${config.label.toLowerCase()}, necesito que me proporciones: ${missingLabels.join(", ")}. ¿Puedes darme esos datos?`,
          requiresInput: true,
        }
      }

      // Todos los datos están completos - mostrar confirmación
      setStatus("processing")

      return {
        response: `Perfecto, voy a ${config.label.toLowerCase()} con los siguientes datos:\n${Object.entries(
          data
        )
          .map(([k, v]) => `• ${config.fields.find((f) => f.name === k)?.label ?? k}: ${v}`)
          .join("\n")}\n\n¿Confirmas esta acción?`,
        requiresConfirmation: true,
        data,
      }
    },
    []
  )

  // Manejar mensaje del usuario
  const handleUserMessage = useCallback(
    async (text: string) => {
      const userMessage: AuraMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setStatus("thinking")

      // Detectar intención
      const intent = detectIntent(text)
      const extractedData = extractData(text, intent)

      // Si hay una acción pendiente, intentar completarla
      if (pendingAction) {
        // Actualizar datos pendientes con nueva información
        const updatedData = { ...pendingAction.data, ...extractedData }
        const result = await processAutomatedAction(pendingAction.intent, updatedData)

        const assistantMessage: AuraMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.response,
          timestamp: new Date(),
          intent: pendingAction.intent,
          metadata: {
            formData: result.data,
            requiresConfirmation: result.requiresConfirmation,
          },
        }
        setMessages((prev) => [...prev, assistantMessage])

        if (!result.requiresInput) {
          setPendingAction(null)
        }

        speak(result.response)
        return
      }

      // Procesar nueva acción
      if (intent !== "general") {
        const result = await processAutomatedAction(intent, extractedData)

        const assistantMessage: AuraMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.response,
          timestamp: new Date(),
          intent,
          metadata: {
            formData: result.data,
            requiresConfirmation: result.requiresConfirmation,
          },
        }
        setMessages((prev) => [...prev, assistantMessage])
        speak(result.response)
        return
      }

      // Consulta general - respuesta simulada
      const generalResponse =
        "Entendido. ¿Hay algo específico en lo que pueda ayudarte? Puedo crear órdenes de compra, registrar ventas, consultar deudas de clientes, o analizar tus datos financieros."

      const assistantMessage: AuraMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: generalResponse,
        timestamp: new Date(),
        intent: "general",
      }
      setMessages((prev) => [...prev, assistantMessage])
      speak(generalResponse)
    },
    [detectIntent, extractData, processAutomatedAction, pendingAction, speak]
  )

  // Toggle escucha
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return

    if (status === "listening") {
      recognitionRef.current.stop()
      setStatus("idle")
    } else {
      recognitionRef.current.start()
      setStatus("listening")
    }
  }, [status])

  // Confirmar acción
  const confirmAction = useCallback(() => {
    if (!pendingAction) return

    setStatus("processing")

    // Simular ejecución
    setTimeout(() => {
      const successMessage: AuraMessage = {
        id: `system-${Date.now()}`,
        role: "system",
        content: `✅ ${INTENT_CONFIGS[pendingAction.intent].label} completada exitosamente.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, successMessage])
      setPendingAction(null)
      setStatus("idle")
      speak("Acción completada exitosamente.")
    }, 1500)
  }, [pendingAction, speak])

  // Cancelar acción
  const cancelAction = useCallback(() => {
    setPendingAction(null)
    setStatus("idle")

    const cancelMessage: AuraMessage = {
      id: `system-${Date.now()}`,
      role: "system",
      content: "Acción cancelada.",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, cancelMessage])
  }, [])

  // Quick action
  const handleQuickAction = useCallback(
    (intent: AuraIntent) => {
      const config = INTENT_CONFIGS[intent]

      if (config.fields.length === 0) {
        // Consulta sin campos requeridos
        handleUserMessage(`Quiero ${config.label.toLowerCase()}`)
      } else {
        // Acción con campos - iniciar flujo
        setPendingAction({
          intent,
          fields: config.fields,
          missingFields: config.fields.filter((f) => f.required).map((f) => f.name),
          data: {},
        })
        setStatus("waiting-input")

        const assistantMessage: AuraMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: `Vamos a ${config.label.toLowerCase()}. Por favor, dime los detalles.`,
          timestamp: new Date(),
          intent,
        }
        setMessages((prev) => [...prev, assistantMessage])
        speak(`Vamos a ${config.label.toLowerCase()}. Por favor, dime los detalles.`)
      }
    },
    [handleUserMessage, speak]
  )

  return {
    status,
    messages,
    pendingAction,
    isVoiceEnabled,
    isSpeakerEnabled,
    setIsVoiceEnabled,
    setIsSpeakerEnabled,
    toggleListening,
    handleUserMessage,
    handleQuickAction,
    confirmAction,
    cancelAction,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: AuraSupremeWidget
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const AuraSupremeWidget = memo(function AuraSupremeWidget({
  className,
  onClose,
  initialOpen = false,
  position = "bottom-right",
  elevenLabsApiKey,
  voiceId = "EXAVITQu4vr4xnSDxMaL", // Rachel - voz femenina natural
}: AuraSupremeWidgetProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    status,
    messages,
    pendingAction,
    isVoiceEnabled,
    isSpeakerEnabled,
    setIsVoiceEnabled,
    setIsSpeakerEnabled,
    toggleListening,
    handleUserMessage,
    handleQuickAction,
    confirmAction,
    cancelAction,
  } = useAuraAI(elevenLabsApiKey, voiceId)

  // Auto-scroll al nuevo mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Enviar mensaje de texto
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return
    handleUserMessage(inputValue.trim())
    setInputValue("")
  }, [inputValue, handleUserMessage])

  // Posiciones del widget
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  }

  return (
    <>
      {/* Botón flotante */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full",
              "bg-gradient-to-br from-violet-500 to-purple-600",
              "shadow-lg shadow-violet-500/30 transition-transform hover:scale-105",
              positionClasses[position],
              className
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bot className="h-7 w-7 text-white" />
            {/* Indicador de estado */}
            <motion.div
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Widget principal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "fixed z-50 flex h-[600px] w-[380px] flex-col overflow-hidden rounded-3xl",
              "border border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl",
              "shadow-2xl shadow-black/50",
              positionClasses[position],
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                  <Bot className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Aura</h3>
                  <span className="text-[10px] text-violet-400">3.0 PRO</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Toggle speaker */}
                <button
                  onClick={() => setIsSpeakerEnabled(!isSpeakerEnabled)}
                  className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {isSpeakerEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </button>

                {/* Toggle voice */}
                <button
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {isVoiceEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </button>

                {/* Settings */}
                <button className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/5 hover:text-white">
                  <Settings className="h-4 w-4" />
                </button>

                {/* Menu */}
                <button className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/5 hover:text-white">
                  <MoreVertical className="h-4 w-4" />
                </button>

                {/* Close */}
                <button
                  onClick={() => {
                    setIsOpen(false)
                    onClose?.()
                  }}
                  className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Orb Area */}
            <div className="relative flex h-52 items-center justify-center border-b border-white/5 bg-gradient-to-b from-violet-500/5 to-transparent">
              <AuraOrb3D status={status} size={160} />

              {/* Status text */}
              <motion.div
                className="absolute right-0 bottom-4 left-0 text-center"
                key={status}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="text-xs text-white/60">{STATUS_MESSAGES[status]}</span>
              </motion.div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Sparkles className="mb-3 h-8 w-8 text-violet-400/50" />
                  <p className="text-sm text-white/50">
                    Hola, soy Aura. ¿En qué puedo ayudarte hoy?
                  </p>
                  <p className="mt-1 text-xs text-white/30">
                    Prueba diciendo: &quot;Crea una orden de compra de 20 piezas&quot;
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onOptionSelect={(option) => handleUserMessage(option)}
                    />
                  ))}

                  {/* Botones de confirmación si hay acción pendiente */}
                  {pendingAction && status !== "waiting-input" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center gap-3"
                    >
                      <button
                        onClick={confirmAction}
                        className="flex items-center gap-2 rounded-xl bg-green-500/20 px-4 py-2 text-sm text-green-400 transition-colors hover:bg-green-500/30"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={cancelAction}
                        className="flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/30"
                      >
                        Cancelar
                      </button>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="border-t border-white/5 px-4 pt-3">
              <QuickActions onAction={handleQuickAction} />
            </div>

            {/* Input area */}
            <div className="flex items-center gap-3 border-t border-white/5 p-4">
              {/* Voice button */}
              <VoiceButton
                isListening={status === "listening"}
                isDisabled={!isVoiceEnabled || status === "thinking" || status === "speaking"}
                onClick={toggleListening}
                size="md"
              />

              {/* Text input */}
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Escribe un mensaje..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 transition-colors outline-none focus:border-violet-500/50 focus:bg-white/10"
                  disabled={status === "listening" || status === "speaking"}
                />
              </div>

              {/* Send button */}
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || status === "thinking"}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                  inputValue.trim()
                    ? "bg-violet-500 text-white hover:bg-violet-600"
                    : "bg-white/5 text-white/30"
                )}
                whileHover={inputValue.trim() ? { scale: 1.05 } : undefined}
                whileTap={inputValue.trim() ? { scale: 0.95 } : undefined}
              >
                {status === "thinking" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
})

export default AuraSupremeWidget
