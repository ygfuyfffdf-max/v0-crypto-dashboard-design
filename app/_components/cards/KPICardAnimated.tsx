/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💫 CHRONOS INFINITY 2026 — CARDS DE KPIs ANIMADAS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Cards premium para métricas con:
 * - Contadores animados
 * - Indicadores de tendencia
 * - Mini gráficos spark
 * - Efectos de hover premium
 * - Múltiples variantes visuales
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  Wallet,
  PiggyBank,
  Target,
  Zap
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type FormatoKPI = 'numero' | 'moneda' | 'porcentaje' | 'cantidad' | 'tiempo'
export type VarianteKPI = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'premium'
export type TamanoKPI = 'sm' | 'md' | 'lg' | 'xl'
export type TendenciaKPI = 'up' | 'down' | 'neutral'

export interface DatoSparkline {
  valor: number
  timestamp?: number
}

export interface KPICardProps {
  titulo: string
  valor: number
  valorAnterior?: number
  formato?: FormatoKPI
  variante?: VarianteKPI
  tamano?: TamanoKPI
  icono?: React.ElementType
  descripcion?: string
  periodo?: string
  tendencia?: TendenciaKPI
  sparklineData?: DatoSparkline[]
  objetivo?: number
  sufijo?: string
  prefijo?: string
  decimales?: number
  animado?: boolean
  duracionAnimacion?: number
  onClick?: () => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const iconosDefault: Record<string, React.ElementType> = {
  moneda: DollarSign,
  usuarios: Users,
  ventas: ShoppingCart,
  productos: Package,
  pagos: CreditCard,
  balance: Wallet,
  ahorro: PiggyBank,
  meta: Target,
  rendimiento: Zap,
  default: Activity
}

const coloresVariante: Record<VarianteKPI, {
  bg: string
  border: string
  text: string
  iconBg: string
  iconText: string
  badgeBg: string
  badgeText: string
}> = {
  default: {
    bg: 'from-slate-900/90 to-slate-800/90',
    border: 'border-slate-700/50',
    text: 'text-white',
    iconBg: 'from-slate-600 to-slate-700',
    iconText: 'text-slate-200',
    badgeBg: 'bg-slate-500/20',
    badgeText: 'text-slate-300'
  },
  success: {
    bg: 'from-emerald-950/90 to-slate-900/90',
    border: 'border-emerald-500/30',
    text: 'text-emerald-50',
    iconBg: 'from-emerald-500 to-emerald-600',
    iconText: 'text-white',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300'
  },
  warning: {
    bg: 'from-amber-950/90 to-slate-900/90',
    border: 'border-amber-500/30',
    text: 'text-amber-50',
    iconBg: 'from-amber-500 to-amber-600',
    iconText: 'text-white',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300'
  },
  danger: {
    bg: 'from-red-950/90 to-slate-900/90',
    border: 'border-red-500/30',
    text: 'text-red-50',
    iconBg: 'from-red-500 to-red-600',
    iconText: 'text-white',
    badgeBg: 'bg-red-500/20',
    badgeText: 'text-red-300'
  },
  info: {
    bg: 'from-blue-950/90 to-slate-900/90',
    border: 'border-blue-500/30',
    text: 'text-blue-50',
    iconBg: 'from-blue-500 to-blue-600',
    iconText: 'text-white',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-300'
  },
  premium: {
    bg: 'from-violet-950/90 via-purple-950/90 to-slate-900/90',
    border: 'border-violet-500/30',
    text: 'text-violet-50',
    iconBg: 'from-violet-500 via-purple-500 to-fuchsia-500',
    iconText: 'text-white',
    badgeBg: 'bg-violet-500/20',
    badgeText: 'text-violet-300'
  }
}

const tamanos: Record<TamanoKPI, {
  padding: string
  iconSize: string
  iconContainerSize: string
  valorSize: string
  tituloSize: string
  badgeSize: string
}> = {
  sm: {
    padding: 'p-3',
    iconSize: 'w-4 h-4',
    iconContainerSize: 'w-8 h-8',
    valorSize: 'text-xl',
    tituloSize: 'text-xs',
    badgeSize: 'h-5 text-[10px]'
  },
  md: {
    padding: 'p-4',
    iconSize: 'w-5 h-5',
    iconContainerSize: 'w-10 h-10',
    valorSize: 'text-2xl',
    tituloSize: 'text-sm',
    badgeSize: 'h-6 text-xs'
  },
  lg: {
    padding: 'p-5',
    iconSize: 'w-6 h-6',
    iconContainerSize: 'w-12 h-12',
    valorSize: 'text-3xl',
    tituloSize: 'text-sm',
    badgeSize: 'h-6 text-xs'
  },
  xl: {
    padding: 'p-6',
    iconSize: 'w-7 h-7',
    iconContainerSize: 'w-14 h-14',
    valorSize: 'text-4xl',
    tituloSize: 'text-base',
    badgeSize: 'h-7 text-sm'
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE SPARKLINE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SparklineProps {
  data: DatoSparkline[]
  width?: number
  height?: number
  color?: string
  fillColor?: string
  className?: string
}

function Sparkline({
  data,
  width = 80,
  height = 30,
  color = '#8B5CF6',
  fillColor = 'rgba(139, 92, 246, 0.2)',
  className
}: SparklineProps) {
  if (!data || data.length < 2) return null

  const valores = data.map(d => d.valor)
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const range = max - min || 1

  const puntos = valores.map((valor, i) => {
    const x = (i / (valores.length - 1)) * width
    const y = height - ((valor - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,${height} ${puntos} ${width},${height}`

  return (
    <svg width={width} height={height} className={className}>
      {/* Área de relleno */}
      <polygon
        points={areaPoints}
        fill={fillColor}
      />
      {/* Línea */}
      <polyline
        points={puntos}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Punto final */}
      <circle
        cx={width}
        cy={height - ((valores[valores.length - 1] - min) / range) * height}
        r={3}
        fill={color}
      />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE CONTADOR ANIMADO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ContadorAnimadoProps {
  valor: number
  formato: FormatoKPI
  duracion: number
  decimales: number
  prefijo?: string
  sufijo?: string
  className?: string
}

function ContadorAnimado({
  valor,
  formato,
  duracion,
  decimales,
  prefijo,
  sufijo,
  className
}: ContadorAnimadoProps) {
  const [valorActual, setValorActual] = useState(0)
  const frameRef = useRef<number>()

  useEffect(() => {
    const inicio = performance.now()
    const valorInicial = 0

    const animar = (tiempoActual: number) => {
      const tiempo = tiempoActual - inicio
      const progreso = Math.min(tiempo / duracion, 1)

      // Easing out cubic
      const eased = 1 - Math.pow(1 - progreso, 3)
      const nuevoValor = valorInicial + (valor - valorInicial) * eased

      setValorActual(nuevoValor)

      if (progreso < 1) {
        frameRef.current = requestAnimationFrame(animar)
      }
    }

    frameRef.current = requestAnimationFrame(animar)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [valor, duracion])

  const formatearValor = (val: number): string => {
    switch (formato) {
      case 'moneda':
        return val.toLocaleString('es-MX', {
          minimumFractionDigits: decimales,
          maximumFractionDigits: decimales
        })
      case 'porcentaje':
        return val.toFixed(decimales)
      case 'cantidad':
        if (val >= 1000000) {
          return (val / 1000000).toFixed(1) + 'M'
        }
        if (val >= 1000) {
          return (val / 1000).toFixed(1) + 'K'
        }
        return Math.round(val).toLocaleString('es-MX')
      case 'tiempo':
        const horas = Math.floor(val / 3600)
        const minutos = Math.floor((val % 3600) / 60)
        return `${horas}h ${minutos}m`
      default:
        return val.toLocaleString('es-MX', {
          minimumFractionDigits: 0,
          maximumFractionDigits: decimales
        })
    }
  }

  const obtenerPrefijo = (): string => {
    if (prefijo) return prefijo
    if (formato === 'moneda') return '$'
    return ''
  }

  const obtenerSufijo = (): string => {
    if (sufijo) return sufijo
    if (formato === 'porcentaje') return '%'
    return ''
  }

  return (
    <span className={className}>
      {obtenerPrefijo()}
      {formatearValor(valorActual)}
      {obtenerSufijo()}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default function KPICardAnimated({
  titulo,
  valor,
  valorAnterior,
  formato = 'numero',
  variante = 'default',
  tamano = 'md',
  icono,
  descripcion,
  periodo = 'vs período anterior',
  tendencia,
  sparklineData,
  objetivo,
  sufijo,
  prefijo,
  decimales = formato === 'moneda' ? 2 : 0,
  animado = true,
  duracionAnimacion = 1500,
  onClick,
  className
}: KPICardProps) {
  const [hover, setHover] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Calcular tendencia automáticamente si no se proporciona
  const tendenciaCalculada = tendencia || (
    valorAnterior !== undefined
      ? valor > valorAnterior ? 'up' : valor < valorAnterior ? 'down' : 'neutral'
      : 'neutral'
  )

  // Calcular cambio porcentual
  const cambio = valorAnterior !== undefined && valorAnterior !== 0
    ? ((valor - valorAnterior) / valorAnterior) * 100
    : 0

  // Calcular progreso hacia objetivo
  const progresoObjetivo = objetivo ? Math.min((valor / objetivo) * 100, 100) : undefined

  // Obtener estilos
  const colores = coloresVariante[variante]
  const sizes = tamanos[tamano]
  const Icono = icono || iconosDefault.default

  // Mouse parallax effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-100, 100], [5, -5])
  const rotateY = useTransform(mouseX, [-100, 100], [-5, 5])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }, [mouseX, mouseY])

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
    setHover(false)
  }, [mouseX, mouseY])

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, z: 30 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "perspective-1000",
        onClick && "cursor-pointer"
      )}
    >
      <Card className={cn(
        "relative overflow-hidden border shadow-xl",
        `bg-gradient-to-br ${colores.bg}`,
        colores.border,
        "backdrop-blur-lg",
        "transition-shadow duration-300",
        hover && "shadow-2xl",
        className
      )}>
        {/* Efecto de brillo */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_4s_infinite]" />

        {/* Efecto de resplandor en hover */}
        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"
            />
          )}
        </AnimatePresence>

        <CardContent className={sizes.padding}>
          <div className="flex items-start justify-between gap-4">
            {/* Contenido principal */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Título */}
              <p className={cn(
                "font-medium text-slate-400",
                sizes.tituloSize
              )}>
                {titulo}
              </p>

              {/* Valor */}
              <div className="flex items-baseline gap-2">
                <motion.div
                  className={cn(
                    "font-bold tracking-tight",
                    colores.text,
                    sizes.valorSize
                  )}
                  key={valor}
                >
                  {animado ? (
                    <ContadorAnimado
                      valor={valor}
                      formato={formato}
                      duracion={duracionAnimacion}
                      decimales={decimales}
                      prefijo={prefijo}
                      sufijo={sufijo}
                    />
                  ) : (
                    <>
                      {formato === 'moneda' && '$'}
                      {valor.toLocaleString('es-MX', { maximumFractionDigits: decimales })}
                      {formato === 'porcentaje' && '%'}
                      {sufijo}
                    </>
                  )}
                </motion.div>
              </div>

              {/* Tendencia y cambio */}
              {valorAnterior !== undefined && (
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "flex items-center gap-1",
                    sizes.badgeSize,
                    tendenciaCalculada === 'up' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                    tendenciaCalculada === 'down' && "bg-red-500/20 text-red-400 border-red-500/30",
                    tendenciaCalculada === 'neutral' && colores.badgeBg, colores.badgeText
                  )}>
                    {tendenciaCalculada === 'up' && <ArrowUpRight className="w-3 h-3" />}
                    {tendenciaCalculada === 'down' && <ArrowDownRight className="w-3 h-3" />}
                    {tendenciaCalculada === 'neutral' && <Minus className="w-3 h-3" />}
                    {cambio >= 0 ? '+' : ''}{cambio.toFixed(1)}%
                  </Badge>
                  <span className="text-xs text-slate-500">{periodo}</span>
                </div>
              )}

              {/* Descripción */}
              {descripcion && (
                <p className="text-xs text-slate-500">{descripcion}</p>
              )}

              {/* Progreso hacia objetivo */}
              {progresoObjetivo !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Meta: {objetivo?.toLocaleString()}</span>
                    <span className={cn(
                      progresoObjetivo >= 100 && "text-emerald-400",
                      progresoObjetivo >= 75 && progresoObjetivo < 100 && "text-amber-400",
                      progresoObjetivo < 75 && "text-slate-400"
                    )}>
                      {progresoObjetivo.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progresoObjetivo}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={cn(
                        "h-full rounded-full",
                        progresoObjetivo >= 100 && "bg-gradient-to-r from-emerald-500 to-emerald-400",
                        progresoObjetivo >= 75 && progresoObjetivo < 100 && "bg-gradient-to-r from-amber-500 to-amber-400",
                        progresoObjetivo < 75 && "bg-gradient-to-r from-violet-500 to-violet-400"
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Icono y Sparkline */}
            <div className="flex flex-col items-end gap-2">
              {/* Icono */}
              <div className={cn(
                "rounded-xl flex items-center justify-center",
                `bg-gradient-to-br ${colores.iconBg}`,
                sizes.iconContainerSize
              )}>
                <Icono className={cn(sizes.iconSize, colores.iconText)} />
              </div>

              {/* Sparkline */}
              {sparklineData && sparklineData.length > 1 && (
                <Sparkline
                  data={sparklineData}
                  width={80}
                  height={30}
                  color={
                    variante === 'success' ? '#10B981' :
                    variante === 'warning' ? '#F59E0B' :
                    variante === 'danger' ? '#EF4444' :
                    variante === 'info' ? '#3B82F6' :
                    '#8B5CF6'
                  }
                  className="opacity-80"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VARIANTES PRE-CONFIGURADAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function KPICardVentas(props: Omit<KPICardProps, 'icono' | 'formato'>) {
  return <KPICardAnimated {...props} icono={ShoppingCart} formato="moneda" variante="success" />
}

export function KPICardUsuarios(props: Omit<KPICardProps, 'icono' | 'formato'>) {
  return <KPICardAnimated {...props} icono={Users} formato="numero" variante="info" />
}

export function KPICardBalance(props: Omit<KPICardProps, 'icono' | 'formato'>) {
  return <KPICardAnimated {...props} icono={Wallet} formato="moneda" variante="premium" />
}

export function KPICardProductos(props: Omit<KPICardProps, 'icono' | 'formato'>) {
  return <KPICardAnimated {...props} icono={Package} formato="cantidad" variante="default" />
}

export function KPICardPorcentaje(props: Omit<KPICardProps, 'formato'>) {
  return <KPICardAnimated {...props} formato="porcentaje" />
}

export { KPICardAnimated as KPICard }
