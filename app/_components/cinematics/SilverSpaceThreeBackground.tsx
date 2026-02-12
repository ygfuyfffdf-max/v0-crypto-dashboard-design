'use client'

import { useRef, useMemo, memo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Cloud, Float, Stars, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import * as THREE from 'three'
import { SILVER_SPACE_COLORS } from './KocmocPremiumSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 SILVER SPACE 3D SCENE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function StarField({ count = 5000 }) {
  const points = useRef<THREE.Points>(null!)
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 40 + Math.random() * 60 // Radio entre 40 y 100
      const theta = 2 * Math.PI * Math.random()
      const phi = Math.acos(2 * Math.random() - 1)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z
    }
    return pos
  }, [count])

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.x -= delta * 0.01
      points.current.rotation.y -= delta * 0.015
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={SILVER_SPACE_COLORS.silverLight}
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
        />
      </Points>
    </group>
  )
}

function FloatingNebula() {
  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <Cloud
          opacity={0.15}
          speed={0.2} // Rotation speed
          width={20} // Width of the full cloud
          depth={2} // Z-dir depth
          segments={10} // Number of particles
          texture={'https://raw.githubusercontent.com/pmndrs/drei-assets/456060a26bbeb8fdf9d32ff9efd38b98419efb43/cloud.png'} // Cloud texture
          color={SILVER_SPACE_COLORS.silverDark}
          position={[0, -5, -20]}
        />
      </Float>
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
        <Cloud
          opacity={0.1}
          speed={0.15}
          width={15}
          depth={1.5}
          segments={8}
          color="#a0a0a0"
          position={[10, 5, -25]}
        />
      </Float>
    </group>
  )
}

function CinematicCamera() {
  useFrame((state) => {
    // Subtle mouse parallax
    const x = state.pointer.x
    const y = state.pointer.y
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, x * 2, 0.05)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, y * 2, 0.05)
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

interface SilverSpaceThreeBackgroundProps {
  className?: string
  intensity?: 'low' | 'high'
}

export const SilverSpaceThreeBackground = memo(function SilverSpaceThreeBackground({
  className,
  intensity = 'high',
}: SilverSpaceThreeBackgroundProps) {
  const isHighQuality = intensity === 'high'

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]} // Limit DPR for performance
      >
        <color attach="background" args={[SILVER_SPACE_COLORS.absoluteBlack]} />
        
        {/* Lights */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color={SILVER_SPACE_COLORS.silverLight} />
        <pointLight position={[-10, -10, -10]} intensity={0.2} color="#444" />

        {/* Objects */}
        <StarField count={isHighQuality ? 6000 : 2000} />
        
        {isHighQuality && (
          <>
            <FloatingNebula />
            <Sparkles 
              count={100} 
              scale={12} 
              size={2} 
              speed={0.4} 
              opacity={0.5} 
              color={SILVER_SPACE_COLORS.silverMirror}
            />
          </>
        )}

        {/* Cinematic Post-Processing */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={isHighQuality ? 0.8 : 0.4} 
            radius={0.6}
          />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        <CinematicCamera />
      </Canvas>
    </div>
  )
})
