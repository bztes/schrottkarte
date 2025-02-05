import type { AlertsService } from '$lib/alerts.svelte';
import type { Database } from '$lib/supabase.types';
import type { Json } from '$lib/types';
import { postgresTimestampToDate } from '$lib/utils';
import type { SupabaseClient } from '@supabase/supabase-js';
import { point } from '@turf/turf';
import type { Geometry } from 'geojson';

export interface Drawing {
  id: string;
  name: string;
  description: string;
  tags: string[];
  properties: DrawingProperties;
  geom: Geometry;
  created_at: Date;
  updated_at: Date;
}

export interface DrawingProperties extends Json {
  color?: string;
}

export type DrawingsService = ReturnType<typeof createDrawingsService>;

export function createDrawingsService(supabase: SupabaseClient<Database>, alerts: AlertsService) {
  let drawingsMap = $state<Record<string, Drawing>>({});
  const allDrawings = $derived(Object.values(drawingsMap));

  loadDrawings();

  async function loadDrawings() {
    const { data, error } = await supabase
      .from('drawings')
      .select('id, name, description, properties, geom, tags, created_at, updated_at');
    if (error) {
      console.error('Failed to fetch drawings', error);
      alerts.error({ title: 'Failed to fetch drawings', msg: error.message, error });
      return;
    }

    drawingsMap = {};
    data.forEach((r) => {
      drawingsMap[r.id] = {
        id: r.id,
        description: r.description,
        name: r.name,
        tags: r.tags ?? [],
        properties: r.properties,
        geom: r.geom as Geometry,
        created_at: postgresTimestampToDate(r.created_at),
        updated_at: postgresTimestampToDate(r.updated_at),
      };
    });
  }

  async function updateOrCreate(drawings: Drawing[]) {
    const rows: Omit<Drawing, 'created_at' | 'updated_at'>[] = drawings.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      geom: d.geom,
      properties: d.properties,
      tags: d.tags,
    }));

    const { error, data } = await supabase.from('drawings').upsert(rows).select();

    if (error) {
      console.error('Failed to save drawings', error);
      alerts.error({ title: 'Failed to save drawings', msg: error.message, error });
      return false;
    }

    data.forEach((r) => {
      drawingsMap[r.id] = {
        id: r.id,
        description: r.description,
        name: r.name,
        tags: r.tags ?? [],
        properties: r.properties,
        geom: r.geom as Geometry,
        created_at: postgresTimestampToDate(r.created_at),
        updated_at: postgresTimestampToDate(r.updated_at),
      };
    });

    return true;
  }

  async function remove(ids: string[]) {
    const { error, data } = await supabase.from('drawings').delete().in('id', ids).select('id');

    if (error) {
      console.error('Failed to delete drawings', error);
      alerts.error({ title: 'Failed to delete drawings', msg: error.message, error });
      return false;
    }

    data.forEach((r) => {
      delete drawingsMap[r.id];
    });

    return true;
  }

  function draft(id: string): Drawing {
    const draft = drawingsMap[id];
    if (draft) {
      return $state.snapshot(draft) as Drawing;
    }

    const dateNow = new Date();
    return {
      id,
      name: '',
      description: '',
      tags: [],
      properties: {},
      geom: point([0, 0]).geometry,
      created_at: dateNow,
      updated_at: dateNow,
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
