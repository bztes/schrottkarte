import { sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { Geometry } from 'geojson';
import { markerStates, userRoles, type MapLayerSource, type MapLayerStyle } from '../../types.js';

const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(cast(unixepoch('subsec') * 1000 as integer))`)
    .$onUpdate(() => new Date()),
};

// better-auth

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  role: text('role', { enum: userRoles }).notNull().default('street'),
  ...timestamps,
});

export const session = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (t) => [index('session_user_id_idx').on(t.userId)],
);

export const account = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
    scope: text('scope'),
    password: text('password'),
    ...timestamps,
  },
  (t) => [index('account_user_id_idx').on(t.userId)],
);

export const verification = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    ...timestamps,
  },
  (t) => [index('verification_identifier_idx').on(t.identifier)],
);

// app

export const markers = sqliteTable(
  'markers',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    state: text('state', { enum: markerStates }).notNull(),
    lng: real('lng').notNull(),
    lat: real('lat').notNull(),
    ...timestamps,
  },
  (t) => [index('markers_location_idx').on(t.lng, t.lat)],
);

export const drawings = sqliteTable('drawings', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  properties: text('properties', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
  geom: text('geom', { mode: 'json' }).$type<Geometry>().notNull(),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default([]),
  ...timestamps,
});

export const tags = sqliteTable('tags', {
  tag: text('tag').primaryKey(),
});

/** Base maps and overlays, rendered below markers and drawings in the order of `position` */
export const mapLayers = sqliteTable('map_layers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  position: integer('position').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  /** MapLibre source specification */
  source: text('source', { mode: 'json' }).$type<MapLayerSource>().notNull(),
  /** MapLibre style layers, their `source` is set when added to the map */
  layers: text('layers', { mode: 'json' }).$type<MapLayerStyle[]>().notNull(),
  ...timestamps,
});
