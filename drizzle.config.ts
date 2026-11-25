import { defineConfig } from 'drizzle-kit';
import { databasePath } from './src/lib/server/db/path';

if (!process.env.DATA_DIR) {
  throw new Error('DATA_DIR must be set, e.g. ./data');
}

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: { url: databasePath(process.env.DATA_DIR) },
});
