/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ⚛️ CHRONOS RAPIER3D PHYSICS ENGINE — REAL PHYSICS SIMULATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Motor de físicas reales usando Rapier3D para:
 * - Colisiones realistas
 * - Gravedad y fuerzas
 * - Rigid bodies dinámicos
 * - Constraints y joints
 *
 * TECNOLOGÍA: @dimforge/rapier3d-compat
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import type RAPIER from '@dimforge/rapier3d-compat'

let RAPIER_MODULE: typeof RAPIER | null = null

/**
 * Inicializar Rapier3D (carga asíncrona)
 */
export async function initRapier() {
  if (RAPIER_MODULE) return RAPIER_MODULE

  try {
    const RAPIER = await import('@dimforge/rapier3d-compat')
    await RAPIER.init()
    RAPIER_MODULE = RAPIER
    return RAPIER
  } catch (error) {
    console.error('Error inicializando Rapier3D:', error)
    throw error
  }
}

/**
 * Obtener módulo Rapier (debe haberse inicializado primero)
 */
export function getRapier() {
  if (!RAPIER_MODULE) {
    throw new Error('Rapier3D no inicializado. Llama a initRapier() primero.')
  }
  return RAPIER_MODULE
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIONES PRESETS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Preset de mundo con gravedad estándar
 */
export async function createStandardWorld() {
  const RAPIER = await initRapier()
  const gravity = { x: 0.0, y: -9.81, z: 0.0 }
  return new RAPIER.World(gravity)
}

/**
 * Preset de mundo sin gravedad (espacio)
 */
export async function createZeroGravityWorld() {
  const RAPIER = await initRapier()
  const gravity = { x: 0.0, y: 0.0, z: 0.0 }
  return new RAPIER.World(gravity)
}

/**
 * Preset de mundo con gravedad lunar
 */
export async function createLunarWorld() {
  const RAPIER = await initRapier()
  const gravity = { x: 0.0, y: -1.62, z: 0.0 }
  return new RAPIER.World(gravity)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES DE RIGID BODIES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface RigidBodyConfig {
  type: 'dynamic' | 'fixed' | 'kinematic'
  position: { x: number; y: number; z: number }
  rotation?: { x: number; y: number; z: number; w: number }
  linearVelocity?: { x: number; y: number; z: number }
  angularVelocity?: { x: number; y: number; z: number }
  mass?: number
  restitution?: number // Bounciness (0-1)
  friction?: number // Fricción (0-1)
}

/**
 * Crear rigid body con collider esférico
 */
export async function createSphere(world: any, config: RigidBodyConfig, radius: number) {
  const RAPIER = getRapier()

  // Crear rigid body description
  let rigidBodyDesc
  switch (config.type) {
    case 'dynamic':
      rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
      break
    case 'fixed':
      rigidBodyDesc = RAPIER.RigidBodyDesc.fixed()
      break
    case 'kinematic':
      rigidBodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
      break
  }

  rigidBodyDesc.setTranslation(config.position.x, config.position.y, config.position.z)

  if (config.rotation) {
    rigidBodyDesc.setRotation(config.rotation)
  }

  const rigidBody = world.createRigidBody(rigidBodyDesc)

  // Configurar velocidades si es dinámico
  if (config.type === 'dynamic') {
    if (config.linearVelocity) {
      rigidBody.setLinvel(config.linearVelocity, true)
    }
    if (config.angularVelocity) {
      rigidBody.setAngvel(config.angularVelocity, true)
    }
  }

  // Crear collider
  const colliderDesc = RAPIER.ColliderDesc.ball(radius)

  if (config.restitution !== undefined) {
    colliderDesc.setRestitution(config.restitution)
  }

  if (config.friction !== undefined) {
    colliderDesc.setFriction(config.friction)
  }

  if (config.mass !== undefined && config.type === 'dynamic') {
    colliderDesc.setMass(config.mass)
  }

  world.createCollider(colliderDesc, rigidBody)

  return rigidBody
}

/**
 * Crear rigid body con collider cúbico
 */
export async function createCube(
  world: any,
  config: RigidBodyConfig,
  halfExtents: { x: number; y: number; z: number },
) {
  const RAPIER = getRapier()

  let rigidBodyDesc
  switch (config.type) {
    case 'dynamic':
      rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
      break
    case 'fixed':
      rigidBodyDesc = RAPIER.RigidBodyDesc.fixed()
      break
    case 'kinematic':
      rigidBodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
      break
  }

  rigidBodyDesc.setTranslation(config.position.x, config.position.y, config.position.z)

  if (config.rotation) {
    rigidBodyDesc.setRotation(config.rotation)
  }

  const rigidBody = world.createRigidBody(rigidBodyDesc)

  if (config.type === 'dynamic') {
    if (config.linearVelocity) {
      rigidBody.setLinvel(config.linearVelocity, true)
    }
    if (config.angularVelocity) {
      rigidBody.setAngvel(config.angularVelocity, true)
    }
  }

  const colliderDesc = RAPIER.ColliderDesc.cuboid(halfExtents.x, halfExtents.y, halfExtents.z)

  if (config.restitution !== undefined) {
    colliderDesc.setRestitution(config.restitution)
  }

  if (config.friction !== undefined) {
    colliderDesc.setFriction(config.friction)
  }

  if (config.mass !== undefined && config.type === 'dynamic') {
    colliderDesc.setMass(config.mass)
  }

  world.createCollider(colliderDesc, rigidBody)

  return rigidBody
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EFECTOS Y FUERZAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Aplicar impulso (fuerza instantánea)
 */
export function applyImpulse(
  rigidBody: any,
  impulse: { x: number; y: number; z: number },
  point?: { x: number; y: number; z: number },
) {
  if (point) {
    rigidBody.applyImpulseAtPoint(impulse, point, true)
  } else {
    rigidBody.applyImpulse(impulse, true)
  }
}

/**
 * Aplicar fuerza continua
 */
export function applyForce(
  rigidBody: any,
  force: { x: number; y: number; z: number },
  point?: { x: number; y: number; z: number },
) {
  if (point) {
    rigidBody.applyForceAtPoint(force, point, true)
  } else {
    rigidBody.applyForce(force, true)
  }
}

/**
 * Aplicar torque (rotación)
 */
export function applyTorque(rigidBody: any, torque: { x: number; y: number; z: number }) {
  rigidBody.applyTorqueImpulse(torque, true)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES DE SIMULACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Step de simulación (llamar en cada frame)
 */
export function stepSimulation(world: any, deltaTime: number = 1 / 60) {
  world.step()
}

/**
 * Obtener posición de rigid body
 */
export function getPosition(rigidBody: any): { x: number; y: number; z: number } {
  const translation = rigidBody.translation()
  return { x: translation.x, y: translation.y, z: translation.z }
}

/**
 * Obtener rotación de rigid body (quaternion)
 */
export function getRotation(rigidBody: any): { x: number; y: number; z: number; w: number } {
  const rotation = rigidBody.rotation()
  return { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w }
}

/**
 * Obtener velocidad lineal
 */
export function getLinearVelocity(rigidBody: any): { x: number; y: number; z: number } {
  const linvel = rigidBody.linvel()
  return { x: linvel.x, y: linvel.y, z: linvel.z }
}

/**
 * Obtener velocidad angular
 */
export function getAngularVelocity(rigidBody: any): { x: number; y: number; z: number } {
  const angvel = rigidBody.angvel()
  return { x: angvel.x, y: angvel.y, z: angvel.z }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type { RAPIER }
