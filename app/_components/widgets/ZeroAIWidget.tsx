'use client'

import { useZeroForceVoice } from '@/app/_hooks/useZeroForceVoice'
import { cn } from '@/app/_lib/utils'
import { QUANTUM_SHADERS } from '@/app/lib/design-system/quantum-shaders-supreme'
import { Float, shaderMaterial } from '@react-three/drei'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { Activity, Mic, Minimize2, Phone, Send, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { ActionConfirm } from './zero-ui/ActionConfirm'
import { FloatingInsights } from './zero-ui/FloatingInsights'
import { MetricCard } from './zero-ui/MetricCard'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🌌 ZERO UI QUANTUM WIDGET
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ZeroAIWidgetProps {
  className?: string
  initialMode?: 'orb' | 'expanded'
}

type AIState = 'idle' | 'listening' | 'processing' | 'speaking' | 'action'

export function ZeroAIWidget({ className, initialMode = 'orb' }: ZeroAIWidgetProps) {
  const [mode, setMode] = useState<'orb' | 'expanded'>(initialMode)
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string; type?: 'text' | 'widget'; widgetData?: any }[]>([
    { role: 'ai', content: 'Sistemas Quantum en línea. Esperando instrucciones...', type: 'text' }
  ])
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Voice Hook Integration
  const { state: voiceState, startListening, stopListening, speak, executeCommand } = useZeroForceVoice({
    onTranscript: (text, isFinal) => {
       if (isFinal) {
          handleUserCommand(text)
       }
    },
    onCommandDetected: (cmd) => {
       // Visual feedback for command detection
       setMessages(prev => [...prev, { role: 'user', content: `🎙️ ${cmd}` }])
    }
  })

  // Sync internal AI State with Voice State
  const aiState: AIState = voiceState === 'idle' ? 'idle' : voiceState as AIState

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleUserCommand = async (text: string) => {
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInputValue('')
    
    // Simulate AI Processing Logic
    if (text.toLowerCase().includes('estado') || text.toLowerCase().includes('status')) {
       // Show Metric Widget
       setTimeout(() => {
          setMessages(prev => [...prev, { 
             role: 'ai', 
             content: 'Aquí está el estado actual del sistema financiero:', 
             type: 'widget',
             widgetData: { type: 'metrics' }
          }])
          speak('Aquí tienes el estado financiero actual. La utilidad neta ha subido un 12%.')
       }, 1000)
    } else if (text.toLowerCase().includes('llamar') || text.toLowerCase().includes('call')) {
       // Show Action Confirmation
       setTimeout(() => {
          setMessages(prev => [...prev, {
             role: 'ai',
             content: 'Preparando llamada autónoma...',
             type: 'widget',
             widgetData: { type: 'action_call', target: 'Distribuidor Global S.A.' }
          }])
          speak('¿Deseas que proceda con la llamada al Distribuidor Global?')
       }, 1000)
    } else {
       // Generic response
       setTimeout(() => {
         const response = 'Entendido. Procesando tu solicitud con los parámetros establecidos.'
         setMessages(prev => [...prev, { role: 'ai', content: response, type: 'text' }])
         speak(response)
       }, 1500)
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    handleUserCommand(inputValue)
  }
  
  const toggleListening = () => {
     if (aiState === 'listening') {
        stopListening()
     } else {
        startListening()
     }
  }

  return (
    <motion.div
      layout
      className={cn(
        'fixed z-[9999] flex flex-col overflow-visible backdrop-blur-3xl transition-all duration-700 ease-[bezier(0.23,1,0.32,1)]',
        mode === 'orb' 
          ? 'bottom-8 right-8 h-20 w-20 rounded-full shadow-[0_0_30px_rgba(139,0,255,0.4)] cursor-pointer hover:scale-110'
          : 'bottom-8 right-8 h-[80vh] w-[450px] rounded-[32px] border border-white/10 bg-black/80 shadow-[0_0_80px_rgba(139,0,255,0.2)]',
        className
      )}
      initial={false}
      animate={{
        width: mode === 'orb' ? 80 : 450,
        height: mode === 'orb' ? 80 : '80vh',
        borderRadius: mode === 'orb' ? '50%' : 32
      }}
      onClick={() => mode === 'orb' && setMode('expanded')}
    >
      {/* 🔮 ORB VISUALIZER (Always visible/morphing) */}
      <div className={cn(
        'absolute left-0 top-0 flex items-center justify-center transition-all duration-700 z-20',
        mode === 'orb' ? 'h-full w-full' : 'h-40 w-full'
      )}>
        <QuantumOrb state={aiState} />
      </div>

      {/* 🎐 FLOATING INSIGHTS (Only in Orb Mode) */}
      <FloatingInsights mode={mode} />

      {/* 🖥️ EXPANDED CONTENT */}
      <AnimatePresence>
        {mode === 'expanded' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full flex-col pt-40 relative z-10"
          >
            {/* 🌌 AURORA BACKGROUND & NOISE */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[32px]">
               <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(139,0,255,0.15),transparent_50%)] animate-spin-slow" />
               <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
               <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent" />
            </div>
            {/* Header Controls */}
            <div className="absolute top-4 right-4 flex gap-2 z-50">
               <button 
                 onClick={(e) => { e.stopPropagation(); setMode('orb') }}
                 className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
               >
                 <Minimize2 className="w-4 h-4" />
               </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-none" ref={scrollRef}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    'flex flex-col max-w-[90%]',
                    msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  )}
                >
                  <div className={cn(
                    'px-4 py-3 rounded-2xl text-sm leading-relaxed backdrop-blur-md border',
                    msg.role === 'user' 
                      ? 'bg-violet-600/20 border-violet-500/30 text-white rounded-br-none'
                      : 'bg-white/5 border-white/10 text-white/90 rounded-bl-none shadow-lg'
                  )}>
                    {msg.content}
                    
                    {/* Render Widgets inside Chat */}
                    {msg.type === 'widget' && msg.widgetData?.type === 'metrics' && (
                       <div className="grid grid-cols-2 gap-2 mt-3 w-full min-w-[280px]">
                          <MetricCard label="Utilidad Neta" value="$45,230" trend={12.5} color="emerald" />
                          <MetricCard label="Flujo Caja" value="$12,400" trend={-2.3} color="rose" />
                       </div>
                    )}

                    {msg.type === 'widget' && msg.widgetData?.type === 'action_call' && (
                       <div className="mt-3 w-full min-w-[280px]">
                          <ActionConfirm 
                             title="Iniciar Llamada Autónoma" 
                             description={`Llamando a ${msg.widgetData.target} para gestión de cobranza.`}
                             onConfirm={() => speak('Iniciando llamada ahora.')}
                             onCancel={() => speak('Llamada cancelada.')}
                             severity="medium"
                          />
                       </div>
                    )}

                  </div>
                  {msg.role === 'ai' && <span className="text-[10px] text-white/30 mt-1 ml-2">Zero Force AI</span>}
                </motion.div>
              ))}
              
              {aiState === 'processing' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 ml-4">
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-150" />
                 </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="relative flex items-center gap-2 p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                <button 
                   onClick={toggleListening}
                   className={cn(
                     "p-3 rounded-full transition-all duration-300 relative group overflow-hidden",
                     aiState === 'listening' ? "bg-red-500/20 text-red-400" : "hover:bg-violet-500/20 text-violet-300"
                   )}
                >
                  <Mic className="w-5 h-5 relative z-10" />
                  {aiState === 'listening' && (
                     <span className="absolute inset-0 bg-red-500/20 animate-ping rounded-full" />
                  )}
                </button>
                
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Comando Quantum..."
                  className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/30 px-2"
                />
                
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(139,0,255,0.4)]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex justify-center gap-4 mt-3">
                 <QuickAction icon={<Activity className="w-3 h-3" />} label="Estado" onClick={() => handleUserCommand('Estado del sistema')} />
                 <QuickAction icon={<Phone className="w-3 h-3" />} label="Llamar" onClick={() => handleUserCommand('Llamar a distribuidor')} />
                 <QuickAction icon={<Sparkles className="w-3 h-3" />} label="Insights" onClick={() => handleUserCommand('Generar insights')} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
   return (
      <button 
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-white/60 hover:text-white transition-all hover:scale-105"
      >
         {icon}
         {label}
      </button>
   )
}

// 1. Definir el material personalizado
const QuantumOrbMaterial = shaderMaterial(
  {
    uTime: 0,
    uPulse: 1,
    uHealth: 1,
    uMood: 0,
    uResolution: new THREE.Vector2(1000, 1000),
    uCameraPos: new THREE.Vector3(0, 0, 3),
  },
  QUANTUM_SHADERS.volumetricOrb.vertex,
  QUANTUM_SHADERS.volumetricOrb.fragment
)

// 2. Extender R3F
extend({ QuantumOrbMaterial })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      quantumOrbMaterial: any
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🧊 3D QUANTUM ORB (Ray Marching Volumetric)
// ═══════════════════════════════════════════════════════════════════════════════════════

function QuantumOrb({ state }: { state: AIState }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <OrbMesh state={state} />
        </Float>
      </Canvas>
    </div>
  )
}

function OrbMesh({ state }: { state: AIState }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((stateThree, delta) => {
    if (materialRef.current) {
      const u = materialRef.current.uniforms
      // Time update
      if (u.uTime) u.uTime.value = stateThree.clock.elapsedTime
      
      // Pulse sync (Heartbeat logic)
      const targetPulse = state === 'listening' ? 2.0 : state === 'speaking' ? 1.5 : 1.0
      if (u.uPulse) u.uPulse.value = THREE.MathUtils.lerp(
        u.uPulse.value ?? 1.0,
        targetPulse,
        0.1
      )
      
      // Mood sync (-1: Stress/Red, 0: Neutral/Violet, 1: Euphoric/Gold)
      let targetMood = 0.0
      if (state === 'listening') targetMood = -0.8 // Red-ish plasma
      if (state === 'processing') targetMood = 1.0 // Gold
      if (state === 'speaking') targetMood = 0.5 // Mixed
      
      if (u.uMood) u.uMood.value = THREE.MathUtils.lerp(
        u.uMood.value ?? 0.0,
        targetMood,
        0.05
      )
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 64, 64]} />
      {/* @ts-ignore - custom R3F extended material */}
      <quantumOrbMaterial 
        ref={materialRef} 
        transparent={true} 
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
