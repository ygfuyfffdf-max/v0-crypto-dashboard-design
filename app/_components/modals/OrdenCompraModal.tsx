'use client'

// ═══════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — MODAL ORDEN DE COMPRA
// Wizard con creación automática de distribuidor usando Zustand
// ═══════════════════════════════════════════════════════════════════════════

import { crearOrdenCompraCompleta } from '@/app/_actions/flujos-completos'
import { BANCOS_ORDENADOS } from '@/app/_lib/constants/bancos'
import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { logger } from '@/app/lib/utils/logger'
import { useQueryClient } from '@tanstack/react-query'
import type { Distribuidor } from '@/app/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { FieldErrors, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button, Modal, ModalFooter } from '../ui/Modal'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

const OrdenCompraSchema = z.object({
  distribuidorId: z.string().optional(),
  nuevoDistribuidor: z
    .object({
      nombre: z.string().min(2, 'Nombre requerido'),
      empresa: z.string().optional(),
      telefono: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
    })
    .optional(),
  productoId: z.string().optional(), // Ahora opcional para permitir nuevo producto
  nuevoProducto: z
    .object({
      nombre: z.string().min(2, 'Nombre del producto requerido'),
      descripcion: z.string().optional(),
      sku: z.string().optional(),
    })
    .optional(),
  cantidad: z.number().min(1, 'Cantidad mínima: 1'),
  costoDistribuidor: z.number().min(0, 'Costo requerido'), // Permitir 0 temporalmente, validar en submit
  costoTransporte: z.number().min(0),
  bancoOrigen: z.string().optional(), // Opcional si no hay pago inicial
  pagoInicial: z.number().min(0),
  notas: z.string().optional(),
})

type OrdenCompraFormData = z.infer<typeof OrdenCompraSchema>

// Tipo para productos de API
interface ProductoAlmacen {
  id: string
  nombre: string
  cantidad: number
  precioCompra: number
  precioVenta: number
}

// Tipo para bancos de API
interface BancoAPI {
  id: string
  nombre: string
  capitalActual: number
  color: string
  icono: string
}

// ═══════════════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════════════

interface OrdenCompraModalProps {
  isOpen: boolean
  onClose: () => void
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function OrdenCompraModal({ isOpen, onClose }: OrdenCompraModalProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(0)
  const [isNewDistribuidor, setIsNewDistribuidor] = useState(false)
  const [isNewProducto, setIsNewProducto] = useState(false)
  const [isPending, startTransition] = useTransition()

  // ═══════════════════════════════════════════════════════════════════════
  // CARGAR DATOS DESDE API (siempre al abrir)
  // ═══════════════════════════════════════════════════════════════════════
  const [distribuidoresAPI, setDistribuidoresAPI] = useState<Distribuidor[]>([])
  const [loadingDistribuidores, setLoadingDistribuidores] = useState(false)

  const [productosAPI, setProductosAPI] = useState<ProductoAlmacen[]>([])
  const [loadingProductos, setLoadingProductos] = useState(false)

  const [bancosAPI, setBancosAPI] = useState<BancoAPI[]>([])
  const [loadingBancos, setLoadingBancos] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Cargar distribuidores
      setLoadingDistribuidores(true)
      fetch('/api/distribuidores')
        .then((r) => r.json())
        .then((response) => {
          const data = Array.isArray(response) ? response : response.data || []
          setDistribuidoresAPI(Array.isArray(data) ? data : [])
        })
        .catch((err) => {
          logger.error('Error cargando distribuidores', err, { context: 'OrdenCompraModal' })
          setDistribuidoresAPI([])
        })
        .finally(() => setLoadingDistribuidores(false))

      // Cargar productos
      setLoadingProductos(true)
      fetch('/api/almacen')
        .then((r) => r.json())
        .then((response) => {
          const data = Array.isArray(response) ? response : response.data || []
          setProductosAPI(Array.isArray(data) ? data : [])
        })
        .catch((err) => {
          logger.error('Error cargando productos', err, { context: 'OrdenCompraModal' })
          setProductosAPI([])
        })
        .finally(() => setLoadingProductos(false))

      // Cargar bancos
      setLoadingBancos(true)
      fetch('/api/bancos')
        .then((r) => r.json())
        .then((response) => {
          const data = Array.isArray(response) ? response : response.data || []
          setBancosAPI(Array.isArray(data) ? data : [])
        })
        .catch((err) => {
          logger.error('Error cargando bancos', err, { context: 'OrdenCompraModal' })
          setBancosAPI([])
        })
        .finally(() => setLoadingBancos(false))
    }
  }, [isOpen])

  // Usar datos de API
  const distribuidores = distribuidoresAPI

  const steps = ['Distribuidor', 'Producto', 'Pago', 'Confirmar']

  const form = useForm<OrdenCompraFormData>({
    resolver: zodResolver(OrdenCompraSchema),
    defaultValues: {
      productoId: '',
      cantidad: 1,
      costoDistribuidor: 0,
      costoTransporte: 0,
      bancoOrigen: 'boveda_monte',
      pagoInicial: 0,
    },
  })

  const watchedValues = form.watch()

  // ═══════════════════════════════════════════════════════════════════════
  // CÁLCULOS
  // ═══════════════════════════════════════════════════════════════════════

  const calculos = useMemo(() => {
    const cantidad = watchedValues.cantidad || 0
    const costoDistribuidor = watchedValues.costoDistribuidor || 0
    const costoTransporte = watchedValues.costoTransporte || 0
    const pagoInicial = watchedValues.pagoInicial || 0

    const costoTotal = costoDistribuidor * cantidad + costoTransporte
    const deuda = costoTotal - pagoInicial
    const costoPorUnidad = cantidad > 0 ? costoTotal / cantidad : 0

    return {
      costoTotal,
      costoPorUnidad,
      deuda,
      pagoInicial,
    }
  }, [watchedValues])

  // Banco seleccionado
  const bancoSeleccionado = bancosAPI.find((b) => b.id === watchedValues.bancoOrigen)
  const capitalDisponible = bancoSeleccionado?.capitalActual || 0
  const haySuficienteCapital = capitalDisponible >= (watchedValues.pagoInicial || 0)

  const handleNext = async () => {
    let isValid = true

    if (step === 0) {
      if (isNewDistribuidor) {
        isValid = await form.trigger('nuevoDistribuidor')
      } else {
        isValid = !!watchedValues.distribuidorId
        if (!isValid) {
          toast.error('Selecciona un distribuidor o crea uno nuevo')
        }
      }
    } else if (step === 1) {
      // Validar producto: existente o nuevo
      if (isNewProducto) {
        isValid = await form.trigger('nuevoProducto')
        if (!watchedValues.nuevoProducto?.nombre) {
          toast.error('Ingresa el nombre del producto')
          isValid = false
        }
      } else {
        isValid = !!watchedValues.productoId
        if (!isValid) {
          toast.error('Selecciona un producto o crea uno nuevo')
        }
      }
      // Validar cantidad y costo
      if (isValid) {
        isValid = await form.trigger(['cantidad', 'costoDistribuidor'])
      }
    } else if (step === 2) {
      // Solo validar banco si hay pago inicial mayor a 0
      const pagoInicial = watchedValues.pagoInicial || 0
      if (pagoInicial > 0) {
        isValid = await form.trigger(['bancoOrigen', 'pagoInicial'])
        if (!haySuficienteCapital) {
          toast.error('Capital insuficiente en el banco seleccionado')
          isValid = false
        }
      } else {
        // Si no hay pago inicial, siempre es válido
        isValid = true
      }
    }

    if (isValid && step < steps.length - 1) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleReset = () => {
    form.reset()
    setStep(0)
    setIsNewDistribuidor(false)
    setIsNewProducto(false)
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SUBMIT HANDLER - Función que procesa el formulario
  // ═══════════════════════════════════════════════════════════════════════

  const onFormSubmit = async (data: OrdenCompraFormData) => {
    logger.info('🚀 SUBMIT INICIADO - Creando orden de compra', {
      context: 'OrdenCompraModal',
      data,
      isNewDistribuidor,
      isNewProducto,
    })

    // Helper para convertir vacíos a undefined
    const emptyToUndefined = (val: string | undefined | null) =>
      val === '' || val === undefined || val === null ? undefined : val

    // ═══════════════════════════════════════════════════════════════════
    // VALIDACIÓN PRE-SUBMIT: Asegurar datos válidos antes de enviar
    // ═══════════════════════════════════════════════════════════════════

    // Validar costo unitario
    if (!data.costoDistribuidor || data.costoDistribuidor <= 0) {
      logger.error('❌ Costo inválido', {
        context: 'OrdenCompraModal',
        costo: data.costoDistribuidor,
      })
      toast.error('Error de validación', {
        description: 'El costo por unidad debe ser mayor a 0',
      })
      setStep(1) // Regresar al paso de producto
      return
    }

    // Validar distribuidor
    const distribuidorIdFinal = isNewDistribuidor
      ? undefined
      : emptyToUndefined(data.distribuidorId)
    const distribuidorNombreFinal = isNewDistribuidor
      ? emptyToUndefined(data.nuevoDistribuidor?.nombre)
      : undefined

    if (!distribuidorIdFinal && !distribuidorNombreFinal) {
      logger.error('❌ Distribuidor inválido', {
        context: 'OrdenCompraModal',
        distribuidorIdFinal,
        distribuidorNombreFinal,
        isNewDistribuidor,
      })
      toast.error('Error de validación', {
        description: 'Debe seleccionar un distribuidor existente o crear uno nuevo',
      })
      setStep(0) // Regresar al paso de distribuidor
      return
    }

    // Validar producto
    const productoIdFinal = isNewProducto ? undefined : emptyToUndefined(data.productoId)
    const productoNombreFinal = isNewProducto
      ? emptyToUndefined(data.nuevoProducto?.nombre)
      : undefined

    if (!productoIdFinal && !productoNombreFinal) {
      logger.error('❌ Producto inválido', {
        context: 'OrdenCompraModal',
        productoIdFinal,
        productoNombreFinal,
        isNewProducto,
      })
      toast.error('Error de validación', {
        description: 'Debe seleccionar un producto existente o crear uno nuevo',
      })
      setStep(1) // Regresar al paso de producto
      return
    }

    // Validar banco si hay pago inicial
    const montoPagoInicial = data.pagoInicial || 0
    const bancoOrigenIdFinal = emptyToUndefined(data.bancoOrigen)

    if (montoPagoInicial > 0 && !bancoOrigenIdFinal) {
      logger.error('❌ Banco origen requerido para pago inicial', {
        context: 'OrdenCompraModal',
        montoPagoInicial,
      })
      toast.error('Error de validación', {
        description: 'Si hay pago inicial, debe seleccionar un banco origen',
      })
      setStep(2) // Regresar al paso de pago
      return
    }

    // Construir payload con validación de campos vacíos
    const payload = {
      // Distribuidor: existente o nuevo
      distribuidorId: distribuidorIdFinal,
      distribuidorNombre: distribuidorNombreFinal,
      distribuidorTelefono: isNewDistribuidor
        ? emptyToUndefined(data.nuevoDistribuidor?.telefono)
        : undefined,
      distribuidorEmail: isNewDistribuidor
        ? emptyToUndefined(data.nuevoDistribuidor?.email)
        : undefined,

      // Producto: existente o nuevo
      productoId: productoIdFinal,
      productoNombre: productoNombreFinal,
      productoDescripcion: isNewProducto
        ? emptyToUndefined(data.nuevoProducto?.descripcion)
        : undefined,
      productoSku: isNewProducto ? emptyToUndefined(data.nuevoProducto?.sku) : undefined,

      // Datos de la orden
      cantidad: data.cantidad,
      precioUnitario: data.costoDistribuidor,
      fleteUnitario: data.costoTransporte > 0 ? data.costoTransporte / data.cantidad : 0,
      iva: 0,

      // Pago
      bancoOrigenId: bancoOrigenIdFinal,
      montoPagoInicial,

      // Metadata
      observaciones: emptyToUndefined(data.notas),
    }

    logger.info('🚀 Payload para crearOrdenCompraCompleta', {
      context: 'OrdenCompraModal',
      data: payload,
    })

    startTransition(async () => {
      try {
        // ═══════════════════════════════════════════════════════════════════
        // OPCIÓN 1: SERVER ACTION - crearOrdenCompraCompleta
        // ═══════════════════════════════════════════════════════════════════
        logger.info('🚀 Ejecutando Server Action crearOrdenCompraCompleta', {
          context: 'OrdenCompraModal',
        })

        let result: { success: boolean; data?: { productoNuevo?: boolean }; error?: string }

        try {
          result = await crearOrdenCompraCompleta(payload)
        } catch (serverActionError) {
          // Si el Server Action falla, intentar con la API como fallback
          logger.error('❌ Server Action falló, intentando API fallback', serverActionError, {
            context: 'OrdenCompraModal',
          })

          // Fallback a API
          const apiPayload = {
            distribuidorId: payload.distribuidorId || `dist_${Date.now()}`,
            distribuidorNombre: payload.distribuidorNombre,
            productoId: payload.productoId,
            productoNombre: payload.productoNombre,
            cantidad: payload.cantidad,
            precioUnitario: payload.precioUnitario,
            fleteUnitario: payload.fleteUnitario,
            pagoInicial: payload.montoPagoInicial,
            bancoOrigenId: payload.bancoOrigenId,
            observaciones: payload.observaciones,
          }

          const response = await fetch('/api/ordenes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiPayload),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || `Error ${response.status}`)
          }

          result = await response.json()
          result.success = true
        }

        if (!result.success) {
          throw new Error(result.error || 'Error desconocido')
        }

        toast.success('Orden de compra creada exitosamente', {
          description: result.data?.productoNuevo
            ? `Producto "${data.nuevoProducto?.nombre}" creado automáticamente`
            : undefined,
        })

        // Invalidar todas las queries relacionadas para actualizar UI
        queryClient.invalidateQueries({ queryKey: ['ordenesCompra'] })
        queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] })
        queryClient.invalidateQueries({ queryKey: ['distribuidores'] })
        queryClient.invalidateQueries({ queryKey: ['almacen'] })
        queryClient.invalidateQueries({ queryKey: ['bancos'] })
        queryClient.invalidateQueries({ queryKey: ['movimientos'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })

        handleReset()
        onClose()
        router.refresh() // Actualizar UI
      } catch (error) {
        logger.error('Error al crear orden de compra', error, {
          context: 'OrdenCompraModal',
          payload: JSON.stringify(payload),
          errorType: error instanceof Error ? error.constructor.name : typeof error,
        })

        // Mensaje de error más descriptivo
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido al crear orden'
        toast.error('Error al crear orden', {
          description: errorMessage,
          duration: 6000, // Duración más larga para leer el error
        })
      }
    })
  }

  // Handler de errores de validación
  const onFormError = (errors: FieldErrors<OrdenCompraFormData>) => {
    logger.error('❌ ERRORES DE VALIDACIÓN en orden de compra', errors, {
      context: 'OrdenCompraModal',
      formValues: form.getValues(),
      isNewDistribuidor,
      isNewProducto,
    })

    // Obtener mensaje de error más descriptivo
    const errorMessages: string[] = []
    Object.entries(errors).forEach(([field, error]) => {
      if (error?.message) {
        errorMessages.push(`${field}: ${error.message}`)
      } else if (typeof error === 'object' && error !== null) {
        // Manejar errores anidados (nuevoDistribuidor, nuevoProducto)
        Object.entries(error).forEach(([_subField, subError]) => {
          if (subError && typeof subError === 'object' && 'message' in subError) {
            errorMessages.push(`${field}: ${(subError as { message: string }).message}`)
          }
        })
      }
    })

    toast.error('Error de validación', {
      description: errorMessages[0] || 'Revisa los campos del formulario',
    })
  }

  const handleSubmit = form.handleSubmit(onFormSubmit, onFormError)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Orden de Compra"
      subtitle="Registra compra a distribuidor"
      size="lg"
    >
      {/* Step indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {steps.map((stepName, index) => (
          <div key={stepName} className="flex items-center">
            <motion.div
              animate={{
                scale: index === step ? 1.1 : 1,
                backgroundColor: index <= step ? '#3B82F6' : 'rgba(255,255,255,0.1)',
              }}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all',
                index <= step ? 'text-white' : 'text-gray-500',
              )}
            >
              {index < step ? <Check className="h-4 w-4" /> : index + 1}
            </motion.div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-1 h-0.5 w-8 transition-all',
                  index < step ? 'bg-blue-500' : 'bg-white/10',
                )}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {/* Step 0: Distribuidor */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-4"
            >
              <div className="flex gap-2 rounded-xl bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setIsNewDistribuidor(false)}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    !isNewDistribuidor ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white',
                  )}
                >
                  Existente
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewDistribuidor(true)}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    isNewDistribuidor ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white',
                  )}
                >
                  Nuevo
                </button>
              </div>

              {!isNewDistribuidor ? (
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Seleccionar Distribuidor</label>
                  <select
                    {...form.register('distribuidorId')}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {distribuidores.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre} {d.empresa ? `(${d.empresa})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Nombre *</label>
                    <input
                      {...form.register('nuevoDistribuidor.nombre')}
                      placeholder="Nombre del distribuidor"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Empresa</label>
                    <input
                      {...form.register('nuevoDistribuidor.empresa')}
                      placeholder="Nombre de empresa"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Teléfono</label>
                      <input
                        {...form.register('nuevoDistribuidor.telefono')}
                        placeholder="+52 555 123 4567"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Email</label>
                      <input
                        {...form.register('nuevoDistribuidor.email')}
                        type="email"
                        placeholder="email@ejemplo.com"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 1: Producto */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-4"
            >
              {/* Toggle: Producto existente o nuevo */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewProducto(false)
                    form.setValue('nuevoProducto', undefined)
                  }}
                  className={cn(
                    'flex-1 rounded-xl border px-4 py-3 transition-all',
                    !isNewProducto
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : 'border-white/10 text-gray-400 hover:border-white/20',
                  )}
                >
                  Producto Existente
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewProducto(true)
                    form.setValue('productoId', '')
                  }}
                  className={cn(
                    'flex-1 rounded-xl border px-4 py-3 transition-all',
                    isNewProducto
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : 'border-white/10 text-gray-400 hover:border-white/20',
                  )}
                >
                  + Nuevo Producto
                </button>
              </div>

              {/* Selector de Producto Existente */}
              {!isNewProducto && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Producto</label>
                  <select
                    {...form.register('productoId')}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500"
                    disabled={loadingProductos}
                  >
                    <option value="">
                      {loadingProductos ? 'Cargando productos...' : 'Seleccionar producto...'}
                    </option>
                    {productosAPI.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — Stock: {p.cantidad} — Compra: {formatCurrency(p.precioCompra)}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.productoId && (
                    <p className="text-xs text-red-400">
                      {form.formState.errors.productoId.message}
                    </p>
                  )}
                </div>
              )}

              {/* Formulario Nuevo Producto */}
              {isNewProducto && (
                <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-emerald-400">📦 Nuevo Producto</span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Nombre del Producto *</label>
                    <input
                      {...form.register('nuevoProducto.nombre')}
                      placeholder="Ej: Smartphone Samsung A54"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-emerald-500"
                    />
                    {form.formState.errors.nuevoProducto?.nombre && (
                      <p className="text-xs text-red-400">
                        {form.formState.errors.nuevoProducto.nombre.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">SKU (opcional)</label>
                      <input
                        {...form.register('nuevoProducto.sku')}
                        placeholder="SKU-001"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Descripción</label>
                      <input
                        {...form.register('nuevoProducto.descripcion')}
                        placeholder="Descripción corta"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Cantidad</label>
                <input
                  type="number"
                  {...form.register('cantidad', { valueAsNumber: true })}
                  min={1}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center text-3xl font-bold text-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Costo/Unidad</label>
                  <input
                    type="number"
                    {...form.register('costoDistribuidor', { valueAsNumber: true })}
                    min={0}
                    step="0.01"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-bold text-white focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Transporte Total</label>
                  <input
                    type="number"
                    {...form.register('costoTransporte', { valueAsNumber: true })}
                    min={0}
                    step="0.01"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Costo Total:</span>
                  <span className="font-bold text-blue-400">
                    {formatCurrency(calculos.costoTotal)}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-gray-500">Costo por Unidad:</span>
                  <span className="text-gray-400">{formatCurrency(calculos.costoPorUnidad)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Pago */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Banco Origen</label>
                <div className="grid grid-cols-2 gap-2">
                  {BANCOS_ORDENADOS.map((config) => {
                    const bancoId = config.id
                    const banco = bancosAPI.find((b) => b.id === bancoId)
                    const isSelected = watchedValues.bancoOrigen === bancoId

                    return (
                      <button
                        key={bancoId}
                        type="button"
                        onClick={() => form.setValue('bancoOrigen', bancoId)}
                        className={cn(
                          'rounded-xl border p-3 text-left transition-all',
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20',
                        )}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span>{config.icono}</span>
                          <span className="text-sm font-medium text-white">{config.nombre}</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {formatCurrency(banco?.capitalActual || 0)}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Pago Inicial (Anticipo)</label>
                <input
                  type="number"
                  {...form.register('pagoInicial', { valueAsNumber: true })}
                  min={0}
                  max={calculos.costoTotal}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white focus:border-blue-500"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => form.setValue('pagoInicial', 0)}
                    className="rounded-lg bg-white/5 px-3 py-1 text-xs text-gray-400 hover:text-white"
                  >
                    Sin pago
                  </button>
                  <button
                    type="button"
                    onClick={() => form.setValue('pagoInicial', calculos.costoTotal * 0.5)}
                    className="rounded-lg bg-white/5 px-3 py-1 text-xs text-gray-400 hover:text-white"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => form.setValue('pagoInicial', calculos.costoTotal)}
                    className="rounded-lg bg-white/5 px-3 py-1 text-xs text-gray-400 hover:text-white"
                  >
                    100%
                  </button>
                </div>
              </div>

              {!haySuficienteCapital && (watchedValues.pagoInicial || 0) > 0 && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                  <p className="text-sm text-red-400">
                    ⚠️ Capital insuficiente. Disponible: {formatCurrency(capitalDisponible)}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Confirmar */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-4"
            >
              {/* Resumen de Distribuidor */}
              {isNewDistribuidor && watchedValues.nuevoDistribuidor?.nombre && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                  <p className="text-xs text-blue-400">📋 Nuevo Distribuidor</p>
                  <p className="font-medium text-white">{watchedValues.nuevoDistribuidor.nombre}</p>
                </div>
              )}

              {/* Resumen de Producto */}
              {isNewProducto && watchedValues.nuevoProducto?.nombre && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <p className="text-xs text-emerald-400">📦 Nuevo Producto</p>
                  <p className="font-medium text-white">{watchedValues.nuevoProducto.nombre}</p>
                  {watchedValues.nuevoProducto.sku && (
                    <p className="text-xs text-gray-400">SKU: {watchedValues.nuevoProducto.sku}</p>
                  )}
                </div>
              )}

              <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Producto:</span>
                  <span className="font-medium text-white">
                    {isNewProducto
                      ? watchedValues.nuevoProducto?.nombre || 'Nuevo producto'
                      : productosAPI.find((p) => p.id === watchedValues.productoId)?.nombre || '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Cantidad:</span>
                  <span className="font-medium text-white">{watchedValues.cantidad} unidades</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Costo Total:</span>
                  <span className="font-bold text-white">
                    {formatCurrency(calculos.costoTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pago Inicial:</span>
                  <span className="font-medium text-green-400">
                    {formatCurrency(calculos.pagoInicial)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 text-sm">
                  <span className="text-gray-400">Deuda Restante:</span>
                  <span
                    className={cn(
                      'font-bold',
                      calculos.deuda > 0 ? 'text-red-400' : 'text-green-400',
                    )}
                  >
                    {formatCurrency(calculos.deuda)}
                  </span>
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Notas (opcional)</label>
                <textarea
                  {...form.register('notas')}
                  rows={2}
                  placeholder="Notas adicionales..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-blue-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ModalFooter>
          {step > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Anterior
            </Button>
          )}

          {step < steps.length - 1 ? (
            <Button type="button" onClick={handleNext} icon={<ArrowRight className="h-4 w-4" />}>
              Siguiente
            </Button>
          ) : (
            <Button
              type="button"
              isLoading={isPending}
              icon={<Check className="h-4 w-4" />}
              onClick={async () => {
                logger.info('🔵 Click en Crear Orden - iniciando proceso', {
                  context: 'OrdenCompraModal',
                  values: form.getValues(),
                })

                // Validar formulario primero
                const isValid = await form.trigger()

                if (!isValid) {
                  logger.error('❌ Formulario inválido', {
                    context: 'OrdenCompraModal',
                    errors: form.formState.errors,
                  })

                  // Mostrar errores de forma descriptiva
                  const errorEntries = Object.entries(form.formState.errors) as [
                    string,
                    { message?: string },
                  ][]
                  if (errorEntries.length > 0) {
                    const firstEntry = errorEntries[0]
                    if (firstEntry) {
                      const [field, error] = firstEntry
                      const message = error?.message || 'Campo inválido'
                      toast.error('Formulario incompleto', {
                        description: `${field}: ${message}`,
                      })
                    }
                  } else {
                    toast.error('Formulario incompleto', {
                      description: 'Por favor revisa los campos',
                    })
                  }
                  return
                }

                // Si es válido, ejecutar el submit con los datos del formulario
                const formData = form.getValues()
                await onFormSubmit(formData)
              }}
            >
              Crear Orden
            </Button>
          )}
        </ModalFooter>
      </form>
    </Modal>
  )
}
