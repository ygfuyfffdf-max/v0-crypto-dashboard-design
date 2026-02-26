"use client"

import { cn } from "@/app/_lib/utils"
import { Bot, MessageSquare, Mic, MicOff, Send, Sparkles, X, Zap } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

/* ═══════════════════════════════════════════════════════════════════ */

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const QUICK_ACTIONS: Record<string, string[]> = {
  "/dashboard": ["Resumen del día", "Alertas críticas", "KPIs principales", "Flujo de caja"],
  "/ventas": ["Nueva venta", "Ventas pendientes", "Top clientes", "Ventas del mes"],
  "/bancos": ["Balance total", "Transferir fondos", "Estado de cuentas", "Último corte"],
  "/clientes": ["Buscar cliente", "Clientes con deuda", "Registrar abono", "Nuevo cliente"],
  "/ordenes": ["Nueva OC", "OC pendientes", "Stock bajo", "Margen promedio"],
  "/distribuidores": ["Adeudos pendientes", "Registrar pago", "Top proveedores", "Historial OC"],
  "/almacen": [
    "Stock crítico",
    "Rotación de inventario",
    "Productos más vendidos",
    "Valor del almacén",
  ],
  "/gastos-abonos": [
    "Gastos del mes",
    "Registrar gasto",
    "Abonos pendientes",
    "Categorías principales",
  ],
  "/configuracion": ["Cambiar tema", "Mi perfil", "Exportar datos", "Versión del sistema"],
}

const AI_RESPONSES: Record<string, string> = {
  "Resumen del día":
    "Hoy tienes 12 ventas nuevas, 3 alertas pendientes y un crecimiento del 8.4% respecto a ayer.",
  "Alertas críticas": "Hay 2 alertas: stock bajo en 5 productos y 1 pago vencido de $4,200.",
  "KPIs principales":
    "Capital total: $342,500 | Utilidades: $48,200 | Deuda clientes: $87,200 | Stock: $156,800.",
  "Flujo de caja": "Ingresos del mes: $89,400 vs Egresos: $41,200. Balance positivo de +$48,200.",
  "Nueva venta": "Abriendo formulario de nueva venta. ¿Deseas crear una venta rápida o detallada?",
  "Ventas pendientes":
    "Tienes 7 ventas pendientes por un total de $23,450. La más antigua es de hace 3 días.",
  "Top clientes":
    "Top 3 clientes: Juan Pérez ($12,400), María López ($9,800), Carlos Ruiz ($8,500).",
  "Ventas del mes": "Llevas 45 ventas este mes por $128,350. Meta: $150,000 (85.6% completado).",
  "Balance total": "Balance consolidado: $142,380.50 distribuido en 7 bóvedas/cuentas.",
  "Transferir fondos": "Preparando transferencia. ¿Entre qué cuentas deseas mover fondos?",
  "Estado de cuentas": "Bóveda Monte: $42,300 | USA: $28,400 | Profit: $18,900 | Azteca: $52,780.",
  "Último corte": "Último corte realizado: 12/Feb/2026. Capital registrado: $341,200.",
  "Buscar cliente": "¿Qué cliente deseas buscar? Puedes indicar nombre, RFC o número de cliente.",
  "Clientes con deuda": "Hay 14 clientes con deuda activa por un total de $87,200.",
  "Registrar abono": "¿A qué cliente deseas registrar el abono? Indica nombre y monto.",
  "Nuevo cliente": "Abriendo formulario de nuevo cliente. ¿Deseas dictarlo por voz?",
  "Nueva OC": "Creando nueva orden de compra. ¿A qué proveedor va dirigida?",
  "OC pendientes": "Tienes 5 órdenes de compra pendientes de aprobación.",
  "Stock bajo": "5 productos con stock crítico: Producto A (3 uds), Producto B (5 uds), etc.",
  "Margen promedio": "Margen promedio en las últimas 30 OC: 32.4%. Mejor: 45%, Peor: 18%.",
  "Adeudos pendientes": "Adeudo total a distribuidores: $64,300 entre 4 proveedores.",
  "Registrar pago": "¿A qué distribuidor y monto? Puedo preparar el formulario.",
  "Top proveedores": "Top 3: Dist. Norte ($45,200), Dist. Centro ($32,100), Dist. Sur ($28,900).",
  "Historial OC":
    "Últimas 5 OC: #142 ($8,400), #141 ($12,300), #140 ($5,600), #139 ($9,800), #138 ($7,200).",
  "Stock crítico": "5 productos requieren reabastecimiento urgente. ¿Deseas ver el detalle?",
  "Rotación de inventario": "Rotación promedio: 18 días. Productos lentos: 3 con más de 45 días.",
  "Productos más vendidos":
    "Top 3: Producto X (142 uds), Producto Y (98 uds), Producto Z (76 uds).",
  "Valor del almacén": "Stock total valorizado en $156,800 MXN distribuido en 23 productos.",
  "Gastos del mes": "Gastos de Febrero: $28,400. Principal categoría: Logística ($12,300).",
  "Registrar gasto": "¿Cuál es el concepto y monto del gasto? Puedo dictarlo por voz.",
  "Abonos pendientes": "Hay $87,200 en abonos pendientes de 14 clientes.",
  "Categorías principales": "Logística: 38%, Operativo: 25%, Servicios: 18%, Otros: 19%.",
  "Cambiar tema": "Ve a Configuración > Apariencia para cambiar tema, colores y más.",
  "Mi perfil": "Tu perfil muestra: Admin, última sesión hace 2 horas.",
  "Exportar datos": "Puedo exportar datos en CSV o PDF. ¿Qué módulo necesitas?",
  "Versión del sistema": "CHRONOS INFINITY v2.0.2026 — Última actualización: Febrero 2026.",
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

/* ═══════════════════════════════════════════════════════════════════ */

export function GlobalAIOrb({ className }: { className?: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [listening, setListening] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const matchedPath = Object.keys(QUICK_ACTIONS).find((k) => pathname.startsWith(k))
  const chips = (matchedPath ? QUICK_ACTIONS[matchedPath] : undefined) ?? ["¿Cómo puedo ayudarte?"]

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const respond = useCallback((text: string) => {
    const reply =
      AI_RESPONSES[text] ??
      `Entendido. Estoy procesando tu solicitud: "${text}". Un momento por favor.`
    setTimeout(() => {
      setMessages((p) => [...p, { role: "assistant", content: reply, timestamp: new Date() }])
    }, 800)
  }, [])

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return
      setMessages((p) => [...p, { role: "user", content: text.trim(), timestamp: new Date() }])
      setInput("")
      respond(text.trim())
    },
    [respond]
  )

  const toggleMic = useCallback(() => {
    if (listening) {
      setListening(false)
      sendMessage("Comando de voz recibido")
    } else {
      setListening(true)
      setTimeout(() => {
        setListening(false)
        sendMessage("Muestra el resumen general")
      }, 3000)
    }
  }, [listening, sendMessage])

  const ts = (d: Date) => d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })

  /* ─── Particle dots for hover ─── */
  const particles = [0, 1, 2, 3]

  return (
    <div className={cn("fixed bottom-6 left-6 z-40", className)}>
      {/* ── Orb ── */}
      <motion.button
        aria-label="Asistente IA"
        onClick={() => {
          setOpen((o) => !o)
          setTimeout(() => inputRef.current?.focus(), 300)
        }}
        animate={{ scale: open ? 1.15 : [1, 1.05, 1] }}
        transition={
          open
            ? { type: "spring", stiffness: 300 }
            : { repeat: Infinity, duration: 3, ease: "easeInOut" }
        }
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full outline-none"
        style={{
          background: "radial-gradient(circle, #A78BFA 0%, #7C3AED 40%, #4C1D95 100%)",
          boxShadow: open
            ? "0 0 40px rgba(139,92,246,0.7), 0 0 80px rgba(139,92,246,0.3)"
            : "0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(139,92,246,0.2)",
        }}
      >
        <Sparkles className="h-5 w-5 text-white drop-shadow-lg" />

        {/* orbiting particles on hover */}
        {particles.map((i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-violet-300 opacity-0 group-hover:opacity-100"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear", delay: i * 0.625 }}
            style={{ transformOrigin: "24px 24px", left: -2, top: -2 }}
          />
        ))}

        {/* listening ripple */}
        {listening && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={`r${i}`}
                className="pointer-events-none absolute inset-0 rounded-full border border-violet-400/40"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.5 }}
              />
            ))}
          </>
        )}
      </motion.button>

      {/* ── Drawer ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="absolute bottom-16 left-0 flex w-96 flex-col overflow-hidden rounded-2xl border border-white/8 bg-black/80 shadow-2xl shadow-violet-500/10 backdrop-blur-2xl"
            style={{ maxHeight: "60vh" }}
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-semibold text-white/90">Asistente IA</span>
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                  {getContextLabel(pathname)}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-white/40 transition hover:bg-white/6 hover:text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
              style={{ minHeight: 120 }}
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <Zap className="h-6 w-6 text-violet-400/60" />
                  <p className="text-xs text-white/30">Escribe o usa las acciones rápidas</p>
                </div>
              )}

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.05 }}
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

            {/* quick actions */}
            <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-2">
              {chips.map((c, i) => (
                <motion.button
                  key={c}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i }}
                  onClick={() => sendMessage(c)}
                  className="flex shrink-0 items-center gap-1 rounded-full border border-white/6 bg-white/4 px-3 py-1 text-[11px] text-white/50 transition hover:bg-violet-500/20 hover:text-violet-200"
                >
                  <MessageSquare className="h-3 w-3" />
                  {c}
                </motion.button>
              ))}
            </div>

            {/* input bar */}
            <div className="flex items-center gap-2 border-t border-white/6 px-3 py-2.5">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Escribe un mensaje..."
                className="flex-1 rounded-lg bg-white/4 px-3 py-1.5 text-[13px] text-white/80 placeholder-white/20 ring-violet-500/40 outline-none focus:ring-1"
              />

              <button
                onClick={toggleMic}
                className={cn(
                  "rounded-lg p-1.5 transition",
                  listening
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "text-white/30 hover:bg-white/6 hover:text-white/60"
                )}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
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
