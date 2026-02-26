/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ⚡ CHRONOS 2026 — iOS ADVANCED INTERACTIONS SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de interacciones avanzadas premium estilo iOS con:
 * - Haptic feedback simulado
 * - Long press actions
 * - Swipe to reveal actions
 * - Context menus
 * - Drag & Drop premium
 * - Pull down menus
 * - Force touch simulation
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import {
    Archive,
    Bell,
    Copy,
    Edit2,
    Flag,
    LucideIcon,
    MoreHorizontal,
    Pin,
    Share,
    Trash2
} from 'lucide-react'
import { AnimatePresence, PanInfo, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import {
    ReactNode,
    createContext,
    memo,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HAPTIC FEEDBACK CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'

interface HapticContextType {
  triggerHaptic: (type: HapticType) => void
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

const HapticContext = createContext<HapticContextType>({
  triggerHaptic: () => {},
  enabled: true,
  setEnabled: () => {},
})

export const useHaptic = () => useContext(HapticContext)

export const HapticProvider = memo(function HapticProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true)

  const triggerHaptic = useCallback((type: HapticType) => {
    if (!enabled || typeof window === 'undefined') return

    // Use Vibration API if available
    if ('vibrate' in navigator) {
      const patterns: Record<HapticType, number | number[]> = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: [10, 50, 20],
        warning: [20, 30, 20],
        error: [30, 20, 30, 20, 30],
        selection: 5,
      }
      navigator.vibrate(patterns[type])
    }

    // Also trigger audio feedback for desktop
    const audioFeedback = new Audio()
    audioFeedback.volume = 0.1
  }, [enabled])

  return (
    <HapticContext.Provider value={{ triggerHaptic, enabled, setEnabled }}>
      {children}
    </HapticContext.Provider>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SWIPE TO REVEAL ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface SwipeAction {
  id: string
  icon: LucideIcon
  label: string
  color: string
  bgColor: string
  onClick: () => void
  destructive?: boolean
}

interface iOSSwipeActionsProps {
  children: ReactNode
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  actionWidth?: number
  threshold?: number
  className?: string
  disabled?: boolean
  onSwipeStart?: () => void
  onSwipeEnd?: () => void
}

export const iOSSwipeActions = memo(function iOSSwipeActions({
  children,
  leftActions = [],
  rightActions = [],
  actionWidth = 72,
  threshold = 0.3,
  className,
  disabled = false,
  onSwipeStart,
  onSwipeEnd,
}: iOSSwipeActionsProps) {
  const [isRevealed, setIsRevealed] = useState<'left' | 'right' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { triggerHaptic } = useHaptic()

  const x = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 500, damping: 40 })

  const maxLeftSwipe = leftActions.length * actionWidth
  const maxRightSwipe = rightActions.length * actionWidth

  // Transform for background opacity
  const leftBgOpacity = useTransform(springX, [0, maxLeftSwipe * 0.5, maxLeftSwipe], [0, 0.5, 1])
  const rightBgOpacity = useTransform(springX, [-maxRightSwipe, -maxRightSwipe * 0.5, 0], [1, 0.5, 0])

  const handleDragStart = useCallback(() => {
    if (disabled) return
    onSwipeStart?.()
  }, [disabled, onSwipeStart])

  const handleDragEnd = useCallback((
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (disabled) return

    const velocity = info.velocity.x
    const offset = info.offset.x

    // Snap logic based on threshold and velocity
    if (offset > maxLeftSwipe * threshold || velocity > 500) {
      x.set(maxLeftSwipe)
      setIsRevealed('left')
      triggerHaptic('medium')
    } else if (offset < -maxRightSwipe * threshold || velocity < -500) {
      x.set(-maxRightSwipe)
      setIsRevealed('right')
      triggerHaptic('medium')
    } else {
      x.set(0)
      setIsRevealed(null)
    }

    onSwipeEnd?.()
  }, [disabled, maxLeftSwipe, maxRightSwipe, threshold, x, triggerHaptic, onSwipeEnd])

  const handleActionClick = useCallback((action: SwipeAction) => {
    triggerHaptic(action.destructive ? 'warning' : 'selection')
    action.onClick()

    // Auto close after action
    setTimeout(() => {
      x.set(0)
      setIsRevealed(null)
    }, 200)
  }, [triggerHaptic, x])

  const closeSwipe = useCallback(() => {
    x.set(0)
    setIsRevealed(null)
  }, [x])

  // Close on outside click
  useEffect(() => {
    if (!isRevealed) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeSwipe()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isRevealed, closeSwipe])

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <motion.div
          className="absolute inset-y-0 left-0 flex"
          style={{ opacity: leftBgOpacity }}
        >
          {leftActions.map((action, index) => {
            const ActionIcon = action.icon
            return (
              <motion.button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5',
                  'text-xs font-medium transition-transform active:scale-95'
                )}
                style={{
                  width: actionWidth,
                  backgroundColor: action.bgColor,
                  color: action.color,
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isRevealed === 'left' ? 1 : 0.8,
                  opacity: isRevealed === 'left' ? 1 : 0.5,
                }}
                transition={{ delay: index * 0.05 }}
              >
                <ActionIcon size={22} />
                <span className="text-[10px]">{action.label}</span>
              </motion.button>
            )
          })}
        </motion.div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <motion.div
          className="absolute inset-y-0 right-0 flex"
          style={{ opacity: rightBgOpacity }}
        >
          {rightActions.map((action, index) => {
            const ActionIcon = action.icon
            return (
              <motion.button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5',
                  'text-xs font-medium transition-transform active:scale-95'
                )}
                style={{
                  width: actionWidth,
                  backgroundColor: action.bgColor,
                  color: action.color,
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isRevealed === 'right' ? 1 : 0.8,
                  opacity: isRevealed === 'right' ? 1 : 0.5,
                }}
                transition={{ delay: index * 0.05 }}
              >
                <ActionIcon size={22} />
                <span className="text-[10px]">{action.label}</span>
              </motion.button>
            )
          })}
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        drag={disabled ? false : 'x'}
        dragConstraints={{
          left: -maxRightSwipe,
          right: maxLeftSwipe,
        }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x: springX }}
        className="relative bg-[#1C1C1E] touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LONG PRESS MENU
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface LongPressMenuItem {
  id: string
  icon: LucideIcon
  label: string
  shortcut?: string
  destructive?: boolean
  disabled?: boolean
  onClick: () => void
}

interface iOSLongPressMenuProps {
  children: ReactNode
  items: LongPressMenuItem[]
  delay?: number
  disabled?: boolean
  className?: string
}

export const iOSLongPressMenu = memo(function iOSLongPressMenu({
  children,
  items,
  delay = 500,
  disabled = false,
  className,
}: iOSLongPressMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const longPressTimer = useRef<NodeJS.Timeout | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const { triggerHaptic } = useHaptic()

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return

    longPressTimer.current = setTimeout(() => {
      triggerHaptic('medium')

      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        // Position menu near the touch/click point
        const x = Math.min(e.clientX, window.innerWidth - 220)
        const y = Math.min(e.clientY, window.innerHeight - (items.length * 48 + 20))
        setMenuPosition({ x, y })
      }

      setIsMenuOpen(true)
    }, delay)
  }, [disabled, delay, items.length, triggerHaptic])

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }, [])

  const handlePointerLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }, [])

  const handleItemClick = useCallback((item: LongPressMenuItem) => {
    if (item.disabled) return

    triggerHaptic(item.destructive ? 'warning' : 'selection')
    item.onClick()
    setIsMenuOpen(false)
  }, [triggerHaptic])

  // Close on outside click
  useEffect(() => {
    if (!isMenuOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      setIsMenuOpen(false)
    }

    // Small delay to prevent immediate close
    const timeout = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeout)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <>
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onContextMenu={(e) => {
          if (!disabled) {
            e.preventDefault()
            triggerHaptic('medium')
            const x = Math.min(e.clientX, window.innerWidth - 220)
            const y = Math.min(e.clientY, window.innerHeight - (items.length * 48 + 20))
            setMenuPosition({ x, y })
            setIsMenuOpen(true)
          }
        }}
        className={cn('select-none', className)}
      >
        {children}
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className={cn(
                'fixed z-[101] min-w-[200px] max-w-[280px]',
                'bg-[#2C2C2E]/95 backdrop-blur-xl',
                'rounded-xl overflow-hidden',
                'border border-white/[0.1]',
                'shadow-[0_25px_50px_rgba(0,0,0,0.5)]'
              )}
              style={{
                left: menuPosition.x,
                top: menuPosition.y,
              }}
            >
              {items.map((item, index) => {
                const ItemIcon = item.icon
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    disabled={item.disabled}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3',
                      'text-sm transition-colors',
                      item.disabled && 'opacity-40 cursor-not-allowed',
                      !item.disabled && 'hover:bg-white/5 active:bg-white/10',
                      item.destructive ? 'text-red-400' : 'text-white',
                      index !== items.length - 1 && 'border-b border-white/[0.08]'
                    )}
                  >
                    <ItemIcon size={18} className="opacity-80" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.shortcut && (
                      <span className="text-xs text-white/40 font-mono">
                        {item.shortcut}
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PULL DOWN MENU
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface PullDownMenuItem {
  id: string
  icon: LucideIcon
  label: string
  selected?: boolean
  onClick: () => void
}

export interface PullDownMenuSection {
  title?: string
  items: PullDownMenuItem[]
}

interface iOSPullDownMenuProps {
  trigger: ReactNode
  sections: PullDownMenuSection[]
  align?: 'start' | 'center' | 'end'
  className?: string
}

export const iOSPullDownMenu = memo(function iOSPullDownMenu({
  trigger,
  sections,
  align = 'end',
  className,
}: iOSPullDownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0 })
  const { triggerHaptic } = useHaptic()

  const handleOpen = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      let x = rect.left

      if (align === 'center') {
        x = rect.left + rect.width / 2 - 110
      } else if (align === 'end') {
        x = rect.right - 220
      }

      setPosition({
        x: Math.max(16, Math.min(x, window.innerWidth - 236)),
        y: rect.bottom + 8,
        width: Math.max(220, rect.width),
      })
    }

    triggerHaptic('light')
    setIsOpen(true)
  }, [align, triggerHaptic])

  const handleItemClick = useCallback((item: PullDownMenuItem) => {
    triggerHaptic('selection')
    item.onClick()
    setIsOpen(false)
  }, [triggerHaptic])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = () => setIsOpen(false)

    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 100)

    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  return (
    <>
      <div
        ref={triggerRef}
        onClick={handleOpen}
        className={cn('cursor-pointer', className)}
      >
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className={cn(
              'fixed z-[100] min-w-[220px]',
              'bg-[#2C2C2E]/95 backdrop-blur-xl',
              'rounded-xl overflow-hidden',
              'border border-white/[0.1]',
              'shadow-[0_25px_50px_rgba(0,0,0,0.5)]'
            )}
            style={{
              left: position.x,
              top: position.y,
              minWidth: position.width,
            }}
          >
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.title && (
                  <div className="px-4 py-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                    {section.title}
                  </div>
                )}

                {section.items.map((item, itemIndex) => {
                  const ItemIcon = item.icon
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (sectionIndex * section.items.length + itemIndex) * 0.02 }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5',
                        'text-sm text-white transition-colors',
                        'hover:bg-white/5 active:bg-white/10',
                        itemIndex !== section.items.length - 1 && 'border-b border-white/[0.05]'
                      )}
                    >
                      <ItemIcon size={18} className="text-violet-400" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-violet-500"
                        />
                      )}
                    </motion.button>
                  )
                })}

                {sectionIndex < sections.length - 1 && (
                  <div className="h-[1px] bg-white/[0.1] my-1" />
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DRAG AND DROP PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface DraggableItemData {
  id: string
  [key: string]: unknown
}

interface iOSDraggableListProps<T extends DraggableItemData> {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, index: number, isDragging: boolean) => ReactNode
  keyExtractor?: (item: T) => string
  className?: string
  itemClassName?: string
  disabled?: boolean
}

export function iOSDraggableList<T extends DraggableItemData>({
  items,
  onReorder,
  renderItem,
  keyExtractor = (item) => item.id,
  className,
  itemClassName,
  disabled = false,
}: iOSDraggableListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [orderedItems, setOrderedItems] = useState(items)
  const { triggerHaptic } = useHaptic()

  useEffect(() => {
    setOrderedItems(items)
  }, [items])

  const handleDragStart = useCallback((id: string) => {
    if (disabled) return
    setActiveId(id)
    triggerHaptic('medium')
  }, [disabled, triggerHaptic])

  const handleDragEnd = useCallback((
    id: string,
    info: PanInfo
  ) => {
    if (disabled || !activeId) return

    setActiveId(null)
    triggerHaptic('light')

    // If order changed, notify parent
    if (orderedItems !== items) {
      onReorder(orderedItems)
    }
  }, [disabled, activeId, orderedItems, items, onReorder, triggerHaptic])

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    const newItems = [...orderedItems]
    const [movedItem] = newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, movedItem!)

    setOrderedItems(newItems)
    triggerHaptic('selection')
  }, [orderedItems, triggerHaptic])

  return (
    <div className={cn('space-y-2', className)}>
      {orderedItems.map((item, index) => {
        const key = keyExtractor(item)
        const isDragging = activeId === key

        return (
          <motion.div
            key={key}
            layout
            layoutId={key}
            drag={disabled ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragStart={() => handleDragStart(key)}
            onDragEnd={(_, info) => handleDragEnd(key, info)}
            onDrag={(_, info) => {
              if (!activeId) return

              // Calculate new position
              const itemHeight = 60 // Approximate item height
              const offset = Math.round(info.offset.y / itemHeight)
              const newIndex = Math.max(0, Math.min(orderedItems.length - 1, index + offset))

              if (newIndex !== index) {
                moveItem(index, newIndex)
              }
            }}
            animate={{
              scale: isDragging ? 1.02 : 1,
              boxShadow: isDragging
                ? '0 25px 50px rgba(0,0,0,0.5)'
                : '0 4px 12px rgba(0,0,0,0.2)',
              zIndex: isDragging ? 50 : 0,
            }}
            transition={{
              layout: { type: 'spring', damping: 25, stiffness: 300 },
            }}
            className={cn(
              'relative cursor-grab active:cursor-grabbing',
              'bg-[#2C2C2E] rounded-xl',
              isDragging && 'bg-[#3C3C3E]',
              itemClassName
            )}
          >
            {renderItem(item, index, isDragging)}
          </motion.div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORCE TOUCH PREVIEW
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSPeekPreviewProps {
  children: ReactNode
  preview: ReactNode
  actions?: Array<{
    id: string
    label: string
    icon: LucideIcon
    destructive?: boolean
    onClick: () => void
  }>
  disabled?: boolean
  className?: string
}

export const iOSPeekPreview = memo(function iOSPeekPreview({
  children,
  preview,
  actions = [],
  disabled = false,
  className,
}: iOSPeekPreviewProps) {
  const [isPeeking, setIsPeeking] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const peekTimer = useRef<NodeJS.Timeout | undefined>(undefined)
  const { triggerHaptic } = useHaptic()

  const handlePointerDown = useCallback(() => {
    if (disabled) return

    peekTimer.current = setTimeout(() => {
      triggerHaptic('medium')
      setIsPeeking(true)
    }, 400)
  }, [disabled, triggerHaptic])

  const handlePointerUp = useCallback(() => {
    if (peekTimer.current) {
      clearTimeout(peekTimer.current)
    }

    if (isPeeking) {
      if (!showActions) {
        setShowActions(true)
        triggerHaptic('light')
      }
    }
  }, [isPeeking, showActions, triggerHaptic])

  const handleClose = useCallback(() => {
    setIsPeeking(false)
    setShowActions(false)
  }, [])

  const handleActionClick = useCallback((action: typeof actions[0]) => {
    triggerHaptic(action.destructive ? 'warning' : 'selection')
    action.onClick()
    handleClose()
  }, [triggerHaptic, handleClose])

  // Close on escape
  useEffect(() => {
    if (!isPeeking) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isPeeking, handleClose])

  return (
    <>
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          if (peekTimer.current) clearTimeout(peekTimer.current)
        }}
        className={cn('touch-none', className)}
      >
        {children}
      </div>

      <AnimatePresence>
        {isPeeking && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
            />

            {/* Preview Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className={cn(
                'fixed z-[101] left-1/2 top-1/2',
                '-translate-x-1/2 -translate-y-1/2',
                'w-[90vw] max-w-md',
                'bg-[#2C2C2E] rounded-2xl overflow-hidden',
                'shadow-[0_50px_100px_rgba(0,0,0,0.6)]'
              )}
            >
              {/* Preview content */}
              <div className="max-h-[50vh] overflow-hidden">
                {preview}
              </div>

              {/* Actions */}
              <AnimatePresence>
                {showActions && actions.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/[0.1]"
                  >
                    {actions.map((action, index) => {
                      const ActionIcon = action.icon
                      return (
                        <motion.button
                          key={action.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleActionClick(action)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3',
                            'text-sm transition-colors',
                            'hover:bg-white/5 active:bg-white/10',
                            action.destructive ? 'text-red-400' : 'text-white',
                            index !== actions.length - 1 && 'border-b border-white/[0.08]'
                          )}
                        >
                          <ActionIcon size={18} />
                          <span>{action.label}</span>
                        </motion.button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESET SWIPE ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const createDefaultSwipeActions = (handlers: {
  onDelete?: () => void
  onEdit?: () => void
  onArchive?: () => void
  onPin?: () => void
  onShare?: () => void
  onMore?: () => void
}): {
  leftActions: SwipeAction[]
  rightActions: SwipeAction[]
} => ({
  leftActions: [
    handlers.onPin && {
      id: 'pin',
      icon: Pin,
      label: 'Fijar',
      color: '#fff',
      bgColor: '#FF9500',
      onClick: handlers.onPin,
    },
    handlers.onShare && {
      id: 'share',
      icon: Share,
      label: 'Compartir',
      color: '#fff',
      bgColor: '#007AFF',
      onClick: handlers.onShare,
    },
  ].filter(Boolean) as SwipeAction[],
  rightActions: [
    handlers.onMore && {
      id: 'more',
      icon: MoreHorizontal,
      label: 'Más',
      color: '#fff',
      bgColor: '#8E8E93',
      onClick: handlers.onMore,
    },
    handlers.onArchive && {
      id: 'archive',
      icon: Archive,
      label: 'Archivar',
      color: '#fff',
      bgColor: '#5856D6',
      onClick: handlers.onArchive,
    },
    handlers.onDelete && {
      id: 'delete',
      icon: Trash2,
      label: 'Eliminar',
      color: '#fff',
      bgColor: '#FF3B30',
      onClick: handlers.onDelete,
      destructive: true,
    },
  ].filter(Boolean) as SwipeAction[],
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESET LONG PRESS MENU ITEMS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const createDefaultLongPressItems = (handlers: {
  onCopy?: () => void
  onEdit?: () => void
  onShare?: () => void
  onFlag?: () => void
  onNotify?: () => void
  onDelete?: () => void
}): LongPressMenuItem[] => [
  handlers.onCopy && {
    id: 'copy',
    icon: Copy,
    label: 'Copiar',
    shortcut: '⌘C',
    onClick: handlers.onCopy,
  },
  handlers.onEdit && {
    id: 'edit',
    icon: Edit2,
    label: 'Editar',
    shortcut: '⌘E',
    onClick: handlers.onEdit,
  },
  handlers.onShare && {
    id: 'share',
    icon: Share,
    label: 'Compartir',
    shortcut: '⌘S',
    onClick: handlers.onShare,
  },
  handlers.onFlag && {
    id: 'flag',
    icon: Flag,
    label: 'Marcar',
    onClick: handlers.onFlag,
  },
  handlers.onNotify && {
    id: 'notify',
    icon: Bell,
    label: 'Notificarme',
    onClick: handlers.onNotify,
  },
  handlers.onDelete && {
    id: 'delete',
    icon: Trash2,
    label: 'Eliminar',
    destructive: true,
    onClick: handlers.onDelete,
  },
].filter(Boolean) as LongPressMenuItem[]
