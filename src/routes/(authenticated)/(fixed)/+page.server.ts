import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  signout: async ({ locals }) => {
    const { session } = await locals.safeGetSession();
    if (session) {
      await locals.supabase.auth.signOut({ scope: 'local' });
      throw redirect(303, '/auth');
    }
  },
} satisfies Actions;
