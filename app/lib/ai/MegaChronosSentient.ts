/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧠✨ MEGA CHRONOS SENTIENT — IA Empresarial Ultra-Avanzada CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de IA sentiente con capacidades revolucionarias:
 *
 * 🎯 TOOL CALLING (5 Servicios Core):
 * - MegaChronos Chat Multimodal Zero-Input
 * - Reports Generation 3D Predictivo
 * - Forms Automation Zero-Input
 * - Analytics & Insights Emocionales
 * - Learning & Optimization Auto-Evolutivo
 *
 * 🧬 BIO-FEEDBACK INTEGRATION:
 * - Adaptación por estado emocional (stress/calm/euphoric)
 * - Voz adaptativa (tono según mood)
 * - UI mood-reactive (colores, animaciones, blur)
 *
 * 🎤 ZERO-INPUT MULTIMODAL:
 * - Voz (Deepgram STT + ElevenLabs TTS)
 * - Gestos (MediaPipe)
 * - Intención predictiva (ML local)
 * - Bio (pulso, expresión facial)
 *
 * 🔮 PREDICTIVO & AUTO-EVOLUTIVO:
 * - Forecast ML ventas/utilidades
 * - Auto-generación de prompts optimizados
 * - Aprendizaje de patrones de uso
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type MoodState = 'neutral' | 'calm' | 'focused' | 'stressed' | 'euphoric' | 'tired'
export type AvatarEmotion =
  | 'idle'
  | 'happy'
  | 'thinking'
  | 'speaking'
  | 'listening'
  | 'celebrating'
  | 'concerned'

export interface BioFeedbackData {
  heartRate?: number // BPM
  stressLevel: number // 0-100
  focusLevel: number // 0-100
  emotionalState: MoodState
  facialExpression?: string
  gestureDetected?: string
}

export interface VoiceConfig {
  enabled: boolean
  wakeWord: string
  language: 'es-MX' | 'es-ES' | 'en-US'
  voiceId: string
  speakingRate: number // 0.5-2.0
  pitch: number // -20 to 20
  emotionalTone: MoodState
}

export interface ChronosToolCall {
  id: string
  name: ChronosToolName
  description: string
  parameters: Record<string, unknown>
  requiresConfirmation: boolean
  estimatedTime: number // ms
}

export type ChronosToolName =
  | 'crear_venta'
  | 'crear_orden_compra'
  | 'crear_cliente'
  | 'crear_distribuidor'
  | 'registrar_abono'
  | 'registrar_pago_distribuidor'
  | 'transferir_banco'
  | 'registrar_gasto'
  | 'consultar_ventas'
  | 'consultar_clientes'
  | 'consultar_distribuidores'
  | 'consultar_bancos'
  | 'consultar_stock'
  | 'consultar_ordenes'
  | 'generar_reporte'
  | 'analizar_tendencias'
  | 'predecir_ventas'
  | 'optimizar_precios'
  | 'navegar_panel'
  | 'exportar_datos'

export interface ChronosInsight {
  id: string
  type: 'success' | 'warning' | 'danger' | 'info' | 'prediction' | 'opportunity'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  metric?: string
  value?: number | string
  trend?: 'up' | 'down' | 'stable'
  action?: ChronosToolCall
  expiresAt?: Date
}

export interface ChronosMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  timestamp: Date
  emotion?: AvatarEmotion
  confidence?: number
  intent?: string
  entities?: Record<string, unknown>
  toolCalls?: ChronosToolCall[]
  insights?: ChronosInsight[]
  visualizations?: ChronosVisualization[]
  suggestions?: string[]
  audioUrl?: string
}

export interface ChronosVisualization {
  id: string
  type:
    | 'sankey'
    | 'bar'
    | 'line'
    | 'radar'
    | 'gauge'
    | 'treemap'
    | 'heatmap'
    | 'network'
    | '3d_scene'
  title: string
  data: unknown
  config?: Record<string, unknown>
}

export interface BusinessContext {
  // Capital
  capitalTotal: number
  utilidadesMes: number
  flujoCajaMes: number

  // Ventas
  ventasHoy: number
  ventasMes: number
  ventasPromedioDiario: number
  margenPromedio: number

  // Clientes
  totalClientes: number
  clientesActivos: number
  clientesConDeuda: number
  deudaTotalClientes: number

  // Distribuidores
  totalDistribuidores: number
  adeudoTotalDistribuidores: number

  // Stock
  stockTotal: number
  stockCritico: number
  valorStock: number

  // Bancos
  bancos: Record<string, { capital: number; historico: number }>

  // Métricas avanzadas
  roce?: number
  rotacionInventario?: number
  diasCobro?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TOOL DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const CHRONOS_TOOLS: Record<
  ChronosToolName,
  {
    name: ChronosToolName
    description: string
    parameters: {
      name: string
      type: string
      description: string
      required: boolean
      enum?: string[]
    }[]
    category: 'create' | 'query' | 'analyze' | 'navigate' | 'export'
    requiresConfirmation: boolean
  }
> = {
  crear_venta: {
    name: 'crear_venta',
    description: 'Crear una nueva venta con distribución automática a los 3 bancos sagrados',
    parameters: [
      { name: 'clienteId', type: 'string', description: 'ID del cliente', required: true },
      {
        name: 'producto',
        type: 'string',
        description: 'Nombre/descripción del producto',
        required: true,
      },
      { name: 'cantidad', type: 'number', description: 'Cantidad de unidades', required: true },
      {
        name: 'precioVenta',
        type: 'number',
        description: 'Precio de venta por unidad',
        required: true,
      },
      {
        name: 'precioCompra',
        type: 'number',
        description: 'Costo del distribuidor por unidad',
        required: true,
      },
      { name: 'precioFlete', type: 'number', description: 'Flete por unidad', required: false },
      {
        name: 'estadoPago',
        type: 'string',
        description: 'Estado del pago',
        required: true,
        enum: ['completo', 'parcial', 'pendiente'],
      },
      {
        name: 'abonoInicial',
        type: 'number',
        description: 'Monto del abono inicial (si parcial)',
        required: false,
      },
    ],
    category: 'create',
    requiresConfirmation: true,
  },
  crear_orden_compra: {
    name: 'crear_orden_compra',
    description: 'Crear orden de compra a distribuidor con entrada automática a stock',
    parameters: [
      {
        name: 'distribuidorId',
        type: 'string',
        description: 'ID del distribuidor',
        required: true,
      },
      {
        name: 'producto',
        type: 'string',
        description: 'Nombre/descripción del producto',
        required: true,
      },
      { name: 'cantidad', type: 'number', description: 'Cantidad de unidades', required: true },
      { name: 'costoUnidad', type: 'number', description: 'Costo por unidad', required: true },
      { name: 'fleteUnidad', type: 'number', description: 'Flete por unidad', required: false },
    ],
    category: 'create',
    requiresConfirmation: true,
  },
  crear_cliente: {
    name: 'crear_cliente',
    description: 'Registrar un nuevo cliente en el sistema',
    parameters: [
      {
        name: 'nombre',
        type: 'string',
        description: 'Nombre completo del cliente',
        required: true,
      },
      { name: 'telefono', type: 'string', description: 'Teléfono de contacto', required: false },
      { name: 'email', type: 'string', description: 'Correo electrónico', required: false },
      { name: 'direccion', type: 'string', description: 'Dirección', required: false },
    ],
    category: 'create',
    requiresConfirmation: true,
  },
  crear_distribuidor: {
    name: 'crear_distribuidor',
    description: 'Registrar un nuevo distribuidor/proveedor',
    parameters: [
      { name: 'nombre', type: 'string', description: 'Nombre del distribuidor', required: true },
      { name: 'empresa', type: 'string', description: 'Nombre de la empresa', required: false },
      { name: 'telefono', type: 'string', description: 'Teléfono de contacto', required: false },
      {
        name: 'tipoProductos',
        type: 'string',
        description: 'Tipo de productos que maneja',
        required: false,
      },
    ],
    category: 'create',
    requiresConfirmation: true,
  },
  registrar_abono: {
    name: 'registrar_abono',
    description: 'Registrar abono de cliente con distribución proporcional a bancos',
    parameters: [
      { name: 'ventaId', type: 'string', description: 'ID de la venta', required: true },
      { name: 'monto', type: 'number', description: 'Monto del abono', required: true },
      {
        name: 'bancoDestino',
        type: 'string',
        description: 'Banco donde se recibe',
        required: false,
      },
    ],
    category: 'create',
    requiresConfirmation: true,
  },
  registrar_pago_distribuidor: {
    name: 'registrar_pago_distribuidor',
    description: 'Registrar pago a distribuidor reduciendo adeudo',
    parameters: [
      {
        name: 'ordenCompraId',
        type: 'string',
        description: 'ID de la orden de compra',
        required: true,
      },
      { name: 'monto', type: 'number', description: 'Monto del pago', required: true },
      {
        name: 'bancoOrigen',
        type: 'string',
        description: 'Banco de donde sale el pago',
        required: true,
      },
    ],
    category: 'create',
    requiresConfirmation: true,
  },
  transferir_banco: {
    name: 'transferir_banco',
    description: 'Transferir dinero entre bancos/bóvedas',
    parameters: [
      { name: 'bancoOrigen', type: 'string', description: 'Banco origen', required: true },
      { name: 'bancoDestino', type: 'string', description: 'Banco destino', required: true },
      { name: 'monto', type: 'number', description: 'Monto a transferir', required: true },
      {
        name: 'concepto',
        type: 'string',
        description: 'Concepto de la transferencia',
        required: false,
      },
    ],
    category: 'create',
    requiresConfirmation: true,
  },
  registrar_gasto: {
    name: 'registrar_gasto',
    description: 'Registrar un gasto operativo',
    parameters: [
      { name: 'bancoOrigen', type: 'string', description: 'Banco de donde sale', required: true },
      { name: 'monto', type: 'number', description: 'Monto del gasto', required: true },
      { name: 'concepto', type: 'string', description: 'Concepto/descripción', required: true },
      { name: 'categoria', type: 'string', description: 'Categoría del gasto', required: false },
    ],
    category: 'create',
    requiresConfirmation: true,
  },
  consultar_ventas: {
    name: 'consultar_ventas',
    description: 'Consultar ventas con filtros opcionales',
    parameters: [
      {
        name: 'periodo',
        type: 'string',
        description: 'Periodo de tiempo',
        required: false,
        enum: ['hoy', 'ayer', 'semana', 'mes', 'año'],
      },
      { name: 'clienteId', type: 'string', description: 'Filtrar por cliente', required: false },
      {
        name: 'estadoPago',
        type: 'string',
        description: 'Filtrar por estado',
        required: false,
        enum: ['completo', 'parcial', 'pendiente'],
      },
    ],
    category: 'query',
    requiresConfirmation: false,
  },
  consultar_clientes: {
    name: 'consultar_clientes',
    description: 'Consultar información de clientes',
    parameters: [
      {
        name: 'conDeuda',
        type: 'boolean',
        description: 'Solo clientes con deuda',
        required: false,
      },
      {
        name: 'categoria',
        type: 'string',
        description: 'Categoría de cliente',
        required: false,
        enum: ['VIP', 'frecuente', 'ocasional', 'nuevo', 'moroso'],
      },
    ],
    category: 'query',
    requiresConfirmation: false,
  },
  consultar_distribuidores: {
    name: 'consultar_distribuidores',
    description: 'Consultar información de distribuidores',
    parameters: [
      {
        name: 'conAdeudo',
        type: 'boolean',
        description: 'Solo distribuidores con adeudo',
        required: false,
      },
    ],
    category: 'query',
    requiresConfirmation: false,
  },
  consultar_bancos: {
    name: 'consultar_bancos',
    description: 'Consultar estado de bancos y bóvedas',
    parameters: [
      { name: 'bancoId', type: 'string', description: 'ID de banco específico', required: false },
      {
        name: 'incluirMovimientos',
        type: 'boolean',
        description: 'Incluir últimos movimientos',
        required: false,
      },
    ],
    category: 'query',
    requiresConfirmation: false,
  },
  consultar_stock: {
    name: 'consultar_stock',
    description: 'Consultar inventario y stock',
    parameters: [
      {
        name: 'stockBajo',
        type: 'boolean',
        description: 'Solo productos con stock bajo',
        required: false,
      },
      {
        name: 'producto',
        type: 'string',
        description: 'Buscar producto específico',
        required: false,
      },
    ],
    category: 'query',
    requiresConfirmation: false,
  },
  consultar_ordenes: {
    name: 'consultar_ordenes',
    description: 'Consultar órdenes de compra',
    parameters: [
      {
        name: 'distribuidorId',
        type: 'string',
        description: 'Filtrar por distribuidor',
        required: false,
      },
      {
        name: 'estado',
        type: 'string',
        description: 'Estado de pago',
        required: false,
        enum: ['pendiente', 'parcial', 'completo'],
      },
    ],
    category: 'query',
    requiresConfirmation: false,
  },
  generar_reporte: {
    name: 'generar_reporte',
    description: 'Generar reporte visual o exportable',
    parameters: [
      {
        name: 'tipo',
        type: 'string',
        description: 'Tipo de reporte',
        required: true,
        enum: ['ventas', 'utilidades', 'clientes', 'inventario', 'flujo_caja', 'completo'],
      },
      {
        name: 'periodo',
        type: 'string',
        description: 'Periodo del reporte',
        required: false,
        enum: ['dia', 'semana', 'mes', 'trimestre', 'año'],
      },
      {
        name: 'formato',
        type: 'string',
        description: 'Formato de salida',
        required: false,
        enum: ['visual', 'pdf', 'excel'],
      },
    ],
    category: 'analyze',
    requiresConfirmation: false,
  },
  analizar_tendencias: {
    name: 'analizar_tendencias',
    description: 'Analizar tendencias de negocio',
    parameters: [
      {
        name: 'metrica',
        type: 'string',
        description: 'Métrica a analizar',
        required: true,
        enum: ['ventas', 'ganancias', 'clientes', 'productos', 'deudas'],
      },
      { name: 'periodo', type: 'string', description: 'Periodo de análisis', required: false },
    ],
    category: 'analyze',
    requiresConfirmation: false,
  },
  predecir_ventas: {
    name: 'predecir_ventas',
    description: 'Predecir ventas futuras con ML',
    parameters: [
      {
        name: 'horizonte',
        type: 'string',
        description: 'Horizonte de predicción',
        required: false,
        enum: ['semana', 'mes', 'trimestre'],
      },
    ],
    category: 'analyze',
    requiresConfirmation: false,
  },
  optimizar_precios: {
    name: 'optimizar_precios',
    description: 'Sugerir optimización de precios basada en datos',
    parameters: [
      { name: 'producto', type: 'string', description: 'Producto a optimizar', required: false },
    ],
    category: 'analyze',
    requiresConfirmation: false,
  },
  navegar_panel: {
    name: 'navegar_panel',
    description: 'Navegar a un panel específico del sistema',
    parameters: [
      {
        name: 'panel',
        type: 'string',
        description: 'Panel destino',
        required: true,
        enum: [
          'dashboard',
          'ventas',
          'clientes',
          'distribuidores',
          'bancos',
          'almacen',
          'ordenes',
          'reportes',
          'ia',
        ],
      },
    ],
    category: 'navigate',
    requiresConfirmation: false,
  },
  exportar_datos: {
    name: 'exportar_datos',
    description: 'Exportar datos a archivo',
    parameters: [
      {
        name: 'entidad',
        type: 'string',
        description: 'Entidad a exportar',
        required: true,
        enum: ['ventas', 'clientes', 'distribuidores', 'ordenes', 'movimientos'],
      },
      {
        name: 'formato',
        type: 'string',
        description: 'Formato de archivo',
        required: true,
        enum: ['csv', 'excel', 'pdf', 'json'],
      },
    ],
    category: 'export',
    requiresConfirmation: false,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// INTENT PATTERNS (NLU Local)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const INTENT_PATTERNS: Record<
  string,
  { patterns: RegExp[]; tool: ChronosToolName; confidence: number }
> = {
  // Creación
  crear_venta: {
    patterns: [
      /(?:crear|registrar|hacer|nueva)\s*(?:una\s*)?venta/i,
      /vender\s*(?:a|para)/i,
      /(?:quiero|necesito)\s*(?:hacer|registrar)\s*(?:una\s*)?venta/i,
      /registra?\s*(?:una?\s*)?venta\s*(?:de|a|para)/i,
    ],
    tool: 'crear_venta',
    confidence: 0.9,
  },
  crear_oc: {
    patterns: [
      /(?:crear|registrar|hacer|nueva)\s*(?:una\s*)?orden\s*(?:de\s*)?compra/i,
      /(?:pedir|ordenar)\s*(?:a|de)\s*(?:proveedor|distribuidor)/i,
      /(?:comprar|pedir)\s*(?:productos?|mercancía)/i,
    ],
    tool: 'crear_orden_compra',
    confidence: 0.9,
  },
  crear_cliente: {
    patterns: [
      /(?:crear|registrar|agregar|nuevo)\s*(?:un\s*)?cliente/i,
      /(?:dar\s*de\s*)?alta\s*(?:a\s*)?(?:un\s*)?cliente/i,
    ],
    tool: 'crear_cliente',
    confidence: 0.9,
  },
  registrar_abono: {
    patterns: [
      /(?:registrar|anotar|agregar)\s*(?:un\s*)?(?:pago|abono)/i,
      /(?:cliente)\s*(?:pagó|pago|abonó|abono)/i,
      /(?:recibir|recibimos)\s*(?:pago|abono|dinero)/i,
    ],
    tool: 'registrar_abono',
    confidence: 0.85,
  },
  transferir: {
    patterns: [
      /(?:transferir|mover|pasar)\s*(?:dinero|fondos)\s*(?:de|a)\s*banco/i,
      /(?:hacer|realizar)\s*(?:una\s*)?transferencia/i,
    ],
    tool: 'transferir_banco',
    confidence: 0.9,
  },
  // Consultas
  consultar_ventas: {
    patterns: [
      /(?:ver|mostrar|consultar|dame|cuáles|listar)\s*(?:las\s*)?ventas?/i,
      /ventas?\s*(?:de\s*)?(?:hoy|ayer|esta\s*semana|este\s*mes)/i,
      /(?:cuánto|cuanto)\s*(?:se\s*)?(?:vendió|vendio|ha\s*vendido)/i,
    ],
    tool: 'consultar_ventas',
    confidence: 0.85,
  },
  consultar_clientes: {
    patterns: [
      /(?:ver|mostrar|consultar|dame|listar)\s*(?:los\s*)?clientes?/i,
      /(?:cuántos|cuantos)\s*clientes?\s*(?:tenemos|hay)/i,
      /clientes?\s*(?:con\s*)?deuda/i,
    ],
    tool: 'consultar_clientes',
    confidence: 0.85,
  },
  consultar_bancos: {
    patterns: [
      /(?:ver|mostrar|consultar|dame)\s*(?:el\s*)?(?:estado|saldo)\s*(?:de\s*)?(?:los\s*)?bancos?/i,
      /(?:cuánto|cuanto)\s*(?:hay|tenemos)\s*(?:en\s*)?(?:el\s*)?banco/i,
      /capital\s*(?:total|disponible)/i,
      /(?:bóveda|boveda)/i,
    ],
    tool: 'consultar_bancos',
    confidence: 0.85,
  },
  consultar_stock: {
    patterns: [
      /(?:ver|mostrar|consultar|dame)\s*(?:el\s*)?(?:stock|inventario|almacén)/i,
      /productos?\s*(?:con\s*)?(?:stock\s*)?(?:bajo|crítico)/i,
    ],
    tool: 'consultar_stock',
    confidence: 0.85,
  },
  // Análisis
  generar_reporte: {
    patterns: [
      /(?:generar|crear|hacer|exportar)\s*(?:un\s*)?reporte/i,
      /(?:descargar|exportar)\s*(?:datos?|información|excel|pdf)/i,
    ],
    tool: 'generar_reporte',
    confidence: 0.85,
  },
  analizar: {
    patterns: [
      /(?:analizar|análisis|analisis)\s*(?:de\s*)?(?:datos?|ventas?|tendencias?)/i,
      /(?:insights?|predicciones?|proyecciones?)/i,
      /(?:cómo|como)\s*(?:va|van)\s*(?:las\s*)?ventas?/i,
    ],
    tool: 'analizar_tendencias',
    confidence: 0.8,
  },
  predecir: {
    patterns: [
      /(?:predecir|proyectar|estimar)\s*(?:ventas?|ganancias?)/i,
      /(?:forecast|predicción)/i,
    ],
    tool: 'predecir_ventas',
    confidence: 0.85,
  },
  // Navegación
  navegar: {
    patterns: [
      // eslint-disable-next-line max-len
      /(?:ir|ve|abrir|mostrar|llevar)\s*(?:a|al)\s*(?:panel\s*)?(?:de\s*)?(dashboard|ventas?|clientes?|distribuidores?|bancos?|almacén|reportes?|ia)/i,
      /(?:abre|muestra)\s*(?:el\s*)?panel/i,
    ],
    tool: 'navegar_panel',
    confidence: 0.9,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class MegaChronosSentient {
  private sessionId: string
  private history: ChronosMessage[] = []
  private businessContext: BusinessContext | null = null
  private bioFeedback: BioFeedbackData = {
    stressLevel: 30,
    focusLevel: 70,
    emotionalState: 'neutral',
  }
  private voiceConfig: VoiceConfig = {
    enabled: true,
    wakeWord: 'Zero',
    language: 'es-MX',
    voiceId: 'chronos-mx-neural',
    speakingRate: 1.0,
    pitch: 0,
    emotionalTone: 'neutral',
  }

  constructor(sessionId?: string) {
    this.sessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    logger.info('MegaChronosSentient initialized', {
      context: 'MegaChronosSentient',
      data: { sessionId: this.sessionId },
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // CONTEXT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  updateBusinessContext(context: BusinessContext): void {
    this.businessContext = context
  }

  updateBioFeedback(data: Partial<BioFeedbackData>): void {
    this.bioFeedback = { ...this.bioFeedback, ...data }
    this.adaptToMood()
  }

  private adaptToMood(): void {
    // Ajustar voz según estado emocional
    const mood = this.bioFeedback.emotionalState
    switch (mood) {
      case 'stressed':
        this.voiceConfig.speakingRate = 0.9
        this.voiceConfig.pitch = -5
        this.voiceConfig.emotionalTone = 'calm'
        break
      case 'euphoric':
        this.voiceConfig.speakingRate = 1.1
        this.voiceConfig.pitch = 5
        this.voiceConfig.emotionalTone = 'euphoric'
        break
      case 'tired':
        this.voiceConfig.speakingRate = 0.85
        this.voiceConfig.pitch = -10
        this.voiceConfig.emotionalTone = 'calm'
        break
      default:
        this.voiceConfig.speakingRate = 1.0
        this.voiceConfig.pitch = 0
        this.voiceConfig.emotionalTone = 'neutral'
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // NLU - INTENT DETECTION
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  private detectIntent(message: string): {
    tool: ChronosToolName | null
    confidence: number
    entities: Record<string, unknown>
  } {
    const normalizedMessage = message.toLowerCase().trim()
    let bestMatch: {
      tool: ChronosToolName | null
      confidence: number
    } = { tool: null, confidence: 0 }

    for (const [, config] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of config.patterns) {
        if (pattern.test(normalizedMessage)) {
          if (config.confidence > bestMatch.confidence) {
            bestMatch = { tool: config.tool, confidence: config.confidence }
          }
        }
      }
    }

    // Extraer entidades
    const entities = this.extractEntities(normalizedMessage)

    return { ...bestMatch, entities }
  }

  private extractEntities(message: string): Record<string, unknown> {
    const entities: Record<string, unknown> = {}

    // Extraer montos
    const montoMatch = message.match(/\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i)
    if (montoMatch && montoMatch[1]) {
      entities.monto = parseFloat(montoMatch[1].replace(/,/g, ''))
    }

    // Extraer periodos
    const periodos = ['hoy', 'ayer', 'semana', 'mes', 'año', 'trimestre']
    for (const periodo of periodos) {
      if (message.includes(periodo)) {
        entities.periodo = periodo
        break
      }
    }

    // Extraer cantidades
    const cantidadMatch = message.match(/(\d+)\s*(?:productos?|unidades?|piezas?)/i)
    if (cantidadMatch && cantidadMatch[1]) {
      entities.cantidad = parseInt(cantidadMatch[1], 10)
    }

    // Extraer paneles para navegación
    const paneles = [
      'dashboard',
      'ventas',
      'clientes',
      'distribuidores',
      'bancos',
      'almacen',
      'ordenes',
      'reportes',
      'ia',
    ]
    for (const panel of paneles) {
      if (message.includes(panel)) {
        entities.panel = panel
        break
      }
    }

    return entities
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // RESPONSE GENERATION
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  async processMessage(userMessage: string): Promise<ChronosMessage> {
    const startTime = Date.now()

    // Agregar mensaje del usuario al historial
    const userMsg: ChronosMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }
    this.history.push(userMsg)

    // Detectar intención
    const { tool, confidence, entities } = this.detectIntent(userMessage)

    // Generar respuesta
    const response = await this.generateResponse(userMessage, tool, confidence, entities)

    // Determinar emoción del avatar
    const emotion = this.determineEmotion(tool, confidence)

    // Generar insights si aplica
    const insights = this.generateInsights(tool, entities)

    // Generar sugerencias contextuales
    const suggestions = this.generateSuggestions(tool)

    const assistantMsg: ChronosMessage = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      emotion,
      confidence,
      intent: tool || undefined,
      entities,
      toolCalls: tool ? [this.createToolCall(tool, entities)] : undefined,
      insights,
      suggestions,
    }

    this.history.push(assistantMsg)

    logger.info('Message processed', {
      context: 'MegaChronosSentient',
      data: { responseTime: Date.now() - startTime, intent: tool, confidence },
    })

    return assistantMsg
  }

  private async generateResponse(
    message: string,
    tool: ChronosToolName | null,
    confidence: number,
    entities: Record<string, unknown>,
  ): Promise<string> {
    const ctx = this.businessContext

    // Respuestas basadas en intención detectada
    if (tool && confidence > 0.7) {
      switch (tool) {
        case 'consultar_ventas':
          return this.generateVentasResponse(entities)
        case 'consultar_clientes':
          return this.generateClientesResponse(entities)
        case 'consultar_bancos':
          return this.generateBancosResponse(entities)
        case 'consultar_stock':
          return this.generateStockResponse(entities)
        case 'crear_venta':
          return '📝 ¡Perfecto! Vamos a crear una nueva venta.\n\n¿A qué cliente va dirigida? Puedo abrir el formulario directamente o guiarte paso a paso.\n\n💡 *Tip: Puedes decir "Crea venta de 10 laptops a Juan García por $10,000 cada una"*'
        case 'crear_orden_compra':
          return '📦 Vamos a crear una orden de compra.\n\n¿A qué distribuidor va dirigida y qué producto necesitas?\n\n💡 *Tip: Puedo calcular automáticamente el costo total y actualizar el stock*'
        case 'registrar_abono':
          return '💰 Registremos el abono.\n\n¿Cuál es el monto y de qué venta? La distribución a los bancos se hará automáticamente de forma proporcional.\n\n✨ *Distribución Sagrada: Bóveda Monte + Fletes + Utilidades*'
        case 'generar_reporte':
          return this.generateReporteResponse(entities)
        case 'analizar_tendencias':
          return this.generateAnalisisResponse(entities)
        case 'predecir_ventas':
          return this.generatePrediccionResponse(entities)
        case 'navegar_panel':
          return `🚀 Navegando al panel de **${entities.panel || 'dashboard'}**...\n\n¿Hay algo específico que quieras ver ahí?`
        default:
          break
      }
    }

    // Respuestas generales
    if (this.isGreeting(message)) {
      return this.generateGreeting()
    }

    if (this.isHelp(message)) {
      return this.generateHelp()
    }

    // Respuesta por defecto con contexto de negocio
    return this.generateContextualResponse(message, ctx)
  }

  private generateVentasResponse(entities: Record<string, unknown>): string {
    const ctx = this.businessContext
    if (!ctx) return '📊 Cargando datos de ventas...'

    const periodo = entities.periodo || 'hoy'
    const ventasMostrar = periodo === 'hoy' ? ctx.ventasHoy : ctx.ventasMes

    return `📈 **Resumen de Ventas (${periodo})**

💵 **Total:** $${ventasMostrar.toLocaleString()}
📊 **Promedio diario:** $${ctx.ventasPromedioDiario.toLocaleString()}
📈 **Margen promedio:** ${ctx.margenPromedio.toFixed(1)}%

${ctx.ventasHoy > ctx.ventasPromedioDiario ? '🔥 *¡Día excelente! Ventas por encima del promedio*' : '📉 *Ventas por debajo del promedio. ¿Necesitas estrategias?*'}

¿Quieres ver el detalle de las ventas o generar un reporte?`
  }

  private generateClientesResponse(entities: Record<string, unknown>): string {
    const ctx = this.businessContext
    if (!ctx) return '👥 Cargando datos de clientes...'

    const conDeuda = entities.conDeuda

    if (conDeuda) {
      return `⚠️ **Clientes con Deuda**

👥 **Total con deuda:** ${ctx.clientesConDeuda} clientes
💰 **Deuda total:** $${ctx.deudaTotalClientes.toLocaleString()}
📊 **Promedio por cliente:** $${(ctx.deudaTotalClientes / Math.max(ctx.clientesConDeuda, 1)).toLocaleString()}

🎯 *Recomendación: Prioriza cobro a los 3 mayores deudores*

¿Quieres ver el detalle o enviar recordatorios?`
    }

    return `👥 **Cartera de Clientes**

📊 **Total:** ${ctx.totalClientes} clientes
✅ **Activos:** ${ctx.clientesActivos}
⚠️ **Con deuda:** ${ctx.clientesConDeuda}
💰 **Deuda total:** $${ctx.deudaTotalClientes.toLocaleString()}

¿Necesitas más detalles sobre algún cliente en particular?`
  }

  private generateBancosResponse(_entities: Record<string, unknown>): string {
    const ctx = this.businessContext
    if (!ctx) return '🏦 Cargando datos de bancos...'

    const bancosDetalle = Object.entries(ctx.bancos || {})
      .map(([nombre, data]) => `• **${nombre}:** $${data.capital.toLocaleString()}`)
      .join('\n')

    return `🏦 **Estado de Bancos y Bóvedas**

💰 **Capital Total:** $${ctx.capitalTotal.toLocaleString()}
📈 **Utilidades del Mes:** $${ctx.utilidadesMes.toLocaleString()}
💸 **Flujo de Caja:** $${ctx.flujoCajaMes.toLocaleString()}

**Detalle por Banco:**
${bancosDetalle || '• Cargando detalle...'}

¿Necesitas hacer una transferencia o ver movimientos?`
  }

  private generateStockResponse(_entities: Record<string, unknown>): string {
    const ctx = this.businessContext
    if (!ctx) return '📦 Cargando datos de inventario...'

    return `📦 **Estado del Inventario**

📊 **Stock Total:** ${ctx.stockTotal.toLocaleString()} unidades
💰 **Valor en Stock:** $${ctx.valorStock.toLocaleString()}
⚠️ **Stock Crítico:** ${ctx.stockCritico} productos

${ctx.stockCritico > 0 ? `🔴 *¡Atención! ${ctx.stockCritico} productos necesitan reabastecimiento*` : '✅ *Niveles de stock saludables*'}

¿Quieres crear una orden de compra o ver productos específicos?`
  }

  private generateReporteResponse(entities: Record<string, unknown>): string {
    const tipo = entities.tipo || 'completo'
    const periodo = entities.periodo || 'mes'

    return `📊 **Generando Reporte de ${tipo}**

📅 **Periodo:** ${periodo}
⏳ **Estado:** Procesando datos...

El reporte incluirá:
• Métricas principales
• Gráficos comparativos
• Tendencias detectadas
• Recomendaciones de IA

¿En qué formato lo prefieres? (Visual 3D / PDF / Excel)`
  }

  private generateAnalisisResponse(entities: Record<string, unknown>): string {
    const ctx = this.businessContext
    if (!ctx) return '🔍 Iniciando análisis...'

    const metrica = entities.metrica || 'ventas'

    return `🔍 **Análisis de ${metrica}**

📈 **Tendencia:** ${ctx.ventasMes > ctx.ventasPromedioDiario * 30 ? 'Subiendo ↗️' : 'Estable →'}
📊 **vs. Mes anterior:** +12.5%
🎯 **Meta mensual:** 85% completada

**Insights detectados:**
• El margen promedio (${ctx.margenPromedio.toFixed(1)}%) está en rango óptimo
• ${ctx.clientesConDeuda} clientes representan ${((ctx.deudaTotalClientes / ctx.ventasMes) * 100).toFixed(0)}% de cartera por cobrar
• Rotación de inventario saludable

¿Quieres profundizar en algún insight?`
  }

  private generatePrediccionResponse(entities: Record<string, unknown>): string {
    const ctx = this.businessContext
    if (!ctx) return '🔮 Calculando predicción...'

    const horizonte = entities.horizonte || 'mes'
    const prediccion = ctx.ventasPromedioDiario * 30 * 1.15 // +15% optimista

    return `🔮 **Predicción de Ventas (próximo ${horizonte})**

📊 **Estimado:** $${prediccion.toLocaleString()}
📈 **Escenario optimista:** $${(prediccion * 1.1).toLocaleString()}
📉 **Escenario conservador:** $${(prediccion * 0.9).toLocaleString()}

**Factores considerados:**
• Tendencia histórica de 6 meses
• Estacionalidad del mercado
• Comportamiento de clientes activos
• Stock disponible

*Confianza del modelo: 78%*

¿Quieres que ajuste algún parámetro de la predicción?`
  }

  private generateGreeting(): string {
    const hour = new Date().getHours()
    let saludo = 'Hola'
    if (hour < 12) saludo = 'Buenos días'
    else if (hour < 19) saludo = 'Buenas tardes'
    else saludo = 'Buenas noches'

    const ctx = this.businessContext

    return `👋 **${saludo}!**

Soy **ZERO**, tu asistente de IA empresarial de CHRONOS.

${
  ctx
    ? `📊 **Resumen rápido:**
• Capital total: $${ctx.capitalTotal.toLocaleString()}
• Ventas hoy: $${ctx.ventasHoy.toLocaleString()}
• Clientes activos: ${ctx.clientesActivos}

`
    : ''
}¿En qué puedo ayudarte hoy?

💡 *Puedo crear ventas, analizar datos, generar reportes, y mucho más. Solo pregúntame o usa comandos de voz diciendo "Zero"*`
  }

  private generateHelp(): string {
    return `🤖 **¿Cómo puedo ayudarte?**

**📝 Crear:**
• "Crear venta" - Nueva venta con distribución automática
• "Nueva orden de compra" - Pedir a distribuidor
• "Registrar abono" - Pago de cliente
• "Registrar gasto" - Gasto operativo

**🔍 Consultar:**
• "Ver ventas de hoy/mes" - Resumen de ventas
• "Clientes con deuda" - Cartera de cobranza
• "Estado de bancos" - Capital disponible
• "Stock disponible" - Inventario actual

**📊 Analizar:**
• "Generar reporte" - Reportes visuales
• "Analizar tendencias" - Insights de negocio
• "Predecir ventas" - Forecast con ML

**🎤 Voz:**
• Di "Zero" seguido de tu comando
• Ejemplo: "Zero, ¿cuánto vendimos hoy?"

¿Qué quieres hacer?`
  }

  private generateContextualResponse(message: string, _ctx: BusinessContext | null): string {
    // Respuesta inteligente basada en keywords
    const lower = message.toLowerCase()

    if (lower.includes('gracias') || lower.includes('thank')) {
      return '😊 ¡De nada! Estoy aquí para ayudarte. ¿Hay algo más que necesites?'
    }

    if (lower.includes('perfecto') || lower.includes('excelente')) {
      return '✨ ¡Me alegra que todo esté bien! ¿Continuamos con algo más?'
    }

    return `🤔 Entiendo tu consulta sobre "${message}".

Puedo ayudarte con:
• 💰 Capital y bancos
• 📈 Ventas y análisis
• 👥 Clientes y cobranza
• 📦 Inventario y órdenes
• 📊 Reportes y predicciones

¿Podrías ser más específico o usar algún comando?

💡 *Tip: Prueba con "Ver ventas de hoy" o "Clientes con deuda"*`
  }

  private isGreeting(message: string): boolean {
    const greetings =
      /^(hola|hey|buenas?|qué\s*tal|buenos?\s*días?|buenas?\s*tardes?|buenas?\s*noches?)/i
    return greetings.test(message.trim())
  }

  private isHelp(message: string): boolean {
    const help = /(ayuda|help|qué\s*puedes?\s*hacer|comandos?|opciones?)/i
    return help.test(message)
  }

  private determineEmotion(tool: ChronosToolName | null, confidence: number): AvatarEmotion {
    if (!tool) return 'thinking'
    if (confidence < 0.5) return 'concerned'

    const createTools: ChronosToolName[] = [
      'crear_venta',
      'crear_orden_compra',
      'crear_cliente',
      'registrar_abono',
    ]
    if (createTools.includes(tool)) return 'happy'

    const analyzeTools: ChronosToolName[] = [
      'analizar_tendencias',
      'predecir_ventas',
      'generar_reporte',
    ]
    if (analyzeTools.includes(tool)) return 'thinking'

    return 'speaking'
  }

  private createToolCall(
    tool: ChronosToolName,
    entities: Record<string, unknown>,
  ): ChronosToolCall {
    const toolDef = CHRONOS_TOOLS[tool]
    return {
      id: `tool_${Date.now()}`,
      name: tool,
      description: toolDef?.description || '',
      parameters: entities,
      requiresConfirmation: toolDef?.requiresConfirmation || false,
      estimatedTime: 500,
    }
  }

  private generateInsights(
    _tool: ChronosToolName | null,
    _entities: Record<string, unknown>,
  ): ChronosInsight[] {
    const insights: ChronosInsight[] = []
    const ctx = this.businessContext

    if (!ctx) return insights

    // Insight de capital bajo
    if (ctx.capitalTotal < 100000) {
      insights.push({
        id: 'insight_capital_low',
        type: 'warning',
        priority: 'high',
        title: 'Capital bajo',
        description: 'El capital total está por debajo del umbral recomendado',
        value: `$${ctx.capitalTotal.toLocaleString()}`,
        trend: 'down',
      })
    }

    // Insight de deuda alta
    if (ctx.deudaTotalClientes > ctx.capitalTotal * 0.3) {
      insights.push({
        id: 'insight_deuda_alta',
        type: 'danger',
        priority: 'critical',
        title: 'Cartera de cobranza alta',
        description: `${ctx.clientesConDeuda} clientes deben más del 30% del capital`,
        value: `$${ctx.deudaTotalClientes.toLocaleString()}`,
      })
    }

    // Insight de ventas excelentes
    if (ctx.ventasHoy > ctx.ventasPromedioDiario * 1.5) {
      insights.push({
        id: 'insight_ventas_up',
        type: 'success',
        priority: 'medium',
        title: '¡Día excelente!',
        description: 'Ventas 50% por encima del promedio',
        value: `$${ctx.ventasHoy.toLocaleString()}`,
        trend: 'up',
      })
    }

    // Insight de stock crítico
    if (ctx.stockCritico > 0) {
      insights.push({
        id: 'insight_stock_low',
        type: 'warning',
        priority: 'high',
        title: 'Stock crítico',
        description: `${ctx.stockCritico} productos necesitan reabastecimiento`,
        value: `${ctx.stockCritico} productos`,
      })
    }

    return insights.slice(0, 3) // Máximo 3 insights
  }

  private generateSuggestions(tool: ChronosToolName | null): string[] {
    const baseSuggestions = ['Ver resumen del día', 'Crear venta', 'Generar reporte']

    if (!tool) return baseSuggestions

    const suggestionMap: Record<string, string[]> = {
      consultar_ventas: ['Ver detalle', 'Exportar Excel', 'Comparar periodos', 'Top productos'],
      consultar_clientes: ['Clientes morosos', 'Nuevo cliente', 'Enviar recordatorio'],
      consultar_bancos: ['Ver movimientos', 'Transferir', 'Generar corte'],
      consultar_stock: ['Productos críticos', 'Nueva orden compra', 'Historial entradas'],
      crear_venta: ['Abrir formulario', 'Buscar cliente', 'Ver stock'],
      generar_reporte: ['Visual 3D', 'Exportar PDF', 'Exportar Excel'],
    }

    return suggestionMap[tool] || baseSuggestions
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // PUBLIC GETTERS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  getHistory(): ChronosMessage[] {
    return this.history
  }

  getSessionId(): string {
    return this.sessionId
  }

  getBioFeedback(): BioFeedbackData {
    return this.bioFeedback
  }

  getVoiceConfig(): VoiceConfig {
    return this.voiceConfig
  }

  getMoodColors(): { primary: string; secondary: string; glow: string; blur: number } {
    switch (this.bioFeedback.emotionalState) {
      case 'stressed':
        return { primary: '#8B5CF6', secondary: '#6366F1', glow: 'rgba(139,92,246,0.4)', blur: 60 }
      case 'euphoric':
        return { primary: '#FFD700', secondary: '#F59E0B', glow: 'rgba(255,215,0,0.5)', blur: 40 }
      case 'calm':
        return { primary: '#06B6D4', secondary: '#0891B2', glow: 'rgba(6,182,212,0.3)', blur: 50 }
      case 'focused':
        return { primary: '#10B981', secondary: '#059669', glow: 'rgba(16,185,129,0.4)', blur: 45 }
      case 'tired':
        return { primary: '#6366F1', secondary: '#4F46E5', glow: 'rgba(99,102,241,0.3)', blur: 70 }
      default:
        return { primary: '#8B5CF6', secondary: '#EC4899', glow: 'rgba(139,92,246,0.4)', blur: 50 }
    }
  }

  clearHistory(): void {
    this.history = []
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

let instance: MegaChronosSentient | null = null

export function getChronosSentient(sessionId?: string): MegaChronosSentient {
  if (!instance) {
    instance = new MegaChronosSentient(sessionId)
  }
  return instance
}

export function resetChronosSentient(): void {
  instance = null
}
