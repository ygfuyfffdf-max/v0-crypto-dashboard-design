/**
 * 🎯 THREE.JS COMPATIBILITY LAYER
 * Re-exports para resolver conflictos de paths en postprocessing
 */

// Re-export Pass desde three correcto
export { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass.js'

// Timer puede no existir en todas las versiones de three.js
// @ts-ignore - Timer es opcional
export const Timer = class {
  private startTime: number = 0
  private oldTime: number = 0
  private elapsedTime: number = 0

  start() {
    this.startTime = performance.now()
    this.oldTime = this.startTime
  }

  update() {
    const newTime = performance.now()
    this.elapsedTime = (newTime - this.startTime) / 1000
    this.oldTime = newTime
    return this.elapsedTime
  }

  getElapsed() {
    return this.elapsedTime
  }
}
