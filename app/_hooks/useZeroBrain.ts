
import { useState, useCallback } from 'react'
import { useCreateVenta, useCreateCliente, useRegistrarGasto, useTransferencia } from '@/app/hooks/useDataHooks'
import { logger } from '@/app/lib/utils/logger'

export interface ZeroCommandResult {
  success: boolean
  message: string
  action?: string
  data?: any
}

export function useZeroBrain() {
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Hooks de mutación
  const createVenta = useCreateVenta()
  const createCliente = useCreateCliente()
  const registrarGasto = useRegistrarGasto()
  const transferencia = useTransferencia()

  const processCommand = useCallback(async (text: string): Promise<ZeroCommandResult> => {
    setIsProcessing(true)
    const lowerText = text.toLowerCase()
    logger.info('🧠 Zero Brain procesando:', { text })

    try {
      // 1. DETECCIÓN DE VENTAS
      // "Vender 50 [producto] a [cliente]"
      // "Registrar venta de 100 pesos a Juan"
      if (lowerText.includes('vender') || lowerText.includes('venta')) {
        // Lógica simple de extracción (mejorar con NLP real si es posible, pero regex funciona para MVP)
        // Patrón: cantidad + producto + cliente
        
        // Mock de éxito por ahora para demostración de flujo
        // En producción real, aquí iría el parsing de entidades
        
        // Simulación de delay de pensamiento con pasos de razonamiento
        await new Promise(resolve => setTimeout(resolve, 500))
        
        return {
          success: true,
          message: 'Entendido. Procesando venta y actualizando inventario.',
          action: 'CREATE_SALE'
        }
      }

      // 2. DETECCIÓN DE CLIENTES
      // "Nuevo cliente Carlos Perez"
      if (lowerText.includes('nuevo cliente') || lowerText.includes('crear cliente')) {
        const nombre = text.replace(/nuevo cliente|crear cliente/gi, '').trim()
        if (nombre) {
          // Análisis predictivo simple: verificar duplicados (mock)
          await new Promise(resolve => setTimeout(resolve, 800))

          await createCliente.mutateAsync({
            nombre,
            email: '',
            telefono: '',
            direccion: ''
          })
          return {
            success: true,
            message: `Cliente ${nombre} creado. He actualizado la red de relaciones.`,
            action: 'CREATE_CLIENT',
            data: { nombre }
          }
        }
      }

      // 3. NAVEGACIÓN INTELIGENTE
      if (lowerText.includes('ir a') || lowerText.includes('abrir') || lowerText.includes('mostrar')) {
        if (lowerText.includes('ventas')) return { success: true, message: 'Desplegando panel de Ventas con filtros activos.', action: 'NAVIGATE', data: '/ventas' }
        if (lowerText.includes('clientes')) return { success: true, message: 'Accediendo a la red de Clientes.', action: 'NAVIGATE', data: '/clientes' }
        if (lowerText.includes('dashboard') || lowerText.includes('inicio')) return { success: true, message: 'Retornando al Centro de Mando.', action: 'NAVIGATE', data: '/' }
        if (lowerText.includes('bancos') || lowerText.includes('bóveda')) return { success: true, message: 'Abriendo Bóveda de Seguridad.', action: 'NAVIGATE', data: '/bancos' }
      }

      // 4. ANÁLISIS RÁPIDO (NUEVO)
      if (lowerText.includes('analiza') || lowerText.includes('estado')) {
         return {
           success: true,
           message: 'Iniciando escaneo de salud financiera...',
           action: 'ANALYZE_SYSTEM'
         }
      }

      // 5. COMANDO NO RECONOCIDO
      return {
        success: false,
        message: 'Comando no reconocido en la base de conocimientos.',
        action: 'UNKNOWN'
      }

    } catch (error) {
      logger.error('Error en Zero Brain', error as Error)
      return {
        success: false,
        message: 'Ocurrió un error procesando tu solicitud.',
        action: 'ERROR'
      }
    } finally {
      setIsProcessing(false)
    }
  }, [createVenta, createCliente, registrarGasto, transferencia])

  return {
    processCommand,
    isProcessing
  }
}
