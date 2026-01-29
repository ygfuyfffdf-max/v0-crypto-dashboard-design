/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔄 CHRONOS INFINITY 2026 — Firebase to Drizzle Adapter
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Adaptador que proporciona compatibilidad con código legacy de Firebase
 * mientras usa Turso/Drizzle como backend real.
 *
 * @author CHRONOS System
 * @version 2026
 */

import { db as drizzleDb } from '@/database'
import {
  almacen,
  bancos,
  clientes,
  distribuidores,
  movimientos,
  ordenesCompra,
  ventas,
} from '@/database/schema'
import { eq } from 'drizzle-orm'
import { logger } from '../utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS PARA COMPATIBILIDAD
// ═══════════════════════════════════════════════════════════════════════════════

export interface QueryConstraint {
  type: 'where' | 'orderBy' | 'limit'
  field?: string
  operator?: string
  value?: unknown
  direction?: 'asc' | 'desc'
  count?: number
}

export interface DocumentSnapshot<T> {
  id: string
  exists: () => boolean
  data: () => T | undefined
}

export interface QuerySnapshot<T> {
  docs: DocumentSnapshot<T>[]
  empty: boolean
  size: number
  forEach: (callback: (doc: DocumentSnapshot<T>) => void) => void
}

export type Unsubscribe = () => void

// ═══════════════════════════════════════════════════════════════════════════════
// TABLA MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

const tableMap = {
  ventas,
  clientes,
  distribuidores,
  ordenesCompra,
  ordenes_compra: ordenesCompra,
  movimientos,
  bancos,
  almacen,
  productos: almacen,
} as const

type TableName = keyof typeof tableMap

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIONES DE COMPATIBILIDAD FIREBASE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Simula collection() de Firebase
 */
export function collection(_db: unknown, collectionName: string) {
  return { _collectionName: collectionName }
}

/**
 * Simula doc() de Firebase
 */
export function doc(_db: unknown, collectionName: string, docId: string) {
  return { _collectionName: collectionName, _docId: docId }
}

/**
 * Simula where() de Firebase
 */
export function where(field: string, operator: string, value: unknown): QueryConstraint {
  return { type: 'where', field, operator, value }
}

/**
 * Simula orderBy() de Firebase
 */
export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): QueryConstraint {
  return { type: 'orderBy', field, direction }
}

/**
 * Simula limit() de Firebase
 */
export function limit(count: number): QueryConstraint {
  return { type: 'limit', count }
}

/**
 * Simula query() de Firebase
 */
export function query(
  collectionRef: { _collectionName: string },
  ...constraints: QueryConstraint[]
) {
  return {
    _collectionName: collectionRef._collectionName,
    _constraints: constraints,
  }
}

/**
 * Simula getDocs() de Firebase - ejecuta query contra Drizzle
 */
export async function getDocs<T>(queryRef: {
  _collectionName: string
  _constraints?: QueryConstraint[]
}): Promise<QuerySnapshot<T>> {
  const tableName = queryRef._collectionName as TableName
  const table = tableMap[tableName]

  if (!table) {
    logger.warn('Tabla no encontrada en adapter', {
      context: 'FirebaseAdapter',
      data: { tableName },
    })
    return {
      docs: [],
      empty: true,
      size: 0,
      forEach: () => {},
    }
  }

  try {
    // Ejecutar query básica
    const results = await drizzleDb.select().from(table).limit(1000)

    const docs: DocumentSnapshot<T>[] = results.map((item: Record<string, unknown>) => ({
      id: String(item.id || ''),
      exists: () => true,
      data: () => item as T,
    }))

    return {
      docs,
      empty: docs.length === 0,
      size: docs.length,
      forEach: (callback) => docs.forEach(callback),
    }
  } catch (error) {
    logger.error('Error en getDocs adapter', error as Error, {
      context: 'FirebaseAdapter',
      data: { tableName },
    })
    return {
      docs: [],
      empty: true,
      size: 0,
      forEach: () => {},
    }
  }
}

/**
 * Simula getDoc() de Firebase
 */
export async function getDoc<T>(docRef: {
  _collectionName: string
  _docId: string
}): Promise<DocumentSnapshot<T>> {
  const tableName = docRef._collectionName as TableName
  const table = tableMap[tableName]

  if (!table) {
    return {
      id: docRef._docId,
      exists: () => false,
      data: () => undefined,
    }
  }

  try {
    const results = await drizzleDb
      .select()
      .from(table)
      .where(eq((table as { id: unknown }).id as never, docRef._docId))
      .limit(1)

    if (results.length === 0) {
      return {
        id: docRef._docId,
        exists: () => false,
        data: () => undefined,
      }
    }

    return {
      id: docRef._docId,
      exists: () => true,
      data: () => results[0] as T,
    }
  } catch (error) {
    logger.error('Error en getDoc adapter', error as Error, {
      context: 'FirebaseAdapter',
    })
    return {
      id: docRef._docId,
      exists: () => false,
      data: () => undefined,
    }
  }
}

/**
 * Simula onSnapshot() de Firebase - polling con intervalo
 */
export function onSnapshot<T>(
  queryRef: { _collectionName: string; _constraints?: QueryConstraint[] },
  callback: (snapshot: QuerySnapshot<T>) => void,
  errorCallback?: (error: Error) => void,
): Unsubscribe {
  let active = true

  const poll = async () => {
    if (!active) return

    try {
      const snapshot = await getDocs<T>(queryRef)
      if (active) {
        callback(snapshot)
      }
    } catch (error) {
      if (errorCallback && active) {
        errorCallback(error as Error)
      }
    }
  }

  // Ejecutar inmediatamente
  poll()

  // Polling cada 5 segundos
  const interval = setInterval(poll, 5000)

  // Retornar función de unsubscribe
  return () => {
    active = false
    clearInterval(interval)
  }
}

/**
 * Simula Timestamp de Firebase
 */
export const Timestamp = {
  now: () => ({ toDate: () => new Date() }),
  fromDate: (date: Date) => ({ toDate: () => date }),
  toDate: function (this: { _date?: Date }) {
    return this._date || new Date()
  },
}

/**
 * Simula serverTimestamp() de Firebase
 */
export function serverTimestamp() {
  return new Date().toISOString()
}

/**
 * Simula addDoc() de Firebase
 */
export async function addDoc(
  collectionRef: { _collectionName: string },
  data: Record<string, unknown>,
): Promise<{ id: string }> {
  const tableName = collectionRef._collectionName as TableName
  const table = tableMap[tableName]

  if (!table) {
    throw new Error(`Tabla ${tableName} no encontrada`)
  }

  try {
    const id = `${tableName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await drizzleDb.insert(table).values({ ...data, id } as never)
    return { id }
  } catch (error) {
    logger.error('Error en addDoc adapter', error as Error, {
      context: 'FirebaseAdapter',
    })
    throw error
  }
}

/**
 * Simula updateDoc() de Firebase
 */
export async function updateDoc(
  docRef: { _collectionName: string; _docId: string },
  data: Record<string, unknown>,
): Promise<void> {
  const tableName = docRef._collectionName as TableName
  const table = tableMap[tableName]

  if (!table) {
    throw new Error(`Tabla ${tableName} no encontrada`)
  }

  try {
    await drizzleDb
      .update(table)
      .set(data as never)
      .where(eq((table as { id: unknown }).id as never, docRef._docId))
  } catch (error) {
    logger.error('Error en updateDoc adapter', error as Error, {
      context: 'FirebaseAdapter',
    })
    throw error
  }
}

/**
 * Simula deleteDoc() de Firebase
 */
export async function deleteDoc(docRef: {
  _collectionName: string
  _docId: string
}): Promise<void> {
  const tableName = docRef._collectionName as TableName
  const table = tableMap[tableName]

  if (!table) {
    throw new Error(`Tabla ${tableName} no encontrada`)
  }

  try {
    await drizzleDb.delete(table).where(eq((table as { id: unknown }).id as never, docRef._docId))
  } catch (error) {
    logger.error('Error en deleteDoc adapter', error as Error, {
      context: 'FirebaseAdapter',
    })
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT PARA COMPATIBILIDAD
// ═══════════════════════════════════════════════════════════════════════════════

export const db = drizzleDb
export const isFirestoreAvailable = () => true
export const isFirebaseConfigured = true

export default {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  db: drizzleDb,
  isFirestoreAvailable: () => true,
}
