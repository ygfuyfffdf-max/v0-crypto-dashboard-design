/**
 * Declaración de tipos para GSAP
 * GSAP incluye sus propios tipos pero pueden no ser detectados automáticamente
 */

declare module "gsap" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const gsap: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _default: any
  export default _default
}

declare module "gsap/ScrollTrigger" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const ScrollTrigger: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _default: any
  export default _default
}
