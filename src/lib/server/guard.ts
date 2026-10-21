import { error } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import { hasRole, type AppUser, type UserRole } from '#lib/types.js';
import { db } from './db/index.js';
import { user } from './db/schema.js';

/**
 * Returns the signed-in user, or fails the request if there is none or the user lacks the given role.
 */
export function requireUser(role?: UserRole): AppUser {
  const { locals } = getRequestEvent();
  if (!locals.user) {
    error(401, 'Unauthorized');
  }
  if (role && !hasRole(locals.user, role)) {
    error(403, 'Forbidden');
  }
  return locals.user;
}

/**
 * As long as no user exists, the admin pages are open so the first account can be created or imported.
 */
export function isSetupMode() {
  // once a user exists, setup mode is over for good: the last admin cannot delete themselves
  setupDone ||= db.select({ id: user.id }).from(user).limit(1).all().length > 0;
  return !setupDone;
}
let setupDone = false;

/**
 * Returns whether the app is in setup mode, otherwise requires an admin.
 */
export function requireAdminOrSetup() {
  const setupMode = isSetupMode();
  if (!setupMode) {
    requireUser('admin');
  }
  return setupMode;
}
