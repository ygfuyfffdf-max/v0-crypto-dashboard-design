'use client'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎮 CHRONOS INFINITY 2030 — SPLINE 3D DROPDOWN MENU
// ═══════════════════════════════════════════════════════════════════════════════════════
// Dropdown con integración del componente Spline 3D (3_d_drop_down.spline)
// Animación de apertura tipo portal + hover effects + glassmorphism
// Paleta: #8B00FF / #FFD700 / #FF1493 (CYAN PROHIBIDO)
// ═══════════════════════════════════════════════════════════════════════════════════════

import { AnimatePresence, motion, useSpring } from 'motion/react'
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'

// Lazy load Spline para mejor performance
const Spline = lazy(() => import('@splinetool/react-spline'))

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

interface DropdownItem {
  id: string
  icon: string
  label: string
  description?: string
  onClick?: () => void
  danger?: boolean
  divider?: boolean
}

interface Spline3DDropdownProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
  onSettings?: () => void
  onLogout?: () => void
  onProfile?: () => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DROPDOWN ITEMS
// ═══════════════════════════════════════════════════════════════════════════════════════

const defaultItems: DropdownItem[] = [
  {
    id: 'profile',
    icon: '👤',
    label: 'Mi Perfil',
    description: 'Ver y editar perfil',
  },
  {
    id: 'settings',
    icon: '⚙️',
    label: 'Configuración',
    description: 'Preferencias del sistema',
  },
  {
    id: 'theme',
    icon: '🎨',
    label: 'Tema',
    description: 'Personalizar apariencia',
  },
  {
    id: 'notifications',
    icon: '🔔',
    label: 'Notificaciones',
    description: 'Gestionar alertas',
  },
  { id: 'divider-1', icon: '', label: '', divider: true },
  {
    id: 'help',
    icon: '❓',
    label: 'Ayuda',
    description: 'Centro de soporte',
  },
  { id: 'divider-2', icon: '', label: '', divider: true },
  {
    id: 'logout',
    icon: '🚪',
    label: 'Cerrar Sesión',
    danger: true,
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════
// 3D TRIGGER BUTTON
// ═══════════════════════════════════════════════════════════════════════════════════════

function TriggerButton({
  isOpen,
  onClick,
  user,
}: {
  isOpen: boolean
  onClick: () => void
  user?: Spline3DDropdownProps['user']
}) {
  const [isHovered, setIsHovered] = useState(false)

  // Spring animation for rotation
  const rotation = useSpring(isOpen ? 180 : 0, {
    stiffness: 300,
    damping: 30,
  })

  return (
    <motion.button
      className="relative flex items-center gap-2 rounded-xl p-1.5 transition-spring hover:scale-105"
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: isOpen
          ? 'linear-gradient(135deg, rgba(139, 0, 255, 0.3) 0%, rgba(255, 215, 0, 0.1) 100%)'
          : isHovered
            ? 'rgba(139, 0, 255, 0.15)'
            : 'rgba(139, 0, 255, 0.05)',
        border: isOpen ? '1px solid rgba(139, 0, 255, 0.4)' : '1px solid rgba(139, 0, 255, 0.1)',
        boxShadow: isOpen
          ? '0 0 20px rgba(139, 0, 255, 0.3), inset 0 0 10px rgba(139, 0, 255, 0.1)'
          : 'none',
      }}
    >
      {/* Avatar */}
      <div className="relative h-8 w-8 overflow-hidden rounded-lg">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-sm font-bold"
            style={{
              background: 'linear-gradient(135deg, #8B00FF 0%, #FF1493 100%)',
              color: 'white',
            }}
          >
            {user?.name?.charAt(0) || '?'}
          </div>
        )}

        {/* Online indicator */}
        <div
          className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-black"
          style={{ background: '#00FF87' }}
        />
      </div>

      {/* Dropdown arrow */}
      <motion.div style={{ rotate: rotation }}>
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.div>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DROPDOWN MENU ITEM
// ═══════════════════════════════════════════════════════════════════════════════════════

function MenuItem({
  item,
  index,
  onClose,
}: {
  item: DropdownItem
  index: number
  onClose: () => void
}) {
  if (item.divider) {
    return (
      <div
        className="my-2 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(139, 0, 255, 0.3), transparent)',
        }}
      />
    )
  }

  return (
    <motion.button
      className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-spring hover:scale-105"
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: { delay: index * 0.05 },
      }}
      whileHover={{
        x: 4,
        backgroundColor: item.danger ? 'rgba(255, 51, 102, 0.15)' : 'rgba(139, 0, 255, 0.15)',
      }}
      onClick={() => {
        item.onClick?.()
        onClose()
      }}
    >
      <span className="text-lg">{item.icon}</span>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium" style={{ color: item.danger ? '#FF3366' : 'white' }}>
          {item.label}
        </div>
        {item.description && (
          <div className="truncate text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            {item.description}
          </div>
        )}
      </div>

      {/* Hover arrow */}
      <motion.span
        className="opacity-0 transition-opacity group-hover:opacity-100"
        style={{ color: item.danger ? '#FF3366' : '#8B00FF' }}
      >
        →
      </motion.span>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SPLINE 3D SCENE (decorativo)
// ═══════════════════════════════════════════════════════════════════════════════════════

function Spline3DScene() {
  return (
    <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 opacity-50">
      <Suspense fallback={null}>
        <Spline
          scene="/spline/3_d_drop_down.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </Suspense>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

export function Spline3DDropdown({ user, onSettings, onLogout, onProfile }: Spline3DDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  // Build items with callbacks
  const items = defaultItems.map((item) => {
    if (item.id === 'profile') return { ...item, onClick: onProfile }
    if (item.id === 'settings') return { ...item, onClick: onSettings }
    if (item.id === 'logout') return { ...item, onClick: onLogout }
    return item
  })

  return (
    <div ref={dropdownRef} className="relative">
      <TriggerButton isOpen={isOpen} onClick={handleToggle} user={user} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full right-0 mt-3 w-72 origin-top-right"
            initial={{
              opacity: 0,
              scale: 0.9,
              y: -10,
              rotateX: -15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              rotateX: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: -10,
              rotateX: -15,
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            style={{
              transformStyle: 'preserve-3d',
              perspective: '1000px',
            }}
          >
            {/* Glass panel */}
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                background: 'rgba(10, 5, 15, 0.95)',
                backdropFilter: 'blur(60px)',
                WebkitBackdropFilter: 'blur(60px)',
                border: '1px solid rgba(139, 0, 255, 0.2)',
                boxShadow: `
                  0 0 0 1px rgba(139, 0, 255, 0.1),
                  0 8px 32px rgba(0, 0, 0, 0.5),
                  0 0 60px rgba(139, 0, 255, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.05)
                `,
              }}
            >
              {/* Animated border glow */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `conic-gradient(from 0deg at 50% 50%,
                    transparent 0deg,
                    rgba(139, 0, 255, 0.3) 90deg,
                    transparent 180deg,
                    rgba(255, 215, 0, 0.3) 270deg,
                    transparent 360deg
                  )`,
                  opacity: 0.5,
                  animation: 'spin 4s linear infinite',
                  filter: 'blur(20px)',
                }}
              />

              {/* User info header */}
              {user && (
                <div className="relative border-b border-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center text-lg font-bold"
                          style={{
                            background: 'linear-gradient(135deg, #8B00FF 0%, #FFD700 100%)',
                            color: 'white',
                          }}
                        >
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-white">{user.name}</div>
                      <div className="truncate text-xs text-white/50">{user.email}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu items */}
              <div className="relative p-2">
                {items.map((item, index) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    index={index}
                    onClose={() => setIsOpen(false)}
                  />
                ))}
              </div>

              {/* Footer with version */}
              <div
                className="relative border-t border-white/5 px-4 py-2 text-center text-[10px]"
                style={{ color: 'rgba(255, 255, 255, 0.3)' }}
              >
                CHRONOS INFINITY v2030 • Premium Edition
              </div>

              {/* 3D Scene decoration */}
              <Spline3DScene />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

export default Spline3DDropdown
