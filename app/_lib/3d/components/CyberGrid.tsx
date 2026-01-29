'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌐 CYBER GRID - Grid Futurista con Efectos de Onda
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

import type { CyberGridProps } from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 SHADER
// ═══════════════════════════════════════════════════════════════════════════════

const cyberGridVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWaveAmplitude;
  uniform float uWaveFrequency;

  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;

    vec3 pos = position;

    // Wave effect
    float wave1 = sin(pos.x * uWaveFrequency + uTime) * uWaveAmplitude;
    float wave2 = sin(pos.y * uWaveFrequency * 0.8 + uTime * 0.8) * uWaveAmplitude * 0.5;
    float wave3 = sin((pos.x + pos.y) * uWaveFrequency * 0.5 + uTime * 1.2) * uWaveAmplitude * 0.3;

    pos.z = wave1 + wave2 + wave3;
    vElevation = pos.z;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const cyberGridFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uSecondaryColor;
  uniform float uFadeDistance;
  uniform vec2 uDivisions;

  varying vec2 vUv;
  varying float vElevation;

  void main() {
    // Grid lines
    vec2 grid = abs(fract(vUv * uDivisions - 0.5) - 0.5) / fwidth(vUv * uDivisions);
    float line = min(grid.x, grid.y);
    float gridLine = 1.0 - min(line, 1.0);

    // Distance fade
    float dist = length(vUv - 0.5) * 2.0;
    float fade = 1.0 - smoothstep(0.0, uFadeDistance, dist);

    // Color based on elevation
    vec3 color = mix(uColor, uSecondaryColor, vElevation * 2.0 + 0.5);

    // Pulse effect
    float pulse = sin(uTime * 2.0 - dist * 5.0) * 0.2 + 0.8;

    // Scanline effect
    float scanline = sin(vUv.y * 200.0 + uTime * 5.0) * 0.1 + 0.9;

    float alpha = gridLine * fade * pulse * scanline;

    // Glow at intersections
    vec2 gridCenter = abs(fract(vUv * uDivisions) - 0.5);
    float intersection = 1.0 - smoothstep(0.0, 0.1, length(gridCenter));
    color += uSecondaryColor * intersection * 0.5;

    gl_FragColor = vec4(color, alpha * 0.8);
  }
`

// ═══════════════════════════════════════════════════════════════════════════════
// 🌐 CYBER GRID COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function CyberGrid({
  size = [20, 20],
  divisions = [40, 40],
  color = '#00ffff',
  secondaryColor = '#ff00ff',
  fadeDistance = 1.0,
  infiniteGrid = false,
  animated = true,
  waveAmplitude = 0.3,
  waveFrequency = 0.5,
}: CyberGridProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uSecondaryColor: { value: new THREE.Color(secondaryColor) },
      uFadeDistance: { value: fadeDistance },
      uDivisions: { value: new THREE.Vector2(divisions[0], divisions[1]) },
      uWaveAmplitude: { value: waveAmplitude },
      uWaveFrequency: { value: waveFrequency },
    }),
    [color, secondaryColor, fadeDistance, divisions, waveAmplitude, waveFrequency],
  )

  // Animation
  useFrame((state) => {
    if (!animated) return
    uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[size[0], size[1], divisions[0], divisions[1]]} />
      <shaderMaterial
        vertexShader={cyberGridVertexShader}
        fragmentShader={cyberGridFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 INFINITE GRID (Alternative)
// ═══════════════════════════════════════════════════════════════════════════════

const infiniteGridVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const infiniteGridFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uSecondaryColor;
  uniform float uGridSize;
  uniform float uFadeDistance;

  varying vec3 vWorldPosition;

  float getGrid(vec2 pos, float size) {
    vec2 grid = abs(fract(pos / size - 0.5) - 0.5) / fwidth(pos / size);
    return 1.0 - min(min(grid.x, grid.y), 1.0);
  }

  void main() {
    float dist = length(vWorldPosition.xz);

    // Large grid
    float grid1 = getGrid(vWorldPosition.xz, uGridSize);

    // Small grid
    float grid2 = getGrid(vWorldPosition.xz, uGridSize * 0.1);

    // Combine
    float grid = max(grid1 * 0.8, grid2 * 0.4);

    // Fade
    float fade = 1.0 - smoothstep(0.0, uFadeDistance, dist);

    // Pulse
    float pulse = sin(uTime - dist * 0.1) * 0.2 + 0.8;

    // Color
    vec3 color = mix(uColor, uSecondaryColor, sin(dist * 0.05 + uTime) * 0.5 + 0.5);

    float alpha = grid * fade * pulse;

    if(alpha < 0.01) discard;

    gl_FragColor = vec4(color, alpha);
  }
`

export function InfiniteCyberGrid({
  color = '#00ffff',
  secondaryColor = '#8844ff',
  gridSize = 2,
  fadeDistance = 50,
  animated = true,
}: {
  color?: string
  secondaryColor?: string
  gridSize?: number
  fadeDistance?: number
  animated?: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uSecondaryColor: { value: new THREE.Color(secondaryColor) },
      uGridSize: { value: gridSize },
      uFadeDistance: { value: fadeDistance },
    }),
    [color, secondaryColor, gridSize, fadeDistance],
  )

  useFrame((state) => {
    if (!animated) return
    uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[200, 200, 1, 1]} />
      <shaderMaterial
        vertexShader={infiniteGridVertexShader}
        fragmentShader={infiniteGridFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

export default CyberGrid
