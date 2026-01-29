'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔮 HOLOGRAPHIC DISPLAY - Display Holográfico con Efectos Futuristas
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import React, { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 HOLOGRAPHIC SHADER
// ═══════════════════════════════════════════════════════════════════════════════

const holographicVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
  }
`

const holographicFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uFresnelColor;
  uniform float uScanlineIntensity;
  uniform float uGlitchIntensity;
  uniform float uNoiseIntensity;
  uniform float uDistortionIntensity;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;

  // Noise function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel effect
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);

    // Scanlines
    float scanline = sin(vUv.y * 400.0 + uTime * 5.0) * uScanlineIntensity;
    float scanline2 = sin(vUv.y * 100.0 - uTime * 2.0) * uScanlineIntensity * 0.5;

    // Horizontal glitch lines
    float glitchLine = step(0.99, random(vec2(floor(vUv.y * 50.0), floor(uTime * 10.0))));
    float glitch = glitchLine * uGlitchIntensity;

    // Noise pattern
    float noisePattern = noise(vUv * 100.0 + uTime * 2.0) * uNoiseIntensity;

    // Color distortion
    vec3 color = uColor;
    color.r += sin(vUv.y * 200.0 + uTime * 3.0) * uDistortionIntensity;
    color.b += cos(vUv.y * 200.0 + uTime * 2.0) * uDistortionIntensity;

    // Mix fresnel color
    color = mix(color, uFresnelColor, fresnel * 0.5);

    // Apply effects
    float alpha = uOpacity;
    alpha *= (1.0 + scanline + scanline2);
    alpha *= (1.0 + glitch * 0.5);
    alpha += noisePattern * 0.1;
    alpha += fresnel * 0.3;

    // Flicker effect
    float flicker = sin(uTime * 30.0) * 0.02 + 0.98;
    alpha *= flicker;

    // Edge glow
    float edgeGlow = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 5.0);
    color += uFresnelColor * edgeGlow * 0.2;

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`

// ═══════════════════════════════════════════════════════════════════════════════
// 🔮 HOLOGRAPHIC MATERIAL
// ═══════════════════════════════════════════════════════════════════════════════

interface HolographicMaterialProps {
  color?: string
  fresnelColor?: string
  scanlineIntensity?: number
  glitchIntensity?: number
  noiseIntensity?: number
  distortionIntensity?: number
  opacity?: number
  animated?: boolean
}

function HolographicMaterial({
  color = '#00ffff',
  fresnelColor = '#ff00ff',
  scanlineIntensity = 0.04,
  glitchIntensity = 0.1,
  noiseIntensity = 0.05,
  distortionIntensity = 0.1,
  opacity = 0.8,
  animated = true,
}: HolographicMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uFresnelColor: { value: new THREE.Color(fresnelColor) },
      uScanlineIntensity: { value: scanlineIntensity },
      uGlitchIntensity: { value: glitchIntensity },
      uNoiseIntensity: { value: noiseIntensity },
      uDistortionIntensity: { value: distortionIntensity },
      uOpacity: { value: opacity },
    }),
    [
      color,
      fresnelColor,
      scanlineIntensity,
      glitchIntensity,
      noiseIntensity,
      distortionIntensity,
      opacity,
    ],
  )

  useFrame((state) => {
    if (!animated || !materialRef.current?.uniforms?.uTime) return
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={holographicVertexShader}
      fragmentShader={holographicFragmentShader}
      uniforms={uniforms}
      transparent
      side={THREE.DoubleSide}
      depthWrite={false}
      blending={THREE.AdditiveBlending}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔮 HOLOGRAPHIC DISPLAY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface HolographicDisplay3DProps {
  children?: React.ReactNode
  width?: number
  height?: number
  depth?: number
  color?: string
  fresnelColor?: string
  scanlineIntensity?: number
  glitchIntensity?: number
  noiseIntensity?: number
  distortionIntensity?: number
  animated?: boolean
  showFrame?: boolean
  title?: string
}

export function HolographicDisplay({
  children,
  width = 4,
  height = 3,
  depth = 0.1,
  color = '#00ffff',
  fresnelColor = '#ff00ff',
  scanlineIntensity = 0.04,
  glitchIntensity = 0.1,
  noiseIntensity = 0.05,
  distortionIntensity = 0.1,
  animated = true,
  showFrame = true,
  title,
}: HolographicDisplay3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!animated || !groupRef.current) return
    // Subtle floating animation
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
  })

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Main holographic panel */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <HolographicMaterial
          color={color}
          fresnelColor={fresnelColor}
          scanlineIntensity={scanlineIntensity}
          glitchIntensity={hovered ? glitchIntensity * 2 : glitchIntensity}
          noiseIntensity={noiseIntensity}
          distortionIntensity={distortionIntensity}
          animated={animated}
        />
      </mesh>

      {/* Frame */}
      {showFrame && (
        <>
          {/* Top frame */}
          <mesh position={[0, height / 2 + 0.05, 0]}>
            <boxGeometry args={[width + 0.2, 0.1, depth]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Bottom frame */}
          <mesh position={[0, -height / 2 - 0.05, 0]}>
            <boxGeometry args={[width + 0.2, 0.1, depth]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Left frame */}
          <mesh position={[-width / 2 - 0.05, 0, 0]}>
            <boxGeometry args={[0.1, height, depth]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Right frame */}
          <mesh position={[width / 2 + 0.05, 0, 0]}>
            <boxGeometry args={[0.1, height, depth]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Corner accents */}
          {(
            [
              [-width / 2, height / 2],
              [width / 2, height / 2],
              [-width / 2, -height / 2],
              [width / 2, -height / 2],
            ] as [number, number][]
          ).map(([x, y], i) => (
            <mesh key={i} position={[x, y, depth / 2]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial
                color={fresnelColor}
                emissive={fresnelColor}
                emissiveIntensity={hovered ? 2 : 1}
              />
            </mesh>
          ))}
        </>
      )}

      {/* Title */}
      {title && (
        <Text
          position={[0, height / 2 + 0.25, 0.01]}
          fontSize={0.2}
          color={color}
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {title}
        </Text>
      )}

      {/* Children content */}
      <group position={[0, 0, 0.05]}>{children}</group>

      {/* Glow effect */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[width + 0.5, height + 0.5]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.15 : 0.08}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

export default HolographicDisplay
