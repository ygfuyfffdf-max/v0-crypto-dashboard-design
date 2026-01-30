/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🤖 AI ASSISTANT API — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Endpoint para el asistente de IA conversacional
 */

import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Eres CHRONOS AI, un asistente inteligente especializado en gestión financiera y de inventario.
Tu rol es ayudar al usuario a:
- Registrar ventas, gastos, abonos y transferencias
- Consultar información del sistema (balances, inventario, clientes, etc.)
- Llenar formularios a través de conversación
- Analizar datos financieros

REGLAS:
1. Sé conciso y directo en tus respuestas
2. Cuando el usuario quiera realizar una acción (crear venta, etc.), pregunta los datos necesarios uno por uno
3. Confirma antes de ejecutar acciones importantes
4. Usa formato amigable para montos: "$X,XXX.XX MXN"
5. Responde siempre en español
6. Si detectas una intención de acción, devuelve el JSON de action correspondiente

ACCIONES DISPONIBLES:
- fill_field: Para llenar un campo de formulario
- submit: Para enviar un formulario
- navigate: Para navegar a otra sección
- query: Para consultar información

Formato de respuesta cuando hay acción:
{
  "message": "Tu respuesta al usuario",
  "action": {
    "type": "fill_field|submit|navigate|query",
    "payload": { ... datos de la acción }
  }
}

Formato de respuesta simple:
{
  "message": "Tu respuesta al usuario"
}
`

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface FormField {
  name: string
  label: string
  type: string
  value: unknown
  filled: boolean
}

interface FormContext {
  formType: string
  formTitle: string
  fields: FormField[]
  missingFields: string[]
}

interface RequestBody {
  message: string
  context: {
    currentForm?: FormContext
    systemContext?: Record<string, unknown>
    conversationHistory?: ConversationMessage[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { message, context } = body

    // Build context message
    let contextInfo = ''

    if (context?.currentForm) {
      const { formType, formTitle, fields, missingFields } = context.currentForm
      contextInfo += `\nFORMULARIO ACTUAL: ${formTitle} (${formType})\n`
      contextInfo += `Campos:\n`
      fields.forEach((f) => {
        contextInfo += `- ${f.label} (${f.name}): ${f.filled ? f.value : '[PENDIENTE]'}\n`
      })
      if (missingFields.length > 0) {
        contextInfo += `\nCampos pendientes: ${missingFields.join(', ')}\n`
      }
    }

    if (context?.systemContext) {
      contextInfo += `\nCONTEXTO DEL SISTEMA:\n`
      Object.entries(context.systemContext).forEach(([key, value]) => {
        contextInfo += `- ${key}: ${JSON.stringify(value)}\n`
      })
    }

    // Build messages array
    const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT + contextInfo },
    ]

    // Add conversation history (last 10 messages)
    if (context?.conversationHistory?.length) {
      const history = context.conversationHistory.slice(-10)
      history.forEach((msg) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content })
        }
      })
    }

    // Add current message
    messages.push({ role: 'user', content: message })

    // Generate response using AI SDK
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      messages,
      maxTokens: 500,
      temperature: 0.7,
    })

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(text)
      return NextResponse.json(parsed)
    } catch {
      // If not JSON, return as message
      return NextResponse.json({ message: text })
    }
  } catch (error) {
    console.error('AI Assistant error:', error)

    // Fallback response
    return NextResponse.json({
      message: 'Lo siento, hubo un problema al procesar tu solicitud. ¿Podrías repetir lo que necesitas?',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
