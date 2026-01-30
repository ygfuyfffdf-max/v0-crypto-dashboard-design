/**
 * 🔐 CHRONOS INFINITY 2026 — Conditional Clerk Provider
 *
 * Wrapper que maneja gracefully la ausencia de Clerk key
 * para permitir builds sin configuración de auth
 */
'use client'

import { ClerkProvider } from '@clerk/nextjs'
import type { ReactNode } from 'react'

interface ConditionalClerkProviderProps {
  children: ReactNode
}

// Check if Clerk is properly configured
const isClerkConfigured = (): boolean => {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return !!(key &&
           key !== 'YOUR_CLERK_PUBLISHABLE_KEY' &&
           key.startsWith('pk_'))
}

export function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  // If Clerk is not configured, render children without auth wrapper
  if (!isClerkConfigured()) {
    return <>{children}</>
  }

  return <ClerkProvider>{children}</ClerkProvider>
}
