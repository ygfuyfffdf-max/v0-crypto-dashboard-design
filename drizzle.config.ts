// @ts-nocheck
import type { Config } from 'drizzle-kit';

const dbUrl =
  process.env.TURSO_DATABASE_URL ||
  (process.env.DATABASE_URL?.startsWith('libsql://') ? process.env.DATABASE_URL : null) ||
  'file:./database/sqlite.db';
const dbToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || '';

export default {
  schema: './drizzle/schema.ts',
  out: './database/migrations',
  dialect: 'sqlite',
  dbCredentials:
    dbUrl.startsWith('file:')
      ? { url: dbUrl }
      : { url: dbUrl, authToken: dbToken },
  verbose: true,
  strict: true,
} satisfies Config;