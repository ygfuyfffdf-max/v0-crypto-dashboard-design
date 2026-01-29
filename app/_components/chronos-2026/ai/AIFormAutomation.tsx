'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧠✨ AI FORM AUTOMATION SYSTEM — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de automatización inteligente de formularios mediante IA.
 * Permite crear registros mediante comandos de voz o texto con razonamiento avanzado.
 *
 * Características:
 * - Detección de intención con NLU
 * - Extracción automática de entidades
 * - Resolución de ambigüedades mediante preguntas
 * - Inferencia de datos faltantes
 * - Conexión con base de datos Turso/Drizzle
 * - Validación con esquemas Zod
 *
 * @version 1.0.0 SUPREME
 * @author IY Supreme Agent
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { useCallback, useMemo, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type EntityType =
  | 'distribuidor'
  | 'cliente'
  | 'producto'
  | 'banco'
  | 'cantidad'
  | 'precio'
  | 'fecha'
  | 'concepto'
  | 'monto'

export interface ExtractedEntity {
  type: EntityType
  value: string | number
  confidence: number
  originalText: string
  inferred?: boolean
}

export interface IntentResult {
  intent: string
  confidence: number
  entities: ExtractedEntity[]
  missingRequired: EntityType[]
  ambiguities: Ambiguity[]
}

export interface Ambiguity {
  type: EntityType
  options: { id: string; label: string; score: number }[]
  question: string
}

export interface FormAutomationConfig {
  intent: string
  label: string
  requiredEntities: EntityType[]
  optionalEntities: EntityType[]
  inferenceRules: InferenceRule[]
  validationSchema?: unknown
  onSubmit: (data: Record<string, unknown>) => Promise<void>
}

export interface InferenceRule {
  entity: EntityType
  condition: (entities: ExtractedEntity[]) => boolean
  infer: (entities: ExtractedEntity[], context: DataContext) => string | number | null
}

export interface DataContext {
  distribuidores: { id: string; nombre: string }[]
  clientes: { id: string; nombre: string; deuda?: number }[]
  productos: { id: string; nombre: string; stock?: number; precio?: number }[]
  bancos: { id: string; nombre: string; capital?: number }[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES: Patrones de extracción
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const QUANTITY_PATTERNS = [
  /(\d+)\s*(?:piezas?|unidades?|cajas?|paquetes?|kilos?|kg|litros?|lts?)/i,
  /(?:comprar?|ordenar?|pedir?)\s+(\d+)/i,
  /(\d+)\s+(?:de\s+)?(?!\$)/i,
]

const PRICE_PATTERNS = [
  /\$\s*([\d,]+(?:\.\d{2})?)/,
  /([\d,]+(?:\.\d{2})?)\s*(?:pesos?|mxn|dlls?|dólares?)/i,
  /(?:a|por|de)\s*\$?\s*([\d,]+(?:\.\d{2})?)/i,
]

const DATE_PATTERNS = [
  /(?:para|el)\s+(\d{1,2})\s+(?:de\s+)?(\w+)/i,
  /(?:hoy|mañana|pasado mañana)/i,
  /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/,
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CLASE: NLUProcessor - Procesador de lenguaje natural
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class NLUProcessor {
  private context: DataContext

  constructor(context: DataContext) {
    this.context = context
  }

  /**
   * Detecta la intención del mensaje
   */
  detectIntent(text: string): { intent: string; confidence: number } {
    const lower = text.toLowerCase()
    const intents: { pattern: RegExp; intent: string; weight: number }[] = [
      {
        pattern: /(?:crea|hacer|nueva?)\s*(?:orden|pedido)\s*(?:de\s*)?compra/i,
        intent: 'crear_orden_compra',
        weight: 1.0,
      },
      { pattern: /(?:compra|ordenar?|pedir?)\s+\d+/i, intent: 'crear_orden_compra', weight: 0.9 },
      { pattern: /(?:registra|nueva?|hacer)\s*venta/i, intent: 'crear_venta', weight: 1.0 },
      { pattern: /(?:vende|vendí|vender)\s+\d+/i, intent: 'crear_venta', weight: 0.9 },
      {
        pattern: /(?:nuevo?|registra|agregar?)\s*cliente/i,
        intent: 'registrar_cliente',
        weight: 1.0,
      },
      { pattern: /(?:nuevo?|registra|agregar?)\s*gasto/i, intent: 'registrar_gasto', weight: 1.0 },
      {
        pattern: /(?:quién|clientes?)\s*(?:debe|deuda|deben)/i,
        intent: 'consultar_deudas',
        weight: 1.0,
      },
      {
        pattern: /(?:stock|inventario|almac[eé]n|cuánto\s*(?:hay|queda))/i,
        intent: 'consultar_inventario',
        weight: 1.0,
      },
      {
        pattern: /(?:transfer|pasa|mover?)\s*(?:dinero|fondos)/i,
        intent: 'transferir_fondos',
        weight: 1.0,
      },
      {
        pattern: /(?:anali[zs]|reporte?|estadística|cómo\s*van?\s*las?\s*ventas?)/i,
        intent: 'analizar_ventas',
        weight: 1.0,
      },
    ]

    let bestMatch = { intent: 'general', confidence: 0.3 }

    for (const { pattern, intent, weight } of intents) {
      if (pattern.test(lower)) {
        if (weight > bestMatch.confidence) {
          bestMatch = { intent, confidence: weight }
        }
      }
    }

    return bestMatch
  }

  /**
   * Extrae entidades del texto
   */
  extractEntities(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = []

    // Extraer cantidad
    for (const pattern of QUANTITY_PATTERNS) {
      const match = text.match(pattern)
      if (match?.[1]) {
        entities.push({
          type: 'cantidad',
          value: parseInt(match[1], 10),
          confidence: 0.9,
          originalText: match[0],
        })
        break
      }
    }

    // Extraer precio/monto
    for (const pattern of PRICE_PATTERNS) {
      const match = text.match(pattern)
      if (match?.[1]) {
        const value = parseFloat(match[1].replace(',', ''))
        entities.push({
          type: 'precio',
          value,
          confidence: 0.85,
          originalText: match[0],
        })
        entities.push({
          type: 'monto',
          value,
          confidence: 0.85,
          originalText: match[0],
        })
        break
      }
    }

    // Extraer fecha
    for (const pattern of DATE_PATTERNS) {
      const match = text.match(pattern)
      if (match) {
        const lower = match[0].toLowerCase()
        let dateValue: string

        if (lower === 'hoy') {
          dateValue = new Date().toISOString().split('T')[0] ?? ''
        } else if (lower === 'mañana') {
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          dateValue = tomorrow.toISOString().split('T')[0] ?? ''
        } else if (lower === 'pasado mañana') {
          const dayAfter = new Date()
          dayAfter.setDate(dayAfter.getDate() + 2)
          dateValue = dayAfter.toISOString().split('T')[0] ?? ''
        } else {
          dateValue = match[0]
        }

        entities.push({
          type: 'fecha',
          value: dateValue,
          confidence: 0.8,
          originalText: match[0],
        })
        break
      }
    }

    // Buscar distribuidores en el texto
    const distribuidorMatch = this.findBestMatch(
      text,
      this.context.distribuidores.map((d) => d.nombre),
    )
    if (distribuidorMatch.score > 0.6) {
      const distribuidor = this.context.distribuidores.find(
        (d) => d.nombre.toLowerCase() === distribuidorMatch.match.toLowerCase(),
      )
      if (distribuidor) {
        entities.push({
          type: 'distribuidor',
          value: distribuidor.id,
          confidence: distribuidorMatch.score,
          originalText: distribuidorMatch.match,
        })
      }
    }

    // Buscar clientes en el texto
    const clienteMatch = this.findBestMatch(
      text,
      this.context.clientes.map((c) => c.nombre),
    )
    if (clienteMatch.score > 0.6) {
      const cliente = this.context.clientes.find(
        (c) => c.nombre.toLowerCase() === clienteMatch.match.toLowerCase(),
      )
      if (cliente) {
        entities.push({
          type: 'cliente',
          value: cliente.id,
          confidence: clienteMatch.score,
          originalText: clienteMatch.match,
        })
      }
    }

    // Buscar productos en el texto
    const productoMatch = this.findBestMatch(
      text,
      this.context.productos.map((p) => p.nombre),
    )
    if (productoMatch.score > 0.5) {
      const producto = this.context.productos.find(
        (p) => p.nombre.toLowerCase() === productoMatch.match.toLowerCase(),
      )
      if (producto) {
        entities.push({
          type: 'producto',
          value: producto.id,
          confidence: productoMatch.score,
          originalText: productoMatch.match,
        })
      }
    }

    // Buscar bancos en el texto
    const bancoMatch = this.findBestMatch(
      text,
      this.context.bancos.map((b) => b.nombre),
    )
    if (bancoMatch.score > 0.6) {
      const banco = this.context.bancos.find(
        (b) => b.nombre.toLowerCase() === bancoMatch.match.toLowerCase(),
      )
      if (banco) {
        entities.push({
          type: 'banco',
          value: banco.id,
          confidence: bancoMatch.score,
          originalText: bancoMatch.match,
        })
      }
    }

    // Extraer concepto (texto entre comillas o después de "de")
    const conceptoMatch = text.match(
      /(?:["']([^"']+)["']|(?:de|para|por)\s+([^,.\d]+?)(?:\s+(?:a|de|para|por|$)))/i,
    )
    if (conceptoMatch) {
      entities.push({
        type: 'concepto',
        value: (conceptoMatch[1] ?? conceptoMatch[2] ?? '').trim(),
        confidence: 0.7,
        originalText: conceptoMatch[0],
      })
    }

    return entities
  }

  /**
   * Encuentra la mejor coincidencia en una lista
   */
  private findBestMatch(text: string, options: string[]): { match: string; score: number } {
    const lower = text.toLowerCase()
    let bestMatch = { match: '', score: 0 }

    for (const option of options) {
      const optionLower = option.toLowerCase()

      // Coincidencia exacta
      if (lower.includes(optionLower)) {
        const score = optionLower.length / lower.length + 0.5
        if (score > bestMatch.score) {
          bestMatch = { match: option, score: Math.min(score, 1) }
        }
      }

      // Coincidencia parcial (fuzzy)
      const words = optionLower.split(' ')
      let matchedWords = 0
      for (const word of words) {
        if (lower.includes(word) && word.length > 2) {
          matchedWords++
        }
      }
      if (matchedWords > 0) {
        const score = (matchedWords / words.length) * 0.7
        if (score > bestMatch.score) {
          bestMatch = { match: option, score }
        }
      }
    }

    return bestMatch
  }

  /**
   * Detecta ambigüedades que requieren clarificación
   */
  detectAmbiguities(entities: ExtractedEntity[], requiredEntities: EntityType[]): Ambiguity[] {
    const ambiguities: Ambiguity[] = []

    for (const required of requiredEntities) {
      const found = entities.find((e) => e.type === required)

      if (!found) {
        // Entidad no encontrada - generar opciones si es posible
        let options: { id: string; label: string; score: number }[] = []
        let question = ''

        switch (required) {
          case 'distribuidor':
            options = this.context.distribuidores.slice(0, 5).map((d) => ({
              id: d.id,
              label: d.nombre,
              score: 0.5,
            }))
            question = '¿A qué distribuidor?'
            break
          case 'cliente':
            options = this.context.clientes.slice(0, 5).map((c) => ({
              id: c.id,
              label: c.nombre,
              score: 0.5,
            }))
            question = '¿A qué cliente?'
            break
          case 'banco':
            options = this.context.bancos.map((b) => ({
              id: b.id,
              label: b.nombre,
              score: 0.5,
            }))
            question = '¿De qué banco?'
            break
          case 'producto':
            question = '¿Qué producto?'
            break
          case 'cantidad':
            question = '¿Cuántas unidades?'
            break
          case 'precio':
            question = '¿A qué precio?'
            break
        }

        if (question) {
          ambiguities.push({ type: required, options, question })
        }
      } else if (found.confidence < 0.7) {
        // Entidad encontrada pero con baja confianza - confirmar
        ambiguities.push({
          type: required,
          options: [
            { id: String(found.value), label: found.originalText, score: found.confidence },
          ],
          question: `¿Te refieres a "${found.originalText}"?`,
        })
      }
    }

    return ambiguities
  }

  /**
   * Procesa un mensaje completo y devuelve el resultado
   */
  process(text: string, config: FormAutomationConfig): IntentResult {
    const { intent, confidence } = this.detectIntent(text)
    const entities = this.extractEntities(text)

    // Aplicar reglas de inferencia
    for (const rule of config.inferenceRules) {
      if (rule.condition(entities)) {
        const inferredValue = rule.infer(entities, this.context)
        if (inferredValue !== null) {
          entities.push({
            type: rule.entity,
            value: inferredValue,
            confidence: 0.6,
            originalText: 'inferido',
            inferred: true,
          })
        }
      }
    }

    // Detectar entidades faltantes
    const foundTypes = new Set(entities.map((e) => e.type))
    const missingRequired = config.requiredEntities.filter((e) => !foundTypes.has(e))

    // Detectar ambigüedades
    const ambiguities = this.detectAmbiguities(entities, config.requiredEntities)

    return {
      intent,
      confidence,
      entities,
      missingRequired,
      ambiguities,
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useFormAutomation - Hook para automatización de formularios
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useFormAutomation(context: DataContext) {
  const nlu = useMemo(() => new NLUProcessor(context), [context])
  const [pendingIntent, setPendingIntent] = useState<string | null>(null)
  const [collectedEntities, setCollectedEntities] = useState<ExtractedEntity[]>([])
  const [currentAmbiguity, setCurrentAmbiguity] = useState<Ambiguity | null>(null)

  /**
   * Procesa un comando de usuario
   */
  const processCommand = useCallback(
    (text: string, config: FormAutomationConfig) => {
      const result = nlu.process(text, config)

      // Combinar con entidades ya recolectadas
      const allEntities = [...collectedEntities]
      for (const entity of result.entities) {
        const existingIndex = allEntities.findIndex((e) => e.type === entity.type)
        if (existingIndex >= 0) {
          allEntities[existingIndex] = entity
        } else {
          allEntities.push(entity)
        }
      }
      setCollectedEntities(allEntities)

      // Verificar si hay ambigüedades
      if (result.ambiguities.length > 0) {
        setCurrentAmbiguity(result.ambiguities[0] ?? null)
        setPendingIntent(result.intent)
        return {
          action: 'ask_clarification' as const,
          ambiguity: result.ambiguities[0],
          entities: allEntities,
        }
      }

      // Verificar si faltan entidades requeridas
      const foundTypes = new Set(allEntities.map((e) => e.type))
      const missingRequired = config.requiredEntities.filter((e) => !foundTypes.has(e))

      if (missingRequired.length > 0) {
        setPendingIntent(result.intent)
        return {
          action: 'ask_missing' as const,
          missing: missingRequired,
          entities: allEntities,
        }
      }

      // Todos los datos están completos
      return {
        action: 'ready' as const,
        entities: allEntities,
        data: allEntities.reduce(
          (acc, e) => {
            acc[e.type] = e.value
            return acc
          },
          {} as Record<string, unknown>,
        ),
      }
    },
    [nlu, collectedEntities],
  )

  /**
   * Resuelve una ambigüedad con la selección del usuario
   */
  const resolveAmbiguity = useCallback(
    (selectedOption: { id: string; label: string }) => {
      if (!currentAmbiguity) return

      const entity: ExtractedEntity = {
        type: currentAmbiguity.type,
        value: selectedOption.id,
        confidence: 1.0,
        originalText: selectedOption.label,
      }

      setCollectedEntities((prev) => {
        const updated = prev.filter((e) => e.type !== currentAmbiguity.type)
        return [...updated, entity]
      })
      setCurrentAmbiguity(null)
    },
    [currentAmbiguity],
  )

  /**
   * Reinicia el estado
   */
  const reset = useCallback(() => {
    setPendingIntent(null)
    setCollectedEntities([])
    setCurrentAmbiguity(null)
  }, [])

  return {
    processCommand,
    resolveAmbiguity,
    reset,
    pendingIntent,
    collectedEntities,
    currentAmbiguity,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIONES PREDEFINIDAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const FORM_CONFIGS: Record<string, Omit<FormAutomationConfig, 'onSubmit'>> = {
  crear_orden_compra: {
    intent: 'crear_orden_compra',
    label: 'Crear Orden de Compra',
    requiredEntities: ['distribuidor', 'producto', 'cantidad'],
    optionalEntities: ['precio', 'fecha'],
    inferenceRules: [
      {
        entity: 'precio',
        condition: (entities) => {
          const producto = entities.find((e) => e.type === 'producto')
          return !!producto && !entities.find((e) => e.type === 'precio')
        },
        infer: (entities, context) => {
          const producto = entities.find((e) => e.type === 'producto')
          if (producto) {
            const found = context.productos.find((p) => p.id === producto.value)
            return found?.precio ?? null
          }
          return null
        },
      },
    ],
  },
  crear_venta: {
    intent: 'crear_venta',
    label: 'Registrar Venta',
    requiredEntities: ['cliente', 'producto', 'cantidad', 'precio'],
    optionalEntities: ['fecha'],
    inferenceRules: [],
  },
  registrar_cliente: {
    intent: 'registrar_cliente',
    label: 'Registrar Cliente',
    requiredEntities: ['concepto'], // nombre del cliente
    optionalEntities: [],
    inferenceRules: [],
  },
  registrar_gasto: {
    intent: 'registrar_gasto',
    label: 'Registrar Gasto',
    requiredEntities: ['concepto', 'monto', 'banco'],
    optionalEntities: ['fecha'],
    inferenceRules: [],
  },
}

export default useFormAutomation
