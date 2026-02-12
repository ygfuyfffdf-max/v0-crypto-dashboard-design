'use client'

import { memo, forwardRef } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { CleanInput, CleanInputProps } from './iOSCleanDesignSystem'
import { cn } from '@/app/_lib/utils'
import { Calendar, ChevronDown, DollarSign } from 'lucide-react'
import { iOSInput } from './iOSUltimatePremiumSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM WRAPPERS (React Hook Form Integration)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormFieldProps extends Omit<CleanInputProps, 'value' | 'onChange'> {
  name: string
  label?: string
  rules?: any
}

export const FormInput = memo(function FormInput({ name, rules, ...props }: FormFieldProps) {
  const { control, formState: { errors } } = useFormContext()
  
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <CleanInput
          {...props}
          {...field}
          error={errors[name]?.message as string}
          onChange={(val) => field.onChange(val)}
          value={field.value || ''}
        />
      )}
    />
  )
})

interface FormCurrencyInputProps extends Omit<CleanInputProps, 'value' | 'onChange' | 'type'> {
  name: string
  rules?: any
}

export const FormCurrencyInput = memo(function FormCurrencyInput({ name, rules, ...props }: FormCurrencyInputProps) {
  const { control, formState: { errors } } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <CleanInput
          {...props}
          {...field}
          type="text" // Usamos text para controlar el formato
          icon={DollarSign}
          error={errors[name]?.message as string}
          value={field.value || ''}
          onChange={(val) => {
            // Permitir solo números y punto decimal
            const numericValue = val.replace(/[^0-9.]/g, '')
            field.onChange(numericValue)
          }}
          placeholder="0.00"
        />
      )}
    />
  )
})

interface FormSelectProps {
  name: string
  label?: string
  options: { value: string; label: string }[]
  placeholder?: string
  rules?: any
  required?: boolean
  className?: string
}

export const FormSelect = memo(function FormSelect({ 
  name, 
  label, 
  options, 
  placeholder = 'Seleccionar...', 
  rules, 
  required,
  className 
}: FormSelectProps) {
  const { control, formState: { errors } } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <div className={cn("space-y-1.5", className)}>
          {label && (
            <label className={cn(
              "block text-sm font-medium",
              errors[name] ? "text-red-400" : "text-white/60"
            )}>
              {label}
              {required && <span className="text-red-400 ml-1">*</span>}
            </label>
          )}
          
          <div className="relative">
            <select
              {...field}
              className={cn(
                "w-full appearance-none rounded-xl bg-white/[0.04] border px-4 py-2.5 text-white outline-none transition-all",
                "focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20",
                errors[name] ? "border-red-500/50" : "border-white/[0.08] hover:border-white/[0.12]",
                !field.value && "text-white/30"
              )}
            >
              <option value="" disabled className="bg-[#1C1C1E] text-white/30">
                {placeholder}
              </option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#1C1C1E] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
          
          {errors[name] && (
            <p className="text-xs text-red-400 ml-1">
              {errors[name]?.message as string}
            </p>
          )}
        </div>
      )}
    />
  )
})

interface FormDatePickerProps {
  name: string
  label?: string
  rules?: any
  required?: boolean
  className?: string
}

export const FormDatePicker = memo(function FormDatePicker({
  name,
  label,
  rules,
  required,
  className
}: FormDatePickerProps) {
  const { control, formState: { errors } } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <div className={cn("space-y-1.5", className)}>
          {label && (
            <label className={cn(
              "block text-sm font-medium",
              errors[name] ? "text-red-400" : "text-white/60"
            )}>
              {label}
              {required && <span className="text-red-400 ml-1">*</span>}
            </label>
          )}
          
          <div className="relative">
            <input
              type="date"
              {...field}
              className={cn(
                "w-full rounded-xl bg-white/[0.04] border px-4 py-2.5 text-white outline-none transition-all",
                "focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20",
                errors[name] ? "border-red-500/50" : "border-white/[0.08] hover:border-white/[0.12]",
                "calendar-picker-indicator:invert"
              )}
            />
            {!field.value && (
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            )}
          </div>

          {errors[name] && (
            <p className="text-xs text-red-400 ml-1">
              {errors[name]?.message as string}
            </p>
          )}
        </div>
      )}
    />
  )
})
