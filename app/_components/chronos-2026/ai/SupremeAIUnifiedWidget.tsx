'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Stars, Text, Trail, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { Mic, Send, Sparkles as SparklesIcon, Maximize2, Minimize2, Activity, Brain, Radio, Command, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useZeroBrain } from '@/app/_hooks/useZeroBrain'
import { Button } from '@/app/_components/ui/button'
import { Input } from '@/app/_components/ui/input'

// --- 3D Components ---

const AICoreOrb = ({ active, processing }: { active: boolean; processing: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()
    // Dynamic pulsing
    const scale = active ? 1.2 + Math.sin(t * 3) * 0.1 : 1 + Math.sin(t) * 0.05
    meshRef.current.scale.setScalar(scale)
    meshRef.current.rotation.y = t * 0.5
    meshRef.current.rotation.z = t * 0.2
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={processing ? "#a855f7" : active ? "#3b82f6" : "#64748b"}
          emissive={processing ? "#6b21a8" : active ? "#1d4ed8" : "#000000"}
          emissiveIntensity={active ? 0.8 : 0.2}
          distort={active ? 0.6 : 0.3}
          speed={active ? 4 : 2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      {active && (
        <group>
             <Sparkles count={50} scale={3} size={2} speed={0.4} opacity={0.5} color="#60a5fa" />
             <Trail width={0.2} length={4} color="#3b82f6" attenuation={(t) => t * t}>
                <mesh position={[1.2, 0, 0]}>
                    <sphereGeometry args={[0.1, 16, 16]} />
                    <meshBasicMaterial color="#60a5fa" />
                </mesh>
             </Trail>
        </group>
      )}
    </Float>
  )
}

const BackgroundScene = () => {
  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
    </>
  )
}

// --- Main Widget Component ---

interface Message {
  id: string
  role: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
}

export const SupremeAIUnifiedWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'ai',
      content: 'Chronos Supreme AI en línea. Sistemas cuánticos sincronizados. ¿Cuál es su comando, Director?',
      timestamp: new Date()
    }
  ])
  const [isListening, setIsListening] = useState(false)
  
  // Integration with ZeroBrain hook
  const { processCommand, isProcessing } = useZeroBrain()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newUserMsg])
    setInputValue('')

    // Process with ZeroBrain
    const result = await processCommand(newUserMsg.content)

    const newAiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: result.message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newAiMsg])
  }

  const toggleListening = () => {
    setIsListening(!isListening)
    // Here we would integrate actual speech-to-text
    if (!isListening) {
      setTimeout(() => {
        setInputValue("Análisis de rentabilidad mensual")
        setIsListening(false)
      }, 2000)
    }
  }

  // Animation variants
  const containerVariants = {
    collapsed: { 
      width: '60px', 
      height: '60px', 
      borderRadius: '30px',
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    open: { 
      width: '380px', 
      height: '500px', 
      borderRadius: '24px',
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    expanded: { 
      width: '800px', 
      height: '600px', 
      borderRadius: '24px',
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  }

  return (
    <motion.div
      className={cn(
        "fixed bottom-8 right-8 z-50 flex flex-col overflow-hidden",
        "backdrop-blur-2xl bg-black/40 border border-white/10 shadow-2xl shadow-purple-500/20",
        "text-white font-sans"
      )}
      variants={containerVariants}
      initial="collapsed"
      animate={isExpanded ? "expanded" : isOpen ? "open" : "collapsed"}
    >
      {/* Header / Orb Trigger */}
      <div 
        className="relative w-full h-16 flex items-center justify-between px-4 shrink-0 cursor-pointer bg-gradient-to-r from-white/5 to-transparent"
        onClick={() => !isOpen && setIsOpen(true)}
      >
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
                 {/* Mini 3D Scene for the Icon */}
                 <Canvas className="w-full h-full pointer-events-none">
                    <ambientLight intensity={0.8} />
                    <AICoreOrb active={isOpen} processing={isProcessing} />
                 </Canvas>
            </div>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col"
                >
                    <span className="font-bold text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        CHRONOS AI
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        SYSTEM ONLINE
                    </span>
                </motion.div>
            )}
        </div>

        {isOpen && (
            <div className="flex items-center gap-2">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                >
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        setIsOpen(false); 
                        setIsExpanded(false); 
                    }}
                >
                    <X size={16} />
                </Button>
            </div>
        )}
      </div>

      {/* Main Content Area */}
      <AnimatePresence>
        {isOpen && (
            <motion.div 
                className="flex-1 flex flex-col md:flex-row overflow-hidden relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* 3D Visualization Panel (Visible only when expanded or as background) */}
                <div className={cn(
                    "relative transition-all duration-500",
                    isExpanded ? "w-1/2 h-full border-r border-white/10" : "absolute inset-0 -z-10 opacity-20"
                )}>
                    <Canvas>
                        <BackgroundScene />
                        <AICoreOrb active={true} processing={isProcessing} />
                    </Canvas>
                    
                    {isExpanded && (
                        <div className="absolute bottom-4 left-4 p-4 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 max-w-[300px]">
                            <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Estado del Sistema</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-300">Carga Neural</span>
                                    <span className="text-blue-400">24%</span>
                                </div>
                                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-blue-500" 
                                        initial={{ width: "0%" }}
                                        animate={{ width: "24%" }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-300">Sincronización Cuántica</span>
                                    <span className="text-purple-400">99.9%</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat / Interaction Panel */}
                <div className={cn(
                    "flex flex-col h-full bg-black/20 backdrop-blur-md",
                    isExpanded ? "w-1/2" : "w-full"
                )}>
                    
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "flex w-full",
                                    msg.role === 'user' ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed backdrop-blur-sm",
                                    msg.role === 'user' 
                                        ? "bg-blue-600/80 text-white rounded-br-none border border-blue-500/50" 
                                        : "bg-white/10 text-gray-100 rounded-bl-none border border-white/10"
                                )}>
                                    {msg.content}
                                    <div className="text-[10px] opacity-50 mt-1 text-right">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {isProcessing && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="bg-white/5 p-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-2 items-center">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/10 bg-black/40">
                         {/* Quick Actions (Suggestions) */}
                        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                            {['Analizar ventas', 'Crear cliente', 'Estado financiero'].map((action) => (
                                <button
                                    key={action}
                                    onClick={() => { setInputValue(action); }}
                                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 whitespace-nowrap transition-colors"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "rounded-full transition-all duration-300",
                                    isListening ? "bg-red-500/20 text-red-400 animate-pulse" : "text-gray-400 hover:text-white"
                                )}
                                onClick={toggleListening}
                            >
                                <Mic size={20} />
                            </Button>
                            
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Escriba un comando o pregunte..."
                                className="bg-white/5 border-white/10 focus-visible:ring-blue-500/50 text-white placeholder:text-gray-500"
                            />
                            
                            <Button
                                size="icon"
                                className="rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isProcessing}
                            >
                                <Send size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
