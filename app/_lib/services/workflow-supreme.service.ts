/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔄 CHRONOS INFINITY 2026 — SISTEMA DE WORKFLOWS Y APROBACIONES MULTI-NIVEL
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de workflows con:
 * - Flujos de aprobación configurables
 * - Múltiples niveles de aprobación
 * - Escalamiento automático
 * - Notificaciones en cada paso
 * - Historial completo de acciones
 * - Delegación de aprobaciones
 * - Reglas condicionales
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type EstadoWorkflow =
  | 'borrador'
  | 'pendiente'
  | 'en_revision'
  | 'aprobado'
  | 'rechazado'
  | 'cancelado'
  | 'escalado'
  | 'completado'

export type TipoWorkflow =
  | 'aprobacion_simple'
  | 'aprobacion_secuencial'
  | 'aprobacion_paralela'
  | 'revision_multiple'
  | 'escalamiento_automatico'

export type TipoCondicion = 'monto' | 'categoria' | 'usuario' | 'horario' | 'banco' | 'personalizada'

export interface CondicionWorkflow {
  id: string
  tipo: TipoCondicion
  operador: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'contains' | 'between'
  valor: unknown
  valorSecundario?: unknown // Para 'between'
}

export interface NivelAprobacion {
  id: string
  orden: number
  nombre: string
  descripcion?: string
  aprobadores: AprobadorNivel[]
  requiereTodos: boolean // true = todos deben aprobar, false = uno es suficiente
  tiempoLimite?: number // horas
  escalamientoAutomatico: boolean
  escalamientoDestinoNivelId?: string
  condiciones?: CondicionWorkflow[]
}

export interface AprobadorNivel {
  id: string
  usuarioId?: string
  rolId?: string
  tipo: 'usuario' | 'rol' | 'superior_jerarquico' | 'propietario_entidad'
  nombre: string
  email?: string
  puedeDelegar: boolean
  delegadoA?: string
}

export interface DefinicionWorkflow {
  id: string
  nombre: string
  descripcion: string
  tipo: TipoWorkflow
  modulo: string
  activo: boolean
  niveles: NivelAprobacion[]
  condicionesIniciales?: CondicionWorkflow[]
  configuracion: {
    permitirCancelar: boolean
    permitirModificarEnProceso: boolean
    notificarSolicitante: boolean
    notificarAprobadores: boolean
    recordatorioHoras?: number
    escalamientoGlobalHoras?: number
    destinoEscalamientoGlobalRolId?: string
  }
  creadoPor: string
  creadoAt: number
  modificadoPor?: string
  modificadoAt?: number
}

export interface InstanciaWorkflow {
  id: string
  definicionId: string
  definicionNombre: string
  solicitanteId: string
  solicitanteNombre: string
  estado: EstadoWorkflow
  nivelActual: number
  entidadTipo: string
  entidadId: string
  entidadNombre: string
  datosEntidad: Record<string, unknown>
  modulo: string
  monto?: number
  historial: AccionWorkflow[]
  aprobacionesPendientes: AprobacionPendiente[]
  creadoAt: number
  actualizadoAt: number
  completadoAt?: number
  canceladoAt?: number
  motivoCancelacion?: string
}

export interface AprobacionPendiente {
  id: string
  nivelId: string
  nivelOrden: number
  nivelNombre: string
  aprobadorId: string
  aprobadorNombre: string
  aprobadorTipo: 'usuario' | 'rol'
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'delegada' | 'escalada'
  delegadoDesde?: string
  comentarios?: string
  creadoAt: number
  respondidoAt?: number
  tiempoLimite?: number
}

export interface AccionWorkflow {
  id: string
  tipo:
    | 'creado'
    | 'enviado'
    | 'aprobado'
    | 'rechazado'
    | 'escalado'
    | 'delegado'
    | 'comentario'
    | 'cancelado'
    | 'completado'
    | 'revertido'
  usuarioId: string
  usuarioNombre: string
  nivelId?: string
  nivelNombre?: string
  comentarios?: string
  metadatos?: Record<string, unknown>
  timestamp: number
}

export interface ResultadoAccionWorkflow {
  exito: boolean
  mensaje: string
  instancia?: InstanciaWorkflow
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE WORKFLOWS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class WorkflowSupremeService {
  private static instance: WorkflowSupremeService
  private definiciones: Map<string, DefinicionWorkflow> = new Map()
  private instancias: Map<string, InstanciaWorkflow> = new Map()
  private listeners: Map<string, Set<(instancia: InstanciaWorkflow) => void>> = new Map()

  private constructor() {
    this.inicializarDefinicionesPredefinidas()
  }

  public static getInstance(): WorkflowSupremeService {
    if (!WorkflowSupremeService.instance) {
      WorkflowSupremeService.instance = new WorkflowSupremeService()
    }
    return WorkflowSupremeService.instance
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // DEFINICIONES DE WORKFLOWS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private inicializarDefinicionesPredefinidas(): void {
    // Workflow de Gastos con aprobación por monto
    this.definiciones.set('workflow_gastos', {
      id: 'workflow_gastos',
      nombre: 'Aprobación de Gastos',
      descripcion: 'Flujo de aprobación para gastos según monto',
      tipo: 'aprobacion_secuencial',
      modulo: 'gastos',
      activo: true,
      niveles: [
        {
          id: 'nivel_1',
          orden: 1,
          nombre: 'Supervisor Directo',
          descripcion: 'Primera revisión por supervisor',
          aprobadores: [
            {
              id: 'apr_1',
              tipo: 'superior_jerarquico',
              nombre: 'Supervisor Directo',
              puedeDelegar: true,
            },
          ],
          requiereTodos: false,
          tiempoLimite: 24,
          escalamientoAutomatico: true,
          escalamientoDestinoNivelId: 'nivel_2',
          condiciones: [{ id: 'cond_1', tipo: 'monto', operador: '<', valor: 10000 }],
        },
        {
          id: 'nivel_2',
          orden: 2,
          nombre: 'Gerente de Área',
          descripcion: 'Revisión por gerente para montos mayores',
          aprobadores: [
            {
              id: 'apr_2',
              rolId: 'rol_gerente',
              tipo: 'rol',
              nombre: 'Gerente de Área',
              puedeDelegar: true,
            },
          ],
          requiereTodos: false,
          tiempoLimite: 48,
          escalamientoAutomatico: true,
          escalamientoDestinoNivelId: 'nivel_3',
          condiciones: [
            { id: 'cond_2', tipo: 'monto', operador: 'between', valor: 10000, valorSecundario: 50000 },
          ],
        },
        {
          id: 'nivel_3',
          orden: 3,
          nombre: 'Director Financiero',
          descripcion: 'Aprobación final para montos altos',
          aprobadores: [
            {
              id: 'apr_3',
              rolId: 'rol_director_financiero',
              tipo: 'rol',
              nombre: 'Director Financiero',
              puedeDelegar: false,
            },
          ],
          requiereTodos: true,
          tiempoLimite: 72,
          escalamientoAutomatico: false,
          condiciones: [{ id: 'cond_3', tipo: 'monto', operador: '>=', valor: 50000 }],
        },
      ],
      configuracion: {
        permitirCancelar: true,
        permitirModificarEnProceso: false,
        notificarSolicitante: true,
        notificarAprobadores: true,
        recordatorioHoras: 12,
        escalamientoGlobalHoras: 72,
        destinoEscalamientoGlobalRolId: 'rol_admin',
      },
      creadoPor: 'sistema',
      creadoAt: Date.now(),
    })

    // Workflow de Transferencias
    this.definiciones.set('workflow_transferencias', {
      id: 'workflow_transferencias',
      nombre: 'Aprobación de Transferencias',
      descripcion: 'Flujo para transferencias entre bancos',
      tipo: 'aprobacion_paralela',
      modulo: 'bancos',
      activo: true,
      niveles: [
        {
          id: 'nivel_trans_1',
          orden: 1,
          nombre: 'Tesorería',
          aprobadores: [
            {
              id: 'apr_tes',
              rolId: 'rol_tesorero',
              tipo: 'rol',
              nombre: 'Tesorero',
              puedeDelegar: true,
            },
            {
              id: 'apr_cont',
              rolId: 'rol_contador',
              tipo: 'rol',
              nombre: 'Contador',
              puedeDelegar: true,
            },
          ],
          requiereTodos: true,
          tiempoLimite: 24,
          escalamientoAutomatico: true,
          condiciones: [{ id: 'cond_t1', tipo: 'monto', operador: '>=', valor: 25000 }],
        },
      ],
      configuracion: {
        permitirCancelar: true,
        permitirModificarEnProceso: false,
        notificarSolicitante: true,
        notificarAprobadores: true,
        recordatorioHoras: 8,
      },
      creadoPor: 'sistema',
      creadoAt: Date.now(),
    })

    // Workflow de Órdenes de Compra
    this.definiciones.set('workflow_ordenes', {
      id: 'workflow_ordenes',
      nombre: 'Aprobación de Órdenes de Compra',
      descripcion: 'Flujo de aprobación para órdenes de compra',
      tipo: 'aprobacion_secuencial',
      modulo: 'ordenes',
      activo: true,
      niveles: [
        {
          id: 'nivel_oc_1',
          orden: 1,
          nombre: 'Almacén',
          aprobadores: [
            {
              id: 'apr_alm',
              rolId: 'rol_almacen',
              tipo: 'rol',
              nombre: 'Encargado de Almacén',
              puedeDelegar: true,
            },
          ],
          requiereTodos: false,
          tiempoLimite: 24,
          escalamientoAutomatico: true,
        },
        {
          id: 'nivel_oc_2',
          orden: 2,
          nombre: 'Compras',
          aprobadores: [
            {
              id: 'apr_comp',
              rolId: 'rol_compras',
              tipo: 'rol',
              nombre: 'Jefe de Compras',
              puedeDelegar: true,
            },
          ],
          requiereTodos: false,
          tiempoLimite: 48,
          escalamientoAutomatico: true,
        },
      ],
      configuracion: {
        permitirCancelar: true,
        permitirModificarEnProceso: true,
        notificarSolicitante: true,
        notificarAprobadores: true,
        recordatorioHoras: 12,
      },
      creadoPor: 'sistema',
      creadoAt: Date.now(),
    })
  }

  /**
   * Obtiene todas las definiciones de workflow
   */
  public obtenerDefiniciones(): DefinicionWorkflow[] {
    return Array.from(this.definiciones.values())
  }

  /**
   * Obtiene una definición por ID
   */
  public obtenerDefinicion(id: string): DefinicionWorkflow | undefined {
    return this.definiciones.get(id)
  }

  /**
   * Obtiene definiciones por módulo
   */
  public obtenerDefinicionesPorModulo(modulo: string): DefinicionWorkflow[] {
    return Array.from(this.definiciones.values()).filter((d) => d.modulo === modulo && d.activo)
  }

  /**
   * Crea o actualiza una definición de workflow
   */
  public guardarDefinicion(definicion: DefinicionWorkflow): void {
    this.definiciones.set(definicion.id, definicion)
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // INSTANCIAS DE WORKFLOWS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Inicia una nueva instancia de workflow
   */
  public async iniciarWorkflow(params: {
    definicionId: string
    solicitanteId: string
    solicitanteNombre: string
    entidadTipo: string
    entidadId: string
    entidadNombre: string
    datosEntidad: Record<string, unknown>
    monto?: number
  }): Promise<ResultadoAccionWorkflow> {
    const definicion = this.definiciones.get(params.definicionId)
    if (!definicion) {
      return { exito: false, mensaje: 'Definición de workflow no encontrada' }
    }

    // Verificar condiciones iniciales
    if (definicion.condicionesIniciales) {
      const cumpleCondiciones = this.evaluarCondiciones(
        definicion.condicionesIniciales,
        params.datosEntidad,
        params.monto
      )
      if (!cumpleCondiciones) {
        return {
          exito: false,
          mensaje: 'No se cumplen las condiciones para iniciar este workflow',
        }
      }
    }

    // Determinar el nivel inicial basado en condiciones
    const nivelInicial = this.determinarNivelInicial(definicion, params.datosEntidad, params.monto)

    const instancia: InstanciaWorkflow = {
      id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      definicionId: params.definicionId,
      definicionNombre: definicion.nombre,
      solicitanteId: params.solicitanteId,
      solicitanteNombre: params.solicitanteNombre,
      estado: 'pendiente',
      nivelActual: nivelInicial.orden,
      entidadTipo: params.entidadTipo,
      entidadId: params.entidadId,
      entidadNombre: params.entidadNombre,
      datosEntidad: params.datosEntidad,
      modulo: definicion.modulo,
      monto: params.monto,
      historial: [
        {
          id: `acc_${Date.now()}`,
          tipo: 'creado',
          usuarioId: params.solicitanteId,
          usuarioNombre: params.solicitanteNombre,
          comentarios: 'Workflow iniciado',
          timestamp: Date.now(),
        },
      ],
      aprobacionesPendientes: this.crearAprobacionesPendientes(nivelInicial),
      creadoAt: Date.now(),
      actualizadoAt: Date.now(),
    }

    this.instancias.set(instancia.id, instancia)
    this.notificarCambio(instancia)

    logger.info('🔄 Workflow iniciado', {
      id: instancia.id,
      definicion: definicion.nombre,
      nivel: nivelInicial.nombre,
    })

    return {
      exito: true,
      mensaje: 'Workflow iniciado correctamente',
      instancia,
    }
  }

  /**
   * Procesa una aprobación
   */
  public async aprobar(params: {
    instanciaId: string
    aprobacionId: string
    aprobadorId: string
    aprobadorNombre: string
    comentarios?: string
  }): Promise<ResultadoAccionWorkflow> {
    const instancia = this.instancias.get(params.instanciaId)
    if (!instancia) {
      return { exito: false, mensaje: 'Instancia de workflow no encontrada' }
    }

    const aprobacion = instancia.aprobacionesPendientes.find((a) => a.id === params.aprobacionId)
    if (!aprobacion) {
      return { exito: false, mensaje: 'Aprobación no encontrada' }
    }

    if (aprobacion.estado !== 'pendiente') {
      return { exito: false, mensaje: 'Esta aprobación ya fue procesada' }
    }

    // Actualizar aprobación
    aprobacion.estado = 'aprobada'
    aprobacion.comentarios = params.comentarios
    aprobacion.respondidoAt = Date.now()

    // Agregar al historial
    instancia.historial.push({
      id: `acc_${Date.now()}`,
      tipo: 'aprobado',
      usuarioId: params.aprobadorId,
      usuarioNombre: params.aprobadorNombre,
      nivelId: aprobacion.nivelId,
      nivelNombre: aprobacion.nivelNombre,
      comentarios: params.comentarios,
      timestamp: Date.now(),
    })

    // Verificar si el nivel está completado
    const nivelCompletado = this.verificarNivelCompletado(instancia)
    if (nivelCompletado) {
      await this.avanzarNivel(instancia)
    }

    instancia.actualizadoAt = Date.now()
    this.notificarCambio(instancia)

    return {
      exito: true,
      mensaje: 'Aprobación registrada correctamente',
      instancia,
    }
  }

  /**
   * Procesa un rechazo
   */
  public async rechazar(params: {
    instanciaId: string
    aprobacionId: string
    aprobadorId: string
    aprobadorNombre: string
    comentarios: string
  }): Promise<ResultadoAccionWorkflow> {
    const instancia = this.instancias.get(params.instanciaId)
    if (!instancia) {
      return { exito: false, mensaje: 'Instancia de workflow no encontrada' }
    }

    const aprobacion = instancia.aprobacionesPendientes.find((a) => a.id === params.aprobacionId)
    if (!aprobacion) {
      return { exito: false, mensaje: 'Aprobación no encontrada' }
    }

    // Actualizar aprobación
    aprobacion.estado = 'rechazada'
    aprobacion.comentarios = params.comentarios
    aprobacion.respondidoAt = Date.now()

    // Actualizar instancia
    instancia.estado = 'rechazado'
    instancia.historial.push({
      id: `acc_${Date.now()}`,
      tipo: 'rechazado',
      usuarioId: params.aprobadorId,
      usuarioNombre: params.aprobadorNombre,
      nivelId: aprobacion.nivelId,
      nivelNombre: aprobacion.nivelNombre,
      comentarios: params.comentarios,
      timestamp: Date.now(),
    })

    instancia.actualizadoAt = Date.now()
    this.notificarCambio(instancia)

    return {
      exito: true,
      mensaje: 'Workflow rechazado',
      instancia,
    }
  }

  /**
   * Delega una aprobación a otro usuario
   */
  public async delegar(params: {
    instanciaId: string
    aprobacionId: string
    deleganteId: string
    deleganteNombre: string
    delegadoId: string
    delegadoNombre: string
    comentarios?: string
  }): Promise<ResultadoAccionWorkflow> {
    const instancia = this.instancias.get(params.instanciaId)
    if (!instancia) {
      return { exito: false, mensaje: 'Instancia de workflow no encontrada' }
    }

    const aprobacion = instancia.aprobacionesPendientes.find((a) => a.id === params.aprobacionId)
    if (!aprobacion) {
      return { exito: false, mensaje: 'Aprobación no encontrada' }
    }

    // Marcar como delegada
    aprobacion.estado = 'delegada'
    aprobacion.delegadoDesde = params.deleganteNombre

    // Crear nueva aprobación para el delegado
    const nuevaAprobacion: AprobacionPendiente = {
      id: `apr_${Date.now()}`,
      nivelId: aprobacion.nivelId,
      nivelOrden: aprobacion.nivelOrden,
      nivelNombre: aprobacion.nivelNombre,
      aprobadorId: params.delegadoId,
      aprobadorNombre: params.delegadoNombre,
      aprobadorTipo: 'usuario',
      estado: 'pendiente',
      delegadoDesde: params.deleganteNombre,
      creadoAt: Date.now(),
      tiempoLimite: aprobacion.tiempoLimite,
    }

    instancia.aprobacionesPendientes.push(nuevaAprobacion)

    instancia.historial.push({
      id: `acc_${Date.now()}`,
      tipo: 'delegado',
      usuarioId: params.deleganteId,
      usuarioNombre: params.deleganteNombre,
      nivelId: aprobacion.nivelId,
      nivelNombre: aprobacion.nivelNombre,
      comentarios: `Delegado a ${params.delegadoNombre}. ${params.comentarios || ''}`,
      timestamp: Date.now(),
    })

    instancia.actualizadoAt = Date.now()
    this.notificarCambio(instancia)

    return {
      exito: true,
      mensaje: 'Aprobación delegada correctamente',
      instancia,
    }
  }

  /**
   * Cancela un workflow
   */
  public async cancelar(params: {
    instanciaId: string
    usuarioId: string
    usuarioNombre: string
    motivo: string
  }): Promise<ResultadoAccionWorkflow> {
    const instancia = this.instancias.get(params.instanciaId)
    if (!instancia) {
      return { exito: false, mensaje: 'Instancia de workflow no encontrada' }
    }

    const definicion = this.definiciones.get(instancia.definicionId)
    if (!definicion?.configuracion.permitirCancelar) {
      return { exito: false, mensaje: 'Este workflow no permite cancelación' }
    }

    instancia.estado = 'cancelado'
    instancia.canceladoAt = Date.now()
    instancia.motivoCancelacion = params.motivo

    instancia.historial.push({
      id: `acc_${Date.now()}`,
      tipo: 'cancelado',
      usuarioId: params.usuarioId,
      usuarioNombre: params.usuarioNombre,
      comentarios: params.motivo,
      timestamp: Date.now(),
    })

    instancia.actualizadoAt = Date.now()
    this.notificarCambio(instancia)

    return {
      exito: true,
      mensaje: 'Workflow cancelado',
      instancia,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // CONSULTAS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene instancias pendientes para un usuario
   */
  public obtenerPendientesPorUsuario(usuarioId: string): InstanciaWorkflow[] {
    return Array.from(this.instancias.values()).filter(
      (i) =>
        i.estado === 'pendiente' &&
        i.aprobacionesPendientes.some(
          (a) => a.aprobadorId === usuarioId && a.estado === 'pendiente'
        )
    )
  }

  /**
   * Obtiene instancias por entidad
   */
  public obtenerPorEntidad(entidadTipo: string, entidadId: string): InstanciaWorkflow | undefined {
    return Array.from(this.instancias.values()).find(
      (i) => i.entidadTipo === entidadTipo && i.entidadId === entidadId
    )
  }

  /**
   * Obtiene instancias por solicitante
   */
  public obtenerPorSolicitante(solicitanteId: string): InstanciaWorkflow[] {
    return Array.from(this.instancias.values()).filter((i) => i.solicitanteId === solicitanteId)
  }

  /**
   * Obtiene estadísticas de workflows
   */
  public obtenerEstadisticas(): {
    total: number
    pendientes: number
    aprobados: number
    rechazados: number
    porModulo: Record<string, number>
  } {
    const instancias = Array.from(this.instancias.values())
    const porModulo: Record<string, number> = {}

    instancias.forEach((i) => {
      porModulo[i.modulo] = (porModulo[i.modulo] || 0) + 1
    })

    return {
      total: instancias.length,
      pendientes: instancias.filter((i) => i.estado === 'pendiente').length,
      aprobados: instancias.filter((i) => i.estado === 'aprobado' || i.estado === 'completado')
        .length,
      rechazados: instancias.filter((i) => i.estado === 'rechazado').length,
      porModulo,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // HELPERS PRIVADOS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private evaluarCondiciones(
    condiciones: CondicionWorkflow[],
    datos: Record<string, unknown>,
    monto?: number
  ): boolean {
    return condiciones.every((cond) => {
      let valor: unknown

      switch (cond.tipo) {
        case 'monto':
          valor = monto
          break
        default:
          valor = datos[cond.tipo]
      }

      switch (cond.operador) {
        case '>':
          return (valor as number) > (cond.valor as number)
        case '<':
          return (valor as number) < (cond.valor as number)
        case '>=':
          return (valor as number) >= (cond.valor as number)
        case '<=':
          return (valor as number) <= (cond.valor as number)
        case '==':
          return valor === cond.valor
        case '!=':
          return valor !== cond.valor
        case 'between':
          return (
            (valor as number) >= (cond.valor as number) &&
            (valor as number) <= (cond.valorSecundario as number)
          )
        case 'contains':
          return String(valor).includes(String(cond.valor))
        default:
          return true
      }
    })
  }

  private determinarNivelInicial(
    definicion: DefinicionWorkflow,
    datos: Record<string, unknown>,
    monto?: number
  ): NivelAprobacion {
    // Encontrar el nivel que cumple las condiciones
    for (const nivel of definicion.niveles) {
      if (!nivel.condiciones || nivel.condiciones.length === 0) {
        return nivel
      }

      if (this.evaluarCondiciones(nivel.condiciones, datos, monto)) {
        return nivel
      }
    }

    // Si ninguno cumple, retornar el primero
    return definicion.niveles[0]
  }

  private crearAprobacionesPendientes(nivel: NivelAprobacion): AprobacionPendiente[] {
    return nivel.aprobadores.map((apr) => ({
      id: `apr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nivelId: nivel.id,
      nivelOrden: nivel.orden,
      nivelNombre: nivel.nombre,
      aprobadorId: apr.usuarioId || apr.rolId || apr.id,
      aprobadorNombre: apr.nombre,
      aprobadorTipo: apr.tipo === 'usuario' ? 'usuario' : 'rol',
      estado: 'pendiente',
      creadoAt: Date.now(),
      tiempoLimite: nivel.tiempoLimite ? Date.now() + nivel.tiempoLimite * 3600000 : undefined,
    }))
  }

  private verificarNivelCompletado(instancia: InstanciaWorkflow): boolean {
    const definicion = this.definiciones.get(instancia.definicionId)
    if (!definicion) return false

    const nivelActual = definicion.niveles.find((n) => n.orden === instancia.nivelActual)
    if (!nivelActual) return false

    const aprobacionesNivel = instancia.aprobacionesPendientes.filter(
      (a) => a.nivelOrden === instancia.nivelActual && a.estado !== 'delegada'
    )

    if (nivelActual.requiereTodos) {
      return aprobacionesNivel.every((a) => a.estado === 'aprobada')
    } else {
      return aprobacionesNivel.some((a) => a.estado === 'aprobada')
    }
  }

  private async avanzarNivel(instancia: InstanciaWorkflow): Promise<void> {
    const definicion = this.definiciones.get(instancia.definicionId)
    if (!definicion) return

    const siguienteNivel = definicion.niveles.find((n) => n.orden === instancia.nivelActual + 1)

    if (siguienteNivel) {
      // Verificar si el siguiente nivel aplica según condiciones
      if (
        !siguienteNivel.condiciones ||
        this.evaluarCondiciones(siguienteNivel.condiciones, instancia.datosEntidad, instancia.monto)
      ) {
        instancia.nivelActual = siguienteNivel.orden
        instancia.aprobacionesPendientes.push(...this.crearAprobacionesPendientes(siguienteNivel))
      } else {
        // Saltar al siguiente nivel
        await this.avanzarNivel(instancia)
      }
    } else {
      // Workflow completado
      instancia.estado = 'completado'
      instancia.completadoAt = Date.now()
      instancia.historial.push({
        id: `acc_${Date.now()}`,
        tipo: 'completado',
        usuarioId: 'sistema',
        usuarioNombre: 'Sistema',
        comentarios: 'Todas las aprobaciones completadas',
        timestamp: Date.now(),
      })
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // SUSCRIPCIONES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  public suscribir(
    instanciaId: string,
    callback: (instancia: InstanciaWorkflow) => void
  ): () => void {
    if (!this.listeners.has(instanciaId)) {
      this.listeners.set(instanciaId, new Set())
    }
    this.listeners.get(instanciaId)!.add(callback)

    return () => {
      this.listeners.get(instanciaId)?.delete(callback)
    }
  }

  private notificarCambio(instancia: InstanciaWorkflow): void {
    this.listeners.get(instancia.id)?.forEach((callback) => {
      try {
        callback(instancia)
      } catch (error) {
        logger.error('Error en callback de workflow', error)
      }
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const workflowService = WorkflowSupremeService.getInstance()
export default workflowService
