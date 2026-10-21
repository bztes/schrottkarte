import type { AlertsService } from '#lib/alerts.svelte.js';
import { deleteDrawings, getDrawings, saveDrawings } from '#lib/remote/drawings.remote.js';
import type { Json } from '#lib/types.js';
import { point } from '@turf/turf';
import { browser } from '$app/env';

export type Drawing = Omit<DrawingRow, 'properties'> & { properties: DrawingProperties };

export interface DrawingProperties extends Json {
  color?: string;
}

type DrawingRow = Awaited<ReturnType<typeof getDrawings>>[number];

/** `properties` is stored as any JSON object */
const toDrawing = (r: DrawingRow) => r as Drawing;

export type DrawingsService = ReturnType<typeof createDrawingsService>;

export function createDrawingsService(alerts: AlertsService) {
  let drawingsMap = $state<Record<string, Drawing>>({});
  const allDrawings = $derived(Object.values(drawingsMap));

  if (browser) {
    loadDrawings();
  }

  async function loadDrawings() {
    let rows: DrawingRow[];
    try {
      rows = await getDrawings();
    } catch (error) {
      console.error('Failed to fetch drawings', error);
      alerts.error({ title: 'Failed to fetch drawings', error });
      return;
    }

    drawingsMap = {};
    rows.forEach((r) => {
      drawingsMap[r.id] = toDrawing(r);
    });
  }

  async function updateOrCreate(drawings: Drawing[]) {
    let saved: DrawingRow[];
    try {
      // the command ignores the timestamps, the server sets them
      saved = await saveDrawings(drawings);
    } catch (error) {
      console.error('Failed to save drawings', error);
      alerts.error({ title: 'Failed to save drawings', error });
      return false;
    }

    saved.forEach((r) => {
      drawingsMap[r.id] = toDrawing(r);
    });

    return true;
  }

  async function remove(ids: string[]) {
    let deletedIds: string[];
    try {
      deletedIds = await deleteDrawings(ids);
    } catch (error) {
      console.error('Failed to delete drawings', error);
      alerts.error({ title: 'Failed to delete drawings', error });
      return false;
    }

    deletedIds.forEach((id) => {
      delete drawingsMap[id];
    });

    return true;
  }

  function draft(id: string): Drawing {
    const draft = drawingsMap[id];
    if (draft) {
      return $state.snapshot(draft as unknown) as Drawing;
    }

    const dateNow = new Date();
    return {
      id,
      name: '',
      description: '',
      tags: [],
      properties: {},
      geom: point([0, 0]).geometry,
      createdAt: dateNow,
      updatedAt: dateNow,
    };
  }

  return {
    get all() {
      return allDrawings;
    },
    updateOrCreate,
    remove,
    draft,
  };
}
