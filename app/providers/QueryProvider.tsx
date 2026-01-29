'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import * as React from 'react'

const isProd = process.env.NODE_ENV === 'production'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Producción: cache más agresivo
        staleTime: isProd ? 5 * 60 * 1000 : 60 * 1000, // 5 min prod, 1 min dev
        gcTime: isProd ? 30 * 60 * 1000 : 5 * 60 * 1000, // 30 min prod, 5 min dev
        refetchOnWindowFocus: !isProd, // Solo en dev
        refetchOnMount: !isProd, // Solo en dev
        refetchOnReconnect: true,
        retry: isProd ? 3 : 1, // Más reintentos en prod
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        networkMode: 'offlineFirst',
      },
      mutations: {
        retry: isProd ? 2 : 0,
        networkMode: 'offlineFirst',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: siempre crear nuevo cliente
    return makeQueryClient()
  }
  // Browser: reutilizar cliente singleton
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools solo en desarrollo */}
      {!isProd && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />}
    </QueryClientProvider>
  )
}
