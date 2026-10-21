import postgres from 'postgres';
import type { Geometry } from 'geojson';
import { markerStates, userRoles, type MarkerState, type UserRole } from '#lib/types.js';
import { db } from './db/index.js';
import { drawings, markers, tags, user } from './db/schema.js';
import { insertUser } from './users.js';
import { insertTags, tagEvents } from './tags.js';

export interface ImportOptions {
  connectionString: string;
  /** Delete markers, drawings and tags before importing */
  replace: boolean;
}

export interface ImportResult {
  users: number;
  skippedUsers: string[];
  markers: number;
  drawings: number;
  tags: number;
}

interface SupabaseUser {
  id: string;
  email: string;
  encrypted_password: string | null;
  email_confirmed: boolean;
  role: string | null;
  created_at: number;
  updated_at: number;
}

interface SupabaseMarker {
  id: string;
  name: string;
  description: string;
  state: string;
  lng: number;
  lat: number;
  created_at: number;
  updated_at: number;
}

interface SupabaseDrawing {
  id: string;
  name: string;
  description: string;
  properties: Record<string, unknown>;
  geom: Geometry;
  tags: string[] | null;
  created_at: number;
  updated_at: number;
}

// timestamps are read as epoch milliseconds, `timestamp without time zone` columns hold UTC values
const ms = (column: string) => `(extract(epoch from ${column}) * 1000)::float8`;

async function readSupabase(connectionString: string) {
  const sql = postgres(connectionString, {
    max: 1,
    ssl: /sslmode=/.test(connectionString) ? undefined : 'prefer',
    // the Supabase transaction pooler does not support prepared statements
    prepare: false,
    connect_timeout: 15,
  });

  try {
    return await sql.begin('read only', async (tx) => {
      // postgis lives in the `extensions` schema on Supabase
      await tx.unsafe('set local search_path = public, extensions');

      const users = await tx.unsafe<SupabaseUser[]>(`
        select
          u.id::text,
          u.email,
          u.encrypted_password,
          u.email_confirmed_at is not null as email_confirmed,
          (select r.role::text from public.user_roles r where r.user_id = u.id order by r.role limit 1) as role,
          ${ms('u.created_at')} as created_at,
          ${ms('coalesce(u.updated_at, u.created_at)')} as updated_at
        from auth.users u
        where u.email is not null and u.deleted_at is null
        order by u.created_at`);

      const markerRows = await tx.unsafe<SupabaseMarker[]>(`
        select
          id::text, name, description, state::text,
          st_x(location) as lng, st_y(location) as lat,
          ${ms('created_at')} as created_at, ${ms('updated_at')} as updated_at
        from public.markers`);

      const drawingRows = await tx.unsafe<SupabaseDrawing[]>(`
        select
          id, name, description, properties, st_asgeojson(geom)::json as geom, tags,
          ${ms('created_at')} as created_at, ${ms('updated_at')} as updated_at
        from public.drawings`);

      const tagRows = await tx.unsafe<{ tag: string }[]>(`select tag from public.tags`);

      return { users, markerRows, drawingRows, tagRows };
    });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

export async function importFromSupabase({
  connectionString,
  replace,
}: ImportOptions): Promise<ImportResult> {
  const data = await readSupabase(connectionString);

  const result: ImportResult = {
    users: 0,
    skippedUsers: [],
    markers: data.markerRows.length,
    drawings: data.drawingRows.length,
    tags: 0,
  };

  db.transaction((tx) => {
    if (replace) {
      tx.delete(markers).run();
      tx.delete(drawings).run();
      tx.delete(tags).run();
    }

    const existingEmails = new Set(
      tx
        .select({ email: user.email })
        .from(user)
        .all()
        .map((u) => u.email),
    );
    for (const u of data.users) {
      const email = u.email.toLowerCase();
      if (existingEmails.has(email)) {
        result.skippedUsers.push(email);
        continue;
      }
      existingEmails.add(email);
      // Supabase had no admin role, editors managed the users there
      const role: UserRole =
        u.role === 'editor'
          ? 'admin'
          : userRoles.includes(u.role as UserRole)
            ? (u.role as UserRole)
            : 'viewer';
      insertUser(
        tx,
        {
          id: u.id,
          email,
          name: email.split('@')[0],
          role,
          emailVerified: u.email_confirmed,
          createdAt: new Date(u.created_at),
          updatedAt: new Date(u.updated_at),
        },
        u.encrypted_password || null,
      );
      result.users++;
    }

    for (const m of data.markerRows) {
      const values = {
        id: m.id,
        name: m.name,
        description: m.description,
        state: (markerStates.includes(m.state as MarkerState) ? m.state : 'new') as MarkerState,
        lng: m.lng,
        lat: m.lat,
        createdAt: new Date(m.created_at),
        updatedAt: new Date(m.updated_at),
      };
      tx.insert(markers)
        .values(values)
        .onConflictDoUpdate({ target: markers.id, set: values })
        .run();
    }

    for (const d of data.drawingRows) {
      const values = {
        id: d.id,
        name: d.name,
        description: d.description,
        properties: d.properties ?? {},
        geom: d.geom,
        tags: d.tags ?? [],
        createdAt: new Date(d.created_at),
        updatedAt: new Date(d.updated_at),
      };
      tx.insert(drawings)
        .values(values)
        .onConflictDoUpdate({ target: drawings.id, set: values })
        .run();
    }

    result.tags = insertTags(tx, [
      ...data.tagRows.map((t) => t.tag),
      ...data.drawingRows.flatMap((d) => d.tags ?? []),
    ]);
  });

  if (replace || result.tags > 0) {
    tagEvents.emit('change');
  }

  return result;
}
