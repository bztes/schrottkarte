import { error } from '@sveltejs/kit';
import { command, query } from '$app/server';
import { and, between, eq, inArray } from 'drizzle-orm';
import Papa from 'papaparse';
import { z } from 'zod';
import { db } from '#lib/server/db/index.js';
import { markers } from '#lib/server/db/schema.js';
import { requireUser } from '#lib/server/guard.js';
import { hasRole, markerPermissions, markerStates } from '#lib/types.js';

/** Non-editors may only move markers within this time after creation */
const MOVE_WINDOW_MS = 60 * 60 * 1000;

export const getMarkers = query(async () => {
  requireUser();
  return db.select().from(markers).limit(2000).all();
});

export const getMarkersInView = query(
  z.object({
    minLng: z.number(),
    minLat: z.number(),
    maxLng: z.number(),
    maxLat: z.number(),
    limit: z.number().int().min(1).max(1000).default(200),
  }),
  async ({ minLng, minLat, maxLng, maxLat, limit }) => {
    requireUser();
    return db
      .select()
      .from(markers)
      .where(and(between(markers.lng, minLng, maxLng), between(markers.lat, minLat, maxLat)))
      .orderBy(markers.id)
      .limit(limit)
      .all();
  },
);

export const saveMarkers = command(
  z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      description: z.string(),
      state: z.enum(markerStates),
      lng: z.number().min(-180).max(180),
      lat: z.number().min(-90).max(90),
    }),
  ),
  async (rows) => {
    const user = requireUser();
    const canAlwaysMove = hasRole(user, markerPermissions.move);

    const saved = db.transaction((tx) => {
      const existing = new Map(
        tx
          .select()
          .from(markers)
          .where(
            inArray(
              markers.id,
              rows.map((r) => r.id),
            ),
          )
          .all()
          .map((m) => [m.id, m]),
      );

      return rows.map((row) => {
        const now = new Date();
        const old = existing.get(row.id);

        if (!old) {
          if (!hasRole(user, markerPermissions.insert)) {
            error(403, 'Not allowed to create markers');
          }
          return tx
            .insert(markers)
            .values({ ...row, createdAt: now, updatedAt: now })
            .returning()
            .get();
        }

        if (!hasRole(user, markerPermissions.update)) {
          error(403, 'Not allowed to update markers');
        }
        const canMove = canAlwaysMove || now.getTime() - old.createdAt.getTime() < MOVE_WINDOW_MS;
        return tx
          .update(markers)
          .set({
            name: row.name,
            description: row.description,
            state: row.state,
            lng: canMove ? row.lng : old.lng,
            lat: canMove ? row.lat : old.lat,
            updatedAt: now,
          })
          .where(eq(markers.id, row.id))
          .returning()
          .get();
      });
    });

    // the editor would otherwise show the cached markers from before
    await getMarkers().refresh();
    return saved;
  },
);

export const deleteMarker = command(z.string(), async (id) => {
  requireUser(markerPermissions.delete);
  db.delete(markers).where(eq(markers.id, id)).run();
  await getMarkers().refresh();
});

export const exportMarkersCsv = query(async () => {
  requireUser('editor');
  const rows = db.select().from(markers).all();
  return Papa.unparse(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      state: r.state,
      lng: r.lng,
      lat: r.lat,
      created_at: r.createdAt.toISOString(),
      updated_at: r.updatedAt.toISOString(),
    })),
  );
});
