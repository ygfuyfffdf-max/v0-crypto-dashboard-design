/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎬 CINEMATIC CONTROLS — Debug & Testing
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { motion } from 'motion/react'
import { Film, RotateCcw } from 'lucide-react'
import { resetCinematic } from './AppInitializer'

export function CinematicControls() {
  const handleReset = () => {
    if (confirm('¿Volver a mostrar la cinematográfica KOCMOC al recargar?')) {
      resetCinematic()
    }
  }

  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
          <Film className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Cinematográfica KOCMOC</h3>
          <p className="text-sm text-gray-400">Control de intro 3D</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="mb-2 text-sm text-gray-300">
            La cinematográfica se muestra automáticamente en la primera visita.
            Se guarda en localStorage para no repetir.
          </p>
          <p className="text-xs text-gray-500">
            Duración: 8 segundos | Logo КОСМОС + Texto ΧΡΟΝΟΣ
          </p>
        </div>

        <motion.button
          onClick={handleReset}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 font-medium text-white transition-all hover:from-violet-500 hover:to-fuchsia-500"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RotateCcw className="h-5 w-5" />
          Resetear y volver a ver
        </motion.button>
      </div>
    </motion.div>
  )
}
