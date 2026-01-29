'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧠✨ COGNITO WIDGET — Widget de IA Premium Ultra-Avanzado para CHRONOS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Widget de IA de última generación con:
 *
 * 🌌 AVATAR DINÁMICO
 * - Sistema de partículas 3D con física spring
 * - Estados visuales reactivos (idle, listening, thinking, speaking)
 * - Parallax 3D con seguimiento del mouse
 * - Conexiones neuronales animadas
 *
 * 💬 INTERFAZ CONVERSACIONAL
 * - Chat con burbujas premium y metadata
 * - Autocompletado inteligente
 * - Sugerencias contextuales
 * - Indicadores de escritura
 *
 * 🎙️ SISTEMA DE VOZ
 * - Speech-to-Text nativo
 * - Text-to-Speech con voces naturales
 * - Visualizador de ondas de audio
 * - Control de volumen y mute
 *
 * 🧠 MOTOR DE IA
 * - Detección de intención con NLP en español
 * - Consultas a Turso/Drizzle en tiempo real
 * - Ejecución de operaciones CRUD
 * - Análisis financiero y KPIs
 *
 * 💡 FUNCIONES PROACTIVAS
 * - Sugerencias automáticas
 * - Alertas de riesgo
 * - Insights de negocio
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import {
    AlertTriangle,
    Bot,
    ChevronDown,
    Lightbulb,
    Maximize2,
    MessageSquare,
    Minimize2,
    Settings,
    Sparkles,
    X,
    Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { CognitoAvatar } from './CognitoAvatar'
import {
    ChatInput,
    MessageBubble,
    ModeSelector,
    QuickActions,
    TypingIndicator,
} from './CognitoChat'
import { processQuery } from './CognitoEngine'
import { useVoice, VoiceButton, VoiceWaveVisualizer } from './CognitoVoice'
import type { CognitoMode, CognitoWidgetProps, ProactiveSuggestion } from './types'
import { STATE_COLORS, STATE_LABELS } from './types'
import { useCognitoStore } from './useCognitoStore'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 METRICS PANEL — Panel de métricas del asistente
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MetricsPanelProps {
  className?: string
}

function MetricsPanel({ className }: MetricsPanelProps) {
  const metrics = useCognitoStore((s) => s.metrics)

  const items = [
    {
      label: 'Consultas hoy',
      value: metrics.queriesToday,
      icon: MessageSquare,
      trend: '+12%',
      color: 'violet',
    },
    {
      label: 'Precisión',
      value: `${metrics.accuracyRate}%`,
      icon: Sparkles,
      trend: '+2.5%',
      color: 'green',
    },
    {
      label: 'Insights',
      value: metrics.insightsGenerated,
      icon: Lightbulb,
      trend: '+8',
      color: 'amber',
    },
    {
      label: 'Tiempo resp.',
      value: `${metrics.averageResponseTime}s`,
      icon: Zap,
      trend: '-0.3s',
      color: 'cyan',
    },
  ]

  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      {items.map(({ label, value, icon: Icon, trend, color }) => (
        <motion.div
          key={label}
          className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-3 backdrop-blur-sm transition-colors hover:bg-white/5"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-start justify-between">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg',
                color === 'violet' && 'bg-violet-500/20 text-violet-400',
                color === 'green' && 'bg-green-500/20 text-green-400',
                color === 'amber' && 'bg-amber-500/20 text-amber-400',
                color === 'cyan' && 'bg-cyan-500/20 text-cyan-400',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span className="text-[10px] text-green-400">{trend}</span>
          </div>
          <div className="mt-2">
            <div className="text-lg font-semibold text-white">{value}</div>
            <div className="text-[10px] text-white/40">{label}</div>
          </div>

          {/* Glow effect on hover */}
          <div
            className={cn(
              'pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100',
              color === 'violet' && 'bg-gradient-to-br from-violet-500/5 to-transparent',
              color === 'green' && 'bg-gradient-to-br from-green-500/5 to-transparent',
              color === 'amber' && 'bg-gradient-to-br from-amber-500/5 to-transparent',
              color === 'cyan' && 'bg-gradient-to-br from-cyan-500/5 to-transparent',
            )}
          />
        </motion.div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💡 PROACTIVE SUGGESTIONS — Sugerencias proactivas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ProactiveSuggestionCardProps {
  suggestion: ProactiveSuggestion
  onDismiss: () => void
  onAction: () => void
}

function ProactiveSuggestionCard({
  suggestion,
  onDismiss,
  onAction,
}: ProactiveSuggestionCardProps) {
  const priorityColors = {
    critical: 'border-red-500/30 bg-red-500/5',
    high: 'border-amber-500/30 bg-amber-500/5',
    medium: 'border-blue-500/30 bg-blue-500/5',
    low: 'border-white/10 bg-white/5',
  }

  const priorityIcons = {
    critical: AlertTriangle,
    high: AlertTriangle,
    medium: Lightbulb,
    low: Sparkles,
  }

  const Icon = priorityIcons[suggestion.priority]

  return (
    <motion.div
      className={cn('rounded-xl border p-3', priorityColors[suggestion.priority])}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      layout
    >
      <div className="flex items-start gap-2">
        <div
          className={cn(
            'mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg',
            suggestion.priority === 'critical' && 'bg-red-500/20 text-red-400',
            suggestion.priority === 'high' && 'bg-amber-500/20 text-amber-400',
            suggestion.priority === 'medium' && 'bg-blue-500/20 text-blue-400',
            suggestion.priority === 'low' && 'bg-white/10 text-white/60',
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-white">{suggestion.title}</div>
          <div className="mt-0.5 text-[10px] leading-relaxed text-white/50">
            {suggestion.description}
          </div>

          {suggestion.action && (
            <button
              onClick={onAction}
              className="mt-2 flex items-center gap-1 text-[10px] font-medium text-violet-400 transition-colors hover:text-violet-300"
            >
              Ejecutar acción
              <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
            </button>
          )}
        </div>

        {suggestion.dismissable && (
          <button
            onClick={onDismiss}
            className="flex h-5 w-5 items-center justify-center rounded text-white/30 transition-colors hover:bg-white/10 hover:text-white/60"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧠 COGNITO WIDGET — Componente Principal
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function CognitoWidget({
  className,
  initialMode = 'chat',
  showMetrics = true,
  enableVoice = true,
  enableProactive = true,
  enableSoundEffects = true,
  avatarConfig,
  voiceConfig,
  onMessage,
  onStateChange,
  onModeChange,
  onActionExecuted,
  collapsed: externalCollapsed,
  onToggleCollapse,
}: CognitoWidgetProps) {
  // Store
  const {
    state,
    mode,
    context,
    setState,
    setMode,
    addMessage,
    incrementQueries,
    updateMetrics,
    dismissSuggestion,
    addProactiveSuggestion,
  } = useCognitoStore()

  // Local state
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(externalCollapsed ?? false)
  const [showSettings, setShowSettings] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Voice hook
  const { isListening, isSpeaking, audioLevel, frequencies, toggleListening, speak, stopSpeaking } =
    useVoice({
      config: voiceConfig,
      onTranscript: (text) => {
        setInputValue(text)
        handleSubmit(text)
      },
    })

  // Sincronizar estado con voice
  useEffect(() => {
    if (isListening) {
      setState('listening')
    } else if (isSpeaking) {
      setState('speaking')
    } else if (isProcessing) {
      setState('thinking')
    } else {
      setState('idle')
    }
  }, [isListening, isSpeaking, isProcessing, setState])

  // Notificar cambios de estado
  useEffect(() => {
    onStateChange?.(state)
  }, [state, onStateChange])

  // Notificar cambios de modo
  useEffect(() => {
    onModeChange?.(mode)
  }, [mode, onModeChange])

  // Auto-scroll al nuevo mensaje
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [context.history])

  // NO añadir mensaje de bienvenida al inicio - usamos UI visual en su lugar
  // El mensaje de bienvenida se muestra como interfaz visual interactiva

  // Handler de submit
  const handleSubmit = useCallback(
    async (text?: string) => {
      const query = text || inputValue.trim()
      if (!query || isProcessing) return

      setInputValue('')
      setIsProcessing(true)
      setState('thinking')

      // Añadir mensaje del usuario
      addMessage({ role: 'user', content: query, mode })
      incrementQueries()

      try {
        startTransition(async () => {
          const response = await processQuery(query, mode)

          addMessage(response.message)

          // Hablar respuesta si voice está habilitado
          if (enableVoice && !context.preferences.voiceEnabled === false) {
            // Extraer texto plano para TTS
            const plainText = response.message.content
              .replace(/\*\*/g, '')
              .replace(/#{1,6}\s/g, '')
              .replace(/[•📊💰📈📋💳🏦📦💡⚠️✅❌🔍👥👋🤖]/g, '')
              .substring(0, 500) // Limitar longitud

            speak(plainText)
          }

          // Actualizar métricas
          if (response.message.metadata?.executionTime) {
            updateMetrics({
              averageResponseTime: response.message.metadata.executionTime,
            })
          }

          // Añadir sugerencias proactivas si hay
          if (response.suggestions) {
            response.suggestions.forEach((sug) => {
              addProactiveSuggestion(sug)
            })
          }

          // Callback
          onMessage?.(response.message as any)

          setIsProcessing(false)
          setState('idle')
        })
      } catch (error) {
        addMessage({
          role: 'assistant',
          content: '❌ Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.',
          mode,
        })
        setIsProcessing(false)
        setState('error')
        setTimeout(() => setState('idle'), 2000)
      }
    },
    [
      inputValue,
      isProcessing,
      mode,
      addMessage,
      incrementQueries,
      enableVoice,
      context.preferences.voiceEnabled,
      speak,
      updateMetrics,
      addProactiveSuggestion,
      onMessage,
      setState,
    ],
  )

  // Handler de quick action
  const handleQuickAction = useCallback(
    (actionId: string) => {
      const actions: Record<string, string> = {
        ventas_hoy: '¿Cuáles son las ventas de hoy?',
        capital_total: '¿Cuál es el capital total en bancos?',
        clientes_deuda: 'Muéstrame los clientes con deuda',
        sugerencias: 'Dame sugerencias para mejorar',
      }

      const query = actions[actionId]
      if (query) {
        handleSubmit(query)
      }
    },
    [handleSubmit],
  )

  // Handler de modo
  const handleModeChange = useCallback(
    (newMode: CognitoMode) => {
      setMode(newMode)
      onModeChange?.(newMode)
    },
    [setMode, onModeChange],
  )

  // Toggle collapse
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev)
    onToggleCollapse?.()
  }, [onToggleCollapse])

  // Colores del estado actual
  const colors = STATE_COLORS[state]

  return (
    <motion.div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-3xl',
        'bg-gradient-to-br from-[#08080f]/98 via-[#0a0a14]/95 to-[#08080f]/98',
        'border border-white/[0.06] shadow-2xl backdrop-blur-2xl',
        isCollapsed ? 'h-auto' : 'h-full',
        className,
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      {/* Aurora background effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/4 -left-1/4 h-[60%] w-[60%] rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.glow.replace('0.4', '0.08')} 0%, transparent 70%)`,
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-1/4 -bottom-1/4 h-[50%] w-[50%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-3">
          {/* Logo/Avatar pequeño */}
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}30, ${colors.primary}10)`,
              boxShadow: `0 0 20px ${colors.glow.replace('0.4', '0.2')}`,
            }}
          >
            <Bot className="h-5 w-5" style={{ color: colors.primary }} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">Cognito</h2>
            <div className="flex items-center gap-1.5">
              <motion.span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: colors.primary }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[10px] text-white/50">{STATE_LABELS[state]}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <motion.button
            onClick={() => setShowSettings(!showSettings)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="h-4 w-4" />
          </motion.button>

          <motion.button
            onClick={handleToggleCollapse}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </motion.button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
      {/* CONTENT (Collapsible) */}
      {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            className="relative z-10 flex flex-1 flex-col overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
            {/* SECCIÓN SUPERIOR: Avatar Central + Estado */}
            {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
            <div className="relative flex flex-col items-center border-b border-white/5 px-6 py-6">
              {/* Avatar Central Grande */}
              <div className="relative">
                <CognitoAvatar
                  state={state}
                  size={140}
                  audioLevel={audioLevel}
                  config={avatarConfig}
                  onInteract={() => {
                    if (enableVoice) toggleListening()
                  }}
                />

                {/* Estado badge */}
                <motion.div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-3 py-1"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}40, ${colors.primary}20)`,
                    border: `1px solid ${colors.primary}40`,
                  }}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-[10px] font-medium" style={{ color: colors.primary }}>
                    {STATE_LABELS[state]}
                  </span>
                </motion.div>
              </div>

              {/* Voice Waves debajo del avatar */}
              {enableVoice && (
                <div className="mt-4 h-8 w-full max-w-[200px]">
                  <VoiceWaveVisualizer
                    isActive={isListening || isSpeaking}
                    color={colors.primary}
                    bars={20}
                  />
                </div>
              )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
            {/* TABS DE MODO */}
            {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
            <div className="border-b border-white/5 px-4 py-3">
              <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
            </div>

            {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
            {/* MÉTRICAS EN FILA */}
            {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
            {showMetrics && (
              <div className="border-b border-white/5 px-4 py-3">
                <MetricsPanel className="w-full" />
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
            {/* SUGERENCIAS PROACTIVAS */}
            {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
            {enableProactive && context.proactiveSuggestions.length > 0 && (
              <div className="border-b border-white/5 px-4 py-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs text-white/40">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Sugerencias inteligentes
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {context.proactiveSuggestions.slice(0, 2).map((sug) => (
                      <ProactiveSuggestionCard
                        key={sug.id}
                        suggestion={sug}
                        onDismiss={() => dismissSuggestion(sug.id)}
                        onAction={() => {
                          if (sug.action) {
                            onActionExecuted?.(sug.action)
                          }
                          dismissSuggestion(sug.id)
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
            {/* ÁREA DE CHAT - PRINCIPAL (FLEX-1 para ocupar espacio restante) */}
            {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
            <div
              ref={chatContainerRef}
              className="flex flex-1 flex-col overflow-y-auto px-4 py-4"
            >
              {context.history.length === 0 ? (
                // Estado vacío - UI de bienvenida
                <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
                  <motion.div
                    className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 backdrop-blur-sm"
                    style={{ border: '1px solid rgba(139, 92, 246, 0.3)' }}
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                  >
                    <Bot className="h-10 w-10 text-violet-400" />
                  </motion.div>

                  <motion.h3
                    className="mb-2 text-xl font-bold text-white"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    ¡Hola! Soy Cognito
                  </motion.h3>

                  <motion.p
                    className="mb-6 max-w-[320px] text-sm leading-relaxed text-white/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Tu asistente de IA para CHRONOS. Pregúntame sobre ventas, clientes, bancos,
                    o pídeme que analice tus datos financieros.
                  </motion.p>

                  {/* Quick Actions en grid */}
                  <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="mb-3 text-xs font-medium text-white/40">Prueba preguntando:</p>
                    <QuickActions onAction={handleQuickAction} />
                  </motion.div>
                </div>
              ) : (
                // Mensajes del chat
                <div className="space-y-4">
                  {context.history.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  <TypingIndicator isTyping={isProcessing || isPending} state={state} />
                </div>
              )}
            </div>

            {/* Quick Actions (solo si hay pocos mensajes) */}
            {context.history.length > 0 && context.history.length <= 2 && (
              <div className="border-t border-white/5 px-4 py-3">
                <QuickActions onAction={handleQuickAction} />
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
            {/* ÁREA DE INPUT - FOOTER FIJO */}
            {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
            <div className="border-t border-white/5 bg-black/20 p-4">
              <div className="flex items-end gap-3">
                {/* Voice Button */}
                {enableVoice && (
                  <VoiceButton
                    state={state}
                    isListening={isListening}
                    isMuted={context.preferences.voiceEnabled === false}
                    onToggleListen={toggleListening}
                    onToggleMute={() => {
                      useCognitoStore.getState().updatePreferences({
                        voiceEnabled: !context.preferences.voiceEnabled,
                      })
                    }}
                    size="md"
                  />
                )}

                {/* Chat Input */}
                <ChatInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSubmit={() => handleSubmit()}
                  disabled={isProcessing || isPending}
                  isListening={isListening}
                  placeholder={
                    isListening
                      ? 'Escuchando...'
                      : mode === 'analysis'
                        ? '¿Qué quieres analizar?'
                        : mode === 'predictions'
                          ? '¿Qué quieres predecir?'
                          : mode === 'insights'
                            ? '¿Sobre qué quieres insights?'
                            : 'Escribe tu mensaje...'
                  }
                  suggestions={
                    inputValue.length > 2
                      ? [
                          'Ver ventas del mes',
                          'Clientes con deuda',
                          'Estado de bancos',
                          'Análisis financiero',
                        ].filter((s) => s.toLowerCase().includes(inputValue.toLowerCase()))
                      : []
                  }
                  className="flex-1"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Border glow effect */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          boxShadow: `inset 0 0 40px ${colors.glow.replace('0.4', '0.05')}`,
        }}
      />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MENSAJE DE BIENVENIDA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function getWelcomeMessage(): string {
  const hour = new Date().getHours()
  let saludo = ''

  if (hour >= 5 && hour < 12) saludo = '¡Buenos días!'
  else if (hour >= 12 && hour < 19) saludo = '¡Buenas tardes!'
  else saludo = '¡Buenas noches!'

  return `👋 ${saludo} Soy **Cognito**, tu asistente de inteligencia artificial.

Estoy aquí para ayudarte a gestionar **CHRONOS** de forma eficiente:

• 📊 **Consultas** — Ventas, clientes, bancos, inventario
• 📈 **Análisis** — Reportes financieros y KPIs
• 💡 **Insights** — Sugerencias y alertas inteligentes
• ⚡ **Acciones** — Crear ventas, registrar gastos, etc.

¿En qué te puedo ayudar hoy?`
}

export default CognitoWidget
