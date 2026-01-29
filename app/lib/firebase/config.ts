/**
 * 🔥 Firebase Configuration - CHRONOS SYSTEM
 *
 * ⚠️ FIREBASE MIGRADO A TURSO/DRIZZLE
 * Este archivo re-exporta el adaptador de compatibilidad
 */

// Re-exportar desde el adaptador Drizzle
export {
  Timestamp,
  addDoc,
  collection,
  db,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  isFirebaseConfigured,
  isFirestoreAvailable,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from './drizzle-adapter'

// Auth stub (no usado con Drizzle)
export const auth = null

export { default } from './drizzle-adapter'
