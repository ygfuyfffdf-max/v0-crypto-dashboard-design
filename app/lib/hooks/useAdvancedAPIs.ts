/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔄 CHRONOS INFINITY 2026 — HOOKS DE API UNIFICADOS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Hooks completos para interactuar con todas las APIs del sistema
 * con caching, optimistic updates, y manejo de errores
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS GENÉRICOS
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  total?: number
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: any
  params?: Record<string, string>
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, params } = options
  
  let url = `/api/${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()
  return data
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOK: useRealtimeMetrics
// ═══════════════════════════════════════════════════════════════════════════════════════

interface MetricKPI {
  id: string
  name: string
  value: number
  previousValue?: number
  change?: number
  changePercent?: number
  trend: 'up' | 'down' | 'neutral'
  unit?: string
}

interface MetricsData {
  kpis: Record<string, MetricKPI>
  timeseries: { timestamp: number; value: number }[]
  distribution: { name: string; value: number; color: string }[]
  performance: { label: string; ingresos: number; gastos: number; utilidad: number }[]
}

export function useRealtimeMetrics(
  options: {
    type?: 'all' | 'kpis' | 'timeseries' | 'distribution' | 'performance'
    period?: '1h' | '24h' | '7d' | '30d'
    refreshInterval?: number
  } = {}
) {
  const { type = 'all', period = '24h', refreshInterval = 30000 } = options

  return useQuery({
    queryKey: ['metrics', type, period],
    queryFn: async () => {
      const response = await apiFetch<MetricsData>('realtime-metrics', {
        params: { type, period },
      })
      return response.data
    },
    refetchInterval: refreshInterval,
    staleTime: 5000,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOK: useWorkflows
// ═══════════════════════════════════════════════════════════════════════════════════════

interface WorkflowInstance {
  id: string
  templateId: string
  title: string
  description?: string
  requestedBy: string
  requestedAt: number
  status: string
  currentStageIndex: number
  approvals: any[]
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  stages: any[]
  isActive: boolean
}

export function useWorkflows(
  options: {
    status?: string
    templateId?: string
  } = {}
) {
  const queryClient = useQueryClient()

  const workflowsQuery = useQuery({
    queryKey: ['workflows', options],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (options.status) params.status = options.status
      if (options.templateId) params.templateId = options.templateId
      
      const response = await apiFetch<WorkflowInstance[]>('workflows', { params })
      return response.data
    },
  })

  const templatesQuery = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: async () => {
      const response = await apiFetch<WorkflowTemplate[]>('workflows', {
        params: { type: 'templates' },
      })
      return response.data
    },
  })

  const createWorkflow = useMutation({
    mutationFn: async (data: {
      templateId: string
      title: string
      description?: string
      requestedBy: string
      metadata?: Record<string, any>
    }) => {
      const response = await apiFetch<WorkflowInstance>('workflows', {
        method: 'POST',
        body: data,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
  })

  const updateWorkflow = useMutation({
    mutationFn: async (data: {
      workflowId: string
      action: 'approve' | 'reject' | 'delegate' | 'cancel'
      approverId: string
      comment?: string
      delegateTo?: string
    }) => {
      const response = await apiFetch<WorkflowInstance>('workflows', {
        method: 'PATCH',
        body: data,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
  })

  return {
    workflows: workflowsQuery.data,
    templates: templatesQuery.data,
    isLoading: workflowsQuery.isLoading,
    isTemplatesLoading: templatesQuery.isLoading,
    createWorkflow,
    updateWorkflow,
    refetch: workflowsQuery.refetch,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOK: useScheduledReports
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ReportSchedule {
  id: string
  name: string
  description?: string
  frequency: string
  format: string
  recipients: string[]
  status: string
  nextRunAt?: number
  lastRunAt?: number
  lastRunStatus?: 'success' | 'failed'
}

interface ReportExecution {
  id: string
  scheduleId: string
  startedAt: number
  completedAt?: number
  status: 'running' | 'success' | 'failed'
  recordsProcessed?: number
  fileSize?: number
  downloadUrl?: string
}

export function useScheduledReports(
  options: {
    status?: string
  } = {}
) {
  const queryClient = useQueryClient()

  const reportsQuery = useQuery({
    queryKey: ['reports', options],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (options.status) params.status = options.status
      
      const response = await apiFetch<ReportSchedule[]>('scheduled-reports', { params })
      return response.data
    },
  })

  const createReport = useMutation({
    mutationFn: async (data: Partial<ReportSchedule>) => {
      const response = await apiFetch<ReportSchedule>('scheduled-reports', {
        method: 'POST',
        body: data,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })

  const updateReport = useMutation({
    mutationFn: async (data: { id: string } & Partial<ReportSchedule>) => {
      const response = await apiFetch<ReportSchedule>('scheduled-reports', {
        method: 'PATCH',
        body: data,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })

  const runReport = useMutation({
    mutationFn: async (scheduleId: string) => {
      const response = await apiFetch<ReportExecution>('scheduled-reports', {
        method: 'POST',
        params: { action: 'run' },
        body: { scheduleId },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch('scheduled-reports', {
        method: 'DELETE',
        params: { id },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })

  return {
    reports: reportsQuery.data,
    isLoading: reportsQuery.isLoading,
    createReport,
    updateReport,
    runReport,
    deleteReport,
    refetch: reportsQuery.refetch,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOK: useSavedFilters
// ═══════════════════════════════════════════════════════════════════════════════════════

interface FilterCondition {
  id: string
  field: string
  operator: string
  value: any
  secondValue?: any
}

interface SavedFilter {
  id: string
  name: string
  description?: string
  module: string
  conditions: FilterCondition[]
  logic: 'and' | 'or'
  isFavorite: boolean
  isShared: boolean
  isDefault: boolean
  usageCount: number
}

export function useSavedFilters(
  options: {
    module?: string
    favorites?: boolean
    shared?: boolean
  } = {}
) {
  const queryClient = useQueryClient()

  const filtersQuery = useQuery({
    queryKey: ['filters', options],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (options.module) params.module = options.module
      if (options.favorites) params.favorites = 'true'
      if (options.shared) params.shared = 'true'
      
      const response = await apiFetch<SavedFilter[]>('saved-filters', { params })
      return response.data
    },
  })

  const createFilter = useMutation({
    mutationFn: async (data: Omit<SavedFilter, 'id' | 'usageCount'>) => {
      const response = await apiFetch<SavedFilter>('saved-filters', {
        method: 'POST',
        body: data,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filters'] })
    },
  })

  const updateFilter = useMutation({
    mutationFn: async (data: { id: string } & Partial<SavedFilter>) => {
      const response = await apiFetch<SavedFilter>('saved-filters', {
        method: 'PATCH',
        body: data,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filters'] })
    },
  })

  const toggleFavorite = useCallback(
    async (id: string, currentValue: boolean) => {
      await updateFilter.mutateAsync({ id, isFavorite: !currentValue })
    },
    [updateFilter]
  )

  const deleteFilter = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch('saved-filters', {
        method: 'DELETE',
        params: { id },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filters'] })
    },
  })

  return {
    filters: filtersQuery.data,
    isLoading: filtersQuery.isLoading,
    createFilter,
    updateFilter,
    toggleFavorite,
    deleteFilter,
    refetch: filtersQuery.refetch,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOK: useThemes
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  success: string
  warning: string
  error: string
  background: string
  foreground: string
  muted: string
  border: string
}

interface CustomTheme {
  id: string
  name: string
  description?: string
  mode: 'light' | 'dark'
  colors: ColorPalette
  isPreset: boolean
  isActive: boolean
}

export function useThemes(
  options: {
    mode?: 'light' | 'dark'
    presetsOnly?: boolean
    customOnly?: boolean
  } = {}
) {
  const queryClient = useQueryClient()

  const themesQuery = useQuery({
    queryKey: ['themes', options],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (options.mode) params.mode = options.mode
      if (options.presetsOnly) params.presets = 'true'
      if (options.customOnly) params.custom = 'true'
      
      const response = await apiFetch<CustomTheme[]>('themes', { params })
      return response.data
    },
  })

  const createTheme = useMutation({
    mutationFn: async (data: Omit<CustomTheme, 'id' | 'isPreset' | 'isActive'>) => {
      const response = await apiFetch<CustomTheme>('themes', {
        method: 'POST',
        body: data,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] })
    },
  })

  const activateTheme = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch<CustomTheme>('themes', {
        method: 'PATCH',
        body: { id, action: 'activate' },
      })
      
      // Aplicar tema al DOM
      if (response.data?.colors) {
        applyThemeToDOM(response.data.colors)
      }
      
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] })
    },
  })

  const updateTheme = useMutation({
    mutationFn: async (data: { id: string } & Partial<CustomTheme>) => {
      const response = await apiFetch<CustomTheme>('themes', {
        method: 'PATCH',
        body: data,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] })
    },
  })

  const deleteTheme = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch('themes', {
        method: 'DELETE',
        params: { id },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] })
    },
  })

  // Obtener tema activo
  const activeTheme = useMemo(() => {
    return themesQuery.data?.find(t => t.isActive)
  }, [themesQuery.data])

  return {
    themes: themesQuery.data,
    activeTheme,
    isLoading: themesQuery.isLoading,
    createTheme,
    activateTheme,
    updateTheme,
    deleteTheme,
    refetch: themesQuery.refetch,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES DE TEMA
// ═══════════════════════════════════════════════════════════════════════════════════════

function applyThemeToDOM(colors: ColorPalette): void {
  const root = document.documentElement
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  apiFetch,
  applyThemeToDOM,
  type ApiResponse,
  type MetricKPI,
  type MetricsData,
  type WorkflowInstance,
  type WorkflowTemplate,
  type ReportSchedule,
  type ReportExecution,
  type SavedFilter,
  type FilterCondition,
  type CustomTheme,
  type ColorPalette,
}
