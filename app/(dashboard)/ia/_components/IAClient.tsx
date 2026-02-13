"use client"

import { cn, formatCurrency } from "@/app/_lib/utils"
import { useChronosStore } from "@/app/lib/store"
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Cpu,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  TrendingUp,
  Volume2,
  VolumeX,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useRef, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIInsight {
  id: string
  type: "success" | "warning" | "info" | "prediction"
  title: string
  description: string
  value?: string
}

// Tipos para el contexto de IA
interface BancoContext {
  capitalActual?: number
}

interface VentaContext {
  precioTotalVenta?: number
}

interface ClienteContext {
  estado?: string
}

interface AIContext {
  bancos: Record<string, BancoContext>
  ventas?: VentaContext[]
  clientes?: ClienteContext[]
  distribuidores?: unknown[]
  ordenesCompra?: unknown[]
}

// ═══════════════════════════════════════════════════════════════════════════
// AI RESPONSE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

function generateAIResponse(input: string, context: AIContext): string {
  const lowerInput = input.toLowerCase()

  if (
    lowerInput.includes("capital") ||
    lowerInput.includes("dinero") ||
    lowerInput.includes("balance")
  ) {
    const total = Object.values(context.bancos).reduce(
      (acc: number, b: BancoContext) => acc + (b.capitalActual || 0),
      0
    )
    return `📊 **Resumen de Capital**\n\nEl capital total actual es de **${formatCurrency(
      total
    )}**.\n\nDistribuido en ${Object.keys(context.bancos).length} bancos/bóvedas.`
  }

  if (lowerInput.includes("venta") || lowerInput.includes("ventas")) {
    const totalVentas = context.ventas?.length || 0
    const montoTotal =
      context.ventas?.reduce(
        (acc: number, v: VentaContext) => acc + (v.precioTotalVenta || 0),
        0
      ) || 0
    return `📈 **Análisis de Ventas**\n\nTienes **${totalVentas}** ventas registradas.\nMonto total: **${formatCurrency(
      montoTotal
    )}**\n\n¿Necesitas un reporte más detallado?`
  }

  if (lowerInput.includes("cliente")) {
    const totalClientes = context.clientes?.length || 0
    const activos =
      context.clientes?.filter((c: ClienteContext) => c.estado === "activo").length || 0
    return `👥 **Cartera de Clientes**\n\nTotal: **${totalClientes}** clientes\nActivos: **${activos}**\n\nPuedo mostrarte los clientes con deudas pendientes si lo necesitas.`
  }

  if (lowerInput.includes("ayuda") || lowerInput.includes("puedes")) {
    return "🤖 **¿Cómo puedo ayudarte?**\n\n• Consultar capital y balance de bancos\n• Analizar ventas y tendencias\n• Ver cartera de clientes\n• Generar reportes\n• Verificar stock de almacén\n• Optimizar distribución de capital\n\nSolo pregúntame lo que necesites."
  }

  if (lowerInput.includes("hola") || lowerInput.includes("buenos")) {
    return "👋 **¡Hola!**\n\nSoy CHRONOS AI, tu asistente financiero. Estoy listo para ayudarte con:\n\n• Análisis de datos\n• Reportes en tiempo real\n• Predicciones\n• Recomendaciones\n\n¿En qué puedo asistirte hoy?"
  }

  return `🤔 Entiendo tu consulta sobre "${input}".\n\nPuedo ayudarte con información sobre capital, ventas, clientes, distribuidores y almacén. ¿Podrías ser más específico?\n\nEjemplos:\n• "¿Cuál es el capital total?"\n• "Muestra las ventas del mes"\n• "¿Cuántos clientes activos hay?"`
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function IAClient() {
  const { bancos, ventas, clientes, distribuidores, ordenesCompra } = useChronosStore()

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "¡Hola! Soy **CHRONOS AI**, tu asistente financiero inteligente. 🤖\n\nPuedo ayudarte a:\n\n• 📊 Analizar tus ventas y tendencias\n• 📝 Generar reportes automáticos\n• 💰 Predecir flujo de caja\n• 🎯 Optimizar distribución de capital\n\n¿En qué puedo ayudarte hoy?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Insights basados en datos reales
  const insights: AIInsight[] = [
    {
      id: "1",
      type: "success",
      title: "Sistema Operativo",
      description: `${Object.keys(bancos).length} bancos activos con capital distribuido`,
      value: formatCurrency(
        Object.values(bancos).reduce((acc, b) => acc + (b.capitalActual || 0), 0)
      ),
    },
    {
      id: "2",
      type: "info",
      title: "Ventas Registradas",
      description: `Total de ${ventas.length} ventas en el sistema`,
      value: formatCurrency(ventas.reduce((acc, v) => acc + (v.precioTotalVenta || 0), 0)),
    },
    {
      id: "3",
      type: clientes.filter((c) => (c.deuda || 0) > 0).length > 5 ? "warning" : "success",
      title: "Cartera de Clientes",
      description: `${clientes.filter((c) => c.estado === "activo").length} clientes activos`,
    },
    {
      id: "4",
      type: "prediction",
      title: "Órdenes de Compra",
      description: `${ordenesCompra.length} órdenes en el sistema`,
      value: formatCurrency(ordenesCompra.reduce((acc, o) => acc + (o.costoTotal || 0), 0)),
    },
  ]

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simular respuesta de IA
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(input, {
          bancos,
          ventas,
          clientes,
          distribuidores,
          ordenesCompra,
        }),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Cpu className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -right-1 -bottom-1 h-4 w-4 animate-pulse rounded-full border-2 border-gray-900 bg-emerald-500" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-3xl font-bold text-transparent">
              CHRONOS AI
            </h1>
            <p className="text-gray-400">Asistente Financiero Inteligente</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSpeaking(!isSpeaking)}
            className={cn(
              "rounded-xl border p-3 transition-all",
              isSpeaking
                ? "border-violet-500/30 bg-violet-500/20 text-violet-400"
                : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
            )}
          >
            {isSpeaking ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Insights Panel */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-violet-400" />
            Insights en Tiempo Real
          </h3>

          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "rounded-xl border p-4",
                  insight.type === "success" && "border-emerald-500/20 bg-emerald-500/10",
                  insight.type === "warning" && "border-amber-500/20 bg-amber-500/10",
                  insight.type === "info" && "border-blue-500/20 bg-blue-500/10",
                  insight.type === "prediction" && "border-violet-500/20 bg-violet-500/10"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{insight.title}</p>
                    <p className="mt-1 text-sm text-gray-400">{insight.description}</p>
                  </div>
                  {insight.type === "success" && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  )}
                  {insight.type === "warning" && (
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  )}
                  {insight.type === "info" && <BarChart3 className="h-5 w-5 text-blue-400" />}
                  {insight.type === "prediction" && (
                    <TrendingUp className="h-5 w-5 text-violet-400" />
                  )}
                </div>
                {insight.value && <p className="mt-2 text-lg font-bold">{insight.value}</p>}
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="border-t border-white/10 pt-4">
            <p className="mb-3 text-sm text-gray-400">Acciones Rápidas</p>
            <div className="flex flex-wrap gap-2">
              {["Capital total", "Ventas del mes", "Clientes activos"].map((action) => (
                <button
                  key={action}
                  onClick={() => {
                    setInput(action)
                    handleSend()
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm transition-colors hover:bg-white/10"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex h-[600px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 lg:col-span-2">
          {/* Messages */}
          <div ref={chatContainerRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl p-4",
                      message.role === "user"
                        ? "border border-violet-500/30 bg-violet-500/20"
                        : "border border-white/10 bg-white/5"
                    )}
                  >
                    <div className="prose prose-invert prose-sm max-w-none">
                      {message.content.split("\n").map((line, i) => (
                        <p key={i} className="mb-1 last:mb-0">
                          {line
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            .split("<strong>")
                            .map((part, j) => {
                              if (part.includes("</strong>")) {
                                const [bold, rest] = part.split("</strong>")
                                return (
                                  <span key={j}>
                                    <strong className="text-white">{bold}</strong>
                                    {rest}
                                  </span>
                                )
                              }
                              return <span key={j}>{part}</span>
                            })}
                        </p>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-gray-400"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">CHRONOS AI está escribiendo...</span>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-4">
            <div className="flex gap-2">
              <button
                onClick={() => setIsListening(!isListening)}
                className={cn(
                  "rounded-xl border p-3 transition-all",
                  isListening
                    ? "border-red-500/30 bg-red-500/20 text-red-400"
                    : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
                )}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500/50 focus:outline-none"
              />

              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 p-3 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
