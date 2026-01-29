/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📦 CHRONOS 2026 — WAREHOUSE 3D (ALMACÉN CRYSTAL MATRIX)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Visualización 3D interactiva del almacén/inventario del sistema CHRONOS.
 * Muestra productos como cajas 3D apilables con información de stock.
 *
 * Características:
 * - Cajas 3D con cristal semitransparente
 * - Apilamiento automático por categoría
 * - Indicadores de stock (bajo, medio, alto)
 * - Animaciones de entrada/salida de productos
 * - Búsqueda y filtrado visual
 *
 * Paleta: #8B00FF / #FFD700 / #FF1493 (⛔ CYAN PROHIBIDO)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import React, { useRef, useMemo, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Float,
  Text,
  MeshTransmissionMaterial,
  Environment,
  Sparkles,
  Html,
  RoundedBox,
  OrbitControls,
} from '@react-three/drei'
import { motion } from 'motion/react'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ProductoAlmacen {
  id: string
  nombre: string
  sku: string
  cantidad: number
  cantidadMinima: number
  categoria: string
  ubicacion: string
  precioUnitario: number
}

interface Warehouse3DProps {
  productos: ProductoAlmacen[]
  onProductClick?: (producto: ProductoAlmacen) => void
  className?: string
  height?: number
}

interface ProductBoxProps {
  producto: ProductoAlmacen
  position: [number, number, number]
  onClick?: () => void
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY COLORS (NO CYAN)
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORY_COLORS: Record<string, string> = {
  electronica: '#8B5CF6', // Purple
  ropa: '#EC4899', // Magenta
  alimentos: '#10B981', // Green
  hogar: '#F59E0B', // Amber
  deportes: '#3B82F6', // Blue
  juguetes: '#FF1493', // Deep Pink
  herramientas: '#6B7280', // Gray
  default: '#FFD700', // Gold
}

function getCategoryColor(categoria: string): string {
  const key = categoria.toLowerCase()
  return CATEGORY_COLORS[key] ?? CATEGORY_COLORS.default ?? '#FFD700'
}

// ═══════════════════════════════════════════════════════════════════════════════
// STOCK STATUS
// ═══════════════════════════════════════════════════════════════════════════════

type StockStatus = 'critical' | 'low' | 'medium' | 'high'

function getStockStatus(cantidad: number, minima: number): StockStatus {
  const ratio = cantidad / minima
  if (ratio <= 0.5) return 'critical'
  if (ratio <= 1) return 'low'
  if (ratio <= 2) return 'medium'
  return 'high'
}

const STOCK_COLORS: Record<StockStatus, string> = {
  critical: '#EF4444', // Red
  low: '#F59E0B', // Amber
  medium: '#10B981', // Green
  high: '#3B82F6', // Blue
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT BOX COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function ProductBox({ producto, position, onClick }: ProductBoxProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  const categoryColor = getCategoryColor(producto.categoria)
  const stockStatus = getStockStatus(producto.cantidad, producto.cantidadMinima)
  const stockColor = STOCK_COLORS[stockStatus]

  // Box size based on quantity (subtle scaling)
  const scale = useMemo(() => {
    const baseScale = 0.8
    const quantityBonus = Math.min(producto.cantidad / 100, 0.3)
    return baseScale + quantityBonus
  }, [producto.cantidad])

  // Animation
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle float animation
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.03

      // Rotation on hover
      if (hovered) {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          Math.sin(state.clock.elapsedTime * 2) * 0.1,
          0.1,
        )
      } else {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.1)
      }
    }
  })

  return (
    <Float speed={1} rotationIntensity={0.05} floatIntensity={0.1}>
      <group
        ref={groupRef}
        position={position}
        scale={scale}
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Main Box */}
        <RoundedBox args={[1, 1, 1]} radius={0.1} smoothness={4} castShadow receiveShadow>
          <MeshTransmissionMaterial
            color={categoryColor}
            thickness={0.3}
            roughness={0.1}
            transmission={hovered ? 0.5 : 0.3}
            ior={1.4}
            chromaticAberration={0.02}
            backside={false}
            resolution={256}
          />
        </RoundedBox>

        {/* Stock Indicator Strip */}
        <mesh position={[0, 0.52, 0]}>
          <boxGeometry args={[0.8, 0.05, 0.8]} />
          <meshStandardMaterial
            color={stockColor}
            emissive={stockColor}
            emissiveIntensity={stockStatus === 'critical' ? 0.8 : 0.3}
          />
        </mesh>

        {/* SKU Label */}
        <Text
          position={[0, 0, 0.52]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {producto.sku}
        </Text>

        {/* Quantity Badge */}
        <mesh position={[0.45, 0.45, 0.45]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#1a1a2e" emissive={stockColor} emissiveIntensity={0.3} />
        </mesh>
        <Text
          position={[0.45, 0.45, 0.55]}
          fontSize={0.08}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {producto.cantidad}
        </Text>

        {/* Critical Stock Warning Sparkles */}
        {stockStatus === 'critical' && (
          <Sparkles count={10} scale={1.5} size={3} speed={2} color="#EF4444" />
        )}

        {/* High Stock Celebration Sparkles */}
        {stockStatus === 'high' && (
          <Sparkles count={15} scale={1.5} size={2} speed={0.5} color="#FFD700" />
        )}

        {/* Hover Info Panel */}
        {hovered && (
          <Html position={[0.8, 0.5, 0]} center>
            <div className="pointer-events-none min-w-[220px] rounded-xl border border-white/20 bg-black/80 px-4 py-3 backdrop-blur-xl">
              <div className="mb-2 font-bold text-white">📦 {producto.nombre}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">SKU:</span>
                  <span className="text-purple-400">{producto.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cantidad:</span>
                  <span style={{ color: stockColor }}>{producto.cantidad}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mínimo:</span>
                  <span className="text-gray-300">{producto.cantidadMinima}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ubicación:</span>
                  <span className="text-blue-400">{producto.ubicacion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Precio:</span>
                  <span className="text-amber-400">
                    ${producto.precioUnitario.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2">
                  <span className="text-gray-400">Valor Total:</span>
                  <span className="font-bold text-emerald-400">
                    ${(producto.cantidad * producto.precioUnitario).toLocaleString()}
                  </span>
                </div>
              </div>
              <div
                className="mt-2 rounded px-2 py-1 text-center text-xs"
                style={{ backgroundColor: stockColor + '20', color: stockColor }}
              >
                {stockStatus === 'critical' && '⚠️ Stock Crítico'}
                {stockStatus === 'low' && '⚡ Stock Bajo'}
                {stockStatus === 'medium' && '✓ Stock Normal'}
                {stockStatus === 'high' && '🎉 Stock Alto'}
              </div>
            </div>
          </Html>
        )}
      </group>
    </Float>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// WAREHOUSE SHELVES
// ═══════════════════════════════════════════════════════════════════════════════

function WarehouseShelves() {
  return (
    <group>
      {/* Floor Grid */}
      <gridHelper args={[20, 20, '#1a1a2e', '#2a2a4e']} position={[0, -0.01, 0]} />

      {/* Shelving Units */}
      {[-6, 0, 6].map((x, i) => (
        <group key={i} position={[x, 0, -3]}>
          {/* Vertical Posts */}
          {[-2, 2].map((z, j) => (
            <mesh key={j} position={[0, 2, z]}>
              <boxGeometry args={[0.1, 4, 0.1]} />
              <meshStandardMaterial color="#2a2a4e" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}

          {/* Horizontal Shelves */}
          {[0.5, 2, 3.5].map((y, k) => (
            <mesh key={k} position={[0, y, 0]}>
              <boxGeometry args={[0.15, 0.05, 4.2]} />
              <meshStandardMaterial color="#3a3a5e" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT GRID
// ═══════════════════════════════════════════════════════════════════════════════

function ProductGrid({
  productos,
  onProductClick,
}: {
  productos: ProductoAlmacen[]
  onProductClick?: (producto: ProductoAlmacen) => void
}) {
  // Calculate grid positions
  const positions = useMemo(() => {
    const cols = 5
    const spacing = 1.5

    return productos.map((_, index) => {
      const x = ((index % cols) - (cols - 1) / 2) * spacing
      const y = Math.floor(index / cols) * 1.2 + 0.5
      const z = 0
      return [x, y, z] as [number, number, number]
    })
  }, [productos])

  return (
    <>
      {/* Warehouse Structure */}
      <WarehouseShelves />

      {/* Products */}
      {productos.map((producto, index) => {
        const pos = positions[index]
        if (!pos) return null
        return (
          <ProductBox
            key={producto.id}
            producto={producto}
            position={pos}
            onClick={() => onProductClick?.(producto)}
          />
        )
      })}

      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 8, 5]} intensity={0.8} color="#8B5CF6" />
      <pointLight position={[-5, 8, -5]} intensity={0.5} color="#FFD700" />
      <spotLight
        position={[0, 12, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={1.2}
        color="#FFFFFF"
        castShadow
      />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#0a0a1a" roughness={0.9} metalness={0.1} />
      </mesh>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function Warehouse3D({
  productos,
  onProductClick,
  className = '',
  height = 500,
}: Warehouse3DProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<StockStatus | 'all'>('all')

  // Filter products
  const filteredProducts = useMemo(() => {
    return productos.filter((p) => {
      const matchesSearch =
        searchTerm === '' ||
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter =
        filterStatus === 'all' || getStockStatus(p.cantidad, p.cantidadMinima) === filterStatus

      return matchesSearch && matchesFilter
    })
  }, [productos, searchTerm, filterStatus])

  // Handle empty state
  if (!productos || productos.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-900/20 to-black ${className}`}
        style={{ height }}
      >
        <div className="text-center text-white/60">
          <div className="mb-4 text-6xl">📦</div>
          <div>No hay productos en el almacén</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Search & Filter Controls */}
      <div className="absolute top-4 right-4 left-4 z-10 flex gap-3">
        <input
          type="text"
          placeholder="🔍 Buscar producto o SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-xl border border-white/20 bg-black/60 px-4 py-2 text-white placeholder-white/40 backdrop-blur-xl focus:border-purple-500/50 focus:outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as StockStatus | 'all')}
          className="rounded-xl border border-white/20 bg-black/60 px-4 py-2 text-white backdrop-blur-xl focus:border-purple-500/50 focus:outline-none"
        >
          <option value="all">Todos</option>
          <option value="critical">⚠️ Crítico</option>
          <option value="low">⚡ Bajo</option>
          <option value="medium">✓ Normal</option>
          <option value="high">🎉 Alto</option>
        </select>
      </div>

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 5, 12], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#050510']} />
        <fog attach="fog" args={['#050510', 10, 30]} />

        <ProductGrid productos={filteredProducts} onProductClick={onProductClick} />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={25}
          maxPolarAngle={Math.PI / 2.2}
        />

        <Environment preset="warehouse" />
      </Canvas>

      {/* Stats Panel */}
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl bg-black/60 p-4 backdrop-blur-xl">
        <div className="mb-2 font-bold text-white">📊 Resumen</div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-8">
            <span className="text-gray-400">Total Productos:</span>
            <span className="text-white">{filteredProducts.length}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-gray-400">Unidades:</span>
            <span className="text-purple-400">
              {filteredProducts.reduce((sum, p) => sum + p.cantidad, 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-gray-400">Valor Total:</span>
            <span className="font-bold text-emerald-400">
              $
              {filteredProducts
                .reduce((sum, p) => sum + p.cantidad * p.precioUnitario, 0)
                .toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="pointer-events-none absolute right-4 bottom-4 rounded-xl bg-black/60 p-4 backdrop-blur-xl">
        <div className="mb-2 text-xs text-white/60">Estado de Stock:</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: STOCK_COLORS.critical }} />
            <span className="text-xs text-white/80">Crítico (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: STOCK_COLORS.low }} />
            <span className="text-xs text-white/80">Bajo (50-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: STOCK_COLORS.medium }} />
            <span className="text-xs text-white/80">Normal (100-200%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: STOCK_COLORS.high }} />
            <span className="text-xs text-white/80">Alto (&gt;200%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Warehouse3D
