// ═══════════════════════════════════════════════════════════════════════════════════════
// REACT THREE FIBER — DECLARACIONES DE TIPOS EXTENDIDAS
// ═══════════════════════════════════════════════════════════════════════════════════════
// Extiende los tipos de @react-three/fiber para manejar bufferAttribute y otros elementos
// que tienen conflictos de tipos entre Three.js y R3F
// ═══════════════════════════════════════════════════════════════════════════════════════

import type { Object3DNode, BufferGeometryNode } from "@react-three/fiber"
import type * as THREE from "three"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // BufferAttribute con props flexibles para R3F
      bufferAttribute: {
        attach?: string
        args?: [ArrayLike<number>, number] | [THREE.InterleavedBuffer, number, number?]
        count?: number
        array?: ArrayLike<number>
        itemSize?: number
        normalized?: boolean
        usage?: THREE.Usage
        needsUpdate?: boolean
      }

      // InterleavedBufferAttribute
      interleavedBufferAttribute: {
        attach?: string
        args?: [THREE.InterleavedBuffer, number, number, boolean?]
        count?: number
        itemSize?: number
        normalized?: boolean
      }

      // InstancedBufferAttribute
      instancedBufferAttribute: {
        attach?: string
        args?: [ArrayLike<number>, number, boolean?, number?]
        count?: number
        array?: ArrayLike<number>
        itemSize?: number
        meshPerAttribute?: number
        normalized?: boolean
      }
    }
  }
}

// Tipos útiles para componentes 3D
export type Vector3Tuple = [number, number, number]
export type Vector2Tuple = [number, number]
export type EulerTuple = [number, number, number, THREE.EulerOrder?]
export type ColorRepresentation = THREE.ColorRepresentation

// Props comunes para componentes 3D
export interface Base3DProps {
  position?: Vector3Tuple | THREE.Vector3
  rotation?: EulerTuple | THREE.Euler
  scale?: number | Vector3Tuple | THREE.Vector3
  visible?: boolean
}

// Props para partículas
export interface ParticleSystemProps extends Base3DProps {
  count?: number
  size?: number
  color?: ColorRepresentation
  opacity?: number
  transparent?: boolean
  depthWrite?: boolean
  blending?: THREE.Blending
}

// Props para materiales custom con shaders
export interface ShaderMaterialProps {
  vertexShader?: string
  fragmentShader?: string
  uniforms?: Record<string, THREE.IUniform>
  transparent?: boolean
  depthWrite?: boolean
  depthTest?: boolean
  side?: THREE.Side
  blending?: THREE.Blending
}

export {}
