'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📦 ALMACEN/PRODUCTO FORM PREMIUM — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Formulario completo de productos de almacén con:
 * - Gestión de stock (entradas/salidas)
 * - Precios de compra y venta
 * - Alertas de stock mínimo
 * - Categorización y SKU
 * - Cálculos automáticos de margen
 * - Diseño glassmorphism premium
 *
 * @version 3.0.0 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertTriangle,
  BarChart3,
  Box,
  CheckCircle,
  DollarSign,
  Hash,
  Package,
  Save,
  Tag,
  TrendingUp,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'

import {
  CalculationPanel,
  FormActions,
  FormCurrencyInput,
  FormGrid,
  FormInput,
  FormModal,
  FormSection,
  FormSelect,
  FormTextarea,
  SubmitButton,
  type CalculationItem,
  type SelectOption,
} from './CompleteForms'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const CATEGORIAS_PRODUCTO: SelectOption[] = [
  { value: 'electronica', label: 'Electrónica', icon: <Box className="h-4 w-4 text-blue-400" /> },
  { value: 'ropa', label: 'Ropa y Accesorios', icon: <Tag className="h-4 w-4 text-pink-400" /> },
  { value: 'hogar', label: 'Hogar', icon: <Box className="h-4 w-4 text-amber-400" /> },
  { value: 'alimentos', label: 'Alimentos', icon: <Box className="h-4 w-4 text-green-400" /> },
  { value: 'belleza', label: 'Belleza y Salud', icon: <Box className="h-4 w-4 text-purple-400" /> },
  { value: 'deportes', label: 'Deportes', icon: <Box className="h-4 w-4 text-orange-400" /> },
  { value: 'juguetes', label: 'Juguetes', icon: <Box className="h-4 w-4 text-red-400" /> },
  { value: 'otros', label: 'Otros', icon: <Box className="h-4 w-4 text-gray-400" /> },
]

const ESTADOS_STOCK: SelectOption[] = [
  { value: 'disponible', label: 'Disponible', description: 'Stock normal' },
  { value: 'bajo', label: 'Stock Bajo', description: 'Por debajo del mínimo' },
  { value: 'agotado', label: 'Agotado', description: 'Sin existencias' },
]

const CLASIFICACION_ABC: SelectOption[] = [
  { value: 'A', label: 'Clase A', description: 'Alta rotación, alta rentabilidad' },
  { value: 'B', label: 'Clase B', description: 'Rotación media' },
  { value: 'C', label: 'Clase C', description: 'Baja rotación' },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const AlmacenProductoFormSchema = z
  .object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
    descripcion: z.string().max(500, 'Máximo 500 caracteres').optional(),
    sku: z.string().max(50, 'Máximo 50 caracteres').optional(),
    categoria: z.string().optional(),

    // Stock
    cantidad: z.number().int('Debe ser un número entero').min(0, 'No puede ser negativo'),
    stockMinimo: z
      .number()
      .int('Debe ser un número entero')
      .min(0, 'No puede ser negativo')
      .optional(),
    stockMaximo: z
      .number()
      .int('Debe ser un número entero')
      .min(0, 'No puede ser negativo')
      .optional(),
    stockReservado: z
      .number()
      .int('Debe ser un número entero')
      .min(0, 'No puede ser negativo')
      .optional(),

    // Precios
    precioCompra: z.number().min(0, 'No puede ser negativo'),
    precioVenta: z.number().min(0, 'No puede ser negativo'),
    fletePromedio: z.number().min(0, 'No puede ser negativo').optional(),

    // Clasificación
    clasificacionABC: z.enum(['A', 'B', 'C']).optional(),
    estadoStock: z.enum(['disponible', 'bajo', 'agotado']).optional(),

    // Notas
    notas: z.string().max(500, 'Máximo 500 caracteres').optional(),
  })
  .refine(
    (data) => {
      if (data.precioVenta > 0 && data.precioCompra > 0) {
        return data.precioVenta > data.precioCompra
      }
      return true
    },
    {
      message: 'El precio de venta debe ser mayor al precio de compra',
      path: ['precioVenta'],
    },
  )
  .refine(
    (data) => {
      if (data.stockMaximo && data.stockMinimo) {
        return data.stockMaximo >= data.stockMinimo
      }
      return true
    },
    {
      message: 'El stock máximo debe ser mayor o igual al mínimo',
      path: ['stockMaximo'],
    },
  )

export type AlmacenProductoFormData = z.infer<typeof AlmacenProductoFormSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AlmacenProductoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AlmacenProductoFormData & { calculos: ProductoCalculations }) => Promise<void>
  initialData?: Partial<AlmacenProductoFormData>
  mode?: 'create' | 'edit'
}

interface ProductoCalculations {
  margenBruto: number
  margenPorcentaje: number
  gananciaPorUnidad: number
  valorInventario: number
  valorVentaPotencial: number
  gananciaPotencial: number
  estadoStockCalculado: 'disponible' | 'bajo' | 'agotado'
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function calcularProducto(data: Partial<AlmacenProductoFormData>): ProductoCalculations {
  const precioCompra = data.precioCompra || 0
  const precioVenta = data.precioVenta || 0
  const cantidad = data.cantidad || 0
  const stockMinimo = data.stockMinimo || 0
  const fletePromedio = data.fletePromedio || 0

  const costoTotal = precioCompra + fletePromedio
  const gananciaPorUnidad = precioVenta - costoTotal
  const margenBruto = gananciaPorUnidad
  const margenPorcentaje = precioVenta > 0 ? (gananciaPorUnidad / precioVenta) * 100 : 0

  const valorInventario = cantidad * costoTotal
  const valorVentaPotencial = cantidad * precioVenta
  const gananciaPotencial = cantidad * gananciaPorUnidad

  let estadoStockCalculado: 'disponible' | 'bajo' | 'agotado' = 'disponible'
  if (cantidad === 0) {
    estadoStockCalculado = 'agotado'
  } else if (stockMinimo > 0 && cantidad <= stockMinimo) {
    estadoStockCalculado = 'bajo'
  }

  return {
    margenBruto,
    margenPorcentaje,
    gananciaPorUnidad,
    valorInventario,
    valorVentaPotencial,
    gananciaPotencial,
    estadoStockCalculado,
  }
}

function generateSKU(nombre: string): string {
  const prefix = nombre
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 3)
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${suffix}`
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ALMACEN PRODUCTO FORM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AlmacenProductoFormPremium({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: AlmacenProductoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [calculations, setCalculations] = useState<ProductoCalculations>({
    margenBruto: 0,
    margenPorcentaje: 0,
    gananciaPorUnidad: 0,
    valorInventario: 0,
    valorVentaPotencial: 0,
    gananciaPotencial: 0,
    estadoStockCalculado: 'disponible',
  })

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<AlmacenProductoFormData>({
    resolver: zodResolver(AlmacenProductoFormSchema),
    defaultValues: {
      nombre: initialData?.nombre || '',
      descripcion: initialData?.descripcion || '',
      sku: initialData?.sku || '',
      categoria: initialData?.categoria || 'otros',
      cantidad: initialData?.cantidad || 0,
      stockMinimo: initialData?.stockMinimo || 5,
      stockMaximo: initialData?.stockMaximo || 100,
      stockReservado: initialData?.stockReservado || 0,
      precioCompra: initialData?.precioCompra || 0,
      precioVenta: initialData?.precioVenta || 0,
      fletePromedio: initialData?.fletePromedio || 0,
      clasificacionABC: initialData?.clasificacionABC || 'B',
      estadoStock: initialData?.estadoStock || 'disponible',
      notas: initialData?.notas || '',
    },
    mode: 'onChange',
  })

  const watchedValues = watch()

  // Update calculations when values change
  useEffect(() => {
    const newCalcs = calcularProducto(watchedValues)
    setCalculations(newCalcs)

    // Auto-update estado stock
    if (newCalcs.estadoStockCalculado !== watchedValues.estadoStock) {
      setValue('estadoStock', newCalcs.estadoStockCalculado)
    }
  }, [watchedValues, setValue])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        nombre: initialData?.nombre || '',
        descripcion: initialData?.descripcion || '',
        sku: initialData?.sku || '',
        categoria: initialData?.categoria || 'otros',
        cantidad: initialData?.cantidad || 0,
        stockMinimo: initialData?.stockMinimo || 5,
        stockMaximo: initialData?.stockMaximo || 100,
        stockReservado: initialData?.stockReservado || 0,
        precioCompra: initialData?.precioCompra || 0,
        precioVenta: initialData?.precioVenta || 0,
        fletePromedio: initialData?.fletePromedio || 0,
        clasificacionABC: initialData?.clasificacionABC || 'B',
        estadoStock: initialData?.estadoStock || 'disponible',
        notas: initialData?.notas || '',
      })
      setShowSuccess(false)
    }
  }, [isOpen, initialData, reset])

  // Auto-generate SKU
  const handleGenerateSKU = useCallback(() => {
    const nombre = watch('nombre')
    if (nombre) {
      setValue('sku', generateSKU(nombre))
    }
  }, [watch, setValue])

  const onFormSubmit = useCallback(
    async (data: AlmacenProductoFormData) => {
      setIsSubmitting(true)
      try {
        await onSubmit({ ...data, calculos: calculations })
        setShowSuccess(true)
        setTimeout(() => onClose(), 1000)
      } catch (error) {
        console.error('Error al guardar producto:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit, calculations, onClose],
  )

  // Calculation items for display
  const calculationItems: CalculationItem[] = useMemo(
    () => [
      { label: 'Precio Compra', value: watchedValues.precioCompra || 0 },
      { label: 'Flete Promedio', value: watchedValues.fletePromedio || 0 },
      {
        label: 'Costo Total/Unidad',
        value: (watchedValues.precioCompra || 0) + (watchedValues.fletePromedio || 0),
        highlight: true,
      },
      { label: 'Precio Venta', value: watchedValues.precioVenta || 0, color: 'info' as const },
      {
        label: 'Ganancia/Unidad',
        value: calculations.gananciaPorUnidad,
        color: calculations.gananciaPorUnidad > 0 ? ('success' as const) : ('error' as const),
      },
      {
        label: `Margen (${calculations.margenPorcentaje.toFixed(1)}%)`,
        value: calculations.margenBruto,
        highlight: true,
      },
    ],
    [watchedValues, calculations],
  )

  const inventoryItems: CalculationItem[] = useMemo(
    () => [
      {
        label: `Stock: ${watchedValues.cantidad || 0} unidades`,
        value: calculations.valorInventario,
        color: 'info' as const,
      },
      { label: 'Valor Venta Potencial', value: calculations.valorVentaPotencial },
      {
        label: 'Ganancia Potencial',
        value: calculations.gananciaPotencial,
        color: 'success' as const,
        highlight: true,
      },
    ],
    [watchedValues.cantidad, calculations],
  )

  const getStockColor = () => {
    if (calculations.estadoStockCalculado === 'agotado') return '#EF4444'
    if (calculations.estadoStockCalculado === 'bajo') return '#F59E0B'
    return '#10B981'
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
      subtitle="Gestiona los productos del almacén"
      icon={<Package className="h-5 w-5" />}
      size="xl"
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
              {mode === 'create' ? 'Producto Creado' : 'Producto Actualizado'}
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main Form */}
              <div className="space-y-6 lg:col-span-2">
                {/* Información Básica */}
                <FormSection
                  title="Información del Producto"
                  icon={<Package className="h-4 w-4" />}
                >
                  <Controller
                    name="nombre"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        {...field}
                        label="Nombre del Producto"
                        placeholder="iPhone 15 Pro Max 256GB"
                        required
                        error={errors.nombre?.message}
                        icon={<Package className="h-4 w-4" />}
                      />
                    )}
                  />

                  <FormGrid cols={2}>
                    <Controller
                      name="sku"
                      control={control}
                      render={({ field }) => (
                        <FormInput
                          {...field}
                          label="SKU / Código"
                          placeholder="IPH-15PM-256"
                          error={errors.sku?.message}
                          icon={<Hash className="h-4 w-4" />}
                          rightElement={
                            <button
                              type="button"
                              onClick={handleGenerateSKU}
                              className="rounded-lg bg-violet-500/20 px-2 py-1 text-xs font-medium text-violet-400 hover:bg-violet-500/30"
                            >
                              Generar
                            </button>
                          }
                        />
                      )}
                    />

                    <Controller
                      name="categoria"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          label="Categoría"
                          options={CATEGORIAS_PRODUCTO}
                          value={field.value || 'otros'}
                          onChange={field.onChange}
                          icon={<Tag className="h-4 w-4" />}
                        />
                      )}
                    />
                  </FormGrid>

                  <Controller
                    name="descripcion"
                    control={control}
                    render={({ field }) => (
                      <FormTextarea
                        {...field}
                        label="Descripción"
                        placeholder="Descripción detallada del producto..."
                        rows={2}
                        maxLength={500}
                        showCount
                      />
                    )}
                  />
                </FormSection>

                {/* Stock */}
                <FormSection title="Control de Inventario" icon={<Box className="h-4 w-4" />}>
                  <FormGrid cols={4}>
                    <Controller
                      name="cantidad"
                      control={control}
                      render={({ field }) => (
                        <FormInput
                          {...field}
                          type="number"
                          label="Stock Actual"
                          placeholder="0"
                          min={0}
                          required
                          error={errors.cantidad?.message}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      )}
                    />

                    <Controller
                      name="stockMinimo"
                      control={control}
                      render={({ field }) => (
                        <FormInput
                          {...field}
                          type="number"
                          label="Stock Mínimo"
                          placeholder="5"
                          min={0}
                          error={errors.stockMinimo?.message}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          helperText="Alerta de stock bajo"
                        />
                      )}
                    />

                    <Controller
                      name="stockMaximo"
                      control={control}
                      render={({ field }) => (
                        <FormInput
                          {...field}
                          type="number"
                          label="Stock Máximo"
                          placeholder="100"
                          min={0}
                          error={errors.stockMaximo?.message}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      )}
                    />

                    <Controller
                      name="stockReservado"
                      control={control}
                      render={({ field }) => (
                        <FormInput
                          {...field}
                          type="number"
                          label="Reservado"
                          placeholder="0"
                          min={0}
                          error={errors.stockReservado?.message}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          helperText="Vendido no entregado"
                        />
                      )}
                    />
                  </FormGrid>

                  {/* Estado de Stock */}
                  <motion.div
                    className="mt-3 flex items-center gap-3 rounded-xl border p-4"
                    animate={{
                      borderColor: `${getStockColor()}50`,
                      backgroundColor: `${getStockColor()}10`,
                    }}
                  >
                    {calculations.estadoStockCalculado === 'agotado' && (
                      <AlertTriangle className="h-5 w-5 text-rose-400" />
                    )}
                    {calculations.estadoStockCalculado === 'bajo' && (
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    )}
                    {calculations.estadoStockCalculado === 'disponible' && (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    )}
                    <div>
                      <p className="font-medium capitalize" style={{ color: getStockColor() }}>
                        {calculations.estadoStockCalculado === 'agotado' && 'Sin Stock'}
                        {calculations.estadoStockCalculado === 'bajo' && 'Stock Bajo'}
                        {calculations.estadoStockCalculado === 'disponible' && 'Stock Disponible'}
                      </p>
                      <p className="text-xs text-white/50">
                        {watchedValues.cantidad || 0} unidades disponibles
                        {watchedValues.stockMinimo &&
                          watchedValues.cantidad &&
                          watchedValues.cantidad <= watchedValues.stockMinimo && (
                            <span className="ml-1 text-amber-400">
                              (mínimo: {watchedValues.stockMinimo})
                            </span>
                          )}
                      </p>
                    </div>
                  </motion.div>
                </FormSection>

                {/* Precios */}
                <FormSection title="Precios" icon={<DollarSign className="h-4 w-4" />}>
                  <FormGrid cols={3}>
                    <Controller
                      name="precioCompra"
                      control={control}
                      render={({ field }) => (
                        <FormCurrencyInput
                          label="Precio Compra"
                          value={field.value}
                          onChange={field.onChange}
                          required
                          error={errors.precioCompra?.message}
                        />
                      )}
                    />

                    <Controller
                      name="precioVenta"
                      control={control}
                      render={({ field }) => (
                        <FormCurrencyInput
                          label="Precio Venta"
                          value={field.value}
                          onChange={field.onChange}
                          required
                          error={errors.precioVenta?.message}
                        />
                      )}
                    />

                    <Controller
                      name="fletePromedio"
                      control={control}
                      render={({ field }) => (
                        <FormCurrencyInput
                          label="Flete Promedio"
                          value={field.value || 0}
                          onChange={field.onChange}
                          error={errors.fletePromedio?.message}
                        />
                      )}
                    />
                  </FormGrid>
                </FormSection>

                {/* Clasificación */}
                <FormSection
                  title="Clasificación"
                  icon={<BarChart3 className="h-4 w-4" />}
                  collapsible
                >
                  <FormGrid cols={2}>
                    <Controller
                      name="clasificacionABC"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          label="Clasificación ABC"
                          options={CLASIFICACION_ABC}
                          value={field.value || 'B'}
                          onChange={field.onChange}
                          helperText="Basado en rotación y rentabilidad"
                        />
                      )}
                    />

                    <Controller
                      name="estadoStock"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          label="Estado de Stock"
                          options={ESTADOS_STOCK}
                          value={field.value || 'disponible'}
                          onChange={field.onChange}
                          disabled
                          helperText="Calculado automáticamente"
                        />
                      )}
                    />
                  </FormGrid>
                </FormSection>

                {/* Notas */}
                <FormSection title="Notas" icon={<TrendingUp className="h-4 w-4" />} collapsible>
                  <Controller
                    name="notas"
                    control={control}
                    render={({ field }) => (
                      <FormTextarea
                        {...field}
                        label="Notas Adicionales"
                        placeholder="Información adicional, proveedor preferido, etc..."
                        rows={2}
                        maxLength={500}
                        showCount
                      />
                    )}
                  />
                </FormSection>
              </div>

              {/* Calculations Sidebar */}
              <div className="space-y-4">
                <CalculationPanel title="Margen y Rentabilidad" items={calculationItems} />
                <CalculationPanel title="Valor de Inventario" items={inventoryItems} />

                {/* Warning if negative margin */}
                <AnimatePresence>
                  {calculations.gananciaPorUnidad < 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                      <div className="text-xs text-rose-300/80">
                        <p className="font-medium">¡Margen Negativo!</p>
                        <p className="mt-1">
                          El precio de venta es menor al costo total. Ajusta los precios para
                          obtener ganancia.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Info box */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-3 rounded-xl border border-violet-500/20 bg-violet-500/10 p-4"
                >
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                  <div className="text-xs text-violet-300/80">
                    <p className="font-medium">Clasificación ABC</p>
                    <p className="mt-1">
                      <strong>A:</strong> Alta rotación (80% ventas)
                      <br />
                      <strong>B:</strong> Media rotación (15% ventas)
                      <br />
                      <strong>C:</strong> Baja rotación (5% ventas)
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

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
                {mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
              </SubmitButton>
            </FormActions>
          </motion.form>
        )}
      </AnimatePresence>
    </FormModal>
  )
}

export default AlmacenProductoFormPremium
