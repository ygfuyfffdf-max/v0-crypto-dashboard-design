/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS SYSTEM - Theme Provider                         ║
 * ║                    Sistema de Temas Dark/Light/Auto                        ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'
import type { ThemeProviderProps as NextThemesProviderProps } from 'next-themes'
import { logger } from '@/app/lib/utils/logger'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeProviderProps extends NextThemesProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    logger.info('Theme Provider inicializado', {
      context: 'ThemeProvider',
      data: { theme: props.defaultTheme || 'system' },
    })
  }, [props.defaultTheme])

  // Prevenir flash de contenido sin estilo en hidratación
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

/**
 * Hook personalizado para acceder al tema con tipos seguros
 */
export function useTheme() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme()

  const changeTheme = React.useCallback(
    (newTheme: Theme) => {
      logger.info('Cambiando tema', {
        context: 'useTheme',
        data: { from: theme, to: newTheme },
      })
      setTheme(newTheme)
    },
    [theme, setTheme],
  )

  return {
    theme: theme as Theme,
    setTheme: changeTheme,
    systemTheme: systemTheme as Theme,
    resolvedTheme: resolvedTheme as 'light' | 'dark',
  }
}
