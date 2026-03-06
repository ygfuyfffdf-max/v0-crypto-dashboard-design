"use client"

import { useAppStore } from "@/lib/store/useAppStore"
import BentoNav from "@/components/layout/BentoNav"
import { FloatingAIWidget } from "@/components/FloatingAIWidget"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState, lazy, Suspense } from "react"
import { useOptimizedPerformance } from "@/lib/hooks/useOptimizedPerformance"
import { ScrollProgress, ScrollReveal } from "@/components/ui/ScrollReveal"

const lazyPanel = (loader: () => Promise<{ default: React.ComponentType }>) =>
  lazy(() => loader().catch(() => ({ default: () => <div className="text-center text-white/50 py-20">Error al cargar el panel</div> })))

const BentoDashboard = lazyPanel(() => import("@/components/panels/BentoDashboard"))
const BentoOrdenesCompra = lazyPanel(() => import("@/components/panels/BentoOrdenesCompra"))
const BentoVentas = lazyPanel(() => import("@/components/panels/BentoVentas"))
const BentoBanco = lazyPanel(() => import("@/components/panels/BentoBanco"))
const BentoAlmacen = lazyPanel(() => import("@/components/panels/BentoAlmacen"))
const BentoReportes = lazyPanel(() => import("@/components/panels/BentoReportes"))
const BentoIA = lazyPanel(() => import("@/components/panels/BentoIA"))
const BentoDistribuidores = lazyPanel(() => import("@/components/panels/BentoDistribuidores"))
const BentoClientes = lazyPanel(() => import("@/components/panels/BentoClientes"))
const BentoProfit = lazyPanel(() => import("@/components/panels/BentoProfit"))

const PanelLoader = () => {
  const [showRetry, setShowRetry] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setShowRetry(true), 10000)
    return () => clearTimeout(timer)
  }, [])
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
        className="relative"
      >
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-blue-500 animate-spin" />
        <div className="absolute inset-0 w-16 h-16 rounded-full bg-blue-500/20 blur-xl" />
      </motion.div>
      {showRetry && (
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Tarda demasiado — Recargar
        </button>
      )}
    </div>
  )
}

export default function Chronos() {
  const { currentPanel } = useAppStore()

  useOptimizedPerformance()

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth"
    document.body.classList.add("gpu-accelerated")

    if (document.fonts) {
      document.fonts.load('600 1em "Inter"')
    }

    return () => {
      document.documentElement.style.scrollBehavior = "auto"
    }
  }, [currentPanel])

  const renderPanel = () => {
    switch (currentPanel) {
      case "dashboard":
        return <BentoDashboard />
      case "ordenes":
        return <BentoOrdenesCompra />
      case "ventas":
        return <BentoVentas />
      case "distribuidores":
        return <BentoDistribuidores />
      case "clientes":
        return <BentoClientes />
      case "banco":
        return <BentoBanco />
      case "almacen":
        return <BentoAlmacen />
      case "reportes":
        return <BentoReportes />
      case "ia":
        return <BentoIA />
      case "profit":
        return <BentoProfit />
      default:
        return <BentoDashboard />
    }
  }

  return (
    <div id="root" className="min-h-screen bg-black relative">
      <ScrollProgress />

      <div className="fixed inset-0 pointer-events-none z-[1] opacity-40">
        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-blue-500/8 rounded-full blur-[120px] will-change-transform animate-pulse" />
        <div
          className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-[120px] will-change-transform animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-[50%] left-[50%] w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[100px] will-change-transform animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10">
        <BentoNav />

        <main className="pt-24 px-4 md:px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPanel}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="will-change-transform"
            >
              <ScrollReveal>
                <ErrorBoundary panelName={currentPanel}>
                  <Suspense fallback={<PanelLoader />}>{renderPanel()}</Suspense>
                </ErrorBoundary>
              </ScrollReveal>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <FloatingAIWidget />
    </div>
  )
}
