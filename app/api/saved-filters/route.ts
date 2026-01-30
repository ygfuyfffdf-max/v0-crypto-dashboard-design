/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔍 CHRONOS INFINITY 2026 — API ROUTE: FILTROS GUARDADOS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Endpoints CRUD para sistema de filtros personalizables
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

enum FilterOperator {
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

enum FilterLogic {
  AND = 'and',
  OR = 'or',
}

interface FilterCondition {
  id: string
  field: string
  operator: FilterOperator
  value: any
  secondValue?: any
}

interface SavedFilter {
  id: string
  name: string
  description?: string
  module: string
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
// DATOS EN MEMORIA
// ═══════════════════════════════════════════════════════════════════════════════════════

const filters: Map<string, SavedFilter> = new Map([
  ['filter-1', {
    id: 'filter-1',
    name: 'Ventas Activas',
    description: 'Todas las ventas con estado activo del mes actual',
    module: 'sales',
    conditions: [
      { id: 'cond-1', field: 'status', operator: FilterOperator.EQUALS, value: 'active' },
      { id: 'cond-2', field: 'date', operator: FilterOperator.GREATER_THAN, value: '2026-01-01' },
    ],
    logic: FilterLogic.AND,
    isFavorite: true,
    isShared: false,
    isDefault: true,
    createdBy: 'admin',
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000,
    usageCount: 156,
  }],
  ['filter-2', {
    id: 'filter-2',
    name: 'Clientes VIP',
    description: 'Clientes con más de $100,000 en compras',
    module: 'clients',
    conditions: [
      { id: 'cond-1', field: 'totalPurchases', operator: FilterOperator.GREATER_THAN, value: 100000 },
      { id: 'cond-2', field: 'status', operator: FilterOperator.NOT_EQUALS, value: 'inactive' },
    ],
    logic: FilterLogic.AND,
    isFavorite: true,
    isShared: true,
    isDefault: false,
    createdBy: 'admin',
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 86400000 * 10,
    usageCount: 89,
  }],
  ['filter-3', {
    id: 'filter-3',
    name: 'Inventario Bajo',
    description: 'Productos con stock menor a 10 unidades',
    module: 'inventory',
    conditions: [
      { id: 'cond-1', field: 'stock', operator: FilterOperator.LESS_THAN, value: 10 },
    ],
    logic: FilterLogic.AND,
    isFavorite: false,
    isShared: true,
    isDefault: false,
    createdBy: 'warehouse',
    createdAt: Date.now() - 86400000 * 90,
    updatedAt: Date.now() - 86400000 * 5,
    usageCount: 234,
  }],
  ['filter-4', {
    id: 'filter-4',
    name: 'Transacciones Pendientes',
    description: 'Todas las transacciones sin procesar',
    module: 'transactions',
    conditions: [
      { id: 'cond-1', field: 'status', operator: FilterOperator.IN, value: ['pending', 'processing'] },
    ],
    logic: FilterLogic.AND,
    isFavorite: false,
    isShared: false,
    isDefault: true,
    createdBy: 'admin',
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000 * 2,
    usageCount: 78,
  }],
])

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GET: Listar/Obtener filtros
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const module = searchParams.get('module')
  const userId = searchParams.get('userId')
  const favorites = searchParams.get('favorites') === 'true'
  const shared = searchParams.get('shared') === 'true'

  try {
    // Obtener un filtro específico
    if (id) {
      const filter = filters.get(id)
      if (!filter) {
        return NextResponse.json(
          { success: false, error: 'Filter not found' },
          { status: 404 }
        )
      }
      
      // Incrementar contador de uso
      filter.usageCount++
      filters.set(id, filter)
      
      return NextResponse.json({ success: true, data: filter })
    }

    // Filtrar lista
    let allFilters = Array.from(filters.values())
    
    if (module) {
      allFilters = allFilters.filter(f => f.module === module)
    }
    
    if (userId) {
      allFilters = allFilters.filter(f => f.createdBy === userId || f.isShared)
    }
    
    if (favorites) {
      allFilters = allFilters.filter(f => f.isFavorite)
    }
    
    if (shared) {
      allFilters = allFilters.filter(f => f.isShared)
    }

    // Ordenar por más usado y favoritos primero
    allFilters.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1
      if (!a.isFavorite && b.isFavorite) return 1
      return b.usageCount - a.usageCount
    })

    return NextResponse.json({
      success: true,
      data: allFilters,
      total: allFilters.length,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch filters' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// POST: Crear nuevo filtro
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      module,
      conditions,
      logic = FilterLogic.AND,
      isFavorite = false,
      isShared = false,
      isDefault = false,
      createdBy = 'admin',
    } = body

    if (!name || !module || !conditions?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (name, module, conditions)' },
        { status: 400 }
      )
    }

    // Si es default, quitar default de otros filtros del mismo módulo
    if (isDefault) {
      for (const [id, filter] of filters) {
        if (filter.module === module && filter.isDefault) {
          filter.isDefault = false
          filters.set(id, filter)
        }
      }
    }

    const id = generateId('filter')
    const newFilter: SavedFilter = {
      id,
      name,
      description,
      module,
      conditions: conditions.map((c: any, i: number) => ({
        ...c,
        id: c.id || `cond-${i + 1}`,
      })),
      logic,
      isFavorite,
      isShared,
      isDefault,
      createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      usageCount: 0,
    }

    filters.set(id, newFilter)

    return NextResponse.json({
      success: true,
      data: newFilter,
      message: 'Filter created successfully',
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create filter' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PATCH: Actualizar filtro
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }

    const filter = filters.get(id)
    if (!filter) {
      return NextResponse.json(
        { success: false, error: 'Filter not found' },
        { status: 404 }
      )
    }

    // Si se establece como default, quitar default de otros
    if (updates.isDefault) {
      for (const [otherId, otherFilter] of filters) {
        if (otherId !== id && otherFilter.module === filter.module && otherFilter.isDefault) {
          otherFilter.isDefault = false
          filters.set(otherId, otherFilter)
        }
      }
    }

    const updatedFilter: SavedFilter = {
      ...filter,
      ...updates,
      updatedAt: Date.now(),
    }

    filters.set(id, updatedFilter)

    return NextResponse.json({
      success: true,
      data: updatedFilter,
      message: 'Filter updated successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update filter' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DELETE: Eliminar filtro
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID is required' },
      { status: 400 }
    )
  }

  try {
    if (!filters.has(id)) {
      return NextResponse.json(
        { success: false, error: 'Filter not found' },
        { status: 404 }
      )
    }

    filters.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Filter deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete filter' },
      { status: 500 }
    )
  }
}
