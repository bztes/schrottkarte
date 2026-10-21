import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import type { RequestHandler } from './$types';

// used by the Docker healthcheck, reachable without a session
export const GET: RequestHandler = () => {
  try {
    db.get(sql`select 1`);
    return json({ status: 'ok' });
  } catch {
    return json({ status: 'error' }, { status: 503 });
  }
};
