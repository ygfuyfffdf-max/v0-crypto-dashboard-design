// @ts-nocheck
"use client"

import ZeroForceVoiceWidget from "@/app/_components/premium/voice/ZeroForceVoiceWidget"
import { AnimatePresence, motion } from "framer-motion"
import {
  Activity,
  Code,
  Cpu,
  Monitor,
  Moon,
  Palette,
  Radio,
  Settings,
  Smartphone,
  Sparkles,
  Sun,
  Tablet,
  Waves,
  Zap,
} from "lucide-react"
import { useEffect, useState } from "react"

interface DemoConfig {
  theme: "light" | "dark" | "auto"
  position: "floating" | "docked" | "sidebar"
  device: "desktop" | "tablet" | "mobile"
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
    theme: "auto",
    position: "floating",
    device: "desktop",
    showCode: false,
    showSettings: false,
    autoGreeting: true,
  })

  const [metrics, setMetrics] = useState<VoiceMetrics>({
    latency: 0,
    accuracy: 0,
    emotion: "professional",
    confidence: 0,
  })

  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [lastCommand, setLastCommand] = useState("")

  useEffect(() => {
    // Simulate real-time metrics updates
    const metricsInterval = setInterval(() => {
      setMetrics((prev) => ({
        latency: Math.floor(Math.random() * 50) + 150, // 150-200ms
        accuracy: Math.floor(Math.random() * 10) + 90, // 90-100%
        emotion: ["calm", "professional", "excited"][Math.floor(Math.random() * 3)],
        confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
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
      desktop: "w-full max-w-4xl h-96",
      tablet: "w-96 h-96",
      mobile: "w-80 h-96",
    }

    return (
      <motion.div
        className={`${deviceStyles[config.device]} relative mx-auto overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 shadow-2xl`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Device Frame */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent" />

        {/* Status Bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            <span className="text-xs text-white/70">Zero Force Active</span>
          </div>
          <div className="flex items-center space-x-1">
            <Activity className="h-3 w-3 text-white/60" />
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
        {config.device === "mobile" && (
          <div className="absolute bottom-2 left-1/2 h-1 w-20 -translate-x-1/2 transform rounded-full bg-white/20" />
        )}
      </motion.div>
    )
  }

  const MetricsDisplay = () => (
    <motion.div
      className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="mb-4 flex items-center space-x-2 text-lg font-bold text-white">
        <Cpu className="h-5 w-5 text-violet-400" />
        <span>Métricas de Rendimiento</span>
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Latencia</span>
          <div className="flex items-center space-x-2">
            <motion.div
              className="h-2 w-2 rounded-full"
              animate={{
                backgroundColor: metrics.latency < 200 ? "#10b981" : "#f59e0b",
              }}
            />
            <span className="font-mono text-sm text-white">{metrics.latency}ms</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Precisión</span>
          <span className="font-mono text-sm text-white">{metrics.accuracy}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Confianza</span>
          <span className="font-mono text-sm text-white">{metrics.confidence}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Estado Emocional</span>
          <motion.div
            className="rounded-full px-2 py-1 text-xs font-medium"
            animate={{
              backgroundColor:
                metrics.emotion === "excited"
                  ? "rgba(245, 158, 11, 0.2)"
                  : metrics.emotion === "calm"
                    ? "rgba(59, 130, 246, 0.2)"
                    : "rgba(139, 92, 246, 0.2)",
              color:
                metrics.emotion === "excited"
                  ? "#f59e0b"
                  : metrics.emotion === "calm"
                    ? "#3b82f6"
                    : "#8b5cf6",
            }}
          >
            {metrics.emotion === "excited"
              ? "Energizado"
              : metrics.emotion === "calm"
                ? "Tranquilo"
                : "Profesional"}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )

  const ConfigPanel = () => (
    <motion.div
      className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="mb-4 flex items-center space-x-2 text-lg font-bold text-white">
        <Settings className="h-5 w-5 text-violet-400" />
        <span>Configuración</span>
      </h3>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm text-white/70">Tema</label>
          <div className="flex space-x-2">
            {["light", "dark", "auto"].map((theme) => (
              <button
                key={theme}
                onClick={() => setConfig((prev) => ({ ...prev, theme: theme as any }))}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  config.theme === theme
                    ? "bg-violet-500 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {theme === "light" && <Sun className="mr-1 inline h-4 w-4" />}
                {theme === "dark" && <Moon className="mr-1 inline h-4 w-4" />}
                {theme === "auto" && <Monitor className="mr-1 inline h-4 w-4" />}
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">Dispositivo</label>
          <div className="flex space-x-2">
            {["desktop", "tablet", "mobile"].map((device) => (
              <button
                key={device}
                onClick={() => setConfig((prev) => ({ ...prev, device: device as any }))}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  config.device === device
                    ? "bg-violet-500 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {device === "desktop" && <Monitor className="mr-1 inline h-4 w-4" />}
                {device === "tablet" && <Tablet className="mr-1 inline h-4 w-4" />}
                {device === "mobile" && <Smartphone className="mr-1 inline h-4 w-4" />}
                {device.charAt(0).toUpperCase() + device.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">Posición</label>
          <select
            value={config.position}
            onChange={(e) => setConfig((prev) => ({ ...prev, position: e.target.value as any }))}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
          >
            <option value="floating">Flotante</option>
            <option value="docked">Acoplado</option>
            <option value="sidebar">Barra lateral</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Auto-saludo</span>
          <button
            onClick={() => setConfig((prev) => ({ ...prev, autoGreeting: !prev.autoGreeting }))}
            className={`h-6 w-12 rounded-full transition-colors ${
              config.autoGreeting ? "bg-violet-500" : "bg-white/20"
            }`}
          >
            <motion.div
              className="h-5 w-5 rounded-full bg-white shadow-lg"
              animate={{ x: config.autoGreeting ? "26px" : "2px" }}
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
          className="overflow-hidden rounded-2xl border border-white/20 bg-slate-900"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between border-b border-white/20 p-4">
            <div className="flex items-center space-x-2">
              <Code className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium text-white">Código de Integración</span>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(generateCode())}
              className="rounded-lg bg-violet-500 px-3 py-1 text-xs text-white transition-colors hover:bg-violet-600"
            >
              Copiar
            </button>
          </div>
          <pre className="overflow-x-auto p-4 text-sm text-green-400">
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
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="mb-2 text-4xl font-bold text-white">
          Zero Force Voice Widget
          <motion.span
            className="ml-2 inline-block"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎙️
          </motion.span>
        </h1>
        <p className="text-xl text-white/70">Voz Cuántica Premium con ElevenLabs</p>

        <motion.div
          className="mt-4 inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-2 text-sm font-medium text-white"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="h-4 w-4" />
          <span>IA ID: spPXlKT5a4JMfbhPRAzA</span>
        </motion.div>
      </motion.div>

      {/* Controls */}
      <motion.div
        className="mb-8 flex flex-wrap justify-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => setConfig((prev) => ({ ...prev, showCode: !prev.showCode }))}
          className={`flex items-center space-x-2 rounded-xl px-6 py-3 font-semibold transition-all ${
            config.showCode
              ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
              : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          <Code className="h-5 w-5" />
          <span>{config.showCode ? "Ocultar" : "Mostrar"} Código</span>
        </button>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-green-500/40"
        >
          <Zap className="h-5 w-5" />
          <span>Reiniciar Demo</span>
        </button>
      </motion.div>

      {/* Code Display */}
      <div className="mx-auto mb-8 max-w-6xl">
        <CodeDisplay />
      </div>

      {/* Main Demo */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
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
        className="mx-auto mt-12 max-w-6xl rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-white">Características Premium</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-purple-500">
              <Waves className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Streaming Ultra Rápido</h3>
            <p className="text-sm text-white/70">Latencia &lt;200ms con ElevenLabs Turbo v2.5</p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
              <Cpu className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">IA Emocional</h3>
            <p className="text-sm text-white/70">Respuestas adaptativas según contexto</p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
              <Radio className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Deepgram STT</h3>
            <p className="text-sm text-white/70">Reconocimiento de voz en tiempo real</p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500">
              <Palette className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Glassmorphism</h3>
            <p className="text-sm text-white/70">Diseño premium con efectos visuales</p>
          </div>
        </div>
      </motion.div>

      {/* Transcription Log */}
      <motion.div
        className="mx-auto mt-6 max-w-6xl rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="mb-4 text-lg font-bold text-white">Registro de Voz</h3>

        <div className="max-h-40 space-y-2 overflow-y-auto">
          {transcript && (
            <motion.div
              className="rounded-lg border border-white/20 bg-white/10 p-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-white/60">Última transcripción</span>
                <span className="text-xs text-white/60">{metrics.confidence}% confianza</span>
              </div>
              <p className="text-sm text-white/90">{transcript}</p>
            </motion.div>
          )}

          {lastCommand && (
            <motion.div
              className="rounded-lg border border-violet-500/30 bg-violet-500/20 p-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="mb-1 flex items-center justify-between">
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
