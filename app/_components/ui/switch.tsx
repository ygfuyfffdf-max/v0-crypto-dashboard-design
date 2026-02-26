'use client'

import { cn } from '@/app/_lib/utils'
import React from 'react'

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
  checked?: boolean
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, checked, onChange, ...props }, ref) => (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        ref={ref}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => {
          onChange?.(e)
          onCheckedChange?.(e.target.checked)
        }}
        {...props}
      />
      <div
        className={cn(
          'peer h-6 w-11 rounded-full border border-white/20 bg-white/10 transition-all',
          'peer-checked:bg-violet-600 peer-focus:ring-2 peer-focus:ring-violet-500/40',
          'after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full',
          'after:bg-white after:shadow-sm after:transition-all after:content-[""]',
          'peer-checked:after:translate-x-5',
          className,
        )}
      />
    </label>
  ),
)
Switch.displayName = 'Switch'
