'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'
import { AlertCircle, TrendingUp, Zap } from 'lucide-react'

interface Insight {
  id: string
  title: string
  type: 'alert' | 'opportunity' | 'info'
  icon: React.ReactNode
}

const MOCK_INSIGHTS: Insight[] = [
  { id: '1', title: 'Stock Bajo: iPhone 15', type: 'alert', icon: <AlertCircle className="w-3 h-3 text-red-400" /> },
  { id: '2', title: '+15% Ventas vs Ayer', type: 'opportunity', icon: <TrendingUp className="w-3 h-3 text-emerald-400" /> },
  { id: '3', title: 'IA Optimizando Flujo', type: 'info', icon: <Zap className="w-3 h-3 text-amber-400" /> },
]

export function FloatingInsights({ mode }: { mode: 'orb' | 'expanded' }) {
  const [activeInsight, setActiveInsight] = useState<Insight | null>(null)

  useEffect(() => {
    if (mode === 'orb') {
      const interval = setInterval(() => {
        const randomInsight = MOCK_INSIGHTS[Math.floor(Math.random() * MOCK_INSIGHTS.length)]
        setActiveInsight(randomInsight)
        setTimeout(() => setActiveInsight(null), 4000)
      }, 8000)
      return () => clearInterval(interval)
    } else {
      setActiveInsight(null)
    }
  }, [mode])

  return (
    <AnimatePresence>
      {activeInsight && mode === 'orb' && (
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.8 }}
          animate={{ opacity: 1, x: -90, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-0 pointer-events-none"
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)] min-w-[140px]">
            <div className="p-1.5 rounded-full bg-white/5 border border-white/5">
              {activeInsight.icon}
            </div>
            <span className="text-[10px] font-medium text-white/90 leading-tight">
              {activeInsight.title}
            </span>
          </div>
          
          {/* Connecting Line */}
          <svg className="absolute top-1/2 -right-6 w-6 h-[2px] overflow-visible">
             <motion.line 
               x1="0" y1="0" x2="24" y2="0" 
               stroke="white" 
               strokeOpacity="0.2" 
               strokeWidth="1"
               strokeDasharray="4 2"
             />
             <motion.circle cx="24" cy="0" r="2" fill="white" fillOpacity="0.5" />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
