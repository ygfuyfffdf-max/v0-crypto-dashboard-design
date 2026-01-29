'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🏭 DISTRIBUIDOR FORM PREMIUM — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Formulario completo de distribuidor con:
 * - Datos de empresa y contacto
 * - Validación en tiempo real
 * - Diseño glassmorphism premium
 *
 * @version 3.0.0 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { zodResolver } from '@hookform/resolvers/zod'
import {
    Building,
    CheckCircle,
    Mail,
    MapPin,
    Phone,
    Save,
    Truck,
    User,
    X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
    DistribuidorFormSchema,
    FormActions,
    FormGrid,
    FormInput,
    FormModal,
    FormSection,
    FormTextarea,
    SubmitButton,
    type DistribuidorFormData,
} from './CompleteForms'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface DistribuidorFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DistribuidorFormData) => Promise<void>
  initialData?: Partial<DistribuidorFormData>
  mode?: 'create' | 'edit'
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DISTRIBUIDOR FORM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function DistribuidorFormPremium({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: DistribuidorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<DistribuidorFormData>({
    resolver: zodResolver(DistribuidorFormSchema),
    defaultValues: {
      nombre: initialData?.nombre || '',
      empresa: initialData?.empresa || '',
      contacto: initialData?.contacto || '',
      telefono: initialData?.telefono || '',
      email: initialData?.email || '',
      direccion: initialData?.direccion || '',
    },
    mode: 'onChange',
  })

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        nombre: initialData?.nombre || '',
        empresa: initialData?.empresa || '',
        contacto: initialData?.contacto || '',
        telefono: initialData?.telefono || '',
        email: initialData?.email || '',
        direccion: initialData?.direccion || '',
      })
      setShowSuccess(false)
    }
  }, [isOpen, initialData, reset])

  // Submit handler
  const onFormSubmit = useCallback(
    async (data: DistribuidorFormData) => {
      setIsSubmitting(true)
      try {
        await onSubmit(data)
        setShowSuccess(true)
        setTimeout(() => {
          onClose()
        }, 1000)
      } catch (error) {
        console.error('Error al guardar distribuidor:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit, onClose],
  )

  // Phone formatting
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`
    if (cleaned.length <= 8) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 12)}`
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Nuevo Distribuidor' : 'Editar Distribuidor'}
      subtitle="Complete la información del proveedor"
      icon={<Truck className="h-5 w-5" />}
      size="md"
    >
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20"
            >
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </motion.div>
            <h3 className="text-lg font-medium text-white">
              {mode === 'create' ? 'Distribuidor Creado' : 'Distribuidor Actualizado'}
            </h3>
            <p className="mt-1 text-sm text-white/50">Los cambios se guardaron correctamente</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onFormSubmit)}
            className="space-y-6"
          >
            {/* Información del Distribuidor */}
            <FormSection title="Información del Distribuidor" icon={<Building className="h-4 w-4" />}>
              <Controller
                name="nombre"
                control={control}
                render={({ field }) => (
                  <FormInput
                    {...field}
                    label="Nombre / Alias"
                    placeholder="Distribuidor Principal"
                    required
                    error={errors.nombre?.message}
                    icon={<User className="h-4 w-4" />}
                    tooltip="Nombre o alias para identificar al distribuidor"
                  />
                )}
              />

              <FormGrid cols={2}>
                <Controller
                  name="empresa"
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      {...field}
                      label="Empresa"
                      placeholder="Distribuidora XYZ S.A."
                      error={errors.empresa?.message}
                      icon={<Building className="h-4 w-4" />}
                    />
                  )}
                />

                <Controller
                  name="contacto"
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      {...field}
                      label="Persona de Contacto"
                      placeholder="Juan Pérez"
                      error={errors.contacto?.message}
                      icon={<User className="h-4 w-4" />}
                    />
                  )}
                />
              </FormGrid>
            </FormSection>

            {/* Datos de Contacto */}
            <FormSection title="Datos de Contacto" icon={<Phone className="h-4 w-4" />}>
              <FormGrid cols={2}>
                <Controller
                  name="telefono"
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      {...field}
                      type="tel"
                      label="Teléfono"
                      placeholder="+52 XXX XXX XXXX"
                      error={errors.telefono?.message}
                      icon={<Phone className="h-4 w-4" />}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value)
                        field.onChange(formatted)
                      }}
                    />
                  )}
                />

                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      {...field}
                      type="email"
                      label="Email"
                      placeholder="contacto@distribuidor.com"
                      error={errors.email?.message}
                      icon={<Mail className="h-4 w-4" />}
                    />
                  )}
                />
              </FormGrid>
            </FormSection>

            {/* Ubicación */}
            <FormSection title="Ubicación" icon={<MapPin className="h-4 w-4" />} collapsible defaultExpanded={!!initialData?.direccion}>
              <Controller
                name="direccion"
                control={control}
                render={({ field }) => (
                  <FormTextarea
                    {...field}
                    label="Dirección"
                    placeholder="Calle, número, colonia, ciudad, CP..."
                    rows={2}
                    maxLength={200}
                    showCount
                    error={errors.direccion?.message}
                  />
                )}
              />
            </FormSection>

            {/* Actions */}
            <FormActions align="between">
              <SubmitButton
                type="button"
                variant="danger"
                onClick={onClose}
                disabled={isSubmitting}
                icon={<X className="h-4 w-4" />}
              >
                Cancelar
              </SubmitButton>

              <SubmitButton
                type="submit"
                variant="success"
                isLoading={isSubmitting}
                loadingText="Guardando..."
                disabled={!isValid || (!isDirty && mode === 'edit')}
                icon={<Save className="h-4 w-4" />}
              >
                {mode === 'create' ? 'Crear Distribuidor' : 'Guardar Cambios'}
              </SubmitButton>
            </FormActions>
          </motion.form>
        )}
      </AnimatePresence>
    </FormModal>
  )
}

export default DistribuidorFormPremium
