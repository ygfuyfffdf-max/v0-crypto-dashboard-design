/**
 * 📅 HEATMAP CALENDAR 2026 - CALENDARIO CON MAPA DE CALOR
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import React, { useMemo } from 'react'
import { motion } from 'motion/react'
import { colors } from '../styles/design-tokens'

export interface HeatmapDay {
  date: Date
  value: number
  label?: string
}

export interface HeatmapCalendarProps {
  data: HeatmapDay[]
  year?: number
  colorScale?: string[]
  className?: string
  onDayClick?: (day: HeatmapDay) => void
}

export function HeatmapCalendar({
  data,
  year = new Date().getFullYear(),
  colorScale = [
    colors.void.elevated,
    'rgba(168, 85, 247, 0.2)',
    'rgba(168, 85, 247, 0.4)',
    'rgba(168, 85, 247, 0.6)',
    'rgba(168, 85, 247, 0.8)',
    colors.accent.primary,
  ],
  className = '',
  onDayClick,
}: HeatmapCalendarProps) {
  const weeks = useMemo(() => {
    const result: (HeatmapDay | null)[][] = []
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)

    let currentWeek: (HeatmapDay | null)[] = []
    const startDay = startDate.getDay()
    for (let i = 0; i < startDay; i++) {
      currentWeek.push(null)
    }

    const dataMap = new Map(data.map((d) => [d.date.toISOString().split('T')[0], d]))

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const dayData = dataMap.get(dateStr) || { date: new Date(d), value: 0 }
      currentWeek.push(dayData)

      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      result.push(currentWeek)
    }

    return result
  }, [data, year])

  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data])

  const getColor = (value: number) => {
    if (value === 0) return colorScale[0]
    const index = Math.ceil((value / maxValue) * (colorScale.length - 1))
    return colorScale[Math.min(index, colorScale.length - 1)]
  }

  return (
    <div className={className}>
      <div className="flex gap-[2px]">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[2px]">
            {week.map((day, dayIndex) => (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                className="h-3 w-3 cursor-pointer rounded-sm"
                style={{ backgroundColor: day ? getColor(day.value) : 'transparent' }}
                whileHover={day ? { scale: 1.5 } : undefined}
                onClick={() => day && onDayClick?.(day)}
                title={day ? `${day.date.toLocaleDateString()}: ${day.value}` : ''}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default HeatmapCalendar
