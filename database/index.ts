import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// URL y token: TURSO_* tiene prioridad, DATABASE_* como alias, fallback a SQLite local
const dbUrl =
  process.env.TURSO_DATABASE_URL ||
  (process.env.DATABASE_URL?.startsWith('libsql://') ? process.env.DATABASE_URL : null) ||
  'file:./database/sqlite.db';
const dbToken =
  process.env.TURSO_AUTH_TOKEN ||
  process.env.DATABASE_AUTH_TOKEN ||
  (dbUrl.startsWith('file:') ? '' : '');

const client = createClient({
  url: dbUrl,
  authToken: dbToken || undefined,
});

// Crear instancia de Drizzle ORM
export const db = drizzle(client, { schema });

// Función auxiliar para verificar la conexión a la base de datos
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await client.execute('SELECT 1');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Función para obtener estadísticas de la base de datos
export async function getDatabaseStats() {
  try {
    const result = await client.execute('SELECT COUNT(*) as count FROM sqlite_master WHERE type=\'table\'');
    return {
      tables: result.rows[0].count,
      connected: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      tables: 0,
      connected: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Exportar tipos de TypeScript
export type DatabaseSchema = typeof schema;
export type DatabaseClient = typeof client;

// Función para manejar reintentos de conexión
export async function connectWithRetry(maxRetries = 3, delay = 1000): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const connected = await testDatabaseConnection();
      if (connected) {
        return true;
      }
    } catch (error) {
      console.warn(`Connection attempt ${i + 1} failed:`, error);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  return false;
}

// Función para cerrar la conexión de forma segura
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await client.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Configuración de timeout y opciones de conexión
export const databaseConfig = {
  connectionTimeout: 30000, // 30 segundos
  idleTimeout: 60000, // 60 segundos
  maxRetries: 3,
  retryDelay: 1000, // 1 segundo
};

// Exportar cliente para uso directo si es necesario
export { client as tursoClient };