import { error } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import { hasRole, type AppUser, type UserRole } from '#lib/types.js';

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
