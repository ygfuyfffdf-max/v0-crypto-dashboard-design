'use client'

import { cn } from '@/app/_lib/utils'
import { Check } from 'lucide-react'
import React from 'react'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean | 'indeterminate') => void
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => (
    <div className="relative flex items-center">
      <input
        ref={ref}
        type="checkbox"
        className="sr-only peer"
        onChange={(e) => {
          onChange?.(e)
          onCheckedChange?.(e.target.checked)
        }}
        {...props}
      />
      <div
        className={cn(
          'flex h-4 w-4 cursor-pointer items-center justify-center rounded',
          'border border-white/20 bg-white/5 transition-all',
          'peer-checked:border-violet-500 peer-checked:bg-violet-500',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500/40',
          className,
        )}
      >
        <Check className="h-2.5 w-2.5 text-white opacity-0 peer-checked:opacity-100" />
      </div>
    </div>
  ),
)
Checkbox.displayName = 'Checkbox'
