'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 AURA AI WIDGET — Premium AI Assistant FULL FEATURED
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Widget de IA ultra-premium con TODAS las funcionalidades:
 *
 * 🎙️ VOICE CHAT SCREEN
 * - Orbe 3D holográfico con gradientes
 * - Quick Actions
 * - Controles de voz
 *
 * 💬 CHAT SCREEN
 * - Mensajes con metadata y KPIs
 * - Sugerencias de seguimiento
 * - Historial de conversaciones
 *
 * 📊 FUNCIONALIDADES COMPLETAS
 * - Panel de métricas
 * - Sugerencias proactivas
 * - Selector de modo (Chat, Análisis, Predicciones, Insights, Automatización)
 * - Quick Actions
 * - Sistema de voz bidireccional
 * - Indicador de escritura
 * - Autocompletado inteligente
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import {
    AlertTriangle,
    BarChart3,
    Bot,
    Check,
    ChevronRight,
    Copy,
    Lightbulb,
    Menu,
    MessageCircle,
    MessageSquare,
    Mic,
    MicOff,
    MoreVertical,
    Plus,
    Send,
    Settings,
    Sparkles,
    TrendingUp,
    User,
    Volume2,
    VolumeX,
    X,
    Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { processQuery } from '../CognitoWidget/CognitoEngine'
import { useVoice } from '../CognitoWidget/CognitoVoice'
import type {
    CognitoAction,
    CognitoMessage,
    CognitoMode,
    CognitoState,
    KPIData,
    ProactiveSuggestion,
} from '../CognitoWidget/types'
import { MODE_COLORS, MODE_LABELS, STATE_COLORS, STATE_LABELS } from '../CognitoWidget/types'
import { useCognitoStore } from '../CognitoWidget/useCognitoStore'
import { AuraOrb } from './AuraOrb'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

type AuraScreen = 'voice' | 'chat'

interface AuraAIWidgetProps {
  className?: string
  onClose?: () => void
  initialScreen?: AuraScreen
  initialMode?: CognitoMode
  fullScreen?: boolean
  showMetrics?: boolean
  enableVoice?: boolean
  enableProactive?: boolean
  onMessage?: (message: CognitoMessage) => void
  onStateChange?: (state: CognitoState) => void
  onModeChange?: (mode: CognitoMode) => void
  onActionExecuted?: (action: CognitoAction) => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 METRICS PANEL — Panel de métricas del asistente
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

function MetricsPanel({ className }: { className?: string }) {
  const metrics = useCognitoStore((s) => s.metrics)

  const items = [
    { label: 'Consultas hoy', value: metrics.queriesToday, icon: MessageSquare, trend: '+12%', color: 'violet' },
    { label: 'Precisión', value: `${metrics.accuracyRate}%`, icon: Sparkles, trend: '+2.5%', color: 'green' },
    { label: 'Insights', value: metrics.insightsGenerated, icon: Lightbulb, trend: '+8', color: 'amber' },
    { label: 'Tiempo resp.', value: `${metrics.averageResponseTime}s`, icon: Zap, trend: '-0.3s', color: 'cyan' },
  ]

  return (
    <div className={cn('grid grid-cols-4 gap-2', className)}>
      {items.map(({ label, value, icon: Icon, trend, color }) => (
        <motion.div
          key={label}
          className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-2.5 backdrop-blur-sm transition-colors hover:bg-white/5"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-lg',
                color === 'violet' && 'bg-violet-500/20 text-violet-400',
                color === 'green' && 'bg-green-500/20 text-green-400',
                color === 'amber' && 'bg-amber-500/20 text-amber-400',
                color === 'cyan' && 'bg-cyan-500/20 text-cyan-400',
              )}
            >
              <Icon className="h-3 w-3" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{value}</div>
              <div className="text-[9px] text-white/40">{label}</div>
            </div>
          </div>
          <span className="absolute top-1 right-1 text-[8px] text-green-400">{trend}</span>
        </motion.div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 💡 PROACTIVE SUGGESTION CARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface ProactiveSuggestionCardProps {
  suggestion: ProactiveSuggestion
  onDismiss: () => void
  onAction: () => void
}

function ProactiveSuggestionCard({ suggestion, onDismiss, onAction }: ProactiveSuggestionCardProps) {
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
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg',
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
          <div className="mt-0.5 text-[10px] leading-relaxed text-white/50">{suggestion.description}</div>
          {suggestion.action && (
            <button
              onClick={onAction}
              className="mt-2 flex items-center gap-1 text-[10px] font-medium text-violet-400 transition-colors hover:text-violet-300"
            >
              Ejecutar acción
              <ChevronRight className="h-3 w-3" />
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

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 MODE SELECTOR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

const MODE_ICONS: Record<CognitoMode, React.ElementType> = {
  chat: Bot,
  analysis: BarChart3,
  predictions: TrendingUp,
  insights: Lightbulb,
  automation: Zap,
}

function ModeSelector({
  currentMode,
  onModeChange,
  className,
}: {
  currentMode: CognitoMode
  onModeChange: (mode: CognitoMode) => void
  className?: string
}) {
  return (
    <div className={cn('flex gap-1 rounded-xl bg-white/5 p-1', className)}>
      {(Object.keys(MODE_COLORS) as CognitoMode[]).map((mode) => {
        const Icon = MODE_ICONS[mode]
        const isActive = mode === currentMode
        const colors = MODE_COLORS[mode]

        return (
          <motion.button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-white' : 'text-white/50 hover:text-white/70',
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-lg"
                style={{ backgroundColor: colors.primary }}
                layoutId="aura-mode-indicator"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="relative z-10 h-3 w-3" />
            <span className="relative z-10">{MODE_LABELS[mode]}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 KPI CARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

function KPICard({ kpi }: { kpi: KPIData }) {
  const trendColors = { up: 'text-green-400', down: 'text-red-400', stable: 'text-white/50' }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-2">
      <div className="text-xs text-white/50">{kpi.label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-base font-semibold text-white">
          {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
        </span>
        {kpi.unit && <span className="text-[10px] text-white/40">{kpi.unit}</span>}
      </div>
      {kpi.trend && kpi.change && (
        <div className={cn('flex items-center gap-1 text-[10px]', trendColors[kpi.trend])}>
          {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'}
          {kpi.change}%
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ⚡ QUICK ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

const QUICK_ACTIONS = [
  { id: 'ventas_hoy', label: 'Ventas de hoy', query: '¿Cuáles son las ventas de hoy?', icon: BarChart3 },
  { id: 'capital_total', label: 'Capital total', query: '¿Cuál es el capital total en bancos?', icon: TrendingUp },
  { id: 'clientes_deuda', label: 'Clientes con deuda', query: 'Muéstrame los clientes con deuda', icon: Lightbulb },
  { id: 'sugerencias', label: 'Análisis rápido', query: 'Dame un análisis financiero rápido', icon: Zap },
]

function QuickActions({
  onAction,
  className,
  compact = false,
}: {
  onAction: (query: string) => void
  className?: string
  compact?: boolean
}) {
  return (
    <div className={cn(compact ? 'grid grid-cols-2 gap-2' : 'flex flex-wrap gap-2', className)}>
      {QUICK_ACTIONS.map(({ id, label, query, icon: Icon }) => (
        <motion.button
          key={id}
          onClick={() => onAction(query)}
          className={cn(
            'flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] text-left transition-all hover:border-violet-500/30 hover:bg-violet-500/5',
            compact ? 'px-3 py-2.5' : 'px-3 py-1.5',
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className={cn(
              'flex items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20',
              compact ? 'h-8 w-8' : 'h-6 w-6',
            )}
          >
            <Icon className={cn(compact ? 'h-4 w-4' : 'h-3.5 w-3.5', 'text-violet-400')} />
          </div>
          <span className={cn('text-white/70', compact ? 'text-xs' : 'text-[11px]')}>{label}</span>
        </motion.button>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 💭 MESSAGE BUBBLE — Con todas las funcionalidades
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

function MessageBubble({
  message,
  onSuggestionClick,
}: {
  message: CognitoMessage
  onSuggestionClick?: (suggestion: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [message.content])

  const timeString = message.timestamp
    ? new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' }).format(message.timestamp)
    : ''

  return (
    <motion.div
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-violet-500/20' : 'bg-gradient-to-br from-violet-500 to-fuchsia-500',
        )}
      >
        {isUser ? <User className="h-4 w-4 text-violet-400" /> : <Sparkles className="h-4 w-4 text-white" />}
      </div>

      {/* Contenido */}
      <div className={cn('flex max-w-[80%] flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'group relative rounded-2xl px-4 py-3',
            isUser
              ? 'rounded-tr-sm bg-gradient-to-br from-violet-600 to-indigo-600 text-white'
              : 'rounded-tl-sm border border-white/10 bg-white/5 text-white/90',
          )}
        >
          {/* Contenido del mensaje */}
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>

          {/* Metadata */}
          {!isUser && message.metadata && (
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-white/5 pt-2">
              {message.metadata.confidence && (
                <span className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                  <Sparkles className="h-2.5 w-2.5" />
                  {Math.round(message.metadata.confidence * 100)}% confianza
                </span>
              )}
              {message.metadata.executionTime && (
                <span className="text-[10px] text-white/40">{message.metadata.executionTime.toFixed(1)}s</span>
              )}
            </div>
          )}

          {/* KPIs */}
          {message.metadata?.kpis && message.metadata.kpis.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {message.metadata.kpis.map((kpi, i) => (
                <KPICard key={i} kpi={kpi} />
              ))}
            </div>
          )}

          {/* Sugerencias de seguimiento */}
          {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {message.metadata.suggestions.map((suggestion, i) => (
                <motion.button
                  key={i}
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          )}

          {/* Botón de copiar */}
          <motion.button
            onClick={handleCopy}
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3 text-white/70" />}
          </motion.button>
        </div>

        {/* Timestamp */}
        {timeString && <span className="text-[10px] text-white/30">{timeString}</span>}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ⏳ TYPING INDICATOR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

function TypingIndicator({ isTyping, state = 'thinking' }: { isTyping: boolean; state?: CognitoState }) {
  const colors = STATE_COLORS[state]

  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: colors.primary }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
            <span className="text-xs text-white/50">{STATE_LABELS[state]}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🎤 VOICE SCREEN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface VoiceScreenProps {
  state: CognitoState
  isListening: boolean
  isSpeaking: boolean
  audioLevel: number
  currentResponse: string
  onToggleListen: () => void
  onSwitchToChat: () => void
  onToggleMute: () => void
  onQuickAction: (query: string) => void
  isMuted: boolean
}

function VoiceScreen({
  state,
  isListening,
  isSpeaking,
  audioLevel,
  currentResponse,
  onToggleListen,
  onSwitchToChat,
  onToggleMute,
  onQuickAction,
  isMuted,
}: VoiceScreenProps) {
  return (
    <motion.div
      className="relative flex h-full flex-col items-center justify-between py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.4 }}
    >
      {/* Quick Actions en la parte superior */}
      {!currentResponse && state === 'idle' && (
        <motion.div
          className="w-full px-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="mb-3 text-center text-xs text-white/40">Acciones rápidas</p>
          <QuickActions onAction={onQuickAction} compact />
        </motion.div>
      )}

      {/* Área central con orbe */}
      <div className="relative flex flex-1 flex-col items-center justify-center">
        {/* Texto de respuesta flotando arriba */}
        {currentResponse && (
          <motion.div
            className="absolute top-0 left-0 right-0 px-6 py-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.6, y: 0 }}
          >
            <p className="line-clamp-2 text-center text-xs italic leading-relaxed text-white/40">
              {currentResponse.substring(0, 80)}...
            </p>
          </motion.div>
        )}

        {/* ORB PRINCIPAL */}
        <div className="relative">
          <AuraOrb
            state={state}
            size={160}
            audioLevel={audioLevel}
            isListening={isListening}
            isSpeaking={isSpeaking}
            onClick={onToggleListen}
          />
        </div>

        {/* Texto de respuesta debajo del orbe */}
        {currentResponse && (
          <motion.div
            className="mt-4 max-w-[350px] px-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="line-clamp-3 text-sm font-light leading-relaxed text-white/90">
              {currentResponse.length > 150 ? `${currentResponse.substring(0, 150)}...` : currentResponse}
            </p>
            <motion.button
              onClick={onSwitchToChat}
              className="mt-2 text-xs text-violet-400 hover:text-violet-300"
              whileHover={{ scale: 1.02 }}
            >
              Ver respuesta completa →
            </motion.button>
          </motion.div>
        )}

        {/* Pregunta si está en idle */}
        {!currentResponse && state === 'idle' && (
          <motion.div className="mt-4 px-4 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-base font-light text-white/80">¿En qué puedo ayudarte?</p>
            <p className="mt-1 text-xs text-white/40">Habla o toca una acción rápida</p>
          </motion.div>
        )}
      </div>

      {/* Estado actual */}
      <motion.div className="mb-3 text-center" animate={{ opacity: state === 'idle' ? 0.6 : 1 }}>
        <span className="text-sm text-violet-300/80">{STATE_LABELS[state]}</span>
      </motion.div>

      {/* Controles inferiores */}
      <div className="flex items-center justify-center gap-6">
        <motion.button
          onClick={onToggleMute}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </motion.button>

        <motion.button
          onClick={onToggleListen}
          className={cn(
            'relative flex h-16 w-16 items-center justify-center rounded-full transition-all',
            isListening
              ? 'bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-600'
              : 'bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600',
          )}
          style={{
            boxShadow: isListening
              ? '0 0 50px rgba(34, 211, 238, 0.5), 0 0 80px rgba(139, 92, 246, 0.3)'
              : '0 0 35px rgba(139, 92, 246, 0.4), 0 0 60px rgba(236, 72, 153, 0.2)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          animate={{ scale: isListening ? [1, 1.05, 1] : 1 }}
          transition={{ scale: { duration: 1, repeat: isListening ? Infinity : 0, ease: 'easeInOut' } }}
        >
          {isListening && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-cyan-400/30"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-cyan-400/20"
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}
          {isListening ? <MicOff className="h-7 w-7 text-white" /> : <Mic className="h-7 w-7 text-white" />}
        </motion.button>

        <motion.button
          onClick={onSwitchToChat}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 💬 CHAT SCREEN — COMPLETA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface ChatScreenProps {
  messages: CognitoMessage[]
  isProcessing: boolean
  inputValue: string
  mode: CognitoMode
  state: CognitoState
  onInputChange: (value: string) => void
  onSubmit: () => void
  onSwitchToVoice: () => void
  onModeChange: (mode: CognitoMode) => void
  onQuickAction: (query: string) => void
  onSuggestionClick: (suggestion: string) => void
  showMetrics?: boolean
  proactiveSuggestions: ProactiveSuggestion[]
  onDismissSuggestion: (id: string) => void
  onActionSuggestion: (action?: CognitoAction) => void
}

function ChatScreen({
  messages,
  isProcessing,
  inputValue,
  mode,
  state,
  onInputChange,
  onSubmit,
  onSwitchToVoice,
  onModeChange,
  onQuickAction,
  onSuggestionClick,
  showMetrics,
  proactiveSuggestions,
  onDismissSuggestion,
  onActionSuggestion,
}: ChatScreenProps) {
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 100)}px`
    }
  }, [inputValue])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputValue.trim()) onSubmit()
    }
  }

  const autocompleteSuggestions = inputValue.length > 2
    ? ['Ver ventas del mes', 'Clientes con deuda', 'Estado de bancos', 'Análisis financiero'].filter((s) =>
        s.toLowerCase().includes(inputValue.toLowerCase()),
      )
    : []

  return (
    <motion.div
      className="flex h-full flex-col"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.4 }}
    >
      {/* Mode Selector */}
      <div className="border-b border-white/5 px-3 py-2">
        <ModeSelector currentMode={mode} onModeChange={onModeChange} />
      </div>

      {/* Metrics Panel */}
      {showMetrics && (
        <div className="border-b border-white/5 px-3 py-2">
          <MetricsPanel />
        </div>
      )}

      {/* Proactive Suggestions */}
      {proactiveSuggestions.length > 0 && (
        <div className="border-b border-white/5 px-3 py-2">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-white/40">
            <Lightbulb className="h-3 w-3" />
            Sugerencias
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {proactiveSuggestions.slice(0, 2).map((sug) => (
                <ProactiveSuggestionCard
                  key={sug.id}
                  suggestion={sug}
                  onDismiss={() => onDismissSuggestion(sug.id)}
                  onAction={() => {
                    onActionSuggestion(sug.action)
                    onDismissSuggestion(sug.id)
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Área de mensajes */}
      <div ref={chatRef} className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <motion.div
              className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-sm"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.1 }}
            >
              <Sparkles className="h-10 w-10 text-violet-400" />
            </motion.div>
            <motion.h2
              className="mb-2 text-xl font-semibold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Aura AI Assistant
            </motion.h2>
            <motion.p
              className="mb-6 max-w-[280px] text-sm text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Tu asistente inteligente para CHRONOS. Pregunta sobre ventas, clientes, análisis financiero y más.
            </motion.p>
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="mb-3 text-xs text-white/40">Prueba preguntando:</p>
              <QuickActions onAction={onQuickAction} />
            </motion.div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} onSuggestionClick={onSuggestionClick} />
          ))
        )}
        <TypingIndicator isTyping={isProcessing} state={state} />
      </div>

      {/* Quick Actions si hay pocos mensajes */}
      {messages.length > 0 && messages.length <= 2 && (
        <div className="border-t border-white/5 px-3 py-2">
          <QuickActions onAction={onQuickAction} />
        </div>
      )}

      {/* Área de input */}
      <div className="border-t border-white/5 bg-black/20 p-3">
        <div className="relative">
          {/* Autocompletado */}
          <AnimatePresence>
            {showSuggestions && autocompleteSuggestions.length > 0 && (
              <motion.div
                className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                {autocompleteSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onInputChange(suggestion)
                      setShowSuggestions(false)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <ChevronRight className="h-3 w-3 text-violet-400" />
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
            <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/5 hover:text-white/70">
              <Plus className="h-5 w-5" />
            </button>

            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                onInputChange(e.target.value)
                setShowSuggestions(e.target.value.length > 0)
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(inputValue.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="max-h-[100px] min-h-[36px] flex-1 resize-none bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            />

            <button
              onClick={onSwitchToVoice}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
            >
              <Mic className="h-5 w-5" />
            </button>

            {inputValue.trim() && (
              <motion.button
                onClick={onSubmit}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export function AuraAIWidget({
  className,
  onClose,
  initialScreen = 'voice',
  initialMode = 'chat',
  fullScreen = false,
  showMetrics = true,
  enableVoice = true,
  enableProactive = true,
  onMessage,
  onStateChange,
  onModeChange: onModeChangeCallback,
  onActionExecuted,
}: AuraAIWidgetProps) {
  // State
  const [currentScreen, setCurrentScreen] = useState<AuraScreen>(initialScreen)
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const [isPending, startTransition] = useTransition()

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

  // Voice hook
  const { isListening, isSpeaking, audioLevel, toggleListening, speak, stopSpeaking } = useVoice({
    onTranscript: (text) => {
      setInputValue(text)
      handleSubmit(text)
    },
  })

  // Sincronizar estado con voz
  useEffect(() => {
    if (isListening) setState('listening')
    else if (isSpeaking) setState('speaking')
    else if (isProcessing) setState('thinking')
    else setState('idle')
  }, [isListening, isSpeaking, isProcessing, setState])

  // Notificar cambios de estado
  useEffect(() => {
    onStateChange?.(state)
  }, [state, onStateChange])

  // Notificar cambios de modo
  useEffect(() => {
    onModeChangeCallback?.(mode)
  }, [mode, onModeChangeCallback])

  // Handler de submit
  const handleSubmit = useCallback(
    async (text?: string) => {
      const query = text || inputValue.trim()
      if (!query || isProcessing) return

      setInputValue('')
      setIsProcessing(true)
      setState('thinking')
      setCurrentResponse('')

      addMessage({ role: 'user', content: query, mode })
      incrementQueries()

      try {
        startTransition(async () => {
          const response = await processQuery(query, mode)

          addMessage(response.message)

          const plainText = response.message.content
            .replace(/\*\*/g, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/[•📊💰📈📋💳🏦📦💡⚠️✅❌🔍👥👋🤖]/g, '')

          setCurrentResponse(plainText)

          // Hablar respuesta si estamos en voice mode
          if (currentScreen === 'voice' && enableVoice) {
            speak(plainText.substring(0, 500))
          }

          // Actualizar métricas
          if (response.message.metadata?.executionTime) {
            updateMetrics({ averageResponseTime: response.message.metadata.executionTime })
          }

          // Añadir sugerencias proactivas
          if (response.suggestions && enableProactive) {
            response.suggestions.forEach((sug) => addProactiveSuggestion(sug))
          }

          onMessage?.(response.message as CognitoMessage)
          setIsProcessing(false)
          setState('idle')
        })
      } catch (error) {
        addMessage({
          role: 'assistant',
          content: 'Lo siento, hubo un error. ¿Puedes intentarlo de nuevo?',
          mode,
        })
        setCurrentResponse('Lo siento, hubo un error. ¿Puedes intentarlo de nuevo?')
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
      speak,
      updateMetrics,
      setState,
      currentScreen,
      enableVoice,
      enableProactive,
      addProactiveSuggestion,
      onMessage,
    ],
  )

  // Toggle mute
  const handleToggleMute = useCallback(() => {
    useCognitoStore.getState().updatePreferences({
      voiceEnabled: !context.preferences.voiceEnabled,
    })
    if (isSpeaking) stopSpeaking()
  }, [context.preferences.voiceEnabled, isSpeaking, stopSpeaking])

  // Handle mode change
  const handleModeChange = useCallback(
    (newMode: CognitoMode) => {
      setMode(newMode)
      onModeChangeCallback?.(newMode)
    },
    [setMode, onModeChangeCallback],
  )

  // Handle action from suggestion
  const handleActionSuggestion = useCallback(
    (action?: CognitoAction) => {
      if (action) {
        onActionExecuted?.(action)
      }
    },
    [onActionExecuted],
  )

  return (
    <motion.div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-3xl',
        'bg-gradient-to-b from-[#0a0612] via-[#0d0918] to-[#08050f]',
        'border border-white/[0.06] shadow-2xl',
        fullScreen ? 'fixed inset-0 z-50' : 'h-[750px] w-full',
        className,
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/4 -left-1/4 h-[60%] w-[60%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-1/4 -bottom-1/4 h-[50%] w-[50%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        {(isListening || isSpeaking) && (
          <motion.div
            className="absolute left-1/2 top-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: isListening
                ? 'radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          />
        )}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <motion.button
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="h-5 w-5" />
          </motion.button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">Aura</span>
            <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300">
              2.0 PRO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="mr-2 flex rounded-full bg-white/5 p-1">
            <button
              onClick={() => setCurrentScreen('voice')}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full transition-all',
                currentScreen === 'voice' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70',
              )}
            >
              <Mic className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setCurrentScreen('chat')}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full transition-all',
                currentScreen === 'chat' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70',
              )}
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </button>
          </div>

          <motion.button
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="h-4 w-4" />
          </motion.button>

          <motion.button
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            <MoreVertical className="h-4 w-4" />
          </motion.button>

          {onClose && (
            <motion.button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentScreen === 'voice' ? (
            <VoiceScreen
              key="voice"
              state={state}
              isListening={isListening}
              isSpeaking={isSpeaking}
              audioLevel={audioLevel}
              currentResponse={currentResponse}
              onToggleListen={toggleListening}
              onSwitchToChat={() => setCurrentScreen('chat')}
              onToggleMute={handleToggleMute}
              onQuickAction={(query) => handleSubmit(query)}
              isMuted={context.preferences.voiceEnabled === false}
            />
          ) : (
            <ChatScreen
              key="chat"
              messages={context.history}
              isProcessing={isProcessing || isPending}
              inputValue={inputValue}
              mode={mode}
              state={state}
              onInputChange={setInputValue}
              onSubmit={() => handleSubmit()}
              onSwitchToVoice={() => setCurrentScreen('voice')}
              onModeChange={handleModeChange}
              onQuickAction={(query) => handleSubmit(query)}
              onSuggestionClick={(suggestion) => handleSubmit(suggestion)}
              showMetrics={showMetrics}
              proactiveSuggestions={enableProactive ? context.proactiveSuggestions : []}
              onDismissSuggestion={dismissSuggestion}
              onActionSuggestion={handleActionSuggestion}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Border glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{ boxShadow: 'inset 0 0 60px rgba(139, 92, 246, 0.05)' }}
      />
    </motion.div>
  )
}

export default AuraAIWidget
