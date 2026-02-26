// @ts-nocheck
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { sql } from 'drizzle-orm';

// Configuración: TURSO_* o DATABASE_* o fallback SQLite local
const dbUrl =
  process.env.TURSO_DATABASE_URL ||
  (process.env.DATABASE_URL?.startsWith('libsql://') ? process.env.DATABASE_URL : null) ||
  'file:./database/sqlite.db';
const dbToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || '';

const client = createClient({
  url: dbUrl,
  authToken: dbToken || undefined,
});

const db = drizzle(client, { schema });

async function migrate() {
  try {
    console.log('🚀 Starting database migration...');
    
    // Verificar conexión
    await client.execute('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Crear tablas
    console.log('📋 Creating database tables...');
    
    // Crear tabla de usuarios
    await client.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        image_url TEXT,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `);
    
    // Crear tabla de configuraciones de usuario
    await client.execute(sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        theme TEXT CHECK(theme IN ('light', 'dark', 'system')) DEFAULT 'system',
        language TEXT DEFAULT 'en',
        timezone TEXT DEFAULT 'UTC',
        notifications INTEGER DEFAULT 1,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `);
    
    // Crear tabla de criptomonedas favoritas
    await client.execute(sql`
      CREATE TABLE IF NOT EXISTS favorite_cryptos (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        crypto_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        name TEXT NOT NULL,
        added_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `);
    
    // Crear tabla de alertas de precio
    await client.execute(sql`
      CREATE TABLE IF NOT EXISTS price_alerts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        crypto_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        target_price REAL NOT NULL,
        current_price REAL,
        alert_type TEXT CHECK(alert_type IN ('above', 'below')) NOT NULL,
        is_active INTEGER DEFAULT 1,
        triggered_at INTEGER,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `);
    
    // Crear tabla de portfolios
    await client.execute(sql`
      CREATE TABLE IF NOT EXISTS portfolios (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        is_default INTEGER DEFAULT 0,
        total_value REAL DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `);
    
    // Crear tabla de activos en portfolio
    await client.execute(sql`
      CREATE TABLE IF NOT EXISTS portfolio_assets (
        id TEXT PRIMARY KEY,
        portfolio_id TEXT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
        crypto_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        average_buy_price REAL NOT NULL,
        current_price REAL,
        total_value REAL,
        profit_loss REAL,
        profit_loss_percentage REAL,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `);
    
    // Crear tabla de transacciones
    await client.execute(sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        portfolio_id TEXT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
        crypto_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        type TEXT CHECK(type IN ('buy', 'sell')) NOT NULL,
        amount REAL NOT NULL,
        price REAL NOT NULL,
        total REAL NOT NULL,
        fee REAL DEFAULT 0,
        notes TEXT,
        transaction_date INTEGER NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `);
    
    // Crear tabla de configuraciones de notificaciones
    await client.execute(sql`
      CREATE TABLE IF NOT EXISTS notification_settings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email_alerts INTEGER DEFAULT 1,
        price_alerts INTEGER DEFAULT 1,
        news_alerts INTEGER DEFAULT 1,
        portfolio_alerts INTEGER DEFAULT 1,
        alert_frequency TEXT CHECK(alert_frequency IN ('immediate', 'daily', 'weekly')) DEFAULT 'immediate',
        quiet_hours TEXT,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `);
    
    // Crear tabla de actividad reciente
    await client.execute(sql`
      CREATE TABLE IF NOT EXISTS recent_activity (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT CHECK(type IN ('login', 'logout', 'price_alert_triggered', 'portfolio_created', 'asset_added', 'asset_removed', 'transaction_completed', 'settings_updated')) NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        metadata TEXT,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `);
    
    // Crear índices para mejorar el rendimiento
    console.log('🔍 Creating database indexes...');
    
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id)`);
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_favorite_cryptos_user_id ON favorite_cryptos(user_id)`);
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_favorite_cryptos_crypto_id ON favorite_cryptos(crypto_id)`);
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id)`);
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_price_alerts_crypto_id ON price_alerts(crypto_id)`);
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_price_alerts_is_active ON price_alerts(is_active)`);
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id)`);
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_portfolio_assets_portfolio_id ON portfolio_assets(portfolio_id)`);
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_portfolio_assets_crypto_id ON portfolio_assets(crypto_id)`);
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`);
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_transactions_portfolio_id ON transactions(portfolio_id)`);
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON transactions(transaction_date)`);
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id)`);
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_recent_activity_user_id ON recent_activity(user_id)`);
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_recent_activity_type ON recent_activity(type)`);
    await client.execute(sql`CREATE INDEX IF NOT EXISTS idx_recent_activity_created_at ON recent_activity(created_at)`);
    
    console.log('✅ Database migration completed successfully!');
    
    // Verificar tablas creadas
    const tables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    
    console.log(`📊 Created ${tables.rows.length} tables:`);
    tables.rows.forEach((table: any) => {
      console.log(`  - ${table.name}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔒 Database connection closed');
  }
}

// Ejecutar migración si se ejecuta directamente
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('🎉 Migration script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

export { migrate };