// 🤖 AI HOOK - CHRONOS INFINITY
// Hook personalizado para gestionar el estado y la lógica del asistente IA

import { useState, useCallback, useEffect } from 'react';
import { AIService } from '@/app/_lib/services/ai/ai-service';

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

interface UseAIProps {
  onError?: (error: Error) => void;
  onSuccess?: (response: AIResponse) => void;
}

export const useAI = (props?: UseAIProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [aiService] = useState(() => new AIService());

  const sendMessage = useCallback(async ({
    message,
    context
  }: {
    message: string;
    context?: AIContext;
  }): Promise<AIResponse> => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await aiService.processMessage(message, context);
      
      if (props?.onSuccess) {
        props.onSuccess(response);
      }

      return response;
    } catch (error) {
      const aiError = error instanceof Error ? error : new Error('Error desconocido en IA');
      setError(aiError);
      
      if (props?.onError) {
        props.onError(aiError);
      }

      // Respuesta de error por defecto
      return {
        message: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.',
        intent: 'error',
        confidence: 0
      };
    } finally {
      setIsProcessing(false);
    }
  }, [aiService, props]);

  const analyzeIntent = useCallback(async (message: string): Promise<{
    intent: string;
    confidence: number;
    entities: Record<string, any>;
  }> => {
    try {
      return await aiService.analyzeIntent(message);
    } catch (error) {
      console.error('Error analizando intención:', error);
      return {
        intent: 'unknown',
        confidence: 0,
        entities: {}
      };
    }
  }, [aiService]);

  const generateResponse = useCallback(async ({
    intent,
    entities,
    context
  }: {
    intent: string;
    entities: Record<string, any>;
    context?: AIContext;
  }): Promise<AIResponse> => {
    try {
      return await aiService.generateResponse(intent, entities, context);
    } catch (error) {
      console.error('Error generando respuesta:', error);
      return {
        message: 'Lo siento, no pude generar una respuesta adecuada.',
        intent: 'error',
        confidence: 0
      };
    }
  }, [aiService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    analyzeIntent,
    generateResponse,
    isProcessing,
    error,
    clearError
  };
};