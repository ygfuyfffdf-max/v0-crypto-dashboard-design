'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 SHADER PROVIDER — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Provider global para el sistema de shaders SUPREME.
 * Envuelve la aplicación para proporcionar personalización de shaders en todo el dashboard.
 *
 * @version 4.0.0 SUPREME ELITE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { ShaderCustomizationProvider } from '@/app/_components/chronos-2026/shaders/ShaderCustomizationContext'
import type { ReactNode } from 'react'

interface ShaderProviderProps {
  children: ReactNode
}

/**
 * Provider global para el sistema de shaders SUPREME.
 * Debe envolver la aplicación para que useShaderCustomization funcione en todos los componentes.
 */
export function ShaderProvider({ children }: ShaderProviderProps) {
  return <ShaderCustomizationProvider>{children}</ShaderCustomizationProvider>
}

export default ShaderProvider
