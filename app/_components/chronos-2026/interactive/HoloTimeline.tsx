/**
 * 🌌📊 HOLO TIMELINE — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * Timeline 3D holográfico con orbs flotantes por evento
 * Efecto: Operaciones como orbs holográficos flotantes, tamaño = monto
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Sphere,
  Text,
  Float,
  MeshDistortMaterial,
  Environment,
  OrbitControls,
} from '@react-three/drei'
import { motion } from 'motion/react'
import * as THREE from 'three'

interface TimelineEvent {
  id: string
  type: 'venta' | 'ingreso' | 'gasto' | 'abono' | 'orden' | 'transferencia'
  title: string
  value: number
  timestamp: Date | string
  description?: string
  status?: 'success' | 'pending' | 'failed'
}

interface HoloTimelineProps {
  events: TimelineEvent[]
  maxEvents?: number
  colorScheme?: 'cosmic' | 'emerald' | 'sunset'
  onEventClick?: (event: TimelineEvent) => void
  className?: string
}

const COLOR_SCHEMES = {
  cosmic: {
    primary: '#8B5CF6',
    secondary: '#FFD700',
    accent: '#EC4899',
    glow: '#A78BFA',
  },
  emerald: {
    primary: '#10B981',
    secondary: '#06B6D4',
    accent: '#22D3EE',
    glow: '#34D399',
  },
  sunset: {
    primary: '#F59E0B',
    secondary: '#EF4444',
    accent: '#F97316',
    glow: '#FBBF24',
  },
}

const EVENT_COLORS = {
  venta: '#10B981', // Emerald - Sales
  ingreso: '#22C55E', // Green - Income
  gasto: '#EF4444', // Red - Expense
  abono: '#3B82F6', // Blue - Payment
  orden: '#8B5CF6', // Violet - Order
  transferencia: '#F59E0B', // Amber - Transfer
}

// Individual Event Orb component
function EventOrb({
  event,
  position,
  maxValue,
  onClick,
  isHovered,
  onHover,
}: {
  event: TimelineEvent
  position: [number, number, number]
  maxValue: number
  onClick?: () => void
  isHovered: boolean
  onHover: (hover: boolean) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  // Scale based on value (min 0.3, max 1.5)
  const scale = 0.3 + (event.value / maxValue) * 1.2
  const color = EVENT_COLORS[event.type]

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1

      // Rotation
      meshRef.current.rotation.y += 0.005
    }

    if (glowRef.current) {
      // Pulse glow
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      glowRef.current.scale.setScalar(scale * pulse * 1.5)
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        {/* Glow sphere */}
        <Sphere ref={glowRef} args={[scale * 1.3, 16, 16]}>
          <meshBasicMaterial color={color} transparent opacity={isHovered ? 0.4 : 0.2} />
        </Sphere>

        {/* Main orb */}
        <Sphere
          ref={meshRef}
          args={[scale, 32, 32]}
          onClick={onClick}
          onPointerEnter={() => onHover(true)}
          onPointerLeave={() => onHover(false)}
        >
          <MeshDistortMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isHovered ? 0.8 : 0.4}
            roughness={0.2}
            metalness={0.8}
            distort={0.3}
            speed={2}
          />
        </Sphere>

        {/* Value text floating above */}
        {isHovered && (
          <Text
            position={[0, scale + 0.5, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="bottom"
          >
            ${event.value.toLocaleString()}
          </Text>
        )}

        {/* Connection line to timeline */}
        <mesh position={[0, -scale - 0.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      </group>
    </Float>
  )
}

// Timeline base line
function TimelineLine({ length }: { length: number }) {
  return (
    <mesh position={[length / 2 - 1, -2, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.03, 0.03, length, 8]} />
      <meshBasicMaterial color="#8B5CF6" transparent opacity={0.6} />
    </mesh>
  )
}

// 3D Scene
function TimelineScene({
  events,
  maxValue,
  colorScheme,
  onEventClick,
}: {
  events: TimelineEvent[]
  maxValue: number
  colorScheme: keyof typeof COLOR_SCHEMES
  onEventClick?: (event: TimelineEvent) => void
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const colors = COLOR_SCHEMES[colorScheme]

  // Position events along X axis
  const spacing = 3

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color={colors.primary} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={colors.secondary} />

      <Environment preset="night" />

      {/* Timeline base */}
      <TimelineLine length={events.length * spacing + 2} />

      {/* Event orbs */}
      {events.map((event, index) => (
        <EventOrb
          key={event.id}
          event={event}
          position={[index * spacing, 0, 0]}
          maxValue={maxValue}
          onClick={() => onEventClick?.(event)}
          isHovered={hoveredId === event.id}
          onHover={(hover) => setHoveredId(hover ? event.id : null)}
        />
      ))}

      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
        target={[(events.length * spacing) / 2 - spacing, 0, 0]}
      />
    </>
  )
}

export function HoloTimeline({
  events,
  maxEvents = 10,
  colorScheme = 'cosmic',
  onEventClick,
  className = '',
}: HoloTimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)

  // Process events
  const processedEvents = useMemo(() => {
    return events
      .slice(0, maxEvents)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [events, maxEvents])

  const maxValue = useMemo(() => {
    return Math.max(...processedEvents.map((e) => e.value), 1)
  }, [processedEvents])

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event)
    onEventClick?.(event)
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={`relative ${className}`}>
      {/* 3D Canvas */}
      <div className="h-[400px] w-full overflow-hidden rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl">
        <Canvas camera={{ position: [5, 3, 10], fov: 50 }} gl={{ antialias: true, alpha: true }}>
          <TimelineScene
            events={processedEvents}
            maxValue={maxValue}
            colorScheme={colorScheme}
            onEventClick={handleEventClick}
          />
        </Canvas>
      </div>

      {/* Event Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {Object.entries(EVENT_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
            />
            <span className="text-xs text-white/60 capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Selected Event Details */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded-full"
                style={{
                  backgroundColor: EVENT_COLORS[selectedEvent.type],
                  boxShadow: `0 0 15px ${EVENT_COLORS[selectedEvent.type]}`,
                }}
              />
              <div>
                <h4 className="font-semibold text-white">{selectedEvent.title}</h4>
                <p className="text-xs text-white/50">{formatDate(selectedEvent.timestamp)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                ${selectedEvent.value.toLocaleString()}
              </p>
              <span
                className={`rounded-full px-2 py-1 text-xs ${selectedEvent.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : ''} ${selectedEvent.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : ''} ${selectedEvent.status === 'failed' ? 'bg-red-500/20 text-red-400' : ''} `}
              >
                {selectedEvent.status || 'success'}
              </span>
            </div>
          </div>
          {selectedEvent.description && (
            <p className="mt-2 text-sm text-white/60">{selectedEvent.description}</p>
          )}
        </motion.div>
      )}
    </div>
  )
}

// Simplified 2D version for fallback/performance
export function HoloTimeline2D({
  events,
  maxEvents = 10,
  onEventClick,
  className = '',
}: HoloTimelineProps) {
  const processedEvents = useMemo(() => {
    return events
      .slice(0, maxEvents)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [events, maxEvents])

  const maxValue = useMemo(() => {
    return Math.max(...processedEvents.map((e) => e.value), 1)
  }, [processedEvents])

  return (
    <div className={`relative ${className}`}>
      <div className="flex h-48 items-end gap-2 px-4">
        {/* Timeline line */}
        <div className="absolute right-0 bottom-4 left-0 h-0.5 bg-gradient-to-r from-violet-500 via-amber-500 to-violet-500" />

        {processedEvents.map((event, index) => {
          const height = 20 + (event.value / maxValue) * 100
          const color = EVENT_COLORS[event.type]

          return (
            <motion.div
              key={event.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onEventClick?.(event)}
              className="group relative flex-1 cursor-pointer"
            >
              {/* Orb */}
              <motion.div
                className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full"
                whileHover={{ scale: 1.3 }}
                style={{
                  width: 16 + (event.value / maxValue) * 20,
                  height: 16 + (event.value / maxValue) * 20,
                  backgroundColor: color,
                  boxShadow: `0 0 20px ${color}`,
                }}
              />

              {/* Stem */}
              <div
                className="mx-auto w-0.5"
                style={{
                  height: '100%',
                  backgroundColor: color,
                  opacity: 0.5,
                }}
              />

              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-12 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded-xl border border-white/10 bg-black/90 p-3 text-center whitespace-nowrap backdrop-blur-xl">
                  <p className="font-bold text-white">${event.value.toLocaleString()}</p>
                  <p className="text-xs text-white/50">{event.title}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default HoloTimeline
