/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎨 CHRONOS 2026 — DASHBOARD LAYOUT
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * Layout para todas las páginas del dashboard con navegación y estructura premium
 * Incluye widget flotante de IA accesible desde cualquier panel
 * CONECTADO A API /api/chronos-ai/chat para respuestas reales
 * INTEGRADO CON: Supreme Shader System 2026
 * TRANSICIONES: PageTransitionWrapper con AnimatePresence para navegación cinematográfica
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

"use client"

import { ChronosHeader2026Client } from "@/app/_components/chronos-2026/layout/ChronosHeader2026Client"
import {
  ShaderControlPanel,
  ShaderControlTrigger,
  useShaderCustomization,
} from "@/app/_components/chronos-2026/shaders"
import { PageTransitionWrapper } from "@/app/_components/chronos-2026/transitions/PageTransitionWrapper"
import { logger } from "@/app/lib/utils/logger"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useCallback, useState } from "react"

// Supreme Shader Canvas - lazy loaded para mejor performance inicial
const SupremeShaderCanvas = dynamic(
  () =>
    import("@/app/_components/chronos-2026/shaders/SupremeShaderCanvas").then(
      (mod) => mod.SupremeShaderCanvas
    ),
  { ssr: false }
)

// Widget de IA COGNITO flotante - lazy loaded para mejor performance
const CognitoFloatingButton = dynamic(
  () =>
    import("@/app/_components/widgets/CognitoWidget/CognitoFloatingButton").then(
      (mod) => mod.CognitoFloatingButton
    ),
  { ssr: false }
)

// Mapeo de rutas a contextos de IA y tipos de tarea
const ROUTE_TO_AI_CONTEXT: Record<
  string,
  | "dashboard"
  | "ventas"
  | "clientes"
  | "bancos"
  | "distribuidores"
  | "almacen"
  | "movimientos"
  | "gastos"
  | "ordenes"
  | "reportes"
> = {
  "/dashboard": "dashboard",
  "/": "dashboard",
  "/bancos": "bancos",
  "/ventas": "ventas",
  "/ordenes": "ordenes",
  "/clientes": "clientes",
  "/almacen": "almacen",
  "/distribuidores": "distribuidores",
  "/movimientos": "movimientos",
  "/gastos-abonos": "gastos",
}

// Mapeo de rutas a presets de shader
const ROUTE_TO_SHADER_PRESET: Record<
  string,
  | "dashboard"
  | "ventas"
  | "clientes"
  | "bancos"
  | "distribuidores"
  | "almacen"
  | "movimientos"
  | "gastos"
  | "compras"
  | "ai"
> = {
  "/dashboard": "dashboard",
  "/": "dashboard",
  "/bancos": "bancos",
  "/ventas": "ventas",
  "/ordenes": "compras",
  "/clientes": "clientes",
  "/almacen": "almacen",
  "/distribuidores": "distribuidores",
  "/movimientos": "movimientos",
  "/gastos-abonos": "gastos",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [shaderControlsOpen, setShaderControlsOpen] = useState(false)

  // Determinar contexto de IA basado en la ruta
  const aiContext = ROUTE_TO_AI_CONTEXT[pathname] || "dashboard"

  // Determinar preset de shader basado en la ruta
  const shaderPreset = ROUTE_TO_SHADER_PRESET[pathname] || "dashboard"

  // Obtener configuración del shader desde el context global
  // El ShaderProvider ya está en el root layout, así que esto siempre debería funcionar
  const shaderCustomization = useShaderCustomization()
  const shaderEnabled = shaderCustomization?.enabled ?? true

  // Handler para enviar queries al API de IA real
  const handleAIQuery = useCallback(
    async (query: string): Promise<string> => {
      try {
        logger.info("🤖 Enviando query a CHRONOS AI", {
          context: "DashboardLayout",
          data: { query: query.substring(0, 50), panelContext: aiContext },
        })

        const response = await fetch("/api/chronos-ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: query,
            taskType: aiContext === "bancos" || aiContext === "ventas" ? "financial" : "general",
            systemPrompt: `Eres CHRONOS INFINITY, asistente IA de gestión empresarial.
Contexto actual: Panel de ${aiContext}.
Responde en español, formato Markdown, máximo 200 palabras.
Si preguntan sobre datos específicos, indica que puedes ayudar a analizar tendencias y métricas.`,
          }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        return data.response || "No se recibió respuesta del servidor."
      } catch (error) {
        logger.error("Error en AI query", error as Error, { context: "DashboardLayout" })
        return "🌌 CHRONOS INFINITY experimentó un error temporal. Por favor, intenta de nuevo."
      }
    },
    [aiContext]
  )

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--c-void)]">
      {/* 🌌 CSS BASE BACKGROUND — SIEMPRE VISIBLE */}
      <div className="pointer-events-none fixed inset-0 -z-20">
        {/* Animated Aurora Orbs - Garantizados */}
        <div
          className="animate-premium-float absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="animate-premium-float absolute -right-[10%] -bottom-[20%] h-[500px] w-[500px] rounded-full opacity-35"
          style={{
            background: "radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)",
            filter: "blur(80px)",
            animationDelay: "-3s",
          }}
        />
        <div
          className="animate-premium-float absolute top-[30%] right-[20%] h-[400px] w-[400px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(255, 20, 147, 0.35) 0%, transparent 70%)",
            filter: "blur(80px)",
            animationDelay: "-6s",
          }}
        />
        <div
          className="animate-premium-float absolute bottom-[20%] left-[30%] h-[350px] w-[350px] rounded-full opacity-25"
          style={{
            background: "radial-gradient(circle, rgba(192, 132, 252, 0.4) 0%, transparent 70%)",
            filter: "blur(60px)",
            animationDelay: "-9s",
          }}
        />
      </div>

      {/* 🌌 SUPREME SHADER BACKGROUND — WebGL Particles (capa superior) */}
      {shaderEnabled && (
        <div className="pointer-events-none fixed inset-0 -z-10">
          <SupremeShaderCanvas
            panelPreset={shaderPreset}
            interactive
            scrollEffect
            lazyRender={false}
            priority="normal"
            opacity={0.8}
          />
        </div>
      )}

      {/* Subtle Grid Pattern (siempre visible) */}
      <div className="pointer-events-none fixed inset-0 -z-5">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
        {/* Top Gradient Fade */}
        <div className="absolute top-0 right-0 left-0 h-40 bg-gradient-to-b from-violet-500/5 to-transparent" />
      </div>

      {/* Header Premium KOCMOC CHRONOS 2026 */}
      <ChronosHeader2026Client />

      {/* Main Content with Page Transitions */}
      <main className="relative z-10 pt-16">
        <PageTransitionWrapper variant="quantum">{children}</PageTransitionWrapper>
      </main>

      {/* 🎛️ Shader Control Panel Trigger */}
      <ShaderControlTrigger onClick={() => setShaderControlsOpen(true)} />
      <ShaderControlPanel
        isOpen={shaderControlsOpen}
        onClose={() => setShaderControlsOpen(false)}
      />

      {/* 🧠 Widget de IA COGNITO Premium - Sistema de IA Ultra-Avanzado */}
      <CognitoFloatingButton position="bottom-right" size="lg" />
    </div>
  )
}
