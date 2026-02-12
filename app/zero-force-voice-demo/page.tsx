'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  Volume2, 
  Brain, 
  Zap, 
  Settings,
  Activity,
  Radio,
  Waves,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet,
  Code,
  Palette,
  Cpu,
  Sparkles
} from 'lucide-react'
import ZeroForceVoiceWidget from '@/app/_components/premium/voice/ZeroForceVoiceWidget'

interface DemoConfig {
  theme: 'light' | 'dark' | 'auto'
  position: 'floating' | 'docked' | 'sidebar'
  device: 'desktop' | 'tablet' | 'mobile'
  showCode: boolean
  showSettings: boolean
  autoGreeting: boolean
}

interface VoiceMetrics {
  latency: number
  accuracy: number
  emotion: string
  confidence: number
}

export default function ZeroForceVoiceDemo() {
  const [config, setConfig] = useState<DemoConfig>({
    theme: 'auto',
    position: 'floating',
    device: 'desktop',
    showCode: false,
    showSettings: false,
    autoGreeting: true
  })

  const [metrics, setMetrics] = useState<VoiceMetrics>({
    latency: 0,
    accuracy: 0,
    emotion: 'professional',
    confidence: 0
  })

  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [lastCommand, setLastCommand] = useState('')

  useEffect(() => {
    // Simulate real-time metrics updates
    const metricsInterval = setInterval(() => {
      setMetrics(prev => ({
        latency: Math.floor(Math.random() * 50) + 150, // 150-200ms
        accuracy: Math.floor(Math.random() * 10) + 90, // 90-100%
        emotion: ['calm', 'professional', 'excited'][Math.floor(Math.random() * 3)],
        confidence: Math.floor(Math.random() * 20) + 80 // 80-100%
      }))
    }, 2000)

    return () => clearInterval(metricsInterval)
  }, [])

  const handleVoiceCommand = (command: string) => {
    setLastCommand(command)
    
    // Simulate command processing
    setTimeout(() => {
      setTranscript(`Procesando: "${command}"`)
    }, 500)
  }

  const handleTranscription = (text: string) => {
    setTranscript(text)
  }

  const generateCode = () => {
    return `// Zero Force Voice Widget Integration
import ZeroForceVoiceWidget from '@/components/premium/voice/ZeroForceVoiceWidget'

export default function MyApp() {
  const handleVoiceCommand = (command: string) => {
    console.log('Voice command:', command)
    // Your logic here
  }

  const handleTranscription = (text: string) => {
    console.log('Transcription:', text)
  }

  return (
    <ZeroForceVoiceWidget
      isExpanded={true}
      position="${config.position}"
      theme="${config.theme}"
      onVoiceCommand={handleVoiceCommand}
      onTranscription={handleTranscription}
      className="custom-class"
    />
  )
}`
  }

  const DeviceSimulator = () => {
    const deviceStyles = {
      desktop: 'w-full max-w-4xl h-96',
      tablet: 'w-96 h-96',
      mobile: 'w-80 h-96'
    }

    return (
      <motion.div
        className={`${deviceStyles[config.device]} mx-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl border border-white/20 p-6 relative overflow-hidden`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Device Frame */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none" />
        
        {/* Status Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-white/70">Zero Force Active</span>
          </div>
          <div className="flex items-center space-x-1">
            <Activity className="w-3 h-3 text-white/60" />
            <span className="text-xs text-white/60">{metrics.latency}ms</span>
          </div>
        </div>

        {/* Voice Widget */}
        <ZeroForceVoiceWidget
          isExpanded={true}
          position={config.position}
          theme={config.theme}
          onVoiceCommand={handleVoiceCommand}
          onTranscription={handleTranscription}
          className="zero-force-voice-widget"
        />

        {/* Device-specific elements */}
        {config.device === 'mobile' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-white/20 rounded-full" />
        )}
      </motion.div>
    )
  }

  const MetricsDisplay = () => (
    <motion.div
      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
        <Cpu className="w-5 h-5 text-violet-400" />
        <span>Métricas de Rendimiento</span>
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Latencia</span>
          <div className="flex items-center space-x-2">
            <motion.div
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: metrics.latency < 200 ? '#10b981' : '#f59e0b'
              }}
            />
            <span className="text-sm font-mono text-white">{metrics.latency}ms</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Precisión</span>
          <span className="text-sm font-mono text-white">{metrics.accuracy}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Confianza</span>
          <span className="text-sm font-mono text-white">{metrics.confidence}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Estado Emocional</span>
          <motion.div
            className="px-2 py-1 rounded-full text-xs font-medium"
            animate={{
              backgroundColor: 
                metrics.emotion === 'excited' ? 'rgba(245, 158, 11, 0.2)' :
                metrics.emotion === 'calm' ? 'rgba(59, 130, 246, 0.2)' :
                'rgba(139, 92, 246, 0.2)',
              color:
                metrics.emotion === 'excited' ? '#f59e0b' :
                metrics.emotion === 'calm' ? '#3b82f6' :
                '#8b5cf6'
            }}
          >
            {metrics.emotion === 'excited' ? 'Energizado' :
             metrics.emotion === 'calm' ? 'Tranquilo' : 'Profesional'}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )

  const ConfigPanel = () => (
    <motion.div
      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
        <Settings className="w-5 h-5 text-violet-400" />
        <span>Configuración</span>
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-2">Tema</label>
          <div className="flex space-x-2">
            {['light', 'dark', 'auto'].map((theme) => (
              <button
                key={theme}
                onClick={() => setConfig(prev => ({ ...prev, theme: theme as any }))}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  config.theme === theme
                    ? 'bg-violet-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {theme === 'light' && <Sun className="w-4 h-4 inline mr-1" />}
                {theme === 'dark' && <Moon className="w-4 h-4 inline mr-1" />}
                {theme === 'auto' && <Monitor className="w-4 h-4 inline mr-1" />}
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-white/70 mb-2">Dispositivo</label>
          <div className="flex space-x-2">
            {['desktop', 'tablet', 'mobile'].map((device) => (
              <button
                key={device}
                onClick={() => setConfig(prev => ({ ...prev, device: device as any }))}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  config.device === device
                    ? 'bg-violet-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {device === 'desktop' && <Monitor className="w-4 h-4 inline mr-1" />}
                {device === 'tablet' && <Tablet className="w-4 h-4 inline mr-1" />}
                {device === 'mobile' && <Smartphone className="w-4 h-4 inline mr-1" />}
                {device.charAt(0).toUpperCase() + device.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-white/70 mb-2">Posición</label>
          <select
            value={config.position}
            onChange={(e) => setConfig(prev => ({ ...prev, position: e.target.value as any }))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="floating">Flotante</option>
            <option value="docked">Acoplado</option>
            <option value="sidebar">Barra lateral</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Auto-saludo</span>
          <button
            onClick={() => setConfig(prev => ({ ...prev, autoGreeting: !prev.autoGreeting }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              config.autoGreeting ? 'bg-violet-500' : 'bg-white/20'
            }`}
          >
            <motion.div
              className="w-5 h-5 bg-white rounded-full shadow-lg"
              animate={{ x: config.autoGreeting ? '26px' : '2px' }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </button>
        </div>
      </div>
    </motion.div>
  )

  const CodeDisplay = () => (
    <AnimatePresence>
      {config.showCode && (
        <motion.div
          className="bg-slate-900 border border-white/20 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-white">Código de Integración</span>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(generateCode())}
              className="px-3 py-1 bg-violet-500 hover:bg-violet-600 text-white text-xs rounded-lg transition-colors"
            >
              Copiar
            </button>
          </div>
          <pre className="p-4 text-sm text-green-400 overflow-x-auto">
            <code>{generateCode()}</code>
          </pre>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Zero Force Voice Widget
          <motion.span
            className="inline-block ml-2"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎙️
          </motion.span>
        </h1>
        <p className="text-xl text-white/70">Voz Cuántica Premium con ElevenLabs</p>
        
        <motion.div
          className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full text-white text-sm font-medium"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-4 h-4" />
          <span>IA ID: spPXlKT5a4JMfbhPRAzA</span>
        </motion.div>
      </motion.div>

      {/* Controls */}
      <motion.div
        className="flex flex-wrap justify-center gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => setConfig(prev => ({ ...prev, showCode: !prev.showCode }))}
          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
            config.showCode
              ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <Code className="w-5 h-5" />
          <span>{config.showCode ? 'Ocultar' : 'Mostrar'} Código</span>
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all flex items-center space-x-2"
        >
          <Zap className="w-5 h-5" />
          <span>Reiniciar Demo</span>
        </button>
      </motion.div>

      {/* Code Display */}
      <div className="max-w-6xl mx-auto mb-8">
        <CodeDisplay />
      </div>

      {/* Main Demo */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Simulator */}
        <div className="lg:col-span-2">
          <DeviceSimulator />
        </div>
        
        {/* Configuration Panel */}
        <div>
          <ConfigPanel />
          <div className="mt-6">
            <MetricsDisplay />
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <motion.div
        className="max-w-6xl mx-auto mt-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Características Premium
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Waves className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Streaming Ultra Rápido</h3>
            <p className="text-sm text-white/70">Latencia &lt;200ms con ElevenLabs Turbo v2.5</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">IA Emocional</h3>
            <p className="text-sm text-white/70">Respuestas adaptativas según contexto</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Radio className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Deepgram STT</h3>
            <p className="text-sm text-white/70">Reconocimiento de voz en tiempo real</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Glassmorphism</h3>
            <p className="text-sm text-white/70">Diseño premium con efectos visuales</p>
          </div>
        </div>
      </motion.div>

      {/* Transcription Log */}
      <motion.div
        className="max-w-6xl mx-auto mt-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Registro de Voz</h3>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {transcript && (
            <motion.div
              className="p-3 bg-white/10 rounded-lg border border-white/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/60">Última transcripción</span>
                <span className="text-xs text-white/60">{metrics.confidence}% confianza</span>
              </div>
              <p className="text-sm text-white/90">{transcript}</p>
            </motion.div>
          )}
          
          {lastCommand && (
            <motion.div
              className="p-3 bg-violet-500/20 rounded-lg border border-violet-500/30"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/60">Último comando</span>
                <span className="text-xs text-white/60">{metrics.emotion}</span>
              </div>
              <p className="text-sm text-white/90">{lastCommand}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}