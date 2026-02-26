'use client'

/**
 * 🖱️ QUANTUM CURSOR — Spring Physics Magnetic Cursor
 * ═══════════════════════════════════════════════════════════════════════════
 * Custom cursor with:
 * ✅ Spring physics (Framer Motion useSpring)
 * ✅ Magnetic attraction on interactive elements
 * ✅ Violet/gold glow ring
 * ✅ Idle → hover → click state morphing
 * ✅ Touch device auto-disable
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'

type CursorState = 'idle' | 'hover' | 'click' | 'text'

export function QuantumCursor() {
  const [state, setState] = useState<CursorState>('idle')
  const [visible, setVisible] = useState(false)
  const [isTouch, setIsTouch] = useState(true)

  const mX = useMotionValue(-100)
  const mY = useMotionValue(-100)

  /* spring config: outer ring lags, inner dot snaps */
  const springCfg = { stiffness: 420, damping: 28, mass: 0.6 }
  const outerX = useSpring(mX, { stiffness: 180, damping: 22 })
  const outerY = useSpring(mY, { stiffness: 180, damping: 22 })
  const dotX = useSpring(mX, springCfg)
  const dotY = useSpring(mY, springCfg)

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return
    setIsTouch(false)

    // Hide native cursor
    document.documentElement.style.cursor = 'none'

    const onMove = (e: MouseEvent) => {
      mX.set(e.clientX)
      mY.set(e.clientY)
      if (!visible) setVisible(true)
    }

    const onEnterEl = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t) return
      if (t.matches('a, button, [role=button], [data-magnetic], label')) {
        setState('hover')
      } else if (t.matches('input, textarea, [contenteditable]')) {
        setState('text')
      }
    }

    const onLeaveEl = () => setState('idle')
    const onDown = () => setState('click')
    const onUp = () => setState('idle')
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onEnterEl, { passive: true })
    document.addEventListener('mouseout', onLeaveEl, { passive: true })
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup', onUp)
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onEnterEl)
      document.removeEventListener('mouseout', onLeaveEl)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
    }
  }, [mX, mY, visible])

  if (isTouch) return null

  /* ── Ring size by state ─────────────────── */
  const RING = {
    idle: { size: 28, border: '1px solid rgba(139,92,246,0.5)', bg: 'transparent' },
    hover: { size: 44, border: '1px solid rgba(139,92,246,0.9)', bg: 'rgba(139,92,246,0.08)' },
    click: { size: 20, border: '2px solid rgba(251,191,36,0.9)', bg: 'rgba(251,191,36,0.12)' },
    text: { size: 6, border: '2px solid rgba(139,92,246,0.7)', bg: 'rgba(139,92,246,0.2)' },
  }
  const r = RING[state]

  return (
    <>
      {/* Outer spring ring */}
      <motion.div
        aria-hidden
        style={{
          x: outerX,
          y: outerY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: visible ? 1 : 0,
        }}
        animate={{
          width: r.size,
          height: r.size,
          border: r.border,
          backgroundColor: r.bg,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="pointer-events-none fixed top-0 left-0 z-[99999] rounded-full mix-blend-screen"
        style={{
          x: outerX,
          y: outerY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: visible ? 1 : 0,
          boxShadow: state === 'hover' ? '0 0 16px rgba(139,92,246,0.35)' : state === 'click' ? '0 0 16px rgba(251,191,36,0.45)' : 'none',
        }}
      />

      {/* Inner snappy dot */}
      <motion.div
        aria-hidden
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: visible ? 1 : 0,
        }}
        animate={{
          width: state === 'text' ? 2 : state === 'hover' ? 6 : 5,
          height: state === 'text' ? 18 : state === 'hover' ? 6 : 5,
          backgroundColor: state === 'click' ? '#FBBF24' : '#8B5CF6',
          borderRadius: state === 'text' ? '2px' : '50%',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="pointer-events-none fixed top-0 left-0 z-[99999]"
      />
    </>
  )
}
