/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌✨ CHRONOS AI PAGE — UNIFIED PREMIUM EXPERIENCE 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Página cliente para el Panel IA UNIFICADO con diseño cinematográfico ultra-premium.
 * Utiliza AuroraAIPanelUnified que consolida todos los paneles IA legacy.
 * CONECTADO A API /api/chronos-ai/chat para respuestas reales
 *
 * CARACTERÍSTICAS:
 * - Orb 3D Canvas con partículas reactivas
 * - Chat con IA contextual basado en datos reales
 * - Métricas en tiempo real conectadas a Turso/Drizzle
 * - Voice recognition con visualizador de ondas
 * - Diseño glassmorphism ultra-premium
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { AuroraAIPanelUnified } from '@/app/_components/chronos-2026/panels/AuroraAIPanelUnified'
import { logger } from '@/app/lib/utils/logger'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN PAGE CLIENT — AI Experience with Opening Animation
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function IASentientPageClient() {
  const router = useRouter()

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  // Handler para enviar mensajes a la API de CHRONOS AI
  const handleMessage = useCallback(async (message: string): Promise<string> => {
    try {
      logger.info('🤖 Enviando mensaje a CHRONOS AI Panel', {
        context: 'IASentientPageClient',
        data: { message: message.substring(0, 50) },
      })

      const response = await fetch('/api/chronos-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          taskType: 'financial',
          systemPrompt: `Eres CHRONOS INFINITY, asistente IA de gestión empresarial premium.
Panel: IA Central
Tienes acceso a datos de ventas, capital de bancos, clientes y distribuidores.
Responde en español, formato Markdown rico.
Sé conciso pero informativo (máximo 150 palabras).
Si preguntan sobre métricas, sugiere acciones concretas.`,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.response || 'No se recibió respuesta del servidor.'
    } catch (error) {
      logger.error('Error en AI message', error as Error, { context: 'IASentientPageClient' })
      return '🌌 CHRONOS INFINITY experimentó un error temporal. Por favor, intenta de nuevo.'
    }
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50"
      >
        {/* Zero Force AI Panel — full-screen chat + metrics + voice */}
        <AuroraAIPanelUnified onBack={handleBack} onMessage={handleMessage} />
      </motion.div>
    </AnimatePresence>
  )
}

export default IASentientPageClient
