import { command, query } from '$app/server';
import { inArray } from 'drizzle-orm';
import { z } from 'zod';
import type { Geometry } from 'geojson';
import { db } from '#lib/server/db/index.js';
import { drawings } from '#lib/server/db/schema.js';
import { requireUser } from '#lib/server/guard.js';
import { insertTags, tagEvents } from '#lib/server/tags.js';

export const getDrawings = query(async () => {
  requireUser();
  return db.select().from(drawings).all();
});

export const saveDrawings = command(
  z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      properties: z.record(z.string(), z.unknown()),
      geom: z.custom<Geometry>((v) => typeof v === 'object' && v !== null && 'type' in v),
      tags: z.array(z.string()),
    }),
  ),
  async (rows) => {
    requireUser('editor');

    let addedTags = 0;
    const saved = db.transaction((tx) => {
      addedTags = insertTags(
        tx,
        rows.flatMap((row) => row.tags),
      );
      const now = new Date();
      return rows.map((row) =>
        tx
          .insert(drawings)
          .values({ ...row, createdAt: now, updatedAt: now })
          .onConflictDoUpdate({
            target: drawings.id,
            set: { ...row, id: undefined, updatedAt: now },
          })
          .returning()
          .get(),
      );
    });

    if (addedTags > 0) {
      tagEvents.emit('change');
    }

    // the map page would otherwise show the cached drawings from before
    await getDrawings().refresh();
    return saved;
  },
);

export const deleteDrawings = command(z.array(z.string()), async (ids) => {
  requireUser('editor');
  const deletedIds = db
    .delete(drawings)
    .where(inArray(drawings.id, ids))
    .returning({ id: drawings.id })
    .all()
    .map((d) => d.id);
  await getDrawings().refresh();
  return deletedIds;
});
