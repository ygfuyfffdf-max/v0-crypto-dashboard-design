'use client'

// ═══════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — MODAL VENTA iOS PREMIUM
// Wizard 4 pasos con distribución GYA automática - Diseño iOS glassmorphism
// ═══════════════════════════════════════════════════════════════════════════

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { useChronosStore, type CrearVentaInput } from '@/app/lib/store'
import { logger } from '@/app/lib/utils/logger'
import { useQueryClient } from '@tanstack/react-query'
import type { Cliente } from '@/app/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'motion/react'
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    DollarSign,
    Package,
    PiggyBank,
    Sparkles,
    Truck,
    User,
} from 'lucide-react'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { iOSModal, iOSButton, iOSGlassCard, iOSInput, iOSSelect, iOSProgress, iOSPill } from '../ui/ios'
import { Modal, ModalFooter } from '../ui/Modal'
import {
    QuantumButton,
    QuantumGlassCard,
    QuantumInput,
    QuantumSelect,
} from '../ui/QuantumElevatedUI'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

const VentaSchema = z.object({
  clienteId: z.string().optional(),
  nuevoCliente: z
    .object({
      nombre: z.string().min(2, 'Nombre requerido'),
      telefono: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
    })
    .optional(),
  cantidad: z.number().min(1, 'Cantidad mínima: 1'),
  precioVentaUnidad: z.number().min(0.01, 'Precio venta requerido'),
  precioCompraUnidad: z.number().min(0.01, 'Precio compra requerido'),
  precioFlete: z.number().min(0),
  estadoPago: z.enum(['pendiente', 'parcial', 'completo']),
  montoPagado: z.number().min(0).optional(),
  observaciones: z.string().optional(),
})

type VentaFormData = z.infer<typeof VentaSchema>

// ═══════════════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════════════

interface VentaModalProps {
  isOpen: boolean
  onClose: () => void
  ocRelacionada?: string // ID de la OC para tomar precioCompra
}

// ═══════════════════════════════════════════════════════════════════════════
// DISTRIBUTION VISUALIZATION
// ═══════════════════════════════════════════════════════════════════════════

function GYADistribution({
  bovedaMonte,
  fletes,
  utilidades,
}: {
  bovedaMonte: number
  fletes: number
  utilidades: number
}) {
  const total = bovedaMonte + fletes + utilidades

  const items = [
    { name: 'Bóveda Monte', value: bovedaMonte, color: '#3B82F6', icon: Building2 },
    { name: 'Fletes', value: fletes, color: '#ec4899', icon: Truck },
    { name: 'Utilidades', value: utilidades, color: '#22C55E', icon: PiggyBank },
  ]

  return (
    <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-4">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-400">
        <Sparkles className="h-4 w-4 text-violet-400" />
        Distribución GYA Automática
      </h4>

      <div className="space-y-3">
        {items.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0
          const Icon = item.icon

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-1"
            >
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-300">
                  <Icon className="h-4 w-4" style={{ color: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-white">{formatCurrency(item.value)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-3 flex justify-between border-t border-white/10 pt-3">
        <span className="text-sm text-gray-400">Total:</span>
        <span className="text-lg font-bold text-violet-400">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function VentaModal({ isOpen, onClose, ocRelacionada: ocRelacionadaProp }: VentaModalProps) {
  const [step, setStep] = useState(0)
  const [isNewCliente, setIsNewCliente] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [ocSeleccionadaId, setOcSeleccionadaId] = useState<string | undefined>(ocRelacionadaProp)
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<string | undefined>(
    undefined,
  )

  // ═══════════════════════════════════════════════════════════════════════
  // CARGAR CLIENTES DESDE API (no Zustand)
  // ═══════════════════════════════════════════════════════════════════════
  const [clientesAPI, setClientesAPI] = useState<Cliente[]>([])
  const [loadingClientes, setLoadingClientes] = useState(false)

  useEffect(() => {
    if (isOpen && clientesAPI.length === 0) {
      setLoadingClientes(true)
      fetch('/api/clientes')
        .then((r) => r.json())
        .then((response) => {
          const data = Array.isArray(response) ? response : (response.data || [])
          if (Array.isArray(data)) {
            setClientesAPI(data)
            logger.info('Clientes cargados desde API', {
              context: 'VentaModal',
              count: data.length,
            })
          } else {
            logger.error('API clientes no devolvió un array', response, { context: 'VentaModal' })
            setClientesAPI([])
          }
        })
        .catch((err) => {
          logger.error('Error cargando clientes', err, { context: 'VentaModal' })
          setClientesAPI([])
        })
        .finally(() => setLoadingClientes(false))
    }
  }, [isOpen, clientesAPI.length])

  // ═══════════════════════════════════════════════════════════════════════
  // CARGAR PRODUCTOS DESDE API (no Zustand)
  // ═══════════════════════════════════════════════════════════════════════
  interface ProductoAlmacen {
    id: string
    nombre: string
    cantidad: number
    precioUnitario: number
    minimo: number
  }
  const [productosAPI, setProductosAPI] = useState<ProductoAlmacen[]>([])
  const [loadingProductos, setLoadingProductos] = useState(false)

  useEffect(() => {
    if (isOpen && productosAPI.length === 0) {
      setLoadingProductos(true)
      fetch('/api/almacen')
        .then((r) => r.json())
        .then((response) => {
          const data = Array.isArray(response) ? response : (response.data || [])
          if (Array.isArray(data)) {
            setProductosAPI(data)
            logger.info('Productos cargados desde API', {
              context: 'VentaModal',
              count: data.length,
            })
          } else {
            logger.error('API almacen no devolvió un array', response, { context: 'VentaModal' })
            setProductosAPI([])
          }
        })
        .catch((err) => {
          logger.error('Error cargando productos', err, { context: 'VentaModal' })
          setProductosAPI([])
        })
        .finally(() => setLoadingProductos(false))
    }
  }, [isOpen, productosAPI.length])

  // Producto seleccionado para mostrar stock y precio sugerido
  const productoData = useMemo(() => {
    return productoSeleccionadoId ? productosAPI.find((p) => p.id === productoSeleccionadoId) : null
  }, [productoSeleccionadoId, productosAPI])

  const stockProductoDisponible = productoData?.cantidad ?? 0

  // Usar clientes de API en lugar de Zustand
  const clientes = clientesAPI

  // Zustand store - solo para crear (sync local)
  const { crearVenta, crearCliente } = useChronosStore()
  const queryClient = useQueryClient()

  // ═══════════════════════════════════════════════════════════════════════
  // CARGAR ÓRDENES DE COMPRA DESDE API (para trazabilidad completa)
  // ═══════════════════════════════════════════════════════════════════════
  interface OrdenCompraAPI {
    id: string
    distribuidorId: string
    productoId?: string | null
    producto: string
    cantidad: number
    stockActual: number
    precioUnitario: number
    fleteUnitario: number
    costoUnitarioTotal: number
    total: number
    estado: string
    distribuidor?: {
      id: string
      nombre: string
      empresa?: string
    } | null
  }

  const [ordenesCompraAPI, setOrdenesCompraAPI] = useState<OrdenCompraAPI[]>([])
  const [loadingOrdenes, setLoadingOrdenes] = useState(false)

  useEffect(() => {
    if (isOpen && ordenesCompraAPI.length === 0) {
      setLoadingOrdenes(true)
      fetch('/api/ordenes')
        .then((r) => r.json())
        .then((response) => {
          const data = Array.isArray(response) ? response : (response.data || [])
          if (Array.isArray(data)) {
            setOrdenesCompraAPI(data)
            logger.info('Órdenes de compra cargadas desde API', {
              context: 'VentaModal',
              count: data.length,
            })
          } else {
            logger.error('API ordenes no devolvió un array', response, { context: 'VentaModal' })
            setOrdenesCompraAPI([])
          }
        })
        .catch((err) => {
          logger.error('Error cargando órdenes de compra', err, { context: 'VentaModal' })
          setOrdenesCompraAPI([])
        })
        .finally(() => setLoadingOrdenes(false))
    }
  }, [isOpen, ordenesCompraAPI.length])

  // ═══════════════════════════════════════════════════════════════════════
  // ÓRDENES DE COMPRA CON STOCK DISPONIBLE (para trazabilidad)
  // Mostrar todas las OCs que tienen cantidad inicial > 0
  // El stockActual puede ser 0 si no se ha inicializado aún
  // ═══════════════════════════════════════════════════════════════════════
  const ordenesConStock = useMemo(
    () =>
      ordenesCompraAPI.filter((oc) => {
        // Mostrar si tiene stock disponible O si tiene cantidad inicial (no vendida aún)
        const stockActual = oc.stockActual ?? 0
        const cantidadInicial = oc.cantidad ?? 0
        return stockActual > 0 || cantidadInicial > 0
      }),
    [ordenesCompraAPI],
  )

  // Función para actualizar stock de OCs que no tienen stockActual inicializado
  const handleFixStock = async () => {
    try {
      const response = await fetch('/api/ordenes/fix-stock', { method: 'POST' })
      if (response.ok) {
        toast.success('Stock de órdenes actualizado correctamente')
        // Recargar órdenes
        const ordenesResponse = await fetch('/api/ordenes')
        if (ordenesResponse.ok) {
          const data = await ordenesResponse.json()
          if (Array.isArray(data)) {
            setOrdenesCompraAPI(data)
          }
        }
      } else {
        toast.error('Error al actualizar stock')
      }
    } catch (error) {
      logger.error('Error actualizando stock', error, { context: 'VentaModal' })
      toast.error('Error al actualizar stock')
    }
  }

  // OC relacionada para tomar precioCompra y stock
  const ocData = useMemo(() => {
    const id = ocSeleccionadaId || ocRelacionadaProp
    return id ? ordenesCompraAPI.find((o) => o.id === id) : null
  }, [ocSeleccionadaId, ocRelacionadaProp, ordenesCompraAPI])

  // Stock disponible: usar stockActual si > 0, sino usar cantidad inicial
  const stockDisponible = useMemo(() => {
    if (!ocData) return 0
    const stockActual = ocData.stockActual ?? 0
    const cantidadInicial = ocData.cantidad ?? 0
    return stockActual > 0 ? stockActual : cantidadInicial
  }, [ocData])

  const steps = ['Cliente', 'Origen', 'Precios', 'Confirmar']

  const form = useForm<VentaFormData>({
    resolver: zodResolver(VentaSchema),
    defaultValues: {
      cantidad: 1,
      precioVentaUnidad: 0,
      precioCompraUnidad: 0,
      precioFlete: 500,
      estadoPago: 'pendiente',
      montoPagado: 0,
    },
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SINCRONIZAR PRECIO DE COMPRA CUANDO CAMBIA LA OC SELECCIONADA
  // ═══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (ocData) {
      const precioCompra = ocData.costoUnitarioTotal || ocData.precioUnitario || 0
      form.setValue('precioCompraUnidad', precioCompra, { shouldValidate: true })
      logger.info('Precio de compra sincronizado desde OC', {
        context: 'VentaModal',
        ocId: ocData.id,
        precioCompra,
      })
    }
  }, [ocData, form])

  const watchedValues = form.watch()

  // ═══════════════════════════════════════════════════════════════════════
  // CÁLCULOS GYA
  // ═══════════════════════════════════════════════════════════════════════

  const calculos = useMemo(() => {
    const cantidad = watchedValues.cantidad || 0
    const precioVenta = watchedValues.precioVentaUnidad || 0
    const precioCompra = watchedValues.precioCompraUnidad || 0
    const flete = watchedValues.precioFlete || 0

    // ═══════════════════════════════════════════════════════════════════════
    // LÓGICA SAGRADA: El cliente paga precioVenta × cantidad
    // El flete es un COSTO INTERNO, NO se cobra adicional
    // Ejemplo: $10,000 × 10 = $100,000 (el cliente paga esto)
    // ═══════════════════════════════════════════════════════════════════════
    const precioTotalVenta = precioVenta * cantidad // Lo que PAGA el cliente
    const montoBovedaMonte = precioCompra * cantidad
    const montoFletes = flete * cantidad
    const montoUtilidades = (precioVenta - precioCompra - flete) * cantidad

    let montoPagadoReal = 0
    if (watchedValues.estadoPago === 'completo') {
      montoPagadoReal = precioTotalVenta
    } else if (watchedValues.estadoPago === 'parcial') {
      montoPagadoReal = watchedValues.montoPagado || 0
    }

    const montoRestante = precioTotalVenta - montoPagadoReal
    const proporcion = precioTotalVenta > 0 ? montoPagadoReal / precioTotalVenta : 0

    return {
      precioTotalVenta,
      montoBovedaMonte,
      montoFletes,
      montoUtilidades,
      montoPagadoReal,
      montoRestante,
      proporcion,
      capitalBovedaMonte: montoBovedaMonte * proporcion,
      capitalFletes: montoFletes * proporcion,
      capitalUtilidades: montoUtilidades * proporcion,
      margenPorcentaje:
        precioVenta > 0 ? ((precioVenta - precioCompra - flete) / precioVenta) * 100 : 0,
    }
  }, [watchedValues])

  const handleNext = async () => {
    let isValid = true

    if (step === 0) {
      if (isNewCliente) {
        isValid = await form.trigger('nuevoCliente')
      } else {
        isValid = !!watchedValues.clienteId
        if (!isValid) {
          toast.error('Debes seleccionar un cliente')
        }
      }
    } else if (step === 1) {
      // Validar que se haya seleccionado una OC (obligatorio para trazabilidad)
      if (!ocSeleccionadaId) {
        toast.error('Debes seleccionar una orden de compra para trazabilidad')
        isValid = false
      } else {
        // Validar cantidad Y stock disponible de la OC
        isValid = await form.trigger('cantidad')
        const cantidad = watchedValues.cantidad || 0

        if (cantidad > stockDisponible) {
          toast.error(
            `Stock insuficiente en OC. Disponible: ${stockDisponible}, solicitado: ${cantidad}`,
          )
          isValid = false
        } else if (stockDisponible === 0) {
          toast.error('Esta orden de compra no tiene stock disponible')
          isValid = false
        }
      }
    } else if (step === 2) {
      isValid = await form.trigger([
        'precioVentaUnidad',
        'precioCompraUnidad',
        'precioFlete',
        'estadoPago',
      ])
      if (watchedValues.estadoPago === 'parcial') {
        isValid = isValid && (watchedValues.montoPagado || 0) > 0
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
    setOcSeleccionadaId(undefined)
    setProductoSeleccionadoId(undefined)
    setIsNewCliente(false)
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    // ═══════════════════════════════════════════════════════════════════
    // VALIDACIÓN PRE-SUBMIT: Asegurar datos válidos antes de enviar
    // ═══════════════════════════════════════════════════════════════════

    // Validar cliente
    const clienteIdFinal = isNewCliente ? undefined : data.clienteId
    const clienteNombreFinal = isNewCliente ? data.nuevoCliente?.nombre : undefined

    if (!clienteIdFinal && !clienteNombreFinal) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar un cliente existente o crear uno nuevo',
      })
      setStep(0)
      return
    }

    // Validar OC (obligatoria para trazabilidad)
    const ocParaVenta = ocSeleccionadaId || ocRelacionadaProp
    if (!ocParaVenta) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar una orden de compra para trazabilidad',
      })
      setStep(1)
      return
    }

    // Validar que hay stock disponible
    if (ocData && data.cantidad > (ocData.stockActual || 0)) {
      toast.error('Error de validación', {
        description: `Stock insuficiente. Disponible: ${ocData.stockActual || 0}`,
      })
      setStep(1)
      return
    }

    // Validar margen positivo
    const gananciaUnidad = data.precioVentaUnidad - data.precioCompraUnidad - data.precioFlete
    if (gananciaUnidad <= 0) {
      toast.error('Error de validación', {
        description: 'El precio de venta debe ser mayor al costo + flete',
      })
      setStep(2)
      return
    }

    logger.info('🚀 Iniciando creación de venta', {
      context: 'VentaModal',
      data: {
        clienteId: clienteIdFinal,
        nuevoCliente: clienteNombreFinal,
        ocId: ocParaVenta,
        cantidad: data.cantidad,
        precioVenta: data.precioVentaUnidad,
        precioCompra: data.precioCompraUnidad,
        estadoPago: data.estadoPago,
      },
    })

    startTransition(async () => {
      try {
        // Crear cliente si es nuevo
        let clienteId = data.clienteId
        let clienteNombre = ''

        if (isNewCliente && data.nuevoCliente) {
          // Primero crear en la API
          const clienteResponse = await fetch('/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: data.nuevoCliente.nombre,
              telefono: data.nuevoCliente.telefono || '',
              email: data.nuevoCliente.email || '',
            }),
          })

          if (!clienteResponse.ok) {
            throw new Error('Error al crear cliente')
          }

          const clienteData = await clienteResponse.json()
          clienteId = clienteData.clienteId
          clienteNombre = data.nuevoCliente.nombre

          // También crear en Zustand para UI inmediata
          crearCliente({
            nombre: data.nuevoCliente.nombre,
            telefono: data.nuevoCliente.telefono || '',
            email: data.nuevoCliente.email || '',
            direccion: '',
            actual: 0,
            deuda: 0,
            abonos: 0,
            pendiente: 0,
            totalVentas: 0,
            totalPagado: 0,
            deudaTotal: 0,
            numeroCompras: 0,
            keywords: [data.nuevoCliente.nombre.toLowerCase()],
            estado: 'activo',
          } as Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>)
        } else {
          const cliente = clientes.find((c) => c.id === clienteId)
          clienteNombre = cliente?.nombre || 'Cliente'
        }

        // Determinar monto pagado
        let montoPagado = 0
        if (data.estadoPago === 'completo') {
          montoPagado = calculos.precioTotalVenta
        } else if (data.estadoPago === 'parcial') {
          montoPagado = data.montoPagado || 0
        }

        // ═══════════════════════════════════════════════════════════════════
        // PERSISTIR EN API (Turso/Drizzle) con distribución GYA automática
        // ocRelacionada usa la OC seleccionada en el wizard (trazabilidad OBLIGATORIA)
        // productoId viene de la OC o del selector de productos
        // ═══════════════════════════════════════════════════════════════════

        // La OC es obligatoria - ya validada en el wizard
        const ocParaVenta = ocSeleccionadaId || ocRelacionadaProp
        if (!ocParaVenta) {
          throw new Error('Debes seleccionar una orden de compra')
        }

        // El productoId viene del selector de productos o de la OC (si tiene productoId asignado)
        const productoParaVenta = productoSeleccionadoId || ocData?.productoId || null

        const ventaResponse = await fetch('/api/ventas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clienteId: clienteId || '',
            productoId: productoParaVenta,
            cantidad: data.cantidad,
            precioVentaUnidad: data.precioVentaUnidad,
            precioCompraUnidad: data.precioCompraUnidad,
            precioFlete: data.precioFlete,
            montoPagado,
            observaciones: data.observaciones,
            ocRelacionada: ocParaVenta,
          }),
        })

        if (!ventaResponse.ok) {
          const errorData = await ventaResponse.json()
          logger.error('Respuesta de error del servidor', errorData, {
            context: 'VentaModal',
            status: ventaResponse.status,
          })
          throw new Error(errorData.detalle || errorData.error || 'Error al crear venta')
        }

        const ventaData = await ventaResponse.json()

        // También crear en Zustand para UI inmediata
        const ventaInput: CrearVentaInput = {
          cliente: clienteNombre,
          clienteId: clienteId || '',
          cantidad: data.cantidad,
          precioVenta: data.precioVentaUnidad,
          precioCompra: data.precioCompraUnidad,
          flete: data.precioFlete > 0 ? 'Aplica' : 'NoAplica',
          fleteUtilidad: data.precioFlete * data.cantidad,
          ocRelacionada: ocParaVenta,
          estadoPago: data.estadoPago,
          estatus:
            data.estadoPago === 'completo'
              ? 'Pagado'
              : data.estadoPago === 'parcial'
                ? 'Parcial'
                : 'Pendiente',
          montoPagado,
          montoRestante: calculos.montoRestante,
          fecha: new Date().toISOString().split('T')[0] ?? '',
          notas: data.observaciones ?? '',
        }

        crearVenta(ventaInput)

        toast.success('Venta registrada exitosamente', {
          description: `${data.cantidad} unidades de ${ocData?.producto || 'producto'} por ${formatCurrency(calculos.precioTotalVenta)} - Trazabilidad vinculada`,
        })

        // Invalidar todas las queries relacionadas para actualizar UI
        queryClient.invalidateQueries({ queryKey: ['ventas'] })
        queryClient.invalidateQueries({ queryKey: ['ordenesCompra'] })
        queryClient.invalidateQueries({ queryKey: ['clientes'] })
        queryClient.invalidateQueries({ queryKey: ['almacen'] })
        queryClient.invalidateQueries({ queryKey: ['bancos'] })
        queryClient.invalidateQueries({ queryKey: ['movimientos'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })

        handleReset()
        onClose()
      } catch (error) {
        logger.error('Error al registrar venta', error, {
          context: 'VentaModal',
          datos: {
            cantidad: data.cantidad,
            precioVentaUnidad: data.precioVentaUnidad,
            estadoPago: data.estadoPago,
          },
        })
        toast.error('Error al registrar venta', {
          description: error instanceof Error ? error.message : 'Intenta de nuevo',
        })
      }
    })
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Venta"
      subtitle="Registra venta con distribución automática a 3 bancos"
      size="lg"
    >
      {/* Step indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {steps.map((stepName, index) => (
          <div key={stepName} className="flex items-center">
            <motion.div
              animate={{
                scale: index === step ? 1.1 : 1,
                backgroundColor: index <= step ? '#22C55E' : 'rgba(255,255,255,0.1)',
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
                  index < step ? 'bg-green-500' : 'bg-white/10',
                )}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {/* Step 0: Cliente */}
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
                  onClick={() => setIsNewCliente(false)}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    !isNewCliente ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white',
                  )}
                >
                  Existente
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewCliente(true)}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    isNewCliente ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white',
                  )}
                >
                  Nuevo
                </button>
              </div>

              {!isNewCliente ? (
                <QuantumSelect
                  label="Seleccionar Cliente"
                  placeholder="Seleccionar cliente..."
                  value={watchedValues.clienteId}
                  onChange={(val) => form.setValue('clienteId', val)}
                  options={(clientes || []).map((c) => ({
                    value: c.id,
                    label: `${c.nombre}${(c.deuda || 0) > 0 ? ` (Deuda: ${formatCurrency(c.deuda || 0)})` : ''}`,
                    icon: <User className="h-4 w-4 text-violet-400" />,
                  }))}
                />
              ) : (
                <div className="space-y-3">
                  <QuantumInput
                    {...form.register('nuevoCliente.nombre')}
                    label="Nombre"
                    placeholder="Nombre completo"
                    required
                    variant="violet"
                    icon={<User className="h-4 w-4" />}
                    error={form.formState.errors.nuevoCliente?.nombre?.message}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <QuantumInput
                      {...form.register('nuevoCliente.telefono')}
                      label="Teléfono"
                      placeholder="+52 555 123 4567"
                      variant="violet"
                    />
                    <QuantumInput
                      {...form.register('nuevoCliente.email')}
                      type="email"
                      label="Email"
                      placeholder="email@ejemplo.com"
                      variant="violet"
                      error={form.formState.errors.nuevoCliente?.email?.message}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 1: Orden de Compra y Producto (Trazabilidad OBLIGATORIA) */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-4"
            >
              {/* ═══════════════════════════════════════════════════════════════
                  SELECTOR DE ORDEN DE COMPRA - OBLIGATORIO
                  Para trazabilidad completa: de qué lote viene la venta
              ═══════════════════════════════════════════════════════════════ */}
              <QuantumSelect
                label="Orden de Compra (Origen del Producto) *"
                placeholder={
                  loadingOrdenes ? 'Cargando órdenes...' : 'Seleccionar orden de compra...'
                }
                value={ocSeleccionadaId || ''}
                onChange={(val) => {
                  setOcSeleccionadaId(val)
                  // Auto-llenar precios desde la OC
                  const oc = ordenesCompraAPI.find((o) => o.id === val)
                  if (oc) {
                    form.setValue(
                      'precioCompraUnidad',
                      oc.costoUnitarioTotal || oc.precioUnitario || 0,
                    )
                    // Limitar cantidad al stock disponible (usar cantidad inicial si stockActual es 0)
                    const stockActual = oc.stockActual ?? 0
                    const cantidadInicial = oc.cantidad ?? 0
                    const stockDisponible = stockActual > 0 ? stockActual : cantidadInicial
                    const cantidadActual = form.getValues('cantidad') || 0

                    if (stockDisponible > 0 && cantidadActual > stockDisponible) {
                      form.setValue('cantidad', stockDisponible)
                    } else if (stockDisponible === 0) {
                      form.setValue('cantidad', 0)
                      toast.warning('Esta orden no tiene stock disponible')
                    }
                  }
                }}
                options={ordenesConStock.map((oc) => {
                  const stockActual = oc.stockActual ?? 0
                  const cantidad = oc.cantidad ?? 0
                  const stockLabel =
                    stockActual !== cantidad && stockActual === 0
                      ? `${cantidad} uds (inicial)`
                      : `${stockActual} uds`
                  return {
                    value: oc.id,
                    label: `${oc.producto || 'Producto'} - ${stockLabel} @ ${formatCurrency(oc.costoUnitarioTotal || oc.precioUnitario || 0)}/u${oc.distribuidor?.nombre ? ` (${oc.distribuidor.nombre})` : ''}`,
                    icon: <Package className="h-4 w-4 text-blue-400" />,
                  }
                })}
              />

              {/* Info de la OC seleccionada */}
              {ocData && (
                <QuantumGlassCard variant="frosted" padding="md">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Producto</p>
                      <p className="font-medium text-white">{ocData.producto || 'Sin nombre'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Stock Disponible</p>
                      {(ocData.stockActual ?? 0) === 0 && (ocData.cantidad ?? 0) > 0 ? (
                        <div>
                          <p className="font-bold text-yellow-400">
                            {ocData.cantidad} unidades (inicial)
                          </p>
                          <p className="text-xs text-yellow-400/70">⚠️ Actualizar BD</p>
                        </div>
                      ) : (
                        <p
                          className={`font-bold ${(ocData.stockActual ?? 0) > 0 ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {ocData.stockActual ?? 0} unidades
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Costo por Unidad</p>
                      <p className="font-medium text-blue-400">
                        {formatCurrency(ocData.costoUnitarioTotal || ocData.precioUnitario || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Distribuidor</p>
                      <p className="text-xs text-violet-400">
                        {ocData.distribuidor?.nombre || ocData.distribuidorId || 'N/A'}
                      </p>
                    </div>
                  </div>
                </QuantumGlassCard>
              )}

              {/* Selector de producto (opcional si hay productos separados) */}
              {productosAPI.length > 0 && (
                <QuantumSelect
                  label="Producto en Almacén (Opcional)"
                  placeholder={
                    loadingProductos ? 'Cargando productos...' : 'Vincular con producto...'
                  }
                  value={productoSeleccionadoId || ''}
                  onChange={(val) => {
                    setProductoSeleccionadoId(val)
                  }}
                  options={productosAPI
                    .filter((p) => p.cantidad > 0)
                    .map((p) => ({
                      value: p.id,
                      label: `${p.nombre} - ${p.cantidad} uds`,
                      icon: <Package className="h-4 w-4 text-violet-400" />,
                    }))}
                />
              )}

              <QuantumGlassCard variant="violet" padding="lg" enableGlow>
                <QuantumInput
                  type="number"
                  {...form.register('cantidad', { valueAsNumber: true })}
                  min={1}
                  max={stockDisponible > 0 ? stockDisponible : undefined}
                  label="Cantidad a Vender"
                  variant="gold"
                  className="text-center"
                  icon={<Package className="text-gold-400 h-5 w-5" />}
                  hint={ocData ? `Máximo: ${stockDisponible} unidades` : undefined}
                />
              </QuantumGlassCard>

              {ordenesConStock.length === 0 && !loadingOrdenes && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="mb-3 text-sm text-amber-400">
                    ⚠️ No hay órdenes de compra con stock disponible. Crea primero una orden de
                    compra para poder registrar ventas con trazabilidad.
                  </p>
                  {ordenesCompraAPI.length > 0 && (
                    <QuantumButton type="button" variant="gold" size="sm" onClick={handleFixStock}>
                      🔧 Inicializar Stock de OCs Existentes
                    </QuantumButton>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Precios */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-4"
            >
              {/* Mostrar info de OC seleccionada */}
              {ocData && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                  <p className="text-xs text-blue-400">
                    📦 Vendiendo de:{' '}
                    <span className="font-bold">{ocData.producto || 'Producto'}</span> • Costo OC:{' '}
                    <span className="font-bold">
                      {formatCurrency(ocData.costoUnitarioTotal || ocData.precioUnitario || 0)}/u
                    </span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <QuantumInput
                  type="number"
                  {...form.register('precioVentaUnidad', { valueAsNumber: true })}
                  min={0}
                  step="0.01"
                  label="Precio Venta/Unidad *"
                  variant="gold"
                  icon={<DollarSign className="h-4 w-4" />}
                  hint="Precio al que vendes al cliente"
                />
                <QuantumInput
                  type="number"
                  value={watchedValues.precioCompraUnidad || 0}
                  readOnly
                  disabled
                  label="Precio Compra/Unidad (de OC)"
                  variant="violet"
                  icon={<DollarSign className="h-4 w-4" />}
                  hint="Definido por la orden de compra"
                />
              </div>

              <QuantumInput
                type="number"
                {...form.register('precioFlete', { valueAsNumber: true })}
                min={0}
                step="0.01"
                label="Flete por Unidad"
                variant="default"
                icon={<Truck className="h-4 w-4" />}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Estado de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['pendiente', 'parcial', 'completo'] as const).map((estado) => (
                    <QuantumButton
                      key={estado}
                      type="button"
                      variant={
                        watchedValues.estadoPago === estado
                          ? estado === 'completo'
                            ? 'gold'
                            : estado === 'parcial'
                              ? 'secondary'
                              : 'danger'
                          : 'ghost'
                      }
                      size="sm"
                      onClick={() => form.setValue('estadoPago', estado)}
                      enableRipple
                      fullWidth
                    >
                      {estado.charAt(0).toUpperCase() + estado.slice(1)}
                    </QuantumButton>
                  ))}
                </div>
              </div>

              {watchedValues.estadoPago === 'parcial' && (
                <QuantumInput
                  type="number"
                  {...form.register('montoPagado', { valueAsNumber: true })}
                  min={0}
                  max={calculos.precioTotalVenta}
                  label="Monto Pagado"
                  variant="gold"
                  icon={<DollarSign className="h-4 w-4" />}
                  hint={`Máximo: ${formatCurrency(calculos.precioTotalVenta)}`}
                />
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
              {/* Resumen con Trazabilidad */}
              <QuantumGlassCard variant="frosted" padding="lg" enableGlow>
                <div className="space-y-2">
                  {/* Trazabilidad */}
                  {ocData && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Origen (OC):</span>
                        <span className="font-medium text-blue-400">
                          {ocData.producto || 'Producto'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Distribuidor:</span>
                        <span className="font-medium text-violet-400">
                          {ocData.distribuidor?.nombre || 'N/A'}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cantidad:</span>
                    <span className="font-medium text-white">
                      {watchedValues.cantidad} unidades
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Venta:</span>
                    <span className="font-bold text-white">
                      {formatCurrency(calculos.precioTotalVenta)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Estado:</span>
                    <span
                      className={cn(
                        'font-medium capitalize',
                        watchedValues.estadoPago === 'completo'
                          ? 'text-green-400'
                          : watchedValues.estadoPago === 'parcial'
                            ? 'text-yellow-400'
                            : 'text-red-400',
                      )}
                    >
                      {watchedValues.estadoPago}
                    </span>
                  </div>
                  {watchedValues.estadoPago !== 'pendiente' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Pagado:</span>
                      <span className="font-medium text-green-400">
                        {formatCurrency(calculos.montoPagadoReal)}
                      </span>
                    </div>
                  )}
                  {calculos.montoRestante > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Restante:</span>
                      <span className="font-medium text-red-400">
                        {formatCurrency(calculos.montoRestante)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/10 pt-2 text-sm">
                    <span className="text-gray-400">Margen:</span>
                    <span className="font-medium text-violet-400">
                      {calculos.margenPorcentaje.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </QuantumGlassCard>

              {/* Distribución GYA */}
              <GYADistribution
                bovedaMonte={calculos.montoBovedaMonte}
                fletes={calculos.montoFletes}
                utilidades={calculos.montoUtilidades}
              />

              {/* Observaciones */}
              <QuantumInput
                {...form.register('observaciones')}
                label="Observaciones (opcional)"
                placeholder="Notas adicionales..."
                variant="default"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ModalFooter>
          {step > 0 && (
            <QuantumButton
              type="button"
              variant="ghost"
              onClick={handleBack}
              icon={<ArrowLeft className="h-4 w-4" />}
              enableMagnetic
              enableRipple
            >
              Anterior
            </QuantumButton>
          )}

          {step < steps.length - 1 ? (
            <QuantumButton
              type="button"
              variant="secondary"
              onClick={handleNext}
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
              enableMagnetic
              enableRipple
            >
              Siguiente
            </QuantumButton>
          ) : (
            <QuantumButton
              type="submit"
              variant="gold"
              loading={isPending}
              icon={<Check className="h-4 w-4" />}
              enableMagnetic
              enableRipple
            >
              Registrar Venta
            </QuantumButton>
          )}
        </ModalFooter>
      </form>
    </Modal>
  )
}
