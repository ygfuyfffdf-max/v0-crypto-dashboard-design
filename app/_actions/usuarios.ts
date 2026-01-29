'use server'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📋 CHRONOS INFINITY 2026 — SERVER ACTIONS: USUARIOS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { db } from '@/database'
import { usuarios } from '@/database/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { logger } from '@/app/lib/utils/logger'
import type { LoginInput, RegisterInput, UpdateUsuarioInput } from './types'
import { cookies } from 'next/headers'

/**
 * Obtener todos los usuarios
 */
export async function getUsuarios(limit?: number) {
  try {
    const result = await db.query.usuarios.findMany({
      orderBy: desc(usuarios.createdAt),
      limit: limit ?? 100,
    })
    // Remover passwords antes de retornar
    const usuariosSinPassword = result.map(({ password, ...rest }) => rest)
    return { success: true, data: usuariosSinPassword }
  } catch (error) {
    logger.error('Error al obtener usuarios', error, { context: 'getUsuarios' })
    return { success: false, error: 'Error al obtener usuarios' }
  }
}

/**
 * Obtener usuario por ID
 */
export async function getUsuarioById(id: string) {
  try {
    const usuario = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, id),
    })
    if (!usuario) {
      return { success: false, error: 'Usuario no encontrado' }
    }
    const { password, ...usuarioSinPassword } = usuario
    return { success: true, data: usuarioSinPassword }
  } catch (error) {
    logger.error('Error al obtener usuario', error, { context: 'getUsuarioById', id })
    return { success: false, error: 'Error al obtener usuario' }
  }
}

/**
 * Obtener usuario actual (desde sesión)
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return { success: false, error: 'No hay sesión activa' }
    }

    const usuario = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, userId),
    })

    if (!usuario) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    const { password, ...usuarioSinPassword } = usuario
    return { success: true, data: usuarioSinPassword }
  } catch (error) {
    logger.error('Error al obtener usuario actual', error, { context: 'getCurrentUser' })
    return { success: false, error: 'Error al obtener usuario' }
  }
}

/**
 * Login
 */
export async function login(input: LoginInput) {
  try {
    const usuario = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, input.email),
    })

    if (!usuario) {
      return { success: false, error: 'Credenciales inválidas' }
    }

    // Verificar password (en producción usar bcrypt)
    if (usuario.password !== input.password) {
      return { success: false, error: 'Credenciales inválidas' }
    }

    // Establecer cookie de sesión
    const cookieStore = await cookies()
    cookieStore.set('userId', usuario.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    })

    const { password, ...usuarioSinPassword } = usuario
    return { success: true, data: usuarioSinPassword }
  } catch (error) {
    logger.error('Error en login', error, { context: 'login', email: input.email })
    return { success: false, error: 'Error al iniciar sesión' }
  }
}

/**
 * Logout
 */
export async function logout() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('userId')
    return { success: true }
  } catch (error) {
    logger.error('Error en logout', error, { context: 'logout' })
    return { success: false, error: 'Error al cerrar sesión' }
  }
}

/**
 * Registrar nuevo usuario
 */
export async function register(input: RegisterInput) {
  try {
    // Verificar si el email ya existe
    const existente = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, input.email),
    })

    if (existente) {
      return { success: false, error: 'El email ya está registrado' }
    }

    const id = nanoid()

    // En producción, hashear el password con bcrypt
    await db.insert(usuarios).values({
      id,
      email: input.email,
      password: input.password,
      nombre: input.nombre,
      role: input.role ?? 'viewer',
    })

    return { success: true, data: { id } }
  } catch (error) {
    logger.error('Error al registrar', error, { context: 'register', email: input.email })
    return { success: false, error: 'Error al registrar usuario' }
  }
}

/**
 * Actualizar usuario
 */
export async function updateUsuario(input: UpdateUsuarioInput) {
  try {
    const { id, password, ...datos } = input

    const updateData: Record<string, unknown> = {
      ...datos,
      updatedAt: sql`(unixepoch())`,
    }

    // Solo actualizar password si se proporciona
    if (password) {
      updateData.password = password // En producción, hashear
    }

    await db.update(usuarios).set(updateData).where(eq(usuarios.id, id))

    revalidatePath('/usuarios')

    return { success: true, data: { id } }
  } catch (error) {
    logger.error('Error al actualizar usuario', error, { context: 'updateUsuario', id: input.id })
    return { success: false, error: 'Error al actualizar usuario' }
  }
}

/**
 * Eliminar usuario
 */
export async function deleteUsuario(id: string) {
  try {
    await db.delete(usuarios).where(eq(usuarios.id, id))

    revalidatePath('/usuarios')

    return { success: true }
  } catch (error) {
    logger.error('Error al eliminar usuario', error, { context: 'deleteUsuario', id })
    return { success: false, error: 'Error al eliminar usuario' }
  }
}

/**
 * Cambiar contraseña
 */
export async function cambiarPassword(
  userId: string,
  passwordActual: string,
  passwordNueva: string,
) {
  try {
    const usuario = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, userId),
    })

    if (!usuario) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    // Verificar password actual
    if (usuario.password !== passwordActual) {
      return { success: false, error: 'Contraseña actual incorrecta' }
    }

    // Actualizar password (en producción, hashear)
    await db
      .update(usuarios)
      .set({
        password: passwordNueva,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(usuarios.id, userId))

    return { success: true }
  } catch (error) {
    logger.error('Error al cambiar password', error, { context: 'cambiarPassword', userId })
    return { success: false, error: 'Error al cambiar contraseña' }
  }
}
