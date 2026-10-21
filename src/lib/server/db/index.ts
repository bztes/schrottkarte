import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { mkdirSync } from 'node:fs';
import { DATA_PATH } from '$app/env/private';
import { building } from '$app/env';
import { databasePath } from './path.js';
import * as schema from './schema.js';

// the build step imports this module to analyse the app, don't touch the real database then
const path = building ? ':memory:' : databasePath(DATA_PATH);
if (!building) {
  mkdirSync(DATA_PATH, { recursive: true });
}

const sqlite = new Database(path);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

export type Db = typeof db;
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

export function runMigrations() {
  migrate(db, { migrationsFolder: 'drizzle' });
}
