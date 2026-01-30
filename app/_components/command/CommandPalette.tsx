/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * ⌘ CHRONOS INFINITY 2030 — COMMAND PALETTE SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de Command Palette (CMD+K) ultra-premium con:
 * - Búsqueda fuzzy de comandos
 * - Navegación por teclado
 * - Comandos anidados (subcommands)
 * - Acciones rápidas personalizables
 * - Historial de comandos recientes
 * - Atajos de teclado integrados
 * - Categorías de comandos
 * 
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useRouter } from 'next/navigation'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

export type CommandCategory = 
  | 'navigation'
  | 'actions'
  | 'search'
  | 'settings'
  | 'help'
  | 'recent'

export interface Command {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  shortcut?: string[]
  category: CommandCategory
  keywords?: string[]
  onSelect: () => void | Promise<void>
  disabled?: boolean
  subCommands?: Command[]
}

interface CommandPaletteContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  registerCommand: (command: Command) => void
  unregisterCommand: (id: string) => void
  executeCommand: (id: string) => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════════════

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null)

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext)
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider')
  }
  return context
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FUZZY SEARCH
// ═══════════════════════════════════════════════════════════════════════════════════════

function fuzzyMatch(text: string, query: string): { match: boolean; score: number } {
  if (!query) return { match: true, score: 1 }

  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()

  // Exact match
  if (textLower === queryLower) {
    return { match: true, score: 1 }
  }

  // Starts with
  if (textLower.startsWith(queryLower)) {
    return { match: true, score: 0.9 }
  }

  // Contains
  if (textLower.includes(queryLower)) {
    return { match: true, score: 0.7 }
  }

  // Fuzzy character match
  let queryIndex = 0
  let score = 0
  let consecutiveMatches = 0

  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++
      consecutiveMatches++
      score += consecutiveMatches * 0.1
    } else {
      consecutiveMatches = 0
    }
  }

  if (queryIndex === queryLower.length) {
    return { match: true, score: Math.min(score / queryLower.length, 0.6) }
  }

  return { match: false, score: 0 }
}

function searchCommands(commands: Command[], query: string): Command[] {
  if (!query.trim()) {
    return commands.filter((cmd) => !cmd.disabled)
  }

  const results: Array<{ command: Command; score: number }> = []

  for (const command of commands) {
    if (command.disabled) continue

    const labelMatch = fuzzyMatch(command.label, query)
    const descMatch = command.description ? fuzzyMatch(command.description, query) : { match: false, score: 0 }
    const keywordMatches = (command.keywords || []).map((k) => fuzzyMatch(k, query))

    const bestScore = Math.max(
      labelMatch.score,
      descMatch.score * 0.5,
      ...keywordMatches.map((m) => m.score * 0.3)
    )

    if (labelMatch.match || descMatch.match || keywordMatches.some((m) => m.match)) {
      results.push({ command, score: bestScore })
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .map((r) => r.command)
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CATEGORY CONFIG
// ═══════════════════════════════════════════════════════════════════════════════════════

const CATEGORY_CONFIG: Record<CommandCategory, { label: string; priority: number }> = {
  recent: { label: 'Recientes', priority: 0 },
  navigation: { label: 'Navegación', priority: 1 },
  actions: { label: 'Acciones', priority: 2 },
  search: { label: 'Búsqueda', priority: 3 },
  settings: { label: 'Configuración', priority: 4 },
  help: { label: 'Ayuda', priority: 5 },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════

interface CommandPaletteProviderProps {
  children: ReactNode
  defaultCommands?: Command[]
}

export function CommandPaletteProvider({
  children,
  defaultCommands = [],
}: CommandPaletteProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [commands, setCommands] = useState<Command[]>(defaultCommands)
  const [recentCommands, setRecentCommands] = useState<string[]>([])

  // Load recent commands from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('chronos-recent-commands')
      if (stored) {
        setRecentCommands(JSON.parse(stored))
      }
    } catch {
      // Ignore
    }
  }, [])

  // Save recent commands
  const addToRecent = useCallback((commandId: string) => {
    setRecentCommands((prev) => {
      const filtered = prev.filter((id) => id !== commandId)
      const updated = [commandId, ...filtered].slice(0, 5)
      try {
        localStorage.setItem('chronos-recent-commands', JSON.stringify(updated))
      } catch {
        // Ignore
      }
      return updated
    })
  }, [])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  const registerCommand = useCallback((command: Command) => {
    setCommands((prev) => {
      const filtered = prev.filter((c) => c.id !== command.id)
      return [...filtered, command]
    })
  }, [])

  const unregisterCommand = useCallback((id: string) => {
    setCommands((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const executeCommand = useCallback(
    async (id: string) => {
      const command = commands.find((c) => c.id === id)
      if (command && !command.disabled) {
        await command.onSelect()
        addToRecent(id)
        close()
      }
    },
    [commands, addToRecent, close]
  )

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  const value = useMemo<CommandPaletteContextValue>(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      registerCommand,
      unregisterCommand,
      executeCommand,
    }),
    [isOpen, open, close, toggle, registerCommand, unregisterCommand, executeCommand]
  )

  // Commands with recent category
  const commandsWithRecent = useMemo(() => {
    const recent = recentCommands
      .map((id) => commands.find((c) => c.id === id))
      .filter(Boolean) as Command[]
    
    return [
      ...recent.map((c) => ({ ...c, category: 'recent' as CommandCategory })),
      ...commands,
    ]
  }, [commands, recentCommands])

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPaletteUI
        isOpen={isOpen}
        onClose={close}
        commands={commandsWithRecent}
        onExecute={executeCommand}
      />
    </CommandPaletteContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMMAND PALETTE UI
// ═══════════════════════════════════════════════════════════════════════════════════════

interface CommandPaletteUIProps {
  isOpen: boolean
  onClose: () => void
  commands: Command[]
  onExecute: (id: string) => void
}

function CommandPaletteUI({ isOpen, onClose, commands, onExecute }: CommandPaletteUIProps) {
  const prefersReducedMotion = useReducedMotion()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Filter and group commands
  const filteredCommands = useMemo(
    () => searchCommands(commands, query),
    [commands, query]
  )

  const groupedCommands = useMemo(() => {
    const groups: Record<CommandCategory, Command[]> = {
      recent: [],
      navigation: [],
      actions: [],
      search: [],
      settings: [],
      help: [],
    }

    for (const command of filteredCommands) {
      groups[command.category].push(command)
    }

    return Object.entries(groups)
      .filter(([_, cmds]) => cmds.length > 0)
      .sort(([a], [b]) => CATEGORY_CONFIG[a as CommandCategory].priority - CATEGORY_CONFIG[b as CommandCategory].priority)
      .map(([category, cmds]) => ({
        category: category as CommandCategory,
        label: CATEGORY_CONFIG[category as CommandCategory].label,
        commands: cmds,
      }))
  }, [filteredCommands])

  // Flat list for navigation
  const flatCommands = useMemo(
    () => groupedCommands.flatMap((g) => g.commands),
    [groupedCommands]
  )

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, flatCommands.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (flatCommands[selectedIndex]) {
            onExecute(flatCommands[selectedIndex].id)
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, flatCommands, onExecute, onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
    selectedElement?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Palette */}
          <motion.div
            className="fixed z-[10000] left-1/2 top-[15%] w-full max-w-xl -translate-x-1/2"
            initial={!prefersReducedMotion ? { opacity: 0, scale: 0.95, y: -20 } : { opacity: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={!prefersReducedMotion ? { opacity: 0, scale: 0.95, y: -20 } : { opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="mx-4 overflow-hidden rounded-2xl bg-slate-900/95 border border-white/10 shadow-2xl backdrop-blur-xl">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 border-b border-white/10">
                <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Escribe un comando o busca..."
                  className="flex-1 bg-transparent py-4 text-white placeholder:text-white/40 focus:outline-none"
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-white/40 bg-white/5 rounded-lg">
                  ESC
                </kbd>
              </div>

              {/* Commands list */}
              <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
                {groupedCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center text-white/40">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No se encontraron comandos</p>
                  </div>
                ) : (
                  groupedCommands.map((group) => (
                    <div key={group.category} className="mb-2">
                      <div className="px-4 py-1.5 text-xs font-medium text-white/40 uppercase tracking-wider">
                        {group.label}
                      </div>
                      {group.commands.map((command) => {
                        const globalIndex = flatCommands.indexOf(command)
                        const isSelected = globalIndex === selectedIndex

                        return (
                          <motion.div
                            key={command.id}
                            data-index={globalIndex}
                            className={cn(
                              'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl cursor-pointer',
                              'transition-colors',
                              isSelected ? 'bg-violet-500/20' : 'hover:bg-white/5'
                            )}
                            onClick={() => {
                              setSelectedIndex(globalIndex)
                              onExecute(command.id)
                            }}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                          >
                            {/* Icon */}
                            {command.icon && (
                              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/60">
                                {command.icon}
                              </div>
                            )}

                            {/* Label & Description */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {command.label}
                              </p>
                              {command.description && (
                                <p className="text-xs text-white/40 truncate">
                                  {command.description}
                                </p>
                              )}
                            </div>

                            {/* Shortcut */}
                            {command.shortcut && (
                              <div className="flex items-center gap-1">
                                {command.shortcut.map((key, i) => (
                                  <kbd
                                    key={i}
                                    className="px-1.5 py-0.5 text-xs text-white/50 bg-white/5 rounded"
                                  >
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 text-xs text-white/30 border-t border-white/5 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 bg-white/5 rounded">↑↓</kbd> navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 bg-white/5 rounded">↵</kbd> seleccionar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 bg-white/5 rounded">esc</kbd> cerrar
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DEFAULT COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════════════

export function useDefaultCommands(): Command[] {
  const router = useRouter()

  return useMemo<Command[]>(() => [
    {
      id: 'nav-dashboard',
      label: 'Ir a Dashboard',
      description: 'Panel principal',
      category: 'navigation',
      shortcut: ['⌘', 'D'],
      keywords: ['inicio', 'home', 'panel'],
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      onSelect: () => router.push('/dashboard'),
    },
    {
      id: 'nav-ventas',
      label: 'Ir a Ventas',
      description: 'Gestión de ventas',
      category: 'navigation',
      keywords: ['sales', 'vender'],
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onSelect: () => router.push('/ventas'),
    },
    {
      id: 'nav-bancos',
      label: 'Ir a Bancos',
      description: 'Cuentas bancarias',
      category: 'navigation',
      keywords: ['cuentas', 'dinero', 'capital'],
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
      onSelect: () => router.push('/bancos'),
    },
    {
      id: 'nav-clientes',
      label: 'Ir a Clientes',
      description: 'Gestión de clientes',
      category: 'navigation',
      keywords: ['customers', 'compradores'],
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      onSelect: () => router.push('/clientes'),
    },
    {
      id: 'nav-ordenes',
      label: 'Ir a Órdenes de Compra',
      description: 'Gestión de compras',
      category: 'navigation',
      keywords: ['compras', 'orders', 'proveedores'],
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      onSelect: () => router.push('/ordenes'),
    },
    {
      id: 'action-new-venta',
      label: 'Nueva Venta',
      description: 'Registrar una venta',
      category: 'actions',
      shortcut: ['⌘', 'N'],
      keywords: ['crear', 'registrar', 'nueva'],
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onSelect: () => {
        // Trigger new sale action
        window.dispatchEvent(new CustomEvent('chronos:action', { detail: 'new-venta' }))
      },
    },
    {
      id: 'action-new-orden',
      label: 'Nueva Orden de Compra',
      description: 'Crear orden de compra',
      category: 'actions',
      keywords: ['crear', 'compra', 'orden'],
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onSelect: () => {
        window.dispatchEvent(new CustomEvent('chronos:action', { detail: 'new-orden' }))
      },
    },
    {
      id: 'action-transferencia',
      label: 'Transferir entre Bancos',
      description: 'Mover fondos entre cuentas',
      category: 'actions',
      keywords: ['mover', 'transfer', 'fondos'],
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      onSelect: () => {
        window.dispatchEvent(new CustomEvent('chronos:action', { detail: 'transferencia' }))
      },
    },
    {
      id: 'help-shortcuts',
      label: 'Ver Atajos de Teclado',
      description: 'Lista de atajos disponibles',
      category: 'help',
      shortcut: ['?'],
      keywords: ['keyboard', 'teclas'],
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onSelect: () => {
        window.dispatchEvent(new CustomEvent('chronos:show-shortcuts'))
      },
    },
    {
      id: 'settings-theme',
      label: 'Cambiar Tema',
      description: 'Modo claro/oscuro',
      category: 'settings',
      keywords: ['dark', 'light', 'modo'],
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      onSelect: () => {
        window.dispatchEvent(new CustomEvent('chronos:toggle-theme'))
      },
    },
  ], [router])
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export type { Command, CommandCategory }
