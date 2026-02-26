// @ts-nocheck
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Zap, 
  Eye, 
  Settings, 
  Palette, 
  Smartphone, 
  Tablet, 
  Monitor,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Code,
  Rocket
} from 'lucide-react'

import GlassWidget from '@/app/_components/premium/glassmorphism/GlassWidget'

// 🎨 Demo Configuration
const demoVariants = [
  {
    id: 'floating',
    name: 'Floating Widget',
    description: 'Widget flotante con glassmorphism premium',
    position: 'floating' as const,
    icon: Zap
  },
  {
    id: 'sidebar',
    name: 'Sidebar Widget',
    description: 'Widget lateral con acceso rápido',
    position: 'sidebar' as const,
    icon: Eye
  },
  {
    id: 'docked',
    name: 'Docked Widget',
    description: 'Widget anclado en el contenido',
    position: 'docked' as const,
    icon: Settings
  }
]

const aiCapabilities = [
  {
    id: 'predictive',
    name: 'Predicciones Inteligentes',
    description: 'IA anticipa acciones del usuario',
    icon: Sparkles,
    enabled: true
  },
  {
    id: 'voice',
    name: 'Control por Voz',
    description: 'Comandos de voz para el widget',
    icon: Volume2,
    enabled: true
  },
  {
    id: 'vrar',
    name: 'Soporte VR/AR',
    description: 'Integración con realidad virtual/aumentada',
    icon: Eye,
    enabled: true
  },
  {
    id: 'realtime',
    name: 'Validación Tiempo Real',
    description: 'Validación instantánea de formularios',
    icon: Code,
    enabled: true
  }
]

const themes = [
  { id: 'light', name: 'Claro', icon: Sun },
  { id: 'dark', name: 'Oscuro', icon: Moon },
  { id: 'auto', name: 'Automático', icon: Palette }
]

const devices = [
  { id: 'mobile', name: 'Móvil', icon: Smartphone, width: 375 },
  { id: 'tablet', name: 'Tablet', icon: Tablet, width: 768 },
  { id: 'desktop', name: 'Desktop', icon: Monitor, width: 1200 }
]

// 🎯 Main Demo Page Component
export default function GlassWidgetDemo() {
  const [selectedVariant, setSelectedVariant] = useState('floating')
  const [selectedTheme, setSelectedTheme] = useState('auto')
  const [selectedDevice, setSelectedDevice] = useState('desktop')
  const [enabledCapabilities, setEnabledCapabilities] = useState(
    aiCapabilities.reduce((acc, cap) => ({ ...acc, [cap.id]: cap.enabled }), {})
  )
  const [isWidgetExpanded, setIsWidgetExpanded] = useState(false)
  const [showCode, setShowCode] = useState(false)

  // 🔄 Toggle Capability
  const toggleCapability = (capabilityId: string) => {
    setEnabledCapabilities(prev => ({
      ...prev,
      [capabilityId]: !prev[capabilityId]
    }))
  }

  // 🎨 Generate Code Snippet
  const generateCode = () => {
    const currentVariant = demoVariants.find(v => v.id === selectedVariant)
    const currentTheme = themes.find(t => t.id === selectedTheme)
    
    return `// 🚀 GlassWidget Premium Implementation
import GlassWidget from '@/app/_components/premium/glassmorphism/GlassWidget'

export default function MyComponent() {
  return (
    <GlassWidget
      position="${currentVariant?.position}"
      theme="${selectedTheme}"
      aiCapabilities={{
        predictive: ${enabledCapabilities.predictive},
        voiceControl: ${enabledCapabilities.voice},
        realTimeValidation: ${enabledCapabilities.realtime},
        vrArSupport: ${enabledCapabilities.vrar},
        contextualAssistant: true
      }}
      defaultExpanded={false}
      onToggle={(expanded) => console.log('Widget expanded:', expanded)}
      className="custom-class"
    />
  )
}`
  }

  // 📱 Device Simulator Width
  const getDeviceWidth = () => {
    const device = devices.find(d => d.id === selectedDevice)
    return device?.width || 1200
  }

  // 🎯 Current Variant Configuration
  const currentVariant = demoVariants.find(v => v.id === selectedVariant)
  const currentDevice = devices.find(d => d.id === selectedDevice)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* 🎨 Header */}
      <motion.div 
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4"
            >
              <Rocket className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              GlassWidget Premium
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experiencia de usuario premium con glassmorphism avanzado, IA predictiva y animaciones cinematográficas
            </p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ⚙️ Configuration Panel */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* 🎨 Variant Selection */}
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Posición del Widget
              </h3>
              <div className="space-y-3">
                {demoVariants.map((variant) => {
                  const Icon = variant.icon
                  return (
                    <motion.button
                      key={variant.id}
                      className={`glass-button w-full text-left ${
                        selectedVariant === variant.id 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                          : ''
                      }`}
                      onClick={() => setSelectedVariant(variant.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium">{variant.name}</div>
                          <div className="text-xs opacity-75">{variant.description}</div>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* 🎨 Theme Selection */}
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Tema Visual
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {themes.map((theme) => {
                  const Icon = theme.icon
                  return (
                    <motion.button
                      key={theme.id}
                      className={`glass-button flex flex-col items-center py-3 ${
                        selectedTheme === theme.id 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                          : ''
                      }`}
                      onClick={() => setSelectedTheme(theme.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs">{theme.name}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* 🤖 AI Capabilities */}
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Capacidades de IA
              </h3>
              <div className="space-y-3">
                {aiCapabilities.map((capability) => {
                  const Icon = capability.icon
                  return (
                    <motion.div
                      key={capability.id}
                      className="flex items-center justify-between p-3 glass-button"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3 text-purple-500" />
                        <div>
                          <div className="font-medium text-sm">{capability.name}</div>
                          <div className="text-xs opacity-75">{capability.description}</div>
                        </div>
                      </div>
                      <motion.button
                        className={`w-12 h-6 rounded-full relative ${
                          enabledCapabilities[capability.id]
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        onClick={() => toggleCapability(capability.id)}
                        whileTap={{ scale: 0.9 }}
                      >
                        <motion.div
                          className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                          animate={{
                            left: enabledCapabilities[capability.id] ? '22px' : '2px'
                          }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        />
                      </motion.button>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* 📱 Device Simulator */}
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Vista Previa
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {devices.map((device) => {
                  const Icon = device.icon
                  return (
                    <motion.button
                      key={device.id}
                      className={`glass-button flex flex-col items-center py-3 ${
                        selectedDevice === device.id 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                          : ''
                      }`}
                      onClick={() => setSelectedDevice(device.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs">{device.name}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* 💻 Code Preview Toggle */}
            <motion.button
              className="glass-button w-full bg-gradient-to-r from-green-500 to-blue-500 text-white"
              onClick={() => setShowCode(!showCode)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Code className="w-5 h-5 mr-2" />
              {showCode ? 'Ocultar Código' : 'Ver Código'}
            </motion.button>
          </motion.div>

          {/* 🎪 Demo Area */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* 📱 Device Simulator */}
            <div className="glass-card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Vista Previa: {currentDevice?.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              <div 
                className="mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden"
                style={{ 
                  width: '100%', 
                  maxWidth: `${getDeviceWidth()}px`,
                  minHeight: '600px',
                  position: 'relative'
                }}
              >
                {/* 🎨 Demo Content */}
                <div className="p-8 h-full relative">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mb-8"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                      Dashboard Demo
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Interactúa con el widget de IA premium
                    </p>
                  </motion.div>

                  {/* 📊 Demo Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <motion.div 
                      className="glass-card text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-2xl font-bold text-blue-600">$125,430</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Ventas Totales</div>
                    </motion.div>
                    <motion.div 
                      className="glass-card text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-2xl font-bold text-green-600">+23%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Crecimiento</div>
                    </motion.div>
                  </div>

                  {/* 🎯 GlassWidget Implementation */}
                  <GlassWidget
                    position={currentVariant?.position}
                    theme={selectedTheme}
                    aiCapabilities={{
                      predictive: enabledCapabilities.predictive,
                      voiceControl: enabledCapabilities.voice,
                      realTimeValidation: enabledCapabilities.realtime,
                      vrArSupport: enabledCapabilities.vrar,
                      contextualAssistant: true
                    }}
                    isExpanded={isWidgetExpanded}
                    onToggle={setIsWidgetExpanded}
                    className="shadow-2xl"
                  />
                </div>
              </div>
            </div>

            {/* 💻 Code Preview */}
            {showCode && (
              <motion.div 
                className="glass-card"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Código de Implementación
                </h3>
                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{generateCode()}</code>
                </pre>
              </motion.div>
            )}

            {/* 🚀 Features Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <motion.div 
                className="glass-card"
                whileHover={{ scale: 1.02, rotateY: 2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  🪟 Glassmorphism Avanzado
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Backdrop-filter optimizado con transiciones fluidas y efectos de brillo premium
                </p>
              </motion.div>

              <motion.div 
                className="glass-card"
                whileHover={{ scale: 1.02, rotateY: -2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  🤖 IA Predictiva
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Motor de predicción que anticipa acciones basadas en patrones de uso
                </p>
              </motion.div>

              <motion.div 
                className="glass-card"
                whileHover={{ scale: 1.02, rotateY: 2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  ⚡ Rendimiento Óptimo
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tiempos de respuesta &lt;100ms con optimizaciones de hardware acceleration
                </p>
              </motion.div>

              <motion.div 
                className="glass-card"
                whileHover={{ scale: 1.02, rotateY: -2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  ♿ Accesibilidad Total
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cumplimiento WCAG 2.2 AAA con navegación por voz y teclado
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}