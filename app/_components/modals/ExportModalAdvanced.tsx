/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📤 CHRONOS INFINITY 2026 — MODAL DE EXPORTACIÓN AVANZADO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Modal completo para exportación con:
 * - Selección de formato
 * - Configuración de columnas
 * - Preview de datos
 * - Historial de exportaciones
 * - Templates guardados
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  FileCode,
  Settings,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  GripVertical,
  History,
  Save,
  Star,
  Loader2,
  CheckCircle,
  X,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  exportService,
  type FormatoExport,
  type ColumnDefinition,
  type ConfiguracionExport,
  type ExportResult,
  type HistorialExport,
  type TemplateExport
} from '@/app/_lib/services/export-supreme.service'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ExportModalAdvancedProps {
  open: boolean
  onOpenChange: (open: boolean) => void

  datos: Record<string, unknown>[]
  columnas: ColumnDefinition[]
  titulo?: string
  modulo?: string

  usuarioId: string
  usuarioNombre: string

  onExportComplete?: (resultado: ExportResult) => void
}

type PasoExport = 'formato' | 'columnas' | 'opciones' | 'preview' | 'exportando' | 'completado'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const formatosDisponibles: {
  id: FormatoExport
  nombre: string
  descripcion: string
  icono: React.ElementType
  extension: string
}[] = [
  {
    id: 'csv',
    nombre: 'CSV',
    descripcion: 'Archivo de valores separados por comas',
    icono: FileText,
    extension: '.csv'
  },
  {
    id: 'excel',
    nombre: 'Excel',
    descripcion: 'Archivo de hoja de cálculo de Microsoft',
    icono: FileSpreadsheet,
    extension: '.xlsx'
  },
  {
    id: 'json',
    nombre: 'JSON',
    descripcion: 'Datos estructurados en formato JSON',
    icono: FileJson,
    extension: '.json'
  },
  {
    id: 'pdf',
    nombre: 'PDF',
    descripcion: 'Documento portátil con formato',
    icono: FileCode,
    extension: '.pdf'
  }
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default function ExportModalAdvanced({
  open,
  onOpenChange,
  datos,
  columnas,
  titulo = 'Exportar Datos',
  modulo = 'general',
  usuarioId,
  usuarioNombre,
  onExportComplete
}: ExportModalAdvancedProps) {
  // Estados
  const [paso, setPaso] = useState<PasoExport>('formato')
  const [formatoSeleccionado, setFormatoSeleccionado] = useState<FormatoExport>('excel')
  const [columnasSeleccionadas, setColumnasSeleccionadas] = useState<Set<string>>(
    new Set(columnas.map(c => c.key))
  )
  const [nombreArchivo, setNombreArchivo] = useState(
    `export_${modulo}_${new Date().toISOString().split('T')[0]}`
  )
  const [configuracion, setConfiguracion] = useState<Partial<ConfiguracionExport>>({
    csv: {
      delimitador: ',',
      incluirHeaders: true,
      encoding: 'utf-8',
      lineaFin: '\n'
    },
    json: {
      indentacion: 2,
      incluirMetadata: true
    },
    excel: {
      nombreHoja: 'Datos',
      incluirEstilos: true,
      congelarPrimeraFila: true,
      autoancho: true,
      formatoFechas: 'dd/mm/yyyy',
      formatoNumeros: '#,##0.00'
    },
    pdf: {
      orientacion: 'portrait',
      tamañoPagina: 'letter',
      incluirLogo: true,
      incluirFecha: true,
      incluirNumeroPagina: true,
      titulo: titulo
    }
  })
  const [resultado, setResultado] = useState<ExportResult | null>(null)
  const [historial, setHistorial] = useState<HistorialExport[]>([])
  const [templates, setTemplates] = useState<TemplateExport[]>([])
  const [guardarTemplate, setGuardarTemplate] = useState(false)
  const [nombreTemplate, setNombreTemplate] = useState('')

  // Cargar historial y templates
  useEffect(() => {
    if (open) {
      setHistorial(exportService.obtenerHistorial(usuarioId))
      setTemplates(exportService.obtenerTemplatesPorModulo(modulo))
    }
  }, [open, usuarioId, modulo])

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setPaso('formato')
        setResultado(null)
      }, 300)
    }
  }, [open])

  // Columnas activas
  const columnasActivas = columnas.filter(c => columnasSeleccionadas.has(c.key))

  // Handlers
  const handleToggleColumna = (key: string) => {
    const nuevas = new Set(columnasSeleccionadas)
    if (nuevas.has(key)) {
      nuevas.delete(key)
    } else {
      nuevas.add(key)
    }
    setColumnasSeleccionadas(nuevas)
  }

  const handleSeleccionarTodas = () => {
    setColumnasSeleccionadas(new Set(columnas.map(c => c.key)))
  }

  const handleDeseleccionarTodas = () => {
    setColumnasSeleccionadas(new Set())
  }

  const handleExportar = async () => {
    setPaso('exportando')

    try {
      const result = await exportService.exportar({
        datos,
        columnas: columnasActivas,
        configuracion: {
          formato: formatoSeleccionado,
          nombreArchivo: `${nombreArchivo}${formatosDisponibles.find(f => f.id === formatoSeleccionado)?.extension}`,
          columnasIncluidas: Array.from(columnasSeleccionadas),
          ...configuracion
        },
        usuarioId,
        usuarioNombre
      })

      setResultado(result)

      if (result.exito) {
        exportService.descargar(result)

        // Guardar template si está habilitado
        if (guardarTemplate && nombreTemplate) {
          exportService.guardarTemplate({
            nombre: nombreTemplate,
            descripcion: `Template generado automáticamente`,
            modulo,
            configuracion: {
              formato: formatoSeleccionado,
              nombreArchivo,
              ...configuracion
            },
            columnas: columnasActivas,
            activo: true,
            usoPredeterminado: false,
            creadoPor: usuarioNombre
          })
        }

        onExportComplete?.(result)
        setPaso('completado')
      } else {
        setPaso('opciones')
      }
    } catch (error) {
      console.error('Error exportando:', error)
      setPaso('opciones')
    }
  }

  const handleCargarTemplate = (template: TemplateExport) => {
    setFormatoSeleccionado(template.configuracion.formato)
    setNombreArchivo(template.configuracion.nombreArchivo.replace(/\.[^/.]+$/, ''))
    setColumnasSeleccionadas(new Set(template.columnas.map(c => c.key)))
    setConfiguracion(template.configuracion)
  }

  // Render paso actual
  const renderPaso = () => {
    switch (paso) {
      case 'formato':
        return (
          <div className="space-y-6">
            {/* Templates guardados */}
            {templates.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-400">Templates Guardados</h4>
                <div className="flex gap-2 flex-wrap">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      className="border-slate-700 hover:bg-slate-800"
                      onClick={() => handleCargarTemplate(template)}
                    >
                      <Star className="w-3 h-3 mr-1 text-amber-400" />
                      {template.nombre}
                    </Button>
                  ))}
                </div>
                <Separator className="bg-slate-800" />
              </div>
            )}

            {/* Selección de formato */}
            <div className="grid grid-cols-2 gap-4">
              {formatosDisponibles.map((formato) => {
                const Icono = formato.icono
                const seleccionado = formatoSeleccionado === formato.id

                return (
                  <motion.button
                    key={formato.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormatoSeleccionado(formato.id)}
                    className={cn(
                      "relative p-4 rounded-xl border-2 text-left transition-all",
                      seleccionado
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    )}
                  >
                    {seleccionado && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-violet-400" />
                      </div>
                    )}
                    <Icono className={cn(
                      "w-8 h-8 mb-2",
                      seleccionado ? "text-violet-400" : "text-slate-400"
                    )} />
                    <h3 className="font-medium text-white">{formato.nombre}</h3>
                    <p className="text-xs text-slate-500 mt-1">{formato.descripcion}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {formato.extension}
                    </Badge>
                  </motion.button>
                )
              })}
            </div>

            {/* Nombre del archivo */}
            <div className="space-y-2">
              <Label className="text-slate-400">Nombre del archivo</Label>
              <div className="flex gap-2">
                <Input
                  value={nombreArchivo}
                  onChange={(e) => setNombreArchivo(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                />
                <span className="flex items-center px-3 bg-slate-800 rounded-lg border border-slate-700 text-slate-400">
                  {formatosDisponibles.find(f => f.id === formatoSeleccionado)?.extension}
                </span>
              </div>
            </div>
          </div>
        )

      case 'columnas':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-400">
                Seleccionar columnas ({columnasSeleccionadas.size} de {columnas.length})
              </h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSeleccionarTodas}>
                  Todas
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeseleccionarTodas}>
                  Ninguna
                </Button>
              </div>
            </div>

            <ScrollArea className="h-64 border border-slate-700 rounded-lg">
              <div className="p-2 space-y-1">
                {columnas.map((columna) => {
                  const seleccionada = columnasSeleccionadas.has(columna.key)
                  return (
                    <div
                      key={columna.key}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                        seleccionada ? "bg-violet-500/10" : "hover:bg-slate-800"
                      )}
                      onClick={() => handleToggleColumna(columna.key)}
                    >
                      <Checkbox checked={seleccionada} />
                      <div className="flex-1">
                        <p className="text-sm text-white">{columna.header}</p>
                        <p className="text-xs text-slate-500">{columna.key}</p>
                      </div>
                      {columna.formato && (
                        <Badge variant="outline" className="text-xs">
                          {columna.formato}
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        )

      case 'opciones':
        return (
          <div className="space-y-6">
            <Tabs defaultValue={formatoSeleccionado} className="w-full">
              <TabsList className="w-full bg-slate-800">
                <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
                <TabsTrigger value="formato" className="flex-1">Formato</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-4 space-y-4">
                {/* Guardar como template */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <Star className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-sm text-white">Guardar como template</p>
                      <p className="text-xs text-slate-500">Reutilizar esta configuración</p>
                    </div>
                  </div>
                  <Switch
                    checked={guardarTemplate}
                    onCheckedChange={setGuardarTemplate}
                  />
                </div>

                {guardarTemplate && (
                  <div className="space-y-2">
                    <Label className="text-slate-400">Nombre del template</Label>
                    <Input
                      value={nombreTemplate}
                      onChange={(e) => setNombreTemplate(e.target.value)}
                      placeholder="Mi template personalizado"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="formato" className="mt-4 space-y-4">
                {/* Opciones específicas por formato */}
                {formatoSeleccionado === 'csv' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-slate-400">Delimitador</Label>
                      <Select
                        value={configuracion.csv?.delimitador || ','}
                        onValueChange={(v) => setConfiguracion({
                          ...configuracion,
                          csv: { ...configuracion.csv!, delimitador: v as ',' | ';' | '|' | '\t' }
                        })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900">
                          <SelectItem value=",">Coma (,)</SelectItem>
                          <SelectItem value=";">Punto y coma (;)</SelectItem>
                          <SelectItem value="|">Pipe (|)</SelectItem>
                          <SelectItem value="\t">Tabulador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-400">Incluir encabezados</Label>
                      <Switch
                        checked={configuracion.csv?.incluirHeaders ?? true}
                        onCheckedChange={(v) => setConfiguracion({
                          ...configuracion,
                          csv: { ...configuracion.csv!, incluirHeaders: v }
                        })}
                      />
                    </div>
                  </>
                )}

                {formatoSeleccionado === 'excel' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-slate-400">Nombre de la hoja</Label>
                      <Input
                        value={configuracion.excel?.nombreHoja || 'Datos'}
                        onChange={(e) => setConfiguracion({
                          ...configuracion,
                          excel: { ...configuracion.excel!, nombreHoja: e.target.value }
                        })}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-400">Incluir estilos</Label>
                      <Switch
                        checked={configuracion.excel?.incluirEstilos ?? true}
                        onCheckedChange={(v) => setConfiguracion({
                          ...configuracion,
                          excel: { ...configuracion.excel!, incluirEstilos: v }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-400">Congelar primera fila</Label>
                      <Switch
                        checked={configuracion.excel?.congelarPrimeraFila ?? true}
                        onCheckedChange={(v) => setConfiguracion({
                          ...configuracion,
                          excel: { ...configuracion.excel!, congelarPrimeraFila: v }
                        })}
                      />
                    </div>
                  </>
                )}

                {formatoSeleccionado === 'json' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-slate-400">Indentación</Label>
                      <Select
                        value={String(configuracion.json?.indentacion || 2)}
                        onValueChange={(v) => setConfiguracion({
                          ...configuracion,
                          json: { ...configuracion.json!, indentacion: Number(v) }
                        })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900">
                          <SelectItem value="0">Sin indentación</SelectItem>
                          <SelectItem value="2">2 espacios</SelectItem>
                          <SelectItem value="4">4 espacios</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-400">Incluir metadata</Label>
                      <Switch
                        checked={configuracion.json?.incluirMetadata ?? true}
                        onCheckedChange={(v) => setConfiguracion({
                          ...configuracion,
                          json: { ...configuracion.json!, incluirMetadata: v }
                        })}
                      />
                    </div>
                  </>
                )}

                {formatoSeleccionado === 'pdf' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-slate-400">Orientación</Label>
                      <Select
                        value={configuracion.pdf?.orientacion || 'portrait'}
                        onValueChange={(v) => setConfiguracion({
                          ...configuracion,
                          pdf: { ...configuracion.pdf!, orientacion: v as 'portrait' | 'landscape' }
                        })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900">
                          <SelectItem value="portrait">Vertical</SelectItem>
                          <SelectItem value="landscape">Horizontal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-400">Incluir fecha</Label>
                      <Switch
                        checked={configuracion.pdf?.incluirFecha ?? true}
                        onCheckedChange={(v) => setConfiguracion({
                          ...configuracion,
                          pdf: { ...configuracion.pdf!, incluirFecha: v }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-400">Número de página</Label>
                      <Switch
                        checked={configuracion.pdf?.incluirNumeroPagina ?? true}
                        onCheckedChange={(v) => setConfiguracion({
                          ...configuracion,
                          pdf: { ...configuracion.pdf!, incluirNumeroPagina: v }
                        })}
                      />
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )

      case 'preview':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-400">
                Vista previa ({datos.length} registros)
              </h4>
              <Badge variant="outline">
                Mostrando {Math.min(5, datos.length)} de {datos.length}
              </Badge>
            </div>

            <div className="border border-slate-700 rounded-lg overflow-hidden">
              <ScrollArea className="max-h-64">
                <Table>
                  <TableHeader className="bg-slate-800/50">
                    <TableRow>
                      {columnasActivas.slice(0, 5).map((col) => (
                        <TableHead key={col.key} className="text-slate-400 text-xs">
                          {col.header}
                        </TableHead>
                      ))}
                      {columnasActivas.length > 5 && (
                        <TableHead className="text-slate-400 text-xs">...</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datos.slice(0, 5).map((fila, idx) => (
                      <TableRow key={idx} className="border-slate-700">
                        {columnasActivas.slice(0, 5).map((col) => (
                          <TableCell key={col.key} className="text-slate-300 text-xs">
                            {String(fila[col.key] ?? '-').substring(0, 30)}
                          </TableCell>
                        ))}
                        {columnasActivas.length > 5 && (
                          <TableCell className="text-slate-500">...</TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            {/* Resumen */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <h4 className="text-sm font-medium text-white mb-2">Resumen de exportación</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Formato:</span>
                  <span className="text-white">{formatoSeleccionado.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registros:</span>
                  <span className="text-white">{datos.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Columnas:</span>
                  <span className="text-white">{columnasActivas.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Archivo:</span>
                  <span className="text-white truncate">{nombreArchivo}</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'exportando':
        return (
          <div className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-violet-400 animate-spin" />
            <p className="text-white">Generando archivo...</p>
            <p className="text-sm text-slate-400">Esto puede tomar unos segundos</p>
          </div>
        )

      case 'completado':
        return (
          <div className="py-8 flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-4 rounded-full bg-emerald-500/20"
            >
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white">¡Exportación Completada!</h3>
            {resultado && (
              <div className="text-center">
                <p className="text-slate-400">{resultado.nombreArchivo}</p>
                <p className="text-sm text-slate-500">
                  {resultado.registros} registros • {(resultado.tamaño / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => resultado && exportService.descargar(resultado)}
              className="mt-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar de nuevo
            </Button>
          </div>
        )
    }
  }

  // Navegación
  const pasos: PasoExport[] = ['formato', 'columnas', 'opciones', 'preview']
  const pasoIndex = pasos.indexOf(paso)

  const puedeAvanzar = () => {
    if (paso === 'columnas' && columnasSeleccionadas.size === 0) return false
    return true
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-violet-400" />
            {titulo}
          </DialogTitle>
          <DialogDescription>
            Configura y exporta tus datos en el formato que prefieras
          </DialogDescription>
        </DialogHeader>

        {/* Indicador de pasos */}
        {!['exportando', 'completado'].includes(paso) && (
          <div className="flex items-center justify-center gap-2 py-4">
            {pasos.map((p, i) => (
              <div key={p} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  i <= pasoIndex
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 text-slate-500"
                )}>
                  {i + 1}
                </div>
                {i < pasos.length - 1 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-1",
                    i < pasoIndex ? "bg-violet-600" : "bg-slate-700"
                  )} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Contenido */}
        <div className="min-h-[300px]">
          {renderPaso()}
        </div>

        {/* Footer */}
        {!['exportando', 'completado'].includes(paso) && (
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (pasoIndex > 0) {
                  setPaso(pasos[pasoIndex - 1])
                } else {
                  onOpenChange(false)
                }
              }}
              className="border-slate-700"
            >
              {pasoIndex === 0 ? 'Cancelar' : 'Anterior'}
            </Button>

            <Button
              onClick={() => {
                if (pasoIndex < pasos.length - 1) {
                  setPaso(pasos[pasoIndex + 1])
                } else {
                  handleExportar()
                }
              }}
              disabled={!puedeAvanzar()}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {pasoIndex === pasos.length - 1 ? (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        )}

        {paso === 'completado' && (
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Cerrar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
