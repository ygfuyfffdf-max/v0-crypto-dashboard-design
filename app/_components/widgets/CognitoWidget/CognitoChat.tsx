'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💬 COGNITO CHAT — Interfaz Conversacional Premium
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Componentes:
 * - MessageBubble: Burbuja de mensaje individual
 * - ChatInput: Campo de entrada con sugerencias
 * - TypingIndicator: Indicador de escritura
 * - QuickActions: Botones de acción rápida
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import {
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  Copy,
  Lightbulb,
  Send,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CognitoMessage, CognitoMode, CognitoState, KPIData } from './types'
import { MODE_COLORS, MODE_LABELS, STATE_COLORS } from './types'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💭 MESSAGE BUBBLE — Burbuja de mensaje
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MessageBubbleProps {
  message: CognitoMessage
  isLast?: boolean
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [message.content])

  // Formatear timestamp
  const timeString = new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(message.timestamp)

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
          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-violet-500/20' : 'bg-gradient-to-br from-violet-500 to-indigo-600',
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-violet-400" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Contenido */}
      <div className={cn('flex max-w-[80%] flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
        {/* Burbuja */}
        <div
          className={cn(
            'group relative rounded-2xl px-4 py-3',
            isUser
              ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white'
              : 'border border-white/10 bg-white/5 text-white/90',
            isUser ? 'rounded-tr-sm' : 'rounded-tl-sm',
          )}
        >
          {/* Contenido del mensaje */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>

          {/* Metadata (solo para asistente) */}
          {!isUser && message.metadata && (
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-white/5 pt-2">
              {message.metadata.confidence && (
                <span className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/50">
                  <Sparkles className="h-3 w-3" />
                  {Math.round(message.metadata.confidence * 100)}% confianza
                </span>
              )}
              {message.metadata.executionTime && (
                <span className="text-xs text-white/40">
                  {message.metadata.executionTime.toFixed(1)}s
                </span>
              )}
            </div>
          )}

          {/* KPIs inline si existen */}
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
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          )}

          {/* Botón de copiar (hover) */}
          <motion.button
            onClick={handleCopy}
            className={cn(
              'absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100',
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-400" />
            ) : (
              <Copy className="h-3 w-3 text-white/70" />
            )}
          </motion.button>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-white/30">{timeString}</span>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 KPI CARD — Tarjeta de indicador
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface KPICardProps {
  kpi: KPIData
}

function KPICard({ kpi }: KPICardProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-white/50',
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-2">
      <div className="text-xs text-white/50">{kpi.label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-semibold text-white">
          {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
        </span>
        {kpi.unit && <span className="text-xs text-white/40">{kpi.unit}</span>}
      </div>
      {kpi.trend && kpi.change && (
        <div className={cn('flex items-center gap-1 text-xs', trendColors[kpi.trend])}>
          {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'}
          {kpi.change}%
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⌨️ CHAT INPUT — Campo de entrada con sugerencias
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onVoiceToggle?: () => void
  isListening?: boolean
  disabled?: boolean
  placeholder?: string
  suggestions?: string[]
  className?: string
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onVoiceToggle,
  isListening,
  disabled,
  placeholder = 'Escribe tu mensaje...',
  suggestions = [],
  className,
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [value])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (value.trim()) {
          onSubmit()
        }
      }
    },
    [value, onSubmit],
  )

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      onChange(suggestion)
      setShowSuggestions(false)
      inputRef.current?.focus()
    },
    [onChange],
  )

  return (
    <div className={cn('relative', className)}>
      {/* Sugerencias de autocompletado */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            className="absolute right-0 bottom-full left-0 mb-2 overflow-hidden rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                <ChevronRight className="h-3 w-3 text-violet-400" />
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <div
        className={cn(
          'flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl transition-colors',
          'focus-within:border-violet-500/50 focus-within:bg-white/8',
          isListening && 'border-cyan-500/50 bg-cyan-500/5',
        )}
      >
        {/* Textarea */}
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setShowSuggestions(e.target.value.length > 0)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(value.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          disabled={disabled || isListening}
          placeholder={isListening ? 'Escuchando...' : placeholder}
          className={cn(
            'max-h-[120px] min-h-[40px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white outline-none placeholder:text-white/40',
            disabled && 'opacity-50',
          )}
          rows={1}
        />

        {/* Botón enviar */}
        <motion.button
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all',
            value.trim()
              ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'
              : 'bg-white/10 text-white/40',
          )}
          whileHover={value.trim() ? { scale: 1.05 } : {}}
          whileTap={value.trim() ? { scale: 0.95 } : {}}
        >
          <Send className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⏳ TYPING INDICATOR — Indicador de escritura
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TypingIndicatorProps {
  isTyping: boolean
  state?: CognitoState
}

export function TypingIndicator({ isTyping, state = 'thinking' }: TypingIndicatorProps) {
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
          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600">
            <Bot className="h-4 w-4 text-white" />
          </div>

          {/* Indicador */}
          <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: colors.primary }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-white/50">
              {state === 'thinking' ? 'Procesando...' : 'Escribiendo...'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚡ QUICK ACTIONS — Botones de acción rápida
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuickActionsProps {
  onAction: (action: string) => void
  className?: string
}

const QUICK_ACTIONS = [
  { id: 'ventas_hoy', label: 'Ventas de hoy', icon: BarChart3 },
  { id: 'capital_total', label: 'Capital total', icon: TrendingUp },
  { id: 'clientes_deuda', label: 'Clientes con deuda', icon: Lightbulb },
  { id: 'sugerencias', label: 'Sugerencias', icon: Sparkles },
]

export function QuickActions({ onAction, className }: QuickActionsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {QUICK_ACTIONS.map(({ id, label, icon: Icon }) => (
        <motion.button
          key={id}
          onClick={() => onAction(id)}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </motion.button>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 MODE SELECTOR — Selector de modo de IA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ModeSelectorProps {
  currentMode: CognitoMode
  onModeChange: (mode: CognitoMode) => void
  className?: string
}

const MODE_ICONS = {
  chat: Bot,
  analysis: BarChart3,
  predictions: TrendingUp,
  insights: Lightbulb,
  automation: Zap,
}

export function ModeSelector({ currentMode, onModeChange, className }: ModeSelectorProps) {
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
              'relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              isActive ? 'text-white' : 'text-white/50 hover:text-white/70',
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-lg"
                style={{ backgroundColor: colors.primary }}
                layoutId="mode-indicator"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="relative z-10 h-3.5 w-3.5" />
            <span className="relative z-10 hidden sm:inline">{MODE_LABELS[mode]}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

export default MessageBubble
