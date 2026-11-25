import { defineConfig } from 'drizzle-kit';
import { databasePath } from './src/lib/server/db/path';

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: { url: databasePath(process.env.DATA_DIR || './data') },
});
