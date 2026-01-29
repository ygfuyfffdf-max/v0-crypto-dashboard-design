'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎴 PREMIUM 3D CARD - Card con Efecto 3D Holográfico Interactivo
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { animated, useSpring } from '@react-spring/three'
import { Float, MeshTransmissionMaterial, RoundedBox, Text } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import React, { useRef, useState } from 'react'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Premium3DCardProps {
  title?: string
  value?: string | number
  subtitle?: string
  icon?: React.ReactNode
  gradient?: [string, string]
  glowColor?: string
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  animated?: boolean
  interactive?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 CARD 3D MESH
// ═══════════════════════════════════════════════════════════════════════════════

interface Card3DMeshProps {
  title: string
  value: string
  subtitle: string
  gradient: [string, string]
  glowColor: string
  interactive: boolean
  animated: boolean
}

function Card3DMesh({
  title,
  value,
  subtitle,
  gradient,
  glowColor,
  interactive,
  animated: shouldAnimate,
}: Card3DMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { pointer } = useThree()

  // Spring animation for hover
  const { scale, rotationX, rotationY } = useSpring({
    scale: hovered ? 1.05 : 1,
    rotationX: interactive ? pointer.y * 0.2 : 0,
    rotationY: interactive ? pointer.x * 0.2 : 0,
    config: { mass: 1, tension: 170, friction: 26 },
  })

  // Continuous animation
  useFrame((state) => {
    if (!meshRef.current) return

    if (shouldAnimate && !hovered) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
    }
  })

  const color1 = new THREE.Color(gradient[0])
  const color2 = new THREE.Color(gradient[1])

  return (
    <Float
      speed={shouldAnimate ? 2 : 0}
      rotationIntensity={shouldAnimate ? 0.3 : 0}
      floatIntensity={shouldAnimate ? 0.5 : 0}
    >
      <animated.mesh
        ref={meshRef}
        scale={scale}
        rotation-x={rotationX}
        rotation-y={rotationY}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Card Body */}
        <RoundedBox args={[3, 2, 0.1]} radius={0.1} smoothness={4}>
          <MeshTransmissionMaterial
            backside
            samples={16}
            thickness={0.2}
            chromaticAberration={0.05}
            anisotropy={0.1}
            distortion={0.1}
            distortionScale={0.1}
            temporalDistortion={0.2}
            iridescence={1}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            color={color1}
            transparent
            opacity={0.8}
          />
        </RoundedBox>

        {/* Glass overlay */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[2.9, 1.9]} />
          <meshPhysicalMaterial
            color={color2}
            transparent
            opacity={0.2}
            roughness={0.1}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Title Text */}
        <Text
          position={[-1.2, 0.6, 0.08]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="left"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {title}
        </Text>

        {/* Value Text */}
        <Text
          position={[-1.2, 0, 0.08]}
          fontSize={0.4}
          color="#ffffff"
          anchorX="left"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {value}
        </Text>

        {/* Subtitle */}
        <Text
          position={[-1.2, -0.5, 0.08]}
          fontSize={0.12}
          color="rgba(255,255,255,0.7)"
          anchorX="left"
          anchorY="middle"
          font="/fonts/Inter-Regular.woff"
        >
          {subtitle}
        </Text>

        {/* Glow rim */}
        <mesh position={[0, 0, -0.05]}>
          <RoundedBox args={[3.1, 2.1, 0.01]} radius={0.1} smoothness={4}>
            <meshBasicMaterial color={glowColor} transparent opacity={hovered ? 0.5 : 0.2} />
          </RoundedBox>
        </mesh>

        {/* Particles on hover */}
        {hovered && <CardParticles color={glowColor} />}
      </animated.mesh>
    </Float>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ✨ CARD PARTICLES
// ═══════════════════════════════════════════════════════════════════════════════

function CardParticles({ color }: { color: string }) {
  const particlesRef = useRef<THREE.Points>(null)
  const count = 50

  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2
      pos[i * 3 + 2] = Math.random() * 0.5
    }
    return pos
  }, [])

  useFrame(() => {
    const posAttr = particlesRef.current?.geometry?.attributes?.position
    if (!posAttr?.array) return
    const arr = posAttr.array
    for (let i = 0; i < count; i++) {
      const idx = i * 3 + 2
      const current = arr[idx] ?? 0
      arr[idx] = current + 0.01
      if (arr[idx]! > 0.5) {
        arr[idx] = 0
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={color}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎴 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function Premium3DCard({
  title = 'Premium Card',
  value = '$0.00',
  subtitle = 'Description',
  gradient = ['#6600ff', '#00ffff'],
  glowColor = '#00ffff',
  className = '',
  style,
  onClick,
  animated = true,
  interactive = true,
}: Premium3DCardProps) {
  return (
    <div
      className={`relative aspect-[3/2] w-full cursor-pointer overflow-hidden rounded-2xl ${className}`}
      style={style}
      onClick={onClick}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, 0, 5]} color={gradient[0]} intensity={0.5} />
        <pointLight position={[5, 0, 5]} color={gradient[1]} intensity={0.5} />

        <Card3DMesh
          title={title}
          value={String(value)}
          subtitle={subtitle}
          gradient={gradient}
          glowColor={glowColor}
          interactive={interactive}
          animated={animated}
        />

        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.8} luminanceSmoothing={0.3} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

export default Premium3DCard
