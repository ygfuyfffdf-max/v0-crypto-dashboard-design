'use client'

import { AppInitializer } from '@/app/_components/AppInitializer'
import { iOSProvider as IOSProvider } from '@/app/_components/providers/iOSProvider'
import { MotionSettingsProvider } from '@/app/_components/providers/MotionSettingsProvider'
import { ThemeProvider } from '@/app/_components/providers/ThemeProvider'
import { DefensiveErrorBoundary } from '@/app/lib/utils/DefensiveErrorBoundary'
import { LenisProvider } from '@/app/providers/LenisProvider'
import { PostHogProvider } from '@/app/providers/PostHogProvider'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { ShaderProvider } from '@/app/providers/ShaderProvider'
import { VoiceWorkerProvider } from '@/app/providers/VoiceWorkerProvider'
import React from 'react'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <ThemeProvider>
        <MotionSettingsProvider>
          <QueryProvider>
              <ShaderProvider>
                <AppInitializer>
                  <LenisProvider duration={1.2} wheelMultiplier={1} respectReducedMotion>
                    <VoiceWorkerProvider>
                      <IOSProvider toastPosition="top" disable3DEffects={true} disableParallax={true}>
                        <DefensiveErrorBoundary>
                          {children}
                        </DefensiveErrorBoundary>
                      </IOSProvider>
                    </VoiceWorkerProvider>
                  </LenisProvider>
                </AppInitializer>
              </ShaderProvider>
          </QueryProvider>
        </MotionSettingsProvider>
      </ThemeProvider>
    </PostHogProvider>
  )
}
