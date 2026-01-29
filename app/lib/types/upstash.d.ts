/**
 * @fileoverview Declaraciones de tipos para módulos opcionales de Upstash
 * Estos módulos son opcionales y el sistema funciona con fallback a memoria
 * cuando no están disponibles.
 */

declare module '@upstash/redis' {
  export interface RedisOptions {
    url: string
    token: string
  }

  export class Redis {
    constructor(options: RedisOptions)
    get(key: string): Promise<unknown>
    set(key: string, value: unknown): Promise<void>
    setex(key: string, seconds: number, value: unknown): Promise<void>
    del(key: string): Promise<void>
  }
}

declare module '@upstash/ratelimit' {
  import type { Redis } from '@upstash/redis'

  export interface RatelimitConfig {
    redis: Redis
    limiter: ReturnType<typeof Ratelimit.slidingWindow>
    analytics?: boolean
    prefix?: string
  }

  export interface RatelimitResult {
    success: boolean
    remaining: number
    reset: number
    limit: number
  }

  export class Ratelimit {
    constructor(config: RatelimitConfig)
    limit(identifier: string): Promise<RatelimitResult>

    static slidingWindow(
      requests: number,
      window: string
    ): { type: 'slidingWindow'; requests: number; window: string }

    static fixedWindow(
      requests: number,
      window: string
    ): { type: 'fixedWindow'; requests: number; window: string }

    static tokenBucket(
      refillRate: number,
      interval: string,
      maxTokens: number
    ): { type: 'tokenBucket'; refillRate: number; interval: string; maxTokens: number }
  }
}
