"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎙️ GLOBAL AI ORB — ZERO FORCE AGENT v2.0
 * ═══════════════════════════════════════════════════════════════════════════
 * Asistente IA permanente con:
 * ✅ Wake word "zero" — siempre escuchando (Web Speech API)
 * ✅ ElevenLabs Turbo v2.5 TTS — voz robotizada española
 * ✅ /api/ai/chat — respuestas reales + fallback mock
 * ✅ Orb animado — idle / listening / thinking / speaking
 * ✅ Typing indicator + particles al hablar
 * ✅ Acciones rápidas por contexto de ruta
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { Bot, MessageSquare, Mic, MicOff, Send, Sparkles, X, Zap } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

/* ─── Types ──────────────────────────────────────────────── */
interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type OrbState = "idle" | "wake" | "listening" | "thinking" | "speaking"

/* ─── Wake word config ───────────────────────────────────── */
const WAKE_WORD = "zero"

/* ─── Context-aware quick actions ───────────────────────── */
const QUICK_ACTIONS: Record<string, string[]> = {
  "/dashboard": ["Resumen del día", "Alertas críticas", "KPIs principales", "Flujo de caja"],
  "/ventas": ["Nueva venta", "Ventas pendientes", "Top clientes", "Ventas del mes"],
  "/bancos": ["Balance total", "Transferir fondos", "Estado de cuentas", "Último corte"],
  "/clientes": ["Buscar cliente", "Clientes con deuda", "Registrar abono", "Nuevo cliente"],
  "/ordenes": ["Nueva OC", "OC pendientes", "Stock bajo", "Margen promedio"],
  "/distribuidores": ["Adeudos pendientes", "Registrar pago", "Top proveedores", "Historial OC"],
  "/almacen": ["Stock crítico", "Rotación de inventario", "Productos más vendidos", "Valor del almacén"],
  "/gastos-abonos": ["Gastos del mes", "Registrar gasto", "Abonos pendientes", "Categorías principales"],
  "/configuracion": ["Cambiar tema", "Mi perfil", "Exportar datos", "Versión del sistema"],
}

/* ─── Mock responses (fallback) ─────────────────────────── */
const AI_RESPONSES: Record<string, string> = {
  "Resumen del día": "Hoy llevas 12 ventas por $34,200. Capital consolidado: $142,380. 3 alertas activas.",
  "Alertas críticas": "⚠️ 5 productos con stock crítico. 14 clientes con deuda. 2 OC vencidas.",
  "KPIs principales": "Utilidades: $18,400 | Margen: 32.4% | Rotación: 18 días | Cobranza pendiente: $87,200.",
  "Flujo de caja": "Ingresos mes: $128,350. Gastos: $28,400. Flujo neto: +$99,950.",
  "Balance total": "Bóveda Monte: $42,300 | USA: $28,400 | Profit: $18,900 | Azteca: $52,780.",
  "Transferir fondos": "Preparando transferencia. ¿Entre qué cuentas?",
  "Estado de cuentas": "7 bóvedas activas. Capital total: $142,380.",
  "Último corte": "Último corte: 12/Feb/2026. Capital: $341,200.",
  "Buscar cliente": "¿Qué cliente deseas buscar?",
  "Clientes con deuda": "14 clientes con deuda total $87,200.",
  "Registrar abono": "¿Cliente y monto del abono?",
  "Nuevo cliente": "Abriendo formulario nuevo cliente…",
  "Nueva OC": "Creando nueva orden de compra. ¿Proveedor?",
  "OC pendientes": "5 órdenes de compra pendientes.",
  "Stock bajo": "5 productos bajo mínimo: Producto A (3), B (5), C (2), D (8), E (1).",
  "Margen promedio": "Margen promedio últimas 30 OC: 32.4%.",
  "Adeudos pendientes": "Adeudo total distribuidores: $64,300.",
  "Registrar pago": "¿Distribuidor y monto del pago?",
  "Top proveedores": "Top 3: Norte $45,200 | Centro $32,100 | Sur $28,900.",
  "Historial OC": "Últimas 5 OC: #142 $8,400 | #141 $12,300 | #140 $5,600.",
  "Stock crítico": "5 productos requieren reabastecimiento urgente.",
  "Rotación de inventario": "Rotación: 18 días. Lentos: 3 con +45 días.",
  "Productos más vendidos": "Top 3: X (142 uds) | Y (98 uds) | Z (76 uds).",
  "Valor del almacén": "Stock valorizado: $156,800 en 23 productos.",
  "Gastos del mes": "Gastos feb: $28,400. Principal: Logística $12,300.",
  "Registrar gasto": "¿Concepto y monto del gasto?",
  "Abonos pendientes": "$87,200 en abonos pendientes de 14 clientes.",
  "Categorías principales": "Logística 38% | Operativo 25% | Servicios 18% | Otros 19%.",
}

function getContextLabel(path: string) {
  if (path.includes("/ventas")) return "Ventas"
  if (path.includes("/bancos")) return "Bancos"
  if (path.includes("/clientes")) return "Clientes"
  if (path.includes("/ordenes")) return "Órdenes"
  if (path.includes("/distribuidores")) return "Distribuidores"
  if (path.includes("/almacen")) return "Almacén"
  if (path.includes("/gastos")) return "Gastos y Abonos"
  if (path.includes("/configuracion")) return "Configuración"
  if (path.includes("/dashboard")) return "Dashboard"
  return "General"
}

/* ─── Orb gradient by state ─────────────────────────────── */
const ORB_GRADIENT: Record<OrbState, string> = {
  idle: "radial-gradient(circle, #A78BFA 0%, #7C3AED 40%, #4C1D95 100%)",
  wake: "radial-gradient(circle, #FCD34D 0%, #D97706 40%, #92400E 100%)",
  listening: "radial-gradient(circle, #34D399 0%, #059669 40%, #064E3B 100%)",
  thinking: "radial-gradient(circle, #60A5FA 0%, #2563EB 40%, #1E3A8A 100%)",
  speaking: "radial-gradient(circle, #F472B6 0%, #DB2777 40%, #831843 100%)",
}

const ORB_SHADOW: Record<OrbState, string> = {
  idle: "0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(139,92,246,0.2)",
  wake: "0 0 40px rgba(251,191,36,0.7), 0 0 80px rgba(251,191,36,0.3)",
  listening: "0 0 40px rgba(52,211,153,0.7), 0 0 80px rgba(52,211,153,0.3)",
  thinking: "0 0 40px rgba(96,165,250,0.7), 0 0 80px rgba(96,165,250,0.3)",
  speaking: "0 0 40px rgba(244,114,182,0.7), 0 0 80px rgba(244,114,182,0.3)",
}

/* ─── Main Component ─────────────────────────────────────── */
export function GlobalAIOrb({ className }: { className?: string }) {
  const pathname = usePathname()

  const [open, setOpen] = useState(false)
  const [orbState, setOrbState] = useState<OrbState>("idle")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const matchedPath = Object.keys(QUICK_ACTIONS).find((k) => pathname.startsWith(k))
  const chips = (matchedPath ? QUICK_ACTIONS[matchedPath] : undefined) ?? ["¿Cómo puedo ayudarte?"]

  /* ─── Auto-scroll messages ─────────────────────────────── */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  /* ─── ElevenLabs TTS ───────────────────────────────────── */
  const speakWithElevenLabs = useCallback(async (text: string) => {
    try {
      setOrbState("speaking")
      const res = await fetch("/api/voice/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice: "chronos",
          emotion: "professional",
          provider: "elevenlabs",
        }),
      })
      if (res.ok) {
        const { audio, format } = await res.json()
        if (audio) {
          const audioSrc = `data:audio/${format || "mp3"};base64,${audio}`
          if (!audioRef.current) audioRef.current = new Audio()
          audioRef.current.src = audioSrc
          audioRef.current.onended = () => setOrbState("idle")
          await audioRef.current.play()
          return
        }
      }
    } catch {
      // TTS failed — visual only
    }
    // Fallback: just update state after estimated duration
    const dur = Math.min(text.length * 60, 5000)
    setTimeout(() => setOrbState("idle"), dur)
  }, [])

  /* ─── AI response ──────────────────────────────────────── */
  const respond = useCallback(async (text: string) => {
    setAiLoading(true)
    setOrbState("thinking")
    let reply = AI_RESPONSES[text] ?? `Entendido: "${text}". Procesando…`
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, context: getContextLabel(pathname) }),
      })
      if (res.ok) {
        const data = await res.json()
        reply = data.message || data.response || data.text || data.content || reply
      }
    } catch { /* fallback */ } finally {
      setAiLoading(false)
    }
    setMessages((p) => [...p, { role: "assistant", content: reply, timestamp: new Date() }])
    speakWithElevenLabs(reply)
  }, [pathname, speakWithElevenLabs])

  /* ─── Send message ─────────────────────────────────────── */
  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return
    setMessages((p) => [...p, { role: "user", content: text.trim(), timestamp: new Date() }])
    setInput("")
    respond(text.trim())
  }, [respond])

  /* ─── Wake word detection (always on) ─────────────────── */
  const startWakeWord = useCallback(() => {
    if (typeof window === "undefined") return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = "es-MX"
    r.continuous = true
    r.interimResults = false
    r.onresult = (e) => {
      const t = Array.from(e.results)
        .map((res) => res[0]?.transcript?.toLowerCase() || "")
        .join(" ")
      if (t.includes(WAKE_WORD)) {
        setOrbState("wake")
        setOpen(true)
        setTimeout(() => {
          setOrbState("listening")
          inputRef.current?.focus()
        }, 600)
      }
    }
    r.onerror = () => {
      // Reintentar silenciosamente
      setTimeout(() => { try { r.start() } catch { /**/ } }, 3000)
    }
    r.onend = () => {
      // Reiniciar continuamente si wake word está activo
      if (wakeWordEnabled) {
        setTimeout(() => { try { r.start() } catch { /**/ } }, 500)
      }
    }
    try { r.start() } catch { /**/ }
    recognitionRef.current = r
  }, [wakeWordEnabled])

  useEffect(() => {
    if (wakeWordEnabled) {
      startWakeWord()
    } else {
      try { recognitionRef.current?.stop() } catch { /**/ }
    }
    return () => {
      try { recognitionRef.current?.stop() } catch { /**/ }
    }
  }, [wakeWordEnabled, startWakeWord])

  /* ─── Mic toggle ───────────────────────────────────────── */
  const toggleMic = useCallback(() => {
    setWakeWordEnabled((v) => !v)
    if (!open) setOpen(true)
    setOrbState("listening")
  }, [open])

  const ts = (d: Date) => d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })

  /* ─── Particles ────────────────────────────────────────── */
  const particles = [0, 1, 2, 3]

  return (
    <div className={cn("fixed bottom-6 left-6 z-40", className)}>
      {/* Wake word badge */}
      {wakeWordEnabled && !open && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-violet-500/20 px-2 py-0.5 text-[9px] font-semibold text-violet-300 border border-violet-500/20"
        >
          di &quot;zero&quot;
        </motion.div>
      )}

      {/* ── Orb button ────────────────────────────────────── */}
      <motion.button
        aria-label="Zero Force IA"
        onClick={() => {
          setOpen((o) => !o)
          setTimeout(() => inputRef.current?.focus(), 300)
        }}
        animate={{
          scale: open ? 1.15 : orbState === "wake" ? 1.3 : [1, 1.05, 1],
          filter: orbState === "speaking" ? "brightness(1.3)" : "brightness(1)",
        }}
        transition={
          open || orbState !== "idle"
            ? { type: "spring", stiffness: 300 }
            : { repeat: Infinity, duration: 3, ease: "easeInOut" }
        }
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full outline-none"
        style={{
          background: ORB_GRADIENT[orbState],
          boxShadow: ORB_SHADOW[orbState],
          transition: "background 0.5s, box-shadow 0.5s",
        }}
      >
        {/* Orb icon */}
        {orbState === "listening" ? (
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
            <Mic className="h-5 w-5 text-white" />
          </motion.div>
        ) : orbState === "thinking" || orbState === "wake" ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
            <Zap className="h-5 w-5 text-white" />
          </motion.div>
        ) : orbState === "speaking" ? (
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>
            <Bot className="h-5 w-5 text-white" />
          </motion.div>
        ) : (
          <Sparkles className="h-5 w-5 text-white drop-shadow-lg" />
        )}

        {/* Hover particles */}
        {particles.map((i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-white/60 opacity-0 group-hover:opacity-100"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear", delay: i * 0.625 }}
            style={{ transformOrigin: "24px 24px", left: -2, top: -2 }}
          />
        ))}

        {/* Listening ripples */}
        {(orbState === "listening" || wakeWordEnabled) && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={`r${i}`}
                className="pointer-events-none absolute inset-0 rounded-full border border-violet-400/30"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.6 }}
              />
            ))}
          </>
        )}

        {/* Speaking pulse ring */}
        {orbState === "speaking" && (
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-pink-400/50"
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ repeat: Infinity, duration: 0.7 }}
          />
        )}
      </motion.button>

      {/* ── Chat Drawer ───────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="absolute bottom-16 left-0 flex w-96 flex-col overflow-hidden rounded-2xl border border-white/8 bg-black/85 shadow-2xl shadow-violet-500/10 backdrop-blur-2xl"
            style={{ maxHeight: "60vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
              <div className="flex items-center gap-2">
                {/* Animated orb dot */}
                <motion.div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: ORB_GRADIENT[orbState] }}
                  animate={orbState === "speaking" ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                />
                <span className="text-sm font-semibold text-white/90">Zero Force</span>
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                  {getContextLabel(pathname)}
                </span>
                {orbState !== "idle" && (
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] text-white/40 capitalize">
                    {orbState === "thinking" ? "pensando…" : orbState === "speaking" ? "hablando…" : orbState === "listening" ? "escuchando…" : orbState}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleMic}
                  title={wakeWordEnabled ? 'Desactivar wake word "zero"' : 'Activar wake word "zero"'}
                  className={cn(
                    "rounded-lg p-1.5 text-xs transition",
                    wakeWordEnabled ? "bg-violet-500/30 text-violet-300" : "text-white/30 hover:bg-white/6"
                  )}
                >
                  {wakeWordEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-white/40 transition hover:bg-white/6 hover:text-white/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
              style={{ minHeight: 120 }}
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    className="h-10 w-10 rounded-full"
                    style={{ background: ORB_GRADIENT.idle, boxShadow: ORB_SHADOW.idle }}
                  />
                  <div>
                    <p className="text-xs font-semibold text-white/50">Zero Force listo</p>
                    <p className="mt-0.5 text-[10px] text-white/20">di &quot;zero&quot; o escribe tu consulta</p>
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {aiLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mr-8 flex items-center gap-1.5 rounded-xl bg-white/4 px-3 py-2"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-violet-400/70"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    />
                  ))}
                </motion.div>
              )}

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "rounded-xl px-3 py-2 text-[13px] leading-relaxed",
                    m.role === "user"
                      ? "ml-8 bg-violet-500/20 text-violet-100"
                      : "mr-8 bg-white/4 text-white/80"
                  )}
                >
                  {m.content}
                  <span className="mt-1 block text-[10px] text-white/20">{ts(m.timestamp)}</span>
                </motion.div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-2">
              {chips.map((c, i) => (
                <motion.button
                  key={c}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i }}
                  onClick={() => sendMessage(c)}
                  className="flex shrink-0 items-center gap-1 rounded-full border border-white/6 bg-white/4 px-3 py-1 text-[11px] text-white/50 transition hover:bg-violet-500/20 hover:text-violet-200"
                >
                  <MessageSquare className="h-3 w-3" />
                  {c}
                </motion.button>
              ))}
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-2 border-t border-white/6 px-3 py-2.5">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder={wakeWordEnabled ? 'Escucha activa — di "zero"…' : "Escribe un mensaje…"}
                className="flex-1 rounded-lg bg-white/4 px-3 py-1.5 text-[13px] text-white/80 placeholder-white/20 ring-violet-500/40 outline-none focus:ring-1"
              />
              <button
                onClick={toggleMic}
                className={cn(
                  "rounded-lg p-1.5 transition",
                  wakeWordEnabled ? "bg-violet-500/30 text-violet-300" : "text-white/30 hover:bg-white/6"
                )}
                title={wakeWordEnabled ? "Desactivar escucha" : "Activar escucha wake word"}
              >
                {wakeWordEnabled ? (
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Mic className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <MicOff className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || aiLoading}
                className="rounded-lg bg-violet-600/80 p-1.5 text-white transition hover:bg-violet-500 disabled:opacity-30"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
