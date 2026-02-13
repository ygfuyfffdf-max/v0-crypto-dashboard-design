"use client"

/**
 * 🌌 LANDING — Cinematográfica KOCMOC КОСМОС
 * Opening premium estilo marcas top → transición a login
 */

import { SignedOut, useAuth } from "@clerk/nextjs"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const KocmocLogoOpening = dynamic(
  () =>
    import("@/app/_components/chronos-2026/animations/KocmocLogoOpeningEnhanced").then(
      (m) => m.KocmocLogoOpeningEnhanced
    ),
  { ssr: false }
)

export function LandingPageClient() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()

  const handleComplete = () => {
    router.push("/login")
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard")
    }
  }, [isLoaded, isSignedIn, router])

  if (isLoaded && isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <SignedOut>
      <KocmocLogoOpening
        onComplete={handleComplete}
        duration={6500}
        skipEnabled
        showText
        textContent="КОСМОС"
      />
    </SignedOut>
  )
}
