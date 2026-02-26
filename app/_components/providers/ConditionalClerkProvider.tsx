/**
 * 🔐 CHRONOS INFINITY 2026 — Conditional Clerk Provider
 *
 * Wrapper que maneja gracefully la ausencia de Clerk key
 * para permitir builds sin configuración de auth.
 * Cuando las keys están configuradas, activa ClerkProvider completo.
 */
'use client'

import { esES } from '@clerk/localizations'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
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
  if (!isClerkConfigured()) {
    // Fallback: sin Clerk configurado, renderizar children directamente
    // Útil para desarrollo local sin keys de auth
    console.warn(
      '[CHRONOS] Clerk no configurado. Establece NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY para activar auth.'
    )
    return <>{children}</>
  }

  return (
    <ClerkProvider
      localization={esES}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#00d4ff',
          colorBackground: '#0a0a1a',
          colorText: '#ffffff',
          colorInputBackground: '#1a1a2e',
          colorInputText: '#ffffff',
          borderRadius: '0.75rem',
        },
        elements: {
          card: 'bg-[#0a0a1a]/90 backdrop-blur-xl border border-cyan-500/20',
          headerTitle: 'text-cyan-400',
          headerSubtitle: 'text-gray-400',
          socialButtonsBlockButton: 'bg-[#1a1a2e] border-cyan-500/20 hover:bg-cyan-500/10',
          formButtonPrimary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500',
          footerActionLink: 'text-cyan-400 hover:text-cyan-300',
        },
      }}
      afterSignOutUrl="/login"
      signInUrl="/login"
      signUpUrl="/register"
    >
      {children}
    </ClerkProvider>
  )
}
