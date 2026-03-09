"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, defaultValue, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const currentValue = value?.[0] ?? defaultValue?.[0] ?? min
    const percentage = ((currentValue - min) / (max - min)) * 100

    return (
      <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={(e) => onValueChange?.([Number(e.target.value)])}
          className="w-full h-2 appearance-none bg-primary/20 rounded-full cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-primary
            [&::-webkit-slider-thumb]:bg-background
            [&::-webkit-slider-thumb]:shadow
            [&::-webkit-slider-thumb]:transition-colors
            [&::-webkit-slider-thumb]:hover:bg-primary/10
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-primary
            [&::-moz-range-thumb]:bg-background
            [&::-moz-range-thumb]:shadow"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) ${percentage}%, hsl(var(--primary) / 0.2) ${percentage}%)`
          }}
          {...props}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
