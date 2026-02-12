'use client'

import React from 'react'
import { AppInitializer } from '@/app/_components/AppInitializer'
import { ThemeProvider } from '@/app/_components/providers/ThemeProvider'
import { iOSProvider } from '@/app/_components/providers/iOSProvider'
import { MotionSettingsProvider } from '@/app/_components/providers/MotionSettingsProvider'
import { DefensiveErrorBoundary } from '@/app/lib/utils/DefensiveErrorBoundary'
import { AuthProvider } from '@/app/providers/AuthProvider'
import { LenisProvider } from '@/app/providers/LenisProvider'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { ShaderProvider } from '@/app/providers/ShaderProvider'
import { VoiceWorkerProvider } from '@/app/providers/VoiceWorkerProvider'
import { PostHogProvider } from '@/app/providers/PostHogProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <ThemeProvider>
        <MotionSettingsProvider>
          <QueryProvider>
            <AuthProvider>
              <ShaderProvider>
                <AppInitializer>
                  <LenisProvider duration={1.2} wheelMultiplier={1} respectReducedMotion>
                    <VoiceWorkerProvider>
                      <iOSProvider toastPosition="top" disable3DEffects={true} disableParallax={true}>
                        <DefensiveErrorBoundary>
                          {children}
                        </DefensiveErrorBoundary>
                      </iOSProvider>
                    </VoiceWorkerProvider>
                  </LenisProvider>
                </AppInitializer>
              </ShaderProvider>
            </AuthProvider>
          </QueryProvider>
        </MotionSettingsProvider>
      </ThemeProvider>
    </PostHogProvider>
  )
}
