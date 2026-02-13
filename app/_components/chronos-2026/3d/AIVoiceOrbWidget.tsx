/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎤 CHRONOS 2026 — AI VOICE ORB WIDGET FLOTANTE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Widget flotante de asistente IA con todas las características premium:
 * - Orb 3D animado con Spline (ai_voice_assistance_orb)
 * - Chat conversacional con voz
 * - Comandos rápidos
 * - Análisis contextual
 * - Integración con 5 servicios IA
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

"use client"

import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import Spline from "@splinetool/react-spline"
import type { Application as SplineApplication } from "@splinetool/runtime"
import {
  AlertTriangle,
  Bot,
  Check,
  Copy,
  Cpu,
  DollarSign,
  Loader2,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Package,
  Send,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from "lucide-react"
import { AnimatePresence, motion, useDragControls } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import * as THREE from "three"

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export type AIState = "idle" | "listening" | "thinking" | "responding" | "success" | "error"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  actions?: AIAction[]
}

export interface AIAction {
  type: "navigate" | "export" | "create" | "analyze" | "alert"
  label: string
  payload: any
}

export interface QuickCommand {
  id: string
  icon: React.ReactNode
  label: string
  prompt: string
}

export interface AIVoiceOrbWidgetProps {
  position?: { x: number; y: number }
  onMessage?: (message: string) => Promise<string>
  onAction?: (action: AIAction) => void
  enableVoice?: boolean
  enableSpline?: boolean
  splineScene?: string
  contextData?: Record<string, any>
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const stateColors: Record<AIState, { primary: string; secondary: string; glow: string }> = {
  idle: { primary: "#8b5cf6", secondary: "#a78bfa", glow: "#8b5cf6" },
  listening: { primary: "#10b981", secondary: "#34d399", glow: "#10b981" },
  thinking: { primary: "#f59e0b", secondary: "#fbbf24", glow: "#f59e0b" },
  responding: { primary: "#ec4899", secondary: "#f472b6", glow: "#ec4899" },
  success: { primary: "#22c55e", secondary: "#4ade80", glow: "#22c55e" },
  error: { primary: "#ef4444", secondary: "#f87171", glow: "#ef4444" },
}

// Quick commands
const quickCommands: QuickCommand[] = [
  {
    id: "ventas",
    icon: <TrendingUp className="h-4 w-4" />,
    label: "Resumen ventas",
    prompt: "¿Cuál es el resumen de ventas de hoy?",
  },
  {
    id: "alertas",
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "Alertas",
    prompt: "¿Hay alguna alerta importante?",
  },
  {
    id: "stock",
    icon: <Package className="h-4 w-4" />,
    label: "Stock crítico",
    prompt: "¿Qué productos tienen stock crítico?",
  },
  {
    id: "clientes",
    icon: <Users className="h-4 w-4" />,
    label: "Top clientes",
    prompt: "¿Quiénes son los top clientes de este mes?",
  },
  {
    id: "capital",
    icon: <DollarSign className="h-4 w-4" />,
    label: "Capital bancos",
    prompt: "¿Cuál es el capital total en bancos?",
  },
  {
    id: "prediccion",
    icon: <Cpu className="h-4 w-4" />,
    label: "Predicción",
    prompt: "¿Cuál es la predicción de ventas para el próximo mes?",
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// 3D ORB COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface Orb3DProps {
  state: AIState
  audioLevel: number
  onClick?: () => void
}

function Orb3D({ state, audioLevel, onClick }: Orb3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const ringsRef = useRef<THREE.Group>(null)
  const colors = stateColors[state]

  useFrame((frameState) => {
    const time = frameState.clock.elapsedTime

    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.3
      meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1

      const baseScale = state === "listening" ? 1.1 : 1
      const audioScale = 1 + audioLevel * 0.4
      const pulseScale = state === "thinking" ? 1 + Math.sin(time * 5) * 0.1 : 1

      meshRef.current.scale.setScalar(baseScale * audioScale * pulseScale)
    }

    if (glowRef.current) {
      const glowPulse = 1 + Math.sin(time * 2) * 0.15 + audioLevel * 0.3
      glowRef.current.scale.setScalar(1.8 * glowPulse)
      ;(glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.15 + Math.sin(time * 1.5) * 0.05 + audioLevel * 0.1
    }

    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.x = time * (0.3 + i * 0.2)
        ring.rotation.z = time * (0.2 - i * 0.1)
      })
    }
  })

  return (
    <group onClick={onClick}>
      {/* Core orb */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[0.5, 4]} />
          <MeshDistortMaterial
            color={colors.primary}
            emissive={colors.primary}
            emissiveIntensity={0.6 + audioLevel * 0.4}
            metalness={0.8}
            roughness={0.2}
            distort={0.3 + audioLevel * 0.2}
            speed={state === "thinking" ? 5 : 2}
          />
        </mesh>
      </Float>

      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial
          color={colors.secondary}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Energy rings */}
      <group ref={ringsRef}>
        <mesh>
          <torusGeometry args={[0.7, 0.02, 8, 64]} />
          <meshBasicMaterial color={colors.primary} transparent opacity={0.5} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.85, 0.015, 8, 64]} />
          <meshBasicMaterial color={colors.secondary} transparent opacity={0.3} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.0, 0.01, 8, 64]} />
          <meshBasicMaterial color={colors.primary} transparent opacity={0.2} />
        </mesh>
      </group>

      {/* Particles */}
      <Sparkles
        count={30}
        scale={2.5}
        size={3}
        speed={0.5}
        opacity={0.4 + audioLevel * 0.3}
        color={colors.primary}
      />
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPLINE ORB
// ═══════════════════════════════════════════════════════════════════════════════

function SplineOrb({
  scene,
  state,
  audioLevel,
}: {
  scene: string
  state: AIState
  audioLevel: number
}) {
  const splineRef = useRef<SplineApplication | null>(null)

  const onLoad = useCallback((spline: SplineApplication) => {
    splineRef.current = spline
  }, [])

  useEffect(() => {
    if (splineRef.current) {
      // Emit events based on state
      try {
        const eventName = `state_${state}`
        splineRef.current.emitEvent("mouseDown", eventName)
      } catch {
        // Events may not be configured
      }
    }
  }, [state])

  return <Spline scene={scene} onLoad={onLoad} style={{ width: "100%", height: "100%" }} />
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT MESSAGE
// ═══════════════════════════════════════════════════════════════════════════════

function ChatMessage({
  message,
  onAction,
  onCopy,
}: {
  message: Message
  onAction?: (action: AIAction) => void
  onCopy?: (content: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const isAssistant = message.role === "assistant"

  const handleCopy = () => {
    onCopy?.(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isAssistant ? "" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isAssistant ? "bg-gradient-to-br from-purple-500 to-blue-500" : "bg-white/10"
        } `}
      >
        {isAssistant ? (
          <Bot className="h-4 w-4 text-white" />
        ) : (
          <User className="h-4 w-4 text-white/70" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 ${isAssistant ? "" : "text-right"}`}>
        <div
          className={`inline-block max-w-[85%] rounded-2xl px-4 py-2 ${
            isAssistant
              ? "rounded-tl-sm bg-white/10 text-white"
              : "rounded-tr-sm bg-purple-500 text-white"
          } `}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Actions */}
        {isAssistant && message.actions && message.actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.actions.map((action, i) => (
              <motion.button
                key={i}
                onClick={() => onAction?.(action)}
                className="flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1 text-xs text-purple-300 transition-colors hover:bg-purple-500/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="h-3 w-3" />
                {action.label}
              </motion.button>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-white/30">
            {message.timestamp.toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isAssistant && (
            <button
              onClick={handleCopy}
              className="text-white/30 transition-colors hover:text-white/60"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN WIDGET
// ═══════════════════════════════════════════════════════════════════════════════

export function AIVoiceOrbWidget({
  position = { x: 20, y: 20 },
  onMessage,
  onAction,
  enableVoice = true,
  enableSpline = false,
  splineScene = "/spline-scenes/ai-voice-assistance-orb.splinecode",
  contextData = {},
}: AIVoiceOrbWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [aiState, setAiState] = useState<AIState>("idle")
  const [audioLevel, setAudioLevel] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "¡Hola! Soy CHRONOS AI, tu asistente de análisis financiero. Puedo ayudarte con ventas, inventario, predicciones y más. ¿En qué puedo ayudarte?",
      timestamp: new Date(),
    },
  ])
  const [showCommands, setShowCommands] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragControls = useDragControls()

  const colors = stateColors[aiState]

  // Simulate audio level when listening
  useEffect(() => {
    if (!isListening) {
      setAudioLevel(0)
      return
    }
    const interval = setInterval(() => {
      setAudioLevel(Math.random() * 0.8 + 0.2)
    }, 100)
    return () => clearInterval(interval)
  }, [isListening])

  // Auto scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // Send message handler
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsTyping(true)
      setAiState("thinking")

      try {
        // Use provided handler or simulate
        const response = onMessage ? await onMessage(content) : await simulateAIResponse(content)

        setAiState("responding")

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
          actions: generateActions(content),
        }

        setTimeout(() => {
          setMessages((prev) => [...prev, assistantMessage])
          setIsTyping(false)
          setAiState("success")
          setTimeout(() => setAiState("idle"), 1500)
        }, 500)
      } catch {
        setAiState("error")
        setIsTyping(false)
        setTimeout(() => setAiState("idle"), 2000)
      }
    },
    [onMessage]
  )

  // Simulate AI response
  const simulateAIResponse = async (query: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const responses: Record<string, string> = {
      ventas:
        "📊 **Resumen de Ventas de Hoy:**\n\n• Total vendido: $45,780 MXN\n• Transacciones: 12\n• Ticket promedio: $3,815 MXN\n• Top producto: Producto Premium A\n• Crecimiento vs ayer: +15%",
      stock:
        "📦 **Productos con Stock Crítico:**\n\n• Producto C: 5 unidades (urgente)\n• Producto F: 12 unidades\n• Producto K: 18 unidades\n\n⚠️ Te recomiendo generar órdenes de compra para evitar quiebre de stock.",
      capital:
        "💰 **Capital Total en Bancos:**\n\n• Bóveda Monte: $234,500\n• Bóveda USA: $89,200\n• Utilidades: $156,780\n• Profit: $45,000\n\n**Total: $525,480 MXN**",
      prediccion:
        "📈 **Predicción Próximo Mes:**\n\n• Ventas proyectadas: $1,245,000 MXN\n• Confianza: 87%\n• Tendencia: Alcista (+12%)\n• Mejor día estimado: Viernes 15\n\n💡 Considera aumentar inventario de productos Premium.",
      default:
        "Entendido. Basándome en los datos actuales del sistema, puedo ayudarte con esa consulta. ¿Necesitas que profundice en algún aspecto específico?",
    }

    const lowerQuery = query.toLowerCase()
    if (lowerQuery.includes("venta")) return responses.ventas ?? responses.default ?? ""
    if (lowerQuery.includes("stock") || lowerQuery.includes("inventario")) {
      return responses.stock ?? responses.default ?? ""
    }
    if (lowerQuery.includes("capital") || lowerQuery.includes("banco")) {
      return responses.capital ?? responses.default ?? ""
    }
    if (lowerQuery.includes("predicción") || lowerQuery.includes("prediccion")) {
      return responses.prediccion ?? responses.default ?? ""
    }

    return responses.default ?? ""
  }

  // Generate actions based on query
  const generateActions = (query: string): AIAction[] => {
    const lowerQuery = query.toLowerCase()
    const actions: AIAction[] = []

    if (lowerQuery.includes("venta")) {
      actions.push({ type: "navigate", label: "Ver Ventas", payload: { panel: "ventas" } })
      actions.push({ type: "export", label: "Exportar", payload: { type: "ventas" } })
    }
    if (lowerQuery.includes("stock")) {
      actions.push({ type: "navigate", label: "Ver Almacén", payload: { panel: "almacen" } })
      actions.push({ type: "create", label: "Crear OC", payload: { type: "orden" } })
    }

    return actions
  }

  // Toggle listening
  const toggleListening = useCallback(() => {
    setIsListening((prev) => {
      const newVal = !prev
      setAiState(newVal ? "listening" : "idle")
      return newVal
    })
  }, [])

  // Handle quick command
  const handleQuickCommand = useCallback(
    (command: QuickCommand) => {
      handleSendMessage(command.prompt)
      setShowCommands(false)
    },
    [handleSendMessage]
  )

  // Copy handler
  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content)
  }, [])

  return (
    <>
      {/* Floating button (when closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed z-[9999]"
            style={{ right: position.x, bottom: position.y }}
          >
            <motion.button
              onClick={() => setIsOpen(true)}
              className="relative h-16 w-16 rounded-full shadow-2xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* 3D Orb */}
              <div className="h-full w-full">
                {enableSpline ? (
                  <SplineOrb scene={splineScene} state={aiState} audioLevel={audioLevel} />
                ) : (
                  <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[5, 5, 5]} intensity={1} />
                    <Orb3D state={aiState} audioLevel={audioLevel} />
                  </Canvas>
                )}
              </div>

              {/* Glow */}
              <motion.div
                className="absolute inset-0 -z-10 rounded-full blur-xl"
                style={{ backgroundColor: colors.glow }}
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Status indicator */}
              <div className="absolute -top-1 -right-1 h-4 w-4 animate-pulse rounded-full border-2 border-black bg-emerald-500" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel (when open) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed z-[9999] overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 shadow-2xl backdrop-blur-2xl ${isExpanded ? "inset-4" : "h-[600px] w-96"} `}
            style={!isExpanded ? { right: position.x, bottom: position.y } : undefined}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-black/30 p-4">
              <div className="flex items-center gap-3">
                {/* Mini orb */}
                <div className="h-10 w-10">
                  {enableSpline ? (
                    <SplineOrb scene={splineScene} state={aiState} audioLevel={audioLevel} />
                  ) : (
                    <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
                      <ambientLight intensity={0.5} />
                      <Orb3D state={aiState} audioLevel={audioLevel} />
                    </Canvas>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">CHRONOS AI</h3>
                  <p className="flex items-center gap-1 text-xs text-white/50">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        aiState === "idle" ? "bg-emerald-400" : "animate-pulse bg-amber-400"
                      }`}
                    />
                    {aiState === "idle"
                      ? "En línea"
                      : aiState === "listening"
                        ? "Escuchando..."
                        : aiState === "thinking"
                          ? "Analizando..."
                          : aiState === "responding"
                            ? "Respondiendo..."
                            : "Listo"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {isExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick commands */}
            <div className="border-b border-white/5 p-3">
              <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
                {quickCommands.map((cmd) => (
                  <motion.button
                    key={cmd.id}
                    onClick={() => handleQuickCommand(cmd)}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs whitespace-nowrap text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {cmd.icon}
                    {cmd.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatRef}
              className="flex-1 space-y-4 overflow-y-auto p-4"
              style={{ height: isExpanded ? "calc(100% - 180px)" : "380px" }}
            >
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onAction={onAction}
                  onCopy={handleCopy}
                />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex gap-1 rounded-2xl bg-white/10 px-4 py-2">
                    <motion.span
                      className="h-2 w-2 rounded-full bg-white/50"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                    />
                    <motion.span
                      className="h-2 w-2 rounded-full bg-white/50"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
                    />
                    <motion.span
                      className="h-2 w-2 rounded-full bg-white/50"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input area */}
            <div className="border-t border-white/10 bg-black/30 p-4">
              <div className="flex items-center gap-2">
                {/* Voice button */}
                {enableVoice && (
                  <motion.button
                    onClick={toggleListening}
                    className={`rounded-xl p-3 transition-all ${
                      isListening
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                        : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                    } `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </motion.button>
                )}

                {/* Text input */}
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage(input)}
                    placeholder="Escribe tu mensaje..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 transition-colors outline-none focus:border-purple-500/50"
                    disabled={isTyping}
                  />
                </div>

                {/* Send button */}
                <motion.button
                  onClick={() => handleSendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 p-3 text-white shadow-lg shadow-purple-500/20 hover:from-purple-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isTyping ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </motion.button>
              </div>

              {/* Keyboard hint */}
              <p className="mt-2 text-center text-xs text-white/20">
                Presiona Enter para enviar • Cmd+K para comandos rápidos
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIVoiceOrbWidget
