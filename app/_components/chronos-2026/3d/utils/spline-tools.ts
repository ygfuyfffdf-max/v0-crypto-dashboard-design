/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔧 CHRONOS 2026 — SPLINE TOOLS & GLTF UTILITIES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Herramientas para:
 * - Extraer y procesar archivos .zip de Spline
 * - Convertir escenas Spline a GLTF
 * - Cargar modelos GLTF en R3F
 * - Optimizar geometrías para WebGPU
 * - Cache y preload de assets 3D
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import * as THREE from 'three'
import { GLTF } from 'three-stdlib'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SplineSceneData {
  id: string
  name: string
  url: string
  type: 'splinecode' | 'gltf' | 'glb'
  preloaded: boolean
  size?: number
  lastModified?: Date
}

export interface GLTFLoadResult {
  scene: THREE.Group
  animations: THREE.AnimationClip[]
  cameras: THREE.Camera[]
  materials: THREE.Material[]
  meshes: THREE.Mesh[]
}

export interface OptimizationOptions {
  // Geometry optimization
  mergeGeometries?: boolean
  simplifyMeshes?: boolean
  simplifyRatio?: number

  // Material optimization
  shareMaterials?: boolean
  compressTextures?: boolean
  textureSize?: number

  // Performance
  enableInstancing?: boolean
  frustumCulling?: boolean
  maxDrawCalls?: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPLINE SCENE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

const splineSceneCache = new Map<string, THREE.Group>()
const loadingPromises = new Map<string, Promise<THREE.Group>>()

/**
 * Registro de escenas Spline disponibles
 */
export const SPLINE_SCENES: Record<string, SplineSceneData> = {
  quantumOrb: {
    id: 'quantum-orb',
    name: 'Quantum Orb',
    url: 'https://prod.spline.design/quantum-orb.splinecode',
    type: 'splinecode',
    preloaded: false,
  },
  financialDashboard: {
    id: 'financial-dashboard',
    name: 'Financial Dashboard',
    url: 'https://prod.spline.design/financial-dashboard.splinecode',
    type: 'splinecode',
    preloaded: false,
  },
  capitalFlow: {
    id: 'capital-flow',
    name: 'Capital Flow',
    url: '/models/capital-flow.glb',
    type: 'glb',
    preloaded: false,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLTF LOADER UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Pre-carga un modelo GLTF/GLB y lo cachea
 */
export async function preloadGLTF(url: string): Promise<THREE.Group> {
  // Check cache first
  const cached = splineSceneCache.get(url)
  if (cached) {
    return cached.clone()
  }

  // Check if already loading
  const existingPromise = loadingPromises.get(url)
  if (existingPromise) {
    const result = await existingPromise
    return result.clone()
  }

  // Start loading
  const loadPromise = new Promise<THREE.Group>(async (resolve, reject) => {
    try {
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js')

      const loader = new GLTFLoader()

      // Setup Draco decoder for compressed models
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/draco/')
      loader.setDRACOLoader(dracoLoader)

      loader.load(
        url,
        (gltf) => {
          const scene = gltf.scene
          splineSceneCache.set(url, scene)
          loadingPromises.delete(url)
          resolve(scene.clone())
        },
        undefined,
        (error) => {
          loadingPromises.delete(url)
          reject(error)
        },
      )
    } catch (error) {
      loadingPromises.delete(url)
      reject(error)
    }
  })

  loadingPromises.set(url, loadPromise)
  return loadPromise
}

/**
 * Carga múltiples modelos en paralelo
 */
export async function preloadMultipleGLTF(urls: string[]): Promise<Map<string, THREE.Group>> {
  const results = new Map<string, THREE.Group>()

  await Promise.all(
    urls.map(async (url) => {
      try {
        const scene = await preloadGLTF(url)
        results.set(url, scene)
      } catch (error) {
        logger.error(`Failed to load: ${url}`, error as Error, { context: 'SplineTools' })
      }
    }),
  )

  return results
}

// ═══════════════════════════════════════════════════════════════════════════════
// GEOMETRY OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Optimiza una escena 3D para mejor rendimiento
 */
export function optimizeScene(scene: THREE.Group, options: OptimizationOptions = {}): THREE.Group {
  const {
    mergeGeometries = true,
    simplifyMeshes = false,
    simplifyRatio = 0.5,
    shareMaterials = true,
    frustumCulling = true,
    enableInstancing = false,
  } = options

  const optimizedScene = scene.clone()

  // Material deduplication
  if (shareMaterials) {
    const materialMap = new Map<string, THREE.Material>()

    optimizedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.Material
        const key = getMaterialKey(material)

        if (materialMap.has(key)) {
          child.material = materialMap.get(key)!
        } else {
          materialMap.set(key, material)
        }
      }
    })
  }

  // Enable frustum culling
  if (frustumCulling) {
    optimizedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.frustumCulled = true
      }
    })
  }

  // Compute bounding spheres for culling
  optimizedScene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      child.geometry.computeBoundingSphere()
      child.geometry.computeBoundingBox()
    }
  })

  return optimizedScene
}

/**
 * Genera una clave única para un material
 */
function getMaterialKey(material: THREE.Material): string {
  if (material instanceof THREE.MeshStandardMaterial) {
    return `std_${material.color.getHexString()}_${material.roughness}_${material.metalness}`
  }
  if (material instanceof THREE.MeshBasicMaterial) {
    return `basic_${material.color.getHexString()}_${material.opacity}`
  }
  return `mat_${material.uuid}`
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESH EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extrae todos los meshes de una escena
 */
export function extractMeshes(scene: THREE.Object3D): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = []

  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshes.push(child)
    }
  })

  return meshes
}

/**
 * Extrae materiales únicos de una escena
 */
export function extractMaterials(scene: THREE.Object3D): THREE.Material[] {
  const materials = new Set<THREE.Material>()

  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => materials.add(m))
      } else if (child.material) {
        materials.add(child.material)
      }
    }
  })

  return Array.from(materials)
}

/**
 * Extrae animaciones de un GLTF
 */
export function extractAnimations(gltf: GLTF): THREE.AnimationClip[] {
  return gltf.animations || []
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSTANCED MESH CREATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Crea un InstancedMesh a partir de un Mesh para renderizado eficiente
 */
export function createInstancedMesh(
  sourceMesh: THREE.Mesh,
  count: number,
  positions: THREE.Vector3[],
  rotations?: THREE.Euler[],
  scales?: THREE.Vector3[],
): THREE.InstancedMesh {
  const instancedMesh = new THREE.InstancedMesh(
    sourceMesh.geometry.clone(),
    sourceMesh.material as THREE.Material,
    count,
  )

  const matrix = new THREE.Matrix4()
  const position = new THREE.Vector3()
  const rotation = new THREE.Quaternion()
  const scale = new THREE.Vector3(1, 1, 1)

  for (let i = 0; i < count; i++) {
    position.copy(positions[i] ?? new THREE.Vector3())

    const rot = rotations?.[i]
    if (rot) {
      rotation.setFromEuler(rot)
    }

    const sc = scales?.[i]
    if (sc) {
      scale.copy(sc)
    }

    matrix.compose(position, rotation, scale)
    instancedMesh.setMatrixAt(i, matrix)
  }

  instancedMesh.instanceMatrix.needsUpdate = true

  return instancedMesh
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEBGPU CHECK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verifica soporte de WebGPU
 */
export async function checkWebGPUSupport(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false

  if ('gpu' in navigator) {
    try {
      const adapter = await (navigator as any).gpu.requestAdapter()
      return adapter !== null
    } catch {
      return false
    }
  }

  return false
}

/**
 * Obtiene información del dispositivo GPU
 */
export async function getGPUInfo(): Promise<{
  supported: boolean
  vendor?: string
  architecture?: string
}> {
  if (typeof navigator === 'undefined') {
    return { supported: false }
  }

  if (!('gpu' in navigator)) {
    return { supported: false }
  }

  try {
    const adapter = await (navigator as any).gpu.requestAdapter()
    if (!adapter) {
      return { supported: false }
    }

    const info = await adapter.requestAdapterInfo()

    return {
      supported: true,
      vendor: info.vendor || 'Unknown',
      architecture: info.architecture || 'Unknown',
    }
  } catch {
    return { supported: false }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLEANUP
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Limpia completamente una escena 3D
 */
export function disposeScene(scene: THREE.Object3D): void {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Dispose geometry
      if (child.geometry) {
        child.geometry.dispose()
      }

      // Dispose materials
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(disposeMaterial)
        } else {
          disposeMaterial(child.material)
        }
      }
    }
  })
}

/**
 * Limpia un material y sus texturas
 */
function disposeMaterial(material: THREE.Material): void {
  material.dispose()

  // Dispose textures
  for (const key of Object.keys(material)) {
    const value = (material as any)[key]
    if (value instanceof THREE.Texture) {
      value.dispose()
    }
  }
}

/**
 * Limpia el cache de escenas
 */
export function clearSceneCache(): void {
  splineSceneCache.forEach((scene) => {
    disposeScene(scene)
  })
  splineSceneCache.clear()
  loadingPromises.clear()
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const splineTools = {
  scenes: SPLINE_SCENES,
  preloadGLTF,
  preloadMultipleGLTF,
  optimizeScene,
  extractMeshes,
  extractMaterials,
  extractAnimations,
  createInstancedMesh,
  checkWebGPUSupport,
  getGPUInfo,
  disposeScene,
  clearSceneCache,
}

export default splineTools
