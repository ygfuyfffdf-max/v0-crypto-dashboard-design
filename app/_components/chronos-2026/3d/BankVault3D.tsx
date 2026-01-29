/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🏦 CHRONOS 2026 — BANK VAULT 3D (CÁMARAS ACORAZADAS)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Visualización 3D de las bóvedas/bancos del sistema CHRONOS.
 * Cada bóveda representa un banco con su capital, transacciones y estado.
 *
 * Características:
 * - 7 bóvedas 3D interactivas (una por banco)
 * - Animación de apertura/cierre según actividad
 * - Brillo proporcional al capital
 * - Partículas de "dinero" fluyendo
 * - Tooltips con información en hover
 *
 * Paleta: #8B00FF / #FFD700 / #FF1493 (⛔ CYAN PROHIBIDO)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import {
  Environment,
  Float,
  Html,
  MeshTransmissionMaterial,
  Sparkles,
  Text,
} from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useCallback, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type BancoId =
  | 'boveda_monte'
  | 'boveda_usa'
  | 'profit'
  | 'leftie'
  | 'azteca'
  | 'flete_sur'
  | 'utilidades'

interface BancoData {
  id: BancoId
  nombre: string
  capitalActual: number
  historicoIngresos: number
  historicoGastos: number
  color: string
  emoji: string
}

interface BankVault3DProps {
  bancos: BancoData[]
  onVaultClick?: (banco: BancoData) => void
  className?: string
  height?: number
}

interface SingleVaultProps {
  banco: BancoData
  position: [number, number, number]
  maxCapital: number
  onClick?: () => void
  isSelected?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// VAULT COLORS (NO CYAN)
// ═══════════════════════════════════════════════════════════════════════════════

const VAULT_COLORS: Record<BancoId, string> = {
  boveda_monte: '#8B5CF6', // Purple
  boveda_usa: '#3B82F6', // Blue
  profit: '#10B981', // Green
  leftie: '#F59E0B', // Amber
  azteca: '#EF4444', // Red
  flete_sur: '#EC4899', // Magenta (NOT CYAN)
  utilidades: '#FFD700', // Gold
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAPITAL INDICATOR LIGHT — Componente animado para evitar hydration mismatch
// ═══════════════════════════════════════════════════════════════════════════════

function CapitalIndicatorLight({ capitalRatio }: { capitalRatio: number }) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const lightColor = capitalRatio > 0.5 ? '#10B981' : capitalRatio > 0.2 ? '#F59E0B' : '#EF4444'

  // Usar useFrame para animación segura sin hydration mismatch
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2
    }
  })

  return (
    <mesh position={[0, 1.1, 0.5]}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        ref={materialRef}
        color={lightColor}
        emissive={lightColor}
        emissiveIntensity={0.8}
      />
    </mesh>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLE VAULT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function SingleVault({ banco, position, maxCapital, onClick, isSelected }: SingleVaultProps) {
  const groupRef = useRef<THREE.Group>(null)
  const doorRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Calculate vault properties
  const capitalRatio = maxCapital > 0 ? Math.min(banco.capitalActual / maxCapital, 1) : 0
  const color = new THREE.Color(VAULT_COLORS[banco.id] || banco.color)

  // Animation
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle breathing animation based on capital
      const breathing = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.02
      groupRef.current.scale.setScalar(1 + breathing * capitalRatio)

      // Rotation on hover
      if (hovered) {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          Math.sin(state.clock.elapsedTime) * 0.1,
          0.1,
        )
      }
    }

    // Door animation
    if (doorRef.current) {
      const targetRotation = hovered || isSelected ? -Math.PI / 3 : 0
      doorRef.current.rotation.y = THREE.MathUtils.lerp(
        doorRef.current.rotation.y,
        targetRotation,
        0.1,
      )
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group
        ref={groupRef}
        position={position}
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Vault Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.8, 1.2]} />
          <MeshTransmissionMaterial
            color={color}
            thickness={0.5}
            roughness={0.1}
            transmission={0.3}
            ior={1.5}
            chromaticAberration={0.03}
            backside={false}
            resolution={256}
          />
        </mesh>

        {/* Vault Door Frame */}
        <mesh position={[0, 0, 0.61]}>
          <boxGeometry args={[1.2, 1.5, 0.05]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Vault Door (Animated) */}
        <group position={[-0.55, 0, 0.65]}>
          <mesh ref={doorRef} position={[0.5, 0, 0]}>
            <boxGeometry args={[1.0, 1.3, 0.1]} />
            <meshStandardMaterial
              color={hovered ? '#FFD700' : '#2a2a4e'}
              metalness={0.8}
              roughness={0.3}
              emissive={color}
              emissiveIntensity={hovered ? 0.3 : 0.1}
            />
          </mesh>

          {/* Door Handle */}
          <mesh position={[0.9, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.05, 32]} />
            <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} />
          </mesh>

          {/* Handle Spokes */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <mesh
              key={i}
              position={[
                0.9 + Math.cos((angle * Math.PI) / 180) * 0.1,
                Math.sin((angle * Math.PI) / 180) * 0.1,
                0.08,
              ]}
            >
              <boxGeometry args={[0.02, 0.12, 0.02]} />
              <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} />
            </mesh>
          ))}
        </group>

        {/* Capital Indicator Light - Animada con useFrame para evitar hydration mismatch */}
        <CapitalIndicatorLight capitalRatio={capitalRatio} />

        {/* Sparkles for high capital */}
        {capitalRatio > 0.7 && (
          <Sparkles count={20} scale={[2, 2, 2]} size={2} speed={0.5} color="#FFD700" />
        )}

        {/* Bank Name Label */}
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {banco.emoji} {banco.nombre}
        </Text>

        {/* Capital Text */}
        <Text
          position={[0, -1.4, 0]}
          fontSize={0.12}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          ${banco.capitalActual.toLocaleString()}
        </Text>

        {/* Hover Info Panel */}
        {hovered && (
          <Html position={[1.2, 0.5, 0]} center>
            <div className="pointer-events-none min-w-[200px] rounded-xl border border-white/20 bg-black/80 px-4 py-3 backdrop-blur-xl">
              <div className="mb-2 font-bold text-white">
                {banco.emoji} {banco.nombre}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Capital:</span>
                  <span className="text-emerald-400">${banco.capitalActual.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ingresos:</span>
                  <span className="text-blue-400">${banco.historicoIngresos.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gastos:</span>
                  <span className="text-pink-400">${banco.historicoGastos.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Html>
        )}
      </group>
    </Float>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MONEY PARTICLES
// ═══════════════════════════════════════════════════════════════════════════════

function MoneyParticles({ count = 50 }: { count?: number }) {
  const particlesRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return pos
  }, [count])

  useFrame((state) => {
    if (!particlesRef.current) return
    const positionAttr = particlesRef.current.geometry.attributes.position
    if (!positionAttr) return

    const posArray = positionAttr.array as Float32Array
    for (let i = 0; i < count; i++) {
      const yIdx = i * 3 + 1
      const xIdx = i * 3

      // Float upward
      posArray[yIdx] = (posArray[yIdx] ?? 0) + 0.01

      // Reset when too high
      if ((posArray[yIdx] ?? 0) > 4) {
        posArray[yIdx] = -4
      }

      // Slight horizontal drift
      posArray[xIdx] = (posArray[xIdx] ?? 0) + Math.sin(state.clock.elapsedTime + i) * 0.002
    }
    positionAttr.needsUpdate = true
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#FFD700" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// VAULT GRID
// ═══════════════════════════════════════════════════════════════════════════════

function VaultGrid({
  bancos,
  onVaultClick,
}: {
  bancos: BancoData[]
  onVaultClick?: (banco: BancoData) => void
}) {
  const [selectedId, setSelectedId] = useState<BancoId | null>(null)

  // Calculate max capital for relative sizing
  const maxCapital = useMemo(() => {
    return Math.max(...bancos.map((b) => b.capitalActual), 1)
  }, [bancos])

  // Position vaults in a curved arrangement
  const getPosition = useCallback((index: number, total: number): [number, number, number] => {
    const angle = (index - (total - 1) / 2) * 0.6
    const radius = 5
    return [Math.sin(angle) * radius, 0, -Math.cos(angle) * radius + 2]
  }, [])

  const handleClick = useCallback(
    (banco: BancoData) => {
      setSelectedId((prev) => (prev === banco.id ? null : banco.id))
      onVaultClick?.(banco)
    },
    [onVaultClick],
  )

  return (
    <>
      {/* Vaults */}
      {bancos.map((banco, index) => (
        <SingleVault
          key={banco.id}
          banco={banco}
          position={getPosition(index, bancos.length)}
          maxCapital={maxCapital}
          onClick={() => handleClick(banco)}
          isSelected={selectedId === banco.id}
        />
      ))}

      {/* Money Particles */}
      <MoneyParticles count={80} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#0a0a1a" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#8B5CF6" />
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#FFD700" />
      <spotLight
        position={[0, 8, 0]}
        angle={0.6}
        penumbra={0.5}
        intensity={1}
        color="#FFFFFF"
        castShadow
      />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function BankVault3D({
  bancos,
  onVaultClick,
  className = '',
  height = 500,
}: BankVault3DProps) {
  // Handle empty state
  if (!bancos || bancos.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-900/20 to-black ${className}`}
        style={{ height }}
      >
        <div className="text-center text-white/60">
          <div className="mb-4 text-6xl">🏦</div>
          <div>No hay bancos configurados</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <Canvas
        shadows
        camera={{ position: [0, 2, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#050510']} />
        <fog attach="fog" args={['#050510', 8, 25]} />

        <VaultGrid bancos={bancos} onVaultClick={onVaultClick} />

        <Environment preset="city" />
      </Canvas>

      {/* Overlay Title */}
      <div className="pointer-events-none absolute top-4 left-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
          <span className="text-3xl">🏦</span>
          Cámaras Acorazadas
        </h2>
        <p className="mt-1 text-sm text-white/60">Click en una bóveda para más detalles</p>
      </div>

      {/* Legend */}
      <div className="pointer-events-none absolute right-4 bottom-4 rounded-xl bg-black/60 p-4 backdrop-blur-xl">
        <div className="mb-2 text-xs text-white/60">Estado del indicador:</div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-white/80">&gt;50%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-xs text-white/80">20-50%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-xs text-white/80">&lt;20%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BankVault3D
