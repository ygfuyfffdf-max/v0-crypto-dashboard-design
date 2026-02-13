// CHRONOS LOGIN — Liquid Glass Premium Dark Login
// Redesigned: animated mesh gradient, aurora bands, glassmorphism card

"use client"

import { KocmocLogo } from "@/app/_components/chronos-2026/branding/KocmocLogo"
import { SignIn, SignedIn, SignedOut } from "@clerk/nextjs"
import { CheckCircle } from "lucide-react"
import { motion } from "motion/react"
import React, { useCallback, useRef } from "react"

// ─── Animation variants ────────────────────────────────────────────────────────

const fadeSlideUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

// ─── Clerk dark theme appearance ────────────────────────────────────────────────

const clerkAppearance = {
  elements: {
    rootBox: "mx-auto w-full",
    card: "bg-transparent shadow-none border-none p-0 w-full",
    cardBox: "bg-transparent shadow-none border-none w-full",
    header: "hidden",
    headerTitle: "text-white text-lg font-medium tracking-wide",
    headerSubtitle: "text-white/40 text-sm",
    socialButtonsBlockButton:
      "bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-violet-500/30 text-white/80 transition-all duration-300 rounded-xl h-11",
    socialButtonsBlockButtonText: "text-white/80 font-medium text-sm",
    formButtonPrimary:
      "bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold rounded-xl h-11 shadow-lg shadow-violet-500/20 transition-all duration-300",
    formFieldLabel: "text-white/50 text-xs font-medium uppercase tracking-widest",
    formFieldInput:
      "bg-white/[0.05] border border-white/[0.10] text-white placeholder-white/20 rounded-xl h-11 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all duration-300",
    footerActionLink: "text-violet-400 hover:text-violet-300 transition-colors duration-200",
    footerAction: "justify-center",
    dividerLine: "bg-white/[0.06]",
    dividerText: "text-white/30 text-xs uppercase tracking-widest",
    identityPreviewText: "text-white/80",
    identityPreviewEditButton: "text-violet-400 hover:text-violet-300",
    formFieldSuccessText: "text-emerald-400",
    formFieldErrorText: "text-red-400",
    formFieldAction: "text-violet-400 hover:text-violet-300",
    otpCodeFieldInput:
      "bg-white/[0.05] border border-white/[0.10] text-white rounded-lg focus:border-violet-500/40",
    alternativeMethodsBlockButton:
      "bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/70 rounded-xl transition-all duration-300",
    main: "gap-5",
    form: "gap-4",
    footer: "bg-transparent",
    footerPages: "hidden",
  },
  layout: {
    socialButtonsPlacement: "bottom" as const,
    socialButtonsVariant: "blockButton" as const,
  },
}

// ─── Glass Card with mouse-tracking shine ───────────────────────────────────────

function GlassCard({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    card.style.setProperty("--mx", `${x}%`)
    card.style.setProperty("--my", `${y}%`)
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.setProperty("--mx", "50%")
    card.style.setProperty("--my", "50%")
  }, [])

  return (
    <motion.div
      ref={cardRef}
      variants={scaleIn}
      custom={0.5}
      initial="hidden"
      animate="visible"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass-card group relative w-full max-w-[420px] rounded-3xl border border-white/8 bg-white/3 px-8 py-10 backdrop-blur-xl transition-all duration-500 hover:border-violet-500/30"
      style={
        {
          "--mx": "50%",
          "--my": "50%",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.03) inset, 0 -2px 16px rgba(139, 92, 246, 0.04) inset",
        } as React.CSSProperties
      }
    >
      {/* Mouse-tracking inner shine */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(400px circle at var(--mx) var(--my), rgba(139, 92, 246, 0.06), transparent 60%)",
        }}
      />
      {/* Top edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-3xl bg-linear-to-r from-transparent via-white/12 to-transparent" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// ─── Main Login Page ────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <>
      {/* CSS for animated mesh gradient + aurora bands */}
      <style jsx global>{`
        @property --hue-1 {
          syntax: "<number>";
          inherits: false;
          initial-value: 260;
        }
        @property --hue-2 {
          syntax: "<number>";
          inherits: false;
          initial-value: 300;
        }
        @property --hue-3 {
          syntax: "<number>";
          inherits: false;
          initial-value: 220;
        }

        @keyframes meshHueRotate {
          0% {
            --hue-1: 260;
            --hue-2: 300;
            --hue-3: 220;
          }
          33% {
            --hue-1: 280;
            --hue-2: 240;
            --hue-3: 310;
          }
          66% {
            --hue-1: 230;
            --hue-2: 320;
            --hue-3: 270;
          }
          100% {
            --hue-1: 260;
            --hue-2: 300;
            --hue-3: 220;
          }
        }

        .mesh-gradient-bg {
          background-color: #000000;
          background-image:
            radial-gradient(
              ellipse 80% 60% at 20% 80%,
              hsla(var(--hue-1), 70%, 12%, 0.5) 0%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 70% 50% at 80% 20%,
              hsla(var(--hue-2), 60%, 10%, 0.4) 0%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 90% 70% at 50% 50%,
              hsla(var(--hue-3), 50%, 8%, 0.3) 0%,
              transparent 70%
            );
          animation: meshHueRotate 20s ease-in-out infinite;
        }

        /* Aurora borealis flowing bands */
        @keyframes auroraFlow1 {
          0% {
            transform: translateX(-30%) skewX(-5deg) scaleY(1);
            opacity: 0.12;
          }
          25% {
            transform: translateX(-10%) skewX(3deg) scaleY(1.2);
            opacity: 0.18;
          }
          50% {
            transform: translateX(10%) skewX(-2deg) scaleY(0.8);
            opacity: 0.1;
          }
          75% {
            transform: translateX(25%) skewX(4deg) scaleY(1.1);
            opacity: 0.16;
          }
          100% {
            transform: translateX(-30%) skewX(-5deg) scaleY(1);
            opacity: 0.12;
          }
        }

        @keyframes auroraFlow2 {
          0% {
            transform: translateX(20%) skewX(3deg) scaleY(1);
            opacity: 0.08;
          }
          30% {
            transform: translateX(-5%) skewX(-4deg) scaleY(1.3);
            opacity: 0.14;
          }
          60% {
            transform: translateX(-25%) skewX(2deg) scaleY(0.9);
            opacity: 0.1;
          }
          100% {
            transform: translateX(20%) skewX(3deg) scaleY(1);
            opacity: 0.08;
          }
        }

        @keyframes auroraFlow3 {
          0% {
            transform: translateX(10%) skewX(-2deg) scaleY(1.1);
            opacity: 0.06;
          }
          40% {
            transform: translateX(-20%) skewX(5deg) scaleY(0.7);
            opacity: 0.12;
          }
          70% {
            transform: translateX(15%) skewX(-3deg) scaleY(1.4);
            opacity: 0.09;
          }
          100% {
            transform: translateX(10%) skewX(-2deg) scaleY(1.1);
            opacity: 0.06;
          }
        }

        .aurora-band-1 {
          position: absolute;
          top: 8%;
          left: -10%;
          right: -10%;
          height: 180px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(139, 92, 246, 0.15) 20%,
            rgba(109, 40, 217, 0.2) 40%,
            rgba(76, 29, 149, 0.12) 60%,
            rgba(139, 92, 246, 0.1) 80%,
            transparent 100%
          );
          filter: blur(40px);
          animation: auroraFlow1 14s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .aurora-band-2 {
          position: absolute;
          top: 18%;
          left: -10%;
          right: -10%;
          height: 140px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(59, 130, 246, 0.1) 25%,
            rgba(99, 102, 241, 0.18) 50%,
            rgba(139, 92, 246, 0.08) 75%,
            transparent 100%
          );
          filter: blur(50px);
          animation: auroraFlow2 18s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .aurora-band-3 {
          position: absolute;
          top: 4%;
          left: -10%;
          right: -10%;
          height: 120px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(168, 85, 247, 0.08) 30%,
            rgba(192, 132, 252, 0.14) 55%,
            rgba(124, 58, 237, 0.06) 80%,
            transparent 100%
          );
          filter: blur(60px);
          animation: auroraFlow3 22s ease-in-out infinite;
          will-change: transform, opacity;
        }

        /* Pulse animation for redirect bar */
        @keyframes progressPulse {
          0% {
            width: 0%;
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0.8;
          }
        }
        .redirect-bar {
          animation: progressPulse 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>

      <div className="mesh-gradient-bg relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Aurora borealis bands */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="aurora-band-1" />
          <div className="aurora-band-2" />
          <div className="aurora-band-3" />
        </div>

        {/* Subtle radial vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

        {/* Main content — centered single column */}
        <div className="relative z-10 flex w-full flex-col items-center px-6 py-12">
          {/* Logo */}
          <motion.div
            variants={fadeSlideUp}
            custom={0}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <KocmocLogo size={160} showText textVariant="kosmos" animated />
          </motion.div>

          {/* КОСМОС title */}
          <motion.h1
            variants={fadeSlideUp}
            custom={0.15}
            initial="hidden"
            animate="visible"
            className="mb-2 text-center text-5xl font-bold tracking-[0.2em] sm:text-6xl"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(167,139,250,0.9) 50%, rgba(139,92,246,0.8) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            КОСМОС
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeSlideUp}
            custom={0.25}
            initial="hidden"
            animate="visible"
            className="mb-12 text-center text-xs font-medium tracking-[0.35em] text-white/30 uppercase"
          >
            Chronos Infinity
          </motion.p>

          {/* Liquid glass card with SignIn */}
          <GlassCard>
            <SignedOut>
              <SignIn
                routing="hash"
                fallbackRedirectUrl="/dashboard"
                appearance={clerkAppearance}
              />
            </SignedOut>

            <SignedIn>
              <motion.div
                className="flex flex-col items-center py-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <motion.div
                  className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.2,
                  }}
                >
                  <CheckCircle className="h-7 w-7 text-white" />
                </motion.div>
                <h3 className="mb-1 text-lg font-semibold text-white">Authentication Successful</h3>
                <p className="mb-6 text-sm text-white/40">Redirecting to dashboard…</p>
                <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/6">
                  <div className="redirect-bar h-full rounded-full bg-linear-to-r from-violet-500 to-emerald-500" />
                </div>
              </motion.div>
            </SignedIn>
          </GlassCard>

          {/* Footer */}
          <motion.footer
            variants={fadeSlideUp}
            custom={0.7}
            initial="hidden"
            animate="visible"
            className="mt-14 text-center text-[11px] tracking-widest text-white/15"
          >
            &copy; {new Date().getFullYear()} CHRONOS INFINITY &mdash; All rights reserved
          </motion.footer>
        </div>
      </div>
    </>
  )
}
