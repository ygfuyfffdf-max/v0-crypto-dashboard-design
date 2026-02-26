/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 CHRONOS INFINITY 2026 — TABLA DE DATOS ULTRA SUPREMA
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Tabla de datos premium con:
 * - Filas expandibles con trazabilidad completa
 * - Selección múltiple con acciones batch
 * - Exportación multi-formato
 * - Filtros avanzados
 * - Ordenamiento multi-columna
 * - Virtualización para grandes datasets
 * - Columnas redimensionables
 * - Diseño totalmente responsive
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Check,
  X,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  Settings2,
  History,
  FileText,
  Info,
  User,
  Monitor,
  Clock,
  MapPin,
  Fingerprint,
  Copy,
  ExternalLink,
  Plus,
  Minus,
  GripVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { exportService, type ColumnDefinition, type FormatoExport } from '@/app/_lib/services/export-supreme.service'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface TrazabilidadInfo {
  creadoPor: {
    id: string
    nombre: string
    email?: string
  }
  creadoAt: number
  modificadoPor?: {
    id: string
    nombre: string
    email?: string
  }
  modificadoAt?: number
  dispositivo?: {
    ip: string
    navegador: string
    sistema: string
    ubicacion?: string
  }
}

export interface HistorialCambio {
  id: string
  campo: string
  valorAnterior: unknown
  valorNuevo: unknown
  modificadoPor: {
    id: string
    nombre: string
  }
  modificadoAt: number
  motivo?: string
}

export interface ColumnaTabla<T> {
  id: string
  key: keyof T | string
  header: string
  width?: number
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  filterable?: boolean
  visible?: boolean
  fixed?: 'left' | 'right'
  formato?: 'texto' | 'numero' | 'moneda' | 'fecha' | 'fechaHora' | 'porcentaje' | 'booleano' | 'badge' | 'custom'
  badgeConfig?: {
    [key: string]: {
      label: string
      variante: 'default' | 'success' | 'warning' | 'danger' | 'info'
    }
  }
  render?: (valor: unknown, fila: T, index: number) => React.ReactNode
}

export interface FilaExpansible<T> {
  fila: T
  trazabilidad?: TrazabilidadInfo
  historial?: HistorialCambio[]
}

export interface AccionTabla<T> {
  id: string
  label: string
  icono: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  variante?: 'default' | 'destructive' | 'outline'
  onClick: (filas: T[]) => void
  mostrarSi?: (filas: T[]) => boolean
  disabled?: (filas: T[]) => boolean
  confirmacion?: boolean
  mensajeConfirmacion?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTES INTERNOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FilaExpandidaProps<T> {
  fila: FilaExpansible<T>
  columnas: ColumnaTabla<T>[]
}

function FilaExpandida<T extends Record<string, unknown>>({ fila, columnas }: FilaExpandidaProps<T>) {
  const [tabActiva, setTabActiva] = useState('info')

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="bg-slate-900/50 border-t border-slate-800/50 p-4">
        <Tabs value={tabActiva} onValueChange={setTabActiva}>
          <TabsList className="bg-slate-800/50">
            <TabsTrigger value="info" className="text-xs">
              <Info className="w-3 h-3 mr-1" />
              Información
            </TabsTrigger>
            {fila.trazabilidad && (
              <TabsTrigger value="trazabilidad" className="text-xs">
                <Fingerprint className="w-3 h-3 mr-1" />
                Trazabilidad
              </TabsTrigger>
            )}
            {fila.historial && fila.historial.length > 0 && (
              <TabsTrigger value="historial" className="text-xs">
                <History className="w-3 h-3 mr-1" />
                Historial ({fila.historial.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {columnas.slice(0, 8).map((col) => {
                const valor = fila.fila[col.key as keyof T]
                return (
                  <div key={col.id}>
                    <p className="text-xs text-slate-500 mb-1">{col.header}</p>
                    <p className="text-sm text-white font-medium">
                      {valor !== undefined && valor !== null ? String(valor) : '-'}
                    </p>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          {fila.trazabilidad && (
            <TabsContent value="trazabilidad" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Creación */}
                <Card className="bg-slate-800/30 border-slate-700/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10">
                        <Plus className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-sm font-medium text-emerald-400">Creación</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <User className="w-3 h-3" />
                        <span>{fila.trazabilidad.creadoPor.nombre}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(fila.trazabilidad.creadoAt).toLocaleString('es-MX')}</span>
                      </div>
                      {fila.trazabilidad.dispositivo && (
                        <>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Monitor className="w-3 h-3" />
                            <span>{fila.trazabilidad.dispositivo.navegador} / {fila.trazabilidad.dispositivo.sistema}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <MapPin className="w-3 h-3" />
                            <span className="font-mono text-xs">{fila.trazabilidad.dispositivo.ip}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Última modificación */}
                {fila.trazabilidad.modificadoPor && (
                  <Card className="bg-slate-800/30 border-slate-700/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-blue-500/10">
                          <Edit className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-blue-400">Última Modificación</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                          <User className="w-3 h-3" />
                          <span>{fila.trazabilidad.modificadoPor.nombre}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(fila.trazabilidad.modificadoAt!).toLocaleString('es-MX')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}

          {fila.historial && fila.historial.length > 0 && (
            <TabsContent value="historial" className="mt-4">
              <div className="space-y-3 max-h-60 overflow-auto pr-2">
                {fila.historial.map((cambio) => (
                  <motion.div
                    key={cambio.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
                  >
                    <div className="p-1.5 rounded-lg bg-violet-500/10 shrink-0">
                      <History className="w-3 h-3 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white capitalize">
                          {cambio.campo.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(cambio.modificadoAt).toLocaleString('es-MX')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs bg-red-500/10 border-red-500/30 text-red-400">
                          {String(cambio.valorAnterior).substring(0, 30)}
                        </Badge>
                        <ArrowDown className="w-3 h-3 text-slate-500 rotate-[-90deg]" />
                        <Badge variant="outline" className="text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                          {String(cambio.valorNuevo).substring(0, 30)}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Por: {cambio.modificadoPor.nombre}
                        {cambio.motivo && ` - ${cambio.motivo}`}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface SupremeDataTableUltraProps<T extends Record<string, unknown>> {
  datos: FilaExpansible<T>[]
  columnas: ColumnaTabla<T>[]
  titulo?: string
  descripcion?: string

  // Configuración
  seleccionable?: boolean
  expandible?: boolean
  paginado?: boolean
  tamaniosPagina?: number[]
  tamanioPaginaDefault?: number
  ordenableMultiple?: boolean

  // Búsqueda y filtros
  busquedaGlobal?: boolean
  placeholderBusqueda?: string
  filtros?: {
    campo: keyof T
    opciones: { valor: string; label: string }[]
  }[]

  // Acciones
  acciones?: AccionTabla<T>[]
  accionesFilaIndividual?: {
    id: string
    label: string
    icono: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
    onClick: (fila: T) => void
    disabled?: (fila: T) => boolean
    danger?: boolean
  }[]

  // Exportación
  exportable?: boolean
  formatosExport?: FormatoExport[]
  nombreExport?: string

  // Estados
  cargando?: boolean
  vacio?: {
    titulo: string
    descripcion: string
    icono?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  }

  // Callbacks
  onSeleccionCambio?: (seleccionadas: T[]) => void
  onOrdenCambio?: (columna: string, direccion: 'asc' | 'desc') => void
  onPaginaCambio?: (pagina: number, tamanioPagina: number) => void
  onFilaClick?: (fila: T) => void
  onRefresh?: () => void

  // Estilos
  className?: string
  alturaMaxima?: string
}

export default function SupremeDataTableUltra<T extends Record<string, unknown>>({
  datos,
  columnas,
  titulo,
  descripcion,
  seleccionable = true,
  expandible = true,
  paginado = true,
  tamaniosPagina = [10, 25, 50, 100],
  tamanioPaginaDefault = 25,
  ordenableMultiple = false,
  busquedaGlobal = true,
  placeholderBusqueda = 'Buscar...',
  filtros = [],
  acciones = [],
  accionesFilaIndividual = [],
  exportable = true,
  formatosExport = ['csv', 'excel', 'json'],
  nombreExport = 'datos_exportados',
  cargando = false,
  vacio = {
    titulo: 'Sin datos',
    descripcion: 'No hay registros para mostrar',
    icono: FileText
  },
  onSeleccionCambio,
  onOrdenCambio,
  onPaginaCambio,
  onFilaClick,
  onRefresh,
  className,
  alturaMaxima = '600px'
}: SupremeDataTableUltraProps<T>) {
  // Estados
  const [busqueda, setBusqueda] = useState('')
  const [seleccionadas, setSeleccionadas] = useState<Set<number>>(new Set())
  const [expandidas, setExpandidas] = useState<Set<number>>(new Set())
  const [ordenamiento, setOrdenamiento] = useState<{ columna: string; direccion: 'asc' | 'desc' } | null>(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [tamanioPagina, setTamanioPagina] = useState(tamanioPaginaDefault)
  const [columnasVisibles, setColumnasVisibles] = useState<Set<string>>(
    new Set(columnas.filter(c => c.visible !== false).map(c => c.id))
  )
  const [filtrosActivos, setFiltrosActivos] = useState<Record<string, string>>({})

  // Refs
  const tablaRef = useRef<HTMLDivElement>(null)

  // Columnas visibles
  const columnasActivas = useMemo(() => {
    return columnas.filter(c => columnasVisibles.has(c.id))
  }, [columnas, columnasVisibles])

  // Datos procesados (búsqueda, filtros, ordenamiento)
  const datosProcesados = useMemo(() => {
    let resultado = [...datos]

    // Búsqueda global
    if (busqueda) {
      const termino = busqueda.toLowerCase()
      resultado = resultado.filter(item => {
        return Object.values(item.fila).some(val =>
          String(val).toLowerCase().includes(termino)
        )
      })
    }

    // Filtros activos
    Object.entries(filtrosActivos).forEach(([campo, valor]) => {
      if (valor && valor !== 'todos') {
        resultado = resultado.filter(item =>
          String(item.fila[campo as keyof T]) === valor
        )
      }
    })

    // Ordenamiento
    if (ordenamiento) {
      resultado.sort((a, b) => {
        const valorA = a.fila[ordenamiento.columna as keyof T]
        const valorB = b.fila[ordenamiento.columna as keyof T]

        if (valorA === valorB) return 0

        const comparacion = valorA < valorB ? -1 : 1
        return ordenamiento.direccion === 'asc' ? comparacion : -comparacion
      })
    }

    return resultado
  }, [datos, busqueda, filtrosActivos, ordenamiento])

  // Paginación
  const datosPaginados = useMemo(() => {
    if (!paginado) return datosProcesados

    const inicio = (paginaActual - 1) * tamanioPagina
    return datosProcesados.slice(inicio, inicio + tamanioPagina)
  }, [datosProcesados, paginaActual, tamanioPagina, paginado])

  const totalPaginas = useMemo(() => {
    return Math.ceil(datosProcesados.length / tamanioPagina)
  }, [datosProcesados.length, tamanioPagina])

  // Handlers
  const handleSeleccionTodas = useCallback((checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSeleccionadas(new Set(datosPaginados.map((_, i) => (paginaActual - 1) * tamanioPagina + i)))
    } else {
      setSeleccionadas(new Set())
    }
  }, [datosPaginados, paginaActual, tamanioPagina])

  const handleSeleccionFila = useCallback((indice: number, checked: boolean) => {
    const nuevas = new Set(seleccionadas)
    if (checked) {
      nuevas.add(indice)
    } else {
      nuevas.delete(indice)
    }
    setSeleccionadas(nuevas)
  }, [seleccionadas])

  const handleExpandir = useCallback((indice: number) => {
    const nuevas = new Set(expandidas)
    if (nuevas.has(indice)) {
      nuevas.delete(indice)
    } else {
      nuevas.add(indice)
    }
    setExpandidas(nuevas)
  }, [expandidas])

  const handleOrdenar = useCallback((columnaId: string) => {
    if (ordenamiento?.columna === columnaId) {
      setOrdenamiento({
        columna: columnaId,
        direccion: ordenamiento.direccion === 'asc' ? 'desc' : 'asc'
      })
    } else {
      setOrdenamiento({ columna: columnaId, direccion: 'asc' })
    }
    onOrdenCambio?.(columnaId, ordenamiento?.direccion === 'asc' ? 'desc' : 'asc')
  }, [ordenamiento, onOrdenCambio])

  const handleExportar = useCallback(async (formato: FormatoExport) => {
    const datosExport = Array.from(seleccionadas).length > 0
      ? Array.from(seleccionadas).map(i => datos[i]!.fila)
      : datosProcesados.map(d => d.fila)

    const columnasExport: ColumnDefinition[] = columnasActivas.map(col => ({
      key: col.key as string,
      header: col.header,
      formato: col.formato as ColumnDefinition['formato'],
      align: col.align
    }))

    const resultado = await exportService.exportar({
      datos: datosExport as Record<string, unknown>[],
      columnas: columnasExport,
      configuracion: {
        formato,
        nombreArchivo: `${nombreExport}_${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : formato}`
      },
      usuarioId: 'usuario_actual',
      usuarioNombre: 'Usuario'
    })

    if (resultado.exito) {
      exportService.descargar(resultado)
    }
  }, [seleccionadas, datos, datosProcesados, columnasActivas, nombreExport])

  // Notificar cambios de selección
  useEffect(() => {
    const filasSeleccionadas = Array.from(seleccionadas).map(i => datos[i]?.fila).filter(Boolean)
    onSeleccionCambio?.(filasSeleccionadas as T[])
  }, [seleccionadas, datos, onSeleccionCambio])

  // Notificar cambios de página
  useEffect(() => {
    onPaginaCambio?.(paginaActual, tamanioPagina)
  }, [paginaActual, tamanioPagina, onPaginaCambio])

  // Formatear valores
  const formatearValor = useCallback((valor: unknown, columna: ColumnaTabla<T>): React.ReactNode => {
    if (valor === undefined || valor === null) return '-'

    if (columna.render) {
      return columna.render(valor, datos[0]?.fila as T, 0)
    }

    switch (columna.formato) {
      case 'moneda':
        return `$${Number(valor).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
      case 'fecha':
        return new Date(valor as number | string).toLocaleDateString('es-MX')
      case 'fechaHora':
        return new Date(valor as number | string).toLocaleString('es-MX')
      case 'porcentaje':
        return `${(Number(valor) * 100).toFixed(1)}%`
      case 'booleano':
        return valor ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-red-400" />
      case 'badge':
        const badgeConfig = columna.badgeConfig?.[String(valor)]
        if (badgeConfig) {
          const varianteClases: Record<string, string> = {
            success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            danger: 'bg-red-500/10 text-red-400 border-red-500/30',
            info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            default: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
          }
          return (
            <Badge variant="outline" className={cn("text-xs", varianteClases[badgeConfig.variante])}>
              {badgeConfig.label}
            </Badge>
          )
        }
        return String(valor)
      default:
        return String(valor)
    }
  }, [datos])

  // Render empty state
  const IconoVacio = vacio.icono || FileText

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {titulo && <h2 className="text-lg font-semibold text-white">{titulo}</h2>}
            {descripcion && <p className="text-sm text-slate-400">{descripcion}</p>}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Búsqueda */}
            {busquedaGlobal && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder={placeholderBusqueda}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 w-64 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            )}

            {/* Filtros */}
            {filtros.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                    {Object.keys(filtrosActivos).length > 0 && (
                      <Badge className="ml-2 h-5 bg-violet-500">
                        {Object.keys(filtrosActivos).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-900 border-slate-700 w-56">
                  <DropdownMenuLabel>Filtros</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  {filtros.map((filtro) => (
                    <div key={String(filtro.campo)} className="p-2">
                      <label className="text-xs text-slate-400 mb-1 block capitalize">
                        {String(filtro.campo).replace(/_/g, ' ')}
                      </label>
                      <Select
                        value={filtrosActivos[String(filtro.campo)] || 'todos'}
                        onValueChange={(valor) => {
                          setFiltrosActivos(prev => ({
                            ...prev,
                            [String(filtro.campo)]: valor
                          }))
                        }}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700 h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          <SelectItem value="todos">Todos</SelectItem>
                          {filtro.opciones.map((opcion) => (
                            <SelectItem key={opcion.valor} value={opcion.valor}>
                              {opcion.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Columnas visibles */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Columnas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900 border-slate-700">
                <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                {columnas.map((columna) => (
                  <DropdownMenuCheckboxItem
                    key={columna.id}
                    checked={columnasVisibles.has(columna.id)}
                    onCheckedChange={(checked) => {
                      const nuevas = new Set(columnasVisibles)
                      if (checked) {
                        nuevas.add(columna.id)
                      } else {
                        nuevas.delete(columna.id)
                      }
                      setColumnasVisibles(nuevas)
                    }}
                    className="text-slate-300"
                  >
                    {columna.header}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Exportar */}
            {exportable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-900 border-slate-700">
                  <DropdownMenuLabel>
                    {seleccionadas.size > 0
                      ? `Exportar ${seleccionadas.size} seleccionadas`
                      : `Exportar ${datosProcesados.length} registros`
                    }
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  {formatosExport.includes('csv') && (
                    <DropdownMenuItem onClick={() => handleExportar('csv')} className="text-slate-300">
                      <FileText className="w-4 h-4 mr-2" />
                      CSV
                    </DropdownMenuItem>
                  )}
                  {formatosExport.includes('excel') && (
                    <DropdownMenuItem onClick={() => handleExportar('excel')} className="text-slate-300">
                      <FileText className="w-4 h-4 mr-2" />
                      Excel
                    </DropdownMenuItem>
                  )}
                  {formatosExport.includes('json') && (
                    <DropdownMenuItem onClick={() => handleExportar('json')} className="text-slate-300">
                      <FileText className="w-4 h-4 mr-2" />
                      JSON
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Refresh */}
            {onRefresh && (
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-slate-700"
                onClick={onRefresh}
              >
                <RefreshCw className={cn("w-4 h-4", cargando && "animate-spin")} />
              </Button>
            )}
          </div>
        </div>

        {/* Acciones batch */}
        {seleccionable && seleccionadas.size > 0 && acciones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-violet-600/10 border border-violet-500/30"
          >
            <span className="text-sm text-violet-300">
              {seleccionadas.size} seleccionadas
            </span>
            <div className="flex-1" />
            {acciones.map((accion) => {
              const filasSeleccionadas = Array.from(seleccionadas).map(i => datos[i]?.fila).filter(Boolean) as T[]
              const mostrar = accion.mostrarSi ? accion.mostrarSi(filasSeleccionadas) : true
              const deshabilitado = accion.disabled ? accion.disabled(filasSeleccionadas) : false

              if (!mostrar) return null

              return (
                <Button
                  key={accion.id}
                  size="sm"
                  variant={accion.variante || 'outline'}
                  className={cn(
                    accion.variante === 'destructive' && "bg-red-600 hover:bg-red-700",
                    "h-8"
                  )}
                  disabled={deshabilitado}
                  onClick={() => accion.onClick(filasSeleccionadas)}
                >
                  <accion.icono className="w-3 h-3 mr-1" />
                  {accion.label}
                </Button>
              )
            })}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-slate-400"
              onClick={() => setSeleccionadas(new Set())}
            >
              Limpiar
            </Button>
          </motion.div>
        )}

        {/* Tabla */}
        <div
          ref={tablaRef}
          className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/30"
        >
          <ScrollArea className={cn("relative", `max-h-[${alturaMaxima}]`)}>
            <Table>
              <TableHeader className="bg-slate-900/50 sticky top-0 z-10">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  {/* Checkbox all */}
                  {seleccionable && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={datosPaginados.length > 0 && seleccionadas.size === datosPaginados.length}
                        onCheckedChange={handleSeleccionTodas}
                        className="border-slate-600"
                      />
                    </TableHead>
                  )}

                  {/* Expand */}
                  {expandible && (
                    <TableHead className="w-10" />
                  )}

                  {/* Columnas */}
                  {columnasActivas.map((columna) => (
                    <TableHead
                      key={columna.id}
                      className={cn(
                        "text-slate-400 font-medium",
                        columna.sortable !== false && "cursor-pointer select-none hover:text-white",
                        columna.align === 'center' && "text-center",
                        columna.align === 'right' && "text-right"
                      )}
                      style={{
                        width: columna.width,
                        minWidth: columna.minWidth
                      }}
                      onClick={() => columna.sortable !== false && handleOrdenar(columna.key as string)}
                    >
                      <div className={cn(
                        "flex items-center gap-1",
                        columna.align === 'center' && "justify-center",
                        columna.align === 'right' && "justify-end"
                      )}>
                        {columna.header}
                        {columna.sortable !== false && ordenamiento?.columna === columna.key && (
                          ordenamiento.direccion === 'asc'
                            ? <ArrowUp className="w-4 h-4" />
                            : <ArrowDown className="w-4 h-4" />
                        )}
                      </div>
                    </TableHead>
                  ))}

                  {/* Acciones columna */}
                  {accionesFilaIndividual.length > 0 && (
                    <TableHead className="w-12" />
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {cargando ? (
                  // Skeleton loading
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-slate-800">
                      {seleccionable && (
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      )}
                      {expandible && (
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      )}
                      {columnasActivas.map((col) => (
                        <TableCell key={col.id}>
                          <Skeleton className="h-4 w-full max-w-[100px]" />
                        </TableCell>
                      ))}
                      {accionesFilaIndividual.length > 0 && (
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      )}
                    </TableRow>
                  ))
                ) : datosPaginados.length === 0 ? (
                  // Empty state
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableCell
                      colSpan={columnasActivas.length + (seleccionable ? 1 : 0) + (expandible ? 1 : 0) + (accionesFilaIndividual.length > 0 ? 1 : 0)}
                      className="h-48 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <IconoVacio className="w-12 h-12 text-slate-600" />
                        <div>
                          <p className="text-slate-400 font-medium">{vacio.titulo}</p>
                          <p className="text-sm text-slate-500">{vacio.descripcion}</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Datos
                  datosPaginados.map((fila, idx) => {
                    const indiceGlobal = (paginaActual - 1) * tamanioPagina + idx
                    const estaExpandida = expandidas.has(indiceGlobal)
                    const estaSeleccionada = seleccionadas.has(indiceGlobal)

                    return (
                      <motion.tr
                        key={indiceGlobal}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className={cn(
                          "border-slate-800 transition-colors cursor-pointer",
                          estaSeleccionada && "bg-violet-600/10",
                          !estaSeleccionada && "hover:bg-slate-800/30"
                        )}
                        onClick={() => onFilaClick?.(fila.fila as T)}
                      >
                        {/* Checkbox */}
                        {seleccionable && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={estaSeleccionada}
                              onCheckedChange={(checked) => handleSeleccionFila(indiceGlobal, !!checked)}
                              className="border-slate-600"
                            />
                          </TableCell>
                        )}

                        {/* Expand */}
                        {expandible && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleExpandir(indiceGlobal)}
                            >
                              {estaExpandida ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                          </TableCell>
                        )}

                        {/* Columnas */}
                        {columnasActivas.map((columna) => {
                          const valor = fila.fila[columna.key as keyof T]
                          return (
                            <TableCell
                              key={columna.id}
                              className={cn(
                                "text-slate-300",
                                columna.align === 'center' && "text-center",
                                columna.align === 'right' && "text-right"
                              )}
                            >
                              {formatearValor(valor, columna)}
                            </TableCell>
                          )
                        })}

                        {/* Acciones */}
                        {accionesFilaIndividual.length > 0 && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                                {accionesFilaIndividual.map((accion) => {
                                  const deshabilitado = accion.disabled?.(fila.fila as T)
                                  return (
                                    <DropdownMenuItem
                                      key={accion.id}
                                      className={cn(
                                        "text-slate-300",
                                        accion.danger && "text-red-400"
                                      )}
                                      disabled={deshabilitado}
                                      onClick={() => accion.onClick(fila.fila as T)}
                                    >
                                      <accion.icono className="w-4 h-4 mr-2" />
                                      {accion.label}
                                    </DropdownMenuItem>
                                  )
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </motion.tr>
                    )
                  })
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Filas expandidas */}
          <AnimatePresence>
            {Array.from(expandidas).map(indice => {
              const fila = datos[indice]
              if (!fila) return null

              return (
                <FilaExpandida
                  key={indice}
                  fila={fila}
                  columnas={columnasActivas}
                />
              )
            })}
          </AnimatePresence>
        </div>

        {/* Paginación */}
        {paginado && datosProcesados.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Mostrando</span>
              <Select
                value={String(tamanioPagina)}
                onValueChange={(v) => {
                  setTamanioPagina(Number(v))
                  setPaginaActual(1)
                }}
              >
                <SelectTrigger className="w-16 h-8 bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {tamaniosPagina.map((tam) => (
                    <SelectItem key={tam} value={String(tam)}>{tam}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>de {datosProcesados.length} registros</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-700"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(1)}
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-700"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(p => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="px-3 text-sm text-slate-400">
                {paginaActual} / {totalPaginas}
              </span>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-700"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual(p => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-700"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual(totalPaginas)}
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
