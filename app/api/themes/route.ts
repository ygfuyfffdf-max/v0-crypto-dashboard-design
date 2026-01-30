/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🎨 CHRONOS INFINITY 2026 — API ROUTE: TEMAS PERSONALIZADOS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Endpoints CRUD para sistema de temas personalizables
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
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
  typography?: {
    fontFamily: string
    headingFontFamily?: string
  }
  borderRadius?: string
  isPreset: boolean
  isActive: boolean
  createdBy: string
  createdAt: number
  updatedAt: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DATOS EN MEMORIA
// ═══════════════════════════════════════════════════════════════════════════════════════

const themes: Map<string, CustomTheme> = new Map([
  ['preset-purple-dream', {
    id: 'preset-purple-dream',
    name: 'Purple Dream',
    description: 'Tema morado vibrante y moderno - El tema predeterminado de CHRONOS',
    mode: 'dark',
    colors: {
      primary: '#a855f7',
      secondary: '#ec4899',
      accent: '#f59e0b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#000000',
      foreground: '#ffffff',
      muted: '#6b7280',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingFontFamily: 'Inter, system-ui, sans-serif',
    },
    borderRadius: '0.75rem',
    isPreset: true,
    isActive: true,
    createdBy: 'system',
    createdAt: Date.now() - 86400000 * 365,
    updatedAt: Date.now(),
  }],
  ['preset-ocean-breeze', {
    id: 'preset-ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Tema azul fresco y relajante para largas sesiones de trabajo',
    mode: 'dark',
    colors: {
      primary: '#3b82f6',
      secondary: '#06b6d4',
      accent: '#22c55e',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#0f172a',
      foreground: '#f8fafc',
      muted: '#64748b',
      border: 'rgba(148, 163, 184, 0.2)',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    borderRadius: '0.5rem',
    isPreset: true,
    isActive: false,
    createdBy: 'system',
    createdAt: Date.now() - 86400000 * 365,
    updatedAt: Date.now(),
  }],
  ['preset-sunset-glow', {
    id: 'preset-sunset-glow',
    name: 'Sunset Glow',
    description: 'Tema cálido con tonos naranjas y rojos para ambiente acogedor',
    mode: 'dark',
    colors: {
      primary: '#f97316',
      secondary: '#ef4444',
      accent: '#fbbf24',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#dc2626',
      background: '#18181b',
      foreground: '#fafafa',
      muted: '#71717a',
      border: 'rgba(244, 114, 182, 0.15)',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    borderRadius: '1rem',
    isPreset: true,
    isActive: false,
    createdBy: 'system',
    createdAt: Date.now() - 86400000 * 365,
    updatedAt: Date.now(),
  }],
  ['preset-forest-zen', {
    id: 'preset-forest-zen',
    name: 'Forest Zen',
    description: 'Tema verde natural inspirado en la naturaleza',
    mode: 'dark',
    colors: {
      primary: '#22c55e',
      secondary: '#14b8a6',
      accent: '#84cc16',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#052e16',
      foreground: '#f0fdf4',
      muted: '#6b7280',
      border: 'rgba(34, 197, 94, 0.2)',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    borderRadius: '0.5rem',
    isPreset: true,
    isActive: false,
    createdBy: 'system',
    createdAt: Date.now() - 86400000 * 365,
    updatedAt: Date.now(),
  }],
  ['preset-midnight-blue', {
    id: 'preset-midnight-blue',
    name: 'Midnight Blue',
    description: 'Tema azul profundo para trabajar de noche',
    mode: 'dark',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#f472b6',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      background: '#020617',
      foreground: '#f1f5f9',
      muted: '#475569',
      border: 'rgba(99, 102, 241, 0.15)',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    borderRadius: '0.75rem',
    isPreset: true,
    isActive: false,
    createdBy: 'system',
    createdAt: Date.now() - 86400000 * 365,
    updatedAt: Date.now(),
  }],
  ['preset-rose-gold', {
    id: 'preset-rose-gold',
    name: 'Rose Gold',
    description: 'Tema elegante con tonos rosados y dorados',
    mode: 'dark',
    colors: {
      primary: '#f472b6',
      secondary: '#e879f9',
      accent: '#fbbf24',
      success: '#34d399',
      warning: '#f59e0b',
      error: '#fb7185',
      background: '#1c1917',
      foreground: '#fef2f2',
      muted: '#78716c',
      border: 'rgba(244, 114, 182, 0.2)',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    borderRadius: '1rem',
    isPreset: true,
    isActive: false,
    createdBy: 'system',
    createdAt: Date.now() - 86400000 * 365,
    updatedAt: Date.now(),
  }],
])

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`
}

function validateColors(colors: Partial<ColorPalette>): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  const rgbaRegex = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/
  
  for (const [key, value] of Object.entries(colors)) {
    if (value && !hexRegex.test(value) && !rgbaRegex.test(value)) {
      return false
    }
  }
  return true
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GET: Listar/Obtener temas
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const mode = searchParams.get('mode')
  const presetsOnly = searchParams.get('presets') === 'true'
  const customOnly = searchParams.get('custom') === 'true'
  const activeOnly = searchParams.get('active') === 'true'

  try {
    // Obtener un tema específico
    if (id) {
      const theme = themes.get(id)
      if (!theme) {
        return NextResponse.json(
          { success: false, error: 'Theme not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: theme })
    }

    // Listar temas con filtros
    let allThemes = Array.from(themes.values())
    
    if (mode) {
      allThemes = allThemes.filter(t => t.mode === mode)
    }
    
    if (presetsOnly) {
      allThemes = allThemes.filter(t => t.isPreset)
    }
    
    if (customOnly) {
      allThemes = allThemes.filter(t => !t.isPreset)
    }
    
    if (activeOnly) {
      allThemes = allThemes.filter(t => t.isActive)
    }

    // Ordenar: activo primero, luego presets, luego personalizados
    allThemes.sort((a, b) => {
      if (a.isActive && !b.isActive) return -1
      if (!a.isActive && b.isActive) return 1
      if (a.isPreset && !b.isPreset) return -1
      if (!a.isPreset && b.isPreset) return 1
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({
      success: true,
      data: allThemes,
      total: allThemes.length,
      activeTheme: allThemes.find(t => t.isActive)?.id,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch themes' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// POST: Crear nuevo tema
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      mode = 'dark',
      colors,
      typography,
      borderRadius = '0.75rem',
      createdBy = 'user',
    } = body

    if (!name || !colors) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (name, colors)' },
        { status: 400 }
      )
    }

    // Validar colores
    if (!validateColors(colors)) {
      return NextResponse.json(
        { success: false, error: 'Invalid color format. Use HEX (#RRGGBB) or RGBA.' },
        { status: 400 }
      )
    }

    const id = generateId('theme')
    const newTheme: CustomTheme = {
      id,
      name,
      description,
      mode,
      colors,
      typography,
      borderRadius,
      isPreset: false,
      isActive: false,
      createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    themes.set(id, newTheme)

    return NextResponse.json({
      success: true,
      data: newTheme,
      message: 'Theme created successfully',
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create theme' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PATCH: Actualizar tema / Activar tema
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }

    const theme = themes.get(id)
    if (!theme) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      )
    }

    // Acción especial: activar tema
    if (action === 'activate') {
      // Desactivar todos los demás
      for (const [otherId, otherTheme] of themes) {
        if (otherTheme.isActive) {
          otherTheme.isActive = false
          themes.set(otherId, otherTheme)
        }
      }
      
      theme.isActive = true
      theme.updatedAt = Date.now()
      themes.set(id, theme)

      return NextResponse.json({
        success: true,
        data: theme,
        message: 'Theme activated successfully',
      })
    }

    // No permitir modificar presets
    if (theme.isPreset && !action) {
      return NextResponse.json(
        { success: false, error: 'Cannot modify preset themes. Create a custom theme instead.' },
        { status: 403 }
      )
    }

    // Validar colores si se proporcionan
    if (updates.colors && !validateColors(updates.colors)) {
      return NextResponse.json(
        { success: false, error: 'Invalid color format' },
        { status: 400 }
      )
    }

    // Actualizar tema
    const updatedTheme: CustomTheme = {
      ...theme,
      ...updates,
      colors: updates.colors ? { ...theme.colors, ...updates.colors } : theme.colors,
      updatedAt: Date.now(),
    }

    themes.set(id, updatedTheme)

    return NextResponse.json({
      success: true,
      data: updatedTheme,
      message: 'Theme updated successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update theme' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DELETE: Eliminar tema
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
    const theme = themes.get(id)
    
    if (!theme) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      )
    }

    // No permitir eliminar presets
    if (theme.isPreset) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete preset themes' },
        { status: 403 }
      )
    }

    // Si el tema está activo, activar el primero preset disponible
    if (theme.isActive) {
      const defaultTheme = Array.from(themes.values()).find(t => t.isPreset)
      if (defaultTheme) {
        defaultTheme.isActive = true
        themes.set(defaultTheme.id, defaultTheme)
      }
    }

    themes.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Theme deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete theme' },
      { status: 500 }
    )
  }
}
