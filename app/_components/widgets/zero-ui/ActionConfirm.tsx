'use client'

import { motion } from 'motion/react'
import { Check, X, AlertTriangle } from 'lucide-react'

interface ActionConfirmProps {
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
  severity?: 'low' | 'medium' | 'high'
}

export function ActionConfirm({ title, description, onConfirm, onCancel, severity = 'medium' }: ActionConfirmProps) {
  const borderColor = severity === 'high' ? 'border-red-500/50' : severity === 'medium' ? 'border-amber-500/50' : 'border-violet-500/50'
  const glowColor = severity === 'high' ? 'shadow-red-500/20' : severity === 'medium' ? 'shadow-amber-500/20' : 'shadow-violet-500/20'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl border ${borderColor} bg-black/40 backdrop-blur-xl shadow-lg ${glowColor} my-2`}
    >
      <div className="flex items-start gap-3">
        {severity === 'high' && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />}
        <div>
          <h4 className="text-sm font-bold text-white">{title}</h4>
          <p className="text-xs text-white/70 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-1.5 ${
            severity === 'high' ? 'bg-red-600 hover:bg-red-500' : 'bg-violet-600 hover:bg-violet-500'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          Confirmar
        </button>
      </div>
    </motion.div>
  )
}
