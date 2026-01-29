/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CHRONOS 2026 — Type Declarations for External Modules
 * ═══════════════════════════════════════════════════════════════════════════════
 */

declare module "react-lazy-load-image-component" {
  import { ComponentType, ImgHTMLAttributes } from "react"

  export interface LazyLoadImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string
    alt?: string
    effect?: "blur" | "black-and-white" | "opacity"
    placeholderSrc?: string
    threshold?: number
    visibleByDefault?: boolean
    wrapperClassName?: string
    wrapperProps?: Record<string, unknown>
    afterLoad?: () => void
    beforeLoad?: () => void
    delayMethod?: "debounce" | "throttle"
    delayTime?: number
    scrollPosition?: { x: number; y: number }
    useIntersectionObserver?: boolean
  }

  export const LazyLoadImage: ComponentType<LazyLoadImageProps>
  export const LazyLoadComponent: ComponentType<{
    children: React.ReactNode
    afterLoad?: () => void
    beforeLoad?: () => void
    delayMethod?: "debounce" | "throttle"
    delayTime?: number
    placeholder?: React.ReactNode
    scrollPosition?: { x: number; y: number }
    threshold?: number
    useIntersectionObserver?: boolean
    visibleByDefault?: boolean
  }>

  export function trackWindowScroll<T>(
    component: ComponentType<T>
  ): ComponentType<Omit<T, "scrollPosition">>
}
