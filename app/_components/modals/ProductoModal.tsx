'use client'

import { createProducto, updateProducto } from '@/app/_actions/almacen'
import { CreateProductoInput, CreateProductoSchema } from '@/app/_actions/types'
import { useChronosStore } from '@/app/lib/store'
import { logger } from '@/app/lib/utils/logger'
import { zodResolver } from '@hookform/resolvers/zod'
import { DollarSign, MapPin, Package, Save } from 'lucide-react'
import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Modal, ModalFooter } from '../ui/Modal'
import { QuantumButton, QuantumGlassCard, QuantumInput } from '../ui/QuantumElevatedUI'

interface ProductoModalProps {
  isOpen: boolean
  onClose: () => void
  productoId?: string
  mode?: 'create' | 'edit'
}

export function ProductoModal({
  isOpen,
  onClose,
  productoId,
  mode = 'create',
}: ProductoModalProps) {
  const [isPending, startTransition] = useTransition()
  const { productos, crearProducto, actualizarProducto } = useChronosStore()

  const producto = productoId ? productos.find((p) => p.id === productoId) : null

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(CreateProductoSchema),
    defaultValues:
      mode === 'edit' && producto
        ? {
            nombre: producto.nombre,
            cantidad: producto.stockActual ?? 0,
            precioCompra: producto.precioCompra,
            precioVenta: producto.precioVenta,
            minimo: producto.stockMinimo ?? 10,
            ubicacion: producto.ubicacion || '',
          }
        : {
            cantidad: 0,
            precioCompra: 0,
            precioVenta: 0,
            minimo: 10,
            ubicacion: 'A-01',
          },
  })

  useEffect(() => {
    if (mode === 'edit' && producto) {
      reset({
        nombre: producto.nombre,
        cantidad: producto.stockActual ?? 0,
        precioCompra: producto.precioCompra,
        precioVenta: producto.precioVenta,
        minimo: producto.stockMinimo ?? 10,
        ubicacion: producto.ubicacion || '',
      })
    }
  }, [producto, mode, reset])

  const onSubmit = (data: CreateProductoInput) => {
    // ═══ PRE-SUBMIT VALIDATION ROBUSTO ═══
    if (!data.nombre || data.nombre.trim().length < 2) {
      toast.error('Nombre inválido', {
        description: 'El nombre del producto debe tener al menos 2 caracteres',
      })
      return
    }

    if (data.precioCompra <= 0) {
      toast.error('Precio de compra inválido', {
        description: 'El precio de compra debe ser mayor a 0',
      })
      return
    }

    if (data.precioVenta <= 0) {
      toast.error('Precio de venta inválido', {
        description: 'El precio de venta debe ser mayor a 0',
      })
      return
    }

    if (data.precioVenta <= data.precioCompra) {
      toast.error('Margen negativo', {
        description: 'El precio de venta debe ser mayor al precio de compra',
      })
      return
    }

    logger.info(`🚀 Iniciando ${mode === 'edit' ? 'actualización' : 'creación'} de producto`, {
      context: 'ProductoModal',
      data: { nombre: data.nombre, mode },
    })

    startTransition(async () => {
      try {
        if (mode === 'edit' && productoId) {
          // Actualizar via Server Action
          const result = await updateProducto({
            id: productoId,
            ...data,
          })

          if (result.error) {
            throw new Error(result.error)
          }

          // También actualizar store local
          actualizarProducto(productoId, {
            nombre: data.nombre,
            stockActual: data.cantidad,
            precioCompra: data.precioCompra,
            precioVenta: data.precioVenta,
            stockMinimo: data.minimo,
            ubicacion: data.ubicacion,
          })

          toast.success('Producto actualizado correctamente')
          logger.info('Producto actualizado', {
            context: 'ProductoModal',
            data: { id: productoId },
          })
        } else {
          // Crear via Server Action
          const result = await createProducto(data)

          if (result.error) {
            throw new Error(result.error)
          }

          if (!result.success || !result.data?.id) {
            throw new Error('Error desconocido al crear producto')
          }

          // También crear en store local (el ID se genera internamente)
          crearProducto({
            nombre: data.nombre,
            precioCompra: data.precioCompra,
            precioVenta: data.precioVenta,
            stockActual: data.cantidad,
            stockMinimo: data.minimo ?? 0,
            ubicacion: data.ubicacion,
            valorUnitario: data.precioCompra,
            totalEntradas: 0,
            totalSalidas: 0,
            keywords: [],
            activo: true,
          })

          toast.success('Producto creado correctamente')
          logger.info('Producto creado', { context: 'ProductoModal', data })
        }
        onClose()
        reset()
      } catch (error) {
        toast.error(`Error al ${mode === 'edit' ? 'actualizar' : 'crear'} producto`)
        logger.error('Error con producto', error as Error, { context: 'ProductoModal' })
      }
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6 p-6">
        <QuantumGlassCard variant="elevated">
          <div className="mb-4 flex items-center gap-3">
            <Package className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Información del Producto</h3>
          </div>

          <div className="space-y-4">
            <QuantumInput
              label="Nombre"
              placeholder="Nombre del producto"
              error={errors.nombre?.message}
              icon={<Package className="h-4 w-4" />}
              {...register('nombre')}
            />

            <div className="grid grid-cols-2 gap-4">
              <QuantumInput
                label="Stock Actual"
                type="number"
                step="1"
                error={errors.cantidad?.message}
                {...register('cantidad', { valueAsNumber: true })}
              />

              <QuantumInput
                label="Stock Mínimo"
                type="number"
                step="1"
                error={errors.minimo?.message}
                {...register('minimo', { valueAsNumber: true })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <QuantumInput
                label="Precio Compra"
                type="number"
                step="0.01"
                error={errors.precioCompra?.message}
                icon={<DollarSign className="h-4 w-4" />}
                {...register('precioCompra', { valueAsNumber: true })}
              />

              <QuantumInput
                label="Precio Venta"
                type="number"
                step="0.01"
                error={errors.precioVenta?.message}
                icon={<DollarSign className="h-4 w-4" />}
                {...register('precioVenta', { valueAsNumber: true })}
              />
            </div>

            <QuantumInput
              label="Ubicación"
              placeholder="Ej: A-01"
              error={errors.ubicacion?.message}
              icon={<MapPin className="h-4 w-4" />}
              {...register('ubicacion')}
            />
          </div>
        </QuantumGlassCard>

        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/5 px-6 py-3 font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white"
          >
            Cancelar
          </button>
          <QuantumButton type="submit" loading={isPending} icon={<Save className="h-4 w-4" />}>
            {mode === 'edit' ? 'Guardar Cambios' : 'Crear Producto'}
          </QuantumButton>
        </ModalFooter>
      </form>
    </Modal>
  )
}
