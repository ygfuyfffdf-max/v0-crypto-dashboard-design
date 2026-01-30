'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 👥 ROLE PERMISSIONS MANAGER — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Componente visual para crear y gestionar roles con permisos granulares:
 * - Creación de roles personalizados
 * - Asignación de permisos por módulo
 * - Restricciones por banco, horario, monto
 * - Preview de permisos en tiempo real
 * - Templates de roles predefinidos
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useState } from 'react'
import {
  AlertCircle, Building2, Calendar, Check, ChevronDown, ChevronRight,
  Clock, Copy, Crown, DollarSign, Edit, Eye, EyeOff, Folder, Hash,
  Info, Key, Layers, Lock, LockOpen, MapPin, Plus, Save, Search,
  Settings, Shield, ShieldAlert, ShieldCheck, ShieldOff, Sparkles,
  Trash2, User, UserCog, Users, Wand2, X, Zap
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type BancoId = 'boveda_monte' | 'boveda_usa' | 'profit' | 'leftie' | 'azteca' | 'flete_sur' | 'utilidades'
type Modulo = 'bancos' | 'ventas' | 'clientes' | 'distribuidores' | 'almacen' | 'ordenes' | 'reportes' | 'configuracion' | 'usuarios' | 'auditoria'
type Accion = 'ver' | 'crear' | 'editar' | 'eliminar' | 'exportar' | 'aprobar' | 'ingreso' | 'gasto' | 'transferir'

interface Permiso {
  id: string
  modulo: Modulo
  accion: Accion
  activo: boolean
  restricciones: {
    bancos: BancoId[]
    montoMaximo?: number
    limiteDiario?: number
    horaInicio?: string
    horaFin?: string
    diasPermitidos?: number[]
    requiereAprobacion: boolean
  }
}

interface Rol {
  id: string
  nombre: string
  codigo: string
  descripcion: string
  color: string
  icono: string
  esAdmin: boolean
  activo: boolean
  permisos: Permiso[]
}

interface RolePermissionsManagerProps {
  roles: Rol[]
  onSaveRole: (rol: Rol) => void
  onDeleteRole: (id: string) => void
  onCreateRole: (rol: Omit<Rol, 'id'>) => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const BANCOS = [
  { id: 'boveda_monte', nombre: 'Bóveda Monte', color: '#FFD700' },
  { id: 'boveda_usa', nombre: 'Bóveda USA', color: '#228B22' },
  { id: 'profit', nombre: 'Profit', color: '#8B5CF6' },
  { id: 'leftie', nombre: 'Leftie', color: '#FF1493' },
  { id: 'azteca', nombre: 'Azteca', color: '#FF4500' },
  { id: 'flete_sur', nombre: 'Flete Sur', color: '#00CED1' },
  { id: 'utilidades', nombre: 'Utilidades', color: '#32CD32' },
] as const

const MODULOS = [
  { id: 'bancos', nombre: 'Bancos & Bóvedas', icono: Building2, acciones: ['ver', 'ingreso', 'gasto', 'transferir', 'exportar'] },
  { id: 'ventas', nombre: 'Ventas', icono: DollarSign, acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
  { id: 'clientes', nombre: 'Clientes', icono: Users, acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
  { id: 'distribuidores', nombre: 'Distribuidores', icono: Users, acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
  { id: 'almacen', nombre: 'Almacén', icono: Folder, acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
  { id: 'ordenes', nombre: 'Órdenes de Compra', icono: Folder, acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'] },
  { id: 'reportes', nombre: 'Reportes', icono: Layers, acciones: ['ver', 'crear', 'exportar'] },
  { id: 'configuracion', nombre: 'Configuración', icono: Settings, acciones: ['ver', 'editar'] },
  { id: 'usuarios', nombre: 'Usuarios', icono: UserCog, acciones: ['ver', 'crear', 'editar', 'eliminar'] },
  { id: 'auditoria', nombre: 'Auditoría', icono: Eye, acciones: ['ver', 'exportar'] },
] as const

const COLORES_ROL = [
  { value: '#8B5CF6', label: 'Violeta' },
  { value: '#10B981', label: 'Esmeralda' },
  { value: '#F59E0B', label: 'Ámbar' },
  { value: '#EF4444', label: 'Rojo' },
  { value: '#3B82F6', label: 'Azul' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#84CC16', label: 'Lima' },
]

const ICONOS_ROL = [
  { value: 'shield', icon: Shield, label: 'Escudo' },
  { value: 'shield-check', icon: ShieldCheck, label: 'Escudo Check' },
  { value: 'crown', icon: Crown, label: 'Corona' },
  { value: 'user-cog', icon: UserCog, label: 'Usuario Config' },
  { value: 'key', icon: Key, label: 'Llave' },
  { value: 'eye', icon: Eye, label: 'Ojo' },
  { value: 'zap', icon: Zap, label: 'Rayo' },
  { value: 'star', icon: Sparkles, label: 'Estrella' },
]

const TEMPLATES_ROL = [
  {
    nombre: 'Cajero de Bóveda',
    descripcion: 'Solo puede registrar ingresos en una bóveda específica',
    codigo: 'cajero',
    color: '#10B981',
    icono: 'shield',
    permisoBase: { modulo: 'bancos', acciones: ['ver', 'ingreso'] },
  },
  {
    nombre: 'Pagador de Distribuidores',
    descripcion: 'Solo puede realizar pagos a distribuidores',
    codigo: 'pagador',
    color: '#F59E0B',
    icono: 'shield-check',
    permisoBase: { modulo: 'bancos', acciones: ['ver', 'gasto'] },
  },
  {
    nombre: 'Tesorero',
    descripcion: 'Puede realizar transferencias entre bóvedas',
    codigo: 'tesorero',
    color: '#8B5CF6',
    icono: 'crown',
    permisoBase: { modulo: 'bancos', acciones: ['ver', 'transferir'] },
  },
  {
    nombre: 'Visor de Reportes',
    descripcion: 'Solo puede ver información y exportar reportes',
    codigo: 'visor',
    color: '#3B82F6',
    icono: 'eye',
    permisoBase: { modulo: 'reportes', acciones: ['ver', 'exportar'] },
  },
]

const DIAS_SEMANA = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ROLE CARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface RoleCardProps {
  rol: Rol
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

const RoleCard = memo(function RoleCard({ rol, isSelected, onSelect, onEdit, onDelete }: RoleCardProps) {
  const IconComponent = ICONOS_ROL.find(i => i.value === rol.icono)?.icon || Shield
  const permisosActivos = rol.permisos.filter(p => p.activo).length

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-4 cursor-pointer transition-all',
        isSelected
          ? 'border-violet-500/50 bg-violet-500/10 ring-2 ring-violet-500/30'
          : 'border-white/10 bg-white/5 hover:border-white/20'
      )}
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Admin Badge */}
      {rol.esAdmin && (
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-1 text-xs text-amber-400">
          <Crown className="h-3 w-3" />
          Admin
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div
          className="p-2.5 rounded-xl"
          style={{ backgroundColor: `${rol.color}20` }}
        >
          <IconComponent className="h-5 w-5" style={{ color: rol.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white truncate">{rol.nombre}</h3>
          <p className="text-xs text-white/50 truncate">{rol.codigo}</p>
        </div>
      </div>

      <p className="text-xs text-white/60 line-clamp-2 mb-3">{rol.descripcion}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">{permisosActivos} permisos</span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
          >
            <Edit className="h-4 w-4" />
          </button>
          {!rol.esAdmin && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PERMISSION EDITOR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PermisoEditorProps {
  permiso: Permiso
  onChange: (permiso: Permiso) => void
}

const PermisoEditor = memo(function PermisoEditor({ permiso, onChange }: PermisoEditorProps) {
  const [expanded, setExpanded] = useState(false)
  const modulo = MODULOS.find(m => m.id === permiso.modulo)
  const ModuloIcon = modulo?.icono || Folder

  const toggleActivo = () => {
    onChange({ ...permiso, activo: !permiso.activo })
  }

  const toggleBanco = (bancoId: BancoId) => {
    const bancos = [...permiso.restricciones.bancos]
    const index = bancos.indexOf(bancoId)
    if (index >= 0) {
      bancos.splice(index, 1)
    } else {
      bancos.push(bancoId)
    }
    onChange({ ...permiso, restricciones: { ...permiso.restricciones, bancos } })
  }

  const toggleDia = (dia: number) => {
    const dias = [...(permiso.restricciones.diasPermitidos || [])]
    const index = dias.indexOf(dia)
    if (index >= 0) {
      dias.splice(index, 1)
    } else {
      dias.push(dia)
    }
    onChange({ ...permiso, restricciones: { ...permiso.restricciones, diasPermitidos: dias } })
  }

  return (
    <div className={cn(
      'rounded-xl border transition-all',
      permiso.activo ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02]'
    )}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); toggleActivo() }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              permiso.activo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'
            )}
          >
            {permiso.activo ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
          <div className="flex items-center gap-2">
            <ModuloIcon className="h-4 w-4 text-white/50" />
            <span className="text-sm text-white font-medium capitalize">{permiso.accion}</span>
            <span className="text-xs text-white/40">en {modulo?.nombre}</span>
          </div>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-white/40 transition-transform', expanded && 'rotate-180')} />
      </div>

      {/* Expanded Restrictions */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4">
              {/* Bancos */}
              {permiso.modulo === 'bancos' && (
                <div>
                  <label className="text-xs text-white/50 mb-2 block flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Bancos Permitidos (vacío = todos)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BANCOS.map((banco) => {
                      const isSelected = permiso.restricciones.bancos.includes(banco.id as BancoId)
                      return (
                        <button
                          key={banco.id}
                          onClick={() => toggleBanco(banco.id as BancoId)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                            isSelected
                              ? 'ring-2 ring-offset-2 ring-offset-slate-900'
                              : 'opacity-50 hover:opacity-100'
                          )}
                          style={{
                            backgroundColor: `${banco.color}20`,
                            color: banco.color,
                            ...(isSelected && { ringColor: banco.color })
                          }}
                        >
                          {banco.nombre}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Límites de Monto */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 mb-2 block flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Monto Máximo por Operación
                  </label>
                  <input
                    type="number"
                    value={permiso.restricciones.montoMaximo || ''}
                    onChange={(e) => onChange({
                      ...permiso,
                      restricciones: { ...permiso.restricciones, montoMaximo: Number(e.target.value) || undefined }
                    })}
                    placeholder="Sin límite"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-violet-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-2 block flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Límite Diario
                  </label>
                  <input
                    type="number"
                    value={permiso.restricciones.limiteDiario || ''}
                    onChange={(e) => onChange({
                      ...permiso,
                      restricciones: { ...permiso.restricciones, limiteDiario: Number(e.target.value) || undefined }
                    })}
                    placeholder="Sin límite"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-violet-500/50 outline-none"
                  />
                </div>
              </div>

              {/* Horario */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 mb-2 block flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={permiso.restricciones.horaInicio || ''}
                    onChange={(e) => onChange({
                      ...permiso,
                      restricciones: { ...permiso.restricciones, horaInicio: e.target.value || undefined }
                    })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-2 block flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={permiso.restricciones.horaFin || ''}
                    onChange={(e) => onChange({
                      ...permiso,
                      restricciones: { ...permiso.restricciones, horaFin: e.target.value || undefined }
                    })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-500/50 outline-none"
                  />
                </div>
              </div>

              {/* Días */}
              <div>
                <label className="text-xs text-white/50 mb-2 block flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Días Permitidos
                </label>
                <div className="flex gap-2">
                  {DIAS_SEMANA.map((dia) => {
                    const isSelected = permiso.restricciones.diasPermitidos?.includes(dia.value)
                    return (
                      <button
                        key={dia.value}
                        onClick={() => toggleDia(dia.value)}
                        className={cn(
                          'w-10 h-10 rounded-lg text-xs font-medium transition-all',
                          isSelected
                            ? 'bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/50'
                            : 'bg-white/5 text-white/50 hover:bg-white/10'
                        )}
                      >
                        {dia.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Requiere Aprobación */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permiso.restricciones.requiereAprobacion}
                  onChange={(e) => onChange({
                    ...permiso,
                    restricciones: { ...permiso.restricciones, requiereAprobacion: e.target.checked }
                  })}
                  className="rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/30"
                />
                <span className="text-sm text-white/70">
                  Requiere aprobación de supervisor
                </span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ROLE EDITOR MODAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface RoleEditorModalProps {
  rol: Rol | null
  isOpen: boolean
  onClose: () => void
  onSave: (rol: Rol) => void
  isNew?: boolean
}

function RoleEditorModal({ rol, isOpen, onClose, onSave, isNew }: RoleEditorModalProps) {
  const [editedRol, setEditedRol] = useState<Rol | null>(rol)
  const [activeSection, setActiveSection] = useState<'basic' | 'permisos'>('basic')

  // Reset when rol changes
  useState(() => {
    setEditedRol(rol)
  })

  if (!isOpen || !editedRol) return null

  const handlePermisoChange = (index: number, permiso: Permiso) => {
    const newPermisos = [...editedRol.permisos]
    newPermisos[index] = permiso
    setEditedRol({ ...editedRol, permisos: newPermisos })
  }

  const addPermiso = (modulo: Modulo, accion: Accion) => {
    const newPermiso: Permiso = {
      id: `${modulo}_${accion}_${Date.now()}`,
      modulo,
      accion,
      activo: true,
      restricciones: {
        bancos: [],
        requiereAprobacion: false,
      },
    }
    setEditedRol({ ...editedRol, permisos: [...editedRol.permisos, newPermiso] })
  }

  const removePermiso = (index: number) => {
    const newPermisos = editedRol.permisos.filter((_, i) => i !== index)
    setEditedRol({ ...editedRol, permisos: newPermisos })
  }

  const handleSave = () => {
    onSave(editedRol)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-xl"
                style={{ backgroundColor: `${editedRol.color}20` }}
              >
                {(() => {
                  const IconComp = ICONOS_ROL.find(i => i.value === editedRol.icono)?.icon || Shield
                  return <IconComp className="h-6 w-6" style={{ color: editedRol.color }} />
                })()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isNew ? 'Crear Nuevo Rol' : 'Editar Rol'}
                </h2>
                <p className="text-sm text-white/50">{editedRol.nombre || 'Sin nombre'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-6 py-3 border-b border-white/10">
            <button
              onClick={() => setActiveSection('basic')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeSection === 'basic'
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-white/50 hover:text-white/70'
              )}
            >
              Información Básica
            </button>
            <button
              onClick={() => setActiveSection('permisos')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeSection === 'permisos'
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-white/50 hover:text-white/70'
              )}
            >
              Permisos ({editedRol.permisos.filter(p => p.activo).length})
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeSection === 'basic' && (
              <div className="space-y-6">
                {/* Nombre y Código */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">Nombre del Rol</label>
                    <input
                      type="text"
                      value={editedRol.nombre}
                      onChange={(e) => setEditedRol({ ...editedRol, nombre: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-violet-500/50 outline-none"
                      placeholder="Ej: Cajero Profit"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">Código (slug)</label>
                    <input
                      type="text"
                      value={editedRol.codigo}
                      onChange={(e) => setEditedRol({ ...editedRol, codigo: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white font-mono placeholder:text-white/30 focus:border-violet-500/50 outline-none"
                      placeholder="cajero_profit"
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="text-sm text-white/70 mb-2 block">Descripción</label>
                  <textarea
                    value={editedRol.descripcion}
                    onChange={(e) => setEditedRol({ ...editedRol, descripcion: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-violet-500/50 outline-none resize-none"
                    placeholder="Describe las responsabilidades de este rol..."
                  />
                </div>

                {/* Color e Icono */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {COLORES_ROL.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setEditedRol({ ...editedRol, color: c.value })}
                          className={cn(
                            'w-10 h-10 rounded-xl transition-all',
                            editedRol.color === c.value && 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                          )}
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">Icono</label>
                    <div className="flex gap-2 flex-wrap">
                      {ICONOS_ROL.map((i) => {
                        const IconComp = i.icon
                        return (
                          <button
                            key={i.value}
                            onClick={() => setEditedRol({ ...editedRol, icono: i.value })}
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                              editedRol.icono === i.value
                                ? 'bg-violet-500/20 text-violet-400 ring-2 ring-violet-500/50'
                                : 'bg-white/5 text-white/50 hover:bg-white/10'
                            )}
                            title={i.label}
                          >
                            <IconComp className="h-5 w-5" />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Admin Toggle */}
                <label className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedRol.esAdmin}
                    onChange={(e) => setEditedRol({ ...editedRol, esAdmin: e.target.checked })}
                    className="rounded border-amber-500/50 bg-amber-500/10 text-amber-500 focus:ring-amber-500/30"
                  />
                  <div>
                    <p className="text-sm font-medium text-amber-400 flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      Rol de Administrador
                    </p>
                    <p className="text-xs text-amber-400/70">
                      Los administradores tienen acceso completo a todas las funciones
                    </p>
                  </div>
                </label>
              </div>
            )}

            {activeSection === 'permisos' && (
              <div className="space-y-4">
                {/* Quick Add */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-white/70 mb-3 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar Permisos
                  </p>
                  <div className="space-y-2">
                    {MODULOS.map((modulo) => {
                      const ModIcon = modulo.icono
                      return (
                        <div key={modulo.id} className="flex items-center gap-2">
                          <span className="flex items-center gap-2 text-xs text-white/50 w-40">
                            <ModIcon className="h-3 w-3" />
                            {modulo.nombre}
                          </span>
                          <div className="flex gap-1 flex-wrap">
                            {modulo.acciones.map((accion) => {
                              const exists = editedRol.permisos.some(p => p.modulo === modulo.id && p.accion === accion)
                              return (
                                <button
                                  key={accion}
                                  onClick={() => !exists && addPermiso(modulo.id as Modulo, accion as Accion)}
                                  disabled={exists}
                                  className={cn(
                                    'px-2 py-1 rounded text-xs transition-all',
                                    exists
                                      ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                                      : 'bg-white/10 text-white/50 hover:bg-violet-500/20 hover:text-violet-400'
                                  )}
                                >
                                  {accion}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Permisos List */}
                <div className="space-y-2">
                  {editedRol.permisos.map((permiso, index) => (
                    <div key={permiso.id} className="relative">
                      <PermisoEditor
                        permiso={permiso}
                        onChange={(p) => handlePermisoChange(index, p)}
                      />
                      <button
                        onClick={() => removePermiso(index)}
                        className="absolute top-4 right-14 p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {editedRol.permisos.length === 0 && (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">Sin permisos configurados</p>
                    <p className="text-xs text-white/30 mt-1">
                      Usa el panel de arriba para agregar permisos
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-white/10 p-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-white/70 hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-violet-500 text-white hover:bg-violet-600"
            >
              <Save className="h-4 w-4" />
              Guardar Rol
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function RolePermissionsManager({
  roles,
  onSaveRole,
  onDeleteRole,
  onCreateRole,
}: RolePermissionsManagerProps) {
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRoles = roles.filter(r =>
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateFromTemplate = (template: typeof TEMPLATES_ROL[0]) => {
    const newRol: Rol = {
      id: '',
      nombre: template.nombre,
      codigo: template.codigo,
      descripcion: template.descripcion,
      color: template.color,
      icono: template.icono,
      esAdmin: false,
      activo: true,
      permisos: template.permisoBase.acciones.map((accion, i) => ({
        id: `temp_${i}`,
        modulo: template.permisoBase.modulo as Modulo,
        accion: accion as Accion,
        activo: true,
        restricciones: { bancos: [], requiereAprobacion: false },
      })),
    }
    setSelectedRol(newRol)
    setIsCreating(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-violet-400" />
            Gestión de Roles y Permisos
          </h2>
          <p className="text-sm text-white/50">
            Crea roles personalizados con permisos granulares
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar rol..."
              className="w-[200px] rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-violet-500/50 outline-none"
            />
          </div>
          <button
            onClick={() => {
              setSelectedRol({
                id: '',
                nombre: '',
                codigo: '',
                descripcion: '',
                color: '#8B5CF6',
                icono: 'shield',
                esAdmin: false,
                activo: true,
                permisos: [],
              })
              setIsCreating(true)
            }}
            className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
          >
            <Plus className="h-4 w-4" />
            Crear Rol
          </button>
        </div>
      </div>

      {/* Templates */}
      <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
        <p className="text-sm text-white/70 mb-3 flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-violet-400" />
          Templates de Roles Predefinidos
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TEMPLATES_ROL.map((template) => (
            <button
              key={template.codigo}
              onClick={() => handleCreateFromTemplate(template)}
              className="p-3 rounded-xl border border-white/10 bg-white/5 text-left hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
            >
              <p className="text-sm font-medium text-white">{template.nombre}</p>
              <p className="text-xs text-white/50 line-clamp-2 mt-1">{template.descripcion}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRoles.map((rol) => (
          <RoleCard
            key={rol.id}
            rol={rol}
            isSelected={selectedRol?.id === rol.id}
            onSelect={() => setSelectedRol(rol)}
            onEdit={() => {
              setSelectedRol(rol)
              setIsEditing(true)
            }}
            onDelete={() => {
              if (confirm(`¿Eliminar el rol "${rol.nombre}"?`)) {
                onDeleteRole(rol.id)
              }
            }}
          />
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">No se encontraron roles</p>
        </div>
      )}

      {/* Editor Modal */}
      <RoleEditorModal
        rol={selectedRol}
        isOpen={isEditing || isCreating}
        onClose={() => {
          setIsEditing(false)
          setIsCreating(false)
        }}
        onSave={(rol) => {
          if (isCreating) {
            onCreateRole(rol)
          } else {
            onSaveRole(rol)
          }
        }}
        isNew={isCreating}
      />
    </div>
  )
}

export default RolePermissionsManager
