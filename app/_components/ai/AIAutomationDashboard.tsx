// 🤖 AI AUTOMATION DASHBOARD - CHRONOS INFINITY
// Sistema completo de automatización inteligente que responde dudas y llena formularios

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Brain,
  FileText,
  Database,
  Settings,
  Send,
  Bot,
  User,
  Zap,
  Plus,
  Download,
  Filter,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
  Sparkles,
  Wand,
  Target,
  Lightbulb,
  Star
} from 'lucide-react';
import { Card } from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Input } from '@/app/_components/ui/input';
import { Badge } from '@/app/_components/ui/badge';
import { Progress } from '@/app/_components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_components/ui/tabs';
import { useAI } from '@/app/_hooks/useAI';
import { useVoice } from '@/app/_hooks/useVoice';
import { AIService } from '@/app/_lib/services/ai/ai-service';
import { FormAutomationService } from '@/app/_lib/services/ai/form-automation-service';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  action?: {
    type: 'fill_field' | 'submit_form' | 'query_data' | 'create_record';
    payload: any;
  };
  context?: {
    formId?: string;
    intent?: string;
    confidence?: number;
  };
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: string;
  examples: string[];
}

interface AIStats {
  totalConversations: number;
  automatedForms: number;
  successRate: number;
  averageResponseTime: number;
  activeUsers: number;
}

const AIAutomationDashboard: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [aiStats, setAIStats] = useState<AIStats>({
    totalConversations: 1247,
    automatedForms: 892,
    successRate: 94.5,
    averageResponseTime: 1.2,
    activeUsers: 23
  });
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { sendMessage, isProcessing } = useAI();
  const { startListening, stopListening, isSupported: voiceSupported } = useVoice();

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Registrar Venta',
      description: 'Registra una venta completa con cliente y productos',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-600',
      action: 'register_sale',
      examples: [
        'Registrar venta a Juan García por $5,000',
        'Nueva venta de laptops Dell',
        'Venta con tarjeta de crédito'
      ]
    },
    {
      id: '2',
      title: 'Gestionar Gasto',
      description: 'Registra gastos de operación o compras',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-orange-500 to-red-600',
      action: 'manage_expense',
      examples: [
        'Gasto de $1,200 en papelería',
        'Pago de servicios de internet',
        'Compra de material de oficina'
      ]
    },
    {
      id: '3',
      title: 'Nuevo Cliente',
      description: 'Crea un nuevo cliente en el sistema',
      icon: <User className="w-6 h-6" />,
      color: 'from-blue-500 to-purple-600',
      action: 'create_client',
      examples: [
        'Agregar cliente María López',
        'Nuevo cliente con RFC',
        'Cliente corporativo importante'
      ]
    },
    {
      id: '4',
      title: 'Consultar Datos',
      description: 'Obtén información de ventas, clientes o productos',
      icon: <Search className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-600',
      action: 'query_data',
      examples: [
        'Ventas del mes actual',
        'Clientes con deuda',
        'Productos más vendidos'
      ]
    },
    {
      id: '5',
      title: 'Generar Reporte',
      description: 'Crea reportes automáticos con gráficos',
      icon: <Database className="w-6 h-6" />,
      color: 'from-indigo-500 to-blue-600',
      action: 'generate_report',
      examples: [
        'Reporte de ventas semanal',
        'Estado de cuentas por cobrar',
        'Análisis de rentabilidad'
      ]
    },
    {
      id: '6',
      title: 'Automatización Avanzada',
      description: 'Configura flujos complejos de automatización',
      icon: <Wand className="w-6 h-6" />,
      color: 'from-violet-500 to-purple-600',
      action: 'advanced_automation',
      examples: [
        'Automatizar facturación mensual',
        'Recordatorios de pago',
        'Actualización de inventarios'
      ]
    }
  ];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    // Mensaje de bienvenida inicial con saludo según hora del día
    const hour = new Date().getHours();
    let greeting = '¡Hola! Soy tu asistente inteligente de CHRONOS INFINITY';
    
    if (hour >= 6 && hour < 12) {
      greeting = '¡Buenos días! Soy tu asistente inteligente de CHRONOS INFINITY';
    } else if (hour >= 12 && hour < 20) {
      greeting = '¡Buenas tardes! Soy tu asistente inteligente de CHRONOS INFINITY';
    } else {
      greeting = '¡Buenas noches! Soy tu asistente inteligente de CHRONOS INFINITY';
    }

    const welcomeMessage: AIMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `${greeting}. Puedo ayudarte a registrar ventas, gestionar gastos, crear clientes, generar reportes y mucho más. Solo dime qué necesitas hacer y lo haré por ti automáticamente. ¿En qué puedo ayudarte hoy?`,
      timestamp: new Date(),
      context: { intent: 'welcome', confidence: 1.0 }
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Análisis de intención y contexto
      const aiResponse = await sendMessage({
        message: inputMessage,
        context: {
          conversationHistory: messages.slice(-10),
          systemContext: {
            userRole: 'admin',
            currentTime: new Date().toISOString(),
            availableActions: quickActions.map(a => a.action)
          }
        }
      });

      const assistantMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse.message,
        timestamp: new Date(),
        action: aiResponse.action ? {
          type: aiResponse.action.type as 'fill_field' | 'submit_form' | 'query_data' | 'create_record',
          payload: aiResponse.action.payload
        } : undefined,
        context: {
          intent: aiResponse.intent,
          confidence: aiResponse.confidence,
          formId: aiResponse.formId
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Ejecutar acción si existe
      if (aiResponse.action) {
        await executeAIAction(aiResponse.action);
      }

    } catch (error) {
      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.',
        timestamp: new Date(),
        context: { intent: 'error', confidence: 0 }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const executeAIAction = async (action: any) => {
    try {
      const formService = new FormAutomationService();
      
      switch (action.type) {
        case 'fill_field':
          await formService.autoFillForm(action.payload.formId, action.payload.fieldData);
          break;
        case 'submit_form':
          await formService.createRecord(action.payload);
          break;
        case 'create_record':
          const record = await formService.createRecord(action.payload);
          const successMessage: AIMessage = {
            id: `success-${Date.now()}`,
            role: 'assistant',
            content: `✅ ¡Registro creado exitosamente! ID: ${record.id}`,
            timestamp: new Date(),
            context: { intent: 'record_created', confidence: 1.0 }
          };
          setMessages(prev => [...prev, successMessage]);
          break;
        default:
          console.log('Acción no reconocida:', action.type);
      }
    } catch (error) {
      console.error('Error ejecutando acción:', error);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    const example = action.examples[Math.floor(Math.random() * action.examples.length)];
    if (example) {
      setInputMessage(example);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening((transcript) => {
        setInputMessage(transcript);
      });
      setIsListening(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🤖 Asistente IA Automatizado
              </h1>
              <p className="text-purple-200">
                Sistema inteligente que responde dudas y automatiza formularios
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setAutoMode(!autoMode)}
              variant={autoMode ? "default" : "outline"}
              className={`${autoMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'border-purple-500 text-purple-200'}`}
            >
              <Wand className="w-4 h-4 mr-2" />
              Modo Auto
            </Button>
            {voiceSupported && (
              <Button
                onClick={toggleVoice}
                variant={isListening ? "default" : "outline"}
                className={`${isListening ? 'bg-gradient-to-r from-red-600 to-pink-600' : 'border-purple-500 text-purple-200'}`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4 bg-slate-800 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Conversaciones</p>
                <p className="text-2xl font-bold text-white">{aiStats.totalConversations}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
          
          <Card className="p-4 bg-slate-800 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Formularios Auto</p>
                <p className="text-2xl font-bold text-white">{aiStats.automatedForms}</p>
              </div>
              <FileText className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          
          <Card className="p-4 bg-slate-800 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Éxito</p>
                <p className="text-2xl font-bold text-white">{aiStats.successRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
          
          <Card className="p-4 bg-slate-800 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Tiempo Resp</p>
                <p className="text-2xl font-bold text-white">{aiStats.averageResponseTime}s</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>
          
          <Card className="p-4 bg-slate-800 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Usuarios Activos</p>
                <p className="text-2xl font-bold text-white">{aiStats.activeUsers}</p>
              </div>
              <User className="w-8 h-8 text-pink-400" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-purple-500 h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-purple-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Asistente IA</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
                        <span className="text-purple-200 text-sm">
                          {isProcessing ? 'Procesando...' : 'Activo'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-purple-500 text-purple-200">
                      <Zap className="w-3 h-3 mr-1" />
                      IA Avanzada
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`p-3 rounded-2xl ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                            : 'bg-slate-700 border border-purple-500 text-white'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          {message.context?.confidence && (
                            <div className="mt-2 flex items-center space-x-2">
                              <div className="flex-1 bg-slate-600 rounded-full h-1">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-blue-400 h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${message.context.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-purple-200">
                                {(message.context.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-purple-300 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className={`${message.role === 'user' ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
                        {message.role === 'user' ? (
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="order-2 ml-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="order-1">
                      <div className="p-3 rounded-2xl bg-slate-700 border border-purple-500">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-purple-500">
                <div className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe tu mensaje o pregunta aquí..."
                      className="bg-slate-700 border-purple-500 text-white pr-12 rounded-xl"
                      disabled={isProcessing}
                    />
                    {voiceSupported && (
                      <Button
                        onClick={toggleVoice}
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isProcessing}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions & Suggestions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-4 bg-slate-800 border-purple-500">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Acciones Rápidas
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickAction(action)}
                    className={`w-full p-3 rounded-xl bg-gradient-to-r ${action.color} text-white text-left transition-all duration-200 hover:shadow-lg`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{action.title}</p>
                        <p className="text-xs opacity-90">{action.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* AI Suggestions */}
            <Card className="p-4 bg-slate-800 border-purple-500">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                Sugerencias IA
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-slate-700 rounded-lg border border-purple-500">
                  <div className="flex items-start space-x-2">
                    <Star className="w-4 h-4 text-yellow-400 mt-1" />
                    <div>
                      <p className="text-white text-sm font-medium">¿Necesitas ayuda?</p>
                      <p className="text-purple-200 text-xs">Puedo ayudarte con ventas, gastos, clientes y más</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-slate-700 rounded-lg border border-purple-500">
                  <div className="flex items-start space-x-2">
                    <Target className="w-4 h-4 text-blue-400 mt-1" />
                    <div>
                      <p className="text-white text-sm font-medium">Modo Auto Activado</p>
                      <p className="text-purple-200 text-xs">La IA completará formularios automáticamente</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-slate-700 rounded-lg border border-purple-500">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-pink-400 mt-1" />
                    <div>
                      <p className="text-white text-sm font-medium">Voz Disponible</p>
                      <p className="text-purple-200 text-xs">Usa el micrófono para hablar conmigo</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAutomationDashboard;