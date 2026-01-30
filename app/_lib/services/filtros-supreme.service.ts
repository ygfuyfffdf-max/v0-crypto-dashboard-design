/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔍 CHRONOS INFINITY 2026 — SISTEMA DE FILTROS GUARDADOS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de filtros guardados con:
 * - Filtros por usuario y módulo
 * - Favoritos y predeterminados
 * - Compartir filtros entre usuarios
 * - Filtros inteligentes con condiciones
 * - Sincronización en localStorage
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type TipoFiltro = 'texto' | 'numero' | 'fecha' | 'seleccion' | 'multiseleccion' | 'rango' | 'booleano'
export type OperadorFiltro = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'between' | 'contains' | 'starts' | 'ends' | 'in' | 'empty' | 'not_empty'

export interface CondicionFiltro {
  id: string
  campo: string
  campoLabel: string
  tipo: TipoFiltro
  operador: OperadorFiltro
  valor: unknown
  valorSecundario?: unknown // Para rangos
  activo: boolean
}

export interface FiltroGuardado {
  id: string
  nombre: string
  descripcion?: string
  modulo: string
  condiciones: CondicionFiltro[]
  usuarioId: string
  usuarioNombre?: string
  
  // Configuración
  esFavorito: boolean
  esPredeterminado: boolean
  esCompartido: boolean
  esDelSistema: boolean
  
  // Metadata
  creadoAt: number
  modificadoAt?: number
  usosContador: number
  ultimoUso?: number
  
  // UI
  color?: string
  icono?: string
}

export interface ConfiguracionCampoFiltro {
  campo: string
  label: string
  tipo: TipoFiltro
  operadores: OperadorFiltro[]
  opciones?: { valor: string; label: string }[]
  placeholder?: string
  min?: number
  max?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE FILTROS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class FiltrosSupremeService {
  private static instance: FiltrosSupremeService
  private filtros: Map<string, FiltroGuardado> = new Map()
  private configuracionesCampos: Map<string, ConfiguracionCampoFiltro[]> = new Map()
  private STORAGE_KEY = 'chronos_filtros_guardados'
  
  private constructor() {
    this.inicializarConfiguraciones()
    this.cargarDesdeStorage()
    this.inicializarFiltrosPredefinidos()
  }
  
  public static getInstance(): FiltrosSupremeService {
    if (!FiltrosSupremeService.instance) {
      FiltrosSupremeService.instance = new FiltrosSupremeService()
    }
    return FiltrosSupremeService.instance
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // CONFIGURACIÓN DE CAMPOS POR MÓDULO
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  
  private inicializarConfiguraciones(): void {
    // Ventas
    this.configuracionesCampos.set('ventas', [
      { campo: 'fecha', label: 'Fecha', tipo: 'fecha', operadores: ['=', 'between', '>', '<', '>=', '<='] },
      { campo: 'cliente', label: 'Cliente', tipo: 'texto', operadores: ['=', 'contains', 'starts'] },
      { campo: 'total', label: 'Total', tipo: 'numero', operadores: ['=', '>', '<', '>=', '<=', 'between'] },
      { campo: 'estado', label: 'Estado', tipo: 'seleccion', operadores: ['=', '!=', 'in'], 
        opciones: [
          { valor: 'pendiente', label: 'Pendiente' },
          { valor: 'pagada', label: 'Pagada' },
          { valor: 'parcial', label: 'Pago Parcial' },
          { valor: 'cancelada', label: 'Cancelada' }
        ] 
      },
      { campo: 'vendedor', label: 'Vendedor', tipo: 'texto', operadores: ['=', 'contains'] },
      { campo: 'productos', label: '# Productos', tipo: 'numero', operadores: ['=', '>', '<', '>=', '<='] }
    ])
    
    // Bancos/Movimientos
    this.configuracionesCampos.set('bancos', [
      { campo: 'fecha', label: 'Fecha', tipo: 'fecha', operadores: ['=', 'between', '>', '<', '>=', '<='] },
      { campo: 'tipo', label: 'Tipo', tipo: 'seleccion', operadores: ['=', '!=', 'in'],
        opciones: [
          { valor: 'ingreso', label: 'Ingreso' },
          { valor: 'gasto', label: 'Gasto' },
          { valor: 'transferencia', label: 'Transferencia' }
        ]
      },
      { campo: 'banco', label: 'Banco', tipo: 'seleccion', operadores: ['=', '!=', 'in'],
        opciones: [
          { valor: 'profit', label: 'Profit' },
          { valor: 'boveda_monte', label: 'Bóveda Monte' },
          { valor: 'boveda_usa', label: 'Bóveda USA' },
          { valor: 'leftie', label: 'Leftie' }
        ]
      },
      { campo: 'monto', label: 'Monto', tipo: 'numero', operadores: ['=', '>', '<', '>=', '<=', 'between'] },
      { campo: 'descripcion', label: 'Descripción', tipo: 'texto', operadores: ['contains', 'starts'] },
      { campo: 'usuario', label: 'Usuario', tipo: 'texto', operadores: ['=', 'contains'] }
    ])
    
    // Clientes
    this.configuracionesCampos.set('clientes', [
      { campo: 'nombre', label: 'Nombre', tipo: 'texto', operadores: ['=', 'contains', 'starts'] },
      { campo: 'saldoPendiente', label: 'Saldo Pendiente', tipo: 'numero', operadores: ['=', '>', '<', '>=', '<=', 'between'] },
      { campo: 'totalCompras', label: 'Total Compras', tipo: 'numero', operadores: ['=', '>', '<', '>=', '<='] },
      { campo: 'categoria', label: 'Categoría', tipo: 'seleccion', operadores: ['=', '!=', 'in'],
        opciones: [
          { valor: 'premium', label: 'Premium' },
          { valor: 'frecuente', label: 'Frecuente' },
          { valor: 'regular', label: 'Regular' },
          { valor: 'nuevo', label: 'Nuevo' }
        ]
      },
      { campo: 'activo', label: 'Activo', tipo: 'booleano', operadores: ['='] },
      { campo: 'ultimaCompra', label: 'Última Compra', tipo: 'fecha', operadores: ['=', '>', '<', 'between'] }
    ])
    
    // Almacén
    this.configuracionesCampos.set('almacen', [
      { campo: 'producto', label: 'Producto', tipo: 'texto', operadores: ['=', 'contains', 'starts'] },
      { campo: 'categoria', label: 'Categoría', tipo: 'texto', operadores: ['=', 'contains'] },
      { campo: 'stock', label: 'Stock', tipo: 'numero', operadores: ['=', '>', '<', '>=', '<=', 'between'] },
      { campo: 'precioVenta', label: 'Precio', tipo: 'numero', operadores: ['=', '>', '<', '>=', '<=', 'between'] },
      { campo: 'stockBajo', label: 'Stock Bajo', tipo: 'booleano', operadores: ['='] }
    ])
    
    // Auditoría
    this.configuracionesCampos.set('auditoria', [
      { campo: 'fecha', label: 'Fecha', tipo: 'fecha', operadores: ['=', 'between', '>', '<'] },
      { campo: 'usuario', label: 'Usuario', tipo: 'texto', operadores: ['=', 'contains'] },
      { campo: 'accion', label: 'Acción', tipo: 'seleccion', operadores: ['=', '!=', 'in'],
        opciones: [
          { valor: 'crear', label: 'Crear' },
          { valor: 'editar', label: 'Editar' },
          { valor: 'eliminar', label: 'Eliminar' },
          { valor: 'login', label: 'Login' },
          { valor: 'logout', label: 'Logout' }
        ]
      },
      { campo: 'modulo', label: 'Módulo', tipo: 'seleccion', operadores: ['=', '!=', 'in'],
        opciones: [
          { valor: 'bancos', label: 'Bancos' },
          { valor: 'ventas', label: 'Ventas' },
          { valor: 'clientes', label: 'Clientes' },
          { valor: 'almacen', label: 'Almacén' }
        ]
      },
      { campo: 'ip', label: 'IP', tipo: 'texto', operadores: ['=', 'starts'] }
    ])
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // FILTROS PREDEFINIDOS DEL SISTEMA
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  
  private inicializarFiltrosPredefinidos(): void {
    // Filtro: Ventas de Hoy
    this.crearFiltro({
      nombre: 'Ventas de Hoy',
      modulo: 'ventas',
      condiciones: [{
        id: 'f1',
        campo: 'fecha',
        campoLabel: 'Fecha',
        tipo: 'fecha',
        operador: '=',
        valor: 'hoy',
        activo: true
      }],
      usuarioId: 'sistema',
      esFavorito: true,
      esPredeterminado: false,
      esCompartido: true,
      esDelSistema: true,
      color: '#10B981',
      icono: 'Calendar'
    })
    
    // Filtro: Clientes con Saldo
    this.crearFiltro({
      nombre: 'Clientes con Saldo',
      modulo: 'clientes',
      condiciones: [{
        id: 'f2',
        campo: 'saldoPendiente',
        campoLabel: 'Saldo Pendiente',
        tipo: 'numero',
        operador: '>',
        valor: 0,
        activo: true
      }],
      usuarioId: 'sistema',
      esFavorito: true,
      esPredeterminado: false,
      esCompartido: true,
      esDelSistema: true,
      color: '#F59E0B',
      icono: 'AlertTriangle'
    })
    
    // Filtro: Stock Bajo
    this.crearFiltro({
      nombre: 'Stock Bajo',
      modulo: 'almacen',
      condiciones: [{
        id: 'f3',
        campo: 'stockBajo',
        campoLabel: 'Stock Bajo',
        tipo: 'booleano',
        operador: '=',
        valor: true,
        activo: true
      }],
      usuarioId: 'sistema',
      esFavorito: true,
      esPredeterminado: false,
      esCompartido: true,
      esDelSistema: true,
      color: '#EF4444',
      icono: 'Package'
    })
    
    // Filtro: Movimientos Altos
    this.crearFiltro({
      nombre: 'Movimientos > $50,000',
      modulo: 'bancos',
      condiciones: [{
        id: 'f4',
        campo: 'monto',
        campoLabel: 'Monto',
        tipo: 'numero',
        operador: '>=',
        valor: 50000,
        activo: true
      }],
      usuarioId: 'sistema',
      esFavorito: true,
      esPredeterminado: false,
      esCompartido: true,
      esDelSistema: true,
      color: '#8B5CF6',
      icono: 'DollarSign'
    })
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // STORAGE
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  
  private cargarDesdeStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      const datos = localStorage.getItem(this.STORAGE_KEY)
      if (datos) {
        const filtros = JSON.parse(datos) as FiltroGuardado[]
        filtros.forEach(f => {
          if (!f.esDelSistema) {
            this.filtros.set(f.id, f)
          }
        })
      }
    } catch (error) {
      console.error('Error cargando filtros:', error)
    }
  }
  
  private guardarEnStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      const filtrosUsuario = Array.from(this.filtros.values()).filter(f => !f.esDelSistema)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtrosUsuario))
    } catch (error) {
      console.error('Error guardando filtros:', error)
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // MÉTODOS PÚBLICOS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  
  public obtenerConfiguracionCampos(modulo: string): ConfiguracionCampoFiltro[] {
    return this.configuracionesCampos.get(modulo) || []
  }
  
  public obtenerFiltros(modulo?: string, usuarioId?: string): FiltroGuardado[] {
    let resultado = Array.from(this.filtros.values())
    
    if (modulo) {
      resultado = resultado.filter(f => f.modulo === modulo)
    }
    
    if (usuarioId) {
      resultado = resultado.filter(f => 
        f.usuarioId === usuarioId || f.esCompartido || f.esDelSistema
      )
    }
    
    // Ordenar: predeterminados primero, luego favoritos, luego por nombre
    return resultado.sort((a, b) => {
      if (a.esPredeterminado !== b.esPredeterminado) return a.esPredeterminado ? -1 : 1
      if (a.esFavorito !== b.esFavorito) return a.esFavorito ? -1 : 1
      return a.nombre.localeCompare(b.nombre)
    })
  }
  
  public obtenerFiltro(id: string): FiltroGuardado | undefined {
    return this.filtros.get(id)
  }
  
  public obtenerFavoritosUsuario(usuarioId: string, modulo?: string): FiltroGuardado[] {
    return this.obtenerFiltros(modulo, usuarioId).filter(f => f.esFavorito)
  }
  
  public obtenerPredeterminado(modulo: string, usuarioId: string): FiltroGuardado | undefined {
    return Array.from(this.filtros.values()).find(f => 
      f.modulo === modulo && 
      f.esPredeterminado && 
      (f.usuarioId === usuarioId || f.esCompartido)
    )
  }
  
  public crearFiltro(params: Omit<FiltroGuardado, 'id' | 'creadoAt' | 'usosContador'>): FiltroGuardado {
    const id = `filtro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const filtro: FiltroGuardado = {
      ...params,
      id,
      creadoAt: Date.now(),
      usosContador: 0
    }
    
    this.filtros.set(id, filtro)
    this.guardarEnStorage()
    
    return filtro
  }
  
  public actualizarFiltro(id: string, updates: Partial<FiltroGuardado>): FiltroGuardado | undefined {
    const filtro = this.filtros.get(id)
    if (!filtro || filtro.esDelSistema) return undefined
    
    Object.assign(filtro, updates, { modificadoAt: Date.now() })
    this.guardarEnStorage()
    
    return filtro
  }
  
  public eliminarFiltro(id: string): boolean {
    const filtro = this.filtros.get(id)
    if (!filtro || filtro.esDelSistema) return false
    
    this.filtros.delete(id)
    this.guardarEnStorage()
    return true
  }
  
  public toggleFavorito(id: string): boolean {
    const filtro = this.filtros.get(id)
    if (!filtro) return false
    
    filtro.esFavorito = !filtro.esFavorito
    filtro.modificadoAt = Date.now()
    this.guardarEnStorage()
    
    return filtro.esFavorito
  }
  
  public establecerPredeterminado(id: string, modulo: string, usuarioId: string): void {
    // Quitar predeterminado actual
    this.filtros.forEach(f => {
      if (f.modulo === modulo && f.usuarioId === usuarioId && f.esPredeterminado) {
        f.esPredeterminado = false
      }
    })
    
    // Establecer nuevo predeterminado
    const filtro = this.filtros.get(id)
    if (filtro) {
      filtro.esPredeterminado = true
      filtro.modificadoAt = Date.now()
    }
    
    this.guardarEnStorage()
  }
  
  public registrarUso(id: string): void {
    const filtro = this.filtros.get(id)
    if (filtro) {
      filtro.usosContador++
      filtro.ultimoUso = Date.now()
      this.guardarEnStorage()
    }
  }
  
  public duplicarFiltro(id: string, nuevoNombre: string, nuevoUsuarioId: string): FiltroGuardado | undefined {
    const original = this.filtros.get(id)
    if (!original) return undefined
    
    return this.crearFiltro({
      ...original,
      nombre: nuevoNombre,
      usuarioId: nuevoUsuarioId,
      esPredeterminado: false,
      esCompartido: false,
      esDelSistema: false
    })
  }
  
  public aplicarFiltro(id: string, datos: Record<string, unknown>[]): Record<string, unknown>[] {
    const filtro = this.filtros.get(id)
    if (!filtro) return datos
    
    this.registrarUso(id)
    
    return datos.filter(item => {
      return filtro.condiciones.filter(c => c.activo).every(cond => {
        const valor = item[cond.campo]
        return this.evaluarCondicion(valor, cond)
      })
    })
  }
  
  private evaluarCondicion(valor: unknown, condicion: CondicionFiltro): boolean {
    const { operador, valor: condValor, valorSecundario } = condicion
    
    switch (operador) {
      case '=':
        return valor === condValor
      case '!=':
        return valor !== condValor
      case '>':
        return (valor as number) > (condValor as number)
      case '<':
        return (valor as number) < (condValor as number)
      case '>=':
        return (valor as number) >= (condValor as number)
      case '<=':
        return (valor as number) <= (condValor as number)
      case 'between':
        return (valor as number) >= (condValor as number) && (valor as number) <= (valorSecundario as number)
      case 'contains':
        return String(valor).toLowerCase().includes(String(condValor).toLowerCase())
      case 'starts':
        return String(valor).toLowerCase().startsWith(String(condValor).toLowerCase())
      case 'ends':
        return String(valor).toLowerCase().endsWith(String(condValor).toLowerCase())
      case 'in':
        return Array.isArray(condValor) && condValor.includes(valor)
      case 'empty':
        return valor === null || valor === undefined || valor === ''
      case 'not_empty':
        return valor !== null && valor !== undefined && valor !== ''
      default:
        return true
    }
  }
  
  public obtenerEstadisticas(): {
    totalFiltros: number
    filtrosPorModulo: Record<string, number>
    filtrosMasUsados: FiltroGuardado[]
  } {
    const filtros = Array.from(this.filtros.values())
    const porModulo: Record<string, number> = {}
    
    filtros.forEach(f => {
      porModulo[f.modulo] = (porModulo[f.modulo] || 0) + 1
    })
    
    const masUsados = [...filtros]
      .sort((a, b) => b.usosContador - a.usosContador)
      .slice(0, 5)
    
    return {
      totalFiltros: filtros.length,
      filtrosPorModulo: porModulo,
      filtrosMasUsados: masUsados
    }
  }
}

export const filtrosService = FiltrosSupremeService.getInstance()
export default filtrosService
