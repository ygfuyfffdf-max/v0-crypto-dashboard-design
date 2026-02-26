// @ts-nocheck
// 🤖 AI SERVICE - CHRONOS INFINITY
// Servicio principal de inteligencia artificial para automatización de formularios y respuestas inteligentes

import { OpenAI } from 'openai';
import { FormAutomationService } from './form-automation-service';

interface AIContext {
  conversationHistory: any[];
  systemContext: {
    userRole: string;
    currentTime: string;
    availableActions: string[];
  };
}

interface AIResponse {
  message: string;
  action?: {
    type: string;
    payload: any;
  };
  intent?: string;
  confidence?: number;
  formId?: string;
}

interface IntentAnalysis {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
}

export class AIService {
  private openai: OpenAI;
  private formService: FormAutomationService;
  private conversationContext: Map<string, any>;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
      dangerouslyAllowBrowser: true
    });
    
    this.formService = new FormAutomationService();
    this.conversationContext = new Map();
  }

  async processMessage(message: string, context?: AIContext): Promise<AIResponse> {
    try {
      // 1. Análisis de intención
      const intentAnalysis = await this.analyzeIntent(message);
      
      // 2. Generar respuesta basada en la intención
      const response = await this.generateResponse(
        intentAnalysis.intent,
        intentAnalysis.entities,
        context
      );

      // 3. Ejecutar acción si es necesario
      if (response.action) {
        await this.executeAction(response.action, intentAnalysis.entities);
      }

      return {
        ...response,
        intent: intentAnalysis.intent,
        confidence: intentAnalysis.confidence
      };

    } catch (error) {
      console.error('Error en AI Service:', error);
      return {
        message: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        intent: 'error',
        confidence: 0
      };
    }
  }

  async analyzeIntent(message: string): Promise<IntentAnalysis> {
    const systemPrompt = `Eres un asistente inteligente de CHRONOS INFINITY que analiza intenciones de usuarios para automatizar formularios y procesos de negocio.

Analiza el siguiente mensaje y determina:
1. La intención principal
2. Las entidades relevantes (nombres, montos, fechas, etc.)
3. El nivel de confianza

Intenciones posibles:
- register_sale: Registrar una venta
- manage_expense: Gestionar un gasto
- create_client: Crear nuevo cliente
- query_data: Consultar información
- generate_report: Generar reporte
- advanced_automation: Automatización avanzada
- greeting: Saludo
- help: Ayuda
- unknown: Desconocida

Formato de respuesta JSON:
{
  "intent": "nombre_intencion",
  "confidence": 0.95,
  "entities": {
    "cliente": "nombre del cliente",
    "monto": 5000,
    "fecha": "2024-01-15",
    "producto": "nombre del producto",
    "metodo_pago": "efectivo/tarjeta/transferencia"
  }
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
      
      return {
        intent: result.intent || 'unknown',
        confidence: result.confidence || 0,
        entities: result.entities || {}
      };

    } catch (error) {
      console.error('Error analizando intención:', error);
      
      // Análisis de respaldo con reglas simples
      return this.fallbackIntentAnalysis(message);
    }
  }

  async generateResponse(
    intent: string,
    entities: Record<string, any>,
    context?: AIContext
  ): Promise<AIResponse> {
    const responses = this.getIntentResponses(intent, entities, context);
    
    // Seleccionar respuesta apropiada basada en el contexto
    const selectedResponse = await this.selectAppropriateResponse(responses, context);
    
    return selectedResponse;
  }

  private getIntentResponses(intent: string, entities: Record<string, any>, context?: AIContext): AIResponse[] {
    const responses: { [key: string]: AIResponse[] } = {
      register_sale: [
        {
          message: `Perfecto, voy a registrar la venta. ¿Podrías confirmar el método de pago para ${entities.cliente || 'el cliente'}?`,
          action: {
            type: 'prepare_form',
            payload: { formType: 'sale', entities }
          }
        },
        {
          message: `Venta registrada exitosamente para ${entities.cliente} por $${entities.monto || 0}. ¿Deseas generar la factura?`,
          action: {
            type: 'create_record',
            payload: { type: 'sale', entities }
          }
        }
      ],
      manage_expense: [
        {
          message: `Entendido, voy a registrar el gasto de $${entities.monto || 0}. ¿Podrías especificar la categoría?`,
          action: {
            type: 'prepare_form',
            payload: { formType: 'expense', entities }
          }
        }
      ],
      create_client: [
        {
          message: `Excelente, voy a crear el cliente ${entities.cliente || ''}. ¿Podrías proporcionar el RFC y dirección?`,
          action: {
            type: 'prepare_form',
            payload: { formType: 'client', entities }
          }
        }
      ],
      query_data: [
        {
          message: `Voy a consultar la información solicitada. ¿Sobre qué período específico necesitas los datos?`,
          action: {
            type: 'query_data',
            payload: { queryType: entities.query_type || 'general', entities }
          }
        }
      ],
      generate_report: [
        {
          message: `Generaré el reporte solicitado. ¿Prefieres formato PDF o Excel?`,
          action: {
            type: 'generate_report',
            payload: { reportType: entities.report_type || 'general', entities }
          }
        }
      ],
      greeting: [
        {
          message: `¡Hola! Soy tu asistente inteligente de CHRONOS INFINITY. ¿En qué puedo ayudarte hoy?`
        }
      ],
      help: [
        {
          message: `Puedo ayudarte con:
• Registrar ventas y gastos
• Crear y gestionar clientes
• Generar reportes automáticos
• Consultar datos financieros
• Automatizar procesos empresariales

¿Qué necesitas hacer?`
        }
      ],
      unknown: [
        {
          message: `No estoy seguro de entender. ¿Podrías reformular tu pregunta o especificar qué necesitas hacer?`
        }
      ]
    };

    return responses[intent] || responses.unknown;
  }

  private async selectAppropriateResponse(responses: AIResponse[], context?: AIContext): Promise<AIResponse> {
    // Lógica simple para seleccionar respuesta basada en el contexto
    if (!context?.conversationHistory?.length) {
      return responses[0]; // Primera respuesta para nuevas conversaciones
    }

    // Analizar historial para determinar qué respuesta es más apropiada
    const lastMessage = context.conversationHistory[context.conversationHistory.length - 1];
    
    if (lastMessage?.role === 'assistant' && responses.length > 1) {
      return responses[1]; // Segunda respuesta si ya hubo una interacción
    }

    return responses[0];
  }

  private async executeAction(action: { type: string; payload: any }, entities: Record<string, any>) {
    try {
      switch (action.type) {
        case 'create_record':
          await this.formService.createRecord({
            type: action.payload.type,
            entities: action.payload.entities
          });
          break;
        
        case 'prepare_form':
          // Preparar formulario para ser completado
          await this.formService.prepareForm(action.payload.formType, action.payload.entities);
          break;
        
        case 'query_data':
          // Ejecutar consulta de datos
          await this.formService.queryData(action.payload.queryType, action.payload.entities);
          break;
        
        case 'generate_report':
          // Generar reporte
          await this.formService.generateReport(action.payload.reportType, action.payload.entities);
          break;
      }
    } catch (error) {
      console.error('Error ejecutando acción:', error);
      throw error;
    }
  }

  private fallbackIntentAnalysis(message: string): IntentAnalysis {
    // Análisis de respaldo con reglas simples
    const lowerMessage = message.toLowerCase();
    
    // Palabras clave por intención
    const keywords = {
      register_sale: ['venta', 'vender', 'vendido', 'cliente', 'compra', 'monto'],
      manage_expense: ['gasto', 'pagar', 'pago', 'costo', 'egreso'],
      create_client: ['cliente', 'nuevo', 'agregar', 'crear'],
      query_data: ['consultar', 'ver', 'buscar', 'obtener', 'mostrar'],
      generate_report: ['reporte', 'informe', 'resumen', 'estadística'],
      greeting: ['hola', 'buenos', 'buenas', 'saludos']
    };

    let bestIntent = 'unknown';
    let maxScore = 0;
    const entities: Record<string, any> = {};

    // Detectar intención basada en palabras clave
    for (const [intent, words] of Object.entries(keywords)) {
      const score = words.reduce((acc, word) => 
        acc + (lowerMessage.includes(word) ? 1 : 0), 0
      );
      
      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent;
      }
    }

    // Extraer entidades básicas
    this.extractBasicEntities(message, entities);

    return {
      intent: bestIntent,
      confidence: Math.min(maxScore / 3, 1), // Normalizar confianza
      entities
    };
  }

  private extractBasicEntities(message: string, entities: Record<string, any>) {
    // Extraer montos (números con símbolo de peso o seguidos de "pesos")
    const amountMatch = message.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (amountMatch) {
      entities.monto = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // Extraer nombres (palabras que podrían ser nombres)
    const nameMatch = message.match(/(?:cliente|a|para)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (nameMatch) {
      entities.cliente = nameMatch[1];
    }

    // Extraer fechas (formatos básicos)
    const dateMatch = message.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|hoy|ayer|mañana)/i);
    if (dateMatch) {
      entities.fecha = dateMatch[1];
    }
  }

  // Métodos adicionales para funcionalidades avanzadas
  async generateSmartSuggestions(context: string): Promise<string[]> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "Eres un asistente que genera sugerencias inteligentes basadas en el contexto actual."
          },
          {
            role: "user",
            content: `Basado en este contexto: "${context}", genera 3 sugerencias útiles para el usuario.`
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      const suggestions = completion.choices[0]?.message?.content?.split('\n').filter(s => s.trim()) || [];
      return suggestions.map(s => s.replace(/^\d+\.\s*/, '').trim());

    } catch (error) {
      console.error('Error generando sugerencias:', error);
      return [];
    }
  }

  async validateData(data: Record<string, any>, validationRules: Record<string, any>): Promise<{
    isValid: boolean;
    errors: Record<string, string>;
    suggestions: string[];
  }> {
    try {
      const validationPrompt = `Valida los siguientes datos según las reglas proporcionadas:

Datos: ${JSON.stringify(data, null, 2)}
Reglas: ${JSON.stringify(validationRules, null, 2)}

Proporciona:
1. Si es válido o no
2. Errores específicos por campo
3. Sugerencias de mejora

Formato JSON:`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: "Eres un validador de datos empresariales experto." },
          { role: "user", content: validationPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
      
      return {
        isValid: result.isValid || false,
        errors: result.errors || {},
        suggestions: result.suggestions || []
      };

    } catch (error) {
      console.error('Error validando datos:', error);
      return {
        isValid: false,
        errors: { general: 'Error en validación' },
        suggestions: []
      };
    }
  }
}