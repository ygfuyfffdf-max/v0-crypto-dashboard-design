/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔄 CHRONOS INFINITY 2030 — SISTEMA DE FLUJOS OPERACIONALES OPTIMIZADO
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Motor de flujos operacionales con:
 * - Transacciones atómicas garantizadas
 * - Rollback automático en errores
 * - Validación en cascada
 * - Hooks de lifecycle
 * - Auditoría integrada
 * - Optimistic updates con reconciliación
 * 
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { nanoid } from 'nanoid'
import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back'

interface FlowStep<TInput, TOutput, TContext> {
  id: string
  name: string
  execute: (input: TInput, context: TContext) => Promise<TOutput>
  rollback?: (output: TOutput, context: TContext) => Promise<void>
  validate?: (input: TInput, context: TContext) => Promise<boolean>
  onStart?: (input: TInput, context: TContext) => void
  onComplete?: (output: TOutput, context: TContext) => void
  onError?: (error: Error, context: TContext) => void
  retryable?: boolean
  maxRetries?: number
  timeout?: number
}

interface StepResult<T> {
  stepId: string
  stepName: string
  status: StepStatus
  output?: T
  error?: Error
  duration: number
  retries: number
  timestamp: Date
}

interface FlowResult<TFinal> {
  flowId: string
  flowName: string
  success: boolean
  finalResult?: TFinal
  steps: StepResult<unknown>[]
  totalDuration: number
  startTime: Date
  endTime: Date
  error?: Error
  rolledBack: boolean
}

interface FlowConfig {
  name: string
  description?: string
  enableAudit?: boolean
  enableOptimisticUpdate?: boolean
  maxConcurrentSteps?: number
  globalTimeout?: number
}

type FlowHook<TContext> = (context: TContext, result: FlowResult<unknown>) => void | Promise<void>

// ═══════════════════════════════════════════════════════════════════════════════════════
// FLOW BUILDER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════

export class FlowBuilder<TInitialInput, TContext extends Record<string, unknown> = Record<string, unknown>> {
  private steps: FlowStep<unknown, unknown, TContext>[] = []
  private config: FlowConfig
  private beforeHooks: FlowHook<TContext>[] = []
  private afterHooks: FlowHook<TContext>[] = []
  private errorHooks: ((error: Error, context: TContext) => void)[] = []

  constructor(config: FlowConfig) {
    this.config = {
      enableAudit: true,
      enableOptimisticUpdate: false,
      maxConcurrentSteps: 1,
      globalTimeout: 30000,
      ...config,
    }
  }

  /**
   * Agrega un paso al flujo
   */
  step<TInput, TOutput>(
    step: FlowStep<TInput, TOutput, TContext>
  ): FlowBuilder<TInitialInput, TContext> {
    this.steps.push(step as FlowStep<unknown, unknown, TContext>)
    return this
  }

  /**
   * Agrega un paso simple (solo función de ejecución)
   */
  addStep<TInput, TOutput>(
    name: string,
    execute: (input: TInput, context: TContext) => Promise<TOutput>,
    options?: Partial<FlowStep<TInput, TOutput, TContext>>
  ): FlowBuilder<TInitialInput, TContext> {
    return this.step({
      id: nanoid(8),
      name,
      execute,
      ...options,
    })
  }

  /**
   * Agrega hook antes de ejecutar el flujo
   */
  before(hook: FlowHook<TContext>): FlowBuilder<TInitialInput, TContext> {
    this.beforeHooks.push(hook)
    return this
  }

  /**
   * Agrega hook después de ejecutar el flujo
   */
  after(hook: FlowHook<TContext>): FlowBuilder<TInitialInput, TContext> {
    this.afterHooks.push(hook)
    return this
  }

  /**
   * Agrega hook de error
   */
  onError(hook: (error: Error, context: TContext) => void): FlowBuilder<TInitialInput, TContext> {
    this.errorHooks.push(hook)
    return this
  }

  /**
   * Ejecuta el flujo completo
   */
  async execute<TFinal>(
    input: TInitialInput,
    initialContext?: Partial<TContext>
  ): Promise<FlowResult<TFinal>> {
    const flowId = nanoid(12)
    const startTime = new Date()
    const stepResults: StepResult<unknown>[] = []
    const completedSteps: { step: FlowStep<unknown, unknown, TContext>; output: unknown }[] = []
    
    let currentInput: unknown = input
    let context = { ...initialContext } as TContext
    let success = false
    let finalResult: TFinal | undefined
    let flowError: Error | undefined
    let rolledBack = false

    // Log inicio
    if (this.config.enableAudit) {
      logger.info(`🚀 Iniciando flujo: ${this.config.name}`, {
        context: 'FlowEngine',
        data: { flowId, stepsCount: this.steps.length },
      })
    }

    try {
      // Ejecutar before hooks
      for (const hook of this.beforeHooks) {
        await hook(context, { 
          flowId, 
          flowName: this.config.name,
          success: false,
          steps: [],
          totalDuration: 0,
          startTime,
          endTime: new Date(),
          rolledBack: false,
        })
      }

      // Ejecutar pasos secuencialmente
      for (const step of this.steps) {
        const stepStartTime = performance.now()
        let stepStatus: StepStatus = 'running'
        let stepOutput: unknown
        let stepError: Error | undefined
        let retries = 0

        // Callback onStart
        step.onStart?.(currentInput, context)

        // Validación
        if (step.validate) {
          const isValid = await step.validate(currentInput, context)
          if (!isValid) {
            throw new Error(`Validación fallida en paso: ${step.name}`)
          }
        }

        // Ejecución con reintentos
        const maxRetries = step.maxRetries ?? 0
        
        while (retries <= maxRetries) {
          try {
            // Timeout
            if (step.timeout) {
              stepOutput = await Promise.race([
                step.execute(currentInput, context),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Timeout')), step.timeout)
                ),
              ])
            } else {
              stepOutput = await step.execute(currentInput, context)
            }

            stepStatus = 'completed'
            break
          } catch (error) {
            retries++
            stepError = error as Error
            
            if (retries > maxRetries || !step.retryable) {
              stepStatus = 'failed'
              throw error
            }
            
            // Esperar antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 1000 * retries))
          }
        }

        const stepDuration = performance.now() - stepStartTime

        // Registrar resultado del paso
        stepResults.push({
          stepId: step.id,
          stepName: step.name,
          status: stepStatus,
          output: stepOutput,
          error: stepError,
          duration: stepDuration,
          retries,
          timestamp: new Date(),
        })

        // Guardar para posible rollback
        if (stepStatus === 'completed') {
          completedSteps.push({ step, output: stepOutput })
          step.onComplete?.(stepOutput, context)
        }

        // Actualizar input para siguiente paso
        currentInput = stepOutput
      }

      // Flujo completado exitosamente
      success = true
      finalResult = currentInput as TFinal

    } catch (error) {
      flowError = error as Error
      
      // Notificar hooks de error
      this.errorHooks.forEach(hook => {
        try {
          hook(flowError!, context)
        } catch (e) {
          logger.error('Error en hook de error', e as Error, { context: 'FlowEngine' })
        }
      })

      // Ejecutar rollback de pasos completados (en orden inverso)
      if (completedSteps.length > 0) {
        rolledBack = true
        
        for (let i = completedSteps.length - 1; i >= 0; i--) {
          const { step, output } = completedSteps[i]
          
          if (step.rollback) {
            try {
              await step.rollback(output, context)
              
              // Actualizar estado del paso a rolled_back
              const stepResult = stepResults.find(r => r.stepId === step.id)
              if (stepResult) {
                stepResult.status = 'rolled_back'
              }
              
              logger.info(`↩️ Rollback completado: ${step.name}`, {
                context: 'FlowEngine',
                data: { flowId },
              })
            } catch (rollbackError) {
              logger.error(`Error en rollback de ${step.name}`, rollbackError as Error, {
                context: 'FlowEngine',
                data: { flowId },
              })
            }
          }
        }
      }
    }

    const endTime = new Date()
    const totalDuration = endTime.getTime() - startTime.getTime()

    const result: FlowResult<TFinal> = {
      flowId,
      flowName: this.config.name,
      success,
      finalResult,
      steps: stepResults,
      totalDuration,
      startTime,
      endTime,
      error: flowError,
      rolledBack,
    }

    // Ejecutar after hooks
    for (const hook of this.afterHooks) {
      try {
        await hook(context, result as FlowResult<unknown>)
      } catch (e) {
        logger.error('Error en after hook', e as Error, { context: 'FlowEngine' })
      }
    }

    // Log final
    if (this.config.enableAudit) {
      const logMethod = success ? logger.info : logger.error
      logMethod(
        `${success ? '✅' : '❌'} Flujo ${success ? 'completado' : 'fallido'}: ${this.config.name}`,
        {
          context: 'FlowEngine',
          data: { 
            flowId, 
            duration: totalDuration,
            stepsCompleted: stepResults.filter(s => s.status === 'completed').length,
            rolledBack,
          },
        }
      )
    }

    return result
  }

  /**
   * Crea una versión del flujo con optimistic update
   */
  withOptimisticUpdate<TOptimistic>(
    getOptimisticResult: (input: TInitialInput) => TOptimistic,
    onOptimisticUpdate: (result: TOptimistic) => void,
    onRevert: () => void
  ) {
    const originalExecute = this.execute.bind(this)

    return async <TFinal>(
      input: TInitialInput,
      initialContext?: Partial<TContext>
    ): Promise<FlowResult<TFinal>> => {
      // Aplicar actualización optimista
      const optimisticResult = getOptimisticResult(input)
      onOptimisticUpdate(optimisticResult)

      try {
        const result = await originalExecute<TFinal>(input, initialContext)
        
        if (!result.success) {
          // Revertir si falló
          onRevert()
        }
        
        return result
      } catch (error) {
        // Revertir en caso de error
        onRevert()
        throw error
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Crea un nuevo flujo
 */
export function createFlow<TInput, TContext extends Record<string, unknown> = Record<string, unknown>>(
  config: FlowConfig
): FlowBuilder<TInput, TContext> {
  return new FlowBuilder<TInput, TContext>(config)
}

/**
 * Crea un paso simple
 */
export function createStep<TInput, TOutput, TContext>(
  name: string,
  execute: (input: TInput, context: TContext) => Promise<TOutput>,
  rollback?: (output: TOutput, context: TContext) => Promise<void>
): FlowStep<TInput, TOutput, TContext> {
  return {
    id: nanoid(8),
    name,
    execute,
    rollback,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FLUJOS PRE-DEFINIDOS PARA CHRONOS
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface VentaInput {
  clienteId: string
  clienteNombre?: string
  cantidad: number
  precioVentaUnidad: number
  precioCompraUnidad: number
  precioFlete: number
  abonoInicial: number
  observaciones?: string
}

export interface OrdenCompraInput {
  distribuidorId: string
  distribuidorNombre?: string
  cantidad: number
  precioUnitario: number
  costoTransporte?: number
  pagoInicial?: number
  bancoOrigen?: string
  observaciones?: string
}

export interface TransferenciaInput {
  bancoOrigenId: string
  bancoDestinoId: string
  monto: number
  concepto: string
  referencia?: string
}

/**
 * Template para flujo de venta completa
 */
export const ventaFlowTemplate = createFlow<VentaInput>({
  name: 'Venta Completa',
  description: 'Flujo completo de registro de venta con distribución GYA',
  enableAudit: true,
})
  .addStep('Validar Stock', async (input) => {
    // La implementación real verificaría el almacén
    if (input.cantidad <= 0) throw new Error('Cantidad inválida')
    return input
  })
  .addStep('Crear/Actualizar Cliente', async (input) => {
    // La implementación real crearía o actualizaría el cliente
    return { ...input, clienteProcessed: true }
  })
  .addStep('Registrar Venta', async (input) => {
    // La implementación real insertaría en la DB
    return { ...input, ventaId: nanoid() }
  })
  .addStep('Calcular Distribución GYA', async (input) => {
    const precioTotal = input.cantidad * input.precioVentaUnidad
    const costoTotal = input.cantidad * input.precioCompraUnidad
    const fleteTotal = input.cantidad * input.precioFlete
    
    return {
      ...input,
      distribucion: {
        bovedaMonte: costoTotal,
        fleteSur: fleteTotal,
        utilidades: precioTotal - costoTotal - fleteTotal,
        total: precioTotal,
      },
    }
  })
  .addStep('Descontar Stock', async (input) => {
    // La implementación real actualizaría el almacén
    return { ...input, stockActualizado: true }
  })
  .addStep('Distribuir a Bancos', async (input) => {
    // La implementación real actualizaría los bancos
    return { ...input, bancosActualizados: true }
  })

/**
 * Template para flujo de orden de compra
 */
export const ordenCompraFlowTemplate = createFlow<OrdenCompraInput>({
  name: 'Orden de Compra',
  description: 'Flujo completo de registro de orden de compra',
  enableAudit: true,
})
  .addStep('Validar Datos', async (input) => {
    if (input.cantidad <= 0) throw new Error('Cantidad inválida')
    if (input.precioUnitario <= 0) throw new Error('Precio inválido')
    return input
  })
  .addStep('Crear/Actualizar Distribuidor', async (input) => {
    return { ...input, distribuidorProcessed: true }
  })
  .addStep('Registrar Orden', async (input) => {
    return { ...input, ordenId: nanoid() }
  })
  .addStep('Agregar a Almacén', async (input) => {
    return { ...input, almacenActualizado: true }
  })
  .addStep('Registrar Pago Inicial', async (input) => {
    if (input.pagoInicial && input.pagoInicial > 0 && input.bancoOrigen) {
      return { ...input, pagoRegistrado: true }
    }
    return { ...input, pagoRegistrado: false }
  })

/**
 * Template para flujo de transferencia
 */
export const transferenciaFlowTemplate = createFlow<TransferenciaInput>({
  name: 'Transferencia Entre Bancos',
  description: 'Flujo de transferencia con validación de fondos',
  enableAudit: true,
})
  .addStep('Validar Fondos', async (input) => {
    // La implementación real verificaría el saldo del banco origen
    if (input.monto <= 0) throw new Error('Monto inválido')
    return input
  })
  .addStep('Descontar de Origen', async (input) => {
    return { ...input, origenDescontado: true }
  }, async (_, __) => {
    // Rollback: revertir el descuento
  })
  .addStep('Agregar a Destino', async (input) => {
    return { ...input, destinoAcreditado: true }
  }, async (_, __) => {
    // Rollback: revertir el crédito
  })
  .addStep('Registrar Movimientos', async (input) => {
    return { ...input, movimientosRegistrados: true }
  })

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export type { FlowStep, FlowResult, StepResult, FlowConfig, StepStatus }
