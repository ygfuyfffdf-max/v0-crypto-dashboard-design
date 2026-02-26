"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Cpu, Eye, Mic, Settings, Sparkles, Zap } from "lucide-react"
import { useTheme } from "next-themes"
import React, { useCallback, useEffect, useMemo, useState } from "react"

// 🎨 Import premium glassmorphism styles
import "./GlassWidget.css"

// 🔧 Interfaces premium
export interface GlassWidgetProps {
  isExpanded?: boolean
  defaultExpanded?: boolean
  onToggle?: (expanded: boolean) => void
  position?: "floating" | "docked" | "sidebar"
  theme?: "light" | "dark" | "auto"
  aiCapabilities?: AICapabilities
  className?: string
  style?: React.CSSProperties
}

export interface AICapabilities {
  predictive: boolean
  voiceControl: boolean
  realTimeValidation: boolean
  vrArSupport: boolean
  contextualAssistant: boolean
}

interface GlassStyle {
  backdropFilter: string
  WebkitBackdropFilter: string
  background: string
  border: string
  borderRadius: string
  boxShadow: string
  transform?: string
}

interface AnimationState {
  scale?: number
  rotate?: number
  opacity?: number
  y?: number
}

// 🧠 AI Context Interface
interface AIContext {
  userId: string
  currentPage: string
  recentActions: string[]
  timeOfDay: number
  deviceType: "mobile" | "tablet" | "desktop"
  preferences: Record<string, any>
}

// 🎯 Premium GlassWidget Component
export const GlassWidget: React.FC<GlassWidgetProps> = ({
  isExpanded: controlledExpanded,
  defaultExpanded = false,
  onToggle,
  position = "floating",
  theme: propTheme,
  aiCapabilities = {
    predictive: true,
    voiceControl: true,
    realTimeValidation: true,
    vrArSupport: true,
    contextualAssistant: true,
  },
  className = "",
  style,
}) => {
  // 🎛️ State Management
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const [glassStyle, setGlassStyle] = useState<GlassStyle>()
  const [animationState, setAnimationState] = useState<AnimationState>()
  const [aiContext, setAIContext] = useState<AIContext>()
  const [predictions, setPredictions] = useState<string[]>([])
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    interactionTime: 0,
    predictionAccuracy: 0,
  })

  // 🎨 Theme Management
  const { theme: systemTheme, setTheme } = useTheme()
  const activeTheme = propTheme === "auto" ? systemTheme : propTheme

  // 🔄 Controlled/Uncontrolled State Logic
  const isExpanded = controlledExpanded ?? internalExpanded

  // 🎯 Optimized Glass Effect Generator
  const optimizeGlassEffect = useCallback(
    (options: {
      blur: number
      opacity: number
      border: string
      performance: "low" | "medium" | "high"
    }): GlassStyle => {
      const { blur, opacity, border, performance } = options

      // 🔧 Performance-based optimizations
      const actualBlur = performance === "low" ? Math.min(blur, 10) : blur
      const actualOpacity = performance === "low" ? Math.min(opacity, 0.05) : opacity

      return {
        backdropFilter: `blur(${actualBlur}px)`,
        WebkitBackdropFilter: `blur(${actualBlur}px)`,
        background:
          activeTheme === "dark"
            ? `rgba(0, 0, 0, ${actualOpacity})`
            : `rgba(255, 255, 255, ${actualOpacity})`,
        border,
        borderRadius: "16px",
        boxShadow:
          performance === "low"
            ? "0 4px 16px rgba(0, 0, 0, 0.1)"
            : "0 8px 32px rgba(0, 0, 0, 0.15)",
      }
    },
    [activeTheme]
  )

  // 🧠 AI Prediction Engine
  const generatePredictions = useCallback(
    async (context: AIContext): Promise<string[]> => {
      if (!aiCapabilities.predictive) return []

      // Simulate AI prediction based on context
      const predictions: string[] = []

      // Page-based predictions
      if (context.currentPage.includes("dashboard")) {
        predictions.push("Analizar métricas de ventas del día")
        predictions.push("Revisar stock crítico")
        predictions.push("Generar reporte financiero")
      }

      // Time-based predictions
      const hour = new Date().getHours()
      if (hour >= 9 && hour <= 11) {
        predictions.push("Revisar órdenes pendientes")
      } else if (hour >= 14 && hour <= 16) {
        predictions.push("Actualizar estados de pago")
      }

      // Recent actions analysis
      if (context.recentActions.includes("crear-venta")) {
        predictions.push("Registrar abono del cliente")
        predictions.push("Actualizar inventario")
      }

      return predictions.slice(0, 3) // Limit to top 3 predictions
    },
    [aiCapabilities.predictive]
  )

  // 🎤 Voice Control Handler
  const handleVoiceCommand = useCallback(
    async (command: string) => {
      if (!aiCapabilities.voiceControl) return

      setIsVoiceActive(true)

      try {
        // Simulate voice processing
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Process command
        const processedCommand = command.toLowerCase()

        if (processedCommand.includes("expandir") || processedCommand.includes("abrir")) {
          handleToggle()
        } else if (processedCommand.includes("cerrar") || processedCommand.includes("contraer")) {
          handleToggle()
        }

        // Add to recent actions
        setAIContext((prev) =>
          prev
            ? {
                ...prev,
                recentActions: [...prev.recentActions.slice(-4), command],
              }
            : undefined
        )
      } finally {
        setIsVoiceActive(false)
      }
    },
    [aiCapabilities.voiceControl]
  )

  // 🔄 Toggle Handler
  const handleToggle = useCallback(() => {
    const startTime = performance.now()

    const newExpanded = !isExpanded

    // Optimized state update
    if (controlledExpanded === undefined) {
      setInternalExpanded(newExpanded)
    }

    // Animation state
    setAnimationState({
      scale: newExpanded ? 1.02 : 1,
      rotate: newExpanded ? 180 : 0,
    })

    // Performance tracking
    const endTime = performance.now()
    setPerformanceMetrics((prev) => ({
      ...prev,
      interactionTime: endTime - startTime,
    }))

    // Callback
    onToggle?.(newExpanded)

    // Generate predictions when expanding
    if (newExpanded && aiContext) {
      generatePredictions(aiContext).then(setPredictions)
    }
  }, [isExpanded, controlledExpanded, onToggle, aiContext, generatePredictions])

  // 🌟 Context Update Handler
  const updateAIContext = useCallback((updates: Partial<AIContext>) => {
    setAIContext((prev) => (prev ? { ...prev, ...updates } : undefined))
  }, [])

  // 🚀 Performance Optimization Hook
  useEffect(() => {
    const startTime = performance.now()

    // Initialize AI context
    setAIContext({
      userId: "user-" + Math.random().toString(36).substr(2, 9),
      currentPage: window.location.pathname,
      recentActions: [],
      timeOfDay: new Date().getHours(),
      deviceType:
        window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
      preferences: {},
    })

    // Initialize glass effect
    const optimizedStyle = optimizeGlassEffect({
      blur: 30,
      opacity: 0.15,
      border: "1px solid rgba(255, 255, 255, 0.3)",
      performance: "high",
    })
    setGlassStyle(optimizedStyle)

    const endTime = performance.now()
    setPerformanceMetrics((prev) => ({
      ...prev,
      renderTime: endTime - startTime,
    }))
  }, [optimizeGlassEffect])

  // 🎯 Memoized Component Variants
  const widgetVariants = useMemo(
    () => ({
      floating: {
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: 20 },
      },
      docked: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
      },
      sidebar: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
      },
    }),
    []
  )

  const contentVariants: Record<string, any> = {
    initial: { opacity: 0, height: 0 },
    animate: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.15 },
      },
    },
  }

  // 🎨 Dynamic Position Classes
  const positionClasses = {
    floating: "fixed bottom-6 right-6 z-50",
    docked: "relative",
    sidebar: "fixed top-1/2 right-6 transform -translate-y-1/2 z-50",
  }

  // 🎯 Render Optimizado
  return (
    <motion.div
      className={`glass-widget ${positionClasses[position]} ${className}`}
      style={{ ...glassStyle, ...style }}
      variants={widgetVariants[position]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* 🎨 Header Premium */}
      <motion.div
        className="glass-widget-header"
        animate={animationState as any}
        transition={{ duration: 0.2 }}
      >
        {/* 🤖 AI Icon con animación */}
        <motion.div
          className="glass-widget-icon relative"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Cpu className="h-5 w-5" />
          {aiCapabilities.predictive && (
            <motion.div
              className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* 🎯 Título y estado */}
        <div className="ml-4 flex-1">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Asistente IA Premium
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {isVoiceActive ? "Escuchando..." : "Listo para ayudarte"}
          </p>
        </div>

        {/* 🔄 Toggle Button */}
        <motion.button
          className="glass-widget-toggle"
          onClick={handleToggle}
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          aria-label={isExpanded ? "Contraer widget" : "Expandir widget"}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.button>
      </motion.div>

      {/* 📦 Content Area Expansivo */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="glass-widget-content"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* 🧠 AI Assistant Panel */}
            <AIAssistantPanel
              capabilities={aiCapabilities}
              predictions={predictions}
              onPredictionClick={(prediction) => console.log("Prediction clicked:", prediction)}
              context={aiContext}
            />

            {/* ⚡ Quick Actions */}
            <QuickActions
              capabilities={aiCapabilities}
              onVoiceToggle={() => setIsVoiceActive(!isVoiceActive)}
              isVoiceActive={isVoiceActive}
              onAction={(action) => console.log("Quick action:", action)}
            />

            {/* 📊 Performance Metrics */}
            {process.env.NODE_ENV === "development" && (
              <PerformanceMetrics metrics={performanceMetrics} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// 🧠 AI Assistant Panel Component
const AIAssistantPanel: React.FC<{
  capabilities: AICapabilities
  predictions: string[]
  onPredictionClick: (prediction: string) => void
  context?: AIContext
}> = ({ capabilities, predictions, onPredictionClick, context }) => {
  if (!capabilities.contextualAssistant) return null

  return (
    <div className="glass-card">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Predicciones Inteligentes
        </h4>
        <Sparkles className="h-4 w-4 text-purple-500" />
      </div>

      <div className="space-y-2">
        {predictions.map((prediction, index) => (
          <motion.button
            key={index}
            className="glass-button w-full text-left text-sm"
            onClick={() => onPredictionClick(prediction)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center">
              <Zap className="mr-2 h-3 w-3 text-yellow-500" />
              {prediction}
            </div>
          </motion.button>
        ))}

        {predictions.length === 0 && (
          <p className="py-4 text-center text-xs text-gray-600 dark:text-gray-400">
            Analizando patrones de uso...
          </p>
        )}
      </div>
    </div>
  )
}

// ⚡ Quick Actions Component
const QuickActions: React.FC<{
  capabilities: AICapabilities
  onVoiceToggle: () => void
  isVoiceActive: boolean
  onAction: (action: string) => void
}> = ({ capabilities, onVoiceToggle, isVoiceActive, onAction }) => {
  const actions = [
    { id: "voice", label: "Voz", icon: Mic, active: isVoiceActive, onClick: onVoiceToggle },
    { id: "vr", label: "VR/AR", icon: Eye, active: false, onClick: () => onAction("toggle-vr") },
    {
      id: "settings",
      label: "Config",
      icon: Settings,
      active: false,
      onClick: () => onAction("open-settings"),
    },
  ]
    .filter((action) => action.id !== "voice" || capabilities.voiceControl)
    .filter((action) => action.id !== "vr" || capabilities.vrArSupport)

  return (
    <div className="glass-card">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Acciones Rápidas</h4>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.id}
              className={`glass-button flex flex-col items-center py-3 ${
                action.active ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" : ""
              }`}
              onClick={action.onClick}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="mb-1 h-5 w-5" />
              <span className="text-xs">{action.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// 📊 Performance Metrics Component (Development only)
const PerformanceMetrics: React.FC<{
  metrics: { renderTime: number; interactionTime: number; predictionAccuracy: number }
}> = ({ metrics }) => {
  return (
    <div className="glass-card text-xs">
      <div className="mb-2 flex items-center justify-between">
        <h5 className="font-medium text-gray-700 dark:text-gray-300">Performance</h5>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Render:</span>
          <span className={metrics.renderTime < 16 ? "text-green-500" : "text-yellow-500"}>
            {metrics.renderTime.toFixed(1)}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span>Interaction:</span>
          <span className={metrics.interactionTime < 50 ? "text-green-500" : "text-yellow-500"}>
            {metrics.interactionTime.toFixed(1)}ms
          </span>
        </div>
      </div>
    </div>
  )
}

// 🎯 Export with display name for debugging
GlassWidget.displayName = "GlassWidget"

export default GlassWidget
