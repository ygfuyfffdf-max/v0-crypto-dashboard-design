/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 👥 USER MANAGEMENT API — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * API para gestión completa de usuarios con permisos granulares
 */

import { db } from '@/database'
import { usuarios } from '@/database/schema'
import { usuariosExtendido, roles, permisos, rolesPermisos, usuariosPermisos } from '@/database/schema-permisos'
import { eq, and, or, like } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

// GET - Listar usuarios con sus permisos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const rolId = searchParams.get('rol')

    // Obtener todos los usuarios con sus extensiones y roles
    const usuariosData = await db.query.usuarios.findMany({
      orderBy: (usuarios, { desc }) => [desc(usuarios.createdAt)],
    })

    // Obtener extensiones de usuario
    const extensiones = await db.query.usuariosExtendido.findMany({
      with: {
        rol: true,
      },
    })

    // Combinar datos
    const resultado = usuariosData.map((user) => {
      const ext = extensiones.find((e) => e.usuarioId === user.id)
      return {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
        createdAt: user.createdAt,
        // Datos extendidos
        rolId: ext?.rolId,
        rolNombre: ext?.rol?.nombre,
        rolColor: ext?.rol?.color,
        bancosPermitidos: ext?.bancosPermitidos ? JSON.parse(ext.bancosPermitidos) : [],
        limiteMontoOperacion: ext?.limiteMontoOperacion,
        limiteDiario: ext?.limiteDiario,
        requiereAprobacion: ext?.requiereAprobacion,
        horaInicioAcceso: ext?.horaInicioAcceso,
        horaFinAcceso: ext?.horaFinAcceso,
        diasPermitidos: ext?.diasPermitidos ? JSON.parse(ext.diasPermitidos) : null,
        bloqueado: ext?.bloqueado,
        ultimoAcceso: ext?.ultimoAcceso,
        ultimaIp: ext?.ultimaIp,
      }
    })

    // Filtrar si hay búsqueda
    let filtrados = resultado
    if (search) {
      const searchLower = search.toLowerCase()
      filtrados = resultado.filter(
        (u) =>
          u.nombre.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
      )
    }
    if (rolId) {
      filtrados = filtrados.filter((u) => u.rolId === rolId)
    }

    return NextResponse.json(filtrados)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}

// POST - Crear usuario con restricciones
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      email,
      password,
      nombre,
      rolId,
      bancosPermitidos,
      limiteMontoOperacion,
      limiteDiario,
      requiereAprobacion,
      montoRequiereAprobacion,
      horaInicioAcceso,
      horaFinAcceso,
      diasPermitidos,
      permisosEspecificos,
    } = data

    // Validar email único
    const existing = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, email),
    })
    if (existing) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })
    }

    // Crear usuario base
    const userId = nanoid()
    const now = Math.floor(Date.now() / 1000)

    await db.insert(usuarios).values({
      id: userId,
      email,
      password, // En producción: hash con bcrypt
      nombre,
      role: rolId ? 'operator' : 'viewer',
      createdAt: now,
      updatedAt: now,
    })

    // Crear extensión con restricciones
    await db.insert(usuariosExtendido).values({
      id: nanoid(),
      usuarioId: userId,
      rolId,
      bancosPermitidos: bancosPermitidos?.length ? JSON.stringify(bancosPermitidos) : null,
      limiteMontoOperacion,
      limiteDiario,
      requiereAprobacion: requiereAprobacion || false,
      montoRequiereAprobacion,
      horaInicioAcceso,
      horaFinAcceso,
      diasPermitidos: diasPermitidos?.length ? JSON.stringify(diasPermitidos) : null,
      createdAt: now,
      updatedAt: now,
    })

    // Asignar permisos específicos si los hay
    if (permisosEspecificos?.length) {
      await db.insert(usuariosPermisos).values(
        permisosEspecificos.map((p: { permisoId: string; concedido: boolean }) => ({
          id: nanoid(),
          usuarioId: userId,
          permisoId: p.permisoId,
          concedido: p.concedido,
          createdAt: now,
        }))
      )
    }

    return NextResponse.json({ success: true, id: userId })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
  }
}
