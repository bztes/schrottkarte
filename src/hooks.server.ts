import { redirect } from '@sveltejs/kit';
import { sequence, type Handle, type ServerInit } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/env';
import { auth } from '#lib/server/auth.js';
import { runMigrations } from '#lib/server/db/index.js';
import { isSetupMode } from '#lib/server/guard.js';
import { adminRoutes, hasRole, type UserRole } from '#lib/types.js';

export const init: ServerInit = () => {
  runMigrations();
};

const betterAuth: Handle = async ({ event, resolve }) => {
  if (!building) {
    const result = await auth.api.getSession({ headers: event.request.headers });
    event.locals.session = result?.session ?? null;
    event.locals.user = result
      ? {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role as UserRole,
        }
      : null;
  }

  return svelteKitHandler({ event, resolve, auth, building });
};

const authGuard: Handle = async ({ event, resolve }) => {
  // Remote functions are guarded individually, since `signin` must be reachable without a session.
  // The healthcheck is public.
  if (event.isRemoteRequest || event.url.pathname === '/health') {
    return resolve(event);
  }

  const { user } = event.locals;
  const url = event.url;

  // the map editor used to live here
  if (url.pathname === '/editor') {
    redirect(308, '/admin');
  }

  // see `adminRoutes`, unknown admin pages are for admins only
  if (url.pathname.startsWith('/admin')) {
    const route = adminRoutes.find((r) => r.href === url.pathname) ?? {
      role: 'admin',
      setup: false,
    };
    if (user ? hasRole(user, route.role) : route.setup && isSetupMode()) {
      return resolve(event);
    }
    if (hasRole(user, 'editor')) {
      redirect(303, '/admin');
    }
    if (user) {
      redirect(303, '/');
    }
  }

  if (!user && url.pathname !== '/auth') {
    const fullPath = url.pathname + url.search;
    if (fullPath === '/' || fullPath === '') {
      redirect(303, isSetupMode() ? '/admin/users' : '/auth');
    } else {
      const encodedRedirect = encodeURIComponent(fullPath);
      redirect(303, `/auth?redirect=${encodedRedirect}`);
    }
  }

  if (user && url.pathname === '/auth') {
    redirect(303, '/');
  }

  return resolve(event);
};

export const handle: Handle = sequence(betterAuth, authGuard);
