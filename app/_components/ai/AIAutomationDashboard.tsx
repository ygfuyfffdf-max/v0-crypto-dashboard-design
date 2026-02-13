// 🤖 AI AUTOMATION DASHBOARD - CHRONOS INFINITY
// Sistema completo de automatización inteligente que responde dudas y llena formularios

import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import { Card } from "@/app/_components/ui/card"
import { Input } from "@/app/_components/ui/input"
import { useAI } from "@/app/_hooks/useAI"
import { useVoice } from "@/app/_hooks/useVoice"
import { FormAutomationService } from "@/app/_lib/services/ai/form-automation-service"
import { AnimatePresence, motion } from "framer-motion"
import {
  Bot,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  FileText,
  Lightbulb,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Search,
  Send,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  User,
  Wand,
  Zap,
} from "lucide-react"
import React, { useCallback, useEffect, useRef, useState } from "react"

interface AIMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  action?: {
    type: "fill_field" | "submit_form" | "query_data" | "create_record"
    payload: any
  }
  context?: {
    formId?: string
    intent?: string
    confidence?: number
  }
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  action: string
  examples: string[]
}

interface AIStats {
  totalConversations: number
  automatedForms: number
  successRate: number
  averageResponseTime: number
  activeUsers: number
}

const AIAutomationDashboard: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [aiStats, setAIStats] = useState<AIStats>({
    totalConversations: 1247,
    automatedForms: 892,
    successRate: 94.5,
    averageResponseTime: 1.2,
    activeUsers: 23,
  })
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [autoMode, setAutoMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { sendMessage, isProcessing } = useAI()
  const { startListening, stopListening, isSupported: voiceSupported } = useVoice()

  const quickActions: QuickAction[] = [
    {
      id: "1",
      title: "Registrar Venta",
      description: "Registra una venta completa con cliente y productos",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "from-green-500 to-emerald-600",
      action: "register_sale",
      examples: [
        "Registrar venta a Juan García por $5,000",
        "Nueva venta de laptops Dell",
        "Venta con tarjeta de crédito",
      ],
    },
    {
      id: "2",
      title: "Gestionar Gasto",
      description: "Registra gastos de operación o compras",
      icon: <FileText className="h-6 w-6" />,
      color: "from-orange-500 to-red-600",
      action: "manage_expense",
      examples: [
        "Gasto de $1,200 en papelería",
        "Pago de servicios de internet",
        "Compra de material de oficina",
      ],
    },
    {
      id: "3",
      title: "Nuevo Cliente",
      description: "Crea un nuevo cliente en el sistema",
      icon: <User className="h-6 w-6" />,
      color: "from-blue-500 to-purple-600",
      action: "create_client",
      examples: [
        "Agregar cliente María López",
        "Nuevo cliente con RFC",
        "Cliente corporativo importante",
      ],
    },
    {
      id: "4",
      title: "Consultar Datos",
      description: "Obtén información de ventas, clientes o productos",
      icon: <Search className="h-6 w-6" />,
      color: "from-purple-500 to-pink-600",
      action: "query_data",
      examples: ["Ventas del mes actual", "Clientes con deuda", "Productos más vendidos"],
    },
    {
      id: "5",
      title: "Generar Reporte",
      description: "Crea reportes automáticos con gráficos",
      icon: <Database className="h-6 w-6" />,
      color: "from-indigo-500 to-blue-600",
      action: "generate_report",
      examples: [
        "Reporte de ventas semanal",
        "Estado de cuentas por cobrar",
        "Análisis de rentabilidad",
      ],
    },
    {
      id: "6",
      title: "Automatización Avanzada",
      description: "Configura flujos complejos de automatización",
      icon: <Wand className="h-6 w-6" />,
      color: "from-violet-500 to-purple-600",
      action: "advanced_automation",
      examples: [
        "Automatizar facturación mensual",
        "Recordatorios de pago",
        "Actualización de inventarios",
      ],
    },
  ]

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    // Mensaje de bienvenida inicial con saludo según hora del día
    const hour = new Date().getHours()
    let greeting = "¡Hola! Soy tu asistente inteligente de CHRONOS INFINITY"

    if (hour >= 6 && hour < 12) {
      greeting = "¡Buenos días! Soy tu asistente inteligente de CHRONOS INFINITY"
    } else if (hour >= 12 && hour < 20) {
      greeting = "¡Buenas tardes! Soy tu asistente inteligente de CHRONOS INFINITY"
    } else {
      greeting = "¡Buenas noches! Soy tu asistente inteligente de CHRONOS INFINITY"
    }

    const welcomeMessage: AIMessage = {
      id: "welcome",
      role: "assistant",
      content: `${greeting}. Puedo ayudarte a registrar ventas, gestionar gastos, crear clientes, generar reportes y mucho más. Solo dime qué necesitas hacer y lo haré por ti automáticamente. ¿En qué puedo ayudarte hoy?`,
      timestamp: new Date(),
      context: { intent: "welcome", confidence: 1.0 },
    }
    setMessages([welcomeMessage])
  }, [])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    try {
      // Análisis de intención y contexto
      const aiResponse = await sendMessage({
        message: inputMessage,
        context: {
          conversationHistory: messages.slice(-10),
          systemContext: {
            userRole: "admin",
            currentTime: new Date().toISOString(),
            availableActions: quickActions.map((a) => a.action),
          },
        },
      })

      const assistantMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: aiResponse.message,
        timestamp: new Date(),
        action: aiResponse.action
          ? {
              type: aiResponse.action.type as
                | "fill_field"
                | "submit_form"
                | "query_data"
                | "create_record",
              payload: aiResponse.action.payload,
            }
          : undefined,
        context: {
          intent: aiResponse.intent,
          confidence: aiResponse.confidence,
          formId: aiResponse.formId,
        },
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Ejecutar acción si existe
      if (aiResponse.action) {
        await executeAIAction(aiResponse.action)
      }
    } catch (error) {
      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.",
        timestamp: new Date(),
        context: { intent: "error", confidence: 0 },
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const executeAIAction = async (action: any) => {
    try {
      const formService = new FormAutomationService()

      switch (action.type) {
        case "fill_field":
          await formService.autoFillForm(action.payload.formId, action.payload.fieldData)
          break
        case "submit_form":
          await formService.createRecord(action.payload)
          break
        case "create_record":
          const record = await formService.createRecord(action.payload)
          const successMessage: AIMessage = {
            id: `success-${Date.now()}`,
            role: "assistant",
            content: `✅ ¡Registro creado exitosamente! ID: ${record.id}`,
            timestamp: new Date(),
            context: { intent: "record_created", confidence: 1.0 },
          }
          setMessages((prev) => [...prev, successMessage])
          break
        default:
          console.log("Acción no reconocida:", action.type)
      }
    } catch (error) {
      console.error("Error ejecutando acción:", error)
    }
  }

  const handleQuickAction = (action: QuickAction) => {
    const example = action.examples[Math.floor(Math.random() * action.examples.length)]
    if (example) {
      setInputMessage(example)
    }
  }

  const toggleVoice = () => {
    if (isListening) {
      stopListening()
      setIsListening(false)
    } else {
      startListening((transcript) => {
        setInputMessage(transcript)
      })
      setIsListening(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 p-3">
              <Cpu className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="mb-2 text-4xl font-bold text-white">🤖 Asistente IA Automatizado</h1>
              <p className="text-purple-200">
                Sistema inteligente que responde dudas y automatiza formularios
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setAutoMode(!autoMode)}
              variant={autoMode ? "default" : "outline"}
              className={`${autoMode ? "bg-gradient-to-r from-purple-600 to-pink-600" : "border-purple-500 text-purple-200"}`}
            >
              <Wand className="mr-2 h-4 w-4" />
              Modo Auto
            </Button>
            {voiceSupported && (
              <Button
                onClick={toggleVoice}
                variant={isListening ? "default" : "outline"}
                className={`${isListening ? "bg-gradient-to-r from-red-600 to-pink-600" : "border-purple-500 text-purple-200"}`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="border-purple-500 bg-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Conversaciones</p>
                <p className="text-2xl font-bold text-white">{aiStats.totalConversations}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-purple-400" />
            </div>
          </Card>

          <Card className="border-purple-500 bg-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Formularios Auto</p>
                <p className="text-2xl font-bold text-white">{aiStats.automatedForms}</p>
              </div>
              <FileText className="h-8 w-8 text-green-400" />
            </div>
          </Card>

          <Card className="border-purple-500 bg-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Éxito</p>
                <p className="text-2xl font-bold text-white">{aiStats.successRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-400" />
            </div>
          </Card>

          <Card className="border-purple-500 bg-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Tiempo Resp</p>
                <p className="text-2xl font-bold text-white">{aiStats.averageResponseTime}s</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="border-purple-500 bg-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Usuarios Activos</p>
                <p className="text-2xl font-bold text-white">{aiStats.activeUsers}</p>
              </div>
              <User className="h-8 w-8 text-pink-400" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="flex h-[600px] flex-col border-purple-500 bg-slate-800">
              {/* Chat Header */}
              <div className="border-b border-purple-500 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 p-2">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Asistente IA</h3>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`h-2 w-2 rounded-full ${isProcessing ? "animate-pulse bg-yellow-400" : "bg-green-400"}`}
                        />
                        <span className="text-sm text-purple-200">
                          {isProcessing ? "Procesando..." : "Activo"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-purple-500 text-purple-200">
                      <Zap className="mr-1 h-3 w-3" />
                      IA Avanzada
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] ${message.role === "user" ? "order-2" : "order-1"}`}
                      >
                        <div
                          className={`rounded-2xl p-3 ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                              : "border border-purple-500 bg-slate-700 text-white"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          {message.context?.confidence && (
                            <div className="mt-2 flex items-center space-x-2">
                              <div className="h-1 flex-1 rounded-full bg-slate-600">
                                <div
                                  className="h-1 rounded-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-300"
                                  style={{ width: `${message.context.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-purple-200">
                                {(message.context.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-purple-300">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <div
                        className={`${message.role === "user" ? "order-1 mr-2" : "order-2 ml-2"}`}
                      >
                        {message.role === "user" ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="order-2 ml-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="order-1">
                      <div className="rounded-2xl border border-purple-500 bg-slate-700 p-3">
                        <div className="flex space-x-2">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400" />
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-purple-400"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-purple-400"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-purple-500 p-4">
                <div className="flex items-end space-x-2">
                  <div className="relative flex-1">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe tu mensaje o pregunta aquí..."
                      className="rounded-xl border-purple-500 bg-slate-700 pr-12 text-white"
                      disabled={isProcessing}
                    />
                    {voiceSupported && (
                      <Button
                        onClick={toggleVoice}
                        variant="ghost"
                        size="sm"
                        className="absolute top-1/2 right-2 -translate-y-1/2 transform text-purple-400 hover:text-purple-300"
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isProcessing}
                    className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions & Suggestions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-purple-500 bg-slate-800 p-4">
              <h3 className="mb-4 flex items-center font-semibold text-white">
                <Zap className="mr-2 h-5 w-5 text-yellow-400" />
                Acciones Rápidas
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickAction(action)}
                    className={`w-full rounded-xl bg-gradient-to-r p-3 ${action.color} text-left text-white transition-all duration-200 hover:shadow-lg`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-opacity-20 rounded-lg bg-white p-2">{action.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{action.title}</p>
                        <p className="text-xs opacity-90">{action.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* AI Suggestions */}
            <Card className="border-purple-500 bg-slate-800 p-4">
              <h3 className="mb-4 flex items-center font-semibold text-white">
                <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" />
                Sugerencias IA
              </h3>
              <div className="space-y-2">
                <div className="rounded-lg border border-purple-500 bg-slate-700 p-3">
                  <div className="flex items-start space-x-2">
                    <Star className="mt-1 h-4 w-4 text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium text-white">¿Necesitas ayuda?</p>
                      <p className="text-xs text-purple-200">
                        Puedo ayudarte con ventas, gastos, clientes y más
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-purple-500 bg-slate-700 p-3">
                  <div className="flex items-start space-x-2">
                    <Target className="mt-1 h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Modo Auto Activado</p>
                      <p className="text-xs text-purple-200">
                        La IA completará formularios automáticamente
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-purple-500 bg-slate-700 p-3">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="mt-1 h-4 w-4 text-pink-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Voz Disponible</p>
                      <p className="text-xs text-purple-200">
                        Usa el micrófono para hablar conmigo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAutomationDashboard
