// @ts-nocheck
// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔄 CHRONOS INFINITY 2030 — BATCH OPERATIONS SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de operaciones en lote optimizado con:
 * - Ejecución paralela con límite de concurrencia
 * - Retry automático con backoff exponencial
 * - Progress tracking
 * - Rollback en caso de fallo
 * - Validación previa de todas las operaciones
 * 
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface BatchOperation<TInput, TResult> {
  id: string
  input: TInput
  execute: (input: TInput) => Promise<TResult>
  rollback?: (input: TInput, result?: TResult) => Promise<void>
  validate?: (input: TInput) => Promise<boolean>
  retryable?: boolean
  maxRetries?: number
}

export interface BatchOperationResult<TResult> {
  id: string
  success: boolean
  result?: TResult
  error?: Error
  retries: number
  duration: number
}

export interface BatchResult<TResult> {
  success: boolean
  totalOperations: number
  successfulOperations: number
  failedOperations: number
  results: BatchOperationResult<TResult>[]
  totalDuration: number
  rolledBack: boolean
}

export interface BatchConfig {
  maxConcurrency?: number
  defaultMaxRetries?: number
  retryDelay?: number
  stopOnError?: boolean
  rollbackOnError?: boolean
  validateAll?: boolean
  onProgress?: (completed: number, total: number, current?: BatchOperationResult<unknown>) => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// BATCH EXECUTOR
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function executeBatch<TInput, TResult>(
  operations: BatchOperation<TInput, TResult>[],
  config: BatchConfig = {}
): Promise<BatchResult<TResult>> {
  const {
    maxConcurrency = 5,
    defaultMaxRetries = 2,
    retryDelay = 1000,
    stopOnError = false,
    rollbackOnError = true,
    validateAll = true,
    onProgress,
  } = config

  const startTime = performance.now()
  const results: BatchOperationResult<TResult>[] = []
  const completedOperations: Array<{
    operation: BatchOperation<TInput, TResult>
    result?: TResult
  }> = []
  let rolledBack = false

  // Fase 1: Validación (si está habilitada)
  if (validateAll) {
    logger.info('🔍 Validando operaciones...', {
      context: 'BatchOperations',
      data: { count: operations.length },
    })

    for (const op of operations) {
      if (op.validate) {
        const isValid = await op.validate(op.input)
        if (!isValid) {
          return {
            success: false,
            totalOperations: operations.length,
            successfulOperations: 0,
            failedOperations: operations.length,
            results: [{
              id: op.id,
              success: false,
              error: new Error(`Validación fallida para operación ${op.id}`),
              retries: 0,
              duration: 0,
            }],
            totalDuration: performance.now() - startTime,
            rolledBack: false,
          }
        }
      }
    }
  }

  // Fase 2: Ejecución con concurrencia limitada
  const queue = [...operations]
  const executing: Promise<void>[] = []

  logger.info('🚀 Iniciando ejecución batch', {
    context: 'BatchOperations',
    data: { totalOperations: operations.length, maxConcurrency },
  })

  const executeOperation = async (op: BatchOperation<TInput, TResult>): Promise<void> => {
    const opStartTime = performance.now()
    let retries = 0
    const maxRetries = op.maxRetries ?? defaultMaxRetries

    while (retries <= maxRetries) {
      try {
        const result = await op.execute(op.input)
        
        const opResult: BatchOperationResult<TResult> = {
          id: op.id,
          success: true,
          result,
          retries,
          duration: performance.now() - opStartTime,
        }
        
        results.push(opResult)
        completedOperations.push({ operation: op, result })
        
        onProgress?.(results.length, operations.length, opResult)
        return

      } catch (error) {
        retries++
        
        if (retries > maxRetries || !op.retryable) {
          const opResult: BatchOperationResult<TResult> = {
            id: op.id,
            success: false,
            error: error as Error,
            retries,
            duration: performance.now() - opStartTime,
          }
          
          results.push(opResult)
          onProgress?.(results.length, operations.length, opResult)
          
          if (stopOnError) {
            throw error
          }
          return
        }

        // Backoff exponencial
        await new Promise((resolve) => 
          setTimeout(resolve, retryDelay * Math.pow(2, retries - 1))
        )
      }
    }
  }

  try {
    while (queue.length > 0 || executing.length > 0) {
      // Llenar el pool de ejecución
      while (queue.length > 0 && executing.length < maxConcurrency) {
        const op = queue.shift()!
        const promise = executeOperation(op).then(() => {
          const index = executing.indexOf(promise)
          if (index > -1) executing.splice(index, 1)
        })
        executing.push(promise)
      }

      // Esperar a que alguno termine
      if (executing.length > 0) {
        await Promise.race(executing)
      }
    }

  } catch (error) {
    // Si stopOnError está habilitado, hacer rollback
    if (rollbackOnError && completedOperations.length > 0) {
      logger.warn('⏪ Iniciando rollback...', {
        context: 'BatchOperations',
        data: { completedCount: completedOperations.length },
      })

      rolledBack = true

      // Rollback en orden inverso
      for (let i = completedOperations.length - 1; i >= 0; i--) {
        const { operation, result } = completedOperations[i]
        if (operation.rollback) {
          try {
            await operation.rollback(operation.input, result)
          } catch (rollbackError) {
            logger.error('Error en rollback', rollbackError as Error, {
              context: 'BatchOperations',
              data: { operationId: operation.id },
            })
          }
        }
      }
    }
  }

  const totalDuration = performance.now() - startTime
  const successfulOps = results.filter((r) => r.success).length
  const failedOps = results.filter((r) => !r.success).length

  logger.info(`${successfulOps === operations.length ? '✅' : '⚠️'} Batch completado`, {
    context: 'BatchOperations',
    data: {
      total: operations.length,
      successful: successfulOps,
      failed: failedOps,
      duration: Math.round(totalDuration),
      rolledBack,
    },
  })

  return {
    success: failedOps === 0,
    totalOperations: operations.length,
    successfulOperations: successfulOps,
    failedOperations: failedOps,
    results,
    totalDuration,
    rolledBack,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// BATCH BUILDER — Construcción fluida de operaciones batch
// ═══════════════════════════════════════════════════════════════════════════════════════

export class BatchBuilder<TInput, TResult> {
  private operations: BatchOperation<TInput, TResult>[] = []
  private config: BatchConfig = {}

  addOperation(
    id: string,
    input: TInput,
    execute: (input: TInput) => Promise<TResult>,
    options?: Partial<Omit<BatchOperation<TInput, TResult>, 'id' | 'input' | 'execute'>>
  ): this {
    this.operations.push({
      id,
      input,
      execute,
      ...options,
    })
    return this
  }

  addMany(
    items: Array<{
      id: string
      input: TInput
      options?: Partial<Omit<BatchOperation<TInput, TResult>, 'id' | 'input' | 'execute'>>
    }>,
    execute: (input: TInput) => Promise<TResult>
  ): this {
    for (const item of items) {
      this.addOperation(item.id, item.input, execute, item.options)
    }
    return this
  }

  configure(config: BatchConfig): this {
    this.config = { ...this.config, ...config }
    return this
  }

  maxConcurrency(n: number): this {
    this.config.maxConcurrency = n
    return this
  }

  stopOnError(stop = true): this {
    this.config.stopOnError = stop
    return this
  }

  rollbackOnError(rollback = true): this {
    this.config.rollbackOnError = rollback
    return this
  }

  onProgress(callback: BatchConfig['onProgress']): this {
    this.config.onProgress = callback
    return this
  }

  async execute(): Promise<BatchResult<TResult>> {
    return executeBatch(this.operations, this.config)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════════════

export function createBatch<TInput, TResult>(): BatchBuilder<TInput, TResult> {
  return new BatchBuilder<TInput, TResult>()
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Ejecuta una lista de promesas con concurrencia limitada
 */
export async function parallelLimit<T>(
  tasks: Array<() => Promise<T>>,
  limit: number
): Promise<T[]> {
  const results: T[] = []
  const executing: Promise<void>[] = []
  const queue = [...tasks]

  while (queue.length > 0 || executing.length > 0) {
    while (queue.length > 0 && executing.length < limit) {
      const task = queue.shift()!
      const index = results.length
      results.push(undefined as unknown as T)

      const promise = task().then((result) => {
        results[index] = result
        const execIndex = executing.indexOf(promise)
        if (execIndex > -1) executing.splice(execIndex, 1)
      })

      executing.push(promise)
    }

    if (executing.length > 0) {
      await Promise.race(executing)
    }
  }

  return results
}

/**
 * Retry wrapper con backoff exponencial
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    baseDelay?: number
    maxDelay?: number
    shouldRetry?: (error: Error) => boolean
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, shouldRetry = () => true } = options

  let lastError: Error | undefined
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export type { BatchOperation, BatchOperationResult, BatchResult, BatchConfig }
