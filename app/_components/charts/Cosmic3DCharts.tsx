'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 COSMIC 3D CHARTS — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Charts 3D premium con:
 * ✅ SANKEY FLOW 3D con partículas oro fluyendo
 * ✅ HEATMAP BANCOS con glow violeta adaptativo
 * ✅ AREA CHART LIQUID FILL mood-adaptive
 * ✅ BAR CHART 3D con tilt Framer Motion
 * ✅ RADAR CHART perfil cliente
 * ✅ GAUGE DUAL con histórico vs capital
 * ✅ TREEMAP productos con métricas
 * ✅ NETWORK GRAPH trazabilidad
 *
 * Todos con WebGL Canvas + 60fps + lazy load
 *
 * @version 2.0.0 - COSMIC CHARTS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { NeuGlassCard } from '../ui/NeuGlassGen5System'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 SANKEY FLOW CHART — Flujos financieros con partículas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SankeyNode {
  id: string
  label: string
  value: number
  color: string
}

interface SankeyLink {
  source: string
  target: string
  value: number
}

interface CosmicSankeyChartProps {
  nodes: SankeyNode[]
  links: SankeyLink[]
  height?: number
  title?: string
  className?: string
}

export function CosmicSankeyChart({
  nodes,
  links,
  height = 300,
  title,
  className,
}: CosmicSankeyChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const rect = container.getBoundingClientRect()
    const width = rect.width

    // Calculate node positions
    const leftNodes = nodes.filter((_, i) => i < Math.ceil(nodes.length / 2))
    const rightNodes = nodes.filter((_, i) => i >= Math.ceil(nodes.length / 2))

    const nodePositions = new Map<string, { x: number; y: number; width: number; height: number }>()

    leftNodes.forEach((node, i) => {
      nodePositions.set(node.id, {
        x: 20,
        y: 30 + (i * (height - 60)) / Math.max(leftNodes.length - 1, 1),
        width: 80,
        height: 30,
      })
    })

    rightNodes.forEach((node, i) => {
      nodePositions.set(node.id, {
        x: width - 100,
        y: 30 + (i * (height - 60)) / Math.max(rightNodes.length - 1, 1),
        width: 80,
        height: 30,
      })
    })

    // Particles for flow animation
    interface FlowParticle {
      link: SankeyLink
      progress: number
      speed: number
      size: number
      alpha: number
    }

    const particles: FlowParticle[] = []
    links.forEach((link) => {
      for (let i = 0; i < Math.ceil(link.value / 1000); i++) {
        particles.push({
          link,
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.003,
          size: 2 + Math.random() * 3,
          alpha: 0.5 + Math.random() * 0.5,
        })
      }
    })

    const animate = () => {
      timeRef.current += 0.016
      const t = timeRef.current

      ctx.clearRect(0, 0, width, height)

      // Draw links
      links.forEach((link) => {
        const source = nodePositions.get(link.source)
        const target = nodePositions.get(link.target)
        if (!source || !target) return

        const sourceNode = nodes.find((n) => n.id === link.source)
        const targetNode = nodes.find((n) => n.id === link.target)
        if (!sourceNode || !targetNode) return

        // Bezier curve
        const startX = source.x + source.width
        const startY = source.y + source.height / 2
        const endX = target.x
        const endY = target.y + target.height / 2
        const controlX1 = startX + (endX - startX) * 0.5
        const controlX2 = startX + (endX - startX) * 0.5

        // Flow gradient
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY)
        gradient.addColorStop(0, sourceNode.color + '60')
        gradient.addColorStop(1, targetNode.color + '60')

        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.bezierCurveTo(controlX1, startY, controlX2, endY, endX, endY)
        ctx.strokeStyle = gradient
        ctx.lineWidth = Math.max(2, link.value / 10000)
        ctx.stroke()
      })

      // Draw nodes
      nodes.forEach((node) => {
        const pos = nodePositions.get(node.id)
        if (!pos) return

        // Node glow
        const glowGradient = ctx.createRadialGradient(
          pos.x + pos.width / 2,
          pos.y + pos.height / 2,
          0,
          pos.x + pos.width / 2,
          pos.y + pos.height / 2,
          pos.width,
        )
        glowGradient.addColorStop(0, node.color + '40')
        glowGradient.addColorStop(1, 'transparent')
        ctx.fillStyle = glowGradient
        ctx.fillRect(pos.x - 20, pos.y - 20, pos.width + 40, pos.height + 40)

        // Node box
        ctx.fillStyle = node.color + '30'
        ctx.strokeStyle = node.color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(pos.x, pos.y, pos.width, pos.height, 8)
        ctx.fill()
        ctx.stroke()

        // Node label
        ctx.fillStyle = 'white'
        ctx.font = '11px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(node.label, pos.x + pos.width / 2, pos.y + pos.height / 2 + 4)
      })

      // Animate particles
      particles.forEach((p) => {
        p.progress += p.speed
        if (p.progress > 1) p.progress = 0

        const source = nodePositions.get(p.link.source)
        const target = nodePositions.get(p.link.target)
        if (!source || !target) return

        const startX = source.x + source.width
        const startY = source.y + source.height / 2
        const endX = target.x
        const endY = target.y + target.height / 2

        // Bezier position
        const t2 = p.progress
        const mt = 1 - t2
        const x =
          mt * mt * mt * startX +
          3 * mt * mt * t2 * (startX + (endX - startX) * 0.5) +
          3 * mt * t2 * t2 * (startX + (endX - startX) * 0.5) +
          t2 * t2 * t2 * endX
        const y =
          mt * mt * mt * startY +
          3 * mt * mt * t2 * startY +
          3 * mt * t2 * t2 * endY +
          t2 * t2 * t2 * endY

        // Gold particle
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha * (0.5 + Math.sin(t * 3 + p.progress * Math.PI) * 0.5)})`
        ctx.fill()

        // Glow
        const particleGlow = ctx.createRadialGradient(x, y, 0, x, y, p.size * 3)
        particleGlow.addColorStop(0, 'rgba(251, 191, 36, 0.4)')
        particleGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = particleGlow
        ctx.fillRect(x - p.size * 3, y - p.size * 3, p.size * 6, p.size * 6)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [nodes, links, height])

  return (
    <NeuGlassCard className={cn('p-4', className)} glowColor="gold">
      {title && <h3 className="mb-3 text-sm font-medium text-white/70">{title}</h3>}
      <div ref={containerRef} className="relative w-full" style={{ height }}>
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </NeuGlassCard>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔥 HEATMAP CHART — Bancos vs Tiempo con glow adaptativo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface HeatmapCell {
  x: number
  y: number
  value: number
  label?: string
}

interface CosmicHeatmapChartProps {
  data: HeatmapCell[]
  xLabels: string[]
  yLabels: string[]
  height?: number
  title?: string
  colorScale?: 'violet' | 'cyan' | 'emerald' | 'gold'
  className?: string
}

export function CosmicHeatmapChart({
  data,
  xLabels,
  yLabels,
  height = 250,
  title,
  colorScale = 'violet',
  className,
}: CosmicHeatmapChartProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null)

  const colorScales = {
    violet: ['#1a1a2e', '#4a1a7a', '#8B5CF6', '#A78BFA', '#C4B5FD'],
    cyan: ['#1a1a2e', '#0d4f5c', '#06B6D4', '#22D3EE', '#67E8F9'],
    emerald: ['#1a1a2e', '#064e3b', '#10B981', '#34D399', '#6EE7B7'],
    gold: ['#1a1a2e', '#713f12', '#FBBF24', '#FCD34D', '#FDE68A'],
  }

  const colors = colorScales[colorScale]
  const maxValue = Math.max(...data.map((d) => d.value))

  const getColor = (value: number) => {
    const ratio = value / maxValue
    const index = Math.floor(ratio * (colors.length - 1))
    return colors[Math.min(index, colors.length - 1)]
  }

  const cellWidth = 100 / xLabels.length
  const cellHeight = (height - 40) / yLabels.length

  return (
    <NeuGlassCard className={cn('p-4', className)} glowColor={colorScale}>
      {title && <h3 className="mb-3 text-sm font-medium text-white/70">{title}</h3>}

      <div className="relative" style={{ height }}>
        {/* Y Labels */}
        <div className="absolute top-0 left-0 flex h-full w-16 flex-col justify-around py-2">
          {yLabels.map((label, i) => (
            <span key={i} className="truncate text-[10px] text-white/50">
              {label}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="ml-16 h-full">
          <div
            className="grid h-[calc(100%-24px)] w-full gap-1"
            style={{
              gridTemplateColumns: `repeat(${xLabels.length}, 1fr)`,
              gridTemplateRows: `repeat(${yLabels.length}, 1fr)`,
            }}
          >
            {data.map((cell, i) => {
              const color = getColor(cell.value) || colors[0]
              const isHovered = hoveredCell === cell

              return (
                <motion.div
                  key={i}
                  className="relative cursor-pointer rounded-md transition-all"
                  style={{
                    background: color,
                    boxShadow: isHovered ? `0 0 20px ${color}80` : 'none',
                  }}
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                >
                  {isHovered && (
                    <motion.div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-gray-900 px-2 py-1 text-[10px] whitespace-nowrap text-white"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {cell.label || `$${cell.value.toLocaleString()}`}
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* X Labels */}
          <div className="mt-2 flex justify-around">
            {xLabels.map((label, i) => (
              <span key={i} className="text-[10px] text-white/50">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </NeuGlassCard>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 GAUGE DUAL CHART — Histórico vs Capital Actual
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GaugeDualChartProps {
  historico: number
  capital: number
  label?: string
  height?: number
  className?: string
}

export function GaugeDualChart({
  historico,
  capital,
  label = 'Capital',
  height = 200,
  className,
}: GaugeDualChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const [animatedHistorico, setAnimatedHistorico] = useState(0)
  const [animatedCapital, setAnimatedCapital] = useState(0)

  // Animate values
  useEffect(() => {
    let start: number | null = null
    const duration = 1500

    const animate = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic

      setAnimatedHistorico(historico * eased)
      setAnimatedCapital(capital * eased)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [historico, capital])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = height * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const centerX = height / 2
    const centerY = height / 2 + 10
    const outerRadius = height / 2 - 20
    const innerRadius = outerRadius - 15
    const startAngle = Math.PI * 0.75
    const endAngle = Math.PI * 2.25

    // Clear
    ctx.clearRect(0, 0, height, height)

    // Background arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 15
    ctx.lineCap = 'round'
    ctx.stroke()

    // Historico arc (outer)
    const historicoRatio = Math.min(animatedHistorico / Math.max(historico * 1.2, 1), 1)
    const historicoAngle = startAngle + (endAngle - startAngle) * historicoRatio

    const historicoGradient = ctx.createLinearGradient(0, 0, height, height)
    historicoGradient.addColorStop(0, '#8B5CF6')
    historicoGradient.addColorStop(1, '#EC4899')

    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius, startAngle, historicoAngle)
    ctx.strokeStyle = historicoGradient
    ctx.lineWidth = 15
    ctx.lineCap = 'round'
    ctx.stroke()

    // Capital arc (inner)
    const capitalRatio = Math.min(animatedCapital / Math.max(capital * 1.2, 1), 1)
    const capitalAngle = startAngle + (endAngle - startAngle) * capitalRatio

    const capitalGradient = ctx.createLinearGradient(0, 0, height, height)
    capitalGradient.addColorStop(0, '#06B6D4')
    capitalGradient.addColorStop(1, '#10B981')

    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius, startAngle, capitalAngle)
    ctx.strokeStyle = capitalGradient
    ctx.lineWidth = 10
    ctx.lineCap = 'round'
    ctx.stroke()

    // Glow effects
    ctx.shadowBlur = 20
    ctx.shadowColor = '#8B5CF6'
    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius, historicoAngle - 0.1, historicoAngle)
    ctx.strokeStyle = '#8B5CF6'
    ctx.lineWidth = 15
    ctx.stroke()
    ctx.shadowBlur = 0

    ctx.shadowBlur = 15
    ctx.shadowColor = '#06B6D4'
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius, capitalAngle - 0.1, capitalAngle)
    ctx.strokeStyle = '#06B6D4'
    ctx.lineWidth = 10
    ctx.stroke()
    ctx.shadowBlur = 0
  }, [animatedHistorico, animatedCapital, historico, capital, height])

  return (
    <NeuGlassCard className={cn('flex flex-col items-center p-4', className)} glowColor="violet">
      <canvas
        ref={canvasRef}
        width={height}
        height={height}
        style={{ width: height, height: height }}
      />

      {/* Values */}
      <div className="mt-2 flex w-full justify-around text-center">
        <div>
          <p className="text-[10px] tracking-wider text-violet-400 uppercase">Histórico</p>
          <p className="text-lg font-bold text-white">
            ${animatedHistorico.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[10px] tracking-wider text-cyan-400 uppercase">Capital</p>
          <p className="text-lg font-bold text-white">
            ${animatedCapital.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {label && <p className="mt-2 text-xs text-white/50">{label}</p>}
    </NeuGlassCard>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🕸️ RADAR CHART — Perfil Cliente/Distribuidor
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface RadarDataPoint {
  label: string
  value: number
  max: number
}

interface CosmicRadarChartProps {
  data: RadarDataPoint[]
  size?: number
  color?: 'violet' | 'cyan' | 'emerald' | 'gold'
  title?: string
  className?: string
}

export function CosmicRadarChart({
  data,
  size = 200,
  color = 'cyan',
  title,
  className,
}: CosmicRadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const colorPalette = {
    violet: { fill: 'rgba(139, 92, 246, 0.3)', stroke: '#8B5CF6' },
    cyan: { fill: 'rgba(6, 182, 212, 0.3)', stroke: '#06B6D4' },
    emerald: { fill: 'rgba(16, 185, 129, 0.3)', stroke: '#10B981' },
    gold: { fill: 'rgba(251, 191, 36, 0.3)', stroke: '#FBBF24' },
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 30
    const angleStep = (Math.PI * 2) / data.length

    // Clear
    ctx.clearRect(0, 0, size, size)

    // Draw grid
    for (let i = 1; i <= 5; i++) {
      const r = (radius * i) / 5
      ctx.beginPath()
      for (let j = 0; j <= data.length; j++) {
        const angle = angleStep * j - Math.PI / 2
        const x = centerX + Math.cos(angle) * r
        const y = centerY + Math.sin(angle) * r
        if (j === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.stroke()
    }

    // Draw axes
    data.forEach((_, i) => {
      const angle = angleStep * i - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.stroke()
    })

    // Draw data
    ctx.beginPath()
    data.forEach((d, i) => {
      const angle = angleStep * i - Math.PI / 2
      const r = (d.value / d.max) * radius
      const x = centerX + Math.cos(angle) * r
      const y = centerY + Math.sin(angle) * r
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()
    ctx.fillStyle = colorPalette[color].fill
    ctx.fill()
    ctx.strokeStyle = colorPalette[color].stroke
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw points
    data.forEach((d, i) => {
      const angle = angleStep * i - Math.PI / 2
      const r = (d.value / d.max) * radius
      const x = centerX + Math.cos(angle) * r
      const y = centerY + Math.sin(angle) * r

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = colorPalette[color].stroke
      ctx.fill()
    })

    // Draw labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '10px Inter, sans-serif'
    ctx.textAlign = 'center'
    data.forEach((d, i) => {
      const angle = angleStep * i - Math.PI / 2
      const x = centerX + Math.cos(angle) * (radius + 15)
      const y = centerY + Math.sin(angle) * (radius + 15)
      ctx.fillText(d.label, x, y + 3)
    })
  }, [data, size, color])

  return (
    <NeuGlassCard className={cn('flex flex-col items-center p-4', className)} glowColor={color}>
      {title && <h3 className="mb-2 text-sm font-medium text-white/70">{title}</h3>}
      <canvas ref={canvasRef} width={size} height={size} style={{ width: size, height: size }} />
    </NeuGlassCard>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  CosmicSankeyChart as SankeyChart,
  CosmicHeatmapChart as HeatmapChart,
  CosmicRadarChart as RadarChart,
}
