/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎨 CHRONOS INFINITY 2026 — SISTEMA DE TEMAS PERSONALIZABLES
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de personalización visual con:
 * - Temas predefinidos (oscuro, claro, alto contraste)
 * - Editor de colores en tiempo real
 * - Persistencia por usuario
 * - Variables CSS dinámicas
 * - Presets de estilos
 * - Modo compacto/expandido
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type ModoTema = 'oscuro' | 'claro' | 'sistema' | 'alto_contraste'
export type DensidadUI = 'compacto' | 'normal' | 'espacioso'
export type EsquemaColor = 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple' | 'personalizado'
export type EstiloCards = 'glass' | 'solid' | 'bordered' | 'elevated'
export type AnimacionNivel = 'ninguna' | 'sutil' | 'normal' | 'expresiva'

export interface PaletaColores {
  primario: string
  secundario: string
  acento: string
  exito: string
  advertencia: string
  error: string
  info: string
  fondoPrincipal: string
  fondoSecundario: string
  fondoCard: string
  textoTitulo: string
  textoPrimario: string
  textoSecundario: string
  borde: string
  bordeActivo: string
}

export interface ConfiguracionTema {
  id: string
  nombre: string
  descripcion?: string
  modo: ModoTema
  esquema: EsquemaColor
  paleta: PaletaColores
  densidad: DensidadUI
  estiloCards: EstiloCards
  animaciones: AnimacionNivel
  bordeRadius: number // 0-24
  sombras: boolean
  blur: boolean
  transparencia: number // 0-100
  fuente: {
    familia: string
    tamanoBase: number
    pesoTitulos: number
    pesoCuerpo: number
  }
  efectos: {
    gradientes: boolean
    brillo: boolean
    particulas: boolean
  }
  esPredefinido: boolean
  usuarioId?: string
  creadoAt: number
  modificadoAt?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PALETAS PREDEFINIDAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const PALETAS_OSCURAS: Record<EsquemaColor, PaletaColores> = {
  violet: {
    primario: '#8B5CF6',
    secundario: '#7C3AED',
    acento: '#A78BFA',
    exito: '#10B981',
    advertencia: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    fondoPrincipal: '#0F0F23',
    fondoSecundario: '#1A1A2E',
    fondoCard: '#16162A',
    textoTitulo: '#FFFFFF',
    textoPrimario: '#E5E7EB',
    textoSecundario: '#9CA3AF',
    borde: '#374151',
    bordeActivo: '#8B5CF6'
  },
  blue: {
    primario: '#3B82F6',
    secundario: '#2563EB',
    acento: '#60A5FA',
    exito: '#10B981',
    advertencia: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    fondoPrincipal: '#0F172A',
    fondoSecundario: '#1E293B',
    fondoCard: '#1E3A5F',
    textoTitulo: '#FFFFFF',
    textoPrimario: '#E2E8F0',
    textoSecundario: '#94A3B8',
    borde: '#334155',
    bordeActivo: '#3B82F6'
  },
  emerald: {
    primario: '#10B981',
    secundario: '#059669',
    acento: '#34D399',
    exito: '#10B981',
    advertencia: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    fondoPrincipal: '#0F1F17',
    fondoSecundario: '#1A2F21',
    fondoCard: '#162D1F',
    textoTitulo: '#FFFFFF',
    textoPrimario: '#D1FAE5',
    textoSecundario: '#A7F3D0',
    borde: '#065F46',
    bordeActivo: '#10B981'
  },
  amber: {
    primario: '#F59E0B',
    secundario: '#D97706',
    acento: '#FBBF24',
    exito: '#10B981',
    advertencia: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    fondoPrincipal: '#1F1A0D',
    fondoSecundario: '#2D2611',
    fondoCard: '#292112',
    textoTitulo: '#FFFFFF',
    textoPrimario: '#FEF3C7',
    textoSecundario: '#FDE68A',
    borde: '#92400E',
    bordeActivo: '#F59E0B'
  },
  rose: {
    primario: '#F43F5E',
    secundario: '#E11D48',
    acento: '#FB7185',
    exito: '#10B981',
    advertencia: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    fondoPrincipal: '#1F0F14',
    fondoSecundario: '#2D171F',
    fondoCard: '#29121A',
    textoTitulo: '#FFFFFF',
    textoPrimario: '#FFE4E6',
    textoSecundario: '#FECDD3',
    borde: '#9F1239',
    bordeActivo: '#F43F5E'
  },
  cyan: {
    primario: '#06B6D4',
    secundario: '#0891B2',
    acento: '#22D3EE',
    exito: '#10B981',
    advertencia: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    fondoPrincipal: '#0D1F22',
    fondoSecundario: '#132D31',
    fondoCard: '#10282C',
    textoTitulo: '#FFFFFF',
    textoPrimario: '#CFFAFE',
    textoSecundario: '#A5F3FC',
    borde: '#0E7490',
    bordeActivo: '#06B6D4'
  },
  purple: {
    primario: '#A855F7',
    secundario: '#9333EA',
    acento: '#C084FC',
    exito: '#10B981',
    advertencia: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    fondoPrincipal: '#150F22',
    fondoSecundario: '#221730',
    fondoCard: '#1D132A',
    textoTitulo: '#FFFFFF',
    textoPrimario: '#F3E8FF',
    textoSecundario: '#E9D5FF',
    borde: '#7E22CE',
    bordeActivo: '#A855F7'
  },
  personalizado: {
    primario: '#8B5CF6',
    secundario: '#7C3AED',
    acento: '#A78BFA',
    exito: '#10B981',
    advertencia: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    fondoPrincipal: '#0F0F23',
    fondoSecundario: '#1A1A2E',
    fondoCard: '#16162A',
    textoTitulo: '#FFFFFF',
    textoPrimario: '#E5E7EB',
    textoSecundario: '#9CA3AF',
    borde: '#374151',
    bordeActivo: '#8B5CF6'
  }
}

const PALETAS_CLARAS: Record<EsquemaColor, PaletaColores> = {
  violet: {
    primario: '#7C3AED',
    secundario: '#6D28D9',
    acento: '#8B5CF6',
    exito: '#059669',
    advertencia: '#D97706',
    error: '#DC2626',
    info: '#0891B2',
    fondoPrincipal: '#FFFFFF',
    fondoSecundario: '#F9FAFB',
    fondoCard: '#FFFFFF',
    textoTitulo: '#111827',
    textoPrimario: '#374151',
    textoSecundario: '#6B7280',
    borde: '#E5E7EB',
    bordeActivo: '#7C3AED'
  },
  blue: {
    primario: '#2563EB',
    secundario: '#1D4ED8',
    acento: '#3B82F6',
    exito: '#059669',
    advertencia: '#D97706',
    error: '#DC2626',
    info: '#0891B2',
    fondoPrincipal: '#FFFFFF',
    fondoSecundario: '#F8FAFC',
    fondoCard: '#FFFFFF',
    textoTitulo: '#0F172A',
    textoPrimario: '#334155',
    textoSecundario: '#64748B',
    borde: '#E2E8F0',
    bordeActivo: '#2563EB'
  },
  emerald: {
    primario: '#059669',
    secundario: '#047857',
    acento: '#10B981',
    exito: '#059669',
    advertencia: '#D97706',
    error: '#DC2626',
    info: '#0891B2',
    fondoPrincipal: '#FFFFFF',
    fondoSecundario: '#F0FDF4',
    fondoCard: '#FFFFFF',
    textoTitulo: '#064E3B',
    textoPrimario: '#065F46',
    textoSecundario: '#047857',
    borde: '#D1FAE5',
    bordeActivo: '#059669'
  },
  amber: {
    primario: '#D97706',
    secundario: '#B45309',
    acento: '#F59E0B',
    exito: '#059669',
    advertencia: '#D97706',
    error: '#DC2626',
    info: '#0891B2',
    fondoPrincipal: '#FFFFFF',
    fondoSecundario: '#FFFBEB',
    fondoCard: '#FFFFFF',
    textoTitulo: '#78350F',
    textoPrimario: '#92400E',
    textoSecundario: '#B45309',
    borde: '#FEF3C7',
    bordeActivo: '#D97706'
  },
  rose: {
    primario: '#E11D48',
    secundario: '#BE123C',
    acento: '#F43F5E',
    exito: '#059669',
    advertencia: '#D97706',
    error: '#DC2626',
    info: '#0891B2',
    fondoPrincipal: '#FFFFFF',
    fondoSecundario: '#FFF1F2',
    fondoCard: '#FFFFFF',
    textoTitulo: '#881337',
    textoPrimario: '#9F1239',
    textoSecundario: '#BE123C',
    borde: '#FFE4E6',
    bordeActivo: '#E11D48'
  },
  cyan: {
    primario: '#0891B2',
    secundario: '#0E7490',
    acento: '#06B6D4',
    exito: '#059669',
    advertencia: '#D97706',
    error: '#DC2626',
    info: '#0891B2',
    fondoPrincipal: '#FFFFFF',
    fondoSecundario: '#ECFEFF',
    fondoCard: '#FFFFFF',
    textoTitulo: '#164E63',
    textoPrimario: '#155E75',
    textoSecundario: '#0E7490',
    borde: '#CFFAFE',
    bordeActivo: '#0891B2'
  },
  purple: {
    primario: '#9333EA',
    secundario: '#7E22CE',
    acento: '#A855F7',
    exito: '#059669',
    advertencia: '#D97706',
    error: '#DC2626',
    info: '#0891B2',
    fondoPrincipal: '#FFFFFF',
    fondoSecundario: '#FAF5FF',
    fondoCard: '#FFFFFF',
    textoTitulo: '#581C87',
    textoPrimario: '#6B21A8',
    textoSecundario: '#7E22CE',
    borde: '#F3E8FF',
    bordeActivo: '#9333EA'
  },
  personalizado: {
    primario: '#7C3AED',
    secundario: '#6D28D9',
    acento: '#8B5CF6',
    exito: '#059669',
    advertencia: '#D97706',
    error: '#DC2626',
    info: '#0891B2',
    fondoPrincipal: '#FFFFFF',
    fondoSecundario: '#F9FAFB',
    fondoCard: '#FFFFFF',
    textoTitulo: '#111827',
    textoPrimario: '#374151',
    textoSecundario: '#6B7280',
    borde: '#E5E7EB',
    bordeActivo: '#7C3AED'
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE TEMAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class TemasSupremeService {
  private static instance: TemasSupremeService
  private temaActual: ConfiguracionTema
  private temasGuardados: Map<string, ConfiguracionTema> = new Map()
  private listeners: Set<(tema: ConfiguracionTema) => void> = new Set()
  private STORAGE_KEY = 'chronos_tema_actual'
  private TEMAS_KEY = 'chronos_temas_guardados'
  
  private constructor() {
    this.temaActual = this.obtenerTemaDefault()
    this.cargarDesdeStorage()
    this.inicializarTemasPredefinidos()
    this.aplicarTema(this.temaActual)
  }
  
  public static getInstance(): TemasSupremeService {
    if (!TemasSupremeService.instance) {
      TemasSupremeService.instance = new TemasSupremeService()
    }
    return TemasSupremeService.instance
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // TEMAS PREDEFINIDOS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  
  private obtenerTemaDefault(): ConfiguracionTema {
    return {
      id: 'tema_chronos_default',
      nombre: 'Chronos Oscuro',
      descripcion: 'Tema oscuro predeterminado de Chronos',
      modo: 'oscuro',
      esquema: 'violet',
      paleta: PALETAS_OSCURAS.violet,
      densidad: 'normal',
      estiloCards: 'glass',
      animaciones: 'normal',
      bordeRadius: 12,
      sombras: true,
      blur: true,
      transparencia: 90,
      fuente: {
        familia: 'Inter, system-ui, sans-serif',
        tamanoBase: 14,
        pesoTitulos: 600,
        pesoCuerpo: 400
      },
      efectos: {
        gradientes: true,
        brillo: true,
        particulas: false
      },
      esPredefinido: true,
      creadoAt: Date.now()
    }
  }
  
  private inicializarTemasPredefinidos(): void {
    // Tema Oscuro Violet (Default)
    this.temasGuardados.set('tema_chronos_default', this.temaActual)
    
    // Tema Claro
    this.temasGuardados.set('tema_chronos_claro', {
      id: 'tema_chronos_claro',
      nombre: 'Chronos Claro',
      descripcion: 'Tema claro elegante',
      modo: 'claro',
      esquema: 'violet',
      paleta: PALETAS_CLARAS.violet,
      densidad: 'normal',
      estiloCards: 'elevated',
      animaciones: 'normal',
      bordeRadius: 12,
      sombras: true,
      blur: false,
      transparencia: 100,
      fuente: {
        familia: 'Inter, system-ui, sans-serif',
        tamanoBase: 14,
        pesoTitulos: 600,
        pesoCuerpo: 400
      },
      efectos: {
        gradientes: false,
        brillo: false,
        particulas: false
      },
      esPredefinido: true,
      creadoAt: Date.now()
    })
    
    // Tema Cyberpunk
    this.temasGuardados.set('tema_cyberpunk', {
      id: 'tema_cyberpunk',
      nombre: 'Cyberpunk',
      descripcion: 'Estilo cyberpunk con cyan y rosa',
      modo: 'oscuro',
      esquema: 'cyan',
      paleta: {
        ...PALETAS_OSCURAS.cyan,
        acento: '#FF0080',
        bordeActivo: '#00FFFF'
      },
      densidad: 'normal',
      estiloCards: 'bordered',
      animaciones: 'expresiva',
      bordeRadius: 4,
      sombras: true,
      blur: true,
      transparencia: 85,
      fuente: {
        familia: 'JetBrains Mono, monospace',
        tamanoBase: 13,
        pesoTitulos: 700,
        pesoCuerpo: 400
      },
      efectos: {
        gradientes: true,
        brillo: true,
        particulas: true
      },
      esPredefinido: true,
      creadoAt: Date.now()
    })
    
    // Tema Minimalista
    this.temasGuardados.set('tema_minimal', {
      id: 'tema_minimal',
      nombre: 'Minimalista',
      descripcion: 'Diseño limpio y minimalista',
      modo: 'claro',
      esquema: 'blue',
      paleta: PALETAS_CLARAS.blue,
      densidad: 'espacioso',
      estiloCards: 'bordered',
      animaciones: 'sutil',
      bordeRadius: 8,
      sombras: false,
      blur: false,
      transparencia: 100,
      fuente: {
        familia: 'Inter, system-ui, sans-serif',
        tamanoBase: 15,
        pesoTitulos: 500,
        pesoCuerpo: 400
      },
      efectos: {
        gradientes: false,
        brillo: false,
        particulas: false
      },
      esPredefinido: true,
      creadoAt: Date.now()
    })
    
    // Tema Alto Contraste
    this.temasGuardados.set('tema_alto_contraste', {
      id: 'tema_alto_contraste',
      nombre: 'Alto Contraste',
      descripcion: 'Accesibilidad mejorada con alto contraste',
      modo: 'alto_contraste',
      esquema: 'personalizado',
      paleta: {
        primario: '#FFFFFF',
        secundario: '#FFFF00',
        acento: '#00FFFF',
        exito: '#00FF00',
        advertencia: '#FFFF00',
        error: '#FF0000',
        info: '#00FFFF',
        fondoPrincipal: '#000000',
        fondoSecundario: '#0A0A0A',
        fondoCard: '#000000',
        textoTitulo: '#FFFFFF',
        textoPrimario: '#FFFFFF',
        textoSecundario: '#FFFF00',
        borde: '#FFFFFF',
        bordeActivo: '#FFFF00'
      },
      densidad: 'espacioso',
      estiloCards: 'bordered',
      animaciones: 'ninguna',
      bordeRadius: 0,
      sombras: false,
      blur: false,
      transparencia: 100,
      fuente: {
        familia: 'Arial, sans-serif',
        tamanoBase: 16,
        pesoTitulos: 700,
        pesoCuerpo: 400
      },
      efectos: {
        gradientes: false,
        brillo: false,
        particulas: false
      },
      esPredefinido: true,
      creadoAt: Date.now()
    })
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // STORAGE
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  
  private cargarDesdeStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      const temaGuardado = localStorage.getItem(this.STORAGE_KEY)
      if (temaGuardado) {
        this.temaActual = JSON.parse(temaGuardado)
      }
      
      const temasCustom = localStorage.getItem(this.TEMAS_KEY)
      if (temasCustom) {
        const temas = JSON.parse(temasCustom) as ConfiguracionTema[]
        temas.forEach(t => this.temasGuardados.set(t.id, t))
      }
    } catch (error) {
      console.error('Error cargando tema:', error)
    }
  }
  
  private guardarEnStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.temaActual))
      
      const temasCustom = Array.from(this.temasGuardados.values()).filter(t => !t.esPredefinido)
      localStorage.setItem(this.TEMAS_KEY, JSON.stringify(temasCustom))
    } catch (error) {
      console.error('Error guardando tema:', error)
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // APLICAR TEMA
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  
  private aplicarTema(tema: ConfiguracionTema): void {
    if (typeof document === 'undefined') return
    
    const root = document.documentElement
    const { paleta, densidad, bordeRadius, transparencia, fuente } = tema
    
    // Colores
    root.style.setProperty('--color-primary', paleta.primario)
    root.style.setProperty('--color-secondary', paleta.secundario)
    root.style.setProperty('--color-accent', paleta.acento)
    root.style.setProperty('--color-success', paleta.exito)
    root.style.setProperty('--color-warning', paleta.advertencia)
    root.style.setProperty('--color-error', paleta.error)
    root.style.setProperty('--color-info', paleta.info)
    root.style.setProperty('--color-background', paleta.fondoPrincipal)
    root.style.setProperty('--color-background-secondary', paleta.fondoSecundario)
    root.style.setProperty('--color-card', paleta.fondoCard)
    root.style.setProperty('--color-text-title', paleta.textoTitulo)
    root.style.setProperty('--color-text-primary', paleta.textoPrimario)
    root.style.setProperty('--color-text-secondary', paleta.textoSecundario)
    root.style.setProperty('--color-border', paleta.borde)
    root.style.setProperty('--color-border-active', paleta.bordeActivo)
    
    // Espaciado por densidad
    const espaciados = {
      compacto: { base: '0.5rem', card: '0.75rem', gap: '0.5rem' },
      normal: { base: '1rem', card: '1.25rem', gap: '1rem' },
      espacioso: { base: '1.5rem', card: '1.75rem', gap: '1.5rem' }
    }
    const esp = espaciados[densidad]
    root.style.setProperty('--spacing-base', esp.base)
    root.style.setProperty('--spacing-card', esp.card)
    root.style.setProperty('--spacing-gap', esp.gap)
    
    // Bordes y sombras
    root.style.setProperty('--border-radius', `${bordeRadius}px`)
    root.style.setProperty('--card-opacity', `${transparencia / 100}`)
    
    // Fuentes
    root.style.setProperty('--font-family', fuente.familia)
    root.style.setProperty('--font-size-base', `${fuente.tamanoBase}px`)
    root.style.setProperty('--font-weight-title', String(fuente.pesoTitulos))
    root.style.setProperty('--font-weight-body', String(fuente.pesoCuerpo))
    
    // Clase del body según modo
    document.body.classList.remove('light', 'dark', 'high-contrast')
    if (tema.modo === 'claro') {
      document.body.classList.add('light')
    } else if (tema.modo === 'alto_contraste') {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.add('dark')
    }
    
    // Notificar listeners
    this.notificarCambio()
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // MÉTODOS PÚBLICOS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  
  public obtenerTemaActual(): ConfiguracionTema {
    return { ...this.temaActual }
  }
  
  public obtenerTemas(): ConfiguracionTema[] {
    return Array.from(this.temasGuardados.values())
  }
  
  public obtenerTema(id: string): ConfiguracionTema | undefined {
    return this.temasGuardados.get(id)
  }
  
  public cambiarTema(id: string): boolean {
    const tema = this.temasGuardados.get(id)
    if (!tema) return false
    
    this.temaActual = { ...tema }
    this.aplicarTema(this.temaActual)
    this.guardarEnStorage()
    return true
  }
  
  public cambiarEsquemaColor(esquema: EsquemaColor): void {
    const paleta = this.temaActual.modo === 'claro' 
      ? PALETAS_CLARAS[esquema] 
      : PALETAS_OSCURAS[esquema]
    
    this.temaActual.esquema = esquema
    this.temaActual.paleta = paleta
    this.temaActual.modificadoAt = Date.now()
    
    this.aplicarTema(this.temaActual)
    this.guardarEnStorage()
  }
  
  public cambiarModo(modo: ModoTema): void {
    this.temaActual.modo = modo
    
    if (modo !== 'alto_contraste' && this.temaActual.esquema !== 'personalizado') {
      this.temaActual.paleta = modo === 'claro'
        ? PALETAS_CLARAS[this.temaActual.esquema]
        : PALETAS_OSCURAS[this.temaActual.esquema]
    }
    
    this.temaActual.modificadoAt = Date.now()
    this.aplicarTema(this.temaActual)
    this.guardarEnStorage()
  }
  
  public actualizarConfiguracion(updates: Partial<ConfiguracionTema>): void {
    Object.assign(this.temaActual, updates, { modificadoAt: Date.now() })
    this.aplicarTema(this.temaActual)
    this.guardarEnStorage()
  }
  
  public actualizarColor(clave: keyof PaletaColores, color: string): void {
    this.temaActual.paleta[clave] = color
    this.temaActual.esquema = 'personalizado'
    this.temaActual.modificadoAt = Date.now()
    this.aplicarTema(this.temaActual)
    this.guardarEnStorage()
  }
  
  public guardarTemaPersonalizado(nombre: string, descripcion?: string): ConfiguracionTema {
    const nuevoTema: ConfiguracionTema = {
      ...this.temaActual,
      id: `tema_custom_${Date.now()}`,
      nombre,
      descripcion,
      esPredefinido: false,
      creadoAt: Date.now(),
      modificadoAt: undefined
    }
    
    this.temasGuardados.set(nuevoTema.id, nuevoTema)
    this.guardarEnStorage()
    
    return nuevoTema
  }
  
  public eliminarTemaPersonalizado(id: string): boolean {
    const tema = this.temasGuardados.get(id)
    if (!tema || tema.esPredefinido) return false
    
    this.temasGuardados.delete(id)
    this.guardarEnStorage()
    return true
  }
  
  public exportarTema(): string {
    return JSON.stringify(this.temaActual, null, 2)
  }
  
  public importarTema(jsonString: string): boolean {
    try {
      const tema = JSON.parse(jsonString) as ConfiguracionTema
      tema.id = `tema_imported_${Date.now()}`
      tema.esPredefinido = false
      tema.creadoAt = Date.now()
      
      this.temasGuardados.set(tema.id, tema)
      this.temaActual = tema
      this.aplicarTema(tema)
      this.guardarEnStorage()
      
      return true
    } catch {
      return false
    }
  }
  
  public resetearTema(): void {
    this.temaActual = this.obtenerTemaDefault()
    this.aplicarTema(this.temaActual)
    this.guardarEnStorage()
  }
  
  public suscribir(callback: (tema: ConfiguracionTema) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }
  
  private notificarCambio(): void {
    this.listeners.forEach(cb => {
      try { cb(this.temaActual) } catch { /* ignore */ }
    })
  }
  
  public obtenerPaletasDisponibles(): { oscuras: typeof PALETAS_OSCURAS; claras: typeof PALETAS_CLARAS } {
    return {
      oscuras: PALETAS_OSCURAS,
      claras: PALETAS_CLARAS
    }
  }
}

export const temasService = TemasSupremeService.getInstance()
export default temasService
