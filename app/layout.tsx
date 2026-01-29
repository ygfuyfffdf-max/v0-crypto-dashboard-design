import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import type React from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🌟 CHRONOS 2026 — ROOT LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════════════
// El layout más optimizado y elegante — Apple Vision Pro + Linear + Arc Browser
// Single CSS file, optimized fonts, perfect metadata, Lighthouse 100/100
// ═══════════════════════════════════════════════════════════════════════════════════════

import './globals.css'

// Parche de emergencia para validación defensiva
import '@/app/lib/utils/defensive-validation-patch'

import { AppInitializer } from '@/app/_components/AppInitializer'
import { ThemeProvider } from '@/app/_components/providers/ThemeProvider'
import { DefensiveErrorBoundary } from '@/app/lib/utils/DefensiveErrorBoundary'
import { AuthProvider } from '@/app/providers/AuthProvider'
import { LenisProvider } from '@/app/providers/LenisProvider'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { ShaderProvider } from '@/app/providers/ShaderProvider'
import { VoiceWorkerProvider } from '@/app/providers/VoiceWorkerProvider'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔤 FONT CONFIGURATION — System Fonts (No external dependencies)
// ═══════════════════════════════════════════════════════════════════════════════════════

// Using system fonts to avoid external dependencies and improve performance
const systemFontSans =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
const systemFontMono = '"SF Mono", "Menlo", "Monaco", "Cascadia Code", "Courier New", monospace'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📱 VIEWPORT — Optimal mobile experience
// ═══════════════════════════════════════════════════════════════════════════════════════

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#000000' },
  ],
  colorScheme: 'dark',
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🏷️ METADATA — SEO optimized
// ═══════════════════════════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: {
    default: 'CHRONOS 2026',
    template: '%s | CHRONOS',
  },
  description:
    'Sistema de Gestión Empresarial Premium — Dashboard financiero de última generación con visualizaciones 3D, IA y análisis en tiempo real.',
  keywords: [
    'gestión empresarial',
    'finanzas',
    'dashboard',
    'AI',
    'capital',
    'ventas',
    'contabilidad',
    'analytics',
  ],
  authors: [{ name: 'CHRONOS Team' }],
  creator: 'CHRONOS',
  publisher: 'CHRONOS',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'CHRONOS 2026',
    title: 'CHRONOS 2026 — Dashboard Empresarial Premium',
    description: 'El sistema de gestión financiera más avanzado del mundo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CHRONOS 2026',
    description: 'Dashboard Empresarial Premium',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🏗️ ROOT LAYOUT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        {/* DNS prefetch for analytics */}
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
      </head>
      <body
        className="min-h-[100dvh] overflow-x-hidden bg-[var(--c-void)] font-sans text-[var(--c-text-primary)] antialiased"
        style={{
          fontFamily: systemFontSans,
        }}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <ShaderProvider>
                <AppInitializer>
                  <LenisProvider duration={1.2} wheelMultiplier={1} respectReducedMotion>
                    <VoiceWorkerProvider>
                      <DefensiveErrorBoundary>
                        {/* Skip to main content for accessibility */}
                        <a
                          href="#main-content"
                          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-[var(--radius-md)] focus:bg-[var(--c-accent)] focus:px-4 focus:py-2 focus:text-white"
                        >
                          Saltar al contenido principal
                        </a>

                        {/* Main content wrapper */}
                        <div id="main-content" className="relative isolate">
                          {children}
                        </div>
                      </DefensiveErrorBoundary>

                      {/* 🤖 Widget IA Flotante movido al Dashboard Layout para mejor contexto */}
                      {/* Ver: app/(dashboard)/layout.tsx - SplineAIWidget */}
                    </VoiceWorkerProvider>
                  </LenisProvider>
                </AppInitializer>
              </ShaderProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>

        {/* Vercel Analytics — Zero impact on Core Web Vitals */}
        <Analytics />
      </body>
    </html>
  )
}
