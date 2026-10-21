import { join } from 'node:path';

// standalone so drizzle.config.ts can import it outside of SvelteKit
export function databasePath(dataPath: string) {
  return join(dataPath, 'schrottkarte.db');
}
