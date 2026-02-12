/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 👥 CHRONOS INFINITY 2026 — SISTEMA CRUD DE CLIENTES CASA DE CAMBIO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de gestión de clientes con:
 * - CRUD completo (Create, Read, Update, Delete)
 * - Sistema KYC multinivel (básico, intermedio, completo)
 * - Historial de operaciones por cliente
 * - Límites personalizados
 * - Alertas y listas de observación
 * - Búsqueda avanzada y filtros
 * - Exportación de datos
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type TipoIdentificacion = 'INE' | 'PASAPORTE' | 'LICENCIA' | 'CEDULA_PROFESIONAL' | 'FM2' | 'FM3' | 'VISA'

export type NivelKYC = 'basico' | 'intermedio' | 'completo'

export type EstadoCliente = 'activo' | 'inactivo' | 'bloqueado' | 'pendiente_verificacion' | 'en_revision'

export type RiesgoCliente = 'bajo' | 'medio' | 'alto' | 'critico'

export interface DireccionCliente {
  calle: string
  numeroExterior?: string
  numeroInterior?: string
  colonia: string
  codigoPostal: string
  ciudad: string
  estado: string
  pais: string
}

export interface IdentificacionCliente {
  tipo: TipoIdentificacion
  numero: string
  fechaEmision?: string
  fechaVencimiento?: string
  autoridad?: string
  imagenFrente?: string // base64 o URL
  imagenReverso?: string
  verificada: boolean
  fechaVerificacion?: string
}

export interface ClienteCasaCambio {
  id: string
  
  // Datos personales básicos
  nombre: string
  apellidoPaterno: string
  apellidoMaterno?: string
  nombreCompleto: string
  fechaNacimiento?: string
  lugarNacimiento?: string
  sexo?: 'M' | 'F' | 'O'
  estadoCivil?: 'soltero' | 'casado' | 'divorciado' | 'viudo' | 'union_libre'
  
  // Identificaciones
  identificaciones: IdentificacionCliente[]
  identificacionPrincipal?: IdentificacionCliente
  
  // Datos fiscales
  rfc?: string
  curp?: string
  fiel?: string // Para operaciones grandes
  
  // Contacto
  telefono?: string
  telefonoAlterno?: string
  email?: string
  
  // Dirección
  direccion?: DireccionCliente
  
  // Nacionalidad
  nacionalidad: string
  paisNacimiento?: string
  esResidenteExtranjero: boolean
  
  // Ocupación
  ocupacion?: string
  actividadEconomica?: string
  empresaTrabajo?: string
  puestoTrabajo?: string
  ingresoMensualAproximado?: number
  origenRecursos?: string
  
  // PEP (Persona Expuesta Políticamente)
  esPep: boolean
  cargoPep?: string
  institucionPep?: string
  familiaresPep?: string[]
  
  // KYC
  nivelKyc: NivelKYC
  kycCompleto: boolean
  fechaVerificacionKyc?: string
  verificadoPor?: string
  documentosKyc: {
    tipo: string
    nombre: string
    url: string
    fechaCarga: string
  }[]
  
  // Métricas de operación
  totalOperaciones: number
  montoTotalOperado: number
  ultimaOperacion?: string
  operacionesUltimoMes: number
  montoUltimoMes: number
  operacionesHoy: number
  montoHoy: number
  
  // Límites
  limitePorOperacion: number
  limiteDiario: number
  limiteMensual: number
  limitePersonalizado: boolean
  
  // Riesgo y alertas
  nivelRiesgo: RiesgoCliente
  factoresRiesgo: string[]
  enListaObservacion: boolean
  motivoObservacion?: string
  
  // Estado
  estado: EstadoCliente
  motivoBloqueo?: string
  fechaBloqueo?: string
  bloqueadoPor?: string
  
  // Beneficiario final (si aplica)
  esBeneficiarioFinal: boolean
  beneficiarioFinalDe?: string
  
  // Notas y etiquetas
  notas?: string
  etiquetas: string[]
  
  // Auditoría
  creadoPor: string
  fechaCreacion: string
  modificadoPor?: string
  fechaModificacion?: string
}

export interface HistorialOperacionCliente {
  operacionId: string
  folio: string
  fecha: string
  hora: string
  tipoOperacion: 'compra' | 'venta'
  divisaOrigen: string
  divisaDestino: string
  montoOrigen: number
  montoDestino: number
  tipoCambio: number
  gananciaOperacion: number
  cajero: string
  sucursal: string
}

export interface FiltrosCliente {
  busqueda?: string
  estado?: EstadoCliente
  nivelKyc?: NivelKYC
  nivelRiesgo?: RiesgoCliente
  nacionalidad?: string
  fechaDesde?: string
  fechaHasta?: string
  conOperaciones?: boolean
  enListaObservacion?: boolean
  esPep?: boolean
  etiqueta?: string
}

export interface ResultadoBusquedaCliente {
  clientes: ClienteCasaCambio[]
  total: number
  pagina: number
  porPagina: number
  totalPaginas: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN KYC
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const REQUISITOS_KYC: Record<NivelKYC, {
  descripcion: string
  limiteOperacion: number
  limiteDiario: number
  limiteMensual: number
  documentosRequeridos: string[]
}> = {
  basico: {
    descripcion: 'Nombre y teléfono. Sin identificación.',
    limiteOperacion: 500, // USD equivalente
    limiteDiario: 1000,
    limiteMensual: 3000,
    documentosRequeridos: [],
  },
  intermedio: {
    descripcion: 'Identificación oficial válida',
    limiteOperacion: 5000,
    limiteDiario: 10000,
    limiteMensual: 30000,
    documentosRequeridos: ['INE o Pasaporte'],
  },
  completo: {
    descripcion: 'Documentación fiscal y comprobante de domicilio',
    limiteOperacion: 50000,
    limiteDiario: 100000,
    limiteMensual: 500000,
    documentosRequeridos: ['INE o Pasaporte', 'RFC', 'CURP', 'Comprobante de domicilio', 'Comprobante de ingresos'],
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO CRUD DE CLIENTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class ClientesCasaCambioService {
  private static instance: ClientesCasaCambioService
  private clientes: Map<string, ClienteCasaCambio> = new Map()
  private historialOperaciones: Map<string, HistorialOperacionCliente[]> = new Map()

  private constructor() {
    this.inicializar()
  }

  static getInstance(): ClientesCasaCambioService {
    if (!ClientesCasaCambioService.instance) {
      ClientesCasaCambioService.instance = new ClientesCasaCambioService()
    }
    return ClientesCasaCambioService.instance
  }

  private inicializar(): void {
    // Cargar clientes demo
    this.cargarClientesDemo()
    logger.info('👥 Sistema de Clientes Casa de Cambio inicializado', {
      total: this.clientes.size,
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // CREATE
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  crear(datos: {
    nombre: string
    apellidoPaterno: string
    apellidoMaterno?: string
    telefono?: string
    email?: string
    tipoIdentificacion?: TipoIdentificacion
    numeroIdentificacion?: string
    nacionalidad?: string
    ocupacion?: string
    creadoPor: string
    rfc?: string
    curp?: string
  }): ClienteCasaCambio {
    const id = this.generarId()
    const nombreCompleto = this.construirNombreCompleto(
      datos.nombre,
      datos.apellidoPaterno,
      datos.apellidoMaterno
    )

    const identificaciones: IdentificacionCliente[] = []
    if (datos.tipoIdentificacion && datos.numeroIdentificacion) {
      identificaciones.push({
        tipo: datos.tipoIdentificacion,
        numero: datos.numeroIdentificacion,
        verificada: false,
      })
    }

    // Determinar nivel KYC inicial
    let nivelKyc: NivelKYC = 'basico'
    if (identificaciones.length > 0) {
      nivelKyc = 'intermedio'
    }
    if (datos.rfc && datos.curp) {
      nivelKyc = 'completo'
    }

    const cliente: ClienteCasaCambio = {
      id,
      nombre: datos.nombre,
      apellidoPaterno: datos.apellidoPaterno,
      apellidoMaterno: datos.apellidoMaterno,
      nombreCompleto,
      identificaciones,
      identificacionPrincipal: identificaciones[0],
      rfc: datos.rfc,
      curp: datos.curp,
      telefono: datos.telefono,
      email: datos.email,
      nacionalidad: datos.nacionalidad ?? 'Mexicana',
      ocupacion: datos.ocupacion,
      esResidenteExtranjero: false,
      esPep: false,
      nivelKyc,
      kycCompleto: nivelKyc === 'completo',
      documentosKyc: [],
      totalOperaciones: 0,
      montoTotalOperado: 0,
      operacionesUltimoMes: 0,
      montoUltimoMes: 0,
      operacionesHoy: 0,
      montoHoy: 0,
      limitePorOperacion: REQUISITOS_KYC[nivelKyc].limiteOperacion,
      limiteDiario: REQUISITOS_KYC[nivelKyc].limiteDiario,
      limiteMensual: REQUISITOS_KYC[nivelKyc].limiteMensual,
      limitePersonalizado: false,
      nivelRiesgo: 'bajo',
      factoresRiesgo: [],
      enListaObservacion: false,
      esBeneficiarioFinal: true,
      estado: 'activo',
      etiquetas: [],
      creadoPor: datos.creadoPor,
      fechaCreacion: new Date().toISOString(),
    }

    this.clientes.set(id, cliente)
    this.historialOperaciones.set(id, [])

    logger.info('👤 Cliente creado', { id, nombre: nombreCompleto, nivelKyc })

    return cliente
  }

  crearRapido(nombre: string, telefono?: string, creadoPor: string = 'sistema'): ClienteCasaCambio {
    // Parsear nombre completo
    const partes = nombre.trim().split(' ')
    const nombrePila = partes[0] ?? ''
    const apellidoPaterno = partes[1] ?? ''
    const apellidoMaterno = partes.slice(2).join(' ') || undefined

    return this.crear({
      nombre: nombrePila,
      apellidoPaterno,
      apellidoMaterno,
      telefono,
      creadoPor,
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // READ
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  obtener(id: string): ClienteCasaCambio | undefined {
    return this.clientes.get(id)
  }

  obtenerPorNombre(nombre: string): ClienteCasaCambio | undefined {
    const nombreLower = nombre.toLowerCase()
    return Array.from(this.clientes.values()).find(c =>
      c.nombreCompleto.toLowerCase().includes(nombreLower) ||
      c.nombre.toLowerCase() === nombreLower
    )
  }

  obtenerPorTelefono(telefono: string): ClienteCasaCambio | undefined {
    const telLimpio = telefono.replace(/\D/g, '')
    return Array.from(this.clientes.values()).find(c =>
      c.telefono?.replace(/\D/g, '') === telLimpio
    )
  }

  obtenerPorIdentificacion(numero: string): ClienteCasaCambio | undefined {
    return Array.from(this.clientes.values()).find(c =>
      c.identificaciones.some(id => id.numero === numero)
    )
  }

  buscar(filtros: FiltrosCliente, pagina: number = 1, porPagina: number = 20): ResultadoBusquedaCliente {
    let resultado = Array.from(this.clientes.values())

    // Aplicar filtros
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase()
      resultado = resultado.filter(c =>
        c.nombreCompleto.toLowerCase().includes(busqueda) ||
        c.telefono?.includes(busqueda) ||
        c.email?.toLowerCase().includes(busqueda) ||
        c.rfc?.toLowerCase().includes(busqueda) ||
        c.identificaciones.some(id => id.numero.includes(busqueda))
      )
    }

    if (filtros.estado) {
      resultado = resultado.filter(c => c.estado === filtros.estado)
    }

    if (filtros.nivelKyc) {
      resultado = resultado.filter(c => c.nivelKyc === filtros.nivelKyc)
    }

    if (filtros.nivelRiesgo) {
      resultado = resultado.filter(c => c.nivelRiesgo === filtros.nivelRiesgo)
    }

    if (filtros.nacionalidad) {
      resultado = resultado.filter(c => c.nacionalidad === filtros.nacionalidad)
    }

    if (filtros.conOperaciones !== undefined) {
      resultado = resultado.filter(c =>
        filtros.conOperaciones ? c.totalOperaciones > 0 : c.totalOperaciones === 0
      )
    }

    if (filtros.enListaObservacion !== undefined) {
      resultado = resultado.filter(c => c.enListaObservacion === filtros.enListaObservacion)
    }

    if (filtros.esPep !== undefined) {
      resultado = resultado.filter(c => c.esPep === filtros.esPep)
    }

    if (filtros.etiqueta) {
      resultado = resultado.filter(c => c.etiquetas.includes(filtros.etiqueta!))
    }

    // Ordenar por última operación (más recientes primero)
    resultado.sort((a, b) => {
      if (!a.ultimaOperacion) return 1
      if (!b.ultimaOperacion) return -1
      return new Date(b.ultimaOperacion).getTime() - new Date(a.ultimaOperacion).getTime()
    })

    // Paginación
    const total = resultado.length
    const totalPaginas = Math.ceil(total / porPagina)
    const inicio = (pagina - 1) * porPagina
    const fin = inicio + porPagina
    const clientesPaginados = resultado.slice(inicio, fin)

    return {
      clientes: clientesPaginados,
      total,
      pagina,
      porPagina,
      totalPaginas,
    }
  }

  listar(limite: number = 100): ClienteCasaCambio[] {
    return Array.from(this.clientes.values())
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
      .slice(0, limite)
  }

  obtenerHistorial(clienteId: string): HistorialOperacionCliente[] {
    return this.historialOperaciones.get(clienteId) ?? []
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // UPDATE
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  actualizar(id: string, datos: Partial<ClienteCasaCambio>, modificadoPor: string): boolean {
    const cliente = this.clientes.get(id)
    if (!cliente) return false

    // Reconstruir nombre completo si cambiaron los nombres
    if (datos.nombre || datos.apellidoPaterno || datos.apellidoMaterno) {
      datos.nombreCompleto = this.construirNombreCompleto(
        datos.nombre ?? cliente.nombre,
        datos.apellidoPaterno ?? cliente.apellidoPaterno,
        datos.apellidoMaterno ?? cliente.apellidoMaterno
      )
    }

    const clienteActualizado: ClienteCasaCambio = {
      ...cliente,
      ...datos,
      modificadoPor,
      fechaModificacion: new Date().toISOString(),
    }

    this.clientes.set(id, clienteActualizado)

    logger.info('👤 Cliente actualizado', { id, modificadoPor })

    return true
  }

  agregarIdentificacion(id: string, identificacion: IdentificacionCliente, modificadoPor: string): boolean {
    const cliente = this.clientes.get(id)
    if (!cliente) return false

    cliente.identificaciones.push(identificacion)

    // Si no hay principal, establecer esta
    if (!cliente.identificacionPrincipal) {
      cliente.identificacionPrincipal = identificacion
    }

    // Actualizar nivel KYC
    this.recalcularNivelKyc(id)

    cliente.modificadoPor = modificadoPor
    cliente.fechaModificacion = new Date().toISOString()

    logger.info('🆔 Identificación agregada', { clienteId: id, tipo: identificacion.tipo })

    return true
  }

  verificarKyc(id: string, nivel: NivelKYC, verificadoPor: string): boolean {
    const cliente = this.clientes.get(id)
    if (!cliente) return false

    cliente.nivelKyc = nivel
    cliente.kycCompleto = nivel === 'completo'
    cliente.fechaVerificacionKyc = new Date().toISOString()
    cliente.verificadoPor = verificadoPor

    // Actualizar límites según nivel
    cliente.limitePorOperacion = REQUISITOS_KYC[nivel].limiteOperacion
    cliente.limiteDiario = REQUISITOS_KYC[nivel].limiteDiario
    cliente.limiteMensual = REQUISITOS_KYC[nivel].limiteMensual
    cliente.limitePersonalizado = false

    logger.info('✅ KYC verificado', { clienteId: id, nivel, verificadoPor })

    return true
  }

  establecerLimitesPersonalizados(
    id: string,
    limites: { porOperacion?: number; diario?: number; mensual?: number },
    modificadoPor: string
  ): boolean {
    const cliente = this.clientes.get(id)
    if (!cliente) return false

    if (limites.porOperacion !== undefined) {
      cliente.limitePorOperacion = limites.porOperacion
    }
    if (limites.diario !== undefined) {
      cliente.limiteDiario = limites.diario
    }
    if (limites.mensual !== undefined) {
      cliente.limiteMensual = limites.mensual
    }

    cliente.limitePersonalizado = true
    cliente.modificadoPor = modificadoPor
    cliente.fechaModificacion = new Date().toISOString()

    logger.info('💰 Límites personalizados establecidos', { clienteId: id, limites })

    return true
  }

  bloquear(id: string, motivo: string, bloqueadoPor: string): boolean {
    const cliente = this.clientes.get(id)
    if (!cliente) return false

    cliente.estado = 'bloqueado'
    cliente.motivoBloqueo = motivo
    cliente.fechaBloqueo = new Date().toISOString()
    cliente.bloqueadoPor = bloqueadoPor

    logger.warn('🚫 Cliente bloqueado', { clienteId: id, motivo, bloqueadoPor })

    return true
  }

  desbloquear(id: string, modificadoPor: string): boolean {
    const cliente = this.clientes.get(id)
    if (!cliente || cliente.estado !== 'bloqueado') return false

    cliente.estado = 'activo'
    cliente.motivoBloqueo = undefined
    cliente.fechaBloqueo = undefined
    cliente.bloqueadoPor = undefined
    cliente.modificadoPor = modificadoPor
    cliente.fechaModificacion = new Date().toISOString()

    logger.info('✅ Cliente desbloqueado', { clienteId: id })

    return true
  }

  agregarAListaObservacion(id: string, motivo: string, modificadoPor: string): boolean {
    const cliente = this.clientes.get(id)
    if (!cliente) return false

    cliente.enListaObservacion = true
    cliente.motivoObservacion = motivo
    cliente.modificadoPor = modificadoPor
    cliente.fechaModificacion = new Date().toISOString()

    logger.warn('👁️ Cliente en lista de observación', { clienteId: id, motivo })

    return true
  }

  registrarOperacion(
    clienteId: string,
    operacion: HistorialOperacionCliente,
    montoUsdEquivalente: number
  ): void {
    const cliente = this.clientes.get(clienteId)
    if (!cliente) return

    // Guardar en historial
    const historial = this.historialOperaciones.get(clienteId) ?? []
    historial.unshift(operacion)
    this.historialOperaciones.set(clienteId, historial)

    // Actualizar métricas
    cliente.totalOperaciones++
    cliente.montoTotalOperado += montoUsdEquivalente
    cliente.ultimaOperacion = new Date().toISOString()
    cliente.operacionesHoy++
    cliente.montoHoy += montoUsdEquivalente
    cliente.operacionesUltimoMes++
    cliente.montoUltimoMes += montoUsdEquivalente

    // Recalcular riesgo basado en patrones
    this.recalcularRiesgo(clienteId)
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // DELETE
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  eliminar(id: string, eliminadoPor: string): boolean {
    const cliente = this.clientes.get(id)
    if (!cliente) return false

    // No eliminar si tiene operaciones (solo marcar como inactivo)
    if (cliente.totalOperaciones > 0) {
      cliente.estado = 'inactivo'
      cliente.modificadoPor = eliminadoPor
      cliente.fechaModificacion = new Date().toISOString()
      logger.info('👤 Cliente marcado como inactivo (tiene operaciones)', { id })
      return true
    }

    this.clientes.delete(id)
    this.historialOperaciones.delete(id)

    logger.info('🗑️ Cliente eliminado', { id, eliminadoPor })

    return true
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private generarId(): string {
    return `cli_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
  }

  private construirNombreCompleto(nombre: string, apellidoPaterno: string, apellidoMaterno?: string): string {
    return [nombre, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ')
  }

  private recalcularNivelKyc(id: string): void {
    const cliente = this.clientes.get(id)
    if (!cliente) return

    let nivel: NivelKYC = 'basico'

    if (cliente.identificaciones.length > 0) {
      nivel = 'intermedio'
    }

    if (
      cliente.identificaciones.length > 0 &&
      cliente.rfc &&
      cliente.curp &&
      cliente.direccion
    ) {
      nivel = 'completo'
    }

    if (cliente.nivelKyc !== nivel && !cliente.kycCompleto) {
      cliente.nivelKyc = nivel

      // Actualizar límites si no son personalizados
      if (!cliente.limitePersonalizado) {
        cliente.limitePorOperacion = REQUISITOS_KYC[nivel].limiteOperacion
        cliente.limiteDiario = REQUISITOS_KYC[nivel].limiteDiario
        cliente.limiteMensual = REQUISITOS_KYC[nivel].limiteMensual
      }
    }
  }

  private recalcularRiesgo(id: string): void {
    const cliente = this.clientes.get(id)
    if (!cliente) return

    const factores: string[] = []
    let puntuacion = 0

    // Factores de riesgo
    if (cliente.esPep) {
      puntuacion += 3
      factores.push('Persona Expuesta Políticamente')
    }

    if (!cliente.kycCompleto) {
      puntuacion += 1
      factores.push('KYC incompleto')
    }

    if (cliente.esResidenteExtranjero) {
      puntuacion += 1
      factores.push('Residente extranjero')
    }

    if (cliente.operacionesHoy >= 5) {
      puntuacion += 2
      factores.push('Múltiples operaciones hoy')
    }

    if (cliente.montoUltimoMes > 50000) {
      puntuacion += 2
      factores.push('Alto volumen mensual')
    }

    // Determinar nivel de riesgo
    let nivelRiesgo: RiesgoCliente = 'bajo'
    if (puntuacion >= 6) {
      nivelRiesgo = 'critico'
    } else if (puntuacion >= 4) {
      nivelRiesgo = 'alto'
    } else if (puntuacion >= 2) {
      nivelRiesgo = 'medio'
    }

    cliente.nivelRiesgo = nivelRiesgo
    cliente.factoresRiesgo = factores
  }

  verificarLimites(clienteId: string, montoUsd: number): {
    permitido: boolean
    mensaje?: string
    limiteRestanteHoy?: number
  } {
    const cliente = this.clientes.get(clienteId)
    if (!cliente) {
      return { permitido: true } // Cliente no registrado, aplicar límites básicos
    }

    if (cliente.estado === 'bloqueado') {
      return { permitido: false, mensaje: `Cliente bloqueado: ${cliente.motivoBloqueo}` }
    }

    if (montoUsd > cliente.limitePorOperacion) {
      return {
        permitido: false,
        mensaje: `Excede límite por operación ($${cliente.limitePorOperacion} USD)`,
      }
    }

    const montoHoyConOperacion = cliente.montoHoy + montoUsd
    if (montoHoyConOperacion > cliente.limiteDiario) {
      return {
        permitido: false,
        mensaje: `Excede límite diario ($${cliente.limiteDiario} USD). Operado hoy: $${cliente.montoHoy}`,
        limiteRestanteHoy: cliente.limiteDiario - cliente.montoHoy,
      }
    }

    return {
      permitido: true,
      limiteRestanteHoy: cliente.limiteDiario - cliente.montoHoy - montoUsd,
    }
  }

  getEstadisticas(): {
    total: number
    activos: number
    bloqueados: number
    enObservacion: number
    porNivelKyc: Record<NivelKYC, number>
    porNivelRiesgo: Record<RiesgoCliente, number>
  } {
    const clientes = Array.from(this.clientes.values())

    const porNivelKyc: Record<NivelKYC, number> = { basico: 0, intermedio: 0, completo: 0 }
    const porNivelRiesgo: Record<RiesgoCliente, number> = { bajo: 0, medio: 0, alto: 0, critico: 0 }

    clientes.forEach(c => {
      porNivelKyc[c.nivelKyc]++
      porNivelRiesgo[c.nivelRiesgo]++
    })

    return {
      total: clientes.length,
      activos: clientes.filter(c => c.estado === 'activo').length,
      bloqueados: clientes.filter(c => c.estado === 'bloqueado').length,
      enObservacion: clientes.filter(c => c.enListaObservacion).length,
      porNivelKyc,
      porNivelRiesgo,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // DATOS DEMO
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private cargarClientesDemo(): void {
    const clientesDemo = [
      { nombre: 'María', apellidoPaterno: 'González', apellidoMaterno: 'López', telefono: '5512345678' },
      { nombre: 'Carlos', apellidoPaterno: 'Hernández', apellidoMaterno: 'Martínez', telefono: '5523456789', rfc: 'HEMC901231XX0' },
      { nombre: 'Ana', apellidoPaterno: 'Rodríguez', apellidoMaterno: 'García', telefono: '5534567890', email: 'ana@email.com' },
      { nombre: 'José', apellidoPaterno: 'López', apellidoMaterno: 'Sánchez', telefono: '5545678901' },
      { nombre: 'Laura', apellidoPaterno: 'Martínez', telefono: '5556789012', tipoIdentificacion: 'INE' as TipoIdentificacion, numeroIdentificacion: 'INE123456789' },
    ]

    clientesDemo.forEach(c => {
      this.crear({ ...c, creadoPor: 'sistema_demo' })
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const clientesCasaCambioService = ClientesCasaCambioService.getInstance()

export default clientesCasaCambioService
