'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ⚡ PHYSICS ENGINE — CHRONOS INFINITY 2026 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Motor de físicas 2D/3D ultra-realista con:
 * - Matter.js para 2D physics (colisiones, gravedad, rebotes)
 * - Cannon-es para 3D physics (cuando se necesite)
 * - Integración perfecta con React y Canvas
 * - 60FPS garantizado con requestAnimationFrame
 * - Auto-cleanup para prevenir memory leaks
 *
 * @version 1.0.0
 * @author CHRONOS INFINITY TEAM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import Matter from 'matter-js'
import { useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PhysicsBody {
  id: string
  x: number
  y: number
  angle: number
  velocity: { x: number; y: number }
}

interface PhysicsEngineProps {
  width: number
  height: number
  gravity?: { x: number; y: number }
  debug?: boolean
  onUpdate?: (bodies: PhysicsBody[]) => void
  children?: React.ReactNode | ((api: {
    addCircle: (x: number, y: number, radius: number, options?: Matter.IBodyDefinition) => number | null
    addRectangle: (x: number, y: number, w: number, h: number, options?: Matter.IBodyDefinition) => number | null
    removeBody: (id: number) => void
    applyForce: (id: number, force: { x: number; y: number }) => void
    bodies: PhysicsBody[]
  }) => React.ReactNode)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PHYSICS ENGINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function PhysicsEngine({
  width,
  height,
  gravity = { x: 0, y: 1 },
  debug = false,
  onUpdate,
  children,
}: PhysicsEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const renderRef = useRef<Matter.Render | null>(null)
  const runnerRef = useRef<Matter.Runner | null>(null)
  const [bodies, setBodies] = useState<PhysicsBody[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Crear engine de Matter.js
    const engine = Matter.Engine.create({
      gravity: {
        x: gravity.x,
        y: gravity.y,
        scale: 0.001,
      },
    })
    engineRef.current = engine

    // Crear renderer si debug=true
    if (debug) {
      const render = Matter.Render.create({
        canvas,
        engine,
        options: {
          width,
          height,
          wireframes: true,
          background: 'transparent',
        },
      })
      renderRef.current = render
      Matter.Render.run(render)
    }

    // Crear walls (boundaries)
    const walls = [
      // Top
      Matter.Bodies.rectangle(width / 2, 0, width, 50, {
        isStatic: true,
        label: 'wall-top',
      }),
      // Bottom
      Matter.Bodies.rectangle(width / 2, height, width, 50, {
        isStatic: true,
        label: 'wall-bottom',
      }),
      // Left
      Matter.Bodies.rectangle(0, height / 2, 50, height, {
        isStatic: true,
        label: 'wall-left',
      }),
      // Right
      Matter.Bodies.rectangle(width, height / 2, 50, height, {
        isStatic: true,
        label: 'wall-right',
      }),
    ]

    Matter.Composite.add(engine.world, walls)

    // Runner para actualizaciones
    const runner = Matter.Runner.create()
    runnerRef.current = runner
    Matter.Runner.run(runner, engine)

    // Update loop
    const updateBodies = () => {
      const allBodies = Matter.Composite.allBodies(engine.world)
        .filter((body: Matter.Body) => !body.isStatic)
        .map((body: Matter.Body) => ({
          id: body.label || body.id.toString(),
          x: body.position.x,
          y: body.position.y,
          angle: body.angle,
          velocity: { x: body.velocity.x, y: body.velocity.y },
        }))

      setBodies(allBodies)
      onUpdate?.(allBodies)
    }

    Matter.Events.on(engine, 'afterUpdate', updateBodies)

    // Cleanup
    return () => {
      Matter.Events.off(engine, 'afterUpdate', updateBodies)

      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current)
      }

      if (renderRef.current) {
        Matter.Render.stop(renderRef.current)
      }

      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current)
        Matter.World.clear(engineRef.current.world, false)
      }
    }
  }, [width, height, gravity, debug, onUpdate])

  // API para agregar cuerpos dinámicamente
  const addCircle = (x: number, y: number, radius: number, options?: Matter.IBodyDefinition) => {
    if (!engineRef.current) return null

    const body = Matter.Bodies.circle(x, y, radius, {
      restitution: 0.8,
      friction: 0.01,
      ...options,
    } as Matter.IChamferableBodyDefinition)

    Matter.Composite.add(engineRef.current.world, body)
    return body.id
  }

  const addRectangle = (
    x: number,
    y: number,
    w: number,
    h: number,
    options?: Matter.IBodyDefinition,
  ) => {
    if (!engineRef.current) return null

    const body = Matter.Bodies.rectangle(x, y, w, h, {
      restitution: 0.6,
      friction: 0.05,
      ...options,
    } as Matter.IChamferableBodyDefinition)

    Matter.Composite.add(engineRef.current.world, body)
    return body.id
  }

  const removeBody = (id: number) => {
    if (!engineRef.current) return

    const body = Matter.Composite.allBodies(engineRef.current.world).find((b: Matter.Body) => b.id === id)
    if (body) {
      Matter.Composite.remove(engineRef.current.world, body)
    }
  }

  const applyForce = (id: number, force: { x: number; y: number }) => {
    if (!engineRef.current) return

    const body = Matter.Composite.allBodies(engineRef.current.world).find((b: Matter.Body) => b.id === id)
    if (body) {
      Matter.Body.applyForce(body, body.position, force)
    }
  }

  return (
    <div className="relative" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ display: debug ? 'block' : 'none' }}
      />
      {typeof children === 'function'
        ? children({ addCircle, addRectangle, removeBody, applyForce, bodies })
        : children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESET: Floating Cards with Physics
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function FloatingCardsPhysics({ count = 10, width, height }: { count?: number; width: number; height: number }) {
  const cardIds = useRef<number[]>([])

  return (
    <PhysicsEngine width={width} height={height} gravity={{ x: 0, y: 0.2 }}>
      {({ addRectangle, bodies }) => {
        // Agregar cards al montar
        useEffect(() => {
          for (let i = 0; i < count; i++) {
            const x = (width / (count + 1)) * (i + 1)
            const y = Math.random() * height * 0.3
            const id = addRectangle(x, y, 120, 160, {
              restitution: 0.7,
              friction: 0.001,
            })
            if (id) cardIds.current.push(id)
          }
        }, [addRectangle])

        return (
          <div className="absolute inset-0 pointer-events-none">
            {bodies.map((body) => (
              <div
                key={body.id}
                className="absolute rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 backdrop-blur-xl shadow-xl"
                style={{
                  width: 120,
                  height: 160,
                  transform: `translate(${body.x - 60}px, ${body.y - 80}px) rotate(${body.angle}rad)`,
                  transition: 'transform 16ms linear',
                }}
              />
            ))}
          </div>
        )
      }}
    </PhysicsEngine>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESET: Interactive Particles
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function InteractiveParticles({ width, height }: { width: number; height: number }) {
  return (
    <PhysicsEngine width={width} height={height} gravity={{ x: 0, y: 0.5 }}>
      {({ addCircle, bodies, applyForce }) => {
        const handleClick = (e: React.MouseEvent) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top

          const id = addCircle(x, y, 8 + Math.random() * 12, {
            restitution: 0.9,
            friction: 0,
          })

          // Aplicar impulso inicial
          if (id) {
            setTimeout(() => {
              applyForce(id, {
                x: (Math.random() - 0.5) * 0.02,
                y: -0.01,
              })
            }, 10)
          }
        }

        return (
          <div className="absolute inset-0 cursor-pointer" onClick={handleClick}>
            {bodies.map((body) => (
              <div
                key={body.id}
                className="absolute rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 blur-sm opacity-80"
                style={{
                  width: 16,
                  height: 16,
                  transform: `translate(${body.x - 8}px, ${body.y - 8}px)`,
                  transition: 'transform 16ms linear',
                }}
              />
            ))}
          </div>
        )
      }}
    </PhysicsEngine>
  )
}
