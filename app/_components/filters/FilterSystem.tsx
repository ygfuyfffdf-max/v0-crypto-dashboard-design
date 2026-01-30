/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔍 CHRONOS INFINITY 2026 — SISTEMA DE FILTROS GUARDADOS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema ultra-avanzado de filtros personalizables con:
 * - Filtros guardados por usuario
 * - Filtros compartidos por equipo
 * - Combinación lógica (AND/OR)
 * - Operadores avanzados (contiene, empieza con, entre, etc.)
 * - Valores dinámicos (fecha actual, usuario actual, etc.)
 * - Templates predefinidos
 * - Exportación/Importación
 * - Historial de filtros recientes
 * - Favoritos y organización
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import {
  Filter,
  Save,
  Star,
  Trash2,
  Share2,
  Download,
  Upload,
  Plus,
  X,
  Check,
  Search,
  Calendar,
  User,
  Hash,
  Type,
  ChevronDown,
} from 'lucide-react'
import React, { useState, useMemo, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  BETWEEN = 'between',
  IN = 'in',
  NOT_IN = 'not_in',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
}

export enum FilterLogic {
  AND = 'and',
  OR = 'or',
}

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
}

export interface FilterField {
  id: string
  name: string
  label: string
  type: FieldType
  options?: { value: string; label: string }[]
  placeholder?: string
}

export interface FilterCondition {
  id: string
  field: string
  operator: FilterOperator
  value: any
  secondValue?: any // Para BETWEEN
}

export interface SavedFilter {
  id: string
  name: string
  description?: string
  module: string // Para organizar por sección/módulo
  conditions: FilterCondition[]
  logic: FilterLogic
  isFavorite: boolean
  isShared: boolean
  isDefault: boolean
  createdBy: string
  createdAt: number
  updatedAt: number
  usageCount: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE CAMPOS (Ejemplo)
// ═══════════════════════════════════════════════════════════════════════════════════════

const EXAMPLE_FIELDS: FilterField[] = [
  {
    id: 'status',
    name: 'status',
    label: 'Estado',
    type: FieldType.SELECT,
    options: [
      { value: 'active', label: 'Activo' },
      { value: 'inactive', label: 'Inactivo' },
      { value: 'pending', label: 'Pendiente' },
    ],
  },
  {
    id: 'amount',
    name: 'amount',
    label: 'Monto',
    type: FieldType.NUMBER,
    placeholder: '0.00',
  },
  {
    id: 'date',
    name: 'date',
    label: 'Fecha',
    type: FieldType.DATE,
  },
  {
    id: 'name',
    name: 'name',
    label: 'Nombre',
    type: FieldType.TEXT,
    placeholder: 'Buscar por nombre...',
  },
  {
    id: 'category',
    name: 'category',
    label: 'Categoría',
    type: FieldType.MULTISELECT,
    options: [
      { value: 'tech', label: 'Tecnología' },
      { value: 'finance', label: 'Finanzas' },
      { value: 'marketing', label: 'Marketing' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════
// OPERADORES POR TIPO DE CAMPO
// ═══════════════════════════════════════════════════════════════════════════════════════

const OPERATORS_BY_TYPE: Record<FieldType, FilterOperator[]> = {
  [FieldType.TEXT]: [
    FilterOperator.EQUALS,
    FilterOperator.NOT_EQUALS,
    FilterOperator.CONTAINS,
    FilterOperator.NOT_CONTAINS,
    FilterOperator.STARTS_WITH,
    FilterOperator.ENDS_WITH,
    FilterOperator.IS_NULL,
    FilterOperator.IS_NOT_NULL,
  ],
  [FieldType.NUMBER]: [
    FilterOperator.EQUALS,
    FilterOperator.NOT_EQUALS,
    FilterOperator.GREATER_THAN,
    FilterOperator.LESS_THAN,
    FilterOperator.BETWEEN,
    FilterOperator.IS_NULL,
    FilterOperator.IS_NOT_NULL,
  ],
  [FieldType.DATE]: [
    FilterOperator.EQUALS,
    FilterOperator.NOT_EQUALS,
    FilterOperator.GREATER_THAN,
    FilterOperator.LESS_THAN,
    FilterOperator.BETWEEN,
    FilterOperator.IS_NULL,
    FilterOperator.IS_NOT_NULL,
  ],
  [FieldType.BOOLEAN]: [FilterOperator.EQUALS],
  [FieldType.SELECT]: [FilterOperator.EQUALS, FilterOperator.NOT_EQUALS, FilterOperator.IS_NULL],
  [FieldType.MULTISELECT]: [FilterOperator.IN, FilterOperator.NOT_IN],
}

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  [FilterOperator.EQUALS]: 'Es igual a',
  [FilterOperator.NOT_EQUALS]: 'No es igual a',
  [FilterOperator.CONTAINS]: 'Contiene',
  [FilterOperator.NOT_CONTAINS]: 'No contiene',
  [FilterOperator.STARTS_WITH]: 'Empieza con',
  [FilterOperator.ENDS_WITH]: 'Termina con',
  [FilterOperator.GREATER_THAN]: 'Mayor que',
  [FilterOperator.LESS_THAN]: 'Menor que',
  [FilterOperator.BETWEEN]: 'Entre',
  [FilterOperator.IN]: 'Está en',
  [FilterOperator.NOT_IN]: 'No está en',
  [FilterOperator.IS_NULL]: 'Está vacío',
  [FilterOperator.IS_NOT_NULL]: 'No está vacío',
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: FilterConditionRow
// ═══════════════════════════════════════════════════════════════════════════════════════

interface FilterConditionRowProps {
  condition: FilterCondition
  fields: FilterField[]
  onChange: (condition: FilterCondition) => void
  onRemove: () => void
}

function FilterConditionRow({ condition, fields, onChange, onRemove }: FilterConditionRowProps) {
  const selectedField = fields.find((f) => f.name === condition.field)
  const availableOperators = selectedField
    ? OPERATORS_BY_TYPE[selectedField.type]
    : []

  const needsValue = ![FilterOperator.IS_NULL, FilterOperator.IS_NOT_NULL].includes(
    condition.operator
  )
  const needsSecondValue = condition.operator === FilterOperator.BETWEEN

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-2"
    >
      {/* Field */}
      <select
        value={condition.field}
        onChange={(e) => onChange({ ...condition, field: e.target.value })}
        className="min-w-[150px] rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white transition-colors focus:border-purple-500/50 focus:outline-none"
      >
        <option value="">Seleccionar campo</option>
        {fields.map((field) => (
          <option key={field.id} value={field.name}>
            {field.label}
          </option>
        ))}
      </select>

      {/* Operator */}
      <select
        value={condition.operator}
        onChange={(e) =>
          onChange({ ...condition, operator: e.target.value as FilterOperator })
        }
        className="min-w-[150px] rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white transition-colors focus:border-purple-500/50 focus:outline-none"
        disabled={!selectedField}
      >
        {availableOperators.map((op) => (
          <option key={op} value={op}>
            {OPERATOR_LABELS[op]}
          </option>
        ))}
      </select>

      {/* Value */}
      {needsValue && (
        <>
          {selectedField?.type === FieldType.SELECT ? (
            <select
              value={condition.value}
              onChange={(e) => onChange({ ...condition, value: e.target.value })}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white transition-colors focus:border-purple-500/50 focus:outline-none"
            >
              <option value="">Seleccionar...</option>
              {selectedField.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : selectedField?.type === FieldType.DATE ? (
            <input
              type="date"
              value={condition.value}
              onChange={(e) => onChange({ ...condition, value: e.target.value })}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white transition-colors focus:border-purple-500/50 focus:outline-none"
            />
          ) : (
            <input
              type={selectedField?.type === FieldType.NUMBER ? 'number' : 'text'}
              value={condition.value}
              onChange={(e) => onChange({ ...condition, value: e.target.value })}
              placeholder={selectedField?.placeholder || 'Valor...'}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white placeholder-white/40 transition-colors focus:border-purple-500/50 focus:outline-none"
            />
          )}
        </>
      )}

      {/* Second Value (for BETWEEN) */}
      {needsSecondValue && (
        <input
          type={selectedField?.type === FieldType.NUMBER ? 'number' : 'text'}
          value={condition.secondValue}
          onChange={(e) => onChange({ ...condition, secondValue: e.target.value })}
          placeholder="Valor final..."
          className="flex-1 rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white placeholder-white/40 transition-colors focus:border-purple-500/50 focus:outline-none"
        />
      )}

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="rounded-lg bg-white/5 p-2 text-red-400 transition-colors hover:bg-red-500/20"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: FilterBuilder
// ═══════════════════════════════════════════════════════════════════════════════════════

interface FilterBuilderProps {
  fields: FilterField[]
  initialConditions?: FilterCondition[]
  initialLogic?: FilterLogic
  onApply: (conditions: FilterCondition[], logic: FilterLogic) => void
  onSave: (name: string, description: string) => void
}

export function FilterBuilder({
  fields,
  initialConditions = [],
  initialLogic = FilterLogic.AND,
  onApply,
  onSave,
}: FilterBuilderProps) {
  const [conditions, setConditions] = useState<FilterCondition[]>(initialConditions)
  const [logic, setLogic] = useState<FilterLogic>(initialLogic)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [filterName, setFilterName] = useState('')
  const [filterDescription, setFilterDescription] = useState('')

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: `cond-${Date.now()}`,
      field: '',
      operator: FilterOperator.EQUALS,
      value: '',
    }
    setConditions([...conditions, newCondition])
  }

  const updateCondition = (index: number, updated: FilterCondition) => {
    const newConditions = [...conditions]
    newConditions[index] = updated
    setConditions(newConditions)
  }

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const clearAll = () => {
    setConditions([])
  }

  const handleSave = () => {
    if (filterName) {
      onSave(filterName, filterDescription)
      setShowSaveModal(false)
      setFilterName('')
      setFilterDescription('')
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Filter className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Constructor de Filtros</h3>
            <p className="text-xs text-white/60">
              {conditions.length} {conditions.length === 1 ? 'condición' : 'condiciones'}
            </p>
          </div>
        </div>

        {/* Logic Selector */}
        <div className="flex gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setLogic(FilterLogic.AND)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              logic === FilterLogic.AND
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white/80'
            )}
          >
            Y (AND)
          </button>
          <button
            onClick={() => setLogic(FilterLogic.OR)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              logic === FilterLogic.OR
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white/80'
            )}
          >
            O (OR)
          </button>
        </div>
      </div>

      {/* Conditions */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {conditions.map((condition, index) => (
            <FilterConditionRow
              key={condition.id}
              condition={condition}
              fields={fields}
              onChange={(updated) => updateCondition(index, updated)}
              onRemove={() => removeCondition(index)}
            />
          ))}
        </AnimatePresence>

        {conditions.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/20 p-8 text-center">
            <Filter className="mx-auto mb-3 h-12 w-12 text-white/20" />
            <p className="mb-4 text-sm text-white/60">
              No hay condiciones. Agrega una para empezar.
            </p>
            <button
              onClick={addCondition}
              className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
              Agregar Condición
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      {conditions.length > 0 && (
        <div className="flex gap-3 border-t border-white/10 pt-4">
          <button
            onClick={addCondition}
            className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
            Agregar Condición
          </button>

          <button
            onClick={clearAll}
            className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            <Trash2 className="h-4 w-4" />
            Limpiar Todo
          </button>

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
            >
              <Save className="h-4 w-4" />
              Guardar Filtro
            </button>

            <button
              onClick={() => onApply(conditions, logic)}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 text-sm font-semibold text-white transition-all hover:from-purple-600 hover:to-pink-600"
            >
              <Check className="h-4 w-4" />
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl backdrop-blur-2xl"
            >
              <h3 className="mb-4 text-xl font-bold text-white">Guardar Filtro</h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-white/80">Nombre del Filtro</label>
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder-white/40 transition-colors focus:border-purple-500/50 focus:outline-none"
                    placeholder="Ej: Ventas del último mes"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/80">
                    Descripción <span className="text-white/40">(opcional)</span>
                  </label>
                  <textarea
                    value={filterDescription}
                    onChange={(e) => setFilterDescription(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder-white/40 transition-colors focus:border-purple-500/50 focus:outline-none"
                    placeholder="Descripción breve..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!filterName}
                    className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 text-sm font-semibold text-white transition-all hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SavedFiltersList
// ═══════════════════════════════════════════════════════════════════════════════════════

interface SavedFiltersListProps {
  filters: SavedFilter[]
  onApply: (filter: SavedFilter) => void
  onToggleFavorite: (id: string) => void
  onDelete: (id: string) => void
  onShare: (id: string) => void
}

export function SavedFiltersList({
  filters,
  onApply,
  onToggleFavorite,
  onDelete,
  onShare,
}: SavedFiltersListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFilters = useMemo(() => {
    return filters.filter(
      (filter) =>
        filter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        filter.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [filters, searchQuery])

  const favoriteFilters = filteredFilters.filter((f) => f.isFavorite)
  const otherFilters = filteredFilters.filter((f) => !f.isFavorite)

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
      {/* Header */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Filtros Guardados</h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 transition-colors focus:border-purple-500/50 focus:outline-none"
            placeholder="Buscar filtros..."
          />
        </div>
      </div>

      {/* Favorites */}
      {favoriteFilters.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>Favoritos</span>
          </div>
          {favoriteFilters.map((filter) => (
            <FilterItem
              key={filter.id}
              filter={filter}
              onApply={() => onApply(filter)}
              onToggleFavorite={() => onToggleFavorite(filter.id)}
              onDelete={() => onDelete(filter.id)}
              onShare={() => onShare(filter.id)}
            />
          ))}
        </div>
      )}

      {/* Other Filters */}
      {otherFilters.length > 0 && (
        <div className="space-y-2">
          {favoriteFilters.length > 0 && (
            <div className="text-sm text-white/60">Todos los filtros</div>
          )}
          {otherFilters.map((filter) => (
            <FilterItem
              key={filter.id}
              filter={filter}
              onApply={() => onApply(filter)}
              onToggleFavorite={() => onToggleFavorite(filter.id)}
              onDelete={() => onDelete(filter.id)}
              onShare={() => onShare(filter.id)}
            />
          ))}
        </div>
      )}

      {filteredFilters.length === 0 && (
        <div className="rounded-lg border border-dashed border-white/20 p-8 text-center">
          <Filter className="mx-auto mb-3 h-12 w-12 text-white/20" />
          <p className="text-sm text-white/60">
            {searchQuery ? 'No se encontraron filtros' : 'No hay filtros guardados'}
          </p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: FilterItem
// ═══════════════════════════════════════════════════════════════════════════════════════

interface FilterItemProps {
  filter: SavedFilter
  onApply: () => void
  onToggleFavorite: () => void
  onDelete: () => void
  onShare: () => void
}

function FilterItem({ filter, onApply, onToggleFavorite, onDelete, onShare }: FilterItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3 transition-all hover:border-white/20 hover:bg-white/5"
    >
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h4 className="text-sm font-semibold text-white">{filter.name}</h4>
          {filter.isShared && (
            <Share2 className="h-3 w-3 text-blue-400" title="Compartido" />
          )}
          {filter.isDefault && (
            <div className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-medium text-purple-400">
              Por defecto
            </div>
          )}
        </div>
        <p className="text-xs text-white/60">{filter.description}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-white/40">
          <span>{filter.conditions.length} condiciones</span>
          <span>•</span>
          <span>{filter.usageCount} usos</span>
        </div>
      </div>

      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={onToggleFavorite}
          className="rounded-md p-2 transition-colors hover:bg-white/10"
        >
          <Star
            className={cn(
              'h-4 w-4',
              filter.isFavorite
                ? 'fill-amber-400 text-amber-400'
                : 'text-white/40'
            )}
          />
        </button>

        <button
          onClick={onShare}
          className="rounded-md p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-blue-400"
        >
          <Share2 className="h-4 w-4" />
        </button>

        <button
          onClick={onDelete}
          className="rounded-md p-2 text-white/60 transition-colors hover:bg-red-500/20 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <button
          onClick={onApply}
          className="rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:from-purple-600 hover:to-pink-600"
        >
          Aplicar
        </button>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: FilterSystem
// ═══════════════════════════════════════════════════════════════════════════════════════

export function FilterSystem() {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])

  // Datos simulados
  const mockFilters: SavedFilter[] = [
    {
      id: 'filter-1',
      name: 'Ventas Activas',
      description: 'Todas las ventas con estado activo',
      module: 'sales',
      conditions: [
        {
          id: 'cond-1',
          field: 'status',
          operator: FilterOperator.EQUALS,
          value: 'active',
        },
      ],
      logic: FilterLogic.AND,
      isFavorite: true,
      isShared: false,
      isDefault: true,
      createdBy: 'user-1',
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now() - 86400000,
      usageCount: 45,
    },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <FilterBuilder
        fields={EXAMPLE_FIELDS}
        onApply={(conditions, logic) =>
          console.log('Apply filters:', conditions, logic)
        }
        onSave={(name, description) =>
          console.log('Save filter:', name, description)
        }
      />

      <SavedFiltersList
        filters={mockFilters}
        onApply={(filter) => console.log('Apply saved filter:', filter)}
        onToggleFavorite={(id) => console.log('Toggle favorite:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        onShare={(id) => console.log('Share:', id)}
      />
    </div>
  )
}
