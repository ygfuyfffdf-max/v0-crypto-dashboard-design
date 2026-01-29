/**
 * Mock de nanoid para Jest
 * nanoid usa ESM que no es compatible con Jest sin configuración adicional
 */

let counter = 0

export function nanoid(size = 21): string {
  counter++
  return `mock-id-${counter}-${Math.random()
    .toString(36)
    .substring(2, size + 2)}`
}

export default nanoid
