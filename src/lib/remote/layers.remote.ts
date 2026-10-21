import { error } from '@sveltejs/kit';
import { command, query } from '$app/server';
import { asc, eq, max } from 'drizzle-orm';
import { z } from 'zod';
import { db, type Db, type Tx } from '#lib/server/db/index.js';
import { mapLayers } from '#lib/server/db/schema.js';
import { requireUser } from '#lib/server/guard.js';
import { mapLayerInput, mapLayersFile } from '#lib/map-layers.js';
import type { MapLayer } from '#lib/types.js';

const columns = {
  id: mapLayers.id,
  name: mapLayers.name,
  position: mapLayers.position,
  enabled: mapLayers.enabled,
  source: mapLayers.source,
  layers: mapLayers.layers,
  updatedAt: mapLayers.updatedAt,
};

/** The layers shown on the map, from bottom to top */
export const getMapLayers = query(async (): Promise<MapLayer[]> => {
  requireUser();
  return db
    .select(columns)
    .from(mapLayers)
    .where(eq(mapLayers.enabled, true))
    .orderBy(asc(mapLayers.position))
    .all();
});

/** All layers including the disabled ones, for the admin page */
export const getAllMapLayers = query(async (): Promise<MapLayer[]> => {
  requireUser('admin');
  return db.select(columns).from(mapLayers).orderBy(asc(mapLayers.position)).all();
});

async function refresh() {
  await Promise.all([getAllMapLayers().refresh(), getMapLayers().refresh()]);
}

/** Position of the topmost layer, -1 if there is none */
function topPosition(tx: Db | Tx) {
  const top = tx
    .select({ position: max(mapLayers.position) })
    .from(mapLayers)
    .get();
  return top?.position ?? -1;
}

export const saveMapLayer = command(mapLayerInput, async ({ id, ...values }) => {
  requireUser('admin');

  if (id) {
    const result = db.update(mapLayers).set(values).where(eq(mapLayers.id, id)).run();
    if (result.changes === 0) {
      error(404, 'Layer not found');
    }
  } else {
    // new layers go on top
    db.insert(mapLayers)
      .values({ ...values, id: crypto.randomUUID(), position: topPosition(db) + 1 })
      .run();
  }

  await refresh();
});

/** Overwrites layers with the same id, adds the others on top */
export const importMapLayers = command(mapLayersFile.shape.layers, async (rows) => {
  requireUser('admin');

  const result = db.transaction((tx) => {
    let added = 0;
    let updated = 0;
    let position = topPosition(tx);

    for (const { id, ...values } of rows) {
      const exists =
        id !== undefined &&
        tx.update(mapLayers).set(values).where(eq(mapLayers.id, id)).run().changes > 0;
      if (exists) {
        updated++;
      } else {
        tx.insert(mapLayers)
          .values({ ...values, id: id ?? crypto.randomUUID(), position: ++position })
          .run();
        added++;
      }
    }
    return { added, updated };
  });

  await refresh();
  return result;
});

export const setMapLayerEnabled = command(
  z.object({ id: z.string(), enabled: z.boolean() }),
  async ({ id, enabled }) => {
    requireUser('admin');
    db.update(mapLayers).set({ enabled }).where(eq(mapLayers.id, id)).run();
    await refresh();
  },
);

/** Swaps the layer with its neighbour, `up` means further on top */
export const moveMapLayer = command(
  z.object({ id: z.string(), direction: z.enum(['up', 'down']) }),
  async ({ id, direction }) => {
    requireUser('admin');
    db.transaction((tx) => {
      const all = tx
        .select({ id: mapLayers.id })
        .from(mapLayers)
        .orderBy(asc(mapLayers.position))
        .all();
      const index = all.findIndex((l) => l.id === id);
      const target = index + (direction === 'up' ? 1 : -1);
      if (index < 0 || target < 0 || target >= all.length) {
        return;
      }
      [all[index], all[target]] = [all[target], all[index]];
      // renumber everything, keeps the positions dense
      all.forEach((l, position) => {
        tx.update(mapLayers).set({ position }).where(eq(mapLayers.id, l.id)).run();
      });
    });
    await refresh();
  },
);

export const deleteMapLayer = command(z.string(), async (id) => {
  requireUser('admin');
  db.delete(mapLayers).where(eq(mapLayers.id, id)).run();
  await refresh();
});
