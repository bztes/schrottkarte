type JsonNode = string | number | boolean | null | undefined | JsonNode[];
export type Json = Record<string, JsonNode>;

export const userRoles = ['admin', 'editor', 'viewer', 'street', 'spotter'] as const;
export type UserRole = (typeof userRoles)[number];

export const markerStates = ['new', 'marked', 'done'] as const;
export type MarkerState = (typeof markerStates)[number];

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/** Each role has all rights of the roles below it */
const roleRank: Record<UserRole, number> = {
  viewer: 0,
  spotter: 1,
  street: 2,
  editor: 3,
  admin: 4,
};

/** Whether the user has the given role or one above it */
export function hasRole(user: AppUser | null | undefined, role: UserRole) {
  return !!user && roleRank[user.role] >= roleRank[role];
}

/** The lowest role allowed to do something with markers, checked on the client and the server */
export const markerPermissions = {
  insert: 'street',
  update: 'spotter',
  delete: 'editor',
  /** others may only move markers shortly after creating them */
  move: 'editor',
} as const satisfies Record<string, UserRole>;

/**
 * The admin pages with the lowest role that may open them,
 * `setup` pages are also open without a session as long as no user exists.
 */
export const adminRoutes = [
  { href: '/admin/editor', role: 'editor', setup: false },
  { href: '/admin/export', role: 'editor', setup: false },
  { href: '/admin/layers', role: 'admin', setup: false },
  { href: '/admin', role: 'admin', setup: true },
  { href: '/admin/migrate', role: 'admin', setup: true },
] as const satisfies { href: string; role: UserRole; setup: boolean }[];

export const mapSourceTypes = ['raster', 'vector', 'raster-dem', 'geojson', 'image'] as const;

/** A MapLibre source specification, validated loosely, MapLibre reports the details */
export type MapLayerSource = { type: (typeof mapSourceTypes)[number] } & Record<string, unknown>;

/** A MapLibre style layer without `source` */
export type MapLayerStyle = { id: string; type: string } & Record<string, unknown>;

export interface MapLayer {
  id: string;
  name: string;
  position: number;
  enabled: boolean;
  source: MapLayerSource;
  layers: MapLayerStyle[];
  updatedAt: Date;
}
