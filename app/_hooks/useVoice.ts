// @ts-nocheck
// 🎤 VOICE HOOK - CHRONOS INFINITY
// Hook personalizado para gestionar el reconocimiento de voz y síntesis de voz

import { DeepgramSTTService } from '@/app/_lib/services/voice/deepgram-service';
import { ElevenLabsVoiceService } from '@/app/_lib/services/voice/elevenlabs-service';
import { useCallback, useEffect, useState } from 'react';

interface VoiceHookOptions {
  onTranscript?: (transcript: string) => void;
  onError?: (error: Error) => void;
  language?: string;
  continuous?: boolean;
}

interface UseVoiceReturn {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  transcript: string;
  startListening: (callback?: (transcript: string) => void) => Promise<void>;
  stopListening: () => void;
  speak: (text: string, options?: { voiceId?: string; emotion?: string }) => Promise<void>;
  stopSpeaking: () => void;
  error: Error | null;
}

export const useVoice = (options?: VoiceHookOptions): UseVoiceReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<Error | null>(null);
  
  const [elevenLabsService] = useState(() => new ElevenLabsVoiceService());
  const [deepgramService] = useState(() => new DeepgramSTTService());

  // Verificar soporte del navegador
  useEffect(() => {
    const checkSupport = () => {
      const hasWebSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      const hasWebAudio = 'AudioContext' in window || 'webkitAudioContext' in window;
      
      if (!hasWebSpeech || !hasWebAudio) {
        setIsSupported(false);
        setError(new Error('Reconocimiento de voz no soportado en este navegador'));
      }
    };

    checkSupport();
  }, []);

  const startListening = useCallback(async (callback?: (transcript: string) => void) => {
    if (!isSupported) {
      setError(new Error('Reconocimiento de voz no soportado'));
      return;
    }

    try {
      setIsListening(true);
      setError(null);

      // Usar callback proporcionado o el de las opciones
      const transcriptCallback = callback || options?.onTranscript;
      
      await deepgramService.startListening({
        onTranscript: (text: string) => {
          setTranscript(text);
          if (transcriptCallback) {
            transcriptCallback(text);
          }
        },
        onError: (error: Error) => {
          setError(error);
          setIsListening(false);
          if (options?.onError) {
            options.onError(error);
          }
        },
        language: options?.language || 'es-ES',
        continuous: options?.continuous || true
      });

    } catch (error) {
      const voiceError = error instanceof Error ? error : new Error('Error al iniciar reconocimiento de voz');
      setError(voiceError);
      setIsListening(false);
      
      if (options?.onError) {
        options.onError(voiceError);
      }
    }
  }, [isSupported, deepgramService, options]);

  const stopListening = useCallback(() => {
    try {
      deepgramService.stopListening();
      setIsListening(false);
      setError(null);
    } catch (error) {
      const voiceError = error instanceof Error ? error : new Error('Error al detener reconocimiento de voz');
      setError(voiceError);
    }
  }, [deepgramService]);

  const speak = useCallback(async (text: string, options?: { voiceId?: string; emotion?: string }) => {
    if (!isSupported) {
      setError(new Error('Síntesis de voz no soportada'));
      return;
    }

    try {
      setIsSpeaking(true);
      setError(null);

      await elevenLabsService.speak(text, {
        voiceId: options?.voiceId,
        emotion: options?.emotion || 'professional',
        onStart: () => {
          setIsSpeaking(true);
        },
        onEnd: () => {
          setIsSpeaking(false);
        },
        onError: (error: Error) => {
          setError(error);
          setIsSpeaking(false);
          if (options?.onError) {
            options.onError(error);
          }
        }
      });

    } catch (error) {
      const voiceError = error instanceof Error ? error : new Error('Error en síntesis de voz');
      setError(voiceError);
      setIsSpeaking(false);
      
      if (options?.onError) {
        options.onError(voiceError);
      }
    }
  }, [isSupported, elevenLabsService]);

  const stopSpeaking = useCallback(() => {
    try {
      elevenLabsService.stop();
      setIsSpeaking(false);
      setError(null);
    } catch (error) {
      const voiceError = error instanceof Error ? error : new Error('Error al detener síntesis de voz');
      setError(voiceError);
    }
  }, [elevenLabsService]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
      if (isSpeaking) {
        stopSpeaking();
      }
    };
  }, [isListening, isSpeaking, stopListening, stopSpeaking]);

  return {
    isListening,
    isSpeaking,
    isSupported,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    error
  };
};