import { invalid, redirect } from '@sveltejs/kit';
import { form, getRequestEvent, query } from '$app/server';
import { APIError } from 'better-auth/api';
import { z } from 'zod';
import { auth } from '#lib/server/auth.js';

export const getUser = query(async () => {
  return getRequestEvent().locals.user;
});

export const signin = form(
  z.object({
    email: z.email(),
    _password: z.string().min(1),
    redirect: z.string().optional(),
  }),
  async ({ email, _password, redirect: redirectTo }) => {
    const { request } = getRequestEvent();

    try {
      await auth.api.signInEmail({
        body: { email, password: _password },
        headers: request.headers,
      });
    } catch (e) {
      if (e instanceof APIError) {
        invalid('Invalid username or password');
      }
      throw e;
    }

    redirect(303, decodeURIComponent(redirectTo || '/'));
  },
);

export const signout = form(async () => {
  const { locals, request } = getRequestEvent();
  if (locals.session) {
    await auth.api.signOut({ headers: request.headers });
  }
  redirect(303, '/auth');
});
