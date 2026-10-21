import { EventEmitter } from 'node:events';
import type { Db, Tx } from './db/index.js';
import { tags } from './db/schema.js';

/** Emits `change` whenever new tags were added, used to push updates to live queries */
export const tagEvents = new EventEmitter();
tagEvents.setMaxListeners(0);

/**
 * Inserts the tags that do not exist yet and returns how many were added.
 * Callers emit `change` on `tagEvents` once their transaction is committed.
 */
export function insertTags(tx: Db | Tx, values: Iterable<string>) {
  const rows = Array.from(new Set(values), (tag) => ({ tag }));
  if (rows.length === 0) {
    return 0;
  }
  return tx.insert(tags).values(rows).onConflictDoNothing().run().changes;
}
