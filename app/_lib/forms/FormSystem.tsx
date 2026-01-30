/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📝 CHRONOS INFINITY 2030 — SISTEMA DE FORMULARIOS PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de formularios avanzado con:
 * - Validación en tiempo real
 * - Manejo de estado optimizado
 * - Integración con Zod schemas
 * - Componentes de campo reutilizables
 * - Soporte para arrays dinámicos
 * - Autosave opcional
 * - Dirty tracking
 * - Error handling avanzado
 * 
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react'
import { z, ZodSchema, ZodError } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

type FieldValue = string | number | boolean | Date | null | undefined

interface FieldState {
  value: FieldValue
  error: string | null
  touched: boolean
  dirty: boolean
}

interface FormState<T extends Record<string, FieldValue>> {
  values: T
  errors: Record<keyof T, string | null>
  touched: Record<keyof T, boolean>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  submitCount: number
}

interface FormContextValue<T extends Record<string, FieldValue>> {
  state: FormState<T>
  setValue: (name: keyof T, value: FieldValue) => void
  setError: (name: keyof T, error: string | null) => void
  setTouched: (name: keyof T, touched: boolean) => void
  validateField: (name: keyof T) => Promise<boolean>
  validateAll: () => Promise<boolean>
  reset: (values?: Partial<T>) => void
  submit: () => Promise<void>
  getFieldProps: (name: keyof T) => {
    value: FieldValue
    error: string | null
    touched: boolean
    onChange: (value: FieldValue) => void
    onBlur: () => void
  }
}

interface UseFormOptions<T extends Record<string, FieldValue>> {
  initialValues: T
  schema?: ZodSchema<T>
  onSubmit: (values: T) => Promise<void> | void
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateOnMount?: boolean
  autosave?: boolean
  autosaveDelay?: number
  onAutosave?: (values: T) => Promise<void> | void
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════════════

const FormContext = createContext<FormContextValue<Record<string, FieldValue>> | null>(null)

export function useFormContext<T extends Record<string, FieldValue>>() {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider')
  }
  return context as FormContextValue<T>
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE FORM HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════

export function useForm<T extends Record<string, FieldValue>>(options: UseFormOptions<T>) {
  const {
    initialValues,
    schema,
    onSubmit,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnMount = false,
    autosave = false,
    autosaveDelay = 2000,
    onAutosave,
  } = options

  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<keyof T, string | null>>(
    Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: null }), {} as Record<keyof T, string | null>)
  )
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<keyof T, boolean>)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitCount, setSubmitCount] = useState(0)

  const initialValuesRef = useRef(initialValues)
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout>>()

  // Computed values
  const isDirty = useMemo(() => {
    return Object.keys(values).some(
      (key) => values[key as keyof T] !== initialValuesRef.current[key as keyof T]
    )
  }, [values])

  const isValid = useMemo(() => {
    return Object.values(errors).every((error) => error === null)
  }, [errors])

  // Validate single field
  const validateField = useCallback(
    async (name: keyof T): Promise<boolean> => {
      if (!schema) return true

      try {
        // Create partial schema for single field validation
        const fieldSchema = (schema as unknown as z.ZodObject<Record<string, z.ZodTypeAny>>).shape[name as string]
        if (fieldSchema) {
          await fieldSchema.parseAsync(values[name])
          setErrors((prev) => ({ ...prev, [name]: null }))
          return true
        }
        return true
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldError = error.errors[0]?.message || 'Campo inválido'
          setErrors((prev) => ({ ...prev, [name]: fieldError }))
          return false
        }
        return false
      }
    },
    [schema, values]
  )

  // Validate all fields
  const validateAll = useCallback(async (): Promise<boolean> => {
    if (!schema) return true

    try {
      await schema.parseAsync(values)
      setErrors(
        Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: null }), {} as Record<keyof T, string | null>)
      )
      return true
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors = { ...errors }
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof T
          if (path) {
            newErrors[path] = err.message
          }
        })
        setErrors(newErrors)
        return false
      }
      return false
    }
  }, [schema, values, errors])

  // Set value
  const setValue = useCallback(
    (name: keyof T, value: FieldValue) => {
      setValues((prev) => ({ ...prev, [name]: value }))
      
      if (validateOnChange) {
        // Debounce validation
        setTimeout(() => validateField(name), 100)
      }
    },
    [validateOnChange, validateField]
  )

  // Set error
  const setError = useCallback((name: keyof T, error: string | null) => {
    setErrors((prev) => ({ ...prev, [name]: error }))
  }, [])

  // Set touched
  const setTouchedField = useCallback(
    (name: keyof T, value: boolean) => {
      setTouched((prev) => ({ ...prev, [name]: value }))
      
      if (validateOnBlur && value) {
        validateField(name)
      }
    },
    [validateOnBlur, validateField]
  )

  // Reset form
  const reset = useCallback((newValues?: Partial<T>) => {
    const resetValues = { ...initialValuesRef.current, ...newValues }
    setValues(resetValues as T)
    setErrors(
      Object.keys(resetValues).reduce((acc, key) => ({ ...acc, [key]: null }), {} as Record<keyof T, string | null>)
    )
    setTouched(
      Object.keys(resetValues).reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<keyof T, boolean>)
    )
    setSubmitCount(0)
  }, [])

  // Submit
  const submit = useCallback(async () => {
    setIsSubmitting(true)
    setSubmitCount((prev) => prev + 1)

    // Touch all fields
    setTouched(
      Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<keyof T, boolean>)
    )

    const isFormValid = await validateAll()

    if (isFormValid) {
      try {
        await onSubmit(values)
      } catch (error) {
        console.error('Form submission error:', error)
      }
    }

    setIsSubmitting(false)
  }, [values, validateAll, onSubmit])

  // Get field props helper
  const getFieldProps = useCallback(
    (name: keyof T) => ({
      value: values[name],
      error: errors[name],
      touched: touched[name],
      onChange: (value: FieldValue) => setValue(name, value),
      onBlur: () => setTouchedField(name, true),
    }),
    [values, errors, touched, setValue, setTouchedField]
  )

  // Autosave effect
  useEffect(() => {
    if (!autosave || !isDirty || !onAutosave) return

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current)
    }

    autosaveTimerRef.current = setTimeout(() => {
      onAutosave(values)
    }, autosaveDelay)

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current)
      }
    }
  }, [autosave, isDirty, values, autosaveDelay, onAutosave])

  // Validate on mount
  useEffect(() => {
    if (validateOnMount) {
      validateAll()
    }
  }, [validateOnMount, validateAll])

  const state: FormState<T> = {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    submitCount,
  }

  return {
    state,
    setValue,
    setError,
    setTouched: setTouchedField,
    validateField,
    validateAll,
    reset,
    submit,
    getFieldProps,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FORM PROVIDER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

interface FormProviderProps<T extends Record<string, FieldValue>> {
  form: ReturnType<typeof useForm<T>>
  children: ReactNode
}

export function FormProvider<T extends Record<string, FieldValue>>({
  form,
  children,
}: FormProviderProps<T>) {
  return (
    <FormContext.Provider value={form as unknown as FormContextValue<Record<string, FieldValue>>}>
      {children}
    </FormContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FORM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

interface FormProps<T extends Record<string, FieldValue>> extends React.FormHTMLAttributes<HTMLFormElement> {
  form: ReturnType<typeof useForm<T>>
  children: ReactNode
}

export function Form<T extends Record<string, FieldValue>>({
  form,
  children,
  className,
  ...props
}: FormProps<T>) {
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      form.submit()
    },
    [form]
  )

  return (
    <FormProvider form={form}>
      <form onSubmit={handleSubmit} className={cn('space-y-4', className)} {...props}>
        {children}
      </form>
    </FormProvider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FIELD COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════

interface FormFieldProps {
  name: string
  label?: string
  hint?: string
  required?: boolean
  className?: string
  children: (props: {
    value: FieldValue
    error: string | null
    touched: boolean
    onChange: (value: FieldValue) => void
    onBlur: () => void
  }) => ReactNode
}

export function FormField({
  name,
  label,
  hint,
  required,
  className,
  children,
}: FormFieldProps) {
  const form = useFormContext()
  const fieldProps = form.getFieldProps(name)
  const showError = fieldProps.touched && fieldProps.error

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-white/80">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      {children(fieldProps)}
      
      <AnimatePresence mode="wait">
        {showError ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className="text-sm text-red-400"
          >
            {fieldProps.error}
          </motion.p>
        ) : hint ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-white/50"
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SUBMIT BUTTON
// ═══════════════════════════════════════════════════════════════════════════════════════

interface FormSubmitProps {
  children?: ReactNode
  loadingText?: string
  className?: string
  disabled?: boolean
}

export function FormSubmit({
  children = 'Guardar',
  loadingText = 'Guardando...',
  className,
  disabled,
}: FormSubmitProps) {
  const form = useFormContext()
  const { isSubmitting, isValid, isDirty } = form.state

  return (
    <motion.button
      type="submit"
      disabled={disabled || isSubmitting || !isValid}
      className={cn(
        'relative inline-flex items-center justify-center px-6 py-3 font-medium rounded-xl',
        'bg-gradient-to-r from-violet-600 to-purple-600 text-white',
        'hover:from-violet-500 hover:to-purple-500',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-all duration-200',
        className
      )}
      whileHover={!isSubmitting && isValid ? { scale: 1.02 } : {}}
      whileTap={!isSubmitting && isValid ? { scale: 0.98 } : {}}
    >
      {isSubmitting ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FORM STATUS INDICATOR
// ═══════════════════════════════════════════════════════════════════════════════════════

export function FormStatus() {
  const form = useFormContext()
  const { isDirty, isValid, isSubmitting } = form.state

  return (
    <div className="flex items-center gap-2 text-sm">
      {isSubmitting && (
        <span className="flex items-center gap-1 text-violet-400">
          <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
          Guardando...
        </span>
      )}
      {isDirty && !isSubmitting && (
        <span className="flex items-center gap-1 text-amber-400">
          <span className="w-2 h-2 bg-amber-400 rounded-full" />
          Sin guardar
        </span>
      )}
      {!isDirty && !isSubmitting && (
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-2 h-2 bg-emerald-400 rounded-full" />
          Guardado
        </span>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMMON VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const validationSchemas = {
  required: (message = 'Este campo es requerido') =>
    z.string().min(1, message),
  
  email: (message = 'Email inválido') =>
    z.string().email(message),
  
  phone: (message = 'Teléfono inválido') =>
    z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, message),
  
  number: {
    positive: (message = 'Debe ser un número positivo') =>
      z.number().positive(message),
    min: (min: number, message = `Mínimo ${min}`) =>
      z.number().min(min, message),
    max: (max: number, message = `Máximo ${max}`) =>
      z.number().max(max, message),
  },
  
  money: (message = 'Monto inválido') =>
    z.number().nonnegative(message),
  
  date: {
    future: (message = 'La fecha debe ser futura') =>
      z.date().refine((date) => date > new Date(), message),
    past: (message = 'La fecha debe ser pasada') =>
      z.date().refine((date) => date < new Date(), message),
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export type { FieldValue, FieldState, FormState, UseFormOptions }
